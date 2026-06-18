import * as THREE from 'three';

// FOLLOW CAMERA — trails the player. Owned by the CAMERA agent.
//
// export function createFollowCamera(camera, player, opts?) -> {
//   update(dt),     // smoothly move camera to follow player.translation(); lookAt the player
//   yaw(): number,  // current camera yaw (radians) so the game can make player movement camera-relative
//   snap(),         // jump instantly to the target (use on respawn)
// }
//
// Keep the established 3/4 high-angle framing (camera offset behind + above the player, looking slightly down),
// matching the showcase camera mood. Smoothly damp position toward (playerPos + offset) and the lookAt toward
// the player; expose yaw so left/right/forward/back map to the camera. A fixed yaw (no auto-rotate) is fine for v1.

// OFFSET from the player to the camera, in world space. The showcase mood is a
// 3/4 high angle reading the level left -> right (scene.js frames from
// (36,24,31) looking at (15,4,0)). Sitting the camera behind in +X / +Z and
// well above the pill reproduces that: the level reads left->right, the pill
// lands a touch below frame center, and there's generous headroom above it.
const DEFAULT_OFFSET = new THREE.Vector3(9, 11, 14);

// The lookAt point is biased a little ABOVE the player's reported origin so the
// pill sits just below screen center with headroom, rather than dead-center.
const DEFAULT_LOOK_BIAS = new THREE.Vector3(0, 1.6, 0);

// Exponential smoothing rates (per second). Higher = snappier / less lag.
// Position is a touch looser than the lookAt so the frame glides while the
// aim stays planted on the pill.
const DEFAULT_POS_DAMP = 6.0;
const DEFAULT_LOOK_DAMP = 8.0;

// Frame-rate-independent exponential damping factor for a smoothing rate
// `lambda` over a timestep `dt`: alpha = 1 - e^(-lambda*dt). Lerping by this
// each frame gives the same decay regardless of frame rate.
function dampFactor(lambda, dt) {
  return 1 - Math.exp(-lambda * Math.max(dt, 0));
}

export function createFollowCamera(camera, player, opts = {}) {
  const offset = opts.offset ? new THREE.Vector3().copy(opts.offset) : DEFAULT_OFFSET.clone();
  const lookBias = opts.lookBias ? new THREE.Vector3().copy(opts.lookBias) : DEFAULT_LOOK_BIAS.clone();
  const posDamp = opts.posDamp ?? DEFAULT_POS_DAMP;
  const lookDamp = opts.lookDamp ?? DEFAULT_LOOK_DAMP;

  // Fixed yaw implied by the horizontal component of the offset. atan2(x, z)
  // gives the heading of the camera->player axis so the game can rotate input
  // to be camera-relative: forward (axisZ = -1) pushes the pill away from the
  // camera (down the look direction) and right moves screen-right.
  const fixedYaw = Math.atan2(offset.x, offset.z);

  // Persistent eased lookAt target so the aim glides instead of snapping when
  // the player teleports a small amount between frames.
  const currentLook = new THREE.Vector3();
  // Scratch vectors reused each frame (no per-frame allocation).
  const playerPos = new THREE.Vector3();
  const desiredPos = new THREE.Vector3();
  const desiredLook = new THREE.Vector3();
  let initialized = false;

  function readPlayer() {
    const p = player.translation();
    playerPos.set(p.x, p.y, p.z);
    return playerPos;
  }

  function snap() {
    const p = readPlayer();
    desiredPos.copy(p).add(offset);
    camera.position.copy(desiredPos);
    currentLook.copy(p).add(lookBias);
    camera.lookAt(currentLook);
    initialized = true;
  }

  function update(dt) {
    if (!initialized) {
      // First frame with no prior snap: start framed correctly so we don't
      // sweep in from wherever the camera happened to be.
      snap();
      return;
    }
    const p = readPlayer();

    // Damp the camera position toward (player + offset).
    desiredPos.copy(p).add(offset);
    camera.position.lerp(desiredPos, dampFactor(posDamp, dt));

    // Ease the lookAt target toward (player + lookBias), then aim at it.
    desiredLook.copy(p).add(lookBias);
    currentLook.lerp(desiredLook, dampFactor(lookDamp, dt));
    camera.lookAt(currentLook);
  }

  return {
    update,
    yaw: () => fixedYaw,
    snap,
  };
}
