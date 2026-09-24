import { prepareNextFixture } from "./seasonFlow.js";
import { initializeEuropeanKnockout, syncEuropeanDraw } from "./europeanCalendar.js";
import { completeUserTie, bracketCurrentTie, startUclBracket } from "./uclBracket.js";
import { FORMATIONS } from "./config.js";
import { addMail, recordScheduledResult, requireScheduledFixture, leagueCompetition, syncKnockoutSchedule } from "./seasonSchedule.js";
import { simulateUclRound, lineupIssue, applyUpdates, appendClubForm, computeTableArray, simulateRound, ensureFixtures, pendingCupSlot, simulateCupMatch, simulateUclSingleMatch, pickKnockoutOpponent, findClubAnywhere, cleanLineupOfSuspended, buildLiveMatchContext, applyPerformanceUpdates, readinessLineup, applyInjuries, unavailablePlayerIds } from "./engine.js";
function requireLineup(s,competition="domestic"){const issue=lineupIssue(s,competition);if(issue)throw new Error(issue);}
export function simulateHalf(s, half){
      requireLineup(s);
      let cur=ensureFixtures(s);
      const rounds=half===1?cur.roundsHalf1:cur.roundsHalf2,results=[];
      const preferredLineup={...cur.lineup};
      const playDueCups=(idx)=>{
        let slot;
        while((slot=pendingCupSlot(cur.myClubId,half,idx,cur.cupStatus,cur.league))){
          const {updatedCs,matchResult}=simulateCupMatch(cur,slot.comp,slot.round);
          cur=applyInjuries(applyPerformanceUpdates({...cur,cupStatus:{...cur.cupStatus,[slot.comp]:updatedCs}},matchResult.performanceUpdates),matchResult.injuries);
          const suspended=matchResult.redCard?[matchResult.redCard.id]:[];
          cur={...cur,suspensions:{...cur.suspensions,domestic:suspended},lineup:cleanLineupOfSuspended(cur.formation,cur.clubs.find(c=>c.id===cur.myClubId).players,cur.lineup,[...suspended,...unavailablePlayerIds(cur)])};
        }
      };
      rounds.forEach((round,idx)=>{
        playDueCups(idx);
        const club=cur.clubs.find(c=>c.id===cur.myClubId);
        const eligible=club.players.filter(p=>!unavailablePlayerIds(cur).includes(p.id));
        cur={...cur,lineup:readinessLineup((FORMATIONS[cur.formation]),eligible,preferredLineup)};
        const {updates,userResult,performanceUpdates}=simulateRound(cur,round,(half===1?0:cur.roundsHalf1.length)+idx+1);
        results.push(userResult);
        cur=applyInjuries(applyPerformanceUpdates({...cur,tableRaw:applyUpdates(cur.tableRaw,updates),clubForm:appendClubForm(cur.clubForm,updates)},performanceUpdates),userResult.injuries);
        const suspended=userResult.redCard?[userResult.redCard.id]:[];
        cur={...cur,suspensions:{...cur.suspensions,domestic:suspended},lineup:cleanLineupOfSuspended(cur.formation,cur.clubs.find(c=>c.id===cur.myClubId).players,cur.lineup,[...suspended,...unavailablePlayerIds(cur)])};
      });
      playDueCups(rounds.length);
      const table=computeTableArray(cur.tableRaw,cur.clubs);
      return {...cur,stage:half===1?"half-results":"full-results",results1:half===1?results:cur.results1,results2:half===2?results:cur.results2,
        table1:half===1?table:cur.table1,tableFinal:half===2?table:cur.tableFinal};
    }

