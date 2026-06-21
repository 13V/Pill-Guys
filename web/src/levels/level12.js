// Level 12 — "Wavebreak Wharf" (a chaotic NAUTICAL course strung ABOVE A TROPICAL
// OCEAN, ~124u). Single-file flat descriptor (see level1.js / level7.js); the gold
// multi-route reference is level7 "Hammer Alley" (safe/risky lanes, conveyor
// shortcuts, spikes-gauntlets, dense decorative chaos). This one swaps the dungeon
// for a SUN-BLEACHED PIER over open water: tidal-current conveyors, swinging
// "shark" swipers, bobbing buoys (balls), a spring-chain across the surf, and a
// DOUBLE spike-gauntlet "reef". Fall off and the sea below is lethal.
//
// MULTI-ROUTE (mandatory two lanes the WHOLE way): from spawn to finish there are
// always TWO continuous lanes — a SAFE lane (far, z=-3, COOL blue/green "deep
// water") and a RISKY lane (near, z=+3, WARM red/yellow "sun deck"). Lanes SPLIT
// from a w6 hub (z-3..+3, so BOTH lanes land it) and REJOIN at the next w6 hub. The
// MIDDLE (z -2..+2) of every branch is intentionally EMPTY so you MUST commit to a
// side. FIVE branch splits, each SAFE vs a harder RISKY segment, hub->hub:
//   B1 (x21..35): conveyor-fed REEF gauntlet. SAFE = clear strip; RISKY = size-4
//     spike gauntlet (cx28, belt run-up x21..26 + 3u landing x32..35). 3x coins.
//   B2 (x41..55): "JUMP THE TIDE POOL". SAFE breaks for a comfy 3u gap (x46..49);
//     RISKY breaks for a 4u gap (x46..50) with a sawblade churning IN the pool on
//     the z=3 line (jump OVER it). Both real; RISKY harder, pays 3x.
//   B3 (x63..81): THE REEF (signature). SAFE = clear strip; RISKY = ONE size-4 spike
//     gauntlet (cx72 cells70..74; belt run-up 63..69, belt landing 75..81) flanked by
//     a DECORATIVE second "reef" (a churning spike-roller menace on the line at cx78
//     with NO death box) so the stretch still READS as a double-reef gauntlet while
//     staying single-jump auto-clearable on the belt-boosted near lane.
//   B4 (x87..101): "SURF THE CURRENT" — a long shared-feel split where SAFE strolls
//     a clear strip and RISKY rides a continuous forward conveyor STRAIGHT the whole
//     branch (the tidal-current speedway). 3x coins on the fast lane.
//   B5 (x107..121): "THE BUOY HOP" spring-chain. SAFE = clear strip with one comfy
//     3u gap; RISKY = belt run-up into a 4u gap over a saw, then a spring boost.
//
// RISKY SHORTCUT (the time-save): a constant-speed runner only goes faster by going
// FASTER, so every RISKY (near, z=+3) lane is BOOSTED by FORWARD CONVEYORS
// `conveyor {cz:3, w:4}` (span z1..5 — they NEVER touch the z=-3 SAFE lane). The
// belt pushes +X so the risky runner moves ~12 u/s vs SAFE's 8 — a real Fall-Guys
// shortcut: on every branch run-up/landing AND the near half of half the hubs. Belts
// sit BEFORE/AFTER each lethal gauntlet & on each jump's run-up, NEVER over the
// spike cells or saw-gaps (you still JUMP every gauntlet/gap).
//
// HAZARDS — TWO classes kept SEPARATE:
//  (1) DECORATIVE CHAOS — animated `menace` props with NO lethal flag (NO death
//      box, so they NEVER block a lane). Densely scattered: NEAR flank (z>=+5.5),
//      FAR flank (z<=-5.5), ABOVE the empty middle of every gap (high dy clears the
//      jump arc), on hub CORNERS, and DOWN in the sea (negative dy). This being a
//      WHARF, the headline decor is rows of SWINGING shark-fin `swiper`s / hammers
//      (swing axis x = across the corridor), spinning sawblades & rollers, and
//      bobbing buoy `ball`s — phases varied so a row sweeps OUT OF SYNC and the
//      whole pier reads alive. Autoplay walks past these (no death box) — INTENDED;
//      a human dodges, the danger reads visually.
//  (2) REAL LETHAL GATES — ONLY two kinds, both clearable by the autoplay:
//      (a) `spikes` gauntlets on a RISKY lane (size 4 + >=4u runway + >=3u landing)
//          — autoplay JUMPS them.
//      (b) jump-GAPS between consecutive lane decks (3-4u; autoplay JUMPS gaps
//          >=1.5u). A `sawblade {lethal:true}` may sit IN a gap pit on the lane z
//          (cleared while airborne). NEVER a lethal saw/block ON a walkable deck.
//
// Forward = +X. Limits: jump reach ~5u, gaps <=5u (RISKY <=4u), step-ups <=3u,
// widths >=2. Hubs w6 (z-3..+3). deckTop 5; finish top 10; spawn {x:3,y:6.2,z:0}.
export default {
  name: 'Wavebreak Wharf',
  theme: 'blue',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    // ---- SHARED SPINE start (x0..15): the harbor jetty. ----
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'blue' },      // A spawn hub  x:0..6
    { kind: 'conveyor', cx: 10.5, cz: 0, len: 9, w: 6, color: 'green' },             // M1 tidal current (+X), w6 spans both lanes  x:6..15 (meets hub B)

    // ---- BRANCH 1 (x21..35): conveyor-fed REEF gauntlet split. ----
    { kind: 'platform', cx: 18, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // B split hub  x:15..21
    { kind: 'conveyor', cx: 18, cz: 3, len: 6, w: 4, color: 'red' },                 // B hub NEAR boost (risky-only +X; SAFE z-3 untouched)  x:15..21
    { kind: 'strip', x0: 21, x1: 35, z: -3, w: 2, color: 'blue' },                   // B1 SAFE (far) clear walk  x:21..35 (meets hub C)
    { kind: 'strip', x0: 21, x1: 35, z:  3, w: 2, color: 'red' },                    // B1 RISKY (near): gauntlet cx28 (runway 21..26, land 30..35)  x:21..35 (meets hub C)
    { kind: 'conveyor', cx: 23.5, cz: 3, len: 5, w: 4, color: 'yellow' },            // B1 RISKY run-up belt (+X into the leap; ends before spikes)  x:21..26
    { kind: 'conveyor', cx: 33,   cz: 3, len: 4, w: 4, color: 'yellow' },            // B1 RISKY landing belt (+X after gauntlet -> hub C)  x:31..35

    { kind: 'platform', cx: 38, cz: 0, w: 6, d: 6, rails: true, color: 'green' },    // C rejoin hub (pipe arch)  x:35..41

    // ---- BRANCH 2 (x41..55): "JUMP THE TIDE POOL" — two genuinely different gaps. ----
    { kind: 'strip', x0: 41, x1: 46, z: -3, w: 2, color: 'green' },                  // B2 SAFE seg1 (far)  x:41..46
    { kind: 'strip', x0: 49, x1: 55, z: -3, w: 2, color: 'green' },                  // B2 SAFE seg2 (far) after a comfy 3u gap (46..49)  x:49..55
    { kind: 'strip', x0: 41, x1: 46, z:  3, w: 2, color: 'yellow' },                 // B2 RISKY seg1 (near): saw churns in the gap pool on z=3  x:41..46
    { kind: 'conveyor', cx: 43.5, cz: 3, len: 5, w: 4, color: 'red' },               // B2 RISKY run-up belt (+X across seg1, into the 4u saw-gap leap)  x:41..46
    { kind: 'strip', x0: 50, x1: 55, z:  3, w: 2, color: 'yellow' },                 // B2 RISKY seg2 (near) after the bigger 4u saw-gap (46..50)  x:50..55
    { kind: 'conveyor', cx: 52.5, cz: 3, len: 4, w: 4, color: 'red' },               // B2 RISKY landing belt (+X off the saw-gap landing -> hub D)  x:50.5..54.5

    { kind: 'platform', cx: 58, cz: 0, w: 6, d: 6, rails: true, color: 'red' },      // D rejoin hub (hot coral hub)  x:55..61
    { kind: 'conveyor', cx: 58, cz: 3, len: 6, w: 4, color: 'red' },                 // D hub NEAR boost (risky-only +X; SAFE z-3 untouched)  x:55..61

    // ---- BRANCH 3 (x63..81): THE REEF (one real spike-gauntlet + a decorative reef). ----
    { kind: 'strip', x0: 63, x1: 81, z: -3, w: 2, color: 'blue' },                   // B3 SAFE (far) clear walk  x:63..81 (meets hub E)
    { kind: 'strip', x0: 63, x1: 81, z:  3, w: 2, color: 'red' },                    // B3 RISKY (near): ONE gauntlet cx72 (runway 63..70, land 74..81)  x:63..81 (meets hub E)
    { kind: 'conveyor', cx: 66,   cz: 3, len: 6, w: 4, color: 'yellow' },            // B3 RISKY run-up belt (+X into the reef; ends at spikes start x70)  x:63..69
    { kind: 'conveyor', cx: 78,   cz: 3, len: 6, w: 4, color: 'yellow' },            // B3 RISKY landing belt (+X after the gauntlet -> hub E)  x:75..81

    { kind: 'platform', cx: 84, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // E rejoin / split hub  x:81..87
    { kind: 'conveyor', cx: 84, cz: 3, len: 6, w: 4, color: 'red' },                 // E hub NEAR boost (risky-only +X; SAFE z-3 untouched)  x:81..87

    // ---- BRANCH 4 (x87..101): "SURF THE CURRENT" — long conveyor STRAIGHT (signature). ----
    { kind: 'strip', x0: 87, x1: 101, z: -3, w: 2, color: 'green' },                 // B4 SAFE (far) clear stroll  x:87..101 (meets hub F)
    { kind: 'conveyor', cx: 94, cz: 3, len: 14, w: 4, color: 'red' },                // B4 RISKY (near): ONE long forward current the whole branch  x:87..101 (meets hub F)

    { kind: 'platform', cx: 104, cz: 0, w: 6, d: 6, rails: true, color: 'blue' },    // F rejoin / split hub  x:101..107
    { kind: 'conveyor', cx: 104, cz: 3, len: 6, w: 4, color: 'red' },                // F hub NEAR boost (risky-only +X; SAFE z-3 untouched)  x:101..107

    // ---- BRANCH 5 (x107..119): "THE BUOY HOP" spring-chain finale (signature). ----
    { kind: 'strip', x0: 107, x1: 112, z: -3, w: 2, color: 'green' },                // B5 SAFE seg1 (far)  x:107..112
    { kind: 'strip', x0: 115, x1: 121, z: -3, w: 2, color: 'blue' },                 // B5 SAFE seg2 (far) after a comfy 3u gap (112..115)  x:115..121 (meets hub G)
    { kind: 'strip', x0: 107, x1: 112, z:  3, w: 2, color: 'yellow' },               // B5 RISKY seg1 (near): saw in the gap pool on z=3  x:107..112
    { kind: 'conveyor', cx: 109.5, cz: 3, len: 5, w: 4, color: 'red' },              // B5 RISKY run-up belt (+X into the 4u saw-gap leap)  x:107..112
    { kind: 'strip', x0: 116, x1: 121, z:  3, w: 2, color: 'yellow' },               // B5 RISKY seg2 (near) after the 4u saw-gap (112..116)  x:116..121 (meets hub G)

    { kind: 'platform', cx: 124, cz: 0, w: 6, d: 6, rails: true, color: 'red' },     // G spring / pre-finish hub  x:121..127
    { kind: 'conveyor', cx: 122, cz: 3, len: 2, w: 4, color: 'red' },                // G entry NEAR boost (risky-only +X onto the hub; ends before springs)  x:121..123

    { kind: 'finish', cx: 130, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },        // finish lighthouse tower (w6 so every lane lands)  x:127..133
  ],
  hazards: [
    // =========================================================================
    // (2) REAL LETHAL GATES — the ONLY lethal hazards (spikes + saw-in-gap-pool).
    // =========================================================================
    { kind: 'spikes', cx: 28, cz: 3, size: 4 },                       // B1 reef (runway 21..26, land 30..35) — LETHAL on RISKY line
    { kind: 'sawblade', cx: 48, cz: 3, lethal: true },                // B2: saw IN the 4u RISKY pool (46..50, centred x48 so takeoff x45.4 clears it); jump OVER it
    { kind: 'spikes', cx: 72, cz: 3, size: 4 },                       // B3 REEF (cells 70..74; runway 63..70, land 74..81+hub) — the ONE LETHAL gauntlet on RISKY line
    { kind: 'sawblade', cx: 114, cz: 3, lethal: true },               // B5: saw IN the 4u RISKY pool (112..116, centred x114 so takeoff x111.4 clears it); jump OVER it

    // Warning cones (decorative) flagging each RISKY lane's on-line hazard.
    { kind: 'cone', cx: 25.5, cz: 3 }, { kind: 'cone', cx: 30.5, cz: 3 },   // B1 reef edges
    { kind: 'cone', cx: 45.5, cz: 3 }, { kind: 'cone', cx: 50.5, cz: 3 },   // B2 tide-pool edges
    { kind: 'cone', cx: 69.5, cz: 3 }, { kind: 'cone', cx: 74.5, cz: 3 },   // B3 reef gauntlet edges (cx72 cells70..74)
    { kind: 'cone', cx: 111.5, cz: 3 }, { kind: 'cone', cx: 116.5, cz: 3 }, // B5 tide-pool edges

    // =========================================================================
    // (1) DECORATIVE CHAOS — animated `menace`, NO lethal flag (no death box).
    // HEADLINE: rows of SWINGING shark-fin `swiper`s / hammers (swing axis x =
    // across the corridor), spinning sawblades / rollers, bobbing buoy `ball`s.
    // Phases varied so rows are OUT OF SYNC. Packed NEAR flank (z>=+5.5), FAR flank
    // (z<=-5.5), ABOVE empty middles (high dy), hub CORNERS, and DOWN in the sea
    // (negative dy). Builder auto-thins dense decor to a clean stream.
    // =========================================================================

    // --- A spawn jetty + M1 current (x0..15): a welcoming surf of swiper "fins". ---
    { kind: 'menace', model: 'swiper',        color: 'blue',   cx: 1.5, cz: 6.0, swing: { axis: 'x', amp: 0.8, speed: 1.8, phase: 0.0 } },    // shark-fin sweeping across (NEAR)
    { kind: 'menace', model: 'hammer',        color: 'blue',   cx: 4.5, cz: -5.8, swing: { axis: 'x', amp: 0.9, speed: 1.7, phase: 1.1 } },   // mast hammer swinging (FAR)
    { kind: 'menace', model: 'sawblade',      color: 'neutral',cx: 8,   cz: 6.2,  spin:  { axis: 'x', speed: 6 } },                           // spinner (NEAR)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 10, cz: -6.0, spin: { axis: 'x', speed: 4 } },                   // roller (FAR)
    { kind: 'menace', model: 'ball',          color: 'yellow', cx: 6.5, cz: -6.4, dy: 0.2, spin: { axis: 'y', speed: 3 } },                   // bobbing buoy (FAR)
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 3.0, cz: -3.0, dy: 4.4 },                                             // jetty-corner hanger bracket (static)
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 3.0, cz: -3.0, dy: 2.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 0.5 } }, // ball swinging under it
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 10, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4 } },           // roller churning in the M1 surf

    // --- Hub B split (x15..21): corner spinners + a fin hung over the entry hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'red',  cx: 16.0, cz: 6.2, ry: 90, spin: { axis: 'y', speed: 7 } },                   // NEAR corner double saw
    { kind: 'menace', model: 'swiper_long',   color: 'blue',   cx: 16.0, cz: -5.8, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 1.2 } }, // FAR corner long fin
    { kind: 'menace', model: 'spikeblock_up', color: 'yellow', cx: 20.0, cz: 6.4, swing: { axis: 'x', amp: 0.6, speed: 2.1, phase: 2.4 } },  // NEAR corner swinging hammer
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 19, cz: 0, dy: 5.0 },                                                 // bracket over the B1 entry void
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 19, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2.0, phase: 2.6 } }, // ball swinging across the void

    // --- BRANCH 1 (x21..35): a fin ROW out of sync over the reef + flanks. ---
    { kind: 'menace', model: 'swiper',        color: 'red',    cx: 24, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 0.0 } },     // NEAR fin row #1
    { kind: 'menace', model: 'swiper',        color: 'yellow', cx: 28, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 0.9 } },     // NEAR fin row #2 (over reef)
    { kind: 'menace', model: 'swiper',        color: 'red',    cx: 32, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 1.8 } },     // NEAR fin row #3 (out of sync)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 23, cz: -6.0, spin: { axis: 'x', speed: 4 } },                     // FAR vertical roller
    { kind: 'menace', model: 'sawblade',      color: 'neutral',cx: 31, cz: -6.0, spin: { axis: 'x', speed: 6 } },                             // FAR spinner
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 28, cz: 0, dy: 3.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 1.3 } }, // hung over the B1 reef void
    { kind: 'menace', model: 'bomb',          color: 'neutral',cx: 28, cz: 0, dy: -4.6 },                                                     // mine deep in the B1 sea (static)

    // --- Hub C rejoin (x35..41): corner saws + a swinging-fin crown. ---
    { kind: 'menace', model: 'saw_trap',      color: 'yellow', cx: 36, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7 } },                      // NEAR corner saw
    { kind: 'menace', model: 'swiper_double', color: 'red',    cx: 36, cz: -6.4, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 2.0 } },    // FAR corner double fin
    { kind: 'menace', model: 'spikeblock_up', color: 'green',  cx: 40, cz: 6.4, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 0.7 } },     // NEAR corner swinging hammer
    { kind: 'menace', model: 'ball',          color: 'blue',   cx: 38, cz: -3.0, dy: 1.0, spin: { axis: 'y', speed: 3 } },                    // buoy crown over the hub
    { kind: 'menace', model: 'bomb_A',        color: 'yellow', cx: 38, cz: 0, dy: -4.6 },                                                     // mine in the hub sea (static)

    // --- BRANCH 2 (x41..55): fins over the SAFE gap + over the RISKY saw-pool. ---
    { kind: 'menace', model: 'hammer',        color: 'yellow', cx: 47.5, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 0.6 } },  // FAR hammer over the SAFE 3u gap
    { kind: 'menace', model: 'swiper_long',   color: 'neutral',cx: 43, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 1.9 } },    // FAR long fin
    { kind: 'menace', model: 'swiper',        color: 'red',    cx: 43, cz: 6.4, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 0.2 } },     // NEAR fin (run-up)
    { kind: 'menace', model: 'swiper',        color: 'yellow', cx: 52, cz: 6.4, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 1.4 } },     // NEAR fin (landing)
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 48, cz: 0, dy: 3.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 1.3 } }, // hung over the B2 void middle
    { kind: 'menace', model: 'sawblade',      color: 'neutral',cx: 48, cz: 6.6, spin: { axis: 'x', speed: 6 } },                              // NEAR flank spinner past the saw-pool
    { kind: 'menace', model: 'bomb_A',        color: 'yellow', cx: 48, cz: -1.2, dy: -4.8 },                                                  // mine deep in the B2 sea (static)
    { kind: 'menace', model: 'bomb_B',        color: 'blue',   cx: 48, cz: 1.2, dy: -4.8 },                                                   // a second mine in the sea (static)

    // --- Hub D rejoin (x55..61): corner fins, a buoy, sea mine. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 56, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7 } },                      // NEAR corner double saw
    { kind: 'menace', model: 'swiper_double', color: 'red',    cx: 56, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 1.4 } },    // FAR corner double fin
    { kind: 'menace', model: 'spikeblock_up', color: 'green',  cx: 60, cz: 6.4, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 2.2 } },     // NEAR corner swinging hammer
    { kind: 'menace', model: 'ball',          color: 'yellow', cx: 58, cz: -3.0, dy: 1.0, spin: { axis: 'y', speed: 3 } },                    // buoy over the hub
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 58, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4 } },              // roller in the hub sea

    // --- BRANCH 3 THE REEF (x63..81): a dense fin GAUNTLET over the real reef + a
    //     DECORATIVE second reef (spike-roller menace ON the line, NO death box). ---
    { kind: 'menace', model: 'swiper',        color: 'red',    cx: 64, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 0.0 } },     // NEAR fin (reef run-up)
    { kind: 'menace', model: 'swiper',        color: 'yellow', cx: 72, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 0.8 } },     // NEAR fin (over the real reef)
    { kind: 'menace', model: 'swiper',        color: 'red',    cx: 76, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 1.5 } },     // NEAR fin (over the decor reef)
    { kind: 'menace', model: 'swiper',        color: 'yellow', cx: 80, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 2.3 } },     // NEAR fin (reef landing)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 78, cz: 3, spin: { axis: 'x', speed: 5 } },                      // DECOR REEF: churning spike-roller ON the risky line (NO lethal flag -> no death box, bot walks through)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 65, cz: -6.0, spin: { axis: 'x', speed: 4 } },                   // FAR horizontal roller
    { kind: 'menace', model: 'sawblade',      color: 'neutral',cx: 70, cz: -6.0, spin: { axis: 'x', speed: 6 } },                             // FAR spinner
    { kind: 'menace', model: 'sawblade',      color: 'neutral',cx: 75, cz: -6.0, spin: { axis: 'x', speed: 6 } },                             // FAR spinner #2
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 72, cz: 0, dy: 3.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 1.0 } }, // hung over the real reef void
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 78, cz: 0, dy: 3.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 2.4 } }, // hung over the decor reef
    { kind: 'menace', model: 'bomb',          color: 'neutral',cx: 71, cz: 0, dy: -4.6 },                                                     // mine deep in the double-reef sea (static)

    // --- Hub E rejoin / split (x81..87): corner fins + spinners. ---
    { kind: 'menace', model: 'saw_trap',      color: 'yellow', cx: 82, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7 } },                      // NEAR corner saw
    { kind: 'menace', model: 'swiper_long',   color: 'blue',   cx: 82, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 0.3 } },    // FAR corner long fin
    { kind: 'menace', model: 'spikeblock_up', color: 'blue',   cx: 86, cz: 6.4, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 1.0 } },     // NEAR corner swinging hammer
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 84, cz: -3.0, dy: 4.6 },                                              // hanger crown over the hub (static)
    { kind: 'menace', model: 'ball',          color: 'green',  cx: 84, cz: 0, dy: -3.6, spin: { axis: 'y', speed: 3 } },                      // buoy bobbing in the hub sea

    // --- BRANCH 4 "SURF THE CURRENT" (x87..101): fins lining the long belt. ---
    { kind: 'menace', model: 'swiper',        color: 'red',    cx: 90, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 0.0 } },     // NEAR fin over the current
    { kind: 'menace', model: 'swiper',        color: 'yellow', cx: 94, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 1.0 } },     // NEAR fin over the current
    { kind: 'menace', model: 'swiper',        color: 'red',    cx: 98, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 2.0 } },     // NEAR fin over the current
    { kind: 'menace', model: 'hammer',        color: 'blue',   cx: 92, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 0.5 } },    // FAR mast hammer (over SAFE stroll)
    { kind: 'menace', model: 'swiper_double', color: 'green',  cx: 97, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 1.7 } },    // FAR double fin
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 94, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4 } },            // roller churning under the current

    // --- Hub F rejoin / split (x101..107): corner saws + a buoy crown. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 102, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7 } },                     // NEAR corner double saw
    { kind: 'menace', model: 'swiper_long',   color: 'red',    cx: 102, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 0.9 } },   // FAR corner long fin
    { kind: 'menace', model: 'spikeblock_up', color: 'yellow', cx: 106, cz: 6.4, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 1.5 } },    // NEAR corner swinging hammer
    { kind: 'menace', model: 'ball',          color: 'red',    cx: 104, cz: -3.0, dy: 1.0, spin: { axis: 'y', speed: 3 } },                   // buoy crown over the hub

    // --- BRANCH 5 "BUOY HOP" (x107..119): fins over the SAFE gap + the RISKY pool. ---
    { kind: 'menace', model: 'hammer',        color: 'yellow', cx: 113.5, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 0.6 } }, // FAR hammer over the SAFE 3u gap
    { kind: 'menace', model: 'swiper',        color: 'red',    cx: 109, cz: 6.4, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 0.2 } },    // NEAR fin (run-up)
    { kind: 'menace', model: 'swiper',        color: 'yellow', cx: 118, cz: 6.4, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 1.4 } },    // NEAR fin (landing)
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 114, cz: 0, dy: 3.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 1.3 } }, // hung over the B5 saw-pool void
    { kind: 'menace', model: 'sawblade',      color: 'neutral',cx: 114, cz: 6.6, spin: { axis: 'x', speed: 6 } },                             // NEAR flank spinner past the pool
    { kind: 'menace', model: 'bomb_B',        color: 'blue',   cx: 114, cz: 0, dy: -4.8 },                                                    // mine deep in the B5 sea (static)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 110, cz: -6.0, spin: { axis: 'x', speed: 4 } },                    // FAR vertical roller

    // --- Hub G spring deck (x121..127) + finish lighthouse (x127..133): crescendo. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 122, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7 } },                     // NEAR flank double saw by the springs
    { kind: 'menace', model: 'hammer_spikes', color: 'green',  cx: 126, cz: 6.4, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 1.7 } },    // NEAR spiked hammer
    { kind: 'menace', model: 'swiper_long',   color: 'neutral',cx: 122, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 0.4 } },   // FAR long fin
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 130, cz: -6.0, top: 10, dy: 1.0 },                                     // FAR hanger at the lighthouse (static)
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 130, cz: -6.0, top: 10, dy: -0.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 0.8 } }, // hanging ball at the finish
    { kind: 'menace', model: 'hammer_large',  color: 'red',    cx: 130, cz: 6.4, top: 10, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 0.5 } }, // NEAR big hammer at the finish
    { kind: 'menace', model: 'ball',          color: 'yellow', cx: 127, cz: 6.6, top: 10, dy: 0.5, spin: { axis: 'y', speed: 5 } },           // NEAR trophy buoy at the finish
    { kind: 'menace', model: 'cannon_base',   color: 'red',    cx: 127, cz: -6.4, top: 10, ry: -90 },                                         // FAR confetti cannon at the finish (static)
  ],
  springs: [
    { cx: 124, cz: -3 },   // SAFE-lane spring (the "buoy hop" boost)
    { cx: 124, cz: 3 },    // RISKY-lane spring
    { cx: 124, cz: 0 },    // center (hub-walked) spring
  ],
  coins: [
    { x: 3,  y: 6.4, z: 0 },     // A spawn jetty

    // Branch 1 (conveyor-fed reef)  — safe 1 / risky 3
    { x: 28, y: 6.4, z: -3 },    // SAFE lane (clear)
    { x: 23, y: 6.4, z: 3 },     // RISKY entry
    { x: 28, y: 7.0, z: 3 },     // RISKY: arc over the reef            (reward)
    { x: 32, y: 6.4, z: 3 },     // RISKY landing                       (reward)

    { x: 38, y: 6.4, z: 0 },     // C rejoin hub

    // Branch 2 (jump the tide pool)  — safe 1 / risky 3
    { x: 43, y: 6.4, z: -3 },    // SAFE bridge (before the comfy 3u gap)
    { x: 43, y: 6.4, z: 3 },     // RISKY entry
    { x: 48, y: 7.0, z: 3 },     // RISKY: arc over the 4u saw-pool     (reward)
    { x: 52, y: 6.4, z: 3 },     // RISKY landing                       (reward)

    { x: 58, y: 6.4, z: 0 },     // D rejoin hub

    // Branch 3 (THE REEF)  — safe 1 / risky 4 (hardest branch pays most)
    { x: 72, y: 6.4, z: -3 },    // SAFE lane (clear)
    { x: 64, y: 6.4, z: 3 },     // RISKY entry
    { x: 72, y: 7.0, z: 3 },     // RISKY: arc over the reef gauntlet   (reward)
    { x: 78, y: 6.4, z: 3 },     // RISKY: across the decor reef        (reward)
    { x: 80, y: 6.4, z: 3 },     // RISKY landing                       (reward)

    { x: 84, y: 6.4, z: 0 },     // E rejoin / split hub

    // Branch 4 (surf the current)  — safe 1 / risky 3 (fast lane pays)
    { x: 94, y: 6.4, z: -3 },    // SAFE stroll
    { x: 89, y: 6.4, z: 3 },     // RISKY current entry                 (reward)
    { x: 94, y: 6.4, z: 3 },     // RISKY current mid                   (reward)
    { x: 99, y: 6.4, z: 3 },     // RISKY current exit                  (reward)

    { x: 104, y: 6.4, z: 0 },    // F rejoin / split hub

    // Branch 5 (the buoy hop)  — safe 1 / risky 3
    { x: 109, y: 6.4, z: -3 },   // SAFE bridge (before the comfy 3u gap)
    { x: 109, y: 6.4, z: 3 },    // RISKY entry
    { x: 114, y: 7.0, z: 3 },    // RISKY: arc over the 4u saw-pool     (reward)
    { x: 118, y: 6.4, z: 3 },    // RISKY landing                       (reward)

    { x: 124, y: 6.4, z: 0 },    // G spring deck — "you made it" coin before the climb
    { x: 130, y: 11.4, z: 0 },   // atop the victory lighthouse
  ],
  decor: [
    { kind: 'arrow', cx: 5, cz: 0 },          // go right, into the first split
    { kind: 'arrow', cx: 16.5, cz: -3 },      // signpost the SAFE lane at hub B
    { kind: 'pipeArch', cx: 38, color: 'green' }, // green arch framing rejoin hub C
    { kind: 'portal', cx: 38, cz: 0, color: 'blue' }, // blue portal at hub C
    { kind: 'gantry', cx: 48 },               // grey truss over the tide-pool stretch
    { kind: 'portal', cx: 58, cz: 0, color: 'green' }, // portal at hub D
    { kind: 'gantry', cx: 72 },               // truss landmark over THE REEF gauntlet
    { kind: 'arrow', cx: 82.5, cz: -3 },      // signpost SAFE at hub E
    { kind: 'gantry', cx: 94 },               // truss over the long current
    { kind: 'pipeArch', cx: 104, color: 'green' }, // arch framing hub F
    { kind: 'arrow', cx: 125.5, cz: 0 },      // point at the spring -> victory lighthouse
  ],
};
