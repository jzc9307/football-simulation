import test from 'node:test';
import assert from 'node:assert/strict';
import { createSaveRepository, indexedDBRecords } from '../src/game/browserStorage.js';
import { freshState } from '../src/game/engine.js';
import { exportGame, validateSave } from '../src/game/storage.js';
import { deadlineActive } from '../src/game/deadlineDay.js';

const primary='football-manager-save-v1',oldKey='pl-manager-save-v8';
function memory(entries=[]){const map=new Map(entries);return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),removeItem:key=>map.delete(key)};}
function disk(initial=[]){let data=initial;return {read:async()=>data,write:async(current,previous)=>{data=[current,previous].filter(Boolean);}};}
const fresh=freshState(),old={...fresh,season:4,budget:77,history:[{note:'old career'}]};

test('fresh and restarted careers have no deadline day before a club is chosen',async()=>{
  assert.equal(deadlineActive(fresh),false);
  assert.equal(deadlineActive({...fresh,currentDate:'2026-08-01'}),false);
  const repo=createSaveRepository({records:disk(),legacy:memory()});
  await repo.reset(fresh);
  assert.equal(deadlineActive((await repo.load()).state),false);
  assert.equal(deadlineActive({currentDate:'2026-09-01',deadlineDay:{date:'2026-09-01',closed:false}}),true);
  assert.equal(deadlineActive({currentDate:'2026-09-01',deadlineDay:{date:'2026-09-01',closed:true}}),false);
});
test('confirmed restart replaces both career snapshots and only the game legacy keys',async()=>{
  const json=exportGame(old,false,Date.now()+60000),records=disk([json,json]),legacy=memory([[primary,json],[oldKey,json],['unrelated','keep']]);
  const repo=createSaveRepository({records,legacy});await repo.load();await repo.reset(fresh);
  const snapshots=await records.read();assert.equal(snapshots.length,1);
  assert.equal(legacy.getItem(oldKey),null);assert.equal(legacy.getItem('unrelated'),'keep');
  assert.equal(validateSave(JSON.parse(legacy.getItem(primary))).stage,'league-select');
  const loaded=await createSaveRepository({records,legacy}).load();
  assert.equal(loaded.state.season,1);assert.equal(loaded.state.stage,'league-select');assert.equal(loaded.state.myClubId,null);
  assert.deepEqual(loaded.state.history,[]);assert.ok(JSON.parse(snapshots[0]).savedAt>JSON.parse(json).savedAt);
});
test('an in-flight old save finishes before reset; queued old autosaves never resurrect it',async()=>{
  let release,started;
  const ready=new Promise(resolve=>{started=resolve;}),records=disk(),write=records.write;
  records.write=async(current,previous)=>{if(JSON.parse(current).state.budget===77){started();await new Promise(resolve=>{release=resolve;});}await write(current,previous);};
  const repo=createSaveRepository({records,legacy:memory()});await repo.load();
  const first=repo.save(old);await ready;
  const queued=repo.save({...old,budget:88}),reset=repo.reset(fresh);
  assert.equal(repo.reset(fresh),reset);
  await assert.rejects(repo.save(old),/new career/);release();await Promise.all([first,queued,reset]);
  assert.equal((await repo.load()).state.stage,'league-select');assert.equal((await records.read()).length,1);
  await repo.save({...fresh,budget:19});assert.equal((await repo.load()).state.budget,19);
});
test('restart uses local fallback when IndexedDB is unavailable and cannot recover the old career',async()=>{
  const json=exportGame(old,false,Date.now()+60000),records={read:async()=>[json],write:async()=>{throw Error('unavailable');}},legacy=memory([[primary,json],[oldKey,json]]);
  const repo=createSaveRepository({records,legacy});await repo.load();await repo.reset(fresh);
  assert.equal((await createSaveRepository({records,legacy}).load()).state.stage,'league-select');
});
test('failed restart leaves the existing durable career recoverable; retry can succeed',async()=>{
  const json=exportGame(old,false),records=disk([json]);let blocked=true;
  const write=records.write;records.write=async(...args)=>{if(blocked)throw Error('disk full');return write(...args);};
  const legacy={getItem:()=>null,setItem:()=>{throw Error('quota full');}};
  const repo=createSaveRepository({records,legacy});await repo.load();
  await assert.rejects(repo.reset(fresh),/disk full/);assert.equal((await repo.load()).state.budget,77);
  blocked=false;await repo.reset(fresh);assert.equal((await repo.load()).state.stage,'league-select');
});
test('IndexedDB reset deletes previous in the same transaction as writing current',async()=>{
  const data=new Map([['current','old'],['previous','old backup']]);let request;
  const db={transaction(){const tx={objectStore:()=>({put:(value,key)=>data.set(key,value),delete:key=>data.delete(key)})};queueMicrotask(()=>tx.oncomplete());return tx;}};
  const indexedDB={open(){request={};queueMicrotask(()=>{request.result=db;request.onsuccess();});return request;}};
  await indexedDBRecords(indexedDB).write('new',null);
  assert.deepEqual([...data],[['current','new']]);
});
