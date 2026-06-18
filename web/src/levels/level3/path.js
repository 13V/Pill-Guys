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
// SPEED (the Fall-Guys time-save): the runner moves at a CONSTANT 8 u/s, so a real time-
// save can only come from SPEED, not a shorter path. Every RISKY lane therefore rides a
// FORWARD CONVEYOR (pushes +X, ~12 u/s vs 8) where its SAFE sibling only WALKS — and the
// signature central spine conveyor is now LANE-SPECIFIC too (risky boosts, safe walks),
// exactly like Level 1. There are risky-only belts on the spawn edge, the C hub, the B1
// lane, the spine, the H landing, and the B2 entry. Net effect (autoplay): RISKY ~387
// steps vs SAFE ~452 (~0.86x) — the risky lanes reach the finish clearly faster, with the
// hazards (gauntlet, pit) kept as the risk and the 3x coin payout kept as the reward.
// Belts always END before a spring sensor and the pit-jump is taken UN-boosted, so every
// launch/landing arc stays clean and BOTH lanes finish with 0 deaths.
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
// Deck X-spans & gaps (all gaps <=4u). RISKY belts (z+3) shown in [brackets]; SAFE walks:
//   A spawn 0..6 [risky belt 2..6] | gap 4 (REAL early jump) | C(B1 entry) 10..14 [risky belt 10..14]
//   B1: SAFE strip 14..22 | RISKY size-2 gauntlet @16 then [belt 18..26] | R1 22..26 (flush)
//   spine SPLIT 26..33: SAFE strip vs [RISKY belt 26..33.5] | F spring pad 33..37 (rejoin)
//   spring#1 (~+5u up, ~9u fwd) -> H raised LANDING 41..47 (top8, w6 catch pad) [risky belt 42..47]
//   B2 (top8): SAFE strip 47..56 | RISKY [belt 47..49] run-up 49..50, 4u pit 50..54, land 54..56 | R2 56..60 (top5; spring#2)
//   gap 2 | K finish 62..66 (top10).   Total length ~66u (unchanged).
export default {
  name: 'Furnace Gaps',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3,  cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },          // A spawn hub        x: 0..6  (spawn at z0; stays solid for a grounded start) — WARM ignition gold opens the furnace
    // A risky-only FORWARD CONVEYOR on the spawn hub's near edge (z+3, x2..6, on top of A):
    // once you commit to the near lane it boosts you at ~12u/s into the very first jump.
    // The SAFE lane (z-3) walks A. z0 spawn is untouched (lands on the solid pad).
    { kind: 'conveyor', cx: 4, cz: 3, len: 4, w: 4, color: 'red' },                      //   RISKY spawn belt  x:2..6  (~12u/s lead-in to the A->C jump) — WARM red marks the risky near lane

    // --- BRANCH 1 (top 5): SAFE clear lane vs RISKY spike-gauntlet lane ---
    // Reached over the first REAL jump-gap (4u). C is the B1 entry hub (w4 d6). Lanes run
    // FLUSH off C (no entry gap) — the EMPTY MIDDLE (z0 is a void over the lanes) still
    // forces a commit, and a flush entry keeps the level compact.
    { kind: 'platform', cx: 12, cz: 0, w: 4, d: 6, rails: true, color: 'red' },          // C B1 ENTRY hub      x:10..14  (the A->C jump lands here; w4 d6) — hot red furnace hub
    // A risky-only FORWARD CONVEYOR on C's near edge (z+3, x10..14, on top of the hub) carries
    // the risky lane straight off its A->C landing into the gauntlet jump at ~12u/s. The SAFE
    // lane (z-3) walks C. Decorative saw + pipe arch still frame the hub.
    { kind: 'conveyor', cx: 12, cz: 3, len: 4, w: 4, color: 'red' },                     //   RISKY C-belt (+X) x:10..14  (~12u/s lead-in to the gauntlet jump) — WARM risky lane
    { kind: 'strip', x0: 14, x1: 22, z: -3, w: 2, color: 'blue' },                        //   SAFE far lane     x:14..22  (flush off C; CLEAR, walked @8u/s) — COOL blue = SAFE
    // RISKY near lane (z+3): jump the size-2 gauntlet RIGHT off the C hub (the RISK), land
    // on a long FORWARD CONVEYOR (x18..26) and ride it GROUNDED at ~12u/s into the rejoin
    // (the SHORTCUT — same pattern as Level 1). Doing the gauntlet jump first keeps the
    // whole belt a grounded boost, so RISKY clearly beats the safe lane's 8u/s walk.
    { kind: 'conveyor', cx: 22, cz: 3, len: 8, w: 4, color: 'yellow' },                     //   RISKY belt (+X)   x:18..26  (~12u/s, ridden grounded; lands the gauntlet jump and rides into R1) — WARM yellow = risky boost
    { kind: 'platform', cx: 24, cz: 0, w: 4, d: 6, rails: true, color: 'green' },          // R1 B1 REJOIN hub    x:22..26  (lanes land flush; w4 d6) — green cool breather between hot sections

    // --- spine SPLIT (x26..33): the signature CONVEYOR is now LANE-SPECIFIC (like Level 1) ---
    // Off R1 the lanes split once more: the SAFE lane (z-3) WALKS a clear strip at 8u/s, while
    // the RISKY lane (z+3) rides the FORWARD CONVEYOR at ~12u/s — a second, hazard-free Fall-
    // Guys time-save. Both rejoin on the F spring pad. The belt ENDS at ~x33.5 (just before the
    // spring-1 sensor) so the launch (cx35) is taken belt-free and arcs identically for either lane.
    { kind: 'strip', x0: 26, x1: 33, z: -3, w: 2, color: 'blue' },                        //   SAFE spine        x:26..33  (clear walk @8u/s) — COOL blue = SAFE
    { kind: 'conveyor', cx: 29.75, cz: 3, len: 7.5, w: 4, color: 'red' },                //   RISKY spine belt  x:26..33.5  (~12u/s, ridden grounded; ENDS ~0.6u before the spring-1 sensor so the launch stays clean) — WARM red = risky spine
    { kind: 'platform', cx: 35, cz: 0, w: 4, d: 6, rails: true, color: 'yellow' },          // F spring#1 REJOIN + pad  x:33..37  (both lanes land; spring twins here) — bright yellow launch pad

    // --- BRANCH 2 (top 8, the RAISED section): SAFE clear vs RISKY 4u-gap SHORTCUT ---
    // The spring throws ~+5u up and ~9u forward, so the raised LANDING (H) sits ~9u ahead
    // of the spring pad and is a generous w6 d6 catch pad spanning z-3..+3. B2 lanes run
    // FLUSH off H (the void middle still forces a commit).
    { kind: 'platform', cx: 44, cz: 0, w: 6, d: 6, top: 8, rails: true, color: 'red' },  // H RAISED LANDING    x:41..47  (spring #1 arc lands here; w6 catch pad — stays solid for the arc) — hot red raised furnace core
    // A risky-only FORWARD CONVEYOR over H's near edge (z+3, x44..47, on top of the catch pad)
    // boosts the risky lane straight off its spring-1 landing toward B2; the SAFE lane (z-3)
    // walks H. The catch zone (x41..44) stays solid w6 so the spring arc always lands safely.
    { kind: 'conveyor', cx: 44.5, cz: 3, len: 5, w: 4, top: 8, color: 'red' },           //   RISKY H-belt (+X) x:42..47  (~12u/s off the spring-1 landing into B2; catch zone x41..42 stays solid w6) — WARM risky lane
    { kind: 'strip', x0: 47, x1: 56, z: -3, w: 2, top: 8, color: 'green' },                //   SAFE far lane     x:47..56  (flush off H; CLEAR, full length, walked @8u/s) — COOL green = SAFE
    // RISKY near lane (z+3): a short FORWARD CONVEYOR off H (x47..49) gives an early ~12u/s
    // nudge, then a solid run-up (x49..50), the 4u PIT (x50..54, the RISK), and a landing
    // strip (x54..56) before the 3u drop onto R2. The pit-jump is taken UN-boosted (off the
    // run-up, not the belt) so it lands cleanly like the safe path; the belt is the SHORTCUT.
    { kind: 'conveyor', cx: 48, cz: 3, len: 2, w: 4, top: 8, color: 'yellow' },             //   RISKY belt (+X)   x:47..49  (~12u/s early nudge off H) — WARM yellow = risky boost
    { kind: 'strip', x0: 49, x1: 50, z: 3, w: 2, top: 8, color: 'yellow' },                 //   RISKY run-up      x:49..50  (solid UN-boosted takeoff for the pit jump, x49.4) — WARM risky lane
    { kind: 'strip', x0: 54, x1: 56, z: 3,  w: 2, top: 8, color: 'red' },                //   RISKY landing     x:54..56  (lands the 4u pit-jump; then drops 3u onto R2 like the safe path) — WARM red = risky landing
    { kind: 'platform', cx: 58, cz: 0, w: 4, d: 6, rails: true, color: 'green' },          // R2 B2 REJOIN + spring#2 pad  x:56..60  (lanes drop 3u, land flush; w4 d6) — green cool rejoin before the finish launch

    { kind: 'finish',   cx: 64, cz: 0, w: 4, d: 6, top: 10, color: 'yellow' },              // K finish (d6 win sensor spans z+-3)  x:62..66  (spring #2 lifts +5 & ~7u fwd) — celebratory gold finish tower
  ],
};
