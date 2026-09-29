import { positionFit, unavailablePlayerIds, findClubAnywhere, formationProfile } from './engine.js';
import { FORMATIONS } from './config.js';
import { nextFixture } from './seasonSchedule.js';
import { contractMonths } from './playerLife.js';
export function assistantAdvice(s){
  const club=s.clubs.find(c=>c.id===s.myClubId);if(!club)return [];
  const unavailable=new Set(unavailablePlayerIds(s,s.activeEuropeanCompetition?'ucl':'domestic'));
  const starters=new Set(Object.values(s.lineup||{})),tips=[];
  const promise=club.players.find(p=>p.life?.promise?.status==='active'&&p.life.promise.kind==='minutes'&&!starters.has(p.id)&&!unavailable.has(p.id));
  if(promise)tips.push({id:'promise',tone:'warning',title:'Keep your word',body:`${promise.name} still needs ${Math.max(0,promise.life.promise.needed-promise.life.promise.fulfilled)} meaningful appearance(s) in ${promise.life.promise.remaining} eligible matches.`,action:'Give them a start',kind:'start',playerId:promise.id});
  const slots=FORMATIONS[s.formation]||[];
  const tired=Object.entries(s.lineup||{}).map(([slot,id])=>({slot,p:club.players.find(p=>p.id===id)})).filter(x=>x.p&&(x.p.energy??100)<70).sort((a,b)=>a.p.energy-b.p.energy)[0];
  if(tired){
    const replacement=club.players.filter(p=>!starters.has(p.id)&&!unavailable.has(p.id)&&(p.energy??100)>=80&&positionFit(slots[tired.slot]?.role,p)>=.9).sort((a,b)=>b.ovr-a.ovr)[0];
    if(replacement)tips.push({id:'energy',tone:'warning',title:'Fresh legs, same role',body:`${tired.p.name} has ${Math.round(tired.p.energy)}% energy. ${replacement.name} is a natural ${slots[tired.slot].role} with ${Math.round(replacement.energy??100)}% energy.`,action:`Start ${replacement.name.split(' ').at(-1)}`,kind:'start',playerId:replacement.id,slotIndex:Number(tired.slot)});
  }
  const renewal=club.players.filter(p=>!p.loan&&p.life?.happiness>=65&&contractMonths(p,s.currentDate)>0&&contractMonths(p,s.currentDate)<=12&&!p.contract?.signedDate).sort((a,b)=>b.ovr-a.ovr)[0];
  if(renewal)tips.push({id:'contract',tone:'calm',title:'Protect a valuable asset',body:`${renewal.name} is happy here, but only ${contractMonths(renewal,s.currentDate)} months remain. Explore a renewal before the next window.`,action:'Discuss their future',kind:'renew',playerId:renewal.id});
  const fixture=nextFixture(s),days=fixture?Math.round((Date.parse(fixture.date)-Date.parse(s.currentDate))/86400000):99;
  const rotation=s.teamSheets?.find(t=>t.id!==s.activeTeamSheetId&&/cup|rotation|reserve/i.test(t.name));
  if(days<=3&&rotation&&Object.values(s.lineup||{}).some(id=>(club.players.find(p=>p.id===id)?.energy??100)<85))tips.push({id:'congestion',tone:'calm',title:'Manage the turnaround',body:`The next fixture is ${days<=0?'today':`in ${days} day(s)`}. Your ${rotation.name} team sheet is ready to review.`,action:'Review team sheets',kind:'studio'});
  if(fixture){
    const opponent=findClubAnywhere(s,fixture.homeId===s.myClubId?fixture.awayId:fixture.homeId),profile=formationProfile(s.formation);
    const weak=Object.entries(s.lineup||{}).find(([slot,id])=>{const p=club.players.find(p=>p.id===id);return p&&positionFit(slots[slot]?.role,p)<.85;});
    if(weak)tips.push({id:'fit',tone:'warning',title:'A role needs attention',body:`One starter is out of position for ${s.formation}. Review your shape before ${opponent?.name||'kickoff'}.`,action:'Review match plan',kind:'studio'});
    else if(profile?.risk)tips.push({id:'tactics',tone:'calm',title:`Before ${opponent?.name||'kickoff'}`,body:`${profile.risk}. Keep this trade-off in mind when setting your match plan.`,action:'Review tactics',kind:'studio'});
  }
  return tips.slice(0,3);
}
