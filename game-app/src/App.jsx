import { slotAccepts, tacticalHints, clamp, topXI, matchOvr, STYLES, styleMatchupBonus, inferStyle, aiTactics, roundRobin, initTable, applyUpdates, appendClubForm, computeTableArray, ovrLabel, fmtM, ord, autoLineup, lineupIssue, ensureFixtures, pendingCupSlot, uclZoneLabel, simulateUclRound, cleanLineupOfSuspended, buildLiveMatchContext, freshState, applyPerformanceUpdates, playerSeasonAverage, seasonPlayerRows, seasonBestXI, seasonLabel, LEAGUE_NAMES } from "./game/engine.js";
import { selectUclField } from "./game/uclSelection.js";
import { standingsZone, standingsLegend } from "./game/standingsZones.js";
import { startUclBracket, bracketCurrentTie } from "./game/uclBracket.js";
import { simulateHalf, playLeagueRound, playDomesticCup, advanceLeagueRound, playEuropeanKnockout, advanceEuropeanKnockout } from "./game/actions.js";
import { ROLE_GROUP, GROUP_COLOR, EUROPEAN_CLUBS, FORMATIONS } from "./game/config.js";
import { marketOpen, loanFee, loanTerms, transfer, transferTerms, evaluateOffer, allClubs, startNextSeason } from "./game/career.js";
import { validateSave, loadGame, saveGame, exportGame } from "./game/storage.js";
import LiveMatchScreen from "./components/LiveMatchScreen.jsx";
import { CompetitionMark } from "./components/CompetitionBrand.jsx";
import { competitionBrand, competitionTheme } from "./components/competitionBrand.js";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftRight, Search, X, RotateCcw, Trophy, ChevronLeft, Building2, SlidersHorizontal, Sparkles, HandCoins } from "lucide-react";

export default function App(){
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saveError,setSaveError]=useState("");
  const [saveBlocked,setSaveBlocked]=useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [cupsOpen, setCupsOpen] = useState(false);
  const [tacticsOpen, setTacticsOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState({ q:"", pos:"ALL", league:"ALL", club:"ALL", sort:"ovr_desc" });
  const [toast, setToast] = useState("");
  const [dragPos, setDragPos] = useState(null);
  const [hoverSlot, setHoverSlot] = useState(null);
  const dragMeta = useRef(null);

  useEffect(() => {
    try { setState(loadGame(window.localStorage)); }
    catch(error){setState(freshState());setSaveError(error.message);setSaveBlocked(true);}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || !state || saveBlocked) return;
    try{saveGame(window.localStorage,state);setSaveError("");}
    catch(error){setSaveError(`Progress is not saved: ${error.message}. Export a backup.`);}
  }, [state,loaded,saveBlocked]);

  const flashToast=useCallback(msg=>{setToast(msg);},[]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(""),3000);return()=>clearTimeout(timer);},[toast]);
  const movePlayerToSlot=useCallback((targetIdx,playerId,source,sourceSlotIdx)=>{
    setState(s=>{
      const lineup={...s.lineup},displaced=lineup[targetIdx];
      Object.keys(lineup).forEach(k=>{if(lineup[k]===playerId)delete lineup[k];});
      lineup[targetIdx]=playerId;
      if(source==="slot"&&sourceSlotIdx!=null&&displaced&&displaced!==playerId){
        const p=s.clubs.find(c=>c.id===s.myClubId).players.find(p=>p.id===displaced);
        if(slotAccepts(FORMATIONS[s.formation][sourceSlotIdx].role,p))lineup[sourceSlotIdx]=displaced;
      }
      return {...s,lineup};
    });
  },[]);
  const setLineupSlot=useCallback((slotIdx,playerId)=>{
    setState(s=>{
      const lineup={...s.lineup};
      Object.keys(lineup).forEach(k=>{if(lineup[k]===playerId)delete lineup[k];});
      if(playerId)lineup[slotIdx]=playerId;else delete lineup[slotIdx];
      return {...s,lineup};
    });
  },[]);
  const dragging=!!dragPos;

  function startDrag(e, player, meta){
    e.preventDefault();
    dragMeta.current = { player, ...meta };
    setDragPos({ x: e.clientX, y: e.clientY });
  }
  useEffect(() => {
    if (!dragging) return;
    let frame=0;
    let nextPoint=null;
    function move(e){
      nextPoint={x:e.clientX,y:e.clientY};
      if(!frame)frame=requestAnimationFrame(()=>{setDragPos(nextPoint);frame=0;});
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el && el.closest("[data-slot-index]");
      setHoverSlot(slotEl ? parseInt(slotEl.getAttribute("data-slot-index"), 10) : null);
    }
    function up(e){
      if(frame)cancelAnimationFrame(frame);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el && el.closest("[data-slot-index]");
      const benchEl = el && el.closest('[data-bench="true"]');
      const meta = dragMeta.current;
      dragMeta.current = null;
      setDragPos(null);
      setHoverSlot(null);
      if (!meta) return;
      if (slotEl){
        const idx = parseInt(slotEl.getAttribute("data-slot-index"), 10);
        const slotRole = slotEl.getAttribute("data-slot-role");
        if (!slotAccepts(slotRole, meta.player)){ flashToast("Can't play there"); return; }
        movePlayerToSlot(idx, meta.player.id, meta.source, meta.slotIndex);
      } else if (benchEl && meta.source === "slot"){
        setLineupSlot(meta.slotIndex, undefined);
      }
    }
    function cancel(){if(frame)cancelAnimationFrame(frame);dragMeta.current=null;setDragPos(null);setHoverSlot(null);}
    function keydown(e){if(e.key==="Escape")cancel();}
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("keydown", keydown);
    return () => { if(frame)cancelAnimationFrame(frame);window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);window.removeEventListener("pointercancel",cancel);window.removeEventListener("keydown",keydown); };
  }, [dragging,flashToast,movePlayerToSlot,setLineupSlot]);

  if (!loaded || !state) {
    return <div style={{background:"#0a0e0a",minHeight:400,display:"flex",alignItems:"center",justifyContent:"center",color:"#8a8"}}>Loading squad data…</div>;
  }

  const myClub = state.clubs.find(c => c.id === state.myClubId);
  const isLive=state.stage.endsWith("-live") || (state.stage==="ucl" && state.ucl?.stage.endsWith("-live"));

  function updateClub(clubId, fn){ setState(s => ({ ...s, clubs: s.clubs.map(c => c.id===clubId ? fn(c) : c) })); }
  function restart(){
    if (!confirm("Restart the whole save? This wipes your squad, transfers and results.")) return;
    setState(freshState());setSaveBlocked(false);setSaveError("");
  }

  function pickLeague(lg){
    const map = { PL: s=>s.plClubs, LALIGA: s=>s.laligaClubs, SERIEA: s=>s.serieaClubs, BUNDES: s=>s.bundesligaClubs, LIGUE1: s=>s.ligue1Clubs };
    setState(s => ({ ...s, league: lg, clubs: (map[lg]||map.PL)(s), stage: "select" }));
  }
  function selectClub(clubId){
    const club = state.clubs.find(c=>c.id===clubId);
    const identity=aiTactics(club);
    setState(s => ({ ...s, myClubId: clubId, budget: club.budget, formation:club.preferredFormation || s.formation, lineup: autoLineup(FORMATIONS[club.preferredFormation || s.formation], club.players), tacticalStyle:identity.style, defensiveLine:identity.line, defensiveAggression:identity.aggression, offsideTrap:identity.trap, stage: "mode" }));
  }
  function pickMode(mode){ setState(s => ({ ...s, simMode: mode, stage: "squad" })); }

  function setFormation(f){
    setState(s => { const club = s.clubs.find(c=>c.id===s.myClubId); return { ...s, formation:f, lineup: autoLineup(FORMATIONS[f], club.players.filter(p=>!(s.suspensions?.[s.stage==="ucl"?"ucl":"domestic"]||[]).includes(p.id))) }; });
  }
  function setTacticalStyle(key){ setState(s => ({ ...s, tacticalStyle: key })); }
  function setDefensiveLine(val){ setState(s => ({ ...s, defensiveLine: val })); }
  function setDefensiveAggression(val){ setState(s => ({ ...s, defensiveAggression: val })); }
  function setOffsideTrap(val){ setState(s => ({ ...s, offsideTrap: val })); }
  function editNumber(playerId, num){
    updateClub(state.myClubId, c => ({ ...c, players: c.players.map(p => p.id===playerId ? {...p, number:num} : p) }));
  }
  function doTransfer(action){
    try{setState(transfer(state,action));flashToast("Transfer completed");return true;}
    catch(error){flashToast(error.message);return false;}
  }
  function sellPlayer(playerId){doTransfer({type:"sell",playerId});}
  function loanOut(playerId){doTransfer({type:"loan-out",playerId});}
  function buyPlayer(seller,player,fee){return doTransfer({type:"buy",sellerId:seller.id,playerId:player.id,fee});}
  function loanIn(seller,player){return doTransfer({type:"loan-in",sellerId:seller.id,playerId:player.id});}
  function commitGame(transform){
    try{setState(transform(state));}catch(error){flashToast(error.message);}
  }
  function requireLineup(s,competition="domestic"){
    const issue=lineupIssue(s,competition);if(issue)throw new Error(issue);
  }
  function nextSeason(){commitGame(startNextSeason);}
  function downloadSave(){
    const url=URL.createObjectURL(new Blob([exportGame(state)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="football-manager-save.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function importSave(event){
    const file=event.target.files?.[0];if(!file)return;
    try{const next=validateSave(JSON.parse(await file.text()));setState(next);setSaveBlocked(false);setSaveError("");flashToast("Save imported");}
    catch(error){flashToast(error.message);}event.target.value="";
  }

  function runHalf(half){commitGame(s=>simulateHalf(s, half));}

  function beginMatchday(half){
    commitGame(s => { const cur = ensureFixtures(s); return { ...cur, half, roundIndex: 0, stage: "matchday-prep" }; });
  }
  function playRound(){commitGame(s=>playLeagueRound(s));}

  function playCupMatch(comp, round){commitGame(s=>playDomesticCup(s, comp, round));}

  function finishDomesticLive(){
    commitGame(s => ({ ...s, stage: s.stage==="matchday-live" ? "matchday-result" : s.stage==="cup-live" ? "cup-result" : s.stage }));
  }
  function continueAfterCup(){ commitGame(s => ({ ...s, stage: "matchday-prep" })); }
  function nextMatch(){commitGame(s=>advanceLeagueRound(s));}

  function goToMidWindow(){ commitGame(s => ({ ...s, stage: "squad2" })); }
  function finalizeSeason(){ commitGame(s => ({ ...s, stage: "summary" })); }

  // Build a 36-club field with genuine representatives from the managed league as well.
  function enterUcl(){
    commitGame(s => {
      if (s.ucl && s.ucl.stage !== "final") return { ...s, stage: "ucl" };
      const clubs = selectUclField(s);
      const ids = clubs.map(c=>c.id);
      const rounds = roundRobin(ids).slice(0, 8);
      return { ...s, stage: "ucl", ucl: {
        stage: "hub", clubs, rounds, roundIndex: 0, tableRaw: initTable(ids), form: {}, lastMatch: null,
        campaignResults: [], campaignRecord: { w:0,d:0,l:0,gf:0,ga:0 },
        phaseTable: null, qualification: null,
        knockoutRounds: [], knockoutRoundIndex: 0, knockoutFaced: [], currentKnockoutOpponentId: null,
        leg: 1, aggregate: { mine:0, opp:0 }, firstLegHomeA: undefined, outcome: null,
      }};
    });
  }
  function uclGoToPrep(){ commitGame(s => ({ ...s, ucl: { ...s.ucl, stage: "match-prep" } })); }
  function uclPlayLeagueMatch(){
    commitGame(s => {
      requireLineup(s,"ucl");
      const u = s.ucl;
      const round = u.rounds[u.roundIndex];
      const { updates, userResult, performanceUpdates } = simulateUclRound(s, u.clubs, round);
      const tableRaw = applyUpdates(u.tableRaw, updates);
      const record = { ...u.campaignRecord };
      record.gf += userResult.myGoals; record.ga += userResult.oppGoals;
      if (userResult.myGoals>userResult.oppGoals) record.w++; else if (userResult.myGoals<userResult.oppGoals) record.l++; else record.d++;
      const oppClub = u.clubs.find(c=>c.id===userResult.opponentId);
      const liveContext = buildLiveMatchContext(s, userResult, oppClub);
      const newUclSuspended = userResult.redCard ? [userResult.redCard.id] : [];
      const cleanedLineup = cleanLineupOfSuspended(s.formation, s.clubs.find(c=>c.id===s.myClubId).players, s.lineup, newUclSuspended);
      let next=applyPerformanceUpdates({...s,ucl:{...u,tableRaw,form:appendClubForm(u.form,updates)}},performanceUpdates);
      return { ...next, ucl: { ...next.ucl, lastMatch: userResult, liveContext, stage: "match-live",
        campaignResults: [...u.campaignResults, userResult], campaignRecord: record },
        lineup: cleanedLineup,
        suspensions: { ...s.suspensions, ucl: newUclSuspended } };
    });
  }
  function uclFinishLiveMatch(){
    commitGame(s => {
      const map = { "match-live":"match-result", "knockout-live":"knockout-result" };
      return { ...s, ucl: { ...s.ucl, stage: map[s.ucl.stage] || s.ucl.stage } };
    });
  }
  function uclContinueAfterMatch(){
    commitGame(s => {
      const u = s.ucl;
      if (u.roundIndex === 7){
        const phaseTable = computeTableArray(u.tableRaw, u.clubs);
        const rank = phaseTable.findIndex(r=>r.id===s.myClubId)+1;
        const qualification = rank<=8 ? "top8" : rank<=24 ? "playoff" : "eliminated";
        return { ...s, ucl: { ...u, phaseTable, qualification, stage: "phase-summary" } };
      }
      return { ...s, ucl: { ...u, roundIndex: u.roundIndex+1, stage: "hub" } };
    });
  }
  // Knockout Playoff, Round of 16, Quarter-Final and Semi-Final are all two-legged (aggregate score,
  // penalties if level after the second leg) — only the Final is a single match, same as the real competition.
  function uclContinueAfterPhaseSummary(){
    commitGame(s => {
      const u = s.ucl;
      if (u.qualification === "eliminated"){
        const outcome = "LEAGUE PHASE EXIT";
        return { ...s, ucl: { ...u, outcome, stage:"final" }, cups: { ...s.cups, ucl: { results:u.campaignResults, record:u.campaignRecord, outcome } } };
      }
      const knockoutBracket=startUclBracket(u.phaseTable,s.myClubId,u.clubs);
      const current=bracketCurrentTie(knockoutBracket,s.myClubId);
      const knockoutRounds=u.qualification==="playoff"?["Playoff","Round of 16","Quarter-Final","Semi-Final","Final"]:["Round of 16","Quarter-Final","Semi-Final","Final"];
      const oppId=current.tie.aId===s.myClubId?current.tie.bId:current.tie.aId;
      return { ...s, ucl: { ...u, knockoutBracket, knockoutRounds, knockoutRoundIndex:0, knockoutFaced:[], currentKnockoutOpponentId:oppId,
        leg:1, aggregate:{mine:0,opp:0}, firstLegHomeA: undefined, stage: "knockout-prep" } };
    });
  }
  function uclPlayKnockout(){commitGame(s=>playEuropeanKnockout(s));}

  function uclContinueAfterKnockout(){commitGame(s=>advanceEuropeanKnockout(s));}

  function uclBackToSeason(){ commitGame(s => ({ ...s, stage: myClub ? (s.tableFinal ? "summary" : "squad") : "select" })); }
  const uclActions = { enterUcl, uclGoToPrep, uclPlayLeagueMatch, uclFinishLiveMatch, uclContinueAfterMatch, uclContinueAfterPhaseSummary,
    uclPlayKnockout, uclContinueAfterKnockout, uclBackToSeason };

  const squadCommonProps = { state, myClub, onSetFormation: setFormation, onDragStart: startDrag, onEditNumber: editNumber, onSell: sellPlayer, onLoanOut: loanOut, onOpenMarket: ()=>setMarketOpen(true), onOpenCups: ()=>setCupsOpen(true), onOpenTactics: ()=>setTacticsOpen(true), draggingPlayer: dragMeta.current?.player || null, hoverSlot, suspendedIds: state.suspensions?.[state.stage==="ucl"?"ucl":"domestic"] || [] };

  let stageEl = null;
  if (state.stage === "league-select") stageEl = <LeagueSelect onPick={pickLeague} />;
  else if (state.stage === "select") stageEl = <TeamSelect clubs={state.clubs} league={state.league} onSelect={selectClub} />;
  else if (state.stage === "mode") stageEl = <ModeSelect onPick={pickMode} />;
  else if (state.stage === "squad" && myClub) stageEl = <SquadScreen {...squadCommonProps}
    onSimulate={()=> state.simMode==="half" ? runHalf(1) : beginMatchday(1)}
    simulateLabel={state.simMode==="half" ? `Simulate First Half (${state.clubs.length-1} matches)` : "Start Season"} />;
  else if (state.stage === "squad2" && myClub) stageEl = <SquadScreen {...squadCommonProps}
    onSimulate={()=> state.simMode==="half" ? runHalf(2) : beginMatchday(2)}
    simulateLabel={state.simMode==="half" ? `Simulate Second Half (${state.clubs.length-1} matches)` : "Continue Season"} />;
  else if (state.stage === "matchday-prep" && myClub){
    const cupSlot = pendingCupSlot(state.myClubId, state.half, state.roundIndex, state.cupStatus, state.league);
    if (cupSlot){
      const compLabel = cupSlot.comp === "fa" ? "FA Cup" : cupSlot.comp === "copa" ? "Copa del Rey" : "Carabao Cup";
      stageEl = (
        <div>
          <div style={{ background:"#1c1a12", border:"1px solid #6b5a2d", borderRadius:10, padding:"10px 16px", marginBottom:14, textAlign:"center" }}>
            <div style={{ fontSize:12, color:"#e8d09a" }}>🏆 {compLabel} — {cupSlot.round}</div>
            <div style={{ fontSize:11, color:"#9ab89a", marginTop:2 }}>Opponent drawn at kickoff — set your lineup and go.</div>
          </div>
          <SquadScreen {...squadCommonProps} onSimulate={()=>playCupMatch(cupSlot.comp, cupSlot.round)} simulateLabel={`Play ${compLabel} — ${cupSlot.round}`} />
        </div>
      );
    } else {
      const rounds = state.half===1 ? state.roundsHalf1 : state.roundsHalf2;
      const round = rounds[state.roundIndex];
      const match = round.find(([h,a]) => h===state.myClubId || a===state.myClubId);
      const isHome = match[0] === state.myClubId;
      const opponent = state.clubs.find(c => c.id === (isHome ? match[1] : match[0]));
      const oppForm = opponent.preferredFormation || "4-4-2";
      const oppStyle = inferStyle(opponent.players, oppForm, opponent.id);
      const myStyle = state.tacticalStyle || "balanced";
      const hints = tacticalHints(state.formation, oppForm);
      const sBonus = styleMatchupBonus(myStyle, oppStyle), sBonusAgainst = styleMatchupBonus(oppStyle, myStyle);
      if (sBonus >= 0.04) hints.push({ text:`${STYLES[myStyle].name} exploits their ${STYLES[oppStyle].name} ✓`, color:"#7fd88f" });
      else if (sBonusAgainst >= 0.04) hints.push({ text:`Vulnerable to their ${STYLES[oppStyle].name} ⚠`, color:"#e8b84b" });
      stageEl = (
        <div>
          <MatchdayPreview key={opponent.id} state={state} myClub={myClub} opponent={opponent} isHome={isHome} oppForm={oppForm}
            myStyle={myStyle} oppStyle={oppStyle} hints={hints} onPlay={playRound}/>
          <SquadScreen {...squadCommonProps} onSimulate={playRound} simulateLabel={`Play Match vs ${opponent.name}`} showSimulate={false} />
        </div>
      );
    }
  }
  else if (state.stage === "matchday-live" || state.stage === "cup-live"){
    stageEl=<LiveMatchScreen {...state.lastLiveContext} onDone={finishDomesticLive} />;
  }
  else if (state.stage === "cup-result"){
    const r = state.lastCupResult;
    const compLabel = r.comp === "fa" ? "FA Cup" : r.comp === "copa" ? "Copa del Rey" : "Carabao Cup";
    stageEl = (
      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <div style={{ fontSize:12, color:"#e8d09a", marginBottom:10 }}>🏆 {compLabel} · {r.round}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:10, flexWrap:"wrap" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>{r.homeA ? myClub.name : r.opponent}</div>
          <div style={{ fontSize:32, fontWeight:800 }}>{r.homeA?r.myGoals:r.oppGoals} - {r.homeA?r.oppGoals:r.myGoals}</div>
          <div style={{ fontWeight:700, fontSize:15 }}>{r.homeA ? r.opponent : myClub.name}</div>
        </div>
        {r.wentToPens && <div style={{ fontSize:12, color:"#e8b84b", marginBottom:6 }}>Decided on penalties — {r.wonPens ? "you won" : "you lost"} the shootout</div>}
        <ResultBadge result={r.won ? "W" : "L"} />
        {r.scorerStr && <div style={{ fontSize:12, color:"#9ab89a", marginTop:10 }}>⚽ {r.scorerStr}</div>}
        <MatchAward motm={r.manOfTheMatch}/>
        {r.redCard && <div style={{ fontSize:12, color:"#e08a8a", marginTop:6 }}>🟥 {r.redCard.name} sent off — suspended for your next domestic match</div>}
        <div style={{ marginTop:10, fontSize:13, fontWeight:700, color: r.won ? "#7fd88f" : "#e08a8a" }}>
          {r.won ? (r.round==="Final" ? "🏆 Champions!" : "Through to the next round") : (r.round==="Final" ? "Runners-up" : "Knocked out")}
        </div>
        <div style={{ marginTop:26 }}>
          <button onClick={continueAfterCup} style={primaryBtnStyle}>Back to the League →</button>
        </div>
      </div>
    );
  }
  else if (state.stage === "matchday-result"){
    const isLast = state.roundIndex === (state.half===1?state.roundsHalf1:state.roundsHalf2).length-1;
    const r = state.lastResult;
    stageEl = (
      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <div style={{ fontSize:12, color:"#6a8a6a", marginBottom:10 }}>Full Time · GW{r.gw}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:10, flexWrap:"wrap" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>{r.isHome ? myClub.name : r.opponent}</div>
          <div style={{ fontSize:32, fontWeight:800 }}>{r.isHome?r.myGoals:r.oppGoals} - {r.isHome?r.oppGoals:r.myGoals}</div>
          <div style={{ fontWeight:700, fontSize:15 }}>{r.isHome ? r.opponent : myClub.name}</div>
        </div>
        <ResultBadge result={r.result} />
        {r.scorerStr && <div style={{ fontSize:12, color:"#9ab89a", marginTop:10 }}>⚽ {r.scorerStr}</div>}
        <MatchAward motm={r.manOfTheMatch}/>
        {r.redCard && <div style={{ fontSize:12, color:"#e08a8a", marginTop:6 }}>🟥 {r.redCard.name} sent off — suspended for your next domestic match</div>}
        <div style={{ marginTop:26 }}>
          <button onClick={nextMatch} style={primaryBtnStyle}>{isLast ? (state.half===1?"View Half-Season Table →":"View Final Table →") : "Next Fixture →"}</button>
        </div>
      </div>
    );
  }
  else if (state.stage === "half-results") stageEl = <ResultsScreen title="First Half of the Season" results={state.results1} table={state.table1} clubs={state.clubs} myClubId={state.myClubId} onContinue={goToMidWindow} continueLabel="Go to Transfer Window →" cupStatus={state.cupStatus} league={state.league} />;
  else if (state.stage === "full-results") stageEl = <ResultsScreen title="Final Season Results" results={state.results2} table={state.tableFinal} clubs={state.clubs} myClubId={state.myClubId} onContinue={finalizeSeason} continueLabel="Finalise Season →" projectedTable={state.table1} cupStatus={state.cupStatus} league={state.league} />;
  else if (state.stage === "summary") stageEl = <SummaryScreen state={state} myClub={myClub} onNextSeason={nextSeason} onOpenCups={()=>setCupsOpen(true)} />;
  else if (state.stage === "ucl" && state.ucl) stageEl = <UclPage state={state} myClub={myClub} squadCommonProps={squadCommonProps} actions={uclActions} />;

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:"#0a0e0a", minHeight:"100vh", width:"100%", color:"#e8ede8" }}>
      <style>{`
        html, body { margin:0; padding:0; width:100%; min-height:100%; background:#0a0e0a; }
        #root, #app, #__next { width:100%; max-width:none; margin:0; padding:0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height:8px; }
        ::-webkit-scrollbar-thumb { background:#2a3a2a; border-radius:4px; }
        select, input, button { font-family: inherit; }
        button { cursor:pointer; }
        .grid-2col { display:grid; grid-template-columns: minmax(300px,420px) 1fr; gap:24px; align-items:start; }
        .ucl-prep-grid { display:grid; grid-template-columns: 1fr 340px; gap:24px; align-items:start; }
        @media (max-width:760px){
          .grid-2col { grid-template-columns: 1fr; }
          .ucl-prep-grid { grid-template-columns: 1fr; }
          .app-pad { padding: 14px 10px 50px !important; }
          .top-actions { width:100%; justify-content:space-between; }
        }
        @keyframes pulseGlow { 0%{box-shadow:0 0 0 0 rgba(127,216,143,0.45);} 70%{box-shadow:0 0 0 10px rgba(127,216,143,0);} 100%{box-shadow:0 0 0 0 rgba(127,216,143,0);} }
        .slot-eligible { animation: pulseGlow 1.1s infinite; }
      `}</style>

      {toast && (
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", background:"#1c2b1c", border:"1px solid #3a5a3a", color:"#c8f5c8", padding:"8px 16px", borderRadius:8, fontSize:13, zIndex:999 }}>{toast}</div>
      )}

      {dragPos && dragMeta.current && (
        <div className="pitch-drag-ghost" style={{ left:dragPos.x, top:dragPos.y,"--role-color":GROUP_COLOR[dragMeta.current.player.group] }}>
          <b>{matchOvr(dragMeta.current.player)}</b><small>{dragMeta.current.player.role}</small><strong>{dragMeta.current.player.name}</strong>
        </div>
      )}

      <div className="app-pad" style={{ maxWidth:"100%", width:"100%", margin:"0 auto", padding:"20px clamp(16px,3vw,60px) 60px" }}>
        <Header myClub={myClub} league={state.league} onRestart={restart} />
        <SaveToolbar state={state} saveBlocked={saveBlocked} saveError={saveError}
          onExport={downloadSave} onImport={importSave} />
        {myClub && !isLive && <SeasonStatus state={state} myClub={myClub} />}
        {state.development?.length>0 && state.stage==="squad" && <DevelopmentPanel changes={state.development} />}
        {stageEl}
      </div>

      {marketOpen && myClub && (
        <TransferMarket state={state} myClub={myClub} filter={marketFilter} setFilter={setMarketFilter}
          onClose={()=>setMarketOpen(false)} onBuy={buyPlayer} onLoanIn={loanIn} />
      )}
      {cupsOpen && myClub && (
        <CupsHub state={state} onClose={()=>setCupsOpen(false)} onEnterUcl={()=>{ setCupsOpen(false); enterUcl(); }} />
      )}
      {tacticsOpen && myClub && (
        <TacticsModal state={state} onClose={()=>setTacticsOpen(false)} onSetStyle={setTacticalStyle} onSetLine={setDefensiveLine} onSetAggression={setDefensiveAggression} onSetTrap={setOffsideTrap} onSetPlan={plan=>setState(s=>({...s,...plan}))} />
      )}
    </div>
  );
}

