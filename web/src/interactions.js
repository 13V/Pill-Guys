// INTERACTIONS — gameplay reactions to sensor overlaps. Owned by the INTERACTIONS+HUD agent.
//
// export function createInteractions({ physics, player, hud, world }) -> { update() }
//   world = the object returned by buildColliders (has .coins: [{name, object3D}]).
//
// update() is called every fixed step AFTER physics.stepOnce():
//   const names = physics.sensorsOverlapping(player.collider);  // array of region names currently overlapping
//   - 'death'     -> player.respawn(); hud.flashDeath();        (also covers the fall-off-the-world floor sensor)
//   - 'spring'    -> player.launch(SPRING_SPEED ~ 16);          (debounce: only fire on ENTER, not every frame)
//   - 'conveyor'  -> player.setConveyor({x: CONVEYOR_SPEED ~ 4, z:0});  else player.setConveyor(null)
//   - 'coin:N'    -> if not already collected: hide world.coins[N].object3D (visible=false), hud.addCoin()
//   - 'finish'    -> hud.win() once
// Track collected coins / one-shot flags so each fires appropriately. Guard against player.collider being null.
export function createInteractions({ physics, player, hud, world }) {
  return {
    update() {},
  };
}
