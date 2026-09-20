import { slotAccepts, tacticalHints, clamp, topXI, STYLES, styleMatchupBonus, inferStyle, roundRobin, initTable, applyUpdates, computeTableArray, ovrLabel, fmtM, ord, autoLineup, lineupIssue, ensureFixtures, pickN, pendingCupSlot, uclZoneLabel, uclZoneBg, simulateUclRound, pickKnockoutOpponent, cleanLineupOfSuspended, buildLiveMatchContext, freshState, applyMatchFitness, applyPerformanceUpdates, playerSeasonAverage, seasonPlayerRows, seasonBestXI, seasonLabel, LEAGUE_NAMES } from "./game/engine.js";
import { simulateHalf, playLeagueRound, playDomesticCup, advanceLeagueRound, playEuropeanKnockout, advanceEuropeanKnockout } from "./game/actions.js";
import { ROLE_GROUP, GROUP_COLOR, EUROPEAN_CLUBS, FORMATIONS } from "./game/config.js";
import { marketOpen, loanFee, transfer, startNextSeason } from "./game/career.js";
import { validateSave, loadGame, saveGame, exportGame } from "./game/storage.js";
import LiveMatchScreen from "./components/LiveMatchScreen.jsx";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeftRight, Search, X, RotateCcw, ShoppingCart, Trophy } from "lucide-react";

