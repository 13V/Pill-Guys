// SEABIRDS — a small flock of stylised gulls gliding high over the sea, pure
// background life. Each bird is a tiny dark "V" silhouette (two thin angled
// wings) that gently flaps as it drifts along a slow, lazy horizontal circle
// far out over the ocean. Nothing here touches the playfield: every bird rides
// high (y ≈ 18..42) and well clear of the lanes (centered out over the sea, so
// |z| stays large), so it never crowds the course. No external asset — the wing
// geometry and slate colour are procedural, matching the toy-plastic look.
// Headless-safe: only builds THREE objects, reads no DOM/window.
//
//   import { createBirds } from './effects/birds.js';
//   const birds = createBirds(scene);   // ... birds.update(dt) each frame
import * as THREE from 'three';

const BIRD_COUNT = 9;           // a handful of gulls — reads as a flock, stays cheap
const WINGSPAN = 1.2;           // tip-to-tip width of one bird (small, distant)
const BIRD_COLOR = 0x3a4658;    // dark slate silhouette against the bright sky

// Each bird circles its own centre. Centres sit far from the course (the course
// runs along +X through z≈0); we push them out to large |z| AND offset X so the
// flock loiters out over open water, never above the lanes.
const CIRCLE_CENTER = new THREE.Vector3(70, 0, 0);
const RADIUS_MIN = 26;          // tightest lazy loop
const RADIUS_MAX = 58;          // widest lazy loop
const HEIGHT_MIN = 18;          // lowest a bird ever flies — still well above play
const HEIGHT_MAX = 42;          // highest — distant specks near the horizon haze
const SPEED_MIN = 0.045;        // angular speed (rad/s) — a few u/s along the arc
const SPEED_MAX = 0.085;
const MIN_CENTER_Z = 20;        // keep every orbit's centre this far off the lanes
const FLAP_AMP = 0.5;           // ±rad the wing dihedral swings as it flaps
const FLAP_BASE = 0.32;         // resting dihedral so the "V" reads even at rest
const FLAP_FREQ_MIN = 2.4;      // wingbeat rate (rad/s) — lower bound
const FLAP_FREQ_MAX = 3.6;

// Build one wing as a flat 2-triangle quad lying in the XZ plane, hinged along
// the bird's local +X (the body axis) so a rotation about X raises/lowers it like
// a real wing. One wing spans +Z, the mirror spans -Z. Slight taper to a point at
// the tip keeps the silhouette gull-shaped rather than a blunt slab.
function makeWingGeometry(sign) {
  const half = WINGSPAN * 0.5;  // tip reaches this far out along the wing
  const root = 0.16;            // chord (X length) at the body
  const z0 = 0.02 * sign;       // tiny gap at the hinge so the two wings read apart
  const zT = half * sign;       // wing tip
  const positions = new Float32Array([
    -root, 0, z0,
     root, 0, z0,
     0,    0, zT,
  ]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

export function createBirds(scene) {
  // Wings share one geometry per side and one material across the whole flock —
  // cheap, and the flat slate colour needs no lighting to read as a silhouette.
  const wingGeoR = makeWingGeometry(+1);
  const wingGeoL = makeWingGeometry(-1);
  const wingMat = new THREE.MeshBasicMaterial({
    color: BIRD_COLOR, side: THREE.DoubleSide, fog: true,
  });

  const flock = new THREE.Group();
  flock.name = 'birds';

  // Per-bird state. Each gets its own orbit (radius/height/centre), pace, start
  // angle and flap phase so the flock never clumps or beats in lockstep.
  const birds = [];
  for (let i = 0; i < BIRD_COUNT; i++) {
    const f = i / BIRD_COUNT;                       // 0..1 spread across the flock

    // A bird = a small group holding two wings; we tip/turn the group as a whole
    // to fly it, and swing the wings within it to flap.
    const body = new THREE.Group();
    const wingR = new THREE.Mesh(wingGeoR, wingMat);
    const wingL = new THREE.Mesh(wingGeoL, wingMat);
    body.add(wingR, wingL);
    flock.add(body);

    // Stagger orbits: radius/height walk across their ranges, angle spreads the
    // birds around their loops, sign flips which way half the flock circles.
    const radius = RADIUS_MIN + (RADIUS_MAX - RADIUS_MIN) * f;
    const height = HEIGHT_MIN + (HEIGHT_MAX - HEIGHT_MIN) * ((i * 0.37) % 1);
    const speed = (SPEED_MIN + (SPEED_MAX - SPEED_MIN) * ((i * 0.53) % 1))
                * (i % 2 === 0 ? 1 : -1);
    const angle = f * Math.PI * 2;

    // Offset each orbit centre so the loops don't all stack; push it out over the
    // sea on alternating sides, and guarantee even the near edge clears the lanes
    // (centre |z| ≥ radius + margin keeps the whole circle off the course).
    const side = i % 3 === 0 ? -1 : 1;              // mostly far +Z, some far -Z
    const centerZ = side * (radius + MIN_CENTER_Z);
    const center = new THREE.Vector3(
      CIRCLE_CENTER.x + (i % 2 === 0 ? -1 : 1) * f * 22,
      0,
      CIRCLE_CENTER.z + centerZ,
    );

    birds.push({
      body, wingR, wingL,
      center, radius, height, speed, angle,
      flapPhase: f * Math.PI * 2,
      flapFreq: FLAP_FREQ_MIN + (FLAP_FREQ_MAX - FLAP_FREQ_MIN) * ((i * 0.61) % 1),
    });
  }

  // Initialise positions/facing once so the flock looks right on frame 0 (before
  // the first update) even if dt is missing.
  for (const b of birds) place(b, 0);

  scene.add(flock);

  return {
    group: flock,
    update(dt) {
      if (!Number.isFinite(dt)) return;
      for (const b of birds) {
        b.angle += b.speed * dt;
        place(b, dt);
      }
    },
  };
}

// Position a bird on its circle, face it along travel, and set the wing dihedral
// for this instant. `t` advances the flap clock; passing 0 just refreshes pose.
function place(b, t) {
  b.flapPhase += b.flapFreq * t;

  // March around the horizontal loop.
  const x = b.center.x + Math.cos(b.angle) * b.radius;
  const z = b.center.z + Math.sin(b.angle) * b.radius;
  b.body.position.set(x, b.height, z);

  // Face the direction of travel. Velocity is the tangent to the circle; its sign
  // flips with `speed`, so a reversed bird correctly faces the other way. The body
  // group's local +X is the nose, so yaw = atan2(velZ, velX).
  const dir = b.speed >= 0 ? 1 : -1;
  const velX = -Math.sin(b.angle) * dir;
  const velZ = Math.cos(b.angle) * dir;
  b.body.rotation.y = Math.atan2(velZ, velX);

  // Flap: swing the dihedral with a sine. Wings are mirrored, so the right wing
  // tips +about local X and the left tips - to raise/lower together as a "V".
  const dihedral = FLAP_BASE + FLAP_AMP * Math.sin(b.flapPhase);
  b.wingR.rotation.x = -dihedral;
  b.wingL.rotation.x = dihedral;
}
