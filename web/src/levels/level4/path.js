// SCRATCH — Pattern 1 rig: w6 hub -> gap -> w2 bridge -> landing (will be restored).
export default {
  name: 'Level 4',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    // Wide hub (w6) with the lethal saw lane on it. Hub spans x 0..6.
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },
    // w2 bridge across a gap. Bridge near edge starts at BRIDGE_X0.
    // We parametrize via cx below; bridge is w2 d6 so it spans x cx-1..cx+1.
    { kind: 'platform', cx: 11, cz: 0, w: 2, d: 6 },
    // landing hub after the bridge
    { kind: 'platform', cx: 16, cz: 0, w: 6, d: 6, rails: true },
    { kind: 'finish', cx: 22, cz: 0, w: 4, d: 4, top: 10 },
  ],
};
