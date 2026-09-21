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
export function projectedPotential(p){
  if(Number.isFinite(p.potential))return clamp(p.potential,p.ovr,96);
  const growth=p.age<=18?7:p.age<=20?5:p.age<=22?4:p.age<=24?2:p.age===25?1:0;
  return clamp(p.ovr+growth,p.ovr,96);
}
export function loanFee(p){
  const rate=p.ovr>=82?0.15:p.ovr>=78?0.11:0.08;
  return Math.max(1,Math.round(p.value*rate));
}
function canRelease(club,p){
  const rest=club.players.filter(x=>x.id!==p.id);
  return rest.length>=16 && rest.filter(x=>x.role==='GK').length>=1 && topXI(rest,club.preferredFormation).length===11;
}
function numberFor(players){for(let n=1;n<=99;n++)if(!players.some(p=>p.number===n))return n;return 99;}
function stableFraction(value){
  let hash=2166136261;
  for(const char of value){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}
  return (hash>>>0)/4294967295;
}
export function transferTerms(s,sellerId,playerId){
  const clubs=allClubs(s),seller=clubs.find(c=>c.id===sellerId),player=seller?.players.find(p=>p.id===playerId);
  if(!seller||!player)throw new Error('This player is no longer available.');
  const squadAverage=seller.players.reduce((sum,p)=>sum+p.ovr,0)/Math.max(1,seller.players.length);
  const clubPower=[...seller.players].sort((a,b)=>b.ovr-a.ovr).slice(0,5).reduce((sum,p)=>sum+p.ovr,0)/Math.min(5,seller.players.length);
  const sameRole=seller.players.filter(p=>p.group===player.group).length;
  const squadRank=[...seller.players].sort((a,b)=>b.ovr-a.ovr||b.value-a.value).findIndex(p=>p.id===player.id);
  const potential=projectedPotential(player);
  const ratingPremium=player.ovr>=90?0.2:player.ovr>=88?0.12:player.ovr>=85?0.07:player.ovr>=82?0.03:0;
  const agePremium=player.age<=18?0.16:player.age<=21?0.12:player.age<=24?0.07:player.age>=32?-0.1:player.age>=30?-0.05:0;
  const potentialPremium=potential>=92?0.1:potential>=89?0.06:potential>=86?0.03:0;
  const importancePremium=squadRank<3?0.1:squadRank<6?0.05:player.ovr>=squadAverage+4?0.03:0;
  const clubPremium=clubPower>=87?0.06:clubPower>=84?0.04:clubPower>=81?0.02:0;
  const depthPremium=sameRole<=3?0.04:sameRole<=5?0.02:0;
  const formPremium=Math.max(-0.025,Math.min(0.04,(player.confidence||0)*0.02));
  const seed=stableFraction(`${seller.id}:${player.id}`);
  const multiplier=1.02+ratingPremium+agePremium+potentialPremium+importancePremium+clubPremium+depthPremium+formPremium+seed*0.04;
  const askingPrice=Math.max(1,Math.round(player.value*multiplier));
  const strictness=clamp((ratingPremium+agePremium+potentialPremium+importancePremium+clubPremium)/0.62,0,1);
  const minimumPrice=Math.max(player.value,Math.round(askingPrice*(0.88+strictness*0.07+seed*0.02)));
  const releaseAllowed=canRelease(seller,player);
  const stance=!releaseAllowed?'Not for sale':strictness>=0.78?'Club cornerstone':potential>=89&&player.age<=23?'Protected prospect':importancePremium>=0.1?'Key player':'Open to offers';
  return {seller,player,askingPrice,minimumPrice,marketValue:player.value,potential,strictness,stance,releaseAllowed,seed};
}
export function loanTerms(s,sellerId,playerId){
  const clubs=allClubs(s),seller=clubs.find(c=>c.id===sellerId),player=seller?.players.find(p=>p.id===playerId);
  if(!seller||!player)throw new Error('This player is no longer available.');
  const releaseAllowed=canRelease(seller,player);
  const potential=projectedPotential(player);
  const rank=[...seller.players].sort((a,b)=>b.ovr-a.ovr||b.value-a.value).findIndex(p=>p.id===player.id);
  const firstChoice=new Set(topXI(seller.players,seller.preferredFormation).map(p=>p.id));
  const seed=stableFraction(`loan:${seller.id}:${player.id}`);
  let reason='Available for a season loan';
  if(!releaseAllowed)reason='The club cannot release another squad player';
  else if(player.ovr>=86)reason='Elite players are not available for loan';
  else if(potential>=92&&player.ovr>=82)reason='The club will not loan out its prized prospect';
  else if(rank<6&&player.ovr>=80)reason='The club considers him a core player';
  else if(firstChoice.has(player.id)&&player.ovr>=78)reason='He is part of the first-team plans';
  else if(player.ovr>=82&&seed<0.75)reason='The club rejected a loan approach at this level';
  const available=reason==='Available for a season loan';
  return {seller,player,available,reason,fee:loanFee(player),potential};
}
export function evaluateOffer(s,{sellerId,playerId,offer,round=1},rng=Math.random){
  const terms=transferTerms(s,sellerId,playerId);
  const amount=Math.max(0,Math.round(Number(offer)||0));
  if(!terms.releaseAllowed)return {...terms,status:'rejected',message:'The club cannot sell without leaving a playable squad.'};
  if(amount>s.budget)return {...terms,status:'invalid',message:'That offer is above your available budget.'};
  if(amount>=terms.askingPrice)return {...terms,status:'accepted',fee:amount,message:'The club accepted your offer.'};
  const ratio=amount/terms.minimumPrice;
  const acceptanceChance=ratio>=1?Math.min(0.72,0.12+round*0.12+(ratio-1)*1.2-terms.strictness*0.1):0;
  if(acceptanceChance>0&&rng()<acceptanceChance)return {...terms,status:'accepted',fee:amount,message:'The club accepted after considering the structure of your offer.'};
  if(round>=3||amount<terms.minimumPrice*0.72)return {...terms,status:'rejected',message:round>=3?'The club has ended negotiations.':'The club considers the offer far below the player’s value.'};
  const baseConcession=[0,0.98,0.955,0.94][Math.min(3,round)]||0.94;
  const concession=1-(1-baseConcession)*(1-terms.strictness*0.65);
  const counter=Math.max(terms.minimumPrice,Math.round(terms.askingPrice*concession));
  return {...terms,status:'counter',counter,message:`The club wants ${counter}m to complete the deal.`};
}
export function transfer(s,{type,playerId,sellerId,fee}){
  if(!marketOpen(s))throw new Error('Transfers are available in the preseason and midseason windows.');
  const clubs=allClubs(s),me=clubs.find(c=>c.id===s.myClubId);
  const outgoing=type==='sell'||type==='loan-out';
  const seller=outgoing?me:clubs.find(c=>c.id===sellerId);
  const player=seller?.players.find(p=>p.id===playerId);
  if(!player||(!outgoing&&seller.id===me.id))throw new Error('This player is no longer available.');
  if(player.loan || s.loans.some(l=>l.playerId===player.id))throw new Error('A loan player cannot be sold or loaned again.');
  if(!canRelease(seller,player))throw new Error('The selling club must keep at least 16 players and a playable XI.');
  const isLoan=type==='loan-in'||type==='loan-out';
  if(isLoan){
    const loan=loanTerms(s,seller.id,player.id);
    if(!loan.available)throw new Error(loan.reason+'.');
  }
  const terms=!outgoing&&!isLoan?transferTerms(s,seller.id,player.id):null;
  const agreedFee=Number.isFinite(fee)?Math.round(fee):terms?.askingPrice;
  if(terms&&agreedFee<terms.minimumPrice)throw new Error(`The selling club will not accept less than £${terms.minimumPrice}m.`);
  const price=isLoan?loanFee(player):outgoing?Math.max(1,Math.round(player.value*0.9)):agreedFee;
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
    if(c.id===s.myClubId&&delta)development.push({
      id:p.id,name:p.name,from:p.ovr,to:clamp(p.ovr+delta,45,95),delta
    });
    return {...p,age:p.age+1,ovr:clamp(p.ovr+delta,45,95),value:Math.max(1,Math.round(p.value*(delta>0?1.08:delta<0?0.9:1))),condition:100,energy:100,appearances:0,
      confidence:0,seasonGoals:0,seasonAssists:0,seasonCleanSheets:0,seasonYellowCards:0,seasonRedCards:0,ratingTotal:0,ratedMatches:0,bestRating:0,motm:0,seasonMinutes:0,lastRating:null,lastConfidenceChange:0,competitionStats:{}};
  })}));
  const rank=s.tableFinal.findIndex(r=>r.id===s.myClubId)+1;
  const grant=10+(s.clubs.length-rank+1)*2;
  const me=clubs.find(c=>c.id===s.myClubId);
  me.budget=s.budget+grant;
  const next=commitClubs(s,clubs),fresh=freshState();
  return {...next,season:s.season+1,stage:'squad',budget:me.budget,loans:[],
    half:1,roundIndex:0,roundsHalf1:null,roundsHalf2:null,tableRaw:null,table1:null,tableFinal:null,
    results1:[],results2:[],clubForm:{},lastResult:null,lastCupResult:null,lastLiveContext:null,
    cupStatus:fresh.cupStatus,cups:fresh.cups,ucl:null,suspensions:fresh.suspensions,
    lineup:autoLineup(FORMATIONS[s.formation],me.players),development,
    history:[...s.history,{season:s.season,rank,club:me.name,ucl:s.cups.ucl?.outcome||null}],
    finances:[...s.finances,{season:s.season+1,type:'Season funding',amount:grant}].slice(-100),
    [LEAGUE_POOL[s.league]]:next.clubs};
}
