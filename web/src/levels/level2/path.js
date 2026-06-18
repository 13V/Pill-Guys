// Level 2 PATH — "Coolant Causeway" (2nd-easiest, ~44u). Decks/spawn/finish skeleton.
//
// MULTI-ROUTE (Fall-Guys split, see ../../../MULTI_ROUTE_DESIGN.md): the run is
// two parallel lanes joined by shared w6 hubs, so you commit to a side and rejoin:
//   - SAFE lane at z=-3 (far): clear/continuous, ONE coin per branch.
//   - RISKY lane at z=+3 (near): a real ON-THE-LINE challenge + THREE coins (3x).
// The middle (z -2..+2) of each branch is intentionally EMPTY so you must choose a
// side; both lanes are independently completable to the same finish.
//
// Exactly TWO on-the-line challenges (clearly harder than L1's one, easier than L3):
//   * BRANCH 1 RISKY: a size-4 spike gauntlet you jump over (land x8..12 & x16..21).
//   * BRANCH 2 RISKY: a 4u JUMP-GAP (x33..37) with a LETHAL sawblade in the pit at
//     cz=3 — the leap that clears the gap clears the saw (the L3-B2 model). The SAFE
//     far lane is a clear continuous strip. (The old off-line cz+4.6 saw — which the
//     audit found never threatened the walked line — is GONE; the risk is now ON the
//     line.) A mistimed jump dies on the saw, so the danger is finally FELT.
//
// Identity preserved: a decor SAW HUB midpoint, a NARROW (w2) precision stretch
// (branch 2), and TWO gauntlets (spike gauntlet + jump-gap). Length x:0..44 ≈ 44u.
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
// Movement limits (see LEVELS_DESIGN.md): jump reach ~5u, comfy gaps <=4u, step-ups
// <=3u, deck widths >=2. Shared hubs are w6 (span z-3..+3) so both lanes pass through.
export default {
  name: 'Coolant Causeway',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3,  cz: 0, w: 6, d: 6, rails: true },   // A spawn hub        x: 0..6   (entry hub, branch 1)

    // ---- BRANCH 1 (x 8..21): spike-gauntlet split. 2u hop off hub A onto a lane. ----
    { kind: 'strip', x0: 8, x1: 21, z: -3, w: 2 },                  // B1 SAFE (far)      x: 8..21  (clear)
    { kind: 'strip', x0: 8, x1: 21, z:  3, w: 2 },                  // B1 RISKY (near)    x: 8..21  (gauntlet #1 @cx14; land x8..12 & x16..21)

    { kind: 'platform', cx: 24, cz: 0, w: 6, d: 6, rails: true },   // C saw hub          x:21..27  (rejoin 1 + decor saws; entry hub branch 2)

    // ---- BRANCH 2 (x 29..37): the narrow (w2) precision stretch, split. 2u hop. ----
    { kind: 'strip', x0: 29, x1: 37, z: -3, w: 2 },                 // D2 SAFE (far)      x:29..37  (clear continuous precision walk)
    { kind: 'strip', x0: 29, x1: 33, z:  3, w: 2 },                 // D2 RISKY pre-gap   x:29..33  (run-up to the jump-gap)
    // ...4u JUMP-GAP x33..37 (lethal saw in the pit, see hazards.js); land on hub E.

    { kind: 'platform', cx: 40, cz: 0, w: 6, d: 6, rails: true },   // E rejoin hub       x:37..43  (both lanes land; per-lane springs)
    { kind: 'finish', cx: 42, cz: 0, w: 4, d: 6, top: 10 },         // F finish           x:40..44  (d6 -> win sensor spans z-3..+3)
  ],
};
