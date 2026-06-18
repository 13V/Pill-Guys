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
export function createPlayer(scene, physics, input, spawn) {
  const object3D = new THREE.Object3D();
  scene.add(object3D);
  return {
    object3D,
    get collider() {
      return null;
    },
    spawn,
    fixedUpdate() {},
    syncVisual() {},
    respawn() {},
    launch() {},
    setConveyor() {},
    translation: () => ({ ...spawn }),
    get grounded() {
      return false;
    },
  };
}
