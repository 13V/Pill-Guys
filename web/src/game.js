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
  // Camera directly behind (+Z) and above so its yaw is 0: the strip reads
  // left->right and "right" maps to world +X with no diagonal drift on the
  // narrow decks. (An angled offset.x makes movement diagonal and walks the
  // pill off the edge of the conveyor.)
  const followCam = createFollowCamera(camera, player, { offset: { x: 0, y: 7.5, z: 11.5 }, lookBias: { x: 0, y: 1, z: 0 } });
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

  // One fixed simulation substep (shared by the rAF loop and the test hook).
  function simStep() {
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
  }

  let simRunning = true;

  // Test/debug hooks. step()/testWarp()/pause() let the headless integration
  // test drive the sim deterministically (headless Chromium throttles rAF).
  window.__game = {
    scene, camera, physics, player, world, hud, input, followCam,
    pause() { simRunning = false; },
    resume() { simRunning = true; },
    step(n = 1) {
      for (let i = 0; i < n; i++) { simStep(); followCam.update(FIXED_DT); }
    },
    // Teleport the player without permanently moving the respawn point.
    testWarp(x, y, z) {
      const s = player.spawn;
      const o = { x: s.x, y: s.y, z: s.z };
      s.x = x; s.y = y; s.z = z;
      player.respawn();
      s.x = o.x; s.y = o.y; s.z = o.z;
    },
  };
  window.__ready = true;
  console.log('[game] ready');

  let last = performance.now();
  let acc = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (simRunning) {
      acc += dt;
      let guard = 0;
      while (acc >= FIXED_DT && guard++ < 5) {
        simStep();
        acc -= FIXED_DT;
      }
      followCam.update(dt);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

start();
