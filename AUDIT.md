# Pill-Guys — FUN + ROUTE Audit (5 multi-route levels)

**Audit lead deliverable.** Holistic judgement of whether the final, branched
levels are FUN, whether the SAFE vs RISKY routes are MEANINGFUL, and whether the
L1→L5 progression is sound. All claims below are backed by the level data plus
live runs on port 5206 (`leveltest.mjs` ×5, `traverse.mjs` ×10, both lanes each).

---

## TL;DR verdict

- **Are they fun?** *Mostly yes.* Each level has a clear identity (conveyor intro,
  saw causeway, furnace gaps, fracture bridges, reactor finale), the art is
  on-spec, and the beats vary. But pacing sags in the long middle levels and the
  branches add length faster than they add *interest*.
- **Are the routes meaningful?** *Structurally yes, experientially weak.* Every
  level has ≥2 verified routes to the finish, but on most branches the RISKY lane
  is the **same length** as the SAFE lane and pays only **+1 coin**, and three of
  the "lethal" saws are **off-lane flanks** a normal line never touches. The risk
  is real on only a few lanes (L3-B2, L5-B2, L5-B3). Reward rarely justifies risk.
- **Is the progression sound?** *Difficulty yes, length NO.* Difficulty ramps
  sensibly by lethal-hazard count and branch count — **except L3 is harder than
  L4** (4 lethal sensors vs 2), a local inversion. Length is **not monotonic**:
  `41 → 46 → 90 → 90 → 99`. Adding branches blew the lengths past spec and
  **L3 now ties L4 at 90u**, with a jarring +44u cliff from L2→L3.

---

## Measured data (authoritative)

Length = `world.lengthX` (maxX−minX over deck edges), confirmed by `leveltest.mjs`.
Coins = `world.coins.length`. "Lethal sensors" = spikes + spikeblock + sawtrap +
saws/rollers flagged `lethal`. Coin split by lane z (far/safe z<−1, center z≈0,
near/risky z>+1).

| Lvl | Name | Spec len | **Actual len** | Spec coins | **Coins** | Branches | **Lethal sensors** | Coins safe/center/risky |
|----|------|---------|---------------|-----------|-----------|----------|--------------------|-------------------------|
| 1 | Assembly Line     | ~28 | **41** (+46%) | 8   | **8**  | 1 | **1** | 1 / 5 / 2 |
| 2 | Coolant Causeway  | ~40 | **46**        | ~10 | **12** | 2 | **2** | 3 / 3 / 6 |
| 3 | Furnace Gaps      | ~55 | **90** (+64%) | ~12 | **14** | 2 | **4** | 3 / 7 / 4 |
| 4 | Fracture Foundry  | ~72 | **90** (+25%) | ~14 | **14** | 2 | **2** | 2 / 8 / 4 |
| 5 | The Last Reactor  | ~92 | **99**        | ~16 | **18** | 3 | **6** | 4 / 5 / 9 |

**Live traversal (port 5206) — both lanes reach finish, 0 deaths everywhere:**

```
L1  z=-3 ✓ 0 deaths | z=+3 ✓ 0 deaths
L2  z=-3 ✓ 0 deaths | z=+3 ✓ 0 deaths
L3  z=-3 ✓ 0 deaths | z=+3 ✓ 0 deaths
L4  z=-3 ✓ 0 deaths | z=+3 ✓ 0 deaths
L5  z=-3 ✓ 0 deaths | z=+3 ✓ 0 deaths
leveltest: all 5 levels 4/4 (spawn grounded, finish wins, coins present, no errors)
```

The "verified traversable on both lanes, 0 deaths" claim **holds**.

---

## 1. Progression analysis (the headline problem)

### Length is not monotonic — branches broke the curve
```
L1   41u  ████████████████
L2   46u  ██████████████████
L3   90u  ████████████████████████████████████
L4   90u  ████████████████████████████████████   <- TIES L3
L5   99u  ███████████████████████████████████████
```
- **L2→L3 is a +44u cliff** (46→90, nearly double). The intended ramp was 40→55
  (+15u). Branches roughly doubled L3's footprint.
