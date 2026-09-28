import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,autoLineup,ensureFixtures} from '../src/game/engine.js';
import {FORMATIONS} from '../src/game/config.js';
import {allClubs,marketOpen,listPlayerForSale,respondToSaleOffer,counterSaleOffer,advanceSaleOffers,repairSaleOffers,evaluateOffer,transferTerms} from '../src/game/career.js';
import {prepareNextFixture} from '../src/game/seasonFlow.js';
import {isMyFixture,nextFixture} from '../src/game/seasonSchedule.js';
import {saveGame,loadGame} from '../src/game/storage.js';
import {advanceTransferCalendar} from '../src/game/market.js';
function game(){
  let s=freshState();const me=s.plClubs.find(c=>c.id==='liv');
  s={...s,league:'PL',clubs:s.plClubs,myClubId:me.id,budget:me.budget,formation:me.preferredFormation,stage:'squad',simMode:'match',currentDate:'2026-08-01',scheduleMigrationDone:true};
  s.lineup=autoLineup(FORMATIONS[s.formation],me.players);return ensureFixtures(s);
}
const base=game(),me=base.clubs.find(c=>c.id==='liv');
const player=me.players.find(p=>p.name.includes('Leoni'))||me.players.at(-1);
test('2026 deadline includes September 1; browsing cannot reopen it after September 2',()=>{
  for(const stage of ['squad','squad2','matchday-prep','calendar-event']){
    assert.equal(marketOpen({...base,stage,currentDate:'2026-08-31'}),true);
    assert.equal(marketOpen({...base,stage,currentDate:'2026-09-01'}),true);
    assert.equal(marketOpen({...base,stage,currentDate:'2026-09-02'}),false);
    assert.equal(marketOpen({...base,stage,currentDate:'2027-01-10'}),true);
    assert.equal(marketOpen({...base,stage,currentDate:'2027-02-01'}),false);
  }
});
test('listing and rejecting leave player usable, lineup and funds unchanged',()=>{
  const s=listPlayerForSale(base,player.id);assert.ok(s.saleOffers.length);
  assert.deepEqual(s.lineup,base.lineup);assert.equal(s.budget,base.budget);
  assert.equal(s.clubs.find(c=>c.id==='liv').players.length,me.players.length);
  const next=respondToSaleOffer(s,s.saleOffers[0].id,'reject');
  assert.ok(next.saleListings.includes(player.id));assert.ok(next.saleFollowUps.length);
  assert.equal(listPlayerForSale(next,player.id),next);
});
test('decimal negotiated sale conserves money, moves exactly one player, clears other bids',()=>{
  const s=listPlayerForSale(base,player.id),offer=s.saleOffers[0];
  const fee=Math.round(offer.amount*10-1)/10;
  const before=allClubs(s).find(c=>c.id===offer.buyerId);
  const agreement=counterSaleOffer(s,{offerId:offer.id,ask:fee});assert.equal(agreement.status,'accepted');
  assert.equal(agreement.state.budget,base.budget);assert.ok(agreement.state.clubs.find(c=>c.id==='liv').players.some(p=>p.id===player.id));
  const talk=agreement.state.market.talks[0],result={state:advanceTransferCalendar(agreement.state,talk.dueDate).state};
  const after=allClubs(result.state).find(c=>c.id===offer.buyerId);
  assert.equal(result.state.budget,base.budget+fee);assert.equal(after.budget,before.budget-fee);
  assert.equal(after.players.filter(p=>p.id===player.id).length,1);
  assert.ok(!result.state.clubs.find(c=>c.id==='liv').players.some(p=>p.id===player.id));
  assert.ok(!result.state.saleListings.includes(player.id));assert.equal(result.state.saleFollowUps.filter(e=>e.playerId===player.id).length,0);
});
test('counter offers remain within three rounds, have a stable ceiling, and can be ended',()=>{
  let s=listPlayerForSale(base,player.id);let o=s.saleOffers[0];const ceiling=o.maxFee;
  for(let i=0;i<3;i++){
    const r=counterSaleOffer(s,{offerId:o.id,ask:Math.round(ceiling*1.3*10)/10});s=r.state;
    if(i===2){assert.equal(r.status,'withdrawn');break;}
    assert.equal(r.status,'counter');o=s.saleOffers[0];assert.equal(o.round,i+2);assert.ok(o.amount<=ceiling);assert.equal(o.maxFee,ceiling);
  }
  assert.ok(s.saleListings.includes(player.id));
});
test('high-rated players do not receive low-level, unfunded approaches',()=>{
  const alisson=me.players.find(p=>p.name.includes('Alisson'));
  const s=listPlayerForSale(base,alisson.id);
  for(const o of s.saleOffers){const c=allClubs(s).find(c=>c.id===o.buyerId);assert.ok(!c.name.includes('Torreense'));assert.ok(c.budget>=o.amount);assert.ok(o.maxFee<=c.budget*.8);}
  const bad={id:'bad',playerId:alisson.id,buyerId:allClubs(s).find(c=>c.name.includes('Torreense')).id,amount:50,status:'pending'};
  assert.ok(!repairSaleOffers({...s,saleOffers:[bad]}).saleOffers.length);
});
test('calendar stops at the first offer day, keeps later events queued, and save reload works',()=>{
  const s=listPlayerForSale(base,player.id),r=advanceSaleOffers(s,'2026-08-12');
  assert.equal(r.date,'2026-08-04');assert.ok(r.state.saleFollowUps.some(e=>e.date==='2026-08-08'));
  const next=prepareNextFixture(s);assert.equal(next.stage,'calendar-event');assert.equal(next.currentDate,'2026-08-04');
  assert.ok(nextFixture(next).date>next.currentDate);
  assert.ok(!next.seasonSchedule.some(e=>e.status==='played'&&e.date>next.currentDate&&!isMyFixture(next,e)));
  const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
  saveGame(storage,next);const restored=loadGame(storage);assert.equal(restored.stage,'calendar-event');assert.equal(restored.currentDate,next.currentDate);
});
test('offers do not arrive outside the window and invalid prices cannot complete a sale',()=>{
  const s=listPlayerForSale(base,player.id),o=s.saleOffers[0];
  assert.throws(()=>counterSaleOffer(s,{offerId:o.id,ask:NaN}),/valid transfer fee/);
  assert.throws(()=>respondToSaleOffer({...s,currentDate:'2026-09-02'},o.id,'accept'),/closed/);
  const r=advanceSaleOffers({...s,saleFollowUps:[{id:'closed',playerId:player.id,date:'2026-09-02'}]},'2026-09-02');assert.equal(r.arrived,false);
});
test('buying evaluates the exact decimal fee displayed by the shared slider',()=>{
  const seller=allClubs(base).find(c=>c.name.includes('Bayern'));
  const target=seller.players.find(p=>p.name.includes('Díaz'));
  const terms=transferTerms(base,seller.id,target.id);
  const fee=terms.askingPrice+.1;
  const r=evaluateOffer(base,{sellerId:seller.id,playerId:target.id,offer:fee});
  assert.equal(r.status,'accepted');assert.equal(r.fee,fee);
});
