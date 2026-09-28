import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, autoLineup, applyPerformanceUpdates, simMatchSmart, aiTactics, topXI, performanceUpdatesForMatch } from '../src/game/engine.js';
import { FORMATIONS } from '../src/game/config.js';
import { allClubs, commitClubs, transferTerms, respondToSaleOffer, clubQuality } from '../src/game/career.js';
import { agreeTransferFee, advanceTransferCalendar, negotiatePlayerContract, ensureMarket, playerChoiceScore, recruitmentNeeds } from '../src/game/market.js';
import { initialPlayerLife, recordPlayerMinutes, recoverPlayerDays, advancePlayerLife, contractMonths, agentTerms, negotiateRenewal, archivePlayerSeason, playerPentagon } from '../src/game/playerLife.js';
import { reservedBudget, money, cash, contractFunding } from '../src/game/finance.js';
import { acknowledgedCareer } from './careerFixture.mjs';
import { exportGame, validateSave } from '../src/game/storage.js';
import { CONTRACT_DATA_META } from '../src/data/contractsFc26.js';

function game(id='liv'){
  const s=freshState(),me=s.plClubs.find(c=>c.id===id);
  return acknowledgedCareer({...s,league:'PL',myClubId:id,budget:me.budget,formation:me.preferredFormation,lineup:autoLineup(FORMATIONS[me.preferredFormation],me.players),currentDate:'2026-08-15',stage:'squad',seasonSchedule:[],scheduleMigrationDone:true});
}
const player=(s,id)=>allClubs(s).flatMap(c=>c.players).find(p=>p.id===id);
const owner=(s,id)=>allClubs(s).find(c=>c.players.some(p=>p.id===id));
function buying(){
  let s=game();s=commitClubs(s,allClubs(s).map(c=>c.id==='liv'?{...c,players:c.players.filter(p=>!p.name.includes('Woodman'))}:c));
  const seller=allClubs(s).find(c=>c.name.includes('Bayern')),p=seller.players.find(p=>p.name.includes('Díaz'));
  const fee=transferTerms(s,seller.id,p.id).askingPrice;
  s=agreeTransferFee(s,{sellerId:seller.id,playerId:p.id,fee});
  return {state:advanceTransferCalendar(s,s.market.talks[0].dueDate).state,p,fee,seller};
}

