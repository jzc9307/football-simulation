import { autoLineup, freshState, topXI, clamp } from './engine.js';
import { FORMATIONS } from './config.js';

const POOLS=['plClubs','laligaClubs','serieaClubs','bundesligaClubs','ligue1Clubs','championshipClubs'];
const LEAGUE_POOL={PL:'plClubs',LALIGA:'laligaClubs',SERIEA:'serieaClubs',BUNDES:'bundesligaClubs',LIGUE1:'ligue1Clubs'};
export function allClubs(s){
  const map=new Map(POOLS.flatMap(k=>s[k]||[]).map(c=>[c.id,c]));
  s.clubs.forEach(c=>map.set(c.id,c));
  return [...map.values()];
}
function commitClubs(s,clubs){
  const byId=new Map(clubs.map(c=>[c.id,c]));
  return {...s,...Object.fromEntries(POOLS.map(k=>[k,(s[k]||[]).map(c=>byId.get(c.id)||c)])),
    clubs:s.clubs.map(c=>byId.get(c.id)||c)};
}
export function marketOpen(s){return s.stage==='squad'||s.stage==='squad2';}
export function loanFee(p){return Math.max(1,Math.round(p.value*0.1));}
function canRelease(club,p){
  const rest=club.players.filter(x=>x.id!==p.id);
  return rest.length>=16 && rest.filter(x=>x.role==='GK').length>=1 && topXI(rest,club.preferredFormation).length===11;
}
function numberFor(players){for(let n=1;n<=99;n++)if(!players.some(p=>p.number===n))return n;return 99;}
export function transfer(s,{type,playerId,sellerId}){
  if(!marketOpen(s))throw new Error('Transfers are available in the preseason and midseason windows.');
  const clubs=allClubs(s),me=clubs.find(c=>c.id===s.myClubId);
  const outgoing=type==='sell'||type==='loan-out';
  const seller=outgoing?me:clubs.find(c=>c.id===sellerId);
  const player=seller?.players.find(p=>p.id===playerId);
  if(!player||(!outgoing&&seller.id===me.id))throw new Error('This player is no longer available.');
  if(player.loan || s.loans.some(l=>l.playerId===player.id))throw new Error('A loan player cannot be sold or loaned again.');
  if(!canRelease(seller,player))throw new Error('The selling club must keep at least 16 players and a playable XI.');
  const isLoan=type==='loan-in'||type==='loan-out';
  const price=isLoan?loanFee(player):outgoing?Math.max(1,Math.round(player.value*0.9)):player.value;
  let buyer=me;
  if(outgoing){
    buyer=clubs.filter(c=>c.id!==me.id&&c.players.length<30&&(c.budget||0)>=price&&
      (!isLoan||s.loans.filter(l=>l.borrowerId===c.id).length<3)).sort((a,b)=>b.budget-a.budget)[0];
    if(!buyer)throw new Error('No club can currently afford this deal.');
  }
  if(buyer.players.length>=30)throw new Error('Maximum squad size is 30 players.');
  if(isLoan&&s.loans.filter(l=>l.borrowerId===buyer.id).length>=3)throw new Error('A club can have at most three incoming loans.');
  if(!outgoing&&s.budget<price)throw new Error('Not enough budget for this deal.');
  const moved={...player,club:buyer.id,number:numberFor(buyer.players),loan:isLoan};
  const updated=clubs.map(c=>c.id===seller.id?{...c,budget:(c.budget||0)+price,players:c.players.filter(p=>p.id!==player.id)}:
    c.id===buyer.id?{...c,budget:(c.budget||0)-price,players:[...c.players,moved]}:c);
  const next=commitClubs(s,updated);
  return {...next,budget:s.budget+(outgoing?price:-price),
    lineup:outgoing?Object.fromEntries(Object.entries(s.lineup).filter(([,id])=>id!==player.id)):s.lineup,
    loans:isLoan?[...s.loans,{playerId:player.id,ownerId:seller.id,borrowerId:buyer.id,endsSeason:s.season}]:s.loans,
    finances:[...s.finances,{season:s.season,type,player:player.name,amount:outgoing?price:-price}].slice(-100)};
}
export function startNextSeason(s){
  if(!s.tableFinal)throw new Error('Finish the league season first.');
  if(s.ucl&&s.ucl.stage!=='final')throw new Error('Finish your Champions League campaign first.');
  let clubs=allClubs(s).map(c=>({...c,players:c.players.map(p=>({...p}))}));
  for(const loan of s.loans){
    const owner=clubs.find(c=>c.id===loan.ownerId),borrower=clubs.find(c=>c.id===loan.borrowerId);
    const player=borrower?.players.find(p=>p.id===loan.playerId);
    if(!owner||!player)continue;
    borrower.players=borrower.players.filter(p=>p.id!==player.id);
    owner.players.push({...player,club:owner.id,loan:false,number:numberFor(owner.players)});
  }
  const development=[];
  clubs=clubs.map(c=>({...c,players:c.players.map(p=>{
    const delta=p.age<24&&p.appearances>=10?1:p.age>=32?-1:0;
    if(c.id===s.myClubId&&delta)development.push(`${p.name}: ${p.ovr} → ${clamp(p.ovr+delta,45,95)}`);
    return {...p,age:p.age+1,ovr:clamp(p.ovr+delta,45,95),value:Math.max(1,Math.round(p.value*(delta>0?1.08:delta<0?0.9:1))),condition:100,appearances:0};
  })}));
  const rank=s.tableFinal.findIndex(r=>r.id===s.myClubId)+1;
  const grant=10+(s.clubs.length-rank+1)*2;
  const me=clubs.find(c=>c.id===s.myClubId);
  me.budget=s.budget+grant;
  const next=commitClubs(s,clubs),fresh=freshState();
  return {...next,season:s.season+1,stage:'squad',budget:me.budget,loans:[],
    half:1,roundIndex:0,roundsHalf1:null,roundsHalf2:null,tableRaw:null,table1:null,tableFinal:null,
    results1:[],results2:[],lastResult:null,lastCupResult:null,lastLiveContext:null,
    cupStatus:fresh.cupStatus,cups:fresh.cups,ucl:null,suspensions:fresh.suspensions,
    lineup:autoLineup(FORMATIONS[s.formation],me.players),development,
    history:[...s.history,{season:s.season,rank,club:me.name,ucl:s.cups.ucl?.outcome||null}],
    finances:[...s.finances,{season:s.season+1,type:'Season funding',amount:grant}].slice(-100),
    [LEAGUE_POOL[s.league]]:next.clubs};
}
