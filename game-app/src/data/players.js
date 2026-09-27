import { ROLE_GROUP } from "../game/config.js";
import { PROMOTED_2627 } from "./season2627Promotions.js";
import { RAW_PORTUGAL_CLUBS } from "./portugal2627.js";
import { RAW_PLCLUBS, RAW_CHAMPIONSHIPCLUBS } from "./england2627.js";
import { RAW_LALIGACLUBS, RAW_LALIGA2CLUBS } from "./spain2627.js";
import { RAW_SERIEACLUBS, RAW_SERIEBCLUBS } from "./italy2627.js";
import { RAW_BUNDESLIGACLUBS, RAW_BUNDES2CLUBS } from "./germany2627.js";
import { RAW_LIGUE1CLUBS, RAW_LIGUE2CLUBS } from "./france2627.js";


// Shared 2026/27 player normalisation. OVR and potential are distinct; source
// notes for each domestic roster live with that country's data module.
// These are genuine secondary roles, rather than a UI-only exception. The
// engine still permits any outfield assignment, but uses this information to
// make versatile players feel versatile when the manager changes shape.
const SECONDARY_ROLES={
  "dominik-szoboszlai":["CM","LW","RW"],
  "florian-richard-wirtz":["CM","LW","RW"],
  "ryan-jiro-gravenberch":["CM","CDM"],
  "cody-mathes-gakpo":["ST","LW","CAM"],
};
const P=(slug,name,role,age,ovr,potential,value)=>({slug,name,role,secondaryRoles:SECONDARY_ROLES[slug]||[],group:ROLE_GROUP[role],age,ovr,potential,value:Number.isFinite(value)?value:Math.max(.2,Number((ovr-52)*.08).toFixed(1)),stamina:Math.max(66,Math.min(94,(role==="GK"?72:["LB","RB","LM","RM","LW","RW"].includes(role)?84:role==="CB"?77:81)-Math.max(0,age-29)*2+(ovr>=86?3:0)))});



const NUMBER_BY_ROLE={GK:[1,13,25],RB:[2,22],LB:[3,23],CB:[4,5,6,15],CDM:[6,16],CM:[8,14,18],CAM:[10,20],RM:[7,19],RW:[7,19],LM:[11,17],LW:[11,17],ST:[9,10,14]};
function stablePlayerId(clubId,slug){return clubId+":"+slug;}
function squadNumbers(players){const used=new Set();return players.map(player=>{const preferred=NUMBER_BY_ROLE[player.role]||[];const number=preferred.find(value=>!used.has(value))||Array.from({length:99},(_,index)=>index+1).find(value=>!used.has(value));used.add(number);return number;});}
function hydrate(raw){const leagueAvg=Math.round(raw.flatMap(club=>club.players).reduce((total,player)=>total+player[4],0)/raw.flatMap(club=>club.players).length);return raw.map(club=>{const players=club.players.map(args=>P(...args)),numbers=squadNumbers(players);return {...club,leagueAvg,players:players.map((player,index)=>({...player,id:stablePlayerId(club.id,player.slug),club:club.id,number:numbers[index],loan:false,condition:100,energy:100,appearances:0}))};});}
const replaceTop=(clubs,outgoing,incoming)=>[...clubs.filter(club=>!outgoing.includes(club.id)),...incoming];
const pick=(clubs,names)=>clubs.filter(club=>names.includes(club.name));

// First-season membership is the real 2026/27 line-up. Former top-flight
// clubs stay in their existing second-division pools where those squads exist.
export function buildClubs(){return hydrate(RAW_PLCLUBS);} export function buildChampionshipClubs(){return hydrate(RAW_CHAMPIONSHIPCLUBS);}
export function buildLaLigaClubs(){return hydrate(replaceTop(RAW_LALIGACLUBS,["gir","mal","rov"],PROMOTED_2627.LALIGA));}
export function buildSerieAClubs(){return hydrate(replaceTop(RAW_SERIEACLUBS,["cre","hel","pis"],PROMOTED_2627.SERIEA));}
export function buildBundesligaClubs(){return hydrate(replaceTop(RAW_BUNDESLIGACLUBS,["1fc","fcs","vfl"],[...PROMOTED_2627.BUNDES,...pick(RAW_BUNDES2CLUBS,["FC Schalke 04","SC Paderborn 07"])]));}
export function buildLigue1Clubs(){return hydrate(replaceTop(RAW_LIGUE1CLUBS,["fcm","fcn"],PROMOTED_2627.LIGUE1));}
export function buildLaLiga2Clubs(){return hydrate(RAW_LALIGA2CLUBS);} export function buildSerieBClubs(){return hydrate(RAW_SERIEBCLUBS);}
export function buildBundes2Clubs(){return hydrate([...RAW_BUNDES2CLUBS.filter(club=>!["SV Elversberg","FC Schalke 04","SC Paderborn 07"].includes(club.name)),...pick(RAW_BUNDESLIGACLUBS,["1. FC Heidenheim 1846","FC St. Pauli","VfL Wolfsburg"])]);}
export function buildLigue2Clubs(){return hydrate(RAW_LIGUE2CLUBS);}
export function buildPortugalClubs(){return hydrate(RAW_PORTUGAL_CLUBS);}
