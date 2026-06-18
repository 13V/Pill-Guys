// Level 4 COINS + decor — "Fracture Foundry" (multi-route). 14 coins.
//
// Reward differentiates the lanes (see ../../../MULTI_ROUTE_DESIGN.md). The audit
// found L4's old +1-coin risky lanes too thin to tempt; each RISKY (near, z=+3)
// lane now pays ~3x its SAFE (far, z=-3) sibling, so the harder line is worth it:
//   Branch 1:  SAFE 1 coin  |  RISKY 3 (run-up, an arc over the spike gauntlet,
//              and the bridge end past the 4u gap).
//   Branch 2:  SAFE 1 coin  |  RISKY 3 (run-up, an arc over the lethal-saw pit,
//              and the landing on the rejoin hub).
// The visible high arcs over each risky hazard double as signposting: from the
// split hub you can see the coins strung over the gauntlet / pit, so the choice
// reads as "safe vs rewarding," not "easy vs pointlessly hard."
// Shared spine (z=0) + the two rejoin hubs (off-center, clear of their center
// spikeblocks) + the finish tower hold the rest.
export const coins = [
  { x: 4,  y: 6.4, z: 0 },     // A start hub
  { x: 18, y: 6.2, z: 0 },     // C split hub 1

  // Branch 1 — SAFE 1 / RISKY 3
  { x: 28, y: 6.2, z: -3 },    // SAFE lane (clear w2 walk, on pt1)       — 1 normal coin
  { x: 25, y: 6.4, z: 3 },     // RISKY run-up (before the gauntlet)      — reward
  { x: 29, y: 7.1, z: 3 },     // RISKY arc over the spike gauntlet       — reward (visible from hub)
  { x: 39, y: 6.6, z: 3 },     // RISKY bridge end (past the 4u jump-gap) — reward

  { x: 43, y: 6.4, z: -2.6 },  // D saw hub / rejoin 1 (off-center, clear of the center spikeblock)
  { x: 50, y: 6.4, z: 0 },     // E conveyor

  // Branch 2 — SAFE 1 / RISKY 3
  { x: 61.5,  y: 6.2, z: -3 }, // SAFE lane (clear w2 walk, on pt1)       — 1 normal coin
  { x: 61.5,  y: 6.4, z: 3 },  // RISKY run-up (belt-assisted)            — reward
  { x: 65.75, y: 7.3, z: 3 },  // RISKY arc over the lethal-saw pit       — reward (visible from hub)
  { x: 68.5,  y: 6.6, z: 3 },  // RISKY landing on the rejoin hub         — reward

  { x: 71, y: 6.4, z: -2.6 },  // G rejoin hub 2 (off-center, clear of the center spikeblock)
  { x: 77, y: 11.4, z: 0 },    // atop the finish tower
];

export const decor = [
  { kind: 'arrow', cx: 5, cz: 0 },          // go right, into the run
  { kind: 'arrow', cx: 21.5, cz: -3 },      // signpost the SAFE lane of branch 1
  { kind: 'gantry', cx: 29 },               // grey truss landmark over branch 1's gauntlet
  { kind: 'pipeArch', cx: 43 },             // red arch framing the saw hub
  { kind: 'portal', cx: 43, cz: 0 },        // green portal at the saw hub
  { kind: 'arrow', cx: 59.5, cz: -3 },      // signpost the SAFE lane of branch 2
];
