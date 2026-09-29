# Gameplay calculation reference

Audited against the code on **29 September 2026**. Amounts are GBP; transfer values/budgets use **£millions**, wages/reserves/ledger amounts use **whole pounds**. Constants here are this project's rules, not official EA or real-world financial/contract models. Links identify the owning code so future changes can update this document and the relevant regression test together.

## Shared definitions and money

[career.js](../src/game/career.js), [finance.js](../src/game/finance.js), [engine.js](../src/game/engine.js).

`money(x) = round(x × 10) / 10` normalizes transfer fees to £100k. `cash(x) = round(x × 1,000,000) / 1,000,000` preserves whole-pound budget movements. Formatting shows at most one decimal in £m; stored exact payroll funds are not rounded to the displayed number.

`stableFraction(key)` is an FNV-style deterministic hash in [0,1), used for repeatable market variation, shortlist ordering and seasonal decisions. Match events and club fee acceptance can use RNG; not every rule is a random roll.

Market club quality `q` is average OVR of its readiness/position-aware best XI in the preferred formation. Board/contract-role comparisons instead use the average of the eleven highest-rated squad players. These definitions are intentionally distinct; do not swap them casually.

Fallback potential uses supplied potential clamped between current OVR and 96. Otherwise inferred growth above OVR is +7 at age ≤18, +5 ≤20, +4 ≤22, +2 ≤24, +1 at 25, +0 thereafter, clamped to 96.

Reserved fees are the sum of all pending buyer talks' fees. `available = max(0, club budget − reserved fees)`; player-choice/completion checks exclude the specific talk's own reservation. The managed club's `state.budget` is authoritative, synchronized with pool copies.

## Transfer fee valuation

`transferTerms` in [career.js](../src/game/career.js).

Let `v` be market value, `s` the stable fraction of seller/player IDs. Add premiums to a base multiplier **1.02**:

| Factor | Premium |
| --- | --- |
| OVR ≥90 / ≥88 / ≥85 / ≥82 | +.20 / +.12 / +.07 / +.03 |
| Age ≤18 / ≤21 / ≤24 | +.16 / +.12 / +.07 |
| Age ≥32 / ≥30 | −.10 / −.05 |
| Potential ≥92 / ≥89 / ≥86 | +.10 / +.06 / +.03 |
| Squad OVR rank top 3 / top 6 | +.10 / +.05 |
| Otherwise OVR ≥ squad average +4 | +.03 |
| Seller top-five average ≥87 / ≥84 / ≥81 | +.06 / +.04 / +.02 |
| Players in the same broad role group ≤3 / ≤5 | +.04 / +.02 |
| Form | `clamp(confidence × .02, −.025, .04)` |
| Stable variation | `s × .04` |

Within each factor choose its first matching tier; do not add all tiers. Contract pressure `p` is .78 for ≤12 months left, .90 for ≤24 months, otherwise .90 if wants-move, otherwise 1. The contract cases take precedence over unhappiness.

```text
multiplier = (1.02 + premiums + s × .04) × p
asking = max(1, round(v × multiplier))
strictness = clamp((rating + age + potential + importance + club premiums) / .62, 0, 1)
minimum = max(v × p, round(asking × (.88 + strictness × .07 + s × .02)))
```

Asking price/minimum are £m. Selling must leave ≥16 players, ≥1 goalkeeper and a legal best XI. Clubs label unavailable players Not for sale, strict players Club cornerstone, young high-potential players Protected prospect, top-rank players Key player; otherwise Open to offers.

### Your club-to-club negotiation

`evaluateOffer`: normalize offer to £100k. Above available budget is invalid. At/above asking is accepted. If `r = offer/minimum ≥1`, acceptance probability is `min(.72, .12 + round × .12 + (r−1) × 1.2 − strictness × .1)`; below minimum it is zero.

If not accepted, round ≥3 or offer <72% of minimum ends talks. Otherwise concession starts at .98/.955/.94 for rounds 1/2/3, scaled toward no concession by `strictness × .65`; the counter cannot fall below minimum. Each club rejection reports the valuation/release/budget reason. Matching the asking price is not a random negotiation gamble.

`agreeTransferFee` rechecks availability, minimum fee, available cash and capacity. User capacity is **30 including pending incoming signings**; AI capacity is **34**. An active loan cannot become a permanent transfer. The fee is reserved without moving the player.

## AI recruitment, spending and selling

