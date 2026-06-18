// Level 4 PATH — "Fracture Foundry" (2nd hardest, ~78u). Built to R&D-verified
// limits (jump reach ~5u/comfy 4u, gaps onto strips <=5u, size-4 spike gauntlets,
// conveyor +4, spring->finish). Identity preserved: w2 PRECISION BRIDGES, a
// belt-assisted gap, and a spring-to-finish.
//
// DIFFICULTY (audit fix): L4 must clearly out-challenge L3. Where L3's risky lanes
// each carry ONE on-the-line threat, L4's risky lanes stack TWO real on-line
// challenges apiece, on tighter w2 bridges and over WIDER (4-4.5u) gaps than L3's 4u:
//   - BRANCH 1 RISKY: a size-4 SPIKE GAUNTLET *and* a 4u precision-bridge JUMP-GAP
//     off a w2 mid-landing (two back-to-back leaps; no breather).
//   - BRANCH 2 RISKY: a 4.5u belt-assisted JUMP-GAP with a LETHAL saw IN the pit
//     (the same leap that clears the gap clears the saw — the audit's required
//     conversion of the old off-line cz+4.6 flank into a real on-line risk).
// Plus a lethal center spikeblock on EACH rejoin hub (D, G) — like L3 — so you
// can't bowl down the middle and must commit to a lane. Net on-line lethal load:
// gauntlet + pit-saw + 2 spikeblocks (= L3's 4) but with extra on-line jump-gaps
// and tighter margins, so L4 plays harder than L3.
//
// MULTI-ROUTE (Fall-Guys splits, see ../../../MULTI_ROUTE_DESIGN.md). Two branch
// sections each fork into a SAFE lane (z=-3, far) and a RISKY/REWARD lane (z=+3,
// near), splitting + rejoining at shared w6 hubs; the middle (z -2..+2) is left
// EMPTY so you must commit to a side. Both lanes of every split reach the finish.
//   - BRANCH 1 (x 23..40): the w2 PRECISION BRIDGE, split. SAFE = clear continuous
//     w2 walk (1 coin). RISKY = run-up, size-4 spike gauntlet, a w2 mid-landing,
//     then a 4u jump-gap onto the bridge end (3 coins).
//   - BRANCH 2 (x 60..68): belt-assisted split off hub F. SAFE = clear continuous
//     w2 walk (1 coin). RISKY = a 4.5u belt-assisted jump-gap with a lethal saw in
//     the pit, landing on the rejoin hub (3 coins).
//
// IMPORTANT (builder): a `strip` only gets a 2u-wide (or 4u for w4) physics collider
// regardless of visual width, so SHARED spine that must be walkable across z-3..+3
// uses `platform` (full w x d collider) or the w6 `conveyor` (full-width collider).
// Branch LANES are w2 strips centered at z=±3 (collider covers their lane). Both
// lanes REJOIN at hub G, which carries one spring PER LANE (cz -3/0/+3) up the d6
// finish tower, so whichever side you committed to lands the win.
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
export default {
  name: 'Fracture Foundry',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 4,  cz: 0, w: 6, d: 6, rails: true },   // A start hub          x: 1..7
    { kind: 'platform', cx: 11, cz: 0, w: 6, d: 6, rails: true },   // B runway hub         x: 8..14  (gap 1; lead-in, commit to a side)

    { kind: 'platform', cx: 18, cz: 0, w: 6, d: 6, rails: true },   // C SPLIT HUB 1        x:15..21  (gap 1)

    // ---- BRANCH 1 (x 23..40): the w2 PRECISION BRIDGE, split. 2u hop onto a lane. ----
    { kind: 'strip', x0: 23, x1: 37, z: -3, w: 2 },                 // B1 SAFE  (far)       x:23..37  (clear continuous w2 walk)
    { kind: 'strip', x0: 23, x1: 27, z:  3, w: 2 },                 // B1 RISKY run-up      x:23..27  (land before the gauntlet)
    { kind: 'strip', x0: 31, x1: 34, z:  3, w: 2 },                 // B1 RISKY mid landing x:31..34  (gauntlet cx29 spans x27..31; land here)
    { kind: 'strip', x0: 38, x1: 40, z:  3, w: 2 },                 // B1 RISKY bridge end  x:38..40  (after a 4u jump-gap x34..38)

    { kind: 'platform', cx: 43, cz: 0, w: 6, d: 6, rails: true },   // D SAW HUB / REJOIN 1 x:40..46  (rejoin 1; decor saw + center spikeblock)
    { kind: 'conveyor', cx: 50, cz: 0, len: 8, w: 6 },              // E conveyor (+X), w6  x:46..54  (flush off D; belt spans z-3..+3)

    { kind: 'platform', cx: 57, cz: 0, w: 6, d: 6, rails: true },   // F SPLIT HUB 2        x:54..60  (flush off belt; belt-assisted)

    // ---- BRANCH 2 (x 60..68): belt-assisted split, lethal saw IN the pit. ----
    { kind: 'strip', x0: 60, x1: 68, z: -3, w: 2 },                 // B2 SAFE  (far)       x:60..68  (clear continuous w2 walk; flush off F)
    { kind: 'strip', x0: 60, x1: 63.5, z: 3, w: 2 },                // B2 RISKY run-up      x:60..63.5 (belt-assisted; flush off F)

    { kind: 'platform', cx: 71, cz: 0, w: 6, d: 6, rails: true },   // G REJOIN HUB 2       x:68..74  (both lanes land; 4.5u risky gap x63.5..68; center spikeblock; per-lane springs)
    { kind: 'finish',   cx: 77, cz: 0, w: 6, d: 6, top: 10 },       // I finish             x:74..80  (spring -> finish; d6 spans lanes)
  ],
};
