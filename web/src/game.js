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
import { createCinematics } from './effects/cinematics.js';
import { createNet } from './net.js';
import { createRemotePlayers } from './effects/remotePlayers.js';
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

  // Multiplayer is opt-in via ?mp=<ws-url|1>&room=CODE. Absent -> pure single
  // player (headless tests never pass ?mp=, so they're entirely unaffected).
  const mpParam = params.get('mp');
  const mpUrl = mpParam === '1' ? `ws://${location.hostname}:8787` : mpParam;
  const mpRoom = params.get('room') || 'public';
  let net = null;
  let remotePlayers = null;

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
  const cinematics = createCinematics(); // FINISH slam + level card + 3-2-1-GO countdown
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

  hud.onRestart(() => { player.respawn(); hud.reset(); followCam.snap(); cinematics.clear(); advancing = false; simRunning = true; });

  // Progression: on finish, SLAM the "FINISH!" banner where they crossed and
  // freeze the sim (so the celebrating bean doesn't stroll off the tower) while
  // the confetti/fanfare play. Bank the run's coins (+ a completion bonus). Then
  // either WIPE to the next level (whoosh + fade -> reload, where the 3-2-1-GO
  // intro drops the player in), or on the final level show the win banner.
  let advancing = false;
  events.on('finish', () => {
    if (advancing) return;
    advancing = true;
    if (net) net.sendFinish();
    cinematics.slam('FINISH!', `${level.name} — clear!`);
    simRunning = false;
    cosmetics.addCoins((hud.coins || 0) + 100);
    if (levelIndex + 1 < LEVELS.length) {
      setTimeout(() => {
        events.emit('whoosh');
        transition.fadeOut(550, () => { location.search = `?level=${levelIndex + 2}`; });
      }, 1500);
    } else {
      // final level: swap the slam for the celebratory win banner (+ Restart).
      setTimeout(() => { cinematics.clear(); hud.win(); }, 1000);
    }
  });

  // Level select: number keys jump to a level (0 = level 10).
  window.addEventListener('keydown', (e) => {
    let n = parseInt(e.key, 10);
    if (e.key === '0') n = 10;
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

  // --- INTRO: Fall-Guys-style drop-in -----------------------------------------
  // The bean hovers above the start while the camera flies over the course (with
  // the level-name card), then a 3-2-1-GO countdown drops it onto the spawn (the
  // existing gravity/land/squash/dust/thud do the landing). The sim is frozen
  // until GO. Headless tools skip the whole thing instantly via skipIntro(),
  // which is called by step()/testWarp() — so traversal + screenshots are
  // unaffected (they start from a settled bean at the real spawn).
  const deckTop = level.deckTop ?? 5;
  const hoverY = deckTop + 5;          // how high the bean hovers before the drop
  const fx = built.finishPos.x;        // course length, for the establishing sweep
  const flyStart = { px: fx * 0.7, py: hoverY + 20, pz: 26, lx: fx * 0.5, ly: deckTop, lz: 0 };
  const flyEnd = { px: built.spawn.x, py: hoverY + 7.5, pz: built.spawn.z + 11.5, lx: built.spawn.x, ly: hoverY + 1, lz: built.spawn.z };
  const FLY = 3.0;   // seconds of fly-over before the countdown
  const STEP = 0.72; // seconds per countdown number
  let introActive = false, introT = 0, beanBobT = 0, cardShown = false;
  // Countdown is DEADLINE-driven (goAt, in perf-seconds) so every client hits GO
  // at the same instant. Single-player presets it; multiplayer waits for the
  // relay's shared 'start' (see onServerStart). goWall is the same deadline in
  // Date.now() terms (exposed for the sync test); mpStarted gates the HUD label.
  let goAt = null, goWall = null, mpStarted = false, lastCountNum = 0;
  const perfSec = () => performance.now() / 1000;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (t) => t * t * (3 - 2 * t);

  function setIntroCam(e) {
    const a = flyStart, b = flyEnd;
    camera.position.set(lerp(a.px, b.px, e), lerp(a.py, b.py, e), lerp(a.pz, b.pz, e));
    camera.lookAt(lerp(a.lx, b.lx, e), lerp(a.ly, b.ly, e), lerp(a.lz, b.lz, e));
  }

  // Raise the bean to its hover point (bump spawn up, respawn there, restore spawn
  // so the eventual drop + any later death respawn use the real ground spawn).
  { const s = player.spawn; const oy = s.y; s.y = hoverY; player.respawn(); s.y = oy; player.syncVisual(); }
  introActive = true;
  setIntroCam(0);

  // Single-player counts down on its own; multiplayer leaves goAt null until the
  // relay broadcasts the shared start, so every player's GO lands together.
  if (!mpUrl) goAt = perfSec() + FLY + 3 * STEP;
  function onServerStart(inMs) {
    if (!introActive || goAt != null) return; // already scheduled or dropped
    goAt = perfSec() + (inMs || 0) / 1000;
    goWall = Date.now() + (inMs || 0);
    mpStarted = true;
  }

  // GO: end the intro and hand the bean to gravity (it falls onto the spawn).
  function goDrop() {
    if (!introActive) return;
    introActive = false;
    cinematics.hideCard();
    cinematics.count('GO!', true);
    events.emit('go');
    player.object3D.rotation.y = 0;
    followCam.snap();   // frame the hovering bean, then trail it down as it drops
    simRunning = true;
    setTimeout(() => cinematics.clear(), 700);
  }

  // Skip the intro instantly (headless tools / impatient input) and settle the
  // bean at the real spawn exactly like the original warm-up did.
  function skipIntro() {
    if (!introActive) return;
    introActive = false;
    cinematics.clear();
    player.respawn();
    player.object3D.rotation.y = 0;
    for (let i = 0; i < 3; i++) { player.fixedUpdate(FIXED_DT, followCam.yaw()); physics.stepOnce(); player.syncVisual(); }
    followCam.snap();
  }

  // Multiplayer: drop the local bean onto its assigned spawn SLOT so the pack
  // starts spread across the line. Re-hovers in place if the intro's still up.
  function placeLocalAtSlot(slot) {
    const list = built.spawns;
    if (!list || !list.length) return;
    const s = list[slot % list.length];
    player.spawn.x = s.x; player.spawn.z = s.z; // y stays the ground spawn height
    if (introActive) { const oy = player.spawn.y; player.spawn.y = hoverY; player.respawn(); player.spawn.y = oy; player.syncVisual(); }
    else { player.respawn(); followCam.snap(); }
  }

  function introUpdate(dt) {
    introT += dt;
    beanBobT += dt;
    // gentle hover bob + slow turn while we wait
    player.object3D.position.set(built.spawn.x, hoverY + Math.sin(beanBobT * 2.2) * 0.16, built.spawn.z);
    player.object3D.rotation.y += dt * 0.5;
    // establishing fly-over plays once, then holds on the start-line framing.
    if (introT < FLY) {
      setIntroCam(smoothstep(Math.min(1, introT / FLY)));
      if (!cardShown) { cardShown = true; cinematics.levelCard(`LEVEL ${levelIndex + 1} / ${LEVELS.length}`, level.name); }
    } else {
      setIntroCam(1);
    }
    // Deadline-driven 3-2-1-GO. In multiplayer goAt stays null until the server
    // start arrives, so the bean just hovers (lobby "waiting"); once set, the same
    // deadline on every client makes the GO simultaneous.
    if (goAt == null) return;
    const remaining = goAt - perfSec();
    if (remaining <= 0) { goDrop(); return; }
    if (remaining <= 3 * STEP + 1e-3) {
      const num = Math.max(1, Math.min(3, Math.ceil(remaining / STEP)));
      if (num !== lastCountNum) {
        lastCountNum = num;
        cinematics.hideCard();
        cinematics.count(String(num), false);
        events.emit('beep', { i: 3 - num });
      }
    }
  }

  // --- Multiplayer wiring (opt-in; connects asynchronously) ---
  if (mpUrl) {
    remotePlayers = createRemotePlayers(scene);
    const mpTag = document.createElement('div');
    mpTag.style.cssText = 'position:fixed;top:44px;left:12px;z-index:1100;font:700 12px "Baloo 2",system-ui,sans-serif;color:#10243f;background:rgba(255,255,255,0.88);border:2px solid #74ec6a;border-radius:12px;padding:4px 10px;pointer-events:none;user-select:none;';
    mpTag.textContent = '· connecting…';
    document.body.appendChild(mpTag);
    const refreshTag = () => {
      const n = remotePlayers.count() + 1;
      mpTag.textContent = mpStarted ? `🟢 ${n} in race` : `⏳ waiting · ${n} in lobby`;
    };
    net = createNet({
      url: mpUrl, room: mpRoom, level: levelIndex + 1,
      skin: equipped.skin, name: 'Bean' + Math.floor(Math.random() * 900 + 100),
      onWelcome: (m) => { placeLocalAtSlot(m.slot); for (const pe of m.peers) remotePlayers.add(pe.id, pe.skin, pe.name, pe.p, pe.r); refreshTag(); },
      onJoin: (m) => { remotePlayers.add(m.id, m.skin, m.name, m.p, m.r); refreshTag(); },
      onState: (m) => { remotePlayers.setState(m.id, m.p, m.r, m.m); },
      onStart: (m) => { onServerStart(m.inMs); refreshTag(); },
      onLeave: (m) => { remotePlayers.remove(m.id); refreshTag(); },
    });
    setTimeout(() => { if (net && !net.connected) mpTag.textContent = '⚠ no server (run: npm run relay)'; }, 4000);
  }

  window.__game = {
    scene, camera, physics, player, world, hud, input, followCam, events, net, remotePlayers,
    levelIndex, levelCount: LEVELS.length, levelName: level.name, levelData: level,
    pause() { simRunning = false; },
    resume() { simRunning = true; },
    step(n = 1) { if (introActive) skipIntro(); for (let i = 0; i < n; i++) { simStep(); if (dying) resolveDeath(false); followCam.update(FIXED_DT); } },
    testWarp(x, y, z) {
      if (introActive) skipIntro();
      const s = player.spawn; const o = { x: s.x, y: s.y, z: s.z };
      s.x = x; s.y = y; s.z = z; player.respawn(); s.x = o.x; s.y = o.y; s.z = o.z;
    },
    skipIntro,
    introState: () => ({ introActive, goAt, goWall, mpStarted, simRunning }),
  };
  window.__ready = true;
  console.log(`[game] ready — level ${levelIndex + 1}/${LEVELS.length} (${level.name})`);

  // Reveal the scene with a gentle fade-in once everything is framed.
  transition.fadeIn(500);

  // Let an eager player skip straight to GO with space/enter or a click/tap.
  // Manual skip-to-GO is single-player only; in multiplayer the start is
  // server-synchronised, so a player can't drop early.
  window.addEventListener('keydown', (e) => { if (introActive && !mpUrl && (e.key === ' ' || e.key === 'Enter')) goDrop(); });
  window.addEventListener('pointerdown', () => { if (introActive && !mpUrl) goDrop(); });

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
    } else if (introActive) {
      // Intro: fly-over + 3-2-1-GO. No sim until GO (the bean just hovers).
      introUpdate(dt);
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
    if (net) {
      const t = player.translation();
      const v = player.getVelocity ? player.getVelocity() : { x: 0, z: 0 };
      net.setState(t, player.object3D.rotation.y, player.grounded && Math.hypot(v.x, v.z) > 1);
      net.update(dt);
      remotePlayers.update(dt);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

start();
