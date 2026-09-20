import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, autoLineup, ensureFixtures, topXI, teamRatings, simMatchSmart, aiTactics, resolveTie, lineupIssue, applyMatchFitness, revealStats, seasonLabel } from '../src/game/engine.js';
import { FORMATIONS } from '../src/game/config.js';
import { simulateHalf, playLeagueRound, advanceLeagueRound, playDomesticCup, playEuropeanKnockout, advanceEuropeanKnockout } from '../src/game/actions.js';
import { transfer, startNextSeason, loanFee, allClubs } from '../src/game/career.js';
import { saveGame, loadGame, validateSave, exportGame } from '../src/game/storage.js';

const leagues={PL:'plClubs',LALIGA:'laligaClubs',SERIEA:'serieaClubs',BUNDES:'bundesligaClubs',LIGUE1:'ligue1Clubs'};
function game(league='PL'){
  const s=freshState(),clubs=s[leagues[league]],club=clubs[0],formation=club.preferredFormation;
  return {...s,stage:'squad',league,clubs,myClubId:club.id,budget:club.budget,formation,lineup:autoLineup(FORMATIONS[formation],club.players)};
}
function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function store(){const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};}
function complete(s){s=simulateHalf(s,1);s={...s,stage:'squad2'};return {...simulateHalf(s,2),stage:'summary'};}

