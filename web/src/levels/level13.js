// Level 13 — "Buoy Oh Buoy" (a CHAOTIC nautical two-lane gauntlet, ~115u). A
// sun-drenched run across a tropical lagoon: a chain of weathered dock platforms,
// floating buoy strips and conveyor RIP-CURRENTS strung above an open OCEAN. The
// whole harbor is alive — ship booms SWING like swiper masts, anchors and capstan
// hammers SWEEP, propeller saw-traps SPIN and buoys BOB — but only TWO things kill
// (read below). Built in the single-file (level1/level8) flat-descriptor format and
// follows the level8 GOLD multi-route template, re-skinned for the high seas.
//
// SIGNATURE GIMMICK — the lagoon's "RIP CURRENTS": every RISKY (near, z=+3) branch
// is shoved forward by a chain of +X conveyors (cz3, w4 -> span z1..5, never touch
// the SAFE z=-3 line), so the near runner is swept along ~12u/s vs the SAFE walker's
// ~8 — a genuine Fall-Guys shortcut that also rockets you INTO each jump.
//
// ROUTING — TWO LANES THE WHOLE WAY (mandatory, spawn -> finish):
//   SAFE lane  = FAR  z=-3 (cool DEEP-WATER blue/green strips): clear walks, slower.
//   RISKY lane = NEAR z=+3 (warm SUNSET/CORAL red/yellow strips): rip-current boosted,
//                harder lines (spike-reef gauntlets + a propeller saw-gap), pays ~3x.
//   The MIDDLE (z -2..+2) of every branch is OPEN WATER (empty) so you must COMMIT to
//   a side. Splits/rejoins are w6 DOCK hubs (z-3..+3) that BOTH lanes share. FOUR
//   branch splits (B1..B4), each SAFE-vs-RISKY, hub -> hub. A ~2u forward hop off each
//   split hub makes entering a lane a deliberate jump.
//
// THE ONLY TWO LETHAL THINGS (everything else is decorative — see below):
//   (a) `spikes` SPIKE-REEF gauntlets (size 4 + >=4u runway + >=3u landing) sitting ON
//       a RISKY strip — you JUMP them (B1 cx26, B3 cx77, B4 cx96). The strip is the floor.
//   (b) jump-GAPS between consecutive lane decks (2-4u; autoplay jumps gaps >=1.5u),
//       one with a PROPELLER saw spinning IN the pit on the lane line (B2 RISKY saw-gap).
//   SAFE lanes only ever face mild flat gaps; both lanes are fully beatable (0 deaths).
//
// CHAOS DECOR (the bulk) — animated `menace` props with NO lethal flag, so they carry
//   NO death sensor and CANNOT block a lane. The NAUTICAL roster: SWIPER ship-booms &
//   capstan HAMMERS sweep, SAW-TRAP propellers spin, SPIKEROLLER capstans tumble,
//   SPIKEBALL/BALL buoys bob, FLOOR-NET tangles and CHAIN moorings hang — all packed on
//   the FAR flank (z<=-5.5), NEAR flank (z>=+5.5), ABOVE the open-water middles (high dy,
//   clears the jump arc), on dock CORNERS, and DOWN in the swell below the gaps (negative
//   dy / low top). Phases are varied heavily so the whole lagoon rocks at once. Autoplay
//   walks right past them (no death box) — a human dodges; the danger reads purely visually.
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
// Limits: jump reach ~5u, gaps <=5u (RISKY maxes 4u), step-ups <=3u, gauntlet size 4 with
// >=4u runway + >=3u landing, widths >=2. Hubs are w6 (z-3..+3). finish x=112.
export default {
  name: 'Buoy Oh Buoy',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'green' },     // A start dock        x: 0..6   — sea-green harbor mouth
    { kind: 'conveyor', cx: 9, cz: 0, len: 6, w: 6, color: 'blue' },                 // M1 current (+X) w6   x: 6..12  — COOL blue shared tideway (both lanes)

    // ===== BRANCH 1 (x20..31): rip-current-fed SPIKE-REEF split. 2u hop off dock B. =====
    { kind: 'platform', cx: 15, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // B split dock         x: 12..18 — bright buoy-yellow decision point
    { kind: 'conveyor', cx: 15, cz: 3, len: 4, w: 4, color: 'red' },                 // B dock NEAR boost    x: 13..17 (cz3 -> z1..5: risky-only +X; SAFE z-3 untouched)
    { kind: 'strip', x0: 20, x1: 31, z: -3, w: 2, color: 'blue' },                   // B1 SAFE (far)        x: 20..31 (clear walk) — COOL blue = SAFE
    { kind: 'strip', x0: 20, x1: 31, z:  3, w: 2, color: 'red' },                    // B1 RISKY (near)      x: 20..31 (reef cx26: runway 20..24, land 28..31) — WARM red = RISKY
    { kind: 'conveyor', cx: 22, cz: 3, len: 4, w: 4, color: 'yellow' },              // B1 RISKY run-up belt x: 20..24 (+X ~12u/s into the leap; ends before reef 24..28)
    { kind: 'conveyor', cx: 29.5, cz: 3, len: 3, w: 4, color: 'yellow' },            // B1 RISKY land belt   x: 28..31 (+X ~12u/s after the reef -> dock C)

    { kind: 'platform', cx: 34, cz: 0, w: 6, d: 6, rails: true, color: 'green' },    // C rejoin dock        x: 31..37 — sea-green rejoin (coral arch)
    { kind: 'conveyor', cx: 34, cz: 3, len: 4, w: 4, color: 'red' },                 // C dock NEAR boost    x: 32..36 (risky-only +X across the rejoin)

    // ===== BRANCH 2 (x39..50): TWO HARD WAYS — SAFE 3u gap vs RISKY 4u gap-OVER-A-PROP. =====
    { kind: 'strip', x0: 39, x1: 44, z: -3, w: 2, color: 'green' },                  // B2 SAFE seg1 (far)   x: 39..44 (tight w2) — COOL green = SAFE
    { kind: 'strip', x0: 47, x1: 50, z: -3, w: 2, color: 'green' },                  // B2 SAFE seg2 (far)   x: 47..50 (after a comfy 3u gap 44..47)
    { kind: 'strip', x0: 39, x1: 44, z:  3, w: 2, color: 'yellow' },                 // B2 RISKY seg1 (near) x: 39..44 (propeller spins in the gap pit on z=3) — WARM yellow = RISKY
    { kind: 'conveyor', cx: 41.5, cz: 3, len: 5, w: 4, color: 'red' },               // B2 RISKY run-up belt x: 39..44 (+X ~12u/s into the 4u prop-gap leap 44..48)
    { kind: 'strip', x0: 48, x1: 50, z:  3, w: 2, color: 'yellow' },                 // B2 RISKY seg2 (near) x: 48..50 (after a bigger 4u gap 44..48 over the propeller)
    { kind: 'conveyor', cx: 49, cz: 3, len: 2, w: 4, color: 'red' },                 // B2 RISKY land belt   x: 48..50 (+X ~12u/s off the prop-gap landing -> dock D)

    { kind: 'platform', cx: 53, cz: 0, w: 6, d: 6, rails: true, color: 'red' },      // D capstan dock       x: 50..56 — hot coral center-thread capstan dock
    { kind: 'conveyor', cx: 53, cz: 3, len: 4, w: 4, color: 'red' },                 // D dock NEAR boost    x: 51..55 (cz3 -> z3 walked, clear of center props z<=1.6)
    { kind: 'conveyor', cx: 60, cz: 0, len: 6, w: 6, color: 'blue' },                // M3 current (+X) w6   x: 57..63 — COOL blue shared tideway (both lanes)

    // ===== BRANCH 3 (x71..82): rip-current-fed SPIKE-REEF split (the narrows). =====
    { kind: 'platform', cx: 66, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // E split dock         x: 63..69 — bright buoy-yellow decision point
    { kind: 'conveyor', cx: 66, cz: 3, len: 4, w: 4, color: 'red' },                 // E dock NEAR boost    x: 64..68 (risky-only +X across the split dock)
    { kind: 'strip', x0: 71, x1: 82, z: -3, w: 2, color: 'blue' },                   // B3 SAFE (far)        x: 71..82 (clear walk) — COOL blue = SAFE
    { kind: 'strip', x0: 71, x1: 82, z:  3, w: 2, color: 'red' },                    // B3 RISKY (near)      x: 71..82 (reef cx77: runway 71..75, land 79..82) — WARM red = RISKY
    { kind: 'conveyor', cx: 73, cz: 3, len: 4, w: 4, color: 'yellow' },              // B3 RISKY run-up belt x: 71..75 (+X ~12u/s into the leap; ends before reef 75..79)
    { kind: 'conveyor', cx: 80.5, cz: 3, len: 3, w: 4, color: 'yellow' },            // B3 RISKY land belt   x: 79..82 (+X ~12u/s after the reef -> dock F)

    { kind: 'platform', cx: 85, cz: 0, w: 6, d: 6, rails: true, color: 'green' },    // F rejoin dock        x: 82..88 — sea-green rejoin (portal buoy)
    { kind: 'conveyor', cx: 85, cz: 3, len: 4, w: 4, color: 'red' },                 // F dock NEAR boost    x: 83..87 (risky-only +X across the rejoin)

    // ===== BRANCH 4 (x90..103): the FINALE REEF split (HARDEST, top payout). =====
    { kind: 'strip', x0: 90, x1: 103, z: -3, w: 2, color: 'blue' },                  // B4 SAFE (far)        x: 90..103 (clear, walks onto dock G) — COOL blue = SAFE
    { kind: 'strip', x0: 90, x1: 103, z:  3, w: 2, color: 'red' },                   // B4 RISKY (near)      x: 90..103 (reef cx96: runway 90..94, land 98..103) — WARM red = RISKY
    { kind: 'conveyor', cx: 92, cz: 3, len: 4, w: 4, color: 'yellow' },              // B4 RISKY run-up belt x: 90..94 (+X ~12u/s into the leap; ends before reef 94..98)
    { kind: 'conveyor', cx: 100.5, cz: 3, len: 5, w: 4, color: 'yellow' },           // B4 RISKY land belt   x: 98..103 (+X ~12u/s after the reef -> dock G)

    { kind: 'platform', cx: 106, cz: 0, w: 6, d: 6, color: 'green' },                // G launch dock        x: 103..109 — sea-green launch pad (per-lane springs -> lighthouse)
    { kind: 'conveyor', cx: 104.5, cz: 3, len: 3, w: 4, color: 'red' },              // G entry NEAR boost   x: 103..106 (risky-only +X onto the cz3 spring; ENDS before the spring sensor)
    { kind: 'finish', cx: 112, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },        // finish lighthouse (w6 so every lane lands) x: 109..115 — golden victory beacon
  ],

  hazards: [
    // =========================================================================
    // GAMEPLAY HAZARDS — the ONLY lethal ones (spike-reef gauntlets + propeller-in-gap).
    // Each lethal hazard sits ON a RISKY (near, z=+3) line with a safe landing, or in a
    // jump-GAP on the lane line — never the only path, never the full width.
    // =========================================================================
    { kind: 'spikes', cx: 26, cz: 3, size: 4 },                       // B1 reef (runway 20..24, land 28..31) — LETHAL on-line (jump it)
    { kind: 'sawblade', cx: 46, cz: 3, lethal: true },                // B2: propeller spinning IN the 4u gap pit (44..48) ON z=3 — the GAP is the threat
    { kind: 'spikes', cx: 77, cz: 3, size: 4 },                       // B3 reef (runway 71..75, land 79..82) — LETHAL on-line (jump it)
    { kind: 'spikes', cx: 96, cz: 3, size: 4 },                       // B4 reef (runway 90..94, land 98..103) — LETHAL on-line (jump it)

    // Channel-marker cones (decorative): flag each RISKY line's on-the-line hazard.
    { kind: 'cone', cx: 23.5, cz: 3 }, { kind: 'cone', cx: 28.5, cz: 3 },   // B1 reef edges
    { kind: 'cone', cx: 43.5, cz: 3 }, { kind: 'cone', cx: 48.5, cz: 3 },   // B2 prop-gap jump edges
    { kind: 'cone', cx: 74.5, cz: 3 }, { kind: 'cone', cx: 79.5, cz: 3 },   // B3 reef edges
    { kind: 'cone', cx: 93.5, cz: 3 }, { kind: 'cone', cx: 98.5, cz: 3 },   // B4 reef edges

    // =========================================================================
    // CHAOS DECOR — animated `menace`, NO lethal flag (no death box, never blocks).
    // BUOY-OH-BUOY roster: SWIPER ship-booms sweep (swing z), capstan HAMMERS sweep
    // (swing x), SAW-TRAP propellers spin, SPIKEROLLER capstans tumble (spin x), and
    // SPIKEBALL/BALL/FLOOR-NET/CHAIN buoys & moorings hang for texture. Packed on the
    // FAR flank (z<=-5.5), NEAR flank (z>=+5.5), ABOVE the open-water middles, on dock
    // CORNERS, and DOWN in the swell. Phases varied so the lagoon never rocks in lockstep.
    // =========================================================================

    // --- A start dock + M1 current (x0..12): the harbor wakes up. ---
    { kind: 'menace', model: 'swiper_long', color: 'red', cx: 1.5, cz: 6.0, swing: { axis: 'z', amp: 0.7, speed: 1.8, phase: 0.0 } },             // NEAR flank sweeping ship-boom
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 4.0, cz: -5.8, spin: { axis: 'x', speed: 5, phase: 0.3 } },          // FAR flank tumbling capstan
    { kind: 'menace', model: 'saw_trap_long', color: 'yellow', cx: 6.0, cz: 6.2, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.1 } },             // NEAR flank long propeller
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 3.0, cz: -3.0, dy: 3.8, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 0.6 } }, // mooring buoy swinging over the dock
    { kind: 'menace', model: 'ball', color: 'red', cx: 5.6, cz: 6.6 },                                                                            // NEAR flank floating buoy (static)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 11, cz: 6.4, spin: { axis: 'y', speed: 4, phase: 0.6 } },              // NEAR flank vertical capstan along M1
    { kind: 'menace', model: 'hammer_large', color: 'yellow', cx: 11, cz: -5.8, swing: { axis: 'x', amp: 0.7, speed: 1.7, phase: 0.4 } },         // FAR flank anchor hammer over M1
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 9, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.2 } },     // capstan churning in the M1 swell

    // --- Dock B split (x12..18): corner props + buoy hung over the B1 entry hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 13.0, cz: 6.2, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },             // NEAR dock corner double propeller
    { kind: 'menace', model: 'swiper', color: 'green', cx: 17.0, cz: 6.4, swing: { axis: 'z', amp: 0.7, speed: 2.0, phase: 2.1 } },               // NEAR dock corner sweeping boom
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 13.0, cz: -5.8, spin: { axis: 'x', speed: 5, phase: 1.2 } },         // FAR dock corner tumbling capstan
    { kind: 'menace', model: 'saw_trap_long', color: 'yellow', cx: 17.0, cz: -6.0, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.8 } },           // FAR dock corner long propeller
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 19, cz: 0, dy: 4.2, swing: { axis: 'x', amp: 0.6, speed: 2.4, phase: 2.6 } },     // buoy bobbing over the B1 entry void
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 19, cz: 6.5, dy: 2.0 },                                                          // NEAR flank hanging mooring chain (static)

    // --- BRANCH 1 (x20..31): flank capstans/booms, buoy over the reef void, swell. ---
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 23, cz: 6.6, spin: { axis: 'x', speed: 5, phase: 0.5 } },            // NEAR flank capstan beside the reef
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 21, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.5 } },             // FAR flank vertical capstan
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 30, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.1 } },           // FAR flank horizontal capstan
    { kind: 'menace', model: 'swiper_long', color: 'yellow', cx: 26, cz: 6.6, swing: { axis: 'z', amp: 0.7, speed: 2.1, phase: 2.4 } },           // NEAR flank boom over the reef
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 26, cz: 0, dy: 3.6, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 1.3 } },     // buoy bobbing over the B1 reef void
    { kind: 'menace', model: 'floor_net_4x4x1', color: 'red', cx: 23, cz: 8.0 },                                                                  // NEAR flank tangled fishing net (static)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 26, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.7 } },    // capstan churning deep in the B1 swell
    { kind: 'menace', model: 'ball', color: 'yellow', cx: 30, cz: 6.6 },                                                                          // NEAR flank buoy (landing, static)

    // --- Dock C / rejoin (x31..37): corner props + booms + crown buoy + swell. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 32, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.5 } },                   // NEAR dock corner propeller
    { kind: 'menace', model: 'hammer_large', color: 'yellow', cx: 36, cz: -6.0, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 3.0 } },         // FAR dock corner anchor hammer
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 32, cz: -6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.0 } },                // FAR dock corner long propeller
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 34, cz: -3.0, dy: 4.6, swing: { axis: 'x', amp: 0.5, speed: 2.0, phase: 0.9 } },  // mooring buoy floating over the dock
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 36, cz: 6.5, spin: { axis: 'x', speed: 4, phase: 1.4 } },              // NEAR flank vertical capstan
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 34, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.1 } },    // capstan in the dock-C swell

    // --- BRANCH 2 (x39..50): the prop-gap stretch — flank propellers/booms/capstans, pit props. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 41, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.9 } },                 // NEAR flank long propeller (seg1)
    { kind: 'menace', model: 'hammer', color: 'yellow', cx: 47, cz: -6.0, swing: { axis: 'x', amp: 0.7, speed: 2.2, phase: 0.6 } },               // FAR flank anchor hammer over the SAFE gap
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 41, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 1.9 } },           // FAR flank tumbling capstan (seg1)
    { kind: 'menace', model: 'swiper', color: 'green', cx: 49, cz: 6.4, swing: { axis: 'z', amp: 0.7, speed: 2.4, phase: 0.1 } },                 // NEAR flank boom past the prop-gap (seg2)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 49, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.0 } },             // FAR flank vertical capstan (seg2)
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 46, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 1.3 } },     // buoy bobbing over the B2 prop-gap void
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 46, cz: 0, dy: -3.8 },                                                             // extra propeller deep in the B2 swell (static decor)
    { kind: 'menace', model: 'barrier_2x1x2', color: 'blue', cx: 39, cz: 8.0 },                                                                   // NEAR flank dock crate piling (static)
    { kind: 'menace', model: 'barrier_2x1x2', color: 'red', cx: 50, cz: 8.0 },                                                                    // NEAR flank dock crate piling (static)
    { kind: 'menace', model: 'floor_net_4x4x1', color: 'green', cx: 44, cz: -7.5, ry: 90 },                                                       // FAR flank fishing net (static)

    // --- Dock D / capstan dock (x50..56) + M3 current (x57..63): corner props, crowns, capstans, swell. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 51, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },              // NEAR dock corner double propeller
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 55, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 1.4 } },           // FAR dock corner tumbling capstan
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 51, cz: -3.0, dy: 3.6, swing: { axis: 'x', amp: 0.5, speed: 2.0, phase: 0.2 } },  // buoy crown over NW corner
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 55, cz: 3.0, dy: 3.6, swing: { axis: 'x', amp: 0.5, speed: 2.0, phase: 1.6 } },   // buoy crown over SE corner
    { kind: 'menace', model: 'hammer_large', color: 'red', cx: 53, cz: 3.0, dy: 4.4, swing: { axis: 'x', amp: 0.6, speed: 2.5, phase: 2.0 } },    // capstan hammer sweeping over the dock center (high, clears walk)
    { kind: 'menace', model: 'saw_trap_long', color: 'green', cx: 60, cz: -6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.0 } },              // FAR flank long propeller over M3
    { kind: 'menace', model: 'swiper_long', color: 'red', cx: 60, cz: 6.2, swing: { axis: 'z', amp: 0.7, speed: 2.3, phase: 0.0 } },              // NEAR flank boom over M3
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 60, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.5 } },      // vertical capstan in the M3 swell

    // --- Dock E split (x63..69): the narrows landmark — big propellers, booms, crown, swell. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 64, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.2 } },                   // NEAR dock corner propeller
    { kind: 'menace', model: 'swiper', color: 'green', cx: 68, cz: 6.6, swing: { axis: 'z', amp: 0.7, speed: 2.1, phase: 2.6 } },                 // NEAR dock corner sweeping boom
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 64, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 0.3 } },           // FAR dock corner tumbling capstan
    { kind: 'menace', model: 'saw_trap_long', color: 'blue', cx: 68, cz: -6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.4 } },               // FAR dock corner long propeller
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 66, cz: -3.0, dy: 4.6, swing: { axis: 'x', amp: 0.5, speed: 2.0, phase: 1.0 } },  // mooring buoy floating over the dock
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 70, cz: 0, dy: 4.2, swing: { axis: 'x', amp: 0.6, speed: 2.4, phase: 1.6 } },     // buoy bobbing over the B3 entry void
    { kind: 'menace', model: 'floor_net_4x4x1', color: 'blue', cx: 66, cz: -8.0 },                                                                // FAR flank big fishing net (static)

    // --- BRANCH 3 (x71..82): the narrows — flank propellers/capstans/booms, hung buoys, swell. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 74, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },                 // NEAR flank long propeller beside the reef
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 72, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 0.8 } },           // FAR flank tumbling capstan
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 80, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.3 } },             // FAR flank vertical capstan (landing)
    { kind: 'menace', model: 'swiper_long', color: 'yellow', cx: 77, cz: 6.6, swing: { axis: 'z', amp: 0.7, speed: 2.5, phase: 0.6 } },           // NEAR flank boom over the reef
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 77, cz: 0, dy: 3.6, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 2.6 } },     // buoy bobbing over the B3 reef void
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 77, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.9 } },    // capstan churning deep in the B3 swell
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 72, cz: 8.0, dy: 2.0 },                                                          // NEAR flank hanging mooring chain (static)
    { kind: 'menace', model: 'barrier_2x1x2', color: 'yellow', cx: 81, cz: 8.0 },                                                                 // NEAR flank dock crate piling (static)
    { kind: 'menace', model: 'ball', color: 'red', cx: 80, cz: 6.6 },                                                                             // NEAR flank buoy (landing, static)

    // --- Dock F rejoin (x82..88): corner props + booms + crown buoy + swell. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'yellow', cx: 83, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },            // NEAR dock corner double propeller
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 87, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 1.0 } },           // FAR dock corner tumbling capstan
    { kind: 'menace', model: 'hammer_large', color: 'green', cx: 83, cz: -6.4, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 1.7 } },          // FAR dock corner anchor hammer
    { kind: 'menace', model: 'hammer_large', color: 'green', cx: 85, cz: 3.0, dy: 4.4, swing: { axis: 'x', amp: 0.5, speed: 2.4, phase: 0.4 } },  // capstan hammer sweeping over the dock (high, clears walk)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 87, cz: 6.5, spin: { axis: 'x', speed: 4, phase: 0.4 } },              // NEAR flank vertical capstan
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 85, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.6 } },    // capstan in the dock-F swell

    // --- BRANCH 4 (x90..103): the FINALE — flank propellers/capstans/booms, hung buoys, swell. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 93, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },                 // NEAR flank long propeller beside the reef
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 91, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 0.8 } },           // FAR flank tumbling capstan
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 101, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.3 } },            // FAR flank vertical capstan (landing)
    { kind: 'menace', model: 'swiper_long', color: 'yellow', cx: 96, cz: 6.6, swing: { axis: 'z', amp: 0.7, speed: 2.5, phase: 1.4 } },           // NEAR flank boom over the reef
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 96, cz: 0, dy: 3.6, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 0.9 } },     // buoy bobbing over the B4 reef void
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 96, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.4 } },    // capstan churning deep in the B4 swell
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 91, cz: 8.0, dy: 2.0 },                                                          // NEAR flank hanging mooring chain (static)
    { kind: 'menace', model: 'barrier_2x1x2', color: 'yellow', cx: 101, cz: 8.0 },                                                                // NEAR flank dock crate piling (static)
    { kind: 'menace', model: 'floor_net_4x4x1', color: 'blue', cx: 99, cz: 8.0 },                                                                 // NEAR flank fishing net (static)

    // --- Dock G launch (x103..109) + finish lighthouse (x109..115): the harbor crescendo. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 104, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },             // NEAR flank double propeller by the springs
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 108, cz: -6.0, spin: { axis: 'x', speed: 5, phase: 1.0 } },          // FAR flank tumbling capstan by the springs
    { kind: 'menace', model: 'swiper', color: 'green', cx: 108, cz: 6.4, swing: { axis: 'z', amp: 0.7, speed: 2.3, phase: 1.7 } },                // NEAR flank sweeping boom
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 104, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.4 } },            // FAR flank vertical capstan
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 112, cz: -6.0, top: 10, swing: { axis: 'x', amp: 0.5, speed: 2.0, phase: 0.8 } }, // FAR flank buoy at the lighthouse
    { kind: 'menace', model: 'saw_trap_long', color: 'blue', cx: 112, cz: 6.6, top: 10, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },      // NEAR flank long propeller at the finish
    { kind: 'menace', model: 'flag_A', color: 'red', cx: 112, cz: -3.0, top: 10, dy: 1.0 },                                                       // signal flag on the lighthouse edge (static)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 106, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 5, phase: 0.2 } },   // capstan churning in the G swell
  ],

  // One spring PER LANE on launch dock G -> the lighthouse beacon (top 5 -> top 10;
  // spring rise ~4.9u, forward arc ~4u onto the tower whose near edge is x109). Whichever
  // lane you arrive in (z -3 / +3) or the center, a spring lifts you up the harbor's end tower.
  springs: [
    { cx: 106, cz: -3 },   // SAFE-lane spring
    { cx: 106, cz: 3 },    // RISKY-lane spring
    { cx: 106, cz: 0 },    // center (dock-walked) spring
  ],

  // Reward differentiates the lanes: each RISKY (near, z=+3) line pays ~3x its SAFE (far,
  // z=-3) sibling (safe 1 / risky 3 per branch), and the reward IS the risk — a "doubloon"
  // arc coin sits ON the jump over each reef / prop-gap. Docks (z=0) + the lighthouse hold
  // the rest. 4 branches x (1 safe + 3 risky) + docks/spine + tower.
  coins: [
    { x: 3,  y: 6.4, z: 0 },     // A start dock
    { x: 9,  y: 6.4, z: 0 },     // M1 tideway

    // Branch 1 (reef)  — safe 1 / risky 3
    { x: 26, y: 6.4, z: -3 },    // safe lane (clear)
    { x: 21, y: 6.4, z: 3 },     // risky entry
    { x: 26, y: 7.2, z: 3 },     // risky: arc over the reef        (reward)
    { x: 30, y: 6.4, z: 3 },     // risky landing                  (reward)

    { x: 34, y: 6.4, z: 0 },     // C rejoin dock

    // Branch 2 (prop-gap)  — safe 1 / risky 3
    { x: 41, y: 6.4, z: -3 },    // safe w2 bridge (before the comfy 3u gap)
    { x: 41, y: 6.4, z: 3 },     // risky entry
    { x: 46, y: 7.2, z: 3 },     // risky: arc over the 4u prop-gap (reward)
    { x: 49, y: 6.4, z: 3 },     // risky landing                  (reward)

    { x: 53, y: 6.4, z: 0 },     // D capstan dock
    { x: 60, y: 6.4, z: 0 },     // M3 tideway

    // Branch 3 (reef)  — safe 1 / risky 3
    { x: 77, y: 6.4, z: -3 },    // safe lane (clear)
    { x: 72, y: 6.4, z: 3 },     // risky entry
    { x: 77, y: 7.2, z: 3 },     // risky: arc over the reef        (reward)
    { x: 81, y: 6.4, z: 3 },     // risky landing                  (reward)

    { x: 85, y: 6.4, z: 0 },     // F rejoin dock

    // Branch 4 (finale reef, top payout)  — safe 1 / risky 3
    { x: 96, y: 6.4, z: -3 },    // safe lane (clear)
    { x: 91, y: 6.4, z: 3 },     // risky entry
    { x: 96, y: 7.2, z: 3 },     // risky: arc over the reef        (reward)
    { x: 101, y: 6.4, z: 3 },    // risky landing                  (reward)

    { x: 106, y: 6.4, z: 0 },    // G launch dock — "land ho" coin before the climb
    { x: 112, y: 11.4, z: 0 },   // atop the lighthouse beacon
  ],

  decor: [
    { kind: 'arrow', cx: 5, cz: 0 },           // set sail, into the lagoon
    { kind: 'arrow', cx: 13.5, cz: -3 },       // signpost the SAFE lane at dock B
    { kind: 'pipeArch', cx: 34, color: 'red' },// coral arch framing rejoin C
    { kind: 'portal', cx: 34, cz: 0, color: 'green' }, // green portal buoy at rejoin C
    { kind: 'gantry', cx: 46 },                // grey gangway over the two-hard-ways stretch
    { kind: 'portal', cx: 66, cz: 0, color: 'blue' },  // portal buoy at the final-third split dock E
    { kind: 'gantry', cx: 85 },                // gangway landmark at rejoin F
    { kind: 'arrow', cx: 109.5, cz: 0 },       // point at the spring -> lighthouse beacon
  ],
};
