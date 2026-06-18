// Level 2 PATH — decks/spawn/finish skeleton (owned by the Path/Lead worker).
// Difficulty target: see ../../../LEVELS_DESIGN.md. PLACEHOLDER below.
export default {
  name: 'Level 2',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },
    { kind: 'strip', x0: 6, x1: 20, w: 4 },
    { kind: 'finish', cx: 24, cz: 0, w: 4, d: 4, top: 10 },
  ],
};
