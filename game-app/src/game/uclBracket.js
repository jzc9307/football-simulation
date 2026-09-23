import { aiTactics, simMatchSmart, topXI } from './engine.js';

const NAMES={playoff:'Playoff',round16:'Round of 16',quarter:'Quarter-Final',semi:'Semi-Final',final:'Final'};
function aiTie(aId,bId,round,clubs){
  const a=clubs.find(c=>c.id===aId),b=clubs.find(c=>c.id===bId);
  if(!a||!b)throw new Error('Missing Champions League club in bracket');
  const play=(home,away,neutralVenue=false)=>simMatchSmart(topXI(home.players,home.preferredFormation),topXI(away.players,away.preferredFormation),neutralVenue?null:true,aiTactics(home),aiTactics(away));
  const first=play(a,b,round==='final');
  const second=round==='final'?null:play(b,a);
  const aGoals=first.goalsA+(second?.goalsB||0),bGoals=first.goalsB+(second?.goalsA||0);
  const pens=aGoals===bGoals;
  const winnerId=pens?(Math.random()<0.5?aId:bId):(aGoals>bGoals?aId:bId);
  return {aId,bId,aGoals,bGoals,winnerId,pens,leg1:[first.goalsA,first.goalsB],leg2:second?[second.goalsB,second.goalsA]:null};
}
function pendingTie(aId,bId){return {aId,bId,aGoals:0,bGoals:0,winnerId:null,pens:false,leg1:null,leg2:null};}
function stage(name,pairs,myId,clubs){
  return {name:NAMES[name],key:name,ties:pairs.map(([aId,bId])=>!aId||!bId||aId===myId||bId===myId?pendingTie(aId,bId):aiTie(aId,bId,name,clubs))};
}
function r16Pairs(bracket){
  const playoff=bracket.stages.find(s=>s.key==='playoff');
  const winners=playoff.ties.map(t=>t.winnerId);
  return bracket.r16SeedOrder.map((id,i)=>[id,winners[i]||null]);
}
export function startUclBracket(phaseTable,myId,clubs){
  const top8=phaseTable.slice(0,8).map(r=>r.id);
  const pool=phaseTable.slice(8,24).map(r=>r.id);
  const playoffPairs=Array.from({length:8},(_,i)=>[pool[i],pool[15-i]]);
  // A standard seeded tree keeps 1 and 2 at opposite ends, so they can meet only in the final.
  // It also places 1/4 and 2/3 on separate semi-final paths.
  const r16SeedOrder=[0,7,4,3,2,5,6,1].map(index=>top8[index]);
  const bracket={top8,r16SeedOrder,stages:[stage('playoff',playoffPairs,myId,clubs)]};
  // Show every direct qualifier immediately; a null opponent is replaced by its playoff winner.
  bracket.stages.push(stage('round16',r16Pairs(bracket),myId,clubs));
  return bracket;
}
export function bracketCurrentTie(bracket,myId){
  const current=bracket?.stages?.find(s=>s.ties.some(t=>t.aId&&t.bId&&!t.winnerId&&(t.aId===myId||t.bId===myId)));
  return current?{stage:current,tie:current.ties.find(t=>t.aId===myId||t.bId===myId)}:null;
}
function nextPairs(stage){return Array.from({length:stage.ties.length/2},(_,i)=>[stage.ties[2*i].winnerId,stage.ties[2*i+1].winnerId]);}
function finishAiStages(stages,myId,clubs){
  const nextFor={round16:'quarter',quarter:'semi',semi:'final'};
  while(stages.at(-1).key!=="final"){
    const previous=stages.at(-1),nextKey=nextFor[previous.key];
    if(!nextKey||previous.ties.some(t=>!t.winnerId))break;
    stages.push(stage(nextKey,nextPairs(previous),myId,clubs));
  }
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
  if(current.stage.key==='playoff'){
    const playoffIndex=stages.find(s=>s.key==='playoff').ties.indexOf(tie);
    const round16=stages.find(s=>s.key==='round16');
    const seededClubId=round16.ties[playoffIndex].aId;
    round16.ties[playoffIndex]=stage('round16',[[seededClubId,tie.winnerId]],myId,clubs).ties[0];
    if(tie.winnerId!==myId)finishAiStages(stages,myId,clubs);
    return {...bracket,stages};
  }
  const nextKey={playoff:'round16',round16:'quarter',quarter:'semi',semi:'final'}[current.stage.key];
  if(nextKey){
    const currentStage=stages.find(s=>s.key===current.stage.key);
    const pairs=nextPairs(currentStage);
    stages.push(stage(nextKey,pairs,myId,clubs));
    // Once the user's club exits, finish the remaining AI ties so the bracket has a champion.
    if(tie.winnerId!==myId){
      finishAiStages(stages,myId,clubs);
    }
  }
  return {...bracket,stages};
}
