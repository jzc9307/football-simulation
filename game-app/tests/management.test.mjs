import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, autoLineup, ensureFixtures } from '../src/game/engine.js';
import { FORMATIONS } from '../src/game/config.js';
import { allClubs, commitClubs, transfer, transferTerms, marketOpen, startNextSeason } from '../src/game/career.js';
import { ensurePlayerLife, mapLifeClubs, recordPlayerMinutes, playerConcernMessages, advancePlayerLife, negotiateRenewal, agentTerms } from '../src/game/playerLife.js';
import { ensureClubFinance } from '../src/game/finance.js';
import { respondToPlayer, conversationChoices } from '../src/game/conversations.js';
import { ensureBoard, boardReport, reviewBoardSeason } from '../src/game/board.js';
import { enterDeadline, deadlineActive } from '../src/game/deadlineDay.js';
import { ensureMarket, advanceTransferCalendar, advanceDeadlineHour, agreeTransferFee, negotiatePlayerContract } from '../src/game/market.js';
import { assistantAdvice } from '../src/game/assistantAdvice.js';
import { validateSave, exportGame } from '../src/game/storage.js';
import { simulateScheduledHalfAsync } from '../src/game/seasonFlow.js';
import { draftPlayerToSlot, captureTeamPlan, ensureTeamSheets, saveTeamSheet } from '../src/game/teamSheets.js';

