import RAPIER from '@dimforge/rapier3d-compat';

// Physics core (Rapier). Owns the world, fixed-step simulation, static colliders,
// sensor regions, and the kinematic capsule character used by the player.
//
// Coordinates match the visual scene 1:1 (1 unit = 1 grid cell; deck top = y 5).
//
// Contract used by other modules:
//   const physics = await initPhysics();
//   physics.world, physics.RAPIER, physics.FIXED_DT
//   physics.addStaticBox(cx,cy,cz, hx,hy,hz)                  -> collider   (half-extents)
//   physics.addStaticBoxFromTop(cx,topY,cz, hx,height,hz)     -> collider   (convenience: box whose TOP is at topY)
//   physics.addSensorBox(cx,cy,cz, hx,hy,hz, name)            -> collider   (overlap region tagged `name`)
//   physics.createCharacter({radius, halfHeight, position})  -> character
//   physics.stepOnce()                                         // advance world one FIXED_DT
//   physics.sensorsOverlapping(collider) -> string[]           // names of sensor regions overlapping `collider`
//
// character:
//   .body .collider .controller
//   .computeMove({x,y,z})  -> { grounded:boolean }   // call BEFORE stepOnce(); queues kinematic move
//   .translation()         -> {x,y,z}
//   .teleport({x,y,z})

export const FIXED_DT = 1 / 60;
export const GRAVITY_Y = -26; // snappy platformer gravity

let initialized = false;

export async function initPhysics(gravityY = GRAVITY_Y) {
  if (!initialized) {
    await RAPIER.init();
    initialized = true;
  }
  const world = new RAPIER.World({ x: 0, y: gravityY, z: 0 });
  world.timestep = FIXED_DT;

  // handle -> sensor name
  const sensorNames = new Map();

  function addStaticBox(cx, cy, cz, hx, hy, hz) {
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(cx, cy, cz)
    );
    return world.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz), body);
  }

  // Convenience: place a solid box of total `height` so its TOP surface is at topY.
  function addStaticBoxFromTop(cx, topY, cz, hx, height, hz) {
    const hy = height / 2;
    return addStaticBox(cx, topY - hy, cz, hx, hy, hz);
  }

  function addSensorBox(cx, cy, cz, hx, hy, hz, name) {
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(cx, cy, cz)
    );
    const desc = RAPIER.ColliderDesc.cuboid(hx, hy, hz).setSensor(true);
    const col = world.createCollider(desc, body);
    sensorNames.set(col.handle, name);
    return col;
  }

  function sensorsOverlapping(collider) {
    const hits = [];
    world.intersectionPairsWith(collider, (other) => {
      const name = sensorNames.get(other.handle);
      if (name) hits.push(name);
    });
    return hits;
  }

  function createCharacter({ radius = 0.35, halfHeight = 0.4, position = { x: 0, y: 6, z: 0 } }) {
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(position.x, position.y, position.z)
    );
    const collider = world.createCollider(RAPIER.ColliderDesc.capsule(halfHeight, radius), body);

    const controller = world.createCharacterController(0.02);
    controller.enableAutostep(0.5, 0.2, true); // step up small ledges
    controller.enableSnapToGround(0.5);         // stick to ground on small drops
    controller.setApplyImpulsesToDynamicBodies(true);
    controller.setMaxSlopeClimbAngle((50 * Math.PI) / 180);
    controller.setMinSlopeSlideAngle((40 * Math.PI) / 180);

    let grounded = false;
    return {
      body,
      collider,
      controller,
      computeMove(desired) {
        controller.computeColliderMovement(collider, desired);
        const m = controller.computedMovement();
        grounded = controller.computedGrounded();
        const t = body.translation();
        body.setNextKinematicTranslation({ x: t.x + m.x, y: t.y + m.y, z: t.z + m.z });
        return { grounded };
      },
      get grounded() {
        return grounded;
      },
      translation() {
        return body.translation();
      },
      teleport(p) {
        body.setNextKinematicTranslation(p);
        body.setTranslation(p, true);
      },
    };
  }

  function stepOnce() {
    world.step();
  }

  return {
    RAPIER,
    world,
    FIXED_DT,
    addStaticBox,
    addStaticBoxFromTop,
    addSensorBox,
    sensorsOverlapping,
    createCharacter,
    stepOnce,
  };
}
