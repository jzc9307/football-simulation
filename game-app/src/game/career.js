import { autoLineup, freshState, topXI, clamp } from './engine.js';
import { FORMATIONS, ROLE_GROUP } from './config.js';

const POOLS=['plClubs','laligaClubs','serieaClubs','bundesligaClubs','ligue1Clubs','championshipClubs','laliga2Clubs','serieBClubs','bundes2Clubs','ligue2Clubs','europeanGuestClubs'];
const LEAGUE_POOL={PL:'plClubs',LALIGA:'laligaClubs',SERIEA:'serieaClubs',BUNDES:'bundesligaClubs',LIGUE1:'ligue1Clubs'};
const DIVISIONS={
  PL:{top:'plClubs',second:'championshipClubs',name:'Premier League',secondName:'Championship'},
  LALIGA:{top:'laligaClubs',second:'laliga2Clubs',name:'LaLiga',secondName:'LaLiga Hypermotion'},
  SERIEA:{top:'serieaClubs',second:'serieBClubs',name:'Serie A',secondName:'Serie B'},
  BUNDES:{top:'bundesligaClubs',second:'bundes2Clubs',name:'Bundesliga',secondName:'2. Bundesliga'},
  LIGUE1:{top:'ligue1Clubs',second:'ligue2Clubs',name:'Ligue 1',secondName:'Ligue 2'},
};
export function allClubs(s){
  const map=new Map(POOLS.flatMap(k=>s[k]||[]).map(c=>[c.id,c]));
  s.clubs.forEach(c=>map.set(c.id,c));
  return [...map.values()];
}
function commitClubs(s,clubs){
  const byId=new Map(clubs.map(c=>[c.id,c]));
  const updatedPools=Object.fromEntries(POOLS.map(k=>[k,(s[k]||[]).map(c=>byId.get(c.id)||c)]));
  return Object.assign({},s,updatedPools,{clubs:s.clubs.map(c=>byId.get(c.id)||c)});
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
function roomForYouth(players,count){
  const output=[...players];
  while(output.length+count>30){
    const removable=output.filter(player=>player.role!=="GK"||output.filter(candidate=>candidate.role==="GK").length>2).sort((a,b)=>a.ovr-b.ovr||b.age-a.age)[0];
    if(!removable)break;output.splice(output.findIndex(player=>player.id===removable.id),1);
  }
  return output;
}
function renewClub(club,season,development,retirements){
  const remaining=club.players.filter(player=>{
    const retired=player.age>=34&&stableFraction(`${season}:${player.id}:retire`)<retirementChance(player.age);
    if(retired){retirements.push({club:club.name,name:player.name,age:player.age});return false;}return true;
  }).map(player=>{
    const delta=developmentDelta(player,season),ovr=clamp(player.ovr+delta,45,Math.max(player.ovr,potentialCap(player)));
    if(club.id===development.clubId&&delta)development.rows.push({id:player.id,name:player.name,from:player.ovr,to:ovr,delta});
    return {...player,age:player.age+1,ovr,value:Math.max(1,Math.round(player.value*(delta>0?1.10:delta<0?.87:.98))),condition:100,energy:100,appearances:0,confidence:0,seasonGoals:0,seasonAssists:0,seasonCleanSheets:0,seasonYellowCards:0,seasonRedCards:0,ratingTotal:0,ratedMatches:0,bestRating:0,motm:0,seasonMinutes:0,lastRating:null,lastConfidenceChange:0,competitionStats:{}};
  });
  const intake=2+(stableFraction(`${club.id}:${season}:intake`)<.35?1:0),players=roomForYouth(remaining,intake),roles=["GK","CB","LB","RB","CDM","CM","CAM","LW","RW","ST"];
  for(let index=0;index<intake;index++){
    const needsGk=players.filter(player=>player.role==="GK").length<2;
    const role=needsGk?"GK":roles[Math.floor(stableFraction(`${club.id}:${season}:role:${index}`)*roles.length)];
    const youth=youthPlayer({...club,players},season,index,role);players.push(youth);
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
  if(isLoan&&s.loans.filter(l=>l.borrowerId===buyer.id).length>=3)throw new Error('A club can have at most three incoming loans.');
  if(buyer.players.length>=30)throw new Error('Maximum squad size is 30 players.');
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
  if(s.ucl&&s.ucl.stage!=='final')throw new Error('Finish your Champions League campaign first.');
  let clubs=allClubs(s).map(c=>({...c,players:c.players.map(p=>({...p}))}));
  for(const loan of s.loans){
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
  const activeClubs=pools[activePool],me=activeClubs.find(club=>club.id===s.myClubId)||byId.get(s.myClubId);
  const grant=(nextTier===1?10:6)+(activeClubs.length-rank+1)*2;
  me.budget=(me.budget||s.budget)+grant;
  const fresh=freshState();
  const next={...s,...pools,clubs:activeClubs};
  return {...next,season:s.season+1,stage:gameOver?'game-over':'squad',division:nextTier,budget:me.budget,loans:[],
    half:1,roundIndex:0,roundsHalf1:null,roundsHalf2:null,tableRaw:null,table1:null,tableFinal:null,
    results1:[],results2:[],clubForm:{},lastResult:null,lastCupResult:null,lastLiveContext:null,
    scheduleVersion:null,seasonSchedule:[],fixtureResults:[],currentDate:null,midSeasonDone:false,activeFixtureId:null,
    cupStatus:fresh.cupStatus,cups:fresh.cups,ucl:null,uel:null,qualificationTables,suspensions:fresh.suspensions,
    injuries:{},lineup:autoLineup(FORMATIONS[s.formation],me.players),development:development.rows,retirements,movement,
    history:[...s.history,{season:s.season,rank,club:me.name,division:previousTier,ucl:s.cups.ucl?.outcome||null,movement}],
    finances:[...s.finances,{season:s.season+1,type:'Season funding',amount:grant}].slice(-100),
    [LEAGUE_POOL[s.league]]:pools[DIVISIONS[s.league].top]};
}
