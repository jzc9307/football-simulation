// Shared, persisted fixture calendar. UI and match execution use the same event IDs.
const DAY=86400000;
export const dateValue=date=>Date.parse(`${date}T12:00:00Z`);
export const addDays=(date,days)=>new Date(dateValue(date)+days*DAY).toISOString().slice(0,10);
export const CUP_KEYS={FA:"fa",CARABAO:"carabao",COPA:"copa",COPPA:"coppa",DFB:"dfb",COUPE:"coupe"};
export function competitionForCup(league,comp){return Object.keys(CUP_KEYS).find(id=>CUP_KEYS[id]===comp)||({SERIEA:"COPPA",BUNDES:"DFB",LIGUE1:"COUPE"}[league]||"FA");}
export function leagueCompetition(league,division=1){return division===2?({PL:"CHAMPIONSHIP",LALIGA:"LALIGA2",SERIEA:"SERIEB",BUNDES:"BUNDES2",LIGUE1:"LIGUE2"}[league]||league):league;}
export function seasonDate(season,month,day){return `${2025+season+(month<7?1:0)}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;}
function weekday(date,day){return addDays(date,(day-new Date(dateValue(date)).getUTCDay()+7)%7);}
export function seasonStart(season=1){return weekday(seasonDate(season,8,15),6);}
export function buildLeagueSchedule({season=1,league,division=1,roundsHalf1=[],roundsHalf2=[]}){
 const competition=leagueCompetition(league,division),rounds=[...roundsHalf1,...roundsHalf2];
 const dates=[];for(let date=seasonStart(season);date<=seasonDate(season,5,23);date=addDays(date,7))dates.push(date);
 const weekends=[...dates];let i=2;
 while(dates.length<rounds.length){dates.push(addDays(weekends[i],3));i+=4;}
 dates.sort();
 return rounds.flatMap((pairs,r)=>pairs.map(([homeId,awayId],j)=>({id:`league-${competition}:${r+1}:${j}`,competition,kind:"league",round:r+1,date:dates[r],homeId,awayId,status:"scheduled"})));
}
// UEFA's published 2026/27 match windows; subsequent seasons retain weekdays.
const UCL_DATES=[[9,8],[10,13],[10,20],[11,3],[11,24],[12,8],[1,19],[1,27]];
export function uclDate(season,index){const [m,d]=UCL_DATES[Math.min(index,7)];return weekday(seasonDate(season,m,d),index===7?3:2);}
export function buildUclSchedule({season=1,rounds=[]}){return rounds.flatMap((pairs,r)=>pairs.map(([homeId,awayId],j)=>({id:`ucl:${r+1}:${j}`,competition:"UCL",kind:"europe",round:r+1,date:uclDate(season,r),homeId,awayId,status:"scheduled"})));}
const POOLS={PL:["plClubs","championshipClubs"],LALIGA:["laligaClubs","laliga2Clubs"],SERIEA:["serieaClubs","serieBClubs"],BUNDES:["bundesligaClubs","bundes2Clubs"],LIGUE1:["ligue1Clubs","ligue2Clubs"]};
const CUP_DATES={FA:[[1,9],[1,30],[2,17],[3,13],[4,17],[5,15]],CARABAO:[[8,25],[9,22],[10,27],[12,15],[2,2],[3,7]],COPA:[[12,2],[12,16],[1,13],[2,3],[3,3],[4,24]],COPPA:[[8,12],[9,16],[12,2],[1,13],[3,3],[5,19]],DFB:[[8,12],[10,27],[12,1],[2,9],[4,20],[5,22]],COUPE:[[12,16],[1,6],[1,27],[2,24],[4,7],[5,22]]};
export function cupCompetitions(league){return league==="PL"?["FA","CARABAO"]:[{LALIGA:"COPA",SERIEA:"COPPA",BUNDES:"DFB",LIGUE1:"COUPE"}[league]].filter(Boolean);}
function seed(text){let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
export function buildCupSchedule(state){
 const clubs=[...new Map((POOLS[state.league]||[]).flatMap(key=>state[key]||[]).map(c=>[c.id,c])).values()];
 return cupCompetitions(state.league).flatMap(competition=>{
  const ids=clubs.map(c=>c.id).sort((a,b)=>seed(`${state.season}:${competition}:${a}`)-seed(`${state.season}:${competition}:${b}`));
  if(ids.length<2)return [];
  const size=2**Math.ceil(Math.log2(ids.length)),roundCount=Math.log2(size),events=[],byes=size-ids.length;let cursor=0;
  for(let r=0;r<roundCount;r++){
   const count=size/2**(r+1),remaining=count*2;
   const round=remaining===2?"Final":remaining===4?"Semi-Final":remaining===8?"Quarter-Final":competition==="FA"&&remaining===64?"Third Round":competition==="FA"&&remaining===32?"Fourth Round":competition==="FA"&&remaining===16?"Fifth Round":`Round of ${remaining}`;
   const [m,d]=CUP_DATES[competition][6-roundCount+r],date=weekday(seasonDate(state.season,m,d),competition==="FA"||remaining===2?6:3);
   for(let j=0;j<count;j++){
    const bye=r===0&&j<byes;
    const event={id:`cup-${competition}:${r}:${j}`,competition,comp:CUP_KEYS[competition],kind:"cup",round,roundIndex:r,date,status:r===0?"scheduled":"pending-draw",homeId:r===0?ids[cursor++]:null,awayId:r===0&&!bye?ids[cursor++]:null,neutral:remaining===2};
    if(r>0)event.feeders=[`cup-${competition}:${r-1}:${j*2}`,`cup-${competition}:${r-1}:${j*2+1}`];
    if(bye){event.status="bye";event.winnerId=event.homeId;}
    events.push(event);
   }
  }
  return advanceCupDraws(events);
 });
}
export function advanceCupDraws(schedule){
 const events=schedule.map(e=>({...e})),byId=new Map(events.map(e=>[e.id,e]));
 for(const e of events.filter(e=>e.feeders).sort((a,b)=>a.roundIndex-b.roundIndex)){
  if(e.status==="completed")continue;
  e.homeId=byId.get(e.feeders[0])?.winnerId||e.homeId;e.awayId=byId.get(e.feeders[1])?.winnerId||e.awayId;
  if(e.homeId&&e.awayId)e.status="scheduled";
 }
 return events;
}
export function isMyFixture(state,event){return event.homeId===state.myClubId||event.awayId===state.myClubId;}
export function nextFixture(state){return (state.seasonSchedule||[]).filter(e=>e.status==="scheduled"&&isMyFixture(state,e)).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id))[0]||null;}
export function requireScheduledFixture(state,competition){
 if(!state.scheduleVersion)return null;
 const next=nextFixture(state);if(!next||next.competition!==competition)throw new Error("Play the next scheduled fixture first.");return next;
}
export function resolveCalendarConflicts(schedule){
 const events=schedule.map(e=>({...e}));
 // Europe keeps its match windows. Move domestic cup rounds as a unit before
 // fitting league rounds around them, including clashes involving opponents.
 const protectedEvents=events.filter(e=>e.kind==="europe"&&e.status!=="cancelled");
 const cupRounds=new Map();
 for(const e of events.filter(e=>e.kind==="cup"&&!["cancelled","bye"].includes(e.status))){
  const key=`${e.competition}:${e.roundIndex}`;
  if(!cupRounds.has(key))cupRounds.set(key,[]);
  cupRounds.get(key).push(e);
 }
 for(const group of [...cupRounds.values()].sort((a,b)=>a[0].date.localeCompare(b[0].date))){
  const ids=new Set(group.flatMap(e=>[e.homeId,e.awayId]).filter(Boolean));
  let date=group[0].date;
  if(!group.some(e=>e.status==="completed")){
   for(let guard=0;guard<370;guard++){
    if(!protectedEvents.some(e=>Math.abs(dateValue(e.date)-dateValue(date))<3*DAY&&(!e.homeId||!e.awayId||group.some(t=>!t.homeId||!t.awayId)||ids.has(e.homeId)||ids.has(e.awayId))))break;
    date=addDays(date,1);
   }
   for(const e of group)if(e.date!==date){e.originalDate=e.originalDate||e.date;e.date=date;e.rescheduled=true;}
  }
  protectedEvents.push(...group);
 }
 const groups=new Map();for(const e of events.filter(e=>e.kind==="league")){if(!groups.has(e.round))groups.set(e.round,[]);groups.get(e.round).push(e);}
 let previous=null;
 for(const round of [...groups.keys()].sort((a,b)=>a-b)){
  const group=groups.get(round);let date=group[0].date;
  if(group.every(e=>e.status==="completed")){previous=date;continue;}
  if(previous&&dateValue(date)-dateValue(previous)<3*DAY)date=addDays(previous,3);
  const ids=new Set(group.flatMap(e=>[e.homeId,e.awayId]));
  for(let guard=0;guard<370;guard++){
   if(!protectedEvents.some(e=>Math.abs(dateValue(e.date)-dateValue(date))<3*DAY&&(!e.homeId||!e.awayId||ids.has(e.homeId)||ids.has(e.awayId))))break;
   date=addDays(date,1);
  }
  for(const e of group)if(e.date!==date){e.originalDate=e.originalDate||e.date;e.date=date;e.rescheduled=true;}
  previous=date;
 }
 return events.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
export function createSeasonSchedule(state){return resolveCalendarConflicts([...buildLeagueSchedule(state),...buildCupSchedule(state),...buildUclSchedule({season:state.season,rounds:state.ucl?.rounds||[]})]);}
export function attachSeasonSchedule(state){
 if(!state.roundsHalf1||state.scheduleVersion===2)return state;
 let schedule=createSeasonSchedule(state);
 schedule=schedule.map(event=>{
  const old=(state.seasonSchedule||[]).find(e=>e.competition===event.competition&&e.round===event.round&&e.homeId===event.homeId&&e.awayId===event.awayId&&e.status==="completed");
  const result=(state.fixtureResults||[]).find(r=>r.round===event.round&&r.homeId===event.homeId&&r.awayId===event.awayId&&event.kind==="league");
  const own=event.kind==="league"&&isMyFixture(state,event)?[...(state.results1||[]),...(state.results2||[])].find(r=>r.gw===event.round):null;
  const europe=event.kind==="europe"&&isMyFixture(state,event)?state.ucl?.campaignResults?.find(r=>r.opponentId===(event.homeId===state.myClubId?event.awayId:event.homeId)&&r.stage==="League Phase"):null;
  if(result)return {...event,status:"completed",result};
  if(own||europe){const r=own||europe;return {...event,status:"completed",result:{homeGoals:r.isHome?r.myGoals:r.oppGoals,awayGoals:r.isHome?r.oppGoals:r.myGoals}};}
  return old?{...event,status:"completed",result:old.result}:event;
 });
 return {...state,scheduleVersion:2,seasonSchedule:schedule,currentDate:state.currentDate||seasonStart(state.season),mail:state.mail||[]};
}
export function recordScheduledResult(state,{competition,homeId,awayId,myGoals,oppGoals,round,notes,winnerId,fixtureId}){
 let played;
 const events=(state.seasonSchedule||[]).map(e=>{
  if(e.status!=="scheduled"||(fixtureId?e.id!==fixtureId:e.competition!==competition||e.homeId!==homeId||e.awayId!==awayId||(round!=null&&e.round!==round)))return e;
  played=e;return {...e,status:"completed",winnerId:winnerId||null,result:{homeGoals:myGoals,awayGoals:oppGoals,notes:notes||null}};
 });
 return {...state,seasonSchedule:advanceCupDraws(events),currentDate:played?.date||state.currentDate};
}
export function addMail(state,{type="update",subject,body,competition=null,date=null}){return {...state,mail:[{id:`mail:${state.season}:${Date.now()}:${Math.random().toString(36).slice(2,7)}`,type,subject,body,competition,date:date||state.currentDate||seasonStart(state.season),read:false},...(state.mail||[])].slice(0,80)};}
export function markMailRead(state,id){return {...state,mail:(state.mail||[]).map(item=>item.id===id?{...item,read:true}:item)};}
export function rescheduleConflict(state,eventId){
 const target=state.seasonSchedule?.find(e=>e.id===eventId);if(!target||target.kind!=="league")return state;
 const seasonSchedule=resolveCalendarConflicts(state.seasonSchedule),updated=seasonSchedule.find(e=>e.id===eventId);
 return updated.date===target.date?state:addMail({...state,seasonSchedule},{type:"fixture",subject:"Fixture rearranged",body:`Your league match has moved to ${updated.date} to protect recovery time for both clubs.`,competition:target.competition});
}
export function syncKnockoutSchedule(state){
 if(state.ucl?.knockoutBracket?.calendarDriven)return state;
 const u=state.ucl;if(!u?.knockoutRounds?.length||u.stage==="final")return state;
 const name=u.knockoutRounds[u.knockoutRoundIndex],leg=u.leg||1,id=`ucl-ko:${name}:${leg}`;
 if(state.seasonSchedule.some(e=>e.id===id))return state;
 const windows={"Playoff":[[2,16],[2,23]],"Round of 16":[[3,9],[3,16]],"Quarter-Final":[[4,6],[4,13]],"Semi-Final":[[4,27],[5,4]],"Final":[[5,29]]};
 const [m,d]=windows[name][leg-1],neutral=name==="Final",home=neutral||(leg===1?true:!u.firstLegHomeA);
 const event={id,competition:"UCL",kind:"europe",round:name,leg,date:weekday(seasonDate(state.season,m,d),neutral?6:2),homeId:home?state.myClubId:u.currentKnockoutOpponentId,awayId:home?u.currentKnockoutOpponentId:state.myClubId,status:"scheduled",neutral};
 const seasonSchedule=resolveCalendarConflicts([...state.seasonSchedule,event]);
 let next={...state,seasonSchedule};
 for(const e of seasonSchedule.filter(e=>e.kind==="league"&&isMyFixture(state,e)&&state.seasonSchedule.find(old=>old.id===e.id)?.date!==e.date))next=addMail(next,{type:"fixture",competition:e.competition,subject:"Fixture rearranged",body:`Your league fixture has moved to ${e.date} following the Champions League draw.`});
 return next;
}
