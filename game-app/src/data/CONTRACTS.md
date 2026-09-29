# Contracts: dataset, generated terms and lifecycle

Implementation audited **30 September 2026**. The complete formulas are in [CALCULATIONS.md](../../docs/CALCULATIONS.md#initial-contracts-agent-demands-and-role-negotiation); the player-facing workflow is in [GAMEPLAY.md](../../docs/GAMEPLAY.md#buying-and-negotiating-contracts).

## Source snapshot

Starting expiry years and weekly GBP wages come from the public [FUTWIZ FC26 career database](https://www.futwiz.com/fc26/career-mode/players), with the stored snapshot metadata dated **28 September 2026**. These are game-database values, not a claim about current real legal contracts or an independently verified 2026/27 wage bill.

The bundled [contractsFc26.js](contractsFc26.js) contains **5,182** confident matches against **6,473** unique roster player slugs. Fields are expiry year, weekly GBP wage, source ID/slug and optional profile attributes. Expiry years become 30 June of that year because the source supplies a year, not a day. Already-ended source terms remain visibly labelled; they are not silently extended. Sourced starting names/clubs are not rewritten. Haaland's alternative spelling has an explicit match.

Height, preferred foot, nationality and five attribute fields also come from matched records. Goalkeepers have corresponding goalkeeper labels in the player UI. The Squad Hub pentagon/profile must distinguish supplied attributes from fallback simulation values.

[`scripts/import-contracts.mjs`](../../scripts/import-contracts.mjs) queries the public search action and prints a proposed JSON snapshot to stdout for review; it does not write files. The stored import implementation explicitly requests FC26 through the site's table action. Matching uses full/common names plus conservative age/position/team checks; ambiguous ties remain unmatched. Routes/action IDs can change: inspect the site before a new import rather than assuming the old endpoint still works. This documentation refresh did not re-fetch or relabel the source snapshot.

## Unmatched players and source labels

Unknown/ambiguous players receive **Simulated terms**, `source: estimated`. Outfield age≥32 or GK≥35 gets one year; others get two/three from a stable player-ID seed. Weekly wages scale with OVR, club finances, age and potential, rounded to £500 with £500–£250k bounds. Young low-upside players cost less. Generated youth get three years, £1k/week and Prospect.

Known existing expiry/wage records take priority. Negotiated agreements use `source: career`: their wage, expiry and squad promise are generated gameplay outcomes, not FUTWIZ source assertions. Initial squad roles are inferred from age/OVR relative to the club, even when expiry/wage is sourced. Prior-season career stats are never scraped; all appearances/goals/assists/averages in the career table come from this save's simulated fixtures.

## Negotiation and role-only amendments

Buying separates club fee agreement, player choice and personal terms. Only accepted, funded personal terms move the player. Ready talks include duration, wage and squad role; counters persist and reset the input to the agent's current request. Three rounds maximum, with wage/role/duration requirements documented in the calculation reference. Failure/cancellation does not charge the fee.

Ordinary renewal opens in the final24 months. Newly signed contracts settle for180 days. Players wanting a move, or young stars whose ability exceeds a weak club's level, can refuse renewal.

Changing a squad role **must be negotiated**, not applied instantly. Choose no extension/keep current expiry: owned unloaned players can agree role/wage amendments without changing their expiry or original signed date. At least one term must change; accepted amendments have a90-day cooldown. High-rated/important players protect their status and can reject a downgrade even for higher wages. New signings need a1–5-year contract. A role-only amendment does not satisfy a promised extension, and it does not erase minutes history.

## Wage funding and payment

Existing player wages receive a fixed board allocation at season setup. New signings and renewal increases move their **remaining-season payroll cost** from available transfer funds into the wage reserve. Payroll spends that reserve every seven career days, not the transfer budget a second time. Rejected terms cost nothing. Departures return unused transfer-funded wages; loans retain wages with the owning club. New seasons allocate board-funded wages for the squad then under contract. Budget Overview distinguishes funding movements from fees and paid payroll.

## Playing time, letters and expiry

The current patience model uses **both eligible missed matches and calendar days**, plus low happiness for a formal request. Key warning3 matches/21 days, request10/56; regular starter10/42 and24/112; rotation16/70 and36/180; prospect18/180 and **no playing-time request**. Happiness must be≤35 for the request gates to trigger. These replace the old two/three-match warnings and automatic happiness-to-zero rule.

Reserve GK expectations are more patient: contracted starter14/84 warning and32/210 request; rotation24/120 and52/270; prospect24/270 warning, never a playing-time request. Key keepers retain key expectations. Backup status does **not** silently change the contract role.

Useful appearances reset the missed streak; minimum36 minutes key,28 starter,15 rotation/prospect. Injury/suspension/loan absence pauses the clock. Winning form halves playing-time frustration. Three consecutive useful appearances can resolve a formal request. The involvement tracker exposes recent minutes, known starts/subs, meaningful appearances and warning/request gates; legacy unknown starts remain unknown.

Scrollable player letters show happiness and reply choices. Explicit minutes promises require two≥25-minute appearances in the next five eligible matches; a renewal promise expires after30 days. Promises can be kept/broken, with follow-up morale effects. Concerns are deduplicated, and prospects may thank the manager for arranging a loan.

Formal requests can force transfer listing and off-window approaches, but registration waits for the next open window. Happy players≥65 with final24 months can receive a renewal invitation. Expired unrenewed contracts create free agents; AI clubs can decline old low-upside renewals and suitable clubs can recruit released players. Free-agent user signings skip club fees, but still negotiate/fund wages and a new contract. Not every released player is guaranteed another club.
