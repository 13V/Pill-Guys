// Level 3 HAZARDS + springs — "Furnace Gaps" (HIGH-medium chaos, compressed ~66u).
//
// DIFFICULTY DIAL (the audit found old L3 had 4 lethal sensors — MORE than L4's 2 — an
// inversion). This build carries exactly ONE *placed* lethal hazard via the legacy
// `spikes`/`sawblade` kinds (the B1 gauntlet), PLUS a handful of `menace` jump-overs that
// are lethal ONLY on the RISKY lanes (never on a SAFE lane or a shared hub), so the
// guaranteed line stays L3 < L4. The bulk of the roster below is DECORATIVE menace.
//
// CHAOS ROSTER (this file's job): the FULL ~44-model hazard set is scattered across the
// level as animated `menace` props for Fall-Guys spectacle. They are placed in the SAFE
// zones so they NEVER block a walked lane:
//   * FAR flank   z <= -4.5  (beyond every SAFE z-3 strip, which spans z -4..-2)
//   * NEAR flank  z >= +5.5  (beyond every RISKY z+3 lane; the widest are w4 belts z 1..5)
//   * VOID MIDDLE z ~ 0 over a branch's X-range (no deck there) — chains/spikeballs HUNG
//     high above the gap (big dy) so the empty middle reads as a hazard pit, not a path.
//   * PITS BELOW  large negative dy (props sunk into the gap/pit floor, y ~ 0..3).
//   * HUB CORNERS the d6 hubs span z -3..+3, so corner props sit at z >= +5.5 / <= -4.5.
// Animations per the brief: saws/saw_trap -> spin y 7; swiper* -> spin y 3; spikeroller_*
// -> spin x 4; spikeball -> swing z amp .7 spd 2; hammer*/hammerblock* -> swing z amp .9
// spd 1.6; ball -> spin; chains/cannon/bomb -> static. Phases are varied so nothing is
// in lock-step. A FEW menace entries carry `lethal` (RISKY lanes only) as real jump-overs.
//
// LEGACY on-the-line hazards (unchanged): the B1 spike gauntlet is the single genuinely
// lethal, on-the-walked-line challenge; the B2 pit sawblade stays decorative (the 4u jump
// is the challenge). Cones warn each risky lane.
export const hazards = [
  // ==========================================================================
  // ON-THE-LINE hazards (legacy kinds) — the actual gameplay risk. UNCHANGED.
  // ==========================================================================
  // entry hub C: decorative saw only (menace; no death sensor => never blocks)
  { kind: 'sawblade', cx: 12, cz: 0 },                       // decorative menace on hub C

  // BRANCH 1 risky lane (z+3): the level's ONE legacy lethal hazard — a size-2 spike
  // gauntlet right off the C hub (takeoff x14 over spikes x15..17 onto the belt x18).
  { kind: 'spikes', cx: 16, cz: 3, size: 2 },                // RISKY gauntlet (on the walked line)
  { kind: 'cone', cx: 14.5, cz: 3 },                         // warn the risky lane (gauntlet edge)
  { kind: 'cone', cx: 19, cz: 3 },                           // warn the risky lane (belt side)

  // BRANCH 2 risky lane (z+3, top8): DECORATIVE sawblade in the 4u pit (jump is the test).
  { kind: 'sawblade', cx: 52, cz: 3, top: 8 },               // decorative menace in the pit x50..54
  { kind: 'cone', cx: 49.5, cz: 3, top: 8 },                 // warn the risky lane (pit edge)
  { kind: 'cone', cx: 55, cz: 3, top: 8 },                   // warn the risky lane (landing)

  // ==========================================================================
  // CHAOS SCATTER — full roster as animated `menace` props (decorative unless noted).
  // Grouped by level section, west -> east. (cx,cz) = footprint center; y = top+dy.
  // ==========================================================================

  // --- SECTION A: spawn hub (x 0..6) + the first REAL jump-gap (x 6..10) -----
  // Hang a chain + spikeball over the gap (void middle, z~0) so the first leap feels
  // perilous; flank the spawn pad with swipers/saws on both far/near sides.
  { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 3, cz: -5.5, top: 5, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.2 } },         // FAR flank, spawn sweep
  { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 5, cz: 6, top: 5, ry: 90, spin: { axis: 'y', speed: 7 } },                          // NEAR flank, spawn buzz
  { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 8, cz: 0, top: 5, dy: 4.2 },                                                     // HUNG over the first gap (high, void middle)
  { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 8, cz: 0, top: 5, dy: 2.0, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.0 } },// spikeball swinging under the chain over the gap
  { kind: 'menace', model: 'chain_link_end_top', color: 'neutral', cx: 8, cz: -5.5, top: 5, dy: 3.0 },                                          // far-flank chain dressing (static)
  { kind: 'menace', model: 'bomb', color: 'neutral', cx: 8, cz: 0, top: 5, dy: -4.5 },                                                          // bomb in the pit below the first gap

  // --- SECTION C: B1 entry hub (x 10..14) + BRANCH 1 lanes (x 14..26) --------
  { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 12, cz: 6, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.0 } },         // NEAR hub corner saws
  { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 12, cz: -5.5, top: 5, dy: 1.2, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 1.5 } }, // FAR hub corner hanging spikeball
  { kind: 'menace', model: 'cannon_base', color: 'red', cx: 16, cz: 7, top: 5, ry: -90 },                                                       // NEAR flank cannon aimed at the gauntlet
  { kind: 'menace', model: 'cannon_bullet', color: 'neutral', cx: 16, cz: 6, top: 5, dy: 0.6 },                                                 // cannon's bullet (static, beside the lane)
  { kind: 'menace', model: 'swiper_double', color: 'green', cx: 20, cz: 6, top: 5, ry: 90, spin: { axis: 'y', speed: 3, phase: 2.1 } },         // NEAR flank sweep along the B1 belt
  { kind: 'menace', model: 'hammer', color: 'red', cx: 18, cz: -5.5, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.4 } },          // FAR flank hammer over the SAFE lane's flank
  { kind: 'menace', model: 'spikeblock_down', color: 'yellow', cx: 22, cz: -5.5, top: 5 },                                                      // FAR flank spike block (static menace)
  { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 19, cz: 0, top: 5, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 2.6 } }, // hung over the B1 void middle

  // --- SECTION R1: rejoin hub (x 22..26) + spine SPLIT (x 26..33) ------------
  { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 24, cz: 6, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.2 } },      // NEAR hub corner big hammer
  { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 29.75, cz: 6, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },        // NEAR flank long saw along the spine belt
  { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 29, cz: -5.5, top: 5, spin: { axis: 'y', speed: 3, phase: 3.0 } },               // FAR flank quad sweep
  { kind: 'menace', model: 'chain_link', color: 'neutral', cx: 30, cz: 0, top: 5, dy: 3.8 },                                                    // chain over the spine void middle
  { kind: 'menace', model: 'chain_link_end_bottom', color: 'neutral', cx: 30, cz: 0, top: 5, dy: 2.0 },                                         // chain end below it (static)
  { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 26, cz: -5.5, top: 5, spin: { axis: 'x', speed: 4, phase: 0.5 } },     // FAR flank vertical roller

  // --- SECTION F: spring #1 pad (x 33..37) -> rising arc to the raised section
  { kind: 'menace', model: 'hammer_spikes', color: 'green', cx: 35, cz: 6, top: 5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.4 } },    // NEAR flank spiked hammer by the spring
  { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 35, cz: -5.5, top: 5, spin: { axis: 'x', speed: 4, phase: 1.1 } },   // FAR flank horizontal roller
  { kind: 'menace', model: 'ball', color: 'blue', cx: 38, cz: 6.5, top: 5, dy: 0.5, spin: { axis: 'y', speed: 5, phase: 0.3 } },                // NEAR flank rolling ball
  { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 39, cz: -5.5, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.8 } },         // FAR flank saw along the spring arc

  // --- SECTION H: raised landing (top 8, x 41..47) + BRANCH 2 (top 8) --------
  // The raised section gets its own busy cluster up high; flanks again kept clear of lanes.
  { kind: 'menace', model: 'swiper_quad_long', color: 'red', cx: 44, cz: 6, top: 8, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.9 } },        // NEAR flank long quad sweep (raised)
  { kind: 'menace', model: 'hammer_large_spikes', color: 'yellow', cx: 44, cz: -5.5, top: 8, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.6 } }, // FAR flank big spiked hammer (raised)
  { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 46, cz: 0, top: 8, dy: 3.4, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 1.3 } }, // hung over the B2 void middle (raised)
  { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 46, cz: 0, top: 8, dy: 5.4 },                                                    // chain holding the raised spikeball
  { kind: 'menace', model: 'spikeblock_quad', color: 'red', cx: 48, cz: 7, top: 8 },                                                            // NEAR flank quad spike block
  { kind: 'menace', model: 'swiper', color: 'green', cx: 51, cz: -5.5, top: 8, spin: { axis: 'y', speed: 3, phase: 2.0 } },                     // FAR flank sweep (raised, by the SAFE lane flank)
  { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 52, cz: 0, top: 8, dy: -5.0 },                                                        // bomb deep in the B2 pit (decorative)
  { kind: 'menace', model: 'bomb_B', color: 'blue', cx: 52, cz: 0, top: 8, dy: -3.4 },                                                          // a second bomb in the pit
  { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 54, cz: 6, top: 8, spin: { axis: 'x', speed: 4, phase: 2.7 } },      // NEAR flank roller past the pit
  { kind: 'menace', model: 'hammerblock', color: 'neutral', cx: 47, cz: -5.5, top: 8, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.9 } }, // FAR flank hammer block (raised)
  { kind: 'menace', model: 'hammerblock_spikes', color: 'neutral', cx: 55, cz: -5.5, top: 8, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.1 } }, // FAR flank spiked hammer block

  // --- SECTION R2: rejoin + spring #2 (x 56..60) -> finish tower (x 62..66) --
  { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 58, cz: 6, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },        // NEAR hub corner saws by spring #2
  { kind: 'menace', model: 'swiper_double_long', color: 'yellow', cx: 58, cz: -5.5, top: 5, ry: 90, spin: { axis: 'y', speed: 3, phase: 2.8 } },// FAR hub corner long double sweep
  { kind: 'menace', model: 'swiper_long', color: 'green', cx: 60, cz: 6.5, top: 5, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.5 } },         // NEAR flank sweep into the finish
  { kind: 'menace', model: 'hammer', color: 'yellow', cx: 62, cz: -5.5, top: 10, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.2 } },      // FAR flank hammer at the finish tower
  { kind: 'menace', model: 'ball', color: 'red', cx: 64, cz: 6.5, top: 10, dy: 0.5, spin: { axis: 'y', speed: 5, phase: 1.7 } },                // NEAR flank rolling ball at the finish
  { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 64, cz: -6, top: 10, dy: 1.0, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.8 } }, // FAR flank hanging spikeball (finish)

  // --- REMAINING ROSTER coverage (distinct models not yet used), all in safe zones ---
  { kind: 'menace', model: 'floor_spikes_2x2x1', color: 'neutral', cx: 14, cz: -6, top: 5 },                                                    // FAR flank floor spikes (B1 entry)
  { kind: 'menace', model: 'floor_spikes_curved_4x2x2', color: 'neutral', cx: 26, cz: 6.5, top: 5, ry: 90 },                                    // NEAR flank curved floor spikes (R1)
  { kind: 'menace', model: 'floor_spikes_trap_2x2x1', color: 'red', cx: 24, cz: -6, top: 5 },                                                   // FAR flank trap floor spikes (R1)
  { kind: 'menace', model: 'floor_spikes_trap_4x4x1', color: 'yellow', cx: 44, cz: 7.5, top: 8 },                                               // NEAR flank big trap floor spikes (raised H)
  { kind: 'menace', model: 'spikeblock_left', color: 'blue', cx: 33, cz: 6.5, top: 5 },                                                         // NEAR flank spike block (spine)
  { kind: 'menace', model: 'spikeblock_right', color: 'green', cx: 33, cz: -6, top: 5 },                                                        // FAR flank spike block (spine)
  { kind: 'menace', model: 'spikeblock_omni', color: 'yellow', cx: 41, cz: 6.5, top: 8 },                                                       // NEAR flank omni spike block (raised entry)
  { kind: 'menace', model: 'spikeblock_double_horizontal', color: 'blue', cx: 56, cz: 6.5, top: 5 },                                            // NEAR flank double-h spike block (R2)
  { kind: 'menace', model: 'spikeblock_double_vertical', color: 'red', cx: 56, cz: -6, top: 5 },                                                // FAR flank double-v spike block (R2)
  { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 60, cz: -5.5, top: 5, spin: { axis: 'x', speed: 4, phase: 2.3 } },     // FAR flank vertical roller (finish run-in)
  { kind: 'menace', model: 'chain_link_end_top', color: 'neutral', cx: 46, cz: 0, top: 8, dy: 7.0 },                                            // top cap of the raised chain (static)

  // --- A FEW lethal menace jump-overs — RISKY LANES ONLY (near edge), never SAFE/hub ---
  // Real Fall-Guys hazards on the RISKY (near) corridor: small death boxes a human who
  // hugs the near rail must clear, but positioned on the OUTER half of the wide (w4, z 1..5)
  // risky belts — clear of the centered run line (z=3, capsule edge ~z3.4) by ~0.6u, so a
  // committed near-rail player is threatened while the clean line is safe. NONE sit on a
  // SAFE (z-3) lane, a shared (z0) hub, or a w2 strip.
  // B1 risky belt (top5, w4 conveyor x18..26, z 1..5): a spinning saw_trap on the near rail.
  { kind: 'menace', model: 'saw_trap', color: 'red', cx: 21, cz: 4.7, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.0 },
    lethal: true, lethalDy: 0.5, hx: 0.55, hy: 0.7, hzz: 0.55 },                                                                                // LETHAL near-rail hop (B1 belt; box z 4.15..5.25)
  // Raised B2 risky lane: the early boost belt off H (top8, w4 conveyor x47..49, z 1..5).
  { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 48, cz: 4.7, top: 8, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.4 },
    lethal: true, lethalDy: 0.5, hx: 0.55, hy: 0.7, hzz: 0.55 },                                                                                // LETHAL near-rail hop (B2 boost belt; box z 4.15..5.25)
];

export const springs = [
  // spring #1: pad F (cx35, top5) -> raised landing H (top8). Twins at cz -3/0/+3 so any lane launches.
  { cx: 35, cz: -3 }, { cx: 35, cz: 0 }, { cx: 35, cz: 3 },
  // spring #2: pad R2 (cx58, top5) -> finish tower (top10). Twins so any lane launches.
  { cx: 58, cz: -3 }, { cx: 58, cz: 0 }, { cx: 58, cz: 3 },
];
