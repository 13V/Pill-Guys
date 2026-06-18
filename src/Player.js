import * as THREE from 'three';
import { CONFIG } from './config.js';

// The player: a kinematic capsule ("pill") driven by Rapier's character
// controller for crisp platforming (auto-step, slope handling, ground snap).
export class Player {
  constructor(scene, physics, assets) {
    this.physics = physics;
    const { RAPIER, world } = physics;
    const { radius, halfHeight, start } = CONFIG.player;

    // --- Rigid body + capsule collider ---
    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
      start.x,
      start.y,
      start.z,
    );
    this.body = world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.capsule(halfHeight, radius);
    this.collider = world.createCollider(colliderDesc, this.body);

    // --- Character controller ---
    this.controller = world.createCharacterController(0.02);
    this.controller.enableAutostep(0.5, 0.2, true);
    this.controller.enableSnapToGround(0.5);
    this.controller.setMaxSlopeClimbAngle((50 * Math.PI) / 180);
    this.controller.setMinSlopeSlideAngle((40 * Math.PI) / 180);
    this.controller.setApplyImpulsesToDynamicBodies(true);

    // --- Visual ---
    // Outer group (this.mesh) is driven by physics: position + yaw. We never
    // scale it, so the collider/body footprint is untouched. An inner group
    // (this._visual) holds the actual model/pill and is the ONLY thing we
    // squash & stretch, so juice never feeds back into physics.
    this.mesh = new THREE.Group();
    this._visual = new THREE.Group();
    this.mesh.add(this._visual);
    const model = assets.get('character');
    if (model) {
      // Fit a KayKit character to roughly the capsule height and stand it on the floor.
      this._fitModel(model, (halfHeight + radius) * 2);
      this._visual.add(model);
    } else {
      this._visual.add(this._buildPill(radius, halfHeight));
    }
    this.mesh.position.set(start.x, start.y, start.z);
    scene.add(this.mesh);

    // --- State ---
    this.hVel = new THREE.Vector3(); // horizontal velocity (x,z)
    this.vVel = 0; // vertical velocity
    this.grounded = false;
    this._wasJump = false;
    this._coyote = 0; // time left to still jump after leaving the ground
    this._jumpBuffer = 0; // time left for a buffered jump press to fire
    this._targetYaw = 0;
    this._tmp = new THREE.Vector3();

