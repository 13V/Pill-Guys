// Level 10 — "Total Chaos" (THE GRAND FINALE, longest + most chaotic, ~148u).
//
// This is the campaign's blow-out finale: the LONGEST course (finish near-edge
// x=148) with the MOST route choice of any level — SIX branch splits, each a
// SAFE lane (far, z=-3, cool blue/green) vs a genuinely-harder RISKY/REWARD lane
// (near, z=+3, warm red/yellow) that forks off a w6 hub and rejoins at the next
// w6 hub. The MIDDLE of every branch (z -2..+2) is intentionally EMPTY so you must
// COMMIT to a side; both lanes independently run spawn -> finish. The challenge
// TYPE is varied across the six branches so the finale never repeats itself:
//   SPLIT 1  B (x22..35)  GAUNTLET     — SAFE clear strip / RISKY belt-fed size-4
//            spike gauntlet (cx29, 5u runway x22..27 + 4u landing x31..35).
//   SPLIT 2  C (x41..54)  GAP-CHAIN    — SAFE two 3u gaps / RISKY two-seg 4u gap
//            (x46..50) over a sawblade spinning IN the pit on the z=3 line.
//   SPLIT 3  E (x74..87)  SAW-PIT      — SAFE clear strip / RISKY 4u jump-gap
//            (x79..83) over a saw spinning in the pit; belt-boosted run-up/landing.
//   SPLIT 4  F (x93..106) GAUNTLET #2  — SAFE clear strip / RISKY belt-fed size-4
//            spike gauntlet (cx100, 5u runway x93..98 + 4u landing x102..106).
//   SPLIT 5  G (x112..125) GAP-CHAIN#2 — SAFE two 3u gaps / RISKY two-seg 4u gap
//            (x117..121) over a saw in the pit; belt-boosted.
//   SPLIT 6  H (x131..143) SAW-PIT #2  — SAFE clear strip / RISKY 4u jump-gap
//            (x135..139) over a saw in the pit, then onto the spring deck.
// Spring deck J (x141..147) launches WHICHEVER lane up the victory tower (top 10).
//
// RISKY SHORTCUT (the time-save, same idea as level5/level1): in a constant-run
// game speed is the only way to go faster, so EVERY risky (near, z=+3) lane is
// BOOSTED by FORWARD CONVEYORS `conveyor {cz:3, w:4}` (span z1..5 — they NEVER
// touch the z=-3 SAFE lane). The belt pushes +X (CONVEYOR_SPEED on top of the base)
// so the risky runner moves ~12 u/s vs SAFE's 8 — a real Fall-Guys shortcut. As the
// longest level the boost is GENEROUS: a forward belt on every risky run-up + landing
// (all six branches) AND the near half (cz3, w4 -> z1..5) of HALF the shared hubs
// (B, D, F, H), boosting the risky lane ACROSS those hubs while SAFE walks at 8. The
// belts sit BEFORE/AFTER each lethal gate, NEVER over the spike cells or the gap
// pits, so you still jump every gauntlet/saw-gap. Both lanes stay flat, fixed-z and
// fully followable; the risky lane is pure SPEED + 3x coins.
//
// TWO CLASSES OF HAZARD, kept strictly separate:
//   (1) DECORATIVE CHAOS — animated `menace` props with NO lethal flag (no death
//       box, can NEVER block a lane). The FULL roster, packed DENSE everywhere: on
//       the FAR flank (z<=-5.5), the NEAR flank (z>=+5.5), ABOVE every empty branch
//       middle (high dy, clear of the jump arc), on every hub CORNER, and DOWN in
//       the PITS (negative dy). Autoplay walks straight past them — INTENDED; a
//       human dodges, the danger reads purely visually. Phases varied heavily so the
//       whole finale saws, sweeps, hammers and swings at once. It looks INSANE.
//   (2) REAL LETHAL GATES — ONLY two kinds, and ONLY on a risky lane that has a
//       safe landing: (a) size-4 `spikes` gauntlets (jump them), and (b) jump-GAPS
//       between consecutive lane decks (4u here, autoplay full-jumps them), some with
//       a `lethal` sawblade spinning in the pit you leap over. NOTHING lethal ever
//       sits on a walkable lane except these — so autoplay clears every lane at 0
//       deaths while a human still threads a writhing meat-grinder.
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
// Limits (LEVELS_DESIGN.md): jump reach ~5u, gaps <=5u (RISKY maxes at 4u here),
// step-ups <=3u, gauntlet size 4 with >=4u runway + >=3u landing, widths >=2. Hubs
// are w6 (z-3..+3 so both lanes land). Verified: both lanes REACH FINISH, deaths=0.
export default {
  name: 'Total Chaos',
  theme: 'red',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    // ===================== SHARED SPINE START =====================
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'green' },     // A spawn hub        x:0..6   — cool-green finale gate opens the chaos
    { kind: 'conveyor', cx: 11, cz: 0, len: 8, w: 6, color: 'blue' },                // M1 spine belt (+X), w6 spans both lanes  x:7..15  — COOL blue shared breather

    // ===================== SPLIT 1 — B (x22..35): GAUNTLET =====================
    { kind: 'platform', cx: 19, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // B split hub        x:16..22  — bright first decision point
    { kind: 'conveyor', cx: 19, cz: 3, len: 4, w: 4, color: 'red' },                 // B hub NEAR boost   x:17..21  (cz3 -> z1..5: risky-only +X; SAFE at z-3 untouched) — WARM red boost
    { kind: 'strip', x0: 22, x1: 35, z: -3, w: 2, color: 'blue' },                   // B1 SAFE (far)      x:22..35  (clear, slower) — COOL blue = SAFE
    { kind: 'strip', x0: 22, x1: 35, z:  3, w: 2, color: 'red' },                    // B1 RISKY (near)    x:22..35  (gauntlet cx29: runway x22..27, land x31..35) — WARM red = RISKY
    { kind: 'conveyor', cx: 24, cz: 3, len: 4, w: 4, color: 'yellow' },              // B1 RISKY run-up belt x:22..26  (+X ~12u/s into the gauntlet leap; ends before spikes x27..31)
    { kind: 'conveyor', cx: 33, cz: 3, len: 4, w: 4, color: 'yellow' },              // B1 RISKY landing belt x:31..35 (+X ~12u/s off the gauntlet -> hub C)

    { kind: 'platform', cx: 38, cz: 0, w: 6, d: 6, rails: true, color: 'green' },     // C rejoin/split hub x:35..41  (rejoin 1 + saw-arch; entry split 2) — cool-green breather

    // ===================== SPLIT 2 — C (x41..54): GAP-CHAIN =====================
    { kind: 'strip', x0: 41, x1: 46, z: -3, w: 2, color: 'green' },                  // B2 SAFE seg1 (far) x:41..46  — COOL green = SAFE
    { kind: 'strip', x0: 49, x1: 54, z: -3, w: 2, color: 'green' },                  // B2 SAFE seg2 (far) x:49..54  (after a comfy 3u gap x46..49) — COOL green = SAFE
    { kind: 'strip', x0: 41, x1: 46, z:  3, w: 2, color: 'yellow' },                 // B2 RISKY seg1 (near) x:41..46 (saw spins in the 4u gap pit ahead) — WARM yellow = RISKY
    { kind: 'strip', x0: 50, x1: 54, z:  3, w: 2, color: 'yellow' },                 // B2 RISKY seg2 (near) x:50..54 (after a bigger 4u saw-gap x46..50) — WARM yellow = RISKY
    { kind: 'conveyor', cx: 43.5, cz: 3, len: 5, w: 4, color: 'red' },               // B2 RISKY run-up belt x:41..46 (+X ~12u/s into the 4u saw-gap leap x46..50)
    { kind: 'conveyor', cx: 52, cz: 3, len: 4, w: 4, color: 'red' },                 // B2 RISKY landing belt x:50..54 (+X ~12u/s off the saw-gap -> hub D)

    { kind: 'platform', cx: 57, cz: 0, w: 6, d: 6, rails: true, color: 'red' },       // D rejoin hub       x:54..60  (rejoin 2 + spikeblock center thread) — hot red hub
    { kind: 'conveyor', cx: 57, cz: 3, len: 4, w: 4, color: 'red' },                 // D hub NEAR boost   x:55..59  (cz3 -> z2.5..3.5 walked, clear of the center thread; SAFE z-3 untouched)
    { kind: 'conveyor', cx: 64, cz: 0, len: 8, w: 6, color: 'blue' },                // M3 spine belt (+X), w6 spans both lanes  x:60..68  — COOL blue shared breather

    // ===================== SPLIT 3 — E (x74..87): SAW-PIT =====================
    { kind: 'platform', cx: 71, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },    // E split hub        x:68..74  — bright mid decision point
    { kind: 'strip', x0: 74, x1: 87, z: -3, w: 2, color: 'blue' },                   // B3 SAFE (far)      x:74..87  (clear, walks onto hub F) — COOL blue = SAFE
    { kind: 'strip', x0: 74, x1: 79, z:  3, w: 2, color: 'red' },                    // B3 RISKY seg1 (near) x:74..79 (saw spins in the 4u gap pit ahead) — WARM red = RISKY
    { kind: 'strip', x0: 83, x1: 87, z:  3, w: 2, color: 'red' },                    // B3 RISKY seg2 (near) x:83..87 (after a 4u saw-gap x79..83) — WARM red = RISKY
    { kind: 'conveyor', cx: 76.5, cz: 3, len: 5, w: 4, color: 'yellow' },            // B3 RISKY run-up belt x:74..79 (+X ~12u/s into the 4u saw-gap leap x79..83)
    { kind: 'conveyor', cx: 85, cz: 3, len: 4, w: 4, color: 'yellow' },              // B3 RISKY landing belt x:83..87 (+X ~12u/s off the saw-gap -> hub F)

    { kind: 'platform', cx: 90, cz: 0, w: 6, d: 6, rails: true, color: 'green' },     // F rejoin/split hub x:87..93  (rejoin 3 + saw-arch; entry split 4) — cool-green breather

    // ===================== SPLIT 4 — F (x93..106): GAUNTLET #2 =====================
    { kind: 'conveyor', cx: 90, cz: 3, len: 4, w: 4, color: 'red' },                 // F hub NEAR boost   x:88..92  (cz3 -> z1..5: risky-only +X; SAFE at z-3 untouched)
    { kind: 'strip', x0: 93, x1: 106, z: -3, w: 2, color: 'blue' },                  // B4 SAFE (far)      x:93..106 (clear, slower) — COOL blue = SAFE
    { kind: 'strip', x0: 93, x1: 106, z:  3, w: 2, color: 'red' },                   // B4 RISKY (near)    x:93..106 (gauntlet cx100: runway x93..98, land x102..106) — WARM red = RISKY
    { kind: 'conveyor', cx: 95, cz: 3, len: 4, w: 4, color: 'yellow' },              // B4 RISKY run-up belt x:93..97 (+X ~12u/s into the gauntlet leap; ends before spikes x98..102)
    { kind: 'conveyor', cx: 104, cz: 3, len: 4, w: 4, color: 'yellow' },             // B4 RISKY landing belt x:102..106 (+X ~12u/s off the gauntlet -> hub G)

    { kind: 'platform', cx: 109, cz: 0, w: 6, d: 6, rails: true, color: 'red' },      // G rejoin/split hub x:106..112 (rejoin 4 + spikeblock thread; entry split 5) — hot red hub

    // ===================== SPLIT 5 — G (x112..125): GAP-CHAIN #2 =====================
    { kind: 'strip', x0: 112, x1: 117, z: -3, w: 2, color: 'green' },                // B5 SAFE seg1 (far) x:112..117 — COOL green = SAFE
    { kind: 'strip', x0: 120, x1: 125, z: -3, w: 2, color: 'green' },                // B5 SAFE seg2 (far) x:120..125 (after a comfy 3u gap x117..120) — COOL green = SAFE
    { kind: 'strip', x0: 112, x1: 117, z:  3, w: 2, color: 'yellow' },               // B5 RISKY seg1 (near) x:112..117 (saw spins in the 4u gap pit ahead) — WARM yellow = RISKY
    { kind: 'strip', x0: 121, x1: 125, z:  3, w: 2, color: 'yellow' },               // B5 RISKY seg2 (near) x:121..125 (after a bigger 4u saw-gap x117..121) — WARM yellow = RISKY
    { kind: 'conveyor', cx: 114.5, cz: 3, len: 5, w: 4, color: 'red' },              // B5 RISKY run-up belt x:112..117 (+X ~12u/s into the 4u saw-gap leap x117..121)
    { kind: 'conveyor', cx: 123, cz: 3, len: 4, w: 4, color: 'red' },                // B5 RISKY landing belt x:121..125 (+X ~12u/s off the saw-gap -> hub H)

    { kind: 'platform', cx: 128, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // H final split hub  x:125..131 (rejoin 5; entry split 6) — bright final decision point
    { kind: 'conveyor', cx: 128, cz: 3, len: 4, w: 4, color: 'red' },                // H hub NEAR boost   x:126..130 (cz3 -> z1..5: risky-only +X; SAFE at z-3 untouched)

    // ===================== SPLIT 6 — H (x131..143): SAW-PIT #2 =====================
    { kind: 'strip', x0: 131, x1: 138, z: -3, w: 2, color: 'blue' },                 // B6 SAFE (far)      x:131..138 (clear, then a 3u gap onto spring deck J) — COOL blue = SAFE
    { kind: 'strip', x0: 131, x1: 135, z:  3, w: 2, color: 'red' },                  // B6 RISKY seg1 (near) x:131..135 (saw spins in the 4u gap pit ahead) — WARM red = RISKY
    { kind: 'strip', x0: 139, x1: 142, z:  3, w: 2, color: 'red' },                  // B6 RISKY seg2 (near) x:139..142 (after a 4u saw-gap x135..139) — WARM red = RISKY
    { kind: 'conveyor', cx: 133, cz: 3, len: 4, w: 4, color: 'yellow' },             // B6 RISKY run-up belt x:131..135 (+X ~12u/s into the 4u saw-gap leap x135..139)
    { kind: 'conveyor', cx: 140.5, cz: 3, len: 3, w: 4, color: 'yellow' },           // B6 RISKY landing belt x:139..142 (+X ~12u/s off the saw-gap -> spring deck J)

    // ===================== SPRING DECK + VICTORY TOWER =====================
    { kind: 'platform', cx: 144, cz: 0, w: 6, d: 6, color: 'green' },                // J spring deck      x:141..147 (rejoin 6; per-lane springs -> tower; 3u gap from SAFE x138, 4u-gap landing for RISKY) — cool launch pad
    { kind: 'conveyor', cx: 142, cz: 3, len: 2, w: 4, color: 'red' },                // J entry NEAR boost x:141..143 (risky-only +X off the saw-gap toward the cz3 spring; ends before the spring sensor) — WARM red boost
    { kind: 'finish', cx: 151, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },        // finish tower (w6 so every lane lands)  x:148..154 — celebratory gold victory tower
  ],

  hazards: [
    // =========================================================================
    // (2) REAL LETHAL GATES — the ONLY lethal hazards. Each sits on a RISKY (z=+3)
    // lane WITH a safe landing (size-4 gauntlets: >=4u runway + >=3u landing) or is a
    // saw spinning IN a 4u jump-gap pit (the GAP is the threat — you leap the saw).
    // SAFE (z=-3) lanes & the shared hubs are always clear. NOTHING lethal touches a
    // walkable lane except these, so autoplay clears every lane at 0 deaths.
    // =========================================================================
    { kind: 'spikes', cx: 29, cz: 3, size: 4 },                        // SPLIT1 B1 gauntlet (runway x22..27, land x31..35) — LETHAL on-line
    { kind: 'sawblade', cx: 48, cz: 3, lethal: true },                 // SPLIT2 B2: saw IN the 4u gap pit (x46..50) on the z=3 line — leap it
    { kind: 'sawblade', cx: 81, cz: 3, lethal: true },                 // SPLIT3 B3: saw IN the 4u gap pit (x79..83) on the z=3 line — leap it
    { kind: 'spikes', cx: 100, cz: 3, size: 4 },                       // SPLIT4 B4 gauntlet (runway x93..98, land x102..106) — LETHAL on-line
    { kind: 'sawblade', cx: 119, cz: 3, lethal: true },                // SPLIT5 B5: saw IN the 4u gap pit (x117..121) on the z=3 line — leap it
    { kind: 'sawblade', cx: 137, cz: 3, lethal: true },                // SPLIT6 B6: saw IN the 4u gap pit (x135..139) on the z=3 line — leap it

    // Warning cones (DECORATIVE — no death box): flag each risky on-the-line gate.
    { kind: 'cone', cx: 26.5, cz: 3 }, { kind: 'cone', cx: 31.5, cz: 3 },   // B1 gauntlet edges
    { kind: 'cone', cx: 45.5, cz: 3 }, { kind: 'cone', cx: 50.5, cz: 3 },   // B2 saw-gap edges
    { kind: 'cone', cx: 78.5, cz: 3 }, { kind: 'cone', cx: 83.5, cz: 3 },   // B3 saw-gap edges
    { kind: 'cone', cx: 97.5, cz: 3 }, { kind: 'cone', cx: 102.5, cz: 3 },  // B4 gauntlet edges
    { kind: 'cone', cx: 116.5, cz: 3 }, { kind: 'cone', cx: 121.5, cz: 3 }, // B5 saw-gap edges
    { kind: 'cone', cx: 134.5, cz: 3 }, { kind: 'cone', cx: 139.5, cz: 3 }, // B6 saw-gap edges

    // =========================================================================
    // (1) DECORATIVE CHAOS — animated `menace`, NO lethal flag (no death box, can
    // NEVER block a lane). The FULL roster, DENSE on FAR flank (z<=-5.5), NEAR flank
    // (z>=+5.5), ABOVE empty branch middles (high dy), on hub CORNERS, and DOWN in
    // PITS (negative dy). Phases varied so the whole finale writhes at once.
    // =========================================================================

    // --- A spawn hub + M1 spine (x0..15): greet with a wall of motion. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 1.5, cz: 6.0, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.0 } },          // NEAR flank spawn double saw
    { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 4.0, cz: -5.8, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.3 } },            // FAR flank spawn sweep
    { kind: 'menace', model: 'cannon_base', color: 'red', cx: 5.6, cz: 6.6, ry: -90 },                                                        // NEAR flank cannon (static, aimed in)
    { kind: 'menace', model: 'cannon_bullet', color: 'neutral', cx: 5.0, cz: 6.0, dy: 0.6 },                                                  // its bullet mid-flight (static)
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 3.0, cz: -3.0, dy: 4.2 },                                              // hub-corner hanger bracket (static)
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 3.0, cz: -3.0, dy: 2.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.0 } }, // spikeball swinging under it
    { kind: 'menace', model: 'swiper', color: 'yellow', cx: 11, cz: 6.4, spin: { axis: 'y', speed: 3, phase: 0.6 } },                         // NEAR flank sweep along the M1 belt
    { kind: 'menace', model: 'hammer', color: 'red', cx: 11, cz: -5.8, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.4 } },              // FAR flank hammer over the M1 belt
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 9, cz: 0, dy: -4.5 },                                                        // long chain into the spine pit (static)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 13, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.2 } }, // roller churning in the M1 pit
    { kind: 'menace', model: 'floor_spikes_trap_2x2x1', color: 'red', cx: 8, cz: 0, top: -3 },                                                // trap-spike bed under the spine

    // --- Hub B split (x16..22) + BRANCH 1 (x22..35): corner saws, hung middle, gauntlet flank. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 16.0, cz: 6.2, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },             // NEAR hub corner saw
    { kind: 'menace', model: 'swiper_double', color: 'green', cx: 20.0, cz: 6.4, spin: { axis: 'y', speed: 3, phase: 2.1 } },                 // NEAR hub corner double swiper
    { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 16.0, cz: -5.8, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.2 } },     // FAR hub corner big hammer
    { kind: 'menace', model: 'swiper_double_long', color: 'yellow', cx: 20.0, cz: -6.0, ry: 90, spin: { axis: 'y', speed: 3, phase: 2.8 } },  // FAR hub corner long double swiper
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 19, cz: 0, dy: 5.0 },                                                  // bracket over the B1 entry void
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 19, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2, phase: 2.6 } },   // ball swinging across the void (x)
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 26, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },             // NEAR flank long saw beside the gauntlet
    { kind: 'menace', model: 'hammer_spikes', color: 'green', cx: 29, cz: 6.6, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.4 } },      // NEAR flank spiked hammer over the gauntlet
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 24, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.5 } },         // FAR flank vertical roller
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 31, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.1 } },       // FAR flank horizontal roller
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 29, cz: 0, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 1.3 } },   // hung over the B1 gauntlet middle
    { kind: 'menace', model: 'chain_link', color: 'neutral', cx: 29, cz: 0, dy: 5.0 },                                                        // chain link above it (static)
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 29, cz: 0, dy: -4.6 },                                                             // bomb deep in the B1 pit (static)
    { kind: 'menace', model: 'floor_spikes_trap_2x2x1', color: 'red', cx: 24, cz: 8.0 },                                                      // NEAR flank trap floor spikes
    { kind: 'menace', model: 'spikeblock_down', color: 'yellow', cx: 22, cz: 6.5 },                                                           // NEAR flank spike block (B1 entry)

    // --- Hub C / saw-arch rejoin (x35..41) + BRANCH 2 gap-chain (x41..54). ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 35, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.5 } },               // NEAR hub corner saw
    { kind: 'sawblade', cx: 38, cz: 1.8 },                                                                                                    // saw-arch decor saw (right) — no lethal flag
    { kind: 'sawblade', cx: 38, cz: -1.8 },                                                                                                   // saw-arch decor saw (left)  — no lethal flag
    { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 41, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 3.0 } },                   // FAR hub corner quad swiper
    { kind: 'menace', model: 'spikeblock_omni', color: 'yellow', cx: 38, cz: -3.0, dy: 4.6 },                                                 // omni spikeblock crown over the hub (static)
    { kind: 'menace', model: 'swiper_quad_long', color: 'red', cx: 44, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.9 } },          // NEAR flank long quad sweep
    { kind: 'menace', model: 'hammer', color: 'yellow', cx: 47, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.6 } },           // FAR flank hammer over the SAFE gap
    { kind: 'menace', model: 'hammerblock', color: 'neutral', cx: 44, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.9 } },     // FAR flank hammer block
    { kind: 'menace', model: 'hammerblock_spikes', color: 'neutral', cx: 51, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.1 } }, // FAR flank spiked hammer block
    { kind: 'menace', model: 'swiper_long', color: 'green', cx: 51, cz: 6.4, spin: { axis: 'y', speed: 3, phase: 2.0 } },                     // NEAR flank long sweep past the saw-gap
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 48, cz: 0, dy: 3.4, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 1.3 } },   // hung over the B2 saw-gap middle
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 48, cz: 0, dy: 5.4 },                                                        // chain holding the spikeball (static)
    { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 48, cz: 1.4, dy: -4.8 },                                                          // bomb deep in the B2 saw-pit (static)
    { kind: 'menace', model: 'bomb_B', color: 'blue', cx: 48, cz: -1.4, dy: -4.8 },                                                           // a second bomb in the pit (static)
    { kind: 'menace', model: 'floor_spikes_curved_4x2x2', color: 'neutral', cx: 47, cz: -7.5, ry: 90 },                                       // FAR flank curved floor spikes
    { kind: 'menace', model: 'spikeblock_double_horizontal', color: 'blue', cx: 41, cz: 8.0 },                                               // NEAR flank double-h spike block

    // --- Hub D / spikeblock hub (x54..60) + M3 spine (x60..68). ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 54, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },          // NEAR hub corner double saw
    { kind: 'menace', model: 'swiper', color: 'red', cx: 58, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.4 } },                           // FAR hub corner swiper
    { kind: 'menace', model: 'spikeblock_up', color: 'red', cx: 57, cz: 1.4, swing: { axis: 'x', amp: 0.5, speed: 2, phase: 0.7 } },          // hub-center thread block (decor, off the cz3 walk)
    { kind: 'menace', model: 'spikeblock_up', color: 'red', cx: 57, cz: -1.4, swing: { axis: 'x', amp: 0.5, speed: 2, phase: 2.0 } },         // hub-center thread block (decor)
    { kind: 'menace', model: 'spikeblock_left', color: 'blue', cx: 54, cz: -3.0, dy: 3.6 },                                                   // spikeblock crown over NW corner (static)
    { kind: 'menace', model: 'chain_link_end_bottom', color: 'neutral', cx: 57, cz: 3.0, dy: 4.0 },                                           // chain bottom cap above the hub (static)
    { kind: 'menace', model: 'hammer', color: 'red', cx: 64, cz: 6.2, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.0 } },               // NEAR flank hammer over the M3 belt
    { kind: 'menace', model: 'saw_trap_long', color: 'green', cx: 64, cz: -6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.0 } },          // FAR flank long saw over the M3 belt
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 64, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.5 } },  // vertical roller in the M3 pit
    { kind: 'menace', model: 'ball', color: 'red', cx: 61, cz: -1.5, dy: -4.2, spin: { axis: 'y', speed: 4, phase: 0.0 } },                   // rolling ball in the M3 pit

    // --- Hub E split (x68..74) + BRANCH 3 saw-pit (x74..87). ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 68, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.2 } },               // NEAR hub corner saw
    { kind: 'menace', model: 'swiper_double_long', color: 'green', cx: 72, cz: 6.6, spin: { axis: 'y', speed: 3, phase: 2.6 } },              // NEAR hub corner long double swiper
    { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 68, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.3 } },       // FAR hub corner big hammer
    { kind: 'menace', model: 'swiper_quad_long', color: 'blue', cx: 72, cz: -6.4, spin: { axis: 'y', speed: 3, phase: 0.4 } },                // FAR hub corner long quad swiper
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 71, cz: 0, dy: 5.0 },                                                  // bracket over the B3 entry void
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 71, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2.2, phase: 1.6 } }, // ball swinging across the void (x)
    { kind: 'menace', model: 'floor_spikes_trap_4x4x1', color: 'blue', cx: 71, cz: -8.0 },                                                    // FAR flank big trap-spike field
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 78, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },             // NEAR flank long saw beside the saw-gap
    { kind: 'menace', model: 'hammer_large_spikes', color: 'yellow', cx: 81, cz: 6.6, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.6 } }, // NEAR flank big spiked hammer over the saw-gap
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 76, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.8 } },       // FAR flank horizontal roller
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 84, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.3 } },         // FAR flank vertical roller
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 81, cz: 0, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 2.6 } },   // hung over the B3 saw-gap middle
    { kind: 'menace', model: 'chain_link', color: 'neutral', cx: 81, cz: 0, dy: 5.0 },                                                        // chain link above it (static)
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 81, cz: 3, dy: -4.6 },                                                             // bomb in the B3 saw-gap pit (static)
    { kind: 'menace', model: 'spikeblock_right', color: 'yellow', cx: 86, cz: 8.0 },                                                          // NEAR flank sideways spike block

    // --- Hub F / saw-arch rejoin (x87..93) + BRANCH 4 gauntlet#2 (x93..106). ---
    { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 87, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.1 } },           // NEAR hub corner double saw
    { kind: 'sawblade', cx: 90, cz: 1.8 },                                                                                                    // saw-arch decor saw (right) — no lethal flag
    { kind: 'sawblade', cx: 90, cz: -1.8 },                                                                                                   // saw-arch decor saw (left)  — no lethal flag
    { kind: 'menace', model: 'swiper_quad', color: 'green', cx: 93, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 2.2 } },                    // FAR hub corner quad swiper
    { kind: 'menace', model: 'spikeblock_omni', color: 'green', cx: 90, cz: -3.0, dy: 4.6 },                                                  // omni spikeblock crown over the hub (static)
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 97, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.4 } },             // NEAR flank long saw beside the gauntlet
    { kind: 'menace', model: 'hammer_large_spikes', color: 'yellow', cx: 100, cz: 6.6, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.5 } }, // NEAR flank big spiked hammer over the gauntlet
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 95, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.0 } },         // FAR flank vertical roller
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 103, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.6 } },      // FAR flank horizontal roller
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 100, cz: 0, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.9 } },  // hung over the B4 gauntlet middle
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 100, cz: 0, dy: 5.4 },                                                       // chain above it (static)
    { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 100, cz: 0, dy: -4.6 },                                                           // bomb deep in the B4 pit (static)
    { kind: 'menace', model: 'spikeblock_left', color: 'red', cx: 93, cz: 8.0 },                                                              // NEAR flank sideways spike block

    // --- Hub G / spikeblock hub (x106..112) + BRANCH 5 gap-chain#2 (x112..125). ---
    { kind: 'menace', model: 'saw_trap', color: 'blue', cx: 106, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.9 } },                // NEAR hub corner saw
    { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 112, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.7 } },                  // FAR hub corner quad swiper
    { kind: 'menace', model: 'spikeblock_up', color: 'red', cx: 109, cz: 1.4, swing: { axis: 'x', amp: 0.5, speed: 2, phase: 1.1 } },         // hub-center thread block (decor)
    { kind: 'menace', model: 'spikeblock_up', color: 'red', cx: 109, cz: -1.4, swing: { axis: 'x', amp: 0.5, speed: 2, phase: 2.8 } },        // hub-center thread block (decor)
    { kind: 'menace', model: 'spikeblock_right', color: 'green', cx: 109, cz: 3.0, dy: 3.6 },                                                 // spikeblock crown over SE corner (static)
    { kind: 'menace', model: 'swiper_double_long', color: 'red', cx: 114, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 3, phase: 1.2 } },       // NEAR flank long double sweep
    { kind: 'menace', model: 'hammer', color: 'blue', cx: 118, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.5 } },            // FAR flank hammer over the SAFE gap
    { kind: 'menace', model: 'hammerblock_spikes', color: 'neutral', cx: 122, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.4 } }, // FAR flank spiked hammer block
    { kind: 'menace', model: 'saw_trap_long', color: 'green', cx: 122, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.9 } },          // NEAR flank long saw past the saw-gap
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 119, cz: 0, dy: 3.4, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.4 } },  // hung over the B5 saw-gap middle
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 119, cz: 0, dy: 5.4 },                                                       // chain holding it (static)
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 119, cz: 3, dy: -4.6 },                                                            // bomb in the B5 saw-gap pit (static)
    { kind: 'menace', model: 'floor_spikes_2x2x1', color: 'neutral', cx: 118, cz: -7.5 },                                                     // FAR flank floor spikes
    { kind: 'menace', model: 'spikeblock_double_vertical', color: 'red', cx: 125, cz: 8.0 },                                                  // NEAR flank double-v spike block

    // --- Hub H final split (x125..131) + BRANCH 6 saw-pit#2 (x131..143). ---
    { kind: 'menace', model: 'saw_trap_double', color: 'yellow', cx: 125, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.2 } },       // NEAR hub corner double saw
    { kind: 'menace', model: 'swiper_quad_long', color: 'blue', cx: 131, cz: -6.4, spin: { axis: 'y', speed: 3, phase: 0.7 } },               // FAR hub corner long quad swiper
    { kind: 'menace', model: 'spikeblock_down', color: 'blue', cx: 128, cz: -3.0, dy: 4.6 },                                                  // spikeblock crown over the hub (static)
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 128, cz: 0, dy: 5.0 },                                                 // bracket over the B6 entry void
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 128, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2.2, phase: 2.4 } }, // ball swinging across the void (x)
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 134, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.6 } },            // NEAR flank long saw beside the saw-gap
    { kind: 'menace', model: 'hammer_large_spikes', color: 'green', cx: 137, cz: 6.6, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.3 } }, // NEAR flank big spiked hammer over the saw-gap
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 133, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.4 } },      // FAR flank horizontal roller
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 141, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.8 } },        // FAR flank vertical roller
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 137, cz: 0, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.9 } },  // hung over the B6 saw-gap middle
    { kind: 'menace', model: 'chain_link', color: 'neutral', cx: 137, cz: 0, dy: 5.0 },                                                       // chain link above it (static)
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 137, cz: 3, dy: -4.6 },                                                            // bomb in the B6 saw-gap pit (static)
    { kind: 'menace', model: 'floor_spikes_2x2x1', color: 'neutral', cx: 133, cz: 8.0 },                                                      // NEAR flank floor spikes

    // --- Spring deck J (x141..147) + finish tower (x148..154): the crescendo. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 144, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },         // NEAR flank double saw by the springs
    { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 147, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.0 } },                  // FAR flank quad swiper by the springs
    { kind: 'menace', model: 'hammer_spikes', color: 'green', cx: 147, cz: 6.4, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.7 } },     // NEAR flank spiked hammer
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 144, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.4 } },      // FAR flank horizontal roller
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 151, cz: -6.0, top: 10, dy: 1.0 },                                     // FAR flank hanger at the finish (static bracket)
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 151, cz: -6.0, top: 10, dy: -0.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.8 } }, // hanging spikeball at the finish
    { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 151, cz: 6.6, top: 10, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.5 } },    // NEAR flank sweep into the finish
    { kind: 'menace', model: 'hammerblock', color: 'neutral', cx: 151, cz: -3.0, top: 10, dy: 1.0 },                                          // hammerblock prop on the tower edge (static)
    { kind: 'menace', model: 'hammerblock_spikes', color: 'neutral', cx: 151, cz: 3.0, top: 10, dy: 1.0 },                                    // spiked hammerblock prop (static)
    { kind: 'menace', model: 'ball', color: 'yellow', cx: 147, cz: 6.6, top: 10, dy: 0.5, spin: { axis: 'y', speed: 5, phase: 1.7 } },        // NEAR flank trophy ball at the finish
    { kind: 'menace', model: 'cannon_base', color: 'red', cx: 147, cz: -6.4, top: 10, ry: -90 },                                              // FAR flank confetti cannon at the finish (static)
    { kind: 'menace', model: 'cannon_bullet', color: 'neutral', cx: 146, cz: -5.8, top: 10, dy: 0.6 },                                        // its bullet (static)
    { kind: 'menace', model: 'chain_link_end_top', color: 'neutral', cx: 144, cz: 0, dy: -3.0 },                                             // chain top cap dangling into the J pit edge (static)
    { kind: 'menace', model: 'chain_link_end_bottom', color: 'neutral', cx: 144, cz: 0, dy: -5.0 },                                          // chain bottom cap below it (static)
  ],

  // One spring PER LANE on the rejoin/spring deck J -> the victory tower (top 5 ->
  // top 10; spring rise ~4.9u, forward arc ~4u over the 1u gap onto the tower whose
  // near edge is x148). Whichever lane you arrive in (z -3 / +3) or the center, a
  // spring lifts you up the finale tower.
  springs: [
    { cx: 144, cz: -3 },   // SAFE-lane spring
    { cx: 144, cz: 3 },    // RISKY-lane spring
    { cx: 144, cz: 0 },    // center (hub-walked) spring
  ],

  // Reward differentiates the lanes: each RISKY (near, z=+3) lane pays ~3x its SAFE
  // (far, z=-3) sibling (safe 1 / risky 3 on every branch), and the reward IS the
  // risk — an arc coin sits ON the jump over each gauntlet / saw-gap, exactly where
  // the danger is. Hubs (z=0) and the victory tower hold the rest.
  coins: [
    { x: 3, y: 6.4, z: 0 },                                  // A spawn hub
    { x: 11, y: 6.4, z: 0 },                                 // M1 spine

    // SPLIT 1 — gauntlet  (safe 1 / risky 3)
    { x: 29, y: 6.4, z: -3 },                                // safe (clear)
    { x: 24, y: 6.4, z: 3 }, { x: 29, y: 7.0, z: 3 }, { x: 32, y: 6.4, z: 3 }, // risky: entry + arc over gauntlet + landing

    { x: 38, y: 6.4, z: 0 },                                 // C rejoin / saw-arch hub

    // SPLIT 2 — gap-chain  (safe 1 / risky 3)
    { x: 44, y: 6.4, z: -3 },                                // safe seg1
    { x: 43, y: 6.4, z: 3 }, { x: 48, y: 7.0, z: 3 }, { x: 52, y: 6.4, z: 3 }, // risky: entry + arc over saw-gap + landing

    { x: 57, y: 6.4, z: 0 },                                 // D spikeblock hub
    { x: 64, y: 6.4, z: 0 },                                 // M3 spine

    // SPLIT 3 — saw-pit  (safe 1 / risky 3)
    { x: 81, y: 6.4, z: -3 },                                // safe (clear)
    { x: 76, y: 6.4, z: 3 }, { x: 81, y: 7.0, z: 3 }, { x: 85, y: 6.4, z: 3 }, // risky: entry + arc over saw-gap + landing

    { x: 90, y: 6.4, z: 0 },                                 // F rejoin / saw-arch hub

    // SPLIT 4 — gauntlet #2  (safe 1 / risky 3)
    { x: 100, y: 6.4, z: -3 },                               // safe (clear)
    { x: 95, y: 6.4, z: 3 }, { x: 100, y: 7.0, z: 3 }, { x: 104, y: 6.4, z: 3 }, // risky: entry + arc over gauntlet + landing

    { x: 109, y: 6.4, z: 0 },                                // G spikeblock hub

    // SPLIT 5 — gap-chain #2  (safe 1 / risky 3)
    { x: 115, y: 6.4, z: -3 },                               // safe seg1
    { x: 114, y: 6.4, z: 3 }, { x: 119, y: 7.0, z: 3 }, { x: 123, y: 6.4, z: 3 }, // risky: entry + arc over saw-gap + landing

    { x: 128, y: 6.4, z: 0 },                                // H final split hub

    // SPLIT 6 — saw-pit #2  (safe 1 / risky 3)
    { x: 135, y: 6.4, z: -3 },                               // safe (clear)
    { x: 133, y: 6.4, z: 3 }, { x: 137, y: 7.0, z: 3 }, { x: 141, y: 6.4, z: 3 }, // risky: entry + arc over saw-gap + landing

    { x: 144, y: 6.4, z: 0 },                                // J spring deck — "you made it" coin
    { x: 151, y: 11.4, z: 0 },                               // atop the victory tower
  ],

  decor: [
    { kind: 'arrow', cx: 5, cz: 0 },             // go right, into the first split
    { kind: 'arrow', cx: 16.5, cz: -3 },         // signpost the SAFE lane at hub B
    { kind: 'pipeArch', cx: 38 },                // red arch framing the saw hub (rejoin 1)
    { kind: 'portal', cx: 38, cz: 0 },           // green portal at the saw hub
    { kind: 'gantry', cx: 47 },                  // grey truss over the gap-chain stretch
    { kind: 'portal', cx: 57, cz: 0 },           // portal at the spikeblock hub (rejoin 2)
    { kind: 'gantry', cx: 71 },                  // truss landmark at the mid split hub
    { kind: 'pipeArch', cx: 90 },                // red arch framing the saw hub (rejoin 3)
    { kind: 'portal', cx: 109, cz: 0 },          // portal at the spikeblock hub (rejoin 4)
    { kind: 'gantry', cx: 119 },                 // truss over the final gap-chain
    { kind: 'arrow', cx: 128.5, cz: 3 },         // dare the RISKY lane at the final split
    { kind: 'arrow', cx: 147.5, cz: 0 },         // point at the spring -> victory tower
  ],
};
