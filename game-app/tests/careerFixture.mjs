import { playerConcernMessages } from '../src/game/playerLife.js';
import { ensureClubFinance } from '../src/game/finance.js';

// Transfer-focused fixtures begin after the initial renewal inbox has been
// delivered. Dedicated lifecycle tests exercise that first attention stop.
export function acknowledgedCareer(s){
  return ensureClubFinance({...playerConcernMessages(s,s.currentDate).state,lifeAttentionPending:false});
}
