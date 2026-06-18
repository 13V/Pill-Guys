// WORLD ANIMATION — spinning sawblade + scrolling conveyor belt. Owned by the WORLD-ANIM agent.
//
// export function createWorldAnim(level) -> { update(dt) }
//   `level` is the visual THREE.Group from buildVisualLevel.
//   - SAWBLADE: traverse `level`; any object with userData.spin = { localY:true, speed }
//     should spin in its own plane each frame via object.rotateY(speed*dt) (local Y is
//     the disc normal even though the blade is tipped). Support a generic spin too.
//   - CONVEYOR BELT: find mesh materials named 'threads' (the belt texture) in `level`;
//     set material.map.wrapS = THREE.RepeatWrapping and advance material.map.offset.x
//     each frame so the belt appears to move in the travel direction (+X). Remember to
//     set map.needsUpdate / it updates via offset automatically. Tune speed to match the
//     conveyor push (~belt moving toward +X). Cache the materials on first run.
export function createWorldAnim(level) {
  return { update() {} };
}
