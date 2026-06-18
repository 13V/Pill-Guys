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
// Connective spine pieces (conveyor, hubs) are w6 / d6 so z=-3..+3 stays a continuous
// surface — a player on either side lane can thread the whole level. Spring pads
// carry twins at cz -3/0/+3 (see hazards.js) so any lane gets launched; the finish
// is d6 so any lane lands in the win sensor. A lethal spikeblock sits dead-center on
// each rejoin hub: it blocks ONLY the center (z +-0.6), so each side lane is clear
// but you can't bowl straight down the middle — you must commit to a lane.
//
// Deck X-spans & gaps (all gaps <=4u; lanes enter via a ~2u commit hop):
//   A 0..6 | B 7..11 (gap1) | C 13..17 (gap2)
//   D 18..24 (gap1) -B1 ENTRY-  [lanes 26..36, gap2 onto them]  R1 36..42 (flush)
//   E conveyor 44..54 (gap2) | F 54..60 (flush, spring#1) -> H 60..66 (top8, +3) -B2 ENTRY-
//   [lanes 68..78, gap2 onto them; risky has a 4u pit 72..76]  R2 78..84 (top5, drop 3u; spring#2)
//   K finish 86..90 (top10, spring lifts +5, +2 fwd).   Total length ~90u.
export default {
  name: 'Furnace Gaps',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3,  cz: 0, w: 6, d: 6, rails: true },          // A spawn hub        x: 0..6
    { kind: 'platform', cx: 9,  cz: 0, w: 4, d: 6 },                       // B real jump-gap    x: 7..11  (gap 1; d6 so side lanes can cross)
    { kind: 'platform', cx: 15, cz: 0, w: 4, d: 6 },                       // C real jump-gap    x:13..17  (gap 2; d6 so side lanes can cross)

    // --- BRANCH 1 (top 5): SAFE clear lane vs RISKY spike-gauntlet lane ---
    { kind: 'platform', cx: 21, cz: 0, w: 6, d: 6, rails: true },          // D B1 ENTRY hub      x:18..24  (gap 1)
    { kind: 'strip', x0: 26, x1: 36, z: -3, w: 2 },                        //   SAFE far lane     x:26..36  (gap 2 onto lane; CLEAR)
    { kind: 'strip', x0: 26, x1: 36, z: 3,  w: 2 },                        //   RISKY near lane   x:26..36  (gap 2 onto lane; gauntlet @31, land 26..29 & 33..36)
    { kind: 'platform', cx: 39, cz: 0, w: 6, d: 6, rails: true },          // R1 B1 REJOIN hub    x:36..42  (lanes land flush; center block)

    // --- spine: conveyor (+X) then spring #1 up to the raised section ---
    { kind: 'conveyor', cx: 49, cz: 0, len: 8, w: 6 },                     // E conveyor +X       x:44..54  (gap 2; w6 keeps z+-3 walkable)
    { kind: 'platform', cx: 57, cz: 0, w: 6, d: 6, rails: true },          // F spring#1 pad      x:54..60  (flush off conveyor)

    // --- BRANCH 2 (top 8, the RAISED section): SAFE clear vs RISKY 4u-gap + lethal saw ---
    { kind: 'platform', cx: 63, cz: 0, w: 6, d: 6, top: 8, rails: true },  // H RAISED B2 ENTRY   x:60..66  (spring lifts +3)
    { kind: 'strip', x0: 68, x1: 78, z: -3, w: 2, top: 8 },                //   SAFE far lane     x:68..78  (gap 2 onto lane; CLEAR)
    { kind: 'strip', x0: 68, x1: 72, z: 3,  w: 2, top: 8 },                //   RISKY near lane A  x:68..72  (gap 2 onto lane)
    { kind: 'strip', x0: 76, x1: 78, z: 3,  w: 2, top: 8 },                //   RISKY near lane B  x:76..78  (landing after the 4u pit 72..76)
    { kind: 'platform', cx: 81, cz: 0, w: 6, d: 6, rails: true },          // R2 B2 REJOIN + spring#2 pad  x:78..84  (lanes drop 3u, land flush; center block)

    { kind: 'finish',   cx: 88, cz: 0, w: 4, d: 6, top: 10 },              // K finish (d6 win sensor spans z+-3)  x:86..90  (spring +5, +2 fwd)
  ],
};
