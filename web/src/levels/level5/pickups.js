// Level 5 COINS + decor — "The Last Reactor" (FINALE, multi-route). 18 coins.
//
// Reward differentiates the lanes (see ../../../MULTI_ROUTE_DESIGN.md): each RISKY
// (near, z=+3) lane pays ~3x its SAFE (far, z=-3) sibling (safe 1 / risky 3 on every
// branch), and the reward IS the risk — an arc coin sits ON the jump over each
// gauntlet / gap, exactly where the danger is. Hubs (z=0) and the victory tower hold
// the rest. This is the most tempting risk/reward in the game (audit: pay 3x).
//   Branch 1:  safe 1 | risky 3 (entry + arc over the gauntlet + landing).
//   Branch 2:  safe 1 | risky 3 (entry + arc over the 4u saw-gap + landing).
//   Branch 3:  safe 1 | risky 3 (entry + arc over the gauntlet + arc over the saw-gap).
export const coins = [
  { x: 3,  y: 6.4, z: 0 },     // A spawn hub

  // Branch 1 (conveyor-fed gauntlet)  — safe 1 / risky 3
  { x: 29, y: 6.4, z: -3 },    // safe lane (clear)
  { x: 24, y: 6.4, z: 3 },     // risky entry
  { x: 29, y: 7.0, z: 3 },     // risky: arc over the gauntlet   (reward)
  { x: 32, y: 6.4, z: 3 },     // risky landing                  (reward)

  { x: 37, y: 6.4, z: 0 },     // C rejoin / saw hub

  // Branch 2 (two hard ways)  — safe 1 / risky 3
  { x: 44, y: 6.4, z: -3 },    // safe w2 bridge (before the comfy 3u gap)
  { x: 44, y: 6.4, z: 3 },     // risky entry
  { x: 49, y: 7.0, z: 3 },     // risky: arc over the 4u saw-gap (reward)
  { x: 52, y: 6.4, z: 3 },     // risky landing                  (reward)

  { x: 56, y: 6.4, z: 0 },     // D spikeblock hub (rejoin 2)
  { x: 63, y: 6.4, z: 0 },     // M3 belt

  // Branch 3 (conveyor-into-gauntlet, hardest — top payout)  — safe 1 / risky 3
  { x: 82, y: 6.4, z: -3 },    // safe lane (clear)
  { x: 76, y: 6.4, z: 3 },     // risky entry
  { x: 81, y: 7.0, z: 3 },     // risky: arc over the gauntlet   (reward)
  { x: 88, y: 7.0, z: 3 },     // risky: arc over the trailing saw-gap (reward)

  { x: 93, y: 6.4, z: 0 },     // F spring deck — "you made it" coin before the climb
  { x: 100, y: 11.4, z: 0 },   // atop the victory tower
];

export const decor = [
  { kind: 'arrow', cx: 5, cz: 0 },          // go right, into the first split
  { kind: 'arrow', cx: 16.5, cz: -3 },      // signpost the SAFE lane at hub B
  { kind: 'pipeArch', cx: 37 },             // red arch framing the saw hub (rejoin 1)
  { kind: 'portal', cx: 37, cz: 0 },        // green portal at the saw hub
  { kind: 'gantry', cx: 47 },               // grey truss over the two-hard-ways stretch
  { kind: 'portal', cx: 56, cz: 0 },        // portal at the spikeblock hub (rejoin 2)
  { kind: 'gantry', cx: 70 },               // truss landmark at the final split hub
  { kind: 'arrow', cx: 96.5, cz: 0 },       // point at the spring -> victory tower
];