const primaryBtnStyle = { background:"#2d6b3f", border:"none", color:"#fff", fontWeight:700, fontSize:14, padding:"12px 28px", borderRadius:10 };

/* ============================== SUBCOMPONENTS ============================== */
function SaveToolbar({ state, saveBlocked, saveError, onExport, onImport }){
  const saveLabel=saveBlocked?"Save paused":saveError?"Save failed":"Saved locally";
  return (
    <div className="save-toolbar">
      <div className="save-state">
        <span className={`save-dot ${saveBlocked||saveError?"save-dot-warning":""}`}/>
        <span>{seasonLabel(state)}</span><span className="save-separator">·</span><span>{saveLabel}</span>
      </div>
      <div className="save-actions">
        {saveError&&<div className="save-warning-widget" role="alert" title={saveError}><span>⚠ Save paused</span><small>{saveBlocked?"Import a valid backup to resume":"Storage is full · export a backup"}</small><button onClick={onExport}>Export</button></div>}
        {!saveError&&<button className="quiet-button" onClick={onExport}>Export save</button>}
        <label className="quiet-button file-button">Import save
          <input className="visually-hidden" aria-label="Import save" type="file" accept="application/json,.json" onChange={onImport} />
        </label>
      </div>
    </div>
  );
}
function SeasonStatus({ state, myClub }){
  const condition=Math.round(myClub.players.reduce((sum,p)=>sum+(p.condition??100),0)/Math.max(1,myClub.players.length));
  const energy=Math.round(myClub.players.reduce((sum,p)=>sum+(p.energy??100),0)/Math.max(1,myClub.players.length));
  const form=[...state.results1,...state.results2].slice(-5).map(r=>r.result);
  const loans=state.loans.filter(l=>l.borrowerId===state.myClubId).length;
  const conditionTone=condition>=90?"good":condition>=82?"okay":"low";
  return (
    <section className="season-status" aria-label="Club overview">
      <div className="overview-card">
        <div className="overview-label">Season</div>
        <div className="overview-value">{state.season}</div>
        <div className="overview-note">{seasonLabel(state)}</div>
      </div>
      <div className="overview-card">
        <div className="overview-label">Transfer budget</div>
        <div className="overview-value overview-money">{fmtM(state.budget)}</div>
        <div className="overview-note">Available funds</div>
      </div>
      <div className="overview-card">
        <div className="overview-label">Squad fitness</div>
        <div className="overview-value">{condition}%</div>
        <div className="condition-track"><span className={`condition-fill ${conditionTone}`} style={{width:`${condition}%`}}/></div>
        <div className="overview-note">Average energy {energy}%</div>
      </div>
      <div className="overview-card">
        <div className="overview-label">Recent form</div>
        <div className="form-row">
          {[0,1,2,3,4].map(i=>{
            const result=form[i];
            return <span key={i} className={`form-badge ${result?`form-${result.toLowerCase()}`:"form-empty"}`}>{result||"–"}</span>;
          })}
        </div>
        <div className="overview-note">Last five league matches</div>
      </div>
      <div className="overview-card">
        <div className="overview-label">Loans in</div>
        <div className="overview-value">{loans}<span className="overview-muted"> / 3</span></div>
        <div className="overview-note">Squad limit</div>
      </div>
    </section>
  );
}
function DevelopmentPanel({ changes }){
  const normalized=changes.map((change,index)=>{
    if(typeof change!=="string")return change;
    const parsed=change.match(/^(.*): (\d+) → (\d+)$/);
    if(!parsed)return {id:index,name:change,from:"–",to:"–",delta:0};
    const from=Number(parsed[2]),to=Number(parsed[3]);
    return {id:index,name:parsed[1],from,to,delta:to-from};
  });
  const improved=normalized.filter(c=>c.delta>0).length;
  const declined=normalized.filter(c=>c.delta<0).length;
  return (
    <section className="development-panel">
      <div className="development-heading">
        <div><div className="development-kicker">Season update</div><div className="development-title">Squad development</div></div>
        <div className="development-summary">{improved} improved · {declined} declined</div>
      </div>
      <div className="development-grid">
        {normalized.map(change=><div className="development-player" key={change.id||change.name}>
          <span className="development-name">{change.name}</span>
          <span className="rating-change"><span>{change.from}</span><span className="rating-arrow">→</span><strong className={change.delta>0?"rating-up":"rating-down"}>{change.to}</strong></span>
        </div>)}
      </div>
    </section>
  );
}
const CLUB_LOGOS = import.meta.glob("./assets/club-logos/*.png", { eager:true, query:"?url", import:"default" });
function ClubBadge({club,size="sm",className=""}){
  const initials=club?club.name.split(" ").map(word=>word[0]).slice(0,2).join(""):"?";
  const logo=club&&CLUB_LOGOS[`./assets/club-logos/${club.id}.png`];
  return <span className={`club-crest club-crest-${size} ${logo?"club-crest-real":""} ${className}`} style={{"--club-color":club?.color||"#3a5a3a"}} title={club?.name}>
    {logo?<img src={logo} alt="" draggable="false"/>:<b>{initials}</b>}
  </span>;
}
function Header({ myClub, league, onRestart }){
  const LEAGUE_LABELS = { LALIGA:"LA LIGA MANAGER", SERIEA:"SERIE A MANAGER", BUNDES:"BUNDESLIGA MANAGER", LIGUE1:"LIGUE 1 MANAGER" };
  const label = LEAGUE_LABELS[league] || "PREMIER LEAGUE MANAGER";
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, paddingBottom:14, borderBottom:"1px solid #1c2b1c", flexWrap:"wrap", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <ClubBadge club={myClub} size="sm"/>
        <div>
          <div style={{ fontSize:11, letterSpacing:1, color:"#6a8a6a" }}>{label}</div>
          <div style={{ fontSize:16, fontWeight:700 }}>{myClub ? myClub.name : "Choose your club"}</div>
        </div>
      </div>
      <button onClick={onRestart} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:"1px solid #2a3a2a", color:"#9ab89a", padding:"7px 12px", borderRadius:8, fontSize:12 }}>
        <RotateCcw size={13}/> Restart
      </button>
    </div>
  );
}

