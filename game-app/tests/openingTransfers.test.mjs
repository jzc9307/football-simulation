import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,autoLineup} from '../src/game/engine.js';
import {FORMATIONS} from '../src/game/config.js';
import {allClubs,commitClubs,respondToSaleOffer,marketOpen} from '../src/game/career.js';
import {ensureMarket,advanceTransferCalendar,marketDay,cancelMarketTalk} from '../src/game/market.js';
import {OPENING_TRANSFERS,transferSquadLimit} from '../src/game/openingTransfers.js';
import {availableBudget,reservedBudget,money} from '../src/game/finance.js';
import {exportGame,validateSave} from '../src/game/storage.js';
import {acknowledgedCareer} from './careerFixture.mjs';
function game(id='liv'){
  const s=freshState(),me=s.plClubs.find(c=>c.id===id);
  return acknowledgedCareer({...s,league:'PL',myClubId:id,budget:me.budget,formation:me.preferredFormation,lineup:autoLineup(FORMATIONS[me.preferredFormation],me.players),currentDate:'2026-08-15',stage:'squad',seasonSchedule:[],scheduleMigrationDone:true});
}
const owner=(s,slug)=>allClubs(s).find(c=>c.players.some(p=>p.slug===slug));
test('verified opening replay moves eight players on their dated decisions with no random AI or source edits',()=>{
  const input=game(),before=money(allClubs(input).reduce((v,c)=>v+c.budget,0)),count=allClubs(input).flatMap(c=>c.players).length;
  const next=advanceTransferCalendar(input,'2026-09-01');
  assert.equal(next.arrived,false);
  for(const d of OPENING_TRANSFERS){assert.equal(owner(input,d.slug).id,d.sellerId);assert.equal(owner(next.state,d.slug).id,d.buyerId);}
  assert.equal(next.state.market.history.filter(t=>t.status==='signed').length,8);
  assert.ok(next.state.market.history.every(t=>t.openingDealId&&t.source));
  assert.equal(money(allClubs(next.state).reduce((v,c)=>v+c.budget,0)),before);
  assert.equal(allClubs(next.state).flatMap(c=>c.players).length,count);
  assert.ok(allClubs(next.state).every(c=>c.budget>=0));
  assert.equal(owner(freshState(),OPENING_TRANSFERS[0].slug).id,'man');
});
test('managing the selling club stops at the approach and never forces a departure; offers survive reload',()=>{
  const input=game('che'),first=advanceTransferCalendar(input,'2026-09-01');
  assert.equal(first.arrived,true);assert.equal(first.date,'2026-08-25');
  const offer=first.state.saleOffers[0];assert.ok(offer.openingDealId);assert.equal(first.state.budget,input.budget);
  const restored=validateSave(JSON.parse(exportGame({...first.state,currentDate:first.date})));
  assert.ok(restored.saleOffers.some(o=>o.id===offer.id));
  const slug=OPENING_TRANSFERS.find(d=>d.id===offer.openingDealId).slug;
  assert.equal(owner(restored,slug).id,'che');
  const rejected=respondToSaleOffer(restored,offer.id,'reject');
  assert.equal(owner(rejected,slug).id,'che');
  assert.ok(!marketDay(rejected,first.date).state.saleOffers.some(o=>o.id===offer.id));
});
test('Enzo deadline approach can be accepted but is never a forced Chelsea sale',()=>{
  const input={...game('che'),currentDate:'2026-08-30'};
  const result=advanceTransferCalendar(input,'2026-09-01');
  assert.equal(result.date,'2026-08-30');
  const offer=result.state.saleOffers.find(o=>o.playerId.includes('enzo-jeremias'));
  assert.ok(offer);assert.equal(owner(result.state,'enzo-jeremias-fernandez').id,'che');
  const restored=validateSave(JSON.parse(exportGame({...result.state,currentDate:result.date})));
  const agreement=respondToSaleOffer(restored,offer.id,'accept');assert.equal(owner(agreement,'enzo-jeremias-fernandez').id,'che');assert.equal(agreement.budget,input.budget);
  const talk=agreement.market.talks.find(t=>t.playerId===offer.playerId);
  const accepted=advanceTransferCalendar(agreement,talk.dueDate).state;
  // Club consent is not player consent: a crowded City midfield can make
  // Enzo prefer to stay in a career managed by Chelsea.
  const outcome=accepted.market.history.find(t=>t.id===talk.id);
  assert.ok(['signed','cancelled'].includes(outcome.status));
  assert.equal(owner(accepted,'enzo-jeremias-fernandez').id,outcome.status==='signed'?'man':'che');
  assert.equal(accepted.budget,outcome.status==='signed'?money(input.budget+offer.amount):input.budget);
});
test('managed buyer gets a reviewable invitation, never automatic spending or reserved funds',()=>{
  const input=game('mun'),result=advanceTransferCalendar(input,'2026-09-01');
  assert.equal(result.date,'2026-08-23');assert.equal(result.arrived,true);
  assert.equal(result.state.market.invitations.length,1);
  assert.equal(owner(result.state,'carlos-noom-quomah-baleba').id,'bri');
  assert.equal(result.state.budget,input.budget);assert.equal(reservedBudget(result.state),0);assert.equal(availableBudget(result.state),input.budget);
  const restored=validateSave(JSON.parse(exportGame({...result.state,currentDate:result.date})));
  assert.equal(restored.market.invitations.length,1);
  const dismissed=cancelMarketTalk(restored,restored.market.invitations[0].id);
  assert.equal(dismissed.market.invitations.length,0);assert.equal(dismissed.market.history[0].status,'cancelled');
});
test('already moved, departed and older-career players are not replayed or duplicated',()=>{
  const input=game(),deal=OPENING_TRANSFERS[0],source=allClubs(input).find(c=>c.id===deal.sellerId),p=source.players.find(p=>p.slug===deal.slug);
  const moved=commitClubs(input,allClubs(input).map(c=>c.id===source.id?{...c,players:c.players.filter(x=>x.id!==p.id)}:c.id===deal.buyerId?{...c,players:[...c.players,p]}:c));
  const result=advanceTransferCalendar(moved,'2026-09-01').state;
  assert.ok(!result.market.history.some(t=>t.id===deal.id));assert.equal(allClubs(result).flatMap(c=>c.players).filter(x=>x.id===p.id).length,1);
  const late=advanceTransferCalendar({...input,currentDate:'2026-09-05'},'2026-09-07').state;
  assert.equal(late.market.history.length,0);assert.equal(owner(late,deal.slug).id,'man');
});
test('replay consumption persists independently of history and respects unavailable funds',()=>{
  let s=ensureMarket(game());s=marketDay(s,'2026-08-23').state;
  const restored=validateSave(JSON.parse(exportGame({...s,currentDate:'2026-08-23'})));
  const repeated=marketDay({...restored,market:{...restored.market,history:[]}},'2026-08-23').state;
  assert.equal(repeated.market.talks.length,restored.market.talks.length);
  const poor=commitClubs(game(),allClubs(game()).map(c=>c.id==='man'?{...c,budget:0}:c));
  const done=advanceTransferCalendar(poor,'2026-09-01').state;
  assert.equal(owner(done,'enzo-jeremias-fernandez').id,'che');assert.ok(allClubs(done).every(c=>c.budget>=0));
  const deal=OPENING_TRANSFERS[0],p=owner(game(),deal.slug).players.find(p=>p.slug===deal.slug);
  assert.equal(transferSquadLimit(game(),deal.id,'man','tot',p),34);
  assert.equal(transferSquadLimit(game(),'fake','man','tot',p),34);
});
