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
//
// CHAOS PASS: the full hazard roster is scattered as DECORATIVE animated `menace`
// set-dressing — saws spinning, swipers sweeping, spikeballs & hammers swinging,
// rollers tumbling, chains hanging, cannons/bombs as static props — placed BESIDE
// the walked lanes (z<-4 / z>+4), in the empty branch middle (above the gap), on
// hub corners, and down in the pits below the decks. None of these carry a death
// box, so they never block a lane. The RISKY belt keeps its single ON-LINE
// lethal (the original spikes gauntlet at x18) and gets a swiper sweeping just
// OVER head height as a signature near-miss. Level 1 is the intro, so this is
// the LIGHTEST chaos of the 5 — lively, not punishing. Both lanes stay
// fully beatable (verified 0 deaths). Vary swing/spin `phase` so nothing is in
// lockstep and the whole factory feels alive.
export default {
  name: 'Assembly Line',
  deckTop: 5,
  spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true, color: 'blue' },   // spawn hub (cool start)  x: 0..6
    { kind: 'conveyor', cx: 8, cz: 0, len: 8, w: 6, color: 'green' },             // spine conveyor (+X), spans both lanes  x: 4..12
    { kind: 'platform', cx: 13, cz: 0, w: 6, d: 6, rails: true, color: 'yellow' },// SPLIT hub: bright decision point  x: 10..16

    // ---- BRANCH (x15..29): the time-save split (SAFE walk vs RISKY belt). ----
    // Lanes are COLOR-CODED to the risk read: SAFE = cool blue, RISKY = warm red.
    { kind: 'strip', x0: 15, x1: 29, z: -3, w: 2, color: 'blue' },                // SAFE lane (far): clear walk, COOL = safe
    { kind: 'conveyor', cx: 21, cz: 3, len: 18, w: 4, color: 'red' },             // RISKY lane (near): FORWARD belt (+X), WARM = risky, ride ~12 u/s

    { kind: 'platform', cx: 31, cz: 0, w: 6, d: 6, rails: true, color: 'green' }, // REJOIN hub (pipe arch + springs)  x: 28..34
    { kind: 'finish', cx: 36, cz: 0, w: 6, d: 6, top: 10, color: 'yellow' },      // finish tower: celebratory gold  x: 33..39
  ],
  hazards: [
    // ===== ORIGINAL on-line / signature hazards =====
    { kind: 'spikes', cx: 18, cz: 3, size: 4 },   // the one on-line challenge: risky-lane jump-over gauntlet (x16..20), then ride the belt
    { kind: 'cone', cx: 16.5, cz: 3 },
    { kind: 'cone', cx: 19.5, cz: 3 },

    // =========================================================================
    // CHAOS DECOR — all DECORATIVE (no death box) unless flagged lethal.
    // =========================================================================

    // ---- SPAWN HUB surrounds (x0..6): greet the player with motion ----
    { kind: 'menace', model: 'saw_trap', color: 'yellow', cx: 1.5, cz: 5.5, spin: { axis: 'y', speed: 7 } },      // spinning saw, near-side corner
    { kind: 'menace', model: 'saw_trap', color: 'blue', cx: 4.5, cz: -5.5, spin: { axis: 'y', speed: 7, } },      // spinning saw, far-side corner
    { kind: 'menace', model: 'swiper', color: 'green', cx: 3, cz: 6.5, ry: 90, spin: { axis: 'y', speed: 3 } },   // sweeping swiper behind the gantry
    { kind: 'menace', model: 'cannon_base', color: 'red', cx: -1.5, cz: 0 },                                      // cannon aimed down the spine (static)
    { kind: 'menace', model: 'cannon_bullet', color: 'neutral', cx: -0.2, cz: 0, dy: 0.4 },                       // its in-flight bullet
    { kind: 'menace', model: 'ball', color: 'blue', cx: 0.5, cz: -5.5, spin: { axis: 'y', speed: 5 }, phase: 0.5 }, // rolling ball off the corner

    // ---- SPINE / GANTRY flanks (x4..12, z beyond ±5) ----
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 8, cz: 6, dy: 1.5, spin: { axis: 'x', speed: 4 } }, // roller beside the belt (near)
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 6, cz: -6, dy: 0.5, spin: { axis: 'y', speed: 4 } },  // vertical roller (far)
    { kind: 'menace', model: 'swiper_long', color: 'red', cx: 10, cz: -6, ry: 90, spin: { axis: 'y', speed: 3, } },              // long swiper sweeping (far)
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 11, cz: 6, dy: 0.2 },                                 // loose bomb prop (near)

    // ---- SPLIT HUB corners (x10..16): announce the fork with menace ----
    { kind: 'menace', model: 'saw_trap_double', color: 'red', cx: 13, cz: 5.5, spin: { axis: 'y', speed: 7 } },  // double saw, near corner
    { kind: 'menace', model: 'saw_trap_double', color: 'blue', cx: 13, cz: -5.5, spin: { axis: 'y', speed: 7 } },// double saw, far corner
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 11, cz: 5.5, dy: 4.5 },                   // hanger arm overhead (near)
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 11, cz: 5.5, dy: 2.0, swing: { axis: 'z', amp: 0.7, speed: 2, phase: 0.3 } }, // its swinging spikeball
    { kind: 'menace', model: 'hammer', color: 'green', cx: 15, cz: -5.5, dy: 1.5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 1.1 } },   // swinging hammer (far)

    // ---- EMPTY BRANCH MIDDLE (z -1.5..+1.5, x16..28): chains/spikeballs HANG
    //      above the no-go gap between the two lanes (well clear of both lanes) ----
    { kind: 'menace', model: 'chain_link_end_top', color: 'neutral', cx: 17, cz: 0, dy: 7.0 },                   // chain top anchor
    { kind: 'menace', model: 'chain_full', color: 'neutral', cx: 17, cz: 0, dy: 4.0 },                           // chain body
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 17, cz: 0, dy: 2.2, swing: { axis: 'x', amp: 0.6, speed: 2.2, phase: 0.0 } }, // spikeball on the chain
    { kind: 'menace', model: 'chain_link', color: 'neutral', cx: 22, cz: 0, dy: 6.2 },                           // mid-gap chain link
    { kind: 'menace', model: 'chain_link_end_bottom', color: 'neutral', cx: 22, cz: 0, dy: 4.4 },                // chain bottom cap
    { kind: 'menace', model: 'bomb_A', color: 'yellow', cx: 22, cz: 0, dy: 3.0, swing: { axis: 'z', amp: 0.4, speed: 1.4, phase: 2.0 } },     // bomb dangling mid-gap
    { kind: 'menace', model: 'bomb_B', color: 'blue', cx: 26, cz: 0, dy: 2.6 },                                  // bomb prop above the gap
    { kind: 'menace', model: 'hammerblock', color: 'neutral', cx: 25, cz: 0, dy: 5.2, swing: { axis: 'z', amp: 0.5, speed: 1.5, phase: 0.7 } }, // hammerblock overhead

    // ---- SAFE LANE far flank (z -6..-7, x16..28): set-dressing alongside the walk ----
    { kind: 'menace', model: 'swiper_double', color: 'green', cx: 18, cz: -6.5, ry: 90, spin: { axis: 'y', speed: 3, } },        // double swiper sweeping
    { kind: 'menace', model: 'saw_trap_long', color: 'yellow', cx: 22, cz: -6.5, spin: { axis: 'y', speed: 7 } },                // long saw spinning
    { kind: 'menace', model: 'hammer_large', color: 'red', cx: 25, cz: -6.5, dy: 1.5, swing: { axis: 'z', amp: 0.9, speed: 1.4, phase: 0.4 } }, // big swinging hammer
    { kind: 'menace', model: 'spikeblock_left', color: 'blue', cx: 28, cz: -6, },                                // spikeblock prop

    // ---- RISKY LANE near flank (z +6..+7, x16..30): busiest side, matches the thrill ----
    { kind: 'menace', model: 'swiper_quad', color: 'red', cx: 17, cz: 6.5, spin: { axis: 'y', speed: 3 } },      // quad swiper spinning
    { kind: 'menace', model: 'hammer_spikes', color: 'yellow', cx: 21, cz: 6.5, dy: 1.5, swing: { axis: 'z', amp: 0.9, speed: 1.7, phase: 1.4 } }, // spiked hammer swinging
    { kind: 'menace', model: 'saw_trap', color: 'green', cx: 24, cz: 6.5, spin: { axis: 'y', speed: 7, } },      // saw spinning
    { kind: 'menace', model: 'spikeball_hanger', color: 'neutral', cx: 27, cz: 6.5, dy: 4.5 },                   // hanger arm
    { kind: 'menace', model: 'spikeball', color: 'neutral', cx: 27, cz: 6.5, dy: 2.0, swing: { axis: 'z', amp: 0.7, speed: 2.1, phase: 2.5 } }, // swinging spikeball
    { kind: 'menace', model: 'hammerblock_spikes', color: 'neutral', cx: 30, cz: 6, dy: 4.0, swing: { axis: 'z', amp: 0.5, speed: 1.5, phase: 1.9 } }, // spiked hammerblock

    // ---- Signature near-miss on the RISKY belt: a swiper sweeping just OVER the
    //      lane (dy raised above head height) — a thrilling buzz as you ride past,
    //      but NOT a death box (the lane's one true lethal stays the spikes
    //      gauntlet at x18, which both lanes already route around). Keeps the
    //      intro lightest-chaos AND both lanes at 0 deaths. ----
    { kind: 'menace', model: 'swiper', color: 'yellow', cx: 27, cz: 3, dy: 1.7, ry: 90, spin: { axis: 'y', speed: 3 } },

    // ---- REJOIN HUB corners (x28..34): keep the original saw, add more ----
    { kind: 'sawblade', cx: 31, cz: 4.5 },        // (original) decorative menace beside the rejoin hub
    { kind: 'menace', model: 'saw_trap_long', color: 'blue', cx: 31, cz: -5.5, spin: { axis: 'y', speed: 7 } },  // long saw, far corner
    { kind: 'menace', model: 'swiper_double_long', color: 'green', cx: 34, cz: 5.5, ry: 90, spin: { axis: 'y', speed: 3, } }, // long double swiper (near)
    { kind: 'menace', model: 'hammer_large_spikes', color: 'red', cx: 28.5, cz: 5.5, dy: 1.5, swing: { axis: 'z', amp: 0.9, speed: 1.6, phase: 0.9 } }, // big spiked hammer

    // ---- FINISH approach flank (x33..39, beyond the tower) ----
    { kind: 'menace', model: 'saw_trap_double', color: 'yellow', cx: 36, cz: -6, spin: { axis: 'y', speed: 7, } },// celebratory saws far side
    { kind: 'menace', model: 'ball', color: 'green', cx: 39, cz: 5, dy: 0.5, spin: { axis: 'y', speed: 6 }, phase: 1.0 }, // rolling ball near the finish
    { kind: 'menace', model: 'cannon_base', color: 'blue', cx: 39, cz: -5 },                                     // confetti cannon flanking the finish

    // =========================================================================
    // PITS BELOW (top negative) — the floor of the factory, seen between/around
    // the decks. Floor-spike beds, fallen rollers, loose ordnance. Pure dressing.
    // =========================================================================
    { kind: 'menace', model: 'floor_spikes_2x2x1', color: 'neutral', cx: 8, cz: 0, top: -3 },                    // spike bed under the spine
    { kind: 'menace', model: 'floor_spikes_curved_4x2x2', color: 'neutral', cx: 20, cz: 0, top: -3.5 },          // curved spike bed under the gap
    { kind: 'menace', model: 'floor_spikes_trap_2x2x1', color: 'red', cx: 13, cz: 0, top: -3 },                  // trap-spike bed under split hub
    { kind: 'menace', model: 'floor_spikes_trap_4x4x1', color: 'yellow', cx: 31, cz: 0, top: -3.5 },             // big trap-spike bed under rejoin hub
    { kind: 'menace', model: 'spikeroller_horizontal', color: 'neutral', cx: 24, cz: -3, top: -2.5, spin: { axis: 'x', speed: 5 } }, // roller tumbling in the pit
    { kind: 'menace', model: 'spikeroller_vertical', color: 'neutral', cx: 16, cz: 3, top: -2.5, spin: { axis: 'y', speed: 5 } },    // vertical roller in the pit
    { kind: 'menace', model: 'bomb', color: 'neutral', cx: 18, cz: -2, top: -3 },                                // bomb resting in the pit
    { kind: 'menace', model: 'spikeblock_omni', color: 'green', cx: 28, cz: 2, top: -3 },                        // omni spikeblock in the pit
    { kind: 'menace', model: 'spikeblock_quad', color: 'yellow', cx: 26, cz: -2, top: -3 },                      // quad spikeblock in the pit
    { kind: 'menace', model: 'ball', color: 'red', cx: 34, cz: 0, top: -3, spin: { axis: 'x', speed: 4 } },      // ball rolling in the pit
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
