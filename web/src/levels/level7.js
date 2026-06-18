// Level 7 — "Hammer Alley" (a chaotic multi-route corridor of SWINGING HAMMERS &
// SPINNING hazards, ~102u). Single-file flat descriptor (see level1.js); the gold
// multi-route reference is level5/* (safe/risky lanes, conveyor shortcuts,
// saws-in-pits). This one is MORE chaotic — denser hammers, more splits.
//
// MULTI-ROUTE (mandatory two lanes the WHOLE way): from spawn to finish there are
// always TWO continuous lanes — a SAFE lane (far, z=-3, COOL blue/green) and a
// RISKY lane (near, z=+3, WARM red/yellow). They SPLIT from a w6 hub (z-3..+3, so
// both lanes land) and REJOIN at the next w6 hub. The MIDDLE (z -2..+2) of every
// branch is intentionally EMPTY so you MUST commit to a side. FOUR branch splits
// (more than L5's three), each SAFE vs a harder RISKY segment, hub->hub:
//   B1 (x23..34): conveyor-fed gauntlet. SAFE = clear strip; RISKY = size-4 spike
//     gauntlet (cx29, belt run-up x23..27 + 3u landing x31..34). 3x coins.
//   B2 (x44..57): "JUMP THE HAMMER PIT". SAFE breaks for a comfy 3u gap (x49..52);
//     RISKY breaks for a 4u gap (x49..53) with a sawblade spinning IN the pit on
//     the z=3 line (jump OVER it). Both real; RISKY harder, pays 3x.
//   B3 (x67..78): second conveyor-fed gauntlet (cx73). SAFE clear; RISKY belt-fed
//     size-4 gauntlet (run-up x67..71 + land x75..78). 3x coins.
//   B4 (x83..96): "DOUBLE HAMMER GAPS". SAFE = one comfy 3u gap (x88..91); RISKY =
//     TWO 4u saw-gaps (x87..91 over a saw, x93..97... trimmed to land on hub F).
//
// RISKY SHORTCUT (the time-save): a constant-speed runner only goes faster by
// going FASTER, so every RISKY (near, z=+3) lane is BOOSTED by FORWARD CONVEYORS
// `conveyor {cz:3, w:4}` (span z1..5 — they NEVER touch the z=-3 SAFE lane). The
// belt pushes +X so the risky runner moves ~12 u/s vs SAFE's 8 — a real Fall-Guys
// shortcut: on every branch run-up/landing AND the near half of half the hubs.
// Belts sit BEFORE/AFTER each lethal gauntlet & on each jump's run-up, NEVER over
// the spike cells or saw-gaps (you still jump every gauntlet/gap).
//
// HAZARDS — TWO classes kept SEPARATE:
//  (1) DECORATIVE CHAOS — animated `menace` props with NO lethal flag (NO death
//      box, so they NEVER block a lane). Densely scattered: NEAR flank (z>=+5.5),
//      FAR flank (z<=-5.5), ABOVE the empty middle of every gap (high dy clears the
//      jump arc), on hub CORNERS, and DOWN in the PITS (negative dy). This being
//      "Hammer Alley", the headline decor is rows of SWINGING hammers/spikeballs
//      (swing axis x = across the corridor) + spinners — phases varied so a row
//      swings OUT OF SYNC and the whole alley reads alive. Autoplay walks past
//      these (no death box) — INTENDED; a human dodges, danger reads visually.
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
  name: 'Hammer Alley',
  theme: 'blue',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    // ---- SHARED SPINE start (x0..15) ----
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'green' },    // A spawn hub  x:0..6
    { kind: 'conveyor', cx: 10.5, cz: 0, len: 9, w: 6, color: 'blue' },             // M1 belt (+X), w6 spans both lanes  x:6..15 (meets hub B)

    // ---- BRANCH 1 (x23..34): conveyor-fed gauntlet split. ----
    { kind: 'platform', cx: 18, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // B split hub  x:15..21
    { kind: 'conveyor', cx: 18, cz: 3, len: 6, w: 4, color: 'red' },                // B hub NEAR boost (risky-only +X; SAFE z-3 untouched)  x:15..21
    { kind: 'strip', x0: 23, x1: 35, z: -3, w: 2, color: 'blue' },                  // B1 SAFE (far) clear walk  x:23..35 (meets hub C)
    { kind: 'strip', x0: 23, x1: 35, z:  3, w: 2, color: 'red' },                   // B1 RISKY (near): gauntlet cx29 (runway 23..27, land 31..35)  x:23..35 (meets hub C)
    { kind: 'conveyor', cx: 25,   cz: 3, len: 4, w: 4, color: 'yellow' },           // B1 RISKY run-up belt (+X into the leap; ends before spikes)  x:23..27
    { kind: 'conveyor', cx: 32.5, cz: 3, len: 3, w: 4, color: 'yellow' },           // B1 RISKY landing belt (+X after gauntlet -> hub C)  x:31..34

    { kind: 'platform', cx: 38, cz: 0, w: 6, d: 6, rails: true, color: 'green' },    // C rejoin hub (pipe arch)  x:35..41

    // ---- BRANCH 2 (x44..57): "JUMP THE HAMMER PIT" — two genuinely different gaps. ----
    { kind: 'strip', x0: 44, x1: 49, z: -3, w: 2, color: 'green' },                 // B2 SAFE seg1 (far)  x:44..49
    { kind: 'strip', x0: 52, x1: 57, z: -3, w: 2, color: 'green' },                 // B2 SAFE seg2 (far) after a comfy 3u gap (49..52)  x:52..57
    { kind: 'strip', x0: 44, x1: 49, z:  3, w: 2, color: 'yellow' },                // B2 RISKY seg1 (near): saw spins in the gap pit on z=3  x:44..49
    { kind: 'conveyor', cx: 46.5, cz: 3, len: 5, w: 4, color: 'red' },              // B2 RISKY run-up belt (+X across seg1, into the 4u saw-gap leap)  x:44..49
    { kind: 'strip', x0: 53, x1: 57, z:  3, w: 2, color: 'yellow' },                // B2 RISKY seg2 (near) after the bigger 4u saw-gap (49..53)  x:53..57
    { kind: 'conveyor', cx: 55,   cz: 3, len: 4, w: 4, color: 'red' },              // B2 RISKY landing belt (+X off the saw-gap landing -> hub D)  x:53..57

    { kind: 'platform', cx: 60, cz: 0, w: 6, d: 6, rails: true, color: 'red' },      // D rejoin hub (hot red hammer hub)  x:57..63
    { kind: 'conveyor', cx: 60, cz: 3, len: 6, w: 4, color: 'red' },                // D hub NEAR boost (risky-only +X; SAFE z-3 untouched)  x:57..63

    // ---- SHARED breather belt M3 (x64..72) ----
    { kind: 'conveyor', cx: 67.5, cz: 0, len: 9, w: 6, color: 'blue' },             // M3 belt (+X), w6 spans both lanes  x:63..72 (meets hub D)

    // ---- BRANCH 3 (x67? -> placed after hub E) : conveyor-fed gauntlet. ----
    { kind: 'platform', cx: 75, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // E split hub  x:72..78
    { kind: 'conveyor', cx: 75, cz: 3, len: 6, w: 4, color: 'red' },                // E hub NEAR boost (risky-only +X; SAFE z-3 untouched)  x:72..78
    { kind: 'strip', x0: 80, x1: 92, z: -3, w: 2, color: 'blue' },                  // B3 SAFE (far) clear walk  x:80..92 (meets hub F)
    { kind: 'strip', x0: 80, x1: 92, z:  3, w: 2, color: 'red' },                   // B3 RISKY (near): gauntlet cx86 (runway 80..84, land 88..92)  x:80..92 (meets hub F)
    { kind: 'conveyor', cx: 82,   cz: 3, len: 4, w: 4, color: 'yellow' },           // B3 RISKY run-up belt (+X into the leap; ends before spikes)  x:80..84
    { kind: 'conveyor', cx: 89.5, cz: 3, len: 3, w: 4, color: 'yellow' },           // B3 RISKY landing belt (+X after gauntlet -> hub F)  x:88..91

    { kind: 'platform', cx: 95, cz: 0, w: 6, d: 6, rails: true, color: 'green' },    // F rejoin / spring hub  x:92..98
    { kind: 'conveyor', cx: 93, cz: 3, len: 2, w: 4, color: 'red' },                // F entry NEAR boost (risky-only +X onto the spring; ends before sensor)  x:92..94

    { kind: 'finish', cx: 101, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },        // finish tower (w6 so every lane lands)  x:98..104
  ],
  hazards: [
    // =========================================================================
    // (2) REAL LETHAL GATES — the ONLY lethal hazards (spikes + saw-in-gap-pit).
    // =========================================================================
    { kind: 'spikes', cx: 29, cz: 3, size: 4 },                       // B1 gauntlet (runway 23..27, land 31..34) — LETHAL on RISKY line
    { kind: 'sawblade', cx: 51, cz: 3, lethal: true },                // B2: saw IN the 4u RISKY gap pit (49..53, centred at gap mid x51 so takeoff x48.4 clears it); jump OVER it
    { kind: 'spikes', cx: 86, cz: 3, size: 4 },                       // B3 gauntlet (runway 80..84, land 88..91) — LETHAL on RISKY line

    // Warning cones (decorative) flagging each RISKY lane's on-line hazard.
    { kind: 'cone', cx: 26.5, cz: 3 }, { kind: 'cone', cx: 31.5, cz: 3 },  // B1 gauntlet edges
    { kind: 'cone', cx: 48.5, cz: 3 }, { kind: 'cone', cx: 53.5, cz: 3 },  // B2 saw-gap edges
    { kind: 'cone', cx: 83.5, cz: 3 }, { kind: 'cone', cx: 88.5, cz: 3 },  // B3 gauntlet edges

    // =========================================================================
    // (1) DECORATIVE CHAOS — animated `menace`, NO lethal flag (no death box).
    // HEADLINE: rows of SWINGING hammers (swing axis x = across the corridor),
    // spinning spikeballs/sawblades/rollers. Phases varied so rows are OUT OF
    // SYNC. Packed NEAR flank (z>=+5.5), FAR flank (z<=-5.5), ABOVE empty middles
    // (high dy), hub CORNERS, and in the PITS (negative dy).
    // =========================================================================

    // --- A spawn hub + M1 belt (x0..15): a welcoming row of swinging hammers. ---
    { kind: 'menace', model: 'spikeblock_up', color: 'red',    cx: 1.5, cz: 6.0, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 0.0 } },   // "hammer" swinging across (NEAR)
    { kind: 'menace', model: 'hammer',        color: 'blue',   cx: 4.5, cz: -5.8, swing: { axis: 'x', amp: 0.9, speed: 1.7, phase: 1.1 } },  // hammer swinging (FAR)
    { kind: 'menace', model: 'sawblade',      color: 'neutral',cx: 8,   cz: 6.2,  spin:  { axis: 'x', speed: 6 } },                          // spinner (NEAR)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 10, cz: -6.0, spin: { axis: 'x', speed: 4 } },                  // roller (FAR)
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 3.0, cz: -3.0, dy: 4.4 },                                            // hub-corner hanger bracket (static)
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 3.0, cz: -3.0, dy: 2.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 0.5 } }, // ball swinging under it
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 10, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4 } },          // roller churning in the M1 pit

    // --- Hub B split (x15..21): corner spinners + a hammer hung over the entry hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'red',  cx: 16.0, cz: 6.2, ry: 90, spin: { axis: 'y', speed: 7 } },                  // NEAR corner double saw
    { kind: 'menace', model: 'hammer_large',  color: 'blue',   cx: 16.0, cz: -5.8, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 1.2 } },// FAR corner big hammer
    { kind: 'menace', model: 'spikeblock_up', color: 'yellow', cx: 20.0, cz: 6.4, swing: { axis: 'x', amp: 0.6, speed: 2.1, phase: 2.4 } }, // NEAR corner swinging hammer
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 19, cz: 0, dy: 5.0 },                                                // bracket over the B1 entry void
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 19, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2.0, phase: 2.6 } }, // ball swinging across the void

    // --- BRANCH 1 (x23..34): a hammer ROW out of sync over the gauntlet + flanks. ---
    { kind: 'menace', model: 'spikeblock_up', color: 'red',    cx: 25, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 0.0 } },   // NEAR hammer row #1
    { kind: 'menace', model: 'spikeblock_up', color: 'yellow', cx: 29, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 0.9 } },   // NEAR hammer row #2 (over gauntlet)
    { kind: 'menace', model: 'spikeblock_up', color: 'red',    cx: 33, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 1.8 } },   // NEAR hammer row #3 (out of sync)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 24, cz: -6.0, spin: { axis: 'x', speed: 4 } },                   // FAR vertical roller
    { kind: 'menace', model: 'sawblade',      color: 'neutral',cx: 31, cz: -6.0, spin: { axis: 'x', speed: 6 } },                           // FAR spinner
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 29, cz: 0, dy: 3.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 1.3 } }, // hung over the B1 gauntlet void
    { kind: 'menace', model: 'bomb',          color: 'neutral',cx: 29, cz: 0, dy: -4.6 },                                                   // bomb deep in the B1 pit (static)

    // --- Hub C rejoin (x35..41): corner saws + a swinging-hammer crown. ---
    { kind: 'menace', model: 'saw_trap',      color: 'yellow', cx: 36, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7 } },                    // NEAR corner saw
    { kind: 'menace', model: 'hammer_large_spikes', color: 'red', cx: 36, cz: -6.4, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 2.0 } }, // FAR corner big spiked hammer
    { kind: 'menace', model: 'spikeblock_up', color: 'green',  cx: 40, cz: 6.4, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 0.7 } },   // NEAR corner swinging hammer
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 38, cz: -3.0, dy: 4.6 },                                            // hanger crown over the hub (static)
    { kind: 'menace', model: 'bomb_A',        color: 'yellow', cx: 38, cz: 0, dy: -4.6 },                                                   // bomb in the hub pit (static)

    // --- BRANCH 2 (x44..57): hammers over the SAFE gap + over the RISKY saw-gap. ---
    { kind: 'menace', model: 'hammer',        color: 'yellow', cx: 50.5, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 0.6 } },// FAR hammer over the SAFE 3u gap
    { kind: 'menace', model: 'hammerblock',   color: 'neutral',cx: 46, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 1.9 } },  // FAR hammer block
    { kind: 'menace', model: 'spikeblock_up', color: 'red',    cx: 46, cz: 6.4, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 0.2 } },   // NEAR hammer (run-up)
    { kind: 'menace', model: 'spikeblock_up', color: 'yellow', cx: 55, cz: 6.4, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 1.4 } },   // NEAR hammer (landing)
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 50.5, cz: 0, dy: 3.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 1.3 } }, // hung over the B2 void middle
    { kind: 'menace', model: 'sawblade',      color: 'neutral',cx: 51, cz: 6.6, spin: { axis: 'x', speed: 6 } },                            // NEAR flank spinner past the saw-gap
    { kind: 'menace', model: 'bomb_A',        color: 'yellow', cx: 50.5, cz: -1.2, dy: -4.8 },                                              // bomb deep in the B2 pit (static)
    { kind: 'menace', model: 'bomb_B',        color: 'blue',   cx: 50.5, cz: 1.2, dy: -4.8 },                                               // a second bomb in the pit (static)

    // --- Hub D rejoin (x57..63) + M3 belt (x64..72): corner hammers, rollers, pit. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 58, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7 } },                    // NEAR corner double saw
    { kind: 'menace', model: 'hammer_large',  color: 'red',    cx: 58, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 1.4 } },  // FAR corner big hammer
    { kind: 'menace', model: 'spikeblock_up', color: 'green',  cx: 62, cz: 6.4, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 2.2 } },   // NEAR corner swinging hammer
    { kind: 'menace', model: 'hammer',        color: 'red',    cx: 68, cz: 6.2, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 0.0 } },   // NEAR hammer over the M3 belt
    { kind: 'menace', model: 'saw_trap_long', color: 'green',  cx: 68, cz: -6.6, ry: 90, spin: { axis: 'y', speed: 7 } },                   // FAR long saw over the M3 belt
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 68, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4 } },            // vertical roller in the M3 pit

    // --- Hub E split (x72..78): a swinging-hammer GATE + corner spinners. ---
    { kind: 'menace', model: 'saw_trap',      color: 'yellow', cx: 73, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7 } },                    // NEAR corner saw
    { kind: 'menace', model: 'hammer_large',  color: 'blue',   cx: 73, cz: -6.0, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 0.3 } },  // FAR corner big hammer
    { kind: 'menace', model: 'spikeblock_up', color: 'blue',   cx: 77, cz: 6.4, swing: { axis: 'x', amp: 0.6, speed: 2.0, phase: 1.0 } },   // NEAR corner swinging hammer
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 75, cz: 0, dy: 5.0 },                                                // bracket over the B3 entry void
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 75, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2.2, phase: 1.6 } }, // ball swinging across the void

    // --- BRANCH 3 (x80..91): a hammer ROW out of sync over the gauntlet + flanks. ---
    { kind: 'menace', model: 'spikeblock_up', color: 'red',    cx: 82, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 0.0 } },   // NEAR hammer row #1
    { kind: 'menace', model: 'spikeblock_up', color: 'yellow', cx: 86, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 1.0 } },   // NEAR hammer row #2 (over gauntlet)
    { kind: 'menace', model: 'spikeblock_up', color: 'red',    cx: 90, cz: 6.5, swing: { axis: 'x', amp: 0.7, speed: 1.9, phase: 2.0 } },   // NEAR hammer row #3 (out of sync)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 81, cz: -6.0, spin: { axis: 'x', speed: 4 } },                 // FAR horizontal roller
    { kind: 'menace', model: 'sawblade',      color: 'neutral',cx: 89, cz: -6.0, spin: { axis: 'x', speed: 6 } },                           // FAR spinner
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 86, cz: 0, dy: 3.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 2.6 } }, // hung over the B3 gauntlet void
    { kind: 'menace', model: 'bomb',          color: 'neutral',cx: 86, cz: 0, dy: -4.6 },                                                   // bomb deep in the B3 pit (static)

    // --- Hub F spring deck (x92..98) + finish tower (x98..104): the crescendo. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 93, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7 } },                    // NEAR flank double saw by the springs
    { kind: 'menace', model: 'hammer_spikes', color: 'green',  cx: 97, cz: 6.4, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 1.7 } },   // NEAR spiked hammer
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 93, cz: -6.0, spin: { axis: 'x', speed: 4 } },                 // FAR horizontal roller
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 101, cz: -6.0, top: 10, dy: 1.0 },                                   // FAR hanger at the finish tower (static)
    { kind: 'menace', model: 'spikeball',     color: 'neutral',cx: 101, cz: -6.0, top: 10, dy: -0.6, swing: { axis: 'x', amp: 0.7, speed: 2.0, phase: 0.8 } }, // hanging spikeball at the finish
    { kind: 'menace', model: 'hammer_large',  color: 'red',    cx: 101, cz: 6.4, top: 10, swing: { axis: 'x', amp: 0.9, speed: 1.6, phase: 0.5 } }, // NEAR big hammer at the finish
    { kind: 'menace', model: 'ball',          color: 'yellow', cx: 98, cz: 6.6, top: 10, dy: 0.5, spin: { axis: 'y', speed: 5 } },          // NEAR trophy ball at the finish
    { kind: 'menace', model: 'cannon_base',   color: 'red',    cx: 98, cz: -6.4, top: 10, ry: -90 },                                        // FAR confetti cannon at the finish (static)
  ],
  springs: [
    { cx: 95, cz: -3 },   // SAFE-lane spring
    { cx: 95, cz: 3 },    // RISKY-lane spring
    { cx: 95, cz: 0 },    // center (hub-walked) spring
  ],
  coins: [
    { x: 3,  y: 6.4, z: 0 },     // A spawn hub

    // Branch 1 (conveyor-fed gauntlet)  — safe 1 / risky 3
    { x: 29, y: 6.4, z: -3 },    // SAFE lane (clear)
    { x: 24, y: 6.4, z: 3 },     // RISKY entry
    { x: 29, y: 7.0, z: 3 },     // RISKY: arc over the gauntlet  (reward)
    { x: 32, y: 6.4, z: 3 },     // RISKY landing                 (reward)

    { x: 38, y: 6.4, z: 0 },     // C rejoin hub

    // Branch 2 (jump the hammer pit)  — safe 1 / risky 3
    { x: 46, y: 6.4, z: -3 },    // SAFE bridge (before the comfy 3u gap)
    { x: 46, y: 6.4, z: 3 },     // RISKY entry
    { x: 50.5, y: 7.0, z: 3 },   // RISKY: arc over the 4u saw-gap (reward)
    { x: 55, y: 6.4, z: 3 },     // RISKY landing                 (reward)

    { x: 60, y: 6.4, z: 0 },     // D rejoin hub
    { x: 68, y: 6.4, z: 0 },     // M3 belt

    // Branch 3 (conveyor-fed gauntlet)  — safe 1 / risky 3
    { x: 86, y: 6.4, z: -3 },    // SAFE lane (clear)
    { x: 81, y: 6.4, z: 3 },     // RISKY entry
    { x: 86, y: 7.0, z: 3 },     // RISKY: arc over the gauntlet  (reward)
    { x: 90, y: 6.4, z: 3 },     // RISKY landing                 (reward)

    { x: 95, y: 6.4, z: 0 },     // F spring deck — "you made it" coin before the climb
    { x: 101, y: 11.4, z: 0 },   // atop the victory tower
  ],
  decor: [
    { kind: 'arrow', cx: 5, cz: 0 },          // go right, into the first split
    { kind: 'arrow', cx: 16.5, cz: -3 },      // signpost the SAFE lane at hub B
    { kind: 'pipeArch', cx: 38 },             // red arch framing rejoin hub C
    { kind: 'portal', cx: 38, cz: 0 },        // green portal at hub C
    { kind: 'gantry', cx: 50 },               // grey truss over the hammer-pit stretch
    { kind: 'portal', cx: 60, cz: 0 },        // portal at hub D
    { kind: 'gantry', cx: 75 },               // truss landmark at the final split hub
    { kind: 'arrow', cx: 96.5, cz: 0 },       // point at the spring -> victory tower
  ],
};
