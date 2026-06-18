import * as THREE from 'three';

// PLAYER — the "pill guy": a Fall-Guys-style character (bean torso + 2 legs +
// 2 arms + face) on a kinematic capsule. Movement tuning is unchanged (snappy
// arcade feel). New: a walk cycle (legs/arms swing with travel), and die()/alive
// so a hit spawns the ragdoll puppet (see effects/ragdoll.js) before respawn.
//   createPlayer(scene, physics, input, spawn, events) -> player
//   emits 'jump' on jump, 'land' on landing.

// --- Tuning (snappy toy-platformer feel; physics capsule unchanged) ---------
const RADIUS = 0.35;
const HALF_HEIGHT = 0.4;
const SPEED = 8;
const GRAVITY = -26;
const JUMP_V = 12.5;       // apex ~3.0 units
const JUMP_CUT = 0.45;     // variable jump: tap = short hop, hold = full
const STICK_VY = -2;
const MAX_FALL = -40;
const COYOTE_TIME = 0.1;
const JUMP_BUFFER = 0.1;
const LAND_AIR_MIN = 0.12;

export function createPlayer(scene, physics, input, spawn, events) {
  const emit = (type, payload) => { if (events && typeof events.emit === 'function') events.emit(type, payload); };

  const object3D = new THREE.Object3D();
  object3D.position.set(spawn.x, spawn.y, spawn.z);
  scene.add(object3D);
  const limbs = buildCharacter(object3D);

  const character = physics.createCharacter({ radius: RADIUS, halfHeight: HALF_HEIGHT, position: { x: spawn.x, y: spawn.y, z: spawn.z } });

  let vy = 0;
  let grounded = false;
  let coyote = 0;
  let jumpBuffered = 0;
  let jumpCutArmed = false;
  let airTime = 0;
  let conveyor = null;
  let faceYaw = 0;
  let alive = true;
  let walkPhase = 0;
  const lastPos = { x: spawn.x, y: spawn.y, z: spawn.z };
  let lastVel = { x: 0, y: 0, z: 0 };

  function fixedUpdate(dt, camYaw = 0) {
    if (!alive) return; // frozen while the ragdoll plays out

    const ix = input.axisX();
    const iz = input.axisZ();
    let dirX = ix, dirZ = iz;
    const len = Math.hypot(dirX, dirZ);
    if (len > 1e-4) {
      dirX /= len; dirZ /= len;
      const c = Math.cos(camYaw), s = Math.sin(camYaw);
      const rx = dirX * c + dirZ * s;
      const rz = -dirX * s + dirZ * c;
      dirX = rx; dirZ = rz;
    } else { dirX = 0; dirZ = 0; }
    let hx = dirX * SPEED;
    let hz = dirZ * SPEED;

    vy += GRAVITY * dt;
    coyote = grounded ? COYOTE_TIME : Math.max(0, coyote - dt);
    if (input.consumeJump()) jumpBuffered = JUMP_BUFFER;
    else jumpBuffered = Math.max(0, jumpBuffered - dt);
    if (jumpBuffered > 0 && coyote > 0) {
      vy = JUMP_V; jumpBuffered = 0; coyote = 0; grounded = false; jumpCutArmed = true; emit('jump');
    }
    if (jumpCutArmed) {
      if (vy <= 0) jumpCutArmed = false;
      else if (!input.jumpHeld()) { vy *= JUMP_CUT; jumpCutArmed = false; }
    }
    if (vy < MAX_FALL) vy = MAX_FALL;
    if (conveyor) { hx += conveyor.x || 0; hz += conveyor.z || 0; }

    lastVel = { x: hx, y: vy, z: hz }; // captured for the ragdoll launch on a hit

    const res = character.computeMove({ x: hx * dt, y: vy * dt, z: hz * dt });
    const wasGrounded = grounded;
    grounded = res.grounded;
    if (grounded && !wasGrounded) { if (airTime >= LAND_AIR_MIN) emit('land', { airTime }); airTime = 0; jumpCutArmed = false; }
    else if (!grounded) airTime += dt;
    else airTime = 0;
    if (grounded && vy < 0) vy = STICK_VY;
  }

  function syncVisual() {
    const t = character.translation();
    object3D.position.set(t.x, t.y, t.z);

    const ix = input.axisX();
    const iz = input.axisZ();
    if (Math.hypot(ix, iz) > 1e-3) {
      const targetYaw = Math.atan2(ix, iz);
      faceYaw = smoothAngle(faceYaw, targetYaw, 0.25);
      object3D.rotation.y = faceYaw;
    }

    // --- Walk cycle: advance by horizontal distance moved (frame-rate free) ---
    const dx = t.x - lastPos.x, dz = t.z - lastPos.z;
    const hdist = Math.hypot(dx, dz);
    lastPos.x = t.x; lastPos.y = t.y; lastPos.z = t.z;
    if (limbs) {
      if (!grounded) {
        // jump/fall pose: legs tucked, arms up
        ease(limbs.legL, -0.5); ease(limbs.legR, -0.5);
        ease(limbs.armL, -1.5); ease(limbs.armR, -1.5);
      } else if (hdist > 0.003) {
        walkPhase += hdist * 6;
        const s = Math.sin(walkPhase) * 0.8;
        limbs.legL.rotation.x = s; limbs.legR.rotation.x = -s;
        limbs.armL.rotation.x = -s * 0.7; limbs.armR.rotation.x = s * 0.7;
      } else {
        for (const m of [limbs.legL, limbs.legR, limbs.armL, limbs.armR]) m.rotation.x *= 0.8;
      }
    }
  }

  function respawn() {
    character.teleport({ x: spawn.x, y: spawn.y, z: spawn.z });
    vy = 0; grounded = false; coyote = 0; jumpBuffered = 0; jumpCutArmed = false; airTime = 0; conveyor = null;
    object3D.position.set(spawn.x, spawn.y, spawn.z);
    lastPos.x = spawn.x; lastPos.y = spawn.y; lastPos.z = spawn.z;
    object3D.visible = true;
    alive = true;
  }

  function die() {
    alive = false;
    object3D.visible = false; // the ragdoll puppet takes over visually
  }

  function launch(speed) { vy = speed; grounded = false; coyote = 0; jumpCutArmed = false; }
  function setConveyor(vec) { conveyor = vec || null; }
  function translation() { return character.translation(); }

  return {
    object3D,
    get collider() { return character.collider; },
    spawn,
    fixedUpdate,
    syncVisual,
    respawn,
    die,
    launch,
    setConveyor,
    translation,
    getVelocity() { return { ...lastVel }; },
    get grounded() { return grounded; },
    get alive() { return alive; },
  };
}

