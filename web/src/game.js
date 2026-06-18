import { createScene } from './scene.js';
import { buildVisualLevel } from './buildVisual.js';
import { initPhysics, FIXED_DT } from './physics.js';
import { buildColliders } from './colliders.js';
import { createInput } from './input.js';
import { createPlayer } from './player.js';
import { createFollowCamera } from './followCamera.js';
import { createHUD } from './hud.js';
import { createInteractions } from './interactions.js';

// Playable entry: visual level + Rapier physics + character + camera + HUD + interactions.
async function start() {
  const { scene, camera, renderer, controls } = createScene();
  if (controls) controls.enabled = false; // follow camera drives the view in-game

  await buildVisualLevel(scene);

  const physics = await initPhysics();
  const world = buildColliders(physics, scene); // { spawn, coins }
  const input = createInput();
  const player = createPlayer(scene, physics, input, world.spawn);
  const followCam = createFollowCamera(camera, player);
  const hud = createHUD(world.coins ? world.coins.length : 0);
  const interactions = createInteractions({ physics, player, hud, world });

  hud.onRestart(() => {
    player.respawn();
    hud.reset();
    followCam.snap();
  });

  // Warm up the physics so the character settles on the ground before the first frame.
  for (let i = 0; i < 3; i++) {
    player.fixedUpdate(FIXED_DT, followCam.yaw());
    physics.stepOnce();
    player.syncVisual();
  }
  followCam.snap();

  // Test/debug hooks (used by the headless smoke test).
  window.__game = { scene, camera, physics, player, world, hud, input };
  window.__ready = true;
  console.log('[game] ready');

  let last = performance.now();
  let acc = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    acc += dt;
    let guard = 0;
    while (acc >= FIXED_DT && guard++ < 5) {
      const yaw = followCam.yaw();
      player.fixedUpdate(FIXED_DT, yaw);
      physics.stepOnce();
      interactions.update();
      player.syncVisual();
      if (input.restartPressed && input.restartPressed()) {
        player.respawn();
        hud.reset();
        followCam.snap();
      }
      acc -= FIXED_DT;
    }
    followCam.update(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

start();
