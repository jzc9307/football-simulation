import { OPENING_DEADLINE } from './openingTransfers.js';
export function transferWindowEvents(season=1){
  const start=2025+season,end=start+1;
  return [{date:`${start}-07-01`,kind:'open',name:'Summer window opens'},{date:season===1?OPENING_DEADLINE:`${start}-08-31`,kind:'close',name:'Summer transfer deadline'},{date:`${end}-01-01`,kind:'open',name:'January window opens'},{date:`${end}-01-31`,kind:'close',name:'January transfer deadline'}];
}
export function isTransferWindowOpen(date){
  if(!date)return true;
  return ['07','08','01'].includes(date.slice(5,7))||date===OPENING_DEADLINE;
}
