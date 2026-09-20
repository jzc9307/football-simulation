import { freshState, ensureFixtures, computeTableArray, STYLES } from './engine.js';
import { FORMATIONS, ROLE_GROUP } from './config.js';
const KEY='football-manager-save-v1';
const LEGACY_KEY='pl-manager-save-v8';
const STAGES=new Set(['league-select','select','mode','squad','squad2','matchday-prep','matchday-live','matchday-result','cup-live','cup-result','half-results','full-results','summary','ucl']);
function requireValid(ok,message){if(!ok)throw new Error(`Save could not be loaded: ${message}`);}
export function validateSave(raw){
  const input=raw?.version===1?raw.state:raw;
  requireValid(input&&typeof input==='object'&&!Array.isArray(input),'invalid format.');
  requireValid(!raw.version||raw.version===1,'unsupported save version.');
  requireValid(STAGES.has(input.stage),'unknown game screen.');
  requireValid(FORMATIONS[input.formation],'invalid formation.');
  requireValid(Number.isFinite(input.budget)&&input.budget>=0,'invalid budget.');
  const defaults=freshState(),s={...defaults,...input};
  requireValid(STYLES[s.tacticalStyle]&&Number.isFinite(s.defensiveLine)&&s.defensiveLine>=0&&s.defensiveLine<=100,'invalid tactics.');
  requireValid(s.halftimeStyle==='keep'||STYLES[s.halftimeStyle],'invalid halftime plan.');
  const playerIds=new Set();
  for(const key of ['clubs','plClubs','laligaClubs','serieaClubs','bundesligaClubs','ligue1Clubs','championshipClubs']){
    requireValid(Array.isArray(s[key])&&s[key].length>0,`missing ${key}.`);
    const clubIds=new Set();
    for(const c of s[key]){
      requireValid(typeof c.id==='string'&&!clubIds.has(c.id)&&typeof c.name==='string'&&Array.isArray(c.players),'invalid club.');
      clubIds.add(c.id);const ids=new Set();
      for(const p of c.players){
        requireValid(typeof p.id==='string'&&!ids.has(p.id)&&typeof p.name==='string'&&ROLE_GROUP[p.role]&&p.group===ROLE_GROUP[p.role]&&Number.isFinite(p.ovr)&&p.ovr>0&&p.ovr<=100&&Number.isFinite(p.age)&&Number.isFinite(p.value)&&p.value>=0,'invalid player.');
        requireValid(p.condition===undefined||(Number.isFinite(p.condition)&&p.condition>=0&&p.condition<=100),'invalid player condition.');
        ids.add(p.id);
        if(key==='clubs'){requireValid(!playerIds.has(p.id),'duplicate player.');playerIds.add(p.id);}
      }
    }
  }
  requireValid(s.lineup&&typeof s.lineup==='object'&&!Array.isArray(s.lineup),'invalid lineup.');
  requireValid(['PL','LALIGA','SERIEA','BUNDES','LIGUE1',null].includes(s.league),'invalid league.');
  if(s.myClubId)requireValid(s.clubs.some(c=>c.id===s.myClubId),'your club is missing.');
  if(!['league-select','select'].includes(s.stage))requireValid(!!s.myClubId,'no selected club.');
  requireValid(Number.isInteger(s.season)&&s.season>=1,'invalid season.');
  for(const key of ['history','loans','finances','results1','results2'])requireValid(Array.isArray(s[key]),`invalid ${key}.`);
  s.suspensions={...defaults.suspensions,...s.suspensions};
  requireValid(Array.isArray(s.suspensions.domestic)&&Array.isArray(s.suspensions.ucl),'invalid suspensions.');
  s.cupStatus={...defaults.cupStatus,...s.cupStatus};
  for(const c of Object.values(s.cupStatus))requireValid(c&&Array.isArray(c.playedRounds)&&Array.isArray(c.results)&&Array.isArray(c.faced)&&c.record,'invalid cup progress.');
  requireValid(s.cups&&typeof s.cups==='object','invalid cup records.');
  for(const loan of s.loans)requireValid(loan&&typeof loan.playerId==='string'&&typeof loan.ownerId==='string'&&typeof loan.borrowerId==='string','invalid loan contract.');
  if(s.roundsHalf1){
    requireValid(Array.isArray(s.roundsHalf1)&&Array.isArray(s.roundsHalf2)&&s.tableRaw,'invalid fixtures.');
    requireValid(Number.isInteger(s.roundIndex)&&s.roundIndex>=0&&[1,2].includes(s.half),'invalid matchday.');
    const ids=new Set(s.clubs.map(c=>c.id));
    for(const rounds of [s.roundsHalf1,s.roundsHalf2]){
      requireValid(rounds.length===s.clubs.length-1,'invalid season length.');
      for(const round of rounds)requireValid(Array.isArray(round)&&round.length===s.clubs.length/2&&round.every(pair=>Array.isArray(pair)&&pair.length===2&&pair.every(id=>ids.has(id)))&&new Set(round.flat()).size===s.clubs.length,'invalid fixture round.');
    }
    for(const c of s.clubs)requireValid(s.tableRaw[c.id]&&['played','pts','gf','ga','w','d','l'].every(k=>Number.isFinite(s.tableRaw[c.id][k])),'invalid league table.');
    // Repair saves stranded beyond the last fixture in an 18-team league.
    const rounds=s.half===1?s.roundsHalf1:s.roundsHalf2;
    if(s.stage==='matchday-prep'&&s.roundIndex>=rounds.length){
      const table=computeTableArray(s.tableRaw,s.clubs);
      s.stage=s.half===1?'half-results':'full-results';
      s[s.half===1?'table1':'tableFinal']=table;
    }
  }else if(s.stage.startsWith('matchday'))Object.assign(s,ensureFixtures(s));
  if(s.stage==='matchday-live'&&!s.lastLiveContext?.timeline?.every(e=>typeof e.isGoal==='boolean'||!['goal','penalty','freekick','corner'].includes(e.type)))s.stage='matchday-result';
  if(s.stage==='cup-live'&&!s.lastLiveContext?.timeline?.every(e=>typeof e.isGoal==='boolean'||!['goal','penalty','freekick','corner'].includes(e.type)))s.stage='cup-result';
  if(['matchday-result','matchday-live'].includes(s.stage))requireValid(s.lastResult,'missing match result.');
  if(['cup-result','cup-live'].includes(s.stage))requireValid(s.lastCupResult,'missing cup result.');
  if(['summary','full-results'].includes(s.stage))requireValid(Array.isArray(s.tableFinal)&&Array.isArray(s.table1),'missing final table.');
  if(s.stage==='half-results')requireValid(Array.isArray(s.table1),'missing half-season table.');
  for(const key of ['table1','tableFinal'])if(s[key])requireValid(Array.isArray(s[key])&&s[key].length===s.clubs.length&&s[key].every(r=>r&&r.club&&typeof r.club.name==='string'&&Number.isFinite(r.pts)),'invalid standings.');
  if(s.ucl){
    requireValid(['hub','match-prep','match-live','match-result','phase-summary','knockout-prep','knockout-live','knockout-result','final'].includes(s.ucl.stage),'invalid European screen.');
    requireValid(Number.isInteger(s.ucl.roundIndex)&&s.ucl.roundIndex>=0&&s.ucl.roundIndex<8&&s.ucl.campaignRecord&&Array.isArray(s.ucl.knockoutRounds)&&Array.isArray(s.ucl.knockoutFaced),'invalid European progress.');
    if(s.ucl.stage.startsWith('knockout'))requireValid(s.ucl.aggregate&&Number.isFinite(s.ucl.aggregate.mine)&&Number.isFinite(s.ucl.aggregate.opp)&&s.ucl.clubs.some(c=>c.id===s.ucl.currentKnockoutOpponentId),'invalid knockout opponent or aggregate.');
    requireValid(Array.isArray(s.ucl.clubs)&&Array.isArray(s.ucl.rounds)&&s.ucl.tableRaw&&Array.isArray(s.ucl.campaignResults),'invalid European campaign.');
    if(s.ucl.stage.endsWith('-live')&&!s.ucl.liveContext?.timeline?.every(e=>typeof e.isGoal==='boolean'||!['goal','penalty','freekick','corner'].includes(e.type)))s.ucl.stage=s.ucl.stage.replace('-live','-result');
  }
  if(s.stage==='ucl')requireValid(s.ucl,'missing European campaign.');
  // Legacy loan flags do not contain ownership; block resale instead of inventing an owner.
  return s;
}
export function loadGame(storage){
  const current=storage.getItem(KEY),legacy=current===null?storage.getItem(LEGACY_KEY):null;
  if(current===null&&legacy===null)return freshState();
  return validateSave(JSON.parse(current??legacy));
}
export function saveGame(storage,state){
  // Detailed events stay in the active replay. Historical results retain scores/scorers.
  const json=JSON.stringify({version:1,state},(key,value)=>key==='match'?undefined:value);
  storage.setItem(KEY,json);
}
export function exportGame(state){return JSON.stringify({version:1,state},(key,value)=>key==='match'?undefined:value,2);}
