# Gameplay guide

Current implementation, audited 30 September 2026. For exact thresholds and formulas, see [Calculations](CALCULATIONS.md). These rules are balanced for this game, not an official EA career-mode specification.

## Start, save and restart

Choose one of six top-flight leagues, then a club. **Match by Match** lets you prepare/replay fixtures individually. **Instant Half-Season** advances the same world fixture-by-fixture toward the halfway/end-season review; it still pauses for decisions. You are not giving the AI permission to sell your squad.

The startup screen appears while loading game code and checking saved progress. There is no artificial waiting period or pretend percentage. If loading/rendering fails, a reload option replaces the activity indicator; it does not clear your career.

The header shows save status. Autosaves normally use IndexedDB, with recovery snapshots and a localStorage fallback. Export a JSON backup for long careers or before making a fresh start. Import validates a save before applying it. Storage-full/invalid-save messages mean progress is not safely saved; do not refresh without a backup.

Restart opens a confirmation inside the game. You can export first, keep playing, or confirm. Confirmation saves a fresh career and returns to league selection, including after a reload. It replaces the current and recovery career; importing an exported backup is the way to restore the old one. Opening or cancelling the confirmation changes nothing.

## Your five-tile season bar

The desktop strip reads **Season → Budget → Board objectives → Squad readiness → League form**. It wraps on narrower screens.

- **Budget** opens the finances window; its headline is available, unreserved transfer funds. The supporting line shows fee reservations or weekly payroll.
- **Board objectives**, immediately beside Budget, shows confidence out of 100 and Secure/Supported/Under review/At risk. Press it for the season's league, cup/Europe and financial targets.
- **Readiness** summarizes squad sharpness, with energy listed separately. League form shows the last five league results; received-offer access appears when relevant.

The first-team desk opens Transfer Centre, competitions, Calendar, Mail and Matchday Studio. Assistant suggestions appear below it when actionable. Workspace tabs include Squad, Performance, Squad Hub, Table, Fixtures, Competitions, Calendar and Mail.

## Squad, tactics and team sheets

The squad screen keeps the pitch on the left and the player list on the right. Move players with drag-and-drop or explicit Start/Bench/Available buttons. The selected bench contains up to nine players; other available players do not automatically become match substitutes. Injury/suspension markers explain unavailability.

Players can occupy unfamiliar outfield roles, but the pitch displays the OVR penalty. Natural/secondary positions perform best. Shirt-number controls are separate from selection. Selling/loaning lists the player for approaches; it does not instantly remove them.

Matchday Studio combines formation, squad profile and launch panels for lineup, tactics and team sheets. Seventeen formations and six styles are available. You can set line height, aggression, offside trap, a half-time style switch and automatic substitutions.

### Team-sheet collection

Your first saved setup becomes **Team XI**. Create/rename/edit up to three sheets for a first team, cup rotation or alternative plan. The combined editor contains the pitch, formation selector, match instructions and squad list; dragging works within the draft, including swaps and reserve-to-pitch replacements. Click a pitch slot and then a player as an alternative to dragging.

Each sheet stores formation, starters, selected bench, style, defensive settings, half-time response and auto-subs. Names must be distinct; all eleven starters are required before saving. **Cancel** leaves the live setup unchanged. **Save & use** applies the sheet. Buttons below the main squad pitch switch saved plans; at least one sheet must remain.

Templates survive temporary absences: activation fills unavailable/departed positions with eligible replacements without deleting your stored plan. Explicit manager edits sync to the active sheet; automated match replacements do not. Instant simulation picks a readiness-aware XI and restores strong recovered players rather than leaving them permanently benched.

## Energy, fitness and matches

Energy is workload/recovery; fitness in the squad is match sharpness. Playing costs energy, while useful minutes build sharpness. Repeated non-selection gradually reduces sharpness. Career days recover energy; there is no automatic per-match reset to 100%.

The same persistent player updates apply to opponents in simulated fixtures. The AI selects rested positional alternatives and can use up to five substitutions for tired/injured players. Red cards remove a player without replacement; a tactical adjustment/substitution of another player can restore positional coverage, not an eleventh player.

Live match replays show goals, assists, cards, injuries, tactics and named substitution-on/off events. Match statistics include possession, shots, expected goals and detailed team/player records. Cup deciding ties use extra time and a taker/keeper-based shootout when required. Results come from the simulation, not the animation.

## Performance and Squad Hub

