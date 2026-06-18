// Level 3 COINS + decor — "Furnace Gaps" (compressed). 14 coins.
//
// Coins reward each route choice (see ../../../MULTI_ROUTE_DESIGN.md). The audit found
// the old risky lanes paid only +1 coin (safe 1 / risky 2) — too thin to tempt. Now each
// RISKY lane pays 3 coins to its SAFE sibling's 1 (a 3x payout) so the danger/shortcut is
// worth taking. The rest trace the spine: arcs over the early jump-gaps, riding the
// conveyor, and up each spring arc to the finish.
//
// Per-branch split (safe / risky):
//   BRANCH 1 (gauntlet lane):  SAFE 1 coin (z-3)  vs  RISKY 3 coins (z+3)
//   BRANCH 2 (gap-shortcut):   SAFE 1 coin (z-3)  vs  RISKY 3 coins (z+3)
export const coins = [
  { x: 3,  y: 6.4, z: 0 },     // spawn hub A
  { x: 8,  y: 7.4, z: 0 },     // arc over the first REAL jump-gap (A->C)

  // BRANCH 1 rewards (top 5): SAFE 1 / RISKY 3
  { x: 20, y: 6.4, z: -3 },    // SAFE far lane — 1 normal coin
  { x: 17, y: 6.8, z: 3 },     // RISKY near lane — coin before the gauntlet
  { x: 20, y: 7.2, z: 3 },     // RISKY near lane — coin in the gauntlet arc (jump it)
  { x: 23, y: 6.8, z: 3 },     // RISKY near lane — coin after the gauntlet (3 = 3x reward)

  { x: 26, y: 6.4, z: 0 },     // R1 rejoin hub (clean, no center block now)
  { x: 31, y: 6.4, z: 0 },     // riding the conveyor E
  { x: 40, y: 7.6, z: 0 },     // rising off spring #1 (arc up to the raised section)

  // BRANCH 2 rewards (top 8, raised): SAFE 1 / RISKY 3
  { x: 55, y: 9.4, z: -3 },    // SAFE far lane — 1 normal coin
  { x: 52, y: 9.8, z: 3 },     // RISKY near lane — coin before the pit
  { x: 55, y: 10.2, z: 3 },    // RISKY near lane — coin in the jump arc over the pit
  { x: 58, y: 9.8, z: 3 },     // RISKY near lane — coin after the gap (3 = 3x reward)

  { x: 67, y: 11.4, z: 0 },    // atop the finish tower K (rising off spring #2)
];
export const decor = [
  { kind: 'arrow', cx: 5, cz: 0 },          // go right
  { kind: 'gantry', cx: 8 },                // grey truss landmark over the first gap
  { kind: 'pipeArch', cx: 12 },             // red arch framing the B1 entry hub
  { kind: 'portal', cx: 12, cz: 0 },        // green portal at the hub
  { kind: 'arrow', cx: 14, cz: -3 },        // signpost the SAFE lane of branch 1
  { kind: 'arrow', cx: 39, cz: 0 },         // point at spring #1
  { kind: 'arrow', cx: 49, cz: -3, top: 8 },// signpost the SAFE lane of branch 2 (raised)
];
