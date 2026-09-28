import { autoLineup, freshState, topXI, clamp, moveMedicalRecord } from './engine.js';
import { initialPlayerLife, archivePlayerSeason, beginPlayerStint, contractMonths } from './playerLife.js';
import { FORMATIONS, ROLE_GROUP } from './config.js';
import { money, availableBudget } from './finance.js';
import { OPENING_DEADLINE, openingDeal, transferSquadLimit } from './openingTransfers.js';
import { addDays } from './seasonSchedule.js';

const POOLS=['plClubs','laligaClubs','serieaClubs','bundesligaClubs','ligue1Clubs','portugalClubs','championshipClubs','laliga2Clubs','serieBClubs','bundes2Clubs','ligue2Clubs','europeanGuestClubs'];
const LEAGUE_POOL={PL:'plClubs',LALIGA:'laligaClubs',SERIEA:'serieaClubs',BUNDES:'bundesligaClubs',LIGUE1:'ligue1Clubs',PORTUGAL:'portugalClubs'};
const DIVISIONS={
  PL:{top:'plClubs',second:'championshipClubs',name:'Premier League',secondName:'Championship'},
  LALIGA:{top:'laligaClubs',second:'laliga2Clubs',name:'LaLiga',secondName:'LaLiga Hypermotion'},
  SERIEA:{top:'serieaClubs',second:'serieBClubs',name:'Serie A',secondName:'Serie B'},
  BUNDES:{top:'bundesligaClubs',second:'bundes2Clubs',name:'Bundesliga',secondName:'2. Bundesliga'},
  LIGUE1:{top:'ligue1Clubs',second:'ligue2Clubs',name:'Ligue 1',secondName:'Ligue 2'},
  PORTUGAL:{top:'portugalClubs',second:null,name:'Liga Portugal',secondName:null},
};
export function allClubs(s){
  const map=new Map(POOLS.flatMap(k=>s[k]||[]).map(c=>[c.id,c]));
  s.clubs.forEach(c=>map.set(c.id,c));
  return [...map.values()];
}
export function commitClubs(s,clubs){
  const byId=new Map(clubs.map(c=>[c.id,c]));
  const updatedPools=Object.fromEntries(POOLS.map(k=>[k,(s[k]||[]).map(c=>byId.get(c.id)||c)]));
  const campaigns=Object.fromEntries(['ucl','uel','uecl'].filter(key=>s[key]).map(key=>[key,{...s[key],clubs:s[key].clubs.map(c=>byId.get(c.id)||c)}]));
  return Object.assign({},s,updatedPools,campaigns,{clubs:s.clubs.map(c=>byId.get(c.id)||c)});
}
// The summer window stays live while the first league fixtures are being
// played. The confirmed 2026 deadline is inclusive of 1 September. January
// window remains available through the existing squad2 stage.
export function marketOpen(s){
  if(!s.currentDate)return true;
  const month=Number(s.currentDate.slice(5,7));
  return month===7||month===8||month===1||s.currentDate===OPENING_DEADLINE;
}
export function projectedPotential(p){
  if(Number.isFinite(p.potential))return clamp(p.potential,p.ovr,96);
  const growth=p.age<=18?7:p.age<=20?5:p.age<=22?4:p.age<=24?2:p.age===25?1:0;
  return clamp(p.ovr+growth,p.ovr,96);
}
export function loanFee(p){
  const rate=p.ovr>=82?0.15:p.ovr>=78?0.11:0.08;
  return Math.max(1,Math.round(p.value*rate));
}
export function canRelease(club,p){
  const rest=club.players.filter(x=>x.id!==p.id);
  return rest.length>=16 && rest.filter(x=>x.role==='GK').length>=1 && topXI(rest,club.preferredFormation).length===11;
}
function numberFor(players){for(let n=1;n<=99;n++)if(!players.some(p=>p.number===n))return n;return 99;}
export function stableFraction(value){
  let hash=2166136261;
  for(const char of value){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}
  return (hash>>>0)/4294967295;
}
export function clubQuality(club){
  const xi=topXI(club.players||[],club.preferredFormation);
  return xi.length?xi.reduce((sum,player)=>sum+player.ovr,0)/xi.length:55;
}
function saleBuyerPool(clubs,seller,player,excluded=new Set()){
  // Elite players should attract elite clubs.  Age softens that threshold, but
  // it never lets a low-level European guest afford a prime first-team star.
  const ageRelief=player.age>=34?5:player.age>=31?3:0;
  const requiredQuality=Math.max(60,(player.ovr>=89?84:player.ovr>=86?81:player.ovr>=83?78:player.ovr>=80?74:player.ovr>=76?69:63)-ageRelief);
  const minimumBudget=saleValue(player)*.8;
  return clubs.filter(club=>{
    if(club.id===seller.id||excluded.has(club.id)||club.players.length>=34)return false;
    if(buyerCapacity(club)<minimumBudget||clubQuality(club)<requiredQuality)return false;
    return true;
  });
}
// A club's entire season budget is not available for a single signing. Quality
// also caps spending, including guest clubs with generous generated budgets.
export function buyerCapacity(club){
  const quality=clubQuality(club);
  const cap=quality>=84?180:quality>=81?100:quality>=78?65:quality>=75?38:quality>=72?20:quality>=68?9:3;
  return money(Math.max(0,Math.min((club.budget||0)*.8,cap)));
}
function saleValue(player){return money(Math.max(.2,player.value*(player.age>=35?.68:player.age>=32?.82:1)));}
export function makeSaleOffer(s,seller,player,date,excluded=new Set()){
  const buyers=saleBuyerPool(allClubs(s),seller,player,excluded).filter(c=>availableBudget(s,c.id)>=saleValue(player)*.8);
  const ranked=buyers.map(club=>{
    const strongest=club.players.filter(p=>p.group===player.group).sort((a,b)=>b.ovr-a.ovr)[0]?.ovr||55;
    const gap=player.ovr-strongest;
    return {club,score:12-Math.abs(gap-2)*2+stableFraction(`${club.id}:${player.id}:${date}`)*8};
  }).sort((a,b)=>b.score-a.score);
  if(!ranked.length)return null;
  const seed=stableFraction(`${player.id}:${date}:${excluded.size}`),buyer=ranked[Math.floor(seed*Math.min(3,ranked.length))].club;
  const maxFee=money(Math.min(buyerCapacity(buyer),availableBudget(s,buyer.id),saleValue(player)*(1.06+seed*.12)));
  const amount=money(Math.min(maxFee,saleValue(player)*(.82+seed*.16)));
  return {id:`sale:${s.season}:${player.id}:${buyer.id}:${date}`,playerId:player.id,buyerId:buyer.id,amount,maxFee,date,status:'pending',round:1};
}
export function repairSaleOffers(s){
  const clubs=allClubs(s),seller=clubs.find(c=>c.id===s.myClubId);
  const offers=(s.saleOffers||[]).filter(offer=>{
    const player=seller?.players.find(p=>p.id===offer.playerId),buyer=clubs.find(c=>c.id===offer.buyerId);
    if(player&&buyer&&openingDeal(s,offer.openingDealId,seller.id,buyer.id,player))return !player.loan&&canRelease(seller,player)&&buyer.players.length<transferSquadLimit(s,offer.openingDealId,seller.id,buyer.id,player)&&Number.isFinite(offer.amount)&&offer.amount>0&&offer.amount<=availableBudget(s,buyer.id);
    if(offer.kind==='loan')return player&&buyer&&!player.loan&&buyer.players.length<30;
    return player&&buyer&&Number.isFinite(offer.amount)&&offer.amount>0&&offer.amount<=buyerCapacity(buyer)&&saleBuyerPool(clubs,seller,player).some(c=>c.id===buyer.id);
  });
  const owned=new Set(seller?.players.map(p=>p.id)||[]);
  return {...s,saleOffers:offers,saleListings:(s.saleListings||[]).filter(id=>owned.has(id)),loanListings:(s.loanListings||[]).filter(id=>owned.has(id)),saleFollowUps:(s.saleFollowUps||[]).filter(e=>owned.has(e.playerId))};
}
export function unlistPlayer(s,playerId){
  return {...s,saleListings:(s.saleListings||[]).filter(id=>id!==playerId),loanListings:(s.loanListings||[]).filter(id=>id!==playerId),saleOffers:(s.saleOffers||[]).filter(o=>o.playerId!==playerId),saleFollowUps:(s.saleFollowUps||[]).filter(e=>e.playerId!==playerId)};
}
export function loanRecallFine(player){return money(Math.min(2,Math.max(.1,player.value*.05)));}
export function loanEndDate(date,seasons){
  const year=Number(date.slice(0,4)),winter=Number(date.slice(5,7))<7;
  const semesters=Math.round(seasons*2),index=(winter?0:1)+semesters-1;
  return `${year+Math.floor(index/2)+(index%2)}-${index%2===0?'06-30':'01-31'}`;
}
export function makeLoanOffer(s,seller,player,date,excluded=new Set()){
  const ranked=allClubs(s).filter(c=>c.id!==seller.id&&!excluded.has(c.id)&&c.players.length<30&&s.loans.filter(l=>l.borrowerId===c.id).length<3)
    .map(club=>({club,quality:clubQuality(club),score:stableFraction(`loan:${club.id}:${player.id}:${date}`)}))
    .filter(c=>c.quality>=player.ovr-14&&c.quality<=player.ovr+6).sort((a,b)=>b.score-a.score);
  const buyer=ranked[0]?.club;if(!buyer)return null;
  const seasons=player.age<=23?1: .5;
  return {id:`loan-offer:${s.season}:${player.id}:${buyer.id}:${date}`,kind:'loan',playerId:player.id,buyerId:buyer.id,seasons,preferredSeasons:seasons,date,status:'pending',round:1};
}
export function listPlayerForLoan(s,playerId){
  if(!marketOpen(s))throw new Error('The transfer window is closed.');
  const seller=allClubs(s).find(c=>c.id===s.myClubId),player=seller?.players.find(p=>p.id===playerId);
  if(!player||player.loan||s.loans.some(l=>l.playerId===playerId))throw new Error('This player cannot be loan listed.');
  if(!canRelease(seller,player))throw new Error('Keep a playable squad before loaning this player.');
  if((s.loanListings||[]).includes(playerId))return s;
  const next=unlistPlayer(s,playerId),date=s.currentDate||`${2025+s.season}-08-01`,offer=makeLoanOffer(next,seller,player,date);
  const followUps=[3,7,12].map(days=>{const dt=new Date(`${date}T12:00:00Z`);dt.setUTCDate(dt.getUTCDate()+days);return {id:`loan-followup:${playerId}:${dt.toISOString()}`,kind:'loan',playerId,date:dt.toISOString().slice(0,10)};}).filter(e=>marketOpen({...s,currentDate:e.date}));
  return {...next,loanListings:[...(next.loanListings||[]),playerId],saleOffers:[...(next.saleOffers||[]),...(offer?[offer]:[])],saleFollowUps:[...(next.saleFollowUps||[]),...followUps],mail:[{id:`mail:loan-listed:${playerId}:${date}`,type:'transfer',subject:`${player.name} listed for loan`,body:offer?'A club has made a loan approach. Review Received offers in the Transfer Centre.':'Staff are seeking a suitable loan club. Your player remains available until a deal is agreed.',date,read:false},...(next.mail||[])].slice(0,80)};
}
export function counterLoanOffer(s,{offerId,seasons}){
  if(!marketOpen(s))throw new Error('The transfer window is closed.');
  const offer=(s.saleOffers||[]).find(o=>o.id===offerId&&o.kind==='loan');
  if(!offer)throw new Error('This loan approach is no longer available.');
  if(!Number.isFinite(seasons)||seasons<.5||seasons>3||!Number.isInteger(seasons*2))throw new Error('Choose a half-season to three-season loan.');
  if(seasons!==offer.seasons&&(offer.round||1)<3){
    const counter=seasons;
    return {state:{...s,saleOffers:s.saleOffers.map(o=>o.id===offerId?{...o,seasons:counter,round:(o.round||1)+1}:o)},status:'counter',message:`The club proposes ${counter} season${counter===1?'':'s'}. Match these terms to agree.`};
  }
  if(seasons!==offer.seasons)return {state:respondToSaleOffer(s,offerId,'reject'),status:'withdrawn',message:'The club ended talks. Your player remains available.'};
  const seller=allClubs(s).find(c=>c.id===s.myClubId),player=seller?.players.find(p=>p.id===offer.playerId);
  const moved=transfer(s,{type:'loan-out',playerId:offer.playerId,buyerId:offer.buyerId,seasons});
  const next=unlistPlayer(moved,offer.playerId);
  return {state:{...next,mail:[{id:`mail:loan-agreed:${offer.id}`,type:'transfer',subject:`${player.name} loan agreed`,body:`${player.name} joins the borrowing club for ${seasons} seasons, returning on ${loanEndDate(s.currentDate||`${2025+s.season}-08-01`,seasons)}.`,date:s.currentDate,read:false},...(next.mail||[])].slice(0,80)},status:'accepted',message:'Loan agreed.'};
}
function returnLoan(s,loan,date,recall=false){
  const clubs=allClubs(s),owner=clubs.find(c=>c.id===loan.ownerId),borrower=clubs.find(c=>c.id===loan.borrowerId),player=borrower?.players.find(p=>p.id===loan.playerId);
  if(!owner||!player)return {...s,loans:s.loans.filter(l=>l!==loan)};
  const fine=recall?loanRecallFine(player):0;
  if(recall&&availableBudget(s)<fine)throw new Error('Not enough unreserved budget to pay the recall fine.');
  const next=moveMedicalRecord(commitClubs(s,clubs.map(c=>c.id===owner.id?{...c,budget:money((c.budget||0)-fine),players:[...c.players,{...player,club:owner.id,loan:false,number:numberFor(c.players)}]}:c.id===borrower.id?{...c,budget:money((c.budget||0)+fine),players:c.players.filter(p=>p.id!==player.id)}:c)),player.id,owner.id);
  const owned=owner.id===s.myClubId;
  return {...next,budget:money(s.budget-(owned?fine:0)),loans:s.loans.filter(l=>l.playerId!==player.id),lineup:Object.fromEntries(Object.entries(s.lineup).filter(([,id])=>id!==player.id)),finances:fine?[...s.finances,{season:s.season,type:'Loan recall fine',player:player.name,amount:-fine}]:s.finances,mail:[{id:`mail:loan-return:${player.id}:${date}`,type:'transfer',subject:owned?`${player.name} is back from loan`:`${player.name}'s loan has ended`,body:owned?`${player.name} has returned from ${borrower.name} and is available for selection.${recall?` Recall compensation paid: £${fine}m.`:''}`:`${player.name} has returned to ${owner.name} after completing their loan with your club.`,date,read:false},...(next.mail||[])].slice(0,80)};
}
export function recallLoan(s,playerId){
  const loan=s.loans.find(l=>l.playerId===playerId&&l.ownerId===s.myClubId);
  if(!loan)throw new Error('This outgoing loan no longer exists.');
  return returnLoan(s,loan,s.currentDate||`${2025+s.season}-08-01`,true);
}
export function returnExpiredLoans(s,date){
  let next=s;
  for(const loan of s.loans)if(loan.endsDate&&loan.endsDate<=date)next=returnLoan(next,loan,loan.endsDate);
  return next;
}
function seasonTable(clubs){
  const games=2*(clubs.length-1),strength=club=>topXI(club.players,club.preferredFormation).reduce((total,player)=>total+player.ovr,0)/11;
  const average=clubs.reduce((total,club)=>total+strength(club),0)/clubs.length;
  return clubs.map(club=>{
    const edge=(strength(club)-average)*1.65+(Math.random()-.5)*15,points=clamp(Math.round(games*(1.28+edge*.045)),Math.round(games*.38),games*3-1);
    const gf=Math.max(10,Math.round(games*(1.18+edge*.016))),ga=Math.max(8,Math.round(games*(1.24-edge*.015)));
    return {id:club.id,club,played:games,pts:points,gf,ga,w:Math.min(games,Math.round(points/3)),d:0,l:0};
  }).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||a.club.name.localeCompare(b.club.name)).map((row,index)=>({...row,rank:index+1}));
}
function retirementChance(age){return age===34?.12:age===35?.22:age===36?.38:age===37?.58:age===38?.76:age>=39?1:0;}
function developmentDelta(player,season){
  const age=player.age+1,potential=projectedPotential(player),gap=Math.max(0,potential-player.ovr),apps=player.appearances||0;
  const roll=stableFraction(`${season}:${player.id}:growth`);
  if(age<=19&&gap>0&&apps>=5&&roll<Math.min(.92,.50+gap*.04))return gap>=8&&roll<.16?2:1;
  if(age<=21&&gap>0&&apps>=8&&roll<Math.min(.78,.32+gap*.035))return 1;
  if(age<=23&&gap>0&&apps>=10&&roll<Math.min(.62,.20+gap*.035))return 1;
  // A regularly used player under 24 always receives at least one point when
  // there is room below their supplied Career Mode potential.
  if(player.age<24&&gap>0&&apps>=10)return 1;
  if(age<=25&&gap>0&&apps>=12)return roll<Math.min(.30,.08+gap*.025)?1:0;
  if(age===30)return roll<.10?-1:0;
  if(age===31)return roll<.24?-1:0;
  if(age===32)return roll<.42?-1:0;
  if(age===33)return roll<.60?-1:0;
  return age>=34?(roll<.78?-1:0):0;
}
const YOUTH_FIRST=['Aiden','Mateo','Noah','Leo','Elias','Luca','Jayden','Milan','Theo','Rayan','Iker','Hugo'];
const YOUTH_LAST=['Silva','Khan','Bennett','Moretti','Diallo','Kovac','Santos','Meyer','Rossi','Okafor','Garcia','Mendes'];
function youthPlayer(club,season,index,role){
  const seed=stableFraction(`${club.id}:${season}:${index}`),name=`${YOUTH_FIRST[Math.floor(seed*YOUTH_FIRST.length)]} ${YOUTH_LAST[Math.floor(seed*997)%YOUTH_LAST.length]}`;
  const potential=72+Math.floor(seed*18),ovr=Math.max(53,Math.min(potential-4,58+Math.floor(seed*13)));
  return {id:`${club.id}:youth-${season}-${index}`,slug:`youth-${season}-${index}`,name,role,group:ROLE_GROUP[role],age:16+Math.floor(seed*4),ovr,potential,value:+Math.max(.35,(potential-65)*.22).toFixed(1),stamina:72+Math.floor(seed*16),club:club.id,number:numberFor(club.players),loan:false,condition:100,energy:100,appearances:0};
}
function renewClub(club,season,development,retirements){
  const remaining=club.players.filter(player=>{
    const retired=!player.loan&&player.age>=34&&stableFraction(`${season}:${player.id}:retire`)<retirementChance(player.age);
    if(retired){retirements.push({club:club.name,name:player.name,age:player.age});return false;}return true;
  }).map(player=>{
    const delta=developmentDelta(player,season),ovr=clamp(player.ovr+delta,45,Math.max(player.ovr,potentialCap(player)));
    if(club.id===development.clubId&&delta)development.rows.push({id:player.id,name:player.name,from:player.ovr,to:ovr,delta});
    return {...archivePlayerSeason(player,club.id,season),lastSeasonAverage:player.ratedMatches?player.ratingTotal/player.ratedMatches:null,lastSeasonApps:player.ratedMatches||0,age:player.age+1,ovr,value:Math.max(1,Math.round(player.value*(delta>0?1.10:delta<0?.87:.98))),condition:100,energy:100,appearances:0,confidence:0,seasonGoals:0,seasonAssists:0,seasonCleanSheets:0,seasonYellowCards:0,seasonRedCards:0,ratingTotal:0,ratedMatches:0,bestRating:0,motm:0,seasonMinutes:0,lastRating:null,lastConfidenceChange:0,competitionStats:{}};
  });
  const intake=Math.min(Math.max(0,30-remaining.length),2+(stableFraction(`${club.id}:${season}:intake`)<.35?1:0)),players=[...remaining],roles=["GK","CB","LB","RB","CDM","CM","CAM","LW","RW","ST"];
  for(let index=0;index<intake;index++){
    const needsGk=players.filter(player=>player.role==="GK").length<2;
    const role=needsGk?"GK":roles[Math.floor(stableFraction(`${club.id}:${season}:role:${index}`)*roles.length)];
    const youth=youthPlayer({...club,players},season,index,role);players.push(initialPlayerLife(youth,clubQuality(club),`${2026+season}-07-01`));
  }
  return {...club,players};
}
function potentialCap(player){return Number.isFinite(player.potential)?player.potential:95;}
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
  const months=contractMonths(player,s.currentDate||'2026-08-15');
  const pressure=months!==null&&months<=12?.78:months!==null&&months<=24?.9:player.life?.status==='wants-move'?.9:1;
  const multiplier=(1.02+ratingPremium+agePremium+potentialPremium+importancePremium+clubPremium+depthPremium+formPremium+seed*0.04)*pressure;
  const askingPrice=Math.max(1,Math.round(player.value*multiplier));
  const strictness=clamp((ratingPremium+agePremium+potentialPremium+importancePremium+clubPremium)/0.62,0,1);
  const minimumPrice=Math.max(player.value*pressure,Math.round(askingPrice*(0.88+strictness*0.07+seed*0.02)));
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
  const amount=Math.max(0,money(Number(offer)||0));
  if(!terms.releaseAllowed)return {...terms,status:'rejected',message:'The club cannot sell without leaving a playable squad.'};
  if(amount>availableBudget(s))return {...terms,status:'invalid',message:'That offer is above your unreserved budget.'};
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
export function listPlayerForSale(s,playerId){
  if((s.loanListings||[]).includes(playerId))s=unlistPlayer(s,playerId);
  if(!marketOpen(s))throw new Error('The transfer window is closed. You can scout, but cannot list players.');
  const clubs=allClubs(s),seller=clubs.find(club=>club.id===s.myClubId),player=seller?.players.find(candidate=>candidate.id===playerId);
  if(!seller||!player)throw new Error('This player is no longer at your club.');
  if(player.loan||s.loans.some(loan=>loan.playerId===playerId))throw new Error('A loan player cannot be listed for sale.');
  if(!canRelease(seller,player))throw new Error('You must retain a playable squad before listing this player.');
  if((s.saleListings||[]).includes(playerId))return s;
  const date=s.currentDate||s.seasonSchedule?.find(e=>e.status==='scheduled')?.date||`${2025+(s.season||1)}-08-01`;
  const offer=makeSaleOffer(s,seller,player,date);
  const followUps=[3,7,12].map(days=>{
    const dt=new Date(`${date}T12:00:00Z`);dt.setUTCDate(dt.getUTCDate()+days);
    const due=dt.toISOString().slice(0,10);
    return {id:`sale-followup:${s.season}:${playerId}:${due}`,playerId,date:due};
  }).filter(e=>marketOpen({...s,currentDate:e.date}));
  const mail={id:`mail:listed:${s.season}:${playerId}`,type:'transfer',subject:offer?`Offer received for ${player.name}`:`${player.name} transfer listed`,body:offer?`A buying club has submitted £${offer.amount}m. Open Received offers in the Transfer Centre.`:'The player remains available for your team. Staff will look for realistic buyers.',date,read:false};
  return {...s,saleListings:[...(s.saleListings||[]),playerId],saleOffers:[...(s.saleOffers||[]),...(offer?[offer]:[])],saleFollowUps:[...(s.saleFollowUps||[]),...followUps],mail:[mail,...(s.mail||[])].slice(0,80)};
}
export function advanceSaleOffers(s,throughDate){
  let next=s;
  const dueDates=[...new Set((s.saleFollowUps||[]).filter(e=>e.date&&e.date<=throughDate).map(e=>e.date))].sort();
  for(const date of dueDates){
    const events=(next.saleFollowUps||[]).filter(e=>e.date===date);
    next={...next,saleFollowUps:(next.saleFollowUps||[]).filter(e=>e.date!==date)};
    if(!marketOpen({...next,currentDate:date}))continue;
    const seller=allClubs(next).find(club=>club.id===next.myClubId);
    const arrivals=[];
    for(const event of events){
      const player=seller?.players.find(p=>p.id===event.playerId);
      if(!player||!(event.kind==='loan'?(next.loanListings||[]):(next.saleListings||[])).includes(player.id))continue;
      const excluded=new Set((next.saleOffers||[]).filter(o=>o.playerId===player.id).map(o=>o.buyerId));
      const offer=event.kind==='loan'?makeLoanOffer(next,seller,player,date,excluded):makeSaleOffer(next,seller,player,date,excluded);
      if(offer){next={...next,saleOffers:[...(next.saleOffers||[]),offer]};arrivals.push({id:`mail:${offer.id}`,type:'transfer',subject:`New ${event.kind==='loan'?'loan ':''}offer for ${player.name}`,body:event.kind==='loan'?`A club proposes a ${offer.seasons}-season loan. Review Received offers in the Transfer Centre.`:`A club has submitted £${offer.amount}m. Review Received offers in the Transfer Centre.`,date,read:false});}
    }
    if(arrivals.length)return {state:{...next,mail:[...arrivals,...(next.mail||[])].slice(0,80)},arrived:true,date};
  }
  return {state:next,arrived:false};
}
export function respondToSaleOffer(s,offerId,decision){
  if(!marketOpen(s))throw new Error('The transfer window is closed.');
  const offer=(s.saleOffers||[]).find(item=>item.id===offerId&&item.status==='pending');
  if(!offer)throw new Error('That offer is no longer available.');
  if(decision==='reject')return {...s,saleOffers:s.saleOffers.filter(item=>item.id!==offerId)};
  if(offer.kind==='loan')return counterLoanOffer(s,{offerId,seasons:offer.seasons}).state;
  const date=s.currentDate||'2026-08-15',club=allClubs(s).find(c=>c.id===s.myClubId),buyer=allClubs(s).find(c=>c.id===offer.buyerId),player=club?.players.find(p=>p.id===offer.playerId);
  if(!player||!buyer||!canRelease(club,player)||buyer.players.length>=transferSquadLimit(s,offer.openingDealId,club.id,buyer.id,player)||availableBudget(s,buyer.id)<offer.amount)throw Error('Deal conditions changed.');
  const market=s.market||{version:1,lastDate:addDays(date,-1),talks:[],history:[],invitations:[],openingStartedDate:date,openingProcessed:[]};
  if(market.talks.some(t=>t.status==='pending'&&t.playerId===player.id&&t.buyerId===buyer.id))throw Error('That club already has an agreed fee.');
  const dueDate=addDays(date,1+Math.floor(stableFraction(`${offer.id}:personal-delay`)*3));
  const talk={id:`sale-talk:${offer.id}`,playerId:player.id,playerName:player.name,sellerId:club.id,buyerId:buyer.id,fee:offer.amount,date,dueDate,status:'pending',phase:'player-talks',role:player.role,reason:'Fee agreed · negotiating personal terms',openingDealId:offer.openingDealId,window:`${date.slice(0,4)}-${date.slice(5,7)==='01'?'winter':'summer'}`};
  return {...s,market:{...market,talks:[...market.talks.map(t=>t.status==='pending'&&t.playerId===player.id?{...t,dueDate}:t),talk]},saleOffers:s.saleOffers.filter(o=>o.id!==offer.id),mail:[{id:`mail:fee:${offer.id}`,type:'transfer',subject:`Fee agreed for ${player.name}`,body:`${buyer.name} agreed £${offer.amount}m. Personal talks take 1–3 days. You may accept another club's fee; the player decides between them. No money has changed hands.`,date,read:false},...(s.mail||[])].slice(0,80)};
}
export function counterSaleOffer(s,{offerId,ask}){
  if(!marketOpen(s))throw new Error('The transfer window is closed.');
  const offer=(s.saleOffers||[]).find(item=>item.id===offerId&&item.status==='pending');
  if(!offer)throw new Error('That offer is no longer available.');
  const clubs=allClubs(s),seller=clubs.find(club=>club.id===s.myClubId),buyer=clubs.find(club=>club.id===offer.buyerId),player=seller?.players.find(candidate=>candidate.id===offer.playerId);
  if(!seller||!buyer||!player)throw new Error('This transfer can no longer be negotiated.');
  if(!Number.isFinite(Number(ask))||Number(ask)<=0)throw new Error('Enter a valid transfer fee.');
  const amount=money(Number(ask)),round=offer.round||1;
  const capacity=openingDeal(s,offer.openingDealId,seller.id,buyer.id,player)?availableBudget(s,buyer.id):buyerCapacity(buyer);
  const ceiling=money(Math.min(offer.maxFee??saleValue(player)*1.12,capacity,availableBudget(s,buyer.id)));
  if(amount<=offer.amount||amount<=ceiling&&amount<=offer.amount*(1.06+round*.025)){
    const agreed=Math.min(amount,capacity);
    const state=respondToSaleOffer({...s,saleOffers:s.saleOffers.map(o=>o.id===offerId?{...o,amount:agreed}:o)},offerId,'accept');
    return {state,status:'accepted',message:`${buyer.name} agreed to ${fmtFee(agreed)} for ${player.name}.`};
  }
  if(round>=3||amount>ceiling*1.8){
    return {state:respondToSaleOffer(s,offerId,'reject'),status:'withdrawn',message:`${buyer.name} ended talks. ${player.name} remains listed and usable.`};
  }
  const counter=money(Math.max(offer.amount,Math.min(ceiling,(offer.amount+Math.min(amount,ceiling))/2)));
  const replacement={...offer,amount:counter,maxFee:ceiling,round:round+1};
  return {state:{...s,saleOffers:s.saleOffers.map(item=>item.id===offerId?replacement:item)},status:'counter',counter,message:`${buyer.name} countered at ${fmtFee(counter)}.${round===2?' This is their final bid.':''}`};
}
function fmtFee(amount){return `£${amount}m`;}
export function transfer(s,{type,playerId,sellerId,buyerId,fee,seasons=1,openingDealId,contract,agreedBeforeDeadline=false}){
  if(!marketOpen(s)&&!agreedBeforeDeadline)throw new Error('The transfer window is closed. You can still scout and shortlist players.');
  const clubs=allClubs(s),me=clubs.find(c=>c.id===s.myClubId);
  const outgoing=type==='sell'||type==='loan-out';
  const seller=outgoing?me:clubs.find(c=>c.id===sellerId);
  const player=seller?.players.find(p=>p.id===playerId);
  if(!player||(!outgoing&&seller.id===me.id))throw new Error('This player is no longer available.');
  if(player.loan || s.loans.some(l=>l.playerId===player.id))throw new Error('A loan player cannot be sold or loaned again.');
  if(!canRelease(seller,player))throw new Error('The selling club must keep at least 16 players and a playable XI.');
  const isLoan=type==='loan-in'||type==='loan-out';
  if(type==='loan-in'){
    const loan=loanTerms(s,seller.id,player.id);
    if(!loan.available)throw new Error(loan.reason+'.');
  }
  const terms=!outgoing&&!isLoan?transferTerms(s,seller.id,player.id):null;
  const agreedFee=Number.isFinite(fee)?money(fee):terms?.askingPrice;
  if(terms&&agreedFee<terms.minimumPrice)throw new Error(`The selling club will not accept less than £${terms.minimumPrice}m.`);
  const price=type==='loan-out'?0:isLoan?loanFee(player):outgoing?Math.max(.1,money(Number.isFinite(fee)?fee:player.value*.9)):agreedFee;
  if(isLoan&&(!Number.isFinite(seasons)||seasons<.5||seasons>3||!Number.isInteger(seasons*2)))throw new Error('Invalid loan duration.');
  let buyer=me;
  if(outgoing){
    buyer=buyerId?clubs.find(club=>club.id===buyerId):clubs.filter(c=>c.id!==me.id&&c.players.length<30&&(c.budget||0)>=price&&
      (!isLoan||s.loans.filter(l=>l.borrowerId===c.id).length<3)).sort((a,b)=>b.budget-a.budget)[0];
    if(buyer&&(buyer.players.length>=transferSquadLimit(s,openingDealId,seller.id,buyer.id,player)||availableBudget(s,buyer.id)<price))buyer=null;
    if(!buyer)throw new Error('No club can currently afford this deal.');
  }
  if(isLoan&&s.loans.filter(l=>l.borrowerId===buyer.id).length>=3)throw new Error('A club can have at most three incoming loans.');
  if(buyer.players.length>=transferSquadLimit(s,openingDealId,seller.id,buyer.id,player))throw new Error('Maximum squad size is 30 players.');
  if(!outgoing&&availableBudget(s)<price)throw new Error('Not enough unreserved budget for this deal.');
  if(buyer.players.length+(s.market?.talks||[]).filter(t=>t.status==='pending'&&t.buyerId===buyer.id).length>=transferSquadLimit(s,openingDealId,seller.id,buyer.id,player))throw new Error('Squad places are reserved for pending signings.');
  const moved={...(isLoan?player:beginPlayerStint(player,seller.id,s.season)),club:buyer.id,number:numberFor(buyer.players),loan:isLoan,...(!isLoan&&contract?{contract,life:{...player.life,happiness:82,status:'settled',reason:'Excited by a new sporting project',recentMinutes:[],missedMatches:0,joinedDate:s.currentDate}}:{})};
  const updated=clubs.map(c=>c.id===seller.id?{...c,budget:money((c.id===s.myClubId?s.budget:c.budget||0)+price),players:c.players.filter(p=>p.id!==player.id)}:
    c.id===buyer.id?{...c,budget:money((c.id===s.myClubId?s.budget:c.budget||0)-price),players:[...c.players,moved]}:c);
  const next=moveMedicalRecord(commitClubs(s,updated),player.id,buyer.id);
  return {...next,budget:money(s.budget+(outgoing?price:-price)),
    lineup:outgoing?Object.fromEntries(Object.entries(s.lineup).filter(([,id])=>id!==player.id)):s.lineup,
    loans:isLoan?[...s.loans,{playerId:player.id,ownerId:seller.id,borrowerId:buyer.id,seasons,startsDate:s.currentDate||`${2025+s.season}-08-01`,endsDate:loanEndDate(s.currentDate||`${2025+s.season}-08-01`,seasons),endsSeason:s.season}]:s.loans,
    shortlist:(s.shortlist||[]).filter(id=>id!==player.id),
    finances:[...s.finances,{season:s.season,type,player:player.name,amount:outgoing?price:-price}].slice(-100)};
}
function promotionAndRelegation(league,topTable,secondTable,season){
  const ids=rows=>rows.map(row=>row.id);
  // England and Spain award the final promotion place through the playoff field;
  // in an instant season the highest-ranked eligible side wins that mini-tournament.
  if(league==='PL'||league==='LALIGA')return {relegated:ids(topTable.slice(-3)),promoted:ids(secondTable.slice(0,3)),playoffWinner:secondTable[2]?.id||null};
  // Serie B has a broader playoff chase in the table, but one promoted club keeps
  // the two divisions balanced in this season model.
  if(league==='SERIEA')return {relegated:ids(topTable.slice(-3)),promoted:ids(secondTable.slice(0,3)),playoffWinner:secondTable[2]?.id||null};
  if(league==='LIGUE1')return {relegated:ids(topTable.slice(-2)),promoted:ids(secondTable.slice(0,2)),playoffWinner:null};
  if(league==='BUNDES'){
    const directRelegated=topTable.slice(-2),directPromoted=secondTable.slice(0,2);
    const topPlayoff=topTable[15],secondPlayoff=secondTable[2];
    // A deterministic strength-weighted playoff result keeps imported saves
    // stable and lets the 16th-place/third-place labels have real meaning.
    const topStrength=topPlayoff?.club?.players?.slice(0,11).reduce((n,p)=>n+p.ovr,0)/11||70;
    const secondStrength=secondPlayoff?.club?.players?.slice(0,11).reduce((n,p)=>n+p.ovr,0)/11||70;
    const secondWins=stableFraction(`${season}:${topPlayoff?.id}:${secondPlayoff?.id}:playoff`) < Math.max(.24,Math.min(.76,.5+(secondStrength-topStrength)/28));
    return {relegated:ids([...directRelegated,...(secondWins&&topPlayoff?[topPlayoff]:[])]),promoted:ids([...directPromoted,...(secondWins&&secondPlayoff?[secondPlayoff]:[])]),playoffWinner:secondWins?secondPlayoff?.id:topPlayoff?.id||null};
  }
  return {relegated:ids(topTable.slice(-3)),promoted:ids(secondTable.slice(0,3)),playoffWinner:null};
}

