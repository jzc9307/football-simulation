import { mergedEuropeanGuestClubs, selectUclField } from "./uclSelection.js";
import { FIRST_SEASON_UEL_ROUNDS } from "./firstSeasonFixtures.js";

const LEAGUE_KEYS={PL:"plClubs",LALIGA:"laligaClubs",SERIEA:"serieaClubs",BUNDES:"bundesligaClubs",LIGUE1:"ligue1Clubs"};
function strength(club){return [...club.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11).reduce((total,p)=>total+p.ovr,0)/11;}
function ordered(state,league,key){
  const clubs=state[key]||[];
  const table=state.qualificationTables?.[league]||(league===state.league&&state.tableFinal);
  const rows=table?.length?new Map(table.map((row,index)=>[row.id,index])):null;
  return [...clubs].sort((a,b)=>rows?(rows.get(a.id)??999)-(rows.get(b.id)??999):strength(b)-strength(a));
}
function stable(items,seed){let n=0;for(const c of seed)n=(n*31+c.charCodeAt(0))>>>0;return [...items].sort((a,b)=>{const x=id=>{let v=n;for(const c of id)v=(v*33+c.charCodeAt(0))>>>0;return v;};return x(a.id)-x(b.id);});}
const FIRST_SEASON_DOMESTIC_IDS=["afc","cry","sun","oly","oly2","sta2","bay","tsg","acm","juv","rcc","rso"];
const FIRST_SEASON_GUEST_IDS=["ararat","sal","sturm","ander","usg","levski","din","omonoia","sparta","plzen","ofi","oly","ferenc","hapoel","az","nec","lillestrom","jagiell","lech","ben","torreense","cel","celje","besiktas"];
function domesticMap(state){return new Map(Object.values(LEAGUE_KEYS).flatMap(key=>(state[key]||[]).map(club=>[club.id,club])));}

// Europa is intentionally assembled after Champions League. That ordering is
// the conflict rule: a guest or domestic club can only be present once.
export function selectEuropaField(state){
  const uclIds=new Set(selectUclField(state).map(club=>club.id));
  const guests=mergedEuropeanGuestClubs(state);
  if((state.season||1)===1){
    const domestic=domesticMap(state),guestById=new Map(guests.map(club=>[club.id.replace(/^eu-/,""),club]));
    return [...FIRST_SEASON_DOMESTIC_IDS.map(id=>domestic.get(id)).filter(Boolean),...FIRST_SEASON_GUEST_IDS.map(id=>guestById.get(id)).filter(Boolean)].filter(club=>!uclIds.has(club.id));
  }
  // Fifth/sixth are the primary qualification places; seventh/eighth only
  // backfill a slot when a higher club is already in Champions League.
  const domestic=Object.entries(LEAGUE_KEYS).flatMap(([league,key])=>ordered(state,league,key).slice(4,6)).filter(club=>!uclIds.has(club.id));
  const guestPool=stable(guests.filter(club=>!uclIds.has(club.id)),`uel-${state.season}`);
  return [...domestic,...guestPool].slice(0,36);
}
export function europaQualified(state){return selectEuropaField(state).some(club=>club.id===state.myClubId);}
export function createEuropaCampaign(state,roundRobin,initTable){
  const clubs=selectEuropaField(state),ids=clubs.map(club=>club.id),rounds=state.season===1?FIRST_SEASON_UEL_ROUNDS:roundRobin(ids).slice(0,8);
  return {stage:"hub",clubs,rounds,roundIndex:0,tableRaw:initTable(ids),form:{},campaignResults:[],campaignRecord:{w:0,d:0,l:0,gf:0,ga:0},phaseTable:null,qualification:null,outcome:null};
}
