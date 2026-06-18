// Level 5 PATH — "The Last Reactor" (FINALE, hardest, ~97u). Decks/spawn/finish.
//
// MULTI-ROUTE (Fall-Guys splits, see ../../../MULTI_ROUTE_DESIGN.md): as the
// FINALE this level has the MOST route choice — THREE branch sections, each a
// SAFE lane (far, z=-3) vs a RISKY/REWARD lane (near, z=+3) that split from a
// w6 hub and rejoin at the next w6 hub. The middle (z -2..+2) of every branch is
// intentionally EMPTY so you must COMMIT to a side; both lanes independently reach
// the finish. A ~2u forward gap off each hub makes entering a lane a deliberate hop.
//   Branch 1 (x23..33): conveyor-fed split — SAFE clear strip vs RISKY size-4
//     spike gauntlet (belt-pressured). Biggest coin payout on the risky line.
//   Branch 2 (x41..52): "TWO HARD WAYS" — SAFE is a tight w2 bridge over a 3u gap;
//     RISKY is a w2 bridge over a 4u gap with a LETHAL saw flanking off-lane. Both
//     lanes are a real challenge; the risky one pays more.
//   Branch 3 (x74..84): conveyor-into-gauntlet finale split — SAFE clear strip vs
//     RISKY size-4 gauntlet + LETHAL saw flank. The hardest fair line, top reward.
//
// FINALE IDENTITY PRESERVED: conveyor-fed spike gauntlets (M1 belt->B1, M3 belt->B3),
// the w2 gap-bridge chain (branch 2), the lethal-saw threat, the spikeblock thread
// (hub D, two blocks at cz±1.8), the spring climb + victory tower (deck F -> finish).
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
// Limits (LEVELS_DESIGN.md): jump reach ~5u, gaps <=5u (RISKY maxes at 4u here),
// step-ups <=3u, gauntlet size 4, widths >=2. Shared hubs are w6 (span z-3..+3).
export default {
  name: 'The Last Reactor',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },   // A start hub        x: 0..6
    { kind: 'conveyor', cx: 11, cz: 0, len: 8, w: 6 },             // M1 belt (+X), w6 spans both lanes  x: 7..15

    // ---- BRANCH 1 (x23..33): conveyor-fed gauntlet split. 2u hop off hub B. ----
    { kind: 'platform', cx: 18, cz: 0, w: 6, d: 6, rails: true },  // B split hub        x:15..21  (belt feeds in; rejoin? no, entry)
    { kind: 'strip', x0: 23, x1: 33, z: -3, w: 2 },                // B1 SAFE (far)      x:23..33  (clear, slower)
    { kind: 'strip', x0: 23, x1: 33, z:  3, w: 2 },                // B1 RISKY (near)    x:23..33  (size-4 gauntlet cx27)

    { kind: 'platform', cx: 36, cz: 0, w: 6, d: 6, rails: true },  // C rejoin hub       x:33..39  (rejoin 1 + saw-hub pipe arch; entry branch 2)

    // ---- BRANCH 2 (x41..52): TWO HARD WAYS — w2 bridges, both interesting. ----
    { kind: 'strip', x0: 41, x1: 46, z: -3, w: 2 },                // B2 SAFE seg1 (far) x:41..46  (tight w2)
    { kind: 'strip', x0: 49, x1: 52, z: -3, w: 2 },                // B2 SAFE seg2 (far) x:49..52  (after a 3u gap x46..49)
    { kind: 'strip', x0: 41, x1: 46, z:  3, w: 2 },                // B2 RISKY seg1 (near) x:41..46 (lethal saw flanks at cx48)
    { kind: 'strip', x0: 50, x1: 52, z:  3, w: 2 },                // B2 RISKY seg2 (near) x:50..52 (after a 4u gap x46..50)

    { kind: 'platform', cx: 55, cz: 0, w: 6, d: 6, rails: true },  // D spikeblock hub   x:52..58  (rejoin 2 + center thread; entry M3)
    { kind: 'conveyor', cx: 62, cz: 0, len: 8, w: 6 },             // M3 belt (+X), w6 spans both lanes  x:58..66

    // ---- BRANCH 3 (x74..84): conveyor-into-gauntlet FINALE split (hardest). ----
    { kind: 'platform', cx: 69, cz: 0, w: 6, d: 6, rails: true },  // E split hub        x:66..72  (belt feeds in)
    { kind: 'strip', x0: 74, x1: 84, z: -3, w: 2 },                // B3 SAFE (far)      x:74..84  (clear, slower)
    { kind: 'strip', x0: 74, x1: 84, z:  3, w: 2 },                // B3 RISKY (near)    x:74..84  (size-4 gauntlet cx78 + lethal flank cx82)

    { kind: 'platform', cx: 87, cz: 0, w: 6, d: 6 },               // F spring deck      x:84..90  (rejoin 3; per-lane springs -> tower)
    { kind: 'finish', cx: 94, cz: 0, w: 6, d: 6, top: 10 },        // finish tower (w6 so every lane lands)  x:91..97
  ],
};
