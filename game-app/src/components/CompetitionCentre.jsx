import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, X, CalendarDays, Trophy, Star, Clock3 } from "lucide-react";
import { CompetitionMark } from "./CompetitionBrand.jsx";
import { competitionTheme, competitionBrand } from "./competitionBrand.js";
import { CUP_KEYS, cupCompetitions, isMyFixture, nextFixture, seasonStart, addDays, dateValue, leagueCompetition } from "../game/seasonSchedule.js";
import { findClubAnywhere } from "../game/engine.js";
import "./CompetitionCentre.css";
import { formatDate } from "./calendarFormat.js";

const LOGOS=import.meta.glob("../assets/club-logos/*.png",{eager:true,query:"?url",import:"default"});
function club(state,id){return id?(findClubAnywhere(state,id)||{id,name:"Club unavailable"}):{name:"Winner to be confirmed"};}
function Crest({team,large=false,watermark=false}){
 const name=team?.name||"To be confirmed",logo=LOGOS[`../assets/club-logos/${team?.id}.png`];
 return <span className={`cc-crest ${large?"is-large":""} ${watermark?"is-watermark":""}`} style={{"--club-color":team?.color||"#667b92"}}>{logo?<img src={logo} alt={watermark?"":name}/>:<b>{team?.id?name.split(" ").map(s=>s[0]).slice(0,2).join(""):"?"}</b>}</span>;
}
function roundName(event){return typeof event.round==="number"?`${event.kind==="europe"?"Matchday":"Matchweek"} ${event.round}`:`${event.round||"Draw pending"}${event.leg?` · Leg ${event.leg}`:""}`;}
function score(event){const r=event.result;return r&&Number.isFinite(r.homeGoals??r.myGoals)?`${r.homeGoals??r.myGoals} – ${r.awayGoals??r.oppGoals}`:event.status==="completed"?"FT":null;}
function future(state,id){return state.seasonSchedule?.filter(e=>e.competition===id&&isMyFixture(state,e)&&["scheduled","pending-draw"].includes(e.status)).sort((a,b)=>a.date.localeCompare(b.date))[0];}
function cupState(state,id){return id==="UCL"?{outcome:state.ucl?.outcome||(!state.ucl?.clubs.some(c=>c.id===state.myClubId)?"NOT QUALIFIED":null),record:state.ucl?.campaignRecord}:state.cupStatus?.[CUP_KEYS[id]]||{};}
function FixtureLine({state,event}){
 const a=club(state,event.homeId),b=club(state,event.awayId);
 return <div className={`cc-fixture ${isMyFixture(state,event)?"is-own":""}`}><div className="cc-fixture-team home"><span>{a.name}</span><Crest team={a}/></div><div className="cc-score"><b>{score(event)|| (event.status==="bye"?"BYE":event.homeId&&event.awayId?"vs":"TBC")}</b><small>{event.result?.notes||formatDate(event.date,{day:"numeric",month:"short"})}</small></div><div className="cc-fixture-team"><Crest team={b}/><span>{b.name}</span></div></div>;
}
function ArrowButton({direction,onClick,disabled,label}){const Icon=direction==="prev"?ChevronLeft:ChevronRight;return <button type="button" className="cc-icon-button" onClick={onClick} disabled={disabled} aria-label={label}><Icon size={20} strokeWidth={2}/></button>;}
export function FixturesPanel({state}){
 const current=nextFixture(state),league=leagueCompetition(state.league,state.division),[competition,setCompetition]=useState(league);
 const events=(state.seasonSchedule||[]).filter(e=>e.competition===competition&&e.status!=="bye"&&e.status!=="cancelled");
 const rounds=[...new Set(events.map(e=>e.round))],initial=current?.competition===competition?current.round:Math.max(1,(state.half===2?state.roundsHalf1?.length||0:0)+(state.roundIndex||0)+1);
 const [selected,setSelected]=useState(initial),round=rounds.includes(selected)?selected:rounds[0],index=rounds.indexOf(round);
 const shown=events.filter(e=>e.round===round).sort((a,b)=>a.date.localeCompare(b.date));
 const options=[league,...cupCompetitions(state.league),...(state.ucl?["UCL"]:[])];
 return <section className="cc-surface" style={competitionTheme(competition)}><header className="cc-heading"><div><span className="cc-eyebrow">FIXTURES & RESULTS</span><h2>{competitionBrand(competition).name}</h2><p>The full draw. Every fixture. One season.</p></div><CompetitionMark id={competition}/></header><div className="cc-toolbar"><div className="cc-pills">{options.map(id=><button className={id===competition?"active":""} key={id} onClick={()=>{setCompetition(id);setSelected(null);}}>{competitionBrand(id).name}</button>)}</div><div className="cc-round-controls"><ArrowButton direction="prev" label="Previous matchweek" disabled={index<=0} onClick={()=>setSelected(rounds[index-1])}/><div><small>{competition===league?"MATCHWEEK":"ROUND"}</small><strong>{typeof round==="number"?`${round} / ${rounds.length}`:round||"Awaiting draw"}</strong></div><ArrowButton label="Next matchweek" disabled={index>=rounds.length-1} onClick={()=>setSelected(rounds[index+1])}/></div></div><div className="cc-fixtures" key={competition+round}>{shown.map(e=><FixtureLine key={e.id} state={state} event={e}/>)}{!shown.length&&<div className="cc-empty">Fixtures will appear after the draw.</div>}</div></section>;
}
export function CupWorkspace({state,onOpen}){
 return <section className="cc-cups"><div className="cc-section-title"><span className="cc-eyebrow">COMPETITION CENTRE</span><h2>Your road to silverware</h2><p>Follow the draw, the next opponent and every step of your campaign.</p></div>{[...cupCompetitions(state.league),"UCL"].map(id=>{
  const status=cupState(state,id),event=future(state,id),opponent=event?club(state,event.homeId===state.myClubId?event.awayId:event.homeId):null,ended=!!status.outcome;
  const results=(state.seasonSchedule||[]).filter(e=>e.competition===id&&isMyFixture(state,e)&&e.status==="completed");
  return <button className={`cc-cup-row ${ended?"is-ended":""}`} style={competitionTheme(id)} onClick={()=>onOpen(id)} key={id}>
   <div className="cc-cup-identity"><CompetitionMark id={id}/><div><span className="cc-eyebrow">{id==="UCL"?"EUROPEAN NIGHTS":"DOMESTIC SILVERWARE"}</span><h3>{competitionBrand(id).name}</h3><span className="cc-status-pill">{status.outcome|| (event?roundName(event):"Awaiting next draw")}</span></div></div>
   <div className="cc-cup-opponent">{event&&!ended?<><small>NEXT OPPONENT · {event.homeId===state.myClubId?"HOME":"AWAY"}</small><div><Crest team={opponent} large/><strong>{opponent.name}</strong></div><span><CalendarDays size={14}/>{formatDate(event.date)} · {event.competition==="UCL"?"20:00":"19:45"}</span></>:<><small>{ended?"CAMPAIGN STATUS":"THE DRAW"}</small><strong>{status.outcome||"Next round to be confirmed"}</strong><span>{results.length} matches played · Explore competition</span></>}</div>
   <div className="cc-cup-progress"><small>YOUR RECORD</small><strong>{status.record?.w||0}<i>W</i> {status.record?.d||0}<i>D</i> {status.record?.l||0}<i>L</i></strong><span>View competition <ArrowUpRight size={18}/></span></div>
   {opponent?.id&&<Crest team={opponent} watermark/>}
  </button>;
 })}</section>;
}

