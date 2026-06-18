// Level 2 PATH — "Coolant Causeway" (low-med). Decks/spawn/finish skeleton.
// Difficulty target: ~40-45u, longer strips, a narrow (w2) precision stretch,
// a saw hub, two spike-gauntlet strips, a spring up to the finish tower.
// Movement constraints (see ../../../LEVELS_DESIGN.md): gaps <=5u, step-ups <=3u,
// deck widths >=2. All decks stay on the cz=0 center lane so the run is clean.
export default {
  name: 'Coolant Causeway',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true }, // A spawn hub   x: 0..6
    { kind: 'strip', x0: 6, x1: 16, w: 4 },                       // B entry strip x: 6..16  (gauntlet #1)
    { kind: 'platform', cx: 19, cz: 0, w: 6, d: 6, rails: true }, // C saw hub     x:16..22  (lethal saw off-lane)
    { kind: 'strip', x0: 22, x1: 29, w: 2 },                      // D narrow      x:22..29  (precision)
    { kind: 'strip', x0: 29, x1: 39, w: 4 },                      // E gauntlet#2  x:29..39
    { kind: 'platform', cx: 41, cz: 0, w: 2, d: 2 },              // F spring pad  x:40..42  (gap 1u)
    { kind: 'finish', cx: 44, cz: 0, w: 4, d: 4, top: 10 },       // G finish      x:42..46  (spring lifts +5, dx 3)
  ],
};
