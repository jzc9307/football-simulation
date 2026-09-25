import test from "node:test";
import assert from "node:assert/strict";
import {freshState,autoLineup,ensureFixtures,roundRobin,initTable,unavailablePlayerIds} from "../src/game/engine.js";
import {FORMATIONS} from "../src/game/config.js";
import {createUclCampaign} from "../src/game/uclSelection.js";
import {prepareNextFixture,simulateScheduledHalf,migrateSeason,advanceCupWorld} from "../src/game/seasonFlow.js";
import {initializeEuropeanKnockout} from "../src/game/europeanCalendar.js";
import {nextFixture,isMyFixture,syncKnockoutSchedule,dateValue} from "../src/game/seasonSchedule.js";
import {playLeagueRound,playDomesticCup,playEuropeanLeague,advanceEuropeanLeague,startEuropeanKnockout,playEuropeanKnockout,advanceEuropeanKnockout} from "../src/game/actions.js";
import {saveGame,loadGame} from "../src/game/storage.js";
import {startNextSeason} from "../src/game/career.js";
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
  const s=prepareNextFixture(game(league,null));assert.ok(s.seasonSchedule.every(e=>Number.isFinite(dateValue(e.date))));
  const cups=s.seasonSchedule.filter(e=>e.kind==="cup");assert.ok(cups.length>0);assert.ok(cups.filter(e=>e.status==="scheduled").every(e=>e.homeId&&e.awayId));
  assert.equal(s.seasonSchedule.filter(e=>e.kind==="league").length,s.clubs.length*(s.clubs.length-1));
  const byClub=new Map();
  for(const event of s.seasonSchedule.filter(e=>e.status==="scheduled"))for(const id of [event.homeId,event.awayId]){
   if(!byClub.has(id))byClub.set(id,[]);byClub.get(id).push(event);
  }
  for(const [id,fixtures] of byClub){fixtures.sort((a,b)=>a.date.localeCompare(b.date));for(let i=1;i<fixtures.length;i++)assert.ok(dateValue(fixtures[i].date)-dateValue(fixtures[i-1].date)>=3*86400000,`${league} ${id} has insufficient rest between ${fixtures[i-1].competition} and ${fixtures[i].competition}`);}
 }
});

test("a relegated manager receives all 46 Championship league fixtures",()=>{
 let s=freshState();
 s={...s,league:"PL",division:2,clubs:s.championshipClubs,myClubId:s.championshipClubs[0].id,stage:"squad",simMode:"match",scheduleMigrationDone:true};
 const me=s.clubs.find(c=>c.id===s.myClubId);
 s={...s,budget:me.budget,formation:me.preferredFormation,lineup:autoLineup(FORMATIONS[me.preferredFormation],me.players)};
 s=ensureFixtures(s);
 const mine=s.seasonSchedule.filter(event=>event.kind==="league"&&(event.homeId===s.myClubId||event.awayId===s.myClubId));
 assert.equal(s.clubs.length,24);
 assert.equal(s.roundsHalf1.length+s.roundsHalf2.length,46);
 assert.equal(mine.length,46);
});

test("new seasons rebuild fixtures and generated youth survive save reload",()=>{
 let s=game();
 s={...s,ucl:{...s.ucl,stage:"final"},tableFinal:[{id:"liv"},...s.clubs.filter(c=>c.id!=="liv").map(c=>({id:c.id}))]};
 s=prepareNextFixture(startNextSeason(s));
 assert.equal(s.season,2);assert.ok(s.seasonSchedule.every(e=>e.date>="2027-07-01"));
 const youth=s.clubs.find(c=>c.id==="liv").players.filter(p=>p.id.includes(":youth-"));assert.ok(youth.length>=2);
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 saveGame(storage,s);const restored=loadGame(storage);
 assert.deepEqual(restored.clubs.find(c=>c.id==="liv").players.filter(p=>p.id.includes(":youth-")).map(p=>p.id),youth.map(p=>p.id));
});

test("European knockout draws have dated legs and do not reveal future winners",()=>{
 let s=game();
 const ids=["liv",...s.ucl.clubs.filter(c=>c.id!=="liv").map(c=>c.id)];
 s={...s,ucl:{...s.ucl,phaseTable:ids.map(id=>({id})),qualification:"top8"}};
 s=initializeEuropeanKnockout(s);
 assert.ok(s.ucl.knockoutBracket.stages.every(stage=>stage.ties.every(t=>!t.winnerId)));
 const knockout=s.seasonSchedule.filter(e=>e.knockoutKey);
 assert.equal(knockout.length,45);
 assert.ok(knockout.filter(e=>e.round==="Round of 16"&&isMyFixture(s,e)).every(e=>e.status==="pending-draw"));
 s=advanceCupWorld(s,"2027-02-16");
 // Drain preceding domestic rounds, then the first European legs.
 for(let i=0;i<15;i++)s=advanceCupWorld(s,"2027-02-16");
 assert.ok(s.ucl.knockoutBracket.stages[0].ties.every(t=>!t.winnerId));
 assert.ok(s.ucl.knockoutBracket.stages[1].ties.every(t=>!t.winnerId));
 for(let i=0;i<15;i++)s=advanceCupWorld(s,"2027-02-23");
 assert.ok(s.ucl.knockoutBracket.stages[0].ties.every(t=>t.winnerId));
 assert.ok(s.ucl.knockoutBracket.stages[1].ties.every(t=>!t.winnerId));
 const myTies=s.seasonSchedule.filter(e=>e.round==="Round of 16"&&isMyFixture(s,e));
 assert.equal(myTies.length,2);assert.equal(myTies[0].awayId,"liv");assert.equal(myTies[1].homeId,"liv");
});

test("legacy saves preserve cup scores and migration is idempotent",()=>{
 let s=game();s={...s,scheduleVersion:null,scheduleMigrationDone:false};
 s.cupStatus={...s.cupStatus,carabao:{...s.cupStatus.carabao,alive:true,results:[{round:"Round 2",opponentId:"hul",myGoals:1,oppGoals:0,homeA:false,won:true}],playedRounds:["Round 2"],faced:["hul"]}};
 const restored=migrateSeason(s),again=migrateSeason(restored);
 assert.equal(restored.cupStatus.carabao.results.length,1);
 assert.equal(restored.seasonSchedule.filter(e=>e.competition==="CARABAO"&&isMyFixture(restored,e)&&e.status==="completed").length,1);
 assert.deepEqual(again.seasonSchedule,restored.seasonSchedule);
});

test("instant half-seasons follow the calendar, including Europe for non-qualified managers",()=>{
 let s=game("PL","afc");
 s=simulateScheduledHalf(s,1);assert.equal(s.stage,"half-results");assert.equal(s.results1.length,19);
 assert.ok(s.ucl.tableRaw&&Object.values(s.ucl.tableRaw).some(r=>r.played>0));
 s=simulateScheduledHalf(s,2);assert.equal(s.stage,"full-results");assert.equal(s.results2.length,19);
 assert.ok(s.ucl.knockoutBracket.stages.at(-1).ties[0].winnerId);
 assert.equal(s.ucl.campaignResults.length,0);
});
