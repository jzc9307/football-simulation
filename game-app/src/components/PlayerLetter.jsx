import { Heart, FileSignature, ArrowUpRight } from 'lucide-react';
import { formatDate } from './calendarFormat.js';
import { pounds } from '../game/finance.js';

export default function PlayerLetter({message,onPlayer,onRenew,onTransfer}) {
  const p=message.playerCard;
  if(!p)return null;
  const renewal=message.type==='renewal-invite',request=message.type==='transfer-request',opportunity=message.type==='player-opportunity',concern=message.type==='player-concern'||opportunity;
  return <section className={`player-letter-card ${request?'is-request':renewal?'is-renewal':'is-concern'}`}>
    <div className="player-letter-heading"><span>{renewal?<FileSignature size={16}/>:<Heart size={16}/>} {renewal?'READY TO COMMIT':request?'FORMAL TRANSFER REQUEST':opportunity?'READY FOR AN OPPORTUNITY':concern?'A PROMISE NEEDS ATTENTION':'CONTRACT UPDATE'}</span><small>PRIVATE · PLAYER &amp; MANAGER</small></div>
    <div className="player-letter-profile"><b>{p.ovr}<small>OVR</small></b><div><h3>{p.name}</h3><p>{p.role} · {p.squadRole==='key'?'Key player':p.squadRole==='starter'?'Regular starter':p.squadRole==='rotation'?'Rotation player':'Prospect'}</p></div></div>
    <div className="player-letter-facts"><div><small>HAPPINESS</small><strong>{p.happiness}/100</strong></div><div><small>CONTRACT ENDS</small><strong>{p.endDate?formatDate(p.endDate,{day:'numeric',month:'short',year:'numeric'}):'Not set'}</strong></div><div><small>WEEKLY WAGE</small><strong>{pounds(p.wage||0)}</strong></div></div>
    <div className="player-letter-actions">{(renewal||concern||request)&&<button className="mail-player-action" onClick={()=>renewal?onRenew(p.id):onPlayer(p.id)}>{renewal?'Discuss a new contract':'Review player & squad role'} <ArrowUpRight size={16}/></button>}{request&&<button className="mail-player-secondary" onClick={onTransfer}>Review club approaches →</button>}</div>
  </section>;
}
