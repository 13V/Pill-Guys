// Level 1 — "Assembly Line" (the gentle intro; easiest of the 5). Keeps the
// signature conveyor + red pipe arch + spring-to-finish, and is the game's FIRST
// Fall-Guys-style SPLIT: from the split hub the path forks into a SAFE lane
// (z-3, a clear walkway you cover at the base 8 u/s, ONE coin) and a RISKY lane
// (z+3, a size-4 spike GAUNTLET you jump over and THEN a long FORWARD CONVEYOR
// that pushes +X — you ride it to the rejoin hub at ~12 u/s, rewarded with THREE
// coins). The belt is the SHORTCUT: in this constant-run game a time-save can
// only come from SPEED, so the boosted RISKY lane reaches the rejoin/finish
// CLEARLY FASTER than the SAFE walk (a real Fall-Guys time-save — verified
// RISKY ~232 vs SAFE ~278 autoplay steps, ~0.84x). Both REJOIN at the pipe-arch
// hub and share the spring-to-finish. The branch middle (z -2..+2) is
// intentionally empty, so you MUST commit to a lane. The RISKY risk is the
// gauntlet; its reward is the belt boost + 3x coins.
// This is the flat-descriptor reference level — read it first.
export default {
  name: 'Assembly Line',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },   // spawn hub          x: 0..6
    { kind: 'conveyor', cx: 8, cz: 0, len: 8, w: 6 },              // spine conveyor (+X), w6 spans both lanes  x: 4..12
    { kind: 'platform', cx: 13, cz: 0, w: 6, d: 6, rails: true },  // SPLIT hub (z-3..3)  x: 10..16

    // ---- BRANCH (x16..36): the time-save split (SAFE walk vs RISKY belt). ----
    // SAFE lane (far, z-3): a continuous clear walkway the whole branch — NO
    // boost, so you cover it at the base 8 u/s (the slower, surer route).
    { kind: 'strip', x0: 15, x1: 36, z: -3, w: 2 },                // SAFE lane (far)     x: 15..36 (clear, no boost)
    // RISKY lane (near, z+3): a FORWARD CONVEYOR running the whole branch
    // (pushes +X, so you move ~12 u/s vs 8). Jump the gauntlet (x16..20) and ride
    // the belt to the rejoin hub — clearly FASTER than the safe walk. The belt's
    // solid is full-width over z+3, so it IS this lane's deck.
    { kind: 'conveyor', cx: 24, cz: 3, len: 24, w: 4 },            // RISKY belt (+X)     x: 12..36 (boost to ~12 u/s)

    { kind: 'platform', cx: 38, cz: 0, w: 6, d: 6, rails: true },  // REJOIN hub (pipe arch + springs, z-3..3)  x: 35..41
    { kind: 'finish', cx: 43, cz: 0, w: 6, d: 6, top: 10 },        // finish tower (w6 so every lane lands)  x: 40..46
  ],
  hazards: [
    { kind: 'spikes', cx: 18, cz: 3, size: 4 },   // THE one on-line challenge: risky-lane jump-over gauntlet (x:16..20), then the belt carries you
    { kind: 'sawblade', cx: 38, cz: 4.5 },        // decorative menace beside the rejoin hub (off the walked line; no death sensor)
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
    { x: 25, y: 6.2, z: -3 },                          // SAFE-lane reward: ONE normal coin (mid-walk)
    { x: 16, y: 6.8, z: 3 }, { x: 25, y: 6.2, z: 3 }, { x: 32, y: 6.2, z: 3 }, // RISKY-lane reward: THREE coins (over the gauntlet + along the belt) = 3x the safe lane
    { x: 38, y: 6.2, z: 0 },                           // rejoin hub
    { x: 43, y: 11.4, z: 0 },                          // finish tower
  ],
  decor: [
    { kind: 'pipeArch', cx: 38 },
    { kind: 'portal', cx: 38, cz: 0 },
    { kind: 'arrow', cx: 5, cz: 0 },
    { kind: 'arrow', cx: 14.5, cz: -3 },               // signpost the SAFE lane (the visible 3-coin arc signposts RISKY)
    { kind: 'gantry', cx: 8 },
  ],
};
