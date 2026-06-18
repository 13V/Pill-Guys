// Level 1 — "Assembly Line" (the gentle intro; easiest of the 5). Keeps the
// signature conveyor + red pipe arch + spring-to-finish, and is the game's FIRST
// Fall-Guys-style SPLIT: from the split hub the path forks into a SAFE lane
// (z-3, clear, ONE coin) and a RISKY lane (z+3, a single size-4 spike gauntlet
// ON the walked line, rewarded with THREE coins — a 3x payout you can see from
// the hub), then both REJOIN at the pipe-arch hub and share the spring-to-finish.
// The branch middle (z -2..+2) is intentionally empty, so you MUST commit to a
// lane. Exactly ONE on-the-line challenge (the risky gauntlet); the safe lane is
// continuous. Decks overlap slightly in X to keep the level tight (~33u).
// This is the flat-descriptor reference level — read it first.
export default {
  name: 'Assembly Line',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },   // spawn hub          x: 0..6
    { kind: 'conveyor', cx: 8, cz: 0, len: 8, w: 6 },              // conveyor (+X), w6 spans both lanes  x: 4..12
    { kind: 'platform', cx: 13, cz: 0, w: 6, d: 6, rails: true },  // SPLIT hub (z-3..3)  x: 10..16
    { kind: 'strip', x0: 15, x1: 23, z: -3, w: 2 },                // SAFE lane (far)     x: 15..23 (clear)
    { kind: 'strip', x0: 15, x1: 23, z: 3, w: 2 },                 // RISKY lane (near)   x: 15..23 (gauntlet at cx19)
    { kind: 'platform', cx: 25, cz: 0, w: 6, d: 6, rails: true },  // REJOIN hub (pipe arch + springs, z-3..3)  x: 22..28
    { kind: 'finish', cx: 30, cz: 0, w: 6, d: 6, top: 10 },        // finish tower (w6 so every lane lands)  x: 27..33
  ],
  hazards: [
    { kind: 'spikes', cx: 19, cz: 3, size: 4 },   // THE one on-line challenge: risky-lane jump-over gauntlet (x:17..21)
    { kind: 'sawblade', cx: 25, cz: 4.5 },        // decorative menace beside the rejoin hub (off the walked line; no death sensor)
    { kind: 'cone', cx: 17, cz: 3 },              // flag the risky gauntlet
    { kind: 'cone', cx: 21, cz: 3 },
  ],
  // One spring per lane z (on the rejoin hub) so whichever lane you arrive in
  // (far / near / center) launches you up onto the finish tower (top 5 -> top 10).
  springs: [
    { cx: 26, cz: -3 },
    { cx: 26, cz: 3 },
    { cx: 26, cz: 0 },
  ],
  coins: [
    { x: 3, y: 6.2, z: 0 }, { x: 8, y: 6.2, z: 0 },   // spine: spawn + conveyor (2)
    { x: 19, y: 6.2, z: -3 },                          // SAFE-lane reward: ONE normal coin
    { x: 16.5, y: 6.2, z: 3 }, { x: 19, y: 6.8, z: 3 }, { x: 21.5, y: 6.2, z: 3 }, // RISKY-lane reward: THREE coins (before / over / after the gauntlet) = 3x the safe lane
    { x: 25, y: 6.2, z: 0 },                           // rejoin hub
    { x: 30, y: 11.4, z: 0 },                          // finish tower
  ],
  decor: [
    { kind: 'pipeArch', cx: 25 },
    { kind: 'portal', cx: 25, cz: 0 },
    { kind: 'arrow', cx: 5, cz: 0 },
    { kind: 'arrow', cx: 14.5, cz: -3 },               // signpost the SAFE lane (the visible 3-coin arc signposts RISKY)
    { kind: 'gantry', cx: 8 },
  ],
};