export function startNextSeason(s){
  if(!s.tableFinal)throw new Error('Finish the league season first.');
  for(const [key,label] of [['ucl','Champions League'],['uel','Europa League'],['uecl','Conference League']])if(s[key]&&s[key].stage!=='final')throw new Error(`Finish your ${label} campaign first.`);
  s=returnExpiredLoans(s,`${2026+s.season}-07-01`);
  let clubs=allClubs(s).map(c=>({...c,players:c.players.map(p=>({...p}))}));
  for(const loan of s.loans.filter(l=>!l.endsDate)){
    const owner=clubs.find(c=>c.id===loan.ownerId),borrower=clubs.find(c=>c.id===loan.borrowerId);
    const player=borrower?.players.find(p=>p.id===loan.playerId);
    if(!owner||!player)continue;
    borrower.players=borrower.players.filter(p=>p.id!==player.id);
    owner.players.push({...player,club:owner.id,loan:false,number:numberFor(owner.players)});
  }
  const rank=s.tableFinal.findIndex(r=>r.id===s.myClubId)+1;
  const retirements=[],development={clubId:s.myClubId,rows:[]};
  clubs=clubs.map(club=>renewClub(club,s.season,development,retirements));
  const byId=new Map(clubs.map(club=>[club.id,club]));
  const pools=Object.fromEntries(POOLS.map(key=>[key,(s[key]||[]).map(club=>byId.get(club.id)||club)]));
  const previousTier=s.division||1;
  let nextTier=previousTier,gameOver=false,movement=null;
  for(const [league,division] of Object.entries(DIVISIONS)){
    if(!division.second)continue;
    const top=pools[division.top],second=pools[division.second];
    const topTable=league===s.league&&previousTier===1?s.tableFinal:seasonTable(top);
    const secondTable=league===s.league&&previousTier===2?s.tableFinal:seasonTable(second);
    const {relegated,promoted,playoffWinner}=promotionAndRelegation(league,topTable,secondTable,s.season);
    if(league===s.league){
      if(previousTier===1&&relegated.includes(s.myClubId)){nextTier=2;movement=`Relegated to ${division.secondName}`;}
      if(previousTier===2&&promoted.includes(s.myClubId)){nextTier=1;movement=playoffWinner===s.myClubId?`Promoted to ${division.name} via the playoff`:`Promoted to ${division.name}`;}
      const secondRelegationCount=league==='BUNDES'?2:league==='LIGUE1'?2:league==='SERIEA'?3:league==='PL'||league==='LALIGA'?3:3;
      if(previousTier===2&&secondTable.slice(-secondRelegationCount).some(row=>row.id===s.myClubId)){gameOver=true;movement=`Relegated from ${division.secondName}`;}
    }
    pools[division.top]=[...top.filter(club=>!relegated.includes(club.id)),...second.filter(club=>promoted.includes(club.id))];
    pools[division.second]=[...second.filter(club=>!promoted.includes(club.id)),...top.filter(club=>relegated.includes(club.id))];
  }
  // Keep every top-flight final order. European qualification is based on the
  // five league tables, not on a fresh strength-only sort when next season is
  // created. The managed league preserves its actual completed table.
  const qualificationTables=Object.fromEntries(Object.entries(LEAGUE_POOL).map(([league,key])=>{
    const clubs=pools[key];
    if(league===s.league&&previousTier===1){
      const clubById=new Map(clubs.map(club=>[club.id,club]));
      return [league,s.tableFinal.filter(row=>clubById.has(row.id)).map((row,index)=>({...row,club:clubById.get(row.id),rank:index+1}))];
    }
    return [league,seasonTable(clubs)];
  }));
  const activePool=previousTier===2&&gameOver?DIVISIONS[s.league].second:(nextTier===1?DIVISIONS[s.league].top:DIVISIONS[s.league].second);
  let activeClubs=pools[activePool];const me=activeClubs.find(club=>club.id===s.myClubId)||byId.get(s.myClubId);
  const grant=(nextTier===1?10:6)+(activeClubs.length-rank+1)*2;
  clubs=clubs.map(c=>c.id===s.myClubId?c:{...c,budget:money((c.budget||0)+(clubQuality(c)>=81?25:clubQuality(c)>=75?12:4))});
  for(const key of POOLS)pools[key]=pools[key].map(c=>clubs.find(updated=>updated.id===c.id)||c);
  me.budget=money(s.budget+grant);
  activeClubs=pools[activePool];
  const fresh=freshState();
  const next={...s,...pools,clubs:activeClubs};
  return {...next,season:s.season+1,stage:gameOver?'game-over':'squad',division:nextTier,budget:me.budget,loans:s.loans.filter(l=>l.endsDate),saleListings:[],loanListings:[],saleOffers:[],saleFollowUps:[],
    half:1,roundIndex:0,roundsHalf1:null,roundsHalf2:null,tableRaw:null,table1:null,tableFinal:null,
    results1:[],results2:[],clubForm:{},lastResult:null,lastCupResult:null,lastLiveContext:null,
    scheduleVersion:null,seasonSchedule:[],fixtureResults:[],currentDate:`${2026+s.season}-07-01`,midSeasonDone:false,activeFixtureId:null,market:null,marketNotice:null,marketNotices:[],
    cupStatus:fresh.cupStatus,cups:fresh.cups,ucl:null,uel:null,uecl:null,qualificationTables,suspensions:fresh.suspensions,
    injuries:{},worldInjuries:{},benchSelection:null,lineup:autoLineup(FORMATIONS[s.formation],me.players),development:development.rows,retirements,movement,
    history:[...s.history,{season:s.season,rank,club:me.name,division:previousTier,ucl:s.cups.ucl?.outcome||null,movement}],
    finances:[...s.finances,{season:s.season+1,type:'Season funding',amount:grant}].slice(-100),
    [LEAGUE_POOL[s.league]]:pools[DIVISIONS[s.league].top]};
}
