import {mapLifeClubs,ensurePlayerLife} from './playerLife.js';
import {listPlayerForLoan,marketOpen} from './career.js';
const clamp=n=>Math.max(0,Math.min(100,n));
export const liveLetterPlayer=(s,id)=>[...(s.clubs||[]),...Object.keys(s).filter(k=>k.endsWith('Clubs')).flatMap(k=>s[k]||[])].flatMap(c=>c.players).find(p=>p.id===id)||(s.freeAgents||[]).find(p=>p.id===id);
function managedPlayer(s,m){
  const id=m.playerCard?.id,own=s.clubs?.find(c=>c.id===s.myClubId)?.players.find(p=>p.id===id);
  return own||(s.loans?.some(l=>l.playerId===id&&l.ownerId===s.myClubId)?liveLetterPlayer(s,id):null);
}
export function conversationChoices(s,m){
  const p=managedPlayer(s,m);
  if(!p||m.reply)return [];
  if(m.concernResolved)return [{id:'support',text:'Thanks for your patience. We’re moving forward together.',effect:2,detail:'Earlier concern resolved · no new selection promise'}];
  if(p.loan)return m.type==='loan-thanks'?[{id:'support',text:'Make the most of it. We’ll be following your progress.',effect:2,detail:'Encouragement from your parent club'}]:[];
  if(['player-concern','player-opportunity','transfer-request'].includes(m.type))return [
    {id:'rest',text:'No worries. Rotation gives you time to recover.',effect:(p.energy??100)<85?4:1,detail:'Reassurance · no promise of selection'},
    {id:'minutes',text:'You are in my plans. I’ll give you more minutes.',effect:8,detail:'Promise: meaningful minutes in 2 of the next 5 eligible matches'},
    {id:'challenge',text:'Get your edge back. Your place has to be earned.',effect:-8,detail:'A firm challenge · happiness decreases'},
    ...(p.age<=23&&marketOpen(s)&&!p.loan?[{id:'loan',text:'A loan could give you the opportunities you need.',effect:6,detail:'List for loan · staff will look for a suitable club'}]:[])];
  if(m.type==='renewal-invite'&&p.contract?.signedDate>=m.date)return [{id:'support',text:'I’m glad we agreed your future. Keep working hard.',effect:2,detail:'Your new contract is already signed · no new promise'}];
  if(m.type==='renewal-invite')return [
    {id:'renew',text:'You have a future here. Let’s discuss a new contract.',effect:5,detail:'Promise: reach a new agreement within 30 days'},
    {id:'later',text:'Let’s focus on football. We’ll review your future later.',effect:-3,detail:'No renewal promise'},
    {id:'challenge',text:'Show me why you deserve a new deal.',effect:-8,detail:'Performance comes first · happiness decreases'}];
  if(m.playerCard&&['contract','loan-thanks','promise-update','player-reply'].includes(m.type))return [{id:'support',text:'Keep working hard. We’re behind you.',effect:2,detail:'Encouragement · no new promise'}];
  return [];
}
export function respondToPlayer(input,messageId,choiceId){
  let s=ensurePlayerLife(input),m=s.mail.find(m=>m.id===messageId),choice=m&&conversationChoices(s,m).find(c=>c.id===choiceId);
  if(!choice)throw Error('This conversation has already been answered or is no longer available.');
  const p=managedPlayer(s,m);
  if(p.life.promise?.status==='active'&&['minutes','renew'].includes(choiceId))throw Error('You already made this player a promise. Fulfil it before making another.');
  if(choiceId==='loan')s=listPlayerForLoan(s,p.id);
  const happiness=clamp(p.life.happiness+choice.effect),promise=choiceId==='minutes'?{kind:'minutes',status:'active',remaining:5,needed:2,fulfilled:0,sourceMailId:m.id,date:s.currentDate}:choiceId==='renew'?{kind:'renewal',status:'active',deadline:new Date(Date.parse(`${s.currentDate}T12:00:00Z`)+30*86400000).toISOString().slice(0,10),sourceMailId:m.id,date:s.currentDate}:p.life.promise;
  s=mapLifeClubs(s,c=>({...c,players:c.players.map(x=>x.id!==p.id?x:{...x,life:{...x.life,happiness,promise}})}));
  const answer=choiceId==='minutes'?'Thank you, manager. I’ll be ready when the opportunity comes.':choiceId==='renew'?'That means a lot. My agent is ready to discuss terms.':choiceId==='loan'?'I think that is a good option. Regular football would help me develop.':choiceId==='challenge'?'I understand. I’ll try to prove myself, but I hoped for more support.':choiceId==='rest'?'I understand the need to rotate. I still want to contribute when you need me.':'Thank you for the update, manager.';
  const reply={choiceId,text:choice.text,answer,happinessBefore:p.life.happiness,happinessAfter:happiness,date:s.currentDate};
  return {...s,mail:s.mail.map(x=>x.id===m.id?{...x,read:true,reply}:x)};
}
