# Football Manager Simulation

A browser-based, single-player football career built with React and Vite. Manage lineups, tactics, competitions, transfers, contracts, player relationships and club finances across multiple seasons.

Documentation audited against the implementation on **29 September 2026**. These pages describe the shipped game, not future ideas or official EA/real-world rules.

## Start the app

```sh
cd game-app
npm install
npm run dev
```

Open the local URL printed by Vite. Pick a league, a club, then Match by Match or Instant Half-Season. All management tools remain available in either mode; fast-forward stops for decisions that need the manager.

## Documentation

- [Gameplay guide](game-app/docs/GAMEPLAY.md): every screen and the complete career flow.
- [Calculation reference](game-app/docs/CALCULATIONS.md): transfer pricing, AI recruitment, player decisions, contracts, wages, morale, match readiness, board reviews and season funding.
- [Developer guide](game-app/README.md): commands, module ownership, persistence and regression tests.
- [Contract data and provenance](game-app/src/data/CONTRACTS.md): sourced FC26 records versus simulated terms.
- [Competition reward tables](game-app/src/data/REWARDS.md): exact in-game progression and Premier League allocations.
- [Club crest provenance](game-app/src/assets/club-logos/SOURCE.md) and [competition logo provenance](game-app/src/assets/competition-logos/SOURCE.md).

## Current feature set

### World and competitions

Six playable top flights: Premier League, LaLiga, Serie A, Bundesliga, Ligue 1 and Liga Portugal. Five second-division pools support promotion/relegation; Portugal does not have a playable second tier. The bundled world contains 286 clubs and 6,473 unique player slugs, including 70 European guest clubs.

League, domestic cup and Champions/Europa/Conference League fixtures share a chronological calendar. Cup draws, two-leg ties, aggregate scores, extra time, penalties, competition records and next opponents are tracked. Active competitions appear above eliminated/not-qualified campaigns. Progression funding arrives with a reward email; Premier League merit funding arrives next season.

### Matchday and performance

- Seventeen formations, six playing styles, defensive line, aggression, offside trap, half-time response and automatic substitutions.
- Drag players between pitch positions and the squad; one-click Starting XI, Bench and Available moves. Nine selected substitutes.
- Matchday Studio and up to three named team sheets, starting with Team XI. Each sheet saves formation, lineup, bench and tactics together. Draft changes apply only when saved; selectors sit below the left-hand pitch.
- Event-driven match replays with named goals, assists, cards, injuries, substitutions on/off, momentum and match statistics. Both teams rotate and substitute tired players.
- Energy falls with workload and recovers with career days. Fitness/sharpness improves with useful minutes and declines with inactivity. Opponent state persists rather than resetting to 100% every fixture.
- Performance Centre: competition and precise-position filters, player search, ascending/descending sorting across every supported stat, leaders and season XI analysis.

### Recruitment and player care

- Transfer Centre search by player/club, league, exact/secondary position, age, value and sort order; shortlist and searchable Free agents section.
- Club fee negotiation → player choice/rival bids → personal terms → final signing. Accepted fees are reserved, not charged until completion. Failed deals show a specific reason.
- Active Talks: your negotiations, world activity and recent decisions. Compact Club interest shows the clubs, bids and phases on a player profile.
- Budget-aware AI recruitment, squad depth/succession planning, urgent January cover and unsolicited offers for your squad.
- A configured first-opening-window replay creates transfer events without rewriting starting roster files. Later windows use needs-driven AI. Managed-club moves always require approval.
- Contract length, weekly wages and contracted squad roles; renewal or **no-extension squad-terms negotiation**. High-rated players can reject role downgrades.
- Squad Hub: searchable player list, attributes/pentagon, mindset, contract, loan/sell controls, involvement tracker and in-game-only season/club career history.
- Role-based patience, special reserve-goalkeeper expectations, injury/suspension exemptions, winning-form morale relief, formal transfer requests, expiry and free agency.
- Scrollable player letters with happiness, manager responses, promises and player replies; prospects can thank the manager for a loan.

### Management and money

- Five-tile season bar: season, **Budget**, **Board objectives**, readiness, league form. Budget and Board open their detailed windows.
- Separate transfer funds and wage reserves. Existing squad wages are board-funded; new/raised wages reserve remaining-season costs from transfer funds; payroll is charged every seven career days.
- Budget Overview with allocation chart, spending trend and transaction filters. Transfers, wage funding, weekly payroll, refunds and rewards remain distinguishable.
- Assistant advice on tired starters, outstanding promises, renewal opportunities, congestion and positional/tactical risks.
- Deadline Day hub with a 20-hour simulation clock, bid updates and decision stops. Calendar highlights window openings and deadlines.
- Quality-based league/cup/finance board targets, softened early-season confidence and a final overall review. Missing one target is not automatic dismissal; final confidence below 40 ends the career.

### Saves and restart

Autosaves use IndexedDB current/recovery snapshots with a localStorage fallback, versioned JSON import/export and validation. Corrupt saves are not silently replaced. Large careers no longer depend solely on localStorage's small quota.

Restart opens an in-game confirmation with an export-backup option. Confirmation commits a fresh career before returning to league selection, replaces the old recovery snapshot, resets open workspaces and prevents queued old autosaves from restoring the previous career. Cancel leaves the career unchanged. **A confirmed restart replaces the active save; export first if you want to recover it later.**

## Verification

From `game-app`:

```sh
node --test --test-reporter=spec tests/*.test.mjs
npm run lint
npm run build
```

The regression suite covers calendars, competitions, transfers, contracts, payroll, concerns, conversations, deadline days, board reviews, free agents, team sheets, save recovery and restart. Browser QA should use a separate local origin and generated test careers, never overwrite a player's live save.

## Scope and attribution

This is a fan-made simulation, not an EA product. Source contract records are FC26 game-database values, not verified current legal contracts; unmatched players receive clearly labelled simulated terms. All played-career statistics, transfer negotiation outcomes, budgets, morale, board ambitions and prize allocations are game calculations. The game does not currently model real player personalities, signing/agent bonuses, wage-sharing loans, a full club profit-and-loss account or official real-world registration rules.

Club and competition logos remain their respective owners' intellectual property; see the source documents above. Dataset import scripts print proposed data for review rather than silently replacing files.
