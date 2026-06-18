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

const SPRING_SPEED = 16;
const CONVEYOR_SPEED = 4;

export function createInteractions({ physics, player, hud, world }) {
  const coins = (world && world.coins) || [];
  const collected = new Set(); // coin indices already picked up
  let wasOnSpring = false; // debounce: only launch on the frame we ENTER the spring
  let won = false; // finish fires exactly once

  return {
    update() {
      const collider = player.collider;
      if (!collider) return; // physics character not ready yet

      const names = physics.sensorsOverlapping(collider);

      let onSpring = false;
      let onConveyor = false;
      let onDeath = false;
      let onFinish = false;

      for (const name of names) {
        if (name === 'death') {
          onDeath = true;
        } else if (name === 'spring') {
          onSpring = true;
        } else if (name === 'conveyor') {
          onConveyor = true;
        } else if (name === 'finish') {
          onFinish = true;
        } else if (name.startsWith('coin:')) {
          const idx = parseInt(name.slice(5), 10);
          if (!Number.isNaN(idx) && !collected.has(idx)) {
            collected.add(idx);
            const entry = coins[idx];
            if (entry && entry.object3D) entry.object3D.visible = false;
            hud.addCoin();
          }
        }
      }

      // Death: respawn + flash. Takes precedence; skip the rest this frame so
      // we don't immediately re-launch/convey the just-respawned player.
      if (onDeath) {
        player.respawn();
        hud.flashDeath();
        wasOnSpring = false;
        player.setConveyor(null);
        return;
      }

      // Spring: launch only on the frame we enter the pad (rising edge).
      if (onSpring && !wasOnSpring) {
        player.launch(SPRING_SPEED);
      }
      wasOnSpring = onSpring;

      // Conveyor: apply belt push while overlapping, clear it otherwise.
      if (onConveyor) {
        player.setConveyor({ x: CONVEYOR_SPEED, z: 0 });
      } else {
        player.setConveyor(null);
      }

      // Finish: celebrate once.
      if (onFinish && !won) {
        won = true;
        hud.win();
      }
    },
  };
}
