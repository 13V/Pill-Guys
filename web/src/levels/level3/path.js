// Level 3 PATH — "Furnace Gaps" (medium). Decks/spawn/finish skeleton.
//
// Identity (kept): real GAPS to jump between decks (all <=4u, under the 5u max),
// a conveyor that pushes +X, a RAISED section (top 8) reached by spring #1, and
// spring #2 up to the finish tower (top 10).
//
// NEW: two Fall-Guys-style SPLITS (see ../../../MULTI_ROUTE_DESIGN.md). Each splits
// from a w6 hub into a SAFE far lane (z-3) and a RISKY near lane (z+3) with an
// empty middle (so you must commit), then rejoins at a w6 hub:
//   * BRANCH 1 (top 5):  SAFE = clear strip + a normal coin;  RISKY = spike gauntlet (size 4) + 2 coins.
//   * BRANCH 2 (top 8, the raised section):  SAFE = clear strip + a normal coin;
//                                            RISKY = a 4u jump-gap with a LETHAL sawblade in the pit + 2 coins.
// Connective spine pieces (conveyor, hubs) are w6 so z=-3..+3 stays a continuous
// surface — a player on either side lane can thread the whole level. Spring pads
// carry twins at cz -3/0/+3 (see hazards.js) so any lane gets launched; the finish
// is d6 so any lane lands in the win sensor.
//
// Deck X-spans & gaps:
//   A 0..6 | B 7..11 (gap2 to next via dynamics; edge gap A->B = 1) | C 13..17 (gap2)
//   D 18..24 (gap1) -B1 ENTRY-  [lanes 26..34, gap 2 onto them]  R1 34..40 (flush)
//   E conveyor 41..49 (gap1) | F 50..56 (gap1, spring#1) -> H 56..62 (top8, +3) -B2 ENTRY-
//   [lanes 64..74, gap 2 onto them]  R2 74..80 (top5, near/far drop 3u; spring#2)
//   K finish 82..86 (top10, spring lifts +5, +2 fwd).
export default {
  name: 'Furnace Gaps',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3,  cz: 0, w: 6, d: 6, rails: true },          // A spawn hub        x: 0..6
    { kind: 'platform', cx: 9,  cz: 0, w: 4, d: 4 },                       // B real jump-gap    x: 7..11  (gap 1)
    { kind: 'platform', cx: 15, cz: 0, w: 4, d: 4 },                       // C real jump-gap    x:13..17  (gap 2)

    // --- BRANCH 1 (top 5): SAFE clear lane vs RISKY spike-gauntlet lane ---
    { kind: 'platform', cx: 21, cz: 0, w: 6, d: 6, rails: true },          // D B1 ENTRY hub      x:18..24  (gap 1; spikeblock weave)
    { kind: 'strip', x0: 26, x1: 34, z: -3, w: 2 },                        //   SAFE far lane     x:26..34  (gap 2 onto lane)
    { kind: 'strip', x0: 26, x1: 34, z: 3,  w: 2 },                        //   RISKY near lane   x:26..34  (gap 2 onto lane)
    { kind: 'platform', cx: 37, cz: 0, w: 6, d: 6, rails: true },          // R1 B1 REJOIN hub    x:34..40  (lanes land flush)

    // --- spine: conveyor (+X) then spring #1 up to the raised section ---
    { kind: 'conveyor', cx: 45, cz: 0, len: 8, w: 6 },                     // E conveyor +X       x:41..49  (gap 1; w6 keeps z+-3 walkable)
    { kind: 'platform', cx: 53, cz: 0, w: 6, d: 6, rails: true },          // F spring#1 pad      x:50..56  (gap 1)

    // --- BRANCH 2 (top 8, the RAISED section): SAFE clear vs RISKY 4u-gap + lethal saw ---
    { kind: 'platform', cx: 59, cz: 0, w: 6, d: 6, top: 8, rails: true },  // H RAISED B2 ENTRY   x:56..62  (spring +3; spikeblock weave)
    { kind: 'strip', x0: 64, x1: 74, z: -3, w: 2, top: 8 },                //   SAFE far lane     x:64..74  (gap 2 onto lane; CLEAR)
    { kind: 'strip', x0: 64, x1: 68, z: 3,  w: 2, top: 8 },                //   RISKY near lane A  x:64..68  (gap 2 onto lane)
    { kind: 'strip', x0: 72, x1: 74, z: 3,  w: 2, top: 8 },                //   RISKY near lane B  x:72..74  (landing after the 4u pit)
    { kind: 'platform', cx: 77, cz: 0, w: 6, d: 6, rails: true },          // R2 B2 REJOIN + spring#2 pad  x:74..80  (lanes drop 3u, land flush)

    { kind: 'finish',   cx: 84, cz: 0, w: 4, d: 6, top: 10 },              // K finish (d6 win sensor spans z+-3)  x:82..86  (spring +5, +2 fwd)
  ],
};
