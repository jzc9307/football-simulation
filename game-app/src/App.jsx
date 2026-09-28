import { positionFit, positionFitLabel, formationProfile, tacticalHints, clamp, topXI, matchOvr, STYLES, styleMatchupBonus, inferStyle, aiTactics, roundRobin, initTable, computeTableArray, ovrLabel, fmtM, ord, autoLineup, lineupIssue, ensureFixtures, uclZoneLabel, freshState, unavailablePlayerIds, playerSeasonAverage, seasonPlayerRows, seasonBestXI, seasonLabel, LEAGUE_NAMES, findClubAnywhere } from "./game/engine.js";
import { createUclCampaign, selectUclField } from "./game/uclSelection.js";
import { createEuropaCampaign, selectEuropaField } from "./game/europaSelection.js";
import { createConferenceCampaign, selectConferenceField } from "./game/conferenceSelection.js";
import { attachSeasonSchedule, markMailRead, nextFixture, syncKnockoutSchedule, leagueCompetition, cupCompetitions, competitionForCup } from "./game/seasonSchedule.js";
import { prepareNextFixture, migrateSeason, simulateScheduledHalfAsync, enterMidSeasonWindow } from "./game/seasonFlow.js";
import { FixturesPanel, CupWorkspace, CalendarPanel, CupDetail, CalendarHub } from "./components/CompetitionCentre.jsx";
import { formatDate } from "./components/calendarFormat.js";
import { standingsZone, standingsLegend } from "./game/standingsZones.js";
import { playEuropeanLeague, advanceEuropeanLeague, startEuropeanKnockout, playLeagueRound, playDomesticCup, playEuropeanKnockout, advanceEuropeanKnockout } from "./game/actions.js";
import { ROLE_GROUP, GROUP_COLOR, FORMATIONS } from "./game/config.js";
import { marketOpen, loanFee, loanTerms, transfer, transferTerms, evaluateOffer, allClubs, listPlayerForSale, listPlayerForLoan, unlistPlayer, counterLoanOffer, recallLoan, loanRecallFine, loanEndDate, respondToSaleOffer, counterSaleOffer, saleTalkAllowed, startNextSeason } from "./game/career.js";
import { validateSave, exportGame } from "./game/storage.js";
import { createSaveRepository, indexedDBRecords } from "./game/browserStorage.js";
import { squadGroups, moveToSquadGroup } from "./game/squadSelection.js";
import { lockPageScroll } from "./components/pageScroll.js";
import { agreeTransferFee, approachFreeAgent, cancelMarketTalk, negotiatePlayerContract } from "./game/market.js";
import { FREE_AGENT_CLUB_ID, freeAgentClub } from "./game/freeAgents.js";
import { negotiateRenewal } from './game/playerLife.js';
import SquadHub from './components/SquadHub.jsx';
import ContractTalks from './components/ContractTalks.jsx';
import BudgetOverview from './components/BudgetOverview.jsx';
import PlayerLetter from './components/PlayerLetter.jsx';
import TeamSheets, { TeamSheetButtons } from './components/TeamSheets.jsx';
import { ensureTeamSheets, syncActiveTeamSheet, activateTeamSheet, saveTeamSheet, deleteTeamSheet } from './game/teamSheets.js';
import { availableBudget, reservedBudget, ensureClubFinance, financeSummary, pounds } from "./game/finance.js";
import { ClubInterest, ActiveTalks, SigningDecision } from "./components/MarketActivity.jsx";
import { POSITION_OPTIONS, matchesPosition, PERFORMANCE_COLUMNS, performanceStats, sortPerformancePlayers } from "./game/playerBrowse.js";
import LiveMatchScreen from "./components/LiveMatchScreen.jsx";
import { GUEST_CRESTS } from "./game/guestAssets.js";
import { CompetitionMark } from "./components/CompetitionBrand.jsx";
import { competitionBrand, competitionTheme } from "./components/competitionBrand.js";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftRight, ArrowUpRight, ArrowUp, ArrowDown, ChevronsUpDown, Search, X, RotateCcw, Trophy, ChevronLeft, Building2, SlidersHorizontal, Sparkles, HandCoins, CalendarDays, Mail, Gamepad2, FastForward, Star, FileSignature } from "lucide-react";
import "./workspaces.css";
import "./components/TransferRefinements.css";