export function CalendarPanel({state}){
 const today=state.currentDate||seasonStart(state.season),[month,setMonth]=useState(today.slice(0,7)),[selected,setSelected]=useState(today);
 const first=`${month}-01`,start=addDays(first,-((new Date(dateValue(first)).getUTCDay()+6)%7)),days=Array.from({length:42},(_,i)=>addDays(start,i));
 const events=(state.seasonSchedule||[]).filter(e=>isMyFixture(state,e)&&!["bye","cancelled"].includes(e.status));
 const selectedEvents=events.filter(e=>e.date===selected),featured=selectedEvents[0],opponent=featured?club(state,featured.homeId===state.myClubId?featured.awayId:featured.homeId):null;
 const shift=delta=>{const d=new Date(dateValue(first));d.setUTCMonth(d.getUTCMonth()+delta);const key=d.toISOString().slice(0,7);setMonth(key);setSelected(`${key}-01`);};
 return <section className="cc-surface cc-calendar"><header className="cc-heading"><div><span className="cc-eyebrow">SEASON CALENDAR</span><h2>{formatDate(first,{month:"long",year:"numeric"})}</h2><p>{formatDate(today,{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · Career date</p></div><div className="cc-month-controls"><ArrowButton direction="prev" label="Previous month" onClick={()=>shift(-1)}/><button className="cc-today" onClick={()=>{setMonth(today.slice(0,7));setSelected(today);}}>Current month</button><ArrowButton label="Next month" onClick={()=>shift(1)}/></div></header>
  <div className="cc-calendar-layout"><div className="cc-month"><div className="cc-weekdays">{["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d=><span key={d}>{d}</span>)}</div><div className="cc-days" key={month}>{days.map(date=>{
   const matches=events.filter(e=>e.date===date),event=matches[0],team=event?club(state,event.homeId===state.myClubId?event.awayId:event.homeId):null;
   return <button key={date} aria-label={`${formatDate(date)}${team?`, ${team.name}`:""}`} aria-pressed={selected===date} className={`cc-day ${date.slice(0,7)!==month?"is-outside":""} ${event?"has-match":""} ${date===today?"is-today":""} ${date===selected?"is-selected":""}`} style={event?competitionTheme(event.competition):undefined} onClick={()=>setSelected(date)}>
    <time>{Number(date.slice(-2))}</time>{event?<><div className="cc-day-match"><Crest team={team}/><span>{event.homeId===state.myClubId?"HOME":"AWAY"}</span><b>{score(event)||competitionBrand(event.competition).name}</b></div><div className="cc-day-footer"><span>{event.status==="pending-draw"?"DRAW PENDING":score(event)?"FULL TIME":event.rescheduled?"REARRANGED":"MATCHDAY"}</span>{matches.length>1&&<b>+{matches.length-1}</b>}</div></>:<span className="cc-rest">{date===today?"TODAY":""}</span>}
   </button>;
  })}</div><div className="cc-calendar-legend">{[...new Set(events.map(e=>e.competition))].map(id=><span key={id} style={competitionTheme(id)}><i/>{competitionBrand(id).name}</span>)}</div></div>
  <aside className="cc-day-detail" style={featured?competitionTheme(featured.competition):undefined} key={selected}><span className="cc-eyebrow">{featured?competitionBrand(featured.competition).name:"SEASON PLANNER"}</span><h3>{formatDate(selected,{weekday:"long",day:"numeric",month:"long"})}</h3>{featured?<><Crest team={opponent} large/><h2>{opponent.name}</h2><p>{featured.neutral?"Neutral venue":featured.homeId===state.myClubId?"Home fixture":"Away fixture"} · {roundName(featured)}</p><div className="cc-detail-score">{score(featured)|| (featured.competition==="UCL"?"20:00":"15:00")}</div><span className="cc-status-pill">{score(featured)?"Full time":featured.status==="pending-draw"?"Draw pending":"Scheduled"}</span>{featured.rescheduled&&<p className="cc-reschedule">Rearranged from {formatDate(featured.originalDate)} for fixture spacing.</p>}<div className="cc-detail-note"><Clock3 size={16}/><span>Matches are played in date order from your next-fixture panel.</span></div></>:<><CalendarDays className="cc-free-icon" size={48}/><h2>Between matchdays</h2><p>No fixture on this date. Time for preparation and recovery.</p></>}</aside></div></section>;
}
function Ratings({state,competition}){
 const [scope,setScope]=useState("all"),key=competition==="UCL"?"ucl":CUP_KEYS[competition];
 const ids=new Set(state.seasonSchedule.filter(e=>e.competition===competition).flatMap(e=>[e.homeId,e.awayId]).filter(Boolean));
 const clubs=[...ids].map(id=>club(state,id));
 const rows=clubs.flatMap(c=>(c.players||[]).map(p=>({player:p,club:c,stats:p.competitionStats?.[key]}))).filter(r=>r.stats?.ratedMatches&&(scope==="all"||r.club.id===state.myClubId)).sort((a,b)=>b.stats.ratingTotal/b.stats.ratedMatches-a.stats.ratingTotal/a.stats.ratedMatches);
 return <div><div className="cc-pills cc-rating-filter"><button className={scope==="all"?"active":""} onClick={()=>setScope("all")}>Competition players</button><button className={scope==="mine"?"active":""} onClick={()=>setScope("mine")}>Your squad</button></div><div className="cc-ratings">{rows.slice(0,30).map((r,i)=><div key={r.player.id}><span>{i+1}</span><Crest team={r.club}/><strong>{r.player.name}<small>{r.club.name} · {r.stats.ratedMatches} matches · {r.stats.goals||0} goals</small></strong><b>{(r.stats.ratingTotal/r.stats.ratedMatches).toFixed(2)}</b></div>)}{!rows.length&&<div className="cc-empty"><Star size={26}/><h3>The performances come next</h3><p>Ratings appear after matches in this competition.</p></div>}</div></div>;
}
function DomesticPath({state,events}){
 const rounds=[...new Set(events.map(e=>e.round))];
 return <div className="cc-path">{rounds.map((round,i)=><section key={round}><header><span>0{i+1}</span><h3>{round}</h3></header>{events.filter(e=>e.round===round&&e.status!=="bye"&&e.status!=="cancelled").map(e=><div className={`cc-path-tie ${isMyFixture(state,e)?"is-own":""}`} key={e.id}>{[e.homeId,e.awayId].map((id,n)=><div key={n} className={e.winnerId===id?"is-winner":""}><Crest team={club(state,id)}/><span>{id?club(state,id).name:e.feeders?"Winner of previous round":"Awaiting draw"}</span><b>{e.result?(n===0?e.result.homeGoals:e.result.awayGoals):"–"}</b></div>)}</div>)}</section>)}</div>;
}
export function CupDetail({state,competition,onClose,renderStandings,renderBracket}){
 const [tab,setTab]=useState("fixtures"),[round,setRound]=useState(null);
 useEffect(()=>{const key=e=>{if(e.key==="Escape")onClose();};document.addEventListener("keydown",key);const old=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.removeEventListener("keydown",key);document.body.style.overflow=old;};},[onClose]);
 const events=state.seasonSchedule.filter(e=>e.competition===competition&&e.status!=="bye"&&e.status!=="cancelled"),rounds=[...new Set(events.map(e=>e.round))],next=future(state,competition),selected=round??next?.round??rounds[0],status=cupState(state,competition);
 const opponent=next?club(state,next.homeId===state.myClubId?next.awayId:next.homeId):null;
 return <div className="cc-modal-overlay" onClick={onClose}><section className="cc-modal" role="dialog" aria-modal="true" aria-label={competitionBrand(competition).name} style={competitionTheme(competition)} onClick={e=>e.stopPropagation()}><header className="cc-modal-heading"><CompetitionMark id={competition}/><div><span className="cc-eyebrow">COMPETITION CENTRE</span><h2>{competitionBrand(competition).name}</h2></div><button className="cc-icon-button" onClick={onClose} aria-label="Close competition"><X size={22}/></button></header><div className="cc-modal-body"><div className="cc-campaign-hero"><div><span className="cc-eyebrow">{status.outcome?"CAMPAIGN STATUS":"NEXT IN YOUR CAMPAIGN"}</span><h2>{status.outcome||opponent?.name||"Awaiting the draw"}</h2><p>{next&&!status.outcome?`${formatDate(next.date)} · ${roundName(next)} · ${next.homeId===state.myClubId?"Home":"Away"}`:"Fixtures, performances and the road to the trophy."}</p></div>{opponent?<Crest team={opponent} large/>:<Trophy size={58}/>}</div><nav className="cc-detail-tabs">{["fixtures",...(competition==="UCL"?["table"]:[]),"path","ratings"].map(key=><button key={key} className={tab===key?"active":""} onClick={()=>setTab(key)}>{({fixtures:"Fixtures & results",table:"League phase table",path:"Road to the final",ratings:"Player ratings"})[key]}</button>)}</nav>
 {tab==="fixtures"&&<><div className="cc-pills cc-round-pills">{rounds.map(r=><button className={r===selected?"active":""} key={r} onClick={()=>setRound(r)}>{typeof r==="number"?`Matchday ${r}`:r}</button>)}</div>{events.filter(e=>e.round===selected).map(e=><FixtureLine key={e.id} state={state} event={e}/>)}{!events.length&&<div className="cc-empty">Your club did not qualify for this competition.</div>}</>}
 {tab==="ratings"&&<Ratings state={state} competition={competition}/>}
 {tab==="table"&&renderStandings?.()}
 {tab==="path"&&(competition==="UCL"?(state.ucl?.knockoutBracket?renderBracket?.():<div className="cc-empty"><Trophy size={32}/><h3>The knockout road opens after Matchday 8</h3><p>Top eight advance to the round of 16. Places 9–24 enter the knockout play-offs.</p></div>):<DomesticPath state={state} events={events}/>)}
 </div></section></div>;
}
export function CalendarHub({state,onClose}){return <div className="cc-modal-overlay" onClick={onClose}><section className="cc-modal" role="dialog" aria-modal="true" aria-label="Season calendar" onClick={e=>e.stopPropagation()}><div className="cc-calendar-close"><button className="cc-icon-button" onClick={onClose} aria-label="Close calendar"><X size={20}/></button></div><CalendarPanel state={state}/></section></div>;}
