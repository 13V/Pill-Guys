// Level 2 PATH — "Coolant Causeway" (2nd-easiest, ~44u). Decks/spawn/finish skeleton.
//
// MULTI-ROUTE (Fall-Guys split, see ../../../MULTI_ROUTE_DESIGN.md): the run is
// two parallel lanes joined by shared w6 hubs, so you commit to a side and rejoin:
//   - SAFE lane at z=-3 (far): clear/continuous, plain 8 u/s, ONE coin per branch.
//   - RISKY lane at z=+3 (near): a real ON-THE-LINE challenge + THREE coins (3x),
//     and — crucially — a genuine SHORTCUT: FORWARD CONVEYORS (cz:3, w:4) push +X so
//     the risky runner moves ~12 u/s, reaching the finish CLEARLY FASTER than SAFE.
//     The belts (z1..5) sit only on the near lane and never touch the z=-3 SAFE lane,
//     so the time-save is pure SPEED while the hazards stay (belts before/after them).
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
    { kind: 'platform', cx: 3,  cz: 0, w: 6, d: 6, rails: true, color: 'green' },   // A spawn hub        x: 0..6   (entry hub, branch 1; cool teal coolant start)
    { kind: 'conveyor', cx: 5, cz: 3, len: 4, w: 4, color: 'red' },               // RISKY lead-in belt x: 3..7   (cz3 near lane; WARM = risky; boosts the risky runner across hub A toward branch 1)

    // ---- BRANCH 1 (x 8..21): spike-gauntlet split. 2u hop off hub A onto a lane. ----
    // SAFE far lane is a plain (slow, 8 u/s) strip; the RISKY near lane is BOOSTED by
    // FORWARD CONVEYORS (cz:3, w:4 -> spans z1..5, never touches the z=-3 SAFE lane):
    // a belt pushes +X so the risky runner moves ~12 u/s, a real Fall-Guys time-save.
    // The size-4 gauntlet (hazards.js @cx14, x12..16) stays the risk: belt BEFORE it
    // (run-up, x8..12) and AFTER it (landing, x16..21), with the lethal x12..16 in
    // between still jumped. The 2u commit hops (x6..8) are preserved (belts start x8).
    { kind: 'strip', x0: 8, x1: 21, z: -3, w: 2, color: 'blue' },                  // B1 SAFE (far)      x: 8..21  (COOL blue = safe; clear, plain 8 u/s)
    { kind: 'conveyor', cx: 10,   cz: 3, len: 4, w: 4, color: 'red' },            // B1 RISKY run-up belt  x: 8..12  (WARM red = risky; +X boost into the gauntlet leap)
    { kind: 'conveyor', cx: 18.5, cz: 3, len: 5, w: 4, color: 'yellow' },            // B1 RISKY landing belt x:16..21  (WARM yellow = risky; +X boost after the gauntlet -> hub C)

    { kind: 'platform', cx: 24, cz: 0, w: 6, d: 6, rails: true, color: 'blue' },   // C saw hub          x:21..27  (cool blue mid-hub; rejoin 1 + decor saws; entry hub branch 2)
    { kind: 'conveyor', cx: 24, cz: 3, len: 8, w: 4, color: 'red' },              // RISKY hub-C boost  x:20..28  (WARM red = risky; cz3 near lane only; carries the risky runner across the rejoin hub at ~12 u/s)

    // ---- BRANCH 2 (x 29..37): the narrow (w2) precision stretch, split. 2u hop. ----
    // Again the SAFE far lane is a plain strip; the RISKY near lane gets a FORWARD
    // CONVEYOR run-up (x29..33) so the leap into the 4u jump-gap is taken at ~12 u/s.
    { kind: 'strip', x0: 29, x1: 37, z: -3, w: 2, color: 'green' },                 // D2 SAFE (far)      x:29..37  (COOL green = safe; clear continuous precision walk, plain 8 u/s)
    { kind: 'conveyor', cx: 30, cz: 3, len: 6, w: 4, color: 'yellow' },              // D2 RISKY run-up belt  x:27..33  (WARM yellow = risky; +X boost from hub C across the run-up into the jump-gap leap)
    // ...4u JUMP-GAP x33..37 (lethal saw in the pit, see hazards.js); land on hub E.

    { kind: 'platform', cx: 40, cz: 0, w: 6, d: 6, rails: true, color: 'green' },   // E rejoin hub       x:37..43  (cool green return hub; both lanes land; per-lane springs)
    { kind: 'finish', cx: 42, cz: 0, w: 4, d: 6, top: 10, color: 'yellow' },         // F finish           x:40..44  (celebratory gold; d6 -> win sensor spans z-3..+3)
  ],
};
