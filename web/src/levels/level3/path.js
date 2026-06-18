// Level 3 PATH — "Furnace Gaps" (medium). Decks/spawn/finish skeleton.
// New this level: real GAPS to jump between decks (all <=3u, well under the 5u
// max), a conveyor that pushes +X straight into the next gap, a raised section
// (top 8) reached by spring #1, then a drop back down and spring #2 up to the
// finish tower (top 10). All decks on the cz=0 center lane for a clean run.
// Gaps (empty X between deck edges): A->B 2, B->C 2, C->D 1, D->E 1, E->F 2,
// F->G 2, G->H spring(+3, dx4), H->I drop(-3, touch+2), I->K spring(+5, dx3).
export default {
  name: 'Furnace Gaps',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3,  cz: 0, w: 6, d: 6, rails: true },          // A spawn hub      x: 0..6
    { kind: 'platform', cx: 10, cz: 0, w: 4, d: 4 },                       // B               x:8..12  (gap 2)
    { kind: 'platform', cx: 16, cz: 0, w: 4, d: 4 },                       // C               x:14..18 (gap 2)
    { kind: 'platform', cx: 22, cz: 0, w: 6, d: 6, rails: true },          // D spikeblock hub x:19..25  (gap 1)
    { kind: 'conveyor', cx: 30, cz: 0, len: 8, w: 4 },                     // E conveyor +X    x:26..34  (gap 1)
    { kind: 'platform', cx: 38, cz: 0, w: 4, d: 4 },                       // F               x:36..40 (gap 2)
    { kind: 'platform', cx: 43, cz: 0, w: 2, d: 2 },                       // G spring#1 pad   x:42..44  (gap 2)
    { kind: 'platform', cx: 47, cz: 0, w: 6, d: 6, top: 8, rails: true },  // H RAISED hub     x:44..50  (spring +3, dx4)
    { kind: 'platform', cx: 52, cz: 0, w: 4, d: 4 },                       // I drop landing   x:50..54 (drop -3)
    { kind: 'finish',   cx: 56, cz: 0, w: 4, d: 4, top: 10 },              // K finish         x:54..58  (spring +5, dx3)
  ],
};
