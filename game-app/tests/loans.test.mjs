import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,autoLineup,ensureFixtures} from '../src/game/engine.js';
import {FORMATIONS} from '../src/game/config.js';
import {allClubs,listPlayerForLoan,listPlayerForSale,unlistPlayer,counterLoanOffer,recallLoan,loanRecallFine,loanEndDate,returnExpiredLoans,startNextSeason,advanceSaleOffers} from '../src/game/career.js';
import {prepareNextFixture} from '../src/game/seasonFlow.js';
import {saveGame,loadGame} from '../src/game/storage.js';
function game(){const s=freshState(),me=s.plClubs.find(c=>c.id==='liv');return ensureFixtures({...s,league:'PL',clubs:s.plClubs,myClubId:me.id,budget:me.budget,formation:me.preferredFormation,lineup:autoLineup(FORMATIONS[me.preferredFormation],me.players),stage:'squad',simMode:'match',currentDate:'2026-08-15',scheduleMigrationDone:true});}
const base={...prepareNextFixture(game()),stage:'squad',currentDate:'2026-08-15',activeFixtureId:null},player=base.clubs.find(c=>c.id==='liv').players.find(p=>p.name.includes('Leoni'));
function agree(duration=1){let s=listPlayerForLoan(base,player.id),offer=s.saleOffers[0];if(duration!==offer.seasons){const r=counterLoanOffer(s,{offerId:offer.id,seasons:duration});assert.equal(r.status,'counter');s=r.state;}const r=counterLoanOffer(s,{offerId:offer.id,seasons:duration});assert.equal(r.status,'accepted');return r.state;}
test('unlisting clears sale and loan offers and follow-ups without moving players',()=>{
  for(const list of [listPlayerForSale,listPlayerForLoan]){const listed=list(base,player.id),s=unlistPlayer(listed,player.id);assert.ok(!s.saleListings?.includes(player.id));assert.ok(!s.loanListings?.includes(player.id));assert.equal(s.saleOffers.length,0);assert.equal(s.saleFollowUps.length,0);assert.deepEqual(s.lineup,base.lineup);assert.equal(s.budget,base.budget);}
});
test('loan listing remains usable; queued approaches use loan terms rather than money',()=>{
  const s=listPlayerForLoan(base,player.id);assert.ok(s.loanListings.includes(player.id));assert.equal(allClubs(s).find(c=>c.id==='liv').players.length,30);assert.deepEqual(s.lineup,base.lineup);assert.equal(s.budget,base.budget);
  const r=advanceSaleOffers(s,'2026-08-25');assert.ok(r.arrived);assert.ok(r.state.saleOffers.every(o=>o.kind==='loan'&&o.seasons>=.5));
});
test('all half-season terms from .5 to 3 are negotiable and create single ownership contracts',()=>{
  for(const term of [.5,1,1.5,2,2.5,3]){const s=agree(term),loan=s.loans.find(l=>l.playerId===player.id);assert.equal(loan.seasons,term);assert.equal(loan.endsDate,loanEndDate(base.currentDate,term));assert.equal(s.budget,base.budget);assert.equal(allClubs(s).flatMap(c=>c.players).filter(p=>p.id===player.id).length,1);assert.ok(!s.clubs.find(c=>c.id==='liv').players.some(p=>p.id===player.id));assert.equal(s.saleOffers.length,0);assert.equal(s.saleFollowUps.length,0);assert.ok(!s.loanListings.includes(player.id));}
});
test('summer and winter loans return at January/June boundaries, never before departure',()=>{
  assert.equal(loanEndDate('2026-08-15',.5),'2027-01-31');assert.equal(loanEndDate('2026-08-15',1),'2027-06-30');assert.equal(loanEndDate('2026-08-15',3),'2029-06-30');assert.equal(loanEndDate('2027-01-15',.5),'2027-06-30');assert.equal(loanEndDate('2027-01-15',1),'2028-01-31');
});
test('recall charges disclosed compensation and returns player once, even outside window',()=>{
  const s=agree(),loan=s.loans[0],borrower=allClubs(s).find(c=>c.id===loan.borrowerId),fine=loanRecallFine(player),r=recallLoan({...s,currentDate:'2026-10-01'},player.id);
  assert.equal(r.budget,s.budget-fine);assert.equal(allClubs(r).find(c=>c.id===borrower.id).budget,borrower.budget+fine);assert.ok(r.clubs.find(c=>c.id==='liv').players.some(p=>p.id===player.id&&!p.loan));assert.equal(r.loans.length,0);assert.ok(r.mail[0].subject.includes('back'));assert.throws(()=>recallLoan(r,player.id));assert.equal(loanRecallFine({value:100}),2);assert.throws(()=>recallLoan({...s,budget:0},player.id),/Not enough/);
});
test('automatic return has no fine, writes mail, is idempotent and interrupts the calendar',()=>{
  const s=agree(.5),loan=s.loans[0];assert.equal(returnExpiredLoans(s,'2027-01-30').loans.length,1);const r=returnExpiredLoans(s,loan.endsDate);assert.equal(r.loans.length,0);assert.equal(r.budget,s.budget);assert.ok(r.mail[0].subject.includes('back'));assert.equal(returnExpiredLoans(r,'2027-02-01').mail.length,r.mail.length);
  const scheduled=s.seasonSchedule.filter(e=>e.date>'2027-01-31').map(e=>({...e,status:'scheduled'}));const stop=prepareNextFixture({...s,currentDate:'2027-01-30',seasonSchedule:scheduled});assert.equal(stop.currentDate,'2027-01-31');assert.equal(stop.stage,'calendar-event');assert.equal(stop.loans.length,0);
});
test('long contracts survive save reload and next season; ending contracts return with email',()=>{
  const s=agree(3),values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};saveGame(storage,s);const loaded=loadGame(storage);assert.equal(loaded.loans[0].endsDate,'2029-06-30');
  const finish=state=>({...state,ucl:null,uel:null,uecl:null,tableFinal:state.clubs.map((c,i)=>({id:c.id,rank:i+1,pts:60-i,gf:50,ga:30,played:38}))});
  const next=startNextSeason(finish(loaded));assert.equal(next.loans.length,1);assert.ok(!next.clubs.find(c=>c.id==='liv').players.some(p=>p.id===player.id));const ended=startNextSeason(finish(agree(1)));assert.equal(ended.loans.length,0);assert.ok(ended.clubs.find(c=>c.id==='liv').players.some(p=>p.id===player.id));assert.ok(ended.mail.some(m=>m.subject.includes('back from loan')));
});
test('invalid durations, double loans and closed-window agreements are blocked',()=>{
  const s=listPlayerForLoan(base,player.id),offer=s.saleOffers[0];for(const term of [0,.25,3.5,NaN])assert.throws(()=>counterLoanOffer(s,{offerId:offer.id,seasons:term}));assert.throws(()=>counterLoanOffer({...s,currentDate:'2026-09-01'},{offerId:offer.id,seasons:1}));const accepted=agree();assert.throws(()=>listPlayerForLoan(accepted,player.id));
});