const initial=freshState();
function game(id='liv',date='2026-08-15',season=1){
  const c=initial.plClubs.find(c=>c.id===id);
  let s=ensurePlayerLife({...initial,clubs:initial.plClubs,league:'PL',myClubId:id,budget:250,currentDate:date,season,stage:'squad',formation:c.preferredFormation,lineup:autoLineup(FORMATIONS[c.preferredFormation],c.players),scheduleMigrationDone:true});
  s=mapLifeClubs(s,c=>({...c,players:c.players.filter(p=>!p.name.includes('Woodman')).map(p=>({...p,contract:{...p.contract,endDate:'2030-06-30'}}))}));
  s=ensureClubFinance(ensureFixtures(s));
  return {...s,seasonSchedule:s.seasonSchedule.map(e=>e.date<date?{...e,status:'completed'}:e),lifeAttentionPending:false};
}
const own=s=>s.clubs.find(c=>c.id===s.myClubId);
const pFor=(s,id)=>own(s).players.find(p=>p.id===id);
const change=(s,id,fn)=>mapLifeClubs(s,c=>c.id!==s.myClubId?c:{...c,players:c.players.map(p=>p.id===id?fn(p):p)});
function letter(s,type='player-concern'){
  const p=own(s).players.find(p=>p.role!=='GK');
  return {...s,mail:[{id:'test-letter',type,date:s.currentDate,read:false,body:'Please give me a chance.',subject:'Private conversation',playerCard:{id:p.id,name:p.name,ovr:p.ovr,happiness:p.life.happiness}}]};
}
test('mail replies have visible consequences, are single-use and survive a compact save',()=>{
  const s=letter(game()),id=s.mail[0].playerCard.id,before=pFor(s,id).life.happiness;
  const next=respondToPlayer(s,'test-letter','challenge');
  assert.equal(pFor(next,id).life.happiness,before-8);assert.equal(next.mail[0].reply.happinessAfter,before-8);
  assert.equal(conversationChoices(next,next.mail[0]).length,0);assert.throws(()=>respondToPlayer(next,'test-letter','rest'),/already/);
  assert.equal(validateSave(JSON.parse(exportGame(next))).mail[0].reply.choiceId,'challenge');assert.equal(pFor(s,id).life.happiness,before);
});
test('minutes promises exclude ineligible fixtures and reward real minutes only once',()=>{
  let s=respondToPlayer(letter(game()),'test-letter','minutes'),p=pFor(s,s.mail[0].playerCard.id);
  assert.equal(recordPlayerMinutes(p,0,s.currentDate,85,false).life.promise.remaining,5);
  p=recordPlayerMinutes(p,30,'2026-08-20',85);p=recordPlayerMinutes(p,30,'2026-08-22',85);
  assert.equal(p.life.promise.status,'fulfilled');assert.equal(p.life.promise.fulfilled,2);
  s=change(s,p.id,()=>p);const first=playerConcernMessages(s),second=playerConcernMessages(first.state);
  assert.equal(first.state.mail.filter(m=>m.type==='promise-update').length,1);assert.equal(second.state.mail.filter(m=>m.type==='promise-update').length,1);
});
test('broken minutes promises resolve after five eligible fixtures; overlapping promises are blocked',()=>{
  let s=respondToPlayer(letter(game()),'test-letter','minutes'),id=s.mail[0].playerCard.id,p=pFor(s,id);
  s={...s,mail:[{...s.mail[0],id:'second',reply:undefined},...s.mail]};assert.throws(()=>respondToPlayer(s,'second','minutes'),/already made/);
  for(let i=0;i<5;i++)p=recordPlayerMinutes(p,5,`2026-09-0${i+1}`,85);
  assert.equal(p.life.promise.status,'failed');assert.equal(p.life.promise.remaining,0);
});
test('renewal promises expire on the date clock, and successful renewals fulfil them',()=>{
  let s=letter(game(),'renewal-invite'),id=s.mail[0].playerCard.id;
  s=change(s,id,p=>({...p,contract:{...p.contract,endDate:'2027-06-30'}}));
  const promised=respondToPlayer(s,'test-letter','renew');
  assert.equal(pFor(advancePlayerLife(promised,'2026-09-15').state,id).life.promise.status,'failed');
  const signed=negotiateRenewal(promised,id,{...agentTerms(pFor(promised,id),85,promised.currentDate)}).state;
  assert.equal(pFor(signed,id).life.promise.status,'fulfilled');
});
test('young players send a thank-you letter only after an actual outgoing loan',()=>{
  const s=ensureBoard(game()),p=own(s).players.find(p=>p.age<=23&&p.role!=='GK');
  const buyer=allClubs(s).find(c=>c.id!==s.myClubId&&c.players.length<30);
  const loan=transfer(s,{type:'loan-out',playerId:p.id,buyerId:buyer.id,seasons:1});
  assert.equal(loan.mail.filter(m=>m.type==='loan-thanks'&&m.playerId===p.id).length,1);assert.ok(loan.lifeAttentionPending);
  const mail=loan.mail.find(m=>m.type==='loan-thanks'),reply=respondToPlayer(loan,mail.id,'support');
  assert.equal(allClubs(reply).flatMap(c=>c.players).find(x=>x.id===p.id).life.happiness,p.life.happiness+2);
  assert.equal(reply.mail.find(m=>m.id===mail.id).reply.choiceId,'support');
});
test('a renewal invitation becomes encouragement after a new contract is signed',()=>{
  let s=letter(game(),'renewal-invite'),id=s.mail[0].playerCard.id;
  s=change(s,id,p=>({...p,contract:{...p.contract,signedDate:s.currentDate}}));
  assert.deepEqual(conversationChoices(s,s.mail[0]).map(c=>c.id),['support']);
  assert.throws(()=>respondToPlayer(s,'test-letter','renew'),/no longer available/);
});
test('board ambitions follow team quality and ignore competitions the club did not qualify for',()=>{
  const s=game(),liv=ensureBoard({...s,ucl:{clubs:[own(s)]}}),che=ensureBoard(game('che'));
  assert.equal(liv.board.objectives.find(o=>o.kind==='league').target,1);assert.equal(liv.board.objectives.find(o=>o.kind==='europe').target,6);
  assert.equal(che.board.objectives.find(o=>o.kind==='league').target,4);assert.ok(!che.board.objectives.some(o=>o.kind==='europe'));
  assert.equal(ensureBoard(liv).mail.length,liv.mail.length);assert.ok(boardReport(liv).confidence>=70);
});
function finished(s,rank){const order=[...s.clubs.filter(c=>c.id!==s.myClubId)];order.splice(rank-1,0,own(s));return {...s,stage:'summary',tableFinal:order.map((c,i)=>({id:c.id,club:c,pts:80-i,played:38})),table1:order.map(c=>({id:c.id,club:c,pts:20,played:19}))};}
test('one missed board objective is not dismissal; a poor overall final review ends the career once',()=>{
  const s=ensureBoard({...game(),ucl:{clubs:[own(game())],stage:'final',outcome:'NOT QUALIFIED'}});
  const close=reviewBoardSeason(finished(s,2));assert.notEqual(close.stage,'game-over');assert.ok(close.board.review.confidence>=40);
  const bad=reviewBoardSeason(finished(s,20));assert.equal(bad.stage,'game-over');assert.ok(bad.board.review.confidence<40);
  assert.equal(reviewBoardSeason(bad).mail.length,bad.mail.length);assert.equal(startNextSeason(bad).season,bad.season);
});
test('cup progress provides partial board credit and financial underfunding is visible',()=>{
  const s=ensureBoard(game()),base=boardReport(finished(s,8),true);
  const cup=boardReport({...finished(s,8),seasonSchedule:[{competition:'FA',round:'Final',status:'completed',homeId:'liv',awayId:'che',winnerId:'liv'}]},true);
  assert.ok(cup.confidence>base.confidence);assert.equal(cup.objectives.find(o=>o.kind==='domestic').achieved,true);
  const broke={...s,finance:{...s.finance,accounts:Object.fromEntries(Object.entries(s.finance.accounts).map(([id,a])=>[id,{...a,boardReserve:0,transferReserve:0}]))}};
  assert.equal(boardReport(broke).objectives.find(o=>o.kind==='finance').score,0);
});
test('deadline day interrupts the date clock at entry and survives save/reload',()=>{
  const s=ensureBoard(game('liv','2026-08-31'));
  const r=advanceTransferCalendar(s,'2026-09-03');assert.ok(r.arrived);assert.equal(r.state.currentDate,'2026-09-01');assert.ok(deadlineActive(r.state));assert.equal(r.state.deadlineDay.hour,0);
  const saved=validateSave(JSON.parse(exportGame(r.state)));assert.equal(saved.deadlineDay.hour,0);assert.equal(advanceTransferCalendar(saved,'2026-09-03').state.currentDate,'2026-09-01');
});
test('an instant half-season cannot skip an active deadline clock',async()=>{
  const s=enterDeadline(ensureBoard(game('liv','2026-09-01'))),next=await simulateScheduledHalfAsync({...s,simMode:'half'},1,{yieldControl:async()=>{}});
  assert.equal(next.currentDate,'2026-09-01');assert.equal(next.stage,'calendar-event');assert.equal(next.results1.length,0);
});
test('a two-hour skip stops at the first player decision, reserving fees until personal terms',()=>{
  let s=enterDeadline(ensureBoard(game('liv','2026-09-01')));
  const seller=allClubs(s).find(c=>c.name.includes('Bayern')),p=seller.players.find(p=>p.name.includes('Díaz')),fee=transferTerms(s,seller.id,p.id).askingPrice;
  s=agreeTransferFee(s,{sellerId:seller.id,playerId:p.id,fee});
  s={...s,market:{...s.market,talks:s.market.talks.map(t=>({...t,deadlineHour:1}))}};
  const result=advanceDeadlineHour(s,2).state;assert.equal(result.deadlineDay.hour,1);assert.equal(result.budget,s.budget);assert.equal(result.marketNotice.status,'contract-ready');
  assert.throws(()=>advanceDeadlineHour(result,1),/personal terms/i);
  const talk=result.market.talks[0],signed=negotiatePlayerContract(result,{talkId:talk.id,...talk.demands}).state;
  assert.ok(own(signed).players.some(p=>p.id===talk.playerId));assert.equal(signed.deadlineDay.hour,1);
});
test('deadline closure prohibits new club bids and unlocks calendar progression',()=>{
  let s=ensureMarket(enterDeadline(ensureBoard(game('liv','2026-09-01'))));
  s={...s,deadlineDay:{...s.deadlineDay,hour:19},market:{...s.market,lastDate:s.currentDate}};
  s=advanceDeadlineHour(s,2).state;assert.equal(s.deadlineDay.hour,20);assert.ok(s.deadlineDay.closed);assert.equal(marketOpen(s),false);
  assert.throws(()=>advanceDeadlineHour(s,1),/no active/);assert.equal(advanceTransferCalendar(s,'2026-09-02').state.currentDate,'2026-09-02');
});
test('assistant recommendations use current energy, promises and position fit',()=>{
  let s=letter(game()),id=s.mail[0].playerCard.id;
  s=respondToPlayer(s,'test-letter','minutes');s={...s,lineup:Object.fromEntries(Object.entries(s.lineup).filter(([,p])=>p!==id))};
  assert.equal(assistantAdvice(s)[0].playerId,id);assert.equal(assistantAdvice(s)[0].kind,'start');
  s=change(s,id,p=>({...p,life:{...p.life,promise:null}}));const tired=Object.values(s.lineup)[0];s=change(s,tired,p=>({...p,energy:45}));
  const advice=assistantAdvice(s).find(t=>t.id==='energy');assert.ok(advice);assert.notEqual(advice.playerId,tired);assert.equal(s.lineup[advice.slotIndex],tired);
});
test('invalid deadline hours and conversation/promise save data are rejected',()=>{
  const s=enterDeadline(ensureBoard(game()));assert.throws(()=>validateSave(JSON.parse(exportGame({...s,deadlineDay:{...s.deadlineDay,hour:21}}))),/deadline-day/);
  const l=respondToPlayer(letter(game()),'test-letter','minutes'),id=l.mail[0].playerCard.id;
  assert.throws(()=>validateSave(JSON.parse(exportGame(change(l,id,p=>({...p,life:{...p.life,promise:{...p.life.promise,remaining:-1}}}))))),/mindset/);
  const migrated=validateSave(JSON.parse(exportGame(l)));assert.equal(pFor(migrated,id).life.promise.remaining,5);
});
test('team-sheet drops swap only the draft and reject unavailable or invalid players',()=>{
  const s=ensureTeamSheets(game()),ids=Object.values(s.lineup),slot=Number(Object.keys(s.lineup)[1]);
  const swapped=draftPlayerToSlot(s,slot,ids[0]);
  assert.equal(swapped.lineup[slot],ids[0]);assert.equal(swapped.lineup[0],ids[1]);
  assert.equal(s.lineup[0],ids[0]);assert.deepEqual(swapped.teamSheets,s.teamSheets);
  const outsider=own(s).players.find(p=>!ids.includes(p.id)),replaced=draftPlayerToSlot(s,slot,outsider.id);
  assert.equal(replaced.lineup[slot],outsider.id);assert.ok(replaced.benchSelection.includes(ids[1]));
  assert.equal(new Set(Object.values(replaced.lineup)).size,11);
  const hurt={...s,injuries:{[outsider.id]:{matches:2,days:7}}};
  assert.equal(draftPlayerToSlot(hurt,slot,outsider.id),hurt);
  assert.equal(draftPlayerToSlot(s,99,outsider.id),s);assert.equal(draftPlayerToSlot(s,slot,'missing'),s);
  const saved=saveTeamSheet(s,captureTeamPlan(replaced),'Cup XI');
  assert.equal(validateSave(JSON.parse(exportGame(saved))).teamSheets.find(t=>t.name==='Cup XI').lineup[slot],outsider.id);
});