function ease(obj, target) { obj.rotation.x += (target - obj.rotation.x) * 0.2; }

function smoothAngle(from, to, t) {
  let delta = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return from + delta * t;
}

// Build the Fall-Guys-style character: a bean torso + a face + two pivoted legs
// and two pivoted arms. Each limb is a Group hinged at the hip/shoulder (so it
// swings) holding a stubby capsule with a rounded hand/foot on the end — the
// rounded caps poke out past the bean so the 2-arms/2-legs body plan reads
// clearly even from the high follow-cam. Returns the limb groups to animate.
function buildCharacter(parent) {
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff4d4d, roughness: 0.35, metalness: 0.05 });
  const limbMat = new THREE.MeshStandardMaterial({ color: 0xe23b3b, roughness: 0.45, metalness: 0.05 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0xfff0e6, roughness: 0.3, metalness: 0.05 }); // cream hands/feet

  // Torso (the bean).
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(RADIUS, 2 * HALF_HEIGHT, 8, 20), bodyMat);
  body.castShadow = true; body.receiveShadow = true;
  parent.add(body);

  // A limb hinged at (px,py): a Group at the hinge holding a capsule that hangs
  // below it, capped with a rounded sphere (hand/foot). baseZ tilts it outward.
  function limb(px, py, length, r, capR, baseZ) {
    const g = new THREE.Group();
    g.position.set(px, py, 0);
    g.rotation.z = baseZ || 0;
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, length, 5, 10), limbMat);
    m.position.y = -(length / 2 + r * 0.5);
    m.castShadow = true;
    g.add(m);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(capR, 12, 10), capMat);
    cap.position.y = -(length + r * 0.5);
    cap.castShadow = true;
    g.add(cap);
    parent.add(g);
    return g;
  }
  // Legs: spaced apart, hung from the lower bean so the cream feet peek out below.
  const legL = limb(-0.18, -HALF_HEIGHT + 0.06, 0.22, 0.12, 0.15, 0);
  const legR = limb(0.18, -HALF_HEIGHT + 0.06, 0.22, 0.12, 0.15, 0);
  // Arms: at the shoulders, splayed slightly outward (base z-tilt) with hands.
  const armL = limb(-(RADIUS + 0.02), HALF_HEIGHT * 0.2, 0.2, 0.1, 0.12, 0.32);
  const armR = limb(RADIUS + 0.02, HALF_HEIGHT * 0.2, 0.2, 0.1, 0.12, -0.32);

  // Eyes on the +Z (front) face.
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.4 });
  const eyeY = HALF_HEIGHT * 0.6, eyeX = RADIUS * 0.42, eyeZ = RADIUS * 0.92;
  for (const sx of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 0.26, 16, 12), whiteMat);
    white.position.set(sx * eyeX, eyeY, eyeZ); white.castShadow = true; parent.add(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 0.13, 12, 10), pupilMat);
    pupil.position.set(sx * eyeX, eyeY, eyeZ + RADIUS * 0.16); parent.add(pupil);
  }

  return { body, legL, legR, armL, armR };
}
