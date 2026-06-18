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
import { createTransition } from './effects/transition.js';
import { createAura } from './effects/aura.js';
import { createPet } from './pet.js';
import { cosmetics } from './cosmetics.js';

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

  // Equipped cosmetics (persisted in cosmetics.js / localStorage; defaults to the
  // classic coral bean + no aura + no pet, so existing behaviour is unchanged).
  const equipped = {
    skin: cosmetics.getEquippedItem('skin'),
    aura: cosmetics.getEquippedItem('aura'),
    pet: cosmetics.getEquippedItem('pet'),
  };

  const events = createEvents();
  const input = createInput();
  const player = createPlayer(scene, physics, input, built.spawn, events, { skin: equipped.skin });
  const followCam = createFollowCamera(camera, player, { offset: { x: 0, y: 7.5, z: 11.5 }, lookBias: { x: 0, y: 1, z: 0 } });
  const hud = createHUD(built.coins ? built.coins.length : 0);
  const interactions = createInteractions({ physics, player, hud, world, events });

  const audio = createAudio(events);
  const particles = createParticles(scene, events);
  const worldAnim = createWorldAnim(built.group);
  const coinJuice = createCoinJuice(world, events);
  const ragdoll = createRagdoll(scene, physics);
  const transition = createTransition();
  // Equipped aura rides on the player; equipped pet follows it.
  const aura = createAura(player.object3D);
  aura.setVariant(equipped.aura);
  const pet = createPet(scene);
  pet.setVariant(equipped.pet);
  if (audio && audio.resume) audio.resume();

  // Death -> ragdoll. interactions emits 'death' (and calls player.die()); we
  // spawn the flailing puppet at the hit spot and punch the camera (held so it
  // freezes on the spot + shakes while the puppet flails). Real gameplay (rAF
  // loop) lets it play ~1.5s before respawning; the headless test step()
  // resolves instantly (and releases the camera) so traversal is unaffected.
  let dying = false;
  let dyingT = 0;
  events.on('death', ({ position, velocity }) => {
    if (dying) return;
    dying = true;
    dyingT = 1.5;
    if (position) ragdoll.spawn(position, velocity || { x: 0, y: 0, z: 0 });
    followCam.hold();
    followCam.shake(0.7, 0.55);
  });
  function resolveDeath(snapCam) {
    ragdoll.clear();
    player.respawn();
    followCam.release();
    if (snapCam) followCam.snap();
    dying = false;
  }

  // Hard landings give the camera a small thump (the player tags airTime>=0.32
  // as a "hard" landing; soft hops don't shake).
  events.on('land', ({ hard }) => { if (hard) followCam.shake(0.22, 0.24); });

  // Small level label (avoids touching hud.js).
  const label = document.createElement('div');
  label.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);font:600 14px system-ui,sans-serif;color:#3a4658;background:rgba(255,255,255,0.7);padding:4px 12px;border-radius:14px;pointer-events:none;user-select:none;';
  label.textContent = `Level ${levelIndex + 1}/${LEVELS.length} — ${level.name}`;
  document.body.appendChild(label);

  // "Lobby" button — return to the customization hub.
  const lobbyBtn = document.createElement('button');
  lobbyBtn.textContent = '← Lobby';
  lobbyBtn.style.cssText = 'position:fixed;top:10px;left:12px;z-index:1100;font:700 13px "Baloo 2",system-ui,sans-serif;color:#10243f;background:rgba(255,255,255,0.88);border:2px solid #2f7bff;border-radius:14px;padding:6px 13px;cursor:pointer;box-shadow:0 3px 0 rgba(27,80,200,0.35);';
  lobbyBtn.addEventListener('click', () => { location.href = 'index.html'; });
  document.body.appendChild(lobbyBtn);

  hud.onRestart(() => { player.respawn(); hud.reset(); followCam.snap(); });

  // Progression: on finish, bank the run's coins (+ a completion bonus) into the
  // persistent wallet, let the win banner + confetti play, then wipe to the next
  // level with a fade (transition.fadeOut covers the screen before reload).
  let advancing = false;
  events.on('finish', () => {
    if (advancing) return;
    advancing = true;
    cosmetics.addCoins((hud.coins || 0) + 100);
    if (levelIndex + 1 < LEVELS.length) {
      setTimeout(() => {
        transition.fadeOut(550, () => { location.search = `?level=${levelIndex + 2}`; });
      }, 1350);
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
    player.syncVisual(FIXED_DT);
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

  // Reveal the scene with a gentle fade-in once everything is framed.
  transition.fadeIn(500);

  let last = performance.now();
  let acc = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (dying) {
      // Step physics so the ragdoll flails; keep the camera held on the hit spot
      // (it shakes via the held shake), then respawn once the puppet plays out.
      acc += dt;
      let guard = 0;
      while (acc >= FIXED_DT && guard++ < 5) { physics.stepOnce(); ragdoll.update(FIXED_DT); dyingT -= FIXED_DT; acc -= FIXED_DT; }
      followCam.update(dt);
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
    aura.update(dt);
    pet.update(dt, player.translation(), followCam.yaw());
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

start();
