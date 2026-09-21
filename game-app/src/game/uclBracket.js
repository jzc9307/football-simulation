import { aiTactics, simMatchSmart, topXI } from './engine.js';

const NAMES={playoff:'Playoff',round16:'Round of 16',quarter:'Quarter-Final',semi:'Semi-Final',final:'Final'};
function aiTie(aId,bId,round,clubs){
  const a=clubs.find(c=>c.id===aId),b=clubs.find(c=>c.id===bId);
  if(!a||!b)throw new Error('Missing Champions League club in bracket');
  const play=(home,away)=>simMatchSmart(topXI(home.players,home.preferredFormation),topXI(away.players,away.preferredFormation),true,aiTactics(home),aiTactics(away));
  const first=play(a,b);
  const second=round==='final'?null:play(b,a);
  const aGoals=first.goalsA+(second?.goalsB||0),bGoals=first.goalsB+(second?.goalsA||0);
  const pens=aGoals===bGoals;
  const winnerId=pens?(Math.random()<0.5?aId:bId):(aGoals>bGoals?aId:bId);
  return {aId,bId,aGoals,bGoals,winnerId,pens,leg1:[first.goalsA,first.goalsB],leg2:second?[second.goalsB,second.goalsA]:null};
}
function stage(name,pairs,myId,clubs){
  return {name:NAMES[name],key:name,ties:pairs.map(([aId,bId])=>aId===myId||bId===myId?{aId,bId,aGoals:0,bGoals:0,winnerId:null,pens:false,leg1:null,leg2:null}:aiTie(aId,bId,name,clubs))};
}
function r16Pairs(bracket){
  const playoff=bracket.stages.find(s=>s.key==='playoff');
  const winners=playoff.ties.map(t=>t.winnerId);
  if(winners.some(id=>!id))return null;
  return bracket.top8.map((id,i)=>[id,winners[i]]);
}
export function startUclBracket(phaseTable,myId,clubs){
  const top8=phaseTable.slice(0,8).map(r=>r.id);
  const pool=phaseTable.slice(8,24).map(r=>r.id);
  const playoffPairs=Array.from({length:8},(_,i)=>[pool[i],pool[15-i]]);
  const bracket={top8,stages:[stage('playoff',playoffPairs,myId,clubs)]};
  if(top8.includes(myId))bracket.stages.push(stage('round16',r16Pairs(bracket),myId,clubs));
  return bracket;
}
export function bracketCurrentTie(bracket,myId){
  const current=bracket?.stages?.find(s=>s.ties.some(t=>!t.winnerId&&(t.aId===myId||t.bId===myId)));
  return current?{stage:current,tie:current.ties.find(t=>t.aId===myId||t.bId===myId)}:null;
}
export function completeUserTie(bracket,myId,myGoals,oppGoals,pens=false,wonPens=false,clubs=[]){
  const current=bracketCurrentTie(bracket,myId);
  if(!current)return bracket;
  const stages=bracket.stages.map(s=>({...s,ties:s.ties.map(t=>({...t}))}));
  const tie=stages.find(s=>s.key===current.stage.key).ties.find(t=>t.aId===myId||t.bId===myId);
  const mineFirst=tie.aId===myId;
  tie.aGoals=mineFirst?myGoals:oppGoals;tie.bGoals=mineFirst?oppGoals:myGoals;
  tie.pens=pens;
  tie.winnerId=pens?(wonPens?myId:(mineFirst?tie.bId:tie.aId)):(myGoals>oppGoals?myId:(mineFirst?tie.bId:tie.aId));
  const nextKey={playoff:'round16',round16:'quarter',quarter:'semi',semi:'final'}[current.stage.key];
  if(nextKey){
    const pairs=nextKey==='round16'?bracket.top8.map((id,i)=>[id,stages[0].ties[i].winnerId]):Array.from({length:stages.at(-1).ties.length/2},(_,i)=>[stages.at(-1).ties[2*i].winnerId,stages.at(-1).ties[2*i+1].winnerId]);
    stages.push(stage(nextKey,pairs,myId,clubs));
    // Once the user's club exits, finish the remaining AI ties so the bracket has a champion.
    if(tie.winnerId!==myId){
      const keys=['quarter','semi','final'];
      while(stages.at(-1).key!=='final'){
        const last=stages.at(-1);
        const following=keys[keys.indexOf(last.key)+1];
        if(!following)break;
        const nextPairs=Array.from({length:last.ties.length/2},(_,i)=>[last.ties[2*i].winnerId,last.ties[2*i+1].winnerId]);
        stages.push(stage(following,nextPairs,myId,clubs));
      }
    }
  }
  return {...bracket,stages};
}
