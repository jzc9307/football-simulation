import { OPENING_DEADLINE } from './openingTransfers.js';
export const DEADLINE_HOURS=20;
export function deadlineDate(date){
  const year=date.slice(0,4);
  return date.slice(5,7)==='01'?`${year}-01-31`:year==='2026'?OPENING_DEADLINE:`${year}-08-31`;
}
export const isDeadlineDate=date=>!!date&&date===deadlineDate(date);
export const deadlineActive=s=>s.deadlineDay?.date===s.currentDate&&!s.deadlineDay.closed;
export function enterDeadline(s){
  if(s.deadlineDay?.date===s.currentDate)return s;
  return {...s,deadlineDay:{date:s.currentDate,hour:0,closed:false,feed:[{id:`opening:${s.currentDate}`,hour:0,text:'The final 20 hours. Fees stay reserved until a signing is complete.'}]}};
}
export function deadlineFeed(s,text,id){
  if(!deadlineActive(s)||s.deadlineDay.feed.some(e=>e.id===id))return s;
  return {...s,deadlineDay:{...s.deadlineDay,feed:[{id,hour:s.deadlineDay.hour,text},...s.deadlineDay.feed].slice(0,60)}};
}