[market.js](../src/game/market.js), [career.js](../src/game/career.js).

### Spending capacity

`buyerCapacity = min(80% of club budget, quality cap)`, rounded to £100k. Quality cap:

| q | ≥84 | ≥81 | ≥78 | ≥75 | ≥72 | ≥68 | Lower |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Single-deal cap (£m) | 180 | 100 | 65 | 38 | 20 | 9 | 3 |

Candidate pricing also respects unreserved budget. AI club budgets decrease/increase on completed buys/sales. Next-season AI funding adds £25m for q≥81, £12m for q≥75, £4m otherwise. The model does not yet account for a full AI-club P&L or the user's exact wage-reserve ledger for every AI club.

### Positional needs and cadence

Recruitment uses the preferred formation's actual roles and required counts, with position fit ≥.9, not just DEF/MID/FWD.

| Need | Priority | Target OVR |
| --- | ---: | --- |
| Fewer usable players than required | 100 | Club q |
| Starter injury ≥4 matches | 95 | Club q |
| Starter <q−4 | `80 + q − starter` | `min(92, starter+3)` |
| Summer, q≥80, starter <min(90,q+2) | 82 | `min(92, starter+3)` |
| Summer, starter age≥31 or final contract year | 81 | `min(91, starter)` |
| Summer, no spare positional player | 55 | `starter−5` |
| Summer, space for a development prospect | 30 | `q−9` |

January ignores non-urgent needs unless long-term injury, missing starter, or relegation danger (bottom four of the simulated active league). Summer attempts recruitment on day-of-month `day % 3 == 1`, January on `day % 7 == 1`. Each tick considers up to 32 summer or 10 January clubs, with three summer/one winter signings or pending talks per club/window. The most urgent three genuine needs are tried before giving up on an unaffordable target.

Candidate filters: not the buyer/user seller, not injured/loaned/already approached/recently moved this window; fit ≥.9; OVR within target−3 to target+7. Development targets must be ≤22 with potential ≥q+2. Low-priority depth requests cannot sign another star above starter−2. Preliminary market value must be ≤1.25×capacity.

```text
scouting score = 20 − 2×abs(ovr−target)
                 + .7×(potential−ovr)
                 − 3×value/max(1,capacity)
                 + 4×stableFraction(buyer,player,date)
```

Only the best 24 candidates get expensive release/asking-price checks. AI asking adjustment after normal `transferTerms`: wants-move .92, else old (GK≥35/outfield≥32) .95, else poor form (<6.4 after ≥8 rated matches/current or previous season) .96, else surplus/non-best-XI 1, otherwise 1.18. These are opportunities, not unconditional sales of core players.

### Incoming offers for your squad

Normal sale buyers must afford at least the player's displayed value and reach a sporting-quality floor. For OVR ≥89/86/83/80/76/lower the floor is 84/81/78/74/69/63, with age relief −5 at ≥34, −3 at ≥31, never below 60. They need squad capacity and enough unreserved funds. Buyers are ranked by budget/quality; deterministic variation chooses among the best three.

For seed `s`, sale negotiation ceiling is `min(capacity, available, value × (1.15 + .15s))`; initial bid is `min(ceiling, value × (.94 + .10s))`. Values round to £100k. Because the buyer pool can fund market value, a normal initial low bid can be negotiated up to that level rather than being an impossible hard ceiling.

Counter asks ≤ceiling are accepted; round≥3 or ask>1.8×ceiling withdraws; otherwise counter moves halfway from current bid toward min(ask,ceiling), never decreases. Legacy impossible offers can be repaired/replaced for listed players. Displayed market value is not discounted again for age.

Unsolicited roll thresholds: wants-move .45, else young (≤25) OVR≥85 .20, else best-XI starter .08, otherwise .24. A non-starting ≤24 player below q−3 can attract a loan rather than sale. Buyer must have a genuine positional need. Unlisted starters require a 1.2×value offer with 1.3×value ceiling, both affordable. Listed/off-window request processing is separate; total received-offer activity is bounded to avoid inbox floods.

## Opening replay and windows

[openingTransfers.js](../src/game/openingTransfers.js), [transferWindows.js](../src/game/transferWindows.js).

The configured first-summer replay contains eight moves (Sávio, Baleba, Bouaddi, Delap, Jackson, Martínez, Enzo Fernández and Adarabioyo), with stored dates/source URLs. This document describes that configuration; it does not independently certify new transfer news. Fees are **in-game valuations**, not reported real-world fees.

