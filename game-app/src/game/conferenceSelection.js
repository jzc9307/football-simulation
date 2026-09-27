import { mergedEuropeanGuestClubs, selectUclField } from "./uclSelection.js";
import { selectEuropaField } from "./europaSelection.js";

const LEAGUE_KEYS={PL:"plClubs",LALIGA:"laligaClubs",SERIEA:"serieaClubs",BUNDES:"bundesligaClubs",LIGUE1:"ligue1Clubs",PORTUGAL:"portugalClubs"};
const FIRST_SEASON_DOMESTIC_IDS=["bri","asm","scf","ata","get","pt-braga"];
const FIRST_SEASON_GUEST_IDS=["egnatia","inter-esc","gent","stvv","borac","cska","hajduk","pafos","jablonec","agf","fcs","midtjylland","nordsjaelland","kups","iberia","lincoln","pana","kairat","riga","kauno","ajae","twente","brann","craiova","hearts","zvezda","mjallby","lugano","thun","trabzon"];

function strength(club){return [...club.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11).reduce((total,p)=>total+p.ovr,0)/11;}
function ordered(state,league,key){
  const clubs=state[key]||[],table=state.qualificationTables?.[league]||(league===state.league&&state.tableFinal);
  const ranks=table?.length?new Map(table.map((row,index)=>[row.id,index])):null;
  return [...clubs].sort((a,b)=>ranks?(ranks.get(a.id)??999)-(ranks.get(b.id)??999):strength(b)-strength(a));
}
function stable(items,seed){let n=0;for(const c of seed)n=(n*31+c.charCodeAt(0))>>>0;return [...items].sort((a,b)=>{const value=id=>{let v=n;for(const c of id)v=(v*33+c.charCodeAt(0))>>>0;return v;};return value(a.id)-value(b.id);});}
function domesticMap(state){return new Map(Object.values(LEAGUE_KEYS).flatMap(key=>(state[key]||[]).map(club=>[club.id,club])));}

// Conference is selected last. That makes its conflict rule explicit: a club
// selected for Champions League or Europa League cannot enter this field.
export function selectConferenceField(state){
  const blocked=new Set([...selectUclField(state),...selectEuropaField(state)].map(club=>club.id));
  const guests=mergedEuropeanGuestClubs(state),domestic=domesticMap(state);
  if((state.season||1)===1){
    const guestById=new Map(guests.map(club=>[club.id.replace(/^eu-/,""),club]));
    return [...FIRST_SEASON_DOMESTIC_IDS.map(id=>domestic.get(id)),...FIRST_SEASON_GUEST_IDS.map(id=>guestById.get(id))].filter(Boolean).filter(club=>!blocked.has(club.id));
  }
  const domesticPlaces=Object.entries(LEAGUE_KEYS).flatMap(([league,key])=>{
    const rows=ordered(state,league,key);
    const rank=league==="PL"?6:league==="PORTUGAL"?3:6;
    return rows.slice(rank,rank+1);
  }).filter(club=>!blocked.has(club.id));
  const conferenceWinner=state.uecl?.championId?[...domestic.values(),...guests].find(club=>club.id===state.uecl.championId):null;
  const unique=[...new Map([...domesticPlaces,conferenceWinner].filter(Boolean).map(club=>[club.id,club])).values()];
  const guestPool=stable(guests.filter(club=>!blocked.has(club.id)&&!unique.some(team=>team.id===club.id)),`uecl-${state.season}`);
  return [...unique,...guestPool].slice(0,36);
}
export function conferenceQualified(state){return selectConferenceField(state).some(club=>club.id===state.myClubId);}
export function createConferenceCampaign(state,roundRobin,initTable){
  const clubs=selectConferenceField(state),ids=clubs.map(club=>club.id);
  return {stage:"hub",clubs,rounds:roundRobin(ids).slice(0,8),roundIndex:0,tableRaw:initTable(ids),form:{},lastMatch:null,campaignResults:[],campaignRecord:{w:0,d:0,l:0,gf:0,ga:0},phaseTable:null,qualification:null,outcome:null};
}