- **L3 ties L4 at 90u.** The spec wanted 55 vs 72 (L4 ~30% longer). They are now
  identical length, so L4 does not *feel* longer than L3 — it feels the same length
  but slightly easier (see below), which reads as a step *backwards*.
- **L1 already overshoots** its ~28u target by 46% (41u), eating the low end of the
  curve and compressing the gap to L2 (41→46 is only +5u — L1 and L2 feel like the
  same size).
- Net: the *set* still trends upward overall (41 → 99), but the interior ordering
  L1≈L2 ‹‹ L3≈L4 ‹ L5 has two flat spots and no clean monotonic gradient.

### Difficulty mostly ramps — but L3 > L4 (inversion)
Lethal-sensor count: **1 → 2 → 4 → 2 → 6**. L3 carries **4** lethal sensors (a
spike gauntlet, a lethal pit-saw, and **two** center spikeblocks) while L4 carries
only **2** (one gauntlet + one off-lane flank saw). Combined with equal length,
**L3 plays as hard as or harder than L4.** L4's signature "tight w2 precision
bridges" are real, but its lethal pressure is lower than L3's. The curve dips at L4.

Branch count ramps cleanly (1, 2, 2, 2, 3) and L5 is correctly the most
hazard-dense and longest — the finale lands.

**Verdict:** difficulty is *directionally* right but has a mid-curve inversion at
L3/L4; length is not a usable difficulty signal anymore and needs rebalancing.

---

## 2. Route meaningfulness (SAFE vs RISKY)

Every level passes the structural bar: an entry hub (w6, z−3..+3), two lanes with
an empty middle (a w2 strip's collider is only 2u wide, so the z−2..+2 center is
genuinely a void — you *must* commit), and a rejoin hub. Good. The problem is the
**risk/reward economics**:

**A. RISKY is almost never a shortcut.** In L1, L3, L4, L5-B1, L5-B3 the risky and
safe lanes span the *exact same X range* (e.g. L1 both strips x19..29; L4-B1 both
x26..36). So the risky lane costs you danger for **no time saved** — the classic
Fall-Guys hook (the risky lane is *faster*) is missing. Only the gap lanes (L2-B2,
L3-B2, L4-B2, L5-B2) differ at all, and there the risky side is actually *longer*
(it breaks for a 4u gap vs a continuous safe strip).

**B. The reward is thin.** Most branches pay the risky lane **+1 coin** over the
safe lane (safe 1, risky 2). At ~1 coin per spike gauntlet, that is a weak
incentive — a rational player takes SAFE every time. Only L2 (safe 1–2 / risky 3)
and L5 (safe 1 / risky 3) pay enough to tempt. With no shortcut *and* a small coin
delta, the dominant strategy on L1/L3/L4 is "always go safe," which defeats the
point of the split.

**C. Three "lethal" saws aren't on the path.** L2-B2, L4-B2, and L5-B2 place the
lethal sawblade at `cz +4.6` (death box z 4.1..5.1), deliberately *off* the walked
z=3 line. That makes them safe-by-design (good for "0 deaths"), but it also means
the risky lane's headline hazard never actually threatens a careful player — it
only punishes a drift. So the "risk" on those lanes is largely cosmetic. The
genuinely risky lanes — where the lethal hazard sits *on* the line you must cross —
are **L3-B2** (saw in the pit at cx74) and **L5-B3** (gauntlet + flank over the
landing). Those are the model the others should follow.

**D. Signposting is decent but one-sided.** Each split has a yellow arrow pointing
down the SAFE lane and cones on the RISKY hazards — clear enough. But nothing
signals *why* you'd take risky (no visible "big coin" or shortcut arrow), so the
choice reads as "easy vs pointless-hard" rather than "safe vs rewarding."

**Verdict:** routes are *present and verified* but not yet *meaningful*. To matter,
risky lanes need either a real shortcut (skip a hub / shorter X) or a real payout
(2–3× coins, or a unique big coin), and their hazards should sit on the line.

---

## 3. Per-level scorecards