test('all five leagues complete both halves and carry forward to the next season',()=>{
  for(const league of Object.keys(leagues)){
    const start=game(league),s=complete(start),n=start.clubs.length;
    assert.equal(s.results1.length,n-1);assert.equal(s.results2.length,n-1);
    assert.equal(s.results2[0].gw,n);assert.equal(s.results2.at(-1).gw,2*(n-1));
    assert.ok(s.tableFinal.every(r=>r.played===2*(n-1)&&r.w+r.d+r.l===r.played));
    assert.equal(s.tableFinal.reduce((sum,r)=>sum+r.gf,0),s.tableFinal.reduce((sum,r)=>sum+r.ga,0));
    const next=startNextSeason(s);
    assert.equal(next.myClubId,start.myClubId);assert.equal(next.season,2);assert.equal(next.results1.length,0);
    assert.equal(next.history.length,1);assert.equal(next.roundsHalf1,null);assert.equal(next.stage,'squad');
    assert.equal(seasonLabel(next),'2027/28');assert.equal(lineupIssue(next),'');
  }
});
test('18-team match-by-match progression stops exactly after 17 matches per half',()=>{
  let s=ensureFixtures(game('BUNDES'));
  for(const half of [1,2]){
    s={...s,half,roundIndex:0,stage:'matchday-prep'};
    for(let i=0;i<17;i++){
      s=playLeagueRound(s);assert.equal(s.stage,'matchday-live');
      const home=s.lastResult.isHome?s.lastResult.myGoals:s.lastResult.oppGoals;
      assert.equal(s.lastLiveContext.timeline.filter(e=>e.isGoal&&e.teamName===s.lastLiveContext.homeName).length,home);
      s=advanceLeagueRound({...s,stage:'matchday-result'});
      assert.equal(s.stage,i===16?(half===1?'half-results':'full-results'):'matchday-prep');
    }
  }
  assert.ok(s.tableFinal.every(r=>r.played===34));
});
test('events, replay statistics and scores agree, including added time',()=>{
  const s=game(),a=s.clubs[0],b=s.clubs[1];let stoppage=0,misses=0;
  for(let seed=1;seed<=200;seed++){
    const sim=simMatchSmart(topXI(a.players,a.preferredFormation),topXI(b.players,b.preferredFormation),true,aiTactics(a),aiTactics(b),rng(seed));
    for(const side of [0,1]){
      const events=sim.match.events.filter(e=>e.side===side);
      assert.equal(events.filter(e=>e.isGoal===true).length,side===0?sim.goalsA:sim.goalsB);
      assert.equal(sim.match.goalLists[side].length,side===0?sim.goalsA:sim.goalsB);
      assert.ok(sim.match.stats.shots[side]>=sim.match.stats.sot[side]);
      assert.ok(sim.match.stats.sot[side]>=(side===0?sim.goalsA:sim.goalsB));
      for(const miss of events.filter(e=>e.type.endsWith('-miss'))){assert.equal(miss.isGoal,false);misses++;}
      const red=sim.match.redCards[side];
      if(red)assert.ok(!events.some(e=>e.isGoal&&e.playerId===red.id&&e.minute>=red.minute));
      for(const sub of events.filter(e=>e.type==='sub'))assert.ok(!events.some(e=>e.isGoal&&e.playerId===sub.outId&&e.minute>=sub.minute));
    }
    stoppage+=sim.match.events.filter(e=>e.isGoal&&e.minute>90).length;
    assert.deepEqual(revealStats(sim.match.stats,95).shots,sim.match.stats.shots);
  }
  assert.ok(stoppage>0);assert.ok(misses>0);
});
test('halftime plans and substitutions execute at the planned minute',()=>{
  const s=game(),a=s.clubs[0],b=s.clubs[1];
  const sim=simMatchSmart(topXI(a.players,a.preferredFormation),topXI(b.players,b.preferredFormation),true,{...aiTactics(a),halftimeStyle:'counter'},aiTactics(b),rng(123));
  assert.ok(sim.match.events.some(e=>e.side===0&&e.type==='tactics'&&e.minute===46));
  assert.ok(sim.match.events.some(e=>e.side===0&&e.type==='sub'&&e.minute===60));
  assert.deepEqual(sim,simMatchSmart(topXI(a.players,a.preferredFormation),topXI(b.players,b.preferredFormation),true,{...aiTactics(a),halftimeStyle:'counter'},aiTactics(b),rng(123)));
});
test('missing players and low condition reduce team strength; invalid XI is rejected',()=>{
  const s=game(),xi=topXI(s.clubs[0].players,s.formation);
  assert.equal(xi.length,11);assert.equal(xi[0].role,'GK');assert.equal(new Set(xi.map(p=>p.id)).size,11);
  assert.ok(teamRatings(xi.slice(0,7)).attack<teamRatings(xi).attack);
  assert.ok(teamRatings(xi.map(p=>({...p,condition:40}))).attack<teamRatings(xi).attack);
  assert.throws(()=>playLeagueRound({...ensureFixtures(s),lineup:{}}),/11 different/);
  assert.match(lineupIssue({...s,suspensions:{domestic:[xi[0].id],ucl:[]}}),/suspended/);
});
test('two-leg decisions use aggregate, not the second-leg winner or draw',()=>{
  assert.equal(resolveTie(0,1,{mine:3,opp:0}).won,true);
  assert.equal(resolveTie(1,0,{mine:0,opp:3}).won,false);
  assert.equal(resolveTie(0,0,{mine:2,opp:0}).wentToPens,false);
  assert.equal(resolveTie(0,2,{mine:2,opp:0},true,()=>0).won,true);
  assert.equal(resolveTie(0,2,{mine:2,opp:0},true,()=>1).won,false);
  assert.equal(resolveTie(1,1,{mine:0,opp:0},false).wentToPens,false);
});
test('European knockout action and advance agree with the aggregate outcome',()=>{
  const s=game(),opp=s.clubs[1];s.stage='ucl';s.ucl={clubs:s.clubs,knockoutRounds:['Quarter-Final','Semi-Final','Final'],knockoutRoundIndex:0,currentKnockoutOpponentId:opp.id,leg:2,aggregate:{mine:100,opp:0},firstLegHomeA:true,campaignRecord:{w:0,d:0,l:0,gf:0,ga:0},campaignResults:[],knockoutFaced:[]};
  const played=playEuropeanKnockout(s);assert.equal(played.ucl.lastMatch.won,true);assert.equal(played.ucl.lastMatch.wentToPens,false);
  const next=advanceEuropeanKnockout(played);assert.equal(next.ucl.knockoutRoundIndex,1);assert.equal(next.ucl.leg,1);
});
test('cup score and domestic live context agree',()=>{
  const s=playDomesticCup(ensureFixtures(game()),'fa','Third Round'),r=s.lastCupResult;
  assert.equal(s.stage,'cup-live');assert.equal(s.lastLiveContext.timeline.filter(e=>e.isGoal).length,r.myGoals+r.oppGoals);
});
test('loans charge a fee, block resale and return to the owner next season',()=>{
  let s=game();s.budget=200;
  const seller=s.clubs[1],p=seller.players.find(p=>p.role!=='GK');
  s=transfer(s,{type:'loan-in',sellerId:seller.id,playerId:p.id});
  assert.equal(s.budget,200-loanFee(p));assert.equal(s.loans[0].ownerId,seller.id);
  assert.throws(()=>transfer(s,{type:'sell',playerId:p.id}),/loan player/);
  assert.throws(()=>transfer(s,{type:'loan-out',playerId:p.id}),/loan player/);
  assert.equal(allClubs(s).flatMap(c=>c.players).filter(x=>x.id===p.id).length,1);
  s=startNextSeason(complete(s));
  assert.equal(s.loans.length,0);assert.ok(s.clubs.find(c=>c.id===seller.id).players.some(x=>x.id===p.id&&!x.loan));
  assert.ok(!s.clubs[0].players.some(x=>x.id===p.id));
});
test('transfers enforce window, budget, loan cap, squad depth and current ownership',()=>{
  let s=game();const seller=s.clubs[1],p=seller.players.find(p=>p.role!=='GK');
  assert.throws(()=>transfer({...s,stage:'matchday-prep'},{type:'buy',sellerId:seller.id,playerId:p.id}),/windows/);
  assert.throws(()=>transfer({...s,budget:0},{type:'buy',sellerId:seller.id,playerId:p.id}),/budget/);
  s={...s,budget:500};
  const bought=transfer(s,{type:'buy',sellerId:seller.id,playerId:p.id});
  assert.throws(()=>transfer(bought,{type:'buy',sellerId:seller.id,playerId:p.id}),/no longer/);
  for(let i=1;i<=3;i++)s=transfer(s,{type:'loan-in',sellerId:s.clubs[i].id,playerId:s.clubs[i].players.find(p=>p.role!=='GK').id});
  assert.throws(()=>transfer(s,{type:'loan-in',sellerId:s.clubs[4].id,playerId:s.clubs[4].players.find(p=>p.role!=='GK').id}),/three/);
  const thin={...s,clubs:s.clubs.map(c=>c.id===seller.id?{...c,players:c.players.slice(0,16)}:c)};
  assert.throws(()=>transfer(thin,{type:'buy',sellerId:seller.id,playerId:thin.clubs[1].players[0].id}),/16 players/);
});
test('match fitness, appearances, aging and development carry into the next season',()=>{
  const s=game(),played=playLeagueRound(ensureFixtures(s));
  assert.ok(played.clubs[0].players.some(p=>p.appearances===1&&p.condition<100));
  assert.equal(s.clubs[0].players[0].appearances,0);
  assert.equal(applyMatchFitness(s,null),s);
  let done=complete(s);const player=done.clubs[0].players.find(p=>p.age<24);player.appearances=20;const prior={...player};
  const next=startNextSeason(done).clubs[0].players.find(p=>p.id===prior.id);
  assert.equal(next.age,prior.age+1);assert.equal(next.ovr,prior.ovr+1);assert.equal(next.condition,100);
});
test('save/load and import/export preserve transfers and progress without oversized match history',()=>{
  let s=complete(game('LIGUE1'));const memory=store();saveGame(memory,s);
  const loaded=loadGame(memory);assert.equal(loaded.results2.length,17);assert.equal(loaded.tableFinal[0].pts,s.tableFinal[0].pts);
  assert.equal(validateSave(JSON.parse(exportGame(s))).myClubId,s.myClubId);
  assert.ok(exportGame(s).length<4_000_000);
  const live=playLeagueRound(ensureFixtures(game()));saveGame(memory,live);const resumed=loadGame(memory);
  assert.equal(resumed.stage,'matchday-live');assert.deepEqual(resumed.lastLiveContext.timeline,live.lastLiveContext.timeline);
});
test('bad saves fail visibly; storage exceptions propagate; legacy new game migrates',()=>{
  const memory=store();memory.setItem('pl-manager-save-v8',JSON.stringify(game()));assert.equal(loadGame(memory).season,1);
  assert.throws(()=>validateSave({...game(),budget:-1}),/budget/);
  assert.throws(()=>validateSave({...game(),stage:'nonsense'}),/screen/);
  assert.throws(()=>saveGame({setItem(){throw new Error('Quota exceeded');}},game()),/Quota/);
  memory.setItem('football-manager-save-v1','{broken');assert.throws(()=>loadGame(memory));
  assert.equal(memory.getItem('football-manager-save-v1'),'{broken');
});
test('legacy 18-team save stranded after match 17 recovers to half results',()=>{
  let s=simulateHalf(game('BUNDES'),1);s={...s,stage:'matchday-prep',roundIndex:17,half:1};
  assert.equal(validateSave(s).stage,'half-results');
});
test('every included club can field eleven distinct players with a goalkeeper',()=>{
  for(const club of allClubs(freshState())){
    const xi=topXI(club.players,club.preferredFormation);
    assert.equal(xi.length,11,club.name);assert.equal(xi[0].role,'GK',club.name);assert.equal(new Set(xi.map(p=>p.id)).size,11);
  }
});
test('outgoing loans preserve ownership and return the developed player',()=>{
  let s=game();const p=s.clubs[0].players.find(p=>p.role!=='GK');
  s=transfer(s,{type:'loan-out',playerId:p.id});const loan=s.loans[0];
  assert.equal(loan.ownerId,s.myClubId);assert.ok(allClubs(s).find(c=>c.id===loan.borrowerId).players.some(x=>x.id===p.id));
  s={...s,lineup:autoLineup(FORMATIONS[s.formation],s.clubs[0].players)};
  const next=startNextSeason(complete(s));
  assert.ok(next.clubs[0].players.some(x=>x.id===p.id&&!x.loan));
  assert.equal(allClubs(next).flatMap(c=>c.players).filter(x=>x.id===p.id).length,1);
});
test('malformed tactical and fixture saves are rejected',()=>{
  assert.throws(()=>validateSave({...game(),tacticalStyle:'unknown'}),/tactics/);
  const s=ensureFixtures(game());s.roundsHalf1[0][0]=['missing-club','another-missing-club'];
  assert.throws(()=>validateSave(s),/fixture/);
});
