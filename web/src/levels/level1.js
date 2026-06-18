// Level 1 — "Assembly Line" (the gentle intro; easiest of the 5). Keeps the
// signature conveyor + red pipe arch + spring-to-finish, and is the game's FIRST
// Fall-Guys-style SPLIT: from the split hub the path forks into a SAFE lane
// (z-3, a clear walkway, ONE coin) and a RISKY lane (z+3, a single size-4 spike
// gauntlet you jump over and THEN a FORWARD CONVEYOR that boosts you to the
// rejoin hub — rewarded with THREE coins). The belt makes RISKY a real
// shortcut: on the boosted lane the pill travels ~12 u/s vs the safe lane's
// 8 u/s, so RISKY reaches the rejoin/finish clearly FASTER (the Fall-Guys
// time-save). Both REJOIN at the pipe-arch hub and share the spring-to-finish.
// The branch middle (z -2..+2) is intentionally empty, so you MUST commit to a
// lane. The RISKY risk is the gauntlet; its reward is the belt + 3x coins.
// This is the flat-descriptor reference level — read it first.
export default {
  name: 'Assembly Line',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },   // spawn hub          x: 0..6
    { kind: 'conveyor', cx: 8, cz: 0, len: 8, w: 6 },              // spine conveyor (+X), w6 spans both lanes  x: 4..12
    { kind: 'platform', cx: 13, cz: 0, w: 6, d: 6, rails: true },  // SPLIT hub (z-3..3)  x: 10..16

    // ---- BRANCH (x16..30): the time-save split. ----
    // SAFE lane (far, z-3): a continuous clear walkway the whole branch — no
    // boost, so you cover it at the base 8 u/s (the slower, surer route).
    { kind: 'strip', x0: 15, x1: 36, z: -3, w: 2 },                // SAFE probe
    { kind: 'conveyor', cx: 24, cz: 3, len: 24, w: 4 },            // RISKY belt probe x:12..36

    { kind: 'platform', cx: 38, cz: 0, w: 6, d: 6, rails: true },  // REJOIN hub probe
    { kind: 'finish', cx: 43, cz: 0, w: 6, d: 6, top: 10 },        // finish probe
  ],
  hazards: [
    { kind: 'spikes', cx: 18, cz: 3, size: 4 },   // THE one on-line challenge: risky-lane jump-over gauntlet (x:16..20), belt is right after
    { kind: 'sawblade', cx: 32, cz: 4.5 },        // decorative menace beside the rejoin hub (off the walked line; no death sensor)
    { kind: 'cone', cx: 16.5, cz: 3 },            // flag the risky gauntlet
    { kind: 'cone', cx: 19.5, cz: 3 },
  ],
  // One spring per lane z (on the rejoin hub) so whichever lane you arrive in
  // (far / near / center) launches you up onto the finish tower (top 5 -> top 10).
  springs: [
    { cx: 39, cz: -3 },
    { cx: 39, cz: 3 },
    { cx: 39, cz: 0 },
  ],
  coins: [
    { x: 3, y: 6.2, z: 0 }, { x: 8, y: 6.2, z: 0 },   // spine: spawn + conveyor (2)
    { x: 22, y: 6.2, z: -3 },                          // SAFE-lane reward: ONE normal coin
    { x: 16, y: 6.8, z: 3 }, { x: 23, y: 6.2, z: 3 }, { x: 27, y: 6.2, z: 3 }, // RISKY-lane reward: THREE coins (over the gauntlet + along the belt) = 3x the safe lane
    { x: 32, y: 6.2, z: 0 },                           // rejoin hub
    { x: 37, y: 11.4, z: 0 },                          // finish tower
  ],
  decor: [
    { kind: 'pipeArch', cx: 32 },
    { kind: 'portal', cx: 32, cz: 0 },
    { kind: 'arrow', cx: 5, cz: 0 },
    { kind: 'arrow', cx: 14.5, cz: -3 },               // signpost the SAFE lane (the visible 3-coin arc signposts RISKY)
    { kind: 'gantry', cx: 8 },
  ],
};
