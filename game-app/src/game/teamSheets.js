import { FORMATIONS } from './config.js';
import { autoLineup, positionFit, matchOvr, unavailablePlayerIds, STYLES } from './engine.js';
import { moveToSquadGroup } from './squadSelection.js';

export const MAX_TEAM_SHEETS=3;
export function captureTeamPlan(s){
  return {formation:s.formation,lineup:{...s.lineup},benchSelection:Array.isArray(s.benchSelection)?[...s.benchSelection]:null,tacticalStyle:s.tacticalStyle||'balanced',defensiveLine:s.defensiveLine??50,defensiveAggression:s.defensiveAggression??50,offsideTrap:!!s.offsideTrap,halftimeStyle:s.halftimeStyle||'keep',autoSubs:s.autoSubs!==false};
}
export function validTeamPlan(p){
  return p&&FORMATIONS[p.formation]&&STYLES[p.tacticalStyle]&&p.lineup&&typeof p.lineup==='object'&&!Array.isArray(p.lineup)&&Object.entries(p.lineup).every(([slot,id])=>/^\d+$/.test(slot)&&Number(slot)<11&&typeof id==='string')&&new Set(Object.values(p.lineup)).size===Object.values(p.lineup).length&&(p.benchSelection===null||Array.isArray(p.benchSelection)&&p.benchSelection.length<=9&&p.benchSelection.every(id=>typeof id==='string')&&new Set(p.benchSelection).size===p.benchSelection.length&&!p.benchSelection.some(id=>Object.values(p.lineup).includes(id)))&&[p.defensiveLine,p.defensiveAggression].every(n=>Number.isFinite(n)&&n>=0&&n<=100)&&typeof p.offsideTrap==='boolean'&&typeof p.autoSubs==='boolean'&&(p.halftimeStyle==='keep'||!!STYLES[p.halftimeStyle]);
}
export function ensureTeamSheets(s){
  if(!s.myClubId||s.teamSheets?.length)return s;
  return {...s,teamSheets:[{id:'team-xi',name:'Team XI',...captureTeamPlan(s)}],activeTeamSheetId:'team-xi'};
}
// Only explicit manager edits update a template. Match-day injury replacements
// and automatic substitutions must never rewrite the manager's saved team.
export function syncActiveTeamSheet(input){
  const s=ensureTeamSheets(input);
  return {...s,teamSheets:s.teamSheets?.map(sheet=>sheet.id===s.activeTeamSheetId?{...sheet,...captureTeamPlan(s)}:sheet)};
}
export function activateTeamSheet(input,id){
  const s=ensureTeamSheets(input),sheet=s.teamSheets.find(t=>t.id===id);
  if(!sheet)throw Error('Choose a saved team sheet.');
  const club=s.clubs.find(c=>c.id===s.myClubId),unavailable=new Set(unavailablePlayerIds(s,s.stage==='ucl'?'ucl':'domestic'));
  const eligible=club.players.filter(p=>!unavailable.has(p.id)&&!(s.loans||[]).some(l=>l.playerId===p.id&&l.ownerId===s.myClubId));
  const ids=new Set(eligible.map(p=>p.id)),lineup=Object.fromEntries(Object.entries(sheet.lineup).filter(([,pid])=>ids.has(pid)));
  const used=new Set(Object.values(lineup));
  for(let i=0;i<11;i++)if(!lineup[i]){
    const best=eligible.filter(p=>!used.has(p.id)).sort((a,b)=>matchOvr(b)*positionFit(FORMATIONS[sheet.formation][i].role,b)-matchOvr(a)*positionFit(FORMATIONS[sheet.formation][i].role,a))[0];
    if(best){lineup[i]=best.id;used.add(best.id);}
  }
  return {...s,...captureTeamPlan(sheet),lineup,benchSelection:sheet.benchSelection?.filter(pid=>ids.has(pid)&&!used.has(pid))??null,activeTeamSheetId:id};
}
export function saveTeamSheet(input,plan,name,id=null){
  let s=ensureTeamSheets(input);name=String(name||'').trim().slice(0,28);
  if(!name)throw Error('Give this team sheet a name.');
  if(!validTeamPlan(plan))throw Error('Check the formation, lineup and match instructions.');
  if(Object.values(plan.lineup).length!==11)throw Error('Choose all eleven starters before saving your team sheet.');
  if(id&&!s.teamSheets.some(t=>t.id===id))throw Error('That team sheet no longer exists.');
  if(!id&&s.teamSheets.length>=MAX_TEAM_SHEETS)throw Error('You can save up to three team sheets.');
  if(s.teamSheets.some(t=>t.id!==id&&t.name.toLowerCase()===name.toLowerCase()))throw Error('Choose a different name for this team sheet.');
  id=id||`sheet-${[1,2,3].find(n=>!s.teamSheets.some(t=>t.id===`sheet-${n}`))}`;
  const sheet={id,name,...captureTeamPlan(plan)};
  s={...s,teamSheets:s.teamSheets.some(t=>t.id===id)?s.teamSheets.map(t=>t.id===id?sheet:t):[...s.teamSheets,sheet]};
  return activateTeamSheet(s,id);
}
export function deleteTeamSheet(s,id){
  if(s.teamSheets.length<=1)throw Error('Keep at least one team sheet.');
  const next={...s,teamSheets:s.teamSheets.filter(t=>t.id!==id)};
  return id===s.activeTeamSheetId?activateTeamSheet(next,next.teamSheets[0].id):next;
}
export function draftPlayerToSlot(state,slot,playerId){
  const player=state.clubs.find(c=>c.id===state.myClubId)?.players.find(p=>p.id===playerId);
  if(!Number.isInteger(slot)||slot<0||slot>=FORMATIONS[state.formation].length||!player||unavailablePlayerIds(state,state.stage==='ucl'?'ucl':'domestic').includes(playerId))return state;
  const lineup={...state.lineup},original=Object.keys(lineup).find(k=>lineup[k]===playerId),displaced=lineup[slot];
  Object.keys(lineup).forEach(k=>{if(lineup[k]===playerId)delete lineup[k];});lineup[slot]=playerId;
  if(original!==undefined&&Number(original)!==slot&&displaced)lineup[original]=displaced;
  const next={...state,lineup,benchSelection:state.benchSelection?.filter(id=>id!==playerId)??null};
  return original===undefined&&displaced?moveToSquadGroup(next,displaced,'bench'):next;
}
export function draftBestSlot(state,playerId){
  const players=state.clubs.find(c=>c.id===state.myClubId).players,player=players.find(p=>p.id===playerId);
  const best=FORMATIONS[state.formation].map((slot,i)=>({i,fit:positionFit(slot.role,player),current:players.find(p=>p.id===state.lineup[i])})).sort((a,b)=>b.fit-a.fit||Number(!!a.current)-Number(!!b.current)||(a.current?matchOvr(a.current):0)-(b.current?matchOvr(b.current):0))[0];
  return draftPlayerToSlot(state,best.i,playerId);
}
export function draftFormation(state,formation){
  return {...state,formation,lineup:autoLineup(FORMATIONS[formation],state.clubs.find(c=>c.id===state.myClubId).players.filter(p=>!unavailablePlayerIds(state,state.stage==='ucl'?'ucl':'domestic').includes(p.id))),benchSelection:null};
}