Approach date is max(deal date−2 days, opening replay start date). Process each ID once; skip before joining the market, already-correct/unavailable/loaned players. Base fee `max(.2, value×.85)`, £100k-rounded. Managed sellers receive approval-required offers (limited by buyer cash); managed buyers get invitations with no reservation. Non-user sides can complete configured moves within their budgets. Starting data files are unchanged.

First summer closes **1 September 2026**, later summers **31 August**, January **31 January**. July/August/January are open; first deadline date is additionally included. A closed Deadline Day object overrides the otherwise open date. No unrestricted AI recruitment tick runs during the first summer; later summers/winters use the needs system.

## Player choice and transfer completion

`resolveDecisions`, `playerChoiceScore`, `decisionBlocker`, `negotiatePlayerContract` in [market.js](../src/game/market.js).

User fee agreements normally resolve after two days, AI after three, capped at the window deadline. Accepted outgoing fees create 1–3-day personal talks; all agreed bidders for a player share the resolution date. During Deadline Day these become due hours.

Before choice, validate player still at seller, no active loan, buyer exists, squad space, affordable reserved fee and seller release depth. Invalid deals name the specific blocker. No fees charge on an invalid/lost/cancelled talk.

Sporting score:

```text
.9 × buyer quality
+ playing time: +10 if at starter standard, +3 if at first-backup standard, otherwise −8
+ Europe: +5 Champions League, +3 Europa League, +1 Conference League
```

Overall choice adds `2×min(5, agent wage/max(1000,current wage or agent wage))` and `4×stableFraction(talk id + choice)`. Fees affect seller agreement, not directly the player's sporting score. Club strength/Europe is the reputation proxy; no separate real-world reputation dataset is used.

The highest-scoring **valid** bid wins. There is no random 1% refusal or arbitrary fail after a sole suitable accepted bid. A ≤25, OVR≥80, high-ambition player can reject a buyer more than five quality points below their current club unless wants-move. Non-user configured replay moves bypass that weaker-project test. An unlisted, content player being sold by the user can choose to stay if the new project is not at least three score points better.

User winner becomes `contract-ready`; fee remains reserved. Other bidders lose. User outgoing winner negotiates AI personal terms automatically; a closed-window deal becomes `agreed-future` until registration at the next opening. The seller retains the player until then. Final accepted user personal terms fund wages, charge the fee, move the player, start a new stats/involvement stint, update budgets/medical records, and record history/mail. Other reservations are released. Ready terms block date advancement until signed or withdrawn.

### Free agents and loans

Expired unrenewed contracts enter `freeAgents` and release funded wages; unsuitable old low-upside squad members can be left unrenewed. User approach skips fee negotiation, requires space, and rejects an ambitious ≤25 player rated ≥buyer q+7. Accepted 1–5-year personal terms move the player with zero fee; wage funding remains required. AI free-agent recruitment uses appropriate quality/depth/budget checks. See [playerLife.js](../src/game/playerLife.js) and [market.js](../src/game/market.js) for renewal/free-agent candidate rules.

Loan fee is `max(1, round(value × rate))`, with rate .15 at OVR≥82, .11 at ≥78, else .08. Loans are unavailable for elite OVR≥86, prized potential≥92/OVR≥82, core/top-six OVR≥80 or best-XI OVR≥78; some OVR≥82 also reject deterministically. Release-depth safeguards apply. Incoming limit is three; outgoing durations are 0.5–3 seasons in half-season steps, with January/June dated returns. Recall compensation is `min(2,max(.1,value×.05))` £m. Wages stay with the owner; no wage-sharing negotiation yet.

## Initial contracts, agent demands and role negotiation

[playerLife.js](../src/game/playerLife.js), [contract provenance](../src/data/CONTRACTS.md).

Known source records keep FC26 expiry year (30 June) and weekly GBP wage. They are not relabelled as today's real legal terms. Missing records receive `source: estimated`; generated youth receive three years/£1k week/prospect. Roles are simulated even for sourced wages:

```text
age≤21 and ovr<q−5 → prospect
else ovr≥q+2 → key
else ovr≥q−3 → starter
else → rotation
```

Estimated old = GK≥35 or outfield≥32; young = ≤23; good potential = potential−OVR≥5.

