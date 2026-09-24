import { ensureFixtures, findClubAnywhere, topXI, aiTactics, simMatchSmart, addExtraTime, simulateShootout, performanceUpdatesForMatch, applyPerformanceUpdates, computeTableArray, roundRobin, initTable } from "./engine.js";
import { createUclCampaign, uclQualified } from "./uclSelection.js";
import { autoLineup, unavailablePlayerIds } from "./engine.js";
import { FORMATIONS } from "./config.js";
import { playLeagueRound, playDomesticCup, playEuropeanLeague, advanceEuropeanLeague, startEuropeanKnockout, playEuropeanKnockout, advanceEuropeanKnockout } from "./actions.js";
import { nextFixture, syncKnockoutSchedule, recordScheduledResult, isMyFixture, addMail, advanceCupDraws, CUP_KEYS } from "./seasonSchedule.js";

// Finish AI cup ties only when their date arrives. Winners populate the next draw.
export function advanceCupWorld(state,throughDate){
 let s=state;
 for(let pass=0;pass<12;pass++){
  const due=s.seasonSchedule.filter(e=>e.kind==="cup"&&e.status==="scheduled"&&e.date<=throughDate&&!isMyFixture(s,e)).sort((a,b)=>a.date.localeCompare(b.date));
  if(!due.length)break;
  const updates=[];
  for(const event of due){
   const home=findClubAnywhere(s,event.homeId),away=findClubAnywhere(s,event.awayId);
   if(!home||!away)continue;
   const a=topXI(home.players,home.preferredFormation),b=topXI(away.players,away.preferredFormation),ta=aiTactics(home),tb=aiTactics(away);
   let match=simMatchSmart(a,b,event.neutral?null:true,ta,tb);
   if(match.goalsA===match.goalsB)match=addExtraTime(match,a,b,event.neutral?null:true,ta,tb);
   const pens=match.goalsA===match.goalsB?simulateShootout(a,b):null;
   const winnerId=(pens?pens.wonA:match.goalsA>match.goalsB)?home.id:away.id;
   updates.push(...performanceUpdatesForMatch(match,home.id,away.id,event.comp));
   s=recordScheduledResult(s,{fixtureId:event.id,myGoals:match.goalsA,oppGoals:match.goalsB,winnerId,notes:pens?"Decided on penalties":null});
  }
  // Apply each match separately: a player can appear in several historical rounds.
  s=applyPerformanceUpdates(s,updates,false);
 }
 return s;
}

export function prepareNextFixture(input){
 let s=ensureFixtures(input);
 if(!s.ucl&&uclQualified(s)&&!s.results1.length&&!s.results2.length){
  s=ensureFixtures({...s,ucl:createUclCampaign(s,roundRobin,initTable),scheduleVersion:null});
 }
 s=syncKnockoutSchedule(s);
 for(let pass=0;pass<15;pass++){
  const next=nextFixture(s),limit=next?.date||s.seasonSchedule.at(-1)?.date;
  if(!limit)break;
  const pending=s.seasonSchedule.some(e=>e.kind==="cup"&&e.status==="scheduled"&&!isMyFixture(s,e)&&e.date<=limit);
  if(!pending)break;
  s=advanceCupWorld(s,limit);
 }
 const event=nextFixture(s);
 if(!event){
  const table=computeTableArray(s.tableRaw,s.clubs);
  return {...s,activeFixtureId:null,stage:"full-results",table1:s.table1||table,tableFinal:table};
 }
 if(event.kind==="league"&&event.round>s.roundsHalf1.length&&!s.midSeasonDone){
  return {...s,stage:"half-results",table1:computeTableArray(s.tableRaw,s.clubs),activeFixtureId:null};
 }
 const dated={...s,currentDate:event.date,activeFixtureId:event.id};
 if(event.kind==="europe"){
  const knockout=typeof event.round==="string";
  return {...dated,stage:"ucl",ucl:{...s.ucl,roundIndex:knockout?s.ucl.roundIndex:event.round-1,stage:knockout?"knockout-prep":"match-prep"}};
 }
 if(event.kind==="cup")return {...dated,stage:"matchday-prep"};
 const half=event.round<=s.roundsHalf1.length?1:2;
 return {...dated,stage:"matchday-prep",half,roundIndex:event.round-1-(half===2?s.roundsHalf1.length:0)};
}

