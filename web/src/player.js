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

  // --- Juice (visual only) state ---------------------------------------------
  // squash: a single scalar driving vertical squash & stretch. >0 = stretch
  // (rising), <0 = squash (landing impact). It springs back to 0 each frame.
  let squash = 0;
  let squashVel = 0;       // velocity term for the critically-damped spring
  let wasGroundedVis = false; // previous grounded, tracked in syncVisual for landing detection
  let idlePhase = 0;       // breathing-bob phase
  let blinkTimer = 2.5 + Math.random() * 2.5; // seconds until next blink
  let blinkClose = 0;      // remaining seconds the eyes stay shut
  const FEET_OFFSET = 0.78; // feet bottom sits ~0.78 below object3D origin; anchor squash here

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
    if (grounded && !wasGrounded) {
      if (airTime >= LAND_AIR_MIN) {
        const p = character.translation();
        emit('land', { airTime, hard: airTime >= 0.32, position: { x: p.x, y: p.y, z: p.z } });
      }
      airTime = 0; jumpCutArmed = false;
    }
    else if (!grounded) airTime += dt;
    else airTime = 0;
    if (grounded && vy < 0) vy = STICK_VY;
  }

  function syncVisual(dt = 1 / 60) {
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

    // --- Juice: squash & stretch, idle breathing, eye blink (visual only) -----
    if (limbs && limbs.rig) {
      // Landing impact: on the grounded transition, punch a squash sized by the
      // fall (airTime captured before fixedUpdate reset it is gone, so use the
      // landing velocity proxy: a longer fall => faster vy => firmer squash).
      const justLanded = grounded && !wasGroundedVis;
      if (justLanded) {
        // -lastVel.y is downward speed at impact; map to a squash punch. A normal
        // hop (impact vy ~12.5) lands near the suggested squash (sy ~0.78 = -0.22);
        // only the hardest/tallest falls (vy toward MAX_FALL) push to a flat splat.
        const impact = Math.min(1, Math.max(0, (-lastVel.y - 4) / 18));
        squash = -(0.10 + 0.22 * impact); // -0.10 (soft) .. -0.32 (hard splat)
        squashVel = 0;
      } else if (!grounded) {
        // Airborne: ease the stretch/pre-squash pose directly and hold it. The
        // return spring below would otherwise fight it flat before it ever reads,
        // so we keep squashVel parked while in the air.
        const target = lastVel.y > 0
          ? Math.min(0.14, lastVel.y * 0.014)   // rising: stretch up to +0.14
          : Math.max(-0.06, lastVel.y * 0.004); // falling: slight pre-squash
        squash += (target - squash) * Math.min(1, dt * 24);
        squashVel = 0;
      } else {
        // Grounded (past the landing frame): critically-damped spring back to the
        // rest pose. omega sets the ~0.18s settle; integrated with dt so it's
        // frame-rate independent.
        const omega = 22;
        squashVel += (-squash * omega * omega - squashVel * 2 * omega) * dt;
        squash += squashVel * dt;
      }

      // Idle breathing: only when grounded and basically still. A tiny extra
      // vertical bob layered on the squash scalar so the guy is never dead-still.
      let breathe = 0;
      if (grounded && hdist < 0.003) {
        idlePhase += dt * 2.2;
        breathe = Math.sin(idlePhase) * 0.02;
      } else {
        idlePhase = 0;
      }

      // Apply: convert the squash scalar into a volume-preserving-ish scale.
      const sy = 1 + squash + breathe;          // vertical
      const sxz = 1 - (squash + breathe) * 0.7;  // lateral (opposite sign)
      limbs.rig.scale.set(sxz, sy, sxz);
      // Anchor at the feet: shift the rig so the feet bottom stays planted.
      limbs.rig.position.y = FEET_OFFSET * (sy - 1);

      // Eye blink: count down to the next blink; when it fires hold the lids
      // shut briefly, then reschedule. Don't blink while dead.
      if (alive) {
        if (blinkClose > 0) {
          blinkClose -= dt;
        } else {
          blinkTimer -= dt;
          if (blinkTimer <= 0) { blinkClose = 0.09; blinkTimer = 2.5 + Math.random() * 2.5; }
        }
      } else {
        blinkClose = 0;
      }
      const eyeScaleY = blinkClose > 0 ? 0.1 : 1;
      if (limbs.eyes) for (const e of limbs.eyes) e.scale.y = eyeScaleY;
    }
    wasGroundedVis = grounded;
  }

  function respawn() {
    character.teleport({ x: spawn.x, y: spawn.y, z: spawn.z });
    vy = 0; grounded = false; coyote = 0; jumpBuffered = 0; jumpCutArmed = false; airTime = 0; conveyor = null;
    object3D.position.set(spawn.x, spawn.y, spawn.z);
    lastPos.x = spawn.x; lastPos.y = spawn.y; lastPos.z = spawn.z;
    object3D.visible = true;
    alive = true;
    // Reset juice so a respawned character reads normal immediately.
    squash = 0; squashVel = 0; wasGroundedVis = false; idlePhase = 0;
    blinkClose = 0; blinkTimer = 2.5 + Math.random() * 2.5;
    if (limbs && limbs.rig) { limbs.rig.scale.set(1, 1, 1); limbs.rig.position.set(0, 0, 0); }
    if (limbs && limbs.eyes) for (const e of limbs.eyes) e.scale.y = 1;
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

  // Squash & stretch rig: a single Group holding ALL character meshes so we can
  // scale/offset the whole character (juice) without disturbing object3D.position
  // (physics tracks it, camera follows) or object3D.rotation.y (facing). The
  // walk-cycle limb rotations still work since the limbs live under the rig.
  const rig = new THREE.Group();
  parent.add(rig);
  const parent_ = rig; // everything below parents into the rig

  // Torso (the bean).
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(RADIUS, 2 * HALF_HEIGHT, 8, 20), bodyMat);
  body.castShadow = true; body.receiveShadow = true;
  parent_.add(body);

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
    parent_.add(g);
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
  const eyes = []; // eye-white meshes — Y-scaled to blink
  for (const sx of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 0.26, 16, 12), whiteMat);
    white.position.set(sx * eyeX, eyeY, eyeZ); white.castShadow = true; parent_.add(white);
    eyes.push(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 0.13, 12, 10), pupilMat);
    pupil.position.set(sx * eyeX, eyeY, eyeZ + RADIUS * 0.16); parent_.add(pupil);
  }

  return { rig, body, legL, legR, armL, armR, eyes };
}
