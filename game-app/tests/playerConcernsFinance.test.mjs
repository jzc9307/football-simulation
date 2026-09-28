import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, autoLineup, applyPerformanceUpdates } from '../src/game/engine.js';
import { FORMATIONS } from '../src/game/config.js';
import { allClubs, commitClubs, clubQuality, unlistPlayer, respondToSaleOffer, marketOpen, transfer, loanEndDate } from '../src/game/career.js';
import { initialPlayerLife, estimatedContract, ensurePlayerLife, recordPlayerMinutes, playerConcernMessages, advancePlayerLife } from '../src/game/playerLife.js';
import { advanceTransferCalendar, ensureMarket, marketDay } from '../src/game/market.js';
import { ensureClubFinance, advancePayroll, financeSummary, fundPlayerContract, releasePlayerWages, contractFunding, cash } from '../src/game/finance.js';
import { simulateScheduledHalfAsync } from '../src/game/seasonFlow.js';
import { validateSave, exportGame } from '../src/game/storage.js';
import { acknowledgedCareer } from './careerFixture.mjs';

function game(){
  const s=freshState(),me=s.plClubs.find(c=>c.id==='liv');
  return {...s,clubs:s.plClubs,league:'PL',myClubId:me.id,budget:me.budget,currentDate:'2026-08-15',stage:'squad',formation:me.preferredFormation,lineup:autoLineup(FORMATIONS[me.preferredFormation],me.players),seasonSchedule:[],scheduleMigrationDone:true};
}
const own=s=>s.clubs.find(c=>c.id===s.myClubId);
const player=(s,id)=>allClubs(s).flatMap(c=>c.players).find(p=>p.id===id);
const changePlayer=(s,id,fn)=>commitClubs(s,allClubs(s).map(c=>({...c,players:c.players.map(p=>p.id===id?fn(p):p)})));
function example(role='key'){
  const p=initialPlayerLife({id:'test',slug:'unmatched',name:'Test Player',role:'CM',ovr:82,age:25,condition:100,energy:100},80);
  return {...p,contract:{...p.contract,role}};
}

