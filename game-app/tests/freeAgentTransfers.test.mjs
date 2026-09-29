import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,autoLineup} from '../src/game/engine.js';
import {FORMATIONS} from '../src/game/config.js';
import {allClubs,commitClubs,clubQuality,listPlayerForSale,counterSaleOffer,buyerCapacity,repairSaleOffers,transferTerms,evaluateOffer} from '../src/game/career.js';
import {ensureMarket,approachFreeAgent,cancelMarketTalk,negotiatePlayerContract,advanceTransferCalendar,agreeTransferFee,marketDay} from '../src/game/market.js';
import {advancePlayerLife,aiWantsRenewal} from '../src/game/playerLife.js';
import {freeAgentClub,isFreeAgentSearch} from '../src/game/freeAgents.js';
import {contractFunding,cash,reservedBudget} from '../src/game/finance.js';
import {exportGame,validateSave} from '../src/game/storage.js';
import {acknowledgedCareer} from './careerFixture.mjs';

function game(){
  let s=freshState(),me=s.plClubs.find(c=>c.id==='liv');
  s=commitClubs(s,allClubs(s).map(c=>c.id===me.id?{...c,players:c.players.filter(p=>!p.name.includes('Woodman'))}:c));
  return ensureMarket(acknowledgedCareer({...s,league:'PL',clubs:s.plClubs,myClubId:me.id,budget:me.budget,formation:me.preferredFormation,lineup:autoLineup(FORMATIONS[me.preferredFormation],me.players),currentDate:'2026-08-15',stage:'squad',seasonSchedule:[],scheduleMigrationDone:true}));
}
function released(){
  let s=game();const former=allClubs(s).find(c=>c.name==='Paris Saint-Germain'),p=former.players.find(p=>p.name.includes('Nuno'));
  s=commitClubs(s,allClubs(s).map(c=>c.id===former.id?{...c,players:c.players.filter(x=>x.id!==p.id)}:c));
  return {s:{...s,freeAgents:[{...p,club:null,formerClubId:former.id,freeAgentDecisionDate:'2026-08-17',contract:{...p.contract,endDate:'2026-06-30'}}]},p};
}
test('Free Agents directory is searchable, separate from club pools, and survives reload',()=>{
  const {s,p}=released(),r=validateSave(JSON.parse(exportGame(s)));
  for(const q of ['free agent','Free Agents','free-agent','freeagent'])assert.ok(isFreeAgentSearch(q));
  assert.ok(!isFreeAgentSearch('Liverpool'));
  assert.equal(freeAgentClub(r).players[0].id,p.id);assert.ok(!allClubs(r).some(c=>c.id==='free-agents'));
  assert.ok(!allClubs(r).some(c=>c.players.some(x=>x.id===p.id)));
});
test('direct personal talks work outside a window, stop the calendar, and charge only wage funding once',()=>{
  let {s,p}=released();s={...s,currentDate:'2026-10-15'};
  s=approachFreeAgent(s,p.id);const t=s.market.talks[0],before=s.budget;
  assert.equal(t.fee,0);assert.equal(t.phase,'contract-ready');assert.equal(reservedBudget(s),0);
  assert.throws(()=>approachFreeAgent(s,p.id),/already/);
  s=validateSave(JSON.parse(exportGame(s)));
  const stop=advanceTransferCalendar(s,'2026-10-25');assert.ok(stop.arrived);assert.equal(stop.date,s.currentDate);
  const expected=contractFunding(s,p,t.demands.wage,true).change;
  const r=negotiatePlayerContract(s,{talkId:t.id,...t.demands});assert.equal(r.status,'accepted');
  assert.equal(r.state.budget,cash(before-expected/1e6));assert.equal(r.state.freeAgents.length,0);
  assert.equal(allClubs(r.state).filter(c=>c.players.some(x=>x.id===p.id)).length,1);
  assert.ok(r.state.clubs.find(c=>c.id==='liv').players.some(x=>x.id===p.id&&x.contract.source==='career'));
  assert.equal(r.state.finance.accounts[p.id].wage,t.demands.wage);
  assert.match(r.state.mail[0].body,/no transfer fee/i);
  const loaded=validateSave(JSON.parse(exportGame(r.state)));assert.equal(loaded.freeAgents.length,0);
  assert.throws(()=>negotiatePlayerContract(loaded,{talkId:t.id,...t.demands}),/no longer/);
});
test('free-agent counters persist, withdrawal spends nothing, and AI cannot steal open personal talks',()=>{
  let {s,p}=released();s=approachFreeAgent(s,p.id);const t=s.market.talks[0];
  let r=negotiatePlayerContract(s,{talkId:t.id,...t.demands,role:'prospect'});assert.equal(r.status,'counter');
  s=validateSave(JSON.parse(exportGame(r.state)));assert.equal(s.market.talks[0].round,2);
  s=marketDay(s,'2026-08-20').state;assert.ok(s.freeAgents.some(x=>x.id===p.id));
  const cancelled=cancelMarketTalk(s,t.id);assert.equal(cancelled.budget,s.budget);assert.equal(cancelled.market.talks.length,0);
  assert.ok(validateSave(JSON.parse(exportGame(cancelled))).freeAgents.some(x=>x.id===p.id));
});
test('free-agent signing guards full squads, insufficient wages and malformed/duplicate imports',()=>{
  let {s,p}=released(),club=s.clubs.find(c=>c.id==='liv');
  const full=commitClubs(s,allClubs(s).map(c=>c.id===club.id?{...c,players:[...c.players,{...p,id:'test-extra',name:'Reserve'}]}:c));
  assert.throws(()=>approachFreeAgent(full,p.id),/full/);
  s=approachFreeAgent(s,p.id);let t=s.market.talks[0];
  assert.throws(()=>negotiatePlayerContract({...s,budget:0},{talkId:t.id,...t.demands}),/funds/);
  let raw=JSON.parse(exportGame(s));raw.state.market.talks[0].fee=1;assert.throws(()=>validateSave(raw),/market agreement/);
  raw=JSON.parse(exportGame(s));raw.state.freeAgents.push(raw.state.freeAgents[0]);assert.throws(()=>validateSave(raw),/free-agent player/);
  assert.ok(s.freeAgents.some(x=>x.id===p.id));assert.equal(s.budget,game().budget);
});
test('AI releases old low-ceiling reserves at expiry rather than renewing everyone',()=>{
  let s=game(),club=allClubs(s).find(c=>c.id==='man'),p=club.players.find(p=>p.role==='CM');
  const veteran={...p,age:36,ovr:65,potential:65,contract:{...p.contract,endDate:'2026-08-16'},life:{...p.life,happiness:90}};
  assert.equal(aiWantsRenewal(veteran,club,clubQuality(club)),false);
  assert.equal(aiWantsRenewal({...veteran,age:20,potential:92},club,clubQuality(club)),true);
  s=commitClubs(s,allClubs(s).map(c=>c.id===club.id?{...c,players:c.players.map(x=>x.id===p.id?veteran:x)}:c));
  s=advancePlayerLife(s,'2026-08-17').state;assert.ok(s.freeAgents.some(x=>x.id===p.id));
  s=marketDay(s,'2026-08-19').state;assert.ok(!allClubs(s).find(c=>c.id===club.id).players.some(x=>x.id===p.id));
});
test('Kerkez approaches can afford market value and a fair asking price is accepted',()=>{
  let s=game(),p=s.clubs.find(c=>c.id==='liv').players.find(p=>p.name==='Milos Kerkez');
  s=listPlayerForSale(s,p.id);const t=s.saleOffers[0],buyer=allClubs(s).find(c=>c.id===t.buyerId);
  assert.ok(t.maxFee>=p.value);assert.ok(buyerCapacity(buyer)>=p.value);assert.ok(t.amount>=p.value*.93);
  const r=counterSaleOffer(s,{offerId:t.id,ask:p.value});assert.equal(r.status,'accepted');
  assert.ok(r.state.market.talks.some(t=>t.playerId===p.id&&t.fee===p.value));
  const low={...t,amount:p.value*.8,maxFee:p.value*.9};
  assert.equal(counterSaleOffer({...s,saleOffers:[low]},{offerId:low.id,ask:p.value}).status,'accepted');
  const poor=allClubs(s).find(c=>c.name==='RB Salzburg');
  const repaired=repairSaleOffers({...s,saleOffers:[{...t,buyerId:poor.id,amount:37.1,maxFee:37.1}]});
  assert.ok(repaired.saleOffers.every(o=>o.maxFee>=p.value&&buyerCapacity(allClubs(s).find(c=>c.id===o.buyerId))>=p.value));
});
test('Mendes fee agreements reach personal terms; ambition refusals are explained without changing normal decisions',()=>{
  let s=game(),seller=allClubs(s).find(c=>c.name==='Paris Saint-Germain'),p=seller.players.find(p=>p.name.includes('Nuno'));
  s=commitClubs(s,allClubs(s).map(c=>c.id==='liv'?{...c,budget:200}:c));s={...s,budget:200};
  const fee=transferTerms(s,seller.id,p.id).askingPrice;
  s=agreeTransferFee(s,{sellerId:seller.id,playerId:p.id,fee});const t=s.market.talks[0];
  const result=advanceTransferCalendar(s,t.dueDate).state;assert.equal(result.marketNotice.status,'contract-ready');
  assert.equal(result.currentDate,t.dueDate);assert.ok(allClubs(result).find(c=>c.id===seller.id).players.some(x=>x.id===p.id));
  let weak=game();weak=commitClubs(weak,allClubs(weak).map(c=>c.id==='liv'?{...c,budget:200,players:c.players.map(x=>({...x,ovr:55}))}:c));weak={...weak,budget:200};
  weak=agreeTransferFee(weak,{sellerId:seller.id,playerId:p.id,fee});const w=advanceTransferCalendar(weak,weak.market.talks[0].dueDate).state;
  assert.equal(w.marketNotice.status,'failed');assert.match(w.marketNotice.reason,/weaker sporting project/);assert.equal(reservedBudget(w),0);
});
test('actual deal failures explain squad-space and funds problems rather than generic conditions changed',()=>{
  const original=game(),seller=allClubs(original).find(c=>c.name.includes('Bayern')),p=seller.players.find(p=>p.name.includes('Díaz'));
  let s=agreeTransferFee(original,{sellerId:seller.id,playerId:p.id,fee:transferTerms(original,seller.id,p.id).askingPrice});
  const t=s.market.talks[0];let r=advanceTransferCalendar({...s,budget:0},t.dueDate).state;
  assert.match(r.marketNotice.reason,/transfer funds/);assert.equal(reservedBudget(r),0);
  s=commitClubs(s,allClubs(s).map(c=>c.id==='liv'?{...c,players:[...c.players,{...c.players[0],id:'extra-place',name:'Reserve'}]}:c));
  r=advanceTransferCalendar(acknowledgedCareer(s),t.dueDate).state;assert.match(r.marketNotice.reason,/squad is full/);
});
test('a selling club explains its final-round refusal without changing acceptance rules',()=>{
  const s=game(),seller=allClubs(s).find(c=>c.name.includes('Bayern')),p=seller.players.find(p=>p.name.includes('Díaz'));
  const terms=transferTerms(s,seller.id,p.id),r=evaluateOffer(s,{sellerId:seller.id,playerId:p.id,offer:terms.minimumPrice,round:3},()=>1);
  assert.equal(r.status,'rejected');assert.match(r.message,/did not meet their valuation/);assert.ok(r.message.includes(seller.name));
});
