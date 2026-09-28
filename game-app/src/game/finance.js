// Fees are stored in millions, at £100k precision. Never carry binary floating
// point artefacts through a season of buys, sales and recall compensation.
export const money = value => Math.round((Number(value) || 0) * 10) / 10;
export function formatMoney(value) {
  return `£${money(value).toLocaleString('en-GB', { maximumFractionDigits: 1 })}m`;
}
export function reservedBudget(state, clubId = state.myClubId, exceptId = null) {
  return money((state.market?.talks || []).filter(t => t.status === 'pending' && t.buyerId === clubId && t.id !== exceptId).reduce((sum, t) => sum + t.fee, 0));
}
export function availableBudget(state, clubId = state.myClubId, exceptId = null) {
  const club = [...(state.clubs || []), ...Object.keys(state).filter(k => k.endsWith('Clubs')).flatMap(k => state[k] || [])].find(c => c.id === clubId);
  const total = clubId === state.myClubId ? state.budget : club?.budget || 0;
  return money(Math.max(0, total - reservedBudget(state, clubId, exceptId)));
}
