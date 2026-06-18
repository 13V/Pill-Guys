// Level 4 HAZARDS + springs — "Fracture Foundry" (multi-route, med-high).
//
// Per-lane risk (see ../../../MULTI_ROUTE_DESIGN.md). Hazards live on the RISKY
// (near, z=+3) lanes; the SAFE (far, z=-3) lanes are clear. Nothing lethal ever
// sits on the only path — shared hubs carry only decorative (menace-only) saws.
//
// - B entry runway: a size-4 jump-over spike gauntlet on the center spine (cx11;
//   takeoff x6..9, land x13..16) — the level's signature opener, shared by both
//   later routes.
// - BRANCH 1 RISKY lane (z+3): a size-4 SPIKE GAUNTLET (cx31; spike box x29..33,
//   solid w2 deck to land on at x26..29 and x33..36). SAFE lane (z-3) is clear.
// - D saw hub: one decorative sawblade (NO lethal flag => no death sensor) keeps
//   the signature "saw hub" look without ever blocking the rejoin.
// - BRANCH 2 RISKY lane (z+3): a LETHAL sawblade flanking the lane at cz+4.6 — its
//   death box is z 4.1..5.1, clear of the walked z=3 line, so it punishes a drift
//   but never blocks the lane. The lane then breaks for a 4u GAP (x68..72, in
//   path.js). SAFE lane (z-3) is a clear, longer w2 walk.
export const hazards = [
  // Entry spike gauntlet (center spine; both routes pass it).
  { kind: 'spikes', cx: 11, cz: 0, size: 4 },            // takeoff x6..9, land x13..16

  // Branch 1 — size-4 spike gauntlet on the RISKY (near) lane only.
  { kind: 'spikes', cx: 31, cz: 3, size: 4 },            // risky lane gauntlet (land x26..29 & x33..36)

  // D saw hub — decorative menace only (no lethal flag => no death sensor).
  { kind: 'sawblade', cx: 41, cz: 1.5 },                 // signature saw hub look; never blocks

  // Branch 2 — LETHAL saw flanking the RISKY lane (off the walked z=3 line).
  { kind: 'sawblade', cx: 66, cz: 4.6, lethal: true },   // lethal flank (death box z 4.1..5.1; punishes a drift)

  // Warning cones (decorative): flag the risky lanes' hazards.
  { kind: 'cone', cx: 28.4, cz: 3 },                     // B1 risky gauntlet entry
  { kind: 'cone', cx: 33.6, cz: 3 },                     // B1 risky gauntlet exit
  { kind: 'cone', cx: 64.0, cz: 3.8 },                   // B2 risky lethal-saw lane
  { kind: 'cone', cx: 69.5, cz: 3 },                     // B2 risky 4u gap edge
];

// One spring on the spring deck H (both lanes have rejoined at hub G by here),
// lifting up the finish tower (top 5 -> top 10).
export const springs = [{ cx: 86, cz: 0 }];
