// Level 3 COINS + decor — "Furnace Gaps". 12 coins.
// Coins arc over the real gaps to reward each jump, ride the conveyor, climb onto
// the raised section, and trace both spring arcs up to the finish. Decor keeps
// the on-spec look (red pipe arch, grey gantry, yellow arrows, green portal).
export const coins = [
  { x: 3,  y: 6.4, z: 0 },    // spawn hub A
  { x: 8,  y: 7.2, z: 0 },    // arc over gap A->B
  { x: 13, y: 7.2, z: 0 },    // arc over gap B->C
  { x: 16, y: 6.4, z: 0 },    // landing C
  { x: 22, y: 6.4, z: 0 },    // spikeblock hub D (safe center)
  { x: 30, y: 6.4, z: 0 },    // riding the conveyor E
  { x: 35, y: 7.2, z: 0 },    // arc over the conveyor-fed gap E->F
  { x: 43, y: 6.4, z: 0 },    // spring #1 pad G
  { x: 47, y: 9.4, z: 0 },    // up on the raised hub H (top 8)
  { x: 52, y: 6.4, z: 0 },    // drop landing I
  { x: 55, y: 8.4, z: 0 },    // rising off spring #2
  { x: 56, y: 11.4, z: 0 },   // atop the finish tower K
];
export const decor = [
  { kind: 'arrow', cx: 5, cz: 0 },          // go right
  { kind: 'gantry', cx: 16 },               // grey truss landmark over the early gaps
  { kind: 'pipeArch', cx: 22 },             // red arch framing the spikeblock hub
  { kind: 'portal', cx: 22, cz: 0 },        // green portal at the hub
  { kind: 'arrow', cx: 42, cz: 0 },         // point at spring #1
  { kind: 'arrow', cx: 47, cz: 0, top: 8 }, // on the raised hub, point onward
];
