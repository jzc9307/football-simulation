import { seasonDate, addDays, dateValue, resolveCalendarConflicts, addMail, isMyFixture } from "./seasonSchedule.js";
const ROUNDS=[["playoff","Playoff",8,2,16],["round16","Round of 16",8,3,9],["quarter","Quarter-Final",4,4,6],["semi","Semi-Final",2,4,27],["final","Final",1,5,29]];
function dateFor(season,month,day,final){const date=seasonDate(season,month,day);return addDays(date,((final?6:2)-new Date(dateValue(date)).getUTCDay()+7)%7);}
const empty=(aId=null,bId=null)=>({aId,bId,aGoals:0,bGoals:0,winnerId:null,pens:false,leg1:null,leg2:null});
export function initializeEuropeanKnockout(state){
 if(state.ucl?.knockoutBracket?.calendarDriven)return state;
 const rows=state.ucl.phaseTable,top8=rows.slice(0,8).map(r=>r.id),pool=rows.slice(8,24).map(r=>r.id),order=[0,7,4,3,2,5,6,1].map(i=>top8[i]);
 const stages=ROUNDS.map(([key,name,count])=>({key,name,ties:Array.from({length:count},(_,i)=>key==="playoff"?empty(pool[i],pool[15-i]):key==="round16"?empty(order[i],null):empty())}));
 let s={...state,ucl:{...state.ucl,knockoutBracket:{calendarDriven:true,top8,r16SeedOrder:order,stages}}};
 s=syncEuropeanDraw(s);
 const before=new Map(state.seasonSchedule.map(e=>[e.id,e.date]));
 const schedule=resolveCalendarConflicts(s.seasonSchedule);
 s={...s,seasonSchedule:schedule};
 for(const event of schedule.filter(e=>e.kind==="league"&&isMyFixture(s,e)&&before.get(e.id)!==e.date))s=addMail(s,{type:"fixture",competition:event.competition,subject:"Fixture rearranged",body:`Your league fixture has moved to ${event.date} following the European knockout draw.`});
 return s;
}
export function syncEuropeanDraw(state){
 const original=state.ucl?.knockoutBracket;if(!original?.calendarDriven)return state;
 const bracket={...original,stages:original.stages.map(stage=>({...stage,ties:stage.ties.map(t=>({...t}))}))};
 const events=new Map((state.seasonSchedule||[]).map(e=>[e.id,{...e}]));
 for(let r=0;r<ROUNDS.length;r++){
  const [key,name,,month,day]=ROUNDS[r],stage=bracket.stages[r],final=key==="final";
  stage.ties.forEach((tie,i)=>{
   if(r===1)tie.bId=bracket.stages[0].ties[i].winnerId||tie.bId;
   if(r>1){tie.aId=bracket.stages[r-1].ties[i*2].winnerId||tie.aId;tie.bId=bracket.stages[r-1].ties[i*2+1].winnerId||tie.bId;}
   const date=dateFor(state.season,month,day,final);
   for(let leg=1;leg<=(final?1:2);leg++){
    const id=`ucl-tree:${key}:${i}:${leg}`,old=events.get(id);
    // The seeded/first-listed team hosts the return leg.
    const homeId=final||leg===2?tie.aId:tie.bId,awayId=final||leg===2?tie.bId:tie.aId;
    if(old?.status!=="completed")events.set(id,{...old,id,competition:"UCL",kind:"europe",round:name,knockoutKey:key,tieIndex:i,leg,date:addDays(date,(leg-1)*7),homeId,awayId,status:homeId&&awayId?"scheduled":"pending-draw",neutral:final});
   }
   const first=events.get(`ucl-tree:${key}:${i}:1`),second=final?null:events.get(`ucl-tree:${key}:${i}:2`);
   const firstDone=first?.status==="completed",secondDone=second?.status==="completed";
   tie.leg1=firstDone?(final?[first.result.homeGoals,first.result.awayGoals]:[first.result.awayGoals,first.result.homeGoals]):null;
   tie.leg2=secondDone?[second.result.homeGoals,second.result.awayGoals]:null;
   tie.aGoals=(tie.leg1?.[0]||0)+(tie.leg2?.[0]||0);tie.bGoals=(tie.leg1?.[1]||0)+(tie.leg2?.[1]||0);
   const deciding=final?first:second;
   if(deciding?.status==="completed"){tie.winnerId=deciding.winnerId;tie.pens=!!deciding.result.notes?.includes("penalties");}
  });
 }
 return {...state,ucl:{...state.ucl,knockoutBracket:bracket},seasonSchedule:[...events.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id))};
}
export function knockoutContext(state,event){
 const leg1=state.seasonSchedule.find(e=>e.knockoutKey===event.knockoutKey&&e.tieIndex===event.tieIndex&&e.leg===1);
 const mineHome=leg1?.homeId===state.myClubId;
 const aggregate=event.leg===2&&leg1?.result?{mine:mineHome?leg1.result.homeGoals:leg1.result.awayGoals,opp:mineHome?leg1.result.awayGoals:leg1.result.homeGoals}:{mine:0,opp:0};
 const rounds=ROUNDS.map(r=>r[1]);
 return {...state.ucl,stage:"knockout-prep",knockoutRounds:rounds,knockoutRoundIndex:rounds.indexOf(event.round),leg:event.leg,aggregate,firstLegHomeA:mineHome,currentKnockoutOpponentId:event.homeId===state.myClubId?event.awayId:event.homeId};
}

