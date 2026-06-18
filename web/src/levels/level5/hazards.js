// Level 5 HAZARDS + springs — "The Last Reactor" (FINALE, multi-route).
//
// THE DENSEST, MOST CHAOTIC LEVEL OF ALL 5 — a writhing reactor packed with the
// FULL ~41-model hazard roster (every model used >=1x; the saw/swiper/spikeblock
// families several times). See ../../../MULTI_ROUTE_DESIGN.md.
//
// TWO classes of hazard live here:
//   1) GAMEPLAY (lethal, on the walked line) — UNCHANGED from the audited finale.
//      Every lethal hazard sits ON a RISKY (near, z=+3) lane WITH a safe landing
//      (the size-4 spike gauntlets: >=4u runway + >=3u landing) or squeezes only
//      the CENTER of a hub (the spikeblock thread) — never the only path, never the
//      full width. SAFE (far, z=-3) lanes and the shared hubs are always passable.
//   2) CHAOS DECOR (the bulk below) — animated `menace` props with NO lethal flag,
//      so they carry NO death sensor and CANNOT block a lane. They are packed
//      BESIDE the lanes (FAR flank z<=-5.5, NEAR flank z>=+5.5), ABOVE the empty
//      middles of every gap (z -2..+2, high dy so they clear the jump arc), on every
//      hub CORNER, and DOWN IN THE PITS below the gaps (negative dy). Phases are
//      varied heavily so the whole reactor saws, sweeps, hammers and swings at once.
//
// GAMEPLAY layout (the only lethal hazards — identical to the beatable finale):
//  B1 RISKY gauntlet (cx29): size-4 spikes, conveyor-fed. z=+3 strip, 4u runway
//    (x23..27) + 3u landing (x31..34).
//  C saw hub: two DECORATIVE sawblades (no lethal flag) keep the reactor "saw hub".
//  B2 RISKY (cx49): a sawblade spins IN the 4u gap pit (x47..51) ON the z=3 line —
//    jump it. SAFE's sibling is a milder flat 3u gap (no saw).
//  D spikeblock thread (cx56): two spikeblocks at cz ±1.0 squeeze the CENTER of the
//    rejoin hub (death boxes z [-1.6,-0.6] & [0.6,1.6]; thread the z -0.6..+0.6 gap).
//  B3 RISKY (cx81 + cx88): the HARDEST line — a size-4 conveyor-fed gauntlet, THEN a
//    4u jump-gap (x86..90) with a sawblade spinning in the pit on the z=3 line.
export const hazards = [
  // ===========================================================================
  // GAMEPLAY HAZARDS — the only lethal ones (UNCHANGED, audited beatable finale).
  // ===========================================================================
  { kind: 'spikes', cx: 29, cz: 3, size: 4 },                       // B1 gauntlet (runway x23..27, land x31..34) — LETHAL on-line
  { kind: 'sawblade', cx: 37, cz: 1.8 },                            // saw hub C decor saw (right) — no lethal flag
  { kind: 'sawblade', cx: 37, cz: -1.8 },                           // saw hub C decor saw (left)  — no lethal flag
  { kind: 'sawblade', cx: 49, cz: 3 },                              // B2: saw in the 4u gap pit (x47..51); the GAP is the threat
  { kind: 'spikeblock', cx: 56, cz: 1.0, dir: 'up', color: 'red' }, // D center thread (right) — LETHAL, squeezes center only
  { kind: 'spikeblock', cx: 56, cz: -1.0, dir: 'up', color: 'red' },// D center thread (left)  — LETHAL, squeezes center only
  { kind: 'spikes', cx: 81, cz: 3, size: 4 },                       // B3 gauntlet (runway x75..79, land x83..86) — LETHAL on-line
  { kind: 'sawblade', cx: 88, cz: 3 },                              // B3: saw in the trailing 4u gap (x86..90); the GAP is the threat

  // Warning cones (decorative): flag each RISKY lane's on-the-line hazards.
  { kind: 'cone', cx: 26.5, cz: 3 }, { kind: 'cone', cx: 31.5, cz: 3 },  // B1 gauntlet edges
  { kind: 'cone', cx: 46.5, cz: 3 }, { kind: 'cone', cx: 51.5, cz: 3 },  // B2 saw-gap jump edges
  { kind: 'cone', cx: 78.5, cz: 3 },                                     // B3 gauntlet entry
  { kind: 'cone', cx: 85.5, cz: 3 }, { kind: 'cone', cx: 90.0, cz: 3 },  // B3 trailing saw-gap edges

  // ===========================================================================
  // CHAOS DECOR — animated `menace`, NO lethal flag (no death box, never blocks).
  // Packed on FAR flank (z<=-5.5), NEAR flank (z>=+5.5), ABOVE empty middles, on
  // hub CORNERS, and DOWN in PITS (negative dy). Phases varied so it all writhes.
  // ===========================================================================

  // --- A start hub + M1 belt (x0..15): spawn buzz, flank sweeps, hung middle. ---
  { kind: 'menace', model: 'saw_trap', color: 'red', cx: 1.5, cz: 6.0, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.0 } },         // NEAR flank spawn saw
  { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 4.0, cz: -5.8, top: 5, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.3 } },    // FAR flank spawn sweep
  { kind: 'menace', model: 'saw_trap_double', color: 'yellow', cx: 5.5, cz: 6.2, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.1 } },// NEAR flank double saw
  { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 3.0, cz: -3.0, top: 5, dy: 4.2 },                                       // hub corner hanger bracket (static)
  { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 3.0, cz: -3.0, top: 5, dy: 2.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.0 } }, // spikeball swinging under it
  { kind: 'menace', model: 'cannon_base', color: 'red', cx: 5.6, cz: 6.6, top: 5, ry: -90 },                                                // NEAR flank cannon (static, aimed in)
  { kind: 'menace', model: 'cannon_bullet', color: 'neutral', cx: 5.0, cz: 6.0, top: 5, dy: 0.6 },                                          // its bullet mid-flight (static)
  { kind: 'menace', model: 'swiper', color: 'yellow', cx: 11, cz: 6.4, top: 5, spin: { axis: 'y', speed: 3, phase: 0.6 } },                 // NEAR flank sweep along the M1 belt
  { kind: 'menace', model: 'hammer', color: 'red', cx: 11, cz: -5.8, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.4 } },      // FAR flank hammer over the M1 belt
  { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 9, cz: 0, top: 5, dy: -4.5 },                                                // long chain into the spine pit (static)
  { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 13, cz: 0, top: 5, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.2 } }, // roller churning in the M1 pit

  // --- Hub B split (x15..21): corner saws/hammers + hung middle over the entry hop. ---
  { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 16.0, cz: 6.2, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } }, // NEAR hub corner double saw
  { kind: 'menace', model: 'swiper_double', color: 'green', cx: 20.0, cz: 6.4, top: 5, spin: { axis: 'y', speed: 3, phase: 2.1 } },         // NEAR hub corner double swiper
  { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 16.0, cz: -5.8, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.2 } }, // FAR hub corner big hammer
  { kind: 'menace', model: 'swiper_double_long', color: 'yellow', cx: 20.0, cz: -6.0, top: 5, ry: 90, spin: { axis: 'y', speed: 3, phase: 2.8 } }, // FAR hub corner long double swiper
  { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 19, cz: 0, top: 5, dy: 5.0 },                                          // bracket over the B1 entry void
  { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 19, cz: 0, top: 5, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2, phase: 2.6 } }, // ball swinging across the void (x)
  { kind: 'menace', model: 'floor_spikes_2x2x1', color: 'neutral', cx: 14, cz: -6.5, top: 5 },                                              // FAR flank floor spikes (B entry)
  { kind: 'menace', model: 'spikeblock_down', color: 'yellow', cx: 22, cz: 6.5, top: 5 },                                                   // NEAR flank spike block (B1 entry)

  // --- BRANCH 1 (x23..34): flank rollers/hammers/saws, hung spikeball over the void, pit. ---
  { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 26, cz: 6.6, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },     // NEAR flank long saw beside the gauntlet
  { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 24, cz: -6.0, top: 5, spin: { axis: 'x', speed: 4, phase: 0.5 } }, // FAR flank vertical roller
  { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 31, cz: -6.0, top: 5, spin: { axis: 'x', speed: 4, phase: 1.1 } }, // FAR flank horizontal roller
  { kind: 'menace', model: 'hammer_spikes', color: 'green', cx: 29, cz: 6.6, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.4 } }, // NEAR flank spiked hammer over the gauntlet
  { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 29, cz: 0, top: 5, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 1.3 } }, // hung over the B1 void middle
  { kind: 'menace', model: 'chain_link', color: 'neutral', cx: 29, cz: 0, top: 5, dy: 5.0 },                                                // chain link above it (static)
  { kind: 'menace', model: 'floor_spikes_trap_2x2x1', color: 'red', cx: 24, cz: 8.0, top: 5 },                                              // NEAR flank trap floor spikes
  { kind: 'menace', model: 'bomb', color: 'neutral', cx: 29, cz: 0, top: 5, dy: -4.6 },                                                     // bomb deep in the B1 pit (static)
  { kind: 'menace', model: 'ball', color: 'blue', cx: 33, cz: 6.6, top: 5, dy: 0.5, spin: { axis: 'y', speed: 5, phase: 0.3 } },            // NEAR flank rolling ball (landing)

  // --- Hub C / saw hub (x34..40): corner saws + swipers + spikeblock crown + pit. ---
  { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 35, cz: 6.6, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.5 } },       // NEAR hub corner saw
  { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 39, cz: -6.0, top: 5, spin: { axis: 'y', speed: 3, phase: 3.0 } },           // FAR hub corner quad swiper
  { kind: 'menace', model: 'hammer_large_spikes', color: 'red', cx: 35, cz: -6.4, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.0 } }, // FAR hub corner big spiked hammer
  { kind: 'menace', model: 'spikeblock_omni', color: 'yellow', cx: 37, cz: -3.0, top: 5, dy: 4.6 },                                         // omni spikeblock crown floating over the hub (static)
  { kind: 'menace', model: 'spikeblock_quad', color: 'green', cx: 40, cz: 6.5, top: 5 },                                                    // NEAR flank quad spike block
  { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 37, cz: 0, top: 5, dy: -4.6 },                                                    // bomb in the saw-hub pit (static)
  { kind: 'menace', model: 'chain_link_end_top', color: 'neutral', cx: 37, cz: -3.0, top: 5, dy: 6.0 },                                     // chain top cap above the crown (static)

  // --- BRANCH 2 (x42..53): the gantry stretch — raised long swipers, big hammers, pit bombs. ---
  { kind: 'menace', model: 'swiper_quad_long', color: 'red', cx: 44, cz: 6.4, top: 5, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.9 } },  // NEAR flank long quad sweep
  { kind: 'menace', model: 'hammer', color: 'yellow', cx: 47, cz: -6.0, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.6 } },   // FAR flank hammer over the SAFE gap
  { kind: 'menace', model: 'hammerblock', color: 'neutral', cx: 44, cz: -6.0, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.9 } }, // FAR flank hammer block
  { kind: 'menace', model: 'hammerblock_spikes', color: 'neutral', cx: 51, cz: -6.0, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.1 } }, // FAR flank spiked hammer block
  { kind: 'menace', model: 'swiper_long', color: 'green', cx: 51, cz: 6.4, top: 5, spin: { axis: 'y', speed: 3, phase: 2.0 } },             // NEAR flank long sweep past the saw-gap
  { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 49, cz: 0, top: 5, dy: 3.4, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 1.3 } }, // hung over the B2 void middle
  { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 49, cz: 0, top: 5, dy: 5.4 },                                                // chain holding the spikeball (static)
  { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 49, cz: -1.2, top: 5, dy: -4.8 },                                                 // bomb deep in the B2 saw-pit (static)
  { kind: 'menace', model: 'bomb_B', color: 'blue', cx: 49, cz: 1.2, top: 5, dy: -4.8 },                                                    // a second bomb in the pit (static)
  { kind: 'menace', model: 'spikeblock_double_horizontal', color: 'blue', cx: 42, cz: 8.0, top: 5 },                                        // NEAR flank double-h spike block
  { kind: 'menace', model: 'spikeblock_double_vertical', color: 'red', cx: 53, cz: 8.0, top: 5 },                                           // NEAR flank double-v spike block
  { kind: 'menace', model: 'floor_spikes_curved_4x2x2', color: 'neutral', cx: 47, cz: -7.5, top: 5, ry: 90 },                              // FAR flank curved floor spikes

  // --- Hub D / spikeblock hub (x53..59) + M3 belt (x59..67): corner saws, crowns, rollers, pit. ---
  { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 54, cz: 6.4, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } }, // NEAR hub corner double saw
  { kind: 'menace', model: 'swiper', color: 'red', cx: 58, cz: -6.0, top: 5, spin: { axis: 'y', speed: 3, phase: 1.4 } },                   // FAR hub corner swiper
  { kind: 'menace', model: 'spikeblock_left', color: 'blue', cx: 54, cz: -3.0, top: 5, dy: 3.6 },                                           // spikeblock crown over NW corner (static)
  { kind: 'menace', model: 'spikeblock_right', color: 'green', cx: 58, cz: 3.0, top: 5, dy: 3.6 },                                          // spikeblock crown over SE corner (static)
  { kind: 'menace', model: 'chain_link_end_bottom', color: 'neutral', cx: 56, cz: 3.0, top: 5, dy: 4.0 },                                   // chain bottom cap above the hub (static)
  { kind: 'menace', model: 'hammer', color: 'red', cx: 63, cz: 6.2, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.0 } },       // NEAR flank hammer over the M3 belt
  { kind: 'menace', model: 'saw_trap_long', color: 'green', cx: 63, cz: -6.6, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.0 } },  // FAR flank long saw over the M3 belt
  { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 63, cz: 0, top: 5, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.5 } }, // vertical roller in the M3 pit
  { kind: 'menace', model: 'ball', color: 'red', cx: 60, cz: -1.5, top: 5, dy: -4.2, spin: { axis: 'y', speed: 4, phase: 0.0 } },           // rolling ball in the M3 pit

  // --- Hub E final split (x67..73): the truss landmark — big saws, swipers, crowns, pit. ---
  { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 68, cz: 6.6, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.2 } },       // NEAR hub corner saw
  { kind: 'menace', model: 'swiper_double_long', color: 'green', cx: 72, cz: 6.6, top: 5, spin: { axis: 'y', speed: 3, phase: 2.6 } },      // NEAR hub corner long double swiper
  { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 68, cz: -6.0, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.3 } }, // FAR hub corner big hammer
  { kind: 'menace', model: 'swiper_quad_long', color: 'blue', cx: 72, cz: -6.4, top: 5, spin: { axis: 'y', speed: 3, phase: 0.4 } },        // FAR hub corner long quad swiper
  { kind: 'menace', model: 'spikeblock_down', color: 'blue', cx: 70, cz: -3.0, top: 5, dy: 4.6 },                                           // spikeblock crown floating over the hub (static)
  { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 70, cz: 0, top: 5, dy: 5.0 },                                          // bracket over the B3 entry void
  { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 70, cz: 0, top: 5, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2.2, phase: 1.6 } }, // ball swinging across the void (x)
  { kind: 'menace', model: 'floor_spikes_trap_4x4x1', color: 'blue', cx: 70, cz: -8.0, top: 5 },                                            // FAR flank big trap-spike field

  // --- BRANCH 3 (x75..90): the HARDEST line — flank saws/rollers/hammers, hung balls, pit. ---
  { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 78, cz: 6.6, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },     // NEAR flank long saw beside the gauntlet
  { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 76, cz: -6.0, top: 5, spin: { axis: 'x', speed: 4, phase: 0.8 } }, // FAR flank horizontal roller
  { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 84, cz: -6.0, top: 5, spin: { axis: 'x', speed: 4, phase: 2.3 } }, // FAR flank vertical roller (saw-gap run-in)
  { kind: 'menace', model: 'hammer_large_spikes', color: 'yellow', cx: 81, cz: 6.6, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.6 } }, // NEAR flank big spiked hammer over the gauntlet
  { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 81, cz: 0, top: 5, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 2.6 } }, // hung over the B3 gauntlet void
  { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 88, cz: 0, top: 5, dy: 3.4, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.9 } }, // hung over the B3 saw-gap void
  { kind: 'menace', model: 'chain_link', color: 'neutral', cx: 88, cz: 0, top: 5, dy: 5.0 },                                                // chain link above it (static)
  { kind: 'menace', model: 'bomb', color: 'neutral', cx: 88, cz: 3, top: 5, dy: -4.6 },                                                     // bomb in the saw-gap pit (static)
  { kind: 'menace', model: 'bomb_B', color: 'green', cx: 81, cz: 8.0, top: 5, dy: 0 },                                                      // NEAR flank colored bomb (static)
  { kind: 'menace', model: 'spikeblock_left', color: 'red', cx: 76, cz: 8.0, top: 5 },                                                      // NEAR flank sideways spike block
  { kind: 'menace', model: 'spikeblock_right', color: 'yellow', cx: 86, cz: 8.0, top: 5 },                                                  // NEAR flank sideways spike block
  { kind: 'menace', model: 'floor_spikes_2x2x1', color: 'neutral', cx: 84, cz: 8.0, top: 5 },                                               // NEAR flank floor spikes

  // --- Hub F spring deck (x90..96) + finish tower (x97..103): the finale crescendo. ---
  { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 91, cz: 6.4, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } }, // NEAR flank double saw by the springs
  { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 95, cz: -6.0, top: 5, spin: { axis: 'y', speed: 3, phase: 1.0 } },           // FAR flank quad swiper by the springs
  { kind: 'menace', model: 'hammer_spikes', color: 'green', cx: 95, cz: 6.4, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.7 } }, // NEAR flank spiked hammer
  { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 91, cz: -6.0, top: 5, spin: { axis: 'x', speed: 4, phase: 0.4 } }, // FAR flank horizontal roller
  { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 100, cz: -6.0, top: 10, dy: 1.0 },                                      // FAR flank hanger at the finish tower (static bracket)
  { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 100, cz: -6.0, top: 10, dy: -0.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.8 } }, // hanging spikeball at the finish
  { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 100, cz: 6.6, top: 10, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.5 } },     // NEAR flank sweep into the finish
  { kind: 'menace', model: 'hammerblock', color: 'neutral', cx: 100, cz: -3.0, top: 10, dy: 1.0 },                                          // hammerblock prop on the tower edge (static)
  { kind: 'menace', model: 'hammerblock_spikes', color: 'neutral', cx: 100, cz: 3.0, top: 10, dy: 1.0 },                                    // spiked hammerblock prop (static)
  { kind: 'menace', model: 'ball', color: 'yellow', cx: 96, cz: 6.6, top: 10, dy: 0.5, spin: { axis: 'y', speed: 5, phase: 1.7 } },         // NEAR flank trophy ball at the finish
  { kind: 'menace', model: 'cannon_base', color: 'red', cx: 96, cz: -6.4, top: 10, ry: -90 },                                              // FAR flank cannon at the finish (static)
  { kind: 'menace', model: 'cannon_bullet', color: 'neutral', cx: 95, cz: -5.8, top: 10, dy: 0.6 },                                        // its bullet (static)
  { kind: 'menace', model: 'chain_link_end_top', color: 'neutral', cx: 93, cz: 0, top: 5, dy: -3.0 },                                       // chain top cap dangling into the F pit edge (static)
  { kind: 'menace', model: 'chain_link_end_bottom', color: 'neutral', cx: 93, cz: 0, top: 5, dy: -5.0 },                                    // chain bottom cap below it (static)
];

// One spring PER LANE on rejoin/spring deck F -> the victory tower (top 5 -> top 10;
// spring rise ≈4.9u, forward arc ≈4u onto the tower whose near edge is x97). Whichever
// lane you arrive in (z -3 / +3) or the center, a spring lifts you up the finale tower.
export const springs = [
  { cx: 93, cz: -3 },   // SAFE-lane spring
  { cx: 93, cz: 3 },    // RISKY-lane spring
  { cx: 93, cz: 0 },    // center (hub-walked) spring
];
