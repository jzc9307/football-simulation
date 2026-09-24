import test from "node:test";
import assert from "node:assert/strict";
import {freshState,autoLineup,ensureFixtures,roundRobin,initTable,unavailablePlayerIds} from "../src/game/engine.js";
import {FORMATIONS} from "../src/game/config.js";
import {createUclCampaign} from "../src/game/uclSelection.js";
import {prepareNextFixture} from "../src/game/seasonFlow.js";
import {nextFixture,isMyFixture,syncKnockoutSchedule,dateValue} from "../src/game/seasonSchedule.js";
import {playLeagueRound,playDomesticCup,playEuropeanLeague,advanceEuropeanLeague,startEuropeanKnockout,playEuropeanKnockout,advanceEuropeanKnockout} from "../src/game/actions.js";
import {saveGame,loadGame} from "../src/game/storage.js";
function game(league="PL",id="liv"){
 let s=freshState();s.league=league;s.clubs=s[{PL:"plClubs",LALIGA:"laligaClubs",SERIEA:"serieaClubs",BUNDES:"bundesligaClubs",LIGUE1:"ligue1Clubs"}[league]];s.myClubId=id||s.clubs[0].id;
 const me=s.clubs.find(c=>c.id===s.myClubId);s={...s,budget:me.budget,formation:me.preferredFormation,stage:"squad",simMode:"match",scheduleMigrationDone:true};
 s.lineup=autoLineup(FORMATIONS[s.formation],me.players);if(id==="liv")s.ucl=createUclCampaign(s,roundRobin,initTable);
 return ensureFixtures(s);
}
function ready(s){const banned=new Set(unavailablePlayerIds(s,s.stage==="ucl"?"ucl":"domestic"));return {...s,lineup:autoLineup(FORMATIONS[s.formation],s.clubs.find(c=>c.id===s.myClubId).players.filter(p=>!banned.has(p.id)))};}
test("earliest fixture guards prevent playing Europe and cups early",()=>{
 const s=prepareNextFixture(game());assert.equal(nextFixture(s).competition,"PL");
 assert.throws(()=>playEuropeanLeague(s),/next scheduled fixture/);
 assert.throws(()=>playDomesticCup(s,"fa","Third Round"),/next scheduled fixture/);
});
test("complete season follows one chronological queue, including cup and UCL knockout games",()=>{
 let s=prepareNextFixture(game()),date="0000",count=0;const seen=new Set(),competitions=new Set();
 for(;count<100;count++){
  if(s.stage==="half-results"){s=prepareNextFixture({...s,midSeasonDone:true});continue;}
  if(s.stage==="full-results")break;
  const e=nextFixture(s);assert.ok(e,"next fixture exists");assert.ok(e.date>=date,`time moved backwards ${date} -> ${e.date}`);date=e.date;
  assert.ok(!seen.has(e.id),"no replay");seen.add(e.id);competitions.add(e.competition);
  s=ready(s);
  if(e.kind==="league"){s=playLeagueRound(s);s=prepareNextFixture(s);}
  else if(e.kind==="cup"){s=playDomesticCup(s,e.comp,e.round);assert.equal(s.lastCupResult.opponentId,e.homeId===s.myClubId?e.awayId:e.homeId);s=prepareNextFixture(s);}
  else if(typeof e.round==="number"){s=playEuropeanLeague(s);s=advanceEuropeanLeague(s);if(s.ucl.stage==="phase-summary")s=startEuropeanKnockout(s);}
  else {s=playEuropeanKnockout(s);s=prepareNextFixture(syncKnockoutSchedule(advanceEuropeanKnockout(s)));}
 }
 assert.ok(count<100);assert.equal(s.results1.length+s.results2.length,38);assert.equal(s.ucl.campaignResults.filter(r=>r.stage==="League Phase").length,8);
 assert.deepEqual([...competitions].sort(),["CARABAO","FA","PL","UCL"]);assert.equal(s.stage,"full-results");
 assert.ok(s.tableFinal.every(r=>r.played===38));
 assert.ok(!s.seasonSchedule.some(e=>e.status==="scheduled"&&isMyFixture(s,e)));
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 saveGame(storage,s);const restored=loadGame(storage);assert.equal(restored.seasonSchedule.length,s.seasonSchedule.length);
 console.log("Season verified:",count,"fixtures; last date",date,"UCL outcome",s.ucl.outcome);
});
test("five leagues have complete draws and no invalid opponent dates",()=>{
 for(const league of ["PL","LALIGA","SERIEA","BUNDES","LIGUE1"]){
  const s=game(league,null);assert.ok(s.seasonSchedule.every(e=>Number.isFinite(dateValue(e.date))));
  const cups=s.seasonSchedule.filter(e=>e.kind==="cup");assert.ok(cups.length>0);assert.ok(cups.filter(e=>e.status==="scheduled").every(e=>e.homeId&&e.awayId));
  assert.equal(s.seasonSchedule.filter(e=>e.kind==="league").length,s.clubs.length*(s.clubs.length-1));
 }
});

