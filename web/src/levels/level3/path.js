// Level 3 PATH — "Furnace Gaps" (medium, ~62u). Decks/spawn/finish skeleton.
//
// Identity (kept, but COMPRESSED): real GAPS to jump between decks (all <=4u, under
// the 5u max), a CONVEYOR that pushes +X straight INTO a jump-gap, a RAISED section
// (top 8) reached by spring #1, and spring #2 up to the finish tower (top 10).
//
// Two Fall-Guys-style SPLITS (see ../../../MULTI_ROUTE_DESIGN.md). Each splits from a
// hub into a SAFE far lane (z-3) and a RISKY near lane (z+3) with an EMPTY MIDDLE
// (z -2..+2 is a void over the lane X-range, so you MUST commit to one side), then
// rejoins at a hub:
//   * BRANCH 1 (top 5):  SAFE = clear strip + 1 coin;  RISKY = size-4 spike gauntlet
//                        (the level's ONLY lethal hazard) + 3 coins (3x the safe pay).
//   * BRANCH 2 (top 8, the raised section):  SAFE = a clear, longer strip + 1 coin;
//                        RISKY = a SHORTCUT: a 4u jump-gap over a (decorative) pit,
//                        landing earlier than the safe walk + 3 coins.
//
// COMPRESSION vs the old 90u build: hubs are w4 d6 (4u in X, but full z-3..+3 depth so
// side lanes still thread them), branch lanes are 8u (not 10u), and every connective
// gap is a tight 2u commit-hop (the two SHOWCASE jumps — the early gap and the B2 pit —
// stay a real ~3-4u). Spine pieces (conveyor, hubs) span z-3..+3 so either side lane
// can thread the whole level. Spring pads carry twins at cz -3/0/+3 (see hazards.js) so
// any lane gets launched; the finish is d6 so any lane lands in the win sensor.
//
// DIFFICULTY (medium, intentionally < Level 4): exactly ONE lethal placed hazard (the
// B1 spike gauntlet). L4 has two lethal sensors, so the lethal ramp is L3(1) < L4(2).
// The B2 pit saw is DECORATIVE (a pit under a real gap — the jump is the challenge, not
// a death box). No center spikeblocks: the empty middle alone forces lane commitment.
// Three on-the-line challenges: the early jump-gap chain, the B1 gauntlet lane, and the
// conveyor-fed B2 jump-gap.
//
// Deck X-spans & gaps (all gaps <=4u):
//   A spawn 0..6 | gap 4 (REAL early jump) | C(B1 entry) 10..14
//   gap 2 onto B1 lanes 16..24 (top5; risky gauntlet @20) | R1 24..28 (flush)
//   conveyor 28..34 (flush off R1) | gap 2 (belt-assisted) onto F spring pad 36..40
//   spring#1 -> H raised entry 41..45 (top8, +3 over a 1u gap)
//   gap 2 onto B2 lanes 47..55 (top8; risky = 4u pit 49..53, land 53..55) | R2 55..59 (top5; spring#2)
//   gap 2 | K finish 61..65 (top10).   Total length ~65u (was ~90u).
export default {
  name: 'Furnace Gaps',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3,  cz: 0, w: 6, d: 6, rails: true },          // A spawn hub        x: 0..6

    // --- BRANCH 1 (top 5): SAFE clear lane vs RISKY spike-gauntlet lane ---
    // Reached over the first REAL jump-gap (4u). C is the B1 entry hub (w4 d6).
    { kind: 'platform', cx: 12, cz: 0, w: 4, d: 6, rails: true },          // C B1 ENTRY hub      x:10..14  (gap 1 = 4u REAL jump; decorative saw menace)
    { kind: 'strip', x0: 16, x1: 24, z: -3, w: 2 },                        //   SAFE far lane     x:16..24  (gap 2 onto lane; CLEAR)
    { kind: 'strip', x0: 16, x1: 24, z: 3,  w: 2 },                        //   RISKY near lane   x:16..24  (gauntlet @20: spikes 18..22, land 16..18 & 22..24)
    { kind: 'platform', cx: 26, cz: 0, w: 4, d: 6, rails: true },          // R1 B1 REJOIN hub    x:24..28  (lanes land flush; w4 d6)

    // --- spine: CONVEYOR (+X) flush off R1, pushing you INTO a jump-gap, then spring #1 ---
    { kind: 'conveyor', cx: 31, cz: 0, len: 6, w: 6 },                     // E conveyor +X       x:28..34  (flush off R1; belt push helps the next jump)
    { kind: 'platform', cx: 38, cz: 0, w: 4, d: 6, rails: true },          // F spring#1 pad      x:36..40  (gap 2 = belt-assisted jump off the conveyor)

    // --- BRANCH 2 (top 8, the RAISED section): SAFE clear vs RISKY 4u-gap SHORTCUT ---
    { kind: 'platform', cx: 43, cz: 0, w: 4, d: 6, top: 8, rails: true },  // H RAISED B2 ENTRY   x:41..45  (spring #1 lifts +3 & fwd over a 1u gap)
    { kind: 'strip', x0: 47, x1: 55, z: -3, w: 2, top: 8 },                //   SAFE far lane     x:47..55  (gap 2 onto lane; CLEAR, full length)
    { kind: 'strip', x0: 47, x1: 49, z: 3,  w: 2, top: 8 },                //   RISKY near lane A  x:47..49  (gap 2 onto lane)
    { kind: 'strip', x0: 53, x1: 55, z: 3,  w: 2, top: 8 },                //   RISKY near lane B  x:53..55  (landing after the 4u pit 49..53)
    { kind: 'platform', cx: 57, cz: 0, w: 4, d: 6, rails: true },          // R2 B2 REJOIN + spring#2 pad  x:55..59  (lanes drop 3u, land flush; w4 d6)

    { kind: 'finish',   cx: 63, cz: 0, w: 4, d: 6, top: 10 },              // K finish (d6 win sensor spans z+-3)  x:61..65  (spring +5, +4 fwd)
  ],
};
