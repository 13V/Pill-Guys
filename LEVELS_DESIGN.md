# Pill-Guys — Level Design Spec

Five levels, **progressively longer and harder**. Levels are **pure data**; the
generic builder (`web/src/levels/build.js`) turns a descriptor into visuals +
physics, and all effects (saw spin, conveyor belt, coins, particles, audio) work
automatically. Author levels to this spec; validate each with `leveltest.mjs`.

## How a level is authored

- **Level 1** (`web/src/levels/level1.js`) is the flat reference — read it first.
- **Levels 2–5** are split into parts so a team can build one in parallel:
  - `levelN/path.js` — `export default { name, deckTop:5, spawn, decks:[...] }` (the walkway + finish skeleton)
  - `levelN/hazards.js` — `export const hazards = [...]; export const springs = [...]`
  - `levelN/pickups.js` — `export const coins = [...]; export const decor = [...]`
  - `levelN/index.js` — assembles them (already wired; the Lead owns it + path.js)
- Coordinates: **+X is forward** (the level runs left→right); decks are centered on `cz` (z=0 is the center lane). 1 unit = 1 grid cell. Deck walking surface is `top` (default 5); the finish tower uses `top:10`.

## Available pieces (`kind`)

**decks:** `platform {cx,cz,w,d,top?,color?,rails?}` (w,d ∈ {2,4,6}) · `strip {x0,x1,z?,w?,top?,rails?}` (long auto-tiled walkway) · `conveyor {cx,cz,len,w?,top?}` (pushes +X) · `finish {cx,cz,w?,d?,top?=10}` (tower+gate+flag+chest+win sensor)
**hazards:** `spikes {cx,cz,size?}` (LETHAL jump-over) · `sawblade {cx,cz,top?,lethal?}` · `sawtrap {cx,cz,top?}` (lethal) · `spikeblock {cx,cz,dir?,top?}` (lethal) · `spikeroller {cx,cz,top?,lethal?}` · `cone {cx,cz}` (decor warning)
**springs:** `{cx,cz,top?}` (launches up ~to a higher deck) · **coins:** `{x,y,z}` · **decor:** `pipeArch {cx,color?}` · `portal {cx,cz,color?}` · `arrow {cx,cz,ry?}` · `gantry {cx,z?}`

## Movement constraints (design to these!)

Tuned feel: run speed **8 u/s**, full jump **rise ≈ 3 u**, **horizontal jump reach ≈ 5 u** (comfortable ≈ 4), gravity snappy, coyote + jump-buffer, variable jump (tap = short hop). Conveyor adds **+4 u/s**.

- **Gaps between decks:** ≤ **5 u** (comfortable ≤ 4). A gap = leaving space in X between consecutive decks; the player must jump it. Never exceed 5 or it's impossible.
- **Step-ups:** a higher deck must be ≤ **3 u** above the one before it (jumpable), or reached via a `spring`.
- **Deck widths:** `6` = hub/landing, `4` = normal, `2` = narrow/precision (min). Don't go below 2.
- **Spikes gauntlets:** lethal floor you jump over — keep each `spikes` run ≤ ~5 u long and put solid deck on both sides to land on.
- **Lethal saws/rollers:** decorative by default; set `lethal:true` ONLY when you place them off the center lane (e.g. `cz:±1.5` on a 6-wide deck) so there's a safe lane to pass. Never block the full width with an always-on lethal hazard.
- **Conveyors:** push +X. For difficulty, put a hazard/gap shortly after a conveyor so the push adds pressure (but keep it fair).
- Always end with a `finish` deck. Always have a sensible `spawn` on the first deck (`y = deckTop + 1.2`).

## The difficulty curve

| Lvl | Name (suggest) | Length | New this level | Hazard density | Coins |
|----|----|----|----|----|----|
| 1 | Assembly Line | ~28 u | conveyor, 1 spike gauntlet, spring, pipe arch | low | 8 |
| 2 | (yours) | ~40 u | longer strips, a narrow (w2) stretch, a lethal saw w/ safe lane, 2 gauntlets | low-med | ~10 |
| 3 | (yours) | ~55 u | real **gaps** to jump, `spikeblock` lanes, conveyor-into-hazard, 2 springs, a raised section | medium | ~12 |
| 4 | (yours) | ~72 u | tight w2 bridges over gaps, lethal rollers in lanes, vertical climb (stepped decks + springs) | med-high | ~14 |
| 5 | (yours) | ~92 u | finale — everything combined, tightest margins, long gauntlets, victory tower | high | ~16 |

Keep the **look** on-spec (blue play surface, grey machinery/legs, red/yellow/green accents); reuse `pipeArch`/`gantry`/`arrow`/`portal` decor and `rails:true` on hubs. Each level should be **clearly longer and harder** than the previous, but **always completable** within the movement constraints above.

## Validate every level

From `web/`:
```bash
LEVEL=2 RENDER_PORT=5188 node leveltest.mjs   # spawn grounded? finish wins? coins? no errors? + saves level2.png
```
Also drive it with Puppeteer (hold ArrowRight, jump the gaps, sample `window.__game.player.translation()`) to confirm the path is actually traversable — every gap clearable, no impossible jumps, no spot where the player is forced into a lethal sensor. Fix until it plays.
