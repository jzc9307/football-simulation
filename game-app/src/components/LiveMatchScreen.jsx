import { revealStats } from "../game/engine.js";
import {useState,useEffect,useRef} from "react";
const primaryBtnStyle={background:"#2d6b3f",color:"white",padding:"12px 28px",borderRadius:10,border:0};
function PossessionBar({ home, away }){
  return (
    <div style={{ display:"flex", borderRadius:8, overflow:"hidden", height:36, marginBottom:14 }}>
      <div style={{ width:`${home}%`, background:"#8b2020", display:"flex", alignItems:"center", justifyContent:"flex-start", paddingLeft:12, color:"#fff", fontWeight:800, fontSize:14, transition:"width 300ms" }}>{home}%</div>
      <div style={{ width:`${away}%`, background:"#e8e8e8", display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:12, color:"#111", fontWeight:800, fontSize:14, transition:"width 300ms" }}>{away}%</div>
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
function MatchStatsPanel({ stats, minute }){
  const s = revealStats(stats, minute);
  return (
    <div style={{ marginBottom:20 }}>
      <PossessionBar home={s.possession[0]} away={s.possession[1]} />
      <StatRow label="Expected goals (xG)" left={s.xg[0].toFixed(2)} right={s.xg[1].toFixed(2)} />
      <StatRow label="Total shots" left={s.shots[0]} right={s.shots[1]} />
      <StatRow label="Shots on target" left={s.sot[0]} right={s.sot[1]} />
      <StatRow label="Touches in opposition box" left={s.touches[0]} right={s.touches[1]} />
      <StatRow label="Big chances" left={s.bigChances[0]} right={s.bigChances[1]} />
      <StatRow label="Big chances missed" left={s.bigChancesMissed[0]} right={s.bigChancesMissed[1]} />
      <StatRow label="Accurate passes" left={`${s.accPasses[0]} (${s.passAcc[0]}%)`} right={`${s.accPasses[1]} (${s.passAcc[1]}%)`} />
      <StatRow label="Fouls committed" left={s.fouls[0]} right={s.fouls[1]} />
      <StatRow label="Offsides" left={s.offsides[0]} right={s.offsides[1]} />
      <StatRow label="Corners" left={s.corners[0]} right={s.corners[1]} />
    </div>
  );
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
        </div>
        <div>
          <div style={{ fontWeight:700, color:"#e8ede8", marginBottom:3 }}>{oppName}</div>
          <div>Attack {a.ratings.opp.attack.toFixed(1)} · Defense {a.ratings.opp.defense.toFixed(1)}</div>
          <div>Style: {a.styleOppName} ({fmtPct(a.styleBonusOpp)} attack)</div>
          <div>Line/trap: {fmtPct(a.lineOpp.attackAdj)} att, {fmtPct(a.lineOpp.defenseAdj)} def</div>
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
export default function LiveMatchScreen({ homeName, awayName, myName, oppName, timeline, stats, analysis, onDone, banner }){
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
  const ICONS = { goal:"⚽", penalty:"🎯", freekick:"🌀", corner:"🚩", yellow:"🟨", red:"🟥", chance:"➡️", var:"📺", offside:"🚫", "penalty-miss":"❌", "corner-miss":"🚩", sub:"🔄", tactics:"🧠" };
  const tabBtn = (key, label) => (
    <button onClick={()=>setTab(key)} style={{
      flex:1, padding:"8px 0", fontSize:12, fontWeight:700, borderRadius:8, border:"none", cursor:"pointer",
      background: tab===key ? "#2d6b3f" : "transparent", color: tab===key ? "#fff" : "#9ab89a"
    }}>{label}</button>
  );

  return (
    <div>
      {banner}
      <div style={{ textAlign:"center", marginBottom:16 }}>
        <div style={{ fontSize:12, color: done?"#e8b84b":"#7fd88f", fontWeight:700, marginBottom:6 }}>{done ? "FULL TIME" : minute>90?`90+${minute-90}'`:`${minute}'`}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, flexWrap:"wrap" }}>
          <div style={{ fontWeight:700, fontSize:16 }}>{homeName}</div>
          <div style={{ fontSize:34, fontWeight:800 }}>{homeGoals} - {awayGoals}</div>
          <div style={{ fontWeight:700, fontSize:16 }}>{awayName}</div>
        </div>
      </div>

      {stats && (
        <div style={{ display:"flex", gap:6, background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:4, marginBottom:16 }}>
          {tabBtn("events", "Events")}{tabBtn("stats", "Stats")}{analysis && tabBtn("analysis", "Analysis")}
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
        <MatchStatsPanel stats={stats} minute={minute} />
      ) : (
        <TacticalBreakdown analysis={analysis} myName={myName} oppName={oppName} />
      )}

      <div style={{ textAlign:"center" }}>
        {!done ? (
          <button onClick={skip} style={{ background:"transparent", border:"1px solid #2a3a2a", color:"#9ab89a", fontWeight:600, fontSize:13, padding:"10px 20px", borderRadius:9 }}>Skip to Full Time</button>
        ) : (
          <button onClick={onDone} style={primaryBtnStyle}>Continue →</button>
        )}
      </div>
    </div>
  );
}

