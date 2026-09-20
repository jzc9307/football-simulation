# ⚽ Football Simulation

> A deep, probabilistic football league management sim — five leagues, domestic cups, a 36-team Champions League, transfers, player development, and a minute-by-minute match engine driven by real tactical and formation math.

[![Leagues](https://img.shields.io/badge/leagues-5-brightgreen)](#-game-structure)
[![Champions League](https://img.shields.io/badge/UCL-36--team%20league%20phase-blue)](#-champions-league)
[![Match Engine](https://img.shields.io/badge/engine-minute--by--minute-orange)](#-minute-by-minute-match-calculation)
[![Saves](https://img.shields.io/badge/saves-autosave%20%2B%20JSON-informational)](#-game-structure)

---

## 📖 Overview

Football Simulation is a browser-based management game that puts you in charge of a club across multiple seasons. Every match is resolved minute-by-minute using a layered model of player condition, formation matchups, tactical styles, defensive lines, home advantage, and expected goals (xG) — so results feel earned rather than random, while still leaving room for upsets.

## ✨ Features

- 🏆 **Five leagues**: Premier League, La Liga, Serie A, Bundesliga, Ligue 1
- 🥇 **Domestic cups**: FA Cup & Carabao Cup (Premier League), Copa del Rey (La Liga)
- 🌍 **Champions League** with a 36-team league phase and two-legged knockouts
- 🔁 **Transfers, loans, selling**, squad limits, and shirt numbers
- 📈 **Player development** across multiple seasons, with age- and appearance-based growth/decline
- 🧩 **Drag-and-drop lineup editing**, formations, tactics, and defensive line settings
- 🩹 **Condition & fitness system**, automatic substitutions, suspensions
- ⏱️ **Match-by-match simulation** or instant half-season simulation
- 💾 **Local autosave**, JSON export/import, save validation, and old-save migration

## 🏟️ Game Structure

| League | Clubs | Matches |
|---|---:|---:|
| Premier League | 20 | 38 |
| La Liga | 20 | 38 |
| Serie A | 20 | 38 |
| Bundesliga | 18 | 34 |
| Ligue 1 | 18 | 34 |

> Serie A, Bundesliga, and Ligue 1 don't yet have domestic cups — Premier League and La Liga do.

---

## 🧠 How the Match Engine Works

### Starting Lineup Strength

Every player gets an effective rating based on **position fit** and **condition**.

**Position fit:**

| Position usage | Rating contribution |
|---|---:|
| Exact position | 100% |
| Compatible position | 96% |
| Emergency/incompatible position | 78% |

**Condition adjustment:**

```
Adjusted rating = OVR × (0.65 + 0.35 × condition / 100)
```

| Condition | OVR contribution |
|---|---:|
| 100% | 100% |
| 95% | 98.25% |
| 90% | 96.5% |
| 80% | 93% |

A valid lineup requires 11 distinct starters, a goalkeeper in the goalkeeper slot, and no suspended players.

### Team Attack & Defence

```
Attack  = (forward avg × 1.3 + midfield avg × 0.9) / 2.2
Defence = (goalkeeper avg × 0.9 + defender avg × 1.2 + midfield avg × 0.5) / 2.6
```

Both values scale by `min(1, available players / 11)` — a red card doesn't just remove a player from events, it weakens the whole team.

### Formation Matchups

The engine compares tactical shape zone-by-zone:

```
Wide advantage             = (my wide attackers + wide mids − opp wide defenders) × 0.03
Central attack advantage   = (my central attackers − opp central defenders) × 0.035
Midfield advantage         = (my central mids − opp central mids) × 0.035
```

Each component is capped at ~±9%, and the combined formation modifier is capped at ±20%. This affects **shot creation frequency**, not goals directly.

### Tactical Styles

| Style | Attack | Defence |
|---|---:|---:|
| Balanced | 0% | 0% |
| Tiki-Taka | +4% | +2% |
| Gegenpress | +7% | +4% |
| Low Block | −10% | +14% |
| Counter Attack | +3% | +5% |
| Direct Play | +2% | −2% |

Plus tactical matchup bonuses — e.g. Gegenpress beats Tiki-Taka (+6%), Counter Attack punishes Gegenpress (+8%) and Tiki-Taka (+5%), Low Block counters Tiki-Taka (+4%), and Tiki-Taka is exploited by Gegenpress and Low Block (−5%).

The AI picks its tactic based on formation and squad quality (back-line size, strikers, squad strength).

### Defensive Line & Offside Trap

```
Line position = (selected line − 50) / 50
```

A higher line can add up to ~5% attack while costing up to ~6% defence (and vice versa for a deeper line).

```
Offside trap bonus = 0.05 + ((your defence − opponent attack) / 10) × 0.02
```

Capped between −5% and +8% — strong defences get more out of the trap than weak ones.

### Minute-by-Minute Simulation

Every minute, both teams compute:

```
Effective attack   = team attack × (1 + tactic effect + line effect + matchup bonus)
Effective defence  = opponent defence × (1 + opp tactic effect + opp line effect)
Strength ratio      = effective attack / effective defence
```

**Home advantage:** ×1.12 for the home team, ×0.92 for the away team.

**Shot probability** (clamped between 2.5% and 36% per minute):

```
Shot probability = 0.145 × strength ratio × home/away multiplier × (1 + formation matchup)
```

### Shooter Selection & Shot Type

| Player group | Weight |
|---|---:|
| Forward | 4 |
| Midfielder | 2 |
| Defender | 0.5 |
| Goalkeeper | 0 |

| Shot type | Chance |
|---|---:|
| Penalty | 3% |
| Direct free kick | 7% |
| Corner | 15% |
| Open play | 75% |

> ⚠️ **Current limitation:** shot method is randomly assigned after a shot is generated — it isn't yet tied to fouls, meaning penalties can occur without a recorded foul.

### Expected Goals (xG)

```
Penalty xG = 0.76 (fixed)
Other xG   = 0.10 × strength ratio × random(0.55–1.55), clamped to [0.02, 0.48]
```

A goal happens when `random() < xG`. Shots ≥0.25 xG are **big chances**; shots become **on target** on a goal or a separate 34% roll.

Stronger teams benefit twice over — more shots **and** higher-quality shots.

### Fouls, Cards & Offsides

| Event | Probability / minute | Expected per match (per team) |
|---|---:|---:|
| Foul | 12% | ~11.4 |
| Red card | 0.075% | ~6.9% chance per match |
| Offside | 2% | ~1.9 |

- Max **one red card** per team per match; a sent-off player is removed instantly, team strength recalculates for 10 men, and the player is suspended for the next match in that competition.
- ⚠️ Yellow cards are not yet generated in the active simulation.

### Possession

```
Passes/minute   = 3 + random(0–3)      [+2 for Tiki-Taka]
Pass accuracy   = random(72%–90%)
Possession wgt  = passes × (attack rating / 80)
```

Weights are normalized across both teams into a possession percentage.

### Fitness

| Tactic | Condition loss / minute |
|---|---:|
| Gegenpress | 0.43 |
| All others | 0.27 |

Live condition floors at 20%. At minute 60, up to **3 automatic substitutions** swap the most fatigued starters for the best `condition × OVR` bench option (goalkeepers excluded).

**Post-match condition:**

```
Normal:     next condition = 100 − minutes played × 0.06
Gegenpress: next condition = 100 − minutes played × 0.08
```

Clamped between 82% and 100%; unused players recover +12 condition (capped at 100%).

---

## 🏆 Competitions

### League

Standard win (3pts) / draw (1pt) / loss (0pts), sorted by **points → goal difference → goals scored**.

### Domestic Cups

Tied matches after 95 minutes go to a 50/50 shootout calculation (no extra time, individual takers, or GK ability modeled yet).

### Champions League

- 36-team league phase, 8 matches per club
- **1–8:** direct Round of 16 · **9–24:** knockout playoff · **25–36:** eliminated
- Playoff → R16 → QF → SF are two-legged (aggregate score; 50/50 shootout if tied)
- Final is a single match (same shootout rule if tied)

---

## 💼 Club Management

### Transfers & Loans

| Rule | Value |
|---|---:|
| Max squad size | 30 |
| Max incoming loans | 3 |
| Buying price | 100% of value |
| Selling income | 90% of value |
| Loan fee | 10% of value |

Loaned players return to their owner at season end and can't be re-sold or re-loaned. Selling clubs must keep ≥16 players, a goalkeeper, and a usable starting XI. Market opens preseason and at the midpoint window.

### Player Development (end of season)

- Age +1 for everyone
- Under-24s with 10+ appearances: **+1 OVR**
- 32+: **−1 OVR**
- Ratings clamped to 45–95
- Value: **+8%** on a rise, **−10%** on a drop
- Condition resets to 100%, appearances reset to 0

### New-Season Budget

```
Grant = £10m + ((clubs in league − final rank + 1) × £2m)
```

For a 20-team league: champion £50m · 10th £32m · 20th £12m.

---

## 🎲 Why a Strong Team Can Still Lose

The engine is deliberately probabilistic. A better squad creates more shots *and* higher-quality chances — but doesn't guarantee results. Losses can come from random finishing, an opponent overperforming low xG, away disadvantage, formation/tactical mismatches, poor condition, red cards, misused positions, an exposed high line, or just a bad run of results. Calibration keeps elite squads consistently strong over a season, but the occasional off night is part of the design.

---

## 🚧 Known Limitations / Roadmap

- [ ] Connect fouls → cards → penalties/free kicks into one causal event chain
- [ ] Implement yellow cards in the live simulator
- [ ] Model extra time and individual penalty-shootout takers
- [ ] Use the (currently unused) tactic "variance" value
- [ ] Narrow the AI-vs-human condition gap (AI enters at ~100%, your squad carries workload)

---

## 🛠️ Tech & Saves

- Local autosave with JSON export/import
- Save validation and automatic migration of older save formats

---

## 📄 License

Add your license here.
