// Level 1 — "Assembly Line" (gentle intro). Keeps the signature conveyor + red
// pipe arch + spring-to-finish, and adds the game's FIRST Fall-Guys-style SPLIT:
// from the split hub the path forks into a SAFE lane (z-3, clear, normal coin)
// and a RISKY lane (z+3, a small spike gauntlet, rewarded with TWO coins), then
// both REJOIN at the pipe-arch hub and share the spring-to-finish. The branch
// middle (z -2..+2) is intentionally empty, so you must commit to a lane.
// This is the flat-descriptor reference level — read it first.
export default {
  name: 'Assembly Line',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },   // spawn hub        x: 0..6
    { kind: 'conveyor', cx: 10, cz: 0, len: 8, w: 6 },             // conveyor (+X), w6 spans both lanes  x: 6..14
    { kind: 'platform', cx: 16, cz: 0, w: 6, d: 6, rails: true },  // SPLIT hub (z-3..3) x:13..19
    { kind: 'strip', x0: 19, x1: 29, z: -3, w: 2 },                // SAFE lane (far)    x:19..29
    { kind: 'strip', x0: 19, x1: 29, z: 3, w: 2 },                 // RISKY lane (near)  x:19..29
    { kind: 'platform', cx: 32, cz: 0, w: 6, d: 6, rails: true },  // REJOIN hub (pipe arch + springs, z-3..3)  x:29..35
    { kind: 'finish', cx: 38, cz: 0, w: 6, d: 6, top: 10 },        // finish tower (w6 so every lane lands)  x:35..41
  ],
  hazards: [
    { kind: 'spikes', cx: 24, cz: 3, size: 4 },   // RISKY lane jump-over gauntlet (x:22..26)
    { kind: 'sawblade', cx: 32, cz: 0 },          // decorative menace spinning at the rejoin hub
    { kind: 'cone', cx: 21.5, cz: 3 },            // flag the risky gauntlet
    { kind: 'cone', cx: 26.5, cz: 3 },
  ],
  // One spring per lane z (on the rejoin hub) so whichever lane you arrive in
  // launches you up onto the finish tower.
  springs: [
    { cx: 33.5, cz: -3 },
    { cx: 33.5, cz: 3 },
    { cx: 33.5, cz: 0 },
  ],
  coins: [
    { x: 3, y: 6.2, z: 0 }, { x: 6.5, y: 6.2, z: 0 }, { x: 10, y: 6.2, z: 0 },
    { x: 24, y: 6.2, z: -3 },                       // SAFE-lane reward (one normal coin)
    { x: 22, y: 6.6, z: 3 }, { x: 26, y: 6.6, z: 3 }, // RISKY-lane reward (TWO coins bracketing the gauntlet)
    { x: 31, y: 6.2, z: 0 },                        // rejoin hub
    { x: 38, y: 11.4, z: 0 },                       // finish tower
  ],
  decor: [
    { kind: 'pipeArch', cx: 32 },
    { kind: 'portal', cx: 32, cz: 0 },
    { kind: 'arrow', cx: 5, cz: 0 },
    { kind: 'arrow', cx: 17.5, cz: -3 },            // signpost the SAFE lane
    { kind: 'gantry', cx: 10 },
  ],
};
