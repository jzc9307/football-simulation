import { completeUserTie, bracketCurrentTie } from "./uclBracket.js";
import { FORMATIONS } from "./config.js";
import { addMail, recordScheduledResult } from "./seasonSchedule.js";
import { lineupIssue, applyUpdates, appendClubForm, computeTableArray, simulateRound, ensureFixtures, pendingCupSlot, simulateCupMatch, simulateUclSingleMatch, pickKnockoutOpponent, findClubAnywhere, cleanLineupOfSuspended, buildLiveMatchContext, applyPerformanceUpdates, readinessLineup, applyInjuries, unavailablePlayerIds } from "./engine.js";
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
      requireLineup(s);
      const rounds = s.half===1 ? s.roundsHalf1 : s.roundsHalf2;
      const round = rounds[s.roundIndex];
      const gw = (s.half===1?0:s.roundsHalf1.length) + s.roundIndex + 1;
      const { updates, userResult, performanceUpdates, fixtures } = simulateRound(s, round, gw);
      const tableRaw = applyUpdates(s.tableRaw, updates);
      const oppClub = findClubAnywhere(s, userResult.opponentId);
      const liveContext = oppClub ? buildLiveMatchContext(s, userResult, oppClub, s.league) : null;
      const newSuspended = userResult.redCard ? [userResult.redCard.id] : [];
      let next=applyInjuries(applyPerformanceUpdates({...s,tableRaw,clubForm:appendClubForm(s.clubForm,updates)},performanceUpdates),userResult.injuries);
      const cleanedLineup = cleanLineupOfSuspended(s.formation, next.clubs.find(c=>c.id===s.myClubId).players, s.lineup, [...newSuspended,...unavailablePlayerIds(next)]);
      next=recordScheduledResult(next,{competition:s.league,homeId:userResult.isHome?s.myClubId:userResult.opponentId,awayId:userResult.isHome?userResult.opponentId:s.myClubId,myGoals:userResult.isHome?userResult.myGoals:userResult.oppGoals,oppGoals:userResult.isHome?userResult.oppGoals:userResult.myGoals,round:gw});
      const notifications=[...fixtures.filter(f=>f.homeId!==s.myClubId&&f.awayId!==s.myClubId).slice(0,1).map(()=>({type:"result",subject:`Matchweek ${gw} results are in`,body:"All league results and the updated table are available in Fixtures."})),...(userResult.injuries||[]).map(injury=>({type:"medical",subject:`Medical update: ${injury.name}`,body:`${injury.severity}; unavailable for ${injury.matches} match${injury.matches===1?"":"es"}.`})),...(userResult.redCard?[{type:"discipline",subject:`Suspension: ${userResult.redCard.name}`,body:"The player is suspended for the next domestic match."}]:[])];
      notifications.forEach(note=>{next=addMail(next,note);});
      return { ...next, fixtureResults:[...(next.fixtureResults||[]),...fixtures], lastResult: userResult, lastLiveContext: liveContext, lineup: cleanedLineup, stage: liveContext ? "matchday-live" : "matchday-result",
        results1: s.half===1 ? [...s.results1, userResult] : s.results1,
        results2: s.half===2 ? [...s.results2, userResult] : s.results2,
        suspensions: { ...s.suspensions, domestic: newSuspended } };
    }

export function playDomesticCup(s, comp, round){
      requireLineup(s);
      const { updatedCs, matchResult } = simulateCupMatch(s, comp, round);
      const oppClub = findClubAnywhere(s, matchResult.opponentId);
      const competition={fa:"FA",carabao:"CARABAO",copa:"COPA",coppa:"COPPA",dfb:"DFB",coupe:"COUPE"}[comp]||s.league;
      const liveContext = oppClub ? buildLiveMatchContext(s, { ...matchResult, isHome: matchResult.homeA }, oppClub, competition) : null;
      const newSuspended = matchResult.redCard ? [matchResult.redCard.id] : [];
      let next=applyInjuries(applyPerformanceUpdates({...s,cupStatus:{...s.cupStatus,[comp]:updatedCs}},matchResult.performanceUpdates),matchResult.injuries);
      const cleanedLineup = cleanLineupOfSuspended(s.formation, next.clubs.find(c=>c.id===s.myClubId).players, s.lineup, [...newSuspended,...unavailablePlayerIds(next)]);
      next=recordScheduledResult(next,{competition,homeId:matchResult.homeA?s.myClubId:matchResult.opponentId,awayId:matchResult.homeA?matchResult.opponentId:s.myClubId,myGoals:matchResult.homeA?matchResult.myGoals:matchResult.oppGoals,oppGoals:matchResult.homeA?matchResult.oppGoals:matchResult.myGoals,round});
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
      requireLineup(s,"ucl");
      const u = s.ucl;
      const opp = u.clubs.find(c=>c.id===u.currentKnockoutOpponentId);
      const roundName = u.knockoutRounds[u.knockoutRoundIndex];
      const isFinal = roundName === "Final";
      const leg = u.leg || 1;
      let isHome;
      if (isFinal) isHome = null;
      else if (leg===1) isHome = Math.random() < 0.5;
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
