// A directory entry, not a club: it must never enter fixtures or league pools.
export const FREE_AGENT_CLUB_ID = 'free-agents';
export function freeAgentClub(state) {
  return {id:FREE_AGENT_CLUB_ID,name:'Free Agents',color:'#78b99a',league:'FREE',players:state.freeAgents||[]};
}
export function marketPlayer(state,talk) {
  if(talk.kind==='free-agent')return state.freeAgents?.find(p=>p.id===talk.playerId);
  const clubs=[...(state.clubs||[]),...Object.keys(state).filter(k=>k.endsWith('Clubs')).flatMap(k=>state[k]||[])];
  return clubs.find(c=>c.id===talk.sellerId)?.players.find(p=>p.id===talk.playerId);
}
