import { BarChart3, Clock3, ShieldCheck, ChevronDown } from 'lucide-react';
import { playingTimeReport, SQUAD_ROLES } from '../game/playerLife.js';

export default function PlayingTimeTracker({player,club}){
  const r=playingTimeReport(player,club),duration=days=>days%7?`${Math.floor(days/7)}w ${Math.floor(days%7)}d`:`${days/7} weeks`;
  return <section className="playing-time-card" aria-label="Playing-time tracker">
    <header><div><span><BarChart3 size={15}/> PLAYING TIME</span><small>{SQUAD_ROLES[player.contract?.role]}{r.policy.backupKeeper?' · Reserve goalkeeper':''} · Last {r.matches.length || '0'} eligible matches</small></div><b className={player.life?.transferRequested?'is-request':r.warningReady?'is-concerned':''}>{r.status}</b></header>
    <div className="playing-time-overview">
      <div className="playing-time-metrics"><div><strong>{r.starts??'—'}</strong><small>Starts</small></div><div><strong>{r.substitutes??'—'}</strong><small>Sub appearances</small></div><div><strong>{r.minutes}<em>min</em></strong><small>Total minutes</small></div><div><strong>{r.meaningful}<em>/{r.matches.length}</em></strong><small>Meaningful appearances</small></div></div>
      <div className="playing-time-history" aria-label="Recent match involvement">{r.matches.length?<><div className="playing-time-bars">{r.matches.map((m,i)=><div key={`${m.date}:${i}`} className={m.minutes===0?'not-selected':m.started===true?'started':'cameo'} title={`${m.date||'Earlier match'} · ${m.minutes===0?'No appearance':m.started===true?'Started':m.started===false?'Substitute':'Appearance'} · ${m.minutes} minutes`}><i style={{height:`${Math.max(5,Math.min(100,m.minutes/95*100))}%`}}/><small>{m.minutes||'·'}</small></div>)}</div><footer><span><i/>Start</span><span><i/>Sub / earlier appearance</span><span>Oldest → latest</span></footer></>:<p className="playing-time-empty">Your first eligible match will start the picture. Injuries and suspensions don’t count as missed selections.</p>}</div>
    </div>
    <p className="playing-time-expectation">{r.expectations}</p>
    <div className="playing-time-comparison"><span>Without meaningful minutes <b>{r.missed} matches · {duration(r.days)}</b></span><span>First concern requires both <b>{r.policy.warn} matches + {duration(r.policy.warnDays)}</b></span></div>
    <div className="playing-time-context">{r.winning&&<span><ShieldCheck size={12}/> Winning form is easing frustration</span>}{r.injuryPaused&&<span><Clock3 size={12}/> Ineligible absence · patience clock paused</span>}{r.unknown&&<span>Earlier saves retain minutes; start/sub details are recorded from now on.</span>}</div>
    <details className="playing-time-explainer"><summary>How expectations are measured <ChevronDown size={14}/></summary><div>
      <p>A meaningful appearance for this role is <b>{r.threshold}+ minutes</b>. Useful substitute appearances count too; a last-minute cameo does not reset concern.</p>
      <div className="playing-time-gates"><span><small>CURRENT RUN WITHOUT MEANINGFUL MINUTES</small><b>{r.missed} eligible matches · {duration(r.days)}</b></span><span><small>FIRST CONCERN — BOTH REQUIRED</small><b>{r.policy.warn} matches · {duration(r.policy.warnDays)}</b></span><span><small>TRANSFER REQUEST — ALL REQUIRED</small><b>{Number.isFinite(r.policy.request)?`${r.policy.request} matches · ${duration(r.policy.requestDays)} · happiness ≤35`:'Never demanded over playing time'}</b></span></div>
      <p>{r.policy.backupKeeper?'Keeper depth increases patience without changing the promised contract role. ':''}These are minimum thresholds, not a deadline to pick the player. Team results and genuine involvement affect morale. A specific promise you make in mail is tracked separately.</p>
    </div></details>
  </section>;
}
