import { cash, ensureClubFinance, withClubBudget, recordFinance, pounds } from './finance.js';

// Modest board allocations for this simulation, not an asserted FC27 payout
// table. See REWARDS.md. Values below are GBP millions.
export const PROGRESSION_PRIZES={
  FA:{'Fourth Round':.12,'Fifth Round':.15,'Quarter-Final':.23,'Semi-Final':.45,'Final':1,'Champion':2},
  CARABAO:{'Round of 32':.025,'Round of 16':.04,'Quarter-Final':.075,'Semi-Final':.15,'Final':.25,'Champion':.5},
  UCL:{'Knockout playoffs':.5,'Round of 16':.8,'Quarter-Final':1.5,'Semi-Final':2,'Final':3,'Champion':5},
  UEL:{'Knockout playoffs':.25,'Round of 16':.4,'Quarter-Final':.6,'Semi-Final':1,'Final':1.5,'Champion':2.5},
  UECL:{'Knockout playoffs':.1,'Round of 16':.2,'Quarter-Final':.3,'Semi-Final':.5,'Final':.8,'Champion':1.2},
};
const names={FA:'FA Cup',CARABAO:'Carabao Cup',COPA:'Copa del Rey',COPPA:'Coppa Italia',DFB:'DFB-Pokal',COUPE:'Coupe de France',TACA:'Taça de Portugal',UCL:'Champions League',UEL:'Europa League',UECL:'Conference League',PL:'Premier League'};
const other={'Round of 32':.04,'Round of 16':.06,'Quarter-Final':.12,'Semi-Final':.25,'Final':.5,'Champion':1};
export function grantProgressPrize(input,competition,milestone,date=input.currentDate){
  const amount=(PROGRESSION_PRIZES[competition]||other)[milestone],id=`prize:${input.season}:${competition}:${milestone}`;
  if(!amount||(input.rewardClaims||[]).includes(id))return input;
  let s=ensureClubFinance(input);s=withClubBudget(s,cash(s.budget+amount));
  s=recordFinance(s,{category:'Competition prize',amount,date,player:`${names[competition]||competition} · ${milestone}`});
  const subject=milestone==='Champion'?`${names[competition]||competition}: champions' reward`:`Through to the ${milestone.toLowerCase()}`;
  const mail={id,date,type:'reward',competition,subject,read:false,prize:{amount,milestone},body:`${milestone==='Champion'?'Congratulations on winning':`Your club has advanced to the ${milestone.toLowerCase()} in`} the ${names[competition]||competition}. The board has added ${pounds(amount*1000000)} to your transfer budget. This progression payment is available immediately for transfers or wage allocations.`};
  return {...s,rewardClaims:[...(s.rewardClaims||[]),id].slice(-600),finances:[...(s.finances||[]),{season:s.season,type:'Competition prize',player:mail.competition,amount}].slice(-100),mail:[mail,...(s.mail||[])].slice(0,120)};
}
export function rewardFixtureProgress(state,event){
  if(!event||event.winnerId!==state.myClubId)return state;
  if(event.kind==='cup'){
    const next=(state.seasonSchedule||[]).find(e=>e.competition===event.competition&&e.feeders?.includes(event.id));
    return grantProgressPrize(state,event.competition,next?.round||(event.round==='Final'?'Champion':null),event.date);
  }
  if(event.kind==='europe'&&event.knockoutKey){
    // A first-leg victory is not advancement; reward only the aggregate winner.
    if(event.leg!==2&&!event.neutral)return state;
    const next={Playoff:'Round of 16','Round of 16':'Quarter-Final','Quarter-Final':'Semi-Final','Semi-Final':'Final',Final:'Champion'}[event.round];
    return grantProgressPrize(state,event.competition,next,event.date);
  }
  return state;
}
export function rewardEuropeanQualification(state,competition,rank){
  return rank>0&&rank<=24?grantProgressPrize(state,competition,rank<=8?'Round of 16':'Knockout playoffs'):state;
}
export const premierLeaguePrize=rank=>Number.isInteger(rank)&&rank>=1&&rank<=20?21-rank:0;
export function leaguePrizeLetter(state,rank,amount,date){
  const id=`league-prize:${state.season}:PL`;
  return {id,date,type:'reward',competition:'PL',subject:'Your league finish funds the new season',read:false,prize:{amount,milestone:`Position ${rank}`},body:`Your ${rank}${rank===1?'st':rank===2?'nd':rank===3?'rd':'th'}-place Premier League finish earned ${pounds(amount*1000000)} of performance funding. It has now been added to the new season's transfer budget, separately from the board's normal season allocation.`};
}
