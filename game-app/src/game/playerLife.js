import { CONTRACT_DATA } from '../data/contractsFc26.js';
import { ROLE_GROUP } from './config.js';

export const PLAYER_POOLS=['clubs','plClubs','laligaClubs','serieaClubs','bundesligaClubs','ligue1Clubs','portugalClubs','championshipClubs','laliga2Clubs','serieBClubs','bundes2Clubs','ligue2Clubs','europeanGuestClubs'];
export const SQUAD_ROLES={key:'Key player',starter:'Regular starter',rotation:'Rotation',prospect:'Prospect'};
const bounded=(n,min,max)=>Math.max(min,Math.min(max,n));
export const daysBetween=(a,b)=>Math.max(0,Math.floor((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000));
export const contractMonths=(p,date)=>p.contract?.endDate?Math.ceil((Date.parse(p.contract.endDate+'T12:00:00Z')-Date.parse(date+'T12:00:00Z'))/86400000/30.44):null;
export const wageLabel=wage=>Number.isFinite(wage)?`£${wage.toLocaleString('en-GB')} / week`:'Source unavailable';
export function inferredRole(p,quality){return p.age<=21&&p.ovr<quality-5?'prospect':p.ovr>=quality+2?'key':p.ovr>=quality-3?'starter':'rotation';}
export function initialPlayerLife(p,quality=78,date='2026-08-15'){
  const data=CONTRACT_DATA[p.slug],youth=p.slug?.startsWith('youth-');
  const contract=p.contract||{endDate:data?`${data[0]}-06-30`:youth?`${Number(date.slice(0,4))+3}-06-30`:null,wage:data?data[1]:youth?1000:null,role:inferredRole(p,quality),source:data?'futwiz-fc26':youth?'career':'unavailable',sourceUrl:data?`https://www.futwiz.com/fc26/career-mode/player/${data[3]}/${data[2]}`:null};
  const details=data?.[4];
  return {...p,contract,...(details?{sourceProfile:details,attributes:p.attributes||Object.fromEntries(['shooting','dribbling','passing','defending','physical'].map((k,i)=>[k,details.abilities[i]]))}:{}),life:p.life||{happiness:72,ambition:p.age<=25&&p.ovr>=80?'high':'balanced',recentMinutes:[],missedMatches:0,reason:'Settled at the club',status:'settled',lastPlayedDate:null,lastEnergyDate:date,joinedDate:date},careerSeasons:p.careerSeasons||[]};
}
// One canonical club object feeds every league and European view; no fresh
// source roster may overwrite the fatigued squad after a cup/league fixture.
export function mapLifeClubs(s,fn){
  const clubs=new Map(PLAYER_POOLS.slice(1).flatMap(k=>s[k]||[]).map(c=>[c.id,c]));
  (s.clubs||[]).forEach(c=>clubs.set(c.id,c));
  const changed=new Map([...clubs].map(([id,c])=>[id,fn(c)]));
  const next={...s};for(const key of PLAYER_POOLS)if(s[key])next[key]=s[key].map(c=>changed.get(c.id)||c);
  for(const key of ['ucl','uel','uecl'])if(s[key]?.clubs)next[key]={...s[key],clubs:s[key].clubs.map(c=>changed.get(c.id)||c)};
  return next;
}
export function ensurePlayerLife(s){
  if(s.playerLifeVersion===1)return s;
  const date=s.currentDate||'2026-08-15';
  return {...mapLifeClubs(s,c=>{const sorted=[...c.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11),q=sorted.reduce((v,p)=>v+p.ovr,0)/Math.max(1,sorted.length);return {...c,players:c.players.map(p=>initialPlayerLife(p,q,date))};}),playerLifeVersion:1,lifeClockDate:date,lifeEvents:s.lifeEvents||[],freeAgents:s.freeAgents||[]};
}
export function recoverPlayerDays(p,date){
  if(!p.life)return p;
  const days=daysBetween(p.life.lastEnergyDate||date,date);if(!days)return p;
  return {...p,energy:bounded(Math.round((p.energy??100)+days*(5+(p.stamina??80)/30)),0,100),life:{...p.life,lastEnergyDate:date}};
}
export function recordPlayerMinutes(p,minutes,date,quality,eligible=true){
  if(!p.life||!eligible)return p;
  const recent=[...p.life.recentMinutes,minutes].slice(-8),average=recent.reduce((v,n)=>v+n,0)/recent.length;
  const expected={key:65,starter:50,rotation:22,prospect:8}[p.contract?.role]||22;
  const missed=minutes>=15?0:p.life.missedMatches+1;
  const frustrated=recent.length>=4&&average<expected*.55;
  const ambitious=p.age<=25&&p.ovr>=quality+6&&(p.ratedMatches||0)>=8;
  const poorResults=(p.ratedMatches||0)>=8&&(p.ratingTotal/p.ratedMatches)<6.2;
  const happiness=bounded(p.life.happiness+(frustrated?-6:minutes>=expected?3:0)+(ambitious?-2:0),15,95);
  const wantsOut=happiness<35||ambitious&&happiness<55;
  const status=wantsOut?'wants-move':frustrated?'concerned':ambitious?'ambitious':happiness>=80?'happy':'settled';
  const reason=frustrated?`Playing time below ${SQUAD_ROLES[p.contract?.role]||'agreed'} expectations`:ambitious?'Ready for a stronger sporting project':poorResults?'Looking to rediscover form':'Satisfied with their squad role';
  const sharpness=minutes>=15?bounded((p.condition??100)+2+minutes/25,45,100):bounded((p.condition??100)-(missed>=2?3:0),45,100);
  return {...p,condition:Math.round(sharpness),life:{...p.life,recentMinutes:recent,missedMatches:missed,happiness,status,reason,lastPlayedDate:minutes>0?date:p.life.lastPlayedDate,lastEnergyDate:date}};
}
export function renewalWillingness(p,quality){
  if(p.age<=25&&p.ovr>=quality+7&&p.life?.ambition==='high')return {willing:false,reason:'Wants to test themselves at a stronger club.'};
  if(p.life?.status==='wants-move')return {willing:false,reason:p.life.reason};
  return {willing:true,reason:'Open to discussing their future.'};
}
export function agentTerms(p,quality=78,date='2026-08-15'){
  // New demands are simulation values, never labelled as a source wage.
  const base=p.contract?.wage??Math.round(Math.max(1000,Math.pow(Math.max(1,p.ovr-55),2)*125)/500)*500;
  const wage=Math.round(Math.max(base*1.06,Math.pow(Math.max(1,p.ovr-55),2)*100)*(p.age<=24?1.12:1)/500)*500;
  return {wage:bounded(wage,1000,2000000),years:p.age>=33?1:p.age>=29?2:p.age<=23?5:4,role:inferredRole(p,quality),date};
}
export function careerRow(p,clubId,season){return {season,clubId,appearances:p.ratedMatches||0,minutes:p.seasonMinutes||0,goals:p.seasonGoals||0,assists:p.seasonAssists||0,ratingTotal:p.ratingTotal||0,ratedMatches:p.ratedMatches||0,best:p.bestRating||0};}
export function archivePlayerSeason(p,clubId,season){
  const row={...careerRow(p,clubId,season),stintStart:p.life?.joinedDate||null},rows=(p.careerSeasons||[]).filter(r=>!(r.season===season&&r.clubId===clubId&&(r.stintStart||null)===row.stintStart));
  return {...p,careerSeasons:[...rows,row].slice(-80)};
}
export function beginPlayerStint(p,clubId,season){
  const archived=p.ratedMatches||p.seasonMinutes?archivePlayerSeason(p,clubId,season):p;
  return {...archived,appearances:0,seasonGoals:0,seasonAssists:0,seasonCleanSheets:0,seasonYellowCards:0,seasonRedCards:0,ratingTotal:0,ratedMatches:0,bestRating:0,motm:0,seasonMinutes:0,lastRating:null,competitionStats:{}};
}
export function playerPentagon(p){
  if(p.role==='GK')return ['Handling','Reflexes','Kicking','Speed','Positioning'].map((label,i)=>[label,p.sourceProfile?.abilities[i]??bounded(p.ovr+(i===3?-30:0),20,99)]);
  const a=p.attributes;if(a)return [['Attack',a.shooting],['Technique',a.dribbling],['Passing',a.passing],['Defence',a.defending],['Physical',a.physical]];
  const group=ROLE_GROUP[p.role],v=p.ovr;
  return [['Attack',bounded(v+(group==='FWD'?3:-18),20,99)],['Technique',bounded(v+(group==='MID'?2:-7),20,99)],['Passing',bounded(v+(group==='MID'?3:-9),20,99)],['Defence',bounded(v+(group==='DEF'?3:-25),20,99)],['Physical',p.stamina??80]];
}
export function signedContract(p,offer,date){
  const year=Number(date.slice(0,4))+offer.years;
  return {endDate:`${year}-06-30`,wage:offer.wage,role:offer.role,source:'career',signedDate:date};
}
export function evaluatePersonalTerms(p,offer,demands,round=1){
  if(!Number.isInteger(offer.years)||offer.years<1||offer.years>5||!Number.isFinite(offer.wage)||offer.wage<500||offer.wage>2000000||!SQUAD_ROLES[offer.role])throw Error('Choose 1–5 years, a valid weekly wage and a squad role.');
  const rank={prospect:0,rotation:1,starter:2,key:3};
  const suitableRole=rank[offer.role]>=rank[demands.role];
  const suitableYears=p.age>=32?offer.years<=demands.years+1:offer.years>=Math.max(1,demands.years-1)&&offer.years<=demands.years+1;
  if(offer.wage>=demands.wage*.95&&suitableRole&&suitableYears)return {status:'accepted',message:'Personal terms agreed. Your player is ready to sign.'};
  if(round>=3||offer.wage<demands.wage*.5)return {status:'rejected',message:'The agent has ended talks. No transfer fee was charged.'};
  const next={...demands,wage:Math.round(Math.max(offer.wage,demands.wage*.98)/500)*500};
  return {status:'counter',demands:next,message:!suitableRole?`They want a ${SQUAD_ROLES[demands.role].toLowerCase()} role.`:!suitableYears?`They prefer a ${demands.years}-year agreement.`:'The agent is asking for an improved weekly wage.'};
}
export function negotiateRenewal(input,playerId,offer){
  const s=ensurePlayerLife(input),club=s.clubs.find(c=>c.id===s.myClubId),p=club?.players.find(p=>p.id===playerId);
  if(!p||p.loan)throw Error('This player cannot renew here.');
  const date=s.currentDate||'2026-08-15',months=contractMonths(p,date);
  if(p.contract?.signedDate&&daysBetween(p.contract.signedDate,date)<180)throw Error('The player has just signed a contract. Let the new agreement settle before reopening talks.');
  if(months!==null&&months>24)throw Error('The player is happy with their existing contract. Talks open in the final two years.');
  const quality=[...club.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11).reduce((n,p)=>n+p.ovr,0)/11;
  const willingness=renewalWillingness(p,quality);if(!willingness.willing)throw Error(willingness.reason);
  const session=s.renewalTalks?.[playerId]||{round:1,demands:agentTerms(p,quality,date)};
  const result=evaluatePersonalTerms(p,offer,session.demands,session.round);
  let state={...s,renewalTalks:{...(s.renewalTalks||{}),[playerId]:result.status==='counter'?{round:session.round+1,demands:result.demands}:null}};
  if(result.status==='accepted'){
    state=mapLifeClubs(state,c=>c.id!==club.id?c:{...c,players:c.players.map(x=>x.id!==p.id?x:{...x,contract:signedContract(p,offer,date),life:{...x.life,happiness:Math.min(95,x.life.happiness+10),status:'settled',reason:'New contract agreed'}})});
    state={...state,mail:[{id:`contract:${p.id}:${date}`,date,type:'contract',read:false,subject:`${p.name} signs a new contract`,body:`${offer.years} years · ${wageLabel(offer.wage)} · ${SQUAD_ROLES[offer.role]}. Weekly payroll deductions are not enabled yet.`},...(state.mail||[])].slice(0,80)};
  }
  return {...result,...(result.status==='accepted'?{message:`${p.name} has signed a new contract.`}:{}),state};
}
export function advancePlayerLife(input,date){
  let s=ensurePlayerLife(input);const previous=s.lifeClockDate||s.currentDate||date;
  if(date<previous)return {state:s,arrived:false};
  const letters=[],freeAgents=[...(s.freeAgents||[])];
  s=mapLifeClubs(s,c=>{
    const quality=[...c.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11).reduce((v,p)=>v+p.ovr,0)/Math.max(1,Math.min(11,c.players.length));
    const players=c.players.map(p=>{
      const recovered=recoverPlayerDays(p,date),months=contractMonths(p,date);
      const recentlySigned=p.contract?.signedDate&&daysBetween(p.contract.signedDate,date)<180;
      if(c.id!==s.myClubId&&!p.loan&&!recentlySigned&&months>0&&months<=12&&p.life?.happiness>=55&&renewalWillingness(p,quality).willing)return {...recovered,contract:signedContract(p,agentTerms(p,quality,date),date)};
      return recovered;
    });
    const departing=players.filter(p=>!p.loan&&p.contract?.endDate>=previous&&p.contract.endDate<date);
    for(const p of departing){freeAgents.push({...archivePlayerSeason(p,c.id,s.season),club:null,loan:false});if(c.id===s.myClubId)letters.push({id:`expiry:${p.id}:${p.contract.endDate}`,type:'contract',date,read:false,subject:`${p.name} leaves at contract expiry`,body:'Their contract has ended. The player is now a free agent; no transfer fee was received.'});}
    return {...c,players:players.filter(p=>!departing.includes(p))};
  });
  const own=s.clubs.find(c=>c.id===s.myClubId);
  for(const p of own?.players||[]){
    const months=contractMonths(p,date),messageId=`life:${p.id}:${p.life?.status}`;
    if(p.life?.status==='wants-move'&&!(s.lifeEvents||[]).includes(messageId)){letters.push({id:messageId,type:'squad',date,read:false,subject:`${p.name} wants to discuss their future`,body:p.life.reason});s={...s,lifeEvents:[...(s.lifeEvents||[]),messageId].slice(-200)};}
    const reminder=`renew:${p.id}:${p.contract?.endDate}`;
    if(months>0&&months<=12&&contractMonths(p,previous)>12&&!(s.lifeEvents||[]).includes(reminder)){letters.push({id:reminder,type:'contract',date,read:false,subject:`Contract decision: ${p.name}`,body:'Less than a year remains. Open Squad Hub to negotiate a renewal or consider transfer offers.'});s={...s,lifeEvents:[...(s.lifeEvents||[]),reminder].slice(-200)};}
  }
  return {state:{...s,freeAgents,lifeClockDate:date,mail:[...letters,...(s.mail||[])].slice(0,80),lineup:Object.fromEntries(Object.entries(s.lineup||{}).filter(([,id])=>own?.players.some(p=>p.id===id)))},arrived:letters.length>0};
}
