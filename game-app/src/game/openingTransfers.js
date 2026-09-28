// Confirmed permanent moves missing from the shipped squads. Source rosters
// stay untouched: the opening calendar creates approaches and then deals.
// Fees use the game's valuations, NOT undisclosed/reported real-world prices.
// Audited against official announcements through the 1 September 2026 deadline.
export const OPENING_DEADLINE = '2026-09-01';
export const OPENING_TRANSFERS = [
  {slug:'savio-moreira-de-oliveira',sellerId:'man',buyerId:'tot',date:'2026-08-25',source:'https://www.tottenhamhotspur.com/news/1086712/savio-joins-from-manchester-city'},
  {slug:'carlos-noom-quomah-baleba',sellerId:'bri',buyerId:'mun',date:'2026-08-25',source:'https://www.manutd.com/en/news/carlos-baleba-joins-united'},
  {slug:'ayyoub-bouaddi',sellerId:'lil',buyerId:'man',date:'2026-08-26',source:'https://www.mancity.com/news/mens/ayyoub-bouaddi-completes-move-to-manchester-city-63923333'},
  {slug:'liam-rory-delap',sellerId:'che',buyerId:'not',date:'2026-08-27',source:'https://www.chelseafc.com/en/news/article/liam-delap-departs-for-nottingham-forest'},
  {slug:'nicolas-jackson',sellerId:'che',buyerId:'ast',date:'2026-08-28',source:'https://www.chelseafc.com/en/news/article/nicolas-jackson-departs-chelsea-on-permanent-transfer'},
  {slug:'damian-emiliano-martinez-romero',sellerId:'ast',buyerId:'che',date:'2026-08-30',source:'https://www.chelseafc.com/en/news/article/emiliano-martinez-signs-for-chelsea'},
  {slug:'enzo-jeremias-fernandez',sellerId:'che',buyerId:'man',date:'2026-09-01',source:'https://www.chelseafc.com/en/news/article/enzo-fernandez-leaves--chelsea-on-permanent-transfer'},
  {slug:'abdul-nasir-oluwatosin-oluwadoyinsolami-adarabioyo',sellerId:'che',buyerId:'tot',date:'2026-09-01',source:'https://www.tottenhamhotspur.com/news/1088054/welcome-tosin-adarabioyo-joins-from-chelsea'},
].map(deal=>({...deal,id:`opening-2026:${deal.slug}`}));
export function openingDeal(s, id, sellerId, buyerId, player) {
  return s.season===1 && OPENING_TRANSFERS.find(d=>d.id===id&&d.sellerId===sellerId&&d.buyerId===buyerId&&d.slug===player?.slug);
}
// AI clubs have four reserve/academy places beyond the user squad limit.
// This never drops another player or relaxes user buying.
export function transferSquadLimit(s, id, sellerId, buyerId, player) {
  // AI clubs may keep four reserve/academy places while rebuilding. Never
  // silently delete a surplus player merely to make an incoming signing fit.
  if(openingDeal(s,id,sellerId,buyerId,player)&&buyerId!==s.myClubId)return 34;
  return buyerId!==s.myClubId?34:30;
}
