// Level 6 — "Spinout Speedway" (a SAW-and-CONVEYOR speedway; chaotic multi-route).
//
// THEME: a runaway saw factory's test track. SAWS EVERYWHERE — spinning blades,
// long saw-traps and rollers churn on every flank, hub corner, empty middle and
// pit. The whole speedway buzzes. But the saws are almost all DECORATIVE set-
// dressing (animated `menace`/`sawblade`/`cone` with NO death box): the autoplay
// walks calmly past them; a human reads the danger visually and dodges. Only TWO
// kinds of hazard are ever LETHAL on a walked lane — (a) `spikes` gauntlets you
// JUMP, and (b) jump-GAPS in x you LEAP (sometimes with a low saw spinning in the
// pit, so you "jump over the saw"). A lethal saw is NEVER left standing on a lane.
//
// MULTI-ROUTE (more chaotic than L5's 3 splits — FOUR branch sections). Two lanes
// run the WHOLE way, spawn -> finish: a SAFE lane (far, z=-3, COOL blue/green) and
// a RISKY/REWARD lane (near, z=+3, WARM red/yellow). Each branch splits from a w6
// hub (spans z-3..+3 so both lanes land) and rejoins at the next w6 hub. The middle
// (z -2..+2) of every branch is intentionally EMPTY, so you MUST commit to a side;
// both lanes independently reach the finish. A ~2u forward gap off each hub makes
// entering a lane a deliberate hop.
//   Branch 1 (x23..34): conveyor-fed split. SAFE = clear strip. RISKY = a size-4
//     spike GAUNTLET (cx29, belt-pressured: 4u runway x23..27 + 3u landing x31..34).
//   Branch 2 (x42..53): "MIND THE GAP". SAFE breaks for a comfy 3u gap (x47..50).
//     RISKY breaks for a 4u gap (x47..51) with a sawblade spinning IN the pit on the
//     z=3 line — you LEAP over the saw. Both real; RISKY is harder, pays 3x.
//   Branch 3 (x61..72): conveyor-fed split. SAFE = clear strip. RISKY = a size-4
//     spike GAUNTLET (cx67, belt-pressured: runway x61..65 + landing x69..72).
//   Branch 4 (x79..86): the closer. SAFE = clear strip onto the spring deck. RISKY =
//     a 1u hop off hub E then a 3u gap (x83..86) with a sawblade in the pit on the
//     z=3 line — leap the saw onto the spring deck. RISKY pays 3x.
//
// RISKY SHORTCUT (the time-save; a constant-speed runner only gains by going FASTER):
// every RISKY (near, z=+3) lane is BOOSTED by FORWARD CONVEYORS `conveyor {cz:3, w:4}`
// (span z1..5 — they NEVER touch the z=-3 SAFE lane). The belt pushes +X (~12u/s vs
// SAFE's 8). Belts sit on each branch's run-up + landing and on the NEAR HALF of half
// the hubs (B, D, F) — boosting the risky runner ACROSS the hubs while SAFE walks them.
// Belts always sit BEFORE/AFTER the lethal cells, NEVER over the spike/saw cells, so
// you still jump every gauntlet/saw-gap. Risky finishes clearly faster, pays ~3x coins.
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
// Limits (LEVELS_DESIGN.md): jump reach ~5u, gaps <=5u (RISKY maxes at 4u here),
// step-ups <=3u, gauntlet size 4 with >=4u runway + >=3u landing, widths >=2.
// Hubs are w6 (z-3..+3). Verified 0 deaths on BOTH lanes (LANE=-3 and LANE=3).
export default {
  name: 'Spinout Speedway',
  theme: 'blue',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'blue' },     // A start hub        x: 0..6   — cool entrance to the saw track
    { kind: 'conveyor', cx: 11, cz: 0, len: 8, w: 6, color: 'green' },              // M1 belt (+X), w6 spans both lanes  x: 7..15  — shared cool breather

    // ---- BRANCH 1 (x23..34): conveyor-fed gauntlet split. 2u hop off hub B. ----
    { kind: 'platform', cx: 18, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },  // B split hub        x:15..21  — bright decision point
    { kind: 'conveyor', cx: 18, cz: 3, len: 6, w: 4, color: 'red' },                // B hub NEAR boost   x:15..21  (cz3 -> z1..5: risky-only +X; SAFE z-3 untouched)
    { kind: 'strip', x0: 23, x1: 34, z: -3, w: 2, color: 'blue' },                  // B1 SAFE (far)      x:23..34  (clear walk) — COOL = safe
    { kind: 'strip', x0: 23, x1: 34, z:  3, w: 2, color: 'red' },                   // B1 RISKY (near)    x:23..34  (gauntlet cx29) — WARM = risky
    { kind: 'conveyor', cx: 25,   cz: 3, len: 4, w: 4, color: 'yellow' },           // B1 RISKY run-up belt   x:23..27  (+X into the gauntlet leap; ends before spikes)
    { kind: 'conveyor', cx: 32.5, cz: 3, len: 3, w: 4, color: 'yellow' },           // B1 RISKY landing belt  x:31..34  (+X after the gauntlet -> hub C)

    { kind: 'platform', cx: 37, cz: 0, w: 6, d: 6, rails: true, color: 'green' },   // C rejoin hub       x:34..40  (rejoin 1 + pipe-arch saw gate)

    // ---- BRANCH 2 (x42..53): MIND THE GAP — SAFE 3u gap vs RISKY 4u gap-over-saw. ----
    { kind: 'strip', x0: 42, x1: 47, z: -3, w: 2, color: 'green' },                 // B2 SAFE seg1 (far) x:42..47
    { kind: 'strip', x0: 50, x1: 53, z: -3, w: 2, color: 'green' },                 // B2 SAFE seg2 (far) x:50..53  (after a comfy 3u gap x47..50)
    { kind: 'strip', x0: 42, x1: 47, z:  3, w: 2, color: 'yellow' },                // B2 RISKY seg1 (near) x:42..47 (saw spins in the gap pit on the z=3 line)
    { kind: 'conveyor', cx: 44.5, cz: 3, len: 5, w: 4, color: 'red' },              // B2 RISKY run-up belt x:42..47 (+X across seg1, into the 4u saw-gap leap)
    { kind: 'strip', x0: 51, x1: 53, z:  3, w: 2, color: 'yellow' },                // B2 RISKY seg2 (near) x:51..53 (after a 4u gap x47..51 over the saw)
    { kind: 'conveyor', cx: 52, cz: 3, len: 2, w: 4, color: 'red' },                // B2 RISKY landing belt x:51..53 (+X off the saw-gap landing -> hub D)

    { kind: 'platform', cx: 56, cz: 0, w: 6, d: 6, rails: true, color: 'blue' },    // D rejoin hub       x:53..59  (rejoin 2)
    { kind: 'conveyor', cx: 56, cz: 3, len: 6, w: 4, color: 'red' },                // D hub NEAR boost   x:53..59  (risky-only +X; SAFE z-3 untouched)

    // ---- BRANCH 3 (x61..72): conveyor-fed gauntlet split. 2u hop off hub D. ----
    { kind: 'strip', x0: 61, x1: 72, z: -3, w: 2, color: 'blue' },                  // B3 SAFE (far)      x:61..72  (clear walk)
    { kind: 'strip', x0: 61, x1: 72, z:  3, w: 2, color: 'red' },                   // B3 RISKY (near)    x:61..72  (gauntlet cx67)
    { kind: 'conveyor', cx: 63,   cz: 3, len: 4, w: 4, color: 'yellow' },           // B3 RISKY run-up belt   x:61..65  (+X into the gauntlet leap; ends before spikes)
    { kind: 'conveyor', cx: 70.5, cz: 3, len: 3, w: 4, color: 'yellow' },           // B3 RISKY landing belt  x:69..72  (+X after the gauntlet -> hub E)

    { kind: 'platform', cx: 75, cz: 0, w: 6, d: 6, rails: true, color: 'green' },   // E rejoin hub       x:72..78  (rejoin 3 + gantry saw landmark)

    // ---- BRANCH 4 (x79..86): the closer — SAFE clear vs RISKY 3u gap-over-saw. ----
    { kind: 'strip', x0: 80, x1: 86, z: -3, w: 2, color: 'blue' },                  // B4 SAFE (far)      x:80..86  (clear walk onto spring deck)
    { kind: 'strip', x0: 79, x1: 83, z:  3, w: 2, color: 'yellow' },                // B4 RISKY seg1 (near) x:79..83 (1u hop off hub E, then a 4u run-up to the leap)
    { kind: 'conveyor', cx: 81, cz: 3, len: 4, w: 4, color: 'red' },                // B4 RISKY run-up belt x:79..83 (+X across the run-up, into the 3u saw-gap leap x83..86)

    { kind: 'platform', cx: 89, cz: 0, w: 6, d: 6, color: 'green' },                // F spring deck      x:86..92  (rejoin 4; RISKY jumps a 4u saw-gap x82..86 onto it; per-lane springs -> tower)
    { kind: 'conveyor', cx: 87, cz: 3, len: 2, w: 4, color: 'red' },                // F entry NEAR boost x:86..88  (risky-only +X off the gap landing toward the cz3 spring; ENDS before the spring sensor)
    { kind: 'finish', cx: 92, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },        // finish tower (w6 so every lane lands)  x:89..95  — celebratory gold
  ],
  hazards: [
    // ===========================================================================
    // GAMEPLAY HAZARDS — the only LETHAL ones (on-line spikes + saw-in-the-gap).
    // Every lethal sits on a RISKY (near, z=+3) lane with a clear landing; SAFE
    // (far, z=-3) lanes and the shared hubs are always passable.
    // ===========================================================================
    { kind: 'spikes', cx: 29, cz: 3, size: 4 },                       // B1 gauntlet (runway x23..27, land x31..34) — LETHAL on-line
    { kind: 'sawblade', cx: 49, cz: 3, lethal: true },                // B2: low saw in the 4u gap pit (x47..51); leap over it (lethal box is small/low)
    { kind: 'spikes', cx: 67, cz: 3, size: 4 },                       // B3 gauntlet (runway x61..65, land x69..72) — LETHAL on-line
    { kind: 'sawblade', cx: 84.5, cz: 3 },                            // B4: saw spinning in the 3u gap pit (x83..86) on the z=3 line; the GAP is the threat (saw is decorative)

    // Warning cones (decorative): flag each RISKY lane's on-the-line hazard edges.
    { kind: 'cone', cx: 26.5, cz: 3 }, { kind: 'cone', cx: 31.5, cz: 3 },  // B1 gauntlet edges
    { kind: 'cone', cx: 46.5, cz: 3 }, { kind: 'cone', cx: 51.5, cz: 3 },  // B2 saw-gap jump edges
    { kind: 'cone', cx: 64.5, cz: 3 }, { kind: 'cone', cx: 69.5, cz: 3 },  // B3 gauntlet edges
    { kind: 'cone', cx: 82.5, cz: 3 }, { kind: 'cone', cx: 86.0, cz: 3 },  // B4 saw-gap jump edges

    // ===========================================================================
    // CHAOS DECOR — animated `menace`/`sawblade`/`cone`, NO lethal flag (no death
    // box, never blocks a lane). Spinout Speedway = SAWS EVERYWHERE: packed on the
    // FAR flank (z<=-5.5), NEAR flank (z>=+5.5), ABOVE the empty middles of gaps
    // (high dy, clears the jump arc), on hub CORNERS, and DOWN in PITS (negative dy).
    // Phases varied so every saw/roller/swing is out of lockstep — the track writhes.
    // ===========================================================================

    // --- A start hub + M1 belt (x0..15): saws greet you, sweeps on the flanks. ---
    { kind: 'menace', model: 'saw_trap', color: 'red', cx: 1.5, cz: 5.8, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.0 } },        // NEAR flank start saw
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 4.5, cz: -5.8, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.1 } },// FAR flank double saw
    { kind: 'menace', model: 'swiper', color: 'green', cx: 3, cz: 6.6, spin: { axis: 'y', speed: 3, phase: 0.6 } },                   // NEAR flank sweeper
    { kind: 'sawblade', cx: 8, cz: 6.4 },                                                                                              // NEAR flank decorative spinning saw (M1)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 11, cz: -6.0, dy: 0.5, spin: { axis: 'x', speed: 4, phase: 0.4 } }, // FAR flank roller over the belt
    { kind: 'menace', model: 'saw_trap_long', color: 'yellow', cx: 13, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.3 } },  // NEAR flank long saw
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 11, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 6, phase: 0.2 } },      // saw churning in the M1 pit

    // --- Hub B split (x15..21): corner saws + hung saw over the entry hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 16.0, cz: 6.2, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } }, // NEAR hub corner double saw
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 20.0, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.1 } },     // NEAR hub corner saw
    { kind: 'menace', model: 'swiper_double', color: 'green', cx: 16.0, cz: -5.8, spin: { axis: 'y', speed: 3, phase: 1.2 } },        // FAR hub corner double swiper
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 20.0, cz: -6.0, spin: { axis: 'y', speed: 4, phase: 2.8 } },// FAR hub corner vertical roller
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 22, cz: 0, dy: 4.2, spin: { axis: 'z', speed: 6, phase: 1.0 } },       // saw hung over the B1 entry void (middle)

    // --- BRANCH 1 (x23..34): flank saws/rollers, hung saw over the gauntlet, pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 26, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },     // NEAR flank long saw beside the gauntlet
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 33, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.9 } },       // NEAR flank saw (landing side)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 24, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.5 } }, // FAR flank vertical roller
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 31, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.1 } },// FAR flank horizontal roller
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 29, cz: 0, dy: 3.8, spin: { axis: 'z', speed: 6, phase: 1.3 } },       // saw hung over the B1 gauntlet middle
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 29, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 6, phase: 2.2 } },      // saw deep in the B1 pit

    // --- Hub C / pipe-arch saw gate (x34..40): corner saws + crown + pit. ---
    { kind: 'sawblade', cx: 37, cz: 1.8 },                                                                                             // saw gate decorative saw (right of arch)
    { kind: 'sawblade', cx: 37, cz: -1.8 },                                                                                            // saw gate decorative saw (left of arch)
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 35, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.5 } },       // NEAR hub corner saw
    { kind: 'menace', model: 'swiper_quad', color: 'green', cx: 39, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 3.0 } },            // FAR hub corner quad swiper
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 37, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 5, phase: 0.5 } }, // roller in the hub-C pit

    // --- BRANCH 2 (x42..53): long flank saws/swipers, hung saw over the saw-gap, pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 44, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.9 } },     // NEAR flank long saw (seg1)
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 52, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.0 } },       // NEAR flank saw (seg2)
    { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 44, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 0.6 } },             // FAR flank long swiper over the SAFE gap
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 51, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.1 } },// FAR flank roller
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 49, cz: 0, dy: 4.0, spin: { axis: 'z', speed: 6, phase: 1.3 } },       // saw hung over the B2 saw-gap middle
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 48.5, cz: 0, dy: -4.4, spin: { axis: 'x', speed: 6, phase: 0.7 } },    // saw deep in the B2 pit

    // --- Hub D rejoin (x53..59): corner saws + crown + pit. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 54, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } }, // NEAR hub corner double saw
    { kind: 'menace', model: 'saw_trap', color: 'red', cx: 58, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.3 } },          // NEAR hub corner saw
    { kind: 'menace', model: 'swiper', color: 'green', cx: 54, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.4 } },                 // FAR hub corner swiper
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 58, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.8 } }, // FAR hub corner vertical roller
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 56, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 5, phase: 0.5 } },      // saw in the hub-D pit

    // --- BRANCH 3 (x61..72): flank saws/rollers, hung saw over the gauntlet, pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 64, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },     // NEAR flank long saw beside the gauntlet
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 71, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.3 } },       // NEAR flank saw (landing side)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 62, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.8 } },// FAR flank horizontal roller
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 70, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.3 } }, // FAR flank vertical roller
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 67, cz: 0, dy: 3.8, spin: { axis: 'z', speed: 6, phase: 2.6 } },       // saw hung over the B3 gauntlet middle
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 67, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 6, phase: 0.9 } },      // saw deep in the B3 pit

    // --- Hub E / gantry saw landmark (x72..78): corner saws + crown + pit. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 73, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.2 } },       // NEAR hub corner saw
    { kind: 'menace', model: 'saw_trap_double', color: 'green', cx: 77, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.6 } }, // NEAR hub corner double saw
    { kind: 'menace', model: 'swiper_double_long', color: 'blue', cx: 73, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 0.3 } },      // FAR hub corner long double swiper
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 77, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.4 } },// FAR hub corner roller
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 75, cz: 0, dy: 4.4, spin: { axis: 'z', speed: 6, phase: 1.6 } },       // saw crown over the E hub
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 75, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 5, phase: 0.0 } },      // saw in the hub-E pit

    // --- BRANCH 4 (x80..86): flank saws, hung saw over the saw-gap, pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 84, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },     // NEAR flank long saw over the saw-gap
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 82, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.5 } }, // FAR flank vertical roller (saw-gap run-in)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 85, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.2 } },// FAR flank horizontal roller
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 84, cz: 0, dy: 3.8, spin: { axis: 'z', speed: 6, phase: 0.9 } },       // saw hung over the B4 saw-gap middle
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 84, cz: 0, dy: -4.2, spin: { axis: 'x', speed: 6, phase: 2.1 } },      // saw deep in the B4 pit

    // --- Hub F spring deck (x86..92) + finish tower (x89..95): saw-flanked crescendo. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 88, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } }, // NEAR flank double saw by the springs
    { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 91, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.0 } },           // FAR flank quad swiper by the springs
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 92, cz: 6.6, top: 10, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } }, // NEAR flank long saw at the finish tower
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 88, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.4 } },// FAR flank roller by the springs
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 92, cz: -6.0, top: 10, spin: { axis: 'y', speed: 6, phase: 0.8 } },    // FAR flank trophy saw at the finish
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 89, cz: 0, dy: -3.4, spin: { axis: 'x', speed: 5, phase: 1.2 } },      // saw in the F pit
  ],
  // One spring PER LANE on spring deck F -> the victory tower (top 5 -> top 10).
  // Whichever lane you arrive in (z -3 / +3) or the center, a spring lifts you up.
  springs: [
    { cx: 89, cz: -3 },   // SAFE-lane spring
    { cx: 89, cz: 3 },    // RISKY-lane spring
    { cx: 89, cz: 0 },    // center (hub-walked) spring
  ],
  // Reward differentiates the lanes: each RISKY (near, z=+3) lane pays ~3x its SAFE
  // (far, z=-3) sibling, with an arc coin sitting ON the jump over each gauntlet/gap.
  coins: [
    { x: 3,  y: 6.4, z: 0 },     // A spawn hub
    { x: 11, y: 6.4, z: 0 },     // M1 belt

    // Branch 1 (conveyor-fed gauntlet)  — safe 1 / risky 3
    { x: 29, y: 6.4, z: -3 },    // safe lane (clear)
    { x: 24, y: 6.4, z: 3 },     // risky entry
    { x: 29, y: 7.0, z: 3 },     // risky: arc over the gauntlet   (reward)
    { x: 32, y: 6.4, z: 3 },     // risky landing                  (reward)

    { x: 37, y: 6.4, z: 0 },     // C rejoin / saw gate

    // Branch 2 (mind the gap)  — safe 1 / risky 3
    { x: 44, y: 6.4, z: -3 },    // safe w2 bridge (before the comfy 3u gap)
    { x: 44, y: 6.4, z: 3 },     // risky entry
    { x: 49, y: 7.0, z: 3 },     // risky: arc over the 4u saw-gap (reward)
    { x: 52, y: 6.4, z: 3 },     // risky landing                  (reward)

    { x: 56, y: 6.4, z: 0 },     // D rejoin hub

    // Branch 3 (conveyor-fed gauntlet)  — safe 1 / risky 3
    { x: 67, y: 6.4, z: -3 },    // safe lane (clear)
    { x: 63, y: 6.4, z: 3 },     // risky entry
    { x: 67, y: 7.0, z: 3 },     // risky: arc over the gauntlet   (reward)
    { x: 70, y: 6.4, z: 3 },     // risky landing                  (reward)

    { x: 75, y: 6.4, z: 0 },     // E rejoin hub

    // Branch 4 (closer saw-gap)  — safe 1 / risky 3
    { x: 83, y: 6.4, z: -3 },    // safe lane (clear)
    { x: 81, y: 6.4, z: 3 },     // risky entry
    { x: 84, y: 7.0, z: 3 },     // risky: arc over the 4u saw-gap (reward)

    { x: 89, y: 6.4, z: 0 },     // F spring deck — "you made it" coin before the climb
    { x: 92, y: 11.4, z: 0 },    // atop the victory tower
  ],
  decor: [
    { kind: 'arrow', cx: 5, cz: 0 },          // go right, into the first split
    { kind: 'arrow', cx: 16.5, cz: -3 },      // signpost the SAFE lane at hub B
    { kind: 'pipeArch', cx: 37 },             // red arch framing the saw gate (rejoin 1)
    { kind: 'portal', cx: 37, cz: 0 },        // green portal at the saw gate
    { kind: 'gantry', cx: 75 },               // grey truss saw landmark at hub E
    { kind: 'arrow', cx: 90.5, cz: 0 },       // point at the spring -> victory tower
  ],
};