export function playLeagueRound(s){
      const scheduled=requireScheduledFixture(s,leagueCompetition(s.league,s.division));
      if(scheduled&&scheduled.id!==s.activeFixtureId)throw new Error("Continue to the next fixture before kickoff.");
      requireLineup(s);
      const rounds = s.half===1 ? s.roundsHalf1 : s.roundsHalf2;
      const round = rounds[s.roundIndex];
      const gw = (s.half===1?0:s.roundsHalf1.length) + s.roundIndex + 1;
      const { updates, userResult, performanceUpdates, fixtures } = simulateRound(s, round, gw);
      const tableRaw = applyUpdates(s.tableRaw, updates);
      const oppClub = findClubAnywhere(s, userResult.opponentId);
      const liveContext = oppClub ? buildLiveMatchContext(s, userResult, oppClub, leagueCompetition(s.league,s.division)) : null;
      const newSuspended = userResult.redCard ? [userResult.redCard.id] : [];
      let next=applyInjuries(applyPerformanceUpdates({...s,tableRaw,clubForm:appendClubForm(s.clubForm,updates)},performanceUpdates),userResult.injuries);
      const cleanedLineup = cleanLineupOfSuspended(s.formation, next.clubs.find(c=>c.id===s.myClubId).players, s.lineup, [...newSuspended,...unavailablePlayerIds(next)]);
      next=recordScheduledResult(next,{competition:s.league,homeId:userResult.isHome?s.myClubId:userResult.opponentId,awayId:userResult.isHome?userResult.opponentId:s.myClubId,myGoals:userResult.isHome?userResult.myGoals:userResult.oppGoals,oppGoals:userResult.isHome?userResult.oppGoals:userResult.myGoals,round:gw});
      const notifications=[...fixtures.filter(f=>f.homeId!==s.myClubId&&f.awayId!==s.myClubId).slice(0,1).map(()=>({type:"result",subject:`Matchweek ${gw} results are in`,body:"All league results and the updated table are available in Fixtures."})),...(userResult.injuries||[]).map(injury=>({type:"medical",subject:`Medical update: ${injury.name}`,body:`${injury.severity}; unavailable for ${injury.matches} match${injury.matches===1?"":"es"}.`})),...(userResult.redCard?[{type:"discipline",subject:`Suspension: ${userResult.redCard.name}`,body:"The player is suspended for the next domestic match."}]:[])];
      notifications.forEach(note=>{next=addMail(next,note);});
      next={...next,seasonSchedule:next.seasonSchedule.map(event=>{
        const result=fixtures.find(f=>event.kind==="league"&&f.round===event.round&&f.homeId===event.homeId&&f.awayId===event.awayId);
        return result?{...event,status:"completed",result}:event;
      }),currentDate:scheduled?.date||next.currentDate};
      return { ...next, fixtureResults:[...(next.fixtureResults||[]),...fixtures], lastResult: userResult, lastLiveContext: liveContext, lineup: cleanedLineup, stage: liveContext ? "matchday-live" : "matchday-result",
        results1: s.half===1 ? [...s.results1, userResult] : s.results1,
        results2: s.half===2 ? [...s.results2, userResult] : s.results2,
        suspensions: { ...s.suspensions, domestic: newSuspended } };
    }

export function playDomesticCup(s, comp, round){
      const scheduled=requireScheduledFixture(s,{fa:"FA",carabao:"CARABAO",copa:"COPA",coppa:"COPPA",dfb:"DFB",coupe:"COUPE"}[comp]);
      if(scheduled&&(scheduled.round!==round||scheduled.id!==s.activeFixtureId))throw new Error("This cup fixture is not due yet.");
      requireLineup(s);
      const { updatedCs, matchResult } = simulateCupMatch(s, comp, round);
      const oppClub = findClubAnywhere(s, matchResult.opponentId);
      const competition={fa:"FA",carabao:"CARABAO",copa:"COPA",coppa:"COPPA",dfb:"DFB",coupe:"COUPE"}[comp]||s.league;
      const liveContext = oppClub ? buildLiveMatchContext(s, { ...matchResult, isHome: matchResult.homeA }, oppClub, competition) : null;
      const newSuspended = matchResult.redCard ? [matchResult.redCard.id] : [];
      let next=applyInjuries(applyPerformanceUpdates({...s,cupStatus:{...s.cupStatus,[comp]:updatedCs}},matchResult.performanceUpdates),matchResult.injuries);
      const cleanedLineup = cleanLineupOfSuspended(s.formation, next.clubs.find(c=>c.id===s.myClubId).players, s.lineup, [...newSuspended,...unavailablePlayerIds(next)]);
      next=recordScheduledResult(next,{competition,fixtureId:scheduled?.id,homeId:matchResult.homeA?s.myClubId:matchResult.opponentId,awayId:matchResult.homeA?matchResult.opponentId:s.myClubId,myGoals:matchResult.homeA?matchResult.myGoals:matchResult.oppGoals,oppGoals:matchResult.homeA?matchResult.oppGoals:matchResult.myGoals,round,winnerId:matchResult.won?s.myClubId:matchResult.opponentId,notes:matchResult.wentToPens?"Decided on penalties":null});
      next=addMail(next,{type:"cup",competition,subject:`${competition} update`,body:matchResult.won?`You are through after the ${round}.`:`Your ${competition} campaign has ended in the ${round}.`});
      return { ...next, lastCupResult: matchResult, lastLiveContext: liveContext, lineup: cleanedLineup, stage: liveContext ? "cup-live" : "cup-result",
        suspensions: { ...s.suspensions, domestic: newSuspended } };
    }

