import { revealStats } from "../game/engine.js";
import { isShotEvent, momentumSeries } from "../game/matchVisuals.js";
import { CompetitionMark } from "./CompetitionBrand.jsx";
import { competitionBrand, competitionTheme } from "./competitionBrand.js";
import { GUEST_CRESTS } from "../game/guestAssets.js";
import { FORMATIONS, GROUP_COLOR, ROLE_GROUP } from "../game/config.js";
import {useState,useEffect,useRef} from "react";
const CLUB_LOGOS=import.meta.glob("../assets/club-logos/*.png",{eager:true,query:"?url",import:"default"});
function ScoreCrest({clubId,name}){const [failed,setFailed]=useState(false);const src=GUEST_CRESTS[clubId]||CLUB_LOGOS[`../assets/club-logos/${clubId}.png`];return <span className="score-crest">{src&&!failed?<img src={src} alt={`${name} crest`} onError={()=>setFailed(true)}/>:<b>{name?.slice(0,2).toUpperCase()}</b>}</span>;}
const primaryBtnStyle={background:"#2d6b3f",color:"white",padding:"12px 28px",borderRadius:10,border:0};
function PossessionBar({ home, away }){
  return (
    <div className="match-possession-meter" aria-label={`Possession: home ${home}%, away ${away}%`}>
      <div className="match-possession-side home-possession" style={{ flexGrow:home }}><span>{home}%</span></div>
      <div className="match-possession-side away-possession" style={{ flexGrow:away }}><span>{away}%</span></div>
    </div>
  );
}
function StatRow({ label, left, right }){
  return (
    <div style={{ display:"flex", alignItems:"center", padding:"7px 0", fontSize:12, borderTop:"1px solid #1c2b1c" }}>
      <div style={{ width:64, textAlign:"left", fontWeight:700 }}>{left}</div>
      <div style={{ flex:1, textAlign:"center", color:"#9ab89a" }}>{label}</div>
      <div style={{ width:64, textAlign:"right", fontWeight:700 }}>{right}</div>
    </div>
  );
}
function MatchStatsPanel({ stats, minute, events=[] }){
  const s = revealStats(stats, minute);
  const number=(key,side)=>s[key]?.[side]??0;
  const goals=side=>events.filter(event=>event.isGoal===true&&event.side===side).length;
  const percent=(value,total)=>total?`${Math.round(value/total*100)}%`:'0%';
  const sections=[
    {title:'ATTACK',note:'Chances and finishing',rows:[
      ['Goals',goals(0),goals(1)],['Expected goals (xG)',number('xg',0).toFixed(2),number('xg',1).toFixed(2)],
      ['Shots',number('shots',0),number('shots',1)],['On target',number('sot',0),number('sot',1)],
      ['Off target',number('shots',0)-number('sot',0),number('shots',1)-number('sot',1)],
      ['Shot accuracy',percent(number('sot',0),number('shots',0)),percent(number('sot',1),number('shots',1))],
      ['Big chances',number('bigChances',0),number('bigChances',1)],['Big chances missed',number('bigChancesMissed',0),number('bigChancesMissed',1)],
      ['Touches in box',number('touches',0),number('touches',1)],['Corners',number('corners',0),number('corners',1)],
      ['Crosses',number('crosses',0),number('crosses',1)],['Successful crosses',number('successfulCrosses',0),number('successfulCrosses',1)],
    ]},
    {title:'BUILD-UP',note:'Control of the ball',rows:[
      ['Passes attempted',number('passes',0),number('passes',1)],['Accurate passes',number('accPasses',0),number('accPasses',1)],
      ['Pass completion',`${number('passAcc',0)}%`,`${number('passAcc',1)}%`],['Offsides',number('offsides',0),number('offsides',1)],
    ]},
    {title:'DEFENCE',note:'Winning it back',rows:[
      ['Tackles won',number('tacklesWon',0),number('tacklesWon',1)],['Interceptions',number('interceptions',0),number('interceptions',1)],
      ['Clearances',number('clearances',0),number('clearances',1)],['Goalkeeper saves',number('saves',0),number('saves',1)],
    ]},
    {title:'DISCIPLINE',note:'Pressure and control',rows:[
      ['Fouls committed',number('fouls',0),number('fouls',1)],['Yellow cards',number('yellowCards',0),number('yellowCards',1)],['Red cards',number('redCards',0),number('redCards',1)],
    ]},
  ];
  return <div className="match-stats-dashboard"><section className="match-possession-card"><div className="match-possession-header"><div><span>POSSESSION</span><small>Control of the ball</small></div><strong>{s.possession[0]}% <i>vs</i> {s.possession[1]}%</strong></div><PossessionBar home={s.possession[0]} away={s.possession[1]}/></section>
    <div className="match-stat-sections">{sections.map(section=><section className="match-stat-group" key={section.title}><header><strong>{section.title}</strong><small>{section.note}</small></header>{section.rows.map(([label,left,right])=><StatRow key={label} label={label} left={left} right={right}/>)}</section>)}</div>
  </div>;
}
function fmtPct(n){ return `${n>=0?"+":""}${Math.round(n*100)}%`; }
function TacticalBreakdown({ analysis, myName, oppName }){
  const a = analysis;
  return (
    <div style={{ background:"#0e150e", border:"1px solid #1c2b1c", borderRadius:10, padding:14, marginBottom:20 }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#cfe8cf", marginBottom:10 }}>📊 How This Is Being Calculated</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, fontSize:11, color:"#9ab89a", marginBottom:10 }}>
        <div>
          <div style={{ fontWeight:700, color:"#e8ede8", marginBottom:3 }}>{myName}</div>
          <div>Attack {a.ratings.me.attack.toFixed(1)} · Defense {a.ratings.me.defense.toFixed(1)}</div>
          <div>Style: {a.styleMeName} ({fmtPct(a.styleBonusMe)} attack)</div>
          <div>Line/trap: {fmtPct(a.lineMe.attackAdj)} att, {fmtPct(a.lineMe.defenseAdj)} def</div>
          <div>Defensive aggression: {a.aggressionMe??50}/100</div>
        </div>
        <div>
          <div style={{ fontWeight:700, color:"#e8ede8", marginBottom:3 }}>{oppName}</div>
          <div>Attack {a.ratings.opp.attack.toFixed(1)} · Defense {a.ratings.opp.defense.toFixed(1)}</div>
          <div>Style: {a.styleOppName} ({fmtPct(a.styleBonusOpp)} attack)</div>
          <div>Line/trap: {fmtPct(a.lineOpp.attackAdj)} att, {fmtPct(a.lineOpp.defenseAdj)} def</div>
          <div>Defensive aggression: {a.aggressionOpp??50}/100</div>
        </div>
      </div>
      <div style={{ fontSize:11, color: a.formationEdge>0?"#7fd88f":a.formationEdge<0?"#e8b84b":"#9ab89a", marginBottom:8 }}>
        Formation matchup: {fmtPct(a.formationEdge)} · {a.hints.map(h=>h.text).join(" · ")}
      </div>
      <div style={{ fontSize:12, fontWeight:700, color:"#e8ede8", paddingTop:8, borderTop:"1px solid #1c2b1c" }}>
        Effective attack {a.effAttackMe.toFixed(1)} vs their effective defense {a.effDefenseOpp.toFixed(1)} — and vice versa ({a.effAttackOpp.toFixed(1)} vs {a.effDefenseMe.toFixed(1)}) — are the starting matchup. Fatigue, substitutions and cards change the matchup as the simulation progresses.
      </div>
    </div>
  );
}
function ratingColor(rating){return rating>=8?"#83e29a":rating>=7?"#c6db75":rating>=6?"#e8d39a":"#ec8d8d";}
function shortPlayerName(name=""){
  const parts=name.trim().split(/\s+/).filter(Boolean);
  if(parts.length<2)return name;
  const particles=new Set(["da","de","del","di","dos","van","von"]);
  const particle=parts.findIndex((part,index)=>index>0&&particles.has(part.toLowerCase()));
  const surname=particle>1?parts[particle-1]:parts.at(-1);
  return `${parts[0][0]}. ${surname}`;
}
function eventMark(event,playerId){
  if(event.isGoal&&event.playerId===playerId)return {icon:"⚽",label:`Goal ${event.minute}′`,kind:"goal"};
  if(event.assistId===playerId)return {icon:"A",label:`Assist ${event.minute}′`,kind:"assist"};
  if(event.type==="yellow"&&event.playerId===playerId)return {icon:"▰",label:`Yellow ${event.minute}′`,kind:"yellow"};
  if(event.type==="red"&&event.playerId===playerId)return {icon:"■",label:`Red ${event.minute}′`,kind:"red"};
  if(event.type==="penalty-miss"&&event.playerId===playerId)return {icon:"×",label:`Missed penalty ${event.minute}′`,kind:"miss"};
  if(event.type==="injury"&&event.playerId===playerId)return {icon:"+",label:`Injured ${event.minute}′`,kind:"injury"};
  if(event.type==="sub"&&event.playerId===playerId)return {icon:"↗",label:`On ${event.minute}′`,kind:"sub-on"};
  if((event.type==="sub"||event.type==="injury")&&event.outId===playerId)return {icon:"↘",label:`Off ${event.minute}′`,kind:"sub-off"};
  return null;
}
function MatchPlayerCard({player,slot,events,done}){
  const marks=events.map(event=>eventMark(event,player.playerId)).filter(Boolean);
  const role=slot?.role||player.role||"CM";
  return <article className="match-lineup-card" title={`${player.name} · ${role}`} style={{"--lineup-role":GROUP_COLOR[ROLE_GROUP[role]]||"#84d79b"}}>
    <div className="match-lineup-card-top"><b>{done?player.rating.toFixed(1):"LIVE"}</b><span>{role}</span></div>
    <strong>{shortPlayerName(player.name)}</strong>
    <small>{player.minutes}′ played</small>
    {marks.length>0&&<div className="match-lineup-marks">{marks.slice(0,4).map((mark,index)=><i className={mark.kind} title={mark.label} key={`${mark.kind}-${index}`}>{mark.icon}</i>)}</div>}
  </article>;
}
function MatchLineupPitch({teamName,teamId,formation,ratings,events,done}){
  const slots=FORMATIONS[formation]||FORMATIONS["4-3-3"];
  const starters=(ratings||[]).filter(player=>player.start===0).slice(0,11);
  const bench=(ratings||[]).filter(player=>player.start>0);
  return <section className="match-lineup-team">
    <header><ScoreCrest clubId={teamId} name={teamName}/><div><span>{formation||"4-3-3"} · MATCH LINEUP</span><strong>{teamName}</strong></div><b>{done?`${starters.length}/11`:`LIVE`}</b></header>
    <div className="match-lineup-pitch">
      <div className="match-lineup-pitch-lines"><i/><b/></div>
      {slots.map((slot,index)=>{const player=starters[index];return <div className="match-lineup-position" key={`${slot.role}-${index}`} style={{left:`${slot.x}%`,top:`${slot.y}%`}}>{player?<MatchPlayerCard player={player} slot={slot} events={events} done={done}/>:<span className="match-lineup-vacant">{slot.role}</span>}</div>;})}
    </div>
    <div className="match-lineup-bench"><span>BENCH / CHANGES</span><div>{bench.length?bench.map(player=>{const marks=events.map(event=>eventMark(event,player.playerId)).filter(Boolean);return <article key={player.playerId}><b>{done?player.rating.toFixed(1):"—"}</b><strong>{shortPlayerName(player.name)}</strong><small>{marks.find(mark=>mark.kind==="sub-on")?.label||"Unused"}</small></article>}):<small>No substitutions made</small>}</div></div>
  </section>;
}
function MatchLineupPanel({ratings,events,homeName,awayName,homeClubId,awayClubId,homeFormation,awayFormation,done}){
  if(!ratings)return null;
  const keyEvents=events.filter(event=>event.isGoal||["sub","injury","yellow","red","penalty-miss"].includes(event.type));
  return <div className="match-lineup-panel">
    <header className="match-lineup-heading"><div><span>MATCH LINEUPS</span><strong>Every starter, change and decisive moment</strong></div><small>{done?"Final ratings and incidents":"Live incidents appear as the match unfolds"}</small></header>
    <div className="match-lineup-pitches"><MatchLineupPitch teamName={homeName} teamId={homeClubId} formation={homeFormation||"4-3-3"} ratings={ratings[0]} events={events} done={done}/><MatchLineupPitch teamName={awayName} teamId={awayClubId} formation={awayFormation||"4-3-3"} ratings={ratings[1]} events={events} done={done}/></div>
    <section className="match-lineup-activity"><header><span>MATCH ACTIVITY</span><strong>Goals, cards and substitutions</strong></header>{keyEvents.length?<div>{keyEvents.map((event,index)=><article key={`${event.minute}-${index}`} className={`event-${event.type}`}><b>{event.minute}′</b><i>{event.isGoal?"⚽":event.type==="sub"?"↗":event.type==="injury"?"✚":event.type==="yellow"?"▰":event.type==="red"?"■":"×"}</i><span>{event.text}</span><small>{event.side===0?homeName:awayName}</small></article>)}</div>:<p>Team sheets are ready. Match incidents will appear here after kick-off.</p>}</section>
  </div>;
}
function PlayerRatingsPanel({ ratings, manOfTheMatch, homeName, awayName, done }){
  if(!done)return <div className="ratings-wait"><span>★</span><strong>Player ratings unlock at full time</strong><small>Goals, assists, chances, clean sheets, the result and discipline all contribute.</small></div>;
  if(!ratings)return null;
  return (
    <div className="match-ratings">
      {manOfTheMatch&&<div className="motm-card">
        <span className="motm-star">★</span><div><small>MAN OF THE MATCH</small><strong>{manOfTheMatch.name}</strong><span>{manOfTheMatch.side===0?homeName:awayName} · {manOfTheMatch.goals||0}G {manOfTheMatch.assists||0}A</span></div>
        <b>{manOfTheMatch.rating.toFixed(1)}</b>
      </div>}
      <div className="ratings-columns">
        {[homeName,awayName].map((teamName,side)=><div className="ratings-team" key={teamName}>
          <div className="ratings-team-name">{teamName}</div>
          {[...(ratings[side]||[])].sort((a,b)=>b.rating-a.rating).map(player=><div className={`player-rating-row ${player.isMotm?"is-motm":""}`} key={player.playerId}>
            <span className="rating-role">{player.group}</span><span className="rating-name"><strong>{player.name}</strong><small>{player.minutes}&apos; · {player.goals||0}G {player.assists||0}A{player.red?" · sent off":""}</small></span>
            <span className="rating-confidence">{player.confidenceDelta>0?`Form +${player.confidenceDelta}`:player.confidenceDelta<0?`Form ${player.confidenceDelta}`:"Steady"}</span>
            <b style={{color:ratingColor(player.rating)}}>{player.rating.toFixed(1)}</b>
          </div>)}
        </div>)}
      </div>
    </div>
  );
}

function pulseArea(series,side,endMinute){
  const baseline=156;
  const points=series.map((value,i)=>`${40+i/endMinute*920},${baseline-(side===0?Math.max(0,value):-Math.max(0,-value))*112}`);
  return `M40,${baseline} L${points.join(' L')} L960,${baseline} Z`;
}
function MatchPulse({events,minute,homeName,awayName,homeColor,awayColor,endMinute}){
  const displayEnd=Math.max(95,endMinute||minute);
  const series=momentumSeries(events,displayEnd);
  const marks=events.filter(event=>event.minute<=minute&&(event.isGoal||event.type==='red'));
  const colors={"--momentum-home":homeColor||"#9c2736","--momentum-away":awayColor||"#3667a4"};
  const point=matchMinute=>40+matchMinute/displayEnd*920;
  const hasExtraTime=displayEnd>95;
  return <section className="match-pulse" style={colors} aria-label="Live match momentum"><h2>Momentum</h2>
    <div className="momentum-legend"><span><i/> {homeName}</span><span><i/> {awayName}</span></div>
    <svg className="momentum-svg" viewBox="0 0 1000 320" role="img" aria-label={`Momentum by minute, ${homeName} above the line and ${awayName} below`}>
      <line x1="40" y1="156" x2="960" y2="156" className="momentum-baseline"/>
      <line x1={point(45)} y1="18" x2={point(45)} y2="285" className="momentum-halftime"/>
      {hasExtraTime&&<><line x1={point(90)} y1="18" x2={point(90)} y2="285" className="momentum-extra"/><line x1={point(105)} y1="18" x2={point(105)} y2="285" className="momentum-halftime"/></>}
      <path d={pulseArea(series,0,displayEnd)} className="momentum-home-area"/>
      <path d={pulseArea(series,1,displayEnd)} className="momentum-away-area"/>
      {marks.map((event,i)=><g key={`${event.minute}-${i}`} transform={`translate(${point(event.minute)},${event.side===0?37:274})`}><text textAnchor="middle" fontSize="22" fill="#fff">{event.type==='red'?'🟥':'⚽'}</text></g>)}
      <text x="40" y="308" className="momentum-axis">0′</text><text x={point(45)} y="308" textAnchor="middle" className="momentum-axis">HT</text>{hasExtraTime?<><text x={point(90)} y="308" textAnchor="middle" className="momentum-axis">90′</text><text x={point(105)} y="308" textAnchor="middle" className="momentum-axis">ET</text><text x="960" y="308" textAnchor="end" className="momentum-axis">120′</text></>:<text x="960" y="308" textAnchor="end" className="momentum-axis">FT</text>}
    </svg>
    <div className="momentum-note">{hasExtraTime?"Extra time included · shot pressure, xG and goals": "Shot pressure, xG and goals · smoothed minute by minute"}</div>
  </section>;
}
function GoalRibbon({goals,homeName,awayName,homeGoals,awayGoals}){
  if(!goals.length)return <div className="goal-ribbon is-waiting"><span>LIVE MOMENT</span><strong>Kick-off. The first big moment will appear here.</strong></div>;
  const latest=goals.at(-1),scorer=(latest.text||"").replace(/ scores.*$/i,"");
  return <section className="goal-ribbon" aria-live="polite">
    <span className="goal-ribbon-kicker">GOAL · {latest.minute>90?`90+${latest.minute-90}`:latest.minute}′</span>
    <strong>⚽ {scorer || latest.teamName}</strong>
    <small>{latest.teamName} <b>{homeGoals} – {awayGoals}</b> {latest.teamName===homeName?awayName:homeName}</small>
  </section>;
}
function ShootoutPanel({shootout,homeName,awayName,homeClubId,awayClubId}){
  const ordered=[...(shootout.kicks||[])];
  return <section className="shootout-panel" aria-label="Penalty shootout">
    <header><span>PENALTY SHOOTOUT</span><strong>Every kick, every decision</strong><small>The knockout tie is level after extra time.</small></header>
    <div className="shootout-score"><div><ScoreCrest clubId={homeClubId} name={homeName}/><strong>{homeName}</strong></div><b>{shootout.homeScore}<i>–</i>{shootout.awayScore}</b><div><ScoreCrest clubId={awayClubId} name={awayName}/><strong>{awayName}</strong></div></div>
    <div className="shootout-kicks">{[0,1].map(side=><div className="shootout-team" key={side}><small>{side===0?homeName:awayName}</small><div>{ordered.filter(kick=>kick.side===side).map((kick,index)=><span className={kick.scored?"scored":"missed"} title={kick.name} key={`${kick.name}-${index}`}>{kick.scored?"✓":"×"}</span>)}</div></div>)}</div>
    <ol className="shootout-log">{ordered.map((kick,index)=><li key={`${kick.name}-${index}`}><span>{index+1}</span><strong>{kick.name}</strong><em>{kick.side===0?homeName:awayName}</em><b className={kick.scored?"scored":"missed"}>{kick.scored?"SCORED":"SAVED / MISSED"}</b></li>)}</ol>
  </section>;
}
function ShotMapPanel({events,homeName,awayName,homeClubId,awayClubId}){
  const shots=events.filter(isShotEvent);
  const shown=shots.filter(event=>Number.isFinite(event.shotX)&&Number.isFinite(event.shotY));
  return <section className="shot-visuals"><div className="shot-visuals-heading"><span>SHOT INTELLIGENCE</span><strong>Where the chances came from</strong><small>Attacking third · outlined circles are goals</small></div>
    <div className="shot-map-layout">{[0,1].map(side=>{
      const name=side===0?homeName:awayName,clubId=side===0?homeClubId:awayClubId;
      const teamShots=shown.filter(event=>event.side===side);
      const allShots=shots.filter(event=>event.side===side);
      const totalXg=allShots.reduce((sum,event)=>sum+(event.xg||0),0);
      return <div className="shot-map-team" key={side}><header><ScoreCrest clubId={clubId} name={name}/><div><strong>{name}</strong><small>{allShots.length} shots · {totalXg.toFixed(2)} xG</small></div></header>
        <div className="shot-map"><div className="shot-area"/><div className="shot-six-yard"/><div className="shot-goal-frame"/><div className="shot-arc"/>{teamShots.map((event,i)=><span key={i} className={`shot-point ${side===0?"home-shot":"away-shot"} ${event.isGoal?"shot-goal":""}`} style={{left:`${Math.max(7,Math.min(91,(event.shotX-0.70)/0.30*100))}%`,top:`${event.shotY*100}%`,width:8+(event.xg||0.1)*17,height:8+(event.xg||0.1)*17}} title={`${event.minute}′ ${event.text} · xG ${(event.xg||0).toFixed(2)}`}/>)}</div>
        <div className="shot-channel-mini">{['Left','Centre','Right'].map((label,index)=><span key={label}><b>{allShots.filter(event=>event.zone===index).length}</b><small>{label}</small></span>)}</div>
      </div>;
    })}</div>
    {!shown.length&&<p className="shot-map-empty">Shot locations will appear as chances are created.</p>}
  </section>;
}

export default function LiveMatchScreen({ homeName, awayName, homeClubId, awayClubId, homeColor="#9c2736", awayColor="#3667a4", competition="PL", myName, oppName, timeline, stats, analysis, playerRatings, manOfTheMatch, shootout, homeFormation, awayFormation, onDone, banner }){
  const [minute, setMinute] = useState(0);
  const endMinute=Math.max(95,...timeline.map(e=>e.minute));
  const done=minute>=endMinute;
  const [tab, setTab] = useState("events");
  const timerRef = useRef(null);
  const feedRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setMinute(m => {
        if (m >= endMinute){ clearInterval(timerRef.current); return endMinute; }
        return m+1;
      });
    }, 110); // ~10 seconds for the full 90 minutes
    return () => clearInterval(timerRef.current);
  }, [endMinute]);

  const revealed = timeline.filter(e => e.minute <= minute);
  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [revealed.length]);

  function skip(){
    clearInterval(timerRef.current);
    setMinute(endMinute);
  }

  const homeGoals = revealed.filter(e => e.isGoal === true && e.teamName===homeName).length;
  const awayGoals = revealed.filter(e => e.isGoal === true && e.teamName===awayName).length;
  const revealedGoals=revealed.filter(event=>event.isGoal===true);
  const ICONS = { foul:"⚠️", goal:"⚽", penalty:"🎯", freekick:"🌀", corner:"🚩", yellow:"🟨", red:"🟥", chance:"➡️", var:"📺", offside:"🚫", "penalty-miss":"❌", "corner-miss":"🚩", sub:"🔄", tactics:"🧠" };
  const currentStats=stats?revealStats(stats,minute):null;
  const tabBtn = (key, label) => (
    <button onClick={()=>setTab(key)} style={{
      flex:1, padding:"8px 0", fontSize:12, fontWeight:700, borderRadius:8, border:"none", cursor:"pointer",
      background: tab===key ? "#2d6b3f" : "transparent", color: tab===key ? "#fff" : "#9ab89a"
    }}>{label}</button>
  );

  return (
    <div className="live-match-page competition-theme" style={{...competitionTheme(competition),"--home-club":homeColor||"#9c2736","--away-club":awayColor||"#3667a4"}}>
      {banner}
      <section className="live-scoreboard competition-theme" style={competitionTheme(competition)} aria-label={`${homeName} ${homeGoals}, ${awayName} ${awayGoals}`}>
        <div className="scoreboard-brand"><CompetitionMark id={competition} size="sm"/><span>{competitionBrand(competition).name.toUpperCase()}</span></div>
        <div className="scoreboard-main"><div className="scoreboard-club"><ScoreCrest clubId={homeClubId} name={homeName}/><strong>{homeName}</strong></div>
          <div className="scoreboard-score"><small>{done?"FULL TIME":minute>90?`90+${minute-90}'`:`${minute}'`}</small><b>{homeGoals}<i>:</i>{awayGoals}</b></div>
          <div className="scoreboard-club"><ScoreCrest clubId={awayClubId} name={awayName}/><strong>{awayName}</strong></div></div>
        <div className="scoreboard-live-data"><div><span>POSSESSION</span><strong>{currentStats?`${currentStats.possession[0]}% — ${currentStats.possession[1]}%`:"—"}</strong></div><div><span>SHOTS</span><strong>{currentStats?`${currentStats.shots[0]} — ${currentStats.shots[1]}`:"—"}</strong></div><div><span>EXPECTED GOALS</span><strong>{currentStats?`${currentStats.xg[0].toFixed(2)} — ${currentStats.xg[1].toFixed(2)}`:"—"}</strong></div></div>
        <div className="scoreboard-trim"/>
      </section>
      <GoalRibbon goals={revealedGoals} homeName={homeName} awayName={awayName} homeGoals={homeGoals} awayGoals={awayGoals}/>
      {shootout&&done?<ShootoutPanel shootout={shootout} homeName={homeName} awayName={awayName} homeClubId={homeClubId} awayClubId={awayClubId}/>:<MatchPulse events={revealed} minute={minute} endMinute={endMinute} homeName={homeName} awayName={awayName} homeColor={homeColor} awayColor={awayColor}/>} 

      {stats && (
        <div style={{ display:"flex", gap:6, background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:4, marginBottom:16 }}>
          {tabBtn("events", "Match feed")}{tabBtn("stats", "Match stats")}{tabBtn("shots", "Shot map")}{analysis && tabBtn("analysis", "Analysis")}{playerRatings&&tabBtn("lineup", "Lineup")}{playerRatings&&tabBtn("ratings", "Player Ratings")}
        </div>
      )}

      {tab==="events" || !stats ? (
        <div ref={feedRef} style={{ maxHeight:340, overflowY:"auto", display:"flex", flexDirection:"column", gap:6, marginBottom:20, padding:"2px 4px", background:"#0a120a", border:"1px solid #1c2b1c", borderRadius:10 }}>
          {revealed.length===0 && <div style={{ textAlign:"center", color:"#6a8a6a", fontSize:12, padding:"16px 0" }}>Kick-off…</div>}
          {revealed.map((e,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background: e.isGoal === true?"#132513":"#0e150e", border:"1px solid #1c2b1c", borderRadius:8, padding:"6px 12px", fontSize:12, margin:"0 6px" }}>
              <span style={{ color:"#6a8a6a", minWidth:28, fontWeight:700 }}>{e.minute>90?`90+${e.minute-90}`:e.minute}&apos;</span>
              <span style={{ fontSize:14 }}>{ICONS[e.type]}</span>
              <span>{e.text} <span style={{ color:"#6a8a6a" }}>({e.teamName})</span></span>
            </div>
          ))}
        </div>
      ) : tab==="stats" ? (
        <MatchStatsPanel stats={stats} minute={minute} events={revealed} />
      ) : tab==="shots" ? (
        <ShotMapPanel events={revealed} homeName={homeName} awayName={awayName} homeClubId={homeClubId} awayClubId={awayClubId}/>
      ) : tab==="analysis" ? (
        <TacticalBreakdown analysis={analysis} myName={myName} oppName={oppName} />
      ) : tab==="lineup" ? (
        <MatchLineupPanel ratings={playerRatings} events={revealed} homeName={homeName} awayName={awayName} homeClubId={homeClubId} awayClubId={awayClubId} homeFormation={homeFormation} awayFormation={awayFormation} done={done}/>
      ) : (
        <PlayerRatingsPanel ratings={playerRatings} manOfTheMatch={manOfTheMatch} homeName={homeName} awayName={awayName} done={done}/>
      )}

      <div className="live-match-action">
        {!done ? (
          <button onClick={skip} style={{ background:"transparent", border:"1px solid #2a3a2a", color:"#9ab89a", fontWeight:600, fontSize:13, padding:"10px 20px", borderRadius:9 }}>Skip to Full Time</button>
        ) : (
          <button onClick={onDone} style={primaryBtnStyle}>Continue →</button>
        )}
      </div>
    </div>
  );
}
