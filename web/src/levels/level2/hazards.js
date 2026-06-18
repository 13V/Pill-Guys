// Level 2 HAZARDS + springs — "Coolant Causeway" (multi-route).
//
// Per-lane risk (see ../../../MULTI_ROUTE_DESIGN.md). The challenges live ON the
// RISKY (near, z=+3) lane; the SAFE (far, z=-3) lane is clear. Nothing lethal ever
// sits on the only path — shared hubs carry only decorative (menace-only) saws.
//
// Branch 1 RISKY lane: a spike gauntlet (size 4) on the z=+3 strip, with solid deck
//   on both sides to land on (x 8..12 and 16..21; spike run x 12..16).
// Branch 2 RISKY lane: a 4u JUMP-GAP (x33..37, in path.js) with a LETHAL sawblade
//   in the pit at cz=3 (cx35) — ON the walked line. This is the L3-B2 model: the
//   same leap that clears the gap clears the saw (apex ~3u over a 4u gap rises well
//   clear of the saw's death box), but a mistimed jump dies on it, so the risk is
//   FELT. (The previous off-line cz+4.6 flank — which never threatened a careful
//   line — has been removed.) The SAFE far lane (z=-3) is a clear continuous strip.
// Saw hub C: two decorative sawblades (no lethal flag => no death sensor) keep the
//   signature "saw hub" look without blocking either lane through it.
// Springs: one per lane on rejoin hub E (cz -3 and cz +3) lift each lane up the
//   finish tower (top 5 -> top 10; spring rise ≈4.9u, forward arc ≈3u onto the tower).
export const hazards = [
  // Branch 1 — gauntlet #1 on the RISKY (near) lane only.
  { kind: 'spikes', cx: 14, cz: 3, size: 4 },            // gauntlet #1 (risky lane; land x8..12 & x16..21)

  // Saw hub C — decorative menace only (no lethal flag => no death sensor; never blocks).
  { kind: 'sawblade', cx: 24, cz: 1.5 },                 // decor saw (right)
  { kind: 'sawblade', cx: 24, cz: -1.8 },                // decor saw (left)

  // Branch 2 — LETHAL saw IN the jump-gap pit, ON the walked z=3 line (cleared by the leap).
  { kind: 'sawblade', cx: 35, cz: 3, lethal: true },     // lethal saw in the 4u pit x33..37 (death box ~x33.4..36.6)

  // Warning cones (decorative): flag the risky lane's challenges.
  { kind: 'cone', cx: 12.4, cz: 3 },                     // risky gauntlet #1 entry
  { kind: 'cone', cx: 15.6, cz: 3 },                     // risky gauntlet #1 exit
  { kind: 'cone', cx: 32.6, cz: 3 },                     // risky jump-gap take-off edge
  { kind: 'cone', cx: 37.4, cz: 3 },                     // risky jump-gap landing edge
];

// One spring per lane on rejoin hub E -> the finish tower (top 10).
export const springs = [
  { cx: 39, cz: -3 },                                    // SAFE lane spring
  { cx: 39, cz: 3 },                                     // RISKY lane spring
];
