import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, autoLineup, ensureFixtures, STYLES } from '../src/game/engine.js';
import { FORMATIONS } from '../src/game/config.js';
import { captureTeamPlan, ensureTeamSheets, activateTeamSheet, saveTeamSheet, syncActiveTeamSheet, draftPlayerToSlot, deleteTeamSheet } from '../src/game/teamSheets.js';
import { transferWindowEvents, isTransferWindowOpen } from '../src/game/transferWindows.js';
import { recordScheduledResult } from '../src/game/seasonSchedule.js';
import { rewardEuropeanQualification, premierLeaguePrize } from '../src/game/rewards.js';
import { cash } from '../src/game/finance.js';
import { exportGame, validateSave } from '../src/game/storage.js';
import { startNextSeason } from '../src/game/career.js';
import { initializeEuropeanKnockout, knockoutContext, syncEuropeanDraw } from '../src/game/europeanCalendar.js';
import { createEuropaCampaign } from '../src/game/europaSelection.js';
import { createConferenceCampaign } from '../src/game/conferenceSelection.js';
import { roundRobin, initTable, unavailablePlayerIds } from '../src/game/engine.js';
import { playEuropeanKnockout, advanceEuropeanKnockout } from '../src/game/actions.js';

function game(){const s=freshState(),c=s.plClubs.find(c=>c.id==='liv');return ensureTeamSheets(ensureFixtures({...s,myClubId:c.id,clubs:s.plClubs,league:'PL',budget:c.budget,formation:c.preferredFormation,lineup:autoLineup(FORMATIONS[c.preferredFormation],c.players),currentDate:'2026-08-15',stage:'squad',scheduleMigrationDone:true}));}
test('team sheets capture the first XI, save three named plans, switch complete tactics and persist',()=>{
  let s=game();assert.equal(s.teamSheets[0].name,'Team XI');const original=captureTeamPlan(s);
  const plan={...original,formation:'4-4-2',tacticalStyle:'counter',defensiveLine:20,autoSubs:false};
  // Formation names/styles come from canonical choices, not fixture data.
  plan.tacticalStyle=Object.keys(STYLES)[1];
  s=saveTeamSheet(s,plan,'Cup rotation');const id=s.activeTeamSheetId;
  assert.equal(s.formation,'4-4-2');assert.equal(s.defensiveLine,20);
  s=saveTeamSheet(s,original,'All out');assert.equal(s.teamSheets.length,3);assert.throws(()=>saveTeamSheet(s,original,'Fourth'),/three/);
  s=activateTeamSheet(s,'team-xi');assert.equal(s.formation,original.formation);assert.equal(s.autoSubs,true);
  const restored=validateSave(JSON.parse(exportGame(s)));assert.deepEqual(restored.teamSheets,s.teamSheets);
  assert.equal(activateTeamSheet(restored,id).defensiveLine,20);
  assert.throws(()=>saveTeamSheet(s,original,'team xi',id),/different name/);
  assert.equal(deleteTeamSheet(s,id).teamSheets.length,2);
});
test('draft swaps are immutable; manager edits sync but automatic changes do not overwrite a saved sheet',()=>{
  const s=game(),id=Object.values(s.lineup)[0],bench=s.clubs.find(c=>c.id===s.myClubId).players.find(p=>!Object.values(s.lineup).includes(p.id));
  const draft=draftPlayerToSlot(s,0,bench.id);assert.equal(s.lineup[0],id);assert.equal(draft.lineup[0],bench.id);assert.equal(new Set(Object.values(draft.lineup)).size,11);
  assert.equal(s.teamSheets[0].lineup[0],id);assert.equal(syncActiveTeamSheet(draft).teamSheets[0].lineup[0],bench.id);
  const injury={...s,injuries:{[id]:{matches:2,days:7}},lineup:draft.lineup};
  const active=activateTeamSheet(injury,'team-xi');assert.ok(!Object.values(active.lineup).includes(id));assert.equal(active.teamSheets[0].lineup[0],id);
  const healed=activateTeamSheet({...active,injuries:{}},'team-xi');assert.equal(healed.lineup[0],id);
  const departed={...s,clubs:s.clubs.map(c=>c.id===s.myClubId?{...c,players:c.players.filter(p=>p.id!==id)}:c)};
  assert.ok(!Object.values(activateTeamSheet(departed,'team-xi').lineup).includes(id));
});
test('calendar boundaries share the market rules and deadlines are inclusive',()=>{
  const first=transferWindowEvents(1);assert.equal(first[1].date,'2026-09-01');assert.equal(transferWindowEvents(2)[1].date,'2027-08-31');
  for(const e of first){assert.equal(isTransferWindowOpen(e.date),true);if(e.kind==='close'){const d=new Date(e.date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);assert.equal(isTransferWindowOpen(d.toISOString().slice(0,10)),false);}}
});
test('a cup win pays exactly once, not on a bye, defeat or replay; money and mail survive reload',()=>{
  let s=game();const event={id:'test-fa',kind:'cup',competition:'FA',round:'Fifth Round',homeId:s.myClubId,awayId:'ars',date:'2027-02-20',status:'scheduled'},next={id:'test-quarter',kind:'cup',competition:'FA',round:'Quarter-Final',feeders:[event.id,'other'],status:'pending-draw',date:'2027-03-13'};
  s={...s,seasonSchedule:[event,next]};const before=s.budget;
  const lost=recordScheduledResult(s,{fixtureId:event.id,myGoals:0,oppGoals:1,winnerId:'ars'});assert.equal(lost.budget,before);
  const won=recordScheduledResult(s,{fixtureId:event.id,myGoals:2,oppGoals:1,winnerId:s.myClubId});assert.equal(won.budget,cash(before+.23));assert.equal(won.mail[0].prize.milestone,'Quarter-Final');assert.equal(won.finance.ledger[0].amount,230000);
  const restored=validateSave(JSON.parse(exportGame(won)));assert.equal(recordScheduledResult(restored,{fixtureId:event.id,myGoals:2,oppGoals:1,winnerId:s.myClubId}).budget,won.budget);
});
test('European qualification and deciding legs award progression but never pay a first-leg result',()=>{
  for(const competition of ['UCL','UEL','UECL']){
    const s=game(),qualified=rewardEuropeanQualification(s,competition,8);assert.ok(qualified.budget>s.budget);assert.equal(rewardEuropeanQualification(qualified,competition,8).budget,qualified.budget);assert.equal(rewardEuropeanQualification(s,competition,25).budget,s.budget);
    const e={id:`${competition}-leg`,kind:'europe',competition,round:'Round of 16',knockoutKey:'round16',leg:1,homeId:s.myClubId,awayId:'ars',date:'2027-03-10',status:'scheduled'};
    const first=recordScheduledResult({...s,seasonSchedule:[e]},{fixtureId:e.id,myGoals:3,oppGoals:0,winnerId:s.myClubId});assert.equal(first.budget,s.budget);
    const deciding=recordScheduledResult({...s,seasonSchedule:[{...e,leg:2}]},{fixtureId:e.id,myGoals:3,oppGoals:0,winnerId:s.myClubId});assert.ok(deciding.budget>s.budget);
  }
});
test('Premier League merit funding arrives in the following season with its own ledger and letter',()=>{
  const s=game(),table=[{id:s.myClubId},...s.clubs.filter(c=>c.id!==s.myClubId).map(c=>({id:c.id}))];
  assert.equal(premierLeaguePrize(1),20);assert.equal(premierLeaguePrize(20),1);
  const next=startNextSeason({...s,tableFinal:table});
  assert.equal(next.season,2);assert.ok(next.budget>=s.budget+30);assert.ok(next.mail.some(m=>m.prize?.amount===20&&m.competition==='PL'));
  assert.ok(next.finance.ledger.some(e=>e.category==='League position reward'&&e.amount===20000000));
});
test('all three European competitions have separate knockout trees and aggregate context',()=>{
  let s=game();const clubs=s.clubs.concat(s.laligaClubs).slice(0,36),phaseTable=clubs.map(c=>({id:c.id}));
  for(const competition of ['UCL','UEL','UECL'])s=initializeEuropeanKnockout({...s,[competition.toLowerCase()]:{clubs,phaseTable,stage:'hub'}},competition);
  assert.equal(new Set(s.seasonSchedule.filter(e=>e.knockoutKey).map(e=>e.id)).size,3*45);
  const ue=s.seasonSchedule.find(e=>e.competition==='UEL'&&e.knockoutKey==='playoff'&&e.leg===1);
  const completed={...s,seasonSchedule:s.seasonSchedule.map(e=>e.id===ue.id?{...e,status:'completed',result:{homeGoals:2,awayGoals:1}}:e)};
  const second=completed.seasonSchedule.find(e=>e.competition==='UEL'&&e.knockoutKey==='playoff'&&e.tieIndex===ue.tieIndex&&e.leg===2);
  const context=knockoutContext({...completed,myClubId:ue.homeId},second);assert.deepEqual(context.aggregate,{mine:2,opp:1});
  assert.equal(syncEuropeanDraw(completed).seasonSchedule.find(e=>e.id===ue.id).result.homeGoals,2);
});
test('invalid or incomplete sheets cannot be saved or imported',()=>{
  const s=game();
  assert.throws(()=>saveTeamSheet(s,{...captureTeamPlan(s),lineup:{}},'Empty'),/eleven/);
  for(const corrupt of [
    raw=>{raw.state.teamSheets=Array.from({length:4},(_,i)=>({...s.teamSheets[0],id:String(i)}));},
    raw=>{raw.state.teamSheets[0].defensiveLine=-1;},
    raw=>{raw.state.teamSheets[0].lineup[1]=raw.state.teamSheets[0].lineup[0];},
    raw=>{raw.state.activeTeamSheetId='missing';}
  ]){
    const raw=JSON.parse(exportGame(s));corrupt(raw);assert.throws(()=>validateSave(raw),/invalid team sheets/);
  }
});
test('Europa and Conference user knockout legs simulate, reload and resolve separately from Champions League',()=>{
  for(const competition of ['UEL','UECL']){
    const key=competition.toLowerCase(),id=competition==='UEL'?'afc':'bri';
    let s=game(),club=s.clubs.find(c=>c.id===id);
    s={...s,myClubId:id,budget:club.budget,formation:club.preferredFormation,lineup:autoLineup(FORMATIONS[club.preferredFormation],club.players),teamSheets:null,activeTeamSheetId:null};
    const campaign=(competition==='UEL'?createEuropaCampaign:createConferenceCampaign)(s,roundRobin,initTable);
    const other=campaign.clubs.filter(c=>c.id!==id),phaseTable=[...other.slice(0,9),club,...other.slice(9)].map(c=>({id:c.id}));
    s=initializeEuropeanKnockout({...s,[key]:{...campaign,phaseTable,qualification:'playoff'},seasonSchedule:[]},competition);
    const first=s.seasonSchedule.find(e=>e.leg===1&&(e.homeId===id||e.awayId===id));
    s={...s,stage:'ucl',activeEuropeanCompetition:competition,activeFixtureId:first.id,currentDate:first.date,[key]:knockoutContext(s,first)};
    const before=s.budget;
    s=playEuropeanKnockout(s);
    assert.equal(s[key].stage,'knockout-live');assert.equal(s[key].liveContext.competition,competition);
    assert.equal(s.budget,before);assert.equal(s.ucl,null);
    s=validateSave(JSON.parse(exportGame(s)));
    s=advanceEuropeanKnockout(s);
    assert.equal(s[key].stage,'hub');
    const second=s.seasonSchedule.find(e=>e.leg===2&&e.knockoutKey===first.knockoutKey&&e.tieIndex===first.tieIndex);
    const banned=new Set(unavailablePlayerIds(s,'ucl'));
    s={...s,activeFixtureId:second.id,currentDate:second.date,lineup:autoLineup(FORMATIONS[s.formation],s.clubs.find(c=>c.id===id).players.filter(p=>!banned.has(p.id))),[key]:knockoutContext(s,second)};
    s=playEuropeanKnockout(s);
    const event=s.seasonSchedule.find(e=>e.id===second.id),tie=s[key].knockoutBracket.stages[0].ties[first.tieIndex];
    assert.ok(event.winnerId);assert.equal(tie.winnerId,event.winnerId);assert.equal(s.ucl,null);
    assert.equal(s.budget, event.winnerId===id?cash(before+(competition==='UEL'?.4:.2)):before);
    s=advanceEuropeanKnockout(validateSave(JSON.parse(exportGame(s))));
    assert.equal(s[key].stage,event.winnerId===id?'hub':'final');
  }
});
