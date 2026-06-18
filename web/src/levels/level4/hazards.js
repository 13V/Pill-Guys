// Level 4 HAZARDS + springs — "Fracture Foundry" (multi-route, 2nd hardest).
//
// Per-lane risk (see ../../../MULTI_ROUTE_DESIGN.md). Real, ON-THE-LINE hazards live
// on the RISKY (near, z=+3) lanes; the SAFE (far, z=-3) lanes are clear walks. The
// RISKY lanes pay for the risk with a long FORWARD-CONVEYOR boost (~12 vs 8 u/s) +
// 3x coins (see path.js / pickups.js). The only lethal pieces on the shared spine are
// CENTER spikeblocks blocking z~0 (z -0.6..+0.6) on the rejoin hubs — both side lanes
// (z=±3) clear them by >2u, so you can't bowl down the middle and must commit to a
// side (the L3 pattern).
//
// DIFFICULTY (L4 > L3): L3 has ONE lethal placed hazard; L4 keeps four on-line lethal
// pieces across its risky lanes + rejoin hubs:
// - BRANCH 1 RISKY (z+3): a size-4 SPIKE GAUNTLET (cx21; spike box x19..23) over the
//   4u void between the solid run-up (x16..19) and the long boost belt (x23..41).
//   JUMP from the run-up over the spikes and land on the belt, then ride it GROUNDED.
// - BRANCH 2 RISKY (z+3): a 4u belt-assisted JUMP-GAP (x66..70) with a LETHAL sawblade
//   IN the pit (cx68) — the same leap (off the run-up belt) that clears the gap clears
//   the saw and lands on hub G; a BLOWN jump drops onto it.
// SAFE lanes (z-3) are clear, continuous w2 walks the whole way.
export const hazards = [
  // Branch 1 RISKY (near) lane — size-4 spike gauntlet (jump the 4u void), then the belt.
  { kind: 'spikes', cx: 21, cz: 3, size: 4 },            // gauntlet (box x19..23; jump from run-up x16..19, land on belt x23..41)

  // D saw hub / rejoin 1 — decorative saw (NO lethal flag => no death sensor) for the
  // signature "saw hub" look, plus a lethal CENTER spikeblock so you must hold a lane.
  { kind: 'sawblade', cx: 52, cz: 1.5 },                 // signature saw-hub menace; never blocks a lane
  { kind: 'spikeblock', cx: 52, cz: 0 },                 // center block (z -0.6..+0.6; side lanes clear by >2u)

  // Branch 2 RISKY (near) lane — LETHAL sawblade DOWN IN the 4u pit (top:3, ~2u below
  // the deck), on the walked z=3 line. A clean leap (off the run-up belt) arcs clear
  // over it onto hub G; a BLOWN jump drops onto the saw (death box y2.4..4.4). The pit
  // is the on-line risk, the saw is the in-pit consequence (mirrors L3-B2's pit-saw).
  { kind: 'sawblade', cx: 68, cz: 3, top: 3, lethal: true }, // in-pit saw (box x66.4..69.6, y2.4..4.4; clean jump clears it, a fall hits it)

  // G rejoin hub 2 — lethal CENTER spikeblock so you must hold a lane (springs at cx74).
  { kind: 'spikeblock', cx: 72, cz: 0 },                 // center block (z -0.6..+0.6; side lanes clear by >2u)

  // Warning cones (decorative): flag each risky lane's hazards.
  { kind: 'cone', cx: 18.6, cz: 3 },                     // B1 risky gauntlet entry (run-up edge)
  { kind: 'cone', cx: 23.4, cz: 3 },                     // B1 risky belt landing edge (after the gauntlet)
  { kind: 'cone', cx: 65.6, cz: 3 },                     // B2 risky pit edge (run-up belt end)
  { kind: 'cone', cx: 70.4, cz: 3 },                     // B2 risky pit landing edge (on hub G)
];

// One spring PER LANE on rejoin hub G (cz -3/0/+3), lifting whichever side you
// committed to up the finish tower (top 5 -> top 10; ~5u forward arc onto the d6 tower).
export const springs = [
  { cx: 74, cz: -3 },                                    // SAFE-lane spring
  { cx: 74, cz: 0 },                                     // center spring
  { cx: 74, cz: 3 },                                     // RISKY-lane spring
];
