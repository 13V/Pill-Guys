// Level 4 COINS + decor — "Fracture Foundry" (multi-route). 14 coins.
//
// Reward differentiates the lanes (see ../../../MULTI_ROUTE_DESIGN.md). Each RISKY
// (near, z=+3) lane pays ~3x its SAFE (far, z=-3) sibling, so the harder line is
// worth it — and the risky line is also the FASTER line (its forward conveyor boosts
// you to ~12 u/s vs the safe walk's 8), so RISKY is the genuine Fall-Guys shortcut:
//   Branch 1:  SAFE 1 coin  |  RISKY 3 (run-up, an arc over the spike gauntlet, and
//              the long boost belt you ride into hub D).
//   Branch 2:  SAFE 1 coin  |  RISKY 3 (run-up belt, an arc over the lethal-saw pit,
//              and the post-pit boost belt into hub G).
// The visible high arcs over each risky hazard double as signposting: from the split
// hub you can see the coins strung over the gauntlet / pit, so the choice reads as
// "safe vs rewarding," not "easy vs pointlessly hard."
// Shared spine (z=0) + the two rejoin hubs (off-center, clear of their center
// spikeblocks) + the finish tower hold the rest.
export const coins = [
  { x: 4,  y: 6.4, z: 0 },     // A start hub
  { x: 11, y: 6.2, z: 0 },     // C split hub 1

  // Branch 1 — SAFE 1 / RISKY 3
  { x: 32, y: 6.2, z: -3 },    // SAFE lane (clear w2 walk)               — 1 normal coin
  { x: 14.5, y: 6.4, z: 3 },   // RISKY run-up (before the gauntlet)      — reward
  { x: 18, y: 7.1, z: 3 },     // RISKY arc over the spike gauntlet       — reward (visible from hub)
  { x: 37, y: 6.4, z: 3 },     // RISKY boost belt (ride it into hub D)   — reward

  { x: 53, y: 6.4, z: -2.6 },  // D saw hub / rejoin 1 (off-center, clear of the center spikeblock)
  { x: 57, y: 6.4, z: 0 },     // E conveyor

  // Branch 2 — SAFE 1 / RISKY 3
  { x: 67, y: 6.2, z: -3 },    // SAFE lane (clear w2 walk)               — 1 normal coin
  { x: 65,   y: 6.4, z: 3 },   // RISKY run-up belt                       — reward
  { x: 69,   y: 7.3, z: 3 },   // RISKY arc over the lethal-saw pit       — reward (visible from hub)
  { x: 71.5, y: 6.4, z: 3 },   // RISKY pit landing on hub G              — reward

  { x: 74, y: 6.4, z: -2.6 },  // G rejoin hub 2 (off-center, clear of the center spikeblock)
  { x: 80, y: 11.4, z: 0 },    // atop the finish tower
];

export const decor = [
  { kind: 'arrow', cx: 5, cz: 0 },          // go right, into the run
  { kind: 'arrow', cx: 10.5, cz: -3 },      // signpost the SAFE lane of branch 1
  { kind: 'gantry', cx: 18 },               // grey truss landmark over branch 1's gauntlet
  { kind: 'pipeArch', cx: 53 },             // red arch framing the saw hub
  { kind: 'portal', cx: 53, cz: 0 },        // green portal at the saw hub
  { kind: 'arrow', cx: 62.5, cz: -3 },      // signpost the SAFE lane of branch 2
];
