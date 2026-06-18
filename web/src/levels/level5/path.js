// Level 5 PATH — "The Last Reactor" (FINALE, hardest, ~103u). Decks/spawn/finish.
//
// MULTI-ROUTE (Fall-Guys splits, see ../../../MULTI_ROUTE_DESIGN.md): as the
// FINALE this level has the MOST route choice — THREE branch sections, each a
// SAFE lane (far, z=-3) vs a RISKY/REWARD lane (near, z=+3) that split from a
// w6 hub and rejoin at the next w6 hub. The middle (z -2..+2) of every branch is
// intentionally EMPTY so you must COMMIT to a side; both lanes independently reach
// the finish. A ~2u forward gap off each hub makes entering a lane a deliberate hop.
//   Branch 1 (x23..34): conveyor-fed split — SAFE clear strip vs RISKY size-4
//     spike gauntlet (cx29, belt-pressured, 4u runway + 3u landing). 3x the coins.
//   Branch 2 (x42..53): "TWO HARD WAYS" — two GENUINELY different on-the-line jumps.
//     SAFE breaks for a comfortable 3u gap (x47..50); RISKY breaks for a bigger 4u
//     gap (x47..51) with a spinning sawblade sitting IN the pit on the z=3 line, so
//     you jump OVER the saw. Both are real; RISKY is harder and pays 3x.
//   Branch 3 (x75..90): conveyor-into-gauntlet FINALE split — the HARDEST line.
//     SAFE is a clear strip; RISKY stacks TWO on-the-line challenges: a size-4
//     gauntlet (cx81, belt-pressured) AND THEN a 4u jump-gap (x86..90) with a saw
//     spinning in the pit, before landing on the spring hub. The reward IS the risk.
//
// FINALE IDENTITY PRESERVED: conveyor-fed spike gauntlets (M1 belt->B1, M3 belt->B3),
// the w2 gap-bridge chain (branch 2 + branch 3 trailing gap), saws spinning in the
// pits you must jump, the spikeblock thread (hub D, two blocks at cz±1.0 squeezing
// the center), the spring climb + victory tower (deck F -> finish).
//
// On-the-line challenges (clearly out-challenges L4's ~2): (1) B1 belt-fed gauntlet,
// (2) B2 SAFE 3u gap / RISKY 4u gap-over-saw, (3) hub-D spikeblock center thread,
// (4) B3 belt-fed gauntlet, (5) B3 trailing 4u gap-over-saw, (6) the spring climb.
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

    // ---- BRANCH 2 (x42..53): TWO HARD WAYS — two genuinely different on-line jumps. ----
    { kind: 'strip', x0: 42, x1: 47, z: -3, w: 2 },                // B2 SAFE seg1 (far) x:42..47  (tight w2)
    { kind: 'strip', x0: 50, x1: 53, z: -3, w: 2 },                // B2 SAFE seg2 (far) x:50..53  (after a comfy 3u gap x47..50)
    { kind: 'strip', x0: 42, x1: 47, z:  3, w: 2 },                // B2 RISKY seg1 (near) x:42..47 (saw spins in the gap pit, on the z=3 line)
    { kind: 'strip', x0: 51, x1: 53, z:  3, w: 2 },                // B2 RISKY seg2 (near) x:51..53 (after a bigger 4u gap x47..51 over the saw)

    { kind: 'platform', cx: 56, cz: 0, w: 6, d: 6, rails: true },  // D spikeblock hub   x:53..59  (rejoin 2 + center thread; entry M3)
    { kind: 'conveyor', cx: 63, cz: 0, len: 8, w: 6 },             // M3 belt (+X), w6 spans both lanes  x:59..67

    // ---- BRANCH 3 (x75..90): conveyor-into-gauntlet FINALE split (HARDEST line). ----
    { kind: 'platform', cx: 70, cz: 0, w: 6, d: 6, rails: true },  // E split hub        x:67..73  (belt feeds in)
    { kind: 'strip', x0: 75, x1: 90, z: -3, w: 2 },                // B3 SAFE (far)      x:75..90  (clear, walks onto hub F)
    { kind: 'strip', x0: 75, x1: 86, z:  3, w: 2 },                // B3 RISKY (near)    x:75..86  (gauntlet cx81: runway x75..79, land x83..86)

    { kind: 'platform', cx: 93, cz: 0, w: 6, d: 6 },               // F spring deck      x:90..96  (rejoin 3; RISKY jumps a 4u gap x86..90 onto it; per-lane springs -> tower)
    { kind: 'finish', cx: 100, cz: 0, w: 6, d: 6, top: 10 },       // finish tower (w6 so every lane lands)  x:97..103
  ],
};