export function advanceLeagueRound(s){
      if (s.roundIndex >= (s.half===1?s.roundsHalf1:s.roundsHalf2).length-1){
        const tableArr = computeTableArray(s.tableRaw, s.clubs);
        return { ...s, stage: s.half===1?"half-results":"full-results",
          table1: s.half===1?tableArr:s.table1, tableFinal: s.half===2?tableArr:s.tableFinal };
      }
      return { ...s, roundIndex: s.roundIndex+1, stage: "matchday-prep" };
    }

export function playEuropeanKnockout(s){
      const scheduled=requireScheduledFixture(s,"UCL");
      if(scheduled&&scheduled.id!==s.activeFixtureId)throw new Error("This European fixture is not due yet.");
      requireLineup(s,"ucl");
      const u = s.ucl;
      const opp = u.clubs.find(c=>c.id===u.currentKnockoutOpponentId);
      const roundName = u.knockoutRounds[u.knockoutRoundIndex];
      const isFinal = roundName === "Final";
      const leg = u.leg || 1;
      let isHome;
      if (isFinal) isHome = null;
      else if (leg===1) isHome = scheduled?scheduled.homeId===s.myClubId:Math.random() < 0.5;
      else isHome = !u.firstLegHomeA;
      const allowPens = isFinal || leg===2;
      const result = simulateUclSingleMatch(s, opp, isFinal ? "Final" : `${roundName} — Leg ${leg}`, isHome, allowPens, !isFinal && leg===2 ? u.aggregate : {mine:0,opp:0});
      const record = { ...u.campaignRecord };
      record.gf+=result.myGoals; record.ga+=result.oppGoals;
      if (result.myGoals>result.oppGoals) record.w++; else if (result.myGoals<result.oppGoals) record.l++; else record.d++;
      const liveContext = buildLiveMatchContext(s, result, opp);
      const aggregate = isFinal ? u.aggregate : { mine:(u.aggregate?.mine||0)+result.myGoals, opp:(u.aggregate?.opp||0)+result.oppGoals };
      const newUclSuspended = result.redCard ? [result.redCard.id] : [];
      const formUpdates=[{clubId:s.myClubId,gf:result.myGoals,ga:result.oppGoals},{clubId:opp.id,gf:result.oppGoals,ga:result.myGoals}];
      let next=applyInjuries(applyPerformanceUpdates({...s,ucl:{...u,form:appendClubForm(u.form,formUpdates)}},result.performanceUpdates),result.injuries);
      if(scheduled)next=recordScheduledResult(next,{fixtureId:scheduled.id,myGoals:scheduled.homeId===s.myClubId?result.myGoals:result.oppGoals,oppGoals:scheduled.homeId===s.myClubId?result.oppGoals:result.myGoals,winnerId:(isFinal||leg===2)?(result.won?s.myClubId:opp.id):null,notes:result.wentToPens?"Decided on penalties":null});
      next=syncEuropeanDraw(next);
      const cleanedLineup = cleanLineupOfSuspended(s.formation, next.clubs.find(c=>c.id===s.myClubId).players, s.lineup, [...newUclSuspended,...unavailablePlayerIds(next,"ucl")]);
      return { ...next, ucl: { ...next.ucl, lastMatch: result, liveContext, aggregate,
          firstLegHomeA: (!isFinal && leg===1) ? isHome : u.firstLegHomeA,
          stage: "knockout-live",
          campaignResults:[...u.campaignResults,result], campaignRecord:record,
          knockoutFaced: (isFinal || leg===2) ? [...(u.knockoutFaced||[]), opp.id] : (u.knockoutFaced||[]) },
        lineup: cleanedLineup,
        suspensions: { ...s.suspensions, ucl: result.redCard ? [result.redCard.id] : [] } };
    }

