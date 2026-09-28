import test from 'node:test';
import assert from 'node:assert/strict';
import { lockPageScroll } from '../src/components/pageScroll.js';
import { createSaveRepository } from '../src/game/browserStorage.js';
import { exportGame, validateSave } from '../src/game/storage.js';
import { freshState, autoLineup, ensureFixtures, myTactics, unavailablePlayerIds, simMatchSmart } from '../src/game/engine.js';
import { FORMATIONS } from '../src/game/config.js';
import { squadGroups, moveToSquadGroup } from '../src/game/squadSelection.js';
import { enterMidSeasonWindow, refreshInstantLineup, simulateScheduledHalfAsync } from '../src/game/seasonFlow.js';
import { marketOpen, listPlayerForSale } from '../src/game/career.js';

function game(){
  const s=freshState(),club=s.plClubs.find(c=>c.id==='ars');
  return ensureFixtures({...s,league:'PL',clubs:s.plClubs,myClubId:club.id,budget:club.budget,formation:club.preferredFormation,
    lineup:autoLineup(FORMATIONS[club.preferredFormation],club.players),stage:'squad',simMode:'half',currentDate:'2026-08-15'});
}
const base=game(),club=base.clubs.find(c=>c.id===base.myClubId);
const memory=()=>{const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};};
function records(initial=[]){let data=initial;return {read:async()=>data,write:async(current,previous)=>{data=[current,previous].filter(Boolean);}};}

