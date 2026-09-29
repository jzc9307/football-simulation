import { CONTRACT_DATA } from '../data/contractsFc26.js';
import { ROLE_GROUP } from './config.js';
import { fundPlayerContract, releasePlayerWages, advancePayroll } from './finance.js';

export const PLAYER_POOLS=['clubs','plClubs','laligaClubs','serieaClubs','bundesligaClubs','ligue1Clubs','portugalClubs','championshipClubs','laliga2Clubs','serieBClubs','bundes2Clubs','ligue2Clubs','europeanGuestClubs'];
export const SQUAD_ROLES={key:'Key player',starter:'Regular starter',rotation:'Rotation',prospect:'Prospect'};
// Both eligible matches AND calendar patience must run out. A congested cup
// week must not turn a few missed selections into months of dissatisfaction.
export const PLAYING_TIME_POLICY={
  key:{warn:3,warnDays:21,request:10,requestDays:56,drain:6},
  starter:{warn:10,warnDays:42,request:24,requestDays:112,drain:3},
  rotation:{warn:16,warnDays:70,request:36,requestDays:180,drain:1.5},
  prospect:{warn:18,warnDays:180,request:Infinity,requestDays:Infinity,drain:.25},
};
export function isBackupGoalkeeper(p,club){
  if(p.role!=='GK'||p.contract?.role==='key')return false;
  const keepers=(club?.players||[]).filter(x=>x.role==='GK').sort((a,b)=>b.ovr-a.ovr||a.id.localeCompare(b.id));
  return keepers.length>1&&keepers[0].id!==p.id;
}
export function playingTimePolicy(p,club=null){
  const role=p.contract?.role||'rotation',base=PLAYING_TIME_POLICY[role]||PLAYING_TIME_POLICY.rotation;
  const backup=typeof club==='boolean'?club:club?isBackupGoalkeeper(p,club):!!p.life?.backupKeeper;
  if(p.role!=='GK'||!backup||role==='key')return {...base,backupKeeper:false};
  const keeper=role==='starter'?{warn:14,warnDays:84,request:32,requestDays:210,drain:1.5}:role==='prospect'?{warn:24,warnDays:270,request:Infinity,requestDays:Infinity,drain:.1}:{warn:24,warnDays:120,request:52,requestDays:270,drain:.6};
  return {...keeper,backupKeeper:true};
}
export const meaningfulMinutes=p=>Math.ceil(Math.max(15,({key:65,starter:50,rotation:22,prospect:8}[p.contract?.role]||22)*.55));
export const winningPlayerForm=p=>(p.life?.recentResults||[]).length>=4&&p.life.recentResults.filter(r=>r==='W').length/p.life.recentResults.length>=.6;
export function playingTimeReport(p,club){
  const policy=playingTimePolicy(p,club),life=p.life||{},threshold=meaningfulMinutes(p);
  // Older careers know minutes, not whether an appearance was a start. Never
  // invent that distinction; retain those minutes until fresh records replace it.
  const matches=life.recentSelections||(life.recentMinutes||[]).map(minutes=>({minutes,started:null,date:null}));
  const appearances=matches.filter(m=>m.minutes>0),unknown=appearances.some(m=>m.started==null);
  const missed=life.missedMatches||0,days=life.playingTimeDays||0;
  const status=life.transferRequested?'Transfer requested':life.complaintStage>=1?'Concerned':matches.length===0?'Building a picture':missed?'Patient':'Satisfied';
  const expectations=policy.backupKeeper?'Cup starts and injury cover. A reserve keeper is not expected to rotate like an outfield player.':p.contract?.role==='key'?'Frequent starts and substantial minutes.':p.contract?.role==='starter'?'Regular starts, with room for rest and competition.':p.contract?.role==='prospect'?'Development first. Occasional opportunities; no playing-time transfer demand.':'Occasional starts and useful substitute appearances.';
  return {policy,status,expectations,matches,unknown,appearances:appearances.length,starts:unknown?null:appearances.filter(m=>m.started).length,substitutes:unknown?null:appearances.filter(m=>!m.started).length,minutes:matches.reduce((n,m)=>n+m.minutes,0),meaningful:matches.filter(m=>m.minutes>=threshold).length,threshold,missed,days,winning:winningPlayerForm(p),warningReady:missed>=policy.warn&&days>=policy.warnDays,requestReady:missed>=policy.request&&days>=policy.requestDays&&(life.happiness??72)<=35,injuryPaused:life.lastSelectionEligible===false};
}
const playingTimeStage=(policy,missed,days,happiness)=>missed>=policy.request&&days>=policy.requestDays&&happiness<=35?2:missed>=policy.warn&&days>=policy.warnDays?1:0;
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
  if(s.playerLifeVersion===5)return s;
  const date=s.currentDate||'2026-08-15';
  const relieved=new Map(),unlisted=new Set();
  const next=mapLifeClubs(s,c=>{const sorted=[...c.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11),q=sorted.reduce((v,p)=>v+p.ovr,0)/Math.max(1,sorted.length);return {...c,players:c.players.map(player=>{
    const p=initialPlayerLife(player,q,date,c.budget),policy=playingTimePolicy(p,c);
    const missed=p.life.missedMatches||0;
    const days=p.life.playingTimeDays??Math.min(daysBetween(p.life.lastPlayedDate||p.life.joinedDate||date,date),missed*7);
    const life={...p.life,backupKeeper:policy.backupKeeper,playingTimeDays:days,lastSelectionDate:p.life.lastSelectionDate||date};
    const stage=playingTimeStage(policy,missed,days,p.life.happiness);
    // Do not undo ambition, a broken promise, or a deal already in progress.
    const playingTime=missed>0&&(p.life.complaintStage>0||/playing time|Playing time/.test(p.life.reason||''));
    const inTalks=s.market?.talks?.some(t=>t.playerId===p.id&&t.status==='pending');
    const premature=playingTime&&!inTalks&&(p.life.transferRequested?stage<2:(p.life.complaintStage||0)>stage);
    if(!premature)return {...p,life};
    relieved.set(p.id,stage);
    const formalLetter=s.mail?.some(m=>m.type==='transfer-request'&&(m.playerId||m.playerCard?.id)===p.id);
    if(p.life.transferRequested&&(life.forcedTransferListing===true||life.forcedTransferListing==null&&formalLetter))unlisted.add(p.id);
    return {...p,life:{...life,transferRequested:false,forcedTransferListing:false,complaintStage:stage,happiness:p.life.promise?.status==='failed'?p.life.happiness:Math.max(60,p.life.happiness),status:stage?'concerned':'settled',reason:stage?'Hoping for more first-team involvement':'Settled at the club'}};
  })};});
  return {...next,saleListings:(s.saleListings||[]).filter(id=>!unlisted.has(id)),mail:(s.mail||[]).map(m=>relieved.has(m.playerId||m.playerCard?.id)&&(m.type==='transfer-request'||relieved.get(m.playerId||m.playerCard?.id)===0&&['player-concern','player-opportunity'].includes(m.type))?{...m,concernResolved:true,read:true}:m),playerLifeVersion:5,lifeClockDate:s.lifeClockDate||date,lifeEvents:s.lifeEvents||[],freeAgents:s.freeAgents||[]};
}
export function recoverPlayerDays(p,date){
  if(!p.life)return p;
  const days=daysBetween(p.life.lastEnergyDate||date,date);if(!days)return p;
  return {...p,energy:bounded(Math.round((p.energy??100)+days*(5+(p.stamina??80)/30)),0,100),life:{...p.life,lastEnergyDate:date}};
}
export function recordPlayerMinutes(p,minutes,date,quality,eligible=true,result=null,selection={}){
  if(!p.life)return p;
  // Injury/suspension/loan absence is not a selection snub. Pause the patience
  // clock, including the interval before the player's return to eligibility.
  if(!eligible)return {...p,life:{...p.life,lastSelectionDate:date,lastSelectionEligible:false}};
  const recent=[...p.life.recentMinutes,minutes].slice(-8);
  const role=p.contract?.role||'rotation',policy=playingTimePolicy(p,selection.backupKeeper??p.life.backupKeeper);
  const meaningful=minutes>=meaningfulMinutes(p);
  const recentSelections=[...(p.life.recentSelections||(p.life.recentMinutes||[]).map(minutes=>({minutes,started:null,date:null}))),{minutes,started:minutes>0?selection.started??null:false,date}].slice(-10);
  const missed=meaningful?0:(p.life.missedMatches||0)+1;
  const playingTimeDays=meaningful||missed===1?0:(p.life.playingTimeDays||0)+(p.life.lastSelectionEligible===false?0:daysBetween(p.life.lastSelectionDate||date,date));
  const frustrated=missed>=policy.warn&&playingTimeDays>=policy.warnDays;
  const recentResults=[...(p.life.recentResults||[]),...(['W','D','L'].includes(result)?[result]:[])].slice(-6);
  const winning=winningPlayerForm({life:{recentResults}});
  const ambitious=p.age<=25&&p.ovr>=quality+6&&(p.ratedMatches||0)>=8;
  const poorResults=(p.ratedMatches||0)>=8&&(p.ratingTotal/p.ratedMatches)<6.2;
  const recovery=meaningful?(p.life.recoveryMatches||0)+1:0;
  let promise=p.life.promise,bonus=0;
  if(promise?.kind==='minutes'&&promise.status==='active'){
    const fulfilled=promise.fulfilled+(minutes>=25?1:0),remaining=Math.max(0,promise.remaining-1);
    const status=fulfilled>=promise.needed?'fulfilled':remaining===0?'failed':'active';
    promise={...promise,fulfilled,remaining,status,...(status!=='active'?{resolvedDate:date}:{})};
    bonus=status==='fulfilled'?10:status==='failed'?-15:0;
  }
  const happiness=+bounded(p.life.happiness+(meaningful?p.life.transferRequested?25:5:frustrated?-policy.drain*(winning?.5:1):0)+(ambitious?-2:0)+bonus,role==='prospect'?55:0,95).toFixed(2);
  const forced=playingTimeStage(policy,missed,playingTimeDays,happiness)===2;
  const transferRequested=role!=='prospect'&&(forced||!!p.life.transferRequested&&recovery<3);
  const wantsOut=role!=='prospect'&&(transferRequested||ambitious&&happiness<55);
  const status=wantsOut?'wants-move':frustrated?'concerned':ambitious?'ambitious':happiness>=80?'happy':'settled';
  const reason=transferRequested?'Formally requested a transfer over playing time':frustrated?role==='prospect'?'Hoping for a first-team opportunity':`Playing time below ${SQUAD_ROLES[role]} expectations${winning?' · winning form is helping morale':''}`:ambitious?'Ready for a stronger sporting project':poorResults?'Looking to rediscover form':'Satisfied with their squad role';
  const sharpness=minutes>=15?bounded((p.condition??100)+2+minutes/25,45,100):bounded((p.condition??100)-(missed>=2?3:0),45,100);
  const complaintStage=transferRequested?2:frustrated?1:0;
  const complaintEpisode=(p.life.complaintEpisode||0)+(complaintStage>0&&!p.life.complaintStage?1:0);
  return {...p,condition:Math.round(sharpness),life:{...p.life,...(promise?{promise}:{}),backupKeeper:policy.backupKeeper,recentSelections,recentMinutes:recent,recentResults,missedMatches:missed,playingTimeDays,lastSelectionDate:date,lastSelectionEligible:true,happiness,status,reason,complaintStage,complaintEpisode,transferRequested,recoveryMatches:recovery,lastPlayedDate:minutes>0?date:p.life.lastPlayedDate,lastEnergyDate:date}};
}
export const playerMailCard=p=>({id:p.id,name:p.name,ovr:p.ovr,role:p.role,squadRole:p.contract?.role,happiness:p.life?.happiness??72,endDate:p.contract?.endDate,wage:p.contract?.wage});
export function playerConcernMessages(input,date=input.currentDate){
  let s=input;const own=s.clubs?.find(c=>c.id===s.myClubId),letters=[],events=new Set(s.lifeEvents||[]);
  for(const p of own?.players||[]){
    if(p.loan)continue;
    const promise=p.life?.promise,promiseId=promise&&`promise:${p.id}:${promise.sourceMailId}:${promise.status}`;
    if(promise&&promise.status!=='active'&&!events.has(promiseId)){
      const kept=promise.status==='fulfilled';
      letters.push({id:promiseId,type:'promise-update',date,read:false,playerId:p.id,playerCard:playerMailCard(p),subject:`${p.name}: ${kept?'thank you for keeping your word':'we need to talk about your promise'}`,body:kept?'You followed through on our conversation. It means a lot to know I can trust your plans for me.':promise.kind==='minutes'?'You promised me meaningful minutes in two of the next five eligible matches. That did not happen, and I’m disappointed.':'We agreed to resolve my contract within 30 days. There is still no agreement, and I’m disappointed.'});events.add(promiseId);
    }
    const stage=p.life?.complaintStage||0,id=`concern:${p.id}:${p.life?.complaintEpisode||0}:${stage}`;
    if(stage&&!events.has(id)){
      const forced=stage===2,prospect=p.contract?.role==='prospect',policy=playingTimePolicy(p,own);
      letters.push({id,type:forced?'transfer-request':prospect?'player-opportunity':'player-concern',date,read:false,playerId:p.id,playerCard:playerMailCard(p),subject:forced?`${p.name} formally requests a transfer`:prospect?`${p.name} asks for an opportunity`:`${p.name} needs more playing time`,body:forced?`My playing-time concerns have not been addressed. I want to leave. Staff have placed me on the transfer list. Clubs can approach now; any agreed departure happens when the window opens.`:prospect?`I know I am developing and need to earn my place. Could you consider me for a substitute appearance or a cup match? I am keen to help the team, not asking to leave.`:`I understand a settled team and sensible rotation, but my ${SQUAD_ROLES[p.contract?.role].toLowerCase()} role promised more involvement. I have missed meaningful minutes in ${p.life.missedMatches} eligible matches. Please consider me for your plans. I am not asking to leave: that would only follow prolonged exclusion (at least ${policy.request} matches and ${Math.round(policy.requestDays/7)} weeks) if my happiness remains low.`});events.add(id);
      if(forced){
        const wasListed=(s.saleListings||[]).includes(p.id);
        s=mapLifeClubs(s,c=>c.id!==own.id?c:{...c,players:c.players.map(x=>x.id!==p.id?x:{...x,life:{...x.life,forcedTransferListing:x.life.forcedTransferListing===true||!wasListed}})});
        s={...s,saleListings:[...new Set([...(s.saleListings||[]),p.id])],loanListings:(s.loanListings||[]).filter(id=>id!==p.id),saleOffers:(s.saleOffers||[]).filter(o=>o.playerId!==p.id||o.kind!=='loan')};
      }
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
export function roleReviewTerms(p,club,date='2026-08-15'){
  const top=[...(club?.players||[])].sort((a,b)=>b.ovr-a.ovr).slice(0,11),quality=top.reduce((n,x)=>n+x.ovr,0)/Math.max(1,top.length);
  const current=p.contract?.role||'rotation';
  // A strong player will not surrender their status just because the manager
  // offers a bigger wage. Lower-rated depth players can agree to rotation.
  const protectedRole=p.ovr>=85||p.ovr>=quality-2||p.life?.ambition==='high'&&p.ovr>=quality-4;
  const role=!protectedRole&&(p.ovr<quality-4||isBackupGoalkeeper(p,club))&&['key','starter'].includes(current)?'rotation':current;
  return {years:0,keepExpiry:true,wage:p.contract?.wage||1000,role,date};
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
  if(offer.keepExpiry)return {endDate:p.contract.endDate,wage:offer.wage,role:offer.role,source:'career',...(p.contract.signedDate?{signedDate:p.contract.signedDate}:{}),amendedDate:date};
  const year=Number(date.slice(0,4))+offer.years;
  return {endDate:`${year}-06-30`,wage:offer.wage,role:offer.role,source:'career',signedDate:date};
}
export function evaluatePersonalTerms(p,offer,demands,round=1,{roleReview=false}={}){
  const validLength=roleReview?offer.keepExpiry===true&&offer.years===0&&!!p.contract?.endDate:offer.keepExpiry!==true&&Number.isInteger(offer.years)&&offer.years>=1&&offer.years<=5;
  if(!validLength||!Number.isFinite(offer.wage)||offer.wage<500||offer.wage>2000000||!SQUAD_ROLES[offer.role])throw Error('Choose a valid contract length, weekly wage and squad role. New signings need 1–5 years.');
  const rank={prospect:0,rotation:1,starter:2,key:3};
  const suitableRole=rank[offer.role]>=rank[demands.role];
  const suitableYears=roleReview|| (p.age>=32?offer.years<=demands.years+1:offer.years>=Math.max(1,demands.years-1)&&offer.years<=demands.years+1);
  if(offer.wage>=demands.wage*.95&&suitableRole&&suitableYears)return {status:'accepted',message:'Personal terms agreed. Your player is ready to sign.'};
  if(round>=3||offer.wage<demands.wage*.5)return {status:'rejected',message:roleReview&&!suitableRole?`${p.name} will not accept a reduced squad role. Their existing contract and expiry date are unchanged.`:'The agent has ended talks. No transfer fee was charged.'};
  const next={...demands,wage:Math.round(Math.max(offer.wage,demands.wage*.98)/500)*500};
  return {status:'counter',demands:next,message:!suitableRole?`They want a ${SQUAD_ROLES[demands.role].toLowerCase()} role.${roleReview?' Their ability and standing do not justify the proposed downgrade.':''}`:!suitableYears?`They prefer a ${demands.years}-year agreement.`:'The agent is asking for an improved weekly wage.'};
}
export function negotiateRenewal(input,playerId,offer){
  const s=ensurePlayerLife(input),club=s.clubs.find(c=>c.id===s.myClubId),p=club?.players.find(p=>p.id===playerId);
  if(!p||p.loan)throw Error('This player cannot renew here.');
  const date=s.currentDate||'2026-08-15',months=contractMonths(p,date);
  const roleReview=offer.keepExpiry===true;
  if(p.contract?.signedDate&&daysBetween(p.contract.signedDate,date)<180)throw Error('The player has just signed a contract. Let the new agreement settle before reopening talks.');
  if(!roleReview&&months!==null&&months>24)throw Error('The player is happy with their existing contract. Talks open in the final two years. You can discuss squad terms without extending the expiry date.');
  if(roleReview&&(!p.contract?.endDate||p.contract.endDate<=date))throw Error('An expired contract needs a new agreement, not a squad-role amendment.');
  if(roleReview&&p.contract.amendedDate&&daysBetween(p.contract.amendedDate,date)<90)throw Error('Squad terms were agreed recently. Let them settle for 90 days before reopening the role discussion.');
  if(roleReview&&offer.role===p.contract.role&&offer.wage===p.contract.wage)throw Error('Propose a different squad role or wage. The existing contract already has these terms.');
  const quality=[...club.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11).reduce((n,p)=>n+p.ovr,0)/11;
  const willingness=renewalWillingness(p,quality);if(!willingness.willing)throw Error(willingness.reason);
  const mode=roleReview?'role-review':'renewal',existing=s.renewalTalks?.[playerId];
  const session={round:existing?.round||1,demands:existing&&(existing.mode||'renewal')===mode?existing.demands:roleReview?roleReviewTerms(p,club,date):agentTerms(p,quality,date)};
  const result=evaluatePersonalTerms(p,offer,session.demands,session.round,{roleReview});
  let state={...s,renewalTalks:{...(s.renewalTalks||{}),[playerId]:result.status==='counter'?{mode,round:session.round+1,demands:result.demands}:null}};
  if(result.status==='accepted'){
    const contract=signedContract(p,offer,date);
    state=fundPlayerContract(state,p,offer.wage);
    state=mapLifeClubs(state,c=>c.id!==club.id?c:{...c,players:c.players.map(x=>{
      if(x.id!==p.id)return x;
      const changed={...x,contract},happiness=Math.min(95,x.life.happiness+(roleReview?5:10)),policy=playingTimePolicy(changed,c);
      const stage=playingTimeStage(policy,x.life.missedMatches||0,x.life.playingTimeDays||0,happiness);
      return {...changed,life:{...x.life,...(!roleReview&&x.life.promise?.kind==='renewal'&&x.life.promise.status==='active'?{promise:{...x.life.promise,status:'fulfilled',resolvedDate:date}}:{}),backupKeeper:policy.backupKeeper,happiness,complaintStage:stage,transferRequested:stage===2,status:stage===2?'wants-move':stage?'concerned':'settled',reason:roleReview?'Squad terms agreed · existing expiry date retained':'New contract agreed'}};
    })});
    state={...state,mail:[{id:`contract:${p.id}:${date}`,date,type:'contract',read:false,playerCard:playerMailCard({...p,contract}),subject:roleReview?`${p.name} agrees updated squad terms`:`${p.name} signs a new contract`,body:`${roleReview?`Existing expiry retained: ${contract.endDate}`:`${offer.years} years`} · ${wageLabel(offer.wage)} · ${SQUAD_ROLES[offer.role]}. Additional wages are funded from the transfer budget and paid from the wage reserve every week.`},...(state.mail||[])].slice(0,120)};
  }
  return {...result,...(result.status==='accepted'?{message:roleReview?`${p.name} agreed the squad terms. Their contract still ends on ${p.contract.endDate}; no extension was added.`:`${p.name} has signed a new contract.`}:{}),state};
}
export function aiWantsRenewal(p,club,quality){
  // Retain a playable squad, but do not automatically extend every veteran or
  // low-ceiling reserve. Their existing contract is honoured until expiry.
  if(club.players.length<=18)return true;
  const peers=club.players.filter(x=>x.id!==p.id&&ROLE_GROUP[x.role]===ROLE_GROUP[p.role]);
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
      let recovered=recoverPlayerDays(p,date);const months=contractMonths(p,date);
      if(p.life?.promise?.kind==='renewal'&&p.life.promise.status==='active'&&date>p.life.promise.deadline)recovered={...recovered,life:{...recovered.life,happiness:Math.max(0,recovered.life.happiness-15),promise:{...p.life.promise,status:'failed',resolvedDate:date}}};
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
export function loanThankYou(s,p,clubName){
  if(p.age>23)return s;
  const id=`loan-thanks:${p.id}:${s.currentDate}`;if(s.mail?.some(m=>m.id===id))return s;
  return {...s,...(s.managementVersion===1?{lifeAttentionPending:true}:{}),mail:[{id,date:s.currentDate,type:'loan-thanks',read:false,playerId:p.id,playerCard:playerMailCard(p),subject:`${p.name}: a chance to grow`,body:`Thank you for arranging my loan to ${clubName}. I think it is a good option for my development. I’m looking forward to regular football and coming back stronger.`},...(s.mail||[])].slice(0,120)};
}
