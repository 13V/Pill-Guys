import * as THREE from 'three';

// PLAYER — the "pill guy": a kinematic capsule character. Owned by the PLAYER agent.
//
// export function createPlayer(scene, physics, input, spawn) -> player
//   player = {
//     object3D,                 // THREE.Object3D added to `scene` (a pill-shaped capsule)
//     get collider(),           // the Rapier character collider (for sensor overlap checks)
//     spawn,                    // {x,y,z}
//     fixedUpdate(dt, camYaw),  // each fixed substep BEFORE physics.stepOnce(): read input, compute & queue movement
//     syncVisual(),             // after physics.stepOnce(): copy body translation to object3D + face travel dir
//     respawn(),                // teleport to spawn, zero velocity
//     launch(speed),            // spring: set upward velocity = speed
//     setConveyor(vec|null),    // external world-space horizontal velocity to add this frame (or null)
//     translation(),            // {x,y,z}
//     get grounded(),
//   }
//
// Build the character with physics.createCharacter({radius, halfHeight, position: spawn}).
// Movement model (kinematic): keep your OWN vertical velocity vy. Each fixedUpdate:
//   - horizontal target from input.axisX()/axisZ() * SPEED, rotated by camYaw so movement is camera-relative
//   - vy += GRAVITY*dt; if grounded && vy<0 clamp vy small; if input.consumeJump() && grounded -> vy = JUMP_V
//   - add conveyor velocity if set
//   - desired = { x: hx*dt, y: vy*dt, z: hz*dt }; physics character.computeMove(desired); read grounded
// Tune SPEED (~6-8), JUMP_V (~10-12), GRAVITY (~-26) for a snappy feel.
// Make the pill readable: a capsule (CapsuleGeometry) with a bright toy color and a darker bottom; cast shadows.

// --- Tuning (snappy toy-platformer feel) -----------------------------------
const RADIUS = 0.35;        // capsule radius (matches physics default)
const HALF_HEIGHT = 0.4;    // half the cylindrical segment height (matches physics default)
// Total capsule height = 2*HALF_HEIGHT + 2*RADIUS = 1.5; CapsuleGeometry length = 2*HALF_HEIGHT = 0.8.

const SPEED = 7;            // horizontal move speed (units/s)
const GRAVITY = -26;        // downward accel (units/s^2) — matches world gravity for predictability
const JUMP_V = 11;          // initial jump velocity (units/s)
const STICK_VY = -2;        // small downward bias while grounded so snap-to-ground stays engaged
const MAX_FALL = -40;       // terminal velocity clamp so a long fall doesn't tunnel

// Forgiveness windows that make the controller feel responsive without being floaty.
const COYOTE_TIME = 0.1;    // seconds after leaving ground during which a jump still fires
const JUMP_BUFFER = 0.12;   // seconds a jump press is remembered before landing