test('nested scroll locks release safely in either close order, including repeat cleanup',()=>{
  for(const reverse of [true,false]){
    const doc={body:{style:{overflow:'auto'}}},a=lockPageScroll(doc),b=lockPageScroll(doc);
    (reverse?a:b)();assert.equal(doc.body.style.overflow,'hidden');
    (reverse?b:a)();assert.equal(doc.body.style.overflow,'auto');a();b();
    const c=lockPageScroll(doc);c();assert.equal(doc.body.style.overflow,'auto');
  }
});
test('large careers survive localStorage quota limits and preserve the legacy save',async()=>{
  const old=exportGame(base,false),legacy={getItem:key=>key==='football-manager-save-v1'?old:null,setItem:()=>{throw new Error('quota full');}};
  const disk=records(),repo=createSaveRepository({records:disk,legacy});await repo.load();
  const state={...base,history:[{note:'season archive '.repeat(430000)}],budget:123};
  await repo.save(state);
  const loaded=await createSaveRepository({records:disk,legacy}).load();
  assert.equal(loaded.state.budget,123);assert.equal(loaded.state.history[0].note.length,state.history[0].note.length);
  assert.equal(legacy.getItem('football-manager-save-v1'),old);
});
test('failed writes retain the last snapshot; corrupted current snapshot recovers its backup',async()=>{
  const legacy=memory(),disk=records(),repo=createSaveRepository({records:disk,legacy});
  await repo.load();await repo.save(base);await repo.save({...base,budget:120});
  const snapshots=await disk.read();const bad=records(['{bad json',snapshots[1]]);
  const recovered=await createSaveRepository({records:bad,legacy}).load();assert.equal(recovered.state.budget,base.budget);assert.ok(recovered.recovered);
  const broken={read:disk.read,write:async()=>{throw Error('disk full');}},noSpace={getItem:()=>null,setItem:()=>{throw Error('quota full');}};
  const failing=createSaveRepository({records:broken,legacy:noSpace});await failing.load();await assert.rejects(failing.save({...base,budget:1}),/disk full/);
  assert.equal((await createSaveRepository({records:disk,legacy}).load()).state.budget,120);
  await assert.rejects(createSaveRepository({records:records(['bad']),legacy:memory()}).load());
});
test('local fallback newer than IndexedDB wins, and queued writes cannot overtake one another',async()=>{
  const legacy=memory(),disk=records([exportGame(base,false,1)]),repo=createSaveRepository({records:disk,legacy});
  await repo.load();await Promise.all([repo.save({...base,budget:100}),repo.save({...base,budget:200})]);
  assert.equal((await repo.load()).state.budget,200);
  const failed=createSaveRepository({records:{read:disk.read,write:async()=>{throw Error('blocked');}},legacy});
  await failed.load();await failed.save({...base,budget:333});
  assert.equal((await createSaveRepository({records:disk,legacy}).load()).state.budget,333);
});
test('explicit bench moves persist and the match engine uses exactly that bench',()=>{
  let groups=squadGroups(club.players,base.lineup),s=base;
  assert.equal(groups.bench.length,9);assert.equal(groups.bench.filter(p=>p.role==='GK').length,1);
  const benched=groups.bench[0];s=moveToSquadGroup(s,benched.id,'available');
  assert.ok(squadGroups(club.players,s.lineup,new Set(),s.benchSelection).available.some(p=>p.id===benched.id));
  assert.ok(!myTactics(s).bench.some(p=>p.id===benched.id));
  s=moveToSquadGroup(s,benched.id,'bench');assert.ok(myTactics(s).bench.some(p=>p.id===benched.id));
  const starter=groups.starting[0];s=moveToSquadGroup(s,starter.id,'bench');
  assert.ok(!Object.values(s.lineup).includes(starter.id));assert.equal(myTactics(s).bench.length,9);
  assert.ok(myTactics(s).bench.some(p=>p.id===starter.id));
  const restored=validateSave(JSON.parse(exportGame(s,false)));assert.deepEqual(restored.benchSelection,s.benchSelection);
});
test('instant XI restores a recovered best player but never selects suspended or injured players',()=>{
  const best=Object.values(base.lineup)[0];
  let s=refreshInstantLineup({...base,suspensions:{domestic:[best],ucl:[]}});
  assert.ok(!Object.values(s.lineup).includes(best));
  s=refreshInstantLineup({...s,suspensions:{domestic:[],ucl:[]}});assert.ok(Object.values(s.lineup).includes(best));
  s=refreshInstantLineup({...s,injuries:{[best]:{name:'test',matches:2}}});assert.ok(!Object.values(s.lineup).includes(best));
  assert.ok(!Object.values(s.lineup).some(id=>unavailablePlayerIds(s).includes(id)));
});
test('January preparation enables selling without reopening the autumn closed window',()=>{
  const s=enterMidSeasonWindow({...base,currentDate:'2026-12-27',stage:'half-results'});
  assert.equal(s.currentDate,'2027-01-01');assert.ok(marketOpen(s));
  assert.ok(listPlayerForSale(s,club.players[0].id).saleListings.includes(club.players[0].id));
  assert.ok(!marketOpen({...s,currentDate:'2027-02-01'}));assert.ok(!marketOpen({...s,currentDate:'2026-09-02'}));
});
test('substitution events provide distinct on/off names for the live ribbon',()=>{
  const starters=club.players.filter(p=>Object.values(base.lineup).includes(p.id)).map(p=>({...p,energy:45}));
  const tac={...myTactics(base),style:'gegen',autoSubs:true};
  const match=simMatchSmart(starters,starters,false,tac,tac,()=>.55);
  const events=match.match.events.filter(e=>e.type==='sub');assert.ok(events.length);
  for(const event of events){assert.ok(event.inName);assert.ok(event.outName);assert.notEqual(event.playerId,event.outId);}
});
test('instant simulation yields between fixtures and returns a complete eligible team',async()=>{
  let yields=0;
  let s=base;for(let guard=0;guard<80;guard++){s=await simulateScheduledHalfAsync(s,1,{yieldControl:async()=>{yields++;}});if(s.stage!=='calendar-event')break;}
  assert.equal(s.stage,'half-results');assert.equal(s.results1.length,19);assert.ok(yields>=19);
  assert.equal(Object.values(s.lineup).length,11);assert.ok(!Object.values(s.lineup).some(id=>unavailablePlayerIds(s).includes(id)));
  assert.deepEqual(s.lineup,refreshInstantLineup(s).lineup);
});
