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
//   A 0..6 | gap 3 | B 9..13 | gap 3 | C(B1 entry) 16..20
//   gap 2 onto lanes 22..30 (top5) | R1 30..36 (flush)
//   gap 2 | conveyor 38..44 | gap 3 (belt-assisted) onto F spring pad 47..51
//   spring#1 -> H raised entry 53..57 (top8, +3)
//   gap 2 onto B2 lanes 59..67 (top8; risky = 4u pit 61..65, land 65..67) | R2 67..71 (top5; spring#2)
//   gap 2 | K finish 73..77 (top10).   Total length ~62u.
export default {
  name: 'Furnace Gaps',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3,  cz: 0, w: 6, d: 6, rails: true },          // A spawn hub        x: 0..6
    { kind: 'platform', cx: 11, cz: 0, w: 4, d: 6 },                       // B real jump-gap    x: 9..13  (gap 1 = 3u; d6 so side lanes can cross)

    // --- BRANCH 1 (top 5): SAFE clear lane vs RISKY spike-gauntlet lane ---
    { kind: 'platform', cx: 18, cz: 0, w: 4, d: 6, rails: true },          // C B1 ENTRY hub      x:16..20  (gap 2 = 3u; decorative saw menace)
    { kind: 'strip', x0: 22, x1: 30, z: -3, w: 2 },                        //   SAFE far lane     x:22..30  (gap 2 onto lane; CLEAR)
    { kind: 'strip', x0: 22, x1: 30, z: 3,  w: 2 },                        //   RISKY near lane   x:22..30  (gauntlet @26: spikes 24..28, land 22..24 & 28..30)
    { kind: 'platform', cx: 33, cz: 0, w: 6, d: 6, rails: true },          // R1 B1 REJOIN hub    x:30..36  (lanes land flush)

    // --- spine: conveyor (+X) straight into a jump-gap, then spring #1 up ---
    { kind: 'conveyor', cx: 41, cz: 0, len: 6, w: 6 },                     // E conveyor +X       x:38..44  (gap 2; w6 keeps z+-3 walkable)
    { kind: 'platform', cx: 49, cz: 0, w: 4, d: 6, rails: true },          // F spring#1 pad      x:47..51  (gap 3, belt-assisted)

    // --- BRANCH 2 (top 8, the RAISED section): SAFE clear vs RISKY 4u-gap SHORTCUT ---
    { kind: 'platform', cx: 55, cz: 0, w: 4, d: 6, top: 8, rails: true },  // H RAISED B2 ENTRY   x:53..57  (spring lifts +3 & fwd)
    { kind: 'strip', x0: 59, x1: 67, z: -3, w: 2, top: 8 },                //   SAFE far lane     x:59..67  (gap 2 onto lane; CLEAR, full length)
    { kind: 'strip', x0: 59, x1: 61, z: 3,  w: 2, top: 8 },                //   RISKY near lane A  x:59..61  (gap 2 onto lane)
    { kind: 'strip', x0: 65, x1: 67, z: 3,  w: 2, top: 8 },                //   RISKY near lane B  x:65..67  (landing after the 4u pit 61..65)
    { kind: 'platform', cx: 69, cz: 0, w: 6, d: 6, rails: true },          // R2 B2 REJOIN + spring#2 pad  x:66..72  (lanes drop 3u, land flush)

    { kind: 'finish',   cx: 75, cz: 0, w: 4, d: 6, top: 10 },              // K finish (d6 win sensor spans z+-3)  x:73..77  (spring +5, +2 fwd)
  ],
};
