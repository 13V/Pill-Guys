// Level 9 — "Gauntlet Gulch" (relentless spike gauntlets & jump-gaps, ~126u).
//
// A rugged desert canyon run built as a CHAOTIC Fall-Guys multi-route course: FOUR
// branch splits, each a SAFE lane (far, z=-3, cool blue/green) vs a harder RISKY
// lane (near, z=+3, warm red/yellow), forking off a w6 hub and rejoining at the
// next w6 hub. The middle (z -2..+2) of every branch is intentionally EMPTY so you
// must COMMIT to a side; BOTH lanes independently reach the finish (verified, 0
// deaths each). See ../../MULTI_ROUTE_DESIGN.md, level5/ (the gold template) and
// level1.js (this flat single-file descriptor format).
//
// GAUNTLET GULCH IDENTITY — the gameplay is a relentless RHYTHM of GAUNTLETS + GAPS.
// The ONLY lethal hazards on a walked lane are (a) size-4 spike GAUNTLETS sitting ON
// a continuous strip (deck solid below; >=4u clear runway before the spike box +
// >=3u clear landing after — you JUMP them) and (b) jump-GAPS between lane decks
// (2-5u; you JUMP them; some hold a lethal sawblade spinning IN the pit you clear):
//   Branch 1 (x20..38)  : SAFE two gentle 3u gaps | RISKY a belt-fed size-4 gauntlet
//                          (cx29, runway x23..27, land x31..38). 3x the coins.
//   Branch 2 (x58..76)  : "TWO HARD WAYS" — SAFE a comfy 3u gap (x66..69) | RISKY a
//                          bigger 4u gap (x66..70) with a sawblade spinning IN the
//                          pit on the z=3 line, so you jump OVER the saw.
//   Branch 3 (x90..114) : the HARDEST line — SAFE clear strip w/ two 3u gaps | RISKY
//                          stacks a belt-fed size-4 gauntlet (cx99) AND THEN a 4u
//                          saw-gap (x107..111, saw in the pit) before landing on hub H.
//   Branch 4 (x114..126): final sprint — SAFE a clear walk | RISKY a belt-fed size-4
//                          gauntlet (cx121) right up to the spring deck. Top payout.
// Both lanes rejoin at spring deck J (x119..125); a per-lane spring launches you up
// the gold victory tower (top 5 -> top 10).
//
// RISKY SHORTCUT (the time-save, see level2 / MULTI_ROUTE_DESIGN.md): in this
// constant-run game a time-save can only come from SPEED, so every RISKY (near,
// z=+3) lane is BOOSTED by FORWARD CONVEYORS `conveyor {cz:3, w:4}` (span z1..5 — they
// NEVER touch the z=-3 SAFE lane). The belt pushes +X (CONVEYOR_SPEED on top of the
// base) so the risky runner moves ~12 u/s vs SAFE's 8 — a real Fall-Guys shortcut.
// Belts sit on the run-up + landing of every risky gauntlet/gap and across the NEAR
// half (cz3, w4 -> z1..5) of about half the hubs, boosting the risky lane ONLY; the
// belts are always BEFORE/AFTER each lethal spike box & on each jump's run-up, NEVER
// over the spike cells (you still jump every gauntlet/saw-gap). Risky pays ~3x coins.
//
// CHAOS DECOR — the full hazard roster is scattered as DECORATIVE animated `menace`
// (+ decorative sawblade/cone) with NO lethal flag, so it carries NO death sensor and
// CANNOT block a lane (autoplay walks past it, intended). Packed on the FAR flank
// (z<=-5.5), NEAR flank (z>=+5.5), ABOVE the empty branch middles (high dy, clears the
// jump arc), on hub CORNERS, and DOWN in the PITS below the gaps (negative dy). Phases
// vary heavily so the whole gulch saws, sweeps, hammers and swings at once.
//
// Forward = +X. Lanes read at z=-3 (far) / z=+3 (near); camera is behind (+Z) above.
// Limits (LEVELS_DESIGN.md): jump reach ~5u, gaps <=5u (RISKY maxes at 4u), step-ups
// <=3u, gauntlet size 4 with >=4u runway + >=3u landing, widths >=2. Hubs w6 (z-3..+3).
export default {
  name: 'Gauntlet Gulch',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    // ---- SHARED SPINE START ----
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'green' },   // A start hub        x:0..6   — cool-green canyon trailhead
    { kind: 'conveyor', cx: 10, cz: 0, len: 8, w: 6, color: 'blue' },              // M1 belt (+X), w6 both lanes  x:6..14  — COOL blue shared breather

    // ===== BRANCH 1 (x20..38): belt-fed gauntlet split. 3u hop off hub B. =====
    { kind: 'platform', cx: 17, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' }, // B split hub        x:14..20  — bright decision point
    { kind: 'conveyor', cx: 17, cz: 3, len: 6, w: 4, color: 'red' },               // B hub NEAR boost   x:14..20  (cz3 -> z1..5: risky-only +X; SAFE z-3 untouched) — WARM red boost
    { kind: 'strip', x0: 23, x1: 30, z: -3, w: 2, color: 'blue' },                 // B1 SAFE seg1 (far) x:23..30  — COOL blue = SAFE lane
    { kind: 'strip', x0: 33, x1: 38, z: -3, w: 2, color: 'blue' },                 // B1 SAFE seg2 (far) x:33..38  (after a gentle 3u gap x30..33) — COOL blue = SAFE lane
    { kind: 'strip', x0: 23, x1: 38, z:  3, w: 2, color: 'red' },                  // B1 RISKY (near)    x:23..38  CONTINUOUS, gauntlet cx29 on top (runway x23..27, land x31..38) — WARM red = RISKY lane
    { kind: 'conveyor', cx: 25, cz: 3, len: 4, w: 4, color: 'yellow' },            // B1 RISKY run-up belt  x:23..27  (+X ~12u/s into the gauntlet leap; ends before spikes x27..31) — WARM boost
    { kind: 'conveyor', cx: 35, cz: 3, len: 4, w: 4, color: 'yellow' },            // B1 RISKY landing belt x:33..37  (+X ~12u/s after the gauntlet -> hub C) — WARM boost

    { kind: 'platform', cx: 41, cz: 0, w: 6, d: 6, rails: true, color: 'green' },  // C rejoin hub       x:38..44  — cool-green rejoin breather
    { kind: 'conveyor', cx: 48, cz: 0, len: 8, w: 6, color: 'blue' },              // M2 belt (+X), w6 both lanes  x:44..52  — COOL blue shared breather

    // ===== BRANCH 2 (x58..76): TWO HARD WAYS — SAFE 3u gap | RISKY 4u saw-gap. =====
    { kind: 'platform', cx: 55, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' }, // D split hub        x:52..58  — bright decision point
    { kind: 'conveyor', cx: 55, cz: 3, len: 6, w: 4, color: 'red' },               // D hub NEAR boost   x:52..58  (risky-only +X; SAFE z-3 untouched) — WARM red boost
    { kind: 'strip', x0: 61, x1: 66, z: -3, w: 2, color: 'green' },                // B2 SAFE seg1 (far) x:61..66  — COOL green = SAFE lane
    { kind: 'strip', x0: 69, x1: 76, z: -3, w: 2, color: 'green' },                // B2 SAFE seg2 (far) x:69..76  (after a comfy 3u gap x66..69) — COOL green = SAFE lane
    { kind: 'strip', x0: 61, x1: 66, z:  3, w: 2, color: 'red' },                  // B2 RISKY seg1 (near) x:61..66 — WARM red = RISKY lane
    { kind: 'strip', x0: 70, x1: 76, z:  3, w: 2, color: 'red' },                  // B2 RISKY seg2 (near) x:70..76 (after a bigger 4u gap x66..70 over the pit saw) — WARM red = RISKY lane
    { kind: 'conveyor', cx: 63, cz: 3, len: 4, w: 4, color: 'yellow' },            // B2 RISKY run-up belt x:61..65 (+X ~12u/s across seg1 into the 4u saw-gap leap) — WARM boost
    { kind: 'conveyor', cx: 74, cz: 3, len: 4, w: 4, color: 'yellow' },            // B2 RISKY landing belt x:72..76 (+X ~12u/s off the saw-gap landing -> hub F) — WARM boost

    { kind: 'platform', cx: 76, cz: 0, w: 6, d: 6, rails: true, color: 'red' },    // F rejoin hub       x:73..79  — hot-red rejoin
    { kind: 'conveyor', cx: 83, cz: 0, len: 8, w: 6, color: 'blue' },              // M3 belt (+X), w6 both lanes  x:79..87  — COOL blue shared breather

    // ===== BRANCH 3 (x90..114): gauntlet THEN saw-gap (HARDEST line). =====
    { kind: 'platform', cx: 90, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' }, // G split hub        x:87..93  — bright final-stretch decision point
    { kind: 'conveyor', cx: 90, cz: 3, len: 6, w: 4, color: 'red' },               // G hub NEAR boost   x:87..93  (risky-only +X; SAFE z-3 untouched) — WARM red boost
    { kind: 'strip', x0: 96, x1: 104, z: -3, w: 2, color: 'blue' },               // B3 SAFE seg1 (far) x:96..104 — COOL blue = SAFE lane
    { kind: 'strip', x0: 107, x1: 114, z: -3, w: 2, color: 'blue' },              // B3 SAFE seg2 (far) x:107..114 (after a gentle 3u gap x104..107, walks onto hub H) — COOL blue = SAFE lane
    { kind: 'strip', x0: 93, x1: 107, z:  3, w: 2, color: 'red' },                // B3 RISKY (near)    x:93..107 CONTINUOUS off hub G, gauntlet cx99 on top (runway x93..97, land x101..107) — WARM red = RISKY lane
    { kind: 'conveyor', cx: 97, cz: 3, len: 4, w: 4, color: 'yellow' },           // B3 RISKY run-up belt  x:95..99  (+X ~12u/s into the gauntlet leap; ends before spikes x97..101) — WARM boost
    { kind: 'conveyor', cx: 105, cz: 3, len: 4, w: 4, color: 'yellow' },          // B3 RISKY landing belt x:103..107 (+X ~12u/s after the gauntlet, run-up into the trailing 4u saw-gap x107..111 -> hub H) — WARM boost

    { kind: 'platform', cx: 114, cz: 0, w: 6, d: 6, rails: true, color: 'green' }, // H rejoin hub       x:111..117 (RISKY jumps the 4u saw-gap x107..111 onto it) — cool-green rejoin / final split
    { kind: 'conveyor', cx: 114, cz: 3, len: 6, w: 4, color: 'red' },              // H hub NEAR boost   x:111..117 (risky-only +X off the gap landing; SAFE z-3 untouched) — WARM red boost

    // ===== BRANCH 4 (x117..126): final belt-fed gauntlet sprint (top payout). =====
    { kind: 'strip', x0: 117, x1: 125, z: -3, w: 2, color: 'green' },             // B4 SAFE (far)      x:117..125 clear walk onto spring deck J — COOL green = SAFE lane
    { kind: 'strip', x0: 117, x1: 127, z:  3, w: 2, color: 'red' },               // B4 RISKY (near)    x:117..127 CONTINUOUS off hub H, gauntlet cx121 on top (runway x117..119+hub, land x123..127) — WARM red = RISKY lane
    { kind: 'conveyor', cx: 119, cz: 3, len: 4, w: 4, color: 'yellow' },          // B4 RISKY run-up belt  x:117..121 (+X ~12u/s into the final gauntlet leap; ends before spikes x119..123) — WARM boost
    { kind: 'conveyor', cx: 125, cz: 3, len: 2, w: 4, color: 'yellow' },          // B4 RISKY landing belt x:124..126 (+X ~12u/s off the gauntlet onto the spring deck) — WARM boost

    { kind: 'platform', cx: 122, cz: 0, w: 6, d: 6, color: 'green' },              // J spring deck      x:119..125 (rejoin; per-lane springs -> tower) — cool-green launch pad
    { kind: 'finish', cx: 126, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },      // finish tower (w6 so every lane lands)  x:123..129 — celebratory gold victory tower
  ],

  hazards: [
    // =========================================================================
    // GAMEPLAY HAZARDS — the ONLY lethal ones on a walked lane. Each is a size-4
    // spike gauntlet sitting ON a continuous RISKY strip (deck solid below; >=4u
    // runway + >=3u landing) OR a sawblade spinning IN a jump-gap pit (the GAP is
    // the threat; the saw just dresses it). SAFE lanes & hubs stay always passable.
    // =========================================================================
    { kind: 'spikes', cx: 29, cz: 3, size: 4 },                       // B1 gauntlet (runway x23..27, land x31..38) — LETHAL on-line, JUMP it
    { kind: 'sawblade', cx: 68, cz: 3, lethal: true },                // B2: saw spinning IN the 4u gap pit (x66..70) on the z=3 line — the GAP is the threat
    { kind: 'spikes', cx: 99, cz: 3, size: 4 },                       // B3 gauntlet (runway x93..97, land x101..107) — LETHAL on-line, JUMP it
    { kind: 'sawblade', cx: 109, cz: 3, lethal: true },               // B3: saw spinning IN the trailing 4u gap pit (x107..111) — the GAP is the threat
    { kind: 'spikes', cx: 121, cz: 3, size: 4 },                      // B4 gauntlet (runway x117..119+hub, land x123..127) — LETHAL on-line, JUMP it

    // Warning cones (decorative): flag each RISKY lane's on-the-line hazards.
    { kind: 'cone', cx: 26.5, cz: 3 }, { kind: 'cone', cx: 31.5, cz: 3 },  // B1 gauntlet edges
    { kind: 'cone', cx: 65.5, cz: 3 }, { kind: 'cone', cx: 70.5, cz: 3 },  // B2 saw-gap jump edges
    { kind: 'cone', cx: 96.5, cz: 3 }, { kind: 'cone', cx: 101.5, cz: 3 }, // B3 gauntlet edges
    { kind: 'cone', cx: 106.5, cz: 3 }, { kind: 'cone', cx: 111.0, cz: 3 },// B3 saw-gap jump edges
    { kind: 'cone', cx: 118.5, cz: 3 }, { kind: 'cone', cx: 123.5, cz: 3 },// B4 gauntlet edges

    // =========================================================================
    // CHAOS DECOR — animated `menace`, NO lethal flag (no death box, never blocks).
    // FAR flank (z<=-5.5), NEAR flank (z>=+5.5), ABOVE empty middles (high dy), hub
    // CORNERS, and DOWN in PITS (negative dy). Phases varied so it all writhes.
    // =========================================================================

    // --- A start hub + M1 belt (x0..14): spawn buzz, flank sweeps, hung middle. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 1.5, cz: 6.0, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.0 } },          // NEAR flank spawn saw
    { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 4.0, cz: -5.8, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.3 } },        // FAR flank spawn sweep
    { kind: 'menace', model: 'cannon_base', color: 'red', cx: -1.5, cz: 0 },                                                              // cannon aimed down the spine (static)
    { kind: 'menace', model: 'cannon_bullet', color: 'neutral', cx: -0.2, cz: 0, dy: 0.4 },                                              // its in-flight bullet (static)
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 3.0, cz: -3.0, dy: 4.2 },                                          // hub corner hanger bracket (static)
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 3.0, cz: -3.0, dy: 2.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.0 } }, // spikeball swinging under it
    { kind: 'menace', model: 'swiper', color: 'green', cx: 10, cz: 6.4, spin: { axis: 'y', speed: 3, phase: 0.6 } },                      // NEAR flank sweep along the M1 belt
    { kind: 'menace', model: 'hammer', color: 'red', cx: 10, cz: -5.8, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.4 } },          // FAR flank hammer over the M1 belt
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 12, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.2 } }, // roller churning in the M1 pit

    // --- Hub B split (x14..20): corner saws/hammers + hung middle over the entry hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 15.0, cz: 6.2, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },     // NEAR hub corner double saw
    { kind: 'menace', model: 'swiper_double', color: 'green', cx: 19.0, cz: 6.4, spin: { axis: 'y', speed: 3, phase: 2.1 } },             // NEAR hub corner double swiper
    { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 15.0, cz: -5.8, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.2 } }, // FAR hub corner big hammer
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 21, cz: 0, dy: 5.0 },                                              // bracket over the B1 entry void
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 21, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2, phase: 2.6 } }, // ball swinging across the void (x)
    { kind: 'menace', model: 'floor_spikes_2x2x1', color: 'neutral', cx: 14, cz: -6.5 },                                                  // FAR flank floor spikes (B entry)

    // --- BRANCH 1 (x23..38): flank rollers/hammers/saws, hung spikeball over the gauntlet, pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 26, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },         // NEAR flank long saw beside the gauntlet
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 24, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.5 } },     // FAR flank vertical roller
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 31, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.1 } },   // FAR flank horizontal roller
    { kind: 'menace', model: 'hammer_spikes', color: 'green', cx: 29, cz: 6.6, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.4 } },  // NEAR flank spiked hammer over the gauntlet
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 31.5, cz: 0, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 1.3 } }, // hung over the B1 SAFE-gap middle
    { kind: 'menace', model: 'chain_link', color: 'neutral', cx: 31.5, cz: 0, dy: 5.0 },                                                  // chain link above it (static)
    { kind: 'menace', model: 'floor_spikes_trap_2x2x1', color: 'red', cx: 24, cz: 8.0 },                                                  // NEAR flank trap floor spikes
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 31.5, cz: 0, dy: -4.6 },                                                       // bomb deep in the B1 SAFE-gap pit (static)
    { kind: 'menace', model: 'ball', color: 'blue', cx: 37, cz: 6.6, dy: 0.5, spin: { axis: 'y', speed: 5, phase: 0.3 } },                // NEAR flank rolling ball (landing)

    // --- Hub C rejoin (x38..44) + M2 belt (x44..52): corner saws + crown + pit. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 39, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.5 } },           // NEAR hub corner saw
    { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 43, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 3.0 } },               // FAR hub corner quad swiper
    { kind: 'menace', model: 'hammer_large_spikes', color: 'red', cx: 39, cz: -6.4, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.0 } }, // FAR hub corner big spiked hammer
    { kind: 'menace', model: 'spikeblock_omni', color: 'yellow', cx: 41, cz: -3.0, dy: 4.6 },                                             // omni spikeblock crown floating over the hub (static)
    { kind: 'menace', model: 'saw_trap_long', color: 'green', cx: 48, cz: -6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.0 } },      // FAR flank long saw over the M2 belt
    { kind: 'menace', model: 'hammer', color: 'red', cx: 48, cz: 6.2, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.0 } },           // NEAR flank hammer over the M2 belt
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 48, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.5 } }, // vertical roller in the M2 pit
    { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 41, cz: 0, dy: -4.6 },                                                        // bomb in the C-hub pit (static)

    // --- Hub D split (x52..58): corner saws/swipers + hung middle over the entry hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 53, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },      // NEAR hub corner double saw
    { kind: 'menace', model: 'swiper_double_long', color: 'yellow', cx: 57, cz: -6.0, ry: 90, spin: { axis: 'y', speed: 3, phase: 2.8 } },// FAR hub corner long double swiper
    { kind: 'menace', model: 'hammer_large', color: 'red', cx: 53, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.3 } },    // FAR hub corner big hammer
    { kind: 'menace', model: 'spikeblock_down', color: 'blue', cx: 55, cz: -3.0, dy: 4.6 },                                               // spikeblock crown floating over the hub (static)
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 59, cz: 0, dy: 5.0 },                                              // bracket over the B2 entry void
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 59, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2.2, phase: 1.6 } }, // ball swinging across the void (x)

    // --- BRANCH 2 (x61..76): the gantry stretch — long swipers, hammers, pit bombs/saw. ---
    { kind: 'menace', model: 'swiper_quad_long', color: 'red', cx: 63, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.9 } },      // NEAR flank long quad sweep
    { kind: 'menace', model: 'hammer', color: 'yellow', cx: 67, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.6 } },       // FAR flank hammer over the SAFE gap
    { kind: 'menace', model: 'hammerblock', color: 'neutral', cx: 63, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.9 } }, // FAR flank hammer block
    { kind: 'menace', model: 'hammerblock_spikes', color: 'neutral', cx: 73, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.1 } }, // FAR flank spiked hammer block
    { kind: 'menace', model: 'swiper_long', color: 'green', cx: 73, cz: 6.4, spin: { axis: 'y', speed: 3, phase: 2.0 } },                 // NEAR flank long sweep past the saw-gap
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 68, cz: 0, dy: 3.4, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 1.3 } }, // hung over the B2 saw-gap middle
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 68, cz: 0, dy: 5.4 },                                                    // chain holding the spikeball (static)
    { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 68, cz: -1.2, dy: -4.8 },                                                     // bomb deep in the B2 saw-pit (static)
    { kind: 'menace', model: 'bomb_B', color: 'blue', cx: 68, cz: 1.2, dy: -4.8 },                                                        // a second bomb in the pit (static)
    { kind: 'menace', model: 'spikeblock_double_horizontal', color: 'blue', cx: 61, cz: 8.0 },                                            // NEAR flank double-h spike block
    { kind: 'menace', model: 'floor_spikes_curved_4x2x2', color: 'neutral', cx: 67, cz: -7.5, ry: 90 },                                  // FAR flank curved floor spikes

    // --- Hub F rejoin (x73..79) + M3 belt (x79..87): corner saws, crown, roller, pit. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'yellow', cx: 74, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },    // NEAR hub corner double saw
    { kind: 'menace', model: 'swiper', color: 'red', cx: 78, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.4 } },                       // FAR hub corner swiper
    { kind: 'menace', model: 'spikeblock_right', color: 'green', cx: 78, cz: 3.0, dy: 3.6 },                                              // spikeblock crown over SE corner (static)
    { kind: 'menace', model: 'hammer', color: 'red', cx: 83, cz: 6.2, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.0 } },           // NEAR flank hammer over the M3 belt
    { kind: 'menace', model: 'saw_trap_long', color: 'green', cx: 83, cz: -6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.0 } },      // FAR flank long saw over the M3 belt
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 83, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.5 } }, // roller in the M3 pit
    { kind: 'menace', model: 'ball', color: 'red', cx: 80, cz: -1.5, dy: -4.2, spin: { axis: 'y', speed: 4, phase: 0.0 } },               // rolling ball in the M3 pit

    // --- Hub G split (x87..93): the truss landmark — big saws, swipers, crown, pit. ---
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 88, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.2 } },           // NEAR hub corner saw
    { kind: 'menace', model: 'swiper_double_long', color: 'green', cx: 92, cz: 6.6, spin: { axis: 'y', speed: 3, phase: 2.6 } },          // NEAR hub corner long double swiper
    { kind: 'menace', model: 'hammer_large', color: 'blue', cx: 88, cz: -6.0, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.3 } },   // FAR hub corner big hammer
    { kind: 'menace', model: 'swiper_quad_long', color: 'blue', cx: 92, cz: -6.4, spin: { axis: 'y', speed: 3, phase: 0.4 } },            // FAR hub corner long quad swiper
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 93, cz: 0, dy: 5.0 },                                              // bracket over the B3 entry void
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 93, cz: 0, dy: 3.4, swing: { axis: 'x', amp: 0.8, speed: 2.2, phase: 1.6 } }, // ball swinging across the void (x)
    { kind: 'menace', model: 'floor_spikes_trap_4x4x1', color: 'blue', cx: 90, cz: -8.0 },                                                // FAR flank big trap-spike field

    // --- BRANCH 3 (x93..114): the HARDEST line — flank saws/rollers/hammers, hung balls, pits. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 96, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.7 } },         // NEAR flank long saw beside the gauntlet
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 94, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 0.8 } },   // FAR flank horizontal roller
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 105, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 2.3 } },    // FAR flank vertical roller (saw-gap run-in)
    { kind: 'menace', model: 'hammer_large_spikes', color: 'yellow', cx: 99, cz: 6.6, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.6 } }, // NEAR flank big spiked hammer over the gauntlet
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 99, cz: 0, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 2.6 } }, // hung over the B3 gauntlet void
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 109, cz: 0, dy: 3.4, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.9 } }, // hung over the B3 saw-gap void
    { kind: 'menace', model: 'chain_link', color: 'neutral', cx: 109, cz: 0, dy: 5.0 },                                                   // chain link above it (static)
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 109, cz: 3, dy: -4.6 },                                                        // bomb deep in the B3 saw-gap pit (static)
    { kind: 'menace', model: 'bomb_B', color: 'green', cx: 99, cz: 8.0, dy: 0 },                                                          // NEAR flank colored bomb (static)
    { kind: 'menace', model: 'spikeblock_left', color: 'red', cx: 94, cz: 8.0 },                                                          // NEAR flank sideways spike block
    { kind: 'menace', model: 'floor_spikes_2x2x1', color: 'neutral', cx: 105, cz: 8.0 },                                                  // NEAR flank floor spikes

    // --- Hub H rejoin/split (x111..117): corner saws, crown, hung middle over the B4 hop. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 112, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },     // NEAR hub corner double saw
    { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 116, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.0 } },              // FAR hub corner quad swiper
    { kind: 'menace', model: 'hammer_large_spikes', color: 'red', cx: 112, cz: -6.4, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 2.0 } }, // FAR hub corner big spiked hammer
    { kind: 'menace', model: 'spikeblock_omni', color: 'yellow', cx: 114, cz: -3.0, dy: 4.6 },                                            // omni spikeblock crown floating over the hub (static)
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 114, cz: 0, dy: -3.6, spin: { axis: 'x', speed: 4, phase: 0.4 } }, // roller in the H-hub pit

    // --- BRANCH 4 (x117..126): the final gauntlet sprint — flank saws/hammers, hung ball, pit. ---
    { kind: 'menace', model: 'saw_trap_long', color: 'red', cx: 121, cz: 6.6, ry: 90, spin: { axis: 'y', speed: 7, phase: 0.5 } },        // NEAR flank long saw beside the final gauntlet
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 118, cz: -6.0, spin: { axis: 'x', speed: 4, phase: 1.7 } },    // FAR flank vertical roller
    { kind: 'menace', model: 'hammer_spikes', color: 'green', cx: 121, cz: 6.6, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.1 } }, // NEAR flank spiked hammer over the gauntlet
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 120, cz: 0, dy: 3.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 2.0 } }, // hung over the B4 middle
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 120, cz: 0, dy: 5.4 },                                                   // chain above it (static)
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 120, cz: 0, dy: -4.6 },                                                        // bomb deep in the B4 middle pit (static)
    { kind: 'menace', model: 'spikeblock_double_vertical', color: 'red', cx: 117, cz: 8.0 },                                              // NEAR flank double-v spike block

    // --- Hub J spring deck (x119..125) + finish tower (x123..129): the finale crescendo. ---
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 120, cz: 6.4, ry: 90, spin: { axis: 'y', speed: 7, phase: 1.4 } },     // NEAR flank double saw by the springs
    { kind: 'menace', model: 'swiper_quad', color: 'yellow', cx: 124, cz: -6.0, spin: { axis: 'y', speed: 3, phase: 1.0 } },              // FAR flank quad swiper by the springs
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 126, cz: -6.0, top: 10, dy: 1.0 },                                 // FAR flank hanger at the finish tower (static bracket)
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 126, cz: -6.0, top: 10, dy: -0.6, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.8 } }, // hanging spikeball at the finish
    { kind: 'menace', model: 'swiper_long', color: 'blue', cx: 126, cz: 6.6, top: 10, ry: 90, spin: { axis: 'y', speed: 3, phase: 0.5 } },// NEAR flank sweep into the finish
    { kind: 'menace', model: 'ball', color: 'yellow', cx: 124, cz: 6.6, top: 10, dy: 0.5, spin: { axis: 'y', speed: 5, phase: 1.7 } },    // NEAR flank trophy ball at the finish
    { kind: 'menace', model: 'cannon_base', color: 'red', cx: 124, cz: -6.4, top: 10, ry: -90 },                                          // FAR flank cannon at the finish (static)
    { kind: 'menace', model: 'cannon_bullet', color: 'neutral', cx: 123, cz: -5.8, top: 10, dy: 0.6 },                                    // its bullet (static)
    { kind: 'menace', model: 'chain_link_end_top', color: 'neutral', cx: 122, cz: 0, dy: -3.0 },                                          // chain top cap dangling into the J pit edge (static)
  ],

  // One spring PER LANE on spring deck J -> the victory tower (top 5 -> top 10; spring
  // rise ~4.9u, forward arc ~4u onto the tower whose near edge is x123). Whichever lane
  // you arrive in (z -3 / +3) or the center, a spring lifts you up the finale tower.
  springs: [
    { cx: 122, cz: -3 },   // SAFE-lane spring
    { cx: 122, cz: 3 },    // RISKY-lane spring
    { cx: 122, cz: 0 },    // center (hub-walked) spring
  ],

  // Reward differentiates the lanes: each RISKY (near, z=+3) lane pays ~3x its SAFE
  // (far, z=-3) sibling, and the reward IS the risk — an arc coin sits ON the jump
  // over each gauntlet / gap, exactly where the danger is. Hubs (z=0) and the tower
  // hold the rest.
  coins: [
    { x: 3, y: 6.4, z: 0 },     // A spawn hub

    // Branch 1 (belt-fed gauntlet)  — safe 1 / risky 3
    { x: 29, y: 6.4, z: -3 },   // safe lane (clear)
    { x: 24, y: 6.4, z: 3 },    // risky entry
    { x: 29, y: 7.0, z: 3 },    // risky: arc over the gauntlet   (reward)
    { x: 35, y: 6.4, z: 3 },    // risky landing                  (reward)

    { x: 41, y: 6.4, z: 0 },    // C rejoin hub
    { x: 48, y: 6.4, z: 0 },    // M2 belt

    // Branch 2 (two hard ways)  — safe 1 / risky 3
    { x: 63, y: 6.4, z: -3 },   // safe w2 bridge (before the comfy 3u gap)
    { x: 63, y: 6.4, z: 3 },    // risky entry
    { x: 68, y: 7.0, z: 3 },    // risky: arc over the 4u saw-gap (reward)
    { x: 73, y: 6.4, z: 3 },    // risky landing                  (reward)

    { x: 76, y: 6.4, z: 0 },    // F rejoin hub
    { x: 83, y: 6.4, z: 0 },    // M3 belt

    // Branch 3 (gauntlet THEN saw-gap, hardest)  — safe 1 / risky 3
    { x: 100, y: 6.4, z: -3 },  // safe lane (clear)
    { x: 95, y: 6.4, z: 3 },    // risky entry
    { x: 99, y: 7.0, z: 3 },    // risky: arc over the gauntlet   (reward)
    { x: 109, y: 7.0, z: 3 },   // risky: arc over the trailing saw-gap (reward)

    { x: 114, y: 6.4, z: 0 },   // H rejoin / final split hub

    // Branch 4 (final belt-fed gauntlet)  — safe 1 / risky 3
    { x: 121, y: 6.4, z: -3 },  // safe lane (clear)
    { x: 118, y: 6.4, z: 3 },   // risky entry
    { x: 121, y: 7.0, z: 3 },   // risky: arc over the final gauntlet (reward)
    { x: 125, y: 6.4, z: 3 },   // risky landing                  (reward)

    { x: 122, y: 6.4, z: 0 },   // J spring deck — "you made it" coin before the climb
    { x: 126, y: 11.4, z: 0 },  // atop the victory tower
  ],

  decor: [
    { kind: 'arrow', cx: 5, cz: 0 },          // go right, into the first split
    { kind: 'arrow', cx: 16.5, cz: -3 },      // signpost the SAFE lane at hub B
    { kind: 'pipeArch', cx: 41 },             // red arch framing rejoin 1
    { kind: 'portal', cx: 41, cz: 0 },        // green portal at rejoin 1
    { kind: 'gantry', cx: 67 },               // grey truss over the two-hard-ways stretch
    { kind: 'portal', cx: 76, cz: 0 },        // portal at rejoin 2
    { kind: 'gantry', cx: 90 },               // truss landmark at the hardest split
    { kind: 'arrow', cx: 114.5, cz: -3 },     // signpost the SAFE lane at the final split
    { kind: 'arrow', cx: 122.5, cz: 0 },      // point at the spring -> victory tower
  ],
};