export default function App(){
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saveError,setSaveError]=useState("");
  const [saveBlocked,setSaveBlocked]=useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [selectedCup, setSelectedCup] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const [tacticsOpen, setTacticsOpen] = useState(false);
  const [contractTalk,setContractTalk]=useState(null);
  const [budgetOpen,setBudgetOpen]=useState(false);
  const [playerHub,setPlayerHub]=useState(null);
  const [marketFilter, setMarketFilter] = useState({ q:"", pos:"ALL", league:"ALL", club:"ALL", sort:"ovr_desc", ageMin:16, ageMax:45, priceMin:0, priceMax:250 });
  const [toast, setToast] = useState("");
  const [halfSimulation, setHalfSimulation] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [hoverSlot, setHoverSlot] = useState(null);
  const dragMeta = useRef(null);
  const saveRepository=useRef(null);
  useEffect(()=>{
    if(!marketOpen&&!offersOpen&&!tacticsOpen&&!calendarOpen&&!mailOpen&&!selectedCup&&!halfSimulation&&!playerHub)return;
    return lockPageScroll(document);
  },[marketOpen,offersOpen,tacticsOpen,calendarOpen,mailOpen,selectedCup,halfSimulation,playerHub]);

  useEffect(() => {
    let active=true;
    saveRepository.current??=createSaveRepository({records:indexedDBRecords(window.indexedDB),legacy:window.localStorage});
    saveRepository.current.load().then(({state:saved,recovered})=>{
      if(!active)return;
      setState(saved.myClubId?ensureTeamSheets(ensureClubFinance(migrateSeason(saved))):saved);
      if(recovered)setToast("Recovered the last good save. Export a backup when convenient.");
    }).catch(error=>{
      if(!active)return;
      setState(freshState());setSaveError(error.message);setSaveBlocked(true);
    }).finally(()=>{if(active)setLoaded(true);});
    return()=>{active=false;};
  }, []);

  useEffect(() => {
    if (!loaded || !state || saveBlocked) return;
    let active=true;
    const persist=()=>{
      saveRepository.current.save(state).then(()=>{if(active)setSaveError("");})
        .catch(error=>{if(active)setSaveError(`Progress is not saved: ${error.message}. Export a backup.`);});
    };
    // Avoid a synchronous localStorage write for every drag, lineup edit, or filter change.
    const timer=window.setTimeout(persist,500);
    window.addEventListener("pagehide",persist,{once:true});
    return ()=>{active=false;window.clearTimeout(timer);window.removeEventListener("pagehide",persist);};
  }, [state,loaded,saveBlocked]);

  const flashToast=useCallback(msg=>{setToast(msg);},[]);
  async function submitContract({talkId,playerId,...offer}){
    try{
      const result=talkId?negotiatePlayerContract(state,{talkId,...offer}):negotiateRenewal(state,playerId,offer);
      setState(result.state);
      // Confirm personal terms only after the atomic career snapshot commits.
      // A rapid reload must not discard a confirmed signing or renewal.
      try{await saveRepository.current.save(result.state);setSaveError('');}
      catch(error){
        setSaveError(`Progress is not saved: ${error.message}. Export a backup.`);
        return {...result,message:`${result.message} Progress could not be saved. Export a backup before refreshing.`};
      }
      return result;
    }
    catch(error){return {status:'invalid',message:error.message};}
  }
  const dismissMarketNotice=()=>setState(s=>{const remaining=(s.marketNotices||[]).slice(1);return {...s,marketNotices:remaining,marketNotice:remaining[0]||null};});
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(""),3000);return()=>clearTimeout(timer);},[toast]);
  const movePlayerToSlot=useCallback((targetIdx,playerId,source,sourceSlotIdx)=>{
    setState(s=>{
      const lineup={...s.lineup},displaced=lineup[targetIdx];
      const originalSlot=source==="slot"&&sourceSlotIdx!=null?sourceSlotIdx:Object.keys(lineup).find(key=>lineup[key]===playerId);
      Object.keys(lineup).forEach(k=>{if(lineup[k]===playerId)delete lineup[k];});
      lineup[targetIdx]=playerId;
      if(originalSlot!=null&&displaced&&displaced!==playerId){
        lineup[originalSlot]=displaced;
      }
      return syncActiveTeamSheet(originalSlot==null&&displaced&&displaced!==playerId?moveToSquadGroup({...s,lineup},displaced,"bench"):{...s,lineup});
    });
  },[]);
  const setLineupSlot=useCallback((slotIdx,playerId)=>{
    setState(s=>{
      const lineup={...s.lineup};
      Object.keys(lineup).forEach(k=>{if(lineup[k]===playerId)delete lineup[k];});
      if(playerId)lineup[slotIdx]=playerId;else delete lineup[slotIdx];
      return syncActiveTeamSheet({...s,lineup});
    });
  },[]);
  const startPlayer=useCallback(playerId=>{
    setState(s=>{
      const club=s.clubs.find(c=>c.id===s.myClubId);
      const player=club?.players.find(p=>p.id===playerId);
      if(!club||!player||unavailablePlayerIds(s,s.stage==="ucl"?"ucl":"domestic").includes(playerId))return s;
      const slots=FORMATIONS[s.formation]||[];
      const lineup={...s.lineup};
      Object.keys(lineup).forEach(key=>{if(lineup[key]===playerId)delete lineup[key];});
      const target=slots.map((slot,index)=>({slot,index,current:club.players.find(p=>p.id===lineup[index]),fit:positionFit(slot.role,player)}))
        .filter(candidate=>candidate.fit>0)
        .sort((a,b)=>{
          if(b.fit!==a.fit)return b.fit-a.fit;
          if(Boolean(a.current)!==Boolean(b.current))return a.current?1:-1;
          const aScore=a.current?matchOvr(a.current)*positionFit(a.slot.role,a.current):0;
          const bScore=b.current?matchOvr(b.current)*positionFit(b.slot.role,b.current):0;
          return aScore-bScore;
        })[0];
      if(target)lineup[target.index]=playerId;
      return syncActiveTeamSheet(target?.current?moveToSquadGroup({...s,lineup},target.current.id,"bench"):{...s,lineup});
    });
  },[]);
  const benchPlayer=useCallback(playerId=>{
    setState(s=>syncActiveTeamSheet(moveToSquadGroup(s,playerId,"bench")));
  },[]);
  const availablePlayer=useCallback(playerId=>setState(s=>syncActiveTeamSheet(moveToSquadGroup(s,playerId,"available"))),[]);
  const swapStudioPlayer=useCallback((slotIndex,playerId)=>{
    setState(s=>{
      if(unavailablePlayerIds(s,s.stage==="ucl"?"ucl":"domestic").includes(playerId))return s;
      const lineup={...s.lineup};
      const source=Object.keys(lineup).find(key=>lineup[key]===playerId);
      const displaced=lineup[slotIndex];
      Object.keys(lineup).forEach(key=>{if(lineup[key]===playerId)delete lineup[key];});
      lineup[slotIndex]=playerId;
      if(source!==undefined&&Number(source)!==slotIndex&&displaced)lineup[source]=displaced;
      return syncActiveTeamSheet(source===undefined&&displaced?moveToSquadGroup({...s,lineup},displaced,"bench"):{...s,lineup});
    });
  },[]);
  const benchStudioSlot=useCallback(slotIndex=>{
    setState(s=>syncActiveTeamSheet(moveToSquadGroup(s,s.lineup[slotIndex],"bench")));
  },[]);
  const dragging=!!dragPos;

  function startDrag(e, player, meta){
    if(e.button!==0||unavailablePlayerIds(state,state.stage==="ucl"?"ucl":"domestic").includes(player.id))return;
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
        const fit=positionFit(slotRole,meta.player);
        if(fit<1)flashToast(`${meta.player.name} will play at ${Math.round(fit*100)}% in this role.`);
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
    const map = { PL: s=>s.plClubs, LALIGA: s=>s.laligaClubs, SERIEA: s=>s.serieaClubs, BUNDES: s=>s.bundesligaClubs, LIGUE1: s=>s.ligue1Clubs, PORTUGAL:s=>s.portugalClubs };
    setState(s => ({ ...s, league: lg, division:1, clubs: (map[lg]||map.PL)(s), stage: "select" }));
  }
  function selectClub(clubId){
    const club = state.clubs.find(c=>c.id===clubId);
    const identity=aiTactics(club);
    setState(s => {
      const selected={...s,myClubId:clubId,budget:club.budget,formation:club.preferredFormation||s.formation,lineup:autoLineup(FORMATIONS[club.preferredFormation||s.formation],club.players),tacticalStyle:identity.style,defensiveLine:identity.line,defensiveAggression:identity.aggression,offsideTrap:identity.trap,stage:"mode"};
      const withEurope=!selected.ucl?{...selected,ucl:createUclCampaign(selected,roundRobin,initTable),uel:createEuropaCampaign(selected,roundRobin,initTable),uecl:createConferenceCampaign(selected,roundRobin,initTable)}:selected;
      return attachSeasonSchedule(ensureFixtures(withEurope));
    });
  }
  function pickMode(mode){ setState(s => ensureTeamSheets({ ...s, simMode: mode, stage: "squad" })); }

  function activateSheet(id){setState(s=>activateTeamSheet(s,id));}
  function saveSheet(plan,name,id){
    try{const next=saveTeamSheet(state,plan,name,id);setState(next);return {};}
    catch(error){return {error:error.message};}
  }
  function deleteSheet(id){setState(s=>deleteTeamSheet(s,id));}

  function setFormation(f){
    setState(s => { const club = s.clubs.find(c=>c.id===s.myClubId),competition=s.stage==="ucl"?"ucl":"domestic"; return syncActiveTeamSheet({ ...s, formation:f, benchSelection:null, lineup: autoLineup(FORMATIONS[f], club.players.filter(p=>!unavailablePlayerIds(s,competition).includes(p.id))) }); });
  }
  function setTacticalStyle(key){ setState(s => syncActiveTeamSheet({ ...s, tacticalStyle: key })); }
  function setDefensiveLine(val){ setState(s => syncActiveTeamSheet({ ...s, defensiveLine: val })); }
  function setDefensiveAggression(val){ setState(s => syncActiveTeamSheet({ ...s, defensiveAggression: val })); }
  function setOffsideTrap(val){ setState(s => syncActiveTeamSheet({ ...s, offsideTrap: val })); }
  function editNumber(playerId, num){
    updateClub(state.myClubId, c => ({ ...c, players: c.players.map(p => p.id===playerId ? {...p, number:num} : p) }));
  }
  function doTransfer(action){
    try{setState(transfer(state,action));flashToast("Transfer completed");return true;}
    catch(error){flashToast(error.message);return false;}
  }
  function sellPlayer(playerId){
    try{if((state.saleListings||[]).includes(playerId)){setState(unlistPlayer(state,playerId));flashToast("Player unlisted. Pending offers removed.");return;}const next=listPlayerForSale(state,playerId);setState(next);flashToast(next.saleOffers?.some(o=>o.playerId===playerId)?"Player listed — review Received offers.":"Player listed. Staff are looking for a realistic buyer.");}
    catch(error){flashToast(error.message);}
  }
  function acceptSaleOffer(offerId){
    try{setState(respondToSaleOffer(state,offerId,"accept"));flashToast("Fee agreed. Personal talks take 1–3 days before the sale completes.");}
    catch(error){flashToast(error.message);}
  }
  function rejectSaleOffer(offerId){
    try{setState(respondToSaleOffer(state,offerId,"reject"));flashToast("Offer rejected.");return true;}
    catch(error){flashToast(error.message);return false;}
  }
  function negotiateSaleOffer(offerId,ask){
    try{
      const result=(state.saleOffers||[]).find(o=>o.id===offerId)?.kind==="loan"?counterLoanOffer(state,{offerId,seasons:ask}):counterSaleOffer(state,{offerId,ask});
      setState(result.state);
      flashToast(result.message);
      return result;
    }catch(error){
      flashToast(error.message);
      return {status:"error",message:error.message};
    }
  }
  function loanOut(playerId){try{if((state.loanListings||[]).includes(playerId)){setState(unlistPlayer(state,playerId));flashToast("Player unlisted for loan.");return;}setState(listPlayerForLoan(state,playerId));flashToast("Loan listed — review Received offers.");}catch(error){flashToast(error.message);}}
  function recallPlayer(playerId){try{setState(recallLoan(state,playerId));flashToast("Player recalled and available for selection.");return true;}catch(error){flashToast(error.message);return false;}}
  function buyPlayer(seller,player,fee){try{setState(agreeTransferFee(state,{sellerId:seller.id,playerId:player.id,fee}));flashToast("Fee agreed. Advance the calendar for the player decision.");return true;}catch(error){flashToast(error.message);return false;}}
  function approachAgent(player){try{const next=approachFreeAgent(state,player.id);setState(next);setContractTalk({talkId:next.market.talks.find(t=>t.playerId===player.id&&t.status==='pending').id});}catch(error){flashToast(error.message);}}
  function loanIn(seller,player){return doTransfer({type:"loan-in",sellerId:seller.id,playerId:player.id});}
  function toggleShortlist(playerId){
    setState(s=>{
      const current=s.shortlist||[];
      const shortlisted=current.includes(playerId);
      return {...s,shortlist:shortlisted?current.filter(id=>id!==playerId):[...current,playerId].slice(-150)};
    });
    const already=state.shortlist?.includes(playerId);
    flashToast(already?"Removed from shortlist":"Added to shortlist");
  }
  function commitGame(transform){
    try{setState(transform(state));}catch(error){flashToast(error.message);}
  }

  function nextSeason(){commitGame(s=>{const next=startNextSeason(s);return next.stage==="game-over"?next:ensureFixtures({...next,scheduleMigrationDone:true,ucl:createUclCampaign(next,roundRobin,initTable),uel:createEuropaCampaign(next,roundRobin,initTable),uecl:createConferenceCampaign(next,roundRobin,initTable)});});}
  function downloadSave(){
    const url=URL.createObjectURL(new Blob([exportGame(state)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="football-manager-save.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function importSave(event){
    const file=event.target.files?.[0];if(!file)return;
    try{const next=validateSave(JSON.parse(await file.text()));setState(next.myClubId?migrateSeason(next):next);setSaveBlocked(false);setSaveError("");flashToast("Save imported");}
    catch(error){flashToast(error.message);}event.target.value="";
  }

  function beginMatchday(half){
    if(halfSimulation)return;
    if(state.simMode!=="half"){
      commitGame(s=>prepareNextFixture({...s,midSeasonDone:half===2||s.midSeasonDone}));
      return;
    }
    setHalfSimulation({half,league:leagueCompetition(state.league,state.division)});
    window.requestAnimationFrame(()=>window.setTimeout(async()=>{
      try{
        const next=await simulateScheduledHalfAsync(state,half);
        // Commit the completed batch to durable storage before dismissing its
        // loading screen, so an immediate refresh doesn't lose the whole half.
        setState(next);
        try{await saveRepository.current.save(next);setSaveError("");}
        catch(error){setSaveError(`Progress is not saved: ${error.message}. Export a backup.`);}
      }
      catch(error){flashToast(error.message);}
      finally{setHalfSimulation(null);}
    },80));
  }
  function playRound(){commitGame(s=>playLeagueRound(s));}

  function playCupMatch(comp, round){commitGame(s=>playDomesticCup(s, comp, round));}

  function finishDomesticLive(){
    commitGame(s => ({ ...s, stage: s.stage==="matchday-live" ? "matchday-result" : s.stage==="cup-live" ? "cup-result" : s.stage }));
  }
  function continueAfterCup(){ commitGame(prepareNextFixture); }
  function nextMatch(){if(state.stage==='calendar-event'&&state.simMode==='half')beginMatchday(state.half||1);else commitGame(prepareNextFixture);}

  function goToMidWindow(){ commitGame(enterMidSeasonWindow); }
  function finalizeSeason(){ commitGame(s => ({ ...s, stage: "summary" })); }

  function uclGoToPrep(){commitGame(prepareNextFixture);}
  function uclPlayLeagueMatch(){commitGame(s=>playEuropeanLeague(s,"UCL"));}
  function uelPlayLeagueMatch(){commitGame(s=>playEuropeanLeague(s,"UEL"));}
  function ueclPlayLeagueMatch(){commitGame(s=>playEuropeanLeague(s,"UECL"));}
  function uclFinishLiveMatch(){
    commitGame(s => {
      const map = { "match-live":"match-result", "knockout-live":"knockout-result" };
      return { ...s, ucl: { ...s.ucl, stage: map[s.ucl.stage] || s.ucl.stage } };
    });
  }
  function uelFinishLiveMatch(){commitGame(s=>({...s,uel:{...s.uel,stage:s.uel.stage.replace('-live','-result')}}));}
  function ueclFinishLiveMatch(){commitGame(s=>({...s,uecl:{...s.uecl,stage:s.uecl.stage.replace('-live','-result')}}));}
  function uclContinueAfterMatch(){commitGame(s=>advanceEuropeanLeague(s,"UCL"));}
  function uelContinueAfterMatch(){commitGame(s=>advanceEuropeanLeague(s,"UEL"));}
  function ueclContinueAfterMatch(){commitGame(s=>advanceEuropeanLeague(s,"UECL"));}
  // Knockout Playoff, Round of 16, Quarter-Final and Semi-Final are all two-legged (aggregate score,
  // penalties if level after the second leg) — only the Final is a single match, same as the real competition.
  function uclContinueAfterPhaseSummary(){commitGame(startEuropeanKnockout);}
  function uclPlayKnockout(){commitGame(s=>playEuropeanKnockout(s));}

  function uclContinueAfterKnockout(){commitGame(s=>prepareNextFixture(syncKnockoutSchedule(advanceEuropeanKnockout(s))));}

  function uclBackToSeason(){commitGame(prepareNextFixture);}
  const uclActions = { uclGoToPrep, uclPlayLeagueMatch, uclFinishLiveMatch, uclContinueAfterMatch, uclContinueAfterPhaseSummary,
    uclPlayKnockout, uclContinueAfterKnockout, uclBackToSeason };
  const uelActions = { ...uclActions, uclContinueAfterPhaseSummary:()=>commitGame(s=>startEuropeanKnockout(s,"UEL")), uclPlayLeagueMatch:uelPlayLeagueMatch, uclFinishLiveMatch:uelFinishLiveMatch, uclContinueAfterMatch:uelContinueAfterMatch };
  const ueclActions = { ...uclActions, uclContinueAfterPhaseSummary:()=>commitGame(s=>startEuropeanKnockout(s,"UECL")), uclPlayLeagueMatch:ueclPlayLeagueMatch, uclFinishLiveMatch:ueclFinishLiveMatch, uclContinueAfterMatch:ueclContinueAfterMatch };

  const squadCommonProps = { state, myClub, onActivateSheet:activateSheet, onRenew:id=>setContractTalk({playerId:id}), onRecall:recallPlayer, onSetFormation: setFormation, onDragStart: startDrag, onStartPlayer:startPlayer, onBenchPlayer:benchPlayer, onAvailablePlayer:availablePlayer, onEditNumber: editNumber, onSell: sellPlayer, onAcceptSaleOffer:acceptSaleOffer, onRejectSaleOffer:rejectSaleOffer, onCounterSaleOffer:negotiateSaleOffer, onLoanOut: loanOut, onOpenMarket: ()=>setMarketOpen(true), onOpenCups: id=>setSelectedCup(id), onOpenCalendar: ()=>setCalendarOpen(true), onOpenMail: ()=>setMailOpen(true), onOpenOffers: ()=>setOffersOpen(true), onOpenTactics: ()=>setTacticsOpen(true), draggingPlayer: dragMeta.current?.player || null, hoverSlot, suspendedIds: state.suspensions?.[state.stage==="ucl"?"ucl":"domestic"] || [], injuries: state.injuries || {} };

  let stageEl = null;
  if (state.stage === "league-select") stageEl = <LeagueSelect onPick={pickLeague} />;
  else if (state.stage === "select") stageEl = <TeamSelect clubs={state.clubs} league={state.league} gameState={state} onSelect={selectClub} onBack={()=>setState(s=>({...s,league:null,division:1,clubs:s.plClubs,stage:"league-select"}))} />;
  else if (state.stage === "mode") stageEl = <ModeSelect onPick={pickMode} onBack={()=>setState(s=>({...s,myClubId:null,ucl:null,uel:null,uecl:null,roundsHalf1:null,roundsHalf2:null,tableRaw:null,fixtureResults:[],seasonSchedule:[],scheduleVersion:null,stage:"select"}))} />;
  else if (state.stage === "squad" && myClub) stageEl = <SquadScreen {...squadCommonProps}
    onSimulate={()=>beginMatchday(1)}
    simulateLabel="Start Season" />;
  else if (state.stage === "squad2" && myClub) stageEl = <SquadScreen {...squadCommonProps}
    onSimulate={()=>beginMatchday(2)}
    simulateLabel="Continue Season" />;
  else if(state.stage === "calendar-event" && myClub) stageEl=<><CalendarEventScreen state={state} myClub={myClub} onContinue={nextMatch}/><SquadScreen {...squadCommonProps} showSimulate={false}/></>;
  else if (state.stage === "matchday-prep" && myClub){
    const scheduled=nextFixture(state);
    const cupSlot=scheduled?.kind==="cup"?scheduled:null;
    if (cupSlot){
      const opponent=findClubAnywhere(state,cupSlot.homeId===state.myClubId?cupSlot.awayId:cupSlot.homeId);
      const oppForm=opponent.preferredFormation||"4-4-2";
      stageEl=<div><MatchdayPreview key={cupSlot.id} state={state} myClub={myClub} opponent={opponent} isHome={cupSlot.homeId===state.myClubId} oppForm={oppForm} myStyle={state.tacticalStyle} oppStyle={aiTactics(opponent).style} hints={tacticalHints(state.formation,oppForm)} onPlay={()=>playCupMatch(cupSlot.comp,cupSlot.round)} label={`${competitionBrand(cupSlot.competition).name} · ${cupSlot.round}`} subLabel={`${formatDate(cupSlot.date)} · ${cupSlot.neutral?"Neutral venue":cupSlot.homeId===state.myClubId?"Home":"Away"}`} competition={cupSlot.competition}/><SquadScreen {...squadCommonProps} showSimulate={false}/></div>;
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
    const competition=competitionForCup(state.league,r.comp);
    stageEl=<PostMatchSummary result={r} myClub={myClub} opponent={findClubAnywhere(state,r.opponentId)} competition={competition} onContinue={continueAfterCup} continueLabel="Continue calendar →"/>;
  }
  else if (state.stage === "matchday-result"){
    const isLast = state.roundIndex === (state.half===1?state.roundsHalf1:state.roundsHalf2).length-1;
    const r = state.lastResult;
    stageEl=<PostMatchSummary result={r} myClub={myClub} opponent={findClubAnywhere(state,r.opponentId)} competition={leagueCompetition(state.league,state.division)} onContinue={nextMatch} continueLabel={isLast ? (state.half===1?"View half-season table →":"View final table →") : "Continue calendar →"}/>;
  }
  else if (state.stage === "half-results") stageEl = <ResultsScreen title="First Half of the Season" results={state.results1} table={state.table1} clubs={state.clubs} myClubId={state.myClubId} onContinue={goToMidWindow} continueLabel="Go to Transfer Window →" cupStatus={state.cupStatus} league={state.league} division={state.division} ucl={state.ucl} uel={state.uel} uecl={state.uecl} onOpenCup={setSelectedCup} />;
  else if (state.stage === "full-results") stageEl = <ResultsScreen title="Final Season Results" results={state.results2} table={state.tableFinal} clubs={state.clubs} myClubId={state.myClubId} onContinue={finalizeSeason} continueLabel="Finalise Season →" projectedTable={state.table1} cupStatus={state.cupStatus} league={state.league} division={state.division} ucl={state.ucl} uel={state.uel} uecl={state.uecl} onOpenCup={setSelectedCup} />;
  else if (state.stage === "summary") stageEl = <SummaryScreen state={state} myClub={myClub} onNextSeason={nextSeason} onOpenCup={setSelectedCup} />;
  else if (state.stage === "game-over") stageEl = <div style={{maxWidth:620,margin:"54px auto",padding:36,textAlign:"center",border:"1px solid #703b3e",borderRadius:18,background:"linear-gradient(145deg,#251416,#100b0c)"}}><div style={{fontSize:34}}>⌁</div><h1 style={{margin:"10px 0",fontSize:30}}>Managerial contract ended</h1><p style={{color:"#d6a1a4",lineHeight:1.6}}>{state.movement||"Relegation from the second division"}. The board has dismissed you, ending this career.</p><p style={{color:"#879589",fontSize:12}}>Your save remains available to export from this screen.</p></div>;
  else if (state.stage === "ucl" && ({UCL:state.ucl,UEL:state.uel,UECL:state.uecl}[state.activeEuropeanCompetition||"UCL"])) stageEl = <UclPage state={state} myClub={myClub} squadCommonProps={squadCommonProps} actions={state.activeEuropeanCompetition==="UEL"?uelActions:state.activeEuropeanCompetition==="UECL"?ueclActions:uclActions} competition={state.activeEuropeanCompetition||"UCL"}/>;

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
        .fixture-browser,.cup-workspace,.calendar-panel,.mail-panel{background:#0c150e;border:1px solid #294432;border-radius:18px;overflow:hidden;animation:surfaceIn .28s ease both}.fixture-browser>header,.cup-workspace>header,.calendar-panel>header,.mail-panel>header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;background:linear-gradient(105deg,var(--competition-dark,#132513),var(--competition-panel,#1c3a2a));border-bottom:1px solid color-mix(in srgb,var(--competition-accent,#7fd88f) 28%,transparent)}.fixture-browser header span,.cup-workspace header span,.calendar-panel header span,.mail-panel header span{display:block;color:var(--competition-accent,#8ee0a0);font-size:10px;letter-spacing:.15em;font-weight:800}.fixture-browser header strong,.cup-workspace header strong,.calendar-panel header strong,.mail-panel header strong{display:block;font-size:21px}.fixture-browser header small,.cup-workspace header small{color:#a9b9ac;font-size:12px}.fixture-week-switch{display:flex;align-items:center;justify-content:center;gap:20px;padding:14px;border-bottom:1px solid #213126}.fixture-week-switch button,.calendar-controls button{width:34px;height:34px;border:1px solid #334a3a;border-radius:11px;background:#142018;color:#e8ede8;font-size:22px}.fixture-week-switch button:disabled,.calendar-controls button:disabled{opacity:.35}.fixture-week-switch div{text-align:center;min-width:160px}.fixture-week-switch small{display:block;color:#7f9b84;font-size:10px;letter-spacing:.15em}.fixture-week-switch strong{font-size:18px}.fixture-week-switch i{font-style:normal;color:#78917c}.fixture-week-switch span{display:block;color:#98a999;font-size:11px}.fixture-list{padding:8px 12px 14px}.season-fixture-row{display:grid;grid-template-columns:1fr 90px 1fr;gap:10px;align-items:center;min-height:52px;padding:8px 10px;border-bottom:1px solid #1b2b20;border-radius:10px}.season-fixture-row.is-my-fixture{background:linear-gradient(90deg,#174128,#132719);box-shadow:inset 3px 0 var(--competition-accent,#7fd88f)}.fixture-club{display:flex;align-items:center;gap:8px;min-width:0}.fixture-home{justify-content:flex-end;text-align:right}.fixture-club strong{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fixture-score{text-align:center}.fixture-score b{font-size:14px}.fixture-score i{font-style:normal;color:#839487}.fixture-score small{font-size:10px;color:#91a292}.cup-workspace{margin-top:2px}.cup-workspace header button{background:#1b5230;border:1px solid #56a870;color:#fff;border-radius:10px;padding:9px 12px;font-weight:700}.cup-workspace-grid,.cup-modal-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;padding:16px}.cup-workspace-card,.cup-modal-card{min-height:150px;padding:15px;border:1px solid color-mix(in srgb,var(--competition-accent) 32%,#26402c);border-radius:14px;background:linear-gradient(145deg,var(--competition-dark),#101713);text-align:left;color:#eff4ef;transition:transform .2s ease,filter .2s ease}.cup-workspace-card:hover,.cup-modal-card:hover{transform:translateY(-3px);filter:brightness(1.12)}.cup-workspace-card>div{display:flex;align-items:center;gap:8px}.cup-workspace-card>div span,.cup-modal-card>span{font-size:9px;letter-spacing:.13em;color:var(--competition-accent);font-weight:800}.cup-workspace-card>strong,.cup-modal-card>strong{display:block;margin-top:15px;font-size:17px}.cup-workspace-card>small,.cup-modal-card>small{display:block;color:#c1cdc3;font-size:11px;margin-top:5px}.cup-workspace-card footer{display:flex;justify-content:space-between;margin-top:18px;font-size:10px;color:#b3c4b6}.cup-workspace-card footer b{color:var(--competition-accent)}.cup-modal-card{min-height:170px}.cup-modal-card b{display:block;margin-top:16px;color:var(--competition-accent);font-size:11px}.is-ended{filter:saturate(.2);opacity:.62}.cup-detail{margin:0 16px 16px;border:1px solid color-mix(in srgb,var(--competition-accent) 35%,#294432);border-radius:14px;overflow:hidden;background:#0d160f}.cup-detail header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:linear-gradient(110deg,var(--competition-dark),var(--competition-panel))}.cup-detail header>div{display:flex;align-items:center;gap:8px}.cup-detail header span{font-size:9px;letter-spacing:.12em;color:var(--competition-accent);font-weight:800}.cup-detail header strong{font-size:14px}.cup-detail header button{background:transparent;border:0;color:#edf5ef}.cup-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#294432}.cup-detail-grid>div{background:#0e1710;padding:12px}.cup-detail-grid small{color:var(--competition-accent);font-size:9px;font-weight:800;letter-spacing:.11em}.cup-detail-grid>div>strong{display:block;font-size:12px;margin:6px 0}.cup-detail-grid p{display:flex;justify-content:space-between;gap:8px;color:#9daf9f;font-size:10px;margin:7px 0}.cup-detail-grid p b{color:#dce8de}.calendar-panel{background:#0d160f}.calendar-controls{display:flex;gap:6px;align-items:center}.calendar-controls button:nth-child(2){width:auto;padding:0 10px;font-size:11px}.calendar-events{padding:12px}.calendar-event{display:grid;grid-template-columns:44px 32px 1fr 32px auto;gap:10px;align-items:center;padding:10px;border-bottom:1px solid #203021;background:linear-gradient(90deg,color-mix(in srgb,var(--competition-panel) 30%,#0d160f),#0d160f)}.calendar-event time{text-align:center;border-right:1px solid #364538}.calendar-event time b{display:block;font-size:17px}.calendar-event time span{display:block;color:#8fa092;font-size:9px;text-transform:uppercase}.calendar-event strong{display:block;font-size:12px}.calendar-event small{display:block;color:#95a698;font-size:10px}.calendar-status{font-size:9px;color:var(--competition-accent);font-weight:800;text-transform:uppercase}.calendar-empty,.mail-empty{padding:30px;text-align:center;color:#8a9c8d;font-size:12px}.mail-panel header{background:linear-gradient(105deg,#14231a,#1a3522)}.mail-panel header b{background:#315e3c;color:#dfffe5;padding:5px 8px;border-radius:8px;font-size:10px}.mail-panel article,.mail-click-list button{display:flex;gap:10px;width:100%;text-align:left;padding:12px 16px;border:0;border-bottom:1px solid #1d2d21;background:#0d160f;color:#dce8de}.mail-panel article.is-unread,.mail-click-list button.is-unread{background:#122a19}.mail-panel article i,.mail-click-list i{font-style:normal;color:#8be49b;font-weight:900}.mail-panel article strong,.mail-click-list strong{display:block;font-size:12px}.mail-panel article small,.mail-click-list small{display:block;color:#91a292;font-size:10px;margin-top:3px}.hub-overlay{position:fixed;inset:0;z-index:100;background:rgba(3,8,4,.74);display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(10px)}.hub-sheet{width:min(900px,100%);max-height:87vh;overflow:auto;background:#0b120d;border:1px solid #34503a;border-radius:22px 22px 0 0;box-shadow:0 -20px 70px rgba(0,0,0,.45);animation:sheetIn .3s cubic-bezier(.2,.9,.2,1)}.hub-sheet>header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #223223}.hub-sheet>header span{display:block;font-size:10px;letter-spacing:.14em;color:#88b992;font-weight:800}.hub-sheet>header strong{font-size:20px}.hub-sheet>header button{border:1px solid #344b38;background:#132016;border-radius:10px;color:#e7eee8;padding:7px}.mail-click-list button{cursor:pointer}.mail-click-list button:hover{background:#18341f}@media(max-width:650px){.cup-detail-grid{grid-template-columns:1fr}.calendar-event{grid-template-columns:38px 28px 1fr auto}.calendar-event>.club-badge{display:none}}@keyframes surfaceIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}@keyframes sheetIn{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
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
        <Header myClub={myClub} league={state.league} division={state.division} onRestart={restart} />
        <SaveToolbar state={state} saveBlocked={saveBlocked} saveError={saveError}
          onExport={downloadSave} onImport={importSave} />
        {myClub && !isLive && !["matchday-result","cup-result"].includes(state.stage) && !(state.stage==="ucl"&&["UEL","UECL"].includes(state.activeEuropeanCompetition)) && <SeasonStatus state={state} myClub={myClub} onOpenOffers={()=>setOffersOpen(true)} onOpenBudget={()=>setBudgetOpen(true)}/>}
        {state.development?.length>0 && state.stage==="squad" && <DevelopmentPanel changes={state.development} />}
        {state.market?.talks.filter(t=>t.status==='pending'&&t.buyerId===state.myClubId&&t.phase==='contract-ready').map(t=><div className="personal-terms-ready" key={t.id}><FileSignature size={19}/><span>{t.playerName} chose your club. Personal terms are ready.</span><button onClick={()=>setContractTalk({talkId:t.id})}>Open contract talks →</button></div>)}
        {stageEl}
      </div>

      {marketOpen && myClub && (
        <TransferMarket state={state} myClub={myClub} filter={marketFilter} setFilter={setMarketFilter}
          onClose={()=>setMarketOpen(false)} onBuy={buyPlayer} onFreeAgent={approachAgent} onLoanIn={loanIn} onToggleShortlist={toggleShortlist}
          onOpenOffers={()=>setOffersOpen(true)} onOpenContract={id=>setContractTalk({talkId:id})} onCancelTalk={id=>setState(s=>cancelMarketTalk(s,id))} />
      )}
      {selectedCup && myClub && <CupDetail state={state} competition={selectedCup} onClose={()=>setSelectedCup(null)}
        renderStandings={()=>{const campaign=selectedCup==="UEL"?state.uel:selectedCup==="UECL"?state.uecl:state.ucl;return campaign?<UclTable table={computeTableArray(campaign.tableRaw,campaign.clubs)} myClubId={state.myClubId} competition={selectedCup}/>:null;}}
        renderBracket={()=>{const campaign=state[selectedCup.toLowerCase()];return campaign?.knockoutBracket?<UclBracket bracket={campaign.knockoutBracket} clubs={campaign.clubs} myClubId={state.myClubId}/>:null;}}/>}
      {calendarOpen && myClub && <CalendarHub state={state} onClose={()=>setCalendarOpen(false)} />}
      {mailOpen && myClub && <MailHub state={state} onClose={()=>setMailOpen(false)} onRead={id=>setState(s=>markMailRead(s,id))} onOpenTransfer={()=>{setMailOpen(false);setMarketOpen(true);}} onOpenOffers={()=>{setMailOpen(false);setOffersOpen(true);}} onOpenPlayer={id=>{setMailOpen(false);setPlayerHub(id);}} onRenew={id=>{setMailOpen(false);setContractTalk({playerId:id});}} />}
      {budgetOpen&&myClub&&<BudgetOverview state={state} onClose={()=>setBudgetOpen(false)}/>}
      {playerHub&&myClub&&<div className="hub-overlay" onClick={()=>setPlayerHub(null)}><section className="player-hub-sheet" role="dialog" aria-modal="true" aria-label="Player Squad Hub" onClick={e=>e.stopPropagation()}><header><div><span>PLAYER CARE</span><h2>Squad Hub</h2></div><button aria-label="Close player Squad Hub" onClick={()=>setPlayerHub(null)}><X size={20}/></button></header><SquadHub state={state} club={myClub} onSell={sellPlayer} onLoanOut={loanOut} focusId={playerHub} onRenew={id=>{setPlayerHub(null);setContractTalk({playerId:id});}} renderBadge={club=><ClubBadge club={club} size="md"/>}/></section></div>}
      {offersOpen && myClub && <TransferOffersHub state={state} myClub={myClub} onClose={()=>setOffersOpen(false)} onAccept={acceptSaleOffer} onReject={rejectSaleOffer} onCounter={negotiateSaleOffer}/>} 
      {halfSimulation ? <HalfSeasonLoading half={halfSimulation.half} league={halfSimulation.league}/> : null}
      {!halfSimulation&&!contractTalk&&(state.marketNotices?.[0]||state.marketNotice)&&<SigningDecision notice={state.marketNotices?.[0]||state.marketNotice} state={state} renderBadge={club=><ClubBadge club={club} size="md"/>} onClose={dismissMarketNotice} onContract={id=>{dismissMarketNotice();setContractTalk({talkId:id});}}/>}
      {contractTalk&&myClub&&<ContractTalks key={contractTalk.talkId||contractTalk.playerId} state={state} {...contractTalk} onSubmit={submitContract} onClose={()=>setContractTalk(null)} onEnd={id=>{if(id)setState(s=>cancelMarketTalk(s,id));}} renderBadge={club=><ClubBadge club={club} size="md"/>}/>}
      {tacticsOpen && myClub && (
        <StudioCommandOverlay state={state} myClub={myClub} onClose={()=>setTacticsOpen(false)} onSaveSheet={saveSheet} onActivateSheet={activateSheet} onDeleteSheet={deleteSheet} onSetFormation={setFormation} onSetStyle={setTacticalStyle} onSetLine={setDefensiveLine} onSetAggression={setDefensiveAggression} onSetTrap={setOffsideTrap} onSetPlan={plan=>setState(s=>syncActiveTeamSheet({...s,...plan}))} onDragStart={startDrag} onSwapPlayer={swapStudioPlayer} onBenchSlot={benchStudioSlot} onStartPlayer={startPlayer} onBenchPlayer={benchPlayer} onAvailablePlayer={availablePlayer} draggingPlayer={dragMeta.current?.player} hoverSlot={hoverSlot} />
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
function SeasonStatus({ state, myClub, onOpenOffers, onOpenBudget }){
  const condition=Math.round(myClub.players.reduce((sum,p)=>sum+(p.condition??100),0)/Math.max(1,myClub.players.length));
  const energy=Math.round(myClub.players.reduce((sum,p)=>sum+(p.energy??100),0)/Math.max(1,myClub.players.length));
  const form=[...state.results1,...state.results2].slice(-5).map(r=>r.result);
  const finances=financeSummary(state);
  const conditionTone=condition>=90?"good":condition>=82?"okay":"low";
  const competition=leagueCompetition(state.league,state.division);
  const brand=competitionBrand(competition);
  return (
    <section className="season-command-deck" aria-label="Season command deck" style={{"--season-accent":brand.color}}>
      <div className="season-command-identity">
        <CompetitionMark id={competition} size="sm"/>
        <div><span>{brand.name} · Season {state.season}</span><strong>{seasonLabel(state)}</strong></div>
      </div>
      <button className="season-command-metric season-budget-button" onClick={onOpenBudget} aria-label="Open Budget Overview"><span>Available budget <ArrowUpRight size={14}/></span><strong>{fmtM(availableBudget(state))}</strong><small>{reservedBudget(state)?`${fmtM(reservedBudget(state))} reserved`:`${pounds(finances.weekly)} / week payroll`} · Overview</small></button>
      <div className="season-command-fitness"><div><span>Squad readiness</span><strong>{condition}%</strong><small>Energy {energy}%</small></div><div className="condition-track"><span className={`condition-fill ${conditionTone}`} style={{width:`${condition}%`}}/></div></div>
      <div className="season-command-form"><span>League form</span><div className="form-row">{[0,1,2,3,4].map(i=>{const result=form[i];return <b key={i} className={`form-badge ${result?`form-${result.toLowerCase()}`:"form-empty"}`}>{result||"–"}</b>;})}</div><small>Last five matches</small>{(state.saleOffers||[]).some(o=>o.status==="pending"&&saleTalkAllowed(state,o))&&<button className="status-received-offers" aria-label="Received offers" title="Review received transfer and loan offers" onClick={onOpenOffers}><HandCoins size={16}/><b>Received offers</b><em>{state.saleOffers.filter(o=>o.status==="pending").length}</em><span>→</span></button>}</div>
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
  const [imageFailed,setImageFailed]=useState(false);
  const initials=club?.name?club.name.split(" ").map(word=>word[0]).slice(0,2).join(""):"?";
  const logo=club&&(GUEST_CRESTS[club.id]||CLUB_LOGOS[`./assets/club-logos/${club.id}.png`]||club.crestUrl);
  return <span className={`club-crest club-crest-${size} ${logo&&!imageFailed?"club-crest-real":""} ${className}`} style={{"--club-color":club?.color||"#3a5a3a"}} title={club?.name}>
    {logo&&!imageFailed?<img src={logo} alt="" draggable="false" onError={()=>setImageFailed(true)}/>:<b>{initials}</b>}
  </span>;
}
function Header({ myClub, onRestart }){
  const label = "FOOTBALL MANAGER";
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

function PostMatchSummary({result,myClub,opponent,competition,onContinue,continueLabel,statusText}){
  const brand=competitionBrand(competition),home=result.homeA??result.isHome,
    homeClub=home?myClub:opponent,awayClub=home?opponent:myClub,
    homeGoals=home?result.myGoals:result.oppGoals,awayGoals=home?result.oppGoals:result.myGoals,
    resultCode=result.result||(result.won?"W":"L");
  const status=statusText|| (result.won===true?(result.round==="Final"?"Champions":"Through to the next round"):result.won===false?(result.round==="Final"?"Runners-up":"Campaign ended"):(resultCode==="W"?"Three points secured":resultCode==="D"?"Points shared":"Defeat"));
  return <section className="post-match" style={competitionTheme(competition)}>
    <div className="post-match-brand"><CompetitionMark id={competition}/><span>{brand.name}</span><i>FULL TIME</i>{result.round&&<b>{result.round}</b>}{result.gw&&<b>MATCHWEEK {result.gw}</b>}</div>
    <div className="post-match-score">
      <div className="post-match-club home"><ClubBadge club={homeClub} size="xl"/><strong>{homeClub?.name||result.opponent}</strong></div>
      <div className="post-match-numbers"><small>{result.neutral?"NEUTRAL VENUE":home?"HOME":"AWAY"}</small><b>{homeGoals}<i>–</i>{awayGoals}</b><ResultBadge result={resultCode}/></div>
      <div className="post-match-club"><ClubBadge club={awayClub} size="xl"/><strong>{awayClub?.name||result.opponent}</strong></div>
    </div>
    {result.scorerStr&&<div className="post-match-events"><span>GOALS</span><p>{result.scorerStr}</p></div>}
    {result.wentToPens&&<div className="post-match-note">Decided on penalties · {result.shootout?.mine}–{result.shootout?.opp} · {result.wonPens?"you held your nerve":"the opponents progress"}</div>}
    <div className="post-match-foot"><div><strong>{status}</strong>{result.manOfTheMatch&&<span>★ {result.manOfTheMatch.name} · {result.manOfTheMatch.rating.toFixed(1)} MOTM</span>}</div><button onClick={onContinue}>{continueLabel}</button></div>
    {(result.redCard||(result.injuries?.length||0)>0)&&<div className="post-match-alerts">{result.redCard&&<span>🟥 {result.redCard.name} is suspended for the next domestic match</span>}{result.injuries?.map(injury=><span key={injury.playerId}>🩹 {injury.name} · {injury.severity} · {injury.matches} match{injury.matches===1?"":"es"}</span>)}</div>}
  </section>;
}

function HalfSeasonLoading({half,league}){
  const brand=competitionBrand(league);
  return <div className="half-sim-overlay" role="status" aria-live="polite">
    <section className="half-sim-card" style={competitionTheme(league)}>
      <div className="half-sim-orbit"><CompetitionMark id={league}/><i/><b/><em/></div>
      <span>{brand.name} · SEASON ENGINE</span>
      <h2>{half===1?"Building the first half":"Completing the run-in"}</h2>
      <p>Updating every scheduled fixture, cup draw, form line and player record.</p>
      <div className="half-sim-steps"><b>CALENDAR</b><i/><b>COMPETITIONS</b><i/><b>SEASON RECORDS</b></div>
    </section>
  </div>;
}

function LeagueSelect({ onPick }){
  const leagues=[
    {id:"PL",country:"England",clubs:"20 clubs",cups:"FA Cup · Carabao Cup",note:"A high-tempo calendar with a deep domestic cup run."},
    {id:"LALIGA",country:"Spain",clubs:"20 clubs",cups:"Copa del Rey",note:"Technical football, elite rivalries and European nights."},
    {id:"SERIEA",country:"Italy",clubs:"20 clubs",cups:"Coppa Italia",note:"A tactical title race with a demanding knockout path."},
    {id:"BUNDES",country:"Germany",clubs:"18 clubs",cups:"DFB-Pokal",note:"Fast transition football and a compact league season."},
    {id:"LIGUE1",country:"France",clubs:"18 clubs",cups:"Coupe de France",note:"A modern, athletic league with cup pressure built in."},
    {id:"PORTUGAL",country:"Portugal",clubs:"18 clubs",cups:"European qualification",note:"A technical league with three historic powers and a fierce race for Europe."},
  ];
  return (
    <section className="league-launchpad">
      <header className="league-launchpad-heading">
        <span>CAREER SETUP · 2026/27</span>
        <h2>Choose your league</h2>
        <p>Every competition has its own identity, calendar and cup route. Pick the country where your story begins.</p>
      </header>
      <div className="league-choice-grid">
        {leagues.map((league,index)=><button key={league.id} className="league-choice" style={{...competitionTheme(league.id),"--choice-delay":`${index*55}ms`}} onClick={()=>onPick(league.id)}>
          <span className="league-choice-glow"/>
          <span className="league-choice-watermark"><CompetitionMark id={league.id} size="xl"/></span>
          <span className="league-choice-top"><CompetitionMark id={league.id} size="md"/><i>{league.country.toUpperCase()}</i></span>
          <strong>{competitionBrand(league.id).name}</strong>
          <small>{league.clubs} · {league.cups}</small>
          <p>{league.note}</p>
          <b>Explore clubs <em>→</em></b>
        </button>)}
      </div>
    </section>
  );
}
function TeamSelect({ clubs, league, gameState, onSelect, onBack }){
  const LEAGUE_NAMES = { LALIGA:"La Liga", SERIEA:"Serie A", BUNDES:"Bundesliga", LIGUE1:"Ligue 1", PORTUGAL:"Liga Portugal" };
  const leagueName = LEAGUE_NAMES[league] || "Premier League";
  const [preview,setPreview]=useState(null);
  const champions=new Set(selectUclField(gameState).map(club=>club.id));
  const europa=new Set(selectEuropaField(gameState).map(club=>club.id));
  const conference=new Set(selectConferenceField(gameState).map(club=>club.id));
  const competitions=preview?[...cupCompetitions(league),...(champions.has(preview.id)?["UCL"]:[]),...(europa.has(preview.id)?["UEL"]:[]),...(conference.has(preview.id)?["UECL"]:[])]:[];
  return (
    <section className="club-choice-page">
      <header className="club-choice-heading"><button className="club-choice-back" onClick={onBack}>← All leagues</button><CompetitionMark id={league} size="lg"/><div><span>MANAGER APPOINTMENT</span><h2>{leagueName} clubs</h2><p>Open a club dossier to see its funds and first-season competition commitments.</p></div></header>
      <div className="club-choice-grid">
        {clubs.map(c => (
          <button key={c.id} onClick={()=>setPreview(c)} className="club-choice-card" style={{"--club-choice-color":c.color||"#4c8b61"}}>
            <ClubBadge club={c} size="md"/>
            <strong>{c.name}</strong>
            <small>{fmtM(c.budget)} budget · {c.players.length} players</small>
          </button>
        ))}
      </div>
      {preview&&<div className="club-confirm-overlay" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setPreview(null);}}>
        <section className="club-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="club-confirm-title" style={{"--club-choice-color":preview.color||"#4c8b61"}}>
          <button className="club-confirm-close" onClick={()=>setPreview(null)} aria-label="Close club dossier"><X size={18}/></button>
          <div className="club-confirm-watermark"><ClubBadge club={preview} size="xl"/></div>
          <div className="club-confirm-kicker">CLUB DOSSIER · {leagueName.toUpperCase()}</div>
          <div className="club-confirm-identity"><ClubBadge club={preview} size="xl"/><div><h2 id="club-confirm-title">{preview.name}</h2><span>Ready to appoint you for 2026/27</span></div></div>
          <div className="club-confirm-stats"><div><span>TRANSFER BUDGET</span><strong>{fmtM(preview.budget)}</strong></div><div><span>FIRST-TEAM SQUAD</span><strong>{preview.players.length} players</strong></div></div>
          <div className="club-confirm-competitions"><span>COMPETITIONS ENTERED</span><div>{competitions.map(id=><b key={id} className="club-confirm-competition-mark" title={competitionBrand(id).name}><CompetitionMark id={id} size="sm"/><i>{competitionBrand(id).name}</i></b>)}</div></div>
          <footer><button onClick={()=>setPreview(null)} className="quiet-button">Keep browsing</button><button className="club-confirm-continue" onClick={()=>onSelect(preview.id)}>Take the job <b>→</b></button></footer>
        </section>
      </div>}
    </section>
  );
}

function ModeSelect({ onPick, onBack }){
  return (
    <section className="mode-choice-page">
      <button className="mode-back" onClick={onBack}>← Back to clubs</button>
      <header><span>SEASON FORMAT</span><h2>How do you want to play?</h2><p>You can still manage the squad, transfers and every competition either way.</p></header>
      <div className="mode-choice-grid">
        <button onClick={()=>onPick("match")} className="mode-choice-card mode-choice-match">
          <div className="mode-choice-symbol" aria-hidden="true"><Gamepad2 size={25} strokeWidth={2.4}/></div>
          <div><strong>Match by Match</strong><p>Review every next fixture, set your XI and play European nights in the right order.</p></div>
          <b>Manager control <em>→</em></b>
        </button>
        <button onClick={()=>onPick("half")} className="mode-choice-card mode-choice-half">
          <div className="mode-choice-symbol" aria-hidden="true"><FastForward size={26} strokeWidth={2.5}/></div>
          <div><strong>Instant Half-Season</strong><p>Fast-forward to a richer mid-season review with league, domestic cup and Europe all updated.</p></div>
          <b>Fast track <em>→</em></b>
        </button>
      </div>
    </section>
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
      <span className="prematch-role">{slot.role}</span><strong title={player?.name}>{player?pitchPlayerName(player.name):"Vacant"}</strong>
      <div className="prematch-energy" title={`Energy ${energy}%`}><i style={{width:`${energy}%`}}/><small>{energy}%</small></div>
      <span className={`prematch-fitness ${fitness>=90?"good":fitness>=75?"mid":"low"}`} title={`Sharpness ${fitness}%`}><FitnessGem condition={fitness}/>{fitness}%</span>
      <b className="prematch-rating">{player?Math.round(matchOvr(player)):"—"}</b>
    </div>;})}</div>
  </section>;
}
function FormationBoard({club,formation,style,players,caption}){
  const slots=FORMATIONS[formation]||FORMATIONS["4-3-3"];
  return <section className="prematch-formation-board" style={{"--team-color":club.color||"#4d9d62"}}>
    <header><ClubBadge club={club} size="sm"/><div><span>{caption}</span><strong>{club.name}</strong><small>{formation} · {STYLES[style]?.name||"Balanced"}</small></div></header>
    <div className="prematch-formation-pitch"><div className="prematch-formation-lines"/>{slots.map((slot,i)=>{const player=players[i];const energy=clamp(Math.round(player?.energy??100),0,100);return <div key={i} className="prematch-formation-slot" style={{left:`${slot.x}%`,top:`${slot.y}%`,"--role-color":GROUP_COLOR[ROLE_GROUP[slot.role]]}}>
      <div className="prematch-formation-card"><div><b>{player?Math.round(matchOvr(player)):"—"}</b><span>{slot.role}</span></div><strong title={player?.name}>{player?pitchPlayerName(player.name):"Vacant"}</strong><div className="prematch-formation-vitals"><FitnessGem condition={player?.condition}/><i><span style={{width:`${energy}%`}}/></i><small>{energy}%</small></div></div>
    </div>;})}</div>
    <footer><span><FitnessGem condition={100}/> Sharpness</span><span><i/> Energy</span></footer>
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
      <footer className="prematch-footer"><span>{view==="sheets"?"Energy and sharpness are shown for both starting elevens.":"Both formations are shown with current match OVR and energy."}</span><button onClick={onContinue}>Continue to match <b>→</b></button></footer>
    </div>
  </div>,document.body);
}
function MatchdayPreview({state,myClub,opponent,isHome,oppForm,myStyle,oppStyle,hints,onPlay,label,subLabel,myForm,oppRecent,competition,betweenFixtures=false,fixtureDate}){
  const [showOppXI,setShowOppXI]=useState(false);
  const [showLineups,setShowLineups]=useState(false);
  // Preview branding follows the scheduled fixture, never a previous European
  // match kept in state. Otherwise a domestic match immediately after Europa
  // night can inherit the amber Europa skin and form table.
  const isEuropean=["UCL","UEL","UECL"].includes(competition||"");
  const campaignKey=competition==="UEL"?"uel":competition==="UECL"?"uecl":"ucl";
  const gameweek=(state.half===1?0:(state.roundsHalf1?.length||0))+state.roundIndex+1;
  const fixtureLabel=label||(state.stage==="matchday-prep"?`LEAGUE MATCHDAY ${gameweek} / ${(state.roundsHalf1?.length||0)+(state.roundsHalf2?.length||0)}`:"NEXT FIXTURE");
  const selectedFormation=myForm||state.formation;
  const oppXI=topXI(opponent.players,oppForm);
  const oppPower=Math.round(oppXI.reduce((total,p)=>total+matchOvr(p),0)/Math.max(1,oppXI.length));
  const myXI=(FORMATIONS[selectedFormation]||FORMATIONS["4-3-3"]).map((_,i)=>myClub.players.find(p=>p.id===state.lineup[i])).filter(Boolean);
  const myPower=Math.round(myXI.reduce((total,p)=>total+matchOvr(p),0)/Math.max(1,myXI.length));
  const danger=[...oppXI].sort((a,b)=>matchOvr(b)-matchOvr(a)).slice(0,3);
  const recent=isEuropean?(state[campaignKey]?.form?.[myClub.id]||[]):(state.clubForm?.[myClub.id]||[...(state.results1||[]),...(state.results2||[])]);
  const theirRecent=oppRecent||(isEuropean?state[campaignKey]?.form?.[opponent.id]:state.clubForm?.[opponent.id])||[];
  const issue=lineupIssue(state,isEuropean?"ucl":"domestic");
  const brandId=competition||state.league;
  const days=fixtureDate&&state.currentDate?Math.max(0,Math.round((Date.parse(`${fixtureDate}T12:00:00Z`)-Date.parse(`${state.currentDate}T12:00:00Z`))/86400000)):0;
  return <section className={`matchday-preview competition-theme ${betweenFixtures?"between-fixtures":""}`} style={competitionTheme(brandId)}>
    <div className="matchday-preview-top"><span className="matchday-competition"><CompetitionMark id={brandId} size="sm"/>{fixtureLabel}</span><span>{subLabel||(state.activeFixtureId?`${formatDate(state.currentDate)} · ${isHome?"Home":"Away"}`:null)||`${isHome?"HOME • YOUR STADIUM":"AWAY • OPPONENT STADIUM"}`}</span></div>
    <div className="career-date-bar"><CalendarDays size={16}/><span>CURRENT DATE <b>{formatDate(state.currentDate,{weekday:"long",day:"numeric",month:"long"})}</b></span><strong>{betweenFixtures?`Next match in ${days} day${days===1?"":"s"}`:"MATCHDAY"}</strong></div>
    <div className="matchday-preview-main">
      <div className="matchday-team"><ClubBadge club={isHome?myClub:opponent} size="xl"/><strong>{isHome?myClub.name:opponent.name}</strong>{!betweenFixtures&&<small>{isHome?selectedFormation:oppForm} · {STYLES[isHome?myStyle:oppStyle]?.name||"Balanced"}</small>}</div>
      <div className="matchday-centre"><span>NEXT FIXTURE</span><b>VS</b>{!betweenFixtures&&<><div className="matchday-power"><span>{isHome?myPower:oppPower} XI AVG</span><i/><span>{isHome?oppPower:myPower} XI AVG</span></div><small>Squad strength based on the selected elevens</small></>}</div>
      <div className="matchday-team"><ClubBadge club={isHome?opponent:myClub} size="xl"/><strong>{isHome?opponent.name:myClub.name}</strong>{!betweenFixtures&&<small>{isHome?oppForm:selectedFormation} · {STYLES[isHome?oppStyle:myStyle]?.name||"Balanced"}</small>}</div>
    </div>
    {!betweenFixtures&&<div className="matchday-scout">
      <div className="matchday-scout-block"><span>THEIR DANGER PLAYERS</span><div className="matchday-threats">{danger.map(p=><div key={p.id}><b>{Math.round(matchOvr(p))}</b><strong>{p.name}</strong><small>{p.role}</small></div>)}</div><button className="matchday-view-xi" onClick={()=>setShowOppXI(value=>!value)} aria-expanded={showOppXI}>{showOppXI?"Hide opponent XI":"View opponent XI"} <span>{showOppXI?"↑":"↓"}</span></button></div>
      <div className="matchday-scout-block"><span>TACTICAL READ</span><div className="matchday-hints">{hints.length?hints.map((hint,i)=><div key={i} style={{"--hint-color":hint.color}}>{hint.text}</div>):<div>Even tactical matchup — your XI and player form will decide it.</div>}</div></div>
      <div className="matchday-scout-block matchday-form-panel"><FormStrip results={recent} label="YOUR LAST FIVE"/><FormStrip results={theirRecent} label="THEIR LAST FIVE"/><small>{isEuropean?`${competitionBrand(brandId).name} matches`:"League matches"}</small></div>
    </div>
    }
    {showOppXI&&!betweenFixtures&&<div className="matchday-opponent-xi"><div className="matchday-xi-heading"><ClubBadge club={opponent} size="xs"/><strong>{opponent.name} starting XI</strong><span>{oppForm} · {STYLES[oppStyle]?.name||"Balanced"}</span></div><div className="matchday-xi-grid">{oppXI.map(player=><div key={player.id}><b>{matchOvr(player)}</b><strong>{player.name}</strong><small>{player.role}</small></div>)}</div></div>}
    <div className="matchday-preview-footer"><span role={betweenFixtures?"status":undefined}>{betweenFixtures?<><strong className="calendar-stop-reason">{state.transferNotice||"Your calendar is paused."}</strong>Review the update, then continue to the next event.</>:issue||"Check the lineup below, then review both starting XIs."}</span><button onClick={()=>betweenFixtures?onPlay():setShowLineups(true)} disabled={!betweenFixtures&&!!issue}>{betweenFixtures?"Continue simulate day":"View lineups"} <span>→</span></button></div>
    {showLineups&&<PreMatchLineups myClub={myClub} opponent={opponent} isHome={isHome} myFormation={selectedFormation} oppFormation={oppForm} myXI={myXI} oppXI={oppXI} myStyle={myStyle} oppStyle={oppStyle} brandId={brandId} label={fixtureLabel} onClose={()=>setShowLineups(false)} onContinue={()=>{setShowLineups(false);onPlay();}}/>}
  </section>;
}
function FormTrend({confidence}){
  if(!confidence)return null;
  return <span className={`form-trend ${confidence>0?"form-trend-up":"form-trend-down"}`} title={`${confidence>0?"+":""}${confidence} confidence to match OVR`} aria-label={`${confidence>0?"Up":"Down"} ${Math.abs(confidence)} from base rating`}><span aria-hidden="true">{confidence>0?"↑":"↓"}</span></span>;
}
function FitnessGem({condition}){
  const fitness=clamp(Math.round(condition??100),0,100);
  return <span className={`fitness-gem ${fitness>=90?"fitness-good":fitness>=75?"fitness-mid":"fitness-low"}`} title={`Sharpness ${fitness}%`} aria-label={`Sharpness ${fitness}%`}><i/></span>;
}
function EnergyBar({energy}){
  const remaining=clamp(Math.round(energy??100),0,100);
  return <div className={`player-readiness ${remaining<50?"readiness-low":remaining<75?"readiness-mid":""}`}
    role="progressbar" aria-label="Energy" aria-valuemin={0} aria-valuemax={100} aria-valuenow={remaining}>
    <span className="player-readiness-track"><i style={{width:`${remaining}%`}}/></span><b>{remaining}%</b>
  </div>;
}
function pitchPlayerName(name=""){
  const parts=name.trim().split(/\s+/).filter(Boolean);
  const familyParticle=parts.findIndex(part=>["da","de","del","di","dos","van","von"].includes(part.toLowerCase()));
  const surname=familyParticle>1?parts[familyParticle-1]:parts.at(-1);
  return parts.length>1 ? `${parts[0][0]}. ${surname}` : name;
}
function Pitch({ formation, lineup, players, onDragStart, draggingPlayer, hoverSlot, interactive=true, onSelectPlayer, selectedSlot }){
  const slots=FORMATIONS[formation];
  return <div className={`squad-pitch ${draggingPlayer?"is-dragging":""}`} data-bench="false" aria-label={`${formation} starting lineup`}>
    <div className="pitch-markings"><span/><i/></div>
    <div className="pitch-top-label">STARTING XI <b>{formation}</b></div>
    {slots.map((slot,i)=>{
      const player=players.find(p=>p.id===lineup[i]);
      const fit=draggingPlayer?positionFit(slot.role,draggingPlayer):0;
      const eligible=!!draggingPlayer;
      const active=hoverSlot===i&&!!draggingPlayer;
      return <div key={i} data-slot-index={i} data-slot-role={slot.role} role={onSelectPlayer?"button":undefined} tabIndex={onSelectPlayer?0:undefined} aria-label={player&&onSelectPlayer?`Change ${player.name} in the ${slot.role} position`:undefined} onClick={onSelectPlayer?()=>onSelectPlayer(i):undefined} onKeyDown={onSelectPlayer?event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();onSelectPlayer(i);}}:undefined}
        className={`pitch-position ${active?(fit>=.84?"drop-valid":"drop-risky"):""} ${eligible?"drop-eligible":""} ${selectedSlot===i?"is-selected":""} ${onSelectPlayer?"is-selectable":""}`}
        style={{left:`${slot.x}%`,top:`${slot.y}%`,"--role-color":GROUP_COLOR[ROLE_GROUP[slot.role]]}}>
        {player?<><div className="pitch-player-card" onPointerDown={interactive&&onDragStart?e=>onDragStart(e,player,{source:"slot",slotIndex:i}):undefined} title={`${player.name} · ${Math.round(matchOvr(player)*positionFit(slot.role,player))} match OVR (${player.ovr} base) · ${slot.role} · ${positionFitLabel(slot.role,player)}`}>
          <div className="pitch-card-top"><span className="pitch-card-ovr"><span className="ovr-value">{Math.round(matchOvr(player)*positionFit(slot.role,player))}</span><FormTrend confidence={player.confidence}/></span><span className={`pitch-card-role ${positionFit(slot.role,player)<1?"is-adapted":""}`}>{slot.role}</span></div>
          <div className="pitch-card-icon">{player.number}</div>
          <strong>{pitchPlayerName(player.name)}</strong><div className="pitch-card-vitals"><FitnessGem condition={player.condition}/><EnergyBar energy={player.energy}/></div>
        </div></>:<div className="pitch-empty-card"><b>+</b><span>{slot.role}</span></div>}
      </div>;
    })}
    <div className="pitch-bottom-label">{interactive?"DRAG A CARD TO CHANGE YOUR XI":"LIVE XI PREVIEW"}</div>
  </div>;
}

function SeasonInsights({ clubs, myClub, league="PL", compact=false }){
  const [competition,setCompetition]=useState("all");
  const [playerQuery,setPlayerQuery]=useState("");
  const [playerPosition,setPlayerPosition]=useState("ALL");
  const [playerSort,setPlayerSort]=useState({key:"appearances",direction:"desc"});
  const competitions=[{id:"all",name:"All competitions"},{id:"league",name:LEAGUE_NAMES[league]||"League"},
    ...(league==="PL"?[{id:"carabao",name:"Carabao Cup"},{id:"fa",name:"FA Cup"}]:[]),
    ...(league==="LALIGA"?[{id:"copa",name:"Copa del Rey"}]:[]),{id:"ucl",name:"Champions League"}];
  const selected=competitions.find(item=>item.id===competition)||competitions[0];
  const statsFor=player=>player?performanceStats(player,competition):{};
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
  const allClubPlayers=[...(myClub?.players||[])].sort((a,b)=>stat(b,"ratedMatches")-stat(a,"ratedMatches")||average(b)-average(a)||b.ovr-a.ovr);
  const clubPlayers=sortPerformancePlayers(allClubPlayers.filter(player=>matchesPosition(player,playerPosition)&&player.name.toLowerCase().includes(playerQuery.trim().toLowerCase())),playerSort,competition);
  const changeSort=key=>setPlayerSort(previous=>({key,direction:previous.key===key?(previous.direction==="asc"?"desc":"asc"):['name','role'].includes(key)?"asc":"desc"}));
  const olderSaveHasUnsplitMatches=!!myClub?.players.some(player=>(player.ratedMatches||0)>0&&!Object.keys(player.competitionStats||{}).length);
  const clubLeader=key=>[...allClubPlayers].sort((a,b)=>stat(b,key)-stat(a,key)||average(b)-average(a))[0];
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
        <div className="performance-toolbar">
          <div className="performance-player-search"><Search size={16}/><input aria-label="Search your squad" value={playerQuery} onChange={event=>setPlayerQuery(event.target.value)} placeholder="Search your squad"/></div>
          <label className="performance-control"><span>Position</span><select aria-label="Performance position" value={playerPosition} onChange={event=>setPlayerPosition(event.target.value)}><PositionOptions/></select></label>
          <label className="performance-control"><span>Sort by</span><select aria-label="Performance sort column" value={playerSort.key} onChange={event=>changeSort(event.target.value)}>{PERFORMANCE_COLUMNS.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
          <button className="performance-direction" onClick={()=>setPlayerSort(previous=>({...previous,direction:previous.direction==='asc'?'desc':'asc'}))} aria-label={`Sort ${playerSort.direction==='desc'?'ascending':'descending'}`}>{playerSort.direction==='desc'?<ArrowDown size={15}/>:<ArrowUp size={15}/>}<span>{['name','role'].includes(playerSort.key)?(playerSort.direction==='asc'?'A–Z':'Z–A'):(playerSort.direction==='desc'?'Highest first':'Lowest first')}</span></button>
          <span className="performance-shown">{clubPlayers.length} players</span>
        </div>
        <div className="club-player-table-wrap">
          <table className="club-player-table">
            <thead><tr>{PERFORMANCE_COLUMNS.map(([key,label])=><th key={key} aria-sort={playerSort.key===key?(playerSort.direction==='asc'?'ascending':'descending'):'none'}><button onClick={()=>changeSort(key)} aria-label={`Sort by ${label}`}>{label}{playerSort.key===key?(playerSort.direction==='asc'?<ArrowUp size={12}/>:<ArrowDown size={12}/>):<ChevronsUpDown size={11}/>}</button></th>)}</tr></thead>
            <tbody>{clubPlayers.map(player=><tr key={player.id}>
              <td><strong>{player.name}</strong><small>{player.confidence?`${player.confidence>0?"+":""}${player.confidence} confidence`:"Steady form"}</small></td><td title={(player.secondaryRoles||[]).join(' / ')}>{player.role}</td><td>{player.ovr}</td><td>{stat(player,"appearances")}</td><td>{stat(player,"goals")}</td><td>{stat(player,"assists")}</td><td>{stat(player,"cleanSheets")}</td><td>{stat(player,"yellowCards")}</td><td>{stat(player,"redCards")}</td><td className="table-rating">{stat(player,"ratedMatches")?average(player).toFixed(2):"—"}</td><td>{stat(player,"bestRating")?stat(player,"bestRating").toFixed(1):"—"}</td>
            </tr>)}{!clubPlayers.length&&<tr><td colSpan="11" className="performance-no-results">No players match these filters.</td></tr>}</tbody>
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
  const isUcl=["UCL","UEL","UECL"].includes(brandId);
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
  const european=state.stage==="ucl"?state.activeEuropeanCompetition||"UCL":null;
  const campaign=european?(european==="UEL"?state.uel:european==="UECL"?state.uecl:state.ucl):null;
  const clubs=campaign?.clubs||state.clubs;
  const brandId=european||leagueCompetition(state.league,state.division);
  const table=computeTableArray((campaign?.tableRaw||state.tableRaw)||initTable(clubs.map(club=>club.id)),clubs);
  return <CompetitionStandings table={table} myClubId={state.myClubId} brandId={brandId} title={campaign?`${competitionBrand(brandId).name} league phase table`:`${competitionBrand(brandId).name} table`} zone={!!campaign}/>;
}

function MailPanel({items,compact=false}){const list=items.slice(0,compact?3:20);return <section className={`mail-panel ${compact?"mail-compact":""}`}><header><div><span>CLUB CORRESPONDENCE</span><strong>Staff mail</strong></div><b>{items.filter(item=>!item.read).length} unread</b></header>{list.length?list.map(item=><article className={!item.read?"is-unread":""} key={item.id}><i>{item.type==="medical"?"+":item.type==="discipline"?"!":"•"}</i><div><strong>{item.subject}</strong><small>{item.body}</small></div></article>):<div className="mail-empty">No staff updates yet. Injuries, suspensions, fixtures and cup progress will appear here.</div>}</section>;}

function SquadPentagon({players,lineup}){
  const starters=Object.values(lineup).map(id=>players.find(player=>player.id===id)).filter(Boolean);
  const average=list=>list.length?list.reduce((total,player)=>total+matchOvr(player),0)/list.length:58;
  const metric=group=>Math.round(clamp(average(starters.filter(player=>player.group===group)),52,94));
  const ratings=[metric("FWD"),metric("MID"),Math.round((metric("DEF")+metric("GK"))/2),Math.round(clamp(average([...players].sort((a,b)=>matchOvr(b)-matchOvr(a)).slice(11,20)),52,94)),Math.round(clamp(average(starters.map(player=>({...player,ovr:(player.energy??100)*.48+(player.condition??100)*.52}))),52,94))];
  const labels=["Attack","Midfield","Defence","Depth","Readiness"];
  const point=(value,index,scale=1)=>{const angle=-Math.PI/2+index*(Math.PI*2/5);const radius=value/100*36*scale;return `${50+Math.cos(angle)*radius},${50+Math.sin(angle)*radius}`;};
  const polygon=scale=>ratings.map((_,index)=>point(100,index,scale)).join(" ");
  return <section className="studio-pentagon"><div className="studio-section-label">SQUAD PROFILE</div><svg viewBox="0 0 100 100" aria-label="Squad strength pentagon" role="img"><polygon points={polygon(1)} className="radar-grid"/><polygon points={polygon(.66)} className="radar-grid"/><polygon points={polygon(.33)} className="radar-grid"/>{ratings.map((_,index)=><line key={index} x1="50" y1="50" x2={point(100,index).split(",")[0]} y2={point(100,index).split(",")[1]} className="radar-axis"/>)}<polygon points={ratings.map((value,index)=>point(value,index)).join(" ")} className="radar-value"/>{ratings.map((value,index)=>{const coords=point(100,index,1.2).split(",");return <text key={labels[index]} x={coords[0]} y={Number(coords[1])+2} className="radar-label">{labels[index]} {value}</text>;})}</svg><div className="studio-profile-note"><b>{Math.round(average(starters)) || "—"}</b><span>XI AVG</span></div></section>;
}

const loanTermLabel=value=>value===.5?"Half-season":`${value} season${value===1?'':'s'}`;
function TransferNegotiation({player,otherClub,myClub,budget,round,message,demand,fee,onFee,onSubmit,onEnd,ended=false,selling=false,locked=false,loan=false,currentDate}){
  const minimum=Math.max(.1,Math.round(player.value*.5*10)/10);
  const maximum=Math.max(minimum+2,Math.round(Math.max(player.value*1.6,demand*1.4)*10)/10);
  const setFee=value=>onFee(Math.round(clamp(value,minimum,maximum)*10)/10);
  return <section className="negotiation-page">
    <div className="negotiation-room">
      <div className="negotiation-party"><ClubBadge club={otherClub} size="xl" className="party-badge"/><small>{loan?"BORROWING CLUB":selling?"BUYING CLUB":"SELLING CLUB"}</small><strong>{otherClub.name}</strong><div className="club-demand" key={round}><span>{round===1?(selling?"OPENING OFFER":"OPENING DEMAND"):"CLUB RESPONSE"}</span><b>{loan?loanTermLabel(demand):fmtM(demand)}</b><p aria-live="polite">{message}</p></div></div>
      <div className="negotiation-centre"><span>ROUND {round} OF 3</span><div className="deal-player-chip"><b>{player.ovr}</b><span><strong title={player.name}>{player.name}</strong><small>{player.role} · Age {player.age}</small></span></div><div className="negotiation-pulse"/><small className="negotiation-direction">{loan?"OUTGOING LOAN":selling?"OUTGOING TRANSFER":"INCOMING TRANSFER"}</small></div>
      <div className="negotiation-party user-party"><ClubBadge club={myClub} size="xl" className="party-badge"/><small>YOUR CLUB · {selling?"SELLER":"BUYER"}</small><strong>{myClub.name}</strong><p>Available budget: {fmtM(budget)}</p></div>
    </div>
    {loan?<div className="offer-console loan-console"><div><span>LOAN DURATION</span><strong>{loanTermLabel(fee)}</strong><small>Returns {formatDate(loanEndDate(currentDate,fee),{day:'numeric',month:'short',year:'numeric'})} · No transfer fee</small></div><div className="loan-term-options">{[.5,1,1.5,2,2.5,3].map(term=><button key={term} className={term===fee?'active':''} disabled={locked||ended} onClick={()=>onFee(term)}>{loanTermLabel(term)}</button>)}</div><p className="negotiation-staff"><Sparkles size={15}/> Staff: shorter loans preserve flexibility. Recall compensation: {fmtM(loanRecallFine(player))}.</p><button className="submit-offer" disabled={!ended&&locked} onClick={onSubmit}>{ended?"Return to received offers":locked?"Club is considering your proposal…":`Propose ${loanTermLabel(fee).toLowerCase()} →`}</button>{!ended&&<button className="negotiation-end" onClick={onEnd} disabled={locked}>End negotiations</button>}</div>:<div className="offer-console">
      <div><span>{selling?"YOUR ASKING PRICE":"TRANSFER FEE"}</span><strong>{fmtM(fee)}</strong><small>Market value {fmtM(player.value)} · {selling?"Current bid":"Club demand"} {fmtM(demand)}</small></div>
      {selling&&<p className="negotiation-staff"><Sparkles size={15}/> Staff recommendation: {fmtM(Math.round(player.value*(player.age>=32?.82:.95)*10)/10)}–{fmtM(Math.round(player.value*(player.age>=32?1:1.16)*10)/10)}</p>}
      <input aria-label={selling?"Sale asking price":"Transfer fee"} type="range" min={minimum} max={maximum} step=".1" value={fee} disabled={locked||ended} onChange={e=>setFee(Number(e.target.value))}/>
      <div className="offer-presets"><button disabled={locked||ended} onClick={()=>setFee(demand*.9)}>Firm</button><button disabled={locked||ended} onClick={()=>setFee(demand)}>{selling?"Match current bid":"Meet asking price"}</button><button disabled={locked||ended} onClick={()=>setFee(fee+(player.value<10?.5:5))}>+ {player.value<10?"£0.5m":"£5m"}</button></div>
      <button className="submit-offer" onClick={onSubmit} disabled={!ended&&(locked||(!selling&&fee>budget))}>{ended?(selling?"Return to received offers":"Return to player profile"):locked?"Club is considering your proposal…":`${selling?"Submit counter-offer":"Submit offer"} · ${fmtM(fee)}`}</button>
      {!ended&&<button className="negotiation-end" onClick={onEnd} disabled={locked}>End negotiations</button>}
    </div>}
  </section>;
}
function TransferOffersHub({state,myClub,onClose,onReject,onCounter}){
  const [selected,setSelected]=useState(null),[fee,setFee]=useState(0),[message,setMessage]=useState(""),[outcome,setOutcome]=useState(null),[thinking,setThinking]=useState(false);
  const timer=useRef(null);
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const back=()=>{clearTimeout(timer.current);setThinking(false);selected?setSelected(null):onClose();};
  const offers=(state.saleOffers||[]).filter(o=>o.status==="pending");
  const groupedOffers=[...new Set(offers.map(o=>o.playerId))].map(playerId=>({player:myClub.players.find(p=>p.id===playerId),offers:offers.filter(o=>o.playerId===playerId)})).filter(group=>group.player);
  const current=offers.find(o=>o.id===selected?.offer.id)||selected?.offer;
  const canTrade=marketOpen(state);
  const open=offer=>{
    const player=myClub.players.find(p=>p.id===offer.playerId),buyer=findClubAnywhere(state,offer.buyerId);
    if(!player||!buyer)return;
    setSelected({offer,player,buyer});setFee(offer.kind==='loan'?offer.seasons:offer.amount);setMessage(`${buyer.name} offered ${offer.kind==='loan'?loanTermLabel(offer.seasons):fmtM(offer.amount)} for ${player.name}.`);setOutcome(null);
  };
  const submit=()=>{
    if(outcome){setSelected(null);return;}
    setThinking(true);
    timer.current=setTimeout(()=>{
      const result=onCounter(current.id,fee);
      setThinking(false);setMessage(result?.message||"Unable to submit this proposal.");
      setSelected(previous=>previous?{...previous,offer:result?.state?.saleOffers?.find(o=>o.id===current.id)||current}:previous);
      if(["accepted","withdrawn"].includes(result?.status))setOutcome(result.status);
    },650);
  };
  const end=()=>{if(onReject(current.id)){setSelected(previous=>({...previous,offer:current}));setOutcome("withdrawn");setMessage("You ended talks. Your player remains listed and available.");}};
  return <div className="transfer-shell offers-centre" role="dialog" aria-modal="true" aria-label={selected?"Sale negotiation":"Received transfer offers"}>
    <div className="transfer-aurora transfer-aurora-one"/><div className="transfer-aurora transfer-aurora-two"/>
    <header className="transfer-header"><button className="transfer-back" onClick={back}><ChevronLeft size={18}/><span>{selected?"Received offers":"Close"}</span></button><div className="transfer-brand"><span>{selected?"TRANSFER NEGOTIATIONS":"OUTGOING TRANSFERS"}</span><strong>Transfer Centre</strong></div><div className="transfer-budget"><small>{canTrade?"WINDOW OPEN":"WINDOW CLOSED"}</small><strong>{fmtM(availableBudget(state))}</strong></div></header>
    <main className="transfer-stage" key={selected?"negotiation":"offers"}>
      {selected?<>{outcome==="accepted"?<section className="signed-page"><Sparkles size={32}/><span>{current.kind==='loan'?'LOAN AGREED':'CLUB FEE AGREED'}</span><h2>{selected.player.name}</h2><ClubBadge club={selected.buyer} size="xl"/><p>{current.kind==='loan'?`Joins ${selected.buyer.name} on loan`:`${selected.buyer.name} is negotiating personal terms. Player decision in 1–3 days; no fee paid yet.`}</p><strong>{current.kind==='loan'?loanTermLabel(fee):fmtM(fee)}</strong><button onClick={()=>setSelected(null)}>Return to received offers</button></section>:<TransferNegotiation player={selected.player} otherClub={selected.buyer} myClub={myClub} budget={state.budget} round={current.round||1} demand={current.kind==='loan'?current.seasons:current.amount} fee={fee} onFee={setFee} message={message} onSubmit={submit} onEnd={end} ended={!!outcome} locked={thinking||!saleTalkAllowed(state,current)} selling loan={current.kind==='loan'} currentDate={state.currentDate||`${2025+state.season}-08-01`}/>}</>:<section className="received-offers-page"><header><div><span>YOUR TRANSFER DESK</span><h1>Received offers <b>{offers.length}</b></h1><p>{groupedOffers.length} player{groupedOffers.length===1?'':'s'} · Compare club approaches below. Listed players stay available until the final transfer is confirmed.</p></div><HandCoins size={30}/></header><div className="received-offer-grid">{groupedOffers.map(({player,offers:playerOffers})=>{
        const listing=(state.saleListings||[]).includes(player.id)?'TRANSFER LISTED':(state.loanListings||[]).includes(player.id)?'LOAN LISTED':'UNSOLICITED APPROACH';
        return <article className="received-offer-card" key={player.id}><div className="received-player"><b>{player.ovr}<small>OVR</small></b><div><span>{listing} · {playerOffers.length} APPROACH{playerOffers.length===1?'':'ES'}</span><h2>{player.name}</h2><small>{player.role} · Age {player.age} · Market value {fmtM(player.value)}</small></div></div><div className="player-offer-stack">{playerOffers.map(offer=>{const buyer=findClubAnywhere(state,offer.buyerId);if(!buyer)return null;return <section className="player-club-offer" key={offer.id}><div className="received-buyer"><ClubBadge club={buyer} size="md"/><div><span>{offer.kind==='loan'?'LOAN APPROACH':'TRANSFER OFFER'}</span><strong>{buyer.name}</strong><small>{formatDate(offer.date)} · Round {offer.round||1}/3</small></div><b>{offer.kind==='loan'?loanTermLabel(offer.seasons):fmtM(offer.amount)}</b></div><footer><button className="negotiate-button" disabled={!saleTalkAllowed(state,offer)} onClick={()=>open(offer)}>Review &amp; negotiate →</button><button className="negotiation-end" disabled={!saleTalkAllowed(state,offer)} onClick={()=>onReject(offer.id)}>Decline</button></footer></section>;})}</div></article>;
      })}</div>{!offers.length&&<div className="mail-empty">No offers waiting. Further approaches can arrive when you advance the calendar.</div>}</section>}
    </main>
  </div>;
}
function CalendarEventScreen({state,myClub,onContinue}){
  const fixture=nextFixture(state),opponent=fixture&&findClubAnywhere(state,fixture.homeId===myClub.id?fixture.awayId:fixture.homeId);
  if(!fixture||!opponent)return <button className="submit-offer" onClick={onContinue}>Continue simulate day →</button>;
  return <MatchdayPreview state={state} myClub={myClub} opponent={opponent} isHome={fixture.homeId===myClub.id} oppForm={opponent.preferredFormation||"4-4-2"} myStyle={state.tacticalStyle} oppStyle={aiTactics(opponent).style} hints={[]} label={competitionBrand(fixture.competition).name} subLabel={formatDate(fixture.date,{weekday:"short",day:"numeric",month:"short"})} competition={fixture.competition} betweenFixtures onPlay={onContinue} fixtureDate={fixture.date}/>;
}
function LoanedOutPlayers({state,onRecall}){
  const [selected,setSelected]=useState(null);
  const loans=state.loans.filter(l=>l.ownerId===state.myClubId).map(loan=>{const club=findClubAnywhere(state,loan.borrowerId);return {loan,club,player:club?.players.find(p=>p.id===loan.playerId)};}).filter(item=>item.player);
  if(!loans.length)return null;
  return <section className="squad-category squad-category-loaned"><header><div><span>Loaned out</span><small>Developing away · returns automatically</small></div><b>{loans.length}</b></header>{loans.map(item=><div className="outgoing-loan-row" key={item.player.id}><b>{item.player.ovr}</b><div><strong>{item.player.name}</strong><small>{item.player.role} · <span>{item.club.name}</span> · Returns {item.loan.endsDate?formatDate(item.loan.endsDate):'at season end'}</small></div><button onClick={()=>setSelected(item)}>Recall</button></div>)}{selected&&<div className="loan-recall-overlay" onClick={()=>setSelected(null)}><section className="loan-recall-dialog" role="dialog" aria-modal="true" aria-label="Recall loan player" onClick={e=>e.stopPropagation()}><span>EARLY LOAN RECALL</span><h2>Bring {selected.player.name} back?</h2><p>Ending the loan early compensates {selected.club.name}. Your player will immediately be available for selection.</p><div className="recall-fine"><small>Recall fine · 5% of value, capped at £2m</small><strong>{fmtM(loanRecallFine(selected.player))}</strong><small>Budget after recall: {fmtM(state.budget-loanRecallFine(selected.player))}</small></div><footer><button onClick={()=>setSelected(null)}>Keep on loan</button><button className="negotiate-button" disabled={state.budget<loanRecallFine(selected.player)} onClick={()=>{if(onRecall?.(selected.player.id))setSelected(null);}}>Pay fine &amp; recall →</button></footer></section></div>}</section>;
}
function SquadMoveControls({player,category,unavailable,onStart,onBench,onAvailable}){
  return <div className="squad-move-controls" role="group" aria-label={`Move ${player.name}`}>
    {category!=="starting"&&<button className="move-start" disabled={unavailable} onClick={()=>onStart(player.id)} aria-label={`Start ${player.name}`} title="Replace the lowest-rated starter in the best-fitting position">↑ Start</button>}
    {category!=="bench"&&<button className="move-bench" disabled={unavailable} onClick={()=>onBench(player.id)} aria-label={`Move ${player.name} to bench`} title="Add to the nine-player bench; if full, replace its weakest same-unit backup">{category==="starting"?"↓":"↑"} Bench</button>}
    {category!=="available"&&<button className="move-available" onClick={()=>onAvailable(player.id)} aria-label={`Move ${player.name} to available`} title="Rest this player outside the matchday squad">↓ Available</button>}
  </div>;
}
function SquadScreen({ state, myClub, onRenew, onActivateSheet, onDragStart, onStartPlayer, onBenchPlayer, onAvailablePlayer, onEditNumber, onSell, onLoanOut, onRecall, onOpenMarket, onOpenCups, onOpenCalendar, onOpenMail, onOpenTactics, onSimulate, simulateLabel, draggingPlayer, hoverSlot, showMarketBar=true, showSimulate=true, suspendedIds, injuries={} }){
  const [workspaceTab,setWorkspaceTab]=useState("squad");
  const listRef=useRef(null);
  useEffect(()=>{
    if(workspaceTab!=="mail")return;
    onOpenMail?.();
    setWorkspaceTab("squad");
  },[workspaceTab,onOpenMail]);
  const suspendedSet = new Set(suspendedIds || []);
  const usedIds = new Set(Object.values(state.lineup).filter(Boolean));
  const unavailableSet = new Set([...suspendedSet,...Object.keys(injuries)]);
  const issue = lineupIssue(state,state.stage==="ucl"?"ucl":"domestic");
  const windowOpen=marketOpen(state);
  const categories=squadGroups(myClub.players,state.lineup,unavailableSet,state.benchSelection);
  const hasSeasonData=state.clubs.some(c=>c.players.some(p=>(p.ratedMatches||0)>0));
  const incomingLoans=state.loans.filter(loan=>loan.borrowerId===state.myClubId).length;

  return (
    <div className="squad-command">
      <section className="squad-command-deck">
        <div className="squad-command-identity"><span>FIRST-TEAM DESK</span><strong>{myClub.name}</strong><small>{state.formation} · squad, analysis and club operations</small></div>
        <div className="command-actions">
          {showMarketBar&&<button className="command-tile transfer-command" onClick={onOpenMarket}><ArrowLeftRight size={18}/><span><strong>Transfer Centre</strong><small>{windowOpen?`${incomingLoans}/3 incoming loans · Market open`:"Scouting & shortlist available"}</small></span></button>}
          {showMarketBar&&onOpenCups&&<button className="command-tile" onClick={()=>setWorkspaceTab("cups")}><Trophy size={17}/><span><strong>Cup Hub</strong><small>Draws and competitions</small></span></button>}
          {showMarketBar&&onOpenCalendar&&<button className="command-tile" onClick={onOpenCalendar}><CalendarDays size={17}/><span><strong>Calendar</strong><small>Season schedule</small></span></button>}
          {showMarketBar&&onOpenMail&&<button className="command-tile" onClick={onOpenMail}><Mail size={17}/><span><strong>Mail</strong><small>{(state.mail||[]).filter(item=>!item.read).length?`${(state.mail||[]).filter(item=>!item.read).length} unread`:"Staff inbox"}</small></span></button>}
          {onOpenTactics&&<button className="command-tile matchday-studio-command" onClick={onOpenTactics}><SlidersHorizontal size={17}/><span><strong>Matchday Studio</strong><small>{state.formation} · {STYLES[state.tacticalStyle||"balanced"].name}</small></span><b>Open →</b></button>}
          {showSimulate&&<button className="kickoff-command" onClick={onSimulate} disabled={!!issue}><span>{simulateLabel}</span><small>{issue||"Lineup ready"}</small></button>}
        </div>
      </section>

      <div className="workspace-tabs" role="tablist">
        <button className={workspaceTab==="squad"?"active":""} onClick={()=>setWorkspaceTab("squad")}><b>Squad</b><small>XI & bench</small></button>
        <button className={workspaceTab==="performance"?"active":""} onClick={()=>setWorkspaceTab("performance")}><b>Performance</b><small>Ratings & form</small>{hasSeasonData&&<em>LIVE</em>}</button>
        <button className={workspaceTab==="hub"?"active":""} onClick={()=>setWorkspaceTab("hub")}><b>Squad Hub</b><small>Contracts & mindset</small></button>
        <button className={workspaceTab==="table"?"active":""} onClick={()=>setWorkspaceTab("table")}><b>Table</b><small>League race</small></button>
        <button className={workspaceTab==="fixtures"?"active":""} onClick={()=>setWorkspaceTab("fixtures")}><b>Fixtures</b><small>Results & schedule</small></button>
        <button className={workspaceTab==="cups"?"active":""} onClick={()=>setWorkspaceTab("cups")}><b>Competitions</b><small>Cups & Europe</small></button>
        <button className={workspaceTab==="calendar"?"active":""} onClick={()=>setWorkspaceTab("calendar")}><b>Calendar</b><small>Season view</small></button>
        <button className={workspaceTab==="mail"?"active":""} onClick={onOpenMail}><b>Mail</b><small>Club inbox</small>{(state.mail||[]).filter(item=>!item.read).length>0&&<em>NEW</em>}</button>
      </div>

      {workspaceTab==="hub" ? <SquadHub state={state} club={myClub} onSell={onSell} onLoanOut={onLoanOut} onRenew={onRenew} renderBadge={club=><ClubBadge club={club} size="md"/>}/> : workspaceTab==="table" ? <div className={state.stage==="ucl"&&state.ucl?.knockoutBracket?"ucl-table-bracket":""}><LeagueStandings state={state}/>{state.stage==="ucl"&&state.ucl?.knockoutBracket&&<UclBracket bracket={state.ucl.knockoutBracket} clubs={state.ucl.clubs} myClubId={state.myClubId}/>}</div> : workspaceTab==="fixtures" ? <FixturesPanel state={state}/> : workspaceTab==="cups" ? <CupWorkspace state={state} onOpen={onOpenCups}/> : workspaceTab==="calendar" ? <CalendarPanel state={state}/> : workspaceTab==="mail" ? <MailPanel items={state.mail||[]} /> : workspaceTab==="performance" ? (hasSeasonData?<SeasonInsights clubs={state.clubs} myClub={myClub} league={state.league}/>:<div className="analytics-empty"><Sparkles size={22}/><strong>Your performance centre is ready</strong><span>Complete a match to unlock ratings, leaders and the Team of the Season race.</span></div>) : <>
      <div className="grid-2col">
        <div>
          <Pitch formation={state.formation} lineup={state.lineup} players={myClub.players} onDragStart={onDragStart} draggingPlayer={draggingPlayer} hoverSlot={hoverSlot} />
          <div style={{ fontSize:11, color:"#6a8a6a", marginTop:8, display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
            <Legend color={GROUP_COLOR.GK} label="Keeper"/><Legend color={GROUP_COLOR.DEF} label="Defence"/>
            <Legend color={GROUP_COLOR.MID} label="Midfield"/><Legend color={GROUP_COLOR.FWD} label="Attack"/>
          </div>
          <TeamSheetButtons state={state} onActivate={onActivateSheet}/>
        </div>

        <div className="squad-list-panel">
          <div className="squad-list-heading"><div><span>FIRST TEAM</span><strong>Squad <b>{myClub.players.length}</b></strong></div><small>Clear match roles · one-click selection</small></div>
          <nav className="squad-category-jumps" aria-label="Squad groups">{[["starting","Starting XI",categories.starting.length],["bench","Bench",categories.bench.length],["available","Available",categories.available.length]].map(([id,label,count])=><button key={id} onClick={()=>{const list=listRef.current,target=list?.querySelector(`.squad-category-${id}`);if(target)list.scrollTo({top:list.scrollTop+target.getBoundingClientRect().top-list.getBoundingClientRect().top,behavior:"smooth"});}}>{label}<b>{count}</b></button>)}</nav>
          <div className="squad-player-list" data-bench="true" ref={listRef}>
            {[{id:"starting",title:"Starting XI",caption:"On the pitch",players:categories.starting},{id:"bench",title:"Bench",caption:`${categories.bench.length}/9 · positional cover first`,players:categories.bench},{id:"available",title:"Available squad",caption:`${categories.available.length} players`,players:categories.available}].map(category=><section className={`squad-category squad-category-${category.id}`} key={category.id}>
              <header><div><span>{category.title}</span><small>{category.caption}</small></div><b>{category.players.length}</b></header>
              {category.players.map(p => {
              const suspended = suspendedSet.has(p.id), injury=injuries[p.id], unavailable=suspended||injury;
              return (
              <div key={p.id} className={`squad-player-row ${usedIds.has(p.id)?"is-starting":""} ${categories.benchIds.has(p.id)?"is-bench":""} ${unavailable?"is-suspended":""}`} style={{"--role-color":GROUP_COLOR[p.group]}}>
                <div className="squad-drag-area" onPointerDown={unavailable?undefined:(e)=>onDragStart(e, p, { source:"squad" })}>
                  <div className={`squad-ovr ${matchOvr(p)>=88?"elite":matchOvr(p)>=84?"high":""}`} title={`${matchOvr(p)} match OVR · ${p.ovr} base · ${p.confidence>0?"+":""}${p.confidence||0} confidence`}><strong>{matchOvr(p)}</strong><FormTrend confidence={p.confidence}/><small>OVR</small></div>
                  <div className="squad-player-copy">
                    <div className="squad-player-name"><strong>{p.name}</strong>{p.loan&&<span className="squad-loan-tag">LOAN</span>}{usedIds.has(p.id)&&!unavailable&&<span className="squad-starting-tag">STARTING</span>}{categories.benchIds.has(p.id)&&!unavailable&&<span className="squad-bench-tag">BENCH</span>}{suspended&&<span className="squad-suspended-tag">SUSPENDED</span>}{injury&&<span className="squad-suspended-tag">INJURED · {injury.matches} MATCH{injury.matches===1?"":"ES"}</span>}</div>
                    <div className="squad-player-facts"><b>{p.role}</b>{p.secondaryRoles?.length?<span title="Secondary positions">Also {p.secondaryRoles.join(" / ")}</span>:null}<span>Age {p.age}</span><span>{fmtM(p.value)}</span>{p.confidence?<span className={p.confidence>0?"form-up":"form-down"}>{p.confidence>0?"+":""}{p.confidence} confidence</span>:null}</div>
                    <div className="squad-player-vitals"><FitnessGem condition={p.condition}/><EnergyBar energy={p.energy}/></div>
                    {(p.ratedMatches||0)>0&&<div className="squad-player-season"><span><b>{playerSeasonAverage(p).toFixed(2)}</b> AVG</span><span><b>{p.bestRating?.toFixed(1)}</b> BEST</span><span><b>{p.seasonGoals||0}</b> G</span><span><b>{p.seasonAssists||0}</b> A</span><span><b>{p.motm||0}</b> MOTM</span></div>}
                  </div>
                </div>
                <div className="squad-row-actions"><SquadMoveControls player={p} category={category.id} unavailable={unavailable} onStart={onStartPlayer} onBench={onBenchPlayer} onAvailable={onAvailablePlayer}/><label title="Squad number"><span>#</span><input type="number" min={1} max={99} value={p.number} onChange={e=>onEditNumber(p.id, clamp(parseInt(e.target.value||"1",10),1,99))}/></label><button className="squad-loan-action" onClick={()=>onLoanOut(p.id)} disabled={p.loan||(!windowOpen&&!(state.loanListings||[]).includes(p.id))}>{(state.loanListings||[]).includes(p.id)?"Unlist loan":"Loan"}</button><button className="squad-sell-action" onClick={()=>onSell(p.id)} disabled={p.loan||(!windowOpen&&!(state.saleListings||[]).includes(p.id))} title={(state.saleListings||[]).includes(p.id)?"Remove listing and pending offers":"List for sale"}>{(state.saleListings||[]).includes(p.id)?"Unlist":"Sell"}</button></div>
              </div>
              );
            })}</section>)}
            <LoanedOutPlayers state={state} onRecall={onRecall}/>
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

function SeasonCompetitionReview({cupStatus,league,division,ucl,uel,uecl,onOpenCup}){
  const [view,setView]=useState("league");
  const cups=cupCompetitions(league);
  const keyFor={FA:"fa",CARABAO:"carabao",COPA:"copa",COPPA:"coppa",DFB:"dfb",COUPE:"coupe",TACA:"taca"};
  const cupCopy=(status)=>status?.outcome?status.outcome==="CHAMPION"?"Champions":"Campaign ended":status?.playedRounds?.length?`Through ${status.playedRounds.at(-1)}`:"Draw pending";
  return <section className="season-review">
    <header><div><span>COMPETITION REVIEW</span><strong>League and cup campaign</strong></div><nav>{<button className={view==="league"?"active":""} onClick={()=>setView("league")}>League</button>}{cups.map(id=><button className={view===id?"active":""} onClick={()=>setView(id)} key={id}>{competitionBrand(id).name}</button>)}{division===1&&["UCL","UEL","UECL"].map(id=><button key={id} className={view===id?"active":""} onClick={()=>setView(id)}>{competitionBrand(id).name}</button>)}</nav></header>
    {view==="league"?<div className="season-review-league"><CompetitionMark id={leagueCompetition(league,division)} size="sm"/><div><b>{competitionBrand(leagueCompetition(league,division)).name}</b><span>Live season standings and promotion/relegation picture</span></div><strong>League table below</strong></div>:["UCL","UEL","UECL"].includes(view)?<button className="season-review-ucl season-review-open" style={competitionTheme(view)} onClick={()=>onOpenCup?.(view)}><CompetitionMark id={view} size="sm"/><div><b>{competitionBrand(view).name}</b><span>{({UCL:ucl,UEL:uel,UECL:uecl}[view])?.outcome||({UCL:ucl,UEL:uel,UECL:uecl}[view])?.stage==="final"?"European campaign complete":({UCL:ucl,UEL:uel,UECL:uecl}[view])?"League phase and qualification route continue on the calendar.":"European results remain available for every club."}</span></div><strong>Open competition ↗</strong></button>:(()=>{const status=cupStatus?.[keyFor[view]];return <button className="season-review-cup season-review-open" style={competitionTheme(view)} onClick={()=>onOpenCup?.(view)}><CompetitionMark id={view}/><div><span>{competitionBrand(view).name.toUpperCase()}</span><b>{cupCopy(status)}</b><small>{status?.playedRounds?.length?`Rounds played: ${status.playedRounds.join(" · ")}`:"No cup fixture has been played yet."}</small></div><strong>{status?.outcome||"OPEN ↗"}</strong></button>;})()}
  </section>;
}
function ResultsScreen({ title, results, table, clubs, myClubId, onContinue, continueLabel, projectedTable, cupStatus, league, division=1, ucl, uel, uecl, onOpenCup }){
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

      {cupStatus && <SeasonCompetitionReview cupStatus={cupStatus} league={league} division={division} ucl={ucl} uel={uel} uecl={uecl} onOpenCup={onOpenCup}/>}

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
        <div><CompetitionStandings table={table} myClubId={myClubId} brandId={leagueCompetition(league,division)} title={`${competitionBrand(leagueCompetition(league,division)).name} table`} subtitle="Season standings"/></div>
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

function SeasonCampaignReport({state,onOpenCup}){
  const domestic=cupCompetitions(state.league);
  const cupKeys={FA:"fa",CARABAO:"carabao",COPA:"copa",COPPA:"coppa",DFB:"dfb",COUPE:"coupe",TACA:"taca"};
  const reportFor=id=>{
    if(["UCL","UEL","UECL"].includes(id)){
      const campaign=id==="UCL"?state.ucl:id==="UEL"?state.uel:state.uecl;
      const qualified=campaign?.clubs?.some(club=>club.id===state.myClubId);
      if(!qualified)return {eligible:false,stage:"Not qualified",detail:"European results available in the Competition Centre."};
      const record=campaign?.campaignRecord;
      const stage=campaign?.outcome||campaign?.qualification||campaign?.stage||"Campaign complete";
      return {eligible:true,stage:typeof stage==="string"?stage.replaceAll("-"," "):"Campaign complete",detail:record?`${record.w||0}W · ${record.d||0}D · ${record.l||0}L in Europe`:"Review your European campaign."};
    }
    const cup=state.cupStatus?.[cupKeys[id]];
    const round=cup?.playedRounds?.at(-1);
    return {eligible:true,stage:cup?.outcome==="CHAMPION"?"Champions":cup?.outcome|| (round?`Reached ${round}`:"Draw pending"),detail:round?`Last completed round: ${round}`:"No fixture played in this cup."};
  };
  const competitions=[...domestic,"UCL","UEL","UECL"];
  return <section className="season-campaign-report">
    <header><div><span>SEASON REPORT</span><h2>Every competition, one story</h2><p>Domestic cups and European nights are tracked alongside your league finish.</p></div><Trophy size={25}/></header>
    <div className="season-campaign-grid">{competitions.map(id=>{
      const report=reportFor(id),brand=competitionBrand(id);
      return <button key={id} className={`season-campaign-card ${report.eligible?"":"is-muted"}`} style={competitionTheme(id)} disabled={!report.eligible} onClick={()=>report.eligible&&onOpenCup?.(id)}>
        <CompetitionMark id={id} size="md"/><CompetitionMark id={id} size="xl" className="season-campaign-watermark"/>
        <span>{["UCL","UEL","UECL"].includes(id)?"EUROPEAN NIGHT":"DOMESTIC CUP"}</span>
        <strong>{brand.name}</strong><b>{report.stage}</b><small>{report.detail}</small>
        <i>{report.eligible?"Open report ↗":"Unavailable"}</i>
      </button>;
    })}</div>
  </section>;
}

function SummaryScreen({ state, myClub, onNextSeason, onOpenCup }){
  const finalRank = state.tableFinal.findIndex(r=>r.id===state.myClubId)+1;
  const halfRank = state.table1.findIndex(r=>r.id===state.myClubId)+1;
  const lineupPlayers = myClub.players.filter(p => Object.values(state.lineup).includes(p.id));
  const byGroup = g => lineupPlayers.filter(p=>p.group===g);
  const groups = ["GK","DEF","MID","FWD"];
  const trend = finalRank<halfRank ? "OVERPERFORMED" : finalRank>halfRank ? "UNDERPERFORMED" : "ON TARGET";
  const divisionName=state.division===2?({PL:"Championship",LALIGA:"LaLiga Hypermotion",SERIEA:"Serie B",BUNDES:"2. Bundesliga",LIGUE1:"Ligue 2"}[state.league]||"Second Division"):LEAGUE_NAMES[state.league];
  const uclUnlocked = state.division!==2 && finalRank <= 4;

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <Trophy size={36} color="#e8b84b" style={{marginBottom:8}}/>
        <h2 style={{ fontSize:22, marginBottom:2 }}>Season Complete</h2>
        <p style={{ color:"#9ab89a", fontSize:13 }}>{myClub.name} · {seasonLabel(state)} {divisionName}</p>
      </div>

      <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:24 }}>
        <StatBox label="Finished" value={`${finalRank}${ord(finalRank)}`} />
        <StatBox label="Half-Season Projection" value={`${halfRank}${ord(halfRank)}`} />
        <StatBox label="Trend" value={trend.split(" ")[0]} sub={trend} />
      </div>

      <div className={`season-qualification ${uclUnlocked?"is-secured":""}`}>
        <span>{uclUnlocked?"Champions League qualification secured":"European qualification depends on your final placement"}</span>
      </div>

      <SeasonCampaignReport state={state} onOpenCup={onOpenCup}/>

      {state.movement&&<div style={{textAlign:"center",color:state.division===2?"#e8c46b":"#7fd88f",fontSize:13,fontWeight:700,marginBottom:16}}>↕ {state.movement}</div>}

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

      <div style={{ marginBottom:20 }}><CompetitionStandings table={state.tableFinal} myClubId={state.myClubId} brandId={leagueCompetition(state.league,state.division)} title={`${competitionBrand(leagueCompetition(state.league,state.division)).name} final table`} subtitle="Final season standings"/></div>

      <div style={{ textAlign:"center" }}>
        <button onClick={onNextSeason} style={primaryBtnStyle}>Continue to Next Season</button>
      </div>
    </div>
  );
}

// Kept for older external embeds that import these two presentation blocks.
// eslint-disable-next-line no-unused-vars
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
// eslint-disable-next-line no-unused-vars
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

function UclBanner({ text, sub, competition="UCL" }){
  const brand=competitionBrand(competition);
  return (
    <div style={{ ...competitionTheme(competition), background:`linear-gradient(135deg,${brand.dark},${brand.panel})`, border:`1px solid ${brand.accent}`, borderRadius:12, padding:"14px 18px", marginBottom:16, textAlign:"center" }}>
      <div style={{ fontSize:11, letterSpacing:2, color:brand.accent }}>UEFA {brand.name.toUpperCase()}</div>
      <div style={{ fontSize:16, fontWeight:800, marginTop:2 }}>{text}</div>
      {sub && <div style={{ fontSize:12, color:brand.accent, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function UclBracket({bracket,clubs,myClubId}){
  const names=["Playoff","Round of 16","Quarter-Final","Semi-Final","Final"];
  const byId=new Map(clubs.map(club=>[club.id,club]));
  const seedRanks=new Map(bracket.top8.map((id,index)=>[id,index+1]));
  return <section className="ucl-bracket competition-theme" style={competitionTheme("UCL")}>
    <header><CompetitionMark id="UCL"/><div><span>KNOCKOUT ROAD</span><strong>Road to the final</strong><small>Aggregate scores · advancing clubs highlighted</small></div></header>
    <div className="ucl-bracket-scroll"><div className="ucl-bracket-grid"><svg className="ucl-bracket-lines" viewBox="0 0 910 1200" preserveAspectRatio="none" aria-hidden="true">{Array.from({length:8},(_,index)=>{const y=70+(index+.5)/8*1100;return <path key={`playoff-${index}`} d={`M170 ${y} H185`}/>;})}{[8,4,2].flatMap((count,col)=>Array.from({length:count/2},(_,pair)=>{
      const y1=70+(2*pair+.5)/count*1100,y2=70+(2*pair+1.5)/count*1100,yn=70+(pair+.5)/(count/2)*1100;
      const x=(col+1)*185+170,xm=x+7.5,xn=(col+2)*185;
      return <g key={`${col}-${pair}`}><path d={`M${x} ${y1} H${xm} V${y2} H${x}`}/><path d={`M${xm} ${yn} H${xn}`}/></g>;
    }))}</svg>{names.map((name,idx)=>{
      const stage=bracket.stages.find(item=>item.name===name);
      const count=idx===0?8:8/Math.pow(2,idx-1);
      return <div className="ucl-bracket-round" key={name}><h4>{name}</h4>{Array.from({length:count},(_,i)=>{
        const tie=stage?.ties[i],seedRank=stage?.key==='round16'?seedRanks.get(tie?.aId):null;
        return <div style={{top:70+(i+.5)/count*1100-31}} className={`ucl-bracket-tie ${tie?.winnerId?"decided":""} ${tie&&(tie.aId===myClubId||tie.bId===myClubId)?"my-tie":""}`} key={i}>{tie?[tie.aId,tie.bId].map((id,j)=>{
          if(!id)return <div className="ucl-bracket-club ucl-bracket-qualifier" key={`awaiting-${j}`}><span>Awaiting playoff winner</span><b>—</b></div>;
          const club=byId.get(id);
          return <div className={`ucl-bracket-club ${tie.winnerId===id?"advanced":""}`} key={id}><ClubBadge club={club} size="xs"/><span>{seedRank&&j===0&&<em className="ucl-seed">#{seedRank}</em>}{club?.name||id}</span><b>{tie.winnerId||tie.leg1?j===0?tie.aGoals:tie.bGoals:"—"}</b></div>;
        }):<div className="ucl-bracket-await">Awaiting qualifiers</div>}{tie?.pens&&<small>Decided on penalties</small>}</div>;
      })}</div>;
    })}</div></div>
  </section>;
}

function UclTable({ table, myClubId, competition="UCL" }){
  return <CompetitionStandings table={table} myClubId={myClubId} brandId={competition} title={`${competitionBrand(competition).name} league phase table`} zone/>;
}

function UclMatchPrep({ state, myClub, squadCommonProps, onPlay, competition="UCL" }){
  const u=competition==="UEL"?state.uel:competition==="UECL"?state.uecl:state.ucl;
  const round=u.rounds[u.roundIndex];
  const match=round.find(([h,a])=>h===state.myClubId||a===state.myClubId);
  const isHome=match[0]===state.myClubId;
  const opponent=u.clubs.find(c=>c.id===(isHome?match[1]:match[0]));
  const oppForm=opponent.preferredFormation||"4-4-2";
  const oppStyle=inferStyle(opponent.players,oppForm,opponent.id);
  return <div>
    <MatchdayPreview key={`${opponent.id}-${u.roundIndex}`} state={state} myClub={myClub} opponent={opponent} isHome={isHome} oppForm={oppForm} myStyle={state.tacticalStyle} oppStyle={oppStyle} hints={tacticalHints(state.formation,oppForm)} onPlay={onPlay} competition={competition} label={`${competitionBrand(competition).name.toUpperCase()} · MATCHDAY ${u.roundIndex+1} / 8`}/>
    <SquadScreen {...squadCommonProps} onSimulate={onPlay} showSimulate={false} showMarketBar={false} suspendedIds={state.suspensions.ucl}/>
  </div>;
}

// Kept as a compatibility renderer for older deep-linked saves; new results use PostMatchSummary.
// eslint-disable-next-line no-unused-vars
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

function UclPhaseSummary({ state, onContinue, competition="UCL" }){
  const u = competition==="UEL"?state.uel:competition==="UECL"?state.uecl:state.ucl;
  const table = u.phaseTable;
  const myRank = table.findIndex(r=>r.id===state.myClubId)+1;
  const q = u.qualification;
  const headline = q==="top8" ? "Top 8 finish — straight through to the Round of 16!" : q==="playoff" ? "Playoff spot — a two-legged tie for a Round of 16 place." : "Eliminated at the league phase.";
  return (
    <div>
      <UclBanner competition={competition} text="League Phase Complete" sub={`Finished ${myRank}${ord(myRank)} of ${table.length}`} />
      <div style={{ textAlign:"center", fontSize:14, fontWeight:700, color: q==="eliminated"?"#e08a8a":"#7fd88f", marginBottom:16 }}>{headline}</div>
      <UclTable table={table} myClubId={state.myClubId} competition={competition}/>
      <div style={{ textAlign:"center", marginTop:20 }}>
        <button onClick={onContinue} style={primaryBtnStyle}>{q==="eliminated" ? "Finish Campaign →" : "Continue →"}</button>
      </div>
    </div>
  );
}

// Kept as a compatibility renderer for older deep-linked saves; new results use PostMatchSummary.
// eslint-disable-next-line no-unused-vars
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
          <button onClick={onContinue} style={primaryBtnStyle}>Next scheduled fixture →</button>
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

function UclPage({ state, myClub, squadCommonProps, actions, competition="UCL" }){
  const campaignKey=competition==="UEL"?"uel":competition==="UECL"?"uecl":"ucl",u=state[campaignKey];
  const competitionName=competitionBrand(competition).name;
  if (!u) return null;
  if (u.stage === "hub") return <UclMatchPrep state={state} myClub={myClub} squadCommonProps={squadCommonProps} onPlay={actions.uclPlayLeagueMatch} competition={competition}/>;
  if (u.stage === "match-prep") return <UclMatchPrep state={state} myClub={myClub} squadCommonProps={squadCommonProps} onPlay={actions.uclPlayLeagueMatch} competition={competition} />;
  // The live score experience already names the competition and fixture. A
  // second large "Kick-Off" strip only duplicates that information for all
  // three UEFA competitions, so deliberately omit it here.
  if (u.stage === "match-live") return <LiveMatchScreen {...u.liveContext} onDone={actions.uclFinishLiveMatch} />;
  if (u.stage === "match-result") return <PostMatchSummary result={u.lastMatch} myClub={myClub} opponent={u.clubs.find(club=>club.id===u.lastMatch.opponentId)} competition={competition} onContinue={actions.uclContinueAfterMatch} continueLabel={`Return to ${competitionName} →`} statusText={u.lastMatch.result==="W"?"Three points secured":u.lastMatch.result==="D"?"Points shared":"Defeat"}/>;
  if (u.stage === "phase-summary") return <UclPhaseSummary state={state} competition={competition} onContinue={actions.uclContinueAfterPhaseSummary} />;
  if (u.stage === "knockout-prep"){
    const opp = u.clubs.find(c=>c.id===u.currentKnockoutOpponentId);
    const roundName = u.knockoutRounds[u.knockoutRoundIndex];
    const isFinal = roundName === "Final";
    const leg = u.leg || 1;
    const label = isFinal ? "Final" : `${roundName} — Leg ${leg} of 2`;
    const scheduled=nextFixture(state);
    const oppForm=opp.preferredFormation||"4-4-2";
    return <div><MatchdayPreview state={state} myClub={myClub} opponent={opp} isHome={scheduled?.homeId===myClub.id} oppForm={oppForm} myStyle={state.tacticalStyle} oppStyle={aiTactics(opp).style} hints={tacticalHints(state.formation,oppForm)} onPlay={actions.uclPlayKnockout} competition={competition} label={`${competitionBrand(competition).name.toUpperCase()} · ${label}`} subLabel={`${formatDate(scheduled?.date)} · ${isFinal?"Neutral venue":leg===2?`Aggregate ${u.aggregate.mine}–${u.aggregate.opp}`:"First leg"}`}/><SquadScreen {...squadCommonProps} showSimulate={false}/></div>;
  }
  if (u.stage === "knockout-live"){
    return <LiveMatchScreen {...u.liveContext} onDone={actions.uclFinishLiveMatch} />;
  }
  if (u.stage === "knockout-result"){
    const roundName = u.knockoutRounds[u.knockoutRoundIndex];
    const isFinal = roundName === "Final";
    const leg = u.leg || 1;
    const isDecidingLeg = isFinal || leg===2;
    const isCampaignOver = isDecidingLeg && (!u.lastMatch.won || isFinal);
    const label = isFinal ? "Final" : `${roundName} — Leg ${leg}`;
    const statusText=!isDecidingLeg?"First leg complete · second leg to come":u.lastMatch.won?(isFinal?"Champions of Europe":"Through to the next round"):(isFinal?"Runners-up":"Knocked out");
    return <PostMatchSummary result={{...u.lastMatch,round:label,result:u.lastMatch.won?"W":"L"}} myClub={myClub} opponent={u.clubs.find(club=>club.id===u.lastMatch.opponentId)} competition={competition} onContinue={actions.uclContinueAfterKnockout} continueLabel={(!u.lastMatch.won||isCampaignOver)?"View campaign summary →":"Continue →"} statusText={statusText}/>;
  }
  if (u.stage === "final") return <UclFinal myClub={myClub} rec={{ results:u.campaignResults, record:u.campaignRecord, outcome:u.outcome }} onBack={actions.uclBackToSeason} bracket={u.knockoutBracket} clubs={u.clubs} />;
  return null;
}
function MailHub({state,onClose,onRead,onOpenTransfer,onOpenOffers,onOpenPlayer,onRenew}){
  const items=state.mail||[],[selectedId,setSelectedId]=useState(items[0]?.id||null),selected=items.find(item=>item.id===selectedId)||items[0];
  const open=item=>{setSelectedId(item.id);onRead(item.id);};
  const icon=item=>item.type==="medical"?"✚":item.type==="discipline"?"!":item.type==="fixture"?"↻":item.type==="cup"?"★":"•";
  return <div className="hub-overlay mail-overlay" onClick={onClose}><section className="hub-sheet mail-reader" role="dialog" aria-modal="true" aria-label="Staff mail" onClick={event=>event.stopPropagation()}>
    <header><div><span>CLUB CORRESPONDENCE</span><strong>Inbox</strong><small>{items.filter(item=>!item.read).length} unread · {items.length} messages</small></div><button onClick={onClose} aria-label="Close mail"><X size={18}/></button></header>
    {!items.length?<div className="mail-empty">No staff updates yet. Your medical team, match analyst and secretary will write here as the season develops.</div>:<div className="mail-reader-layout">
      <nav className="mail-reader-list" aria-label="Messages">{items.map(item=><button key={item.id} className={`${item.id===selected?.id?"is-selected":""} ${!item.read?"is-unread":""}`} onClick={()=>open(item)}><i className={item.playerCard?"player-mail-rating":""}>{item.playerCard?.ovr||icon(item)}</i><span><small>{item.competition?competitionBrand(item.competition).name:item.playerCard?"PLAYER & AGENT":"CLUB STAFF"} · {formatDate(item.date,{day:"numeric",month:"short"})}</small><strong>{item.subject}</strong><em>{item.body}</em></span></button>)}</nav>
      <article className="mail-reader-message" key={selected.id}><div className="mail-message-top"><span className={`mail-type mail-${selected.type||"update"}`}>{icon(selected)}</span><div><small>{selected.competition?competitionBrand(selected.competition).name:"CLUB STAFF"}</small><h2>{selected.type==='renewal-invite'?'A future at this club.':selected.type==='transfer-request'?'I want a new challenge.':selected.type==='player-opportunity'?'Ready for my chance.':selected.type==='player-concern'?'Playing time matters.':selected.subject}</h2><p>{formatDate(selected.date,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p></div></div><div className="mail-message-rule"/>{selected.playerCard&&<PlayerLetter message={selected} onPlayer={onOpenPlayer} onRenew={onRenew} onTransfer={onOpenOffers}/>}<p className="mail-message-greeting">Manager,</p>{selected.prize&&<div className="mail-prize-card"><CompetitionMark id={selected.competition}/><div><small>{selected.prize.milestone.toUpperCase()} · PERFORMANCE REWARD</small><b>{pounds(selected.prize.amount*1000000)}</b><span>Added to your transfer budget</span></div><Trophy size={32}/></div>}<p className="mail-message-body">{selected.body}</p>{selected.type==="transfer"&&<button className="mail-transfer-cta" onClick={onOpenTransfer}>Open Transfer Centre →</button>}<p className="mail-message-signoff">Keep this message in mind when choosing your next XI and planning the coming fixture.</p><footer><span>Club Operations</span><b>{selected.type==="medical"?"Medical department":selected.type==="discipline"?"Head of football":selected.type==="fixture"?"Fixture secretary":"First-team staff"}</b></footer></article>
    </div>}
  </section></div>;
}

function FitPitch({children,wide=false}){
  const ref=useRef(null),[size,setSize]=useState(null);
  useEffect(()=>{
    const observer=new ResizeObserver(([entry])=>{const {width,height}=entry.contentRect;const ratio=wide?1.55:.8;const pitchWidth=Math.max(0,Math.min(width,height*ratio));setSize({width:pitchWidth,height:pitchWidth/ratio});});
    observer.observe(ref.current);return ()=>observer.disconnect();
  },[wide]);
  return <div className="fit-pitch-space" ref={ref}><div className="fit-pitch" style={size||{}}>{children}</div></div>;
}
function StudioOverview({state,myClub,onClose,onSetFormation,onOpenSelection,onOpenTactics,onOpenSheets}){
  const starters=Object.values(state.lineup).map(id=>myClub.players.find(player=>player.id===id)).filter(Boolean),notes=formationProfile(state.formation);
  const average=starters.length?Math.round(starters.reduce((sum,player)=>sum+matchOvr(player),0)/starters.length):"—";
  return <div className="matchday-studio" role="dialog" aria-modal="true" aria-label="Matchday Studio"><div className="studio-aurora"/><header className="studio-topbar"><button className="studio-back" onClick={onClose}><ChevronLeft size={19}/> Squad hub</button><div className="studio-title"><span>MATCHDAY STUDIO</span><strong>{myClub.name}</strong></div><button className="studio-save" onClick={onClose}>Save &amp; return <span>→</span></button></header><main className="studio-scroll"><section className="studio-hero"><ClubBadge club={myClub} size="lg" className="studio-club-badge"/><div className="studio-hero-copy"><span>FIRST TEAM CONTROL</span><h1>Matchday Studio</h1><p>{starters.length}/11 selected · choose your formation, lineup and match plan.</p></div><div className="studio-hero-numbers"><div><small>XI AVG</small><b>{average}</b></div><div><small>FORMATION</small><b>{state.formation}</b></div><div><small>READINESS</small><b>{starters.length?Math.round(starters.reduce((sum,player)=>sum+(player.energy??100),0)/starters.length):"—"}%</b></div></div></section><div className="studio-layout studio-workbench"><section className="studio-card studio-formation-card"><header className="studio-formation-header"><div><span className="studio-section-label">FORMATION LAB</span><h2>{state.formation}</h2></div><p>{notes?.strength||"Shape your XI for the next fixture."}</p></header><div className="studio-formation-buttons">{Object.keys(FORMATIONS).map(formation=><button key={formation} className={formation===state.formation?"active":""} onClick={()=>onSetFormation(formation)}><b>{formation}</b><span>{formation===state.formation?"Selected":"Preview"}</span></button>)}</div><FitPitch wide><Pitch formation={state.formation} lineup={state.lineup} players={myClub.players} interactive={false}/></FitPitch><div className="studio-formation-note"><i>✦</i><span><b>{notes?.strength||"Balanced setup"}</b><small>{notes?.risk||"Your selected XI will adapt to this shape."}</small></span></div></section><aside className="studio-console"><section className="studio-card studio-profile-card"><SquadPentagon players={myClub.players} lineup={state.lineup}/><div className="studio-intel-list"><div><span>Team identity</span><b>{STYLES[state.tacticalStyle||"balanced"].name}</b></div><div><span>Watch</span><b className="studio-warning">{notes?.risk||"Review your coverage before kickoff."}</b></div></div></section><section className="studio-card studio-console-card"><div className="studio-launch-actions"><button onClick={onOpenSelection}><span>LINEUP</span><b>Choose your XI</b><small>Drag, drop and manage the bench.</small><em>Open squad selection →</em></button><button onClick={onOpenTactics}><span>TACTICS</span><b>Build your match plan</b><small>{STYLES[state.tacticalStyle||"balanced"].name} · defensive instructions.</small><em>Open tactics lab →</em></button><button onClick={onOpenSheets}><span>TEAM SHEETS · {state.teamSheets?.length||1}/3</span><b>Your matchday collection</b><small>Save a first team, cup rotation and alternative plan.</small><em>Manage team sheets →</em></button></div></section></aside></div></main></div>;
}
function StudioCommandOverlay({state,myClub,onClose,onSaveSheet,onActivateSheet,onDeleteSheet,onSetFormation,onSetStyle,onSetLine,onSetAggression,onSetTrap,onSetPlan,onDragStart,onSwapPlayer,onBenchSlot,onStartPlayer,onBenchPlayer,onAvailablePlayer,draggingPlayer,hoverSlot}){
  const [screen,setScreen]=useState("home");
  const [selectedSlot,setSelectedSlot]=useState(null);
  const unavailable=new Set(unavailablePlayerIds(state,state.stage==="ucl"?"ucl":"domestic"));
  const groups=squadGroups(myClub.players,state.lineup,unavailable,state.benchSelection);
  const styles=Object.entries(STYLES).map(([key,value])=>({key,...value}));
  const active=state.tacticalStyle||"balanced",line=state.defensiveLine??50,aggression=state.defensiveAggression??50;
  if(screen==="sheets")return <TeamSheets state={state} renderPitch={props=><FitPitch><Pitch {...props}/></FitPitch>} onSave={onSaveSheet} onActivate={onActivateSheet} onDelete={onDeleteSheet} onClose={()=>setScreen("home")}/>;
  if(screen==="selection")return <div className="studio-workspace-overlay studio-selection-overlay" role="dialog" aria-modal="true" aria-label="Squad selection"><header className="studio-workspace-top"><button onClick={()=>setScreen("home")}><ChevronLeft size={18}/> Matchday Studio</button><div><span>SQUAD SELECTION</span><strong>Pick the starting XI</strong></div><button className="studio-save" onClick={()=>setScreen("home")}>Done <span>→</span></button></header><main className="studio-selection-workspace"><section className="studio-selection-pitch"><FitPitch><Pitch formation={state.formation} lineup={state.lineup} players={myClub.players} onDragStart={onDragStart} draggingPlayer={draggingPlayer} hoverSlot={hoverSlot} onSelectPlayer={setSelectedSlot} selectedSlot={selectedSlot}/></FitPitch><p>{selectedSlot===null?"Click a pitch position, then choose a replacement — or drag a squad card onto the pitch.":`Replacing ${FORMATIONS[state.formation][selectedSlot].role} · click a squad player to swap.`}</p>{selectedSlot!==null&&<button className="studio-bench-slot" onClick={()=>{onBenchSlot(selectedSlot);setSelectedSlot(null);}}>Move selected starter to bench</button>}</section><section className="studio-selection-list" data-bench="true"><header><span>FIRST TEAM</span><strong>Squad <b>{myClub.players.length}</b></strong><small>{selectedSlot===null?"Starting XI · Bench · Available squad":`Choose a replacement for ${FORMATIONS[state.formation][selectedSlot].role}`}</small></header>{[{id:"starting",title:"Starting XI",players:groups.starting},{id:"bench",title:"Bench",players:groups.bench},{id:"available",title:"Available squad",players:groups.available}].map(group=><section key={group.title}><h3>{group.title} <b>{group.players.length}</b></h3>{group.players.map(player=><div className="studio-selection-row" key={player.id}><button disabled={unavailable.has(player.id)} className="studio-selection-player" style={{"--role-color":GROUP_COLOR[player.group]}} onPointerDown={event=>onDragStart(event,player,{source:"squad"})} onClick={()=>{if(selectedSlot!==null){onSwapPlayer(selectedSlot,player.id);setSelectedSlot(null);}}}><span className="studio-selection-ovr">{matchOvr(player)}</span><span><strong>{player.name}</strong><small>{player.role}{player.secondaryRoles?.length?` · ${player.secondaryRoles.join("/")}`:""} · {Math.round(player.energy??100)}% energy{unavailable.has(player.id)?" · Unavailable":""}</small></span><em>{selectedSlot!==null?positionFitLabel(FORMATIONS[state.formation][selectedSlot].role,player):"Drag →"}</em></button><SquadMoveControls player={player} category={group.id} unavailable={unavailable.has(player.id)} onStart={onStartPlayer} onBench={onBenchPlayer} onAvailable={onAvailablePlayer}/></div>)}</section>)}</section></main></div>;
  if(screen==="tactics")return <div className="studio-workspace-overlay" role="dialog" aria-modal="true" aria-label="Tactics lab"><header className="studio-workspace-top"><button onClick={()=>setScreen("home")}><ChevronLeft size={18}/> Matchday Studio</button><div><span>TACTICS LAB</span><strong>Set the match plan</strong></div><button className="studio-save" onClick={()=>setScreen("home")}>Save plan <span>→</span></button></header><main className="studio-tactics-workspace"><section><header><span>PLAYING STYLE</span><h2>How should your team play?</h2><p>Choose the football identity. This is separate from defensive instructions below.</p></header><div className="studio-style-grid">{styles.map(style=><button key={style.key} className={style.key===active?"active":""} onClick={()=>onSetStyle(style.key)}><span>{style.key===active?"ACTIVE STYLE":"STYLE"}</span><b>{style.name}</b><small>{style.desc}</small></button>)}</div></section><section className="studio-instructions-card"><header><span>MATCH INSTRUCTIONS</span><h2>Defensive approach &amp; game management</h2></header><div className="studio-controls-grid"><label className="studio-range"><span><b>Defensive line</b><em>{line}</em></span><input type="range" min="0" max="100" value={line} onChange={event=>onSetLine(Number(event.target.value))}/><small>Deep block <i/> high press</small></label><label className="studio-range"><span><b>Defensive aggression</b><em>{aggression<25?"Cautious":aggression<50?"Measured":aggression<75?"Assertive":"Full contact"}</em></span><input type="range" min="0" max="100" step="5" value={aggression} onChange={event=>onSetAggression(Number(event.target.value))}/><small>Cautious <i/> aggressive</small></label><label className="studio-select"><b>Half-time response</b><select value={state.halftimeStyle||"keep"} onChange={event=>onSetPlan({halftimeStyle:event.target.value})}><option value="keep">Keep current style</option>{styles.map(style=><option key={style.key} value={style.key}>{style.name}</option>)}</select></label><div className="studio-switch-row"><span><b>Offside trap</b><small>Push the line and catch runners.</small></span><button aria-label="Offside trap" aria-pressed={!!state.offsideTrap} className={state.offsideTrap?"active":""} onClick={()=>onSetTrap(!state.offsideTrap)}><i/></button></div><label className="studio-check"><input type="checkbox" checked={state.autoSubs!==false} onChange={event=>onSetPlan({autoSubs:event.target.checked})}/><span><b>Automatic substitutions</b><small>Use up to five changes when fatigue demands it.</small></span></label></div></section></main></div>;
  if(screen==="home")return <StudioOverview state={state} myClub={myClub} onClose={onClose} onSetFormation={onSetFormation} onOpenSelection={()=>setScreen("selection")} onOpenTactics={()=>setScreen("tactics")} onOpenSheets={()=>setScreen("sheets")}/>;
  return null;
}
const MARKET_LEAGUES={PL:"Premier League",LALIGA:"La Liga",SERIEA:"Serie A",BUNDES:"Bundesliga",LIGUE1:"Ligue 1",PORTUGAL:"Liga Portugal",CHAMP:"Championship",LALIGA2:"LaLiga Hypermotion",SERIEB:"Serie B",BUNDES2:"2. Bundesliga",LIGUE2:"Ligue 2",EUROPE:"European guests"};
function playerAttributes(player){
  let hash=0;for(const ch of player.id)hash=(Math.imul(hash,31)+ch.charCodeAt(0))>>>0;
  const jitter=i=>((hash>>>(i*4))&7)-3;
  const base=player.ovr,clampStat=n=>clamp(Math.round(n),35,96);
  if(player.group==="GK")return [["DIV",base+jitter(0)],["HAN",base-1+jitter(1)],["KIC",base-4+jitter(2)],["REF",base+2+jitter(3)],["SPD",base-18+jitter(4)],["POS",base+jitter(5)],["STA",player.stamina??80]].map(([k,v])=>[k,clampStat(v)]);
  const role=player.group;
  const offsets=role==="FWD"?[5,4,0,4,-18,1]:role==="MID"?[1,-3,5,4,-5,0]:[0,-18,-1,-4,6,5];
  return [...["PAC","SHO","PAS","DRI","DEF","PHY"].map((key,i)=>[key,clampStat(base+offsets[i]+jitter(i))]),["STA",player.stamina??80]];
}
function DualRange({label,min,max,low,high,onLow,onHigh,format}){
  const [active,setActive]=useState("high");
  const safeLow=clamp(Number(low),min,max),safeHigh=clamp(Number(high),min,max);
  const span=Math.max(1,max-min),lowPct=((safeLow-min)/span)*100,highPct=((safeHigh-min)/span)*100;
  const activate=which=>()=>setActive(which);
  return <div className="market-range">
    <span>{label}</span>
    <div className="dual-range" style={{"--range-start":`${lowPct}%`,"--range-end":`${highPct}%`}}>
      <input className={active==="low"?"is-active":""} aria-label={`Minimum ${label}`} type="range" min={min} max={max} value={safeLow}
        onPointerDown={activate("low")} onFocus={activate("low")}
        onChange={event=>onLow(Math.min(Number(event.target.value),safeHigh))}/>
      <input className={active==="high"?"is-active":""} aria-label={`Maximum ${label}`} type="range" min={min} max={max} value={safeHigh}
        onPointerDown={activate("high")} onFocus={activate("high")}
        onChange={event=>onHigh(Math.max(Number(event.target.value),safeLow))}/>
    </div>
    <strong>{format(safeLow)} – {format(safeHigh)}</strong>
  </div>;
}
function PositionOptions(){
  return <><option value="ALL">All positions</option>{POSITION_OPTIONS.map(group=><optgroup key={group.label} label={group.label}>{group.options.map(([value,label])=><option key={value} value={value}>{label}</option>)}</optgroup>)}</>;
}
function TransferMarket({ state, myClub, filter, setFilter, onClose, onBuy, onFreeAgent, onLoanIn, onToggleShortlist, onOpenOffers, onOpenContract, onCancelTalk }){
  const [screen,setScreen]=useState("browse");
  const [selected,setSelected]=useState(null);
  const [round,setRound]=useState(1);
  const [offer,setOffer]=useState(0);
  const [clubMessage,setClubMessage]=useState("");
  const [dealFee,setDealFee]=useState(0);
  const [dealKind,setDealKind]=useState("Permanent transfer");
  const [negotiationEnded,setNegotiationEnded]=useState(false);
  const [page,setPage]=useState(0);
  const [shortlistOnly,setShortlistOnly]=useState(false);
  const [talksOpen,setTalksOpen]=useState(false);
  const activeTalkCount=(state.market?.talks||[]).filter(t=>t.status==='pending').length+(state.market?.invitations||[]).length+(state.saleOffers||[]).filter(o=>o.status==='pending').length;
  const spendable=availableBudget(state);
  const pendingSigning=selected&&(state.market?.talks||[]).find(t=>t.status==='pending'&&t.playerId===selected.id&&t.buyerId===state.myClubId);
  const incomingLoans=state.loans.filter(loan=>loan.borrowerId===state.myClubId).length;
  const transferWindowOpen=marketOpen(state);
  const shortlistedIds=new Set(state.shortlist||[]);
  const pools=[
    ["PL",state.plClubs],["LALIGA",state.laligaClubs],["SERIEA",state.serieaClubs],
    ["BUNDES",state.bundesligaClubs],["LIGUE1",state.ligue1Clubs],["PORTUGAL",state.portugalClubs],["CHAMP",state.championshipClubs],
    ["LALIGA2",state.laliga2Clubs],["SERIEB",state.serieBClubs],["BUNDES2",state.bundes2Clubs],["LIGUE2",state.ligue2Clubs],["EUROPE",state.europeanGuestClubs],
  ];
  const leagueByClub=new Map(pools.flatMap(([league,clubs])=>(clubs||[]).map(club=>[club.id,league])));
  const clubs=[...allClubs(state).map(club=>({...club,league:leagueByClub.get(club.id)||state.league})),freeAgentClub(state)];
  const isFreeAgent=selected?.sellerClub.id===FREE_AGENT_CLUB_ID;
  const agentAvailable=isFreeAgent&&state.freeAgents?.some(p=>p.id===selected.id);
  let players=clubs.flatMap(club=>club.players.map(player=>({...player,sellerClub:club,league:club.league})));
  const query=filter.q.trim().toLowerCase();
  if(query)players=players.filter(p=>p.name.toLowerCase().includes(query)||p.sellerClub.name.toLowerCase().includes(query));
  if(filter.pos!=="ALL")players=players.filter(p=>matchesPosition(p,filter.pos));
  if(filter.league!=="ALL")players=players.filter(p=>p.league===filter.league);
  if(filter.club!=="ALL")players=players.filter(p=>p.sellerClub.id===filter.club);
  if(shortlistOnly)players=players.filter(player=>shortlistedIds.has(player.id));
  const maxPrice=Math.max(1,Math.ceil(Math.max(...players.map(player=>player.value),...(clubs.flatMap(club=>club.players.map(player=>player.value))),1)));
  const ageMin=Number.isFinite(filter.ageMin)?filter.ageMin:16,ageMax=Number.isFinite(filter.ageMax)?filter.ageMax:45;
  const priceMin=Number.isFinite(filter.priceMin)?filter.priceMin:0,priceMax=Number.isFinite(filter.priceMax)?filter.priceMax:maxPrice;
  const priceFloor=clamp(Math.min(priceMin,priceMax),0,maxPrice),priceCeiling=clamp(Math.max(priceMin,priceMax),0,maxPrice);
  players=players.filter(player=>player.age>=Math.min(ageMin,ageMax)&&player.age<=Math.max(ageMin,ageMax)&&player.value>=priceFloor&&player.value<=priceCeiling);
  players.sort((a,b)=>filter.sort==="value_desc"?b.value-a.value:filter.sort==="value_asc"?a.value-b.value:filter.sort==="age_asc"?a.age-b.age:b.ovr-a.ovr);
  const totalPlayers=players.length,pageSize=24,totalPages=Math.max(1,Math.ceil(totalPlayers/pageSize)),safePage=Math.min(page,totalPages-1),pagePlayers=players.slice(safePage*pageSize,(safePage+1)*pageSize);
  const visibleClubs=clubs.filter(c=>filter.league==="ALL"||c.league===filter.league).filter(c=>!query||c.name.toLowerCase().includes(query)||c.players.some(p=>p.name.toLowerCase().includes(query)));
  const directoryClubs=(filter.club==="ALL"?visibleClubs:visibleClubs.filter(club=>club.id===filter.club)).filter(c=>c.id!==FREE_AGENT_CLUB_ID);
  let terms=null;
  if(selected&&screen!=="signed")try{terms=transferTerms(state,selected.sellerClub.id,selected.id);}catch{terms=null;}
  let loan=null;
  if(selected&&screen!=="signed")try{loan=loanTerms(state,selected.sellerClub.id,selected.id);}catch{loan=null;}
  const attributes=selected?playerAttributes(selected):[];
  useEffect(()=>setPage(0),[filter.q,filter.pos,filter.league,filter.club,filter.sort,filter.ageMin,filter.ageMax,filter.priceMin,filter.priceMax,shortlistOnly]);
  function openPlayer(player){setSelected(player);setScreen("profile");setClubMessage("");}
  function startNegotiation(){if(pendingSigning){if(pendingSigning.phase==='contract-ready')onOpenContract(pendingSigning.id);else setTalksOpen(true);return;}if(isFreeAgent){onFreeAgent(selected);return;}if(!transferWindowOpen||!terms)return;setOffer(Math.min(spendable,Math.max(1,Math.round(terms.askingPrice*.88))));setRound(1);setNegotiationEnded(false);setClubMessage(`${terms.seller.name} opened at ${fmtM(terms.askingPrice)}.`);setScreen("negotiate");}
  function submitOffer(){
    const response=evaluateOffer(state,{sellerId:selected.sellerClub.id,playerId:selected.id,offer,round});
    setClubMessage(response.message);
    if(response.status==="accepted"){
      if(onBuy(selected.sellerClub,selected,response.fee)){setDealFee(response.fee);setDealKind("Permanent transfer");setScreen("pending");}
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
        <div className="transfer-budget"><small>{transferWindowOpen?`WINDOW OPEN · LOANS ${incomingLoans}/3`:`WINDOW CLOSED · SCOUTING ONLY`}{reservedBudget(state)>0?` · ${fmtM(reservedBudget(state))} RESERVED`:''}</small><strong>{fmtM(spendable)}</strong></div>
      </header>

      <main className={`transfer-stage transfer-screen-${screen}`} key={screen}>
        {screen==="browse"&&<>
          <section className="market-hero">
            <div><span>SCOUTING NETWORK · 6 COMPETITIONS</span><h2>Find the player who changes your season.</h2><p>{transferWindowOpen?"Search any player or club, compare the market, then enter direct negotiations.":"The window is closed. Scout every player and keep your targets ready for the next opening."}</p></div>
            <div className="market-hero-tools"><div className="market-search"><Search size={18}/><input autoFocus aria-label="Search player or club" value={filter.q} onChange={e=>setFilter(f=>({...f,q:e.target.value,club:"ALL"}))} placeholder="Search player or club"/><kbd>⌘ K</kbd></div><nav className="market-desk-tools" aria-label="Transfer desk"><button className="market-active-talks" onClick={()=>setTalksOpen(true)}><ArrowLeftRight size={16}/><span>Active Talks</span><b>{activeTalkCount}</b></button>{(state.saleOffers||[]).some(o=>o.status==='pending')&&<button className="market-offers-shortcut" onClick={onOpenOffers}><HandCoins size={16}/><span>Offers</span><b>{state.saleOffers.filter(o=>o.status==='pending').length}</b></button>}<button className={`market-shortlist-toggle ${shortlistOnly?"active":""}`} onClick={()=>setShortlistOnly(value=>!value)}><Star size={15} fill={shortlistOnly?"currentColor":"none"}/>{shortlistOnly?"Shortlisted":"Shortlist"}<b>{shortlistedIds.size}</b></button></nav></div>
          </section>
          <div className="market-filters">
            <label><span>League</span><select value={filter.league} onChange={e=>setFilter(f=>({...f,league:e.target.value,club:"ALL"}))}><option value="ALL">All leagues</option>{Object.entries(MARKET_LEAGUES).map(([id,name])=><option value={id} key={id}>{name}</option>)}</select></label>
            <label><span>Club</span><select value={filter.club} onChange={e=>setFilter(f=>({...f,club:e.target.value}))}><option value="ALL">All clubs</option>{visibleClubs.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
            <label><span>Position</span><select aria-label="Transfer position" value={filter.pos} onChange={e=>setFilter(f=>({...f,pos:e.target.value}))}><PositionOptions/></select></label>
            <label><span>Sort</span><select value={filter.sort} onChange={e=>setFilter(f=>({...f,sort:e.target.value}))}><option value="ovr_desc">Highest rated</option><option value="value_desc">Highest value</option><option value="value_asc">Lowest value</option><option value="age_asc">Youngest</option></select></label>
            <DualRange label="Age range" min={16} max={45} low={Math.min(ageMin,ageMax)} high={Math.max(ageMin,ageMax)} onLow={value=>setFilter(f=>({...f,ageMin:value}))} onHigh={value=>setFilter(f=>({...f,ageMax:value}))} format={value=>value}/>
            <DualRange label="Market value" min={0} max={maxPrice} low={priceFloor} high={priceCeiling} onLow={value=>setFilter(f=>({...f,priceMin:value}))} onHigh={value=>setFilter(f=>({...f,priceMax:value}))} format={fmtM}/>
          </div>
          <div className="market-browser">
            <aside className="club-directory">
              <div className="market-section-title"><Building2 size={14}/> Clubs</div>
              <button className={filter.club==="ALL"?"active":""} onClick={()=>setFilter(f=>({...f,club:"ALL"}))}><span className="all-clubs-mark">ALL</span><span><strong>All clubs</strong><small>{clubs.length-1} available</small></span></button>
              <button className={`free-agents-directory ${filter.club===FREE_AGENT_CLUB_ID?'active':''}`} onClick={()=>{setShortlistOnly(false);setFilter(f=>({...f,club:FREE_AGENT_CLUB_ID,league:'ALL',q:''}));}}><span className="free-agent-mark"><FileSignature size={20}/></span><span><strong>Free Agents</strong><small>{state.freeAgents?.length||0} available · no transfer fee</small></span></button>
              {directoryClubs.map(club=><button className={filter.club===club.id?"active":""} key={club.id} onClick={()=>setFilter(f=>({...f,club:club.id}))}><ClubBadge club={club} size="sm" className="club-dot"/><span><strong>{club.name}</strong><small>{MARKET_LEAGUES[club.league]} · {club.players.length} players</small></span></button>)}
            </aside>
            <section className="player-market-list">
              <div className="market-list-heading"><span><SlidersHorizontal size={14}/> {totalPlayers} players found</span><small>Select a player for the full scout report</small></div>
              <div className="market-player-grid">
                {pagePlayers.map(player=><button className="market-player-card" style={{"--market-club":player.sellerClub.color||"#4e9461"}} key={`${player.sellerClub.id}-${player.id}`} onClick={()=>openPlayer(player)}>
                  <span className="market-crest-watermark"><ClubBadge club={player.sellerClub} size="xl"/></span>
                  <div className="market-player-top"><span className="player-overall">{player.ovr}<small>OVR</small></span><span className="player-position" style={{color:GROUP_COLOR[player.group]}}>{player.role}</span><span className={`player-price ${player.league==='FREE'?'free-agent-price':''}`}>{player.league==='FREE'?'FREE':fmtM(player.value)}</span></div>
                  <strong>{player.name}</strong><span className="player-club"><ClubBadge club={player.sellerClub} size="xs"/>{player.sellerClub.name}</span>
                  <div className="market-player-meta"><span>Age {player.age}</span><span>{player.league==='FREE'?'Unattached':MARKET_LEAGUES[player.league]}</span><span>{player.league==='FREE'?'Contract talks available':player.confidence?`${player.confidence>0?"+":""}${player.confidence} form`:"Steady form"}</span></div>
                </button>)}
              </div>
              {!players.length&&<div className="market-empty">{filter.club===FREE_AGENT_CLUB_ID||query.includes('free agent')?<><FileSignature size={28}/><strong>No free agents match this brief.</strong><span>Unsigned players appear here when their contracts expire. Try clearing filters, or check back as the career progresses.</span></>:'No players match this scouting brief.'}</div>}
              {totalPlayers>pageSize&&<nav className="market-pagination" aria-label="Player result pages"><button disabled={safePage===0} onClick={()=>setPage(value=>Math.max(0,value-1))}>← Previous</button><span>Page <b>{safePage+1}</b> of {totalPages}</span><button disabled={safePage>=totalPages-1} onClick={()=>setPage(value=>Math.min(totalPages-1,value+1))}>Next →</button></nav>}
            </section>
          </div>
        </>}

        {screen==="profile"&&selected&&<section className="player-profile-page">
          <div className="profile-identity" style={{"--profile-club":selected.sellerClub.color||"#4e9461"}}>
            <div className="profile-club-glow" style={{background:selected.sellerClub.color}}/>
            <div className="profile-crest-watermark"><ClubBadge club={selected.sellerClub} size="xl"/></div>
            <div className="profile-rating"><strong>{selected.ovr}</strong><span>{selected.role}</span></div>
            <div className="profile-name"><div className="profile-clubline"><ClubBadge club={selected.sellerClub} size="sm"/><span>{isFreeAgent?'UNATTACHED':MARKET_LEAGUES[selected.league]} · {selected.sellerClub.name}</span></div><h2>{selected.name}</h2><p>Age {selected.age} · {selected.group} · Potential {terms?.potential||selected.potential||selected.ovr} · Sharpness {Math.round(selected.condition??100)}% · Energy {Math.round(selected.energy??100)}%</p></div>
            <div className="profile-value"><small>{isFreeAgent?'TRANSFER FEE':'MARKET VALUE'}</small><strong>{isFreeAgent?'Free':fmtM(selected.value)}</strong><span>{isFreeAgent?'Personal terms only':terms?.stance||"Unavailable"}</span></div>
          </div>
          <div className="profile-grid" style={{"--profile-club":selected.sellerClub.color||"#4e9461"}}>
            <div className="scout-card">
              <div className="profile-section-title">Scouted attributes</div>
              <div className="attribute-grid">{attributes.map(([label,value])=><div className="attribute" key={label}><strong>{value}</strong><span>{label}</span><i><b style={{width:`${value}%`}}/></i></div>)}</div>
              <div className="scout-summary"><span>Scout summary</span><p>{selected.ovr>=86?"Elite player capable of deciding high-level matches.":selected.age<=23?"High-upside profile with immediate first-team value.":selected.ovr>=80?"Proven first-team quality with a reliable current level.":"Useful squad option whose value depends on tactical fit."}</p></div>
              <ClubInterest key={selected.id} state={state} playerId={selected.id} renderBadge={club=><ClubBadge club={club} size="sm"/>}/>
            </div>
            <div className="deal-card">
              <div className="profile-section-title">Deal room</div>
              <div className="deal-line"><span>{isFreeAgent?'Transfer fee':'Club asking price'}</span><strong>{isFreeAgent?'£0 · free signing':terms?fmtM(terms.askingPrice):"Unavailable"}</strong></div>
              <div className="deal-line"><span>Unreserved budget</span><strong className={isFreeAgent||terms&&spendable>=terms.minimumPrice?"positive":"negative"}>{fmtM(spendable)}</strong></div>
              <div className="deal-line"><span>{isFreeAgent?'Availability':'Squad status'}</span><strong>{isFreeAgent?agentAvailable?'Open to approaches':'No longer available':terms?.stance||"No deal"}</strong></div>
              <button className={`shortlist-button ${shortlistedIds.has(selected.id)?"is-shortlisted":""}`} onClick={()=>onToggleShortlist(selected.id)}><Star size={15} fill={shortlistedIds.has(selected.id)?"currentColor":"none"}/>{shortlistedIds.has(selected.id)?"Saved to shortlist":"Add to shortlist"}</button>
              <button className="negotiate-button" disabled={!pendingSigning&&(isFreeAgent?!agentAvailable:!transferWindowOpen||!terms?.releaseAllowed||spendable<terms?.minimumPrice||selected.loan||selected.sellerClub.id===myClub.id)} onClick={startNegotiation}><HandCoins size={17}/> {pendingSigning?(pendingSigning.phase==='contract-ready'?'Open personal contract talks':'Fee agreed · view Active Talks'):isFreeAgent?agentAvailable?'Discuss a contract':'Player signed elsewhere':selected.sellerClub.id===myClub.id?'Your squad player':transferWindowOpen?"Enter negotiations":"Window closed"}</button>
              {!isFreeAgent&&<button className="loan-button" disabled={!transferWindowOpen||pendingSigning||selected.sellerClub.id===myClub.id||selected.loan||!loan?.available||spendable<(loan?.fee||loanFee(selected))} title={!transferWindowOpen?"The transfer window is closed":loan?.reason} onClick={()=>{if(transferWindowOpen&&onLoanIn(selected.sellerClub,selected)){setDealFee(loan.fee);setDealKind("Season loan");setScreen("signed");}}}>Loan enquiry · {transferWindowOpen&&loan?.available?fmtM(loan.fee):transferWindowOpen?"Unavailable":"Window closed"}</button>}
              {isFreeAgent?<p className="free-agent-note"><FileSignature size={16}/><span>No selling club. Agree the wage, length and role directly with the agent, even outside a transfer window. Wages still need funding.</span></p>:!transferWindowOpen&&<p className="market-closed-notice">Scouting and shortlisting stay open. Deals resume in the next transfer window.</p>}
              {loan&&!loan.available&&<p className="loan-status">{loan.reason}</p>}
              {terms&&spendable<terms.minimumPrice&&!pendingSigning&&<p className="deal-warning">The likely agreement is above your unreserved budget.</p>}
              <button className="loan-button" onClick={()=>setTalksOpen(true)}>Open Active Talks →</button>
            </div>
          </div>
        </section>}

        {screen==="negotiate"&&selected&&terms&&<TransferNegotiation player={selected} otherClub={selected.sellerClub} myClub={myClub} budget={spendable} round={round} message={clubMessage} demand={round===1?terms.askingPrice:Number(clubMessage.match(/([\d.]+)m/)?.[1])||terms.askingPrice} fee={offer} onFee={setOffer} onSubmit={()=>negotiationEnded?setScreen("profile"):submitOffer()} onEnd={()=>{setNegotiationEnded(true);setClubMessage("You ended negotiations.");}} ended={negotiationEnded}/>}

        {screen==='pending'&&selected&&<section className="pending-signing"><CalendarDays size={32}/><span>FEE AGREED · NOT YET SIGNED</span><h2>{selected.name}</h2><p>The selling club has accepted. The player is considering the sporting project; rival clubs can still enter the race before confirmation.</p><div className="pending-reservation"><div><small>FUNDS RESERVED</small><strong>{fmtM(dealFee)}</strong></div><div><small>PLAYER DECISION</small><strong>{pendingSigning?formatDate(pendingSigning.dueDate,{day:'numeric',month:'short'}):'Check Active Talks'}</strong></div></div><button className="submit-offer" onClick={onClose}>Return & advance the calendar →</button><button className="loan-button" onClick={()=>setTalksOpen(true)}>Track in Active Talks</button></section>}

        {screen==="signed"&&selected&&<section className="signed-page">
          <div className="signed-rings"><i/><i/><i/></div><Sparkles className="signed-spark" size={30}/><span>{dealKind.toUpperCase()} COMPLETE</span><div className="signed-player"><b>{selected.ovr}</b><i style={{background:selected.sellerClub.color}}>{selected.role}</i></div><h2>{selected.name}</h2><p>{dealKind==="Season loan"?`joins ${myClub.name} on loan from ${selected.sellerClub.name}`:`joins ${myClub.name} from ${selected.sellerClub.name}`}</p><strong>{fmtM(dealFee)}</strong><button onClick={onClose}>Return to squad</button>
        </section>}
      </main>
      {talksOpen&&<ActiveTalks state={state} onClose={()=>setTalksOpen(false)} onContract={id=>{setTalksOpen(false);onOpenContract(id);}} onCancel={id=>{onCancelTalk(id);if(id===pendingSigning?.id&&screen==='pending')setScreen('profile');}} onOffers={()=>{setTalksOpen(false);onOpenOffers();}} renderBadge={club=><ClubBadge club={club} size="sm"/>} onPlayer={(p,seller)=>{setTalksOpen(false);openPlayer({...p,sellerClub:seller,league:leagueByClub.get(seller.id)});}}/>}
    </div>
  );
}
