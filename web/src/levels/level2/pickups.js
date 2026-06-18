// Level 2 COINS + decor — "Coolant Causeway". 11 coins.
// Coins trace the safe path: along the strips, dipping over each gauntlet to
// reward the jump, a couple in the safe (left) lane past the saw, then up the
// spring arc onto the finish tower. Decor keeps the on-spec look (red pipe arch,
// grey gantry, yellow arrows, green portal).
export const coins = [
  { x: 3, y: 6.4, z: 0 },     // spawn hub
  { x: 7.5, y: 6.4, z: 0 },   // strip B
  { x: 11, y: 7.0, z: 0 },    // arc over gauntlet #1
  { x: 14.5, y: 6.4, z: 0 },  // strip B landing
  { x: 19, y: 6.4, z: -1.5 }, // saw hub, safe (left) lane
  { x: 25.5, y: 6.4, z: 0 },  // narrow stretch D
  { x: 30.5, y: 6.4, z: 0 },  // strip E entry
  { x: 34, y: 7.0, z: 0 },    // arc over gauntlet #2
  { x: 37.5, y: 6.4, z: 0 },  // strip E landing
  { x: 42.5, y: 8.4, z: 0 },  // rising off the spring
  { x: 44, y: 11.4, z: 0 },   // atop the finish tower
];
export const decor = [
  { kind: 'arrow', cx: 5, cz: 0 },          // go right
  { kind: 'pipeArch', cx: 19 },             // red arch framing the saw hub
  { kind: 'portal', cx: 19, cz: 0 },        // green portal at the hub
  { kind: 'gantry', cx: 25 },               // grey truss landmark over the narrow stretch
  { kind: 'arrow', cx: 39.5, cz: 0 },       // point at the spring
];
