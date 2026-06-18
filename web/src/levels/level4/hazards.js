// Level 4 HAZARDS + springs — "Fracture Foundry" (multi-route, 2nd hardest, HIGH chaos).
//
// TRAVERSABILITY CONTRACT (unchanged): the only LETHAL hazards on a WALKED line are
// the B1 spike gauntlet (the `spikes` kind, jumped), the B2 in-pit sawblade (the 4u
// leap clears it), and the two CENTER spikeblocks on the rejoin hubs (z -0.6..+0.6;
// both side lanes z=±3 clear them by >2u). A FEW `menace` jump-overs carry `lethal`
// on the RISKY (z+3) lanes ONLY (never on a SAFE z-3 lane or a shared z0 hub) — small
// death boxes the boosted run already hops. Everything else is a DECORATIVE `menace`
// (NO `lethal` flag => NO death sensor): it animates for spectacle but can never block.
//
// DIFFICULTY (L4 > L3): L3's guaranteed line carries one legacy lethal (its B1
// gauntlet). L4 keeps a heavier on-line lethal load: B1 size-4 gauntlet + B2 in-pit
// saw + 2 center spikeblocks + a couple of risky-lane menace hops (see below). The
// SAFE lanes stay clear, continuous w2 walks, so the level is beatable with 0 deaths.
//
// CHAOS LAYOUT (HIGH chaos — denser than L3). The FULL ~44-model hazard roster is
// scattered across the ~80u level as animated `menace` props, placed ONLY in zones
// that never touch a walked lane:
//   * FAR flank   z <= -4.5  (beyond every SAFE z-3 strip, which spans z -4..-2, and
//                  beyond the d6 hubs/spine/finish which span z -3..+3)
//   * NEAR flank  z >= +5.5  (beyond every RISKY z+3 lane; the widest are the w4 belts
//                  spanning z 1..5, and the d6 hubs spanning z -3..+3)
//   * VOID MIDDLE z ~ 0 over a BRANCH's X-range (Branch 1 x13..51, Branch 2 x63..71 —
//                  no deck there): chains / spikeballs / hammers HUNG high above the
//                  gap (big dy) so the empty middle reads as a hazard pit, not a path.
//   * PITS BELOW  large negative dy (props sunk under gaps and beside lanes, churning).
//   * HUB CORNERS / ABOVE: props ABOVE head height (dy >= +3) framing each landing pad.
//   * FINISH TOWER (top 10): a celebratory chaos crown high over the win pad.
// Lane Z-spans for reference: SAFE strip z-4..-2; RISKY w4 belt z1..5; hubs/spine z-3..+3.
//
// ANIMATIONS (see effects/worldAnim.js): saws/saw_trap -> spin{axis:'y',speed:7};
// swiper* -> spin{axis:'y',speed:3}; spikeroller_* -> spin{axis:'x',speed:4};
// spikeball -> swing{axis:'z',amp:0.7,speed:2}; hammer*/hammerblock* ->
// swing{axis:'z',amp:0.9,speed:1.6}; ball -> spin; chains/cannon/bomb/floor_spikes ->
// static. `phase` lives INSIDE the spin/swing object and is varied so neighbouring
// hazards are out of lock-step.
export const hazards = [
  // ==========================================================================
  // ON-THE-LINE LETHAL hazards (legacy kinds) — the actual gameplay risk. UNCHANGED.
  // ==========================================================================
  // Branch 1 RISKY (near) lane — size-4 spike gauntlet (jump the 4u void), then the belt.
  { kind: 'spikes', cx: 18, cz: 3, size: 4 },            // gauntlet (box x16..20; jump from run-up x13..16, land on belt x20..51)

  // D saw hub / rejoin 1 — decorative saw (NO lethal flag => no death sensor) for the
  // signature "saw hub" look, plus a lethal CENTER spikeblock so you must hold a lane.
  { kind: 'sawblade', cx: 53, cz: 1.5 },                 // signature saw-hub menace; never blocks a lane
  { kind: 'spikeblock', cx: 53, cz: 0 },                 // center block (z -0.6..+0.6; side lanes clear by >2u)

  // Branch 2 RISKY (near) lane — LETHAL sawblade DOWN IN the 4u pit (top:3, ~2u below
  // the deck), on the walked z=3 line. A clean leap (off the run-up belt) arcs clear
  // over it onto hub G; a BLOWN jump drops onto the saw (death box y2.4..4.4).
  { kind: 'sawblade', cx: 69, cz: 3, top: 3, lethal: true }, // in-pit saw (box x67.4..70.6, y2.4..4.4; clean jump clears it, a fall hits it)

  // G rejoin hub 2 — lethal CENTER spikeblock so you must hold a lane (springs at cx75).
  { kind: 'spikeblock', cx: 73, cz: 0 },                 // center block (z -0.6..+0.6; side lanes clear by >2u)

  // Warning cones (decorative): flag each risky lane's hazards.
  { kind: 'cone', cx: 15.6, cz: 3 },                     // B1 risky gauntlet entry (run-up edge)
  { kind: 'cone', cx: 20.4, cz: 3 },                     // B1 risky belt landing edge (after the gauntlet)
  { kind: 'cone', cx: 66.6, cz: 3 },                     // B2 risky pit edge (run-up belt end)
  { kind: 'cone', cx: 71.4, cz: 3 },                     // B2 risky pit landing edge (on hub G)

  // ==========================================================================
  // CHAOS SCATTER — full ~44-model roster as animated `menace` props.
  // Grouped by level section, west -> east. (cx,cz) = footprint center; y = top+dy.
  // Decorative (no death box) unless explicitly flagged `lethal` (risky lanes only).
  // ==========================================================================

  // ---- SPAWN HUB A (x1..7, z-3..+3) — frame the start; keep clear of z0 spawn ----
  { kind: 'menace', model: 'sawblade', cx: 2.5, cz: -5.2, top: 5, dy: 0.6, rx: 90, spin: { axis: 'y', speed: 7, phase: 0.0 } },                  // far saw, background-left
  { kind: 'menace', model: 'saw_trap', color: 'blue', cx: 2.0, cz: 6.0, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.3 } },            // near saw_trap, foreground
  { kind: 'menace', model: 'swiper', color: 'yellow', cx: 6.0, cz: 6.2, top: 5, spin: { axis: 'y', speed: 3, phase: 0.6 } },                    // near sweeping swiper
  { kind: 'menace', model: 'spikeball_hanger', cx: 3.5, cz: -5.2, top: 5, dy: 4.2 },                                                             // hanger bracket above far corner (static)
  { kind: 'menace', model: 'spikeball', cx: 3.5, cz: -5.2, top: 5, dy: 2.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.0 } },             // ball swinging under the hanger (far corner)
  { kind: 'menace', model: 'cannon_base', color: 'red', cx: 6.4, cz: -5.6, top: 5, ry: -35 },                                                   // cannon aimed across the gap (static)
  { kind: 'menace', model: 'cannon_bullet', cx: 5.4, cz: -5.0, top: 5, dy: 0.7 },                                                               // its bullet, mid-flight (static)

  // ---- C SPLIT HUB 1 (x9..13) — corner saws + a hung spikeball over the lead-in ----
  { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 11, cz: 6.0, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.0 } },       // NEAR hub corner double saw
  { kind: 'menace', model: 'swiper_double', color: 'green', cx: 11, cz: -5.5, top: 5, spin: { axis: 'y', speed: 3, phase: 2.1 } },              // FAR hub corner double swiper

  // ---- BRANCH 1 (x13..51): the long split. Void-middle pendulums + far/near sweeps + pit churn ----
  // EMPTY MIDDLE (z ~0, void between the SAFE z-3 strip and the RISKY z+3 belt): a row of
  // hung spikeballs/hammers swinging over the chasm — perilous-looking, blocks nothing.
  { kind: 'menace', model: 'spikeball_hanger', cx: 23, cz: 0, top: 5, dy: 5.0 },                                                                // bracket #1
  { kind: 'menace', model: 'spikeball', cx: 23, cz: 0, top: 5, dy: 3.0, swing: { axis: 'x', amp: 0.8, speed: 2, phase: 0.4 } },                 // swings across the void (x), clear of both lanes
  { kind: 'menace', model: 'spikeball_hanger', cx: 33, cz: 0, top: 5, dy: 5.0 },                                                                // bracket #2
  { kind: 'menace', model: 'spikeball', cx: 33, cz: 0, top: 5, dy: 3.0, swing: { axis: 'x', amp: 0.8, speed: 2.2, phase: 1.6 } },               // swings across the void (x)
  { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 43, cz: 0, top: 5, dy: 4.4, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.7 } }, // big hammer swinging over the void middle
  { kind: 'menace', model: 'chain_full', cx: 28, cz: 0, top: 5, dy: 1.2 },                                                                      // long chain dangling into the chasm (static)
  { kind: 'menace', model: 'chain_link_end_bottom', cx: 38, cz: 0, top: 5, dy: 0.4 },                                                           // chain bottom cap dangling (static)
  // FAR BACKGROUND (z <= -4.5): big saws + long swipers + a hammer sweeping behind the SAFE walk.
  { kind: 'menace', model: 'saw_trap_long', color: 'green', cx: 22, cz: -6.5, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.0 } },      // long saw trap, far
  { kind: 'menace', model: 'sawblade', cx: 31, cz: -6.5, top: 5, dy: 0.6, rx: 90, spin: { axis: 'y', speed: 7, phase: 2.1 } },                  // bare sawblade, far
  { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 27, cz: -7.0, top: 5, spin: { axis: 'y', speed: 3, phase: 0.9 } },                 // long swiper sweeping far behind
  { kind: 'menace', model: 'hammer', color: 'red', cx: 40, cz: -6.0, top: 5, dy: 1.2, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.3 } }, // hammer over the SAFE lane's far flank
  { kind: 'menace', model: 'spikeroller_vertical', cx: 36, cz: -6.5, top: 5, spin: { axis: 'x', speed: 4, phase: 0.5 } },                       // vertical roller, far flank
  // NEAR FOREGROUND (z >= +5.5): hammers + quad swipers in front of the risky belt.
  { kind: 'menace', model: 'hammer_spikes', color: 'yellow', cx: 22, cz: 6.4, top: 5, dy: 1.5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.0 } }, // spiked hammer, foreground
  { kind: 'menace', model: 'swiper_quad', color: 'green', cx: 30, cz: 7.0, top: 5, spin: { axis: 'y', speed: 3, phase: 1.8 } },                 // quad swiper, foreground
  { kind: 'menace', model: 'swiper_quad_long', color: 'blue', cx: 42, cz: 7.0, top: 5, spin: { axis: 'y', speed: 3, phase: 0.4 } },             // long quad swiper, foreground
  { kind: 'menace', model: 'spikeroller_horizontal', cx: 47, cz: 6.5, top: 5, spin: { axis: 'x', speed: 4, phase: 2.7 } },                      // horizontal roller, near flank past the belt
  // THE PIT BELOW (dy negative): tumbling rollers + a ball + bombs under the branch chasm.
  { kind: 'menace', model: 'spikeroller_horizontal', cx: 24, cz: 0, top: 5, dy: -3.5, spin: { axis: 'x', speed: 4, phase: 0.0 } },              // roller churning in the pit
  { kind: 'menace', model: 'ball', color: 'blue', cx: 30, cz: -1.5, top: 5, dy: -4.0, spin: { axis: 'y', speed: 4, phase: 0.0 } },              // rolling ball in the pit
  { kind: 'menace', model: 'bomb', cx: 35, cz: 0, top: 5, dy: -4.5 },                                                                           // bomb resting in the pit (static)
  { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 45, cz: 0, top: 5, dy: -4.5 },                                                        // colored bomb in the pit (static)

  // ---- D SAW HUB / REJOIN 1 (x51..55) — signature saw hub: corner saws ABOVE the deck ----
  { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 52.0, cz: -2.6, top: 5, dy: 3.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } }, // double saw above NW corner
  { kind: 'menace', model: 'swiper_double_long', color: 'yellow', cx: 53, cz: -3.0, top: 5, dy: 4.4, spin: { axis: 'y', speed: 3, phase: 1.1 } }, // long double swiper spinning above the hub
  { kind: 'menace', model: 'chain_link_end_top', cx: 52.0, cz: -2.6, top: 5, dy: 4.8 },                                                         // chain top cap above the corner saw (static)
  { kind: 'menace', model: 'chain_link', cx: 52.0, cz: -2.6, top: 5, dy: 4.0 },                                                                 // chain mid link (static)
  { kind: 'menace', model: 'hammer', color: 'yellow', cx: 53, cz: 6.0, top: 5, dy: 1.4, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.0 } }, // near-flank hammer by the saw hub

  // ---- E SPINE CONVEYOR (x55..59, w6 z-3..+3) + F SPLIT HUB 2 (x59..63) -------
  // Spine is full-width walkable (z-3..+3), so flanks only (z <=-4.5 / >=+5.5).
  { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 57, cz: -6.0, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.5 } },          // far saw along the spine belt
  { kind: 'menace', model: 'swiper', color: 'red', cx: 57, cz: 6.2, top: 5, spin: { axis: 'y', speed: 3, phase: 1.4 } },                        // near swiper along the spine belt
  { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 61, cz: 6.0, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },      // NEAR F-hub corner double saw
  { kind: 'menace', model: 'hammer_large_spikes', color: 'red', cx: 61, cz: -6.0, top: 5, dy: 1.4, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.3 } }, // FAR F-hub corner big spiked hammer
  { kind: 'menace', model: 'spikeroller_vertical', cx: 59, cz: -6.5, top: 5, spin: { axis: 'x', speed: 4, phase: 2.3 } },                       // vertical roller, far flank at the spine/F join

  // ---- BRANCH 2 (x63..71): belt-assisted split, lethal saw IN the pit ----------
  // EMPTY MIDDLE (z ~0, void over the narrow split): spikeball + dangling chain.
  { kind: 'menace', model: 'spikeball_hanger', cx: 67, cz: 0, top: 5, dy: 5.0 },                                                                // bracket
  { kind: 'menace', model: 'spikeball', cx: 67, cz: 0, top: 5, dy: 3.0, swing: { axis: 'x', amp: 0.8, speed: 1.9, phase: 0.9 } },               // swings across the void (x)
  { kind: 'menace', model: 'chain_full', cx: 65, cz: 0, top: 5, dy: 1.2 },                                                                      // long chain dangling into the chasm (static)
  // FAR BACKGROUND (z <= -4.5): hammers + saw behind the SAFE narrow walk.
  { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 65, cz: -6.4, top: 5, dy: 2.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.3 } }, // big hammer, far
  { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 69, cz: -6.6, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.2 } },        // long saw trap, far
  // NEAR FOREGROUND (z >= +5.5): a long quad swiper + a swiper sweeping near the pit jump.
  { kind: 'menace', model: 'swiper_quad_long', color: 'green', cx: 66, cz: 7.0, top: 5, spin: { axis: 'y', speed: 3, phase: 2.6 } },            // long quad swiper, foreground
  { kind: 'menace', model: 'swiper_long', color: 'yellow', cx: 70, cz: 6.4, top: 5, spin: { axis: 'y', speed: 3, phase: 0.4 } },                // long swiper sweeping near the pit
  // JUMP-GAP PIT DRESSING (x67..71, z3): the LETHAL saw is already in the pit; add
  // DECORATIVE churn AROUND it (lower / off-line so it never extends the death box).
  { kind: 'menace', model: 'spikeroller_horizontal', cx: 69, cz: 3, top: 5, dy: -2.6, spin: { axis: 'x', speed: 4, phase: 0.8 } },              // roller below the lethal saw (decor)
  { kind: 'menace', model: 'bomb_B', color: 'green', cx: 68, cz: 3, top: 5, dy: -3.6 },                                                         // bomb_B resting in the pit (static)

  // ---- G REJOIN HUB 2 (x71..77) + FINISH TOWER (x77..83) — celebratory chaos crown ----
  { kind: 'menace', model: 'saw_trap_long', color: 'blue', cx: 73, cz: -6.4, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },       // long saw trap, far behind hub G
  { kind: 'menace', model: 'swiper', color: 'green', cx: 75, cz: 6.4, top: 5, spin: { axis: 'y', speed: 3, phase: 2.0 } },                      // swiper sweeping foreground of hub G
  { kind: 'menace', model: 'spikeblock_down', color: 'blue', cx: 72.0, cz: -2.7, top: 5, dy: 3.6 },                                             // spikeblock crown above NW corner (static)
  { kind: 'menace', model: 'spikeblock_quad', color: 'green', cx: 76.0, cz: 2.7, top: 5, dy: 3.6 },                                             // quad spikeblock above SE corner (static)
  { kind: 'menace', model: 'spikeblock_omni', color: 'yellow', cx: 74, cz: -3.0, top: 5, dy: 4.6 },                                             // omni spikeblock floating above the hub (static)
  { kind: 'menace', model: 'hammerblock', cx: 74, cz: 6.0, top: 5, dy: 1.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.9 } },           // near-flank hammerblock by hub G
  // Finish tower flair (top 10) — high above the win pad, off to the far side.
  { kind: 'menace', model: 'sawblade', cx: 82, cz: -4.6, top: 10, dy: 0.6, rx: 90, spin: { axis: 'y', speed: 7, phase: 0.0 } },                 // saw spinning beside the finish
  { kind: 'menace', model: 'hammerblock_spikes', cx: 84.2, cz: -2.0, top: 10, dy: 1.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.1 } },// spiked hammerblock prop on the tower edge
  { kind: 'menace', model: 'ball', color: 'red', cx: 82, cz: -4.6, top: 10, dy: 2.4, spin: { axis: 'y', speed: 5, phase: 0.0 } },               // spinning trophy ball above the saw
  { kind: 'menace', model: 'swiper_double', color: 'red', cx: 80, cz: 6.4, top: 10, spin: { axis: 'y', speed: 3, phase: 1.7 } },                // near-flank double swiper crowning the finish

  // ---- DEEP-PIT FLOOR HAZARDS (far below, big negative dy): floor-spike fields ----
  // The full floor-spike set + the remaining sideways spikeblocks, on the pit floor /
  // deep flanks so they read as a churning foundry pit but never touch a lane.
  { kind: 'menace', model: 'floor_spikes_2x2x1', cx: 17, cz: -8, top: 5, dy: -5.5 },                                                            // neutral floor spikes, far pit floor (B1)
  { kind: 'menace', model: 'floor_spikes_curved_4x2x2', cx: 40, cz: -8, top: 5, dy: -5.5 },                                                     // curved floor spikes, far pit floor (B1)
  { kind: 'menace', model: 'floor_spikes_trap_2x2x1', color: 'red', cx: 28, cz: 8, top: 5, dy: -5.5 },                                          // red trap spikes, near pit floor (B1)
  { kind: 'menace', model: 'floor_spikes_trap_4x4x1', color: 'blue', cx: 35, cz: -8, top: 5, dy: -5.5 },                                        // big blue trap-spike field, far pit floor (B1)
  { kind: 'menace', model: 'spikeblock_left', color: 'red', cx: 22, cz: 8, top: 5, dy: -4.5 },                                                  // sideways spikeblock, near pit (static)
  { kind: 'menace', model: 'spikeblock_right', color: 'yellow', cx: 45, cz: -8, top: 5, dy: -4.5 },                                             // sideways spikeblock, far pit (static)
  { kind: 'menace', model: 'spikeblock_double_horizontal', color: 'green', cx: 67, cz: 8, top: 5, dy: -4.5 },                                   // double-horizontal block, near B2 pit (static)
  { kind: 'menace', model: 'spikeblock_double_vertical', color: 'blue', cx: 69, cz: -8, top: 5, dy: -4.5 },                                     // double-vertical block, far B2 pit (static)
  { kind: 'menace', model: 'chain_full', cx: 50, cz: 8, top: 5, dy: 0.5 },                                                                      // near-side chain hanging into the foreground pit (static)

  // ==========================================================================
  // A FEW lethal `menace` jump-overs — RISKY LANES ONLY (z+3), never SAFE/hub.
  // Small death boxes the boosted run already hops; the SAFE lane is untouched.
  // ==========================================================================
  // B1 risky belt (top5, lane z 1..5): a spinning saw_trap to hop. Death box is short in
  // X (hx 0.55) and the boosted belt run (~12u/s) clears it. cz 4.2 (toward the lane's far
  // edge) with a narrow z box so the line over the belt stays clear.
  { kind: 'menace', model: 'saw_trap', color: 'red', cx: 30, cz: 4.2, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.0 },
    lethal: true, lethalDy: 0.5, hx: 0.55, hy: 0.7, hzz: 0.5 },                                                                                 // LETHAL hop on the B1 risky belt
  // B2 risky run-up belt (top5, lane z1..5): a low spinning sawblade just before the pit
  // run-up to hop. Same short death box; the run-up belt boost carries the hop.
  { kind: 'menace', model: 'sawblade', cx: 65, cz: 4.2, top: 5, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.4 },
    lethal: true, lethalDy: 0.5, hx: 0.55, hy: 0.7, hzz: 0.5 },                                                                                 // LETHAL hop on the B2 risky run-up belt
];

// One spring PER LANE on rejoin hub G (cz -3/0/+3), lifting whichever side you
// committed to up the finish tower (top 5 -> top 10; ~5u forward arc onto the d6 tower).
export const springs = [
  { cx: 75, cz: -3 },                                    // SAFE-lane spring
  { cx: 75, cz: 0 },                                     // center spring
  { cx: 75, cz: 3 },                                     // RISKY-lane spring
];
