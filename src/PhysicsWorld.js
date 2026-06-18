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
}
