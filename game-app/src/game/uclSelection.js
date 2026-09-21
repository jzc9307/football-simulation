// A balanced 36-club field with at least four representatives from every playable league.
// The managed league uses its completed table; other leagues use squad strength until they
// have their own simulated standings.
const LEAGUE_KEYS={PL:'plClubs',LALIGA:'laligaClubs',SERIEA:'serieaClubs',BUNDES:'bundesligaClubs',LIGUE1:'ligue1Clubs'};
function strength(club){
  const best=[...club.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11);
  return best.reduce((sum,player)=>sum+player.ovr,0)/Math.max(1,best.length);
}
export function selectUclField(state){
  const leagues=Object.entries(LEAGUE_KEYS).map(([league,key])=>{
    const clubs=league===state.league?state.clubs:state[key];
    const rank=new Map((league===state.league?state.tableFinal||[]:[]).map((row,index)=>[row.id,index]));
    const ordered=[...clubs].sort((a,b)=>rank.size?(rank.get(a.id)??999)-(rank.get(b.id)??999):strength(b)-strength(a));
    if(league===state.league){
      const me=ordered.findIndex(club=>club.id===state.myClubId);
      if(me>=4){const [managed]=ordered.splice(me,1);ordered.splice(3,0,managed);}
    }
    return {league,ordered};
  });
  const selected=[],counts=new Map();
  const add=(league,club)=>{if(club&&!selected.some(item=>item.id===club.id)){selected.push(club);counts.set(league,(counts.get(league)||0)+1);}};
  for(const {league,ordered} of leagues)ordered.slice(0,4).forEach(club=>add(league,club));
  const extras=leagues.flatMap(({league,ordered})=>ordered.slice(4).map(club=>({league,club,score:strength(club)}))).sort((a,b)=>b.score-a.score);
  for(const {league,club} of extras){if(selected.length===36)break;if((counts.get(league)||0)<8)add(league,club);}
  return selected;
}

// Repair league-phase draws created before the managed league received its places.
// Keep the user's opponents and recorded matches intact while replacing unused slots.
export function repairUclField(state){
  const u=state.ucl;
  if(!u||u.phaseTable||u.knockoutBracket||!Array.isArray(u.clubs)||!Array.isArray(u.rounds))return state;
  const domesticIds=new Set(state.clubs.map(club=>club.id));
  const present=u.clubs.filter(club=>domesticIds.has(club.id));
  if(present.length>=4)return state;
  const presentIds=new Set(u.clubs.map(club=>club.id));
  const ordered=state.tableFinal?.length?state.tableFinal.map(row=>state.clubs.find(club=>club.id===row.id)).filter(Boolean):[...state.clubs].sort((a,b)=>strength(b)-strength(a));
  const arrivals=ordered.filter(club=>!presentIds.has(club.id)).slice(0,4-present.length);
  const protectedIds=new Set([state.myClubId,u.lastMatch?.opponentId,...(u.campaignResults||[]).map(result=>result.opponentId)]);
  const departures=u.clubs.filter(club=>!domesticIds.has(club.id)&&!protectedIds.has(club.id)).sort((a,b)=>strength(a)-strength(b)).slice(0,arrivals.length);
  if(departures.length!==arrivals.length)return state;
  const swaps=new Map(departures.map((club,index)=>[club.id,arrivals[index]]));
  const remap=id=>swaps.get(id)?.id||id;
  const remapRecord=record=>Object.fromEntries(Object.entries(record||{}).map(([id,value])=>[remap(id),value]));
  const clubs=u.clubs.map(club=>swaps.get(club.id)||club);
  return {...state,ucl:{...u,clubs,clubIds:clubs.map(club=>club.id),
    rounds:u.rounds.map(round=>round.map(pair=>pair.map(remap))),
    tableRaw:remapRecord(u.tableRaw),form:remapRecord(u.form)}};
}
