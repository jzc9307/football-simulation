export const BENCH_COVERAGE = [["GK"],["CB"],["LB","RB"],["CDM","CM"],["CAM"],["LM","LW"],["RM","RW"],["ST"]];
const order = { GK:0, DEF:1, MID:2, FWD:3 };
const rating = p => p.ovr + (p.confidence || 0);
const rank = (a,b) => rating(b)-rating(a) || (b.energy??100)-(a.energy??100) || a.id.localeCompare(b.id);
const sort = players => [...players].sort((a,b)=>order[a.group]-order[b.group] || rank(a,b));
export function squadGroups(players,lineup,unavailable=new Set(),selection=null) {
  const startingIds=new Set(Object.values(lineup).filter(Boolean));
  const candidates=players.filter(p=>!startingIds.has(p.id)&&!unavailable.has(p.id));
  // Defaults cover positions first. Once edited, the manager's bench is explicit;
  // an Available player must not silently be promoted again by the auto-picker.
  const bench=Array.isArray(selection)?[...new Set(selection)].filter(id=>candidates.some(p=>p.id===id)).slice(0,9):[];
  if (!Array.isArray(selection)) {
    const take=roles=>{
      const p=candidates.filter(p=>!bench.includes(p.id)&&(!roles||[p.role,...(p.secondaryRoles||[])].some(role=>roles.includes(role)))).sort(rank)[0];
      if(p)bench.push(p.id);
      return !!p;
    };
    BENCH_COVERAGE.forEach(take);
    while(bench.length<9&&take(null)) { /* Fill remaining seats by OVR. */ }
  }
  const benchIds=new Set(bench);
  return {startingIds,benchIds,starting:sort(players.filter(p=>startingIds.has(p.id))),bench:sort(players.filter(p=>benchIds.has(p.id))),available:sort(players.filter(p=>!startingIds.has(p.id)&&!benchIds.has(p.id)))};
}
export function moveToSquadGroup(state,playerId,target) {
  const club=state.clubs.find(c=>c.id===state.myClubId);
  if(!club?.players.some(p=>p.id===playerId))return state;
  const unavailable=new Set([...(state.suspensions?.[state.stage==="ucl"?"ucl":"domestic"]||[]),...Object.keys(state.injuries||{})]);
  if(target==="bench"&&unavailable.has(playerId))return state;
  const groups=squadGroups(club.players,state.lineup,unavailable,state.benchSelection);
  const lineup={...state.lineup};
  Object.keys(lineup).forEach(key=>{if(lineup[key]===playerId)delete lineup[key];});
  let benchSelection=[...groups.benchIds].filter(id=>id!==playerId);
  if(target==="bench") {
    if(benchSelection.length===9) {
      const player=club.players.find(p=>p.id===playerId);
      const weakest=[...groups.bench].filter(p=>p.group===player.group).sort(rank).at(-1)||[...groups.bench].sort(rank).at(-1);
      benchSelection=benchSelection.filter(id=>id!==weakest.id);
    }
    benchSelection.push(playerId);
  }
  return {...state,lineup,benchSelection};
}