export function advanceEuropeanKnockout(s){
      const u = s.ucl;
      if(u.knockoutBracket?.calendarDriven){
        const deciding=u.leg===2||u.knockoutRounds[u.knockoutRoundIndex]==="Final",round=u.knockoutRounds[u.knockoutRoundIndex];
        if(deciding&&(!u.lastMatch.won||round==="Final")){
          const outcome=u.lastMatch.won?"CHAMPION":round==="Final"?"RUNNER-UP":`${round.toUpperCase()} EXIT`;
          return {...s,ucl:{...u,outcome,stage:"final"},cups:{...s.cups,ucl:{results:u.campaignResults,record:u.campaignRecord,outcome}}};
        }
        return {...s,ucl:{...u,stage:"hub"}};
      }
      const roundName = u.knockoutRounds[u.knockoutRoundIndex];
      const isFinal = roundName === "Final";
      const leg = u.leg || 1;
      if (!isFinal && leg===1){
        return { ...s, ucl: { ...u, leg:2, stage:"knockout-prep" } };
      }
      const knockoutBracket=u.knockoutBracket?completeUserTie(u.knockoutBracket,s.myClubId,u.aggregate?.mine||u.lastMatch.myGoals,u.aggregate?.opp||u.lastMatch.oppGoals,u.lastMatch.wentToPens,u.lastMatch.wonPens,u.clubs):null;
      const updatedU={...u,knockoutBracket};
      const won = u.lastMatch.won;
      const isLastRound = u.knockoutRoundIndex === u.knockoutRounds.length-1;
      if (!won){
        const outcome = roundName==="Final" ? "RUNNER-UP" : `${roundName.toUpperCase()} EXIT`;
        return { ...s, ucl: { ...updatedU, outcome, stage:"final" }, cups: { ...s.cups, ucl: { results:u.campaignResults, record:u.campaignRecord, outcome } } };
      }
      if (isLastRound){
        const outcome = "CHAMPION";
        return { ...s, ucl: { ...updatedU, outcome, stage:"final" }, cups: { ...s.cups, ucl: { results:u.campaignResults, record:u.campaignRecord, outcome } } };
      }
      const nextIdx = u.knockoutRoundIndex+1;
      const nextTie=bracketCurrentTie(knockoutBracket,s.myClubId)?.tie;
      const opp = nextTie?u.clubs.find(c=>c.id===(nextTie.aId===s.myClubId?nextTie.bId:nextTie.aId)):pickKnockoutOpponent(u, s.myClubId);
      return { ...s, ucl: { ...updatedU, knockoutRoundIndex: nextIdx, currentKnockoutOpponentId: opp.id,
        leg:1, aggregate:{mine:0,opp:0}, firstLegHomeA: undefined, stage: "knockout-prep" } };
    }

