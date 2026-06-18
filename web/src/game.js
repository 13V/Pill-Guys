import { createScene } from './scene.js';
import { LEVELS } from './levels/index.js';
import { buildLevel } from './levels/build.js';
import { initPhysics, FIXED_DT } from './physics.js';
import { createInput } from './input.js';
import { createPlayer } from './player.js';
import { createFollowCamera } from './followCamera.js';
import { createHUD } from './hud.js';
import { createInteractions } from './interactions.js';
import { createEvents } from './events.js';
import { createAudio } from './audio.js';
import { createParticles } from './effects/particles.js';
import { createWorldAnim } from './effects/worldAnim.js';
import { createCoinJuice } from './effects/coins.js';
import { createRagdoll } from './effects/ragdoll.js';

// Playable entry. Levels are data (src/levels/*); one builder makes visuals +
// physics. Progression advances by reloading with ?level=N (fresh scene/world),
// which keeps level switching dead simple and per-level testable.
async function start() {
  const params = new URLSearchParams(location.search);
  const levelIndex = Math.max(0, Math.min(LEVELS.length - 1, (parseInt(params.get('level'), 10) || 1) - 1));
  const level = LEVELS[levelIndex];

  const { scene, camera, renderer, controls } = createScene();
  if (controls) controls.enabled = false;

  const physics = await initPhysics();
  const built = await buildLevel(level, { scene, physics }); // { group, spawn, coins, finishPos }
  const world = built;

  const events = createEvents();
  const input = createInput();
  const player = createPlayer(scene, physics, input, built.spawn, events);
  const followCam = createFollowCamera(camera, player, { offset: { x: 0, y: 7.5, z: 11.5 }, lookBias: { x: 0, y: 1, z: 0 } });
  const hud = createHUD(built.coins ? built.coins.length : 0);
  const interactions = createInteractions({ physics, player, hud, world, events });

  const audio = createAudio(events);
  const particles = createParticles(scene, events);
  const worldAnim = createWorldAnim(built.group);
  const coinJuice = createCoinJuice(world, events);
  const ragdoll = createRagdoll(scene, physics);
  if (audio && audio.resume) audio.resume();

  // Death -> ragdoll. interactions emits 'death' (and calls player.die()); we
  // spawn the flailing puppet at the hit spot. Real gameplay (rAF loop) lets it
  // play ~1.5s before respawning; the headless test step() resolves instantly.
  let dying = false;
  let dyingT = 0;
  events.on('death', ({ position, velocity }) => {
    if (dying) return;
    dying = true;
    dyingT = 1.5;
    if (position) ragdoll.spawn(position, velocity || { x: 0, y: 0, z: 0 });
  });
  function resolveDeath(snapCam) {
    ragdoll.clear();
    player.respawn();
    if (snapCam) followCam.snap();
    dying = false;
  }

  // Small level label (avoids touching hud.js).
  const label = document.createElement('div');
  label.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);font:600 14px system-ui,sans-serif;color:#3a4658;background:rgba(255,255,255,0.7);padding:4px 12px;border-radius:14px;pointer-events:none;user-select:none;';
  label.textContent = `Level ${levelIndex + 1}/${LEVELS.length} — ${level.name}`;
  document.body.appendChild(label);

  hud.onRestart(() => { player.respawn(); hud.reset(); followCam.snap(); });

  // Progression: on finish, advance to the next level (reload) after a beat.
  let advancing = false;
  events.on('finish', () => {
    if (advancing) return;
    advancing = true;
    if (levelIndex + 1 < LEVELS.length) {
      setTimeout(() => { location.search = `?level=${levelIndex + 2}`; }, 1900);
    }
  });

  // Level select: number keys jump to a level.
  window.addEventListener('keydown', (e) => {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= LEVELS.length) location.search = `?level=${n}`;
  });

  // Warm up so the character settles before the first frame.
  for (let i = 0; i < 3; i++) { player.fixedUpdate(FIXED_DT, followCam.yaw()); physics.stepOnce(); player.syncVisual(); }
  followCam.snap();

  function simStep() {
    const yaw = followCam.yaw();
    player.fixedUpdate(FIXED_DT, yaw);
    physics.stepOnce();
    interactions.update();
    player.syncVisual();
    if (input.restartPressed && input.restartPressed()) { player.respawn(); hud.reset(); followCam.snap(); }
  }

  let simRunning = true;
  window.__game = {
    scene, camera, physics, player, world, hud, input, followCam, events,
    levelIndex, levelCount: LEVELS.length, levelName: level.name, levelData: level,
    pause() { simRunning = false; },
    resume() { simRunning = true; },
    step(n = 1) { for (let i = 0; i < n; i++) { simStep(); if (dying) resolveDeath(false); followCam.update(FIXED_DT); } },
    testWarp(x, y, z) {
      const s = player.spawn; const o = { x: s.x, y: s.y, z: s.z };
      s.x = x; s.y = y; s.z = z; player.respawn(); s.x = o.x; s.y = o.y; s.z = o.z;
    },
  };
  window.__ready = true;
  console.log(`[game] ready — level ${levelIndex + 1}/${LEVELS.length} (${level.name})`);

  let last = performance.now();
  let acc = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (dying) {
      // Camera frozen on the hit spot; step physics so the ragdoll flails, then respawn.
      acc += dt;
      let guard = 0;
      while (acc >= FIXED_DT && guard++ < 5) { physics.stepOnce(); ragdoll.update(FIXED_DT); dyingT -= FIXED_DT; acc -= FIXED_DT; }
      if (dyingT <= 0) resolveDeath(true);
    } else if (simRunning) {
      acc += dt;
      let guard = 0;
      while (acc >= FIXED_DT && guard++ < 5) { simStep(); acc -= FIXED_DT; if (dying) break; }
      if (!dying) followCam.update(dt);
    }
    particles.update(dt);
    worldAnim.update(dt);
    coinJuice.update(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

start();
