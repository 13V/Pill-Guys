// Level 11 — "Current Affairs" (a CHAOTIC reef regatta high ABOVE THE OCEAN).
//
// THEME: a sun-bleached boardwalk strung between coral spires over an open sea.
// The whole course floats above the waterline (touch the ocean = wipeout). The
// flanks BOIL with nautical menace — saws read as ship propellers / anchor
// winches, swipers as rope-snares, spikerollers as buoy drums, spikeballs as
// mines on their chains, cones as channel markers. But almost ALL of that is
// DECORATIVE set-dressing (animated `menace`/`sawblade`/`cone` with NO death
// box): the autoplay strolls calmly past; a human reads the danger and dodges.
// Only TWO kinds of hazard are EVER lethal on a walked lane — (a) `spikes`
// reefs you JUMP, and (b) jump-GAPS in x you LEAP (sometimes a saw spins in the
// pit, so you "leap the propeller"). A lethal hazard is NEVER left on a lane.
//
// MULTI-ROUTE (FIVE branch sections, busier than most). Two lanes run the WHOLE
// way, spawn -> finish: a SAFE lane (far, z=-3, COOL blue/green "calm water")
// and a RISKY/REWARD lane (near, z=+3, WARM red/yellow "rip current"). Each
// branch splits off a w6 hub (spans z-3..+3 so both lanes land) and rejoins at
// the next w6 hub. The middle (z -2..+2) of every branch is intentionally EMPTY,
// so you MUST commit to a side; both lanes independently reach the finish. A
// ~2u forward gap off each hub makes entering a lane a deliberate hop.
//   Branch 1 (x23..34): current-fed split. SAFE = clear plank strip. RISKY = a
//     size-4 spike REEF (cx29, belt-pressured: 4u runway x23..27 + 3u land x31..34).
//   Branch 2 (x42..53): "MIND THE CHANNEL". SAFE breaks for a comfy 3u gap
//     (x47..50). RISKY breaks for a 4u gap (x47..51) with a saw (a churning
//     propeller) spinning IN the pit on the z=3 line — you LEAP it. Both real;
//     RISKY is harder, pays 3x.
//   Branch 3 (x61..72): current-fed split. SAFE = clear strip. RISKY = a size-4
//     spike REEF (cx67, belt-pressured: runway x61..65 + landing x69..72).
//   Branch 4 (x80..91): "STEPPING STONES". SAFE = three coral steppers with
//     comfy <=3u gaps (x80..82 / x85..87 / x89..91). RISKY = a long FORWARD
//     CURRENT belt the whole way (x80..91), no gaps — pure speed. Both real.
//   Branch 5 (x99..106): the closer. SAFE = clear strip onto the spring deck.
//     RISKY = a 1u hop off hub F then a 3u gap (x103..106) with a saw spinning in
//     the pit on the z=3 line — leap the propeller onto the spring deck. Pays 3x.
//
// RISKY SHORTCUT (the time-save; a constant-speed runner only gains by going
// FASTER): every RISKY (near, z=+3) lane is BOOSTED by FORWARD CURRENTS
// `conveyor {cz:3, w:4}` (span z1..5 — they NEVER touch the z=-3 SAFE lane). The
// belt pushes +X (~12u/s vs SAFE's 8). Belts sit on each branch's run-up +
// landing and on the NEAR HALF of half the hubs (B, D, F) — sweeping the risky
// runner ACROSS the hubs while SAFE walks them. Belts always sit BEFORE/AFTER
// the lethal cells, NEVER over the reef/saw cells, so you still jump every
// reef/saw-gap. Risky finishes clearly faster, pays ~3x coins.
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z)
// above. Limits (LEVELS_DESIGN.md): jump reach ~5u, gaps <=5u (RISKY maxes at 4u
// here), step-ups <=3u, reef size 4 with >=4u runway + >=3u landing, widths >=2.
// Hubs are w6 (z-3..+3). Reasoned 0 deaths on BOTH lanes (see gap audit below).
export default {
  name: 'Current Affairs',
  theme: 'blue',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'blue' },     // A start jetty        x: 0..6   — cool harbour launch
    { kind: 'conveyor', cx: 11, cz: 0, len: 8, w: 6, color: 'green' },              // M1 current (+X), w6 spans both lanes  x: 7..15  — shared calm flow

    // ---- BRANCH 1 (x23..34): current-fed reef split. 2u hop off hub B. ----
    { kind: 'platform', cx: 18, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },  // B split jetty        x:15..21  — bright decision buoy
    { kind: 'conveyor', cx: 18, cz: 3, len: 6, w: 4, color: 'red' },                // B hub NEAR boost     x:15..21  (cz3 -> z1..5: risky-only +X; SAFE z-3 untouched)
    { kind: 'strip', x0: 23, x1: 34, z: -3, w: 2, color: 'blue' },                  // B1 SAFE (far)        x:23..34  (clear plank walk) — COOL = calm
    { kind: 'strip', x0: 23, x1: 34, z:  3, w: 2, color: 'red' },                   // B1 RISKY (near)      x:23..34  (reef cx29) — WARM = rip
    { kind: 'conveyor', cx: 25,   cz: 3, len: 4, w: 4, color: 'yellow' },           // B1 RISKY run-up belt x:23..27  (+X into the reef leap; ends before spikes)
    { kind: 'conveyor', cx: 32.5, cz: 3, len: 3, w: 4, color: 'yellow' },           // B1 RISKY landing belt x:31..34 (+X after the reef -> hub C)

    { kind: 'platform', cx: 37, cz: 0, w: 6, d: 6, rails: true, color: 'green' },   // C rejoin jetty       x:34..40  (rejoin 1 + coral arch gate)

    // ---- BRANCH 2 (x42..53): MIND THE CHANNEL — SAFE 3u gap vs RISKY 4u gap-over-saw. ----
    { kind: 'strip', x0: 42, x1: 47, z: -3, w: 2, color: 'green' },                 // B2 SAFE seg1 (far)   x:42..47
    { kind: 'strip', x0: 50, x1: 53, z: -3, w: 2, color: 'green' },                 // B2 SAFE seg2 (far)   x:50..53  (after a comfy 3u channel x47..50)
    { kind: 'strip', x0: 42, x1: 47, z:  3, w: 2, color: 'yellow' },                // B2 RISKY seg1 (near) x:42..47 (propeller spins in the channel pit on the z=3 line)
    { kind: 'conveyor', cx: 44.5, cz: 3, len: 5, w: 4, color: 'red' },              // B2 RISKY run-up belt x:42..47 (+X across seg1, into the 4u saw-gap leap)
    { kind: 'strip', x0: 51, x1: 53, z:  3, w: 2, color: 'yellow' },                // B2 RISKY seg2 (near) x:51..53 (after a 4u gap x47..51 over the propeller)
    { kind: 'conveyor', cx: 52, cz: 3, len: 2, w: 4, color: 'red' },                // B2 RISKY landing belt x:51..53 (+X off the gap landing -> hub D)

    { kind: 'platform', cx: 56, cz: 0, w: 6, d: 6, rails: true, color: 'blue' },    // D rejoin jetty       x:53..59  (rejoin 2)
    { kind: 'conveyor', cx: 56, cz: 3, len: 6, w: 4, color: 'red' },                // D hub NEAR boost     x:53..59  (risky-only +X; SAFE z-3 untouched)

    // ---- BRANCH 3 (x61..72): current-fed reef split. 2u hop off hub D. ----
    { kind: 'strip', x0: 61, x1: 72, z: -3, w: 2, color: 'blue' },                  // B3 SAFE (far)        x:61..72  (clear walk)
    { kind: 'strip', x0: 61, x1: 72, z:  3, w: 2, color: 'red' },                   // B3 RISKY (near)      x:61..72  (reef cx67)
    { kind: 'conveyor', cx: 63,   cz: 3, len: 4, w: 4, color: 'yellow' },           // B3 RISKY run-up belt x:61..65  (+X into the reef leap; ends before spikes)
    { kind: 'conveyor', cx: 70.5, cz: 3, len: 3, w: 4, color: 'yellow' },           // B3 RISKY landing belt x:69..72 (+X after the reef -> hub E)

    { kind: 'platform', cx: 75, cz: 0, w: 6, d: 6, rails: true, color: 'green' },   // E rejoin jetty       x:72..78  (rejoin 3 + gantry crane landmark)

    // ---- BRANCH 4 (x80..91): STEPPING STONES (SAFE steppers) vs a long CURRENT (RISKY). ----
    { kind: 'platform', cx: 81, cz: -3, w: 2, d: 2, color: 'blue' },                // B4 SAFE stepper 1    x:80..82  (1u hop off hub E -> first coral stone)
    { kind: 'platform', cx: 86, cz: -3, w: 2, d: 2, color: 'blue' },                // B4 SAFE stepper 2    x:85..87  (3u gap x82..85)
    { kind: 'platform', cx: 90, cz: -3, w: 2, d: 2, color: 'blue' },                // B4 SAFE stepper 3    x:89..91  (2u gap x87..89 -> hub F edge x88)
    { kind: 'conveyor', cx: 85, cz: 3, len: 22, w: 4, color: 'red' },               // B4 RISKY (near)      x:74..96  long FORWARD current, no gaps — pure SPEED (overlaps hubs E/F; risky-only)

    { kind: 'platform', cx: 91, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },  // F split-rejoin jetty x:88..94  (rejoin 4 + the closer split)
    { kind: 'conveyor', cx: 91, cz: 3, len: 6, w: 4, color: 'red' },                // F hub NEAR boost     x:88..94  (risky-only +X; SAFE z-3 untouched)

    // ---- BRANCH 5 (x99..106): the closer — SAFE clear vs RISKY 3u gap-over-saw. ----
    { kind: 'strip', x0: 98, x1: 106, z: -3, w: 2, color: 'blue' },                // B5 SAFE (far)        x:98..106 (4u hop off hub F, clear walk onto spring deck)
    { kind: 'strip', x0: 99, x1: 103, z:  3, w: 2, color: 'yellow' },              // B5 RISKY seg1 (near) x:99..103 (1u hop off hub F, then a 4u run-up to the leap)
    { kind: 'conveyor', cx: 101, cz: 3, len: 4, w: 4, color: 'red' },              // B5 RISKY run-up belt x:99..103 (+X across the run-up, into the 3u saw-gap leap x103..106)

    { kind: 'platform', cx: 109, cz: 0, w: 6, d: 6, color: 'green' },              // G spring deck        x:106..112 (rejoin 5; RISKY leaps a 3u saw-gap x103..106 onto it; per-lane springs -> tower)
    { kind: 'conveyor', cx: 107, cz: 3, len: 2, w: 4, color: 'red' },             // G entry NEAR boost   x:106..108 (risky-only +X off the gap landing toward the cz3 spring; ENDS before the spring sensor)
    { kind: 'finish', cx: 112, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },     // finish lighthouse (w6 so every lane lands)  x:109..115 — golden beacon
  ],
  hazards: [
    // ===========================================================================
    // GAMEPLAY HAZARDS — the only LETHAL ones (on-line reefs + saw-in-the-gap).
    // Every lethal sits on a RISKY (near, z=+3) lane with a clear landing; SAFE
    // (far, z=-3) lanes and the shared hubs are always passable.
    // ===========================================================================
    { kind: 'spikes', cx: 29, cz: 3, size: 4 },                       // B1 reef (runway x23..27, land x31..34) — LETHAL on-line
    { kind: 'sawblade', cx: 49, cz: 3, lethal: true },                // B2: low propeller in the 4u gap pit (x47..51); leap it (lethal box small/low)
    { kind: 'spikes', cx: 67, cz: 3, size: 4 },                       // B3 reef (runway x61..65, land x69..72) — LETHAL on-line
    { kind: 'sawblade', cx: 104.5, cz: 3 },                           // B5: propeller spinning in the 3u gap pit (x103..106) on the z=3 line; the GAP is the threat (saw decorative)

    // Channel markers (decorative cones): flag each RISKY lane's on-the-line edges.
    { kind: 'cone', cx: 26.5, cz: 3 }, { kind: 'cone', cx: 31.5, cz: 3 },  // B1 reef edges
    { kind: 'cone', cx: 46.5, cz: 3 }, { kind: 'cone', cx: 51.5, cz: 3 },  // B2 saw-gap jump edges
    { kind: 'cone', cx: 64.5, cz: 3 }, { kind: 'cone', cx: 69.5, cz: 3 },  // B3 reef edges
    { kind: 'cone', cx: 82.5, cz: -3 }, { kind: 'cone', cx: 84.5, cz: -3 },// B4 SAFE stepper-gap edges (mark the leaps)
    { kind: 'cone', cx: 102.5, cz: 3 }, { kind: 'cone', cx: 106.0, cz: 3 },// B5 saw-gap jump edges

    // ===========================================================================
    // CHAOS DECOR — animated `menace`/`sawblade`/`cone`, NO lethal flag (no death
    // box, never blocks a lane). Reef regatta = NAUTICAL MENACE EVERYWHERE: packed
    // on the FAR flank (z<=-5.5), NEAR flank (z>=+5.5), ABOVE the empty middles of
    // gaps (high dy, clears the jump arc), on hub CORNERS, and DOWN in the SEA-PITS
    // (negative dy). Phases varied so nothing is in lockstep — the reef churns.
    // ===========================================================================

    // --- A start jetty + M1 current (x0..15): winches greet you, mines on the flanks. ---
    { kind: 'menace', model: 'saw_trap', color: 'red', cx: 1.5, cz: 5.8, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.0 } },         // NEAR flank winch
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 4.5, cz: -5.8, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.1 } },// FAR flank double winch
    { kind: 'menace', model: 'swiper', color: 'green', cx: 3, cz: 6.6, spin: { axis: 'y', speed: 3, phase: 0.6 } },                    // NEAR flank rope-snare
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 6.5, cz: -6.4, dy: 4.6 },                                       // FAR flank mine hanger arm
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 6.5, cz: -6.4, dy: 2.1, swing: { axis: 'z', amp: 0.7, speed: 2.0, phase: 0.4 } }, // its swinging sea-mine
    { kind: 'sawblade', cx: 8, cz: 6.4 },                                                                                              // NEAR flank decorative propeller (M1)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 11, cz: -6.0, dy: 0.5, spin: { axis: 'x', speed: 4, phase: 0.4 } }, // FAR flank buoy drum over the current
    { kind: 'menace', model: 'saw_trap_long', color: 'yellow', cx: 13, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.3 } },  // NEAR flank long winch
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 11, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 6, phase: 0.2 } },      // propeller churning in the M1 sea-pit

    // --- Hub B split (x15..21): corner winches + mine over the entry hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 16.0, cz: 6.2, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } }, // NEAR hub corner double winch
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 20.0, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.1 } },     // NEAR hub corner winch
    { kind: 'menace', model: 'swiper_double', color: 'green', cx: 16.0, cz: -5.8, spin: { axis: 'y', speed: 3, phase: 1.2 } },        // FAR hub corner double snare
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 20.0, cz: -6.0, spin: { axis: 'y', speed: 4, phase: 2.8 } },// FAR hub corner vertical drum
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 22, cz: 0, dy: 4.2, swing: { axis: 'x', amp: 0.6, speed: 2.2, phase: 1.0 } }, // mine swung over the B1 entry void (middle)

    // --- BRANCH 1 (x23..34): flank winches/drums, mine over the reef, sea-pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 26, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },     // NEAR flank long winch beside the reef
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 33, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.9 } },       // NEAR flank winch (landing side)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 24, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.5 } }, // FAR flank vertical drum
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 31, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.1 } },// FAR flank horizontal drum
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 29, cz: 0, dy: 3.8, spin: { axis: 'z', speed: 6, phase: 1.3 } },       // propeller hung over the B1 reef middle
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 29, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 6, phase: 2.2 } },      // propeller deep in the B1 sea-pit

    // --- Hub C / coral arch gate (x34..40): corner winches + crown + pit. ---
    { kind: 'sawblade', cx: 37, cz: 1.8 },                                                                                             // arch gate decorative propeller (right)
    { kind: 'sawblade', cx: 37, cz: -1.8 },                                                                                            // arch gate decorative propeller (left)
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 35, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.5 } },       // NEAR hub corner winch
    { kind: 'menace', model: 'swiper_quad', color: 'green', cx: 39, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 3.0 } },            // FAR hub corner quad snare
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 37, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 5, phase: 0.5 } }, // drum in the hub-C sea-pit

    // --- BRANCH 2 (x42..53): long flank winches/snares, mine over the channel, pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 44, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.9 } },     // NEAR flank long winch (seg1)
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 52, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.0 } },       // NEAR flank winch (seg2)
    { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 44, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 0.6 } },             // FAR flank long snare over the SAFE channel
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 51, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.1 } },// FAR flank drum
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 49, cz: 0, dy: 4.0, spin: { axis: 'z', speed: 6, phase: 1.3 } },       // propeller hung over the B2 channel middle
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 48.5, cz: 0, dy: -4.4, spin: { axis: 'x', speed: 6, phase: 0.7 } },    // propeller deep in the B2 sea-pit

    // --- Hub D rejoin (x53..59): corner winches + crown + pit. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 54, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },  // NEAR hub corner double winch
    { kind: 'menace', model: 'saw_trap', color: 'red', cx: 58, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.3 } },          // NEAR hub corner winch
    { kind: 'menace', model: 'swiper', color: 'green', cx: 54, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.4 } },                 // FAR hub corner snare
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 58, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.8 } }, // FAR hub corner vertical drum
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 56, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 5, phase: 0.5 } },      // propeller in the hub-D sea-pit

    // --- BRANCH 3 (x61..72): flank winches/drums, mine over the reef, sea-pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 64, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },     // NEAR flank long winch beside the reef
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 71, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.3 } },       // NEAR flank winch (landing side)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 62, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.8 } },// FAR flank horizontal drum
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 70, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.3 } }, // FAR flank vertical drum
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 67, cz: 0, dy: 3.8, spin: { axis: 'z', speed: 6, phase: 2.6 } },       // propeller hung over the B3 reef middle
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 67, cz: 0, dy: -3.8, spin: { axis: 'x', speed: 6, phase: 0.9 } },      // propeller deep in the B3 sea-pit

    // --- Hub E / gantry crane landmark (x72..78): corner winches + crown + pit. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 73, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.2 } },       // NEAR hub corner winch
    { kind: 'menace', model: 'saw_trap_double', color: 'green', cx: 77, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.6 } }, // NEAR hub corner double winch
    { kind: 'menace', model: 'swiper_double_long', color: 'blue', cx: 73, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 0.3 } },      // FAR hub corner long double snare
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 77, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.4 } },// FAR hub corner drum
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 75, cz: 0, dy: 4.4, spin: { axis: 'z', speed: 6, phase: 1.6 } },       // propeller crown over the E hub
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 75, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 5, phase: 0.0 } },      // propeller in the hub-E sea-pit

    // --- BRANCH 4 (x80..91): flank menace around the steppers; mines over the gaps. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 83, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },     // NEAR flank long winch over the current
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 88, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.7 } },       // NEAR flank winch over the current
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 81, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.5 } }, // FAR flank vertical drum (stepper 1)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 90, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.2 } },// FAR flank horizontal drum (stepper 3)
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 83.5, cz: -3, dy: 5.0 },                                       // mine hanger over the SAFE stepper-gap
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 83.5, cz: -3, dy: 2.6, swing: { axis: 'x', amp: 0.5, speed: 2.1, phase: 0.8 } }, // its mine, swung clear above the leap arc
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 86, cz: 0, dy: 4.2, spin: { axis: 'z', speed: 6, phase: 0.9 } },       // propeller hung over the B4 middle
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 85, cz: -3, dy: -3.6, spin: { axis: 'x', speed: 6, phase: 2.1 } },     // propeller in the sea below the steppers

    // --- Hub F split-rejoin (x88..94): corner winches + crown + pit. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 89, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.4 } },   // NEAR hub corner double winch
    { kind: 'menace', model: 'saw_trap', color: 'blue', cx: 93, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 2.4 } },         // NEAR hub corner winch
    { kind: 'menace', model: 'swiper_quad', color: 'green', cx: 89, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.0 } },            // FAR hub corner quad snare
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 93, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.9 } }, // FAR hub corner vertical drum
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 91, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 5, phase: 0.6 } },      // propeller in the hub-F sea-pit

    // --- BRANCH 5 (x99..106): flank winches, propeller over the saw-gap, pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 104, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },    // NEAR flank long winch over the saw-gap
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 101, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.5 } },// FAR flank vertical drum (saw-gap run-in)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 105, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.2 } },// FAR flank horizontal drum
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 104, cz: 0, dy: 3.8, spin: { axis: 'z', speed: 6, phase: 0.9 } },      // propeller hung over the B5 saw-gap middle
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 104, cz: 0, dy: -4.2, spin: { axis: 'x', speed: 6, phase: 2.1 } },     // propeller deep in the B5 sea-pit

    // --- G spring deck (x106..112) + finish lighthouse (x109..115): a saw-flanked crescendo. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 108, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } }, // NEAR flank double winch by the springs
    { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 111, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.0 } },          // FAR flank quad snare by the springs
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 112, cz: 6.6, top: 10, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } }, // NEAR flank long winch at the lighthouse
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 108, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.4 } },// FAR flank drum by the springs
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 112, cz: -6.0, top: 10, spin: { axis: 'y', speed: 6, phase: 0.8 } },   // FAR flank trophy propeller at the lighthouse
    { kind: 'menace', model: 'sawblade', color: 'neutral', cx: 109, cz: 0, dy: -3.4, spin: { axis: 'x', speed: 5, phase: 1.2 } },     // propeller in the G sea-pit
  ],
  // One spring PER LANE on spring deck G -> the victory lighthouse (top 5 -> top 10).
  // Whichever lane you arrive in (z -3 / +3) or the center, a spring lifts you up.
  springs: [
    { cx: 109, cz: -3 },   // SAFE-lane spring
    { cx: 109, cz: 3 },    // RISKY-lane spring
    { cx: 109, cz: 0 },    // center (hub-walked) spring
  ],
  // Reward differentiates the lanes: each RISKY (near, z=+3) lane pays ~3x its SAFE
  // (far, z=-3) sibling, with an arc coin sitting ON the jump over each reef/gap.
  coins: [
    { x: 3,  y: 6.4, z: 0 },     // A start jetty
    { x: 11, y: 6.4, z: 0 },     // M1 current

    // Branch 1 (current-fed reef)  — safe 1 / risky 3
    { x: 29, y: 6.4, z: -3 },    // safe lane (clear)
    { x: 24, y: 6.4, z: 3 },     // risky entry
    { x: 29, y: 7.0, z: 3 },     // risky: arc over the reef          (reward)
    { x: 32, y: 6.4, z: 3 },     // risky landing                     (reward)

    { x: 37, y: 6.4, z: 0 },     // C rejoin / coral arch

    // Branch 2 (mind the channel)  — safe 1 / risky 3
    { x: 44, y: 6.4, z: -3 },    // safe w2 bridge (before the comfy 3u channel)
    { x: 44, y: 6.4, z: 3 },     // risky entry
    { x: 49, y: 7.0, z: 3 },     // risky: arc over the 4u saw-gap    (reward)
    { x: 52, y: 6.4, z: 3 },     // risky landing                     (reward)

    { x: 56, y: 6.4, z: 0 },     // D rejoin jetty

    // Branch 3 (current-fed reef)  — safe 1 / risky 3
    { x: 67, y: 6.4, z: -3 },    // safe lane (clear)
    { x: 63, y: 6.4, z: 3 },     // risky entry
    { x: 67, y: 7.0, z: 3 },     // risky: arc over the reef          (reward)
    { x: 70, y: 6.4, z: 3 },     // risky landing                     (reward)

    { x: 75, y: 6.4, z: 0 },     // E rejoin jetty

    // Branch 4 (stepping stones vs current)  — safe 1+1 / risky 3
    { x: 81, y: 6.4, z: -3 },    // safe stepper 1
    { x: 90, y: 6.4, z: -3 },    // safe stepper 3
    { x: 80, y: 6.4, z: 3 },     // risky current entry
    { x: 85, y: 6.4, z: 3 },     // risky current mid                 (reward)
    { x: 90, y: 6.4, z: 3 },     // risky current exit                (reward)

    { x: 91, y: 6.4, z: 0 },     // F split-rejoin jetty

    // Branch 5 (closer saw-gap)  — safe 1 / risky 3
    { x: 103, y: 6.4, z: -3 },   // safe lane (clear)
    { x: 101, y: 6.4, z: 3 },    // risky entry
    { x: 104, y: 7.0, z: 3 },    // risky: arc over the 3u saw-gap    (reward)

    { x: 109, y: 6.4, z: 0 },    // G spring deck — "you made it" coin before the climb
    { x: 112, y: 11.4, z: 0 },   // atop the victory lighthouse
  ],
  decor: [
    { kind: 'arrow', cx: 5, cz: 0 },          // go right, into the first split
    { kind: 'arrow', cx: 16.5, cz: -3 },      // signpost the SAFE lane at hub B
    { kind: 'pipeArch', cx: 37, color: 'green' }, // coral arch framing the gate (rejoin 1)
    { kind: 'portal', cx: 37, cz: 0, color: 'blue' }, // blue portal at the coral gate
    { kind: 'gantry', cx: 75 },               // grey truss crane landmark at hub E
    { kind: 'arrow', cx: 92.5, cz: -3 },      // signpost the SAFE steppers->strip at hub F
    { kind: 'arrow', cx: 110.5, cz: 0 },      // point at the spring -> victory lighthouse
  ],
};
