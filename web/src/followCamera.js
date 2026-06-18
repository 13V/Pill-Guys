import * as THREE from 'three';

// FOLLOW CAMERA — trails the player. Owned by the CAMERA agent.
//
// export function createFollowCamera(camera, player, opts?) -> {
//   update(dt),     // smoothly move camera to follow player.translation(); lookAt the player
//   yaw(): number,  // current camera yaw (radians) so the game can make player movement camera-relative
//   snap(),         // jump instantly to the target (use on respawn)
//   shake(amplitude?, duration?), // start a decaying camera shake (impact feedback)
//   hold(),         // freeze the follow base + lookAt (death freeze); shake still plays
//   release(),      // resume normal following after hold()
// }
//
// Keep the established 3/4 high-angle framing (camera offset behind + above the player, looking slightly down),
// matching the showcase camera mood. Smoothly damp position toward (playerPos + offset) and the lookAt toward
// the player; expose yaw so left/right/forward/back map to the camera. A fixed yaw (no auto-rotate) is fine for v1.
//
// The final camera.position is a "base" (the damped follow position) plus a decaying random shake offset, so the
// game can punch the camera on death / hard landings without disturbing the tuned follow framing. While "held"
// (hold()), the base position and lookAt freeze in place but the shake keeps advancing/applying — a death freeze
// can still shake. snap() and release() clear the held state; snap() also clears any in-flight shake.

// OFFSET from the player to the camera, in world space. The showcase mood is a
// 3/4 high angle reading the level left -> right (scene.js frames from
// (36,24,31) looking at (15,4,0)). Sitting the camera behind in +X / +Z and
// well above the pill reproduces that: the level reads left->right, the pill
// lands a touch below frame center, and there's generous headroom above it.
const DEFAULT_OFFSET = new THREE.Vector3(5, 6.5, 8);

// The lookAt point is biased a little ABOVE the player's reported origin so the
// pill sits just below screen center with headroom, rather than dead-center.
const DEFAULT_LOOK_BIAS = new THREE.Vector3(0, 1.2, 0);

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

  // The damped FOLLOW position, kept separately from camera.position. The final
  // camera.position each frame is base + a decaying shake offset, so shake never
  // corrupts the smoothed framing and clears cleanly back to base.
  const base = new THREE.Vector3();
  // Persistent eased lookAt target so the aim glides instead of snapping when
  // the player teleports a small amount between frames.
  const currentLook = new THREE.Vector3();
  // Scratch vectors reused each frame (no per-frame allocation).
  const playerPos = new THREE.Vector3();
  const desiredPos = new THREE.Vector3();
  const desiredLook = new THREE.Vector3();
  const shakeOffset = new THREE.Vector3();
  const finalPos = new THREE.Vector3();
  const finalLook = new THREE.Vector3();
  let initialized = false;

  // Held ("freeze") mode: base + lookAt stop following, but shake still plays.
  let held = false;

  // Decaying shake state. While elapsed < duration the offset decays linearly
  // to zero; once elapsed >= duration the offset is exactly zero.
  let shakeAmplitude = 0;
  let shakeDuration = 0;
  let shakeElapsed = 0;
  // Extra vertical punch so impacts feel like they slam the ground.
  const SHAKE_VERTICAL_BOOST = 1.4;
  // The look target gets a much smaller jitter than the position for subtle bite.
  const SHAKE_LOOK_SCALE = 0.18;

  function readPlayer() {
    const p = player.translation();
    playerPos.set(p.x, p.y, p.z);
    return playerPos;
  }

  // Advance the shake timer and write the current decaying offset into
  // `shakeOffset`. Called every frame (held or not).
  function advanceShake(dt) {
    shakeElapsed += Math.max(dt, 0);
    const decay = shakeDuration > 0 ? Math.max(0, 1 - shakeElapsed / shakeDuration) : 0;
    if (decay <= 0) {
      shakeOffset.set(0, 0, 0);
      return;
    }
    const a = shakeAmplitude * decay;
    shakeOffset.set(
      (Math.random() * 2 - 1) * a,
      (Math.random() * 2 - 1) * a * SHAKE_VERTICAL_BOOST,
      (Math.random() * 2 - 1) * a,
    );
  }

  function snap() {
    const p = readPlayer();
    base.copy(p).add(offset);
    camera.position.copy(base);
    currentLook.copy(p).add(lookBias);
    // A respawn must look clean: clear any in-flight shake and the held state.
    shakeOffset.set(0, 0, 0);
    shakeAmplitude = 0;
    shakeDuration = 0;
    shakeElapsed = 0;
    held = false;
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

    if (!held) {
      const p = readPlayer();

      // Damp the follow BASE toward (player + offset).
      desiredPos.copy(p).add(offset);
      base.lerp(desiredPos, dampFactor(posDamp, dt));

      // Ease the lookAt target toward (player + lookBias).
      desiredLook.copy(p).add(lookBias);
      currentLook.lerp(desiredLook, dampFactor(lookDamp, dt));
    }
    // When held, base and currentLook stay frozen exactly where they are.

    // Always advance + apply the shake on top of the (possibly frozen) base.
    advanceShake(dt);
    finalPos.copy(base).add(shakeOffset);
    camera.position.copy(finalPos);

    // Aim at the eased look target, with a much smaller shake jitter for punch.
    finalLook.copy(currentLook).addScaledVector(shakeOffset, SHAKE_LOOK_SCALE);
    camera.lookAt(finalLook);
  }

  function shake(amplitude = 0.5, duration = 0.35) {
    // If a shake is already in flight, take the stronger of the two so a fresh
    // impact never weakens an ongoing one, and refresh the timer/duration.
    shakeAmplitude = Math.max(amplitude, shakeAmplitude);
    shakeDuration = Math.max(duration, 0);
    shakeElapsed = 0;
  }

  function hold() {
    held = true;
  }

  function release() {
    held = false;
  }

  return {
    update,
    yaw: () => fixedYaw,
    snap,
    shake,
    hold,
    release,
  };
}