test('missing contracts use affordable estimated wages and age-aware terms without changing verified data',()=>{
  const young={id:'young',slug:'unmatched',ovr:59,potential:60,age:19,role:'CM'};
  const low=estimatedContract(young,65,'2026-08-15',2),wealthy=estimatedContract(young,65,'2026-08-15',100);
  assert.ok(low.wage>=500&&low.wage<10000);assert.ok(wealthy.wage>=low.wage);assert.match(low.endDate,/202[89]-06-30/);assert.equal(low.source,'estimated');
  assert.equal(estimatedContract({...young,age:34,ovr:76},80).endDate,'2027-06-30');
  const s=game(),verified=own(s).players.find(p=>p.contract.source==='futwiz-fc26');
  const legacy=changePlayer({...s,playerLifeVersion:1},own(s).players[0].id,p=>({...p,slug:'unmatched-source',contract:{wage:null,endDate:null,role:'rotation',source:'unavailable'}}));
  const upgraded=ensurePlayerLife(legacy);assert.ok(own(upgraded).players[0].contract.wage>0);assert.equal(own(upgraded).players[0].contract.source,'estimated');
  if(verified.id!==own(s).players[0].id)assert.deepEqual(player(upgraded,verified.id).contract,verified.contract);
});
test('role promises use patient, distinct thresholds and genuine minutes restore trust',()=>{
  for(const [role,threshold,request]of [['key',2,6],['starter',6,14],['rotation',10,22]]){
    let p=example(role);
    for(let n=1;n<=request;n++){
      p=recordPlayerMinutes(p,0,'2026-10-01',80);
      assert.equal(p.life.complaintStage,n<threshold?0:n<request?1:2);
    }
    assert.equal(p.life.happiness,0);assert.equal(p.life.transferRequested,true);
    assert.deepEqual(recordPlayerMinutes(p,0,'2026-10-02',80,false),p);
    for(let n=0;n<3;n++)p=recordPlayerMinutes(p,90,'2026-10-03',80);
    assert.equal(p.life.transferRequested,false);assert.ok(p.life.happiness>=65);
  }
});
test('prospects ask politely after twelve misses and never force a playing-time departure',()=>{
  let p=example('prospect');
  for(let n=1;n<=40;n++){p=recordPlayerMinutes(p,0,'2026-10-01',80);assert.equal(p.life.complaintStage,n<12?0:1);assert.equal(p.life.transferRequested,false);assert.notEqual(p.life.status,'wants-move');}
  let s=game();s=changePlayer(s,own(s).players[0].id,()=>({...p,id:own(s).players[0].id}));
  const letter=playerConcernMessages(s).state.mail.find(m=>m.type==='player-opportunity');assert.ok(letter);assert.match(letter.body,/not asking to leave/);
});
test('old premature role-based transfer requests are relaxed without rewriting key-player requests',()=>{
  let s=game(),p=own(s).players[0];
  s=changePlayer(s,p.id,x=>({...x,contract:{...x.contract,role:'starter'},life:{...x.life,missedMatches:7,transferRequested:true,complaintStage:2,happiness:0}}));
  const upgraded=ensurePlayerLife({...s,playerLifeVersion:2,saleListings:[p.id]});
  assert.equal(player(upgraded,p.id).life.transferRequested,false);assert.equal(player(upgraded,p.id).life.complaintStage,1);assert.ok(!upgraded.saleListings.includes(p.id));
});
test('player letters include rating cards, appear once, and formal requests cannot be casually unlisted',()=>{
  let s=acknowledgedCareer(game()),p=own(s).players.find(p=>p.role==='CM');
  s=changePlayer(s,p.id,x=>({...x,contract:{...x.contract,role:'key'},life:{...x.life,complaintStage:1,complaintEpisode:1,missedMatches:2}}));
  let result=playerConcernMessages(s);assert.equal(result.arrived,true);
  const warning=result.state.mail.find(m=>m.type==='player-concern');assert.equal(warning.playerCard.ovr,p.ovr);assert.equal(warning.playerCard.id,p.id);
  assert.equal(playerConcernMessages(result.state).arrived,false);
  s=changePlayer(result.state,p.id,x=>({...x,life:{...x.life,complaintStage:2,transferRequested:true,happiness:0,missedMatches:6}}));
  result=playerConcernMessages(s);assert.ok(result.state.saleListings.includes(p.id));assert.equal(result.state.mail[0].type,'transfer-request');
  assert.throws(()=>unlistPlayer(result.state,p.id),/formal transfer/);
});
test('happy short-contract players invite renewal and stop the initial date exactly once',()=>{
  const s=game(),first=advanceTransferCalendar(s,'2026-08-20');
  assert.equal(first.arrived,true);assert.equal(first.date,'2026-08-15');assert.ok(first.state.mail.some(m=>m.type==='renewal-invite'&&m.playerCard));
  const second=advanceTransferCalendar(first.state,'2026-08-20');assert.ok(second.state.currentDate>first.state.currentDate);assert.equal(second.state.lifeAttentionPending,false);
});
test('a match-generated playing-time warning stops instant simulation before another fixture',async()=>{
  let s=acknowledgedCareer(game()),p=own(s).players.find(p=>p.role==='CM');
  s=changePlayer(s,p.id,x=>({...x,contract:{...x.contract,role:'key'},life:{...x.life,missedMatches:1}}));
  s=applyPerformanceUpdates(s,[{clubId:s.myClubId,ratings:[]}],false);
  assert.equal(s.lifeAttentionPending,true);
  const stopped=await simulateScheduledHalfAsync({...s,simMode:'half'},1,{yieldControl:async()=>{}});
  assert.equal(stopped.stage,'calendar-event');assert.equal(stopped.currentDate,s.currentDate);assert.equal(stopped.results1.length,0);assert.equal(stopped.lifeAttentionPending,false);
});
test('weekly payroll spends the board reserve, never recharges transfer funds, and survives reload idempotently',()=>{
  const s=ensureClubFinance(game()),summary=financeSummary(s),before=s.budget;
  assert.ok(summary.weekly>0);assert.ok(summary.reserve>summary.weekly);assert.equal(summary.allocated,0);
  const paid=advancePayroll(s,'2026-08-22');assert.equal(paid.finance.paid,summary.weekly);assert.equal(paid.budget,before);assert.equal(financeSummary(paid).reserve,summary.reserve-summary.weekly);
  const restored=validateSave(JSON.parse(exportGame(paid)));
  assert.deepEqual(advancePayroll(restored,'2026-08-22').finance,restored.finance);
  assert.equal(restored.plClubs.find(c=>c.id===s.myClubId).budget,before);
});
test('date jumps settle wages up to contract expiry before releasing the unused reserve',()=>{
  for(const [endDate,target,weeks] of [['2026-08-29','2026-09-15',2],['2027-06-30','2027-07-01',45]]){
    let s=game(),p=own(s).players[0];
    s=commitClubs(s,allClubs(s).map(c=>c.id===s.myClubId?{...c,players:[{...p,contract:{...p.contract,endDate}}]}:c));
    s=ensureClubFinance(s);p=own(s).players[0];const before=s.budget,wage=p.contract.wage+10000;
    s=fundPlayerContract(s,p,wage);
    s=changePlayer(s,p.id,x=>({...x,contract:{...x.contract,wage}}));
    const expired=advancePlayerLife(s,target).state;
    assert.equal(expired.finance.paid,weeks*wage);assert.equal(expired.finance.accounts[p.id],undefined);
    assert.equal(expired.budget,cash(before-weeks*.01));assert.ok(expired.freeAgents.some(x=>x.id===p.id));
    assert.equal(advancePlayerLife(expired,target).state.finance.paid,weeks*wage);
  }
});
test('a wage increase moves only its additional season cost once; reduction/departure returns unused funds',()=>{
  let s=ensureClubFinance(game()),p=own(s).players[0],old=p.contract.wage,wage=old+10000;
  const funding=contractFunding(s,p,wage),before=s.budget;
  s=fundPlayerContract(s,p,wage);assert.equal(s.budget,cash(before-funding.change/1000000));assert.equal(s.finance.accounts[p.id].transferReserve,funding.required);
  assert.equal(fundPlayerContract(s,p,wage).budget,s.budget);
  const paid=advancePayroll(s,'2026-08-22');assert.equal(paid.budget,s.budget);assert.equal(paid.finance.accounts[p.id].transferReserve,funding.required-10000);
  const released=releasePlayerWages(paid,p.id);assert.equal(released.budget,cash(before-.01));assert.ok(!released.finance.accounts[p.id]);
  assert.equal(releasePlayerWages(released,p.id).budget,released.budget);
  const lowered=fundPlayerContract(s,p,old);assert.equal(lowered.budget,before);assert.equal(lowered.finance.accounts[p.id].transferReserve,0);
});
test('wage allocation uses exact pounds, respects fee reservations and malformed accounts cannot be imported',()=>{
  const s=ensureClubFinance(game()),p=own(s).players[0];
  const low={...s,budget:.01,market:{talks:[{status:'pending',buyerId:s.myClubId,id:'held',fee:.009}]}};
  assert.throws(()=>fundPlayerContract(low,p,p.contract.wage+500),/unreserved transfer funds/);
  const funded=fundPlayerContract(s,p,p.contract.wage+500);assert.equal(Math.round((s.budget-funded.budget)*1000000),contractFunding(s,p,p.contract.wage+500).change);
  const raw=JSON.parse(exportGame(funded));raw.state.finance.accounts[p.id].transferReserve=-1;assert.throws(()=>validateSave(raw),/invalid wage account/);
});
test('outgoing loan wages stay with the owner, while the borrower does not duplicate payroll',()=>{
  let s=ensureClubFinance(game()),p=own(s).players.find(p=>p.name.includes('Leoni')),buyer=allClubs(s).find(c=>c.id==='man');
  const wage=p.contract.wage;s=transfer(s,{type:'loan-out',playerId:p.id,buyerId:buyer.id,seasons:.5});
  assert.ok(s.finance.accounts[p.id]);assert.equal(s.loans[0].endsDate,loanEndDate(s.currentDate,.5));
  const paid=advancePayroll(s,'2026-08-22');assert.equal(s.finance.accounts[p.id].boardReserve-paid.finance.accounts[p.id].boardReserve,wage);
  const borrowed=ensureClubFinance({...s,myClubId:buyer.id,clubs:s.plClubs,budget:buyer.budget,finance:null});assert.equal(borrowed.finance.accounts[p.id],undefined);
});
test('off-window requests receive approaches and fee agreements defer movement until the next window',()=>{
  let s=acknowledgedCareer(game()),p=own(s).players.find(p=>p.name.includes('Leoni'));
  s=changePlayer(s,p.id,x=>({...x,contract:{...x.contract,endDate:'2029-06-30'},life:{...x.life,status:'wants-move',transferRequested:true,happiness:0,complaintStage:2}}));
  s=ensureMarket(acknowledgedCareer({...s,currentDate:'2026-10-01',lifeClockDate:'2026-10-01',saleListings:[p.id]}));
  const approach=marketDay(s,'2026-10-02');assert.equal(approach.arrived,true);const received=approach.state.saleOffers.find(o=>o.playerId===p.id);assert.ok(received.offWindow);assert.equal(marketOpen(approach.state),false);
  // Give two top clubs equal approved fees; only the player's chosen club pays.
  s={...approach.state,currentDate:'2026-10-02',saleOffers:['man','mun'].map((id,i)=>({...received,id:`future-${i}`,buyerId:id,amount:3,maxFee:5}))};
  for(const o of [...s.saleOffers])s=respondToSaleOffer(s,o.id,'accept');
  const before=s.budget,due=s.market.talks[0].dueDate;s=advanceTransferCalendar(s,due).state;
  assert.equal(player(s,p.id).club,'liv');assert.equal(s.budget,before);assert.equal(s.marketNotices.at(-1).status,'scheduled');
  const queued=s.market.talks.find(t=>t.playerId===p.id);assert.equal(queued.phase,'agreed-future');assert.equal(queued.dueDate,'2027-01-01');
  s=validateSave(JSON.parse(exportGame(s)));s={...s,currentDate:'2026-12-31',lifeClockDate:'2026-12-31',market:{...s.market,lastDate:'2026-12-31'}};
  s=advanceTransferCalendar(s,'2027-01-01').state;assert.equal(player(s,p.id).club,queued.buyerId);assert.equal(s.budget,cash(before+3));
  assert.equal(s.market.history.filter(t=>t.playerId===p.id&&t.status==='signed').length,1);assert.equal(player(s,p.id).life.transferRequested,false);
});
test('contract expiry releases wages and suitable AI clubs can sign the player once as a free agent',()=>{
  let s=acknowledgedCareer(game()),p=own(s).players.find(p=>p.role==='CM');
  s=changePlayer(s,p.id,x=>({...x,contract:{...x.contract,endDate:'2026-10-01'},life:{...x.life,happiness:0,status:'wants-move',transferRequested:true}}));
  s={...s,currentDate:'2026-10-01',lifeClockDate:'2026-10-01'};
  const budget=s.budget;s=advancePlayerLife(s,'2026-10-02').state;assert.ok(!player(s,p.id));assert.ok(s.freeAgents.some(x=>x.id===p.id));assert.ok(!s.finance.accounts[p.id]);
  s=marketDay(s,'2026-10-04').state;const joined=player(s,p.id);assert.ok(joined);assert.notEqual(joined.club,'liv');assert.ok(clubQuality(allClubs(s).find(c=>c.id===joined.club))>=70);assert.equal(s.budget,budget);
  assert.equal(s.freeAgents.filter(x=>x.id===p.id).length,0);assert.equal(allClubs(s).filter(c=>c.players.some(x=>x.id===p.id)).length,1);assert.ok(s.mail.some(m=>m.subject.includes('joins')&&m.playerCard?.id===p.id));
  assert.equal(allClubs(marketDay(s,'2026-10-04').state).filter(c=>c.players.some(x=>x.id===p.id)).length,1);
});