Performance Centre starts accumulating data after played/simulated fixtures. Filter your squad by competition and precise position, search names, and sort ascending/descending by player name, position, OVR, appearances, goals, assists, clean sheets, yellow/red cards, average or best rating. Players without ratings stay below rated players in either direction. Global leader/award panels and season-XI analysis use this career's records.

Squad Hub has a searchable/selectable left player list and a detailed right profile:

- OVR, position, age, value, energy and sharpness.
- Player DNA pentagon/attributes; known source profile facts such as height, foot and nationality.
- Contract expiry, remaining length, weekly wage and contracted squad role; provenance distinguishes source data, simulated terms and negotiated contracts.
- Happiness/mindset, renewal, compact loan/sell buttons and Club interest.
- Season/club career rows for appearances, minutes, goals, assists, average/best rating. These are **only in-game records**, including separate transfer stints, never copied real-world career totals.
- Playing-time tracker showing recent starts, substitute appearances, minutes and useful appearances alongside contracted expectations. Recent-match bars and the missed-selection streak expose warning/request gates instead of hiding them.

Unknown legacy start/sub labels are shown as unknown; recorded minutes are retained until new logs replace them.

## Playing-time expectations and player meetings

Patience depends on **both** consecutive eligible matches without useful minutes **and** calendar days. Regular starters have far longer grace than key players. Rotation players expect occasional starts/subs; prospects ask for opportunities but do not force a playing-time transfer request. A reserve goalkeeper uses cup/injury-cover expectations, not outfield rotation. Key goalkeepers retain key-player expectations. See [exact tables](CALCULATIONS.md#playing-time-and-happiness).

Injury, suspension and loan absence do not count as a selection snub. A meaningful appearance resets the missed-match/day streak; a token late cameo may not. Winning form halves the playing-time morale penalty. A formal request requires low happiness too, not merely elapsed time. Three consecutive meaningful appearances can resolve a formal request. The game cannot demand that every player in a large squad starts equally often.

Concern letters show the player's card and live happiness; scroll the reader to reach responses. Reassure them about rest without promising selection, promise opportunities, challenge them at a happiness cost, or suggest a suitable youth loan where allowed. Players reply, and each letter can be answered once.

A minutes promise is **two appearances of at least 25 minutes in the next five eligible matches**. A renewal promise is a new agreement within 30 days. Kept/broken promises affect morale and generate updates. These explicit promises are separate from normal role patience. Do not promise more minutes if you intend to keep the player out.

Formal requests can force transfer listing and invite approaches outside a window. A closed-window agreement registers in the next window; the player remains usable until then. Happy players near expiry can ask you to consider renewal. Loaned prospects may send a thank-you letter.

## Buying and negotiating contracts

Search any player/club in Transfer Centre, use league/club/position/age/value filters, or add a target to your shortlist. Exact-position filters include secondary roles. Player profiles show asking price, squad importance, availability and compact **Club interest** with current clubs/bids/phases.

The buying flow is:

1. Negotiate a fee with the selling club (up to three rounds).
2. Accepted fee reserves transfer funds; the player stays at the seller. Wait for the player decision, normally two days or sooner near a deadline.
3. Rival approaches can join the race. The player compares sporting strength, expected opportunities, European football and simulated terms. A single valid bid from a suitable club is not rejected by an arbitrary refusal roll.
4. If selected, open personal talks. Agree contract length, weekly wage and squad role. Counters update the wage field to the agent's request; the agent's terms can also be applied with one button.
5. Only accepted, affordable personal terms complete the signing, charge the fee, fund wages and move the player.

An elite/ambitious player can reject a clearly weaker project. Changed squad capacity, seller depth, loans or insufficient funds can invalidate a deal; failure notices explain which condition changed and release reservations. Cancelling/rejected personal terms charge no transfer fee. A fee agreement does not guarantee registration, and free funds must cover both the reserved fee and additional wage funding.

**Active Talks** groups your negotiations, activity around the market and recent decisions. Do not advance past contract-ready talks: agree terms or withdraw first.

### Renewals and squad-role changes

Ordinary renewal opens in the final two years. Recently signed terms settle for 180 days. Young high-rated players at a substantially weaker club, or players wanting a move, can refuse renewal.

To change a role without extending the contract, choose **no extension / keep current expiry** in contract negotiation. Negotiate role/wage with the agent; there is no instant role dropdown in Squad Hub. Accepted amendments retain the exact end date and signed date, and have a 90-day amendment cooldown. High-OVR/important players can reject a lower role even if you offer more money. New signings always need a new 1–5-year agreement.

## Selling, loans and free agents

Other clubs can approach listed or unlisted players. Your approval is mandatory. Counter a received fee or decline it; the player remains in the team during talks. Normal buyer budgets allow negotiation toward market value rather than trapping a valuable player with an unaffordable buyer. Short contracts/unhappiness affect AI valuations; configured opening-replay offers use a separate in-game fee rule.

After you accept a fee, the player negotiates for 1–3 career days (or deadline-day hours). You can accept more than one club's fee; the player chooses the most attractive valid deal. Fees arrive only on completion. Off-window formal-request transfers wait for the next open window.

Loans use availability rules, suitable borrowers and dated returns. Outgoing negotiations support 0.5–3 seasons in half-season steps. No more than three incoming loans can be held at once. Their fee is separate from wages; currently wages remain with the owner. Outgoing loans can be recalled with compensation. A loaned player cannot be permanently sold/bought while the loan is active.

Type **free agent**/**free agents** or select the Free agents entry to browse unattached players. Expired unrenewed contracts enter this pool; AI clubs may choose not to renew ageing low-upside depth players. Signing skips club fee negotiation and goes directly to personal terms, including outside the transfer window. There is no transfer fee, but wages still need funding. Suitable AI clubs can sign free agents too; not every released player is guaranteed a destination.

## AI windows, date stops and Deadline Day

The first summer window uses the configured opening-move replay, not unrestricted random AI recruitment. Starting roster data remains unchanged; the calendar creates approaches/invitations and completed transfers. If you manage a participating club, you decide. Already-moved/unavailable players are not forced back into a scripted deal. Old saves begin replay processing from their joining date rather than replaying past months.

Subsequent summers are busier: AI clubs look for missing starters, upgrades, succession, depth and prospects, spending within their budgets. January is quieter and concentrates on serious injury cover or relegation danger. Clubs avoid buying another expensive star for a position already well covered.

Both simulation modes stop the date for relevant new approaches/offers, rival bids, signing decisions, ready contract talks, player-care events and loan returns. Scheduled fixtures are not jumped over; background world deals alone need not interrupt your career.

Calendar marks summer/January opening and closing days. The first summer deadline is 1 September 2026; later summers use 31 August, January uses 31 January. On Deadline Day the football date stays fixed while a **20-hour game clock** runs. Advance one/two hours; a skip stops at the first decision. Outstanding signing notices and ready terms must be handled first. New fee bids close when the clock expires, while previously agreed personal terms and free-agent talks can finish.

## Budget, rewards and board objectives

Budget Overview separates available transfer money, pending fees, wage reserves, transfer spending and paid wages. The donut summarizes resources plus spending, **not real total club wealth**; allocations are funding movements, not duplicate expenses. The trend/ledger can be filtered by transfers, payroll and funding.

Existing wages get a fixed board allocation each season. Incoming player wages and renewal increases allocate their remaining-season cost from transfer funds to wages. Payroll consumes the reserve every seven career days. Departures return unused transfer-funded wages; rejection costs nothing. Example: a £40m purchase with £100k/week for 40 remaining payroll weeks needs £40m fee plus £4m wage funding.

Cup/European advancement adds modest game-balanced transfer funding immediately and sends a distinct reward letter. Payments are unique per season/competition/milestone, not every screen visit or first-leg win. Premier League finishing-position funding is credited on the next-season transition. See [full reward tables](../src/data/REWARDS.md).

Board ambitions depend on squad quality and relative league strength, not hardcoded club names. Strong clubs may be asked to win the league/cups; others target Europe, mid-table or survival. Europe targets appear only when qualified. Finance asks for sustainable funded wages. Live scores soften early-season results; final review uses the whole campaign and partial credit. Confidence below **40/100 at final review** ends the career. One missed target alone does not.

Assistant advice prioritizes outstanding minutes promises, tired starters with rested positional cover, expiring happy players, congested fixtures/rotation sheets and role/tactical risks. Select anywhere on a notebook card to open its action; keyboard users can focus the card and press Enter or Space. Suggested changes require your action.

## Multi-season progression and limits

Finish league and European campaigns before creating the next season. Retirements, ageing/development, value changes, youth intake, promotions/relegations, qualification, budget grants and fresh fixture/finance setup follow. Career player/history rows remain; season counters reset. A relegation below the supported second tier or a failed board review ends the career.

The system does not yet simulate a full profit-and-loss account (tickets, stadium/staff costs), contract bonuses, negotiated loan wage sharing or real legal registration rules. All generated wages, ambitions and replay fees are simulation values; source/estimated labels must not be mistaken for verified current real-world contracts.
