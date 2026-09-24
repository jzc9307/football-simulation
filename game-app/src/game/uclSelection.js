import { ROLE_GROUP } from "./config.js";

const LEAGUE_KEYS={PL:"plClubs",LALIGA:"laligaClubs",SERIEA:"serieaClubs",BUNDES:"bundesligaClubs",LIGUE1:"ligue1Clubs"};
// Fixed first-season qualifiers. Subsequent seasons use the five domestic top fours;
// the remaining places come from this persistent European guest-club world.
const FIRST_SEASON_IDS=["ars","man","mun","liv","ast","fcb","rma","vil","atl","int","nap","rom","com","fcb2","bor","rbl","vfb","par2","rcl","lil"];
const GUESTS=[
  ["ben","SL Benfica","Portugal",82,"#e31937"],["spo","Sporting CP","Portugal",80,"#198f59"],["por","FC Porto","Portugal",80,"#1f63b5"],["psv","PSV Eindhoven","Netherlands",79,"#df2537"],
  ["fey","Feyenoord","Netherlands",78,"#e62e36"],["bru","Club Brugge","Belgium",77,"#173d92"],["cel","Celtic","Scotland",76,"#198659"],["ran","Rangers","Scotland",75,"#2570bc"],
  ["sha","Shakhtar Donetsk","Ukraine",77,"#e46b20"],["sal","RB Salzburg","Austria",77,"#d21f3c"],["gal","Galatasaray","Türkiye",78,"#f2a900"],["sla","Slavia Praha","Czechia",75,"#d51b2d"],
  ["oly","Olympiacos","Greece",76,"#d8202d"],["din","GNK Dinamo Zagreb","Croatia",74,"#2461aa"],["ybo","BSC Young Boys","Switzerland",74,"#e8bf1c"],["bod","Bodø/Glimt","Norway",73,"#e8c022"],
  ["ajae","AFC Ajax","Netherlands",78,"#d82332"],["fcs","FC København","Denmark",73,"#204b91"],["lud","Ludogorets","Bulgaria",72,"#1d9c57"],["qar","Qarabağ FK","Azerbaijan",71,"#244c92"],
];
const FIRST=["Milan","Luka","Mateo","Noah","Leon","Rayan","Victor","Tiago","Ilias","Nico","Marco","Yusuf","Andrej","Sami","João","Mika","Dario","Elias","Hugo","Kacper","Sander","Alex"];
const LAST=["Silva","Jansen","Kovač","Mendes","Rossi","Berg","Diallo","Novák","Aydin","Santos","Meyer","Costa","Vuković","Larsen","Khan","Pereira","Svensson","Popescu","Kaya","Martins","Keller","Ibrahim"];
const ROLES=["GK","GK","RB","LB","CB","CB","CB","RB","LB","CDM","CDM","CM","CM","CAM","LM","RM","LW","RW","ST","ST","ST","CM"];
function seeded(input){let h=2166136261;for(const ch of input){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0)/4294967295;}
function guestPlayers(id,base){return ROLES.map((role,index)=>{const roll=seeded(`${id}:${index}`),ovr=Math.max(61,Math.round(base+(roll-.54)*10-(index>17?0:2)));return {id:`eu-${id}-${index}`,slug:`${id}-${index}`,name:`${FIRST[index]} ${LAST[Math.floor(seeded(`${id}:n:${index}`)*LAST.length)]}`,role,group:ROLE_GROUP[role],age:18+Math.floor(roll*15),ovr,potential:Math.max(ovr,Math.min(91,ovr+Math.floor(seeded(`${id}:p:${index}`)*8))),value:Math.max(1,Math.round((ovr-57)*(ovr-57)*.09)),stamina:70+Math.floor(seeded(`${id}:s:${index}`)*20),club:`eu-${id}`,number:index+1,condition:100,energy:100,confidence:0,appearances:0};});}
export function buildEuropeanGuestClubs(){return GUESTS.map(([id,name,country,base,color])=>({id:`eu-${id}`,name,shortName:name.replace(/^FC |^SL |^AFC |^GNK |^BSC /,""),country,color,budget:Math.round((base-65)*4+28),preferredFormation:"4-3-3",leagueAvg:base,guest:true,players:guestPlayers(id,base)}));}
function strength(club){const best=[...club.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11);return best.reduce((sum,player)=>sum+player.ovr,0)/Math.max(1,best.length);}
function stableShuffle(items,seed){return [...items].sort((a,b)=>seeded(`${seed}:${a.id}`)-seeded(`${seed}:${b.id}`));}
function clubMap(state){return new Map(Object.values(LEAGUE_KEYS).flatMap(key=>state[key]||[]).map(club=>[club.id,club]));}
export function uclQualified(state){return selectUclField(state).some(club=>club.id===state.myClubId);}
export function selectUclField(state){
  const domestic=clubMap(state),guests=state.europeanGuestClubs||buildEuropeanGuestClubs();
  if((state.season||1)===1)return [...FIRST_SEASON_IDS.map(id=>domestic.get(id)).filter(Boolean),...guests.slice(0,16)];
  const qualifiers=Object.entries(LEAGUE_KEYS).flatMap(([league,key])=>{const clubs=state[key]||[];const ranks=league===state.league&&state.tableFinal?.length?new Map(state.tableFinal.map((row,index)=>[row.id,index])):null;return [...clubs].sort((a,b)=>ranks?(ranks.get(a.id)??999)-(ranks.get(b.id)??999):strength(b)-strength(a)).slice(0,4);});
  return [...qualifiers,...stableShuffle(guests,`ucl-${state.season}`).slice(0,16)];
}
export function createUclCampaign(state,roundRobin,initTable){const clubs=selectUclField(state),ids=clubs.map(club=>club.id),rounds=roundRobin(ids).slice(0,8);return {stage:"hub",clubs,rounds,roundIndex:0,tableRaw:initTable(ids),form:{},lastMatch:null,campaignResults:[],campaignRecord:{w:0,d:0,l:0,gf:0,ga:0},phaseTable:null,qualification:null,knockoutRounds:[],knockoutRoundIndex:0,knockoutFaced:[],currentKnockoutOpponentId:null,leg:1,aggregate:{mine:0,opp:0},firstLegHomeA:undefined,outcome:null};}
// Repair old saves where the campaign has no persistent European guest-club field.
export function repairUclField(state){const u=state.ucl;if(!u||u.phaseTable||u.knockoutBracket||!Array.isArray(u.clubs)||!Array.isArray(u.rounds))return state;const wanted=selectUclField(state);if(u.clubs.length===36&&u.clubs.some(club=>club.guest))return state;const protectedIds=new Set([state.myClubId,u.lastMatch?.opponentId,...(u.campaignResults||[]).map(result=>result.opponentId)]);const keep=u.clubs.filter(club=>protectedIds.has(club.id));const ids=new Set(keep.map(club=>club.id));const clubs=[...keep,...wanted.filter(club=>!ids.has(club.id)).slice(0,36-keep.length)];return clubs.length===36?{...state,ucl:{...u,clubs,clubIds:clubs.map(club=>club.id)}}:state;}
