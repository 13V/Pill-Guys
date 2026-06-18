// Decorative prop scatter for the deck (purely visual — no physics, no colliders).
//
// Densely dresses the side strips, edges and corners of the deck with KayKit
// props so the scene reads like the KayKit promo renders, while keeping the
// center walking lane (|x| < 2.3) clear of anything tall. Everything is added
// straight to `scene`; nothing here ever creates a collider.
//
// deck = { x0, x1, z0, z1, top } — solid table, walking surface at y = top.
import * as THREE from 'three';
import { getSize, fitUniform, fitBox, placeBase } from './Assets.js';

// --- tiny deterministic RNG (mulberry32) -----------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Keep the runner's center lane open: nothing tall where |x| < this.
const LANE_HALF = 2.3;

export function scatter(scene, assets, deck) {
  if (!scene || !assets || !deck) return;
  const { x0, x1, z0, z1, top } = deck;
  const rng = mulberry32(0x9e3779b1); // fixed seed -> deterministic layout

  let count = 0;
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const rand = (lo, hi) => lo + rng() * (hi - lo);

  // Place a prop: fetch a fresh clone, uniform-fit, drop its base at y, center
  // XZ at (x,z), apply a yaw, add to the scene. Skips silently if model is null.
  const add = (color, name, x, z, { uniform = 1.4, y = top, rotY = null } = {}) => {
    const m = assets.get(color, name);
    if (!m) return null;
    fitUniform(m, uniform);
    m.rotation.y = rotY == null ? rand(0, Math.PI * 2) : rotY;
    placeBase(m, x, y, z);
    scene.add(m);
    count += 1;
    return m;
  };

  // Yaw that turns a side prop to face the center lane (signage etc.).
  // KayKit signage faces +Z by default; we rotate it to point toward x=0.
  const faceCenter = (x) => (x < 0 ? Math.PI / 2 : -Math.PI / 2);

  // Side-strip x sampler: a jittered position within 2.3..~6 on the given side.
  const sideX = (side) => side * rand(LANE_HALF + 0.25, (x1 - 0.4));

  // Libraries of props (only ones confirmed preloaded). Null entries are
  // tolerated by `add`, so we can list freely.
  const BARRIERS = [
    ['red', 'barrier_2x1x1'], ['yellow', 'barrier_2x1x1'], ['green', 'barrier_2x1x2'],
    ['yellow', 'barrier_1x1x2'], ['red', 'barrier_2x1x2'], ['yellow', 'barrier_1x1x1'],
    ['blue', 'barrier_2x1x4'],
  ];
  const SMALL_PROPS = [
    ['red', 'ball'], ['yellow', 'ball'], ['red', 'heart'], ['yellow', 'diamond'],
    ['blue', 'bomb_A'], ['red', 'cone'], ['yellow', 'cone'],
  ];
  const CHESTS = [['yellow', 'chest'], ['yellow', 'chest_large']];
  const CONES = [['red', 'cone'], ['yellow', 'cone']];
  const SIGNS = [
    ['blue', 'signage_arrows_right'], ['blue', 'signage_arrows_left'],
    ['blue', 'signage_arrow_stand'], ['blue', 'signage_arrow_wall'],
  ];
  const NETS = [['blue', 'floor_net_2x2x1'], ['blue', 'safetynet_2x2x1']];

  // ------------------------------------------------------------------------
  // 1) Barrier walls/piles — stack a few barriers into little heaps on both
  //    sides, spread the whole length so it's dense end to end.
  // ------------------------------------------------------------------------
  const lenSpan = z1 - z0;
  const pileCount = 8;
  for (let i = 0; i < pileCount; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const baseZ = z0 + 3 + (i / pileCount) * (lenSpan - 6) + rand(-1.5, 1.5);
    const baseX = sideX(side);
    const stack = 1 + Math.floor(rng() * 3); // 1..3 stacked
    let yCursor = top;
    for (let s = 0; s < stack; s++) {
      const [c, n] = pick(BARRIERS);
      const u = rand(1.3, 1.8);
      const m = add(c, n, baseX + rand(-0.4, 0.4), baseZ + rand(-0.4, 0.4), {
        uniform: u, y: yCursor, rotY: rand(0, Math.PI * 2),
      });
      if (m) yCursor += Math.max(getSize(m).y - 0.15, 0.5); // sit the next one on top
    }
  }

  // ------------------------------------------------------------------------
  // 2) Cone rows — lines of cones marching down each side edge.
  // ------------------------------------------------------------------------
  for (const side of [-1, 1]) {
    const lineX = side * rand(x1 - 1.4, x1 - 0.6);
    const n = 6;
    for (let i = 0; i < n; i++) {
      const z = z0 + 2 + (i / (n - 1)) * (lenSpan - 4) + rand(-0.5, 0.5);
      const [c, name] = pick(CONES);
      add(c, name, lineX + rand(-0.3, 0.3), z, { uniform: rand(1.2, 1.6) });
    }
  }

  // ------------------------------------------------------------------------
  // 3) Scattered small props — balls, hearts, diamonds, bombs, cones spread
  //    across the side strips with clustering for a "packed" look.
  // ------------------------------------------------------------------------
  const clusters = 7;
  for (let i = 0; i < clusters; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const cz = z0 + rand(2, lenSpan - 2);
    const cx = sideX(side);
    const members = 2 + Math.floor(rng() * 3); // 2..4 per cluster
    for (let j = 0; j < members; j++) {
      const [c, name] = pick(SMALL_PROPS);
      add(c, name, cx + rand(-1.1, 1.1), cz + rand(-1.1, 1.1), { uniform: rand(1.1, 1.6) });
    }
  }

  // ------------------------------------------------------------------------
  // 4) Chests — a handful tucked against the sides.
  // ------------------------------------------------------------------------
  for (let i = 0; i < 5; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const [c, name] = pick(CHESTS);
    const z = z0 + 4 + (i / 5) * (lenSpan - 8) + rand(-2, 2);
    add(c, name, sideX(side), z, { uniform: rand(1.4, 1.7), rotY: faceCenter(side) + rand(-0.4, 0.4) });
  }

  // ------------------------------------------------------------------------
  // 5) Bracing — a couple of taller structural props for vertical interest.
  // ------------------------------------------------------------------------
  for (let i = 0; i < 4; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const name = rng() < 0.5 ? 'bracing_medium' : 'bracing_small';
    const z = z0 + 5 + (i / 4) * (lenSpan - 10) + rand(-2, 2);
    add('blue', name, side * rand(x1 - 1.6, x1 - 0.7), z, { uniform: rand(1.8, 2.2) });
  }

  // ------------------------------------------------------------------------
  // 6) Signage facing the lane — rotated to point toward the center.
  // ------------------------------------------------------------------------
  for (let i = 0; i < 5; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const [c, name] = pick(SIGNS);
    const z = z0 + 4 + (i / 5) * (lenSpan - 8) + rand(-1.5, 1.5);
    add(c, name, side * rand(LANE_HALF + 0.4, x1 - 1.2), z, {
      uniform: rand(1.8, 2.4), rotY: faceCenter(side),
    });
  }

  // ------------------------------------------------------------------------
  // 7) Pipes — laid along the side strips for industrial flavor.
  // ------------------------------------------------------------------------
  const PIPES = [['red', 'pipe_straight_A'], ['red', 'pipe_90_B'], ['red', 'pipe_end']];
  for (let i = 0; i < 4; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const [c, name] = pick(PIPES);
    const z = z0 + 6 + (i / 4) * (lenSpan - 12) + rand(-2, 2);
    add(c, name, sideX(side), z, { uniform: rand(1.4, 2.0), rotY: rand(0, Math.PI * 2) });
  }

  // ------------------------------------------------------------------------
  // 8) Safety / floor nets — flat, so OK anywhere; drop into side gaps.
  // ------------------------------------------------------------------------
  for (let i = 0; i < 4; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const [c, name] = pick(NETS);
    const z = z0 + 4 + (i / 4) * (lenSpan - 8) + rand(-2, 2);
    add(c, name, side * rand(LANE_HALF + 1.0, x1 - 1.2), z, {
      uniform: rand(2.0, 2.6), rotY: rng() < 0.5 ? 0 : Math.PI / 2,
    });
  }
  // One long net spanning a side gap near the far end.
  {
    const longNet = assets.get('blue', 'safetynet_6x2x1');
    if (longNet) {
      fitUniform(longNet, 4.0);
      longNet.rotation.y = 0;
      placeBase(longNet, -(x1 - 1.6), top, z1 - 8);
      scene.add(longNet);
      count += 1;
    }
  }

  // ------------------------------------------------------------------------
  // 9) Spikeblocks — flat/flush, fine anywhere including across the lane.
  // ------------------------------------------------------------------------
  for (let i = 0; i < 6; i++) {
    const c = rng() < 0.5 ? 'blue' : 'red';
    const acrossLane = rng() < 0.35;
    const x = acrossLane ? rand(-LANE_HALF, LANE_HALF) : sideX(rng() < 0.5 ? -1 : 1);
    const z = z0 + 3 + (i / 6) * (lenSpan - 6) + rand(-1.5, 1.5);
    add(c, 'spikeblock_up', x, z, { uniform: rand(1.2, 1.6), rotY: rand(0, Math.PI * 2) });
  }

  // A few spring pads tucked along the sides for color.
  for (let i = 0; i < 3; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    add('blue', 'spring_pad', sideX(side), z0 + 8 + i * (lenSpan / 4) + rand(-2, 2), {
      uniform: rand(1.3, 1.6),
    });
  }

  // ------------------------------------------------------------------------
  // 10) Flags — a marching row down each side edge.
  // ------------------------------------------------------------------------
  const FLAGS = [['green', 'flag_A'], ['green', 'flag_B'], ['red', 'flag_B']];
  for (const side of [-1, 1]) {
    const fx = side * rand(x1 - 1.0, x1 - 0.4);
    const n = 5;
    for (let i = 0; i < n; i++) {
      const z = z0 + 4 + (i / (n - 1)) * (lenSpan - 8) + rand(-0.6, 0.6);
      const [c, name] = pick(FLAGS);
      add(c, name, fx + rand(-0.3, 0.3), z, { uniform: rand(1.8, 2.4), rotY: faceCenter(side) + rand(-0.3, 0.3) });
    }
  }

  // ------------------------------------------------------------------------
  // 11) Floating stars over the lane — high enough to clear the runner.
  //     (The Level animates its own crown; these are just placed for flair.)
  // ------------------------------------------------------------------------
  const starCount = 6;
  for (let i = 0; i < starCount; i++) {
    const x = rand(-LANE_HALF + 0.3, LANE_HALF - 0.3);
    const z = z0 + 4 + (i / (starCount - 1)) * (lenSpan - 8) + rand(-1, 1);
    add('yellow', 'star', x, z, { uniform: rand(1.0, 1.4), y: top + rand(2.5, 4.0), rotY: rand(0, Math.PI * 2) });
  }

  // Corner accents — pile a small wall of barriers at each deck corner so the
  // edges feel "framed" like the promo shots.
  const corners = [
    [x0 + 1.0, z0 + 1.2], [x1 - 1.0, z0 + 1.2],
    [x0 + 1.0, z1 - 1.2], [x1 - 1.0, z1 - 1.2],
  ];
  for (const [cx, cz] of corners) {
    let yCursor = top;
    const stack = 2 + Math.floor(rng() * 2);
    for (let s = 0; s < stack; s++) {
      const [c, n] = pick(BARRIERS);
      const m = add(c, n, cx + rand(-0.3, 0.3), cz + rand(-0.3, 0.3), {
        uniform: rand(1.3, 1.7), y: yCursor, rotY: rand(0, Math.PI * 2),
      });
      if (m) yCursor += Math.max(getSize(m).y - 0.15, 0.5);
    }
  }

  return count;
}
