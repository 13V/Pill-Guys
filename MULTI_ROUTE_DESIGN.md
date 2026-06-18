# Multi-Route Design Guide (Fall-Guys-style branches)

Goal: every level should offer **at least two distinct routes to the finish** — a
SAFE/standard lane and a RISKY lane (harder, but a shortcut and/or a bigger coin
reward) — that **split** from a hub and **rejoin** at a later hub. This makes the
levels replayable and lets players choose their challenge, like Fall Guys.

## Controls & camera (important)
- **Forward = +X** (D / Right arrow). **Strafe between lanes = Z** (W = toward −Z / "far" lane, S = toward +Z / "near" lane). Camera is behind (+Z) and above, so lanes at **z = −3 (far)** and **z = +3 (near)** both read clearly (see `web/routes_spike.png` / `web/previews/routes.js` — a worked example).
- The player runs at z=0 by default; to take a side lane they strafe to z≈±3.

## How to author a branch (in a level's `path.js` / `hazards.js` / `pickups.js`)
Use parallel decks at offset `cz`/`z`, with a committed gap between them:
- **Entry hub**: a `platform` w6 (spans z−3..+3) so the player can position onto either lane.
- **Two lanes** over the same X range: `strip {z:-3, w:2}` (far) and `strip {z:3, w:2}` (near). The middle (z −2..+2) is intentionally empty so you must commit to one.
- **Rejoin hub**: a `platform` w6 at cz0 where both lanes land.
- A small **forward gap** (~2u in X) from the hub to the lanes makes entering a lane a deliberate hop.
- Put hazards/coins per lane via `cz`/`z`: e.g. SAFE lane (z−3) clear with a normal coin; RISKY lane (z+3) a `spikes` gauntlet or a gap, rewarded with an extra/!big coin. A lethal `sawblade {lethal:true}` belongs on a side lane only.

Keep every route within the movement limits in `LEVELS_DESIGN.md` (jump reach ~5u, full-jump rise ~3u, gaps ≤5u/comfortable ≤4u, spike gauntlets size 4, conveyor +4). Each lane must be **independently completable**.

You can have several branch sections per level; between them keep the central spine. Longer/later levels should have more (and harder) branches.

## Verify BOTH routes reach the finish
From `web/`, the lane-aware autoplay drives a chosen lane to the finish:
```bash
LANE=-3 RENDER_PORT=5198 node traverse.mjs   # far/safe lane
LANE=3  RENDER_PORT=5198 node traverse.mjs   # near/risky lane
LANE=0  RENDER_PORT=5198 node traverse.mjs   # central spine (if present)
```
It strafes to the lane, then runs + jumps that lane's gaps/gauntlets and reports REACHED FINISH. Also drive it yourself with Puppeteer (hold Right + Up/Down) to sanity-check feel. Both side routes must finish with ~0 deaths.
