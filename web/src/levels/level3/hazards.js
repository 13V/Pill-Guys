// Level 3 HAZARDS + springs — "Furnace Gaps".
//
// Identity (kept): lethal spikeblocks + a menacing sawblade, now repurposed for the
// multi-route layout (see path.js / ../../../MULTI_ROUTE_DESIGN.md):
//
// - SPIKEBLOCK center-blocks on the two REJOIN hubs (R1, R2): a lethal spikeblock
//   sits dead-center (cz0). Its death sensor only spans z -0.6..+0.6, so BOTH side
//   lanes (z=+-3) clear it by >2u — but the center is blocked, so you can't bowl
//   straight down the middle, you must commit to a side lane. (A runner exiting a
//   lane stays at z=+-3 across the hub and never touches the cz0 block.)
//   These are NOT on the split-ENTRY hubs (D, H): a runner strafes across center
//   there, so a lethal block would catch it mid-strafe.
// - One decorative (non-lethal) sawblade on entry hub D for menace (no death sensor).
//
// BRANCH risk/reward:
// - BRANCH 1 RISKY lane (z+3, top5): a spike gauntlet (size 4) at cx31 -> spikes
//   span x29..33, with ~3u of solid lane to land on either side (x26..29, x33..36).
//   The SAFE lane (z-3) is clear. Cones warn the risky side.
// - BRANCH 2 RISKY lane (z+3, top8): a LETHAL sawblade sits in the 4u pit (cx74)
//   between the two risky strips (x68..72 and x76..78) — the same leap that clears
//   the gap clears the saw. It is on the SIDE lane only; the SAFE lane (z-3) is a
//   clear, continuous strip with no hazard. Cones warn the risky side.
//
// Springs (identity: 2 springs). Each spring "pad" carries TWIN spring sensors at
// cz -3 / 0 / +3 on its w6 hub, so a player arriving on EITHER side lane (or the
// center) gets launched — both side routes are independently completable.
// - Spring #1 (hub F, top 5)  -> raised hub H (top 8).
// - Spring #2 (hub R2, top 5) -> finish tower (top 10).
export const hazards = [
  // entry hub D: decorative saw only (menace; no death sensor => never blocks)
  { kind: 'sawblade', cx: 21, cz: 0 },                      // decorative menace on hub D

  // BRANCH 1 risky lane (z+3): spike gauntlet
  { kind: 'spikes', cx: 31, cz: 3, size: 4 },               // RISKY lane gauntlet (x29..33; land 26..29 & 33..36)
  { kind: 'cone', cx: 27, cz: 3 },                          // warn the risky lane
  { kind: 'cone', cx: 35, cz: 3 },

  // lethal spikeblock center-blocks on the REJOIN hubs (force a lane choice)
  { kind: 'spikeblock', cx: 39, cz: 0 },                    // R1 center block (top5)
  { kind: 'spikeblock', cx: 79, cz: 0 },                    // R2 center block (top5; sits before the cz0 spring at cx81)

  // BRANCH 2 risky lane (z+3, top8): LETHAL sawblade in the 4u pit
  { kind: 'sawblade', cx: 74, cz: 3, top: 8, lethal: true }, // RISKY lane: lethal saw in the gap (side lane only)
  { kind: 'cone', cx: 70, cz: 3, top: 8 },                  // warn the risky lane
  { kind: 'cone', cx: 77, cz: 3, top: 8 },
];
export const springs = [
  // spring #1: hub F (top5) -> raised hub H (top8). Twins so any lane launches.
  { cx: 57, cz: -3 }, { cx: 57, cz: 0 }, { cx: 57, cz: 3 },
  // spring #2: hub R2 (top5) -> finish tower (top10). Twins so any lane launches.
  { cx: 81, cz: -3 }, { cx: 81, cz: 0 }, { cx: 81, cz: 3 },
];