    // --- Squash & stretch juice (visual only) ---
    this._wasGrounded = false; // for detecting the landing (false->true) frame
    this._landImpact = 0; // downward speed captured on the landing frame
    this._squash = 0; // 0..1 impulse, fired on landing, decays over time
    this._bob = Math.random() * Math.PI * 2; // idle breathing phase
    this._scale = new THREE.Vector3(1, 1, 1); // current smoothed visual scale
    this._scaleTarget = new THREE.Vector3(1, 1, 1);
    this._leanX = 0; // smoothed lean (pitch) toward travel direction
    this._leanZ = 0; // smoothed lean (roll) toward travel direction
  }

  _buildPill(radius, halfHeight) {
    const group = new THREE.Group();
    // Capsule dimensions are kept identical to the collider so the visual still
    // fits the physics footprint (we only ever scale the inner _visual group).
    const bodyGeo = new THREE.CapsuleGeometry(radius, halfHeight * 2, 12, 24);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff7ec2, // brighter, friendlier bubblegum pink
      roughness: 0.35,
      metalness: 0.0,
      emissive: 0xff6fb0,
      emissiveIntensity: 0.12, // soft glow so it reads as cute/candy-like
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Rosy cheeks for extra cuteness — two soft flat-ish blush spots.
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xff4f8f,
      roughness: 0.6,
      transparent: true,
      opacity: 0.55,
    });
    const cheekGeo = new THREE.SphereGeometry(radius * 0.2, 12, 12);
    const cheekY = halfHeight - radius * 0.05;

    // Eyes — two big white spheres with bright dark pupils + a tiny glint,
    // near the top front (+Z). Bigger & rounder than before for charm.
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
    });
    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x1a1330,
      roughness: 0.2,
    });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeGeo = new THREE.SphereGeometry(radius * 0.34, 16, 16);
    const pupilGeo = new THREE.SphereGeometry(radius * 0.18, 12, 12);
    const glintGeo = new THREE.SphereGeometry(radius * 0.06, 8, 8);
    const top = halfHeight + radius * 0.3;
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(sx * radius * 0.45, top, radius * 0.74);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(sx * radius * 0.45, top, radius * 0.95);
      const glint = new THREE.Mesh(glintGeo, glintMat);
      glint.position.set(sx * radius * 0.45 + radius * 0.06, top + radius * 0.08, radius * 1.02);
      group.add(eye, pupil, glint);

      const cheek = new THREE.Mesh(cheekGeo, cheekMat);
      cheek.scale.set(1, 0.7, 0.5);
      cheek.position.set(sx * radius * 0.62, cheekY, radius * 0.62);
      group.add(cheek);
    }
    return group;
  }

  _fitModel(model, targetHeight) {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = size.y > 0 ? targetHeight / size.y : 1;
    model.scale.setScalar(scale);
    // Re-measure and drop so the model's feet sit at the capsule's bottom.
    box.setFromObject(model);
    model.position.y -= box.min.y + (CONFIG.player.halfHeight + CONFIG.player.radius);
  }

  get position() {
    return this.mesh.position;
  }

  // Compute desired movement and queue it. Must run BEFORE physics.step().
  // `surfaceVel` is an optional THREE.Vector3 from conveyors / moving platforms.
  preStep(dt, input, camera, surfaceVel) {
    // Camera-relative input direction on the XZ plane.
    const dir = this._tmp.set(0, 0, 0);
    if (input.forward) dir.add(camera.getForward());
    if (input.back) dir.sub(camera.getForward());
    if (input.right) dir.add(camera.getRight());
    if (input.left) dir.sub(camera.getRight());

    const moving = dir.lengthSq() > 0;
    const target = moving
      ? dir.normalize().multiplyScalar(CONFIG.moveSpeed)
      : dir.set(0, 0, 0);

    // Smooth horizontal velocity; less authority while airborne.
    const responsiveness = this.grounded ? 18 : 18 * CONFIG.airControl;
    const t = 1 - Math.exp(-responsiveness * dt);
    this.hVel.x += (target.x - this.hVel.x) * t;
    this.hVel.z += (target.z - this.hVel.z) * t;

    // Forgiveness timers: coyote (from last grounded frame) + jump buffer (from press).
    this._coyote = this.grounded ? CONFIG.coyoteTime : Math.max(0, this._coyote - dt);
    const jumpPressed = input.jump && !this._wasJump; // edge: ignores held keys
    if (jumpPressed) this._jumpBuffer = CONFIG.jumpBuffer;
    else this._jumpBuffer = Math.max(0, this._jumpBuffer - dt);
    this._wasJump = input.jump;

    // Vertical: fall-heavy gravity for a snappy arc, then resolve a (buffered) jump.
    this.vVel += (this.vVel > 0 ? CONFIG.gravity : CONFIG.fallGravity) * dt;
    if (this._jumpBuffer > 0 && this._coyote > 0) {
      this.vVel = CONFIG.jumpSpeed;
      this.grounded = false;
      this._coyote = 0; // consume so one ledge gives exactly one jump
      this._jumpBuffer = 0;
    }

    // Conveyor push / moving-platform carry is added on top of input (no smoothing).
    const svx = surfaceVel ? surfaceVel.x : 0;
    const svz = surfaceVel ? surfaceVel.z : 0;

    const desired = {
      x: (this.hVel.x + svx) * dt,
      y: this.vVel * dt,
      z: (this.hVel.z + svz) * dt,
    };

    this.controller.computeColliderMovement(this.collider, desired);
    const m = this.controller.computedMovement();
    const p = this.body.translation();
    this.body.setNextKinematicTranslation({
      x: p.x + m.x,
      y: p.y + m.y,
      z: p.z + m.z,
    });

    const wasAir = !this.grounded;
    this.grounded = this.controller.computedGrounded();
    // Record downward impact speed on the landing frame for squash intensity.
    // Read-only: does not affect movement (vVel is still zeroed below as before).
    if (this.grounded && wasAir && this.vVel < 0) {
      this._landImpact = -this.vVel;
    }
    if (this.grounded && this.vVel < 0) this.vVel = 0;

    if (moving) this._targetYaw = Math.atan2(this.hVel.x, this.hVel.z);
  }

  // Sync the mesh from the simulated body. Run AFTER physics.step().
  postStep(dt) {
    const p = this.body.translation();
    this.mesh.position.set(p.x, p.y, p.z);

    // Smoothly turn to face travel direction.
    const current = this.mesh.rotation.y;
    let delta = this._targetYaw - current;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta)); // shortest path
    this.mesh.rotation.y = current + delta * Math.min(1, 12 * dt);

    // --- Squash & stretch juice (scales this._visual ONLY) ---
    // Fire a squash impulse on the grounded transition (false -> true).
    if (this.grounded && !this._wasGrounded) {
      // Scale the impulse by impact speed so a big fall squashes harder.
      const impact = THREE.MathUtils.clamp(this._landImpact / CONFIG.jumpSpeed, 0, 1.4);
      this._squash = Math.max(this._squash, 0.35 + impact * 0.4);
    }
    this._wasGrounded = this.grounded;
    this._landImpact = 0;
    // Squash impulse decays back to rest.
    this._squash = Math.max(0, this._squash - dt * 4.5);

    // Idle breathing/bob — gentle, only really visible when standing still.
    this._bob += dt * 3.2;
    const speedSq = this.hVel.x * this.hVel.x + this.hVel.z * this.hVel.z;
    const idle = THREE.MathUtils.clamp(1 - speedSq / 4, 0, 1); // 1 when still
    const breathe = Math.sin(this._bob) * 0.03 * idle;

    // Build target scale: volume-preserving-ish (taller -> thinner & vice versa).
    let stretch = 0;
    if (this.vVel > 0) {
      // Stretch while rising; strongest at the top of the jump's launch.
      stretch = THREE.MathUtils.clamp(this.vVel / CONFIG.jumpSpeed, 0, 1) * 0.22;
    }
    // Squash dominates (landing) and overrides stretch.
    const sy = 1 + stretch - this._squash * 0.45 + breathe;
    const sxz = 1 - stretch * 0.5 + this._squash * 0.4 - breathe * 0.5;
    this._scaleTarget.set(sxz, sy, sxz);

    // Exponential smoothing toward the target so it's springy, not jittery.
    const k = 1 - Math.exp(-16 * dt);
    this._scale.lerp(this._scaleTarget, k);
    this._visual.scale.copy(this._scale);

    // --- Subtle lean toward movement direction (tilts the inner visual) ---
    // Convert world-space horizontal velocity into the mesh's local frame so
    // the lean reads correctly regardless of facing yaw.
    const yaw = this.mesh.rotation.y;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const localX = this.hVel.x * cos - this.hVel.z * sin; // strafe component
    const localZ = this.hVel.x * sin + this.hVel.z * cos; // forward component
    const maxLean = 0.18; // ~10 degrees
    const targetLeanX = THREE.MathUtils.clamp(localZ / CONFIG.moveSpeed, -1, 1) * maxLean;
    const targetLeanZ = THREE.MathUtils.clamp(-localX / CONFIG.moveSpeed, -1, 1) * maxLean;
    this._leanX += (targetLeanX - this._leanX) * k;
    this._leanZ += (targetLeanZ - this._leanZ) * k;
    this._visual.rotation.set(this._leanX, 0, this._leanZ);
  }

  respawn(pos) {
    this.hVel.set(0, 0, 0);
    this.vVel = 0;
    this.grounded = false;
    const t = { x: pos.x, y: pos.y, z: pos.z };
    this.body.setTranslation(t, true);
    this.body.setNextKinematicTranslation(t);
    this.mesh.position.set(t.x, t.y, t.z);

    // Reset visual juice so the pill reappears at rest (no leftover squash/lean).
    this._wasGrounded = false;
    this._landImpact = 0;
    this._squash = 0;
    this._leanX = 0;
    this._leanZ = 0;
    this._scale.set(1, 1, 1);
    this._scaleTarget.set(1, 1, 1);
    if (this._visual) {
      this._visual.scale.set(1, 1, 1);
      this._visual.rotation.set(0, 0, 0);
    }
  }
}
