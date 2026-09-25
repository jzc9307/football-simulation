import { ensureFixtures, findClubAnywhere, topXI, aiTactics, simMatchSmart, addExtraTime, simulateShootout, performanceUpdatesForMatch, applyPerformanceUpdates, computeTableArray, roundRobin, initTable } from "./engine.js";
import { createUclCampaign } from "./uclSelection.js";
import { createEuropaCampaign } from "./europaSelection.js";
import { syncEuropeanDraw, knockoutContext, initializeEuropeanKnockout } from "./europeanCalendar.js";
import { simulateUclRound, applyUpdates, appendClubForm } from "./engine.js";
import { autoLineup, unavailablePlayerIds } from "./engine.js";
import { FORMATIONS } from "./config.js";
import { playLeagueRound, playDomesticCup, playEuropeanLeague, advanceEuropeanLeague, startEuropeanKnockout, playEuropeanKnockout, advanceEuropeanKnockout } from "./actions.js";
import { nextFixture, syncKnockoutSchedule, recordScheduledResult, isMyFixture, addMail, advanceCupDraws, CUP_KEYS, buildUclSchedule, buildUelSchedule, resolveCalendarConflicts } from "./seasonSchedule.js";

function advanceEuropeanWorld(state,round){
 const {updates,performanceUpdates,fixtures}=simulateUclRound({...state,ucl:{...state.ucl,roundIndex:round-1}},state.ucl.clubs,state.ucl.rounds[round-1]);
 let s=applyPerformanceUpdates({...state,ucl:{...state.ucl,roundIndex:Math.min(7,round),tableRaw:applyUpdates(state.ucl.tableRaw,updates),form:appendClubForm(state.ucl.form,updates)}},performanceUpdates,false);
 for(const fixture of fixtures)s=recordScheduledResult(s,{...fixture,myGoals:fixture.homeGoals,oppGoals:fixture.awayGoals,round});
 s={...s,fixtureResults:[...(s.fixtureResults||[]),...fixtures]};
 if(round===8)s=initializeEuropeanKnockout({...s,ucl:{...s.ucl,phaseTable:computeTableArray(s.ucl.tableRaw,s.ucl.clubs),qualification:"eliminated",outcome:"NOT QUALIFIED",stage:"final"}});
 return s;
}

function advanceEuropaWorld(state,round){
 const u=state.uel;
 if(!u?.rounds?.[round-1])return state;
 // The same 90-minute engine drives both European league phases. Europa is
 // resolved in the background for non-qualified managers, then exposed in the
 // competition centre with its own table and Thursday fixture windows.
 const shadow={...state,ucl:{...u,roundIndex:round-1}};
 const {updates,fixtures}=simulateUclRound(shadow,u.clubs,u.rounds[round-1]);
 let s={...state,uel:{...u,roundIndex:Math.min(u.rounds.length,round),tableRaw:applyUpdates(u.tableRaw,updates),form:appendClubForm(u.form,updates)}};
 for(const fixture of fixtures)s=recordScheduledResult(s,{...fixture,competition:"UEL",myGoals:fixture.homeGoals,oppGoals:fixture.awayGoals,round});
 s={...s,fixtureResults:[...(s.fixtureResults||[]),...fixtures.map(f=>({...f,competition:"UEL"}))]};
 if(round===u.rounds.length){
  const phaseTable=computeTableArray(s.uel.tableRaw,s.uel.clubs);
  const championId=phaseTable[0]?.id;
  s={...s,uel:{...s.uel,phaseTable,championId,qualification:"complete",outcome:championId===s.myClubId?"CHAMPION":"LEAGUE PHASE COMPLETE",stage:"final"}};
 }
 return s;
}