### L1 — "Assembly Line"  ·  41u · 8 coins · 1 branch · 1 lethal
**Fun 7/10 · Route 5/10.** A clean, readable intro: conveyor → split → spring to
tower. The single gauntlet-vs-clear split is a gentle, well-signposted teaching
moment. But at 41u it's already 46% over its target and barely shorter than L2, and
the risky lane is same-length for just +1 coin.
- Trim to ~30–34u (shorten the x19..29 lanes or the conveyor) to restore the easy
  end of the curve and open a gap to L2.
- Make the teaching split *teach the hook*: give the risky lane a visible **2-coin
  arc + a small shortcut** (end its rejoin 2–3u earlier) so players learn "risky =
  faster/richer," not just "risky = harder."
- The decorative sawblade at the rejoin hub (cx32, cz0) spins menacingly right
  where every lane funnels through; consider nudging it off-center so it doesn't
  read as a hazard on the only path.

### L2 — "Coolant Causeway"  ·  46u · 12 coins · 2 branches · 2 lethal
**Fun 7/10 · Route 6/10.** Best risk/reward economy of the early levels (risky
lanes pay 3 vs 1–2). Two distinct beats — spike gauntlet then narrow precision
walk — with a saw-hub midpoint. Identity is strong (the level2.png hero shot shows
the gauntlet, twin saws + pipe arch, and gantry).
- The B2 lethal saw (cz+4.6) is off-lane, so the "risky narrow walk + 4u gap" lane's
  danger is mostly the gap. Move the saw onto the gap-crossing line (like L3-B2) so
  the risk is felt, or lean into the gap as the real threat and drop the flank.
- Only +5u longer than L1 — if L1 is trimmed, L2 is fine; if not, stretch B2 a touch
  so L2 clearly out-sizes L1.
- Add one mid-level "downtime" beat (a calm hub coin) between the two gauntlets;
  right now it's gauntlet-hub-gauntlet with little breather.

### L3 — "Furnace Gaps"  ·  90u · 14 coins · 2 branches · **4 lethal**
**Fun 6/10 · Route 7/10.** Mechanically the richest mid-level: real early jump-gaps,
a conveyor, a raised (top 8) section reached by spring, center-blocking spikeblocks
that *force* lane commitment (the best use of a hazard to make routes matter), and
L3-B2's lethal pit-saw is a genuinely risky line. **But it's 90u — 64% over spec and
tied with L4** — and with 4 lethal sensors it's arguably harder than L4, inverting
the curve. It's doing too much for a level-3 slot.
- **Shorten it.** Target ~60–66u: the early gap chain (A→B→C, x0..17) plus two
  branches plus conveyor plus raised section is a lot; cut one early gap or compress
  the lane X-ranges (26..36 → 26..33).
- It's currently the difficulty peak before the finale. Either accept that and
  **swap difficulty with L4** (make L4 the harder one), or dial L3 back (drop one
  spikeblock, shorten the lethal-pit lane) so the L3<L4<L5 ramp is restored.
- Reward parity: risky lanes pay only +1 coin (safe 1 / risky 2) despite carrying
  the level's scariest hazard (the pit saw). Bump risky to 3 coins to pay for it.

