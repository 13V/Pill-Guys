// Level 3 PATH — "Furnace Gaps" (medium, ~66u). Decks/spawn/finish skeleton.
//
// Identity (kept, but COMPRESSED): real GAPS to jump between decks (all <=4u, under
// the 5u max), a CONVEYOR that pushes +X straight INTO a jump-gap, a RAISED section
// (top 8) reached by spring #1, and spring #2 up to the finish tower (top 10).
//
// Two Fall-Guys-style SPLITS (see ../../../MULTI_ROUTE_DESIGN.md). Each splits from a
// hub into a SAFE far lane (z-3) and a RISKY near lane (z+3) with an EMPTY MIDDLE
// (z -2..+2 is a void over the lane X-range, so you MUST commit to one side), then
// rejoins at a hub:
//   * BRANCH 1 (top 5):  SAFE = clear strip + 1 coin;  RISKY = size-2 spike gauntlet
//                        (the level's ONLY lethal hazard) + 3 coins (3x the safe pay).
//   * BRANCH 2 (top 8, the raised section):  SAFE = a clear, longer strip + 1 coin;
//                        RISKY = a SHORTCUT: a 4u jump-gap over a (decorative) pit,
//                        landing earlier than the safe walk + 3 coins.
//
// COMPRESSION vs the old 90u build: hubs are w4 d6 (4u in X, but full z-3..+3 depth so
// side lanes still thread them), branch lanes are 8-9u, and lane entries are FLUSH off
// their hub (no commit-gap — the void middle alone forces the choice). The two SHOWCASE
// jumps stay real: the 4u early gap and the 4u B2 pit. Spine pieces (conveyor, hubs) span
// z-3..+3 so either side lane can thread the whole level. Spring pads carry twins at
// cz -3/0/+3 (see hazards.js) so any lane gets launched; the finish is d6 so any lane
// lands in the win sensor.
//
// DIFFICULTY (medium, intentionally < Level 4): exactly ONE lethal placed hazard (the
// B1 spike gauntlet). L4 has two lethal sensors, so the lethal ramp is L3(1) < L4(2).
// The B2 pit saw is DECORATIVE (a pit under a real gap — the jump is the challenge, not
// a death box). No center spikeblocks: the empty middle alone forces lane commitment.
// Three on-the-line challenges: the 4u early jump-gap, the B1 spike-gauntlet lane, and
// the raised B2 4u jump-gap (a shortcut). All sit on the walked line.
//
// Deck X-spans & gaps (all gaps <=4u):
//   A spawn 0..6 | gap 4 (REAL early jump) | C(B1 entry) 10..14
//   B1 lanes 14..22 FLUSH off C (top5; risky size-2 gauntlet @18) | R1 22..26 (flush)
//   conveyor 26..32 (flush off R1) | gap 1 onto F spring pad 33..37
//   spring#1 (~+5u up, ~9u fwd) -> H raised LANDING 41..47 (top8, w6 catch pad)
//   B2 lanes 47..56 FLUSH off H (top8; risky = 4u pit 50..54, land 54..56) | R2 56..60 (top5; spring#2)
//   gap 2 | K finish 62..66 (top10).   Total length ~66u (was ~90u).
export default {
  name: 'Furnace Gaps',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3,  cz: 0, w: 6, d: 6, rails: true },          // A spawn hub        x: 0..6

    // --- BRANCH 1 (top 5): SAFE clear lane vs RISKY spike-gauntlet lane ---
    // Reached over the first REAL jump-gap (4u). C is the B1 entry hub (w4 d6). Lanes run
    // FLUSH off C (no entry gap) — the EMPTY MIDDLE (z0 is a void over the lanes) still
    // forces a commit, and a flush entry keeps the level compact.
    { kind: 'platform', cx: 12, cz: 0, w: 4, d: 6, rails: true },          // C B1 ENTRY hub      x:10..14  (gap 1 = 4u REAL jump; decorative saw menace)
    { kind: 'strip', x0: 14, x1: 22, z: -3, w: 2 },                        //   SAFE far lane     x:14..22  (flush off C; CLEAR, walked @8u/s)
    // RISKY near lane (z+3): jump the size-2 gauntlet RIGHT off the C hub (the RISK), land
    // on a long FORWARD CONVEYOR (x18..26) and ride it GROUNDED at ~12u/s into the rejoin
    // (the SHORTCUT — same pattern as Level 1). Doing the gauntlet jump first keeps the
    // whole belt a grounded boost, so RISKY clearly beats the safe lane's 8u/s walk.
    { kind: 'conveyor', cx: 22, cz: 3, len: 8, w: 4 },                     //   RISKY belt (+X)   x:18..26  (~12u/s, ridden grounded; lands the gauntlet jump and rides into R1)
    { kind: 'platform', cx: 24, cz: 0, w: 4, d: 6, rails: true },          // R1 B1 REJOIN hub    x:22..26  (lanes land flush; w4 d6)

    // --- spine: CONVEYOR (+X) flush off R1, then spring #1 lifts up to the raised section ---
    { kind: 'conveyor', cx: 29, cz: 0, len: 6, w: 6 },                     // E conveyor +X       x:26..32  (flush off R1; belt push helps the next jump)
    { kind: 'platform', cx: 35, cz: 0, w: 4, d: 6, rails: true },          // F spring#1 pad      x:33..37  (gap 1 off the belt; spring twins here)

    // --- BRANCH 2 (top 8, the RAISED section): SAFE clear vs RISKY 4u-gap SHORTCUT ---
    // The spring throws ~+5u up and ~9u forward, so the raised LANDING (H) sits ~9u ahead
    // of the spring pad and is a generous w6 d6 catch pad spanning z-3..+3. B2 lanes run
    // FLUSH off H (the void middle still forces a commit).
    { kind: 'platform', cx: 44, cz: 0, w: 6, d: 6, top: 8, rails: true },  // H RAISED LANDING    x:41..47  (spring #1 arc lands here; w6 catch pad)
    { kind: 'strip', x0: 47, x1: 56, z: -3, w: 2, top: 8 },                //   SAFE far lane     x:47..56  (flush off H; CLEAR, full length, walked @8u/s)
    // RISKY near lane (z+3): ride a long FORWARD CONVEYOR run-up (x47..52, top8) at ~12u/s,
    // then a boosted leap over the 4u PIT (x52..56, the RISK) that drops you straight onto
    // the R2 rejoin (top5). The belt is the SHORTCUT; the pit (+ decorative saw) is the risk.
    { kind: 'conveyor', cx: 49.5, cz: 3, len: 5, w: 4, top: 8 },           //   RISKY belt (+X)   x:47..52  (~12u/s run-up, ridden grounded off H)
    // (pit x52..56 = a 4u gap; the boosted jump clears it and lands on R2 below)
    { kind: 'platform', cx: 58, cz: 0, w: 4, d: 6, rails: true },          // R2 B2 REJOIN + spring#2 pad  x:56..60  (lanes drop 3u, land flush; w4 d6)

    { kind: 'finish',   cx: 64, cz: 0, w: 4, d: 6, top: 10 },              // K finish (d6 win sensor spans z+-3)  x:62..66  (spring #2 lifts +5 & ~7u fwd)
  ],
};