export function createPlayer(scene, physics, input, spawn) {
  const object3D = new THREE.Object3D();
  object3D.position.set(spawn.x, spawn.y, spawn.z);
  scene.add(object3D);

  // --- Visual: a readable, glossy "pill guy" centered on its origin ---------
  buildPillVisual(object3D);

  // --- Physics character (kinematic capsule) --------------------------------
  const character = physics.createCharacter({
    radius: RADIUS,
    halfHeight: HALF_HEIGHT,
    position: { x: spawn.x, y: spawn.y, z: spawn.z },
  });

  // --- State ----------------------------------------------------------------
  let vy = 0;                 // our own integrated vertical velocity
  let grounded = false;
  let coyote = 0;             // remaining coyote time
  let jumpBuffered = 0;       // remaining jump-buffer time
  let conveyor = null;        // {x,z} world-space velocity to add this frame (set externally), or null
  let faceYaw = 0;            // current visual facing angle (smoothed toward travel dir)

  function fixedUpdate(dt, camYaw = 0) {
    // 1) Horizontal input -> camera-relative world direction.
    const ix = input.axisX();
    const iz = input.axisZ();
    let dirX = ix;
    let dirZ = iz;
    const len = Math.hypot(dirX, dirZ);
    if (len > 1e-4) {
      // Normalize so diagonal isn't faster, then rotate by camera yaw (Y axis).
      dirX /= len;
      dirZ /= len;
      const c = Math.cos(camYaw);
      const s = Math.sin(camYaw);
      const rx = dirX * c + dirZ * s;
      const rz = -dirX * s + dirZ * c;
      dirX = rx;
      dirZ = rz;
    } else {
      dirX = 0;
      dirZ = 0;
    }
    let hx = dirX * SPEED;
    let hz = dirZ * SPEED;

    // 2) Vertical integration + jump (with coyote time & input buffering).
    vy += GRAVITY * dt;

    // Track forgiveness timers.
    coyote = grounded ? COYOTE_TIME : Math.max(0, coyote - dt);
    if (input.consumeJump()) jumpBuffered = JUMP_BUFFER;
    else jumpBuffered = Math.max(0, jumpBuffered - dt);

    if (jumpBuffered > 0 && coyote > 0) {
      vy = JUMP_V;
      jumpBuffered = 0;
      coyote = 0;
      grounded = false; // we're leaving the ground this frame
    }

    if (vy < MAX_FALL) vy = MAX_FALL;

    // 3) Conveyor (external world-space horizontal velocity, set/cleared each frame).
    if (conveyor) {
      hx += conveyor.x || 0;
      hz += conveyor.z || 0;
    }

    // 4) Build desired displacement and let the controller resolve it.
    const desired = { x: hx * dt, y: vy * dt, z: hz * dt };
    const res = character.computeMove(desired);
    grounded = res.grounded;

    // Small downward stick keeps snap-to-ground engaged on slopes/steps.
    if (grounded && vy < 0) vy = STICK_VY;
  }

  function syncVisual() {
    const t = character.translation();
    object3D.position.set(t.x, t.y, t.z);

    // Face the horizontal travel direction (use intended input dir for a crisp turn).
    const ix = input.axisX();
    const iz = input.axisZ();
    if (Math.hypot(ix, iz) > 1e-3) {
      // Rotate input by the last facing basis is unnecessary here; we face world
      // velocity. atan2(x, z) gives a yaw where +Z is "forward" at 0 — fine for a
      // symmetric pill (it just spins to lean into motion).
      const targetYaw = Math.atan2(ix, iz);
      faceYaw = smoothAngle(faceYaw, targetYaw, 0.25);
      object3D.rotation.y = faceYaw;
    }
  }

  function respawn() {
    character.teleport({ x: spawn.x, y: spawn.y, z: spawn.z });
    vy = 0;
    grounded = false;
    coyote = 0;
    jumpBuffered = 0;
    conveyor = null;
    object3D.position.set(spawn.x, spawn.y, spawn.z);
  }

  function launch(speed) {
    vy = speed;
    grounded = false;
    coyote = 0; // launching off a spring shouldn't grant a bonus jump
  }

  function setConveyor(vec) {
    conveyor = vec || null;
  }

  function translation() {
    return character.translation();
  }

  return {
    object3D,
    get collider() {
      return character.collider;
    },
    spawn,
    fixedUpdate,
    syncVisual,
    respawn,
    launch,
    setConveyor,
    translation,
    get grounded() {
      return grounded;
    },
  };
}

// Smoothly interpolate `from` toward `to` (radians) by factor `t`, taking the
// shortest path around the circle so the pill never spins the long way around.
function smoothAngle(from, to, t) {
  let delta = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return from + delta * t;
}

// Build the pill-guy mesh hierarchy onto `parent`. The capsule body is centered
// on the parent origin so the parent's translation == capsule center (matching
// the physics body translation).
function buildPillVisual(parent) {
  // Body — bright cheerful red, glossy toy plastic.
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xff4d4d,
    roughness: 0.35,
    metalness: 0.05,
  });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(RADIUS, 2 * HALF_HEIGHT, 8, 20), bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  parent.add(body);

  // Darker "shoe" cap at the bottom so the guy reads as having feet/weight.
  const bottomMat = new THREE.MeshStandardMaterial({
    color: 0x9c2a2a,
    roughness: 0.5,
    metalness: 0.05,
  });
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 1.005, 20, 12, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), bottomMat);
  // Center of the lower hemisphere sits at the bottom of the cylindrical segment.
  bottom.position.y = -HALF_HEIGHT;
  bottom.castShadow = true;
  parent.add(bottom);

  // --- Eyes: two whites with dark pupils, on the +Z face (the "front"). ------
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.4 });
  const eyeY = HALF_HEIGHT * 0.55; // up in the "head"
  const eyeX = RADIUS * 0.42;
  const eyeZ = RADIUS * 0.92;      // pushed out to the front surface
  for (const sx of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 0.26, 16, 12), whiteMat);
    white.position.set(sx * eyeX, eyeY, eyeZ);
    white.castShadow = true;
    parent.add(white);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 0.13, 12, 10), pupilMat);
    pupil.position.set(sx * eyeX, eyeY, eyeZ + RADIUS * 0.16);
    parent.add(pupil);
  }
}
