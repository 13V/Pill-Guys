// Level 4 — "Fracture Foundry" (med-high). Built to R&D-verified limits
// (jump reach ~7.9u, gaps onto strips ≤5u, size-4 spike gauntlets, conveyor +4,
// spring->finish). ~70u, all gaps ≤3u.
export default {
  name: 'Fracture Foundry',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true }, // start hub  x0..6
    { kind: 'strip', x0: 6, x1: 18, w: 4 },                      // entry runway (spike gauntlet)
    { kind: 'strip', x0: 20, x1: 28, w: 2 },                     // gap 2u -> w2 precision bridge
    { kind: 'strip', x0: 30, x1: 37, w: 2 },                     // gap 2u -> w2 bridge
    { kind: 'platform', cx: 41, cz: 0, w: 6, d: 6, rails: true },// gap 1u -> saw hub  x38..44
    { kind: 'conveyor', cx: 49, cz: 0, len: 8, w: 4 },           // gap 1u -> belt x45..53 (+X)
    { kind: 'platform', cx: 58, cz: 0, w: 4, d: 4 },             // gap 3u (belt-assisted) -> landing x56..60
    { kind: 'platform', cx: 63, cz: 0, w: 4, d: 4 },             // gap 1u -> spring deck x61..65
    { kind: 'finish', cx: 68, cz: 0, w: 4, d: 4, top: 10 },      // spring -> finish (near edge x66)
  ],
};
