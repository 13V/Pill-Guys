// Level 2 HAZARDS + springs — "Coolant Causeway" (multi-route).
//
// Per-lane risk (see ../../../MULTI_ROUTE_DESIGN.md). Hazards live on the RISKY
// (near, z=+3) lane; the SAFE (far, z=-3) lane is clear. Nothing lethal ever sits
// on the only path — shared hubs carry only decorative (menace-only) saws.
//
// Branch 1 risky lane: a spike gauntlet (size 4) on the z=+3 strip, solid deck on
//   both sides to land on (x 8..12 and 16..21; spike run x 12..16).
// Branch 2 risky lane: a 4u gap (x 34..38, in path.js) PLUS a LETHAL sawblade that
//   flanks the lane at cz +4.6 — its death box is z 4.1..5.1, clear of the walked
//   z≈3 line, so it threatens a drift but never blocks the lane.
// Saw hub C: two decorative sawblades (no lethal flag => no death sensor) keep the
//   signature "saw hub" look without blocking either lane through it.
// Springs: one per lane on rejoin hub E (cz -3 and cz +3) lift each lane up the
//   finish tower (top 5 -> top 10; spring rise ≈4.9u, forward arc ≈4u onto the tower).
export const hazards = [
  // Branch 1 — gauntlet #1 on the RISKY (near) lane only.
  { kind: 'spikes', cx: 14, cz: 3, size: 4 },            // gauntlet #1 (risky lane; land x8..12 & x16..21)

  // Saw hub C — decorative menace only (no lethal flag => no death sensor; never blocks).
  { kind: 'sawblade', cx: 24, cz: 1.5 },                 // decor saw (right)
  { kind: 'sawblade', cx: 24, cz: -1.8 },                // decor saw (left)

  // Branch 2 — LETHAL saw flanking the RISKY lane (off the walked z≈3 line).
  { kind: 'sawblade', cx: 32, cz: 4.6, lethal: true },   // lethal flank on risky lane (death box z 4.1..5.1)

  // Warning cones (decorative): flag the risky lane's hazards.
  { kind: 'cone', cx: 12.4, cz: 3 },                     // risky gauntlet #1 entry
  { kind: 'cone', cx: 15.6, cz: 3 },                     // risky gauntlet #1 exit
  { kind: 'cone', cx: 35.6, cz: 3 },                     // risky 4u gap edge
  { kind: 'cone', cx: 30.5, cz: 3.8 },                   // risky lethal-saw lane
];

// One spring per lane on rejoin hub E -> the finish tower (top 10).
export const springs = [
  { cx: 41, cz: -3 },                                    // SAFE lane spring
  { cx: 41, cz: 3 },                                     // RISKY lane spring
];
