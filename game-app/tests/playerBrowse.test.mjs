import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesPosition, sortPerformancePlayers, performanceStats, PERFORMANCE_COLUMNS } from '../src/game/playerBrowse.js';

const players=[
  {id:'a',name:'Alpha',role:'CB',group:'DEF',ovr:81,secondaryRoles:['LB'],ratedMatches:4,seasonGoals:1,seasonAssists:3,seasonCleanSheets:2,seasonYellowCards:2,seasonRedCards:1,ratingTotal:28,bestRating:8,competitionStats:{league:{appearances:2,ratedMatches:2,goals:1,ratingTotal:12,bestRating:6.5}}},
  {id:'b',name:'Beta',role:'RB',group:'DEF',ovr:80,ratedMatches:2,seasonGoals:4,seasonAssists:1,seasonCleanSheets:1,seasonYellowCards:1,seasonRedCards:0,ratingTotal:16,bestRating:9},
  {id:'c',name:'Charlie',role:'ST',group:'FWD',ovr:79,ratedMatches:0},
];
test('exact position filters include only primary or declared secondary roles, never the whole unit',()=>{
  assert.deepEqual(players.filter(p=>matchesPosition(p,'LB')).map(p=>p.id),['a']);
  assert.deepEqual(players.filter(p=>matchesPosition(p,'RB')).map(p=>p.id),['b']);
  assert.equal(players.filter(p=>matchesPosition(p,'DEF')).length,2);
  assert.equal(players.filter(p=>matchesPosition(p,'ALL')).length,3);
  assert.equal(players.filter(p=>matchesPosition(p,'GK')).length,0);
});
test('all performance columns support ascending/descending without mutating roster order',()=>{
  for(const [key] of PERFORMANCE_COLUMNS){
    const sorted=sortPerformancePlayers(players,{key,direction:'asc'}),reverse=sortPerformancePlayers(players,{key,direction:'desc'});
    assert.equal(sorted.length,3);assert.equal(reverse.length,3);
    const metric=p=>['name','role','ovr'].includes(key)?p[key]:performanceStats(p)[key];
    const values=list=>list.map(metric).filter(value=>value!=null);
    assert.deepEqual(values(sorted),values(reverse).reverse());
  }
  assert.deepEqual(players.map(p=>p.id),['a','b','c']);
  assert.deepEqual(sortPerformancePlayers(players,{key:'goals',direction:'desc'}).map(p=>p.id),['b','a','c']);
  assert.deepEqual(sortPerformancePlayers(players,{key:'yellowCards',direction:'desc'}).map(p=>p.id),['a','b','c']);
});
test('unplayed ratings stay last in both directions and competition sorting uses that competition',()=>{
  for(const direction of ['asc','desc'])assert.equal(sortPerformancePlayers(players,{key:'average',direction}).at(-1).id,'c');
  assert.equal(performanceStats(players[0],'league').average,6);
  assert.equal(performanceStats(players[0],'league').appearances,2);
  assert.equal(sortPerformancePlayers(players,{key:'goals',direction:'desc'},'league')[0].id,'a');
});
