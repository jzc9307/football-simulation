import { useEffect, useRef } from 'react';
import { RotateCcw, Download, ArrowRight, X } from 'lucide-react';
import { lockPageScroll } from './pageScroll.js';
import './RestartCareer.css';

export default function RestartCareer({clubName,busy,error,onClose,onExport,onConfirm}){
  const dialog=useRef(null),cancel=useRef(null),busyRef=useRef(busy),closeRef=useRef(onClose);
  busyRef.current=busy;closeRef.current=onClose;
  useEffect(()=>{
    const previous=document.activeElement,release=lockPageScroll(document);
    cancel.current?.focus();
    const escape=e=>{if(e.key==='Escape'&&!busyRef.current)closeRef.current();};
    document.addEventListener('keydown',escape);
    return()=>{release();document.removeEventListener('keydown',escape);if(previous?.isConnected)previous.focus();};
  },[]);
  useEffect(()=>{if(busy)dialog.current?.focus();else cancel.current?.focus();},[busy]);
  function trapFocus(e){
    if(e.key!=='Tab')return;
    const nodes=[...e.currentTarget.querySelectorAll('button:not(:disabled)')];
    if(!nodes.length){e.preventDefault();return;}
    const first=nodes[0],last=nodes.at(-1);
    if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===dialog.current)){e.preventDefault();first.focus();}
  }
  return <div className="restart-backdrop" onClick={()=>{if(!busy)onClose();}}>
    <section ref={dialog} tabIndex={-1} className="restart-dialog" role="dialog" aria-modal="true" aria-labelledby="restart-title" aria-describedby="restart-description" aria-busy={busy} onClick={e=>e.stopPropagation()} onKeyDown={trapFocus}>
      <header><span><RotateCcw size={16}/> A FRESH KICK-OFF</span><button disabled={busy} onClick={onClose} aria-label="Close restart confirmation"><X size={20}/></button></header>
      <div className="restart-content"><h2 id="restart-title">Start a new career?</h2><p id="restart-description">{clubName?`Your ${clubName} career`:'Your current save'} will be replaced. Squads, results, transfers, contracts and finances reset to the beginning. You’ll choose a league and club again.</p>
        <button className="restart-backup" disabled={busy} onClick={onExport}><Download size={18}/><span><strong>Keep your story</strong><small>Export a backup before starting again.</small></span><ArrowRight size={17}/></button>
        {error&&<p className="restart-error" role="alert">{error} Your current career remains open. Export a backup, then retry.</p>}
        <p className="restart-note" role="status">{busy?'Saving your fresh start…':'Nothing changes until you confirm.'}</p>
      </div>
      <footer><button ref={cancel} disabled={busy} onClick={onClose}>Keep playing</button><button className="restart-confirm" disabled={busy} onClick={onConfirm}><RotateCcw size={16}/>{busy?'Starting…':'Restart career'}</button></footer>
    </section>
  </div>;
}
