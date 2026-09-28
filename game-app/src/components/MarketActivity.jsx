import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, ChevronLeft, Clock3, ShieldCheck, Sparkles, X } from 'lucide-react';
import { allClubs } from '../game/career.js';
import { playerInterest } from '../game/market.js';
import { formatMoney, reservedBudget } from '../game/finance.js';
import { formatDate } from './calendarFormat.js';
import { lockPageScroll } from './pageScroll.js';
import './MarketActivity.css';

export function ClubInterest({state,playerId,renderBadge}) {
  const approaches=playerInterest(state,playerId);
  const [expanded,setExpanded]=useState(false);
  return <section className="club-interest" aria-label="Club interest">
    <header><div><Activity size={15}/><h3>Club interest</h3><b>{approaches.length}</b></div><span>{approaches.length?'LIVE TALKS':'MONITORING'}</span></header>
    {!approaches.length?<p className="interest-quiet">No clubs are currently in talks. New approaches appear here.</p>:<>
      <div className="interest-list">{(expanded?approaches:approaches.slice(0,3)).map(t=><div className={`interest-row ${t.buyerId===state.myClubId?'is-yours':''}`} key={t.id}>
        {renderBadge(t.club)}<div><strong>{t.club.name}{t.buyerId===state.myClubId&&<em>YOU</em>}</strong><small><i/>{t.label}</small></div><b>{t.kind==='loan'?`${t.seasons} season${t.seasons===1?'':'s'}`:formatMoney(t.amount)}</b>
      </div>)}</div>
      {approaches.length>3&&<button className="interest-expand" onClick={()=>setExpanded(!expanded)}>{expanded?'Show less':`View all ${approaches.length} clubs`} <ArrowUpRight size={13}/></button>}
      <footer><ShieldCheck size={13}/> A fee agreement is not a confirmed signing.</footer>
    </>}
  </section>;
}
export function ActiveTalks({state,onClose,onCancel,onPlayer,onOffers,onContract,renderBadge}) {
  const [tab,setTab]=useState('yours');
  useEffect(()=>lockPageScroll(document),[]);
  const clubs=new Map(allClubs(state).map(c=>[c.id,c]));
  const own=t=>t.buyerId===state.myClubId||t.sellerId===state.myClubId;
  const offers=(state.saleOffers||[]).filter(o=>o.status==='pending').map(o=>({...o,sellerId:state.myClubId,fee:o.amount,phase:'offer',status:'pending'}));
  const active=[...(state.market?.talks||[]).filter(t=>t.status==='pending'),...(state.market?.invitations||[]),...offers];
  const source=tab==='recent'?(state.market?.history||[]).filter(t=>t.status==='signed'||own(t)).slice(0,30):active.filter(t=>tab==='yours'?own(t):!own(t));
  const groups=new Map();for(const t of source){if(!groups.has(t.playerId))groups.set(t.playerId,[]);groups.get(t.playerId).push(t);}
  return <div className="market-talks-shell" role="dialog" aria-modal="true" aria-label="Active Talks">
    <header className="transfer-header"><button className="transfer-back" onClick={onClose}><ChevronLeft size={18}/>Transfer Centre</button><div className="transfer-brand"><span>THE DEAL TRACKER</span><strong>Active Talks</strong></div><div className="transfer-budget"><small>YOUR RESERVED FUNDS</small><strong>{formatMoney(reservedBudget(state))}</strong></div></header>
    <main className="talks-content"><div className="talks-heading"><div><span className="market-eyebrow">INTELLIGENT RECRUITMENT</span><h2>The market is moving.</h2><p>Track the clubs, the bids and the next decision. Only confirmed deals move players.</p></div><Activity size={38}/></div>
      <nav className="talks-tabs">{[['yours','Your negotiations'],['world','Around the market'],['recent','Recent decisions']].map(([key,label])=><button key={key} onClick={()=>setTab(key)} className={tab===key?'active':''}>{label}{key!=='recent'&&<b>{active.filter(t=>key==='yours'?own(t):!own(t)).length}</b>}</button>)}</nav>
      <div className="talks-grid">{[...groups].map(([id,talks])=>{
        const seller=clubs.get(talks[0].sellerId),p=seller?.players.find(p=>p.id===id)||allClubs(state).flatMap(c=>c.players).find(p=>p.id===id);
        return <article className="talks-player" key={id}><header><b>{p?.ovr||'–'}<small>OVR</small></b><div><span>{p?.role||'PLAYER'} · {seller?.name}</span><h3>{p?.name||talks[0].playerName}</h3><small>{talks.length} club{talks.length===1?'':'s'} in the picture</small></div>{p&&seller?.id!==state.myClubId&&tab!=='recent'&&<button onClick={()=>onPlayer(p,seller)} aria-label={`View ${p.name}`}><ArrowUpRight size={19}/></button>}</header>
          {talks.map(t=><div className="talks-bid" key={t.id}>{renderBadge(clubs.get(t.buyerId))}<div><strong>{clubs.get(t.buyerId)?.name}</strong><small>{t.phase==='contract-ready'?'Personal terms ready':t.phase==='player-talks'?'Player is negotiating personal terms':t.phase==='invitation'?'Your approval needed · no funds reserved':t.phase==='offer'?(t.openingDealId?'Opening-window offer':t.unsolicited?'Unsolicited approach':'Offer received'):t.status==='signed'?'Signing confirmed':t.status==='lost'?'Player chose another club':t.status==='cancelled'?'Talks ended':t.phase==='fee-agreed'?'Fee agreed · player deciding':t.reason}</small>{t.openingDealId&&<small className="talks-replay-label">2026 OPENING REPLAY · IN-GAME VALUATION</small>}{t.dueDate&&t.status==='pending'&&t.phase!=='invitation'&&t.phase!=='contract-ready'&&<small className="talk-decision"><Clock3 size={12}/>Decision {formatDate(t.dueDate,{day:'numeric',month:'short'})}</small>}</div><div className="talks-fee"><b>{t.phase==='invitation'?'TARGET':t.kind==='loan'?(t.seasons===.5?'Half-season':`${t.seasons} season${t.seasons===1?'':'s'}`):formatMoney(t.fee)}</b>{t.phase==='invitation'?<><button onClick={()=>onPlayer(p,seller)}>Review target →</button><button onClick={()=>onCancel(t.id)}>Dismiss</button></>:t.phase==='offer'?<button onClick={onOffers}>Review →</button>:t.phase==='contract-ready'?<><button onClick={()=>onContract(t.id)}>Contract talks →</button><button onClick={()=>onCancel(t.id)}>Withdraw</button></>:(t.buyerId===state.myClubId||t.sellerId===state.myClubId)&&t.status==='pending'?<button onClick={()=>onCancel(t.id)}>Withdraw</button>:<span>{t.status==='pending'?'IN TALKS':t.status.toUpperCase()}</span>}</div></div>)}
        </article>;
      })}</div>
      {!groups.size&&<div className="talks-empty"><Activity size={32}/><h3>{tab==='world'?'Quiet for now':'Nothing pending'}</h3><p>{tab==='world'&&state.season===1?'Verified opening-window moves appear on the calendar. Players already at the correct club are not transferred again.':'New approaches and decisions appear as the career calendar advances.'}</p></div>}
    </main>
  </div>;
}
export function SigningDecision({notice,state,onClose,onContract,renderBadge}) {
  const winner=allClubs(state).find(c=>c.id===notice.buyerId);
  useEffect(()=>lockPageScroll(document),[]);
  const success=notice.status==='signed';
  const ready=notice.status==='contract-ready';
  return <div className="signing-decision-backdrop" role="dialog" aria-modal="true" aria-label={ready?'Personal terms ready':success?'Transfer confirmed':'Transfer unsuccessful'}>
    <section className={`signing-decision ${success||ready?'is-success':'is-failed'}`}><button className="decision-close" onClick={onClose} aria-label="Close signing decision"><X size={20}/></button><div className="decision-orbit"><i/><i/>{success||ready?<Sparkles size={30}/>:<ArrowUpRight size={30}/>}</div><span>{ready?'PLAYER CHOSE YOUR PROJECT':success?'TRANSFER CONFIRMED':'PLAYER DECISION'}</span><h2>{notice.playerName}</h2>{winner&&<div className="decision-club">{renderBadge(winner)}<strong>{ready?'Personal terms with':notice.outgoing?'Joins':success?'Welcome to':'Chose'} {winner.name}</strong></div>}<p>{notice.reason}</p><div className="decision-money"><ShieldCheck size={17}/>{ready?`${formatMoney(notice.fee)} reserved · contract still required`:success?notice.outgoing?`${formatMoney(notice.fee)} received · player has departed`:`${formatMoney(notice.fee)} paid · player added to your squad`:notice.outgoing?'Player remains in your squad · no fee received':`${formatMoney(notice.fee)} reservation released · no fee charged`}</div><button className="submit-offer" onClick={()=>ready?onContract(notice.talkId):onClose()}>{ready?'Open personal contract talks →':'Return to your career →'}</button></section>
  </div>;
}
