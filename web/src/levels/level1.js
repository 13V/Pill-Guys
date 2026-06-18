// Level 1 — "Assembly Line" (the gentle intro; SHORTEST/easiest of the 5). Keeps
// the signature conveyor + red pipe arch + spring-to-finish, and is the game's
// FIRST Fall-Guys-style SPLIT: from the split hub the path forks into a SAFE lane
// (z-3, a clear walkway at the base 8 u/s, ONE coin) and a RISKY lane (z+3, a
// size-4 spike GAUNTLET you jump over and THEN a FORWARD CONVEYOR that pushes +X
// — you ride it to the rejoin hub at ~12 u/s, rewarded with THREE coins). The
// belt is the SHORTCUT: in this constant-run game a time-save can only come from
// SPEED, so the boosted RISKY lane reaches the finish CLEARLY FASTER than the
// SAFE walk. Both REJOIN at the pipe-arch hub and share the spring-to-finish.
// The branch middle (z -2..+2) is intentionally empty, so you MUST commit.
// Length kept ~36u (the shortest level). This is the flat-descriptor reference.
export default {
  name: 'Assembly Line',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },   // spawn hub          x: 0..6
    { kind: 'conveyor', cx: 8, cz: 0, len: 8, w: 6 },              // spine conveyor (+X), spans both lanes  x: 4..12
    { kind: 'platform', cx: 13, cz: 0, w: 6, d: 6, rails: true },  // SPLIT hub (z-3..3)  x: 10..16

    // ---- BRANCH (x15..29): the time-save split (SAFE walk vs RISKY belt). ----
    { kind: 'strip', x0: 15, x1: 29, z: -3, w: 2 },                // SAFE lane (far): clear walk, no boost
    { kind: 'conveyor', cx: 21, cz: 3, len: 18, w: 4 },            // RISKY lane (near): FORWARD belt (+X) x:12..30, ride at ~12 u/s

    { kind: 'platform', cx: 31, cz: 0, w: 6, d: 6, rails: true },  // REJOIN hub (pipe arch + springs)  x: 28..34
    { kind: 'finish', cx: 36, cz: 0, w: 6, d: 6, top: 10 },        // finish tower (w6 so every lane lands)  x: 33..39
  ],
  hazards: [
    { kind: 'spikes', cx: 18, cz: 3, size: 4 },   // the one on-line challenge: risky-lane jump-over gauntlet (x16..20), then ride the belt
    { kind: 'sawblade', cx: 31, cz: 4.5 },        // decorative menace beside the rejoin hub (off the walked line; no death sensor)
    { kind: 'cone', cx: 16.5, cz: 3 },
    { kind: 'cone', cx: 19.5, cz: 3 },
  ],
  springs: [
    { cx: 32, cz: -3 },
    { cx: 32, cz: 3 },
    { cx: 32, cz: 0 },
  ],
  coins: [
    { x: 3, y: 6.2, z: 0 }, { x: 8, y: 6.2, z: 0 },   // spine (2)
    { x: 22, y: 6.2, z: -3 },                          // SAFE-lane reward: ONE coin
    { x: 16, y: 6.8, z: 3 }, { x: 23, y: 6.2, z: 3 }, { x: 28, y: 6.2, z: 3 }, // RISKY: THREE coins (3x)
    { x: 31, y: 6.2, z: 0 },                           // rejoin hub
    { x: 36, y: 11.4, z: 0 },                          // finish tower
  ],
  decor: [
    { kind: 'pipeArch', cx: 31 },
    { kind: 'portal', cx: 31, cz: 0 },
    { kind: 'arrow', cx: 5, cz: 0 },
    { kind: 'arrow', cx: 14.5, cz: -3 },               // signpost the SAFE lane
    { kind: 'gantry', cx: 8 },
  ],
};
