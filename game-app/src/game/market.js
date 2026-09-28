import { allClubs, commitClubs, canRelease, clubQuality, buyerCapacity, stableFraction, projectedPotential, transferTerms, transfer, makeSaleOffer, makeLoanOffer, advanceSaleOffers, returnExpiredLoans, marketOpen } from './career.js';
import { positionFit, topXI, computeTableArray, moveMedicalRecord } from './engine.js';
import { FORMATIONS } from './config.js';
import { availableBudget, money } from './finance.js';
import { addDays, nextFixture } from './seasonSchedule.js';
import { OPENING_DEADLINE, OPENING_TRANSFERS, transferSquadLimit } from './openingTransfers.js';
import { ensurePlayerLife, advancePlayerLife, agentTerms, signedContract, evaluatePersonalTerms, contractMonths, beginPlayerStint } from './playerLife.js';

const pending = t => t.status === 'pending';
const windowKey = date => `${date.slice(0,4)}-${date.slice(5,7)==='01'?'winter':'summer'}`;
const deadline = date => date.slice(0,4)==='2026'&&date.slice(5,7)!=='01'?OPENING_DEADLINE:`${date.slice(0,4)}-${date.slice(5,7)==='01'?'01-31':'08-31'}`;
const decisionDate = (date, days = 3) => [addDays(date,days),deadline(date)].sort()[0];
export function ensureMarket(s) {
  s=ensurePlayerLife(s);
  const date=s.currentDate||`${2025+s.season}-07-01`;
  if(s.market?.version===1)return s.market.openingStartedDate?s:{...s,market:{...s.market,openingStartedDate:date,openingProcessed:[],invitations:[]}};
  // Old saves join the market today. Do not replay months of historical trades.
  return {...s,market:{version:1,lastDate:addDays(date,-1),talks:[],history:[],lastWindow:null,openingStartedDate:date,openingProcessed:[],invitations:[]}};
}
function windowActivity(s,key){
  if(s.market.activity?.key===key)return s.market.activity;
  const completed=s.market.history.filter(t=>t.status==='signed'&&t.window===key);
  const signingsByClub={};for(const t of completed)signingsByClub[t.buyerId]=(signingsByClub[t.buyerId]||0)+1;
  return {key,signingsByClub,movedPlayerIds:[...new Set(completed.map(t=>t.playerId))]};
}
function eligible(s,club,p) {
  return !p.loan&&!s.loans.some(l=>l.playerId===p.id)&&canRelease(club,p);
}
export function recruitmentNeeds(s,club,date=s.currentDate) {
  const slots=FORMATIONS[club.preferredFormation||'4-3-3']||FORMATIONS['4-3-3'];
  const quality=clubQuality(club),roles=[...new Set(slots.map(slot=>slot.role))];
  const winter=date?.slice(5,7)==='01';
  const table=club.id!==s.myClubId&&s.clubs.some(c=>c.id===club.id)&&s.tableRaw?computeTableArray(s.tableRaw,s.clubs):[];
  const danger=table.length&&table.findIndex(r=>r.id===club.id)>=table.length-4;
  return roles.map(role=>{
    const options=club.players.filter(p=>positionFit(role,p)>=.9).sort((a,b)=>b.ovr-a.ovr);
    const needed=slots.filter(slot=>slot.role===role).length;
    const fit=options.slice(0,needed),starter=fit.at(-1);
    const injury=p=>s.injuries?.[p.id]||s.worldInjuries?.[p.id];
    const injuries=fit.filter(p=>(injury(p)?.matches||0)>=4);
    const usable=options.filter(p=>!(injury(p)?.matches>0));
    let reason=null,priority=0,target=quality;
    if(usable.length<needed){reason='Missing starter';priority=100;}
    else if(injuries.length){reason='Long-term injury cover';priority=95;}
    else if((starter?.ovr||50)<quality-4){reason=danger?'Relegation reinforcement':'First-team upgrade';priority=80+quality-(starter?.ovr||50);target=Math.min(92,(starter?.ovr||50)+3);}
    else if(!winter&&quality>=80&&starter?.ovr<Math.min(90,quality+2)){reason='First-team upgrade';priority=82;target=Math.min(92,starter.ovr+3);}
    else if(!winter&&starter&&(starter.age>=31||contractMonths(starter,date)<=12&&starter.contract?.endDate)){reason='Succession planning';priority=81;target=Math.min(91,starter.ovr);}
    else if(!winter&&options.length<needed+1){reason='Positional depth';priority=55;target=(starter?.ovr||quality)-5;}
    else if(!winter&&options.length<needed+2&&(role!=='GK'||options.every(p=>p.age>=30))&&!options.some(p=>p.age<=22&&projectedPotential(p)>=quality+2)){reason='Development prospect';priority=30;target=quality-9;}
    if(winter&&!injuries.length&&usable.length>=needed&&!danger)return null;
    return reason?{role,reason,priority,target,starter:starter?.ovr||50}:null;
  }).filter(Boolean).sort((a,b)=>b.priority-a.priority||stableFraction(`${club.id}:${date}:${b.role}:need`)-stableFraction(`${club.id}:${date}:${a.role}:need`));
}
// Age and form create opportunities, not automatic fire sales. An established
// core player commands an exceptional premium; the only keeper is protected.
export function aiSalePrice(s,club,p) {
  if(!eligible(s,club,p))return null;
  const terms=transferTerms(s,club.id,p.id);
  const firstChoice=new Set(topXI(club.players,club.preferredFormation).map(p=>p.id));
  const old=p.age>=(p.role==='GK'?35:32);
  const poor=(p.ratedMatches||0)>=8?(p.ratingTotal/p.ratedMatches)<6.4:(p.lastSeasonApps||0)>=8&&p.lastSeasonAverage<6.4;
  const surplus=!firstChoice.has(p.id);
  const multiplier=p.life?.status==='wants-move'?.92:old?.95:poor?.96:surplus?1:1.18;
  return money(Math.max(.2,terms.askingPrice*multiplier));
}
function slotsAvailable(s,club) {
  return club.players.length+(s.market?.talks||[]).filter(t=>pending(t)&&t.buyerId===club.id).length<(club.id===s.myClubId?30:34);
}
function addTalk(s,talk) {
  return {...s,market:{...s.market,talks:[...s.market.talks.filter(t=>pending(t)),talk].slice(-180)}};
}
function addMarketMail(s,subject,body,date,id) {
  return {...s,mail:[{id:`market-mail:${id}`,type:'transfer',subject,body,date,read:false},...(s.mail||[])].slice(0,80)};
}
export function agreeTransferFee(input,{sellerId,playerId,fee}) {
  let s=ensureMarket(input);
  if(!marketOpen(s))throw new Error('The transfer window is closed.');
  if(s.market.talks.some(t=>pending(t)&&t.buyerId===s.myClubId&&t.playerId===playerId))throw new Error('You already have a fee agreement for this player.');
  const terms=transferTerms(s,sellerId,playerId),me=allClubs(s).find(c=>c.id===s.myClubId);
  const amount=money(fee);
  if(sellerId===s.myClubId||!terms.releaseAllowed||terms.player.loan||s.loans.some(l=>l.playerId===playerId))throw new Error('This player is no longer available.');
  if(!Number.isFinite(fee)||amount<terms.minimumPrice)throw new Error('The fee does not meet the agreement.');
  if(amount>availableBudget(s))throw new Error('Not enough unreserved budget.');
  if(!slotsAvailable(s,me))throw new Error('Your squad is full, including pending signings.');
  const date=s.currentDate||`${2025+s.season}-08-01`,dueDate=decisionDate(date,2);
  const id=`talk:${s.season}:${playerId}:${s.myClubId}:${date}`;
  // All bidders for a player resolve together; an earlier AI deal cannot steal
  // the player before an already agreed user decision is due.
  s={...s,market:{...s.market,talks:s.market.talks.map(t=>pending(t)&&t.playerId===playerId?{...t,dueDate}:t)}};
  s=addTalk(s,{id,playerId,playerName:terms.player.name,sellerId,buyerId:s.myClubId,fee:amount,date,dueDate,status:'pending',phase:'fee-agreed',reason:'Your target',window:windowKey(date)});
  s={...s,market:{...s.market,invitations:(s.market.invitations||[]).filter(t=>t.playerId!==playerId)}};
  return addMarketMail(s,`Fee agreed for ${terms.player.name}`,`The club accepted £${amount}m. The player will decide on ${dueDate}. Funds are reserved, not spent.`,date,id);
}
export function cancelMarketTalk(s,id) {
  const invitation=s.market?.invitations?.find(t=>t.id===id);
  const talk=s.market?.talks.find(t=>t.id===id&&pending(t))||invitation;
  if(!talk)return s;
  const notices=(s.marketNotices||[]).filter(n=>n.id!==id&&n.talkId!==id);
  return {...s,marketNotices:notices,marketNotice:s.marketNotice?.id===id||s.marketNotice?.talkId===id?notices[0]||null:s.marketNotice,market:{...s.market,talks:s.market.talks.filter(t=>t.id!==id),invitations:(s.market.invitations||[]).filter(t=>t.id!==id),history:[{...talk,status:'cancelled',resolvedDate:s.currentDate||talk.date},...s.market.history].slice(0,200)}};
}
export function playerInterest(s,playerId) {
  const clubs=new Map(allClubs(s).map(c=>[c.id,c]));
  const talks=[...(s.market?.talks||[]),...(s.market?.invitations||[])].filter(t=>t.playerId===playerId&&pending(t)).map(t=>({...t,club:clubs.get(t.buyerId),amount:t.fee,label:t.phase==='contract-ready'?'Personal terms ready':t.phase==='player-talks'?'Negotiating personal terms':t.phase==='invitation'?'Recruitment opportunity':t.openingDealId?'Opening-window approach':t.phase==='fee-agreed'?'Fee agreed · player deciding':'Negotiating'}));
  const offers=(s.saleOffers||[]).filter(o=>o.playerId===playerId&&o.status==='pending').map(o=>({...o,club:clubs.get(o.buyerId),label:o.kind==='loan'?'Loan approach':'Offer received'}));
  return [...talks,...offers].filter(t=>t.club).sort((a,b)=>(b.amount||0)-(a.amount||0));
}
export function playerChoiceScore(s,club,p,role=p.role) {
  const quality=clubQuality(club);
  const competitors=club.players.filter(x=>positionFit(role,x)>=.9).sort((a,b)=>b.ovr-a.ovr);
  const slots=(FORMATIONS[club.preferredFormation]||FORMATIONS['4-3-3']).filter(x=>x.role===role).length||1;
  const playingTime=p.ovr>=(competitors[slots-1]?.ovr||50)?10:p.ovr>=(competitors[slots]?.ovr||50)?3:-8;
  const europe=['ucl','uel','uecl'].findIndex(k=>s[k]?.clubs?.some(c=>c.id===club.id));
  return quality*.9+playingTime+(europe===0?5:europe===1?3:europe===2?1:0);
}
function aiCandidate(s,buyer,need,date,clubs=allClubs(s)) {
  const capacity=Math.min(buyerCapacity(buyer),availableBudget(s,buyer.id));
  if(capacity<.2)return null;
  const candidates=[];
  const recentlyMoved=new Set(windowActivity(s,windowKey(date)).movedPlayerIds);
  const approached=new Set(s.market.talks.filter(t=>pending(t)&&t.buyerId===buyer.id).map(t=>t.playerId));
  const quality=clubQuality(buyer);
  for(const seller of clubs){
    if(seller.id===buyer.id||seller.id===s.myClubId)continue;
    for(const p of seller.players){
      if(p.loan||s.worldInjuries?.[p.id]?.matches>0||positionFit(need.role,p)<.9||p.ovr<need.target-3||p.ovr>need.target+7)continue;
      if(approached.has(p.id)||recentlyMoved.has(p.id)||s.loans.some(l=>l.playerId===p.id))continue;
      if(need.reason==='Development prospect'&&(p.age>22||projectedPotential(p)<quality+2))continue;
      // Do not buy a second star for an already strong slot just because cheap.
      if(need.priority<80&&p.ovr>need.starter-2)continue;
      if(p.value>capacity*1.25)continue;
      const score=20-Math.abs(p.ovr-need.target)*2+(projectedPotential(p)-p.ovr)*.7-p.value/Math.max(1,capacity)*3+stableFraction(`${buyer.id}:${p.id}:${date}`)*4;
      candidates.push({seller,p,score});
    }
  }
  // Price and release checks require roster analysis. Only scout the best
  // sporting matches, rather than recalculating thousands of XIs per buyer.
  for(const c of candidates.sort((a,b)=>b.score-a.score).slice(0,24)){
    const fee=aiSalePrice(s,c.seller,c.p);
    if(fee&&fee<=capacity)return {...c,fee};
  }
  return null;
}
function recruit(s,date) {
  const winter=date.slice(5,7)==='01',key=windowKey(date);
  const clubs=allClubs(s);
  const buyers=clubs.filter(c=>c.id!==s.myClubId&&slotsAvailable(s,c))
    .sort((a,b)=>stableFraction(`${date}:${a.id}`)-stableFraction(`${date}:${b.id}`)).slice(0,winter?10:32);
  let rivalArrived=false;
  for(const buyer of buyers){
    const count=(windowActivity(s,key).signingsByClub[buyer.id]||0)+s.market.talks.filter(t=>t.buyerId===buyer.id&&t.window===key&&pending(t)).length;
    if(count>=(winter?1:3))continue;
    const needs=recruitmentNeeds(s,buyer,date).filter(need=>!s.market.talks.some(t=>pending(t)&&t.buyerId===buyer.id&&t.role===need.role));
    let candidate,need;
    // If the most urgent target is unaffordable, scout another genuine need.
    // Equal-priority needs rotate deterministically instead of every club
    // repeatedly recruiting goalkeepers because GK is first in the formation.
    for(const option of needs.slice(0,3)){candidate=aiCandidate(s,buyer,option,date,clubs);if(candidate){need=option;break;}}
    if(!candidate)continue;
    const {seller,p,fee}=candidate;
    const userTalk=s.market.talks.find(t=>pending(t)&&t.buyerId===s.myClubId&&t.playerId===p.id);
    const dueDate=userTalk?.dueDate||decisionDate(date);
    const talk={id:`talk:${s.season}:${p.id}:${buyer.id}:${date}`,playerId:p.id,playerName:p.name,sellerId:seller.id,buyerId:buyer.id,fee,date,dueDate,status:'pending',phase:'negotiating',role:need.role,reason:need.reason,window:key};
    s=addTalk(s,talk);
    if(userTalk){rivalArrived=true;s=addMarketMail(s,`Rival bid for ${p.name}`,`${buyer.name} has entered talks at £${fee}m. The player decision is still due on ${dueDate}.`,date,talk.id);}
  }
  return {state:s,rivalArrived};
}
function unsolicited(s,date) {
  const me=allClubs(s).find(c=>c.id===s.myClubId);if(!me)return {state:s,arrived:false};
  if((s.saleOffers||[]).length>=6)return {state:s,arrived:false};
  const starters=new Set(topXI(me.players,s.formation).map(p=>p.id));
  const candidates=me.players.filter(p=>eligible(s,me,p)&&!s.saleListings?.includes(p.id)&&!s.loanListings?.includes(p.id)&&!(s.saleOffers||[]).some(o=>o.playerId===p.id))
    .sort((a,b)=>stableFraction(`${date}:${a.id}:approach`)-stableFraction(`${date}:${b.id}:approach`));
  for(const p of candidates){
    const roll=stableFraction(`${date}:${p.id}:offer`);
    if(roll>(p.life?.status==='wants-move'?.45:p.age<=25&&p.ovr>=85?.2:starters.has(p.id)?.08:.24))continue;
    const loan=!starters.has(p.id)&&p.age<=24&&p.ovr<clubQuality(me)-3;
    const offer=loan?makeLoanOffer(s,me,p,date):makeSaleOffer(s,me,p,date);
    if(!offer)continue;
    const buyer=allClubs(s).find(c=>c.id===offer.buyerId);
    const needs=recruitmentNeeds(s,buyer,date);
    if(!needs.some(n=>positionFit(n.role,p)>=.9))continue;
    // A star who is not for sale attracts only a genuinely valuable proposal.
    if(!loan&&starters.has(p.id)){
      offer.amount=money(p.value*1.2);offer.maxFee=money(p.value*1.3);
      if(offer.maxFee>Math.min(buyerCapacity(buyer),availableBudget(s,buyer.id)))continue;
    }
    s={...s,saleOffers:[...(s.saleOffers||[]),{...offer,unsolicited:true}]};
    s=addMarketMail(s,`${buyer.name} approached ${p.name}`,loan?`${buyer.name} proposes a ${offer.seasons}-season loan. Nothing moves without your approval.`:`${buyer.name} offered £${offer.amount}m. Review or decline the approach; the player remains usable.`,date,offer.id);
    return {state:s,arrived:true};
  }
  return {state:s,arrived:false};
}
function completeAiTransfer(s,t,p) {
  const clubs=allClubs(s),seller=clubs.find(c=>c.id===t.sellerId),buyer=clubs.find(c=>c.id===t.buyerId);
  if(!buyer||buyer.id===s.myClubId||seller.id===s.myClubId)throw new Error('User transfers need approval.');
  if(!canRelease(seller,p)||buyer.players.length>=transferSquadLimit(s,t.openingDealId,seller.id,buyer.id,p)||availableBudget(s,buyer.id,t.id)<t.fee)throw new Error('Deal conditions changed.');
  let number=1;while(buyer.players.some(p=>p.number===number)&&number<99)number++;
  const date=s.currentDate||t.dueDate,terms=agentTerms(p,clubQuality(buyer),date);
  return moveMedicalRecord(commitClubs(s,clubs.map(c=>c.id===seller.id?{...c,budget:money(c.budget+t.fee),players:c.players.filter(x=>x.id!==p.id)}:c.id===buyer.id?{...c,budget:money(c.budget-t.fee),players:[...c.players,{...beginPlayerStint(p,seller.id,s.season),club:c.id,number,contract:signedContract(p,terms,date),life:{...p.life,happiness:82,status:'settled',reason:'New sporting project',recentMinutes:[],missedMatches:0,joinedDate:date}}]}:c)),p.id,buyer.id);
}
function resolveDecisions(s,date) {
  let userDecision=false;
  const ids=[...new Set(s.market.talks.filter(t=>pending(t)&&t.phase!=='contract-ready'&&t.dueDate<=date).map(t=>t.playerId))];
  for(const id of ids){
    const talks=s.market.talks.filter(t=>pending(t)&&t.playerId===id);
    const player=allClubs(s).find(c=>c.id===talks[0].sellerId)?.players.find(p=>p.id===id);
    const clubs=new Map(allClubs(s).map(c=>[c.id,c]));
    const valid=player?talks.filter(t=>clubs.has(t.buyerId)&&clubs.get(t.buyerId).players.length<transferSquadLimit(s,t.openingDealId,t.sellerId,t.buyerId,player)&&availableBudget(s,t.buyerId,t.id)>=t.fee&&eligible(s,clubs.get(t.sellerId),player)):[];
    const ranked=valid.map(t=>{const terms=agentTerms(player,clubQuality(clubs.get(t.buyerId)),date);return {talk:t,terms,score:playerChoiceScore(s,clubs.get(t.buyerId),player,t.role)+Math.min(5,terms.wage/Math.max(1000,player.contract?.wage||terms.wage))*2+stableFraction(`${t.id}:choice`)*4};}).sort((a,b)=>b.score-a.score);
    let chosen=ranked[0]?.talk;
    const ownSeller=talks.some(t=>t.sellerId===s.myClubId);
    const ambitious=p=>p.age<=25&&p.ovr>=80&&p.life?.ambition==='high';
    const confirmedReplay=chosen?.openingDealId&&chosen.sellerId!==s.myClubId&&chosen.buyerId!==s.myClubId;
    if(chosen&&!confirmedReplay&&ambitious(player)&&clubQuality(clubs.get(chosen.buyerId))<clubQuality(clubs.get(chosen.sellerId))-5&&player.life?.status!=='wants-move')chosen=null;
    if(chosen&&ownSeller&&!s.saleListings?.includes(id)&&player.life?.status!=='wants-move'&&ranked[0].score<playerChoiceScore(s,clubs.get(s.myClubId),player)+3)chosen=null;
    let winner=null;
    let ready=false;
    if(chosen){
      try{
        if(chosen.buyerId===s.myClubId){ready=true;}
        else {
          const released={...s,currentDate:date,market:{...s.market,talks:s.market.talks.map(t=>pending(t)&&t.playerId===id?{...t,status:'resolving'}:t)}};
          const terms=agentTerms(player,clubQuality(clubs.get(chosen.buyerId)),date);
          s=chosen.sellerId===s.myClubId?transfer(released,{type:'sell',buyerId:chosen.buyerId,playerId:id,fee:chosen.fee,openingDealId:chosen.openingDealId,contract:signedContract(player,terms,date),agreedBeforeDeadline:true}):completeAiTransfer(released,chosen,player);
          s={...s,saleOffers:(s.saleOffers||[]).filter(o=>o.playerId!==id),saleListings:(s.saleListings||[]).filter(pid=>pid!==id),saleFollowUps:(s.saleFollowUps||[]).filter(e=>e.playerId!==id)};
        }
        winner=chosen;
      }catch{ /* A withdrawn seller or a full squad cancels the deal safely. */ }
    }
    const outcomes=talks.filter(t=>!(ready&&t.id===winner?.id)).map(t=>({...t,status:t.id===winner?.id?'signed':winner?'lost':'cancelled',resolvedDate:date,winnerId:winner?.buyerId||null}));
    if(winner&&!ready){
      // Recruitment limits and the one-move-per-window rule must outlive the
      // bounded recent-decisions feed in a busy world market.
      const activity=windowActivity(s,winner.window||windowKey(date));
      s={...s,market:{...s.market,activity:{...activity,signingsByClub:{...activity.signingsByClub,[winner.buyerId]:(activity.signingsByClub[winner.buyerId]||0)+1},movedPlayerIds:[...new Set([...activity.movedPlayerIds,id])]}}};
    }
    const readyTalk=ready?{...winner,status:'pending',phase:'contract-ready',round:1,demands:agentTerms(player,clubQuality(clubs.get(s.myClubId)),date),selectedDate:date}:null;
    s={...s,market:{...s.market,talks:[...s.market.talks.filter(t=>t.playerId!==id),...(readyTalk?[readyTalk]:[])],history:[...outcomes,...s.market.history].slice(0,200)}};
    const own=talks.find(t=>t.buyerId===s.myClubId);
    if(own||ownSeller){
      userDecision=true;
      const tracked=own||talks[0],signed=!!winner&&!ready&&(ownSeller||winner.id===own?.id);
      const reason=ready?'The player chose your project. Agree contract length, wage and squad role to complete the signing. The fee is still reserved, not spent.':signed?'Personal terms are agreed. The transfer is confirmed and the fee has been paid.':winner?`${clubs.get(winner.buyerId).name} offered a more attractive sporting project.`:ownSeller?'The player did not agree personal terms. They remain in your squad and no fee was received.':'The deal conditions changed. Reserved funds have been released.';
      const notice={id:tracked.id,talkId:readyTalk?.id,status:ready?'contract-ready':signed?'signed':'failed',outgoing:ownSeller,playerName:tracked.playerName,ovr:player?.ovr,fee:winner?.fee||tracked.fee,buyerId:winner?.buyerId,sellerId:tracked.sellerId,date,reason};
      s={...s,marketNotice:notice,marketNotices:[...(s.marketNotices||[]),notice]};
      s=addMarketMail(s,`${ready?'Personal talks ready':signed?'Transfer confirmed':'Transfer unsuccessful'}: ${tracked.playerName}`,reason,date,`${tracked.id}:resolved`);
    }
  }
  return {state:s,userDecision};
}
export function negotiatePlayerContract(input,{talkId,...offer}){
  const s=ensureMarket(input),talk=s.market.talks.find(t=>t.id===talkId&&pending(t)&&t.phase==='contract-ready'&&t.buyerId===s.myClubId);
  if(!talk)throw Error('Personal talks are no longer available.');
  const p=allClubs(s).find(c=>c.id===talk.sellerId)?.players.find(p=>p.id===talk.playerId);if(!p)throw Error('The player is no longer available.');
  const result=evaluatePersonalTerms(p,offer,talk.demands,talk.round||1);
  if(result.status==='rejected')return {...result,state:cancelMarketTalk(s,talk.id)};
  if(result.status==='counter')return {...result,state:{...s,market:{...s.market,talks:s.market.talks.map(t=>t.id===talk.id?{...t,round:(t.round||1)+1,demands:result.demands}:t)}}};
  const date=s.currentDate||talk.dueDate;
  const released={...s,market:{...s.market,talks:s.market.talks.map(t=>t.id===talk.id?{...t,status:'resolving'}:t)}};
  const contract=signedContract(p,offer,date);
  let next=transfer(released,{type:'buy',playerId:p.id,sellerId:talk.sellerId,fee:talk.fee,contract,agreedBeforeDeadline:true});
  const activity=windowActivity(next,talk.window);
  next={...next,market:{...next.market,talks:next.market.talks.filter(t=>t.id!==talk.id),history:[{...talk,status:'signed',resolvedDate:date,contract},...next.market.history].slice(0,200),activity:{...activity,signingsByClub:{...activity.signingsByClub,[talk.buyerId]:(activity.signingsByClub[talk.buyerId]||0)+1},movedPlayerIds:[...new Set([...activity.movedPlayerIds,p.id])]}}};
  next=addMarketMail(next,`Signing complete: ${p.name}`,`${offer.years} years · £${offer.wage.toLocaleString('en-GB')} per week. The transfer fee was paid and the player is in your squad.`,date,`${talk.id}:signed`);
  const notices=(next.marketNotices||[]).filter(n=>n.id!==talk.id&&n.talkId!==talk.id);
  next={...next,marketNotices:notices,marketNotice:next.marketNotice?.id===talk.id||next.marketNotice?.talkId===talk.id?notices[0]||null:next.marketNotice};
  return {...result,message:`${p.name} has signed. The transfer is complete.`,state:next};
}
function openingWindow(s,date) {
  let arrived=false;
  if(s.season!==1||date>OPENING_DEADLINE||date<'2026-07-01')return {state:s,arrived};
  for(const deal of OPENING_TRANSFERS){
    if(deal.date<s.market.openingStartedDate||(s.market.openingProcessed||[]).includes(deal.id))continue;
    const approachDate=[addDays(deal.date,-2),s.market.openingStartedDate].sort().at(-1);
    if(approachDate>date)continue;
    s={...s,market:{...s.market,openingProcessed:[...(s.market.openingProcessed||[]),deal.id]}};
    const clubs=allClubs(s),seller=clubs.find(c=>c.id===deal.sellerId),buyer=clubs.find(c=>c.id===deal.buyerId);
    const p=seller?.players.find(p=>p.slug===deal.slug);
    // A previous user decision, existing loan or already-correct roster wins.
    if(!p||!buyer||!eligible(s,seller,p))continue;
    const fee=money(Math.max(.2,p.value*.85));
    const talk={id:deal.id,openingDealId:deal.id,source:deal.source,playerId:p.id,playerName:p.name,sellerId:seller.id,buyerId:buyer.id,fee,date,dueDate:deal.date,status:'pending',phase:'negotiating',role:p.role,reason:'Confirmed opening-window move · in-game fee',window:windowKey(date)};
    if(seller.id===s.myClubId){
      if((s.saleOffers||[]).some(o=>o.status==='pending'&&o.playerId===p.id&&o.buyerId===buyer.id))continue;
      const amount=money(Math.min(fee,availableBudget(s,buyer.id)));
      if(amount<.2)continue;
      const offer={id:deal.id,openingDealId:deal.id,source:deal.source,playerId:p.id,buyerId:buyer.id,amount,maxFee:money(Math.min(p.value*1.2,availableBudget(s,buyer.id))),date,status:'pending',round:1,unsolicited:true};
      s={...s,saleOffers:[...(s.saleOffers||[]),offer]};
      s=addMarketMail(s,`${buyer.name} approached ${p.name}`,`${buyer.name} has offered £${amount}m in the opening window. This is an in-game fee based on your roster valuation. Review or decline it; ${p.name} remains yours until you approve a sale.`,date,deal.id);
      arrived=true;
    }else if(buyer.id===s.myClubId){
      if(s.market.talks.some(t=>pending(t)&&t.playerId===p.id&&t.buyerId===s.myClubId))continue;
      const invitation={...talk,phase:'invitation',reason:'Opening-window recruitment opportunity'};
      s={...s,market:{...s.market,invitations:[...(s.market.invitations||[]),invitation]}};
      s=addMarketMail(s,`Recruitment opportunity: ${p.name}`,`Staff have identified the confirmed opening-window target ${p.name}. Review the player in Active Talks and negotiate if you want him. No money is reserved or spent without your approval.`,date,deal.id);
      arrived=true;
    }else if(fee<=availableBudget(s,buyer.id)&&buyer.players.length<transferSquadLimit(s,deal.id,seller.id,buyer.id,p)){
      const rival=s.market.talks.find(t=>pending(t)&&t.playerId===p.id&&t.buyerId===s.myClubId);
      s=addTalk(s,{...talk,dueDate:rival?.dueDate||deal.date});
      if(rival){s=addMarketMail(s,`Rival bid for ${p.name}`,`${buyer.name} has approached your target. Track the bids in Active Talks.`,date,deal.id);arrived=true;}
    }
  }
  return {state:s,arrived};
}
export function marketDay(input,date) {
  let s=ensureMarket(input);
  const expired=(s.market.invitations||[]).filter(t=>date>OPENING_DEADLINE||!allClubs(s).find(c=>c.id===t.sellerId)?.players.some(p=>p.id===t.playerId));
  if(expired.length)s={...s,market:{...s.market,invitations:s.market.invitations.filter(t=>!expired.includes(t)),history:[...expired.map(t=>({...t,status:'cancelled',resolvedDate:date})),...s.market.history].slice(0,200)}};
  s={...s,market:{...s.market,activity:windowActivity(s,windowKey(date))}};
  const decisions=resolveDecisions(s,date);s=decisions.state;
  let arrived=false,rivalArrived=false;
  const summer=date.slice(5,7)==='07'||date.slice(5,7)==='08'||date===OPENING_DEADLINE,winter=date.slice(5,7)==='01';
  const firstOpening=s.season===1&&summer;
  const tick=(summer?Number(date.slice(-2))%3===1:winter?Number(date.slice(-2))%7===1:false);
  if(!firstOpening&&(summer||winter)&&tick){
    const progress=recruit(s,date);s=progress.state;rivalArrived=progress.rivalArrived;
    const offers=unsolicited(s,date);s=offers.state;arrived=offers.arrived;
  }
  if(firstOpening){const opening=openingWindow(s,date);s=opening.state;arrived=opening.arrived;}
  s={...s,market:{...s.market,lastDate:date}};
  return {state:s,arrived:arrived||rivalArrived||decisions.userDecision,notice:decisions.userDecision?'A signing decision has arrived.':rivalArrived?'A rival club entered talks for your target.':'A new club approach has arrived.'};
}
// One chronological clock for offers, returns, AI recruitment and player
// decisions. Only manager-relevant events interrupt; each date is consumed once.
export function advanceTransferCalendar(input,throughDate,{advanceWorld}={}) {
  let s=ensureMarket(input);
  if(s.market.talks.some(t=>pending(t)&&t.buyerId===s.myClubId&&t.phase==='contract-ready'))return {state:s,arrived:true,date:s.currentDate,notice:'Personal terms need your decision. Open contract talks or withdraw the deal.'};
  const start=s.market.lastDate< (s.currentDate||'')?s.currentDate:addDays(s.market.lastDate,1);
  const dates=new Set();
  for(let date=start;date<=throughDate;date=addDays(date,1))dates.add(date);
  // A user may agree terms on a processed deadline day. Still resolve that
  // newly scheduled decision without processing the AI tick a second time.
  for(const t of s.market.talks.filter(t=>pending(t)&&t.phase!=='contract-ready'))if(t.dueDate<=throughDate)dates.add(t.dueDate<(s.currentDate||'')?s.currentDate:t.dueDate);
  for(const e of s.saleFollowUps||[])if(e.date<=throughDate)dates.add(e.date);
  for(const l of s.loans)if(l.endsDate&&l.endsDate<=throughDate)dates.add(l.endsDate);
  for(const date of [...dates].sort()){
    const life=advancePlayerLife(s,date);s={...life.state,currentDate:date};
    if(advanceWorld)s=advanceWorld(s,date);
    const day=date>s.market.lastDate?marketDay(s,date):{state:s,arrived:false};s=day.state;
    const decisions=date<=s.market.lastDate?resolveDecisions(s,date):{state:s,userDecision:false};s=decisions.state;
    const offers=advanceSaleOffers(s,date);s=offers.state;
    const returned=s.loans.some(l=>l.endsDate&&l.endsDate<=date&&(l.ownerId===s.myClubId||l.borrowerId===s.myClubId));
    s=returnExpiredLoans(s,date);
    if(day.arrived||decisions.userDecision||offers.arrived||returned||life.arrived){
      return {state:s,arrived:true,date:date<(input.currentDate||'')?input.currentDate:date,notice:life.arrived?'A squad or contract decision needs your attention.':decisions.userDecision?'A signing decision has arrived.':offers.arrived?'A new transfer offer has arrived.':returned?'A player has returned from loan.':day.notice};
    }
    // A background draw may create an earlier manager fixture. Never simulate
    // the market beyond that newly scheduled match before it has been played.
    if(nextFixture(s)?.date<=date)break;
  }
  return {state:s,arrived:false};
}
