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
export function createFollowCamera(camera, player, opts = {}) {
  return {
    update() {},
    yaw: () => 0,
    snap() {},
  };
}
