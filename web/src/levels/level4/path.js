// Level 4 PATH — "Fracture Foundry" (2nd hardest, ~80u). Built to R&D-verified
// limits (jump reach ~5u/comfy 4u, gaps onto strips <=5u, size-4 spike gauntlets,
// conveyor +4, spring->finish). Identity preserved: precision w2 lanes, a
// belt-assisted lethal-saw pit, and a spring-to-finish.
//
// TIME-SAVE SHORTCUT (the headline of this pass). The pill runs at a CONSTANT speed,
// so a real Fall-Guys time-save can only come from SPEED. Each RISKY lane (z+3) is
// therefore a long FORWARD CONVEYOR you ride GROUNDED at ~12 u/s, while its SAFE
// sibling (z-3) is a clear w2 WALK at the base 8 u/s. Riding the belt clearly beats
// the walk to the finish (verified by traverse.mjs: RISKY <= ~0.85x SAFE steps). The
// belt is placed AFTER each lane's hazard (the L1 model) so it is a CLEAN grounded
// ride — a jumped-over belt gives no boost (you're airborne), so the hazard comes
// first, then the long belt. Hazards stay as the RISK; the belt + 3x coins are the
// reward.
//
// DIFFICULTY (L4 must stay harder than L3). L3 has ONE lethal placed hazard. L4
// keeps MORE on-line lethal load across its risky lanes + rejoin hubs:
//   - BRANCH 1 RISKY: a size-4 SPIKE GAUNTLET you JUMP (a 4u void over the spikes)
//     off a short run-up, landing on the long boost belt.
//   - BRANCH 2 RISKY: a 4u belt-assisted JUMP-GAP with a LETHAL saw IN the pit (the
//     same leap that clears the gap clears the saw; a blown jump drops onto it),
//     landing on a clean post-pit belt.
//   - A lethal CENTER spikeblock on EACH rejoin hub (D, G) blocks z~0, so you can't
//     bowl down the middle and must commit to a lane.
// Net lethal load: gauntlet + pit-saw + 2 spikeblocks = 4 (>= L3's 1), so L4 > L3.
//
// MULTI-ROUTE (Fall-Guys splits, see ../../../MULTI_ROUTE_DESIGN.md). Two branch
// sections each fork into a SAFE lane (z=-3, far) and a RISKY/REWARD lane (z=+3,
// near), splitting + rejoining at shared hubs; the middle (z -2..+2) is left EMPTY
// over the lanes so you must commit to a side. Both lanes of every split reach the
// finish, with 0 deaths on a clean run.
//
// IMPORTANT (builder): a `strip` only gets a 2u-wide (or 4u for w4) physics collider
// regardless of visual width, so SHARED spine that must be walkable across z-3..+3
// uses `platform` (full w x d collider) or the w6 `conveyor` (full-width collider).
// Branch LANES are w2 strips / w4 conveyors centered at z=3 (the w4 belt collider
// spans z1..5, covering the z=3 lane; the safe w2 strip covers z=-3). Hubs are w4 d6
// (compact in X but full z-3..+3 depth) so either lane threads them; the spine belt E
// and the start/rejoin/finish hubs are w6 d6. Both lanes REJOIN at hub G, which
// carries one spring PER LANE (cz -3/0/+3) up the d6 finish tower.
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
export default {
  name: 'Fracture Foundry',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 4,  cz: 0, w: 6, d: 6, rails: true },   // A start hub          x: 1..7
    { kind: 'platform', cx: 11, cz: 0, w: 4, d: 6, rails: true },   // C SPLIT HUB 1        x: 9..13  (gap 2; lead-in, commit to a side)

    // ---- BRANCH 1 (x 13..51): the precision split. SAFE walk vs RISKY boost belt. ----
    // This is the headline shortcut: the RISKY belt is LONG and CLEAN, so the boost
    // (~12u/s) dominates the lane and clearly beats the safe lane's 8u/s walk.
    { kind: 'strip', x0: 13, x1: 51, z: -3, w: 2 },                 // B1 SAFE  (far)       x:13..51  (clear continuous w2 walk @8u/s; flush off C)
    // RISKY (near, z+3): a short solid run-up, the size-4 gauntlet (JUMP the 4u void over
    // the spikes), then a LONG CLEAN FORWARD-CONVEYOR you ride GROUNDED at ~12u/s into
    // hub D — the time-save vs the safe lane's 8u/s walk (the L1 hazard-then-belt model).
    { kind: 'strip', x0: 13, x1: 16, z: 3, w: 2 },                  // B1 RISKY run-up      x:13..16  (solid takeoff before the gauntlet)
    { kind: 'conveyor', cx: 35.5, cz: 3, len: 31, w: 4 },           // B1 RISKY belt (+X)   x:20..51  (~12u/s; land here after the 4u gauntlet jump, ride GROUNDED ~28u into hub D)

    { kind: 'platform', cx: 53, cz: 0, w: 4, d: 6, rails: true },   // D SAW HUB / REJOIN 1 x:51..55  (lanes land flush; decor saw + center spikeblock)
    { kind: 'conveyor', cx: 57, cz: 0, len: 4, w: 6 },              // E conveyor (+X), w6  x:55..59  (flush off D; belt spans z-3..+3)

    { kind: 'platform', cx: 61, cz: 0, w: 4, d: 6, rails: true },   // F SPLIT HUB 2        x:59..63  (flush off belt)

    // ---- BRANCH 2 (x 63..71): belt-assisted split, lethal saw IN the pit. ----
    { kind: 'strip', x0: 63, x1: 71, z: -3, w: 2 },                 // B2 SAFE  (far)       x:63..71  (clear continuous w2 walk @8u/s; flush off F)
    // RISKY (near, z+3): a FORWARD-CONVEYOR run-up (ride it GROUNDED at ~12u/s) into a 4u
    // lethal-saw pit-JUMP that lands on hub G. The belt is the time-save; the pit + the
    // in-pit saw are the risk (a blown jump drops onto the saw).
    { kind: 'conveyor', cx: 65, cz: 3, len: 4, w: 4 },              // B2 RISKY run-up belt x:63..67 (~12u/s; flush off F, boosts into the pit jump)

    { kind: 'platform', cx: 74, cz: 0, w: 6, d: 6, rails: true },   // G REJOIN HUB 2       x:71..77  (both lanes land; 4u risky pit x67..71; center spikeblock; per-lane springs)
    { kind: 'finish',   cx: 80, cz: 0, w: 6, d: 6, top: 10 },       // I finish             x:77..83  (spring -> finish; d6 spans lanes)
  ],
};
