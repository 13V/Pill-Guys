// Level 3 COINS + decor — "Furnace Gaps". 14 coins.
//
// Coins reward each route choice (see ../../../MULTI_ROUTE_DESIGN.md): the SAFE lane
// of each split has a single normal coin; the RISKY lane has TWO coins (a bigger
// payout) bracketing its hazard. The rest trace the spine: over the early real
// gaps, riding the conveyor, and up each spring arc to the finish.
export const coins = [
  { x: 3,  y: 6.4, z: 0 },     // spawn hub A
  { x: 9,  y: 7.2, z: 0 },     // arc over gap A->B
  { x: 15, y: 7.2, z: 0 },     // arc over gap B->C

  // BRANCH 1 rewards (top 5)
  { x: 31, y: 6.4, z: -3 },    // SAFE far lane — 1 normal coin
  { x: 28, y: 6.8, z: 3 },     // RISKY near lane — coin before the gauntlet
  { x: 34, y: 6.8, z: 3 },     // RISKY near lane — coin after the gauntlet (2 = bigger reward)

  { x: 39, y: 6.4, z: -2.6 },  // R1 rejoin hub (off-center, clear of the center block)
  { x: 49, y: 6.4, z: 0 },     // riding the conveyor E
  { x: 57, y: 6.4, z: 0 },     // spring #1 pad F

  // BRANCH 2 rewards (top 8, raised)
  { x: 70, y: 9.4, z: -3 },    // SAFE far lane — 1 normal coin
  { x: 70, y: 9.8, z: 3 },     // RISKY near lane — coin before the pit
  { x: 77, y: 9.8, z: 3 },     // RISKY near lane — coin after the lethal-saw pit (2 = bigger reward)

  { x: 83, y: 8.4, z: 0 },     // rising off spring #2 (R2 -> finish)
  { x: 88, y: 11.4, z: 0 },    // atop the finish tower K
];
export const decor = [
  { kind: 'arrow', cx: 5, cz: 0 },          // go right
  { kind: 'gantry', cx: 15 },               // grey truss landmark over the early gaps
  { kind: 'pipeArch', cx: 21 },             // red arch framing the B1 entry hub
  { kind: 'portal', cx: 21, cz: 0 },        // green portal at the hub
  { kind: 'arrow', cx: 24, cz: -3 },        // signpost the SAFE lane of branch 1
  { kind: 'arrow', cx: 56, cz: 0 },         // point at spring #1
  { kind: 'arrow', cx: 66, cz: -3, top: 8 },// signpost the SAFE lane of branch 2 (raised)
];
