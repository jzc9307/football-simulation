// The calendar is intentionally a data layer, rather than a screen.  Every surface
// (league fixtures, calendar, cups and mail) consumes these same dated events.
const DAY=24*60*60*1000;
const iso=date=>new Date(date).toISOString().slice(0,10);
const addDays=(date,days)=>{const base=date instanceof Date?date:new Date(`${date}T12:00:00Z`);return new Date(base.getTime()+days*DAY);};
const SEASON_START={1:"2026-08-15"};

export const COMPETITIONS={
  PL:{name:"Premier League",short:"PL",kind:"league"}, LALIGA:{name:"La Liga",short:"LL",kind:"league"}, SERIEA:{name:"Serie A",short:"SA",kind:"league"}, BUNDES:{name:"Bundesliga",short:"BL",kind:"league"}, LIGUE1:{name:"Ligue 1",short:"L1",kind:"league"},
  CHAMPIONSHIP:{name:"Championship",short:"EFL",kind:"league"}, LALIGA2:{name:"LaLiga Hypermotion",short:"LL2",kind:"league"}, SERIEB:{name:"Serie B",short:"B",kind:"league"}, BUNDES2:{name:"2. Bundesliga",short:"2BL",kind:"league"}, LIGUE2:{name:"Ligue 2",short:"L2",kind:"league"},
  FA:{name:"FA Cup",short:"FA",kind:"cup"}, CARABAO:{name:"Carabao Cup",short:"EFL Cup",kind:"cup"}, COPA:{name:"Copa del Rey",short:"Copa",kind:"cup"}, COPPA:{name:"Coppa Italia",short:"Coppa",kind:"cup"}, DFB:{name:"DFB-Pokal",short:"DFB",kind:"cup"}, COUPE:{name:"Coupe de France",short:"Coupe",kind:"cup"},
  UCL:{name:"Champions League",short:"UCL",kind:"europe"},
};

export function competitionForCup(league,comp){
  if(comp==="fa")return "FA";
  if(comp==="carabao")return "CARABAO";
  if(comp==="copa")return "COPA";
  return ({SERIEA:"COPPA",BUNDES:"DFB",LIGUE1:"COUPE"}[league]||"FA");
}

export function leagueCompetition(league,division=1){
  if(division===2)return ({PL:"CHAMPIONSHIP",LALIGA:"LALIGA2",SERIEA:"SERIEB",BUNDES:"BUNDES2",LIGUE1:"LIGUE2"}[league]||league);
  return league;
}

function seasonStart(season){return SEASON_START[season]||iso(addDays(SEASON_START[1],(season-1)*365));}
function weekendForRound(season,roundIndex){
  // Five midweek league rounds keep the calendar plausible without colliding with the UCL windows.
  const extra=Math.floor(roundIndex/6)*3;
  return iso(addDays(seasonStart(season),roundIndex*7+extra));
}
function eventId(prefix,round,index){return `${prefix}:${round}:${index}`;}

export function buildLeagueSchedule({season,league,division=1,roundsHalf1=[],roundsHalf2=[]}){
  const competition=leagueCompetition(league,division), rounds=[...roundsHalf1,...roundsHalf2];
  return rounds.flatMap((pairs,roundIndex)=>pairs.map(([homeId,awayId],index)=>({
    id:eventId(`league-${competition}`,roundIndex+1,index), competition, kind:"league", round:roundIndex+1,
    date:weekendForRound(season,roundIndex), homeId, awayId, status:"scheduled",
  })));
}

const UCL_DATES=["2026-09-08","2026-10-13","2026-10-20","2026-11-03","2026-11-24","2026-12-08","2027-01-19","2027-01-27"];
export function uclDate(season,roundIndex){
  if(season===1)return UCL_DATES[roundIndex]||UCL_DATES.at(-1);
  return iso(addDays(UCL_DATES[Math.min(roundIndex,7)],(season-1)*365));
}
export function buildUclSchedule({season,rounds=[],myClubId}){
  return rounds.flatMap((pairs,roundIndex)=>pairs.filter(pair=>pair.includes(myClubId)).map(([homeId,awayId],index)=>({
    id:eventId("ucl",roundIndex+1,index),competition:"UCL",kind:"europe",round:roundIndex+1,date:uclDate(season,roundIndex),homeId,awayId,status:"scheduled",
  })));
}

