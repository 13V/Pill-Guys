// Level 8 — "Crusher Canyon" (a CHAOTIC multi-route gauntlet, ~112u). A rocky
// canyon run where the walls slam: spike-blocks PISTON, spike-rollers TUMBLE and
// long saw-trap CRUSHERS swing — chaos everywhere, but only TWO things actually
// kill (read below). This is built in the single-file (level1) flat-descriptor
// format and follows the level5 GOLD multi-route template, only MORE chaotic.
//
// ROUTING — TWO LANES THE WHOLE WAY (mandatory, spawn -> finish):
//   SAFE lane  = FAR  z=-3 (cool blue/green strips): clear walks, slower.
//   RISKY lane = NEAR z=+3 (warm red/yellow strips): harder lines, FORWARD
//                CONVEYORS boost it (cz3,w4 -> span z1..5, never touch z=-3) so the
//                near runner moves ~12u/s vs SAFE's 8 — a real Fall-Guys shortcut.
//   The MIDDLE (z -2..+2) of every branch is EMPTY so you must COMMIT to a side.
//   Splits/rejoins are w6 hubs (z-3..+3) that BOTH lanes share. There are FOUR
//   branch splits (B1..B4), each SAFE-vs-RISKY, hub -> hub. A ~2u forward hop off
//   each split hub makes entering a lane a deliberate jump.
//
// THE ONLY TWO LETHAL THINGS (everything else is decorative — see below):
//   (a) `spikes` gauntlets (size 4 + >=4u runway + >=3u landing) sitting ON a RISKY
//       strip — you JUMP them (B1 cx26, B3 cx77, B4 cx96). The strip is the floor.
//   (b) jump-GAPS between consecutive lane decks (2-4u; autoplay jumps gaps >=1.5u),
//       some with a saw spinning IN the pit on the lane line (B2 RISKY saw-gap).
//   SAFE lanes only ever face mild flat gaps; both lanes are fully beatable (0 deaths).
//
// CHAOS DECOR (the bulk) — animated `menace` props with NO lethal flag, so they
//   carry NO death sensor and CANNOT block a lane. For "Crusher Canyon" the roster
//   leans HARD into spike-blocks (pistoning crushers), spike-rollers (tumbling) and
//   long saw-trap crushers, packed BESIDE the lanes (far flank z<=-5.5 / near flank
//   z>=+5.5), ABOVE the empty branch middles (high dy, clears the jump arc), on hub
//   CORNERS, and DOWN in the canyon PITS below the gaps (negative dy / low top).
//   Phases are varied heavily so the whole canyon pistons, tumbles and swings at once.
//   Autoplay walks right past them (no death box) — a human dodges; the danger reads
//   purely visually. This is the densest hazard scatter of the chaotic courses.
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
// Limits: jump reach ~5u, gaps <=5u (RISKY maxes 4u), step-ups <=3u, gauntlet size 4
// with >=4u runway + >=3u landing, widths >=2. Hubs are w6 (z-3..+3). finish x=112.
export default {
  name: 'Crusher Canyon',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'green' },     // A start hub          x: 0..6   — cool-green canyon mouth
    { kind: 'conveyor', cx: 9, cz: 0, len: 6, w: 6, color: 'blue' },                 // M1 belt (+X) w6 spine x: 6..12  — COOL blue shared breather (both lanes)

    // ===== BRANCH 1 (x20..31): conveyor-fed SPIKE GAUNTLET split. 2u hop off hub B. =====
    { kind: 'platform', cx: 15, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // B split hub          x: 12..18 — bright yellow decision point
    { kind: 'conveyor', cx: 15, cz: 3, len: 4, w: 4, color: 'red' },                 // B hub NEAR boost     x: 13..17 (cz3 -> z1..5: risky-only +X; SAFE z-3 untouched)
    { kind: 'strip', x0: 20, x1: 31, z: -3, w: 2, color: 'blue' },                   // B1 SAFE (far)        x: 20..31 (clear walk) — COOL blue = SAFE
    { kind: 'strip', x0: 20, x1: 31, z:  3, w: 2, color: 'red' },                    // B1 RISKY (near)      x: 20..31 (gauntlet cx26: runway 20..24, land 28..31) — WARM red = RISKY
    { kind: 'conveyor', cx: 22, cz: 3, len: 4, w: 4, color: 'yellow' },              // B1 RISKY run-up belt x: 20..24 (+X ~12u/s into the leap; ends before spikes 24..28)
    { kind: 'conveyor', cx: 29.5, cz: 3, len: 3, w: 4, color: 'yellow' },            // B1 RISKY land belt   x: 28..31 (+X ~12u/s after the gauntlet -> hub C)

    { kind: 'platform', cx: 34, cz: 0, w: 6, d: 6, rails: true, color: 'green' },    // C rejoin hub         x: 31..37 — cool-green rejoin (pipe arch)
    { kind: 'conveyor', cx: 34, cz: 3, len: 4, w: 4, color: 'red' },                 // C hub NEAR boost     x: 32..36 (risky-only +X across the rejoin)

    // ===== BRANCH 2 (x39..50): TWO HARD WAYS — SAFE 3u gap vs RISKY 4u gap-OVER-A-SAW. =====
    { kind: 'strip', x0: 39, x1: 44, z: -3, w: 2, color: 'green' },                  // B2 SAFE seg1 (far)   x: 39..44 (tight w2) — COOL green = SAFE
    { kind: 'strip', x0: 47, x1: 50, z: -3, w: 2, color: 'green' },                  // B2 SAFE seg2 (far)   x: 47..50 (after a comfy 3u gap 44..47)
    { kind: 'strip', x0: 39, x1: 44, z:  3, w: 2, color: 'yellow' },                 // B2 RISKY seg1 (near) x: 39..44 (saw spins in the gap pit on z=3) — WARM yellow = RISKY
    { kind: 'conveyor', cx: 41.5, cz: 3, len: 5, w: 4, color: 'red' },               // B2 RISKY run-up belt x: 39..44 (+X ~12u/s into the 4u saw-gap leap 44..48)
    { kind: 'strip', x0: 48, x1: 50, z:  3, w: 2, color: 'yellow' },                 // B2 RISKY seg2 (near) x: 48..50 (after a bigger 4u gap 44..48 over the saw)
    { kind: 'conveyor', cx: 49, cz: 3, len: 2, w: 4, color: 'red' },                 // B2 RISKY land belt   x: 48..50 (+X ~12u/s off the saw-gap landing -> hub D)

    { kind: 'platform', cx: 53, cz: 0, w: 6, d: 6, rails: true, color: 'red' },      // D crusher hub        x: 50..56 — hot red center-thread spikeblock hub
    { kind: 'conveyor', cx: 53, cz: 3, len: 4, w: 4, color: 'red' },                 // D hub NEAR boost     x: 51..55 (cz3 -> z3 walked, clear of center blocks z<=1.6)
    { kind: 'conveyor', cx: 60, cz: 0, len: 6, w: 6, color: 'blue' },                // M3 belt (+X) w6 spine x: 57..63 — COOL blue shared breather (both lanes)

    // ===== BRANCH 3 (x71..82): conveyor-fed SPIKE GAUNTLET split (the squeeze). =====
    { kind: 'platform', cx: 66, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // E split hub          x: 63..69 — bright yellow decision point
    { kind: 'conveyor', cx: 66, cz: 3, len: 4, w: 4, color: 'red' },                 // E hub NEAR boost     x: 64..68 (risky-only +X across the split hub)
    { kind: 'strip', x0: 71, x1: 82, z: -3, w: 2, color: 'blue' },                   // B3 SAFE (far)        x: 71..82 (clear walk) — COOL blue = SAFE
    { kind: 'strip', x0: 71, x1: 82, z:  3, w: 2, color: 'red' },                    // B3 RISKY (near)      x: 71..82 (gauntlet cx77: runway 71..75, land 79..82) — WARM red = RISKY
    { kind: 'conveyor', cx: 73, cz: 3, len: 4, w: 4, color: 'yellow' },              // B3 RISKY run-up belt x: 71..75 (+X ~12u/s into the leap; ends before spikes 75..79)
    { kind: 'conveyor', cx: 80.5, cz: 3, len: 3, w: 4, color: 'yellow' },            // B3 RISKY land belt   x: 79..82 (+X ~12u/s after the gauntlet -> hub F)

    { kind: 'platform', cx: 85, cz: 0, w: 6, d: 6, rails: true, color: 'green' },    // F rejoin hub         x: 82..88 — cool-green rejoin (portal)
    { kind: 'conveyor', cx: 85, cz: 3, len: 4, w: 4, color: 'red' },                 // F hub NEAR boost     x: 83..87 (risky-only +X across the rejoin)

    // ===== BRANCH 4 (x90..103): the FINALE GAUNTLET split (HARDEST, top payout). =====
    { kind: 'strip', x0: 90, x1: 103, z: -3, w: 2, color: 'blue' },                  // B4 SAFE (far)        x: 90..103 (clear, walks onto hub G) — COOL blue = SAFE
    { kind: 'strip', x0: 90, x1: 103, z:  3, w: 2, color: 'red' },                   // B4 RISKY (near)      x: 90..103 (gauntlet cx96: runway 90..94, land 98..103) — WARM red = RISKY
    { kind: 'conveyor', cx: 92, cz: 3, len: 4, w: 4, color: 'yellow' },              // B4 RISKY run-up belt x: 90..94 (+X ~12u/s into the leap; ends before spikes 94..98)
    { kind: 'conveyor', cx: 100.5, cz: 3, len: 5, w: 4, color: 'yellow' },           // B4 RISKY land belt   x: 98..103 (+X ~12u/s after the gauntlet -> hub G)

    { kind: 'platform', cx: 106, cz: 0, w: 6, d: 6, color: 'green' },                // G spring deck        x: 103..109 — cool-green launch pad (per-lane springs -> tower)
    { kind: 'conveyor', cx: 104.5, cz: 3, len: 3, w: 4, color: 'red' },              // G entry NEAR boost   x: 103..106 (risky-only +X onto the cz3 spring; ENDS before the spring sensor)
    { kind: 'finish', cx: 112, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },        // finish tower (w6 so every lane lands) x: 109..115 — celebratory gold victory tower
  ],

  hazards: [
    // =========================================================================
    // GAMEPLAY HAZARDS — the ONLY lethal ones (spikes gauntlets + saw-in-gap).
    // Each lethal hazard sits ON a RISKY (near, z=+3) line with a safe landing,
    // or in a jump-GAP on the lane line — never the only path, never the full width.
    // =========================================================================
    { kind: 'spikes', cx: 26, cz: 3, size: 4 },                       // B1 gauntlet (runway 20..24, land 28..31) — LETHAL on-line (jump it)
    { kind: 'sawblade', cx: 46, cz: 3, lethal: true },                // B2: saw spinning IN the 4u gap pit (44..48) ON z=3 — the GAP is the threat
    { kind: 'spikes', cx: 77, cz: 3, size: 4 },                       // B3 gauntlet (runway 71..75, land 79..82) — LETHAL on-line (jump it)
    { kind: 'spikes', cx: 96, cz: 3, size: 4 },                       // B4 gauntlet (runway 90..94, land 98..103) — LETHAL on-line (jump it)

    // Warning cones (decorative): flag each RISKY line's on-the-line hazard.
    { kind: 'cone', cx: 23.5, cz: 3 }, { kind: 'cone', cx: 28.5, cz: 3 },   // B1 gauntlet edges
    { kind: 'cone', cx: 43.5, cz: 3 }, { kind: 'cone', cx: 48.5, cz: 3 },   // B2 saw-gap jump edges
    { kind: 'cone', cx: 74.5, cz: 3 }, { kind: 'cone', cx: 79.5, cz: 3 },   // B3 gauntlet edges
    { kind: 'cone', cx: 93.5, cz: 3 }, { kind: 'cone', cx: 98.5, cz: 3 },   // B4 gauntlet edges

    // =========================================================================
    // CHAOS DECOR — animated `menace`, NO lethal flag (no death box, never blocks).
    // CRUSHER CANYON roster: spikeblocks PISTON (swing y), spikerollers TUMBLE
    // (spin x), saw-trap CRUSHERS swing, plus saws/cones for texture. Packed on the
    // FAR flank (z<=-5.5), NEAR flank (z>=+5.5), ABOVE empty middles, on hub CORNERS,
    // and DOWN in the canyon PITS. Phases varied so the canyon never moves in lockstep.
    // =========================================================================

    // --- A start hub + M1 belt (x0..12): the canyon mouth wakes up. ---
    { kind: 'menace', model: 'spikeblock_down', color: 'red', cx: 1.5, cz: 6.0, swing: { axis: 'y', amp: 0.5, speed: 2.2, phase: 0.0 } },        // NEAR flank pistoning crusher
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 4.0, cz: -5.8, spin: { axis: 'x', speed: 5, phase: 0.3 } },         // FAR flank tumbling roller
    { kind: 'menace', model: 'saw_trap_long', color: 'yellow', cx: 6.0, cz: 6.2, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.1 } },            // NEAR flank long saw crusher
    { kind: 'menace', model: 'spikeblock_up', color: 'blue', cx: 3.0, cz: -3.0, dy: 3.8, swing: { axis: 'y', amp: 0.5, speed: 2, phase: 0.6 } }, // crusher crown floating over the hub
    { kind: 'menace', model: 'cone', color: 'red', cx: 5.6, cz: 6.6 },                                                                           // NEAR flank warning cone (static)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 11, cz: 6.4, spin: { axis: 'y', speed: 4, phase: 0.6 } },             // NEAR flank vertical roller along M1
    { kind: 'menace', model: 'spikeblock_omni', color: 'yellow', cx: 11, cz: -5.8, swing: { axis: 'y', amp: 0.6, speed: 1.8, phase: 0.4 } },     // FAR flank omni crusher over M1
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 9, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.2 } },    // roller churning in the M1 canyon pit

    // --- Hub B split (x12..18): corner crushers + hung crusher over the B1 entry hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 13.0, cz: 6.2, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },            // NEAR hub corner double saw
    { kind: 'menace', model: 'spikeblock_down', color: 'green', cx: 17.0, cz: 6.4, swing: { axis: 'y', amp: 0.5, speed: 2.1, phase: 2.1 } },     // NEAR hub corner crusher
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 13.0, cz: -5.8, spin: { axis: 'x', speed: 5, phase: 1.2 } },        // FAR hub corner tumbling roller
    { kind: 'menace', model: 'saw_trap_long', color: 'yellow', cx: 17.0, cz: -6.0, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.8 } },          // FAR hub corner long saw crusher
    { kind: 'menace', model: 'spikeblock_up', color: 'red', cx: 19, cz: 0, dy: 4.2, swing: { axis: 'y', amp: 0.6, speed: 2.4, phase: 2.6 } },    // crusher pistoning over the B1 entry void
    { kind: 'menace', model: 'spikeblock_left', color: 'blue', cx: 19, cz: 6.5 },                                                                // NEAR flank sideways crusher (B1 entry, static)

    // --- BRANCH 1 (x20..31): flank rollers/crushers, hung crusher over the gauntlet void, pit. ---
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 23, cz: 6.6, spin: { axis: 'x', speed: 5, phase: 0.5 } },           // NEAR flank roller beside the gauntlet
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 21, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.5 } },            // FAR flank vertical roller
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 30, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.1 } },          // FAR flank horizontal roller
    { kind: 'menace', model: 'spikeblock_down', color: 'green', cx: 26, cz: 6.6, swing: { axis: 'y', amp: 0.5, speed: 2.3, phase: 2.4 } },       // NEAR flank crusher over the gauntlet
    { kind: 'menace', model: 'spikeblock_up', color: 'neutral', cx: 26, cz: 0, dy: 3.6, swing: { axis: 'y', amp: 0.6, speed: 2, phase: 1.3 } },  // crusher pistoning over the B1 gauntlet void
    { kind: 'menace', model: 'floor_spikes_trap_2x2x1', color: 'red', cx: 23, cz: 8.0 },                                                         // NEAR flank trap floor spikes (static)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 26, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.7 } },   // roller tumbling deep in the B1 pit
    { kind: 'menace', model: 'cone', color: 'yellow', cx: 30, cz: 6.6 },                                                                         // NEAR flank cone (landing, static)

    // --- Hub C / rejoin (x31..37): corner crushers + saws + crown + pit. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 32, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.5 } },                  // NEAR hub corner saw
    { kind: 'menace', model: 'spikeblock_omni', color: 'yellow', cx: 36, cz: -6.0, swing: { axis: 'y', amp: 0.6, speed: 1.9, phase: 3.0 } },     // FAR hub corner omni crusher
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 32, cz: -6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.0 } },               // FAR hub corner long saw crusher
    { kind: 'menace', model: 'spikeblock_down', color: 'yellow', cx: 34, cz: -3.0, dy: 4.6, swing: { axis: 'y', amp: 0.5, speed: 2, phase: 0.9 } }, // crusher crown floating over the hub
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 36, cz: 6.5, spin: { axis: 'x', speed: 4, phase: 1.4 } },             // NEAR flank vertical roller
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 34, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.1 } },   // roller in the hub-C pit

    // --- BRANCH 2 (x39..50): the saw-gap stretch — flank saws/crushers/rollers, pit saws. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 41, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.9 } },                // NEAR flank long saw crusher (seg1)
    { kind: 'menace', model: 'spikeblock_down', color: 'yellow', cx: 47, cz: -6.0, swing: { axis: 'y', amp: 0.5, speed: 2.2, phase: 0.6 } },     // FAR flank crusher over the SAFE gap
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 41, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 1.9 } },          // FAR flank tumbling roller (seg1)
    { kind: 'menace', model: 'spikeblock_up', color: 'green', cx: 49, cz: 6.4, swing: { axis: 'y', amp: 0.5, speed: 2.4, phase: 0.1 } },         // NEAR flank crusher past the saw-gap (seg2)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 49, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.0 } },            // FAR flank vertical roller (seg2)
    { kind: 'menace', model: 'spikeblock_up', color: 'neutral', cx: 46, cz: 0, dy: 3.4, swing: { axis: 'y', amp: 0.6, speed: 2, phase: 1.3 } },  // crusher pistoning over the B2 saw-gap void
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 46, cz: 0, dy: -3.8 },                                                            // extra saw deep in the B2 pit (static decor)
    { kind: 'menace', model: 'spikeblock_double_horizontal', color: 'blue', cx: 39, cz: 8.0 },                                                   // NEAR flank double-h crusher (static)
    { kind: 'menace', model: 'spikeblock_double_vertical', color: 'red', cx: 50, cz: 8.0 },                                                      // NEAR flank double-v crusher (static)
    { kind: 'menace', model: 'floor_spikes_curved_4x2x2', color: 'neutral', cx: 44, cz: -7.5, ry: 90 },                                          // FAR flank curved floor spikes (static)

    // --- Hub D / crusher hub (x50..56) + M3 belt (x57..63): corner crushers, crowns, rollers, pit. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 51, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },             // NEAR hub corner double saw
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 55, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 1.4 } },          // FAR hub corner tumbling roller
    { kind: 'menace', model: 'spikeblock_left', color: 'blue', cx: 51, cz: -3.0, dy: 3.6, swing: { axis: 'y', amp: 0.5, speed: 2, phase: 0.2 } },   // crusher crown over NW corner
    { kind: 'menace', model: 'spikeblock_right', color: 'green', cx: 55, cz: 3.0, dy: 3.6, swing: { axis: 'y', amp: 0.5, speed: 2, phase: 1.6 } },  // crusher crown over SE corner
    { kind: 'menace', model: 'spikeblock_down', color: 'red', cx: 53, cz: 3.0, dy: 4.4, swing: { axis: 'y', amp: 0.6, speed: 2.5, phase: 2.0 } },// crusher pistoning over the hub center (high, clears walk)
    { kind: 'menace', model: 'saw_trap_long', color: 'green', cx: 60, cz: -6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.0 } },             // FAR flank long saw crusher over M3
    { kind: 'menace', model: 'spikeblock_down', color: 'red', cx: 60, cz: 6.2, swing: { axis: 'y', amp: 0.5, speed: 2.3, phase: 0.0 } },         // NEAR flank crusher over M3
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 60, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.5 } },     // vertical roller in the M3 pit

    // --- Hub E split (x63..69): the squeeze landmark — big saws, crushers, crown, pit. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 64, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.2 } },                  // NEAR hub corner saw
    { kind: 'menace', model: 'spikeblock_down', color: 'green', cx: 68, cz: 6.6, swing: { axis: 'y', amp: 0.5, speed: 2.1, phase: 2.6 } },       // NEAR hub corner crusher
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 64, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 0.3 } },          // FAR hub corner tumbling roller
    { kind: 'menace', model: 'saw_trap_long', color: 'blue', cx: 68, cz: -6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.4 } },              // FAR hub corner long saw crusher
    { kind: 'menace', model: 'spikeblock_up', color: 'blue', cx: 66, cz: -3.0, dy: 4.6, swing: { axis: 'y', amp: 0.5, speed: 2, phase: 1.0 } },  // crusher crown floating over the hub
    { kind: 'menace', model: 'spikeblock_down', color: 'neutral', cx: 70, cz: 0, dy: 4.2, swing: { axis: 'y', amp: 0.6, speed: 2.4, phase: 1.6 } }, // crusher pistoning over the B3 entry void
    { kind: 'menace', model: 'floor_spikes_trap_4x4x1', color: 'blue', cx: 66, cz: -8.0 },                                                       // FAR flank big trap-spike field (static)

    // --- BRANCH 3 (x71..82): the squeeze — flank saws/rollers/crushers, hung crushers, pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 74, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },                // NEAR flank long saw crusher beside the gauntlet
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 72, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 0.8 } },          // FAR flank tumbling roller
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 80, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.3 } },            // FAR flank vertical roller (landing)
    { kind: 'menace', model: 'spikeblock_down', color: 'yellow', cx: 77, cz: 6.6, swing: { axis: 'y', amp: 0.5, speed: 2.5, phase: 0.6 } },      // NEAR flank crusher over the gauntlet
    { kind: 'menace', model: 'spikeblock_up', color: 'neutral', cx: 77, cz: 0, dy: 3.6, swing: { axis: 'y', amp: 0.6, speed: 2, phase: 2.6 } },  // crusher pistoning over the B3 gauntlet void
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 77, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.9 } },   // roller tumbling deep in the B3 pit
    { kind: 'menace', model: 'spikeblock_left', color: 'red', cx: 72, cz: 8.0 },                                                                 // NEAR flank sideways crusher (static)
    { kind: 'menace', model: 'spikeblock_right', color: 'yellow', cx: 81, cz: 8.0 },                                                             // NEAR flank sideways crusher (static)
    { kind: 'menace', model: 'cone', color: 'red', cx: 80, cz: 6.6 },                                                                            // NEAR flank cone (landing, static)

    // --- Hub F rejoin (x82..88): corner crushers + saws + crown + pit. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'yellow', cx: 83, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },           // NEAR hub corner double saw
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 87, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 1.0 } },          // FAR hub corner tumbling roller
    { kind: 'menace', model: 'spikeblock_omni', color: 'green', cx: 83, cz: -6.4, swing: { axis: 'y', amp: 0.6, speed: 1.9, phase: 1.7 } },      // FAR hub corner omni crusher
    { kind: 'menace', model: 'spikeblock_down', color: 'green', cx: 85, cz: 3.0, dy: 4.4, swing: { axis: 'y', amp: 0.5, speed: 2.4, phase: 0.4 } }, // crusher pistoning over the hub (high, clears walk)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 87, cz: 6.5, spin: { axis: 'x', speed: 4, phase: 0.4 } },             // NEAR flank vertical roller
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 85, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.6 } },   // roller in the hub-F pit

    // --- BRANCH 4 (x90..103): the FINALE — flank saws/rollers/crushers, hung crushers, pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 93, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },                // NEAR flank long saw crusher beside the gauntlet
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 91, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 0.8 } },          // FAR flank tumbling roller
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 101, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.3 } },           // FAR flank vertical roller (landing)
    { kind: 'menace', model: 'spikeblock_down', color: 'yellow', cx: 96, cz: 6.6, swing: { axis: 'y', amp: 0.5, speed: 2.5, phase: 1.4 } },      // NEAR flank crusher over the gauntlet
    { kind: 'menace', model: 'spikeblock_up', color: 'neutral', cx: 96, cz: 0, dy: 3.6, swing: { axis: 'y', amp: 0.6, speed: 2, phase: 0.9 } },  // crusher pistoning over the B4 gauntlet void
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 96, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.4 } },   // roller tumbling deep in the B4 pit
    { kind: 'menace', model: 'spikeblock_left', color: 'red', cx: 91, cz: 8.0 },                                                                 // NEAR flank sideways crusher (static)
    { kind: 'menace', model: 'spikeblock_right', color: 'yellow', cx: 101, cz: 8.0 },                                                            // NEAR flank sideways crusher (static)
    { kind: 'menace', model: 'floor_spikes_2x2x1', color: 'neutral', cx: 99, cz: 8.0 },                                                          // NEAR flank floor spikes (static)

    // --- Hub G spring deck (x103..109) + finish tower (x109..115): the canyon crescendo. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 104, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },            // NEAR flank double saw by the springs
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 108, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 1.0 } },         // FAR flank tumbling roller by the springs
    { kind: 'menace', model: 'spikeblock_down', color: 'green', cx: 108, cz: 6.4, swing: { axis: 'y', amp: 0.5, speed: 2.3, phase: 1.7 } },      // NEAR flank crusher
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 104, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.4 } },           // FAR flank vertical roller
    { kind: 'menace', model: 'spikeblock_up', color: 'neutral', cx: 112, cz: -6.0, top: 10, swing: { axis: 'y', amp: 0.5, speed: 2, phase: 0.8 } }, // FAR flank crusher at the finish tower
    { kind: 'menace', model: 'saw_trap_long', color: 'blue', cx: 112, cz: 6.6, top: 10, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },     // NEAR flank long saw crusher at the finish
    { kind: 'menace', model: 'spikeblock_omni', color: 'neutral', cx: 112, cz: -3.0, top: 10, dy: 1.0, swing: { axis: 'y', amp: 0.4, speed: 1.8, phase: 1.1 } }, // crusher crown on the tower edge
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 106, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.2 } },  // roller tumbling in the G pit
  ],

  // One spring PER LANE on spring deck G -> the victory tower (top 5 -> top 10; spring
  // rise ~4.9u, forward arc ~4u onto the tower whose near edge is x109). Whichever lane
  // you arrive in (z -3 / +3) or the center, a spring lifts you up the canyon's end tower.
  springs: [
    { cx: 106, cz: -3 },   // SAFE-lane spring
    { cx: 106, cz: 3 },    // RISKY-lane spring
    { cx: 106, cz: 0 },    // center (hub-walked) spring
  ],

  // Reward differentiates the lanes: each RISKY (near, z=+3) line pays ~3x its SAFE
  // (far, z=-3) sibling (safe 1 / risky 3 per branch), and the reward IS the risk —
  // an arc coin sits ON the jump over each gauntlet / saw-gap. Hubs (z=0) + the tower
  // hold the rest. 4 branches x (1 safe + 3 risky) + hubs/spine + tower.
  coins: [
    { x: 3,  y: 6.4, z: 0 },     // A spawn hub
    { x: 9,  y: 6.4, z: 0 },     // M1 spine

    // Branch 1 (gauntlet)  — safe 1 / risky 3
    { x: 26, y: 6.4, z: -3 },    // safe lane (clear)
    { x: 21, y: 6.4, z: 3 },     // risky entry
    { x: 26, y: 7.2, z: 3 },     // risky: arc over the gauntlet   (reward)
    { x: 30, y: 6.4, z: 3 },     // risky landing                  (reward)

    { x: 34, y: 6.4, z: 0 },     // C rejoin hub

    // Branch 2 (saw-gap)  — safe 1 / risky 3
    { x: 41, y: 6.4, z: -3 },    // safe w2 bridge (before the comfy 3u gap)
    { x: 41, y: 6.4, z: 3 },     // risky entry
    { x: 46, y: 7.2, z: 3 },     // risky: arc over the 4u saw-gap (reward)
    { x: 49, y: 6.4, z: 3 },     // risky landing                  (reward)

    { x: 53, y: 6.4, z: 0 },     // D crusher hub
    { x: 60, y: 6.4, z: 0 },     // M3 spine

    // Branch 3 (gauntlet)  — safe 1 / risky 3
    { x: 77, y: 6.4, z: -3 },    // safe lane (clear)
    { x: 72, y: 6.4, z: 3 },     // risky entry
    { x: 77, y: 7.2, z: 3 },     // risky: arc over the gauntlet   (reward)
    { x: 81, y: 6.4, z: 3 },     // risky landing                  (reward)

    { x: 85, y: 6.4, z: 0 },     // F rejoin hub

    // Branch 4 (finale gauntlet, top payout)  — safe 1 / risky 3
    { x: 96, y: 6.4, z: -3 },    // safe lane (clear)
    { x: 91, y: 6.4, z: 3 },     // risky entry
    { x: 96, y: 7.2, z: 3 },     // risky: arc over the gauntlet   (reward)
    { x: 101, y: 6.4, z: 3 },    // risky landing                  (reward)

    { x: 106, y: 6.4, z: 0 },    // G spring deck — "you made it" coin before the climb
    { x: 112, y: 11.4, z: 0 },   // atop the victory tower
  ],

  decor: [
    { kind: 'arrow', cx: 5, cz: 0 },           // go right, into the canyon
    { kind: 'arrow', cx: 13.5, cz: -3 },       // signpost the SAFE lane at hub B
    { kind: 'pipeArch', cx: 34 },              // red arch framing rejoin C
    { kind: 'portal', cx: 34, cz: 0 },         // green portal at rejoin C
    { kind: 'gantry', cx: 46 },                // grey truss over the two-hard-ways stretch
    { kind: 'portal', cx: 66, cz: 0 },         // portal at the final-third split hub E
    { kind: 'gantry', cx: 85 },                // truss landmark at rejoin F
    { kind: 'arrow', cx: 109.5, cz: 0 },       // point at the spring -> victory tower
  ],
};
