# Game app — developer guide

React 18, Vite 5, Lucide icons and ESLint 9. This is the maintained application; the repository [overview](../README.md), [gameplay guide](docs/GAMEPLAY.md) and [calculation reference](docs/CALCULATIONS.md) describe its current feature set. Last audited: 29 September 2026.

## Commands

```sh
npm install
npm run dev
node --test --test-reporter=spec tests/*.test.mjs
npm run lint
npm run build
npm run preview
```

The tests use Node's built-in runner and `.mjs` files; no browser is required for game-rule tests. `npm run build` emits `dist/`. The large bundled roster/contract dataset can trigger Vite's chunk-size warning; it is not a failed build. Do not put `dist`, `node_modules`, or generated saves into source control.

## Module ownership

| Area | Source |
| --- | --- |
| React application, screens, manager actions | `src/App.jsx`, `src/components/` |
| Formations, role groups, cup configuration | `src/game/config.js` |
| Match simulation, position fit, ratings, replay events | `src/game/engine.js`, `matchVisuals.js` |
| League/cup/European orchestration | `src/game/actions.js`, `seasonFlow.js` |
| Fixture/date/draw scheduling | `seasonSchedule.js`, `europeanCalendar.js`, `firstSeasonFixtures.js` |
| European qualification and brackets | `uclSelection.js`, `europaSelection.js`, `conferenceSelection.js`, `uclBracket.js` |
| Roster mutations, fee valuation, loans, rollover | `src/game/career.js` |
| AI market, pending bids, player choice, personal terms, date stops | `src/game/market.js` |
| Configured opening moves and window dates | `openingTransfers.js`, `transferWindows.js`, `deadlineDay.js` |
| Player contracts, patience, happiness, sharpness, history | `src/game/playerLife.js` |
| Conversation choices/promises, assistant advice, board targets | `conversations.js`, `assistantAdvice.js`, `board.js` |
| Exact cash, fee reservations, wage funding/payroll/ledger | `src/game/finance.js` |
| Free-agent identity/search; browse/stat filtering | `freeAgents.js`, `playerBrowse.js` |
| Team-sheet templates, selection/bench grouping | `teamSheets.js`, `squadSelection.js` |
| Progression and league rewards | `src/game/rewards.js` |
| Save validation/compaction/import/export | `src/game/storage.js` |
| Queued durable snapshots and explicit restart | `src/game/browserStorage.js` |
| Nested modal scroll ownership | `src/components/pageScroll.js` |
| Bundled roster/contract records | `src/data/` — see [contract provenance](src/data/CONTRACTS.md) |

Unprefixed game filenames in the table are under `src/game/`. Assets are bundled locally, with provenance in their `SOURCE.md` files.

## State and invariants

The game keeps one career state; reducers generally return a new state rather than mutating imported roster modules. Keep club/player changes synchronized across the active `clubs` list, all domestic pools and European campaign lists using `commitClubs` or `mapLifeClubs`. Otherwise a competition screen can revive an old roster, injury or energy value.

Important fields include `stage`, `season`, `currentDate`, `seasonSchedule`, `fixtureResults`, `lineup`, `benchSelection`, `teamSheets`, `market`, `saleOffers`, `loans`, `freeAgents`, `finance`, `board`, `mail` and player `contract`/`life`/`careerSeasons`.

- Process fixtures chronologically and consume manager-relevant events once. Both simulation modes must stop for offers, signing decisions, ready personal terms, player-care events, loan returns and deadline days.
- A fee agreement is **not** a transfer: keep the player at the seller and reserve the fee until accepted personal terms complete registration.
- Preserve a legal squad and at least one goalkeeper after a release. Enforce pending-signing capacity and available, not gross, budget.
- Only explicit manager changes update a saved team-sheet template. Match-day injury replacement and automatic substitutions must not rewrite it.
- Record actual substitute minutes, not 95 minutes for every appearance. Unknown legacy start/sub status stays unknown.
- Do not invent prior-season real-world statistics or silently extend sourced contracts.
- Squad roles change only through accepted contract terms, including a keep-expiry amendment. Reserve-GK patience is not an automatic role downgrade.
- Ledger allocation moves are not additional spending; weekly payroll consumes already-funded reserves.

## Storage and restart

JSON schema version is **8**; validation accepts older supported versions and migrates them. `compactState` normalizes/deduplicates roster copies and omits transient match replay blobs. Schema validation checks dates, identifiers, competitions, contracts, payroll, market talks, promises, templates and player logs. Import rejects invalid data rather than partially applying it.

`createSaveRepository` reads IndexedDB database `football-manager-career`, store `snapshots`, keys `current` and `previous`. It also reads legacy localStorage `football-manager-save-v1` (or `pl-manager-save-v8`). The newest valid `savedAt` wins; malformed/current corruption can fall back to a valid recovery snapshot. Unreadable careers pause autosaving and expose export/import instead of overwriting them.

Writes are serialized. App autosave debounces 500ms and also saves on `pagehide`. Signing confirmation and completed instant batches explicitly await durable writes. IndexedDB failures can fall back to localStorage; failed writes retain the last good career. Timestamps increase monotonically within the repository, including when the system clock moves backwards.

`reset(freshState())` is a queued barrier, not a blanket storage clear:

1. Invalidate queued writes from the old career, wait for an already-running write, reject new saves while resetting.
2. Atomically write fresh `current` and delete old `previous`; mirror/replace the game's primary legacy key where possible and remove its obsolete key.
3. Return success only after at least one store persists the fresh state. If both fail, retain the current in-memory career and show a retry/export message.
4. Clear App workspace/drag/filter state after success. Async import/simulation completions from the old generation cannot overwrite the new career.

No unrelated localStorage keys or entire databases are deleted. A confirmed restart intentionally replaces the game's current/recovery save; offer export first. Cancellation is read-only. The transfer-window check tolerates missing date/deadline state on league selection.

## Testing and documentation maintenance

The suite is grouped by feature (`market`, `transfers`, `contracts`, `playingTimeTracker`, `playerConcernsFinance`, `management`, `teamSheetsRewards`, `calendar`, `reliability`, `restart`, etc.). Add deterministic RNG/date fixtures for rule changes and storage fakes for failure/race conditions.

For UI checks, run an extra server with a separate origin, for example `npm run dev -- --host 127.0.0.1 --port 6219 --strictPort`. Never restart, import into, or clear the user's actual saved-game origin for QA. Verify modal close/focus/scroll, desktop tile alignment, narrow layouts, Cancel, successful restart and reload. Close only agent-owned tabs/servers afterward.

When rules change, update [CALCULATIONS.md](docs/CALCULATIONS.md) alongside the regression test, [GAMEPLAY.md](docs/GAMEPLAY.md) if the workflow changes, and [CONTRACTS.md](src/data/CONTRACTS.md)/[REWARDS.md](src/data/REWARDS.md) if source/progression policy changes. Preserve asset provenance rather than relabelling old downloads as newly verified.
