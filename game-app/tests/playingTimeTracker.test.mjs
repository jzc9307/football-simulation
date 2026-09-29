import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, autoLineup, applyPerformanceUpdates } from '../src/game/engine.js';
import { FORMATIONS } from '../src/game/config.js';
import { allClubs, commitClubs, clubQuality, transfer } from '../src/game/career.js';
import { initialPlayerLife, recordPlayerMinutes, playingTimeReport, playingTimePolicy, isBackupGoalkeeper, ensurePlayerLife, roleReviewTerms, negotiateRenewal, agentTerms, evaluatePersonalTerms } from '../src/game/playerLife.js';
import { exportGame, validateSave } from '../src/game/storage.js';
import { acknowledgedCareer } from './careerFixture.mjs';

function game(){
  const s=freshState(),me=s.plClubs.find(c=>c.id==='liv');
  return acknowledgedCareer({...s,clubs:s.plClubs,league:'PL',myClubId:me.id,budget:me.budget,currentDate:'2026-08-15',stage:'squad',formation:me.preferredFormation,lineup:autoLineup(FORMATIONS[me.preferredFormation],me.players),seasonSchedule:[],scheduleMigrationDone:true});
}
const own=s=>allClubs(s).find(c=>c.id===s.myClubId);
const player=(s,id)=>allClubs(s).flatMap(c=>c.players).find(p=>p.id===id);
const change=(s,id,fn)=>commitClubs(s,allClubs(s).map(c=>({...c,players:c.players.map(p=>p.id===id?fn(p):p)})));
const matchDate=n=>new Date(Date.parse('2026-08-15T12:00:00Z')+n*7*86400000).toISOString().slice(0,10);
function example(role='starter',position='CM',ovr=78){
  const p=initialPlayerLife({id:`test-${position}`,slug:'test-unmatched',name:'Test Player',role:position,ovr,age:28,condition:100,energy:100},84);
  return {...p,contract:{...p.contract,role}};
}

test('tracker records starts, useful substitutes, cameos and eligible omissions without inventing involvement',()=>{
  let p=example();
  assert.equal(playingTimeReport(p).status,'Building a picture');
  for(const [i,minutes,started] of [[0,90,true],[1,30,false],[2,5,false],[3,0,false]])p=recordPlayerMinutes(p,minutes,matchDate(i),84,true,'W',{started});
  p=recordPlayerMinutes(p,0,matchDate(4),84,false,'W');
  const r=playingTimeReport(p);
  assert.equal(r.starts,1);assert.equal(r.substitutes,2);assert.equal(r.minutes,125);assert.equal(r.meaningful,2);
  assert.equal(r.threshold,28);assert.equal(r.matches.length,4);assert.equal(r.missed,2);assert.equal(r.days,7);
  assert.equal(r.injuryPaused,true);assert.equal(r.winning,true);assert.equal(r.warningReady,false);
  p=recordPlayerMinutes(p,30,matchDate(5),84,true,'W',{started:false});
  assert.equal(playingTimeReport(p).missed,0);assert.equal(playingTimeReport(p).days,0);
  for(let n=6;n<18;n++)p=recordPlayerMinutes(p,90,matchDate(n),84,true,'W',{started:true});
  assert.equal(playingTimeReport(p).matches.length,10);assert.equal(p.life.recentMinutes.length,8);
});

test('legacy careers retain recorded minutes but do not fabricate the missing start/sub split',()=>{
  let p=example('rotation');p={...p,life:{...p.life,recentMinutes:[90,0,20]}};
  let r=playingTimeReport(p);assert.equal(r.minutes,110);assert.equal(r.starts,null);assert.equal(r.substitutes,null);assert.equal(r.meaningful,2);
  p=recordPlayerMinutes(p,90,matchDate(0),84,true,'W',{started:true});
  assert.equal(playingTimeReport(p).matches.length,4);assert.equal(p.life.recentSelections[0].started,null);
  for(let n=1;n<=10;n++)p=recordPlayerMinutes(p,20,matchDate(n),84,true,'W',{started:false});
  r=playingTimeReport(p);assert.equal(r.unknown,false);assert.equal(r.starts,0);assert.equal(r.substitutes,10);
});

