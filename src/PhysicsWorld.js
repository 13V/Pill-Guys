import RAPIER from '@dimforge/rapier3d-compat';
import { CONFIG } from './config.js';

// Thin wrapper around the Rapier world plus a couple of convenience builders.
// Call `PhysicsWorld.init()` once (it loads the WASM) before constructing.
export class PhysicsWorld {
  static async init() {
    await RAPIER.init();
  }

  constructor() {
    this.RAPIER = RAPIER;
    this.world = new RAPIER.World({ x: 0, y: CONFIG.gravity, z: 0 });
  }

  step() {
    this.world.step();
  }

  // Static (immovable) box collider. `pos` and `size` are full-size vectors.
  addStaticBox(pos, size) {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
      pos.x,
      pos.y,
      pos.z,
    );
    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(
      size.x / 2,
      size.y / 2,
      size.z / 2,
    );
    const collider = this.world.createCollider(colliderDesc, body);
    return { body, collider };
  }

  // Static box with an orientation (for ramps). `quat` is {x,y,z,w}.
  addStaticBoxRotated(pos, size, quat) {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed()
      .setTranslation(pos.x, pos.y, pos.z)
      .setRotation(quat);
    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(
      size.x / 2,
      size.y / 2,
      size.z / 2,
    );
    const collider = this.world.createCollider(colliderDesc, body);
    return { body, collider };
  }

  // Kinematic box (moving platforms). Returns the body + collider to drive.
  addKinematicBox(pos, size) {
    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
      pos.x,
      pos.y,
      pos.z,
    );
    const body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(
      size.x / 2,
      size.y / 2,
      size.z / 2,
    );
    const collider = this.world.createCollider(colliderDesc, body);
    return { body, collider };
  }

  // Casts a ray straight down from `origin` and returns the collider handle it
  // hits (or null). Used to find conveyors / moving platforms underfoot.
  groundSurfaceHandle(origin, maxToi, excludeCollider) {
    try {
      const ray = new RAPIER.Ray(origin, { x: 0, y: -1, z: 0 });
      const hit = this.world.castRay(
        ray,
        maxToi,
        true,
        undefined,
        undefined,
        excludeCollider,
      );
      if (!hit) return null;
      return hit.collider ? hit.collider.handle : hit.colliderHandle;
    } catch {
      return null;
    }
  }
}
