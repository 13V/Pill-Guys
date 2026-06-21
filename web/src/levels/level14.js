// Level 14 — "Buoy Oh Buoy" (the tropical-ocean grand finale, ~144u above the sea).
//
// The campaign's blow-out CASTAWAY finale: a sun-bleached boardwalk strung between
// floating buoys, coral reefs and shipwreck gantries ABOVE A TROPICAL OCEAN. Built
// as a CHAOTIC Fall-Guys multi-route course — FOUR branch splits, each a SAFE lane
// (far, z=-3, cool aqua/teal "deep-water" colors) vs a genuinely-harder RISKY/REWARD
// lane (near, z=+3, warm coral/sunset colors) that forks off a w6 buoy-hub and
// rejoins at the next w6 hub. The MIDDLE of every branch (z -2..+2) is intentionally
// EMPTY open water so you must COMMIT to a side; BOTH lanes independently run
// spawn -> finish at 0 deaths (verified by lane gap analysis below). Mirrors the
// proven level9/level10 split-hub-rejoin format (this flat single-file descriptor).
//
// "BUOY OH BUOY" IDENTITY — varied seaside challenge across the four splits so the
// finale never repeats itself, themed for the tide:
//   SPLIT 1  B (x23..38)  REEF GAUNTLET — SAFE clear plank / RISKY belt-fed size-4
//            "coral" spike gauntlet (cx29, 4u runway x23..27 + 7u landing x31..38).
//   SPLIT 2  D (x61..76)  TIDE GAP      — SAFE comfy 3u gap (x66..69) / RISKY a 4u
//            gap (x66..70) over an "anchor saw" spinning IN the pit on the z=3 line.
//   SPLIT 3  G (x99..114) WHIRLPOOL     — SAFE clear plank / RISKY 4u jump-gap
//            (x103..107) over a saw spinning in the whirlpool pit; belt run-up/landing.
//   SPLIT 4  H (x123..134) RIPTIDE RUN  — the signature finish: SAFE clear plank /
//            RISKY a belt-BOOSTED "riptide" sprint over a size-4 gauntlet (cx129,
//            4u runway x123..127 + 3u landing x131..134) onto the spring deck.
// Spring deck J (x134..140) fires WHICHEVER lane up the lighthouse victory tower (top 10).
//
// SIGNATURE GIMMICK — the RIPTIDE: split 4's whole risky lane sits on ONE long forward
// conveyor (the "riptide current"), the fastest belt run in the level, sweeping you over
// the final coral gauntlet and slingshotting onto the launch buoy. Pure speed payoff.
//
// RISKY SHORTCUT (the time-save, same idea as level9/level10): in a constant-run game
// speed is the only way to go faster, so EVERY risky (near, z=+3) lane is BOOSTED by
// FORWARD CONVEYORS `conveyor {cz:3, w:4}` (span z1..5 — they NEVER touch the z=-3 SAFE
// lane). The belt pushes +X (CONVEYOR_SPEED on top of the base) so the risky runner moves
// ~12 u/s vs SAFE's 8 — a real Fall-Guys shortcut. Belts sit on each risky run-up + landing
// and across the NEAR half (cz3, w4 -> z1..5) of the shared hubs B/G, boosting the risky
// lane ONLY; they're always BEFORE/AFTER each lethal gate, NEVER over the spike cells or
// gap pits (you still jump every gauntlet/saw-gap). Risky pays ~3x coins.
//
// TWO CLASSES OF HAZARD, kept strictly separate:
//   (1) DECORATIVE CHAOS — animated `menace` props with NO lethal flag (no death box,
//       can NEVER block a lane). The full roster packed DENSE: FAR flank (z<=-5.5),
//       NEAR flank (z>=+5.5), ABOVE empty branch middles (high dy, clear of the jump
//       arc), on hub CORNERS, and DOWN in the PITS (negative dy). Autoplay walks
//       straight past — INTENDED; a human dodges, the danger reads purely visually.
//       Phases varied so the whole reef saws, sweeps, hammers and swings at once.
//   (2) REAL LETHAL GATES — ONLY two kinds, and ONLY on a risky lane that has a safe
//       landing: (a) size-4 `spikes` gauntlets (jump them), and (b) jump-GAPS between
//       consecutive lane decks (4u, autoplay full-jumps them), some with a `lethal`
//       sawblade spinning in the pit you leap. NOTHING lethal sits on a walkable lane
//       except these — autoplay clears every lane at 0 deaths.
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
// Limits (LEVELS_DESIGN.md): jump reach ~5u, gaps <=5u (RISKY maxes at 4u), step-ups
// <=3u, gauntlet size 4 with >=4u runway + >=3u landing, widths >=2. Hubs w6 (z-3..+3
// so both lanes land). The whole course floats ABOVE THE OCEAN — falling in is lethal.
export default {
  name: 'Castaway Causeway',
  theme: 'blue',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    // ===================== SHARED SPINE START (the marina) =====================
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'green' },     // A spawn dock       x:0..6   — teal castaway jetty, the finale sets sail
    { kind: 'conveyor', cx: 10, cz: 0, len: 8, w: 6, color: 'blue' },                // M1 tide belt (+X), w6 spans both lanes  x:6..14  — COOL blue shared current

    // ===================== SPLIT 1 — B (x23..38): REEF GAUNTLET =====================
    { kind: 'platform', cx: 17, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // B split buoy       x:14..20  — bright first decision buoy
    { kind: 'conveyor', cx: 17, cz: 3, len: 4, w: 4, color: 'red' },                 // B buoy NEAR boost  x:15..19  (cz3 -> z1..5: risky-only +X; SAFE z-3 untouched) — WARM coral boost
    { kind: 'strip', x0: 23, x1: 38, z: -3, w: 2, color: 'blue' },                   // B1 SAFE plank (far) x:23..38 CONTINUOUS, clear (3u hop off the buoy x20->23) — COOL aqua = SAFE
    { kind: 'strip', x0: 23, x1: 38, z:  3, w: 2, color: 'red' },                    // B1 RISKY reef (near) x:23..38 CONTINUOUS, coral gauntlet cx29 (runway x23..27, land x31..38) — WARM coral = RISKY
    { kind: 'conveyor', cx: 25, cz: 3, len: 4, w: 4, color: 'yellow' },              // B1 RISKY run-up belt x:23..27 (+X ~12u/s into the gauntlet leap; ends before spikes x27..31)
    { kind: 'conveyor', cx: 35, cz: 3, len: 4, w: 4, color: 'yellow' },              // B1 RISKY landing belt x:33..37 (+X ~12u/s off the gauntlet -> buoy C)

    { kind: 'platform', cx: 41, cz: 0, w: 6, d: 6, rails: true, color: 'green' },     // C rejoin buoy      x:38..44  (both lane planks x38 edge touch it) — teal rejoin breather
    { kind: 'conveyor', cx: 48, cz: 0, len: 8, w: 6, color: 'blue' },                // M2 tide belt (+X), w6 spans both lanes  x:44..52  — COOL blue shared current

    // ===================== SPLIT 2 — D (x61..76): TIDE GAP =====================
    { kind: 'platform', cx: 55, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // D split buoy       x:52..58  — bright decision buoy
    { kind: 'conveyor', cx: 55, cz: 3, len: 4, w: 4, color: 'red' },                 // D buoy NEAR boost  x:53..57  (risky-only +X; SAFE z-3 untouched) — WARM coral boost
    { kind: 'strip', x0: 61, x1: 66, z: -3, w: 2, color: 'green' },                  // B2 SAFE seg1 (far) x:61..66  (3u hop off the buoy x58->61) — COOL teal = SAFE
    { kind: 'strip', x0: 69, x1: 76, z: -3, w: 2, color: 'green' },                  // B2 SAFE seg2 (far) x:69..76  (after a comfy 3u gap x66..69) — COOL teal = SAFE
    { kind: 'strip', x0: 61, x1: 66, z:  3, w: 2, color: 'red' },                    // B2 RISKY seg1 (near) x:61..66 (anchor saw spins in the 4u gap pit ahead) — WARM coral = RISKY
    { kind: 'strip', x0: 70, x1: 76, z:  3, w: 2, color: 'red' },                    // B2 RISKY seg2 (near) x:70..76 (after a bigger 4u saw-gap x66..70) — WARM coral = RISKY
    { kind: 'conveyor', cx: 63, cz: 3, len: 4, w: 4, color: 'yellow' },              // B2 RISKY run-up belt x:61..65 (+X ~12u/s across seg1 into the 4u saw-gap leap x66..70)
    { kind: 'conveyor', cx: 74, cz: 3, len: 4, w: 4, color: 'yellow' },              // B2 RISKY landing belt x:72..76 (+X ~12u/s off the saw-gap -> buoy F)

    { kind: 'platform', cx: 79, cz: 0, w: 6, d: 6, rails: true, color: 'red' },       // F rejoin buoy      x:76..82  (both lane planks x76 edge touch it) — hot coral rejoin
    { kind: 'conveyor', cx: 86, cz: 0, len: 8, w: 6, color: 'blue' },                // M3 tide belt (+X), w6 spans both lanes  x:82..90  — COOL blue shared current

    // ===================== SPLIT 3 — G (x99..114): WHIRLPOOL =====================
    { kind: 'platform', cx: 93, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },   // G split buoy       x:90..96  — bright mid decision buoy
    { kind: 'conveyor', cx: 93, cz: 3, len: 4, w: 4, color: 'red' },                 // G buoy NEAR boost  x:91..95  (risky-only +X; SAFE z-3 untouched) — WARM coral boost
    { kind: 'strip', x0: 99, x1: 114, z: -3, w: 2, color: 'blue' },                  // B3 SAFE plank (far) x:99..114 CONTINUOUS, clear onto buoy H (3u hop x96->99) — COOL aqua = SAFE
    { kind: 'strip', x0: 99, x1: 103, z:  3, w: 2, color: 'red' },                   // B3 RISKY seg1 (near) x:99..103 (saw spins in the 4u whirlpool gap ahead) — WARM coral = RISKY
    { kind: 'strip', x0: 107, x1: 114, z:  3, w: 2, color: 'red' },                  // B3 RISKY seg2 (near) x:107..114 (after a 4u whirlpool saw-gap x103..107) — WARM coral = RISKY
    { kind: 'conveyor', cx: 101, cz: 3, len: 4, w: 4, color: 'yellow' },             // B3 RISKY run-up belt x:99..103 (+X ~12u/s into the 4u saw-gap leap x103..107)
    { kind: 'conveyor', cx: 109, cz: 3, len: 4, w: 4, color: 'yellow' },             // B3 RISKY landing belt x:107..111 (+X ~12u/s off the whirlpool gap -> buoy H)

    { kind: 'platform', cx: 117, cz: 0, w: 6, d: 6, rails: true, color: 'green' },    // H rejoin/final-split buoy x:114..120 (both lanes land; entry split 4) — teal final breather
    { kind: 'conveyor', cx: 117, cz: 3, len: 4, w: 4, color: 'red' },                // H buoy NEAR boost  x:115..119 (risky-only +X into the riptide; SAFE z-3 untouched) — WARM coral boost

    // ===================== SPLIT 4 — H (x123..134): RIPTIDE RUN (signature) =====================
    { kind: 'strip', x0: 123, x1: 134, z: -3, w: 2, color: 'green' },                // B4 SAFE plank (far) x:123..134 CONTINUOUS, clear walk onto spring deck J (3u hop x120->123) — COOL teal = SAFE
    { kind: 'strip', x0: 123, x1: 134, z:  3, w: 2, color: 'red' },                  // B4 RISKY reef (near) x:123..134 CONTINUOUS off buoy H, RIPTIDE-boosted, coral gauntlet cx129 (runway x123..127, land x131..134) — WARM coral = RISKY
    { kind: 'conveyor', cx: 125, cz: 3, len: 4, w: 4, color: 'yellow' },             // B4 RIPTIDE run-up belt x:123..127 (+X ~12u/s into the final gauntlet leap; ends before spikes x127..131)
    { kind: 'conveyor', cx: 132.5, cz: 3, len: 3, w: 4, color: 'yellow' },           // B4 RIPTIDE landing belt x:131..134 (+X ~12u/s off the gauntlet -> spring deck J) — the slingshot

    // ===================== SPRING DECK + LIGHTHOUSE VICTORY TOWER =====================
    { kind: 'platform', cx: 137, cz: 0, w: 6, d: 6, color: 'green' },                // J launch buoy      x:134..140 (rejoin 4; per-lane springs -> tower; both lane planks x134 edge touch it) — teal launch pad
    { kind: 'finish', cx: 144, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },        // lighthouse finish tower (w6 so every lane lands)  x:141..147 — celebratory golden lighthouse
  ],

  hazards: [
    // =========================================================================
    // (2) REAL LETHAL GATES — the ONLY lethal hazards. Each sits on a RISKY (z=+3)
    // lane WITH a safe landing (size-4 gauntlets: >=4u runway + >=3u landing) or is a
    // saw spinning IN a 4u jump-gap pit (the GAP is the threat — you leap the saw).
    // SAFE (z=-3) lanes & the shared buoy-hubs are always clear. NOTHING lethal touches
    // a walkable lane except these, so autoplay clears every lane at 0 deaths.
    // =========================================================================
    { kind: 'spikes', cx: 29, cz: 3, size: 4 },                        // SPLIT1 B1 coral gauntlet (runway x23..27, land x31..38) — LETHAL on-line, JUMP it
    { kind: 'sawblade', cx: 68, cz: 3, lethal: true },                 // SPLIT2 B2: anchor saw IN the 4u gap pit (x66..70) on the z=3 line — leap it
    { kind: 'sawblade', cx: 105, cz: 3, lethal: true },                // SPLIT3 B3: saw IN the 4u whirlpool gap pit (x103..107) on the z=3 line — leap it
    { kind: 'spikes', cx: 129, cz: 3, size: 4 },                       // SPLIT4 B4 coral gauntlet (runway x123..127, land x131..134) — LETHAL on-line, JUMP it

    // Warning cones (DECORATIVE — no death box): flag each risky on-the-line gate.
    { kind: 'cone', cx: 26.5, cz: 3 }, { kind: 'cone', cx: 31.5, cz: 3 },   // B1 gauntlet edges
    { kind: 'cone', cx: 65.5, cz: 3 }, { kind: 'cone', cx: 70.5, cz: 3 },   // B2 saw-gap jump edges
    { kind: 'cone', cx: 102.5, cz: 3 }, { kind: 'cone', cx: 107.0, cz: 3 }, // B3 whirlpool-gap edges
    { kind: 'cone', cx: 126.5, cz: 3 }, { kind: 'cone', cx: 131.5, cz: 3 }, // B4 gauntlet edges

    // =========================================================================
    // (1) DECORATIVE CHAOS — animated `menace`, NO lethal flag (no death box, can NEVER
    // block a lane). FAR flank (z<=-5.5), NEAR flank (z>=+5.5), ABOVE empty branch
    // middles (high dy), buoy CORNERS, and DOWN in PITS (negative dy). Phases varied so
    // the whole reef writhes at once. Nautical flavor: floating buoy-saws, swinging
    // anchors/spikeballs, churning whirlpool rollers, drifting bombs (sea-mines).
    // =========================================================================

    // --- A spawn dock + M1 tide belt (x0..14): cast-off buzz, flank sweeps, hung middle. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 1.5, cz: 6.0, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.0 } },          // NEAR flank dock saw
    { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 4.0, cz: -5.8, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.3 } },        // FAR flank tide sweep
    { kind: 'menace', model: 'cannon_base', color: 'red', cx: -1.5, cz: 0 },                                                              // signal cannon aimed down the spine (static)
    { kind: 'menace', model: 'cannon_bullet', color: 'neutral', cx: -0.2, cz: 0, dy: 0.4 },                                              // its in-flight shot (static)
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 3.0, cz: -3.0, dy: 4.2 },                                          // dock corner buoy-hanger (static)
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 3.0, cz: -3.0, dy: 2.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.0 } }, // mooring buoy swinging under it
    { kind: 'menace', model: 'swiper', color: 'green', cx: 10, cz: 6.4, spin: { axis: 'y', speed: 3, phase: 0.6 } },                      // NEAR flank sweep along the M1 current
    { kind: 'menace', model: 'hammer', color: 'red', cx: 10, cz: -5.8, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.4 } },          // FAR flank capstan hammer over the M1 current
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 12, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.2 } }, // undertow roller churning in the M1 pit

    // --- Buoy B split (x14..20): corner saws/hammers + hung middle over the entry hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 15.0, cz: 6.2, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },     // NEAR buoy corner double saw
    { kind: 'menace', model: 'swiper_double', color: 'green', cx: 19.0, cz: 6.4, spin: { axis: 'y', speed: 3, phase: 2.1 } },             // NEAR buoy corner double swiper
    { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 15.0, cz: -5.8, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.2 } }, // FAR buoy corner big hammer
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 21, cz: 0, dy: 5.0 },                                              // anchor bracket over the B1 entry void
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 21, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2, phase: 2.6 } }, // anchor swinging across the void (x)
    { kind: 'menace', model: 'floor_spikes_2x2x1', color: 'neutral', cx: 14, cz: -6.5 },                                                  // FAR flank reef spikes (B entry)

    // --- BRANCH 1 (x23..38): flank rollers/hammers/saws, hung anchor over the gauntlet, pit mine. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 26, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },         // NEAR flank long saw beside the gauntlet
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 24, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.5 } },     // FAR flank vertical reef roller
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 31, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.1 } },   // FAR flank horizontal reef roller
    { kind: 'menace', model: 'hammer_spikes', color: 'green', cx: 29, cz: 6.6, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.4 } },  // NEAR flank spiked hammer over the gauntlet
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 30.5, cz: 0, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 1.3 } }, // anchor hung over the B1 middle water
    { kind: 'menace', model: 'chain_link', color: 'neutral', cx: 30.5, cz: 0, dy: 5.0 },                                                  // anchor chain link above it (static)
    { kind: 'menace', model: 'floor_spikes_trap_2x2x1', color: 'red', cx: 24, cz: 8.0 },                                                  // NEAR flank reef trap spikes
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 30.5, cz: 0, dy: -4.6 },                                                       // sea-mine deep in the B1 middle pit (static)
    { kind: 'menace', model: 'ball', color: 'blue', cx: 37, cz: 6.6, dy: 0.5, spin: { axis: 'y', speed: 5, phase: 0.3 } },                // NEAR flank rolling buoy (landing)

    // --- Buoy C rejoin (x38..44) + M2 tide belt (x44..52): corner saws + crown + pit. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 39, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.5 } },           // NEAR buoy corner saw
    { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 43, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 3.0 } },               // FAR buoy corner quad swiper
    { kind: 'menace', model: 'hammer_large_spikes', color: 'red', cx: 39, cz: -6.4, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.0 } }, // FAR buoy corner big spiked hammer
    { kind: 'menace', model: 'spikeblock_omni', color: 'yellow', cx: 41, cz: -3.0, dy: 4.6 },                                             // omni spikeblock crown floating over the buoy (static)
    { kind: 'menace', model: 'saw_trap_long', color: 'green', cx: 48, cz: -6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.0 } },      // FAR flank long saw over the M2 current
    { kind: 'menace', model: 'hammer', color: 'red', cx: 48, cz: 6.2, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.0 } },           // NEAR flank capstan hammer over the M2 current
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 48, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.5 } }, // undertow roller in the M2 pit
    { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 41, cz: 0, dy: -4.6 },                                                        // sea-mine in the C-buoy pit (static)

    // --- Buoy D split (x52..58): corner saws/swipers + hung middle over the entry hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 53, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },      // NEAR buoy corner double saw
    { kind: 'menace', model: 'swiper_double_long', color: 'yellow', cx: 57, cz: -6.0, ry: 90, spin: { axis: 'y', speed: 3, phase: 2.8 } },// FAR buoy corner long double swiper
    { kind: 'menace', model: 'hammer_large', color: 'red', cx: 53, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.3 } },    // FAR buoy corner big hammer
    { kind: 'menace', model: 'spikeblock_down', color: 'blue', cx: 55, cz: -3.0, dy: 4.6 },                                               // spikeblock crown floating over the buoy (static)
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 59, cz: 0, dy: 5.0 },                                              // anchor bracket over the B2 entry void
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 59, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2.2, phase: 1.6 } }, // anchor swinging across the void (x)

    // --- BRANCH 2 (x61..76): the shipwreck-gantry stretch — long swipers, hammers, pit mines/saw. ---
    { kind: 'menace', model: 'swiper_quad_long', color: 'red', cx: 63, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.9 } },      // NEAR flank long quad sweep
    { kind: 'menace', model: 'hammer', color: 'yellow', cx: 67, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.6 } },       // FAR flank hammer over the SAFE gap
    { kind: 'menace', model: 'hammerblock', color: 'neutral', cx: 63, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.9 } }, // FAR flank hammer block
    { kind: 'menace', model: 'hammerblock_spikes', color: 'neutral', cx: 73, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.1 } }, // FAR flank spiked hammer block
    { kind: 'menace', model: 'swiper_long', color: 'green', cx: 73, cz: 6.4, spin: { axis: 'y', speed: 3, phase: 2.0 } },                 // NEAR flank long sweep past the saw-gap
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 68, cz: 0, dy: 3.4, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 1.3 } }, // anchor hung over the B2 saw-gap middle
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 68, cz: 0, dy: 5.4 },                                                    // anchor chain holding it (static)
    { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 68, cz: -1.2, dy: -4.8 },                                                     // sea-mine deep in the B2 saw-pit (static)
    { kind: 'menace', model: 'bomb_B', color: 'blue', cx: 68, cz: 1.2, dy: -4.8 },                                                        // a second sea-mine in the pit (static)
    { kind: 'menace', model: 'spikeblock_double_horizontal', color: 'blue', cx: 61, cz: 8.0 },                                            // NEAR flank double-h spike block
    { kind: 'menace', model: 'floor_spikes_curved_4x2x2', color: 'neutral', cx: 67, cz: -7.5, ry: 90 },                                  // FAR flank curved reef spikes

    // --- Buoy F rejoin (x76..82) + M3 tide belt (x82..90): corner saws, crown, roller, pit. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'yellow', cx: 77, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },    // NEAR buoy corner double saw
    { kind: 'menace', model: 'swiper', color: 'red', cx: 81, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.4 } },                       // FAR buoy corner swiper
    { kind: 'menace', model: 'spikeblock_right', color: 'green', cx: 81, cz: 3.0, dy: 3.6 },                                              // spikeblock crown over SE corner (static)
    { kind: 'menace', model: 'hammer', color: 'red', cx: 86, cz: 6.2, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.0 } },           // NEAR flank hammer over the M3 current
    { kind: 'menace', model: 'saw_trap_long', color: 'green', cx: 86, cz: -6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.0 } },      // FAR flank long saw over the M3 current
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 86, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.5 } }, // undertow roller in the M3 pit
    { kind: 'menace', model: 'ball', color: 'red', cx: 83, cz: -1.5, dy: -4.2, spin: { axis: 'y', speed: 4, phase: 0.0 } },               // rolling buoy in the M3 pit

    // --- Buoy G split (x90..96): the shipwreck-mast landmark — big saws, swipers, crown, pit. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 91, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.2 } },           // NEAR buoy corner saw
    { kind: 'menace', model: 'swiper_double_long', color: 'green', cx: 95, cz: 6.6, spin: { axis: 'y', speed: 3, phase: 2.6 } },          // NEAR buoy corner long double swiper
    { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 91, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.3 } },   // FAR buoy corner big hammer
    { kind: 'menace', model: 'swiper_quad_long', color: 'blue', cx: 95, cz: -6.4, spin: { axis: 'y', speed: 3, phase: 0.4 } },            // FAR buoy corner long quad swiper
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 97, cz: 0, dy: 5.0 },                                              // anchor bracket over the B3 entry void
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 97, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2.2, phase: 1.6 } }, // anchor swinging across the void (x)
    { kind: 'menace', model: 'floor_spikes_trap_4x4x1', color: 'blue', cx: 93, cz: -8.0 },                                                // FAR flank big reef trap-spike field

    // --- BRANCH 3 (x99..114): the WHIRLPOOL — flank saws/rollers/hammers, hung anchors, pit mines. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 101, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },        // NEAR flank long saw beside the whirlpool
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 100, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.8 } },  // FAR flank whirlpool roller
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 110, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.3 } },    // FAR flank vertical whirlpool roller
    { kind: 'menace', model: 'hammer_large_spikes', color: 'yellow', cx: 105, cz: 6.6, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.6 } }, // NEAR flank big spiked hammer over the gap
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 105, cz: 0, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 2.6 } }, // anchor hung over the B3 whirlpool middle
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 105, cz: 3, dy: -4.0, spin: { axis: 'x', speed: 6, phase: 0.0 } }, // the WHIRLPOOL roller churning under the saw-gap (deep, decorative)
    { kind: 'menace', model: 'chain_link', color: 'neutral', cx: 105, cz: 0, dy: 5.0 },                                                   // anchor chain link above the middle (static)
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 105, cz: 0, dy: -4.6 },                                                        // sea-mine deep in the B3 middle pit (static)
    { kind: 'menace', model: 'bomb_B', color: 'green', cx: 101, cz: 8.0, dy: 0 },                                                         // NEAR flank colored mine (static)
    { kind: 'menace', model: 'spikeblock_left', color: 'red', cx: 100, cz: 8.0 },                                                         // NEAR flank sideways spike block
    { kind: 'menace', model: 'floor_spikes_2x2x1', color: 'neutral', cx: 110, cz: 8.0 },                                                  // NEAR flank reef spikes

    // --- Buoy H rejoin/split (x114..120): corner saws, crown, hung middle over the riptide hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 115, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },     // NEAR buoy corner double saw
    { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 119, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.0 } },              // FAR buoy corner quad swiper
    { kind: 'menace', model: 'hammer_large_spikes', color: 'red', cx: 115, cz: -6.4, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.0 } }, // FAR buoy corner big spiked hammer
    { kind: 'menace', model: 'spikeblock_omni', color: 'yellow', cx: 117, cz: -3.0, dy: 4.6 },                                            // omni spikeblock crown floating over the buoy (static)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 117, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.4 } }, // undertow roller in the H-buoy pit

    // --- BRANCH 4 (x123..134): the RIPTIDE RUN — flank saws/hammers, hung anchor, pit mine. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 126, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },        // NEAR flank long saw beside the final gauntlet
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 124, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.7 } },    // FAR flank vertical roller
    { kind: 'menace', model: 'hammer_spikes', color: 'green', cx: 129, cz: 6.6, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.1 } }, // NEAR flank spiked hammer over the gauntlet
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 130.5, cz: 0, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 2.0 } }, // anchor hung over the B4 middle water
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 130.5, cz: 0, dy: 5.4 },                                                 // anchor chain above it (static)
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 130.5, cz: 0, dy: -4.6 },                                                      // sea-mine deep in the B4 middle pit (static)
    { kind: 'menace', model: 'spikeblock_double_vertical', color: 'red', cx: 123, cz: 8.0 },                                              // NEAR flank double-v spike block

    // --- Buoy J launch (x134..140) + lighthouse finish (x141..147): the finale crescendo. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 135, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },     // NEAR flank double saw by the springs
    { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 139, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.0 } },              // FAR flank quad swiper by the springs
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 144, cz: -6.0, top: 10, dy: 1.0 },                                 // FAR flank hanger at the lighthouse (static bracket)
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 144, cz: -6.0, top: 10, dy: -0.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.8 } }, // hanging buoy at the lighthouse
    { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 144, cz: 6.6, top: 10, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.5 } },// NEAR flank sweep into the lighthouse
    { kind: 'menace', model: 'ball', color: 'yellow', cx: 142, cz: 6.6, top: 10, dy: 0.5, spin: { axis: 'y', speed: 5, phase: 1.7 } },    // NEAR flank trophy buoy at the lighthouse
    { kind: 'menace', model: 'cannon_base', color: 'red', cx: 142, cz: -6.4, top: 10, ry: -90 },                                          // FAR flank signal cannon at the lighthouse (static)
    { kind: 'menace', model: 'cannon_bullet', color: 'neutral', cx: 141, cz: -5.8, top: 10, dy: 0.6 },                                    // its shot (static)
    { kind: 'menace', model: 'chain_link_end_top', color: 'neutral', cx: 137, cz: 0, dy: -3.0 },                                          // mooring chain cap dangling into the J pit edge (static)
  ],

  // One spring PER LANE on launch buoy J -> the lighthouse tower (top 5 -> top 10; spring
  // rise ~4.9u, forward arc ~4u onto the tower whose near edge is x141). Whichever lane you
  // arrive in (z -3 / +3) or the center, a spring lifts you up the finale lighthouse.
  springs: [
    { cx: 137, cz: -3 },   // SAFE-lane spring
    { cx: 137, cz: 3 },    // RISKY-lane spring
    { cx: 137, cz: 0 },    // center (buoy-walked) spring
  ],

  // Reward differentiates the lanes: each RISKY (near, z=+3) lane pays ~3x its SAFE (far,
  // z=-3) sibling, and the reward IS the risk — an arc coin sits ON the jump over each
  // gauntlet / saw-gap, exactly where the danger is. Buoy-hubs (z=0) and the lighthouse
  // hold the rest.
  coins: [
    { x: 3, y: 6.4, z: 0 },     // A spawn dock

    // SPLIT 1 (reef gauntlet)  — safe 1 / risky 3
    { x: 29, y: 6.4, z: -3 },   // safe plank (clear)
    { x: 24, y: 6.4, z: 3 },    // risky entry
    { x: 29, y: 7.0, z: 3 },    // risky: arc over the coral gauntlet   (reward)
    { x: 35, y: 6.4, z: 3 },    // risky landing                        (reward)

    { x: 41, y: 6.4, z: 0 },    // C rejoin buoy
    { x: 48, y: 6.4, z: 0 },    // M2 tide belt

    // SPLIT 2 (tide gap)  — safe 1 / risky 3
    { x: 63, y: 6.4, z: -3 },   // safe plank (before the comfy 3u gap)
    { x: 63, y: 6.4, z: 3 },    // risky entry
    { x: 68, y: 7.0, z: 3 },    // risky: arc over the 4u anchor-saw gap (reward)
    { x: 73, y: 6.4, z: 3 },    // risky landing                        (reward)

    { x: 79, y: 6.4, z: 0 },    // F rejoin buoy
    { x: 86, y: 6.4, z: 0 },    // M3 tide belt

    // SPLIT 3 (whirlpool)  — safe 1 / risky 3
    { x: 106, y: 6.4, z: -3 },  // safe plank (clear)
    { x: 101, y: 6.4, z: 3 },   // risky entry
    { x: 105, y: 7.0, z: 3 },   // risky: arc over the whirlpool saw-gap (reward)
    { x: 111, y: 6.4, z: 3 },   // risky landing                        (reward)

    { x: 117, y: 6.4, z: 0 },   // H rejoin / final-split buoy

    // SPLIT 4 (riptide run)  — safe 1 / risky 3
    { x: 129, y: 6.4, z: -3 },  // safe plank (clear)
    { x: 124, y: 6.4, z: 3 },   // risky entry
    { x: 129, y: 7.0, z: 3 },   // risky: arc over the final coral gauntlet (reward)
    { x: 132.5, y: 6.4, z: 3 }, // risky landing (the slingshot)         (reward)

    { x: 137, y: 6.4, z: 0 },   // J launch buoy — "land ho!" coin before the climb
    { x: 144, y: 11.4, z: 0 },  // atop the lighthouse tower
  ],

  decor: [
    { kind: 'arrow', cx: 5, cz: 0 },          // cast off, into the first split
    { kind: 'arrow', cx: 16.5, cz: -3 },      // signpost the SAFE lane at buoy B
    { kind: 'pipeArch', cx: 41, color: 'green' }, // teal coral arch framing rejoin 1
    { kind: 'portal', cx: 41, cz: 0 },        // green portal at rejoin 1
    { kind: 'gantry', cx: 67 },               // shipwreck truss over the tide-gap stretch
    { kind: 'portal', cx: 79, cz: 0, color: 'red' }, // coral portal at rejoin 2
    { kind: 'gantry', cx: 93 },               // shipwreck mast landmark at the whirlpool split
    { kind: 'arrow', cx: 117.5, cz: -3 },     // signpost the SAFE lane at the final split
    { kind: 'pipeArch', cx: 137, color: 'red' },  // coral arch framing the launch buoy
    { kind: 'arrow', cx: 137.5, cz: 0 },      // point at the spring -> lighthouse tower
  ],
};