export function playEuropeanLeague(s){
      const scheduled=requireScheduledFixture(s,"UCL");
      if(scheduled?.id!==s.activeFixtureId)throw new Error("This European fixture is not due yet.");
      requireLineup(s,"ucl");
      const u = s.ucl;
      const round = u.rounds[u.roundIndex];
      const { updates, userResult, performanceUpdates, fixtures } = simulateUclRound(s, u.clubs, round);
      const tableRaw = applyUpdates(u.tableRaw, updates);
      const record = { ...u.campaignRecord };
      record.gf += userResult.myGoals; record.ga += userResult.oppGoals;
      if (userResult.myGoals>userResult.oppGoals) record.w++; else if (userResult.myGoals<userResult.oppGoals) record.l++; else record.d++;
      const oppClub = u.clubs.find(c=>c.id===userResult.opponentId);
      const liveContext = buildLiveMatchContext(s, userResult, oppClub);
      const newUclSuspended = userResult.redCard ? [userResult.redCard.id] : [];
      let next=applyInjuries(applyPerformanceUpdates({...s,ucl:{...u,tableRaw,form:appendClubForm(u.form,updates)}},performanceUpdates),userResult.injuries);
      next=recordScheduledResult(next,{competition:"UCL",homeId:userResult.isHome?s.myClubId:userResult.opponentId,awayId:userResult.isHome?userResult.opponentId:s.myClubId,myGoals:userResult.isHome?userResult.myGoals:userResult.oppGoals,oppGoals:userResult.isHome?userResult.oppGoals:userResult.myGoals,round:u.roundIndex+1});
      for(const fixture of fixtures)next=recordScheduledResult(next,{...fixture,myGoals:fixture.homeGoals,oppGoals:fixture.awayGoals});
      next={...next,fixtureResults:[...(next.fixtureResults||[]),...fixtures]};
      next=addMail(next,{type:"europe",competition:"UCL",subject:"Champions League result",body:`${findClubAnywhere(s,s.myClubId).name} ${userResult.myGoals}–${userResult.oppGoals} ${oppClub.name}. Your league-phase table is updated.`});
      (userResult.injuries||[]).forEach(injury=>{next=addMail(next,{type:"medical",competition:"UCL",subject:`Medical update: ${injury.name}`,body:`${injury.severity}; unavailable for ${injury.matches} match${injury.matches===1?"":"es"}.`});});
      const cleanedLineup = cleanLineupOfSuspended(s.formation, next.clubs.find(c=>c.id===s.myClubId).players, s.lineup, [...newUclSuspended,...unavailablePlayerIds(next,"ucl")]);
      return { ...next, ucl: { ...next.ucl, lastMatch: userResult, liveContext, stage: "match-live",
        campaignResults: [...u.campaignResults, userResult], campaignRecord: record },
        lineup: cleanedLineup,
        suspensions: { ...s.suspensions, ucl: newUclSuspended } };

}

export function advanceEuropeanLeague(s){
      const u = s.ucl;
      if (u.roundIndex === 7){
        const phaseTable = computeTableArray(u.tableRaw, u.clubs);
        const rank = phaseTable.findIndex(r=>r.id===s.myClubId)+1;
        const qualification = rank<=8 ? "top8" : rank<=24 ? "playoff" : "eliminated";
        return { ...s, ucl: { ...u, phaseTable, qualification, stage: "phase-summary" } };
      }
      return prepareNextFixture({ ...s, ucl: { ...u, roundIndex: u.roundIndex+1, stage: "hub" } });

}

export function startEuropeanKnockout(s){
      const u = s.ucl;
      if(s.scheduleVersion===2){
        const next=initializeEuropeanKnockout(s);
        const outcome=u.qualification==="eliminated"?"LEAGUE PHASE EXIT":null;
        return prepareNextFixture({...next,ucl:{...next.ucl,outcome,stage:outcome?"final":"hub"},cups:outcome?{...s.cups,ucl:{results:u.campaignResults,record:u.campaignRecord,outcome}}:s.cups});
      }
      if (u.qualification === "eliminated"){
        const outcome = "LEAGUE PHASE EXIT";
        return prepareNextFixture({ ...s, ucl: { ...u, outcome, stage:"final" }, cups: { ...s.cups, ucl: { results:u.campaignResults, record:u.campaignRecord, outcome } } });
      }
      const knockoutBracket=startUclBracket(u.phaseTable,s.myClubId,u.clubs);
      const current=bracketCurrentTie(knockoutBracket,s.myClubId);
      const knockoutRounds=u.qualification==="playoff"?["Playoff","Round of 16","Quarter-Final","Semi-Final","Final"]:["Round of 16","Quarter-Final","Semi-Final","Final"];
      const oppId=current.tie.aId===s.myClubId?current.tie.bId:current.tie.aId;
      return prepareNextFixture(syncKnockoutSchedule({ ...s, ucl: { ...u, knockoutBracket, knockoutRounds, knockoutRoundIndex:0, knockoutFaced:[], currentKnockoutOpponentId:oppId,
        leg:1, aggregate:{mine:0,opp:0}, firstLegHomeA: undefined, stage: "knockout-prep" } }));

}
