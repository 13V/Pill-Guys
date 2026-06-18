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
    this.mesh = new THREE.Group();
    const model = assets.get('character');
    if (model) {
      // Fit a KayKit character to roughly the capsule height and stand it on the floor.
      this._fitModel(model, (halfHeight + radius) * 2);
      this.mesh.add(model);
    } else {
      this.mesh.add(this._buildPill(radius, halfHeight));
    }
    this.mesh.position.set(start.x, start.y, start.z);
    scene.add(this.mesh);

    // --- State ---
    this.hVel = new THREE.Vector3(); // horizontal velocity (x,z)
    this.vVel = 0; // vertical velocity
    this.grounded = false;
    this._wasJump = false;
    this._targetYaw = 0;
    this._tmp = new THREE.Vector3();
  }

  _buildPill(radius, halfHeight) {
    const group = new THREE.Group();
    const bodyGeo = new THREE.CapsuleGeometry(radius, halfHeight * 2, 8, 18);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff5fa2,
      roughness: 0.5,
      metalness: 0.05,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Eyes — two white spheres with dark pupils, near the top front (+Z).
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x191325 });
    const eyeGeo = new THREE.SphereGeometry(radius * 0.28, 12, 12);
    const pupilGeo = new THREE.SphereGeometry(radius * 0.13, 10, 10);
    const top = halfHeight + radius * 0.25;
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(sx * radius * 0.42, top, radius * 0.78);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(sx * radius * 0.42, top, radius * 0.95);
      group.add(eye, pupil);
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

    // Vertical: gravity + jump (edge-triggered so holding doesn't auto-bounce).
    this.vVel += CONFIG.gravity * dt;
    if (input.jump && !this._wasJump && this.grounded) {
      this.vVel = CONFIG.jumpSpeed;
      this.grounded = false;
    }
    this._wasJump = input.jump;

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

    this.grounded = this.controller.computedGrounded();
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
  }

  respawn(pos) {
    this.hVel.set(0, 0, 0);
    this.vVel = 0;
    this.grounded = false;
    const t = { x: pos.x, y: pos.y, z: pos.z };
    this.body.setTranslation(t, true);
    this.body.setNextKinematicTranslation(t);
    this.mesh.position.set(t.x, t.y, t.z);
  }
}
