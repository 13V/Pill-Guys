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
// - BRANCH 1 RISKY lane (z+3, top5): a size-2 spike gauntlet at cx18 -> spikes span
//   x17..19, with solid lane to run up on (x14..17) and land on (x19..22). The SAFE lane
//   (z-3) is clear. This is the ONE genuinely lethal, on-the-line challenge. Cones warn.
// - BRANCH 2 RISKY lane (z+3, top8): a SHORTCUT — a 4u jump-gap (x50..54) over a pit with
//   a (decorative) sawblade for menace, landing at x54..56 EARLIER than the safe walk's
//   continuous strip. The leap that clears the gap clears the saw. SAFE lane (z-3) is a
//   clear, longer strip. Cones warn the risky side.
export const hazards = [
  // entry hub C: decorative saw only (menace; no death sensor => never blocks)
  { kind: 'sawblade', cx: 12, cz: 0 },                       // decorative menace on hub C

  // BRANCH 1 risky lane (z+3): the level's ONE lethal hazard — a size-2 spike gauntlet.
  // Deliberately size-2 (a 2u jump) not size-4: it spans the full w2 lane (so it's a real
  // on-the-line jump) yet is GENTLER than L4's size-4 gauntlet, keeping L3 easier than L4.
  // Lane 14..22 gives a 3u run-up (14..17) and a 3u landing (19..22) around the spikes.
  { kind: 'spikes', cx: 18, cz: 3, size: 2 },                // RISKY lane gauntlet (spikes x17..19; run-up 14..17, land 19..22)
  { kind: 'cone', cx: 15, cz: 3 },                           // warn the risky lane (before)
  { kind: 'cone', cx: 21, cz: 3 },                           // warn the risky lane (after)

  // BRANCH 2 risky lane (z+3, top8): DECORATIVE sawblade in the 4u pit (a pit under a
  // real gap — the jump is the challenge; NO lethal flag => no death sensor).
  { kind: 'sawblade', cx: 52, cz: 3, top: 8 },               // decorative menace in the pit 50..54 (side lane only)
  { kind: 'cone', cx: 49, cz: 3, top: 8 },                   // warn the risky lane (gap edge)
  { kind: 'cone', cx: 55, cz: 3, top: 8 },                   // warn the risky lane (landing)
];
export const springs = [
  // spring #1: pad F (cx35, top5) -> raised landing H (top8). Twins at cz -3/0/+3 so any lane launches.
  { cx: 35, cz: -3 }, { cx: 35, cz: 0 }, { cx: 35, cz: 3 },
  // spring #2: pad R2 (cx58, top5) -> finish tower (top10). Twins so any lane launches.
  { cx: 58, cz: -3 }, { cx: 58, cz: 0 }, { cx: 58, cz: 3 },
];
