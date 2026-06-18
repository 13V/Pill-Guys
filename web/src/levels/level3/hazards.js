// Level 3 HAZARDS + springs — "Furnace Gaps".
//
// Identity (kept):
// - Spikeblock LANES: lethal spikeblocks placed OFF the center lane (cz +/-1.8) on
//   the wide entry hubs D and H, framing a guaranteed-safe center path (each block
//   occupies only ~+/-0.6 in x/z, so cz=0 has >1u clearance). A slight weave.
// - One decorative (non-lethal) sawblade on hub D for menace (no death sensor).
//
// BRANCH risk/reward (see path.js / ../../../MULTI_ROUTE_DESIGN.md):
// - BRANCH 1 RISKY lane (z+3, top5): a spike gauntlet (size 4) at cx30 -> spikes
//   span x28..32, with solid lane to land on at x26..28 and x32..34. SAFE lane
//   (z-3) is clear. Cones warn the risky side.
// - BRANCH 2 RISKY lane (z+3, top8): a LETHAL sawblade sits in the 4u pit (cx70)
//   between the two risky strips (x64..68 and x72..74) — the same leap that clears
//   the gap clears the saw. It is on the SIDE lane only; the SAFE lane (z-3) is a
//   clear, continuous strip with no hazard. Cones warn the risky side.
//
// Springs (identity: 2 springs). Each spring "pad" carries TWIN spring sensors at
// cz -3 / 0 / +3 on its w6 hub, so a player arriving on EITHER side lane (or the
// center) gets launched — the side routes are independently completable.
// - Spring #1 (hub F, top 5)  -> raised hub H (top 8).
// - Spring #2 (hub R2, top 5) -> finish tower (top 10).
export const hazards = [
  // hub D (B1 entry) spikeblock weave + decorative saw
  { kind: 'spikeblock', cx: 20, cz: 1.8 },                  // hub D lane block (near)  — safe center
  { kind: 'spikeblock', cx: 22, cz: -1.8 },                 // hub D lane block (far)   — slight weave
  { kind: 'sawblade', cx: 21, cz: 0 },                      // decorative menace on hub D (NO lethal flag => no death sensor)

  // BRANCH 1 risky lane (z+3): spike gauntlet
  { kind: 'spikes', cx: 30, cz: 3, size: 4 },               // RISKY lane gauntlet (x28..32; land 26..28 & 32..34)
  { kind: 'cone', cx: 27, cz: 3 },                          // warn the risky lane
  { kind: 'cone', cx: 33, cz: 3 },

  // hub H (B2 entry, raised) spikeblock weave
  { kind: 'spikeblock', cx: 58, cz: 1.8, top: 8 },          // raised hub H lane block (near)
  { kind: 'spikeblock', cx: 60, cz: -1.8, top: 8 },         // raised hub H lane block (far)

  // BRANCH 2 risky lane (z+3, top8): LETHAL sawblade in the 4u pit
  { kind: 'sawblade', cx: 70, cz: 3, top: 8, lethal: true }, // RISKY lane: lethal saw in the gap (side lane only)
  { kind: 'cone', cx: 66, cz: 3, top: 8 },                  // warn the risky lane
  { kind: 'cone', cx: 73, cz: 3, top: 8 },
];
export const springs = [
  // spring #1: hub F (top5) -> raised hub H (top8). Twins so any lane launches.
  { cx: 53, cz: -3 }, { cx: 53, cz: 0 }, { cx: 53, cz: 3 },
  // spring #2: hub R2 (top5) -> finish tower (top10). Twins so any lane launches.
  { cx: 77, cz: -3 }, { cx: 77, cz: 0 }, { cx: 77, cz: 3 },
];
