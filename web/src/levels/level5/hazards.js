// Level 5 HAZARDS + springs — "The Last Reactor" (FINALE, multi-route).
//
// Per-lane risk (see ../../../MULTI_ROUTE_DESIGN.md). Every LETHAL hazard either sits
// ON a RISKY (near, z=+3) lane WITH a safe place to land (the size-4 spike gauntlets,
// which have >=4u runway + >=3u landing) or squeezes only the CENTER of a hub (the
// spikeblock thread) — never the only path, and never the full width. The SAFE
// (far, z=-3) lanes and the shared hubs are always passable.
//
// AUDIT FIX — saws are now ON the walked line, not off it. The old off-line lethal
// saws at cz+4.6 (death box z 4.1..5.1) sat clear of the z=3 line and never
// threatened a careful player. They are GONE. In their place each RISKY lane now
// breaks for a real on-the-line JUMP-GAP with a sawblade spinning DECORATIVELY in
// the pit (no lethal flag => no death sensor; the gap itself is the lethal threat
// via the fall-off-world plane). So you literally jump OVER the spinning saw on the
// z=3 line — the saw is the menace you read, the gap is what punishes a miss.
//
//  B1 RISKY gauntlet (cx29): size-4 spikes, conveyor-fed (M1 belt pushes you in).
//    On the z=+3 strip with 4u runway (x23..27) and a 3u landing (x31..34).
//  C saw hub: two DECORATIVE sawblades (no lethal flag => no death sensor) keep the
//    signature reactor "saw hub" look without blocking either lane through the rejoin.
//  B2 RISKY (cx49): a sawblade spins IN the 4u gap pit (x47..51) ON the z=3 line —
//    you jump over it. SAFE's sibling is a milder, flat 3u gap (no saw).
//  D spikeblock thread (cx56): two spikeblocks at cz ±1.0 squeeze the CENTER of the
//    rejoin hub (death boxes z [-1.6,-0.6] & [0.6,1.6]; thread the z -0.6..+0.6 gap).
//    A SAFE/RISKY arrival at z≈±3 (or the drift line z≈±2.6) passes clear outside.
//  B3 RISKY (cx81 + cx88): the HARDEST line — a size-4 conveyor-fed gauntlet, AND
//    THEN a 4u jump-gap (x86..90) with a sawblade spinning in the pit on the z=3
//    line. Clear the spikes, stick the landing, then jump the saw-gap onto hub F.
export const hazards = [
  // --- Branch 1 — conveyor-fed gauntlet on the RISKY (near) lane only (LETHAL, on-line). ---
  { kind: 'spikes', cx: 29, cz: 3, size: 4 },                       // B1 gauntlet (runway x23..27, land x31..34)

  // --- Saw hub C — decorative menace only (no lethal flag => no death sensor). ---
  { kind: 'sawblade', cx: 37, cz: 1.8 },                            // decor saw (right)
  { kind: 'sawblade', cx: 37, cz: -1.8 },                           // decor saw (left)

  // --- Branch 2 — sawblade spinning IN the RISKY gap pit, ON the z=3 line (decor: jump it). ---
  { kind: 'sawblade', cx: 49, cz: 3 },                              // in the 4u gap (x47..51); no death box — the gap is the threat

  // --- Hub D — spikeblock thread: squeeze the CENTER of the rejoin hub only.
  // Death box is cz ±0.6, so at cz ±1.0 the boxes are z [-1.6,-0.6] & [0.6,1.6]:
  // a tight center thread (gap z -0.6..+0.6) while a SAFE/RISKY arrival at z≈±3
  // (or the strafe-drift line z≈±2.6) passes well clear on the outside.
  { kind: 'spikeblock', cx: 56, cz: 1.0, dir: 'up', color: 'red' },
  { kind: 'spikeblock', cx: 56, cz: -1.0, dir: 'up', color: 'red' },

  // --- Branch 3 — RISKY gauntlet (LETHAL, on-line) THEN a saw-gap (decor in the pit). ---
  { kind: 'spikes', cx: 81, cz: 3, size: 4 },                       // B3 gauntlet (runway x75..79, land x83..86)
  { kind: 'sawblade', cx: 88, cz: 3 },                              // in the trailing 4u gap (x86..90); no death box — the gap is the threat

  // --- Warning cones (decorative): flag each RISKY lane's on-the-line hazards. ---
  { kind: 'cone', cx: 26.5, cz: 3 }, { kind: 'cone', cx: 31.5, cz: 3 },  // B1 gauntlet edges
  { kind: 'cone', cx: 46.5, cz: 3 }, { kind: 'cone', cx: 51.5, cz: 3 },  // B2 risky gap edges (the saw-pit jump)
  { kind: 'cone', cx: 78.5, cz: 3 },                                     // B3 gauntlet entry
  { kind: 'cone', cx: 85.5, cz: 3 }, { kind: 'cone', cx: 90.0, cz: 3 },  // B3 trailing saw-gap edges
];

// One spring PER LANE on rejoin/spring deck F -> the victory tower (top 5 -> top 10;
// spring rise ≈4.9u, forward arc ≈4u onto the tower whose near edge is x97). Whichever
// lane you arrive in (z -3 / +3) or the center, a spring lifts you up the finale tower.
export const springs = [
  { cx: 93, cz: -3 },   // SAFE-lane spring
  { cx: 93, cz: 3 },    // RISKY-lane spring
  { cx: 93, cz: 0 },    // center (hub-walked) spring
];