```text
financial factor = clamp(.65 + sqrt(max(0,club budget))/12, .7, 1.6)
wage = round_to_£500(max(1,ovr−48)^3 × 1.4 × financial factor × age factor)
age factor = .78 if old, else .75 if young without good potential, else 1
wage clamp = £500…£250,000/week
length = 1 year if old, otherwise 2 or 3 years from stable player-ID seed
```

Agent demand base is existing wage or a rating-based fallback. Demand wage is `round_to_£500(max(base×1.06, max(1,ovr−55)^2×100) × (1.12 if age≤24 else 1))`, clamped £1k…£2m/week. Desired duration: age≥33 one year, ≥29 two, ≤23 five, otherwise four. New end date is **30 June of current calendar year + offered years**, not an exact anniversary.

Negotiated offer must be finite £500…£2m/week, a valid squad role, and 1–5 whole years for new contracts. Role rank is prospect0/rotation1/starter2/key3. Acceptance needs ≥95% demand wage, role ≥requested rank and acceptable duration (usually requested±1; age≥32 permits shorter contracts). Round≥3 or wage<50% demand ends talks. Otherwise counter wage = nearest £500 of `max(offer, demand×.98)`; counters persist and update the UI's wage value.

Ordinary renewal requires ≤24 months remaining; newly signed contracts cannot reopen for 180 days. A young high-ambition player OVR≥q+7 or anyone wants-move can refuse renewal.

**Keep-expiry amendment:** owned, unloaned, unexpired player; `keepExpiry: true`, `years: 0`; role or wage must actually change. Accepted terms retain exact expiry and original signed date, set amended date, and trigger a 90-day amendment cooldown. This is not allowed for new signings. It does not satisfy a promised contract extension.

Role protection applies at OVR≥85, OVR≥q−2, or high ambition/OVR≥q−4. Unprotected lower-rated depth (OVR<q−4) or backup keeper may agree key/starter→rotation; otherwise existing minimum role remains. Offering more wages cannot bypass the required role. Accepted renewals add +10 happiness, role amendments +5 (capped95), preserve involvement history and recalculate concern gates under the agreed role.

## Wage reserves, payroll and ledger

[finance.js](../src/game/finance.js).

Remaining payroll weeks = whole seven-day intervals from the last payroll date/current career date through **30 June at season end**. At initial season setup, existing owned players get `boardWeekly = current wage` and `boardReserve = wage×weeks`. Loan wages remain with the owner. This is separate funding from the displayed transfer budget.

For a wage agreement:

```text
required transfer reserve = max(0, new weekly wage − boardWeekly) × remaining weeks
change = required reserve − existing player transfer reserve
new transfer budget = old budget − change/1,000,000
```

Incoming signing uses zero boardWeekly, so its entire remaining-season payroll is funded. Changes must fit unreserved cash **while the agreed transfer fee remains reserved**. Negative change returns unused funding. Allocation ledger entries are not counted again as actual payroll spending.

Every seven career days pay from board reserve then transfer reserve, through season end. Expired/departed players are not paid again; repeats of an already-consumed date do not double charge. On permanent departure unused transfer reserve returns to transfer funds; board-funded money does not become a windfall transfer refund. A new season creates a fresh board wage allocation for the contracted squad. There are no signing bonuses, staff/stadium costs or gate/TV revenues in this model yet.

## Playing-time and happiness

[playerLife.js](../src/game/playerLife.js), policy migration version **5**. Warning/request must meet **both matches and days**, not either one. A formal request additionally needs happiness≤35.

| Contract role | Warning: missed eligible matches + days | Request: missed matches + days | Frustration drain per match |
| --- | --- | --- | ---: |
| Key player | 3 + 21 | 10 + 56 | 6 |
| Regular starter | 10 + 42 | 24 + 112 | 3 |
| Rotation | 16 + 70 | 36 + 180 | 1.5 |
| Prospect | 18 + 180 | Never for playing time | .25 |

Backup GK = non-key goalkeeper, with another higher-rated keeper at the club (tied OVR resolved consistently by ID). Contracted role is **not changed automatically**.

| Reserve-GK contracted role | Warning | Request | Drain |
| --- | --- | --- | ---: |
| Regular starter | 14 matches + 84 days | 32 + 210 | 1.5 |
| Rotation | 24 + 120 | 52 + 270 | .6 |
| Prospect | 24 + 270 | Never for playing time | .1 |

