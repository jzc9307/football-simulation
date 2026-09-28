# Contract snapshot

Starting expiry years and weekly GBP wages come from the public [FUTWIZ FC26 career database](https://www.futwiz.com/fc26/career-mode/players), retrieved on 28 September 2026. These are game-database values, not a claim about current legal contracts. Expiry years are represented as 30 June of that year because the source provides a year, not a day. Already-ended source terms are visibly labelled; they are not silently extended.

5,182 of the 6,473 unique players in this project's rosters have a confident source match. Missing or ambiguous records are labelled **Source unavailable** instead of inventing a real wage or term. Names and starting clubs are not changed. Haaland's verified alternative spelling has an explicit source match. Height, foot, nationality and five ability fields also come from matched records; goalkeeper fields use goalkeeper labels.

`scripts/import-contracts.mjs` queries the public FC26 search table and prints the proposed JSON snapshot to stdout for review. It does not write files. The site currently hosts that table through its FC27 route; the action requests the FC26 database explicitly. Full/common-name matching is followed by conservative age/position/team checks, and ambiguous ties are left unmatched. The public action identifier may change; stop and inspect the source if it becomes unavailable.

New contracts negotiated during play have `source: career`. Their wages, promises and terms are simulation values. Career statistics come exclusively from this game's simulated matches. Weekly payroll deductions are intentionally not enabled in this implementation.
