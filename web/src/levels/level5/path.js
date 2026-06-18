// Level 5 PATH — "The Last Reactor" (FINALE, hardest, ~99u). Decks/spawn/finish.
//
// MULTI-ROUTE (Fall-Guys splits, see ../../../MULTI_ROUTE_DESIGN.md): as the
// FINALE this level has the MOST route choice — THREE branch sections, each a
// SAFE lane (far, z=-3) vs a RISKY/REWARD lane (near, z=+3) that split from a
// w6 hub and rejoin at the next w6 hub. The middle (z -2..+2) of every branch is
// intentionally EMPTY so you must COMMIT to a side; both lanes independently reach
// the finish. A ~2u forward gap off each hub makes entering a lane a deliberate hop.
//   Branch 1 (x23..34): conveyor-fed split — SAFE clear strip vs RISKY size-4
//     spike gauntlet (cx29, belt-pressured, 4u runway + 3u landing). Top coin payout.
//   Branch 2 (x42..53): "TWO HARD WAYS" — SAFE is a tight w2 bridge over a 3u gap;
//     RISKY is a w2 bridge over a 4u gap with a LETHAL saw flanking off-lane. Both
//     lanes are a real challenge; the risky one pays more.
//   Branch 3 (x75..86): conveyor-into-gauntlet finale split — SAFE clear strip vs
//     RISKY size-4 gauntlet (cx81) + LETHAL saw flank over the landing. Hardest line.
//
// FINALE IDENTITY PRESERVED: conveyor-fed spike gauntlets (M1 belt->B1, M3 belt->B3),
// the w2 gap-bridge chain (branch 2), the lethal-saw threat, the spikeblock thread
// (hub D, two blocks at cz±1.0 squeezing the center), the spring climb + victory
// tower (deck F -> finish).
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
// Limits (LEVELS_DESIGN.md): jump reach ~5u, gaps <=5u (RISKY maxes at 4u here),
// step-ups <=3u, gauntlet size 4 with >=4u runway, widths >=2. Hubs are w6 (z-3..+3).
export default {
  name: 'The Last Reactor',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },   // A start hub        x: 0..6
    { kind: 'conveyor', cx: 11, cz: 0, len: 8, w: 6 },             // M1 belt (+X), w6 spans both lanes  x: 7..15

    // ---- BRANCH 1 (x23..34): conveyor-fed gauntlet split. 2u hop off hub B. ----
    { kind: 'platform', cx: 18, cz: 0, w: 6, d: 6, rails: true },  // B split hub        x:15..21  (belt feeds in)
    { kind: 'strip', x0: 23, x1: 34, z: -3, w: 2 },                // B1 SAFE (far)      x:23..34  (clear, slower)
    { kind: 'strip', x0: 23, x1: 34, z:  3, w: 2 },                // B1 RISKY (near)    x:23..34  (gauntlet cx29: runway x23..27, land x31..34)

    { kind: 'platform', cx: 37, cz: 0, w: 6, d: 6, rails: true },  // C rejoin hub       x:34..40  (rejoin 1 + saw-hub pipe arch; entry branch 2)

    // ---- BRANCH 2 (x42..53): TWO HARD WAYS — w2 bridges, both interesting. ----
    { kind: 'strip', x0: 42, x1: 47, z: -3, w: 2 },                // B2 SAFE seg1 (far) x:42..47  (tight w2)
    { kind: 'strip', x0: 50, x1: 53, z: -3, w: 2 },                // B2 SAFE seg2 (far) x:50..53  (after a 3u gap x47..50)
    { kind: 'strip', x0: 42, x1: 47, z:  3, w: 2 },                // B2 RISKY seg1 (near) x:42..47 (lethal saw flanks at cx49)
    { kind: 'strip', x0: 51, x1: 53, z:  3, w: 2 },                // B2 RISKY seg2 (near) x:51..53 (after a 4u gap x47..51)

    { kind: 'platform', cx: 56, cz: 0, w: 6, d: 6, rails: true },  // D spikeblock hub   x:53..59  (rejoin 2 + center thread; entry M3)
    { kind: 'conveyor', cx: 63, cz: 0, len: 8, w: 6 },             // M3 belt (+X), w6 spans both lanes  x:59..67

    // ---- BRANCH 3 (x75..86): conveyor-into-gauntlet FINALE split (hardest). ----
    { kind: 'platform', cx: 70, cz: 0, w: 6, d: 6, rails: true },  // E split hub        x:67..73  (belt feeds in)
    { kind: 'strip', x0: 75, x1: 86, z: -3, w: 2 },                // B3 SAFE (far)      x:75..86  (clear, slower)
    { kind: 'strip', x0: 75, x1: 86, z:  3, w: 2 },                // B3 RISKY (near)    x:75..86  (gauntlet cx81 + lethal flank cx84)

    { kind: 'platform', cx: 89, cz: 0, w: 6, d: 6 },               // F spring deck      x:86..92  (rejoin 3; per-lane springs -> tower)
    { kind: 'finish', cx: 96, cz: 0, w: 6, d: 6, top: 10 },        // finish tower (w6 so every lane lands)  x:93..99
  ],
};