Key keepers use the normal key table. Meaningful thresholds are **36 minutes key, 28 starter, 15 rotation/prospect**. They reset the missed streak/days; merely appearing does not always qualify. Initial missed match begins at day0; calendar gaps accrue between subsequent eligible selections. Injury/suspension/loan absence pauses the clock, including the return interval.

Recent involvement stores up to ten `{minutes, started, date}` entries; legacy eight-match minute logs remain usable but do not invent starts/subs. Tracker totals/bars are based on those logs. The frustration decision uses the consecutive missed streak plus patience days, not a hidden fixed start-percentage promise.

Winning form = at least four recorded results and ≥60% wins among the last six; it halves playing-time drain. Meaningful appearance adds +5 happiness, or +25 while recovering a formal request; no meaningful minutes drain only after warning gates. Ambitious young player (≤25, OVR≥squad quality+6, ≥8 rated matches) loses an additional 2. Happiness caps at 95; prospects have a 55 floor and never force a playing-time demand. After three consecutive meaningful appearances a formal request can clear. Poor form (<6.2 after ≥8 matches) changes descriptive mindset; it is not itself the playing-time drain.

Concern mail is deduplicated by player/episode/stage. Formal requests track automatic-listing provenance; old premature requests can be relieved on migration without cancelling an already-agreed transfer or removing a manager's manual listing. Happy players≥65 in their final24 months receive a renewal invitation. Stats and patience start a new stint after a permanent move.

### Conversation responses and promises

[conversations.js](../src/game/conversations.js).

Rest reassurance: +4 if energy<85, otherwise +1, no selection promise. Minutes promise: +8. Challenge: −8. Youth loan suggestion: +6 (≤23, window open). Renewal promise: +5; defer renewal: −3; support: usually +2. Responses show before/after happiness and can be used only once per letter; expired/resolved/loaned contexts restrict options.

A minutes promise needs two ≥25-minute appearances in the next five eligible matches: +10 when fulfilled, −15 when broken. Injury/suspension pauses it. Renewal promise lasts30 days; an actual new agreement fulfills it, a keep-expiry amendment does not. An active promise cannot be overwritten by another minutes/renewal promise. Prospect loan-thank-you mail is separate from concerns.

## Readiness, energy, ratings and match events

[engine.js](../src/game/engine.js), [playerLife.js](../src/game/playerLife.js).

`match OVR = base OVR + confidence`; confidence bounded−2…+2 and fades one point toward0 before new match delta. Position fit converts the role-specific OVR deduction into a multiplier, clamped .42…1; registered secondary roles have no position deduction.

Auto readiness score = `match OVR + .48×(energy−100) + .18×(sharpness−100)`. Team effective OVR = `match OVR × (.78 + .12×sharpness/100 + .10×energy/100)` after position assignment. Team attack weights forwards1.3/midfield.9; defence weights GK.9/defenders1.2/midfield.5, with reduced strength when fewer than eleven remain.

Sharpness (`condition`) gains `2 + minutes/25` for ≥15 minutes, otherwise loses3 after ≥2 missed matches; round and clamp45…100. Career-day energy recovery = `5 + stamina/30` per day, capped100.

Post-match energy load = `(minutes/95) × (13 + .25×(opponentStrength−70)) × styleLoad × 84/stamina × keeperFactor`. Style load: gegen1.28, tiki1.10, bus.85, otherwise1; keeper factor.55, otherwise1. Stored energy becomes `round(oldEnergy − 1.65×load)`, clamped15…100. Both clubs receive the same updates. The live event engine also models minute-level drain (.34 gegen, .23 otherwise, ×84/stamina), rather than pretending every sub plays a full match.

Auto-subs check55/70/80 minutes on each side, at most two per checkpoint/five total. Tired outfield thresholds are energy<84 at55, <78 later. A legal unused bench replacement must improve energy×match-OVR by more than300. Injury substitutes consume the same five-sub allowance. Cards/penalties stem from foul events; dismissals reduce the XI, injuries have short/long absence tiers. Match logs carry actual minutes, goals, assists, cards, ratings, clean sheets and awards into per-competition/season counters.

