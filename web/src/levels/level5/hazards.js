// Level 5 HAZARDS + springs — "The Last Reactor" (FINALE, multi-route).
//
// Per-lane risk (see ../../../MULTI_ROUTE_DESIGN.md). Every lethal hazard lives on
// a RISKY (near, z=+3) lane or flanks it OFF the walked line — the SAFE (far, z=-3)
// lane and the shared hubs are always passable. Nothing lethal ever blocks the only
// path. Walked RISKY line is z=3 (strip spans z 2..4); a flank saw at cz+4.6 has its
// death box at z 4.1..5.1, clear of z=3 — it threatens a drift but never the lane.
//
//  B1 RISKY gauntlet (cx29): size-4 spikes, conveyor-fed (M1 belt pushes you in).
//    On the z=+3 strip with 4u runway (x23..27) and a 3u landing (x31..34).
//  C saw hub: two DECORATIVE sawblades (no lethal flag => no death sensor) keep the
//    signature reactor "saw hub" look without blocking either lane through the rejoin.
//  B2 RISKY (cx49): a LETHAL sawblade flanks the 4u gap (x47..51) at cz+4.6 — clears
//    the walked z=3 line but punishes any drift while you commit the bigger gap.
//  D spikeblock thread (cx56): two spikeblocks at cz ±1.0 squeeze the CENTER of the
//    rejoin hub (death boxes z [-1.6,-0.6] & [0.6,1.6]; thread the z -0.6..+0.6 gap).
//    A SAFE/RISKY arrival at z≈±3 (or the drift line z≈±2.6) passes clear outside.
//  B3 RISKY gauntlet (cx81): size-4 spikes PLUS a LETHAL saw flank at cz+4.6 over the
//    landing (cx84) — the hardest fair line: clear the spikes AND stick the landing.
export const hazards = [
  // --- Branch 1 — conveyor-fed gauntlet on the RISKY (near) lane only. ---
  { kind: 'spikes', cx: 29, cz: 3, size: 4 },                       // B1 gauntlet (runway x23..27, land x31..34)

  // --- Saw hub C — decorative menace only (no lethal flag => no death sensor). ---
  { kind: 'sawblade', cx: 37, cz: 1.8 },                            // decor saw (right)
  { kind: 'sawblade', cx: 37, cz: -1.8 },                           // decor saw (left)

  // --- Branch 2 — LETHAL saw flanking the RISKY lane's 4u gap (off the z=3 line). ---
  { kind: 'sawblade', cx: 49, cz: 4.6, lethal: true },              // lethal flank over the gap (death box z 4.1..5.1)

  // --- Hub D — spikeblock thread: squeeze the CENTER of the rejoin hub only.
  // Death box is cz ±0.6, so at cz ±1.0 the boxes are z [-1.6,-0.6] & [0.6,1.6]:
  // a tight center thread (gap z -0.6..+0.6) while a SAFE/RISKY arrival at z≈±3
  // (or the strafe-drift line z≈±2.6) passes well clear on the outside.
  { kind: 'spikeblock', cx: 56, cz: 1.0, dir: 'up', color: 'red' },
  { kind: 'spikeblock', cx: 56, cz: -1.0, dir: 'up', color: 'red' },

  // --- Branch 3 — RISKY gauntlet + LETHAL saw flank over the landing (hardest). ---
  { kind: 'spikes', cx: 81, cz: 3, size: 4 },                       // B3 gauntlet (runway x75..79, land x83..86)
  { kind: 'sawblade', cx: 84, cz: 4.6, lethal: true },              // lethal flank over the landing (death box z 4.1..5.1)

  // --- Warning cones (decorative): flag each RISKY lane's hazards. ---
  { kind: 'cone', cx: 26.5, cz: 3 }, { kind: 'cone', cx: 31.5, cz: 3 },  // B1 gauntlet edges
  { kind: 'cone', cx: 47.5, cz: 3.8 },                                    // B2 lethal-saw / gap edge
  { kind: 'cone', cx: 78.5, cz: 3 }, { kind: 'cone', cx: 82.5, cz: 3.8 }, // B3 gauntlet entry + flank
];

// One spring PER LANE on rejoin/spring deck F -> the victory tower (top 5 -> top 10;
// spring rise ≈4.9u, forward arc ≈4u onto the tower at x93..99). Whichever lane you
// arrive in (z -3 / +3) or the center, a spring lifts you up the finale tower.
export const springs = [
  { cx: 89, cz: -3 },   // SAFE-lane spring
  { cx: 89, cz: 3 },    // RISKY-lane spring
  { cx: 89, cz: 0 },    // center (hub-walked) spring
];
