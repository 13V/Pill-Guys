// INTERACTIONS — gameplay reactions to sensor overlaps. (Integrator-wired to emit events.)
//
// export function createInteractions({ physics, player, hud, world, events }) -> { update() }
//   world = buildColliders' return (.coins: [{name, object3D}]). events = src/events.js bus.
//
// Emits gameplay events so audio/particles/coin-juice can react without coupling:
//   'jump'  (emitted by the player)        'coin'   {index, position, object3D}
//   'spring'                               'death'  {position}
//   'finish'
// Coins are NOT hidden here anymore — the coin-juice effect plays a collect "pop"
// then hides them. We still mark them collected + bump the HUD exactly once.

const SPRING_SPEED = 16;
const CONVEYOR_SPEED = 4;

export function createInteractions({ physics, player, hud, world, events }) {
  const coins = (world && world.coins) || [];
  const collected = new Set(); // coin indices already picked up
  let wasOnSpring = false; // debounce: only launch on the frame we ENTER the spring
  let won = false; // finish fires exactly once
  const emit = (t, p) => events && events.emit && events.emit(t, p);

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
            const obj = entry && entry.object3D;
            const p = obj ? obj.position : player.translation();
            hud.addCoin();
            emit('coin', { index: idx, object3D: obj, position: { x: p.x, y: p.y, z: p.z } });
          }
        }
      }

      // Death: respawn + flash. Takes precedence; skip the rest this frame so
      // we don't immediately re-launch/convey the just-respawned player.
      if (onDeath) {
        const t = player.translation();
        emit('death', { position: { x: t.x, y: t.y, z: t.z } });
        player.respawn();
        hud.flashDeath();
        wasOnSpring = false;
        player.setConveyor(null);
        return;
      }

      // Spring: launch only on the frame we enter the pad (rising edge).
      if (onSpring && !wasOnSpring) {
        player.launch(SPRING_SPEED);
        emit('spring');
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
        emit('finish');
      }
    },
  };
}
