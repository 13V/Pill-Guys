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
// RISKY SHORTCUT (the time-save, see ../../../MULTI_ROUTE_DESIGN.md & level2): a
// constant-speed runner only goes faster by going FASTER, so every RISKY (near,
// z=+3) lane is BOOSTED by FORWARD CONVEYORS `conveyor {cz:3, w:4}` (span z1..5 —
// they NEVER touch the z=-3 SAFE lane). The belt pushes +X (CONVEYOR_SPEED 4 on top
// of the 8 base) so the risky runner moves ~12 u/s vs SAFE's 8 — a real Fall-Guys
// shortcut. Because L5 is long (~103u) the boost is GENEROUS — a forward belt on
// EVERY clear grounded stretch the risky runner crosses:
//   (a) the run-up + landing of all THREE branch gauntlets/gaps (B1, B2, B3), and
//   (b) the NEAR HALF (cz3, w4 -> z1..5) of every shared hub (B, C, D, E) plus the
//       gap-landing approach onto spring deck F — boosting the risky runner ACROSS
//       the hubs at ~12u/s while the SAFE runner at z-3 walks them at 8 (the hub
//       near-belts never reach z-3, so they boost the risky lane ONLY).
// This stacks ~45u of +X boost onto the near lane, so the risky route finishes
// CLEARLY faster overall (~85 autoplay steps / ~1.4s ahead of SAFE). The hazards are
// UNCHANGED — belts sit BEFORE/AFTER each lethal gauntlet & on each jump's run-up,
// NEVER over the spike cells (you still jump every gauntlet/saw-gap). The shared spine
// (M1/M3 belts, spring tower) and the SAFE lane are otherwise untouched, so the lead
// is pure SPEED on the near lane while both lanes stay flat, fixed-z & followable.
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
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'green' },   // A start hub        x: 0..6  — cool-green reactor entrance opens the finale
    { kind: 'conveyor', cx: 11, cz: 0, len: 8, w: 6, color: 'blue' },             // M1 belt (+X), w6 spans both lanes  x: 7..15  — COOL blue shared-spine breather (both lanes)

    // ---- BRANCH 1 (x23..34): conveyor-fed gauntlet split. 2u hop off hub B. ----
    { kind: 'platform', cx: 18, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },  // B split hub        x:15..21  (belt feeds in) — bright yellow decision point
    { kind: 'conveyor', cx: 18, cz: 3, len: 6, w: 4, color: 'red' },             // B hub NEAR boost  x:15..21  (cz3 -> z1..5: risky-only +X across the hub; SAFE at z-3 untouched) — WARM red risky boost
    { kind: 'strip', x0: 23, x1: 34, z: -3, w: 2, color: 'blue' },                // B1 SAFE (far)      x:23..34  (clear, slower) — COOL blue = SAFE lane
    { kind: 'strip', x0: 23, x1: 34, z:  3, w: 2, color: 'red' },                // B1 RISKY (near)    x:23..34  (gauntlet cx29: runway x23..27, land x31..34) — WARM red = RISKY lane
    { kind: 'conveyor', cx: 25,   cz: 3, len: 4, w: 4, color: 'yellow' },           // B1 RISKY run-up belt  x:23..27  (+X ~12u/s into the gauntlet leap; ends before spikes x27..31) — WARM yellow risky boost
    { kind: 'conveyor', cx: 32.5, cz: 3, len: 3, w: 4, color: 'yellow' },           // B1 RISKY landing belt x:31..34  (+X ~12u/s after the gauntlet -> hub C) — WARM yellow risky boost

    { kind: 'platform', cx: 37, cz: 0, w: 6, d: 6, rails: true, color: 'green' },  // C rejoin hub       x:34..40  (rejoin 1 + saw-hub pipe arch; entry branch 2) — cool-green rejoin breather
    { kind: 'conveyor', cx: 37, cz: 3, len: 6, w: 4, color: 'red' },             // C hub NEAR boost  x:34..40  (risky-only +X across the rejoin; SAFE at z-3 untouched) — WARM red risky boost

    // ---- BRANCH 2 (x42..53): TWO HARD WAYS — two genuinely different on-line jumps. ----
    { kind: 'strip', x0: 42, x1: 47, z: -3, w: 2, color: 'green' },                // B2 SAFE seg1 (far) x:42..47  (tight w2) — COOL green = SAFE lane
    { kind: 'strip', x0: 50, x1: 53, z: -3, w: 2, color: 'green' },                // B2 SAFE seg2 (far) x:50..53  (after a comfy 3u gap x47..50) — COOL green = SAFE lane
    { kind: 'strip', x0: 42, x1: 47, z:  3, w: 2, color: 'yellow' },                // B2 RISKY seg1 (near) x:42..47 (saw spins in the gap pit, on the z=3 line) — WARM yellow = RISKY lane
    { kind: 'conveyor', cx: 44.5, cz: 3, len: 5, w: 4, color: 'red' },           // B2 RISKY run-up belt x:42..47 (+X ~12u/s across all of seg1, into the 4u saw-gap leap x47..51) — WARM red risky boost
    { kind: 'strip', x0: 51, x1: 53, z:  3, w: 2, color: 'yellow' },                // B2 RISKY seg2 (near) x:51..53 (after a bigger 4u gap x47..51 over the saw) — WARM yellow = RISKY lane
    { kind: 'conveyor', cx: 52, cz: 3, len: 2, w: 4, color: 'red' },             // B2 RISKY landing belt x:51..53 (+X ~12u/s off the saw-gap landing -> hub D) — WARM red risky boost

    { kind: 'platform', cx: 56, cz: 0, w: 6, d: 6, rails: true, color: 'red' },  // D spikeblock hub   x:53..59  (rejoin 2 + center thread; entry M3) — hot red spikeblock hub
    { kind: 'conveyor', cx: 56, cz: 3, len: 6, w: 4, color: 'red' },             // D hub NEAR boost  x:53..59  (cz3 -> z2.5..3.5 walked; clear of the center spikeblocks z<=1.6; SAFE at z-3 untouched) — WARM red risky boost
    { kind: 'conveyor', cx: 63, cz: 0, len: 8, w: 6, color: 'blue' },             // M3 belt (+X), w6 spans both lanes  x:59..67  — COOL blue shared-spine breather (both lanes)

    // ---- BRANCH 3 (x75..90): conveyor-into-gauntlet FINALE split (HARDEST line). ----
    { kind: 'platform', cx: 70, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },  // E split hub        x:67..73  (belt feeds in) — bright yellow final decision point
    { kind: 'conveyor', cx: 70, cz: 3, len: 6, w: 4, color: 'red' },             // E hub NEAR boost  x:67..73  (risky-only +X across the final split hub; SAFE at z-3 untouched) — WARM red risky boost
    { kind: 'strip', x0: 75, x1: 90, z: -3, w: 2, color: 'blue' },                // B3 SAFE (far)      x:75..90  (clear, walks onto hub F) — COOL blue = SAFE lane
    { kind: 'strip', x0: 75, x1: 86, z:  3, w: 2, color: 'red' },                // B3 RISKY (near)    x:75..86  (gauntlet cx81: runway x75..79, land x83..86) — WARM red = RISKY lane
    { kind: 'conveyor', cx: 77,   cz: 3, len: 4, w: 4, color: 'yellow' },           // B3 RISKY run-up belt  x:75..79  (+X ~12u/s into the gauntlet leap; ends before spikes x79..83) — WARM yellow risky boost
    { kind: 'conveyor', cx: 84.5, cz: 3, len: 3, w: 4, color: 'yellow' },           // B3 RISKY landing belt x:83..86  (+X ~12u/s after the gauntlet, run-up into the trailing 4u saw-gap x86..90 -> hub F) — WARM yellow risky boost

    { kind: 'platform', cx: 93, cz: 0, w: 6, d: 6, color: 'green' },               // F spring deck      x:90..96  (rejoin 3; RISKY jumps a 4u gap x86..90 onto it; per-lane springs -> tower) — cool-green launch pad before the tower
    { kind: 'conveyor', cx: 91, cz: 3, len: 2, w: 4, color: 'red' },             // F entry NEAR boost x:90..92  (risky-only +X off the gap landing toward the cz3 spring; ENDS at x92, before the spring sensor x92.1, so the launch stays clean) — WARM red risky boost
    { kind: 'finish', cx: 100, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },       // finish tower (w6 so every lane lands)  x:97..103  — celebratory gold victory tower
  ],
};