// Finish AI cup ties only when their date arrives. Winners populate the next draw.
export function advanceCupWorld(state,throughDate){
 let s=state;
 for(let pass=0;pass<1;pass++){
  const candidates=s.seasonSchedule.filter(e=>(e.kind==="cup"||e.knockoutKey)&&e.status==="scheduled"&&e.date<=throughDate&&!isMyFixture(s,e)).sort((a,b)=>a.date.localeCompare(b.date));
  const due=candidates.filter(e=>e.date===candidates[0]?.date);
  if(!due.length)break;
  const updates=[];
  for(const event of due){
   const home=findClubAnywhere(s,event.homeId),away=findClubAnywhere(s,event.awayId);
   if(!home||!away)continue;
   const a=topXI(home.players,home.preferredFormation),b=topXI(away.players,away.preferredFormation),ta=aiTactics(home),tb=aiTactics(away);
   let match=simMatchSmart(a,b,event.neutral?null:true,ta,tb);
   const first=event.knockoutKey&&event.leg===2?s.seasonSchedule.find(e=>e.knockoutKey===event.knockoutKey&&e.tieIndex===event.tieIndex&&e.leg===1):null;
   const priorHome=first?.result?.awayGoals||0,priorAway=first?.result?.homeGoals||0;
   const deciding=!event.knockoutKey||event.leg===2||event.neutral;
   if(deciding&&match.goalsA+priorHome===match.goalsB+priorAway)match=addExtraTime(match,a,b,event.neutral?null:true,ta,tb);
   const pens=deciding&&match.goalsA+priorHome===match.goalsB+priorAway?simulateShootout(a,b):null;
   const winnerId=deciding?((pens?pens.wonA:match.goalsA+priorHome>match.goalsB+priorAway)?home.id:away.id):null;
   updates.push(...performanceUpdatesForMatch(match,home.id,away.id,event.knockoutKey?"ucl":event.comp));
   s=recordScheduledResult(s,{fixtureId:event.id,myGoals:match.goalsA,oppGoals:match.goalsB,winnerId,notes:pens?"Decided on penalties":null});
  }
  // Apply each match separately: a player can appear in several historical rounds.
  s=applyPerformanceUpdates(s,updates,false);
  s=syncEuropeanDraw(s);
 }
 return s;
}

export function prepareNextFixture(input){
 let s=ensureFixtures(input);
 if(!s.ucl){
  const ucl=createUclCampaign(s,roundRobin,initTable);
  const uel=createEuropaCampaign(s,roundRobin,initTable);
  s={...s,ucl,uel,seasonSchedule:resolveCalendarConflicts([...s.seasonSchedule,...buildUclSchedule({season:s.season,rounds:ucl.rounds}),...buildUelSchedule({season:s.season,rounds:uel.rounds})])};
 }
 if(!s.uel){
  const uel=createEuropaCampaign(s,roundRobin,initTable);
  s={...s,uel,seasonSchedule:resolveCalendarConflicts([...s.seasonSchedule,...buildUelSchedule({season:s.season,rounds:uel.rounds})])};
 }
 s=syncKnockoutSchedule(s);
 for(let pass=0;pass<120;pass++){
  const next=nextFixture(s),limit=next?.date||s.seasonSchedule.at(-1)?.date;
  if(!limit)break;
  // A European league-phase round is simulated as one batch.  Never advance
  // that batch in the background if it contains the manager's fixture: doing
  // so records the manager's match before they get the chance to play it.
  const backgroundEurope=s.seasonSchedule.find(e=>{
   if(!["UCL","UEL"].includes(e.competition)||typeof e.round!=="number"||e.status!=="scheduled"||e.date>limit||isMyFixture(s,e))return false;
   return !s.seasonSchedule.some(candidate=>candidate.competition===e.competition&&candidate.round===e.round&&candidate.status==="scheduled"&&isMyFixture(s,candidate));
  });
  const firstCup=s.seasonSchedule.find(e=>(e.kind==="cup"||e.knockoutKey)&&e.status==="scheduled"&&!isMyFixture(s,e)&&e.date<=limit);
  if(backgroundEurope&&(!firstCup||backgroundEurope.date<=firstCup.date)){s=backgroundEurope.competition==="UEL"?advanceEuropaWorld(s,backgroundEurope.round):advanceEuropeanWorld(s,backgroundEurope.round);continue;}
  const pending=s.seasonSchedule.some(e=>(e.kind==="cup"||e.knockoutKey)&&e.status==="scheduled"&&!isMyFixture(s,e)&&e.date<=limit);
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
  const campaignKey=event.competition==="UEL"?"uel":"ucl",campaign=s[campaignKey];
  return {...dated,stage:"ucl",activeEuropeanCompetition:event.competition,[campaignKey]:event.knockoutKey?knockoutContext(s,event):{...campaign,roundIndex:knockout?campaign.roundIndex:event.round-1,stage:knockout?"knockout-prep":"match-prep"}};
 }
 if(event.kind==="cup")return {...dated,stage:"matchday-prep"};
 const half=event.round<=s.roundsHalf1.length?1:2;
 return {...dated,stage:"matchday-prep",half,roundIndex:event.round-1-(half===2?s.roundsHalf1.length:0)};
}

export function migrateSeason(input){
 let s=ensureFixtures(input);
 if(input.scheduleVersion===2)return s;
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
   const competition=event.competition||"UCL";
   s=advanceEuropeanLeague(playEuropeanLeague(s,competition),competition);
   if(competition==="UCL"&&s.ucl.stage==="phase-summary")s=startEuropeanKnockout(s);
  }else s=prepareNextFixture(syncKnockoutSchedule(advanceEuropeanKnockout(playEuropeanKnockout(s))));
 }
 throw new Error("The season calendar could not advance.");
}