export default function App(){
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saveError,setSaveError]=useState("");
  const [saveBlocked,setSaveBlocked]=useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [cupsOpen, setCupsOpen] = useState(false);
  const [tacticsOpen, setTacticsOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState({ q:"", pos:"ALL", sort:"value_desc" });
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
    catch(error){setSaveError(`Progress is not saved: ${error.message}. Export a backup below.`);}
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
    function move(e){
      setDragPos({ x: e.clientX, y: e.clientY });
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el && el.closest("[data-slot-index]");
      setHoverSlot(slotEl ? parseInt(slotEl.getAttribute("data-slot-index"), 10) : null);
    }
    function up(e){
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
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
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
    setState(s => ({ ...s, myClubId: clubId, budget: club.budget, formation:club.preferredFormation || s.formation, lineup: autoLineup(FORMATIONS[club.preferredFormation || s.formation], club.players), stage: "mode" }));
  }
  function pickMode(mode){ setState(s => ({ ...s, simMode: mode, stage: "squad" })); }

  function setFormation(f){
    setState(s => { const club = s.clubs.find(c=>c.id===s.myClubId); return { ...s, formation:f, lineup: autoLineup(FORMATIONS[f], club.players.filter(p=>!(s.suspensions?.[s.stage==="ucl"?"ucl":"domestic"]||[]).includes(p.id))) }; });
  }
  function setTacticalStyle(key){ setState(s => ({ ...s, tacticalStyle: key })); }
  function setDefensiveLine(val){ setState(s => ({ ...s, defensiveLine: val })); }
  function setOffsideTrap(val){ setState(s => ({ ...s, offsideTrap: val })); }
  function editNumber(playerId, num){
    updateClub(state.myClubId, c => ({ ...c, players: c.players.map(p => p.id===playerId ? {...p, number:num} : p) }));
  }
  function doTransfer(action){
    try{setState(transfer(state,action));flashToast("Transfer completed");}
    catch(error){flashToast(error.message);}
  }
  function sellPlayer(playerId){doTransfer({type:"sell",playerId});}
  function loanOut(playerId){doTransfer({type:"loan-out",playerId});}
  function buyPlayer(seller,player){doTransfer({type:"buy",sellerId:seller.id,playerId:player.id});}
  function loanIn(seller,player){doTransfer({type:"loan-in",sellerId:seller.id,playerId:player.id});}
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

  // Champions League: real 36-team league-phase format, drawing opponents (with real squads) from
  // whichever two leagues you're NOT currently playing in. Interactive, one match at a time.
  function buildUclPool(s){
    const others = [];
    if (s.league !== "PL") others.push(...s.plClubs);
    if (s.league !== "LALIGA") others.push(...s.laligaClubs);
    if (s.league !== "SERIEA") others.push(...s.serieaClubs);
    if (s.league !== "BUNDES") others.push(...s.bundesligaClubs);
    if (s.league !== "LIGUE1") others.push(...s.ligue1Clubs);
    return others;
  }
  function enterUcl(){
    commitGame(s => {
      if (s.ucl && s.ucl.stage !== "final") return { ...s, stage: "ucl" };
      const pool = buildUclPool(s);
      const chosen = pickN(pool, Math.min(35, pool.length));
      const me = s.clubs.find(c=>c.id===s.myClubId);
      const clubs = [me, ...chosen];
      const ids = clubs.map(c=>c.id);
      const rounds = roundRobin(ids).slice(0, 8);
      return { ...s, stage: "ucl", ucl: {
        stage: "hub", clubs, rounds, roundIndex: 0, tableRaw: initTable(ids), lastMatch: null,
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
      let next=applyPerformanceUpdates({...s,ucl:{...u,tableRaw}},performanceUpdates);
      next=applyMatchFitness(next,userResult);
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
      let opp, knockoutRounds;
      if (u.qualification === "playoff"){
        knockoutRounds = ["Playoff","Round of 16","Quarter-Final","Semi-Final","Final"];
        const zone = u.phaseTable.slice(8,24).filter(r=>r.id!==s.myClubId);
        opp = zone[Math.floor(Math.random()*zone.length)].club;
      } else {
        knockoutRounds = ["Round of 16","Quarter-Final","Semi-Final","Final"];
        opp = pickKnockoutOpponent({ ...u, knockoutFaced: [] }, s.myClubId);
      }
      return { ...s, ucl: { ...u, knockoutRounds, knockoutRoundIndex:0, knockoutFaced:[], currentKnockoutOpponentId: opp.id,
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
      const oppStyle = inferStyle(opponent.players, oppForm);
      const myStyle = state.tacticalStyle || "balanced";
      const hints = tacticalHints(state.formation, oppForm);
      const sBonus = styleMatchupBonus(myStyle, oppStyle), sBonusAgainst = styleMatchupBonus(oppStyle, myStyle);
      if (sBonus >= 0.04) hints.push({ text:`${STYLES[myStyle].name} exploits their ${STYLES[oppStyle].name} ✓`, color:"#7fd88f" });
      else if (sBonusAgainst >= 0.04) hints.push({ text:`Vulnerable to their ${STYLES[oppStyle].name} ⚠`, color:"#e8b84b" });
      stageEl = (
        <div>
          <div style={{ background:"#16321c", border:"1px solid #2d6b3f", borderRadius:10, padding:"10px 16px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
            <div style={{ fontSize:12, color:"#9ab89a" }}>Matchday {(state.half===1?0:state.roundsHalf1.length) + state.roundIndex + 1} / {state.roundsHalf1.length+state.roundsHalf2.length}</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontWeight:700, fontSize:14 }}>{isHome ? `${myClub.name} (${state.formation}) vs ${opponent.name} (${oppForm})` : `${opponent.name} (${oppForm}) vs ${myClub.name} (${state.formation})`}</div>
              <div style={{ fontSize:10, color:"#9ab8e8", marginTop:1 }}>You: {STYLES[myStyle].name} · Them: {STYLES[oppStyle].name}</div>
              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:3 }}>
                {hints.map((h,i)=><span key={i} style={{ fontSize:10, color:h.color, fontWeight:600 }}>{h.text}</span>)}
              </div>
            </div>
            <div style={{ fontSize:11, color:"#9ab89a", fontWeight:700 }}>{isHome ? "HOME" : "AWAY"}</div>
          </div>
          <SquadScreen {...squadCommonProps} onSimulate={playRound} simulateLabel={`Play Match vs ${opponent.name}`} />
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
  else if (state.stage === "half-results") stageEl = <ResultsScreen title="First Half of the Season" results={state.results1} table={state.table1} clubs={state.clubs} myClubId={state.myClubId} onContinue={goToMidWindow} continueLabel="Go to Transfer Window →" cupStatus={state.cupStatus} />;
  else if (state.stage === "full-results") stageEl = <ResultsScreen title="Final Season Results" results={state.results2} table={state.tableFinal} clubs={state.clubs} myClubId={state.myClubId} onContinue={finalizeSeason} continueLabel="Finalise Season →" projectedTable={state.table1} cupStatus={state.cupStatus} />;
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
        <div style={{ position:"fixed", left:dragPos.x, top:dragPos.y, transform:"translate(-50%,-55%) rotate(-4deg)", pointerEvents:"none", zIndex:1000 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(13,22,13,0.94)", backdropFilter:"blur(6px)", border:"1px solid rgba(127,216,143,0.4)", borderRadius:12, padding:"7px 14px 7px 7px", boxShadow:"0 14px 30px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:GROUP_COLOR[dragMeta.current.player.group], display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#0a0e0a", fontSize:12, flexShrink:0 }}>
              {dragMeta.current.player.number}
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#f0f5f0", whiteSpace:"nowrap" }}>{dragMeta.current.player.name}</div>
              <div style={{ fontSize:9, color:"#8fae8f" }}>{dragMeta.current.player.role}</div>
            </div>
          </div>
        </div>
      )}

      <div className="app-pad" style={{ maxWidth:"100%", width:"100%", margin:"0 auto", padding:"20px clamp(16px,3vw,60px) 60px" }}>
        <Header myClub={myClub} league={state.league} onRestart={restart} />
        <SaveToolbar state={state} saveBlocked={saveBlocked} saveError={saveError}
          onExport={downloadSave} onImport={importSave} />
        {saveError && <div role="alert" style={{padding:12,color:"#ffd28a",border:"1px solid #8a6530",marginBottom:12}}>{saveError}{saveBlocked&&" Your existing save has been kept. Import a valid backup or use Restart to begin a new save."}</div>}
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
        <TacticsModal state={state} onClose={()=>setTacticsOpen(false)} onSetStyle={setTacticalStyle} onSetLine={setDefensiveLine} onSetTrap={setOffsideTrap} onSetPlan={plan=>setState(s=>({...s,...plan}))} />
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
        <button className="quiet-button" onClick={onExport}>Export save</button>
        <label className="quiet-button file-button">Import save
          <input className="visually-hidden" aria-label="Import save" type="file" accept="application/json,.json" onChange={onImport} />
        </label>
      </div>
    </div>
  );
}
function SeasonStatus({ state, myClub }){
  const condition=Math.round(myClub.players.reduce((sum,p)=>sum+(p.condition??100),0)/Math.max(1,myClub.players.length));
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
        <div className="overview-label">Squad readiness</div>
        <div className="overview-value">{condition}%</div>
        <div className="condition-track"><span className={`condition-fill ${conditionTone}`} style={{width:`${condition}%`}}/></div>
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
function Header({ myClub, league, onRestart }){
  const LEAGUE_LABELS = { LALIGA:"LA LIGA MANAGER", SERIEA:"SERIE A MANAGER", BUNDES:"BUNDESLIGA MANAGER", LIGUE1:"LIGUE 1 MANAGER" };
  const label = LEAGUE_LABELS[league] || "PREMIER LEAGUE MANAGER";
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, paddingBottom:14, borderBottom:"1px solid #1c2b1c", flexWrap:"wrap", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:8, background: myClub?myClub.color:"#3a5a3a", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color:"#fff", flexShrink:0 }}>
          {myClub ? myClub.name.split(" ").map(w=>w[0]).slice(0,2).join("") : "?"}
        </div>
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
            <div style={{ width:44,height:44,borderRadius:10, background:c.color, display:"flex",alignItems:"center",justifyContent:"center", fontWeight:800, color:"#fff", fontSize:15 }}>
              {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
            </div>
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

function Pitch({ formation, lineup, players, onDragStart, draggingPlayer, hoverSlot }){
  const slots = FORMATIONS[formation];
  const dragging = !!draggingPlayer;
  return (
    <div data-bench="false" style={{ position:"relative", width:"100%", maxWidth:460, margin:"0 auto", paddingTop:"125%", borderRadius:14, overflow:"hidden",
      background:"linear-gradient(180deg,#0f2413,#132c17 50%,#0f2413)", border:"1px solid #1c3a1c" }}>
      {[...Array(5)].map((_,i)=>(
        <div key={i} style={{ position:"absolute", left:0, right:0, top:`${i*20}%`, height:"1px", background:"rgba(255,255,255,0.05)" }}/>
      ))}
      <div style={{ position:"absolute", left:"50%", top:"50%", width:90, height:90, marginLeft:-45, marginTop:-45, border:"1px solid rgba(255,255,255,0.08)", borderRadius:"50%" }}/>
      {slots.map((slot, i) => {
        const group = ROLE_GROUP[slot.role];
        const playerId = lineup[i];
        const player = players.find(p=>p.id===playerId);
        const isHover = hoverSlot === i && dragging;
        const eligible = dragging ? slotAccepts(slot.role, draggingPlayer) : false;
        let ring = "rgba(255,255,255,0.28)";
        let cls = "";
        if (dragging && !player){
          if (eligible){ cls = "slot-eligible"; ring = "rgba(127,216,143,0.6)"; }
          else ring = "rgba(255,255,255,0.1)";
        }
        if (isHover) ring = eligible ? "#7fd88f" : "#e08a8a";
        return (
          <div key={i} data-slot-index={i} data-slot-role={slot.role}
            style={{ position:"absolute", left:`${slot.x}%`, top:`${slot.y}%`, width:60, textAlign:"center",
              transform:`translate(-50%,-50%) scale(${isHover?1.18:1})`, transition:"transform 100ms ease" }}>
            <div className={cls}
              onPointerDown={ player ? (e)=>onDragStart(e, player, { source:"slot", slotIndex:i }) : undefined }
              style={{ width:36, height:36, margin:"0 auto 3px", borderRadius:"50%",
                background: player ? `linear-gradient(150deg, ${GROUP_COLOR[group]}, ${GROUP_COLOR[group]}bb)` : "rgba(255,255,255,0.03)",
                border: player ? "2px solid #0a0e0a" : `2px dashed ${ring}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800,
                color: player ? "#0a0e0a" : "rgba(255,255,255,0.5)",
                cursor: player ? "grab" : "default", touchAction:"none",
                boxShadow: player ? "0 2px 8px rgba(0,0,0,0.45), 0 0 0 2px #0a0e0a" : (isHover ? `0 0 0 5px ${ring}33` : "none") }}>
              {player ? player.number : slot.role}
            </div>
            <div style={{ fontSize:9, color:"#9ab89a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {player ? player.name.split(" ").slice(-1)[0] : slot.role}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SeasonInsights({ clubs, compact=false }){
  const rows=seasonPlayerRows(clubs);
  if(!rows.length)return null;
  const top=(selector,count=5)=>[...rows].sort((a,b)=>selector(b)-selector(a)||b.average-a.average).slice(0,count);
  const leaders=[
    {label:"Goals",icon:"⚽",rows:top(r=>r.player.seasonGoals||0),value:r=>r.player.seasonGoals||0},
    {label:"Assists",icon:"🎯",rows:top(r=>r.player.seasonAssists||0),value:r=>r.player.seasonAssists||0},
    {label:"Avg rating",icon:"★",rows:top(r=>r.average),value:r=>r.average.toFixed(2)},
    {label:"Player awards",icon:"◆",rows:top(r=>r.player.motm||0),value:r=>r.player.motm||0},
  ];
  const bestXI=seasonBestXI(clubs);
  const groups=["GK","DEF","MID","FWD"];
  return (
    <section className={`season-intelligence ${compact?"season-intelligence-compact":""}`}>
      <div className="intel-heading">
        <div><div className="intel-kicker">League intelligence · all competitions</div><div className="intel-title">Season performance centre</div></div>
        <div className="intel-note">Ratings update every match for every simulated club</div>
      </div>
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
              <span className="season-club-mark" style={{background:row.club.color}}>{row.club.name.split(" ").map(w=>w[0]).slice(0,2).join("")}</span>
              <span><strong>{row.player.name}</strong><small>{row.selectedRole} · {row.club.name}</small></span>
              <b>{row.average.toFixed(2)}</b>
            </div>)}
          </div>)}
        </div>
      </div>
    </section>
  );
}

function SquadScreen({ state, myClub, onSetFormation, onDragStart, onEditNumber, onSell, onLoanOut, onOpenMarket, onOpenCups, onOpenTactics, onSimulate, simulateLabel, draggingPlayer, hoverSlot, showMarketBar=true, suspendedIds }){
  const suspendedSet = new Set(suspendedIds || []);
  const usedIds = new Set(Object.values(state.lineup).filter(Boolean));
  const issue = lineupIssue(state,state.stage==="ucl"?"ucl":"domestic");
  const windowOpen=marketOpen(state);
  const order = ["GK","DEF","MID","FWD"];
  const sorted = [...myClub.players].sort((a,b)=> order.indexOf(a.group)-order.indexOf(b.group) || b.ovr-a.ovr);

  return (
    <div>
      {showMarketBar&&<SeasonInsights clubs={state.clubs}/>} 
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:12, color:"#9ab89a" }}>Formation</span>
          <select value={state.formation} onChange={e=>onSetFormation(e.target.value)}
            style={{ background:"#111a11", color:"#e8ede8", border:"1px solid #2a3a2a", borderRadius:7, padding:"6px 10px", fontSize:13 }}>
            {Object.keys(FORMATIONS).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          {onOpenTactics && <button onClick={onOpenTactics} style={{ display:"flex", alignItems:"center", gap:6, background:"#12181c", border:"1px solid #2d4a6b", color:"#a8d0f0", padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:600 }}>
            🧠 Tactics ({STYLES[state.tacticalStyle||"balanced"].name})
          </button>}
        </div>
        {showMarketBar && <div className="top-actions" style={{ display:"flex", gap:8 }}>
          {onOpenCups && <button onClick={onOpenCups} style={{ display:"flex", alignItems:"center", gap:6, background:"#1c1a12", border:"1px solid #6b5a2d", color:"#e8d09a", padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:600 }}>
            🏆 Cups
          </button>}
          <button onClick={onOpenMarket} disabled={!windowOpen} title={windowOpen?"Open transfer market":"Transfers open in preseason and midseason"} style={{ display:"flex", alignItems:"center", gap:6, background:"#16321c", border:"1px solid #2d6b3f", color:"#a8f0b8", padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:600 }}>
            <ArrowLeftRight size={14}/> Transfer Market
          </button>
        </div>}
      </div>

      <p style={{ fontSize:11, color:"#6a8a6a", marginBottom:10 }}>Drag a player from your squad onto the pitch. Eligible slots glow while you drag. Drag a starter onto the squad list to bench them.</p>

      <div className="grid-2col">
        <div>
          <Pitch formation={state.formation} lineup={state.lineup} players={myClub.players} onDragStart={onDragStart} draggingPlayer={draggingPlayer} hoverSlot={hoverSlot} />
          <div style={{ fontSize:11, color:"#6a8a6a", marginTop:8, display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
            <Legend color={GROUP_COLOR.GK} label="Keeper"/><Legend color={GROUP_COLOR.DEF} label="Defence"/>
            <Legend color={GROUP_COLOR.MID} label="Midfield"/><Legend color={GROUP_COLOR.FWD} label="Attack"/>
          </div>
        </div>

        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Squad ({myClub.players.length})</div>
          <div data-bench="true" style={{ maxHeight:460, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
            {sorted.map(p => {
              const suspended = suspendedSet.has(p.id);
              return (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:8, background: suspended?"#2b1414":usedIds.has(p.id)?"#132513":"#0e150e", border: suspended?"1px solid #6b2d2d":"1px solid #1c2b1c", borderRadius:8, padding:"6px 10px", opacity: suspended?0.7:1 }}>
                <div onPointerDown={suspended?undefined:(e)=>onDragStart(e, p, { source:"squad" })}
                  style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0, cursor: suspended?"not-allowed":"grab", touchAction:"none" }}>
                  <div style={{ width:8,height:8,borderRadius:"50%", background:GROUP_COLOR[p.group], flexShrink:0 }}/>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {p.name}{p.loan && <span style={{color:"#e8b84b",fontSize:10}}> (loan)</span>}{usedIds.has(p.id) && !suspended && <span style={{color:"#7fd88f",fontSize:10}}> · starting</span>}{suspended && <span style={{color:"#e08a8a",fontSize:10}}> · 🚫 suspended</span>}
                    </div>
                    <div style={{ fontSize:10, color:"#6a8a6a" }}>{p.role} · Age {p.age} · OVR {p.ovr}{p.confidence?` ${p.confidence>0?"+":""}${p.confidence} form`:""} · {fmtM(p.value)} · Condition {Math.round(p.condition??100)}%</div>
                    {(p.ratedMatches||0)>0&&<div style={{ fontSize:9, color:"#789978", marginTop:2 }}>Avg {playerSeasonAverage(p).toFixed(2)} · Best {p.bestRating?.toFixed(1)} · {p.seasonGoals||0}G {p.seasonAssists||0}A · {p.motm||0} MOTM</div>}
                  </div>
                </div>
                <input type="number" min={1} max={99} value={p.number} onChange={e=>onEditNumber(p.id, clamp(parseInt(e.target.value||"1",10),1,99))}
                  style={{ width:38, background:"#0a0e0a", border:"1px solid #223322", color:"#e8ede8", borderRadius:5, fontSize:12, padding:"5px 3px", textAlign:"center" }}/>
                <button onClick={()=>onLoanOut(p.id)} disabled={!windowOpen||p.loan} title="Loan out" style={{ background:"transparent", border:"1px solid #2a3a2a", color:"#9ab89a", borderRadius:6, fontSize:10, padding:"5px 7px" }}>Loan</button>
                <button onClick={()=>onSell(p.id)} disabled={!windowOpen||p.loan} title="Sell" style={{ background:"transparent", border:"1px solid #5a2a2a", color:"#e08a8a", borderRadius:6, fontSize:10, padding:"5px 7px" }}>Sell</button>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginTop:20, textAlign:"center" }}>
        {issue && <div role="alert" style={{color:"#e8b84b",fontSize:12,marginBottom:8}}>{issue}</div>}
        <button onClick={onSimulate} disabled={!!issue} style={{...primaryBtnStyle,opacity:issue?0.5:1}}>{simulateLabel}</button>
      </div>
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
function ResultsScreen({ title, results, table, clubs, myClubId, onContinue, continueLabel, projectedTable, cupStatus }){
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
        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>League Table</div>
          <div style={{ maxHeight:420, overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead><tr style={{ color:"#6a8a6a", textAlign:"left" }}>
                <th style={{padding:"4px 6px"}}>#</th><th>Club</th><th>P</th><th>Pts</th><th>GD</th>
              </tr></thead>
              <tbody>
                {table.map((r,i)=>(
                  <tr key={r.id} style={{ background: r.id===myClubId?"#132513":"transparent", borderTop:"1px solid #1c2b1c" }}>
                    <td style={{padding:"5px 6px"}}>{i+1}</td>
                    <td style={{fontWeight:r.id===myClubId?700:400}}>{r.club.name}</td>
                    <td>{r.played}</td><td style={{fontWeight:700}}>{r.pts}</td><td>{r.gd>=0?"+":""}{r.gd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
            const o = gp.length ? gp.reduce((s,p)=>s+p.ovr,0)/gp.length : 0;
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

      <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Final Table</div>
      <div style={{ maxHeight:400, overflowY:"auto", marginBottom:20 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr style={{ color:"#6a8a6a", textAlign:"left" }}>
            <th style={{padding:"4px 6px"}}>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th>
          </tr></thead>
          <tbody>
            {state.tableFinal.map((r,i)=>(
              <tr key={r.id} style={{ background: r.id===state.myClubId?"#132513":"transparent", borderTop:"1px solid #1c2b1c" }}>
                <td style={{padding:"5px 6px"}}>{i+1}</td>
                <td style={{fontWeight:r.id===state.myClubId?700:400}}>{r.club.name}</td>
                <td>{r.played}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td>{r.gd>=0?"+":""}{r.gd}</td><td style={{fontWeight:700}}>{r.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

function RivalSquadPanel({ club }){
  const order = ["GK","DEF","MID","FWD"];
  const xi = topXI(club.players,club.preferredFormation);
  const xiIds = new Set(xi.map(p=>p.id));
  const sorted = [...club.players].sort((a,b)=> order.indexOf(a.group)-order.indexOf(b.group) || b.ovr-a.ovr);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{ width:34, height:34, borderRadius:8, background:club.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:13 }}>
          {club.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:14 }}>{club.name}</div>
          <div style={{ fontSize:11, color:"#9ab89a" }}>{club.preferredFormation || "4-4-2"} · Predicted XI</div>
        </div>
      </div>
      <div style={{ maxHeight:460, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
        {sorted.map(p => (
          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:8, background: xiIds.has(p.id)?"#132513":"#0e150e", border:"1px solid #1c2b1c", borderRadius:8, padding:"6px 10px" }}>
            <div style={{ width:8,height:8,borderRadius:"50%", background:GROUP_COLOR[p.group], flexShrink:0 }}/>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {p.name}{xiIds.has(p.id) && <span style={{color:"#7fd88f",fontSize:10}}> · starting</span>}
              </div>
              <div style={{ fontSize:10, color:"#6a8a6a" }}>{p.role} · Age {p.age} · OVR {p.ovr}</div>
            </div>
          </div>
        ))}
      </div>
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

function UclTable({ table, myClubId }){
  return (
    <div style={{ maxHeight:480, overflowY:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead><tr style={{ color:"#6a8a6a", textAlign:"left" }}>
          <th style={{padding:"4px 6px"}}>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th><th>Zone</th>
        </tr></thead>
        <tbody>
          {table.map((r,i)=>(
            <tr key={r.id} style={{ background: uclZoneBg(i+1, r.id===myClubId), borderTop:"1px solid #1c2b1c" }}>
              <td style={{padding:"5px 6px"}}>{i+1}</td>
              <td style={{fontWeight:r.id===myClubId?700:400}}>{r.club.name}</td>
              <td>{r.played}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td>{r.gd>=0?"+":""}{r.gd}</td><td style={{fontWeight:700}}>{r.pts}</td>
              <td style={{fontSize:10, color:"#9ab89a"}}>{uclZoneLabel(i+1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
              <div style={{ width:38, height:38, borderRadius:8, background:opponent.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff" }}>
                {opponent.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
              </div>
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
  const u = state.ucl;
  const round = u.rounds[u.roundIndex];
  const match = round.find(([h,a]) => h===state.myClubId || a===state.myClubId);
  const isHome = match[0] === state.myClubId;
  const opponent = u.clubs.find(c => c.id === (isHome ? match[1] : match[0]));
  return (
    <div>
      <UclBanner text={isHome ? `${myClub.name} vs ${opponent.name}` : `${opponent.name} vs ${myClub.name}`} sub={`League Phase · Matchday ${u.roundIndex+1} of 8`} />
      <div className="ucl-prep-grid">
        <SquadScreen {...squadCommonProps} onSimulate={onPlay} simulateLabel={`Kick Off vs ${opponent.name}`} showMarketBar={false} suspendedIds={state.suspensions.ucl} />
        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Rival Squad</div>
          <RivalSquadPanel club={opponent} />
        </div>
      </div>
    </div>
  );
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
  return (
    <div>
      <UclBanner text={roundLabel} sub={subLabel || `${myClub.name} vs ${opponent.name}`} />
      <div className="ucl-prep-grid">
        <SquadScreen {...squadCommonProps} onSimulate={onPlay} simulateLabel={`Kick Off — ${roundLabel}`} showMarketBar={false} suspendedIds={squadCommonProps.state.suspensions.ucl} />
        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Rival Squad</div>
          <RivalSquadPanel club={opponent} />
        </div>
      </div>
    </div>
  );
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

function UclFinal({ myClub, rec, onBack }){
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
  if (u.stage === "final") return <UclFinal myClub={myClub} rec={{ results:u.campaignResults, record:u.campaignRecord, outcome:u.outcome }} onBack={actions.uclBackToSeason} />;
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

function TacticsModal({ state, onClose, onSetStyle, onSetLine, onSetTrap, onSetPlan }){
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
            <label style={{display:"block",marginTop:10}}><input type="checkbox" checked={state.autoSubs!==false} onChange={e=>onSetPlan({autoSubs:e.target.checked})}/> Replace up to three tired players at 60 minutes</label>
            <p>These plans take effect during the simulation. Fresh substitutes, fatigue and dismissals affect the remaining play.</p>
          </div>
          <div style={{ fontSize:12, fontWeight:700, color:"#cfe8cf", marginBottom:8 }}>Defensive Line</div>
          <input type="range" min={0} max={100} value={line} onChange={e=>onSetLine(parseInt(e.target.value,10))}
            style={{ width:"100%", marginBottom:6, accentColor:"#2d6b3f" }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#6a8a6a", marginBottom:22 }}>
            <span>Deep / Low Block</span><span style={{fontWeight:700, color:"#9ab89a"}}>{line}</span><span>High Line</span>
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
function TransferMarket({ state, myClub, filter, setFilter, onClose, onBuy, onLoanIn }){
  const others = [...state.clubs.filter(c=>c.id!==myClub.id), ...(state.league==="PL" ? state.championshipClubs : [])];
  let list = [];
  others.forEach(c => c.players.forEach(p => list.push({ ...p, sellerClub: c })));
  if (filter.q) list = list.filter(p => p.name.toLowerCase().includes(filter.q.toLowerCase()));
  if (filter.pos !== "ALL") list = list.filter(p => p.group === filter.pos);
  list.sort((a,b) => filter.sort==="value_desc" ? b.value-a.value : filter.sort==="value_asc" ? a.value-b.value : b.ovr-a.ovr);
  list = list.slice(0, 60);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}>
      <div style={{ background:"#0d160d", border:"1px solid #223322", borderRadius:"16px 16px 0 0", width:"100%", maxWidth:760, maxHeight:"85vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid #1c2b1c" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Transfer Market</div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:12, color:"#9ab89a" }}>Budget: <b style={{color:"#7fd88f"}}>{fmtM(state.budget)}</b></div>
            <button onClick={onClose} aria-label="Close" style={{ background:"transparent", border:"none", color:"#9ab89a" }}><X size={18}/></button>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, padding:"10px 18px", borderBottom:"1px solid #1c2b1c", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"#111a11", border:"1px solid #2a3a2a", borderRadius:7, padding:"5px 10px", flex:1, minWidth:160 }}>
            <Search size={13} color="#6a8a6a"/>
            <input value={filter.q} onChange={e=>setFilter(f=>({...f,q:e.target.value}))} placeholder="Search player…"
              style={{ background:"transparent", border:"none", outline:"none", color:"#e8ede8", fontSize:13, width:"100%" }}/>
          </div>
          <select value={filter.pos} onChange={e=>setFilter(f=>({...f,pos:e.target.value}))}
            style={{ background:"#111a11", color:"#e8ede8", border:"1px solid #2a3a2a", borderRadius:7, padding:"5px 10px", fontSize:12 }}>
            <option value="ALL">All positions</option><option value="GK">GK</option><option value="DEF">DEF</option><option value="MID">MID</option><option value="FWD">FWD</option>
          </select>
          <select value={filter.sort} onChange={e=>setFilter(f=>({...f,sort:e.target.value}))}
            style={{ background:"#111a11", color:"#e8ede8", border:"1px solid #2a3a2a", borderRadius:7, padding:"5px 10px", fontSize:12 }}>
            <option value="value_desc">Value: High to Low</option><option value="value_asc">Value: Low to High</option><option value="ovr_desc">Rating: High to Low</option>
          </select>
        </div>
        <div style={{ overflowY:"auto", padding:"8px 18px 18px", display:"flex", flexDirection:"column", gap:6 }}>
          {list.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, background:"#111a11", border:"1px solid #1c2b1c", borderRadius:8, padding:"8px 12px", flexWrap:"wrap" }}>
              <div style={{ width:8,height:8,borderRadius:"50%", background:GROUP_COLOR[p.group], flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:120 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{p.name}</div>
                <div style={{ fontSize:10, color:"#6a8a6a" }}>{p.sellerClub.name}{p.sellerClub.tier==="championship" && " (Championship)"} · {p.role} · Age {p.age} · OVR {p.ovr}</div>
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:"#e8b84b", minWidth:60, textAlign:"right" }}>{fmtM(p.value)} · Condition {Math.round(p.condition??100)}%</div>
              <button onClick={()=>onLoanIn(p.sellerClub, p)} disabled={p.loan||state.budget<loanFee(p)} style={{ background:"transparent", border:"1px solid #2a3a2a", color:"#9ab89a", borderRadius:6, fontSize:10, padding:"6px 8px" }}>Loan {fmtM(loanFee(p))}</button>
              <button onClick={()=>onBuy(p.sellerClub, p)} disabled={p.loan||state.budget<p.value}
                style={{ display:"flex",alignItems:"center",gap:4, background: state.budget<p.value ? "#1c2b1c":"#2d6b3f", color: state.budget<p.value?"#5a7a5a":"#fff", border:"none", borderRadius:6, fontSize:11, fontWeight:700, padding:"6px 10px" }}>
                <ShoppingCart size={11}/> Buy
              </button>
            </div>
          ))}
          {list.length===0 && <div style={{ color:"#6a8a6a", fontSize:13, textAlign:"center", padding:20 }}>No players match your search.</div>}
        </div>
      </div>
    </div>
  );
}