export function migrateSeason(input){
 let s=ensureFixtures(input);
 if(!s.myClubId||["mode","select","league-select","game-over"].includes(s.stage))return s;
 if(s.scheduleMigrationDone)return s;
 // Preserve already played rounds in old saves; reconstruct results without replaying them.
 const completed=[...(s.results1||[]),...(s.results2||[])];
 s={...s,seasonSchedule:s.seasonSchedule.map(e=>{
  if(e.kind==="league"&&completed.some(r=>r.gw===e.round))return {...e,status:"completed"};
  if(e.kind==="europe"&&typeof e.round==="number"&&e.round<=(s.ucl?.campaignResults||[]).filter(r=>r.stage==="League Phase").length)return {...e,status:"completed"};
  return e;
 }),scheduleMigrationDone:true};
 if(s.half===2)s.midSeasonDone=true;
 let restoredCups=false;
 for(const [competition,key] of Object.entries(CUP_KEYS)){
  const history=s.cupStatus[key]?.results||[];if(!history.length)continue;
  restoredCups=true;
  for(const result of history){
   let event=s.seasonSchedule.filter(e=>e.competition===competition&&isMyFixture(s,e)&&!["completed","cancelled"].includes(e.status)).sort((a,b)=>(a.roundIndex||0)-(b.roundIndex||0))[0];
   if(!event)break;
   // A legacy bye was implicit: preserve it, then attach the saved tie to its successor.
   while(event.status==="bye"){
    s={...s,seasonSchedule:advanceCupDraws(s.seasonSchedule)};
    event=s.seasonSchedule.find(e=>e.feeders?.includes(event.id));
    if(!event)break;
   }
   if(!event)break;
   const originalOpponent=event.homeId===s.myClubId?event.awayId:event.homeId;
   let events=s.seasonSchedule.map(e=>{
    if(e.id===event.id)return {...e,round:result.round,homeId:result.homeA?s.myClubId:result.opponentId,awayId:result.homeA?result.opponentId:s.myClubId,status:"completed",winnerId:result.won?s.myClubId:result.opponentId,result:{homeGoals:result.homeA?result.myGoals:result.oppGoals,awayGoals:result.homeA?result.oppGoals:result.myGoals,notes:result.wentToPens?"Decided on penalties":null}};
    if(e.competition===competition&&e.roundIndex===event.roundIndex&&e.status!=="completed"&&originalOpponent)return {...e,homeId:e.homeId===result.opponentId?originalOpponent:e.homeId,awayId:e.awayId===result.opponentId?originalOpponent:e.awayId};
    return e;
   });
   events=advanceCupDraws(events);
   s={...s,seasonSchedule:events};
  }
 }
 if(restoredCups)s=addMail(s,{type:"fixture",subject:"Calendar upgraded",body:"Your saved cup results are preserved. The remaining bracket has been reconstructed around your campaign and will now follow the season calendar."});
 if(["ucl","matchday-prep"].includes(s.stage)&&!s.ucl?.stage?.includes("result")&&!s.ucl?.stage?.includes("live"))return prepareNextFixture(s);
 return s;
}

export function simulateScheduledHalf(input,half){
 let s=prepareNextFixture({...input,midSeasonDone:half===2||input.midSeasonDone});
 for(let guard=0;guard<120;guard++){
  if(s.stage==="full-results"||s.stage==="half-results")return s;
  const event=nextFixture(s);
  if(!event)throw new Error("No scheduled fixture is available.");
  const unavailable=new Set(unavailablePlayerIds(s,event.kind==="europe"?"ucl":"domestic"));
  s={...s,lineup:autoLineup(FORMATIONS[s.formation],s.clubs.find(c=>c.id===s.myClubId).players.filter(p=>!unavailable.has(p.id)))};
  if(event.kind==="league")s=prepareNextFixture(playLeagueRound(s));
  else if(event.kind==="cup")s=prepareNextFixture(playDomesticCup(s,event.comp,event.round));
  else if(typeof event.round==="number"){
   s=advanceEuropeanLeague(playEuropeanLeague(s));
   if(s.ucl.stage==="phase-summary")s=startEuropeanKnockout(s);
  }else s=prepareNextFixture(syncKnockoutSchedule(advanceEuropeanKnockout(playEuropeanKnockout(s))));
 }
 throw new Error("The season calendar could not advance.");
}