test('reserve goalkeeper patience is separate from a contract role; Key keepers retain their promise',()=>{
  const reserve=example('starter','GK',76),first={...reserve,id:'first',ovr:88},club={players:[first,reserve]};
  assert.equal(isBackupGoalkeeper(reserve,club),true);assert.equal(isBackupGoalkeeper(first,club),false);
  assert.equal(playingTimePolicy(reserve,club).warn,14);assert.equal(playingTimePolicy(reserve,club).requestDays,210);
  assert.equal(playingTimePolicy(first,club).warn,10);
  assert.equal(playingTimePolicy({...reserve,contract:{...reserve.contract,role:'key'}},club).warn,3);
  assert.equal(playingTimePolicy(example('starter'),club).backupKeeper,false);
  assert.equal(reserve.contract.role,'starter');
  let p=reserve;
  for(let n=0;n<12;n++)p=recordPlayerMinutes(p,0,matchDate(n),84,true,'L',{backupKeeper:true});
  assert.equal(p.life.complaintStage,0);assert.equal(p.life.happiness,72);
  p=recordPlayerMinutes(p,90,matchDate(12),84,true,'W',{backupKeeper:true,started:true});
  assert.equal(p.life.missedMatches,0);assert.equal(p.life.playingTimeDays,0);
  for(let n=13;n<100;n++)p=recordPlayerMinutes(p,0,matchDate(n),84,true,'L',{backupKeeper:true});
  assert.equal(p.life.transferRequested,true);assert.equal(playingTimeReport(p,club).requestReady,true);
  let prospect={...reserve,contract:{...reserve.contract,role:'prospect'}};
  for(let n=0;n<110;n++)prospect=recordPlayerMinutes(prospect,0,matchDate(n),84,true,'L',{backupKeeper:true});
  assert.equal(prospect.life.transferRequested,false);
});

test('real match updates propagate start minutes and goalkeeper depth to both canonical club squads',()=>{
  let s=game();const me=own(s),first=me.players.find(p=>p.role==='GK'),sub=me.players.find(p=>p.role==='CM'),ars=allClubs(s).find(c=>c.id==='ars');
  const rating=(p,start,minutes)=>({playerId:p.id,start,minutes,rating:7,goals:0,assists:0,yellow:0,red:false,confidenceDelta:0});
  s=applyPerformanceUpdates(s,[{clubId:'liv',result:'W',ratings:[rating(first,0,90),rating(sub,65,25)]},{clubId:'ars',result:'L',ratings:[rating(ars.players[0],0,90)]}]);
  assert.equal(player(s,first.id).life.recentSelections.at(-1).started,true);
  assert.equal(player(s,sub.id).life.recentSelections.at(-1).started,false);
  assert.equal(player(s,ars.players[0].id).life.recentSelections.at(-1).started,true);
  const backup=own(s).players.filter(p=>p.role==='GK').sort((a,b)=>b.ovr-a.ovr)[1];
  assert.equal(backup.life.backupKeeper,true);assert.equal(backup.life.recentSelections.at(-1).minutes,0);
  assert.deepEqual(s.plClubs.find(c=>c.id==='liv').players.find(p=>p.id===sub.id).life,player(s,sub.id).life);
});

test('version-five migration relaxes premature keeper complaints without undoing deliberate listings or approved moves',()=>{
  let s=game();const keeper=own(s).players.filter(p=>p.role==='GK').sort((a,b)=>a.ovr-b.ovr)[0];
  s=change(s,keeper.id,p=>({...p,contract:{...p.contract,role:'starter'},life:{...p.life,missedMatches:24,playingTimeDays:161,complaintStage:2,transferRequested:true,forcedTransferListing:true,happiness:20,reason:'Formally requested a transfer over playing time'}}));
  const legacy={...s,playerLifeVersion:4,saleListings:[keeper.id],mail:[{id:'old-keeper',type:'transfer-request',playerCard:{id:keeper.id}}]};
  const repaired=ensurePlayerLife(legacy);
  assert.equal(repaired.playerLifeVersion,5);assert.equal(player(repaired,keeper.id).life.transferRequested,false);assert.ok(!repaired.saleListings.includes(keeper.id));
  assert.equal(player(repaired,keeper.id).life.complaintStage,1);assert.equal(repaired.mail[0].concernResolved,true);
  const manual=ensurePlayerLife(change(legacy,keeper.id,p=>({...p,life:{...p.life,forcedTransferListing:false}})));
  assert.ok(manual.saleListings.includes(keeper.id));
  const agreed=ensurePlayerLife({...legacy,market:{talks:[{playerId:keeper.id,status:'pending'}]}});
  assert.equal(player(agreed,keeper.id).life.transferRequested,true);
});