Formation edge uses width, central attackers and midfield count differences, each capped ±.09 and total ±.20. Six styles add attack/defence and matchup modifiers; line/trap/aggression affects risks. Home/away chance factors 1.12/.92; neutral 1. Shot scoring uses generated xG (penalty .76, free-kick and open-play quality-dependent), not a separate predetermined score. Shootout base success `.73 + .009×(takerOVR−keeperOVR) + small RNG`, clamped .52–.91 (52–91%), five kicks plus paired sudden death, with a bounded fallback after 15 pairs. See the linked engine for full event/ratings detail.

## Board targets, confidence and funding

[board.js](../src/game/board.js), [rewards.js](../src/game/rewards.js), [reward tables](../src/data/REWARDS.md).

Elite = top-eleven quality≥84 and strength rank≤4. Contender otherwise quality≥80 or rank≤5. Elite target league1/domestic winner; contenders top4/domestic semis; upper-half squads top-half, lower squads survival (size−3), domestic quarters. Europe exists only if qualified: elite UCL winner, elite/contender elsewhere quarters, others R16.

Weights: league50, domestic25, Europe20 if present, finance15; divide by the actual weight sum. Cup level0 league-phase,1 playoffs,2R16,3quarters,4semis,5final,6winner. Domestic uses best supported cup progress.

```text
league raw score = clamp(100 − 9×max(0,position−target), 0,100), or75 before results
cup raw score = clamp(100 − 17×max(0,targetLevel−reachedLevel), 0,100)
finance score = wage reserve / remaining wage commitment ×100, capped100
                (0 for negative transfer budget; funded target threshold90)
season progress = played league matches / (2×(league size−1))
live nonfinance score = round(75 + (raw−75)×progress)
confidence = rounded weighted mean of objective scores
```

Secure≥70, Supported≥55, Under review≥40, At risk<40. Only final overall confidence<40 dismisses the manager; each missed objective is not a separate instant-loss condition. Final review removes early-season smoothing and is saved once. The top Board tile and modal use the same report/review.

Competition rewards are cumulative, once per season/competition/milestone ID, paid on actual advancement or aggregate qualification—not first-leg wins/byes/defeats. Immediately update transfer funds and ledger and send a reward mail. [REWARDS.md](../src/data/REWARDS.md) lists every amount.

Premier League next-season merit = `21−position` £m (20 for first,1 for twentieth) plus board allocation10, or6 if relegated. Other leagues/tiers retain board grant `(top tier?10:6) + 2×(active league size−previous rank+1)`. Existing cash carries forward. Rewards are game-balanced funding, not a claimed EA27 or real-world TV/prize table.

## Career progression, clocks and persistence

[career.js](../src/game/career.js), [seasonFlow.js](../src/game/seasonFlow.js), [market.js](../src/game/market.js), [browserStorage.js](../src/game/browserStorage.js).

At season rollover players age one year, archive the simulated season and reset season stats/confidence/energy/sharpness. Youth growth depends on age, potential room and appearances; regularly used under24 players (≥10 apps) gain at least1 while below potential. Older-player decline/retirement is age-weighted. Values change ×1.10 for growth, ×.87 for decline, ×.98 otherwise, rounded/min1. Intake adds up to2–3 youth within30 squad places, prioritizing a second keeper. Promotion/relegation uses finished tables and country rules; dropping below the supported second tier ends the career. Qualification reflects completed league/cup outcomes.

Daily transfer calendar first checks unhandled player-care attention/ready personal terms, advances player recovery/payroll and world fixtures chronologically, resolves due talks, creates offers and returns loans. It stops for manager decisions or a newly due manager fixture; consumed dates are not repeated. Both instant/match modes use this clock.

Deadline Day holds the date fixed for20 game hours. Advance1 or2; each hour resolves due talks and can stop early for attention. Later-window recruitment/approaches run at each fifth hour before close. A ready contract or unread signing decision blocks advancing. At hour20 close new bids; existing fee agreements can finish personal terms, free-agent approaches remain open.

Save schema8 validates/migrates earlier supported versions. IndexedDB current/previous snapshots, legacy fallback and `savedAt` ordering recover the newest valid career. Autosaves debounce500ms, and durable signing/batch saves await completion. A restart generation barrier skips queued old saves, atomically replaces current/deletes previous, updates only the game's legacy keys, and guards delayed import/simulation work. See [developer guide](../README.md#storage-and-restart) for failure cases and test commands.

Startup loading is an activity state, not calculated progress. The HTML loader covers module loading; the App loader covers save restoration. Import failures and React render failures expose reload recovery without deleting persisted data. Fresh career deadline/window checks are safe before dates exist.
