// Level 8 — placeholder (an agent builds this into a chaotic multi-route course).
// Beatable on every lane via a w6 spine until replaced.
export default {
  name: 'Level 8',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'green' },
    { kind: 'strip', x0: 6, x1: 32, z: 0, w: 6, color: 'blue' },
    { kind: 'finish', cx: 36, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },
  ],
  hazards: [], springs: [], coins: [], decor: [],
};
