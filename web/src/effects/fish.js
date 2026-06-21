// LEAPING FISH — a handful of stylised fish/dolphins that occasionally arc out of
// the sea, a sparse surprise pop of life far from the course. Each one rests
// hidden just under SEA_LEVEL on its own staggered timer, then leaps a parabolic
// arc up to ~SEA_LEVEL+3 and splashes back, orienting nose-up on the way out and
// nose-down on the way down (plus a little roll for charm), before submerging for
// a few seconds until the next leap. Every leap re-picks a spot out over OPEN
// water (|z|>20 or far X), so nothing ever jumps near the lanes. No external
// asset — the tapered body, tail fin and bright toy colours are all procedural.
// Headless-safe: only builds THREE objects and does maths; reads no DOM/window.
//
//   import { createFish } from './effects/fish.js';
//   const fish = createFish(scene);   // ... fish.update(dt) each frame
import * as THREE from 'three';
import { SEA_LEVEL } from './ocean.js';

const FISH_COUNT = 6;            // ~5-7 jumpers — reads as scattered life, stays cheap
const FISH_LEN = 1.5;           // nose-to-tail length of one fish (small, distant)
const COLOR_PINK = 0xff7aa2;    // toy pink — alternates with...
const COLOR_CYAN = 0x4cc0e0;    // ...toy cyan, so the school isn't monochrome

const SUBMERGE_DEPTH = 1.2;     // how far below SEA_LEVEL a fish hides while waiting
const ARC_PEAK_MIN = 2.5;       // lowest the nose reaches above SEA_LEVEL at apex
const ARC_PEAK_MAX = 3.5;       // highest a big leap reaches above SEA_LEVEL
const ARC_DUR_MIN = 1.2;        // shortest leap (s) — a quick flick
const ARC_DUR_MAX = 1.8;        // longest, lazy arc (s)
const WAIT_MIN = 3.0;           // shortest submerged pause before the next leap (s)
const WAIT_MAX = 8.0;           // longest pause — keeps the surface mostly still
const HOP_LEN = 3.0;            // how far the fish travels horizontally across an arc
const ROLL_SPEED = 3.2;         // barrel-roll rate (rad/s) for a touch of charm

// Open-sea spawn zones, all clear of the playfield (course runs +X through z≈0,
// lanes |z|≤3). We keep fish at |z|>20 or far X (x<-30 / x>170) per the ambience
// rule, so a leap never crowds the lanes. Each entry is [xMin, xMax, zMin, zMax].
const ZONES = [
  [10, 140, 22, 60],     // far +Z, alongside the mid course
  [10, 140, -60, -22],   // far -Z, the other flank
  [-90, -32, -40, 40],   // out beyond the start
  [172, 230, -40, 40],   // out beyond the finish
];

// Pick a fresh leap target within a random open-sea zone. Returns the ground (x,z)
// the arc is centred on; the parabola is built around this each leap so jumps
// wander the sea rather than repeating in place.
function pickSpot() {
  const [xMin, xMax, zMin, zMax] = ZONES[(Math.random() * ZONES.length) | 0];
  return {
    x: xMin + Math.random() * (xMax - xMin),
    z: zMin + Math.random() * (zMax - zMin),
  };
}

// Build one fish: a tapered body (a sphere stretched along local +X into a torpedo,
// nose at +X) plus a flat triangular tail fin at the tail (-X). Returned as a Group
// whose local +X is the nose — so pointing the group along the velocity aims it
// like a real leap. Geometry is shared across fish via the caller; only the colour
// differs per fish.
function makeFish(mat) {
  const fish = new THREE.Group();

  // Body: a low-poly sphere scaled to a torpedo. Long in X (the swim axis), slim
  // in Y/Z, so it reads as a sleek fish rather than a ball.
  const bodyGeo = new THREE.SphereGeometry(0.5, 10, 8);
  bodyGeo.scale(FISH_LEN, FISH_LEN * 0.42, FISH_LEN * 0.42);
  const body = new THREE.Mesh(bodyGeo, mat);
  fish.add(body);

  // Tail fin: a flat triangle in the XY plane at the tail, splaying up/down into a
  // forked-ish flick. DoubleSide so it's visible whichever way the roll turns it.
  const tailMat = mat.clone();
  const half = FISH_LEN * 0.5;
  const finX = -half * 0.96;            // sits just behind the body
  const finTip = -half * 1.5;           // the fin's trailing point
  const finSpread = FISH_LEN * 0.42;    // how tall the fin splays
  const finPos = new Float32Array([
    finX, 0, 0,
    finTip, finSpread, 0,
    finTip, -finSpread, 0,
  ]);
  const finGeo = new THREE.BufferGeometry();
  finGeo.setAttribute('position', new THREE.BufferAttribute(finPos, 3));
  finGeo.computeVertexNormals();
  const tail = new THREE.Mesh(finGeo, tailMat);
  tail.material.side = THREE.DoubleSide;
  fish.add(tail);

  return fish;
}

