// Level 2 HAZARDS + springs — "Coolant Causeway" (multi-route, CHAOS pass).
//
// TRAVERSABILITY CONTRACT (unchanged): the only LETHAL hazards on a WALKED line are
// the B1 spike gauntlet (the `spikes` kind, jumped) and the B2 jump-gap pit saws —
// all on the RISKY (near, z=+3) lane and all cleared by a jump that the run already
// makes. The SAFE (far, z=-3) lane stays clear. Everything else added here is a
// DECORATIVE `menace` (NO `lethal` flag => NO death sensor), so it animates for
// chaos but can never block or kill on a lane.
//
// CHAOS LAYOUT (medium chaos — more than L1). The full ~44-model hazard roster is
// scattered across the level in zones that never touch a walked lane:
//   - FAR BACKGROUND (z < -4, behind the SAFE lane): big spinning saws, sweeping
//     swipers, rollers — read clearly past the far lane.
//   - NEAR FOREGROUND (z > +5, in front of the RISKY lane): swipers, hammers, cannons.
//   - EMPTY MIDDLE (z -2..+2 over each branch's X-range is a void with no deck):
//     hanging spikeballs + chains at deck height, free-swinging — nothing to block.
//   - HUB CORNERS (x0..6 / 21..27 / 37..43, at |z|~2.6, dy >= +3 ABOVE head height):
//     spinning saws / swipers framing each landing pad without touching the walk.
//   - THE PIT BELOW (dy negative, ~-3..-6 under gaps and beside lanes): tumbling
//     rollers, balls, bombs, chains hanging down — visible churn under the causeway.
// Lane Z-spans for reference: SAFE strip z-4..-2; RISKY conveyor z1..5; hubs z-3..+3.
//
// ANIMATIONS (see effects/worldAnim.js): saws/saw_trap -> spin{y,7}; swiper* ->
// spin{y,3}; spikeroller_* -> spin{x,4}; spikeball -> swing{z,0.7,2}; hammer* ->
// swing{z,0.9,1.6}; ball -> spin; chains/cannon/bomb -> static. Phases are varied
// so neighbouring hazards are out of sync.
export const hazards = [
  // ===================================================================== //
  //  ON-THE-LINE LETHAL HAZARDS (RISKY lane only; each cleared by a jump)  //
  // ===================================================================== //
  // Branch 1 — size-4 spike gauntlet on the RISKY (near) lane (land x8..12 & x16..21).
  { kind: 'spikes', cx: 14, cz: 3, size: 4 },            // gauntlet #1 (the B1 risky jump-over)

  // Branch 2 — LETHAL saw IN the jump-gap pit, ON the walked z=3 line (cleared by the leap).
  { kind: 'sawblade', cx: 35, cz: 3, lethal: true },     // lethal saw in the 4u pit x33..37 (death box ~x33.4..36.6)

  // Warning cones (decorative): flag the risky lane's challenges.
  { kind: 'cone', cx: 12.4, cz: 3 },                     // risky gauntlet #1 entry
  { kind: 'cone', cx: 15.6, cz: 3 },                     // risky gauntlet #1 exit
  { kind: 'cone', cx: 32.6, cz: 3 },                     // risky jump-gap take-off edge
  { kind: 'cone', cx: 37.4, cz: 3 },                     // risky jump-gap landing edge

  // ===================================================================== //
  //  DECORATIVE CHAOS MENACES (no `lethal` => no death sensor; never block) //
  // ===================================================================== //

  // ---- SPAWN HUB A (x0..6) — frame the start without crowding the z0 spawn ----
  { kind: 'menace', model: 'sawblade', cx: 1.5, cz: -5.2, top: 5, dy: 0.6, rx: 90, spin: { axis: 'y', speed: 7 }, phase: 0.0 },                 // far saw, background-left
  { kind: 'menace', model: 'saw_trap', color: 'blue', cx: 1.0, cz: 6.0, top: 5, ry: 90, spin: { axis: 'y', speed: 7 }, phase: 0.3 },           // near saw_trap, foreground
  { kind: 'menace', model: 'swiper', color: 'yellow', cx: 5.5, cz: 6.2, top: 5, spin: { axis: 'y', speed: 3 }, phase: 0.6 },                   // near sweeping swiper
  { kind: 'menace', model: 'spikeball_hanger', cx: 3.0, cz: -3.0, top: 5, dy: 4.2 },                                                            // hanger bracket above hub corner (static)
  { kind: 'menace', model: 'spikeball', cx: 3.0, cz: -3.0, top: 5, dy: 2.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.0 } },            // ball swinging under the hanger (well above deck)
  { kind: 'menace', model: 'cannon_base', color: 'red', cx: 5.6, cz: -5.6, top: 5, ry: -35 },                                                  // cannon aimed across the gap (static)
  { kind: 'menace', model: 'cannon_bullet', cx: 4.6, cz: -5.0, top: 5, dy: 0.7 },                                                              // its bullet, mid-flight (static)

  // ---- BRANCH 1 (x8..21): empty-middle pendulums + far/near sweepers + pit churn ----
  // EMPTY MIDDLE (z ~0, void): a row of hanging spikeballs swinging over the chasm.
  { kind: 'menace', model: 'spikeball_hanger', cx: 10, cz: 0, top: 5, dy: 5.0 },                                                               // bracket #1
  { kind: 'menace', model: 'spikeball', cx: 10, cz: 0, top: 5, dy: 3.0, swing: { axis: 'x', amp: 0.8, speed: 2, phase: 0.4 } },                // swings across the void (x), clear of both lanes
  { kind: 'menace', model: 'spikeball_hanger', cx: 17, cz: 0, top: 5, dy: 5.0 },                                                               // bracket #2
  { kind: 'menace', model: 'spikeball', cx: 17, cz: 0, top: 5, dy: 3.0, swing: { axis: 'x', amp: 0.8, speed: 2.2, phase: 1.6 } },             // swings across the void (x)
  { kind: 'menace', model: 'chain_full', cx: 13.5, cz: 0, top: 5, dy: 1.2 },                                                                   // long chain dangling into the chasm (static)
  // FAR BACKGROUND (z < -4): big saws + a long swiper sweeping behind the SAFE lane.
  { kind: 'menace', model: 'saw_trap_long', color: 'green', cx: 11, cz: -6.5, top: 5, ry: 90, spin: { axis: 'y', speed: 7 }, phase: 1.0 },     // long saw trap, far
  { kind: 'menace', model: 'sawblade', cx: 19, cz: -6.5, top: 5, dy: 0.6, rx: 90, spin: { axis: 'y', speed: 7 }, phase: 2.1 },                 // bare sawblade, far
  { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 15, cz: -7.0, top: 5, spin: { axis: 'y', speed: 3 }, phase: 0.9 },                // long swiper sweeping far behind
  // NEAR FOREGROUND (z > +5): hammers + a quad swiper in front of the risky lane.
  { kind: 'menace', model: 'hammer', color: 'red', cx: 9, cz: 6.4, top: 5, dy: 1.5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.0 } },  // swinging hammer, foreground
  { kind: 'menace', model: 'hammer_spikes', color: 'yellow', cx: 18, cz: 6.4, top: 5, dy: 1.5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.2 } }, // spiked hammer, foreground
  { kind: 'menace', model: 'swiper_quad', color: 'green', cx: 13.5, cz: 7.0, top: 5, spin: { axis: 'y', speed: 3 }, phase: 1.8 },              // quad swiper, foreground
  // THE PIT BELOW (dy negative): tumbling rollers + a ball under the branch chasm.
  { kind: 'menace', model: 'spikeroller_horizontal', cx: 12, cz: 0, top: 5, dy: -3.5, spin: { axis: 'x', speed: 4 }, phase: 0.0 },             // roller churning in the pit
  { kind: 'menace', model: 'spikeroller_vertical', cx: 16, cz: 0, top: 5, dy: -3.5, spin: { axis: 'x', speed: 4 }, phase: 0.5 },               // vertical roller in the pit
  { kind: 'menace', model: 'ball', color: 'blue', cx: 14, cz: -1.5, top: 5, dy: -4.0, spin: { axis: 'y', speed: 4 }, phase: 0.0 },             // rolling ball in the pit

  // ---- SAW HUB C (x21..27) — the signature saw hub: corner saws ABOVE the deck ----
  { kind: 'sawblade', cx: 24, cz: 1.5 },                 // decor saw (right) — existing hub identity
  { kind: 'sawblade', cx: 24, cz: -1.8 },                // decor saw (left)  — existing hub identity
  { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 22.0, cz: -2.6, top: 5, dy: 3.4, ry: 90, spin: { axis: 'y', speed: 7 }, phase: 0.7 }, // double saw above NW corner
  { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 26.0, cz: 2.6, top: 5, dy: 3.4, ry: 90, spin: { axis: 'y', speed: 7 }, phase: 2.4 },  // double saw above SE corner
  { kind: 'menace', model: 'swiper_double', color: 'yellow', cx: 24, cz: -3.0, top: 5, dy: 4.4, spin: { axis: 'y', speed: 3 }, phase: 1.1 },   // double swiper spinning above the hub
  { kind: 'menace', model: 'chain_link_end_top', cx: 22.0, cz: -2.6, top: 5, dy: 4.8 },                                                        // chain top cap above the corner saw (static)
  { kind: 'menace', model: 'chain_link', cx: 22.0, cz: -2.6, top: 5, dy: 4.0 },                                                                // chain mid link (static)

  // ---- BRANCH 2 (x29..37): far/near sweepers + empty-middle + jump-gap pit dressing ----
  // FAR BACKGROUND (z < -4): hammers + saw behind the SAFE narrow walk.
  { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 30, cz: -6.4, top: 5, dy: 2.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.3 } }, // big hammer, far
  { kind: 'menace', model: 'hammer_large_spikes', color: 'red', cx: 36, cz: -6.4, top: 5, dy: 2.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.0 } }, // big spiked hammer, far
  { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 33, cz: -6.8, top: 5, ry: 90, spin: { axis: 'y', speed: 7 }, phase: 1.5 },         // saw trap, far
  // NEAR FOREGROUND (z > +5): a long quad swiper + swiper_double_long sweeping near.
  { kind: 'menace', model: 'swiper_quad_long', color: 'blue', cx: 31, cz: 7.0, top: 5, spin: { axis: 'y', speed: 3 }, phase: 0.4 },            // long quad swiper, foreground
  { kind: 'menace', model: 'swiper_double_long', color: 'green', cx: 36, cz: 7.0, top: 5, spin: { axis: 'y', speed: 3 }, phase: 2.6 },         // double-long swiper, foreground
  // EMPTY MIDDLE (z ~0, void over the narrow stretch): spikeball + dangling chain.
  { kind: 'menace', model: 'spikeball_hanger', cx: 33, cz: 0, top: 5, dy: 5.0 },                                                               // bracket
  { kind: 'menace', model: 'spikeball', cx: 33, cz: 0, top: 5, dy: 3.0, swing: { axis: 'x', amp: 0.8, speed: 1.9, phase: 0.9 } },              // swings across the void (x)
  { kind: 'menace', model: 'chain_link_end_bottom', cx: 35, cz: 0, top: 5, dy: 0.5 },                                                          // chain bottom cap dangling (static)
  // JUMP-GAP PIT DRESSING (x33..37, z3): the lethal saw is already in the pit; add
  // DECORATIVE churn AROUND it (lower / off-line so it never extends the death box).
  { kind: 'menace', model: 'spikeroller_horizontal', cx: 35, cz: 3, top: 5, dy: -2.6, spin: { axis: 'x', speed: 4 }, phase: 0.8 },             // roller below the lethal saw (decor)
  { kind: 'menace', model: 'bomb', cx: 34, cz: 3, top: 5, dy: -3.6 },                                                                          // bomb resting in the pit (static)
  { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 36, cz: 3, top: 5, dy: -3.6 },                                                       // colored bomb in the pit (static)

  // ---- REJOIN HUB E (x37..43) + FINISH TOWER (x40..44) — celebratory chaos crown ----
  { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 38.5, cz: -6.4, top: 5, ry: 90, spin: { axis: 'y', speed: 7 }, phase: 0.2 },     // long saw trap, far behind hub E
  { kind: 'menace', model: 'swiper', color: 'red', cx: 41, cz: 6.4, top: 5, spin: { axis: 'y', speed: 3 }, phase: 1.4 },                       // swiper sweeping foreground of hub E
  { kind: 'menace', model: 'spikeblock_down', color: 'blue', cx: 38.0, cz: -2.7, top: 5, dy: 3.6 },                                            // spikeblock crown above NW corner (static)
  { kind: 'menace', model: 'spikeblock_quad', color: 'green', cx: 42.0, cz: 2.7, top: 5, dy: 3.6 },                                            // omni-ish spikeblock above SE corner (static)
  { kind: 'menace', model: 'spikeblock_omni', color: 'yellow', cx: 40, cz: -3.0, top: 5, dy: 4.6 },                                            // omni spikeblock floating above the hub (static)
  // Finish tower flair (top 10) — high above the win pad, off to the far side.
  { kind: 'menace', model: 'sawblade', cx: 42, cz: -4.6, top: 10, dy: 0.6, rx: 90, spin: { axis: 'y', speed: 7 }, phase: 0.0 },                // saw spinning beside the finish
  { kind: 'menace', model: 'hammerblock', cx: 44.2, cz: 0, top: 10, dy: 1.0 },                                                                 // hammerblock prop on the tower edge (static)
  { kind: 'menace', model: 'hammerblock_spikes', cx: 44.2, cz: -2.0, top: 10, dy: 1.0 },                                                       // spiked hammerblock prop (static)
  { kind: 'menace', model: 'ball', color: 'red', cx: 42, cz: -4.6, top: 10, dy: 2.4, spin: { axis: 'y', speed: 5 }, phase: 0.0 },             // spinning trophy ball above the saw

  // ---- DEEP-PIT FLOOR HAZARDS (far below, dy very negative): floor-spike fields ----
  { kind: 'menace', model: 'floor_spikes_2x2x1', cx: 8, cz: -8, top: 5, dy: -5.5 },                                                            // neutral floor spikes on the pit floor
  { kind: 'menace', model: 'floor_spikes_curved_4x2x2', cx: 20, cz: -8, top: 5, dy: -5.5 },                                                    // curved floor spikes on the pit floor
  { kind: 'menace', model: 'floor_spikes_trap_2x2x1', color: 'red', cx: 28, cz: 8, top: 5, dy: -5.5 },                                         // red trap spikes on the near pit floor
  { kind: 'menace', model: 'floor_spikes_trap_4x4x1', color: 'blue', cx: 33, cz: -8, top: 5, dy: -5.5 },                                       // big blue trap-spike field on the pit floor
  { kind: 'menace', model: 'spikeblock_left', color: 'red', cx: 23, cz: 8, top: 5, dy: -4.5 },                                                 // sideways spikeblock in the near pit (static)
  { kind: 'menace', model: 'spikeblock_right', color: 'yellow', cx: 26, cz: -8, top: 5, dy: -4.5 },                                            // sideways spikeblock in the far pit (static)
  { kind: 'menace', model: 'spikeblock_double_horizontal', color: 'green', cx: 11, cz: 8, top: 5, dy: -4.5 },                                  // double-horizontal block, near pit (static)
  { kind: 'menace', model: 'spikeblock_double_vertical', color: 'blue', cx: 39, cz: 8, top: 5, dy: -4.5 },                                     // double-vertical block, near pit (static)
  { kind: 'menace', model: 'bomb_B', color: 'green', cx: 17, cz: 8, top: 5, dy: -5.0 },                                                        // bomb_B resting in the near pit (static)
  { kind: 'menace', model: 'chain_full', cx: 30, cz: 8, top: 5, dy: 0.5 },                                                                     // near-side chain hanging into the foreground pit (static)
];

// One spring per lane on rejoin hub E -> the finish tower (top 10).
export const springs = [
  { cx: 39, cz: -3 },                                    // SAFE lane spring
  { cx: 39, cz: 3 },                                     // RISKY lane spring
];
