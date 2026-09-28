import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, ensureFixtures, autoLineup, fmtM, applyPerformanceUpdates, aiMatchPlayers, unavailablePlayerIds } from '../src/game/engine.js';
import { FORMATIONS } from '../src/game/config.js';
import { allClubs, commitClubs, transferTerms, transfer, listPlayerForSale, buyerCapacity } from '../src/game/career.js';
import { money, availableBudget, reservedBudget } from '../src/game/finance.js';
import { ensureMarket, agreeTransferFee, cancelMarketTalk, advanceTransferCalendar, marketDay, recruitmentNeeds, aiSalePrice, playerInterest, negotiatePlayerContract } from '../src/game/market.js';
import { prepareNextFixture, simulateScheduledHalfAsync } from '../src/game/seasonFlow.js';
import { exportGame, validateSave } from '../src/game/storage.js';
import { orderCompetitions } from '../src/game/competitionOrder.js';

const initial=freshState(),me=initial.plClubs.find(c=>c.id==='liv');
const full=ensureFixtures({...initial,league:'PL',clubs:initial.plClubs,myClubId:me.id,budget:me.budget,formation:me.preferredFormation,lineup:autoLineup(FORMATIONS[me.preferredFormation],me.players),stage:'squad',currentDate:'2026-08-15',scheduleMigrationDone:true});
const base=commitClubs(full,allClubs(full).map(c=>c.id===me.id?{...c,players:c.players.filter(p=>!p.name.includes('Woodman'))}:c));
const seller=allClubs(base).find(c=>c.name.includes('Bayern'));
const target=seller.players.find(p=>p.name.includes('Díaz'));
const fee=transferTerms(base,seller.id,target.id).askingPrice;
const agreement=s=>agreeTransferFee(s,{sellerId:seller.id,playerId:target.id,fee});
const owners=(s,id)=>allClubs(s).filter(c=>c.players.some(p=>p.id===id));
test('all money is clean; active competitions precede exits and champions stay distinct',()=>{
  assert.equal(fmtM(14.300000000000011),'£14.3m');assert.equal(fmtM(90),'£90m');assert.equal(money(.1+.2),.3);
  assert.deepEqual(orderCompetitions([{id:'exit',outcome:'EXIT',index:0},{id:'late',date:'2027-02-01',index:1},{id:'early',date:'2027-01-01',index:2},{id:'win',outcome:'CHAMPION',index:3}]).map(i=>i.id),['early','late','win','exit']);
});
test('fee agreements reserve, never spend or move players; withdrawal releases funds',()=>{
  const s=agreement(base);assert.equal(s.budget,base.budget);assert.equal(reservedBudget(s),fee);assert.equal(availableBudget(s),money(base.budget-fee));
  assert.equal(owners(s,target.id)[0].id,seller.id);assert.equal(playerInterest(s,target.id)[0].label,'Fee agreed · player deciding');
  assert.throws(()=>agreement(s),/already/);
  const other=seller.players.find(p=>p.id!==target.id&&transferTerms(s,seller.id,p.id).minimumPrice>availableBudget(s));
  assert.throws(()=>transfer(s,{type:'buy',sellerId:seller.id,playerId:other.id,fee:transferTerms(s,seller.id,other.id).askingPrice}),/budget/);
  const released=cancelMarketTalk(s,s.market.talks[0].id);assert.equal(availableBudget(released),base.budget);assert.equal(released.budget,base.budget);assert.equal(released.market.history[0].status,'cancelled');
});
test('pending agreements survive compact save/reload and stop exactly on the decision date',()=>{
  const s=validateSave(JSON.parse(exportGame(agreement(base))));assert.equal(reservedBudget(s),fee);
  const r=prepareNextFixture(s);assert.equal(r.stage,'calendar-event');assert.equal(r.currentDate,'2026-08-17');
  assert.equal(r.marketNotice.status,'contract-ready');assert.equal(r.budget,base.budget);assert.equal(reservedBudget(r),fee);
  assert.deepEqual(owners(r,target.id).map(c=>c.id),[seller.id]);
  const talk=r.market.talks[0],signed=negotiatePlayerContract(r,{talkId:talk.id,...talk.demands}).state;
  assert.equal(signed.budget,money(base.budget-fee));assert.equal(reservedBudget(signed),0);assert.equal(owners(signed,target.id)[0].id,'liv');
  const later=advanceTransferCalendar({...signed,marketNotice:null,marketNotices:[]},'2026-08-20');assert.equal(later.state.budget,signed.budget);assert.equal(owners(later.state,target.id).length,1);
});
test('a rival can win before confirmation; loser pays nothing and receives an explained failure',()=>{
  const weak=commitClubs(base,allClubs(base).map(c=>c.id==='liv'?{...c,players:c.players.map(p=>({...p,ovr:55}))}:c));
  let s=agreement(weak),own=s.market.talks[0],rival=allClubs(s).find(c=>c.id==='man');
  s={...s,market:{...s.market,talks:[...s.market.talks,{...own,id:'rival-bid',buyerId:rival.id,fee:fee+.1,phase:'negotiating'}]}};
  const before=rival.budget,r=advanceTransferCalendar(s,own.dueDate).state;
  assert.equal(r.marketNotice.status,'failed');assert.match(r.marketNotice.reason,/sporting project/);assert.equal(r.budget,s.budget);assert.equal(availableBudget(r),s.budget);
  assert.deepEqual(owners(r,target.id).map(c=>c.id),[rival.id]);assert.equal(allClubs(r).find(c=>c.id===rival.id).budget,money(before-fee-.1));
  assert.equal(r.market.talks.length,0);assert.equal(r.market.history.filter(t=>t.status==='signed').length,1);
});
test('instant half-season stops before playing any fixtures when a signing decision arrives',async()=>{
  const s=await simulateScheduledHalfAsync({...agreement(base),simMode:'half'},1,{yieldControl:async()=>{}});
  assert.equal(s.stage,'calendar-event');assert.equal(s.currentDate,'2026-08-17');assert.equal(s.results1.length,0);
});
test('first summer only has verified replay talks; later summers recruit within budgets',()=>{
  assert.ok(advanceTransferCalendar(base,'2026-08-31').state.market.talks.every(t=>t.openingDealId));
  // Keep a representative league pool for a fast deterministic recruitment test.
  const empty=Object.fromEntries(Object.keys(base).filter(k=>k.endsWith('Clubs')&&k!=='plClubs').map(k=>[k,[]]));
  let s={...base,...empty,season:2,currentDate:'2027-07-01',market:null};
  s=marketDay(s,'2027-07-01').state;assert.ok(s.market.talks.length>0);
  for(const t of s.market.talks){const buyer=allClubs(s).find(c=>c.id===t.buyerId);assert.ok(t.fee<=buyerCapacity(buyer));assert.ok(availableBudget(s,buyer.id)>=0);assert.notEqual(t.sellerId,s.myClubId);}
  const count=s.market.talks.length;
  const repeated=advanceTransferCalendar(s,'2027-07-01').state;assert.equal(repeated.market.talks.length,count);
  const sum=allClubs(s).reduce((n,c)=>n+c.budget,0),playerCount=allClubs(s).reduce((n,c)=>n+c.players.length,0);
  s=marketDay(s,'2027-07-04').state;assert.ok(s.market.history.some(t=>t.status==='signed'));
  assert.equal(money(allClubs(s).reduce((n,c)=>n+c.budget,0)),money(sum));assert.equal(allClubs(s).reduce((n,c)=>n+c.players.length,0),playerCount);
  for(const c of allClubs(s))assert.ok(c.budget>=0);
});
test('strong stocked midfield does not trigger another star purchase; winter needs an urgent reason',()=>{
  const madrid=allClubs(base).find(c=>c.name.includes('Madrid'));
  const mids=madrid.players.filter(p=>p.group==='MID');
  const strong={...madrid,preferredFormation:'4-3-3',players:madrid.players.map(p=>p.group==='MID'?{...p,ovr:91,potential:94}:p)};
  const needs=recruitmentNeeds(base,strong,'2027-07-01');
  assert.ok(needs.filter(n=>['CM','CDM','CAM'].includes(n.role)).every(n=>n.target<85&&n.priority<80));
  const winter=recruitmentNeeds(base,strong,'2027-01-01');assert.equal(winter.length,0);
  const injured={...base,injuries:Object.fromEntries(mids.map(p=>[p.id,{matches:8}]))};
  assert.ok(recruitmentNeeds(injured,strong,'2027-01-01').some(n=>n.reason.includes('injury')||n.reason.includes('Missing')));
});
test('seller protects sole keeper, ages position-aware and discounts only sustained poor form',()=>{
  const gk=seller.players.find(p=>p.role==='GK');const single={...seller,players:seller.players.filter(p=>p.role!=='GK'||p.id===gk.id)};
  assert.equal(aiSalePrice(base,single,gk),null);
  const older={...target,age:33},poor={...target,ratedMatches:12,ratingTotal:60};
  assert.ok(aiSalePrice(base,seller,older)<aiSalePrice(base,seller,target));assert.ok(aiSalePrice(base,seller,poor)<aiSalePrice(base,seller,target));
});
test('offer follow-ups stop before later player decisions and later fixtures',()=>{
  const own=me.players.find(p=>p.name.includes('Leoni'));
  let s=listPlayerForSale(agreement(base),own.id);
  s={...s,saleFollowUps:[{id:'earlier',playerId:own.id,date:'2026-08-16'}]};
  const first=prepareNextFixture(s);assert.equal(first.currentDate,'2026-08-16');assert.equal(first.market.talks.length,1);assert.equal(first.marketNotice,null);
  const second=prepareNextFixture(first);assert.equal(second.currentDate,'2026-08-17');assert.equal(second.marketNotice.status,'contract-ready');
});
test('real AI injuries drive January cover, survive saves and recover by fixtures',()=>{
  const p=seller.players.filter(p=>p.group==='MID').sort((a,b)=>b.ovr-a.ovr)[0];
  let s=applyPerformanceUpdates(base,[{clubId:seller.id,ratings:[],injuries:[{playerId:p.id,name:p.name,matches:6,severity:'severe'}]}],false);
  assert.equal(s.worldInjuries[p.id].matches,6);
  assert.ok(!aiMatchPlayers(s,seller).some(x=>x.id===p.id));
  assert.ok(recruitmentNeeds(s,seller,'2027-01-01').some(n=>n.priority>=95));
  s=validateSave(JSON.parse(exportGame(s)));assert.equal(s.worldInjuries[p.id].clubId,seller.id);
  for(let i=0;i<6;i++)s=applyPerformanceUpdates(s,[{clubId:seller.id,ratings:[]}],false);
  assert.equal(s.worldInjuries[p.id],undefined);
});
test('injuries follow transferred players instead of vanishing at confirmation',()=>{
  const s={...agreement(base),worldInjuries:{[target.id]:{clubId:seller.id,name:target.name,matches:5,severity:'severe'}}};
  const ready=advanceTransferCalendar(s,'2026-08-17').state,talk=ready.market.talks[0];
  const signed=negotiatePlayerContract(ready,{talkId:talk.id,...talk.demands}).state;
  assert.equal(signed.injuries[target.id].matches,5);assert.equal(signed.worldInjuries[target.id],undefined);
  assert.ok(unavailablePlayerIds(signed).includes(target.id));
});
test('world football is advanced in date order before that date’s recruitment and stops before later days',()=>{
  const visited=[];
  const s=agreement(base);
  const result=advanceTransferCalendar(s,'2026-08-20',{advanceWorld:(state,date)=>{visited.push(date);return state;}});
  assert.equal(result.date,'2026-08-17');assert.deepEqual(visited,['2026-08-15','2026-08-16','2026-08-17']);
});
test('deadline agreements resolve that day without repeating the AI tick',()=>{
  const deadlineState={...base,currentDate:'2026-09-01',market:{version:1,lastDate:'2026-09-01',talks:[],history:[]}};
  const s=agreement(deadlineState);assert.equal(s.market.talks[0].dueDate,'2026-09-01');
  const result=advanceTransferCalendar(s,'2026-09-01');assert.equal(result.date,'2026-09-01');assert.equal(result.state.marketNotice.status,'contract-ready');
});
test('window recruitment limits persist even when the recent-decisions feed is pruned',()=>{
  const s=ensureMarket({...base,season:2,currentDate:'2027-07-01',market:null});
  s.market.activity={key:'2027-summer',signingsByClub:Object.fromEntries(allClubs(s).filter(c=>c.id!==s.myClubId).map(c=>[c.id,3])),movedPlayerIds:[]};
  const next=marketDay(s,'2027-07-04').state;
  assert.equal(next.market.talks.length,0);
  const restored=validateSave(JSON.parse(exportGame(next)));assert.deepEqual(restored.market.activity,s.market.activity);
});
