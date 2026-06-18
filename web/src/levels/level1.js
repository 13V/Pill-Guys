// Level 1 — "Assembly Line" (gentle intro). Short, one jump-over hazard, the
// signature red pipe arch, a spring to the finish tower. Reference for the format.
export default {
  name: 'Assembly Line',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },
    { kind: 'conveyor', cx: 10, cz: 0, len: 8, w: 4 },
    { kind: 'platform', cx: 16.5, cz: 0, w: 4, d: 4 },
    { kind: 'platform', cx: 21, cz: 0, w: 6, d: 6, rails: true },
    { kind: 'platform', cx: 25, cz: 0, w: 2, d: 2 },
    { kind: 'finish', cx: 27.5, cz: 0, w: 4, d: 4, top: 10 },
  ],
  hazards: [
    { kind: 'spikes', cx: 16.5, cz: 0, size: 4 }, // jump-over gauntlet
    { kind: 'sawblade', cx: 21, cz: 0 },          // decorative menace
    { kind: 'cone', cx: 14.8, cz: 1.7 },
    { kind: 'cone', cx: 18.2, cz: 1.7 },
  ],
  springs: [{ cx: 25, cz: 0 }],
  coins: [
    { x: 3, y: 6.2, z: 0 }, { x: 6.5, y: 6.2, z: 0 }, { x: 10, y: 6.2, z: 0 }, { x: 13, y: 6.2, z: 0 },
    { x: 21, y: 6.2, z: 0 }, { x: 25, y: 6.6, z: 0 }, { x: 27.5, y: 11.2, z: 0 }, { x: 27.5, y: 12.4, z: 0 },
  ],
  decor: [
    { kind: 'pipeArch', cx: 21 },
    { kind: 'portal', cx: 21, cz: 0 },
    { kind: 'arrow', cx: 5, cz: 0 },
    { kind: 'gantry', cx: 13 },
  ],
};
