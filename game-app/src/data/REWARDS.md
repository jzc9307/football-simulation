# Career competition rewards

Implementation audited 30 September 2026 against [`rewards.js`](../game/rewards.js). See the [gameplay guide](../../docs/GAMEPLAY.md#budget-rewards-and-board-objectives) and [calculation reference](../../docs/CALCULATIONS.md#board-targets-confidence-and-funding) for budget/board integration.

These are deliberately modest **game-balanced board allocations**, not a verified EA FC27 payout table or full real-world TV/prize income. No exact FC27 amounts are claimed. The source of truth for these amounts is this project's `PROGRESSION_PRIZES`, not an external prize table.

All values below are £millions. Payments are cumulative: each milestone is paid once, on actual qualification. A first leg, defeat or bye is not a progression payment. Rewards are saved with unique season/competition/milestone IDs, appear in the budget ledger and generate a gold reward email.

| Milestone reached | Champions League | Europa League | Conference League |
| --- | ---: | ---: | ---: |
| Knockout playoffs | 0.5 | 0.25 | 0.1 |
| Round of 16 | 0.8 | 0.4 | 0.2 |
| Quarter-final | 1.5 | 0.6 | 0.3 |
| Semi-final | 2 | 1 | 0.5 |
| Final | 3 | 1.5 | 0.8 |
| Champions | 5 | 2.5 | 1.2 |

Top-eight league-phase teams receive the R16 allocation directly. Playoff qualifiers receive the playoff allocation and earn R16 funding only by winning their aggregate tie. Europa/Conference use the same date-driven knockout machinery with separate Thursday windows, draw IDs and aggregate scores.

FA Cup: Fourth Round £120k, Fifth Round £150k, quarter-final £230k, semi-final £450k, final £1m, champions £2m.

Carabao Cup: R32 £25k, R16 £40k, quarter-final £75k, semi-final £150k, final £250k, champions £500k.

Other supported domestic cups: R32 £40k, R16 £60k, quarter-final £120k, semi-final £250k, final £500k, champions £1m.

Premier League merit funding is £1m × (21 − final position): £20m for first, £1m for twentieth. This is credited **on next-season creation**, separately from the normal £10m board allocation (£6m if relegated). It is not credited again on each match or final-results visit.

Other leagues/tiers retain their game funding formula: `(top tier ? £10m : £6m) + £2m × (new active league size − previous final rank + 1)`. Existing transfer cash carries forward. Competition prizes are recorded as transfer-pool funding and can subsequently fund wage reserves. They are not payroll payments and are not counted again as transfer spending.
