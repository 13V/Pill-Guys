// Level 2 PATH — "Coolant Causeway" (low-med, ~46u). Decks/spawn/finish skeleton.
//
// MULTI-ROUTE (Fall-Guys split, see ../../../MULTI_ROUTE_DESIGN.md): the run is
// two parallel lanes joined by shared w6 hubs, so you commit to a side and rejoin:
//   - SAFE lane at z=-3 (far): clear/longer, normal coins.
//   - RISKY lane at z=+3 (near): gauntlet / 4u gap / a lethal flanking saw, more coins.
// The middle (z -2..+2) of each branch is intentionally EMPTY so you must choose a
// side; both lanes are independently completable to the same finish.
//
// Identity preserved: a saw hub (decor saws), a narrow (w2) precision stretch (now
// branch 2 — two w2 lanes), and two spike/gap gauntlets. Length x:0..46 ≈ 46u.
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
    { kind: 'strip', x0: 8, x1: 21, z:  3, w: 2 },                  // B1 RISKY (near)    x: 8..21  (gauntlet #1)

    { kind: 'platform', cx: 24, cz: 0, w: 6, d: 6, rails: true },   // C saw hub          x:21..27  (rejoin 1 + decor saws; entry hub branch 2)

    // ---- BRANCH 2 (x 29..40): the narrow (w2) precision stretch, split. 2u hop. ----
    { kind: 'strip', x0: 29, x1: 40, z: -3, w: 2 },                 // D2 SAFE (far)      x:29..40  (clear precision walk)
    { kind: 'strip', x0: 29, x1: 34, z:  3, w: 2 },                 // D2 RISKY part 1    x:29..34  (lethal saw flanks here)
    { kind: 'strip', x0: 38, x1: 40, z:  3, w: 2 },                 // D2 RISKY part 2    x:38..40  (after a 4u gap x34..38)

    { kind: 'platform', cx: 42, cz: 0, w: 6, d: 6, rails: true },   // E rejoin hub       x:39..45  (both lanes land; per-lane springs)
    { kind: 'finish', cx: 44, cz: 0, w: 4, d: 6, top: 10 },         // F finish           x:42..46  (d6 -> win sensor spans z-3..+3)
  ],
};