function reviewPlayer(){
  let s=game(),p=own(s).players.find(p=>p.role!=='GK'&&p.ovr<78);
  s=change(s,p.id,x=>({...x,age:28,ovr:72,contract:{...x.contract,role:'starter',endDate:'2030-05-18',wage:14000,signedDate:'2025-07-01'},life:{...x.life,happiness:72,ambition:'balanced',recentMinutes:[0,0],recentSelections:[{minutes:0,started:false,date:'2026-08-01'},{minutes:0,started:false,date:'2026-08-08'}],missedMatches:12,playingTimeDays:80,complaintStage:1,promise:{kind:'renewal',status:'active',sourceMailId:'renew-test',date:'2026-08-01',deadline:'2026-08-31'}}}));
  return {s,p:player(s,p.id)};
}

test('agreed role amendment keeps the exact expiry, original signing date, minutes history and renewal promise',()=>{
  const {s,p}=reviewPlayer(),terms=roleReviewTerms(p,own(s),s.currentDate);
  assert.equal(terms.role,'rotation');assert.equal(terms.years,0);
  assert.throws(()=>negotiateRenewal(s,p.id,agentTerms(p,clubQuality(own(s)),s.currentDate)),/final two years/);
  const result=negotiateRenewal(s,p.id,terms),changed=player(result.state,p.id);
  assert.equal(result.status,'accepted');assert.equal(changed.contract.role,'rotation');assert.equal(changed.contract.endDate,'2030-05-18');
  assert.equal(changed.contract.signedDate,'2025-07-01');assert.equal(changed.contract.amendedDate,s.currentDate);assert.equal(changed.contract.source,'career');
  assert.equal(result.state.budget,s.budget);assert.equal(changed.life.missedMatches,12);assert.equal(changed.life.playingTimeDays,80);assert.equal(changed.life.complaintStage,0);
  assert.deepEqual(changed.life.recentSelections,p.life.recentSelections);assert.equal(changed.life.promise.status,'active');
  assert.match(result.message,/no extension/);assert.match(result.state.mail[0].body,/2030-05-18/);
  assert.throws(()=>negotiateRenewal(result.state,p.id,{...terms,wage:15000}),/90 days/);
  const restored=validateSave(JSON.parse(exportGame(result.state)));assert.equal(player(restored,p.id).contract.endDate,'2030-05-18');
});

test('high-OVR players reject demotion even with very large wages; counters persist through save reload',()=>{
  let s=game(),star=own(s).players.find(p=>p.ovr>=85);
  s=change(s,star.id,p=>({...p,age:28,contract:{...p.contract,role:'key',endDate:'2028-06-30',signedDate:'2025-07-01'},life:{...p.life,happiness:80,status:'settled'}}));
  star=player(s,star.id);const before=s.budget,contract={...star.contract};
  assert.equal(roleReviewTerms(star,own(s),s.currentDate).role,'key');
  for(let round=1;round<=3;round++){
    const result=negotiateRenewal(s,star.id,{years:0,keepExpiry:true,role:'rotation',wage:1000000});
    assert.equal(result.status,round===3?'rejected':'counter');
    if(round<3){assert.equal(result.demands.keepExpiry,true);assert.equal(result.demands.role,'key');s=validateSave(JSON.parse(exportGame(result.state)));assert.equal(s.renewalTalks[star.id].round,round+1);}
    else {s=result.state;assert.match(result.message,/reduced squad role/);}
  }
  assert.deepEqual(player(s,star.id).contract,contract);assert.equal(s.budget,before);
});