const CUP_WINDOWS={
  PL:[ ["CARABAO","Round 1",21],["CARABAO","Round 2",42],["CARABAO","Round 3",70],["CARABAO","Round 4",98],["CARABAO","Quarter-Final",126],["FA","Third Round",147],["CARABAO","Semi-Final",161],["FA","Fourth Round",175],["FA","Fifth Round",203],["CARABAO","Final",217],["FA","Quarter-Final",231],["FA","Semi-Final",259],["FA","Final",280] ],
  LALIGA:[["COPA","Round of 32",147],["COPA","Round of 16",175],["COPA","Quarter-Final",203],["COPA","Semi-Final",231],["COPA","Final",280]],
  SERIEA:[["COPPA","Round of 16",140],["COPPA","Quarter-Final",175],["COPPA","Semi-Final",224],["COPPA","Final",287]],
  BUNDES:[["DFB","Round of 32",77],["DFB","Round of 16",140],["DFB","Quarter-Final",196],["DFB","Semi-Final",252],["DFB","Final",287]],
  LIGUE1:[["COUPE","Round of 64",140],["COUPE","Round of 32",168],["COUPE","Round of 16",196],["COUPE","Quarter-Final",224],["COUPE","Semi-Final",252],["COUPE","Final",287]],
};
export function buildCupSchedule({season,league,myClubId}){
  return (CUP_WINDOWS[league]||[]).map(([competition,round,offset],index)=>({
    id:eventId(`cup-${competition}`,round,index),competition,kind:"cup",round,date:iso(addDays(seasonStart(season),offset)),homeId:myClubId,awayId:null,status:"pending-draw",
  }));
}

export function createSeasonSchedule(state){
  if(!state.roundsHalf1)return [];
  const league=buildLeagueSchedule(state);
  const cups=state.myClubId?buildCupSchedule(state):[];
  const ucl=state.ucl?.rounds&&state.myClubId?buildUclSchedule({season:state.season,rounds:state.ucl.rounds,myClubId:state.myClubId}):[];
  return [...league,...cups,...ucl].sort((a,b)=>a.date.localeCompare(b.date)||a.competition.localeCompare(b.competition));
}

function resolveCalendarConflicts(schedule,myClubId){
  const result=schedule.map(event=>({...event}));
  const protectedEvents=result.filter(event=>(event.kind==="cup"||event.kind==="europe")&&(event.homeId===myClubId||event.awayId===myClubId));
  const moved=[];
  for(const priority of protectedEvents){
    const league=result.find(event=>event.kind==="league"&&(event.homeId===myClubId||event.awayId===myClubId)&&event.date===priority.date);
    if(!league)continue;
    let candidate=addDays(league.date,3);
    while(result.some(event=>event!==league&&(event.homeId===myClubId||event.awayId===myClubId)&&Math.abs(new Date(`${event.date}T12:00:00Z`)-candidate)<DAY*3))candidate=addDays(candidate,3);
    league.date=iso(candidate);league.rescheduled=true;moved.push(league);
  }
  return {schedule:result.sort((a,b)=>a.date.localeCompare(b.date)),moved};
}

export function attachSeasonSchedule(state){
  const {schedule,moved}=resolveCalendarConflicts(createSeasonSchedule(state),state.myClubId);
  const existing=state.mail||[];
  const notices=moved.map(event=>({id:`mail:${state.season}:fixture:${event.id}`,type:"fixture",subject:"Fixture rearranged",body:`A league fixture was moved to ${event.date} to make room for ${COMPETITIONS.UCL.name} or a domestic cup tie.`,competition:event.competition,date:event.date,read:false}));
  return {...state,seasonSchedule:schedule,mail:[...notices,...existing]};
}

export function recordScheduledResult(state,{competition,homeId,awayId,myGoals,oppGoals,round,notes}){
  const result={competition,homeId,awayId,myGoals,oppGoals,round,notes:notes||null};
  const seasonSchedule=(state.seasonSchedule||[]).map(event=>event.competition===competition&&event.homeId===homeId&&event.awayId===awayId&&event.status!=="completed"?{...event,status:"completed",result}:event);
  return {...state,seasonSchedule};
}

export function addMail(state,{type="update",subject,body,competition=null,date=null}){
  const item={id:`mail:${state.season}:${Date.now()}:${Math.random().toString(36).slice(2,7)}`,type,subject,body,competition,date:date||new Date().toISOString(),read:false};
  return {...state,mail:[item,...(state.mail||[])].slice(0,80)};
}

export function markMailRead(state,id){return {...state,mail:(state.mail||[]).map(item=>item.id===id?{...item,read:true}:item)};}

// Competition priority protects European ties.  A postponed league match is moved to the first
// following midweek with two clear rest days on each side; users receive an explicit staff mail.
export function rescheduleConflict(state,eventId){
  const schedule=[...(state.seasonSchedule||[])],target=schedule.find(event=>event.id===eventId);
  if(!target||target.kind!=="league")return state;
  const clubId=state.myClubId,occupied=schedule.filter(event=>event.id!==eventId&&(event.homeId===clubId||event.awayId===clubId)).map(event=>event.date);
  let candidate=addDays(target.date,3);
  while(occupied.some(date=>Math.abs(new Date(`${date}T12:00:00Z`)-candidate)<DAY*3))candidate=addDays(candidate,3);
  target.date=iso(candidate);target.rescheduled=true;
  return addMail({...state,seasonSchedule:schedule.sort((a,b)=>a.date.localeCompare(b.date))},{type:"fixture",competition:target.competition,subject:"Fixture rearranged",body:`Your league match has moved to ${target.date} to protect a cup or European fixture.`});
}