export function createFish(scene) {
  const school = new THREE.Group();
  school.name = 'fish';

  // Per-fish state. Each starts mid-wait, with the wait timers spread out so the
  // leaps never sync up — the sea stays mostly still with the odd lone splash.
  const fishes = [];
  for (let i = 0; i < FISH_COUNT; i++) {
    const f = i / FISH_COUNT;
    const mat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? COLOR_PINK : COLOR_CYAN,
      roughness: 0.4, metalness: 0.0,
    });
    const mesh = makeFish(mat);
    mesh.visible = false;          // hidden until its first leap surfaces it
    school.add(mesh);

    const spot = pickSpot();
    fishes.push({
      mesh,
      state: 'wait',               // 'wait' (submerged) | 'leap' (in the air)
      // Stagger the first dive so fish don't all break the surface together.
      timer: WAIT_MIN + (WAIT_MAX - WAIT_MIN) * f,
      t: 0,                        // progress through the current leap (s)
      dur: 0,                      // this leap's duration (s)
      peak: 0,                     // this leap's apex height above SEA_LEVEL
      spot,                        // ground (x,z) the arc is centred on
      dir: i % 2 === 0 ? 1 : -1,   // which way along X it travels this leap
      roll: Math.random() * Math.PI * 2, // current barrel-roll angle
      rollDir: i % 2 === 0 ? 1 : -1,
    });

    // Park each fish submerged at its spot so frame 0 looks right even before any
    // update (it's invisible, but its transform is sane).
    mesh.position.set(spot.x, SEA_LEVEL - SUBMERGE_DEPTH, spot.z);
  }

  scene.add(school);

  return {
    group: school,
    update(dt) {
      if (!Number.isFinite(dt) || dt <= 0) return;
      for (const fish of fishes) {
        if (fish.state === 'wait') {
          fish.timer -= dt;
          if (fish.timer <= 0) beginLeap(fish);
        } else {
          advanceLeap(fish, dt);
        }
      }
    },
  };
}

// Kick off a new leap: pick a fresh spot, arc duration and apex, surface the fish
// and reset its arc clock. Direction/roll alternate so successive jumps vary.
function beginLeap(fish) {
  fish.spot = pickSpot();
  fish.dur = ARC_DUR_MIN + Math.random() * (ARC_DUR_MAX - ARC_DUR_MIN);
  fish.peak = ARC_PEAK_MIN + Math.random() * (ARC_PEAK_MAX - ARC_PEAK_MIN);
  fish.dir = Math.random() < 0.5 ? 1 : -1;
  fish.rollDir = Math.random() < 0.5 ? 1 : -1;
  fish.t = 0;
  fish.state = 'leap';
  fish.mesh.visible = true;
  poseLeap(fish);                  // place it at the arc's start (just under surface)
}

// Advance an in-flight leap; when it lands, submerge and schedule the next wait.
function advanceLeap(fish, dt) {
  fish.t += dt;
  fish.roll += fish.rollDir * ROLL_SPEED * dt;
  if (fish.t >= fish.dur) {
    // Splashdown: hide under the surface and wait a random spell before leaping
    // again. The next leap re-picks the spot, so it can resurface anywhere.
    fish.state = 'wait';
    fish.timer = WAIT_MIN + Math.random() * (WAIT_MAX - WAIT_MIN);
    fish.mesh.visible = false;
    fish.mesh.position.set(fish.spot.x, SEA_LEVEL - SUBMERGE_DEPTH, fish.spot.z);
    return;
  }
  poseLeap(fish);
}

// Place and orient the fish for its current arc progress. The arc is a parabola in
// the X-Y plane (travelling along ±X): height starts just under the surface, peaks
// at SEA_LEVEL+peak at the midpoint, and dips back under at the end, so the entry
// and exit splashes both happen below the waterline. Orientation follows the arc's
// tangent — nose up while rising, nose down while falling — and a barrel roll about
// the body axis adds charm.
function poseLeap(fish) {
  const u = fish.t / fish.dur;           // 0..1 through the arc
  // Vertical: one parabola spanning from submerged at the ends to the apex. With
  // span = peak + SUBMERGE_DEPTH, arch(u) = 4*span*u*(1-u) is 0 at the ends and
  // `span` at u=0.5, so y is SEA_LEVEL-SUBMERGE_DEPTH at entry/exit (below the
  // surface) and exactly SEA_LEVEL+peak at the apex.
  const span = fish.peak + SUBMERGE_DEPTH;
  const arch = 4 * span * u * (1 - u);
  const y = SEA_LEVEL - SUBMERGE_DEPTH + arch;
  // Horizontal: glide across the spot along ±X, centred so the apex is over it.
  const x = fish.spot.x + fish.dir * HOP_LEN * (u - 0.5);
  const z = fish.spot.z;
  fish.mesh.position.set(x, y, z);

  // Pitch from the arc tangent. dy/du = 4*span*(1-2u); with the steady horizontal
  // speed (HOP_LEN per unit u), the slope gives the climb/dive angle. atan2 keeps
  // it nose-up early (+slope) and nose-down late (-slope).
  const dydu = 4 * span * (1 - 2 * u);
  const dxdu = fish.dir * HOP_LEN;
  const pitch = Math.atan2(dydu, Math.abs(dxdu)); // up when rising, down when falling

  // The group's local +X is the nose. Yaw faces travel along ±X (0 or π), then we
  // pitch about the world-ish Z to tip the nose, and roll about the body's own X.
  fish.mesh.rotation.set(0, fish.dir > 0 ? 0 : Math.PI, 0);
  fish.mesh.rotateZ(fish.dir > 0 ? pitch : -pitch);
  fish.mesh.rotateX(fish.roll);
}
