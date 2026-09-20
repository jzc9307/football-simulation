import { lineupIssue, applyUpdates, computeTableArray, simulateRound, ensureFixtures, pendingCupSlot, simulateCupMatch, simulateUclSingleMatch, pickKnockoutOpponent, findClubAnywhere, cleanLineupOfSuspended, buildLiveMatchContext, applyMatchFitness } from "./engine.js";
function requireLineup(s,competition="domestic"){const issue=lineupIssue(s,competition);if(issue)throw new Error(issue);}
export function simulateHalf(s, half){
      requireLineup(s);
      let cur=ensureFixtures(s);
      const rounds=half===1?cur.roundsHalf1:cur.roundsHalf2,results=[];
      const playDueCups=(idx)=>{
        let slot;
        while((slot=pendingCupSlot(cur.myClubId,half,idx,cur.cupStatus,cur.league))){
          const {updatedCs,matchResult}=simulateCupMatch(cur,slot.comp,slot.round);
          cur=applyMatchFitness({...cur,cupStatus:{...cur.cupStatus,[slot.comp]:updatedCs}},matchResult);
          const suspended=matchResult.redCard?[matchResult.redCard.id]:[];
          cur={...cur,suspensions:{...cur.suspensions,domestic:suspended},lineup:cleanLineupOfSuspended(cur.formation,cur.clubs.find(c=>c.id===cur.myClubId).players,cur.lineup,suspended)};
        }
      };
      rounds.forEach((round,idx)=>{
        playDueCups(idx);
        const {updates,userResult}=simulateRound(cur,round,(half===1?0:cur.roundsHalf1.length)+idx+1);
        results.push(userResult);
        cur=applyMatchFitness({...cur,tableRaw:applyUpdates(cur.tableRaw,updates)},userResult);
        const suspended=userResult.redCard?[userResult.redCard.id]:[];
        cur={...cur,suspensions:{...cur.suspensions,domestic:suspended},lineup:cleanLineupOfSuspended(cur.formation,cur.clubs.find(c=>c.id===cur.myClubId).players,cur.lineup,suspended)};
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
      const { updates, userResult } = simulateRound(s, round, gw);
      const tableRaw = applyUpdates(s.tableRaw, updates);
      const oppClub = findClubAnywhere(s, userResult.opponentId);
      const liveContext = oppClub ? buildLiveMatchContext(s, userResult, oppClub, "domestic") : null;
      const newSuspended = userResult.redCard ? [userResult.redCard.id] : [];
      const cleanedLineup = cleanLineupOfSuspended(s.formation, s.clubs.find(c=>c.id===s.myClubId).players, s.lineup, newSuspended);
      return { ...applyMatchFitness(s,userResult), tableRaw, lastResult: userResult, lastLiveContext: liveContext, lineup: cleanedLineup, stage: liveContext ? "matchday-live" : "matchday-result",
        results1: s.half===1 ? [...s.results1, userResult] : s.results1,
        results2: s.half===2 ? [...s.results2, userResult] : s.results2,
        suspensions: { ...s.suspensions, domestic: newSuspended } };
    }

export function playDomesticCup(s, comp, round){
      requireLineup(s);
      const { updatedCs, matchResult } = simulateCupMatch(s, comp, round);
      const oppClub = findClubAnywhere(s, matchResult.opponentId);
      const liveContext = oppClub ? buildLiveMatchContext(s, { ...matchResult, isHome: matchResult.homeA }, oppClub, "domestic") : null;
      const newSuspended = matchResult.redCard ? [matchResult.redCard.id] : [];
      const cleanedLineup = cleanLineupOfSuspended(s.formation, s.clubs.find(c=>c.id===s.myClubId).players, s.lineup, newSuspended);
      return { ...applyMatchFitness(s,matchResult), cupStatus: { ...s.cupStatus, [comp]: updatedCs }, lastCupResult: matchResult, lastLiveContext: liveContext, lineup: cleanedLineup, stage: liveContext ? "cup-live" : "cup-result",
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
      if (isFinal || leg===1) isHome = Math.random()<0.5;
      else isHome = !u.firstLegHomeA;
      const allowPens = isFinal || leg===2;
      const result = simulateUclSingleMatch(s, opp, isFinal ? "Final" : `${roundName} — Leg ${leg}`, isHome, allowPens, !isFinal && leg===2 ? u.aggregate : {mine:0,opp:0});
      const record = { ...u.campaignRecord };
      record.gf+=result.myGoals; record.ga+=result.oppGoals;
      if (result.myGoals>result.oppGoals) record.w++; else if (result.myGoals<result.oppGoals) record.l++; else record.d++;
      const liveContext = buildLiveMatchContext(s, result, opp);
      const aggregate = isFinal ? u.aggregate : { mine:(u.aggregate?.mine||0)+result.myGoals, opp:(u.aggregate?.opp||0)+result.oppGoals };
      const newUclSuspended = result.redCard ? [result.redCard.id] : [];
      const cleanedLineup = cleanLineupOfSuspended(s.formation, s.clubs.find(c=>c.id===s.myClubId).players, s.lineup, newUclSuspended);
      return { ...applyMatchFitness(s,result), ucl: { ...u, lastMatch: result, liveContext, aggregate,
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
      const won = u.lastMatch.won;
      const isLastRound = u.knockoutRoundIndex === u.knockoutRounds.length-1;
      if (!won){
        const outcome = roundName==="Final" ? "RUNNER-UP" : `${roundName.toUpperCase()} EXIT`;
        return { ...s, ucl: { ...u, outcome, stage:"final" }, cups: { ...s.cups, ucl: { results:u.campaignResults, record:u.campaignRecord, outcome } } };
      }
      if (isLastRound){
        const outcome = "CHAMPION";
        return { ...s, ucl: { ...u, outcome, stage:"final" }, cups: { ...s.cups, ucl: { results:u.campaignResults, record:u.campaignRecord, outcome } } };
      }
      const nextIdx = u.knockoutRoundIndex+1;
      const opp = pickKnockoutOpponent(u, s.myClubId);
      return { ...s, ucl: { ...u, knockoutRoundIndex: nextIdx, currentKnockoutOpponentId: opp.id,
        leg:1, aggregate:{mine:0,opp:0}, firstLegHomeA: undefined, stage: "knockout-prep" } };
    }

