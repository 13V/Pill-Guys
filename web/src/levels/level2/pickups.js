// Level 2 COINS + decor — "Coolant Causeway" (multi-route). 11 coins.
//
// Reward differentiates the lanes (see ../../../MULTI_ROUTE_DESIGN.md): each RISKY
// (near, z=+3) lane pays ~3x its SAFE (far, z=-3) sibling, so the harder line is
// worth it. A calm hub coin between the two gauntlets is the mid-level breather.
//   Branch 1:  safe 1 coin  | risky 3 (incl. an arc over the gauntlet)  -> 3x.
//   Branch 2:  safe 1 coin  | risky 3 (incl. an arc over the jump-gap)  -> 3x.
export const coins = [
  { x: 3,  y: 6.4, z: 0 },     // A spawn hub

  // Branch 1
  { x: 14, y: 6.4, z: -3 },    // safe lane (clear)            (1 coin)
  { x: 10, y: 6.4, z: 3 },     // risky lane entry
  { x: 14, y: 7.0, z: 3 },     // risky: arc over gauntlet #1  (reward)
  { x: 18, y: 6.4, z: 3 },     // risky lane landing           (reward)

  { x: 24, y: 6.4, z: 0 },     // C saw hub (rejoin 1) — mid-level breather coin

  // Branch 2
  { x: 33, y: 6.4, z: -3 },    // safe narrow walk (clear)     (1 coin)
  { x: 31, y: 6.4, z: 3 },     // risky narrow entry
  { x: 35, y: 7.2, z: 3 },     // risky: arc over the 4u gap   (reward, above the lethal saw)
  { x: 38, y: 6.4, z: 3 },     // risky landing on hub E       (reward)

  { x: 42, y: 11.4, z: 0 },    // atop the finish tower
];

export const decor = [
  { kind: 'arrow', cx: 5, cz: 0 },          // go right, into the first split
  { kind: 'pipeArch', cx: 24 },             // red arch framing the saw hub
  { kind: 'portal', cx: 24, cz: 0 },        // green portal at the saw hub
  { kind: 'gantry', cx: 33 },               // grey truss landmark over the narrow stretch
  { kind: 'arrow', cx: 38.5, cz: 0 },       // point at the rejoin / springs
];