function LeagueSelect({ onPick }){
  const cardStyle = { background:"#111a11", border:"1px solid #2a3a2a", borderRadius:14, padding:24, width:260, textAlign:"left", color:"#e8ede8" };
  return (
    <div style={{ textAlign:"center", padding:"20px 0 40px" }}>
      <h2 style={{ fontSize:18, marginBottom:16 }}>Choose your league</h2>
      <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
        <button onClick={()=>onPick("PL")} style={cardStyle}>
          <div style={{ fontSize:26, marginBottom:8 }}>🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
          <div style={{ fontWeight:700, marginBottom:4, fontSize:15 }}>Premier League</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>England · 20 clubs · FA Cup, Carabao Cup and Champions League all in play.</div>
        </button>
        <button onClick={()=>onPick("LALIGA")} style={cardStyle}>
          <div style={{ fontSize:26, marginBottom:8 }}>🇪🇸</div>
          <div style={{ fontWeight:700, marginBottom:4, fontSize:15 }}>La Liga</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>Spain · 20 clubs · Copa del Rey and Champions League.</div>
        </button>
        <button onClick={()=>onPick("SERIEA")} style={cardStyle}>
          <div style={{ fontSize:26, marginBottom:8 }}>🇮🇹</div>
          <div style={{ fontWeight:700, marginBottom:4, fontSize:15 }}>Serie A</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>Italy · 20 clubs · Champions League available. Domestic cups not yet modelled.</div>
        </button>
        <button onClick={()=>onPick("BUNDES")} style={cardStyle}>
          <div style={{ fontSize:26, marginBottom:8 }}>🇩🇪</div>
          <div style={{ fontWeight:700, marginBottom:4, fontSize:15 }}>Bundesliga</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>Germany · 18 clubs · Champions League available. Domestic cups not yet modelled.</div>
        </button>
        <button onClick={()=>onPick("LIGUE1")} style={cardStyle}>
          <div style={{ fontSize:26, marginBottom:8 }}>🇫🇷</div>
          <div style={{ fontWeight:700, marginBottom:4, fontSize:15 }}>Ligue 1</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>France · 18 clubs · Champions League available. Domestic cups not yet modelled.</div>
        </button>
      </div>
    </div>
  );
}
function TeamSelect({ clubs, league, onSelect }){
  const LEAGUE_NAMES = { LALIGA:"La Liga", SERIEA:"Serie A", BUNDES:"Bundesliga", LIGUE1:"Ligue 1" };
  const leagueName = LEAGUE_NAMES[league] || "Premier League";
  return (
    <div>
      <p style={{ color:"#9ab89a", fontSize:13, marginBottom:16 }}>
        Pick your club for the 2026/27 {leagueName} season. Included squads and game transfer values — build your XI, work the market, then simulate.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
        {clubs.map(c => (
          <button key={c.id} onClick={()=>onSelect(c.id)} style={{
            background:"#111a11", border:"1px solid #223322", borderRadius:12, padding:"16px 10px", textAlign:"center",
            display:"flex", flexDirection:"column", alignItems:"center", gap:8
          }}>
            <ClubBadge club={c} size="md"/>
            <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
            <div style={{ fontSize:11, color:"#6a8a6a" }}>Budget {fmtM(c.budget)} · {c.players.length} players</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ModeSelect({ onPick }){
  const cardStyle = { background:"#111a11", border:"1px solid #2a3a2a", borderRadius:14, padding:20, width:230, textAlign:"left", color:"#e8ede8" };
  return (
    <div style={{ textAlign:"center", padding:"10px 0 30px" }}>
      <h2 style={{ fontSize:17, marginBottom:16 }}>How do you want to play the season?</h2>
      <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
        <button onClick={()=>onPick("match")} style={cardStyle}>
          <div style={{ fontSize:24, marginBottom:8 }}>🎮</div>
          <div style={{ fontWeight:700, marginBottom:4 }}>Match by Match</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>See each fixture, tweak your XI before kickoff, then simulate one game at a time.</div>
        </button>
        <button onClick={()=>onPick("half")} style={cardStyle}>
          <div style={{ fontSize:24, marginBottom:8 }}>⚡</div>
          <div style={{ fontWeight:700, marginBottom:4 }}>Instant Half-Season</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>Simulate the half-season, including scheduled cup matches and your match plan.</div>
        </button>
      </div>
    </div>
  );
}

function FormStrip({results,label}){
  const last=(results||[]).slice(-5);
  return <div className="fixture-form"><span>{label}</span><div className="matchday-form">{Array.from({length:5},(_,i)=>{const result=last[i];const letter=typeof result==="string"?result:result?.result;return <b key={i} className={letter?`form-${letter.toLowerCase()}`:"form-empty"}>{letter||"—"}</b>;})}</div></div>;
}
function LineupSheet({club,formation,style,players,caption}){
  const slots=FORMATIONS[formation]||FORMATIONS["4-3-3"];
  const average=Math.round(players.reduce((total,player)=>total+(player?matchOvr(player):0),0)/Math.max(players.length,1));
  return <section className="prematch-sheet" style={{"--team-color":club.color||"#4d9d62"}}>
    <div className="prematch-sheet-head"><ClubBadge club={club} size="xl"/><div><span>{caption}</span><strong>{club.name}</strong><small>{formation} <i/> {STYLES[style]?.name||"Balanced"}</small></div><b>{average}<small>XI AVG</small></b></div>
    <div className="prematch-column-labels"><span>STARTING XI</span><span>ENERGY</span><span>FITNESS</span><span>OVR</span></div>
    <div className="prematch-roster">{slots.map((slot,i)=>{const player=players[i];const energy=clamp(Math.round(player?.energy??100),0,100);const fitness=clamp(Math.round(player?.condition??100),0,100);return <div className="prematch-roster-row" key={i} style={{"--role-color":GROUP_COLOR[ROLE_GROUP[slot.role]]}}>
      <span className="prematch-role">{slot.role}</span><strong title={player?.name}>{player?.name||"Vacant"}</strong>
      <div className="prematch-energy" title={`Energy ${energy}%`}><i style={{width:`${energy}%`}}/><small>{energy}%</small></div>
      <span className={`prematch-fitness ${fitness>=90?"good":fitness>=75?"mid":"low"}`} title={`Fitness ${fitness}%`}><FitnessGem condition={fitness}/>{fitness}%</span>
      <b className="prematch-rating">{player?Math.round(matchOvr(player)):"—"}</b>
    </div>;})}</div>
  </section>;
}
function FormationBoard({club,formation,style,players,caption}){
  const slots=FORMATIONS[formation]||FORMATIONS["4-3-3"];
  return <section className="prematch-formation-board" style={{"--team-color":club.color||"#4d9d62"}}>
    <header><ClubBadge club={club} size="sm"/><div><span>{caption}</span><strong>{club.name}</strong><small>{formation} · {STYLES[style]?.name||"Balanced"}</small></div></header>
    <div className="prematch-formation-pitch"><div className="prematch-formation-lines"/>{slots.map((slot,i)=>{const player=players[i];const energy=clamp(Math.round(player?.energy??100),0,100);return <div key={i} className="prematch-formation-slot" style={{left:`${slot.x}%`,top:`${slot.y}%`,"--role-color":GROUP_COLOR[ROLE_GROUP[slot.role]]}}>
      <div className="prematch-formation-card"><div><b>{player?Math.round(matchOvr(player)):"—"}</b><span>{slot.role}</span></div><strong title={player?.name}>{player?.name||"Vacant"}</strong><div className="prematch-formation-vitals"><FitnessGem condition={player?.condition}/><i><span style={{width:`${energy}%`}}/></i><small>{energy}%</small></div></div>
    </div>;})}</div>
    <footer><span><FitnessGem condition={100}/> Fitness</span><span><i/> Energy</span></footer>
  </section>;
}
function PreMatchLineups({myClub,opponent,isHome,myFormation,oppFormation,myStyle,oppStyle,myXI,oppXI,label,brandId,onClose,onContinue}){
  const [view,setView]=useState("sheets");
  useEffect(()=>{const handle=e=>{if(e.key==="Escape")onClose();};document.addEventListener("keydown",handle);return()=>document.removeEventListener("keydown",handle);},[onClose]);
  const home=isHome?myClub:opponent,away=isHome?opponent:myClub;
  return createPortal(<div className="prematch-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="prematch-dialog competition-theme" style={competitionTheme(brandId)} role="dialog" aria-modal="true" aria-label="Match lineups">
      <header className="prematch-header"><button onClick={onClose} aria-label="Close lineup preview">← Back</button><div><CompetitionMark id={brandId} size="sm"/><span>{label}</span><strong>Team sheets</strong></div><span>READY FOR KICKOFF</span></header>
      <div className="prematch-matchup"><div><ClubBadge club={home} size="sm"/><strong>{home.name}</strong></div><b>VS</b><div><ClubBadge club={away} size="sm"/><strong>{away.name}</strong></div></div>
      <div className="prematch-view-switch" role="tablist" aria-label="Lineup view"><button role="tab" aria-selected={view==="sheets"} className={view==="sheets"?"active":""} onClick={()=>setView("sheets")}>Team sheets</button><button role="tab" aria-selected={view==="formation"} className={view==="formation"?"active":""} onClick={()=>setView("formation")}>Formation view</button><span>Compare every starter before kickoff</span></div>
      {view==="sheets"?<div className="prematch-lineups"><LineupSheet club={home} formation={isHome?myFormation:oppFormation} style={isHome?myStyle:oppStyle} players={isHome?myXI:oppXI} caption={isHome?"YOUR TEAM · HOME":"OPPONENT · HOME"}/><LineupSheet club={away} formation={isHome?oppFormation:myFormation} style={isHome?oppStyle:myStyle} players={isHome?oppXI:myXI} caption={isHome?"OPPONENT · AWAY":"YOUR TEAM · AWAY"}/></div>:<div className="prematch-lineups prematch-formation-view"><FormationBoard club={home} formation={isHome?myFormation:oppFormation} style={isHome?myStyle:oppStyle} players={isHome?myXI:oppXI} caption={isHome?"YOUR TEAM · HOME":"OPPONENT · HOME"}/><FormationBoard club={away} formation={isHome?oppFormation:myFormation} style={isHome?oppStyle:myStyle} players={isHome?oppXI:myXI} caption={isHome?"OPPONENT · AWAY":"YOUR TEAM · AWAY"}/></div>}
      <footer className="prematch-footer"><span>{view==="sheets"?"Energy and fitness are shown for both starting elevens.":"Both formations are shown with current match OVR and energy."}</span><button onClick={onContinue}>Continue to match <b>→</b></button></footer>
    </div>
  </div>,document.body);
}
function MatchdayPreview({state,myClub,opponent,isHome,oppForm,myStyle,oppStyle,hints,onPlay,label,subLabel,myForm,oppRecent}){
  const [showOppXI,setShowOppXI]=useState(false);
  const [showLineups,setShowLineups]=useState(false);
  const isUcl=state.stage==="ucl";
  const gameweek=(state.half===1?0:(state.roundsHalf1?.length||0))+state.roundIndex+1;
  const fixtureLabel=label||(state.stage==="matchday-prep"?`LEAGUE MATCHDAY ${gameweek} / ${(state.roundsHalf1?.length||0)+(state.roundsHalf2?.length||0)}`:"NEXT FIXTURE");
  const selectedFormation=myForm||state.formation;
  const oppXI=topXI(opponent.players,oppForm);
  const oppPower=Math.round(oppXI.reduce((total,p)=>total+matchOvr(p),0)/Math.max(1,oppXI.length));
  const myXI=(FORMATIONS[selectedFormation]||FORMATIONS["4-3-3"]).map((_,i)=>myClub.players.find(p=>p.id===state.lineup[i])).filter(Boolean);
  const myPower=Math.round(myXI.reduce((total,p)=>total+matchOvr(p),0)/Math.max(1,myXI.length));
  const danger=[...oppXI].sort((a,b)=>matchOvr(b)-matchOvr(a)).slice(0,3);
  const recent=isUcl?(state.ucl?.form?.[myClub.id]||[]):(state.clubForm?.[myClub.id]||[...(state.results1||[]),...(state.results2||[])]);
  const theirRecent=oppRecent||(isUcl?state.ucl?.form?.[opponent.id]:state.clubForm?.[opponent.id])||[];
  const issue=lineupIssue(state,isUcl?"ucl":"domestic");
  const brandId=isUcl?"UCL":state.league;
  return <section className="matchday-preview competition-theme" style={competitionTheme(brandId)}>
    <div className="matchday-preview-top"><span className="matchday-competition"><CompetitionMark id={brandId} size="sm"/>{fixtureLabel}</span><span>{subLabel||`${isHome?"HOME • YOUR STADIUM":"AWAY • OPPONENT STADIUM"}`}</span></div>
    <div className="matchday-preview-main">
      <div className="matchday-team"><ClubBadge club={isHome?myClub:opponent} size="xl"/><strong>{isHome?myClub.name:opponent.name}</strong><small>{isHome?selectedFormation:oppForm} · {STYLES[isHome?myStyle:oppStyle]?.name||"Balanced"}</small></div>
      <div className="matchday-centre"><span>NEXT FIXTURE</span><b>VS</b><div className="matchday-power"><span>{isHome?myPower:oppPower} XI AVG</span><i/><span>{isHome?oppPower:myPower} XI AVG</span></div><small>Squad strength based on the selected elevens</small></div>
      <div className="matchday-team"><ClubBadge club={isHome?opponent:myClub} size="xl"/><strong>{isHome?opponent.name:myClub.name}</strong><small>{isHome?oppForm:selectedFormation} · {STYLES[isHome?oppStyle:myStyle]?.name||"Balanced"}</small></div>
    </div>
    <div className="matchday-scout">
      <div className="matchday-scout-block"><span>THEIR DANGER PLAYERS</span><div className="matchday-threats">{danger.map(p=><div key={p.id}><b>{Math.round(matchOvr(p))}</b><strong>{p.name}</strong><small>{p.role}</small></div>)}</div><button className="matchday-view-xi" onClick={()=>setShowOppXI(value=>!value)} aria-expanded={showOppXI}>{showOppXI?"Hide opponent XI":"View opponent XI"} <span>{showOppXI?"↑":"↓"}</span></button></div>
      <div className="matchday-scout-block"><span>TACTICAL READ</span><div className="matchday-hints">{hints.length?hints.map((hint,i)=><div key={i} style={{"--hint-color":hint.color}}>{hint.text}</div>):<div>Even tactical matchup — your XI and player form will decide it.</div>}</div></div>
      <div className="matchday-scout-block matchday-form-panel"><FormStrip results={recent} label="YOUR LAST FIVE"/><FormStrip results={theirRecent} label="THEIR LAST FIVE"/><small>{isUcl?"Champions League matches":"League matches"}</small></div>
    </div>
    {showOppXI&&<div className="matchday-opponent-xi"><div className="matchday-xi-heading"><ClubBadge club={opponent} size="xs"/><strong>{opponent.name} starting XI</strong><span>{oppForm} · {STYLES[oppStyle]?.name||"Balanced"}</span></div><div className="matchday-xi-grid">{oppXI.map(player=><div key={player.id}><b>{matchOvr(player)}</b><strong>{player.name}</strong><small>{player.role}</small></div>)}</div></div>}
    <div className="matchday-preview-footer"><span>{issue||"Check the lineup below, then review both starting XIs."}</span><button onClick={()=>setShowLineups(true)} disabled={!!issue}>View lineups <span>→</span></button></div>
    {showLineups&&<PreMatchLineups myClub={myClub} opponent={opponent} isHome={isHome} myFormation={selectedFormation} oppFormation={oppForm} myXI={myXI} oppXI={oppXI} myStyle={myStyle} oppStyle={oppStyle} brandId={brandId} label={fixtureLabel} onClose={()=>setShowLineups(false)} onContinue={()=>{setShowLineups(false);onPlay();}}/>}
  </section>;
}
function FormTrend({confidence}){
  if(!confidence)return null;
  return <span className={`form-trend ${confidence>0?"form-trend-up":"form-trend-down"}`} title={`${confidence>0?"+":""}${confidence} confidence to match OVR`} aria-label={`${confidence>0?"Up":"Down"} ${Math.abs(confidence)} from base rating`}><span aria-hidden="true">{confidence>0?"↑":"↓"}</span></span>;
}
function FitnessGem({condition}){
  const fitness=clamp(Math.round(condition??100),0,100);
  return <span className={`fitness-gem ${fitness>=90?"fitness-good":fitness>=75?"fitness-mid":"fitness-low"}`} title={`Fitness ${fitness}%`} aria-label={`Fitness ${fitness}%`}><i/></span>;
}
function EnergyBar({energy}){
  const remaining=clamp(Math.round(energy??100),0,100);
  return <div className={`player-readiness ${remaining<50?"readiness-low":remaining<75?"readiness-mid":""}`}
    role="progressbar" aria-label="Energy" aria-valuemin={0} aria-valuemax={100} aria-valuenow={remaining}>
    <span className="player-readiness-track"><i style={{width:`${remaining}%`}}/></span><b>{remaining}%</b>
  </div>;
}
function Pitch({ formation, lineup, players, onDragStart, draggingPlayer, hoverSlot }){
  const slots=FORMATIONS[formation];
  return <div className={`squad-pitch ${draggingPlayer?"is-dragging":""}`} data-bench="false" aria-label={`${formation} starting lineup`}>
    <div className="pitch-markings"><span/><i/></div>
    <div className="pitch-top-label">STARTING XI <b>{formation}</b></div>
    {slots.map((slot,i)=>{
      const player=players.find(p=>p.id===lineup[i]);
      const eligible=!!draggingPlayer&&slotAccepts(slot.role,draggingPlayer);
      const active=hoverSlot===i&&!!draggingPlayer;
      return <div key={i} data-slot-index={i} data-slot-role={slot.role}
        className={`pitch-position ${active?(eligible?"drop-valid":"drop-invalid"):""} ${eligible?"drop-eligible":""}`}
        style={{left:`${slot.x}%`,top:`${slot.y}%`,"--role-color":GROUP_COLOR[ROLE_GROUP[slot.role]]}}>
        {player?<><div className="pitch-player-card" onPointerDown={e=>onDragStart(e,player,{source:"slot",slotIndex:i})} title={`${player.name} · ${matchOvr(player)} match OVR (${player.ovr} base) · ${slot.role}`}>
          <div className="pitch-card-top"><span className="pitch-card-ovr"><span className="ovr-value">{matchOvr(player)}</span><FormTrend confidence={player.confidence}/></span><span className="pitch-card-role">{slot.role}</span></div>
          <div className="pitch-card-icon">{player.number}</div>
          <strong>{player.name}</strong><div className="pitch-card-vitals"><FitnessGem condition={player.condition}/><EnergyBar energy={player.energy}/></div>
        </div></>:<div className="pitch-empty-card"><b>+</b><span>{slot.role}</span></div>}
      </div>;
    })}
    <div className="pitch-bottom-label">DRAG A CARD TO CHANGE YOUR XI</div>
  </div>;
}

function SeasonInsights({ clubs, myClub, league="PL", compact=false }){
  const [competition,setCompetition]=useState("all");
  const competitions=[{id:"all",name:"All competitions"},{id:"league",name:LEAGUE_NAMES[league]||"League"},
    ...(league==="PL"?[{id:"carabao",name:"Carabao Cup"},{id:"fa",name:"FA Cup"}]:[]),
    ...(league==="LALIGA"?[{id:"copa",name:"Copa del Rey"}]:[]),{id:"ucl",name:"Champions League"}];
  const selected=competitions.find(item=>item.id===competition)||competitions[0];
  const statsFor=player=>!player?{}:competition==="all"?{
    appearances:player.ratedMatches||0,goals:player.seasonGoals||0,assists:player.seasonAssists||0,
    cleanSheets:player.seasonCleanSheets||0,yellowCards:player.seasonYellowCards||0,redCards:player.seasonRedCards||0,
    ratingTotal:player.ratingTotal||0,ratedMatches:player.ratedMatches||0,bestRating:player.bestRating||0,
  }:player.competitionStats?.[competition]||{};
  const stat=(player,key)=>statsFor(player)[key]||0;
  const average=player=>stat(player,"ratedMatches")?stat(player,"ratingTotal")/stat(player,"ratedMatches"):0;
  const rows=seasonPlayerRows(clubs);
  if(!rows.length)return null;
  const top=(selector,count=5)=>[...rows].sort((a,b)=>selector(b)-selector(a)||b.average-a.average).slice(0,count);
  const leaders=[
    {label:"Goals",icon:"⚽",rows:top(r=>r.player.seasonGoals||0),value:r=>r.player.seasonGoals||0},
    {label:"Assists",icon:"🎯",rows:top(r=>r.player.seasonAssists||0),value:r=>r.player.seasonAssists||0},
    {label:"Avg rating",icon:"★",rows:top(r=>r.average),value:r=>r.average.toFixed(2)},
    {label:"Player awards",icon:"◆",rows:top(r=>r.player.motm||0),value:r=>r.player.motm||0},
  ];
  const clubPlayers=[...(myClub?.players||[])].sort((a,b)=>stat(b,"ratedMatches")-stat(a,"ratedMatches")||average(b)-average(a)||b.ovr-a.ovr);
  const olderSaveHasUnsplitMatches=!!myClub?.players.some(player=>(player.ratedMatches||0)>0&&!Object.keys(player.competitionStats||{}).length);
  const clubLeader=key=>[...clubPlayers].sort((a,b)=>stat(b,key)-stat(a,key)||average(b)-average(a))[0];
  const clubHighlights=[
    {label:"Top scorer",icon:"⚽",key:"goals"},
    {label:"Top assists",icon:"🎯",key:"assists"},
    {label:"Clean sheets",icon:"🧤",key:"cleanSheets"},
    {label:"Yellow cards",icon:"🟨",key:"yellowCards"},
    {label:"Red cards",icon:"🟥",key:"redCards"},
  ].map(item=>({...item,player:clubLeader(item.key)}));
  const bestXI=seasonBestXI(clubs);
  const groups=["GK","DEF","MID","FWD"];
  return (
    <section className={`season-intelligence ${compact?"season-intelligence-compact":""}`}>
      <div className="intel-heading">
        <div><div className="intel-kicker">Club and league intelligence</div><div className="intel-title">Season performance centre</div></div>
        <div className="intel-note">Ratings update every match for every simulated club</div>
      </div>
      {myClub&&<section className="club-performance-report">
        <div className="club-report-heading">
          <ClubBadge club={myClub} size="sm" className="club-report-mark"/>
          <div><strong>{myClub.name} squad report</strong><small>Your current club · {selected.name}</small></div>
        </div>
        <div className="competition-filter" role="group" aria-label="Filter club statistics by competition">
          {competitions.map(item=><button key={item.id} className={selected.id===item.id?"active":""} onClick={()=>setCompetition(item.id)} aria-pressed={selected.id===item.id}>{item.name}</button>)}
        </div>
        {competition!=="all"&&olderSaveHasUnsplitMatches&&<div className="competition-history-note">Older match totals remain in All competitions. Competition breakdowns start with matches played after this update.</div>}
        <div className="club-highlight-grid">
          {clubHighlights.map(item=><div className="club-highlight" key={item.key}>
            <span>{item.icon}</span><div><small>{item.label}</small><strong>{stat(item.player,item.key)>0?item.player.name:"No record yet"}</strong></div><b>{stat(item.player,item.key)}</b>
          </div>)}
        </div>
        <div className="club-player-table-wrap">
          <table className="club-player-table">
            <thead><tr><th>Player</th><th>Pos</th><th>Apps</th><th>Goals</th><th>Assists</th><th>Clean sheets</th><th>Yellow</th><th>Red</th><th>Average</th><th>Best</th></tr></thead>
            <tbody>{clubPlayers.map(player=><tr key={player.id}>
              <td><strong>{player.name}</strong><small>OVR {matchOvr(player)}{player.confidence?` (${player.confidence>0?"+":""}${player.confidence} confidence)`:""}</small></td><td>{player.role}</td><td>{stat(player,"ratedMatches")}</td><td>{stat(player,"goals")}</td><td>{stat(player,"assists")}</td><td>{stat(player,"cleanSheets")}</td><td>{stat(player,"yellowCards")}</td><td>{stat(player,"redCards")}</td><td className="table-rating">{stat(player,"ratedMatches")?average(player).toFixed(2):"—"}</td><td>{stat(player,"bestRating")?stat(player,"bestRating").toFixed(1):"—"}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>}
      <div className="league-leader-heading"><strong>All-club leaders</strong><span>All competitions · every simulated club</span></div>
      <div className="leader-grid">
        {leaders.map(leader=><div className="leader-card" key={leader.label}>
          <div className="leader-title"><span>{leader.icon}</span>{leader.label}</div>
          {leader.rows.map((row,index)=><div className="leader-row" key={row.player.id}>
            <span className="leader-rank">{index+1}</span>
            <span className="leader-player"><strong>{row.player.name}</strong><small>{row.club.name} · {row.player.ratedMatches} apps</small></span>
            <span className="leader-value">{leader.value(row)}</span>
          </div>)}
        </div>)}
      </div>
      <div className="season-xi">
        <div className="season-xi-heading"><span>XI</span><div><strong>Team of the Season</strong><small>Highest average rating in each unit</small></div></div>
        <div className="season-xi-units">
          {groups.map(group=><div className={`season-unit unit-${group.toLowerCase()}`} key={group}>
            <div className="season-unit-label">{group}</div>
            {bestXI.filter(row=>row.player.group===group).map(row=><div className="season-xi-player" key={row.player.id}>
              <ClubBadge club={row.club} size="xs" className="season-club-mark"/>
              <span><strong>{row.player.name}</strong><small>{row.selectedRole} · {row.club.name}</small></span>
              <b>{row.average.toFixed(2)}</b>
            </div>)}
          </div>)}
        </div>
      </div>
    </section>
  );
}

function CompetitionStandings({table,myClubId,brandId="PL",title,subtitle="Updates after every matchday",zone=false}){
  const isUcl=brandId==="UCL";
  const legend=standingsLegend(brandId,table.length);
  return <section className={`league-standings competition-theme ${isUcl?"is-ucl":""}`} style={competitionTheme(brandId)}>
    <header><CompetitionMark id={brandId}/><div><span>LIVE STANDINGS</span><strong>{title||`${competitionBrand(brandId).name} table`}</strong><small>{subtitle}</small></div></header>
    <div className="standings-legend">{legend.map(item=><span key={item.key}><i className={`zone-${item.color}`}/>{item.label}</span>)}</div>
    <div className="league-table-scroll"><table><thead><tr><th>#</th><th>CLUB</th>{isUcl&&<th>PTS</th>}<th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th>{!isUcl&&<th>PTS</th>}{zone&&<th>ZONE</th>}</tr></thead><tbody>{table.map((row,index)=>{
      const rowZone=standingsZone(brandId,index+1,table.length);
      return <tr key={row.id} className={row.id===myClubId?"my-club":""}><td className={rowZone?`standing-rank zone-${rowZone.color}`:"standing-rank"} title={rowZone?.label}>{index+1}</td><td><ClubBadge club={row.club} size="xs"/><strong>{row.club?.name||row.id}</strong></td>{isUcl&&<td className="points-cell"><b>{row.pts}</b></td>}<td>{row.played}</td><td>{row.w}</td><td>{row.d}</td><td>{row.l}</td><td>{row.gd>0?"+":""}{row.gd}</td>{!isUcl&&<td className="points-cell"><b>{row.pts}</b></td>}{zone&&<td>{uclZoneLabel(index+1)}</td>}</tr>;
    })}</tbody></table></div>
  </section>;
}
function LeagueStandings({state}){
  const isUcl=state.stage==="ucl"&&!!state.ucl;
  const clubs=isUcl?state.ucl.clubs:state.clubs;
  const brandId=isUcl?"UCL":state.league;
  const table=computeTableArray((isUcl?state.ucl.tableRaw:state.tableRaw)||initTable(clubs.map(club=>club.id)),clubs);
  return <CompetitionStandings table={table} myClubId={state.myClubId} brandId={brandId} title={isUcl?"Champions League league phase table":`${LEAGUE_NAMES[state.league]} table`} zone={isUcl}/>;
}

function SquadScreen({ state, myClub, onSetFormation, onDragStart, onEditNumber, onSell, onLoanOut, onOpenMarket, onOpenCups, onOpenTactics, onSimulate, simulateLabel, draggingPlayer, hoverSlot, showMarketBar=true, showSimulate=true, suspendedIds }){
  const [workspaceTab,setWorkspaceTab]=useState("squad");
  const suspendedSet = new Set(suspendedIds || []);
  const usedIds = new Set(Object.values(state.lineup).filter(Boolean));
  const issue = lineupIssue(state,state.stage==="ucl"?"ucl":"domestic");
  const windowOpen=marketOpen(state);
  const order = ["GK","DEF","MID","FWD"];
  const sorted = [...myClub.players].sort((a,b)=> order.indexOf(a.group)-order.indexOf(b.group) || matchOvr(b)-matchOvr(a));
  const hasSeasonData=state.clubs.some(c=>c.players.some(p=>(p.ratedMatches||0)>0));

  return (
    <div className="squad-command">
      <section className="manager-command-bar">
        <div className="command-copy"><span>MANAGER WORKSPACE</span><strong>Build the match plan</strong><small>Set the XI, read the season data and act in the market from one place.</small></div>
        <div className="command-actions">
          {showMarketBar&&<button className="command-tile transfer-command" onClick={onOpenMarket} disabled={!windowOpen}><ArrowLeftRight size={18}/><span><strong>Transfer Centre</strong><small>{windowOpen?"Scout all leagues & negotiate":"Window closed"}</small></span></button>}
          {showMarketBar&&onOpenCups&&<button className="command-tile" onClick={onOpenCups}><Trophy size={17}/><span><strong>Cup Hub</strong><small>Fixtures and progress</small></span></button>}
          {onOpenTactics&&<button className="command-tile" onClick={onOpenTactics}><SlidersHorizontal size={17}/><span><strong>Match Plan</strong><small>{STYLES[state.tacticalStyle||"balanced"].name}</small></span></button>}
          {showSimulate&&<button className="kickoff-command" onClick={onSimulate} disabled={!!issue}><span>{simulateLabel}</span><small>{issue||"Lineup ready"}</small></button>}
        </div>
      </section>

      <div className="workspace-tabs" role="tablist">
        <button className={workspaceTab==="squad"?"active":""} onClick={()=>setWorkspaceTab("squad")}>Squad board</button>
        <button className={workspaceTab==="performance"?"active":""} onClick={()=>setWorkspaceTab("performance")}>Performance centre {hasSeasonData&&<span>LIVE</span>}</button>
        <button className={workspaceTab==="table"?"active":""} onClick={()=>setWorkspaceTab("table")}>League table</button>
      </div>

      {workspaceTab==="table" ? <div className={state.stage==="ucl"&&state.ucl?.knockoutBracket?"ucl-table-bracket":""}><LeagueStandings state={state}/>{state.stage==="ucl"&&state.ucl?.knockoutBracket&&<UclBracket bracket={state.ucl.knockoutBracket} clubs={state.ucl.clubs} myClubId={state.myClubId}/>}</div> : workspaceTab==="performance" ? (hasSeasonData?<SeasonInsights clubs={state.clubs} myClub={myClub} league={state.league}/>:<div className="analytics-empty"><Sparkles size={22}/><strong>Your performance centre is ready</strong><span>Complete a match to unlock ratings, leaders and the Team of the Season race.</span></div>) : <>
      <div className="lineup-toolbar">
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:12, color:"#9ab89a" }}>Formation</span>
          <select value={state.formation} onChange={e=>onSetFormation(e.target.value)}
            style={{ background:"#111a11", color:"#e8ede8", border:"1px solid #2a3a2a", borderRadius:7, padding:"6px 10px", fontSize:13 }}>
            {Object.keys(FORMATIONS).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <span className="lineup-status">{Object.keys(state.lineup).length}/11 selected</span>
        </div>
        <span className="drag-help">Drag to swap · Drop outside the pitch to bench</span>
      </div>

      <div className="grid-2col">
        <div>
          <Pitch formation={state.formation} lineup={state.lineup} players={myClub.players} onDragStart={onDragStart} draggingPlayer={draggingPlayer} hoverSlot={hoverSlot} />
          <div style={{ fontSize:11, color:"#6a8a6a", marginTop:8, display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
            <Legend color={GROUP_COLOR.GK} label="Keeper"/><Legend color={GROUP_COLOR.DEF} label="Defence"/>
            <Legend color={GROUP_COLOR.MID} label="Midfield"/><Legend color={GROUP_COLOR.FWD} label="Attack"/>
          </div>
        </div>

        <div className="squad-list-panel">
          <div className="squad-list-heading"><div><span>FIRST TEAM</span><strong>Squad <b>{myClub.players.length}</b></strong></div><small>OVR includes confidence · energy bar and fitness gem</small></div>
          <div className="squad-player-list" data-bench="true">
            {sorted.map(p => {
              const suspended = suspendedSet.has(p.id);
              let outboundLoan={available:false,reason:"Unavailable"};
              try{outboundLoan=loanTerms(state,myClub.id,p.id);}catch{/* transfer state can change between renders */}
              return (
              <div key={p.id} className={`squad-player-row ${usedIds.has(p.id)?"is-starting":""} ${suspended?"is-suspended":""}`} style={{"--role-color":GROUP_COLOR[p.group]}}>
                <div className="squad-drag-area" onPointerDown={suspended?undefined:(e)=>onDragStart(e, p, { source:"squad" })}>
                  <div className={`squad-ovr ${matchOvr(p)>=88?"elite":matchOvr(p)>=84?"high":""}`} title={`${matchOvr(p)} match OVR · ${p.ovr} base · ${p.confidence>0?"+":""}${p.confidence||0} confidence`}><strong>{matchOvr(p)}</strong><FormTrend confidence={p.confidence}/><small>OVR</small></div>
                  <div className="squad-player-copy">
                    <div className="squad-player-name"><strong>{p.name}</strong>{p.loan&&<span className="squad-loan-tag">LOAN</span>}{usedIds.has(p.id)&&!suspended&&<span className="squad-starting-tag">STARTING</span>}{suspended&&<span className="squad-suspended-tag">SUSPENDED</span>}</div>
                    <div className="squad-player-facts"><b>{p.role}</b><span>Age {p.age}</span><span>{fmtM(p.value)}</span>{p.confidence?<span className={p.confidence>0?"form-up":"form-down"}>{p.confidence>0?"+":""}{p.confidence} confidence</span>:null}</div>
                    <div className="squad-player-vitals"><FitnessGem condition={p.condition}/><EnergyBar energy={p.energy}/></div>
                    {(p.ratedMatches||0)>0&&<div className="squad-player-season"><span><b>{playerSeasonAverage(p).toFixed(2)}</b> AVG</span><span><b>{p.bestRating?.toFixed(1)}</b> BEST</span><span><b>{p.seasonGoals||0}</b> G</span><span><b>{p.seasonAssists||0}</b> A</span><span><b>{p.motm||0}</b> MOTM</span></div>}
                  </div>
                </div>
                <div className="squad-row-actions"><label title="Squad number"><span>#</span><input type="number" min={1} max={99} value={p.number} onChange={e=>onEditNumber(p.id, clamp(parseInt(e.target.value||"1",10),1,99))}/></label><button className="squad-loan-action" onClick={()=>onLoanOut(p.id)} disabled={!windowOpen||p.loan||!outboundLoan.available} title={outboundLoan.reason}>Loan</button><button className="squad-sell-action" onClick={()=>onSell(p.id)} disabled={!windowOpen||p.loan} title="Sell">Sell</button></div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {issue&&<div className="lineup-warning" role="alert">{issue}</div>}
      </>}
    </div>
  );
}
function Legend({ color, label }){
  return <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{width:8,height:8,borderRadius:"50%",background:color,display:"inline-block"}}/>{label}</span>;
}

function CupProgressStrip({ cupStatus }){
  const label = (cs) => cs.outcome ? cs.outcome : cs.playedRounds.length ? `Alive — last won ${cs.playedRounds[cs.playedRounds.length-1]}` : "Not yet started";
  const color = (cs) => cs.outcome === "CHAMPION" ? "#7fd88f" : cs.outcome ? "#e08a8a" : cs.playedRounds.length ? "#7fd88f" : "#6a8a6a";
  return (
    <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
      <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:"8px 14px", fontSize:12 }}>
        🏆 FA Cup: <b style={{color:color(cupStatus.fa)}}>{label(cupStatus.fa)}</b>
      </div>
      <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:"8px 14px", fontSize:12 }}>
        🥤 Carabao Cup: <b style={{color:color(cupStatus.carabao)}}>{label(cupStatus.carabao)}</b>
      </div>
    </div>
  );
}
function ResultsScreen({ title, results, table, clubs, myClubId, onContinue, continueLabel, projectedTable, cupStatus, league }){
  const myRow = table.find(r=>r.id===myClubId);
  const myRank = table.findIndex(r=>r.id===myClubId)+1;
  const projRank = projectedTable ? projectedTable.findIndex(r=>r.id===myClubId)+1 : null;

  return (
    <div>
      <div className="results-heading">
        <div><h2 style={{ fontSize:18, margin:"0 0 4px" }}>{title}</h2>
          <p style={{ color:"#6a8a6a", fontSize:12, margin:0 }}>Simulated {results.length} league matches. Every fixture updated player form and season records.</p></div>
        <button className="results-continue" onClick={onContinue}>{continueLabel}</button>
      </div>

      {cupStatus && <CupProgressStrip cupStatus={cupStatus} />}

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
        <StatBox label="Position" value={`${myRank}${ord(myRank)}`} />
        <StatBox label="Points" value={myRow.pts} />
        <StatBox label="Record" value={`${myRow.w}-${myRow.d}-${myRow.l}`} />
        <StatBox label="Goal Diff" value={(myRow.gd>=0?"+":"")+myRow.gd} />
        {projRank && <StatBox label="Half-Season Projection" value={`${projRank}${ord(projRank)}`} sub={myRank<projRank?"Overperformed":myRank>projRank?"Underperformed":"Matched projection"} />}
      </div>

      <SeasonInsights clubs={clubs} compact />

      <div className="grid-2col">
        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Match Results</div>
          <div style={{ maxHeight:420, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
            {results.map((r,i)=>(
              <div key={i} style={{ background:"#0e150e", border:"1px solid #1c2b1c", borderRadius:8, padding:"8px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#6a8a6a" }}>
                    <span>GW{r.gw}</span>
                    <ResultBadge result={r.result}/>
                    <span style={{fontWeight:600, color:"#dfe8df"}}>{r.opponent}</span>
                    <span style={{fontSize:10}}>({r.isHome?"H":"A"})</span>
                  </div>
                  <div style={{ fontWeight:800, fontSize:14, color: r.result==="W"?"#7fd88f":r.result==="L"?"#e08a8a":"#e8b84b" }}>
                    {r.isHome ? `${r.myGoals}-${r.oppGoals}` : `${r.oppGoals}-${r.myGoals}`}
                  </div>
                </div>
                {r.scorerStr && <div style={{ fontSize:11, color:"#6a8a6a", marginTop:3 }}>⚽ {r.scorerStr}</div>}
              </div>
            ))}
          </div>
        </div>
        <div><CompetitionStandings table={table} myClubId={myClubId} brandId={league} title={`${LEAGUE_NAMES[league]} table`} subtitle="Season standings"/></div>
      </div>

    </div>
  );
}
function StatBox({ label, value, sub }){
  return (
    <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:"10px 16px", minWidth:110 }}>
      <div style={{ fontSize:10, color:"#6a8a6a", marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:800 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:"#7fd88f" }}>{sub}</div>}
    </div>
  );
}
function ResultBadge({ result }){
  const c = result==="W"?"#2d6b3f":result==="L"?"#6b2d2d":"#6b5a2d";
  return <span style={{ background:c, color:"#fff", fontSize:10, fontWeight:800, padding:"1px 6px", borderRadius:4 }}>{result}</span>;
}
function MatchAward({ motm }){
  if(!motm)return null;
  return <div className="result-motm"><span>★</span><strong>{motm.name}</strong><small>Man of the Match</small><b>{motm.rating.toFixed(1)}</b></div>;
}

function SummaryScreen({ state, myClub, onNextSeason, onOpenCups }){
  const finalRank = state.tableFinal.findIndex(r=>r.id===state.myClubId)+1;
  const halfRank = state.table1.findIndex(r=>r.id===state.myClubId)+1;
  const lineupPlayers = myClub.players.filter(p => Object.values(state.lineup).includes(p.id));
  const byGroup = g => lineupPlayers.filter(p=>p.group===g);
  const groups = ["GK","DEF","MID","FWD"];
  const trend = finalRank<halfRank ? "OVERPERFORMED" : finalRank>halfRank ? "UNDERPERFORMED" : "ON TARGET";
  const uclUnlocked = finalRank <= 4;

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <Trophy size={36} color="#e8b84b" style={{marginBottom:8}}/>
        <h2 style={{ fontSize:22, marginBottom:2 }}>Season Complete</h2>
        <p style={{ color:"#9ab89a", fontSize:13 }}>{myClub.name} · {seasonLabel(state)} {LEAGUE_NAMES[state.league]}</p>
      </div>

      <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:24 }}>
        <StatBox label="Finished" value={`${finalRank}${ord(finalRank)}`} />
        <StatBox label="Half-Season Projection" value={`${halfRank}${ord(halfRank)}`} />
        <StatBox label="Trend" value={trend.split(" ")[0]} sub={trend} />
      </div>

      {uclUnlocked && (
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:12, color:"#7fd88f", marginBottom:8 }}>Top 4 finish — Champions League qualification secured ⭐</div>
          <button onClick={onOpenCups} style={{ ...primaryBtnStyle, background:"#3d3410", border:"1px solid #e8b84b", color:"#e8d09a" }}>🏆 Play Cup Competitions</button>
        </div>
      )}
      {!uclUnlocked && (
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <button onClick={onOpenCups} style={{ ...primaryBtnStyle, background:"#1c1a12", border:"1px solid #6b5a2d", color:"#e8d09a" }}>🏆 View Cup Competitions</button>
        </div>
      )}

      <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:12, padding:18, marginBottom:20 }}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:16, justifyContent:"space-around", textAlign:"center" }}>
          {groups.map(g => {
            const gp = byGroup(g);
            const o = gp.length ? gp.reduce((s,p)=>s+matchOvr(p),0)/gp.length : 0;
            return (
              <div key={g}>
                <div style={{ fontSize:11, color:GROUP_COLOR[g], fontWeight:700 }}>{g}</div>
                <div style={{ fontSize:14, fontWeight:700 }}>{gp.length? ovrLabel(o) : "—"}</div>
              </div>
            );
          })}
        </div>
      </div>

      <SeasonInsights clubs={state.clubs} />

      <div style={{ marginBottom:20 }}><CompetitionStandings table={state.tableFinal} myClubId={state.myClubId} brandId={state.league} title={`${LEAGUE_NAMES[state.league]} final table`} subtitle="Final season standings"/></div>

      <div style={{ textAlign:"center" }}>
        <button onClick={onNextSeason} style={primaryBtnStyle}>Continue to Next Season</button>
      </div>
    </div>
  );
}