### L4 — "Fracture Foundry"  ·  90u · 14 coins · 2 branches · 2 lethal
**Fun 6/10 · Route 5/10.** Good w2 precision-bridge identity and a belt-assisted
gap, but it's the **weak link**: same length as L3, *fewer* lethal hazards, and the
same coin count (14) — so it feels like a side-grade of L3, not a step up. Both
branches are same-length-for-+1-coin, and B2's lethal saw is the off-lane flank
again, so neither route is genuinely risky.
- **Make L4 clearly harder than L3** (it's the #2 slot before the finale): add a
  third branch or a lethal hazard *on* a lane (e.g. a lethal roller in one lane), or
  tighten more bridges to w2 over real gaps.
- **`level4.png` renders blank** under `leveltest.mjs` even though all 4 structural
  checks PASS and both lanes traverse — a GPU/settle race in the headless shot (the
  dedicated `shot.mjs`, which adds a 2s settle, renders correctly; L5's shot in the
  same batch shows geometry). Not a gameplay bug, but regenerate the hero shot with
  `LEVEL=4 RENDER_PORT=5206 node shot.mjs` before shipping marketing images.
- Differentiate from L3: lean into "horizontal precision" (long w2 bridges) vs L3's
  "vertical + gaps" so the two 90u levels don't feel interchangeable.

### L5 — "The Last Reactor"  ·  99u · 18 coins · 3 branches · **6 lethal**
**Fun 8/10 · Route 7/10.** The finale lands: longest, most hazard-dense, 3 branches,
two conveyor-fed gauntlets, a "two hard ways" double-bridge branch, a center
spikeblock thread, and the victory tower. L5-B3 (gauntlet + lethal flank over the
landing) is the single best risk/reward line in the game — "the reward *is* the
risk." Coin payout (risky lanes 3 vs safe 1) is the most tempting of the set.
- B2 is billed "TWO HARD WAYS" but its lethal saw (cz+4.6) is again off-lane, so the
  safe w2/3u-gap side and the risky w2/4u-gap side differ mainly by 1u of gap — make
  them feel like two genuinely different challenges (e.g. safe = longer but flat,
  risky = shorter with the saw actually over the gap).
- It's only +9u over L4 despite being the finale; since L3/L4 are oversized, this is
  fine *relatively*, but if L3/L4 are trimmed, push L5 toward ~105–110u so the finale
  is unmistakably the biggest.
- The `level5.png` hero shot captured a stale "FINISH!" overlay (the screenshot ran
  after the win-trigger test) — regenerate with `shot.mjs` for a clean image.

---

## 4. Top 5 prioritized fixes (whole set)

1. **Rebalance length so it's monotonic with headroom.** Target roughly
   **L1 ~32 · L2 ~44 · L3 ~62 · L4 ~78 · L5 ~100u.** Concretely: trim L1's lanes/
   conveyor (−8u), and **cut L3 from 90→~62u** (drop one early gap + compress lane
   X-ranges). This single change fixes the +44u L2→L3 cliff *and* the L3=L4 tie.
2. **Fix the L3>L4 difficulty inversion.** Either reduce L3's lethal load (drop one
   center spikeblock, shorten the lethal-pit lane) or raise L4's (add a third branch
   / a lethal hazard *on* a lane). Goal: lethal-sensor ramp `1 ‹ 2 ‹ 3 ‹ 4 ‹ 6`
   with L3 < L4 < L5.
3. **Make RISKY lanes worth it — add a real edge.** Give each risky lane *either* a
   shortcut (end its rejoin 2–4u earlier than the safe lane, so it's faster) *or* a
   real payout (risky = 3× safe coins, or one unique "big coin"). Today most pay +1
   coin for the same distance, so SAFE strictly dominates.
4. **Put the headline hazard on the line.** The off-lane flank saws in L2-B2, L4-B2,
   L5-B2 (all `cz+4.6`, death box clear of z=3) never threaten a careful player.
   Move at least one per level *onto* the crossing line (the L3-B2 pit-saw and
   L5-B3 landing-flank are the right model) so "risky" is actually risky.
5. **Signpost the *incentive*, not just the danger.** Add a visible cue down each
   RISKY lane (a coin arc you can see from the hub, or a "shortcut"/big-coin arrow)
   so the split reads as "safe vs rewarding," not "easy vs pointlessly hard." Also
   regenerate `level4.png` (blank) and `level5.png` (stale FINISH overlay) via
   `shot.mjs` before using them anywhere.

---

## Appendix — how this was measured (port 5206 only)

```bash
# Structural + length/coins, per level (saves levelN.png):
LEVEL=N RENDER_PORT=5206 node leveltest.mjs        # all 5 -> 4/4 PASS

# Lane-aware autoplay to the finish, both routes:
LEVEL=N LANE=-3 RENDER_PORT=5206 node traverse.mjs # SAFE/far  -> REACHED, 0 deaths
LEVEL=N LANE=3  RENDER_PORT=5206 node traverse.mjs # RISKY/near -> REACHED, 0 deaths
```
Per-lane deck coverage/gaps and coin-by-lane splits were also computed directly from
the level descriptors (`decks`/`hazards`/`coins`) to corroborate the live runs.

*Note on length metric:* `lengthX = maxX − minX` includes the finish-tower X-extent
and the spawn hub, so absolute values are ~3–5u higher than "playable run distance,"
but the comparison across levels is apples-to-apples.