test('contract modes cannot reset negotiation rounds or bypass signing/amendment cooldowns',()=>{
  let {s,p}=reviewPlayer();
  s=change(s,p.id,x=>({...x,contract:{...x.contract,endDate:'2028-06-30'}}));p=player(s,p.id);
  let result=negotiateRenewal(s,p.id,{...roleReviewTerms(p,own(s),s.currentDate),role:'prospect'});
  assert.equal(result.status,'counter');s=result.state;
  result=negotiateRenewal(s,p.id,{...agentTerms(p,clubQuality(own(s)),s.currentDate),role:'prospect'});
  assert.equal(result.status,'counter');assert.equal(result.state.renewalTalks[p.id].round,3);assert.equal(result.state.renewalTalks[p.id].mode,'renewal');
  result=negotiateRenewal(result.state,p.id,{...roleReviewTerms(p,own(s),s.currentDate),role:'prospect'});
  assert.equal(result.status,'rejected');
  const justSigned=change(s,p.id,x=>({...x,contract:{...x.contract,signedDate:'2026-08-01'}}));
  assert.throws(()=>negotiateRenewal(justSigned,p.id,roleReviewTerms(player(justSigned,p.id),own(justSigned))),/just signed/);
  assert.throws(()=>negotiateRenewal(s,p.id,{years:0,keepExpiry:true,role:p.contract.role,wage:p.contract.wage}),/different squad role/);
});

test('zero years is exclusive to owned-player amendments, never an incoming signing loophole',()=>{
  const p=example(),demands=agentTerms(p,84),offer={...demands,years:0,keepExpiry:true};
  assert.throws(()=>evaluatePersonalTerms(p,offer,demands),/New signings need/);
  const {s,p:owned}=reviewPlayer();
  assert.throws(()=>negotiateRenewal(s,owned.id,{...roleReviewTerms(owned,own(s)),years:2}),/valid contract length/);
});

test('tracker logs and amendments round-trip compact saves; malformed new fields are rejected',()=>{
  let s=game(),p=own(s).players[0];
  s=change(s,p.id,x=>recordPlayerMinutes(x,90,s.currentDate,84,true,'W',{started:true,backupKeeper:false}));
  const restored=validateSave(JSON.parse(exportGame(s)));assert.deepEqual(player(restored,p.id).life.recentSelections,player(s,p.id).life.recentSelections);
  for(const patch of [{recentSelections:[{minutes:131,started:true,date:s.currentDate}]},{recentSelections:[{minutes:90,started:'yes',date:s.currentDate}]},{backupKeeper:'yes'}]){
    const raw=JSON.parse(exportGame(s)),saved=raw.state.plClubs.find(c=>c.id==='liv').players.find(x=>x.id===p.id);
    saved.life={...player(s,p.id).life,...patch};assert.throws(()=>validateSave(raw),/invalid player mindset/);
  }
  const raw=JSON.parse(exportGame(s)),saved=raw.state.plClubs.find(c=>c.id==='liv').players.find(x=>x.id===p.id);
  saved.contract={...p.contract,amendedDate:'not-a-date'};assert.throws(()=>validateSave(raw),/invalid player contract/);
  raw.state.renewalTalks={[p.id]:{mode:'renewal',round:1,demands:{years:0,keepExpiry:true,role:'key',wage:50000}}};
  assert.throws(()=>validateSave(raw),/invalid renewal terms/);
});

test('a new permanent club starts its own involvement tracker instead of inheriting the old club history',()=>{
  let s=game(),p=own(s).players.find(p=>p.name.includes('Leoni'));
  s=change(s,p.id,x=>recordPlayerMinutes(x,90,s.currentDate,84,true,'W',{started:true}));p=player(s,p.id);
  const moved=transfer(s,{type:'sell',playerId:p.id,buyerId:'man',fee:3,contract:{...p.contract,source:'career',signedDate:s.currentDate}});
  assert.deepEqual(player(moved,p.id).life.recentSelections,[]);assert.equal(playingTimeReport(player(moved,p.id)).minutes,0);
});
