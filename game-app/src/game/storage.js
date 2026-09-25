import { freshState, ensureFixtures, computeTableArray, STYLES, clamp } from './engine.js';
import { FORMATIONS, ROLE_GROUP } from './config.js';
import { repairUclField } from './uclSelection.js';
const KEY='football-manager-save-v1';
const LEGACY_KEY='pl-manager-save-v8';
const SAVE_VERSION=6;
const STAGES=new Set(['league-select','select','mode','squad','squad2','matchday-prep','matchday-live','matchday-result','cup-live','cup-result','half-results','full-results','summary','ucl','game-over']);
const POOL_KEYS=['clubs','plClubs','laligaClubs','serieaClubs','bundesligaClubs','ligue1Clubs','portugalClubs','championshipClubs','laliga2Clubs','serieBClubs','bundes2Clubs','ligue2Clubs','europeanGuestClubs'];
const LEAGUE_POOL={PL:'plClubs',LALIGA:'laligaClubs',SERIEA:'serieaClubs',BUNDES:'bundesligaClubs',LIGUE1:'ligue1Clubs',PORTUGAL:'portugalClubs'};
function requireValid(ok,message){if(!ok)throw new Error(`Save could not be loaded: ${message}`);}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
// A club can move between the top flight and its second tier. Look up the
// canonical roster across every default pool when hydrating a compact save,
// rather than assuming it is still in the division where it began.
function baseClubs(defaults){return new Map(POOL_KEYS.filter(key=>key!=='clubs').flatMap(key=>defaults[key]||[]).map(club=>[club.id,club]));}
function basePlayers(defaults){return new Map(POOL_KEYS.filter(key=>key!=='clubs').flatMap(key=>(defaults[key]||[]).flatMap(club=>club.players)).map(player=>[player.id,player]));}
function compactPlayer(player, base){
  if(!base)return {...player};
  const patch={id:player.id};
  for(const [key,value] of Object.entries(player))if(key!=='id'&&key!=='club'&&!same(value,base[key]))patch[key]=value;
  return patch;
}
function compactPool(clubs, defaults, players){
  const baseClubs=new Map((defaults||[]).map(club=>[club.id,club]));
  return clubs.map(club=>{
    const base=baseClubs.get(club.id), patch={id:club.id,players:club.players.map(player=>compactPlayer(player,players.get(player.id)))};
    for(const [key,value] of Object.entries(club))if(!['id','players'].includes(key)&&(!base||!same(value,base[key])))patch[key]=value;
    return patch;
  });
}
function restoreCompactState(input, defaults){
  if(!input?.rosterPatches)return input;
  const baseByPlayer=basePlayers(defaults);
  const baseByClub=baseClubs(defaults);
  const restored={...input};
  for(const key of POOL_KEYS.filter(key=>key!=='clubs')){
    if(!Array.isArray(input[key]))continue;
    const baseClubs=new Map((defaults[key]||[]).map(club=>[club.id,club]));
    restored[key]=(input[key]||[]).map(patch=>{
      const base=baseClubs.get(patch.id)||baseByClub.get(patch.id);
      requireValid(!!base,`unknown club ${patch.id}.`);
      const {players,...clubPatch}=patch;
      requireValid(Array.isArray(players),`invalid compact roster for ${patch.id}.`);
      return {...base,...clubPatch,players:players.map(playerPatch=>{
        const basePlayer=baseByPlayer.get(playerPatch.id);
        // v6 guest squads used four generated reserve players. They have no
        // real-player replacement, so drop only those obsolete guest patches.
        if(!basePlayer&&key==='europeanGuestClubs')return null;
        requireValid(!!basePlayer||typeof playerPatch.name==="string",`unknown player ${playerPatch.id}.`);
        return {...basePlayer,...playerPatch,club:patch.id};
      }).filter(Boolean)};
    });
  }
  delete restored.rosterPatches;
  return restored;
}
export function validateSave(raw){
  const input=raw?.version&&raw?.state?raw.state:raw;
  requireValid(input&&typeof input==='object'&&!Array.isArray(input),'invalid format.');
  requireValid(!raw.version||[1,2,3,4,5,SAVE_VERSION].includes(raw.version),'unsupported save version.');
  requireValid(STAGES.has(input.stage),'unknown game screen.');
  requireValid(FORMATIONS[input.formation],'invalid formation.');
  requireValid(Number.isFinite(input.budget)&&input.budget>=0,'invalid budget.');
  const defaults=freshState(), restored=restoreCompactState(input,defaults);let s={...defaults,...restored};
  if(!Array.isArray(restored.clubs))s.clubs=restored.league? s[LEAGUE_POOL[restored.league]] : defaults.clubs;
  const allPools=POOL_KEYS.map(key=>s[key]).filter(Array.isArray);
  const byId=new Map(allPools.flat().map(club=>[club.id,club]));
  if(Array.isArray(s.ucl?.clubIds)&&!Array.isArray(s.ucl.clubs)){
    requireValid(s.ucl.clubIds.every(id=>byId.has(id)),"invalid European club list.");
    s.ucl={...s.ucl,clubs:s.ucl.clubIds.map(id=>byId.get(id))};
  }
  const hydrateTable=(rows,pool)=>Array.isArray(rows)?rows.map(row=>row?.club?row:{...row,club:pool.find(club=>club.id===row.id)}):rows;
  s.table1=hydrateTable(s.table1,s.clubs);
  s.tableFinal=hydrateTable(s.tableFinal,s.clubs);
  if(s.ucl?.clubs)s.ucl={...s.ucl,phaseTable:hydrateTable(s.ucl.phaseTable,s.ucl.clubs)};
  s=repairUclField(s);
  requireValid(STYLES[s.tacticalStyle]&&Number.isFinite(s.defensiveLine)&&s.defensiveLine>=0&&s.defensiveLine<=100&&Number.isFinite(s.defensiveAggression)&&s.defensiveAggression>=0&&s.defensiveAggression<=100,'invalid tactics.');
  requireValid(s.halftimeStyle==='keep'||STYLES[s.halftimeStyle],'invalid halftime plan.');
  const playerIds=new Set();
  for(const key of POOL_KEYS){
    requireValid(Array.isArray(s[key])&&s[key].length>0,`missing ${key}.`);
    const clubIds=new Set();
    for(const c of s[key]){
      requireValid(typeof c.id==='string'&&!clubIds.has(c.id)&&typeof c.name==='string'&&Array.isArray(c.players),'invalid club.');
      clubIds.add(c.id);const ids=new Set();
      for(const p of c.players){
        requireValid(typeof p.id==='string'&&!ids.has(p.id)&&typeof p.name==='string'&&ROLE_GROUP[p.role]&&p.group===ROLE_GROUP[p.role]&&Number.isFinite(p.ovr)&&p.ovr>0&&p.ovr<=100&&Number.isFinite(p.age)&&Number.isFinite(p.value)&&p.value>=0,'invalid player.');
        requireValid(p.condition===undefined||(Number.isFinite(p.condition)&&p.condition>=0&&p.condition<=100),'invalid player condition.');
        requireValid(p.energy===undefined||(Number.isFinite(p.energy)&&p.energy>=0&&p.energy<=100),'invalid player energy.');
        requireValid(p.stamina===undefined||(Number.isFinite(p.stamina)&&p.stamina>=1&&p.stamina<=100),'invalid player stamina.');
        requireValid(p.potential===undefined||(Number.isFinite(p.potential)&&p.potential>=p.ovr&&p.potential<=100),'invalid player potential.');
        requireValid(p.confidence===undefined||(Number.isFinite(p.confidence)&&p.confidence>=-2&&p.confidence<=2),'invalid player confidence.');
        ids.add(p.id);
        if(key==='clubs'){requireValid(!playerIds.has(p.id),'duplicate player.');playerIds.add(p.id);}
      }
    }
  }
  requireValid(s.lineup&&typeof s.lineup==='object'&&!Array.isArray(s.lineup),'invalid lineup.');
  requireValid(['PL','LALIGA','SERIEA','BUNDES','LIGUE1','PORTUGAL',null].includes(s.league),'invalid league.');
  s.division=s.division===2?2:1;
  if(s.myClubId)requireValid(s.clubs.some(c=>c.id===s.myClubId),'your club is missing.');
  if(!['league-select','select'].includes(s.stage))requireValid(!!s.myClubId,'no selected club.');
  requireValid(Number.isInteger(s.season)&&s.season>=1,'invalid season.');
  for(const key of ['history','loans','finances','results1','results2'])requireValid(Array.isArray(s[key]),`invalid ${key}.`);
  s.suspensions={...defaults.suspensions,...s.suspensions};
  requireValid(Array.isArray(s.suspensions.domestic)&&Array.isArray(s.suspensions.ucl),'invalid suspensions.');
  s.injuries=s.injuries&&typeof s.injuries==='object'&&!Array.isArray(s.injuries)?s.injuries:{};
  for(const injury of Object.values(s.injuries))requireValid(injury&&typeof injury.name==='string'&&Number.isInteger(injury.matches)&&injury.matches>0,'invalid injury.');
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
  // Version 1 used a cumulative fatigue formula that could strand a squad near
  // 30% condition. Version 2 uses next-fixture readiness, whose valid floor is
  // 82%, so repair older saves as they are loaded.
  if(!raw.version||raw.version===1){
    for(const key of POOL_KEYS){
      s[key]=s[key].map(c=>({...c,players:c.players.map(p=>({...p,condition:clamp(p.condition??100,82,100)}))}));
    }
  }
  for(const key of POOL_KEYS){
    s[key]=s[key].map(c=>({...c,players:c.players.map(p=>({...p,
      energy:clamp(p.energy??100,0,100),stamina:p.stamina??80,
      confidence:clamp(p.confidence||0,-2,2),seasonGoals:p.seasonGoals||0,seasonAssists:p.seasonAssists||0,
      ratingTotal:p.ratingTotal||0,ratedMatches:p.ratedMatches||0,bestRating:p.bestRating||0,motm:p.motm||0,
      seasonMinutes:p.seasonMinutes||0,lastRating:p.lastRating??null,lastConfidenceChange:p.lastConfidenceChange||0,
      competitionStats:p.competitionStats||{}}))}));
  }
  if(!s.clubForm||typeof s.clubForm!=='object'||Array.isArray(s.clubForm))s.clubForm={};
  if(!s.clubForm[s.myClubId]&&s.myClubId)s.clubForm[s.myClubId]=[...s.results1,...s.results2].slice(-5).map(result=>result.result);
  // Legacy loan flags do not contain ownership; block resale instead of inventing an owner.
  return s;
}
export function loadGame(storage){
  const current=storage.getItem(KEY),legacy=current===null?storage.getItem(LEGACY_KEY):null;
  if(current===null&&legacy===null)return freshState();
  return validateSave(JSON.parse(current??legacy));
}
function compactResult(result){
  if(!result)return result;
  const {match,performanceUpdates,playerRatings,...rest}=result;
  void match;void performanceUpdates;void playerRatings;
  return rest;
}
function compactTable(table){return Array.isArray(table)?table.map(row=>{const copy={...row};delete copy.club;return copy;}):table;}
function compactState(state){
  const defaults=freshState(), players=basePlayers(defaults);
  const out={...state,rosterPatches:true,clubs:undefined,table1:compactTable(state.table1),tableFinal:compactTable(state.tableFinal),
    results1:state.results1.map(compactResult),results2:state.results2.map(compactResult)};
  for(const key of POOL_KEYS.filter(key=>key!=='clubs'))out[key]=compactPool(state[key]||[],defaults[key],players);
  if(state.cupStatus)out.cupStatus=Object.fromEntries(Object.entries(state.cupStatus).map(([key,cup])=>[key,{...cup,results:cup.results.map(compactResult)}]));
  if(state.cups)out.cups=Object.fromEntries(Object.entries(state.cups).map(([key,cup])=>[key,cup?.results?{...cup,results:cup.results.map(compactResult)}:cup]));
  if(state.ucl)out.ucl={...state.ucl,clubIds:state.ucl.clubs.map(club=>club.id),clubs:undefined,
    phaseTable:compactTable(state.ucl.phaseTable),campaignResults:state.ucl.campaignResults.map(compactResult)};
  return out;
}
export function saveGame(storage,state){
  // Keep the active replay; historical standings and results only need ids and compact summaries.
  const json=JSON.stringify({version:SAVE_VERSION,state:compactState(state)},(key,value)=>key==='match'?undefined:value);
  storage.setItem(KEY,json);
}
export function exportGame(state){return JSON.stringify({version:SAVE_VERSION,state:compactState(state)},(key,value)=>key==='match'?undefined:value,2);}
