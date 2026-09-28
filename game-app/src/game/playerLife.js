import { CONTRACT_DATA } from '../data/contractsFc26.js';
import { ROLE_GROUP } from './config.js';
import { fundPlayerContract, releasePlayerWages, advancePayroll } from './finance.js';

export const PLAYER_POOLS=['clubs','plClubs','laligaClubs','serieaClubs','bundesligaClubs','ligue1Clubs','portugalClubs','championshipClubs','laliga2Clubs','serieBClubs','bundes2Clubs','ligue2Clubs','europeanGuestClubs'];
export const SQUAD_ROLES={key:'Key player',starter:'Regular starter',rotation:'Rotation',prospect:'Prospect'};
export const PLAYING_TIME_POLICY={key:{warn:2,request:6,drain:15},starter:{warn:6,request:14,drain:6},rotation:{warn:10,request:22,drain:3},prospect:{warn:12,request:Infinity,drain:1}};
const bounded=(n,min,max)=>Math.max(min,Math.min(max,n));
export const daysBetween=(a,b)=>Math.max(0,Math.floor((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000));
export const contractMonths=(p,date)=>p.contract?.endDate?Math.ceil((Date.parse(p.contract.endDate+'T12:00:00Z')-Date.parse(date+'T12:00:00Z'))/86400000/30.44):null;
export const wageLabel=wage=>Number.isFinite(wage)?`£${wage.toLocaleString('en-GB')} / week`:'Source unavailable';
export function inferredRole(p,quality){return p.age<=21&&p.ovr<quality-5?'prospect':p.ovr>=quality+2?'key':p.ovr>=quality-3?'starter':'rotation';}
const seed=id=>[...String(id)].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,7);
export function estimatedContract(p,quality=78,date='2026-08-15',clubBudget=10){
  const old=p.age>=(p.role==='GK'?35:32),young=p.age<=23;
  const prospect=(p.potential||p.ovr)-p.ovr>=5;
  const financeFactor=bounded(.65+Math.sqrt(Math.max(0,clubBudget))/12,.7,1.6);
  const raw=Math.pow(Math.max(1,p.ovr-48),3)*1.4*financeFactor*(old?.78:young&&!prospect?.75:1);
  const wage=bounded(Math.round(raw/500)*500,500,250000),years=old?1:2+seed(p.id)%2;
  return {wage,endDate:`${Number(date.slice(0,4))+years}-06-30`,role:inferredRole(p,quality),source:'estimated',estimatedAt:date};
}
export function initialPlayerLife(p,quality=78,date='2026-08-15',clubBudget=10){
  const data=CONTRACT_DATA[p.slug],youth=p.slug?.startsWith('youth-');
  const existing=p.contract&&p.contract.wage!==null&&p.contract.endDate!==null;
  const contract=existing?p.contract:data?{endDate:`${data[0]}-06-30`,wage:data[1],role:p.contract?.role||inferredRole(p,quality),source:'futwiz-fc26',sourceUrl:`https://www.futwiz.com/fc26/career-mode/player/${data[3]}/${data[2]}`}:youth?{endDate:`${Number(date.slice(0,4))+3}-06-30`,wage:1000,role:'prospect',source:'career'}:estimatedContract(p,quality,date,clubBudget);
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
  if(s.playerLifeVersion===3)return s;
  const date=s.currentDate||'2026-08-15';
  const relieved=new Set();
  const next=mapLifeClubs(s,c=>{const sorted=[...c.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11),q=sorted.reduce((v,p)=>v+p.ovr,0)/Math.max(1,sorted.length);return {...c,players:c.players.map(player=>{
    const p=initialPlayerLife(player,q,date,c.budget),policy=PLAYING_TIME_POLICY[p.contract.role]||PLAYING_TIME_POLICY.rotation;
    // Relax only the former playing-time policy, not ambition or an agreed deal.
    const premature=p.contract.role!=='key'&&p.life.transferRequested&&(p.life.missedMatches||0)<policy.request&&!s.market?.talks?.some(t=>t.playerId===p.id&&t.status==='pending');
    if(!premature)return p;
    relieved.add(p.id);const stage=(p.life.missedMatches||0)>=policy.warn?1:0;
    return {...p,life:{...p.life,transferRequested:false,complaintStage:stage,happiness:Math.max(60,p.life.happiness),status:stage?'concerned':'settled',reason:stage?'Hoping for more first-team involvement':'Settled at the club'}};
  })};});
  return {...next,saleListings:(s.saleListings||[]).filter(id=>!relieved.has(id)),playerLifeVersion:3,lifeClockDate:s.lifeClockDate||date,lifeEvents:s.lifeEvents||[],freeAgents:s.freeAgents||[]};
}
export function recoverPlayerDays(p,date){
  if(!p.life)return p;
  const days=daysBetween(p.life.lastEnergyDate||date,date);if(!days)return p;
  return {...p,energy:bounded(Math.round((p.energy??100)+days*(5+(p.stamina??80)/30)),0,100),life:{...p.life,lastEnergyDate:date}};
}
export function recordPlayerMinutes(p,minutes,date,quality,eligible=true){
  if(!p.life||!eligible)return p;
  const recent=[...p.life.recentMinutes,minutes].slice(-8);
  const role=p.contract?.role||'rotation',policy=PLAYING_TIME_POLICY[role]||PLAYING_TIME_POLICY.rotation;
  const expected={key:65,starter:50,rotation:22,prospect:8}[p.contract?.role]||22;
  const meaningful=minutes>=Math.max(15,expected*.55);
  const missed=meaningful?0:(p.life.missedMatches||0)+1;
  const frustrated=missed>=policy.warn;
  const ambitious=p.age<=25&&p.ovr>=quality+6&&(p.ratedMatches||0)>=8;
  const poorResults=(p.ratedMatches||0)>=8&&(p.ratingTotal/p.ratedMatches)<6.2;
  const forced=missed>=policy.request;
  const recovery=meaningful?(p.life.recoveryMatches||0)+1:0;
  const transferRequested=role!=='prospect'&&(forced||!!p.life.transferRequested&&recovery<3);
  const happiness=forced?0:bounded(p.life.happiness+(meaningful?p.life.transferRequested?25:5:frustrated?-policy.drain:0)+(ambitious?-2:0),transferRequested?0:role==='prospect'?55:role==='key'?0:36,95);
  const wantsOut=role!=='prospect'&&(transferRequested||happiness<35||ambitious&&happiness<55);
  const status=wantsOut?'wants-move':frustrated?'concerned':ambitious?'ambitious':happiness>=80?'happy':'settled';
  const reason=transferRequested?'Formally requested a transfer over playing time':frustrated?role==='prospect'?'Hoping for a first-team opportunity':`Playing time below ${SQUAD_ROLES[role]} expectations`:ambitious?'Ready for a stronger sporting project':poorResults?'Looking to rediscover form':'Satisfied with their squad role';
  const sharpness=minutes>=15?bounded((p.condition??100)+2+minutes/25,45,100):bounded((p.condition??100)-(missed>=2?3:0),45,100);
  const complaintStage=transferRequested?2:missed>=policy.warn?1:0;
  const complaintEpisode=(p.life.complaintEpisode||0)+(complaintStage>0&&!p.life.complaintStage?1:0);
  return {...p,condition:Math.round(sharpness),life:{...p.life,recentMinutes:recent,missedMatches:missed,happiness,status,reason,complaintStage,complaintEpisode,transferRequested,recoveryMatches:recovery,lastPlayedDate:minutes>0?date:p.life.lastPlayedDate,lastEnergyDate:date}};
}
export const playerMailCard=p=>({id:p.id,name:p.name,ovr:p.ovr,role:p.role,squadRole:p.contract?.role,happiness:p.life?.happiness??72,endDate:p.contract?.endDate,wage:p.contract?.wage});
export function playerConcernMessages(input,date=input.currentDate){
  let s=input;const own=s.clubs?.find(c=>c.id===s.myClubId),letters=[],events=new Set(s.lifeEvents||[]);
  for(const p of own?.players||[]){
    if(p.loan)continue;
    const stage=p.life?.complaintStage||0,id=`concern:${p.id}:${p.life?.complaintEpisode||0}:${stage}`;
    if(stage&&!events.has(id)){
      const forced=stage===2,prospect=p.contract?.role==='prospect',policy=PLAYING_TIME_POLICY[p.contract?.role||'rotation'];
      letters.push({id,type:forced?'transfer-request':prospect?'player-opportunity':'player-concern',date,read:false,playerId:p.id,playerCard:playerMailCard(p),subject:forced?`${p.name} formally requests a transfer`:prospect?`${p.name} asks for an opportunity`:`${p.name} needs more playing time`,body:forced?`My playing-time concerns have not been addressed. I want to leave. Staff have placed me on the transfer list. Clubs can approach now; any agreed departure happens when the window opens.`:prospect?`I know I am developing and need to earn my place. Could you consider me for a substitute appearance or a cup match? I am keen to help the team, not asking to leave.`:`My ${SQUAD_ROLES[p.contract?.role].toLowerCase()} role promised more involvement. I have missed meaningful minutes in ${p.life.missedMatches} consecutive matches. Please give me a place in your plans; a formal transfer request follows at ${policy.request} missed matches if nothing changes.`});events.add(id);
      if(forced)s={...s,saleListings:[...new Set([...(s.saleListings||[]),p.id])],loanListings:(s.loanListings||[]).filter(id=>id!==p.id),saleOffers:(s.saleOffers||[]).filter(o=>o.playerId!==p.id||o.kind!=='loan')};
    }
    const months=contractMonths(p,date),reminder=`renew:${p.id}:${p.contract?.endDate}`;
    if(months>0&&months<=24&&p.life?.happiness>=65&&!(p.contract?.signedDate&&daysBetween(p.contract.signedDate,date)<180)&&!events.has(reminder)){
      letters.push({id:reminder,type:'renewal-invite',date,read:false,playerId:p.id,playerCard:playerMailCard(p),subject:`${p.name} would like to stay`,body:`I am happy with my place at the club. With ${months} months remaining on my agreement, could we discuss a new contract? My agent is available in Squad Hub.`});events.add(reminder);
    }
  }
  return {state:{...s,lifeAttentionPending:s.lifeAttentionPending||letters.length>0,lifeEvents:[...events].slice(-600),mail:[...letters,...(s.mail||[])].slice(0,120)},arrived:letters.length>0};
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
    state=fundPlayerContract(state,p,offer.wage);
    state=mapLifeClubs(state,c=>c.id!==club.id?c:{...c,players:c.players.map(x=>x.id!==p.id?x:{...x,contract:signedContract(p,offer,date),life:{...x.life,happiness:Math.min(95,x.life.happiness+10),status:'settled',reason:'New contract agreed'}})});
    state={...state,mail:[{id:`contract:${p.id}:${date}`,date,type:'contract',read:false,playerCard:playerMailCard({...p,contract:signedContract(p,offer,date)}),subject:`${p.name} signs a new contract`,body:`${offer.years} years · ${wageLabel(offer.wage)} · ${SQUAD_ROLES[offer.role]}. Additional wages are funded from the transfer budget and paid from the wage reserve every week.`},...(state.mail||[])].slice(0,120)};
  }
  return {...result,...(result.status==='accepted'?{message:`${p.name} has signed a new contract.`}:{}),state};
}
export function aiWantsRenewal(p,club,quality){
  // Retain a playable squad, but do not automatically extend every veteran or
  // low-ceiling reserve. Their existing contract is honoured until expiry.
  if(club.players.length<=18)return true;
  const peers=club.players.filter(x=>x.id!==p.id&&x.role===p.role);
  if(p.role==='GK'&&!peers.length)return true;
  const old=p.age>=(p.role==='GK'?35:32);
  const ceiling=p.potential??p.ovr;
  if(old&&p.ovr<quality-5&&peers.some(x=>x.ovr>=p.ovr))return false;
  return !(p.ovr<quality-10&&ceiling<quality-3&&peers.length>=2);
}
export function advancePlayerLife(input,date){
  let s=ensurePlayerLife(input);const previous=s.lifeClockDate||s.currentDate||date;
  if(date<previous)return {state:s,arrived:false};
  // A season-finalisation jump must settle earned wages before removing the
  // June-expiring players. Payroll itself caps each account at its expiry date.
  s=advancePayroll(s,date);
  const letters=[],freeAgents=[...(s.freeAgents||[])];
  s=mapLifeClubs(s,c=>{
    const quality=[...c.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11).reduce((v,p)=>v+p.ovr,0)/Math.max(1,Math.min(11,c.players.length));
    const players=c.players.map(p=>{
      const recovered=recoverPlayerDays(p,date),months=contractMonths(p,date);
      const recentlySigned=p.contract?.signedDate&&daysBetween(p.contract.signedDate,date)<180;
      if(c.id!==s.myClubId&&!p.loan&&!recentlySigned&&months>0&&months<=12&&p.life?.happiness>=55&&renewalWillingness(p,quality).willing&&aiWantsRenewal(p,c,quality))return {...recovered,contract:signedContract(p,agentTerms(p,quality,date),date)};
      return recovered;
    });
    const departing=players.filter(p=>!p.loan&&p.contract?.endDate>=previous&&p.contract.endDate<date);
    for(const p of departing){freeAgents.push({...archivePlayerSeason(p,c.id,s.season),club:null,loan:false,formerClubId:c.id,freeAgentDecisionDate:new Date(Date.parse(date+'T12:00:00Z')+2*86400000).toISOString().slice(0,10)});if(c.id===s.myClubId)letters.push({id:`expiry:${p.id}:${p.contract.endDate}`,type:'contract',date,read:false,playerCard:playerMailCard(p),subject:`${p.name} leaves at contract expiry`,body:'Their contract has ended. The player is now a free agent; no transfer fee was received. Interested clubs can now offer personal terms.'});}
    return {...c,players:players.filter(p=>!departing.includes(p))};
  });
  const own=s.clubs.find(c=>c.id===s.myClubId);
  for(const p of own?.players||[]){
    const messageId=`life:${p.id}:${p.life?.status}`;
    if(p.life?.status==='wants-move'&&!p.life.complaintStage&&!(s.lifeEvents||[]).includes(messageId)){letters.push({id:messageId,type:'player-concern',date,read:false,playerId:p.id,playerCard:playerMailCard(p),subject:`${p.name} wants to discuss their future`,body:p.life.reason});s={...s,lifeEvents:[...(s.lifeEvents||[]),messageId].slice(-600)};}
  }
  for(const p of freeAgents.filter(p=>!input.freeAgents?.some(x=>x.id===p.id)))s=releasePlayerWages(s,p.id,date);
  const concerns=playerConcernMessages({...s,freeAgents,lifeClockDate:date,mail:[...letters,...(s.mail||[])].slice(0,120),lineup:Object.fromEntries(Object.entries(s.lineup||{}).filter(([,id])=>own?.players.some(p=>p.id===id)))},date);
  return {state:advancePayroll(concerns.state,date),arrived:letters.length>0||concerns.arrived};
}
