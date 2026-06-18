// Level 4 COINS + decor — "Fracture Foundry" (multi-route). 15 coins.
//
// Reward differentiates the lanes (see ../../../MULTI_ROUTE_DESIGN.md): each RISKY
// (near, z=+3) lane carries MORE coins than its SAFE (far, z=-3) counterpart, so
// the harder line pays out. Shared hubs/spine (z=0) and the finish tower hold the rest.
//   Branch 1:  safe 1 coin  | risky 2 (incl. an arc over the spike gauntlet).
//   Branch 2:  safe 1 coin  | risky 2 (incl. an arc over the 4u gap).
export const coins = [
  { x: 3,  y: 6.4, z: 0 },     // A start hub
  { x: 8,  y: 6.2, z: 0 },     // B runway entry
  { x: 11, y: 7.0, z: 0 },     // B: arc over the entry gauntlet
  { x: 21, y: 6.2, z: 0 },     // C split hub 1

  // Branch 1
  { x: 31, y: 6.2, z: -3 },    // safe lane (clear w2 walk)            — normal coin
  { x: 31, y: 7.0, z: 3 },     // risky: arc over the spike gauntlet   — reward
  { x: 35, y: 6.4, z: 3 },     // risky lane landing                   — reward

  { x: 41, y: 6.2, z: 0 },     // D saw hub (rejoin 1)
  { x: 49, y: 6.4, z: 0 },     // E conveyor
  { x: 58, y: 6.2, z: 0 },     // F split hub 2

  // Branch 2
  { x: 70, y: 6.2, z: -3 },    // safe lane (clear longer w2 walk)     — normal coin
  { x: 70, y: 7.2, z: 3 },     // risky: arc over the 4u gap           — reward
  { x: 74, y: 6.4, z: 3 },     // risky lane landing                   — reward

  { x: 80, y: 6.2, z: 0 },     // G rejoin hub 2
  { x: 88, y: 11.4, z: 0 },    // atop the finish tower
];

export const decor = [
  { kind: 'arrow', cx: 5, cz: 0 },          // go right, into the run
  { kind: 'arrow', cx: 24.5, cz: -3 },      // signpost the SAFE lane of branch 1
  { kind: 'gantry', cx: 31 },               // grey truss landmark over branch 1
  { kind: 'pipeArch', cx: 41 },             // red arch framing the saw hub
  { kind: 'portal', cx: 41, cz: 0 },        // green portal at the saw hub
  { kind: 'arrow', cx: 61.5, cz: -3 },      // signpost the SAFE lane of branch 2
];