test('source terms are attributed, wages are GBP weekly, and unknown records never pretend to be real',()=>{
  const s=game('ars'),jesus=s.clubs.find(c=>c.id==='ars').players.find(p=>p.slug==='gabriel-fernando-de-jesus');
  assert.equal(jesus.contract.endDate,'2027-06-30');assert.equal(jesus.contract.wage,78000);assert.equal(jesus.contract.source,'futwiz-fc26');
  assert.match(jesus.contract.sourceUrl,/gabriel-jesus\/7575/);assert.ok(CONTRACT_DATA_META.matched>=5182);
  const unknown=initialPlayerLife({id:'unknown',slug:'no-source-match',ovr:77,age:22,role:'CM'});
  assert.ok(unknown.contract.wage>0);assert.match(unknown.contract.endDate,/^202[89]-06-30$/);assert.equal(unknown.contract.source,'estimated');assert.equal(unknown.contract.sourceUrl,undefined);
  const haaland=allClubs(s).flatMap(c=>c.players).find(p=>p.slug==='erling-braut-haland');
  assert.equal(haaland.contract.endDate,'2034-06-30');assert.equal(haaland.contract.wage,210000);
});
test('buying stops on player choice, funds weekly wages once and persists before signature',()=>{
  const {state,p,fee,seller}=buying(),before=state.budget;
  assert.equal(state.market.talks[0].phase,'contract-ready');assert.equal(owner(state,p.id).id,seller.id);
  const reloaded=validateSave(JSON.parse(exportGame(state))),talk=reloaded.market.talks[0];
  assert.equal(reservedBudget(reloaded),fee);assert.equal(advanceTransferCalendar(reloaded,'2026-08-25').state.currentDate,reloaded.currentDate);
  const result=negotiatePlayerContract(reloaded,{talkId:talk.id,...talk.demands});
  const allocation=contractFunding(reloaded,p,talk.demands.wage,true).change;
  assert.equal(result.status,'accepted');assert.equal(owner(result.state,p.id).id,'liv');assert.equal(result.state.budget,cash(before-fee-allocation/1000000));
  assert.equal(reservedBudget(result.state),0);assert.equal(player(result.state,p.id).contract.wage,talk.demands.wage);
  assert.ok(!result.state.marketNotices.some(n=>n.talkId===talk.id));assert.equal(result.state.marketNotice,null);
  const later=advancePlayerLife(result.state,'2026-08-30').state;assert.equal(later.budget,result.state.budget);
  assert.throws(()=>negotiatePlayerContract(result.state,{talkId:talk.id,...talk.demands}),/no longer/);
});
test('three personal-talk rounds counter unsuitable terms then release the entire reservation',()=>{
  let {state,p,seller}=buying();const id=state.market.talks[0].id;
  for(let round=1;round<=3;round++){
    const t=state.market.talks[0],offer={...t.demands,role:'prospect',wage:Math.round(t.demands.wage*.8/500)*500};
    const r=negotiatePlayerContract(state,{talkId:id,...offer});state=r.state;
    assert.equal(r.status,round===3?'rejected':'counter');
    if(round<3){assert.equal(state.market.talks[0].round,round+1);state=validateSave(JSON.parse(exportGame(state)));}
  }
  assert.equal(reservedBudget(state),0);assert.equal(owner(state,p.id).id,seller.id);assert.equal(state.budget,game().budget);
});
test('two accepted selling fees wait 1–3 days; the player chooses once and only the winner pays',()=>{
  let s=ensureMarket(game()),me=allClubs(s).find(c=>c.id==='liv'),p=me.players.find(p=>p.name.includes('Leoni'));
  const buyers=allClubs(s).filter(c=>['man','mun'].includes(c.id)),offers=buyers.map((c,i)=>({id:`competing-${i}`,playerId:p.id,playerName:p.name,buyerId:c.id,amount:3+i*.1,maxFee:5,date:s.currentDate,round:1,status:'pending',kind:'sale'}));
  s={...s,saleListings:[p.id],saleOffers:offers};const before=s.budget,balances=new Map(buyers.map(c=>[c.id,c.budget]));
  for(const o of offers)s=respondToSaleOffer(s,o.id,'accept');
  assert.equal(s.market.talks.length,2);assert.equal(owner(s,p.id).id,'liv');assert.equal(s.budget,before);
  const due=s.market.talks[0].dueDate;assert.ok(due>='2026-08-16'&&due<='2026-08-18');assert.ok(s.market.talks.every(t=>t.dueDate===due));
  s=validateSave(JSON.parse(exportGame(s)));s=advanceTransferCalendar(s,due).state;
  const signed=s.market.history.find(t=>t.playerId===p.id&&t.status==='signed');assert.ok(signed);
  assert.equal(owner(s,p.id).id,signed.buyerId);assert.equal(s.budget,money(before+signed.fee));
  for(const c of buyers)assert.equal(allClubs(s).find(x=>x.id===c.id).budget,money(balances.get(c.id)-(signed.buyerId===c.id?signed.fee:0)));
  assert.equal(s.market.history.filter(t=>t.playerId===p.id&&t.status==='signed').length,1);
  assert.equal(s.market.talks.filter(t=>t.playerId===p.id).length,0);assert.equal(s.saleOffers.length,0);
});
test('renewals open in final two years, use agent counters and cannot repeat immediately',()=>{
  let s=game('ars'),me=allClubs(s).find(c=>c.id==='ars'),p=me.players.find(p=>p.slug==='gabriel-fernando-de-jesus'),long=me.players.find(p=>contractMonths(p,s.currentDate)>24);
  assert.throws(()=>negotiateRenewal(s,long.id,agentTerms(long,clubQuality(me),s.currentDate)),/final two years/);
  const offer=agentTerms(p,clubQuality(me),s.currentDate),before=s.budget;
  let r=negotiateRenewal(s,p.id,{...offer,wage:Math.round(offer.wage*.8/500)*500});assert.equal(r.status,'counter');
  s=validateSave(JSON.parse(exportGame(r.state)));r=negotiateRenewal(s,p.id,s.renewalTalks[p.id].demands);
  const allocation=contractFunding(s,p,s.renewalTalks[p.id].demands.wage).change;
  assert.equal(r.status,'accepted');assert.equal(r.state.budget,cash(before-allocation/1000000));assert.equal(player(r.state,p.id).contract.source,'career');
  assert.throws(()=>negotiateRenewal(r.state,p.id,offer),/just signed/);
});
test('underplaying hurts happiness/sharpness; injury absence does not; playing uses energy, not sharpness',()=>{
  let p=initialPlayerLife({id:'example',slug:'example',ovr:86,age:24,role:'CM',condition:100,energy:100,stamina:80},80);
  const original=p;
  p=recordPlayerMinutes(p,0,'2026-08-15',80);assert.equal(p.condition,100);
  p=recordPlayerMinutes(p,0,'2026-08-18',80);assert.equal(p.condition,97);
  for(let i=0;i<10;i++)p=recordPlayerMinutes(p,0,'2026-08-21',80);
  assert.equal(p.life.status,'wants-move');assert.ok(p.life.happiness<35);
  assert.deepEqual(recordPlayerMinutes(original,0,'2026-08-18',80,false),original);
  const active=recordPlayerMinutes({...p,condition:80},90,'2026-08-24',80);assert.ok(active.condition>80);
  const rested=recoverPlayerDays({...active,energy:60},'2026-08-27');assert.ok(rested.energy>60&&rested.energy<100);assert.equal(rested.condition,active.condition);
});
test('both clubs share real fatigue updates and make at most five substitutions from a nine-player bench',()=>{
  let s=game('ars');const a=s.clubs.find(c=>c.id==='ars'),b=s.clubs.find(c=>c.id==='liv');
  const tired=c=>({...c,players:c.players.map(p=>({...p,energy:45}))});
  s=commitClubs(s,allClubs(s).map(c=>['ars','liv'].includes(c.id)?tired(c):c));
  const aa=allClubs(s).find(c=>c.id===a.id),bb=allClubs(s).find(c=>c.id===b.id),ta={...aiTactics(aa,s),style:'gegen'},tb={...aiTactics(bb,s),style:'gegen'};
  assert.equal(ta.bench.length,9);assert.equal(tb.bench.length,9);
  const sim=simMatchSmart(topXI(aa.players,aa.preferredFormation),topXI(bb.players,bb.preferredFormation),false,ta,tb,()=>.55);
  for(const side of [0,1]){const subs=sim.match.events.filter(e=>e.type==='sub'&&e.side===side);assert.ok(subs.length>0&&subs.length<=5);assert.equal(new Set(subs.map(e=>e.playerId)).size,subs.length);}
  s=applyPerformanceUpdates(s,performanceUpdatesForMatch(sim,a.id,b.id));
  for(const id of [a.id,b.id]){
    const c=allClubs(s).find(c=>c.id===id),starter=c.players.find(p=>p.ratedMatches&&p.seasonMinutes>=80);assert.ok(starter.energy<45);assert.equal(starter.condition,100);
    assert.equal(s.plClubs.find(c=>c.id===id).players.find(p=>p.id===starter.id).energy,starter.energy);
  }
});
test('AI short deals cannot compound wage demands every calendar day; expiry removes players once',()=>{
  let s=game('ars'),p=allClubs(s).find(c=>c.id==='liv').players.find(p=>p.age>=33);
  s=commitClubs(s,allClubs(s).map(c=>c.id==='liv'?{...c,players:c.players.map(x=>x.id===p.id?{...x,contract:{...x.contract,endDate:'2027-06-30',wage:100000},life:{...x.life,happiness:90}}:x)}:c));
  s=advancePlayerLife(s,'2026-08-16').state;const wage=player(s,p.id).contract.wage;
  for(let d=17;d<=30;d++)s=advancePlayerLife(s,`2026-08-${d}`).state;
  assert.equal(player(s,p.id).contract.wage,wage);
  const own=allClubs(s).find(c=>c.id==='ars').players[0];
  s=commitClubs(s,allClubs(s).map(c=>c.id==='ars'?{...c,players:c.players.map(x=>x.id===own.id?{...x,contract:{...x.contract,endDate:'2026-08-30'}}:x)}:c));
  const expired=advancePlayerLife(s,'2026-08-31');assert.equal(expired.arrived,true);assert.ok(!player(expired.state,own.id));assert.ok(expired.state.freeAgents.some(x=>x.id===own.id));
  const again=advancePlayerLife(expired.state,'2026-08-31');assert.equal(again.arrived,false);assert.equal(again.state.freeAgents.filter(x=>x.id===own.id).length,1);
});
test('star upgrades are real needs, while players value promised playing time in their choice',()=>{
  const s=game(),city=allClubs(s).find(c=>c.id==='man');assert.ok(recruitmentNeeds(s,city,'2027-07-01').some(n=>n.priority>=80&&n.target>=84));
  const star={...city.players.find(p=>p.role==='CM'),ovr:87};
  const weak={...city,players:city.players.map(p=>({...p,ovr:75}))},blocked={...city,players:city.players.map(p=>p.role==='CM'?{...p,ovr:95}:p)};
  assert.ok(playerChoiceScore(s,weak,star)>playerChoiceScore(s,blocked,star));
});
test('ambitious young stars can refuse a much weaker club even when the club fee was accepted',()=>{
  let s=game();s=commitClubs(s,allClubs(s).map(c=>c.id==='liv'?{...c,budget:500,players:c.players.filter(p=>!p.name.includes('Woodman')).map(p=>({...p,ovr:55}))}:c));s={...s,budget:500};
  const seller=allClubs(s).find(c=>c.id==='man'),p=seller.players.find(p=>p.age<=25&&p.ovr>=85),fee=transferTerms(s,seller.id,p.id).askingPrice;
  s=agreeTransferFee(s,{sellerId:seller.id,playerId:p.id,fee});const due=s.market.talks[0].dueDate;s=advanceTransferCalendar(s,due).state;
  assert.equal(owner(s,p.id).id,seller.id);assert.equal(s.marketNotice.status,'failed');assert.equal(reservedBudget(s),0);assert.equal(s.budget,500);
});
test('career records contain simulated totals and archived keeper attributes have keeper labels',()=>{
  const p=game('ars').clubs.find(c=>c.id==='ars').players.find(p=>p.role==='GK'),stats={...p,ratedMatches:3,ratingTotal:22.5,seasonGoals:0,seasonAssists:1,bestRating:8.2};
  assert.equal(p.careerSeasons.length,0);const first=archivePlayerSeason(stats,'ars',1),again=archivePlayerSeason(first,'ars',1);
  assert.equal(again.careerSeasons.length,1);assert.equal(again.careerSeasons[0].ratingTotal/again.careerSeasons[0].ratedMatches,7.5);
  assert.deepEqual(playerPentagon(p).map(([l])=>l),['Handling','Reflexes','Kicking','Speed','Positioning']);
});
test('malformed personal terms are rejected on import instead of breaking the negotiation UI',()=>{
  const {state}=buying(),raw=JSON.parse(exportGame(state));raw.state.market.talks[0].demands.wage=-1;
  assert.throws(()=>validateSave(raw),/invalid personal contract talks/);
});
