// Level 3 HAZARDS + springs — "Furnace Gaps" (medium, compressed).
//
// DIFFICULTY DIAL (the audit found old L3 had 4 lethal sensors — MORE than L4's 2 — an
// inversion). This build carries exactly ONE lethal placed hazard (the B1 gauntlet), so
// L3 now has 1 lethal sensor vs L4's 2 — restoring the ramp L3 < L4 < L5.
//   - REMOVED both center spikeblocks (old R1 & R2 blocks): the EMPTY MIDDLE over each
//     branch's lane X-range (z -2..+2 is a void) already forces a lane choice, so the
//     blocks were redundant lethal sensors. Hubs are now clean landing pads.
//   - The BRANCH 2 pit saw is now DECORATIVE (no `lethal` flag => no death sensor): it is
//     a "decorative pit under a real gap" (per the audit) — the 4u jump is the challenge,
//     not a death box that a careful jumper never touches anyway.
//   - KEPT: the BRANCH 1 size-4 spike gauntlet as the single, on-the-line lethal hazard.
//
// Identity kept: lethal-looking saws for menace, a real spike gauntlet, two springs.
//
// BRANCH risk/reward (each RISKY lane pays 3x its SAFE sibling — see pickups.js):
// - BRANCH 1 RISKY lane (z+3, top5): a size-4 spike gauntlet at cx26 -> spikes span
//   x24..28, with solid lane to land on either side (x22..24 and x28..30). The SAFE lane
//   (z-3) is clear. This is the ONE genuinely lethal, on-the-line challenge. Cones warn.
// - BRANCH 2 RISKY lane (z+3, top8): a SHORTCUT — a 4u jump-gap (x61..65) over a pit with
//   a (decorative) sawblade for menace, landing at x65..67 EARLIER than the safe walk's
//   continuous strip. The leap that clears the gap clears the saw. SAFE lane (z-3) is a
//   clear, longer strip. Cones warn the risky side.
export const hazards = [
  // entry hub C: decorative saw only (menace; no death sensor => never blocks)
  { kind: 'sawblade', cx: 18, cz: 0 },                       // decorative menace on hub C

  // BRANCH 1 risky lane (z+3): the level's ONE lethal hazard — a size-4 spike gauntlet
  { kind: 'spikes', cx: 26, cz: 3, size: 4 },                // RISKY lane gauntlet (spikes x24..28; land 22..24 & 28..30)
  { kind: 'cone', cx: 23, cz: 3 },                           // warn the risky lane (before)
  { kind: 'cone', cx: 29, cz: 3 },                           // warn the risky lane (after)

  // BRANCH 2 risky lane (z+3, top8): DECORATIVE sawblade in the 4u pit (a pit under a
  // real gap — the jump is the challenge; NO lethal flag => no death sensor).
  { kind: 'sawblade', cx: 63, cz: 3, top: 8 },               // decorative menace in the gap (side lane only)
  { kind: 'cone', cx: 60, cz: 3, top: 8 },                   // warn the risky lane (gap edge)
  { kind: 'cone', cx: 66, cz: 3, top: 8 },                   // warn the risky lane (landing)
];
export const springs = [
  // spring #1: hub F (top5) -> raised hub H (top8). Twins at cz -3/0/+3 so any lane launches.
  { cx: 49, cz: -3 }, { cx: 49, cz: 0 }, { cx: 49, cz: 3 },
  // spring #2: hub R2 (top5) -> finish tower (top10). Twins so any lane launches.
  { cx: 69, cz: -3 }, { cx: 69, cz: 0 }, { cx: 69, cz: 3 },
];
