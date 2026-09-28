export function orderCompetitions(items) {
  const group=item=>!item.outcome?0:/^CHAMPION/i.test(item.outcome)?1:2;
  return [...items].sort((a,b)=>group(a)-group(b)||(a.date||'9999').localeCompare(b.date||'9999')||a.index-b.index);
}