function ScheduleCupCard({ title, icon, desc, cs, isEuropean }){
  const started = cs.playedRounds.length > 0;
  const statusText = cs.outcome ? cs.outcome : started ? `Alive — through to next round after beating ${cs.results[cs.results.length-1].opponent}` : (isEuropean ? "Awaiting Round 2 (bye from Round 1)" : "Not yet drawn");
  const statusColor = cs.outcome === "CHAMPION" ? "#7fd88f" : cs.outcome ? "#e08a8a" : started ? "#7fd88f" : "#9ab89a";
  return (
    <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:12, padding:16, marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontWeight:700, fontSize:14 }}>{icon} {title}</div>
        {cs.outcome && <span style={{ background: cs.outcome==="CHAMPION"?"#2d6b3f":"#6b2d2d", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:5 }}>{cs.outcome}</span>}
      </div>
      <div style={{ fontSize:11, color:"#6a8a6a", marginBottom:8 }}>{desc}</div>
      <div style={{ fontSize:12, fontWeight:600, color: statusColor, marginBottom: started ? 10 : 0 }}>{statusText}</div>
      {started && (
        <div>
          <div style={{ display:"flex", gap:14, fontSize:12, color:"#9ab89a", marginBottom:8 }}>
            <span>Record: <b style={{color:"#e8ede8"}}>{cs.record.w}-{cs.record.d}-{cs.record.l}</b></span>
            <span>Goals: <b style={{color:"#e8ede8"}}>{cs.record.gf}-{cs.record.ga}</b></span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {cs.results.map((r,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0e150e", border:"1px solid #1c2b1c", borderRadius:6, padding:"6px 10px", fontSize:11, gap:6, flexWrap:"wrap" }}>
                <span style={{ color:"#6a8a6a" }}>{r.round}</span>
                <span style={{ fontWeight:600 }}>{r.homeA ? "vs" : "at"} {r.opponent}</span>
                <span style={{ fontWeight:800, color: r.won?"#7fd88f":"#e08a8a" }}>{r.myGoals}-{r.oppGoals}{r.wentToPens ? ` (pens ${r.wonPens?"W":"L"})` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
function UclCard({ ucl, played, locked, onEnter }){
  const inProgress = ucl && ucl.stage !== "final";
  return (
    <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:12, padding:16, marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontWeight:700, fontSize:14 }}>⭐ Champions League</div>
        {played && <span style={{ background: played.outcome==="CHAMPION"?"#2d6b3f":"#6b2d2d", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:5 }}>{played.outcome}</span>}
      </div>
      <div style={{ fontSize:11, color:"#6a8a6a", marginBottom:10 }}>
        {locked ? "Unlocks once you finish top 4 in the league." : "New 36-team league phase: play 8 different clubs from the other leagues. Finish top 8 for a direct Round of 16 spot, 9th-24th go to a playoff, 25th and below are out."}
      </div>
      {locked && <div style={{ fontSize:11, color:"#e8b84b" }}>🔒 Locked</div>}
      {!locked && !played && (
        <button onClick={onEnter} style={{ background:"#2d6b3f", border:"none", color:"#fff", fontWeight:700, fontSize:12, padding:"8px 16px", borderRadius:8 }}>
          {inProgress ? "Resume Campaign →" : "Enter the Draw"}
        </button>
      )}
      {played && (
        <div>
          <div style={{ display:"flex", gap:14, fontSize:12, color:"#9ab89a", marginBottom:8 }}>
            <span>Record: <b style={{color:"#e8ede8"}}>{played.record.w}-{played.record.d}-{played.record.l}</b></span>
            <span>Goals: <b style={{color:"#e8ede8"}}>{played.record.gf}-{played.record.ga}</b></span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:10 }}>
            {played.results.map((r,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0e150e", border:"1px solid #1c2b1c", borderRadius:6, padding:"6px 10px", fontSize:11, gap:6, flexWrap:"wrap" }}>
                <span style={{ color:"#6a8a6a" }}>{r.stage}</span>
                <span style={{ fontWeight:600 }}>{r.isHome ? "vs" : "at"} {r.opponent}</span>
                <span style={{ fontWeight:800, color: r.result==="W"?"#7fd88f":r.result==="L"?"#e08a8a":"#e8b84b" }}>{r.myGoals}-{r.oppGoals}{r.wentToPens ? ` (pens ${r.wonPens?"W":"L"})` : ""}</span>
              </div>
            ))}
          </div>
          <button onClick={onEnter} style={{ background:"transparent", border:"1px solid #2a3a2a", color:"#9ab89a", fontSize:11, padding:"6px 12px", borderRadius:7 }}>Play Again</button>
        </div>
      )}
    </div>
  );
}

function UclBanner({ text, sub }){
  return (
    <div style={{ background:"linear-gradient(135deg,#0b1a3a,#132257)", border:"1px solid #2a3f7a", borderRadius:12, padding:"14px 18px", marginBottom:16, textAlign:"center" }}>
      <div style={{ fontSize:11, letterSpacing:2, color:"#9ab8e8" }}>⭐ UEFA CHAMPIONS LEAGUE ⭐</div>
      <div style={{ fontSize:16, fontWeight:800, marginTop:2 }}>{text}</div>
      {sub && <div style={{ fontSize:12, color:"#9ab8e8", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function UclBracket({bracket,clubs,myClubId}){
  const names=["Playoff","Round of 16","Quarter-Final","Semi-Final","Final"];
  const byId=new Map(clubs.map(club=>[club.id,club]));
  return <section className="ucl-bracket competition-theme" style={competitionTheme("UCL")}>
    <header><CompetitionMark id="UCL"/><div><span>KNOCKOUT ROAD</span><strong>Road to the final</strong><small>Aggregate scores · advancing clubs highlighted</small></div></header>
    <div className="ucl-bracket-scroll"><div className="ucl-bracket-grid"><svg className="ucl-bracket-lines" viewBox="0 0 910 1200" preserveAspectRatio="none" aria-hidden="true">{[16,8,4,2].flatMap((count,col)=>Array.from({length:count/2},(_,pair)=>{
      const y1=70+(2*pair+.5)/count*1100,y2=70+(2*pair+1.5)/count*1100,yn=70+(pair+.5)/(count/2)*1100;
      const x=col*185+170,xm=x+7.5,xn=(col+1)*185;
      return <g key={`${col}-${pair}`}><path d={`M${x} ${y1} H${xm} V${y2} H${x}`}/><path d={`M${xm} ${yn} H${xn}`}/></g>;
    }))}</svg>{names.map((name,idx)=>{
      const stage=bracket.stages.find(item=>item.name===name);
      const count=16/Math.pow(2,idx);
      return <div className="ucl-bracket-round" key={name}><h4>{name}</h4>{Array.from({length:count},(_,i)=>{
        const tie=stage?.ties[i];
        return <div style={{top:70+(i+.5)/count*1100-31}} className={`ucl-bracket-tie ${tie?.winnerId?"decided":""} ${tie&&(tie.aId===myClubId||tie.bId===myClubId)?"my-tie":""}`} key={i}>{tie?[tie.aId,tie.bId].map((id,j)=>{
          const club=byId.get(id);
          return <div className={`ucl-bracket-club ${tie.winnerId===id?"advanced":""}`} key={id}><ClubBadge club={club} size="xs"/><span>{club?.name||id}</span><b>{tie.winnerId||tie.leg1?j===0?tie.aGoals:tie.bGoals:"—"}</b></div>;
        }):<div className="ucl-bracket-await">Awaiting qualifiers</div>}{tie?.pens&&<small>Decided on penalties</small>}</div>;
      })}</div>;
    })}</div></div>
  </section>;
}

function UclTable({ table, myClubId }){
  return <CompetitionStandings table={table} myClubId={myClubId} brandId="UCL" title="Champions League league phase table" zone/>;
}

function UclHub({ state, onPlayNext }){
  const u = state.ucl;
  const tableArr = computeTableArray(u.tableRaw, u.clubs);
  const myRank = tableArr.findIndex(r=>r.id===state.myClubId)+1;
  const round = u.rounds[u.roundIndex];
  const match = round.find(([h,a]) => h===state.myClubId || a===state.myClubId);
  const isHome = match[0] === state.myClubId;
  const opponent = u.clubs.find(c => c.id === (isHome ? match[1] : match[0]));
  const upcoming = u.rounds.slice(u.roundIndex+1).map((r,i) => {
    const m = r.find(([h,a]) => h===state.myClubId || a===state.myClubId);
    const isH = m[0] === state.myClubId;
    const opp = u.clubs.find(c => c.id === (isH ? m[1] : m[0]));
    return { md: u.roundIndex+2+i, opp, isHome: isH };
  });
  return (
    <div>
      <UclBanner text={`League Phase — Matchday ${u.roundIndex+1} of 8`} sub={`Currently ${myRank}${ord(myRank)} of ${tableArr.length}`} />
      <div className="grid-2col">
        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>League Phase Table</div>
          <UclTable table={tableArr} myClubId={state.myClubId} />
        </div>
        <div>
          <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:12, padding:16, marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#9ab89a", marginBottom:6 }}>NEXT MATCH</div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <ClubBadge club={opponent} size="sm"/>
              <div>
                <div style={{ fontWeight:700 }}>{opponent.name}</div>
                <div style={{ fontSize:11, color:"#9ab89a" }}>{isHome ? "Home" : "Away"} · Matchday {u.roundIndex+1}</div>
              </div>
            </div>
            <button onClick={onPlayNext} style={primaryBtnStyle}>View Squads & Play →</button>
          </div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Upcoming Fixtures</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {upcoming.map((f,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", background:"#0e150e", border:"1px solid #1c2b1c", borderRadius:8, padding:"7px 12px", fontSize:12 }}>
                <span style={{color:"#6a8a6a"}}>MD{f.md}</span>
                <span>{f.isHome ? "vs" : "at"} {f.opp.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UclMatchPrep({ state, myClub, squadCommonProps, onPlay }){
  const u=state.ucl;
  const round=u.rounds[u.roundIndex];
  const match=round.find(([h,a])=>h===state.myClubId||a===state.myClubId);
  const isHome=match[0]===state.myClubId;
  const opponent=u.clubs.find(c=>c.id===(isHome?match[1]:match[0]));
  const oppForm=opponent.preferredFormation||"4-4-2";
  const oppStyle=inferStyle(opponent.players,oppForm,opponent.id);
  return <div>
    <MatchdayPreview key={`${opponent.id}-${u.roundIndex}`} state={state} myClub={myClub} opponent={opponent} isHome={isHome} oppForm={oppForm} myStyle={state.tacticalStyle} oppStyle={oppStyle} hints={tacticalHints(state.formation,oppForm)} onPlay={onPlay} label={`CHAMPIONS LEAGUE · MATCHDAY ${u.roundIndex+1} / 8`}/>
    <SquadScreen {...squadCommonProps} onSimulate={onPlay} showSimulate={false} showMarketBar={false} suspendedIds={state.suspensions.ucl}/>
  </div>;
}

function UclMatchResult({ myClub, result, onContinue }){
  return (
    <div style={{ textAlign:"center", padding:"20px 0" }}>
      <UclBanner text="Full Time" sub={`League Phase · vs ${result.opponent}`} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:10, flexWrap:"wrap" }}>
        <div style={{ fontWeight:700, fontSize:15 }}>{result.isHome ? myClub.name : result.opponent}</div>
        <div style={{ fontSize:32, fontWeight:800 }}>{result.isHome?result.myGoals:result.oppGoals} - {result.isHome?result.oppGoals:result.myGoals}</div>
        <div style={{ fontWeight:700, fontSize:15 }}>{result.isHome ? result.opponent : myClub.name}</div>
      </div>
      <ResultBadge result={result.result} />
      {result.scorerStr && <div style={{ fontSize:12, color:"#9ab89a", marginTop:10 }}>⚽ {result.scorerStr}</div>}
      <MatchAward motm={result.manOfTheMatch}/>
      {result.redCard && <div style={{ fontSize:12, color:"#e08a8a", marginTop:6 }}>🟥 {result.redCard.name} sent off — suspended for your next Champions League match</div>}
      <div style={{ marginTop:26 }}>
        <button onClick={onContinue} style={primaryBtnStyle}>Back to Table →</button>
      </div>
    </div>
  );
}

function UclPhaseSummary({ state, onContinue }){
  const u = state.ucl;
  const table = u.phaseTable;
  const myRank = table.findIndex(r=>r.id===state.myClubId)+1;
  const q = u.qualification;
  const headline = q==="top8" ? "Top 8 finish — straight through to the Round of 16!" : q==="playoff" ? "Playoff spot — one match for a Round of 16 place." : "Eliminated at the league phase.";
  return (
    <div>
      <UclBanner text="League Phase Complete" sub={`Finished ${myRank}${ord(myRank)} of ${table.length}`} />
      <div style={{ textAlign:"center", fontSize:14, fontWeight:700, color: q==="eliminated"?"#e08a8a":"#7fd88f", marginBottom:16 }}>{headline}</div>
      <UclTable table={table} myClubId={state.myClubId} />
      <div style={{ textAlign:"center", marginTop:20 }}>
        <button onClick={onContinue} style={primaryBtnStyle}>{q==="eliminated" ? "Finish Campaign →" : "Continue →"}</button>
      </div>
    </div>
  );
}

function UclSingleMatchPrep({ myClub, opponent, roundLabel, subLabel, squadCommonProps, onPlay }){
  const state=squadCommonProps.state;
  const u=state.ucl;
  const isHome=u.leg===2?!u.firstLegHomeA:state.myClubId.localeCompare(opponent.id)<0;
  const oppForm=opponent.preferredFormation||"4-4-2";
  const oppStyle=inferStyle(opponent.players,oppForm,opponent.id);
  return <div>
    <MatchdayPreview key={`${opponent.id}-${roundLabel}`} state={state} myClub={myClub} opponent={opponent} isHome={isHome} oppForm={oppForm} myStyle={state.tacticalStyle} oppStyle={oppStyle} hints={tacticalHints(state.formation,oppForm)} onPlay={onPlay} label={`CHAMPIONS LEAGUE · ${roundLabel.toUpperCase()}`} subLabel={subLabel}/>
    <SquadScreen {...squadCommonProps} onSimulate={onPlay} showSimulate={false} showMarketBar={false} suspendedIds={state.suspensions.ucl}/>
  </div>;
}

function UclSingleMatchResult({ myClub, result, roundLabel, isCampaignOver, aggregate, isLeg1, onContinue }){
  const redCardLine = result.redCard ? <div style={{ fontSize:12, color:"#e08a8a", marginTop:6 }}>🟥 {result.redCard.name} sent off — suspended for your next Champions League match</div> : null;
  if (isLeg1){
    return (
      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <UclBanner text={`Full Time — ${roundLabel}`} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:10, flexWrap:"wrap" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>{result.isHome ? myClub.name : result.opponent}</div>
          <div style={{ fontSize:32, fontWeight:800 }}>{result.isHome?result.myGoals:result.oppGoals} - {result.isHome?result.oppGoals:result.myGoals}</div>
          <div style={{ fontWeight:700, fontSize:15 }}>{result.isHome ? result.opponent : myClub.name}</div>
        </div>
        {result.scorerStr && <div style={{ fontSize:12, color:"#9ab89a", marginTop:10 }}>⚽ {result.scorerStr}</div>}
        <MatchAward motm={result.manOfTheMatch}/>
        {redCardLine}
        <div style={{ marginTop:10, fontSize:13, fontWeight:700, color:"#9ab8e8" }}>First leg complete — second leg to come</div>
        <div style={{ marginTop:26 }}>
          <button onClick={onContinue} style={primaryBtnStyle}>Play Second Leg →</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ textAlign:"center", padding:"20px 0" }}>
      <UclBanner text={`Full Time — ${roundLabel}`} sub={aggregate ? `Aggregate: ${aggregate.mine}-${aggregate.opp}` : null} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:10, flexWrap:"wrap" }}>
        <div style={{ fontWeight:700, fontSize:15 }}>{result.isHome ? myClub.name : result.opponent}</div>
        <div style={{ fontSize:32, fontWeight:800 }}>{result.isHome?result.myGoals:result.oppGoals} - {result.isHome?result.oppGoals:result.myGoals}</div>
        <div style={{ fontWeight:700, fontSize:15 }}>{result.isHome ? result.opponent : myClub.name}</div>
      </div>
      {result.wentToPens && <div style={{ fontSize:12, color:"#e8b84b", marginBottom:6 }}>Level on aggregate — decided on penalties, {result.wonPens ? "you won" : "you lost"} the shootout</div>}
      <ResultBadge result={result.won ? "W" : "L"} />
      {result.scorerStr && <div style={{ fontSize:12, color:"#9ab89a", marginTop:10 }}>⚽ {result.scorerStr}</div>}
      <MatchAward motm={result.manOfTheMatch}/>
      {redCardLine}
      <div style={{ marginTop:10, fontSize:13, fontWeight:700, color: result.won ? "#7fd88f" : "#e08a8a" }}>
        {result.won ? (isCampaignOver ? "🏆 Champions of Europe!" : "Through to the next round") : (roundLabel.startsWith("Final") ? "Runners-up" : "Knocked out")}
      </div>
      <div style={{ marginTop:26 }}>
        <button onClick={onContinue} style={primaryBtnStyle}>{(!result.won || isCampaignOver) ? "View Campaign Summary →" : "Continue →"}</button>
      </div>
    </div>
  );
}

function UclFinal({ myClub, rec, onBack, bracket, clubs }){
  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <Trophy size={36} color="#e8b84b" style={{marginBottom:8}}/>
        <h2 style={{ fontSize:20 }}>Champions League {rec.outcome==="CHAMPION" ? "— Champions!" : rec.outcome==="RUNNER-UP" ? "— Runners-up" : "Campaign Over"}</h2>
        <div style={{ fontSize:13, color:"#9ab89a" }}>{myClub.name} · Campaign summary</div>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:20 }}>
        <StatBox label="Result" value={rec.outcome} />
        <StatBox label="Record" value={`${rec.record.w}-${rec.record.d}-${rec.record.l}`} />
        <StatBox label="Goals" value={`${rec.record.gf}-${rec.record.ga}`} />
      </div>
      {bracket&&<div style={{marginBottom:20}}><UclBracket bracket={bracket} clubs={clubs} myClubId={myClub.id}/></div>}
      <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:20 }}>
        {rec.results.map((r,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0e150e", border:"1px solid #1c2b1c", borderRadius:8, padding:"7px 12px", fontSize:12, gap:6, flexWrap:"wrap" }}>
            <span style={{ color:"#6a8a6a" }}>{r.stage}</span>
            <span>{r.isHome ? "vs" : "at"} {r.opponent}</span>
            <span style={{ fontWeight:800, color: r.result==="W"?"#7fd88f":r.result==="L"?"#e08a8a":"#e8b84b" }}>
              {r.isHome?r.myGoals:r.oppGoals}-{r.isHome?r.oppGoals:r.myGoals}{r.wentToPens ? ` (pens ${r.wonPens?"W":"L"})` : ""}
            </span>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center" }}>
        <button onClick={onBack} style={primaryBtnStyle}>Back to Season →</button>
      </div>
    </div>
  );
}

function UclPage({ state, myClub, squadCommonProps, actions }){
  const u = state.ucl;
  if (!u) return null;
  if (u.stage === "hub") return <UclHub state={state} myClub={myClub} onPlayNext={actions.uclGoToPrep} />;
  if (u.stage === "match-prep") return <UclMatchPrep state={state} myClub={myClub} squadCommonProps={squadCommonProps} onPlay={actions.uclPlayLeagueMatch} />;
  if (u.stage === "match-live") return <LiveMatchScreen {...u.liveContext} onDone={actions.uclFinishLiveMatch} banner={<UclBanner text="Kick-Off" sub={`League Phase · vs ${u.lastMatch.opponent}`} />} />;
  if (u.stage === "match-result") return <UclMatchResult myClub={myClub} result={u.lastMatch} onContinue={actions.uclContinueAfterMatch} />;
  if (u.stage === "phase-summary") return <UclPhaseSummary state={state} onContinue={actions.uclContinueAfterPhaseSummary} />;
  if (u.stage === "knockout-prep"){
    const opp = u.clubs.find(c=>c.id===u.currentKnockoutOpponentId);
    const roundName = u.knockoutRounds[u.knockoutRoundIndex];
    const isFinal = roundName === "Final";
    const leg = u.leg || 1;
    const label = isFinal ? "Final" : `${roundName} — Leg ${leg} of 2`;
    const sub = isFinal ? `${myClub.name} vs ${opp.name}` : (leg===1 ? `${myClub.name} vs ${opp.name} — first leg` : `Aggregate ${u.aggregate.mine}-${u.aggregate.opp} · second leg`);
    return <UclSingleMatchPrep myClub={myClub} opponent={opp} roundLabel={label} subLabel={sub} squadCommonProps={squadCommonProps} onPlay={actions.uclPlayKnockout} />;
  }
  if (u.stage === "knockout-live"){
    const roundName = u.knockoutRounds[u.knockoutRoundIndex];
    const isFinal = roundName === "Final";
    const leg = u.leg || 1;
    const label = isFinal ? "Final" : `${roundName} — Leg ${leg}`;
    return <LiveMatchScreen {...u.liveContext} onDone={actions.uclFinishLiveMatch} banner={<UclBanner text={`Kick-Off — ${label}`} />} />;
  }
  if (u.stage === "knockout-result"){
    const roundName = u.knockoutRounds[u.knockoutRoundIndex];
    const isFinal = roundName === "Final";
    const leg = u.leg || 1;
    const isDecidingLeg = isFinal || leg===2;
    const isCampaignOver = isDecidingLeg && (!u.lastMatch.won || isFinal);
    const label = isFinal ? "Final" : `${roundName} — Leg ${leg}`;
    return <UclSingleMatchResult myClub={myClub} result={u.lastMatch} roundLabel={label}
      aggregate={isFinal?null:u.aggregate} isLeg1={!isFinal && leg===1}
      isCampaignOver={isCampaignOver} onContinue={actions.uclContinueAfterKnockout} />;
  }
  if (u.stage === "final") return <UclFinal myClub={myClub} rec={{ results:u.campaignResults, record:u.campaignRecord, outcome:u.outcome }} onBack={actions.uclBackToSeason} bracket={u.knockoutBracket} clubs={u.clubs} />;
  return null;
}
function CupsHub({ state, onClose, onEnterUcl }){
  const rank=state.tableFinal?.findIndex(r=>r.id===state.myClubId)??-1;
  const uclUnlocked=rank>=0&&rank<4;
  const isEuropean = EUROPEAN_CLUBS.includes(state.myClubId);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}>
      <div style={{ background:"#0d160d", border:"1px solid #223322", borderRadius:"16px 16px 0 0", width:"100%", maxWidth:600, maxHeight:"85vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid #1c2b1c" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Cup Competitions</div>
          <button onClick={onClose} aria-label="Close" style={{ background:"transparent", border:"none", color:"#9ab89a" }}><X size={18}/></button>
        </div>
        <div style={{ overflowY:"auto", padding:"14px 18px 20px" }}>
          {state.league === "PL" && (
            <>
              <ScheduleCupCard title="FA Cup" icon="🏆" desc="Third Round → Final. Slotted into your second-half fixture list — no manual entry needed."
                cs={state.cupStatus.fa} isEuropean={false} />
              <ScheduleCupCard title="Carabao Cup" icon="🥤" desc={isEuropean ? "Your club is in Europe, so you get a bye straight to Round 2." : "Round 1 → Final. Opponents rotate their squads, so expect weaker sides."}
                cs={state.cupStatus.carabao} isEuropean={isEuropean} />
            </>
          )}
          {state.league === "LALIGA" && (
            <ScheduleCupCard title="Copa del Rey" icon="🏆" desc="Round of 32 → Final. Slotted into your second-half fixture list."
              cs={state.cupStatus.copa} isEuropean={false} />
          )}
          {(state.league === "SERIEA" || state.league === "BUNDES" || state.league === "LIGUE1") && (
            <div style={{ fontSize:12, color:"#9ab89a", marginBottom:14, background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:12 }}>
              {state.league === "SERIEA" ? "Coppa Italia isn't modelled yet" : state.league === "BUNDES" ? "DFB-Pokal isn't modelled yet" : "Coupe de France isn't modelled yet"} — Champions League is still available below.
            </div>
          )}
          <UclCard ucl={state.ucl} played={state.cups.ucl} locked={!uclUnlocked} onEnter={onEnterUcl} />
        </div>
      </div>
    </div>
  );
}

function TacticsModal({ state, onClose, onSetStyle, onSetLine, onSetAggression, onSetTrap, onSetPlan }){
  const styleList = Object.entries(STYLES).map(([key,v]) => ({ key, ...v }));
  const line = state.defensiveLine ?? 50;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}>
      <div style={{ background:"#0d160d", border:"1px solid #223322", borderRadius:"16px 16px 0 0", width:"100%", maxWidth:640, maxHeight:"85vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid #1c2b1c" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>🧠 Tactics</div>
          <button onClick={onClose} aria-label="Close" style={{ background:"transparent", border:"none", color:"#9ab89a" }}><X size={18}/></button>
        </div>
        <div style={{ overflowY:"auto", padding:"14px 18px 26px" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#cfe8cf", marginBottom:8 }}>Playing Style</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8, marginBottom:22 }}>
            {styleList.map(st => {
              const active = (state.tacticalStyle||"balanced") === st.key;
              return (
                <button key={st.key} onClick={()=>onSetStyle(st.key)} style={{
                  textAlign:"left", background: active?"#1c3a1c":"#111a11",
                  border: active?"1px solid #4a8a4a":"1px solid #2a3a2a",
                  borderRadius:10, padding:12, color:"#e8ede8"
                }}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:4, color: active?"#a8f0b8":"#e8ede8" }}>{st.name}</div>
                  <div style={{ fontSize:10, color:"#9ab89a", lineHeight:1.4 }}>{st.desc}</div>
                </button>
              );
            })}
          </div>

          <div style={{marginBottom:20,fontSize:12}}>
            <label>Halftime style change <select value={state.halftimeStyle||"keep"} onChange={e=>onSetPlan({halftimeStyle:e.target.value})}>
              <option value="keep">Keep current style</option>{styleList.map(st=><option key={st.key} value={st.key}>{st.name}</option>)}
            </select></label>
            <label style={{display:"block",marginTop:10}}><input type="checkbox" checked={state.autoSubs!==false} onChange={e=>onSetPlan({autoSubs:e.target.checked})}/> Replace tired players during the match (up to 5 substitutions)</label>
            <p>These plans take effect during the simulation. Fresh substitutes, fatigue and dismissals affect the remaining play.</p>
          </div>
          <div style={{ fontSize:12, fontWeight:700, color:"#cfe8cf", marginBottom:8 }}>Defensive Line</div>
          <input type="range" min={0} max={100} value={line} onChange={e=>onSetLine(parseInt(e.target.value,10))}
            style={{ width:"100%", marginBottom:6, accentColor:"#2d6b3f" }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#6a8a6a", marginBottom:22 }}>
            <span>Deep / Low Block</span><span style={{fontWeight:700, color:"#9ab89a"}}>{line}</span><span>High Line</span>
          </div>

          <div className="defensive-aggression-control">
            <div><strong>Defensive aggression</strong><span>{(state.defensiveAggression??50)<25?"Cautious":(state.defensiveAggression??50)<50?"Measured":(state.defensiveAggression??50)<75?"Assertive":"Full contact"}</span></div>
            <p>More pressure makes defending slightly stronger, but increases fouls and cards. Penalties only follow fouls in the box.</p>
            <input type="range" min={0} max={100} step={5} value={state.defensiveAggression??50} onChange={e=>onSetAggression(Number(e.target.value))} aria-label="Defensive aggression" />
            <div className="aggression-scale"><span>Cautious</span><span>Balanced</span><span>Aggressive</span></div>
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:"12px 16px" }}>
            <div style={{ paddingRight:12 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>Offside Trap</div>
              <div style={{ fontSize:10, color:"#9ab89a" }}>Push the line up to catch attackers offside. Works best when your defenders outclass their forwards — risky otherwise.</div>
            </div>
            <button aria-label="Offside trap" aria-pressed={!!state.offsideTrap} onClick={()=>onSetTrap(!state.offsideTrap)} style={{
              width:46, height:26, borderRadius:13, background: state.offsideTrap?"#2d6b3f":"#2a3a2a", position:"relative", border:"none", flexShrink:0, cursor:"pointer"
            }}>
              <div style={{ position:"absolute", top:2, left: state.offsideTrap?22:2, width:22, height:22, borderRadius:"50%", background:"#fff", transition:"left 150ms" }}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
const MARKET_LEAGUES={PL:"Premier League",LALIGA:"La Liga",SERIEA:"Serie A",BUNDES:"Bundesliga",LIGUE1:"Ligue 1",CHAMP:"Championship"};
function playerAttributes(player){
  let hash=0;for(const ch of player.id)hash=(Math.imul(hash,31)+ch.charCodeAt(0))>>>0;
  const jitter=i=>((hash>>>(i*4))&7)-3;
  const base=player.ovr,clampStat=n=>clamp(Math.round(n),35,96);
  if(player.group==="GK")return [["DIV",base+jitter(0)],["HAN",base-1+jitter(1)],["KIC",base-4+jitter(2)],["REF",base+2+jitter(3)],["SPD",base-18+jitter(4)],["POS",base+jitter(5)],["STA",player.stamina??80]].map(([k,v])=>[k,clampStat(v)]);
  const role=player.group;
  const offsets=role==="FWD"?[5,4,0,4,-18,1]:role==="MID"?[1,-3,5,4,-5,0]:[0,-18,-1,-4,6,5];
  return [...["PAC","SHO","PAS","DRI","DEF","PHY"].map((key,i)=>[key,clampStat(base+offsets[i]+jitter(i))]),["STA",player.stamina??80]];
}
function TransferMarket({ state, myClub, filter, setFilter, onClose, onBuy, onLoanIn }){
  const [screen,setScreen]=useState("browse");
  const [selected,setSelected]=useState(null);
  const [round,setRound]=useState(1);
  const [offer,setOffer]=useState(0);
  const [clubMessage,setClubMessage]=useState("");
  const [dealFee,setDealFee]=useState(0);
  const [dealKind,setDealKind]=useState("Permanent transfer");
  const [negotiationEnded,setNegotiationEnded]=useState(false);
  const pools=[
    ["PL",state.plClubs],["LALIGA",state.laligaClubs],["SERIEA",state.serieaClubs],
    ["BUNDES",state.bundesligaClubs],["LIGUE1",state.ligue1Clubs],["CHAMP",state.championshipClubs],
  ];
  const leagueByClub=new Map(pools.flatMap(([league,clubs])=>(clubs||[]).map(club=>[club.id,league])));
  const clubs=allClubs(state).filter(club=>club.id!==myClub.id).map(club=>({...club,league:leagueByClub.get(club.id)||state.league}));
  let players=clubs.flatMap(club=>club.players.map(player=>({...player,sellerClub:club,league:club.league})));
  const query=filter.q.trim().toLowerCase();
  if(query)players=players.filter(p=>p.name.toLowerCase().includes(query)||p.sellerClub.name.toLowerCase().includes(query));
  if(filter.pos!=="ALL")players=players.filter(p=>p.group===filter.pos);
  if(filter.league!=="ALL")players=players.filter(p=>p.league===filter.league);
  if(filter.club!=="ALL")players=players.filter(p=>p.sellerClub.id===filter.club);
  players.sort((a,b)=>filter.sort==="value_desc"?b.value-a.value:filter.sort==="value_asc"?a.value-b.value:filter.sort==="age_asc"?a.age-b.age:b.ovr-a.ovr);
  players=players.slice(0,120);
  const visibleClubs=clubs.filter(c=>filter.league==="ALL"||c.league===filter.league).filter(c=>!query||c.name.toLowerCase().includes(query)||c.players.some(p=>p.name.toLowerCase().includes(query)));
  const directoryClubs=filter.club==="ALL"?visibleClubs:visibleClubs.filter(club=>club.id===filter.club);
  let terms=null;
  if(selected&&screen!=="signed")try{terms=transferTerms(state,selected.sellerClub.id,selected.id);}catch{terms=null;}
  let loan=null;
  if(selected&&screen!=="signed")try{loan=loanTerms(state,selected.sellerClub.id,selected.id);}catch{loan=null;}
  const attributes=selected?playerAttributes(selected):[];
  function openPlayer(player){setSelected(player);setScreen("profile");setClubMessage("");}
  function startNegotiation(){if(!terms)return;setOffer(Math.min(state.budget,Math.max(1,Math.round(terms.askingPrice*.88))));setRound(1);setNegotiationEnded(false);setClubMessage(`${terms.seller.name} opened at ${fmtM(terms.askingPrice)}.`);setScreen("negotiate");}
  function submitOffer(){
    const response=evaluateOffer(state,{sellerId:selected.sellerClub.id,playerId:selected.id,offer,round});
    setClubMessage(response.message);
    if(response.status==="accepted"){
      if(onBuy(selected.sellerClub,selected,response.fee)){setDealFee(response.fee);setDealKind("Permanent transfer");setScreen("signed");}
    }else if(response.status==="counter"){
      setOffer(response.counter);setRound(value=>value+1);
    }else if(response.status==="rejected")setNegotiationEnded(true);
  }
  function goBack(){if(screen==="browse")onClose();else if(screen==="profile")setScreen("browse");else setScreen("profile");}
  return (
    <div className="transfer-shell" role="dialog" aria-modal="true" aria-label="Transfer Centre">
      <div className="transfer-aurora transfer-aurora-one"/><div className="transfer-aurora transfer-aurora-two"/>
      <header className="transfer-header">
        <button className="transfer-back" onClick={goBack}><ChevronLeft size={18}/><span>{screen==="browse"?"Close":"Back"}</span></button>
        <div className="transfer-brand"><span>GLOBAL RECRUITMENT</span><strong>Transfer Centre</strong></div>
        <div className="transfer-budget"><small>AVAILABLE BUDGET</small><strong>{fmtM(state.budget)}</strong></div>
      </header>

      <main className={`transfer-stage transfer-screen-${screen}`} key={screen}>
        {screen==="browse"&&<>
          <section className="market-hero">
            <div><span>SCOUTING NETWORK · 6 COMPETITIONS</span><h2>Find the player who changes your season.</h2><p>Search any player or club, compare the market, then enter direct negotiations.</p></div>
            <div className="market-search"><Search size={18}/><input autoFocus value={filter.q} onChange={e=>setFilter(f=>({...f,q:e.target.value,club:"ALL"}))} placeholder="Search player or club"/><kbd>⌘ K</kbd></div>
          </section>
          <div className="market-filters">
            <label><span>League</span><select value={filter.league} onChange={e=>setFilter(f=>({...f,league:e.target.value,club:"ALL"}))}><option value="ALL">All leagues</option>{Object.entries(MARKET_LEAGUES).map(([id,name])=><option value={id} key={id}>{name}</option>)}</select></label>
            <label><span>Club</span><select value={filter.club} onChange={e=>setFilter(f=>({...f,club:e.target.value}))}><option value="ALL">All clubs</option>{visibleClubs.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
            <label><span>Position</span><select value={filter.pos} onChange={e=>setFilter(f=>({...f,pos:e.target.value}))}><option value="ALL">All positions</option><option value="GK">Goalkeepers</option><option value="DEF">Defenders</option><option value="MID">Midfielders</option><option value="FWD">Forwards</option></select></label>
            <label><span>Sort</span><select value={filter.sort} onChange={e=>setFilter(f=>({...f,sort:e.target.value}))}><option value="ovr_desc">Highest rated</option><option value="value_desc">Highest value</option><option value="value_asc">Lowest value</option><option value="age_asc">Youngest</option></select></label>
          </div>
          <div className="market-browser">
            <aside className="club-directory">
              <div className="market-section-title"><Building2 size={14}/> Clubs</div>
              <button className={filter.club==="ALL"?"active":""} onClick={()=>setFilter(f=>({...f,club:"ALL"}))}><span className="all-clubs-mark">ALL</span><span><strong>All clubs</strong><small>{clubs.length} available</small></span></button>
              {directoryClubs.map(club=><button className={filter.club===club.id?"active":""} key={club.id} onClick={()=>setFilter(f=>({...f,club:club.id}))}><ClubBadge club={club} size="sm" className="club-dot"/><span><strong>{club.name}</strong><small>{MARKET_LEAGUES[club.league]} · {club.players.length} players</small></span></button>)}
            </aside>
            <section className="player-market-list">
              <div className="market-list-heading"><span><SlidersHorizontal size={14}/> {players.length} players found</span><small>Select a player for the full scout report</small></div>
              <div className="market-player-grid">
                {players.map(player=><button className="market-player-card" style={{"--market-club":player.sellerClub.color||"#4e9461"}} key={`${player.sellerClub.id}-${player.id}`} onClick={()=>openPlayer(player)}>
                  <span className="market-crest-watermark"><ClubBadge club={player.sellerClub} size="xl"/></span>
                  <div className="market-player-top"><span className="player-overall">{player.ovr}<small>OVR</small></span><span className="player-position" style={{color:GROUP_COLOR[player.group]}}>{player.role}</span><span className="player-price">{fmtM(player.value)}</span></div>
                  <strong>{player.name}</strong><span className="player-club"><ClubBadge club={player.sellerClub} size="xs"/>{player.sellerClub.name}</span>
                  <div className="market-player-meta"><span>Age {player.age}</span><span>{MARKET_LEAGUES[player.league]}</span><span>{player.confidence?`${player.confidence>0?"+":""}${player.confidence} form`:"Steady form"}</span></div>
                </button>)}
              </div>
              {!players.length&&<div className="market-empty">No players match this scouting brief.</div>}
            </section>
          </div>
        </>}

        {screen==="profile"&&selected&&<section className="player-profile-page">
          <div className="profile-identity" style={{"--profile-club":selected.sellerClub.color||"#4e9461"}}>
            <div className="profile-club-glow" style={{background:selected.sellerClub.color}}/>
            <div className="profile-crest-watermark"><ClubBadge club={selected.sellerClub} size="xl"/></div>
            <div className="profile-rating"><strong>{selected.ovr}</strong><span>{selected.role}</span></div>
            <div className="profile-name"><div className="profile-clubline"><ClubBadge club={selected.sellerClub} size="sm"/><span>{MARKET_LEAGUES[selected.league]} · {selected.sellerClub.name}</span></div><h2>{selected.name}</h2><p>Age {selected.age} · {selected.group} · Potential {terms?.potential||selected.ovr} · Fitness {Math.round(selected.condition??100)}% · Energy {Math.round(selected.energy??100)}%</p></div>
            <div className="profile-value"><small>MARKET VALUE</small><strong>{fmtM(selected.value)}</strong><span>{terms?.stance||"Unavailable"}</span></div>
          </div>
          <div className="profile-grid" style={{"--profile-club":selected.sellerClub.color||"#4e9461"}}>
            <div className="scout-card">
              <div className="profile-section-title">Scouted attributes</div>
              <div className="attribute-grid">{attributes.map(([label,value])=><div className="attribute" key={label}><strong>{value}</strong><span>{label}</span><i><b style={{width:`${value}%`}}/></i></div>)}</div>
              <div className="scout-summary"><span>Scout summary</span><p>{selected.ovr>=86?"Elite player capable of deciding high-level matches.":selected.age<=23?"High-upside profile with immediate first-team value.":selected.ovr>=80?"Proven first-team quality with a reliable current level.":"Useful squad option whose value depends on tactical fit."}</p></div>
            </div>
            <div className="deal-card">
              <div className="profile-section-title">Deal room</div>
              <div className="deal-line"><span>Club asking price</span><strong>{terms?fmtM(terms.askingPrice):"Unavailable"}</strong></div>
              <div className="deal-line"><span>Your budget</span><strong className={terms&&state.budget>=terms.minimumPrice?"positive":"negative"}>{fmtM(state.budget)}</strong></div>
              <div className="deal-line"><span>Squad status</span><strong>{terms?.stance||"No deal"}</strong></div>
              <button className="negotiate-button" disabled={!terms?.releaseAllowed||state.budget<terms?.minimumPrice||selected.loan} onClick={startNegotiation}><HandCoins size={17}/> Enter negotiations</button>
              <button className="loan-button" disabled={selected.loan||!loan?.available||state.budget<(loan?.fee||loanFee(selected))} title={loan?.reason} onClick={()=>{if(onLoanIn(selected.sellerClub,selected)){setDealFee(loan.fee);setDealKind("Season loan");setScreen("signed");}}}>Loan enquiry · {loan?.available?fmtM(loan.fee):"Unavailable"}</button>
              {loan&&!loan.available&&<p className="loan-status">{loan.reason}</p>}
              {terms&&state.budget<terms.minimumPrice&&<p className="deal-warning">The likely agreement is above your current budget.</p>}
            </div>
          </div>
        </section>}

        {screen==="negotiate"&&selected&&terms&&<section className="negotiation-page">
          <div className="negotiation-room">
            <div className="negotiation-party"><ClubBadge club={selected.sellerClub} size="xl" className="party-badge"/><small>SELLING CLUB</small><strong>{selected.sellerClub.name}</strong><div className="club-demand"><span>{round===1?"OPENING DEMAND":"CLUB RESPONSE"}</span><b>{round===1?fmtM(terms.askingPrice):clubMessage.match(/\d+m/)?.[0]?`£${clubMessage.match(/\d+m/)[0]}`:"Decision"}</b><p>{clubMessage}</p></div></div>
            <div className="negotiation-centre"><span>ROUND {round} OF 3</span><div className="deal-player-chip"><b>{selected.ovr}</b><span><strong>{selected.name}</strong><small>{selected.role} · Age {selected.age}</small></span></div><div className="negotiation-pulse"/></div>
            <div className="negotiation-party user-party"><ClubBadge club={myClub} size="xl" className="party-badge"/><small>YOUR CLUB</small><strong>{myClub.name}</strong><p>Budget remaining: {fmtM(state.budget)}</p></div>
          </div>
          <div className="offer-console">
            <div><span>TRANSFER FEE</span><strong>{fmtM(offer)}</strong><small>Market value {fmtM(selected.value)} · Asking price {fmtM(terms.askingPrice)}</small></div>
            <input type="range" min={Math.max(1,Math.round(selected.value*.65))} max={Math.max(state.budget,terms.askingPrice)} value={offer} onChange={e=>setOffer(Number(e.target.value))}/>
            <div className="offer-presets"><button onClick={()=>setOffer(Math.min(state.budget,Math.max(1,Math.round(terms.askingPrice*.9))))}>Firm</button><button onClick={()=>setOffer(Math.min(state.budget,terms.askingPrice))}>Meet asking price</button><button onClick={()=>setOffer(Math.min(state.budget,offer+5))}>+ £5m</button></div>
            {negotiationEnded?<button className="submit-offer" onClick={()=>setScreen("profile")}>Negotiations ended · Return to profile</button>:<button className="submit-offer" onClick={submitOffer} disabled={offer>state.budget}>Submit offer · {fmtM(offer)}</button>}
          </div>
        </section>}

        {screen==="signed"&&selected&&<section className="signed-page">
          <div className="signed-rings"><i/><i/><i/></div><Sparkles className="signed-spark" size={30}/><span>{dealKind.toUpperCase()} COMPLETE</span><div className="signed-player"><b>{selected.ovr}</b><i style={{background:selected.sellerClub.color}}>{selected.role}</i></div><h2>{selected.name}</h2><p>{dealKind==="Season loan"?`joins ${myClub.name} on loan from ${selected.sellerClub.name}`:`joins ${myClub.name} from ${selected.sellerClub.name}`}</p><strong>{fmtM(dealFee)}</strong><button onClick={onClose}>Return to squad</button>
        </section>}
      </main>
    </div>
  );
}
