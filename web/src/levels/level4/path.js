// Level 4 PATH — "Fracture Foundry" (med-high, ~80u). Built to R&D-verified limits
// (jump reach ~5u/comfy 4u, gaps onto strips <=5u, size-4 spike gauntlets, conveyor
// +4, spring->finish). Identity preserved: a spike gauntlet, w2 PRECISION BRIDGES,
// a belt-assisted gap, and a spring-to-finish.
//
// MULTI-ROUTE (Fall-Guys splits, see ../../../MULTI_ROUTE_DESIGN.md). Two branch
// sections each fork into a SAFE lane (z=-3, far) and a RISKY/REWARD lane (z=+3,
// near), splitting + rejoining at shared w6 hubs; the middle (z -2..+2) is left
// EMPTY so you must commit to a side. Both lanes of every split reach the finish.
//   - BRANCH 1 (x 26..36): the w2 PRECISION BRIDGE, split. SAFE = clear w2 walk
//     (1 coin); RISKY = a size-4 SPIKE GAUNTLET (2 coins). Rejoin = the saw hub.
//   - BRANCH 2 (x 63..75): belt-assisted split off hub F. SAFE = clear longer w2
//     walk (1 coin); RISKY = a LETHAL sawblade flank, then a 4u GAP (2 coins).
//
// IMPORTANT (builder): a `strip` only gets a 2u-wide (or 4u for w4) physics collider
// regardless of visual width, so SHARED spine that must be walkable across z-3..+3
// uses `platform` (full w x d collider) or the w6 `conveyor` (full-width collider).
// Branch LANES are w2 strips centered at z=±3 (collider covers their lane). Both
// lanes REJOIN at hub G, which carries one spring PER LANE (cz -3/0/+3) up the d6
// finish tower, so whichever side you committed to lands the win.
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
export default {
  name: 'Fracture Foundry',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 4,  cz: 0, w: 6, d: 6, rails: true },   // A start hub          x: 1..7
    { kind: 'platform', cx: 12, cz: 0, w: 6, d: 6, rails: true },   // B runway hub         x: 9..15  (gap 2; lead-in, commit to a side)

    { kind: 'platform', cx: 21, cz: 0, w: 6, d: 6, rails: true },   // C SPLIT HUB 1        x:18..24  (gap 3)

    // ---- BRANCH 1 (x 26..36): the w2 PRECISION BRIDGE, split. 2u hop onto a lane. ----
    { kind: 'strip', x0: 26, x1: 36, z: -3, w: 2 },                 // B1 SAFE  (far)       x:26..36  (clear w2 walk)
    { kind: 'strip', x0: 26, x1: 36, z:  3, w: 2 },                 // B1 RISKY (near)      x:26..36  (size-4 spike gauntlet cx31)

    { kind: 'platform', cx: 41, cz: 0, w: 6, d: 6, rails: true },   // D SAW HUB            x:38..44  (rejoin 1; decor saw menace)
    { kind: 'conveyor', cx: 49, cz: 0, len: 8, w: 6 },              // E conveyor (+X), w6  x:45..53  (gap 1; belt spans z-3..+3)

    { kind: 'platform', cx: 58, cz: 0, w: 6, d: 6, rails: true },   // F SPLIT HUB 2        x:55..61  (belt-assisted gap 2)

    // ---- BRANCH 2 (x 63..75): belt-assisted split. 2u hop onto a lane. ----
    { kind: 'strip', x0: 63, x1: 75, z: -3, w: 2 },                 // B2 SAFE  (far)       x:63..75  (clear longer w2 walk)
    { kind: 'strip', x0: 63, x1: 68, z:  3, w: 2 },                 // B2 RISKY p1 (near)   x:63..68  (lethal saw flank cx66)
    { kind: 'strip', x0: 72, x1: 75, z:  3, w: 2 },                 // B2 RISKY p2 (near)   x:72..75  (after a 4u GAP x68..72)

    { kind: 'platform', cx: 80, cz: 0, w: 6, d: 6, rails: true },   // G REJOIN HUB 2       x:77..83  (gap 2; both lanes land; per-lane springs)
    { kind: 'finish',   cx: 88, cz: 0, w: 6, d: 6, top: 10 },       // I finish             x:85..91  (spring -> finish; d6 spans lanes)
  ],
};
