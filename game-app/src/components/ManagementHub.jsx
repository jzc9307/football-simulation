import { useState } from 'react';
import { X, ShieldCheck, Trophy, Wallet, Clock3, ArrowUpRight, MessageCircle, Check, Sparkles, Heart, ArrowLeftRight } from 'lucide-react';
import { boardReport } from '../game/board.js';
import { conversationChoices } from '../game/conversations.js';
import { assistantAdvice } from '../game/assistantAdvice.js';
import { availableBudget, reservedBudget, formatMoney } from '../game/finance.js';
import { DEADLINE_HOURS } from '../game/deadlineDay.js';
import { allClubs } from '../game/career.js';
import { formatDate } from './calendarFormat.js';
import './ManagementHub.css';

export function PlayerConversation({state,message,onReply}){
  const [error,setError]=useState(''),choices=conversationChoices(state,message),reply=message.reply;
  if(!reply&&!choices.length)return null;
  return <section className="player-conversation" aria-label="Player conversation"><header><MessageCircle size={17}/><div><b>{reply?'Your conversation':'Your response'}</b><small>{reply?'A private exchange, saved in your inbox':'Your words matter. Promises are tracked.'}</small></div>{reply&&<span className="conversation-answered"><Check size={13}/> Replied</span>}</header>
    {reply?<div className="conversation-thread"><div className="manager-reply"><small>YOU · MANAGER</small><p>{reply.text}</p></div><div className="player-reply"><small>{message.playerCard.name}</small><p>{reply.answer}</p></div><footer><Heart size={14}/> Happiness {Math.round(reply.happinessBefore)} → {Math.round(reply.happinessAfter)}<b className={reply.happinessAfter>=reply.happinessBefore?'positive':'negative'}>{reply.happinessAfter>=reply.happinessBefore?'+':''}{Math.round(reply.happinessAfter-reply.happinessBefore)}</b></footer></div>:<div className="conversation-options">{choices.map(c=><button key={c.id} onClick={()=>{const result=onReply(message.id,c.id);setError(result?.error||'');}}><div><strong>{c.text}</strong><small>{c.detail}</small></div><span className={c.effect>=0?'positive':'negative'}><Heart size={12}/>{c.effect>0?'+':''}{c.effect}</span></button>)}</div>}
    {error&&<p className="management-error" role="alert">{error}</p>}
  </section>;
}
export function AssistantAdvice({state,onAction}){
  const tips=assistantAdvice(state);if(!tips.length)return null;
  return <section className="assistant-desk" aria-label="Assistant manager advice"><header><Sparkles size={15}/><b>Assistant’s notebook</b><span>FOR YOUR NEXT DECISION</span></header><div>{tips.map(t=><article key={t.id} className={t.tone==='warning'?'needs-attention':''}><small>{t.tone==='warning'?'WORTH YOUR ATTENTION':'SPORTING INSIGHT'}</small><h3>{t.title}</h3><p>{t.body}</p><button onClick={()=>onAction(t)}>{t.action}<ArrowUpRight size={14}/></button></article>)}</div></section>;
}
function ManagementDialog({label,kicker,title,onClose,children,footer,className=''}){
  return <div className="management-overlay" onClick={onClose}><section className={`management-sheet ${className}`} role="dialog" aria-modal="true" aria-label={label} onClick={e=>e.stopPropagation()}><header className="management-header"><div><small>{kicker}</small><h2>{title}</h2></div><button className="management-close" aria-label={`Close ${label}`} onClick={onClose}><X size={20}/></button></header><div className="management-scroll">{children}</div>{footer&&<footer className="management-footer">{footer}</footer>}</section></div>;
}
export function BoardHub({state,onClose}){
  const report=state.board?.review||boardReport(state),club=state.clubs.find(c=>c.id===state.myClubId);
  return <ManagementDialog label="Board objectives" kicker={`THE BOARDROOM · ${2025+state.season}/${String(2026+state.season).slice(-2)}`} title="Trust is built over a season." onClose={onClose} className="board-sheet" footer={<><ShieldCheck size={16}/><span>Overall review below 40 ends the career. One missed ambition is not an automatic dismissal.</span></>}>
    <section className="board-pulse"><div className="board-gauge" style={{'--confidence':`${report.confidence}%`}}><div><b>{report.confidence}</b><small>BOARD TRUST</small></div></div><div><span>{state.board?.status==='reviewed'?'SEASON VERDICT':'LIVE CONFIDENCE'}</span><h3>{report.dismissed?'Managerial contract ended':report.status}</h3><p>{club.name} · {state.board?.ambition||'Season ambitions'}</p><small>{state.board?.status==='reviewed'?'The full campaign has been reviewed.':'Targets reflect your squad’s quality. Early-season results are given time to settle.'}</small></div></section>
    <div className="board-objectives">{report.objectives.map(o=><article key={o.id}><i>{o.kind==='league'||o.kind==='domestic'||o.kind==='europe'?<Trophy size={20}/>:<Wallet size={20}/>}</i><div><small>{o.kind==='league'?'LEAGUE POSITION':o.kind==='domestic'?'DOMESTIC CUPS':o.kind==='europe'?'EUROPEAN NIGHTS':'CLUB FINANCES'}</small><h3>{o.title}</h3><p>{o.current}</p><div className="objective-progress" role="progressbar" aria-label={o.title} aria-valuenow={o.score} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${o.score}%`}}/></div></div><span className={o.achieved?'achieved':o.missed?'missed':''}>{o.achieved?<Check size={14}/>:null}{o.achieved?'On target':o.missed?'Below target':'In progress'}</span></article>)}</div>
    <aside className="board-note"><ShieldCheck size={19}/><div><b>Ambitious, with room for a story.</b><p>League results carry the most weight. A deep cup run and healthy finances help protect your job. Close finishes receive partial credit.</p></div></aside>
  </ManagementDialog>;
}
export function DeadlineHub({state,onClose,onAdvance,onMarket,onOffers,onMail,onContract}){
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),day=state.deadlineDay,remaining=DEADLINE_HOURS-day.hour,clubs=new Map(allClubs(state).map(c=>[c.id,c]));
  const talks=(state.market?.talks||[]).filter(t=>t.status==='pending'&&(t.buyerId===state.myClubId||t.sellerId===state.myClubId));
  const advance=async hours=>{if(busy)return;setBusy(true);try{const result=await onAdvance(hours);setError(result?.error||'');}finally{setBusy(false);}};
  return <ManagementDialog label="Deadline Day" kicker={`TRANSFER CONTROL · ${formatDate(day.date,{day:'numeric',month:'long'})}`} title={day.closed?'The window is closed.':'Every hour matters.'} onClose={onClose} className="deadline-sheet" footer={<><span className="deadline-fixed-date"><Clock3 size={15}/> Calendar held on {formatDate(day.date,{day:'numeric',month:'short'})}</span><div><button disabled={day.closed||busy} onClick={()=>advance(1)}>Advance 1 hour</button><button disabled={day.closed||busy} className="management-primary" onClick={()=>advance(2)}>Advance 2 hours <ArrowUpRight size={16}/></button></div></>}>
    <section className="deadline-hero"><div><small>{day.closed?'TIME IS UP':'UNTIL THE WINDOW CLOSES'}</small><h3>{remaining}<span>hours left</span></h3><p>{day.closed?'Scouting and free-agent talks stay open. Return to the calendar to continue.':'One- and two-hour skips stop at new approaches and player decisions.'}</p></div><div className="deadline-money"><small>AVAILABLE</small><b>{formatMoney(availableBudget(state))}</b><span>{formatMoney(reservedBudget(state))} reserved</span></div><div className="deadline-clock" aria-label={`${remaining} hours remaining`}>{Array.from({length:20},(_,i)=><i key={i} className={i<day.hour?'elapsed':''}/>)}</div></section>
    <nav className="deadline-tools"><button onClick={onMarket}><ArrowLeftRight size={17}/> Transfer Centre</button><button onClick={onOffers}>Received offers <b>{state.saleOffers?.length||0}</b></button><button onClick={onMail}><MessageCircle size={16}/> Mail</button></nav>
    {error&&<p className="management-error" role="alert">{error}</p>}
    <div className="deadline-columns"><section><header><small>YOUR DEAL ROOM</small><b>{talks.length} active talks</b></header>{!talks.length?<p className="management-empty">No active negotiations. Scout a final target or review approaches to your squad.</p>:talks.map(t=><article className="deadline-talk" key={t.id}><div><b>{t.playerName}</b><small>{clubs.get(t.buyerId)?.name} · {formatMoney(t.fee)}</small><span>{t.phase==='contract-ready'?'Personal terms ready':t.deadlineHour!=null?`Decision at hour ${t.deadlineHour}`:'Player decision pending'}</span></div>{t.buyerId===state.myClubId&&t.phase==='contract-ready'&&<button onClick={()=>onContract(t.id)}>Talk <ArrowUpRight size={14}/></button>}</article>)}</section><section><header><small>LIVE WIRE</small><b>From the final hours</b></header><div className="deadline-wire">{day.feed.map(e=><article key={e.id}><span>{String(e.hour).padStart(2,'0')}h</span><p>{e.text}</p></article>)}</div></section></div>
  </ManagementDialog>;
}
