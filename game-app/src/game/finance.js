// Fees are stored in millions, at £100k precision. Never carry binary floating
// point artefacts through a season of buys, sales and recall compensation.
export const money = value => Math.round((Number(value) || 0) * 10) / 10;
export const pounds = n => `£${Math.round(n||0).toLocaleString('en-GB')}`;
export function formatMoney(value) {
  return `£${money(value).toLocaleString('en-GB', { maximumFractionDigits: 1 })}m`;
}
export function reservedBudget(state, clubId = state.myClubId, exceptId = null) {
  return money((state.market?.talks || []).filter(t => t.status === 'pending' && t.buyerId === clubId && t.id !== exceptId).reduce((sum, t) => sum + t.fee, 0));
}
export function availableBudget(state, clubId = state.myClubId, exceptId = null) {
  const club = [...(state.clubs || []), ...Object.keys(state).filter(k => k.endsWith('Clubs')).flatMap(k => state[k] || [])].find(c => c.id === clubId);
  const total = clubId === state.myClubId ? state.budget : club?.budget || 0;
  return cash(Math.max(0, total - reservedBudget(state, clubId, exceptId)));
}
// Transfer fees retain £100k precision; payroll keeps exact whole pounds.
export const cash = value => Math.round((Number(value)||0)*1000000)/1000000;
const DAY=86400000;
const addDays=(date,n)=>new Date(Date.parse(date+'T12:00:00Z')+n*DAY).toISOString().slice(0,10);
const seasonEnd=s=>`${2026+(s.season||1)}-06-30`;
function ownedPlayers(s){
  const clubs=new Map(Object.keys(s).filter(k=>k.endsWith('Clubs')).flatMap(k=>s[k]||[]).map(c=>[c.id,c]));
  (s.clubs||[]).forEach(c=>clubs.set(c.id,c));
  return [...clubs.values()].flatMap(c=>c.players.filter(p=>{
    const loan=(s.loans||[]).find(l=>l.playerId===p.id);
    return loan?loan.ownerId===s.myClubId:c.id===s.myClubId;
  }));
}
export function withClubBudget(s,budget){
  const next={...s,budget},update=clubs=>clubs.map(c=>c.id===s.myClubId?{...c,budget}:c);
  for(const key of ['clubs',...Object.keys(s).filter(k=>k.endsWith('Clubs'))])if(Array.isArray(s[key]))next[key]=update(s[key]);
  for(const key of ['ucl','uel','uecl'])if(s[key]?.clubs)next[key]={...s[key],clubs:update(s[key].clubs)};
  return next;
}
export function payrollWeeks(s){
  const date=s.finance?.lastPayrollDate||s.currentDate||`${2025+s.season}-08-15`;
  return Math.max(0,Math.floor((Date.parse(seasonEnd(s)+'T12:00:00Z')-Date.parse(date+'T12:00:00Z'))/DAY/7));
}
export function ensureClubFinance(s){
  if(!s.myClubId||s.finance?.version===1&&s.finance.season===s.season)return s;
  const date=s.currentDate||`${2025+s.season}-08-15`,weeks=payrollWeeks({...s,finance:null});
  const accounts=Object.fromEntries(ownedPlayers(s).map(p=>[p.id,{name:p.name,wage:p.contract?.wage||0,boardWeekly:p.contract?.wage||0,boardReserve:(p.contract?.wage||0)*weeks,transferReserve:0}]));
  const boardFunding=Object.values(accounts).reduce((n,a)=>n+a.boardReserve,0);
  return {...s,finance:{version:1,season:s.season,openingTransfer:s.budget,lastPayrollDate:date,accounts,paid:0,boardFunding,ledger:[{id:`board-wages:${s.season}`,date,category:'Board wage funding',pool:'wages',amount:boardFunding},...(s.finances||[]).filter(e=>e.season===s.season).map((e,i)=>({id:`legacy-finance:${i}`,date:null,category:e.type,player:e.player,pool:'transfer',amount:Math.round(e.amount*1000000)}))]}};
}
export function contractFunding(input,player,wage,incoming=false){
  const s=ensureClubFinance(input),account=incoming?null:s.finance?.accounts[player.id];
  const weeks=payrollWeeks(s),boardWeekly=account?.boardWeekly||0;
  const required=Math.max(0,wage-boardWeekly)*weeks;
  return {weeks,required,change:required-(account?.transferReserve||0),boardWeekly};
}
export function fundPlayerContract(input,player,wage,{incoming=false}={}){
  const s=ensureClubFinance(input);if(!s.finance)return s;
  const {weeks,required,change,boardWeekly}=contractFunding(s,player,wage,incoming);
  if(change>Math.round(availableBudget(s)*1000000))throw Error(`Personal terms need £${change.toLocaleString('en-GB')} of unreserved transfer funds for ${weeks} remaining payroll weeks. Lower the wage or release funds.`);
  const date=s.currentDate,account={name:player.name,wage,boardWeekly,boardReserve:Math.min(wage,boardWeekly)*weeks,transferReserve:required};
  const ledger=change?[{id:`wage-allocation:${player.id}:${date}:${s.finance.ledger.length}`,date,category:change>0?'Wage reserve allocation':'Unused wage funding returned',player:player.name,pool:'allocation',amount:-change},...s.finance.ledger]:s.finance.ledger;
  const budget=cash(s.budget-change/1000000);
  return {...withClubBudget(s,budget),finance:{...s.finance,accounts:{...s.finance.accounts,[player.id]:account},ledger:ledger.slice(0,600)}};
}
export function releasePlayerWages(input,playerId,date=input.currentDate){
  const s=ensureClubFinance(input),a=s.finance?.accounts[playerId];if(!a)return s;
  const accounts={...s.finance.accounts};delete accounts[playerId];
  const budget=cash(s.budget+a.transferReserve/1000000);
  return {...withClubBudget(s,budget),finance:{...s.finance,accounts,ledger:[...(a.transferReserve?[{id:`wage-release:${playerId}:${date}`,date,category:'Unused wage funding returned',player:a.name,pool:'allocation',amount:a.transferReserve}]:[]),...s.finance.ledger].slice(0,600)}};
}
export function recordFinance(input,{category,amount,player,date=input.currentDate}){
  const s=ensureClubFinance(input);if(!s.finance)return s;
  return {...s,finance:{...s.finance,ledger:[{id:`finance:${date}:${s.finance.ledger.length}`,date,category,amount:Math.round(amount*1000000),player,pool:'transfer'},...s.finance.ledger].slice(0,600)}};
}
export function advancePayroll(input,date){
  let s=ensureClubFinance(input);if(!s.finance)return s;
  // A departed/expired player is never charged again. Loan wages stay with owner.
  const players=new Map(ownedPlayers(s).map(p=>[p.id,p])),ids=new Set(players.keys());
  for(const id of Object.keys(s.finance.accounts))if(!ids.has(id))s=releasePlayerWages(s,id,date);
  let f={...s.finance,accounts:Object.fromEntries(Object.entries(s.finance.accounts).map(([id,a])=>[id,{...a}]))};
  for(let due=addDays(f.lastPayrollDate,7);due<=date&&due<=seasonEnd(s);due=addDays(due,7)){
    let amount=0;
    for(const [id,a] of Object.entries(f.accounts)){
      const p=players.get(id),ends=p.contract?.endDate;
      // Imported FC26 records that already ended before the career began stay
      // visibly labelled rather than silently extended. Future expiry stops pay.
      if(!p.loan&&ends>=(p.life?.joinedDate||`${2025+s.season}-07-01`)&&due>ends)continue;
      const board=Math.min(a.wage,a.boardWeekly,a.boardReserve),extra=Math.min(a.wage-board,a.transferReserve);
      a.boardReserve-=board;a.transferReserve-=extra;amount+=board+extra;
    }
    f={...f,lastPayrollDate:due,paid:f.paid+amount,ledger:[{id:`payroll:${s.season}:${due}`,date:due,category:'Weekly payroll',pool:'wages',amount:-amount},...f.ledger].slice(0,600)};
  }
  return {...s,finance:f};
}
export function financeSummary(input){
  const s=ensureClubFinance(input),f=s.finance;
  if(!f)return {weekly:0,reserve:0,paid:0,allocated:0,ledger:[],weeks:0};
  const accounts=Object.values(f.accounts);
  return {weekly:accounts.reduce((n,a)=>n+a.wage,0),reserve:accounts.reduce((n,a)=>n+a.boardReserve+a.transferReserve,0),paid:f.paid,allocated:accounts.reduce((n,a)=>n+a.transferReserve,0),boardFunding:f.boardFunding,weeks:payrollWeeks(s),ledger:f.ledger};
}
