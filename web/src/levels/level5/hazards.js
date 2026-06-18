// Level 5 HAZARDS + springs — "The Last Reactor" (FINALE, multi-route).
//
// Per-lane risk (see ../../../MULTI_ROUTE_DESIGN.md). Every lethal hazard lives on
// a RISKY (near, z=+3) lane or flanks it OFF the walked line — the SAFE (far, z=-3)
// lane and the shared hubs are always passable. Nothing lethal ever blocks the only
// path. Walked RISKY line is z=3 (strip spans z 2..4); a flank saw at cz+4.6 has its
// death box at z 4.1..5.1, clear of z=3 — it threatens a drift but never the lane.
//
//  B1 RISKY (cx27): a size-4 spike gauntlet, conveyor-fed (M1 belt pushes you in).
//    Solid deck both sides on the z=+3 strip — takeoff x23..25, land x29..33.
//  C saw hub: two DECORATIVE sawblades (no lethal flag => no death sensor) keep the
//    signature reactor "saw hub" look without blocking either lane through the rejoin.
//  B2 RISKY (cx48): a LETHAL sawblade flanks the 4u gap (x46..50) at cz+4.6 — clears
//    the walked z=3 line but punishes any drift while you commit the bigger gap.
//  D spikeblock thread (cx55): two spikeblocks at cz ±1.8 force the center thread of
//    the rejoin hub — the finale's signature spikeblock squeeze (z gap ~1.2..-1.2).
//  B3 RISKY (cx78): a size-4 gauntlet PLUS a LETHAL saw flank at cz+4.6 over the
//    landing (cx82) — the hardest fair line: clear the spikes AND stick the landing.
export const hazards = [
  // --- Branch 1 — conveyor-fed gauntlet on the RISKY (near) lane only. ---
  { kind: 'spikes', cx: 27, cz: 3, size: 4 },                       // B1 gauntlet (takeoff x23..25, land x29..33)

  // --- Saw hub C — decorative menace only (no lethal flag => no death sensor). ---
  { kind: 'sawblade', cx: 36, cz: 1.8 },                            // decor saw (right)
  { kind: 'sawblade', cx: 36, cz: -1.8 },                           // decor saw (left)

  // --- Branch 2 — LETHAL saw flanking the RISKY lane's 4u gap (off the z=3 line). ---
  { kind: 'sawblade', cx: 48, cz: 4.6, lethal: true },              // lethal flank (death box z 4.1..5.1)

  // --- Hub D — spikeblock thread: squeeze the center of the rejoin hub. ---
  { kind: 'spikeblock', cx: 55, cz: 1.8, dir: 'up', color: 'red' }, // thread between the two blocks
  { kind: 'spikeblock', cx: 55, cz: -1.8, dir: 'up', color: 'red' },

  // --- Branch 3 — RISKY gauntlet + LETHAL saw flank over the landing (hardest). ---
  { kind: 'spikes', cx: 78, cz: 3, size: 4 },                       // B3 gauntlet (takeoff x74..76, land x80..84)
  { kind: 'sawblade', cx: 82, cz: 4.6, lethal: true },              // lethal flank over the landing (death box z 4.1..5.1)

  // --- Warning cones (decorative): flag each RISKY lane's hazards. ---
  { kind: 'cone', cx: 24.5, cz: 3 }, { kind: 'cone', cx: 29.5, cz: 3 },  // B1 gauntlet edges
  { kind: 'cone', cx: 46.5, cz: 3.8 },                                    // B2 lethal-saw / gap edge
  { kind: 'cone', cx: 75.5, cz: 3 }, { kind: 'cone', cx: 80.5, cz: 3.8 }, // B3 gauntlet entry + flank
];

// One spring PER LANE on rejoin/spring deck F -> the victory tower (top 5 -> top 10;
// spring rise ≈4.9u, forward arc ≈4u onto the tower at x91..97). Whichever lane you
// arrive in (z -3 / +3) or the center, a spring lifts you up the finale tower.
export const springs = [
  { cx: 87, cz: -3 },   // SAFE-lane spring
  { cx: 87, cz: 3 },    // RISKY-lane spring
  { cx: 87, cz: 0 },    // center (hub-walked) spring
];
