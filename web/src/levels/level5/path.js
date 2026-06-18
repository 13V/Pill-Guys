// Level 5 — "The Last Reactor" (FINALE, hardest). Five movements: conveyor->spike
// gauntlet, w2 gap-bridge chain past a lethal saw, conveyor + spikeblock thread,
// spike gauntlet + spring climb, victory tower. ~90u, gaps ≤3u (R&D-verified).
export default {
  name: 'The Last Reactor',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },  // start hub x0..6
    { kind: 'conveyor', cx: 11, cz: 0, len: 8, w: 4 },            // belt x7..15 (+X)  [M1]
    { kind: 'strip', x0: 16, x1: 26, w: 4 },                      // gap1; spike gauntlet cx19; land x21..26
    { kind: 'strip', x0: 28, x1: 34, w: 2 },                      // gap2; w2 bridge   [M2]
    { kind: 'strip', x0: 37, x1: 43, w: 2 },                      // gap3; w2 bridge
    { kind: 'platform', cx: 47, cz: 0, w: 6, d: 6, rails: true }, // gap1; saw hub x44..50
    { kind: 'conveyor', cx: 55, cz: 0, len: 8, w: 4 },            // gap1; belt x51..59 (+X)  [M3]
    { kind: 'platform', cx: 64, cz: 0, w: 6, d: 6, rails: true }, // gap2; spikeblock hub x61..67
    { kind: 'strip', x0: 69, x1: 79, w: 4 },                      // gap2; spike gauntlet cx74  [M4]
    { kind: 'platform', cx: 83, cz: 0, w: 4, d: 4 },              // gap2; spring deck x81..85  [M5]
    { kind: 'finish', cx: 88, cz: 0, w: 4, d: 4, top: 10 },       // spring -> finish (near edge x86)
  ],
};
