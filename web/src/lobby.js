import * as THREE from 'three';
import { createScene } from './scene.js';
import { buildCharacter } from './character.js';
import { createAura } from './effects/aura.js';
import { createPet } from './pet.js';
import { createParticles } from './effects/particles.js';
import { createEvents } from './events.js';
import { createAudio } from './audio.js';
import { CATALOG, RARITY, cosmetics } from './cosmetics.js';
import { createLobbyUI } from './lobbyUI.js';

// LOBBY — the front door / customization stage. The bean stands on a spotlit,
// slowly-rotating podium inside a festive candy arena (drifting bokeh + falling
// confetti + light beams + a rarity-tinted stage glow). Browse Skins / Auras /
// Pets, preview live, buy with coins, then PLAY. cosmetics.js owns the economy.
function start() {
  const { scene, camera, renderer, controls } = createScene();

  // A vibrant "candy arena" sky.
  scene.background = gradient(['#9ecbff', '#bcc3ff', '#ffc6e6', '#ffe9d6'], [0, 0.4, 0.78, 1]);
  scene.fog = null;

  // Frame the bean (at world origin) in the clear LEFT ~40% — the UI panel owns
  // the right 58% and a "showcase" nameplate sits bottom-left, so we lift + size
  // the bean to sit in the UPPER-left above it. Offset the camera right + aim
  // straight ahead so the centered podium falls to screen-left. Fixed camera +
  // a slowly spinning turntable (no manual orbit to fight the UI).
  camera.fov = 36; camera.updateProjectionMatrix();
  camera.position.set(0.9, 1.35, 3.9);   // close in for a big hero bean, owning the left
  camera.lookAt(0.9, 0.46, 0);           // aim a bit below centre so the bean rides high, feet clear the corner showcase
  if (controls) controls.enabled = false;

  const soft = makeSoftCircle();

  // --- Atmosphere: drifting bokeh, ambient confetti, light beams, stage glow ---
  const bokeh = makeBokeh(scene, soft);
  const confetti = makeConfetti(scene);
  makeLightBeams(scene);
  const stageGlow = makeStageGlow(scene, soft);   // floor halo, tinted by rarity
  const backHalo = makeBackHalo(scene, soft);      // soft backlight behind the bean

  // --- Podium: a tiered pedestal + a glowing rim. ----------------------------
  const podium = new THREE.Group(); scene.add(podium);
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.78, 0.5, 64),
    new THREE.MeshStandardMaterial({ color: 0x3f6bff, roughness: 0.45, metalness: 0.15 }),
  );
  disc.position.y = -0.27; disc.castShadow = true; disc.receiveShadow = true; podium.add(disc);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.9, 2.0, 0.16, 64),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.05 }),
  );
  base.position.y = -0.52; base.receiveShadow = true; podium.add(base);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.52, 0.075, 16, 80),
    new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffb300, emissiveIntensity: 0.8, roughness: 0.3, metalness: 0.2 }),
  );
  ring.rotation.x = Math.PI / 2; ring.position.y = -0.005; podium.add(ring);

  // Dramatic warm spotlight pooling on the podium.
  const spot = new THREE.SpotLight(0xfff4e0, 22, 18, Math.PI * 0.26, 0.6, 1.0);
  spot.position.set(0.6, 7, 2.6);
  spot.target.position.set(0, 0.7, 0);
  scene.add(spot); scene.add(spot.target);
  // A cool fill kicker from the left to separate the bean from the backdrop.
  const kick = new THREE.PointLight(0x8fb4ff, 18, 14, 1.5);
  kick.position.set(-3.2, 2.2, 1.5); scene.add(kick);

  // --- Turntable holds the character + its aura so they spin together. -------
  const turntable = new THREE.Group(); scene.add(turntable);
  const charRoot = new THREE.Object3D(); charRoot.position.y = 0.78; turntable.add(charRoot);
  const auraAnchor = new THREE.Object3D(); auraAnchor.position.y = 0.78; turntable.add(auraAnchor);

  let limbs = null;
  function applySkin(skinItem) {
    while (charRoot.children.length) { const c = charRoot.children.pop(); disposeTree(c); }
    limbs = buildCharacter(charRoot, skinItem);
  }

  const aura = createAura(auraAnchor);
  const pet = createPet(scene);

  // Confetti-burst / sparkle / sfx reuse the in-game effect modules via the bus.
  const events = createEvents();
  const particles = createParticles(scene, events);
  const audio = createAudio(events);
  if (audio && audio.resume) audio.resume();

  // What's DISPLAYED on the podium (preview sits on top of equipped; PLAY always
  // uses the committed equipped state). The stage tints to the shown item rarity.
  const eq = cosmetics.getEquipped();
  const shown = { skin: cosmetics.getItem(eq.skin), aura: cosmetics.getItem(eq.aura), pet: cosmetics.getItem(eq.pet) };
  applySkin(shown.skin);
  aura.setVariant(shown.aura);
  pet.setVariant(shown.pet);
  let stageColor = new THREE.Color(RARITY[shown.skin.rarity]?.color || '#ffd23f');
  let stageColorTarget = stageColor.clone();

  function setStageRarity(item) {
    const hex = (RARITY[item.rarity] && RARITY[item.rarity].color) || '#ffd23f';
    stageColorTarget = new THREE.Color(hex);
  }
  setStageRarity(shown.skin);

  function showItem(item) {
    const cat = cosmetics.categoryOf(item.id);
    shown[cat] = item;
    if (cat === 'skin') applySkin(item);
    else if (cat === 'aura') aura.setVariant(item);
    else if (cat === 'pet') pet.setVariant(item);
    setStageRarity(item);
  }

  let hopT = -1; // >=0 while a celebratory hop is playing
  function celebrate(big) {
    const wp = new THREE.Vector3(); charRoot.getWorldPosition(wp);
    events.emit('coin', { position: { x: wp.x, y: wp.y + 0.6, z: wp.z } });
    if (big) events.emit('finish', { position: { x: wp.x, y: wp.y + 0.3, z: wp.z } });
    hopT = 0;
  }

  // --- UI wiring -------------------------------------------------------------
  const ui = createLobbyUI({
    catalog: CATALOG,
    rarity: RARITY,
    getSnapshot: () => cosmetics.snapshot(),
    onPreview: (item) => showItem(item),
    onEquip: (item) => { cosmetics.equip(item.id); showItem(item); ui.refresh(); celebrate(false); },
    onBuy: (item) => {
      const r = cosmetics.buy(item.id);
      if (r.ok) { showItem(item); ui.refresh(); celebrate(true); }
      else ui.flashUnaffordable(item.id);
    },
    onPlay: () => { location.href = 'game.html?level=1'; },
    onTab: () => {},
  });

  // --- Loop ------------------------------------------------------------------
  let t = 0, last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now; t += dt;

    turntable.rotation.y += dt * 0.5; // the bean slowly shows itself off

    // Idle breathing + gentle float + a celebratory hop on equip/buy.
    let hopY = 0;
    if (hopT >= 0) { hopT += dt; hopY = Math.sin(Math.min(hopT / 0.45, 1) * Math.PI) * 0.55; if (hopT >= 0.45) hopT = -1; }
    if (limbs && limbs.rig) {
      const breathe = Math.sin(t * 2.2) * 0.025;
      limbs.rig.scale.set(1 - breathe * 0.7, 1 + breathe, 1 - breathe * 0.7);
    }
    charRoot.position.y = 0.78 + Math.sin(t * 1.5) * 0.04 + hopY;
    auraAnchor.position.y = charRoot.position.y;

    aura.update(dt);
    const wp = new THREE.Vector3(); charRoot.getWorldPosition(wp);
    pet.update(dt, { x: wp.x, y: wp.y + 0.2, z: wp.z }, turntable.rotation.y);
    particles.update(dt);
    bokeh.update(dt);
    confetti.update(dt);

    // Ease the stage colour toward the previewed item's rarity; drive ring + glows.
    stageColor.lerp(stageColorTarget, Math.min(1, dt * 3));
    ring.material.color.copy(stageColor);
    ring.material.emissive.copy(stageColor);
    ring.material.emissiveIntensity = 0.7 + Math.sin(t * 2) * 0.25;
    stageGlow.setColor(stageColor); stageGlow.pulse(t);
    backHalo.setColor(stageColor);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Test/debug hooks.
  window.__lobby = {
    cosmetics, ui, scene, camera, showItem,
    play: () => { location.href = 'game.html?level=1'; },
    get shown() { return { skin: shown.skin.id, aura: shown.aura.id, pet: shown.pet.id }; },
  };
  window.__ready = true;
  console.log('[lobby] ready');
}

// --- Atmosphere builders -----------------------------------------------------

// Drifting out-of-focus pastel bokeh discs behind the stage — dreamy depth.
function makeBokeh(scene, tex) {
  const group = new THREE.Group(); scene.add(group);
  const COLORS = ['#ffd6ec', '#cde2ff', '#fff2bf', '#e6d6ff', '#ffffff', '#d6fff0'];
  const bits = [];
  for (let i = 0; i < 16; i++) {
    const mat = new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(COLORS[i % COLORS.length]), transparent: true, opacity: 0.28 + Math.random() * 0.27, depthWrite: false, blending: THREE.NormalBlending });
    const s = new THREE.Sprite(mat);
    const size = 1.0 + Math.random() * 2.8;
    s.scale.set(size, size, 1);
    s.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 9, -3 - Math.random() * 5);
    group.add(s);
    bits.push({ s, vy: 0.1 + Math.random() * 0.25, sway: Math.random() * Math.PI * 2 });
  }
  return { update(dt) {
    for (const b of bits) {
      b.sway += dt * 0.5;
      b.s.position.y += b.vy * dt;
      b.s.position.x += Math.sin(b.sway) * dt * 0.15;
      if (b.s.position.y > 5.5) { b.s.position.y = -5.5; b.s.position.x = (Math.random() - 0.5) * 16; }
    }
  } };
}

// Ambient confetti gently raining across the arena (always-on festive feel).
function makeConfetti(scene) {
  const group = new THREE.Group(); scene.add(group);
  const COLORS = [0xff5a78, 0xffd23f, 0x4aa3ff, 0x5bd66a, 0xb06bff, 0xffffff, 0xff8a3d];
  const N = 120, bits = [];
  const geo = new THREE.PlaneGeometry(0.1, 0.15);
  for (let i = 0; i < N; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: COLORS[i % COLORS.length], side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false, toneMapped: false });
    const m = new THREE.Mesh(geo, mat);
    m.position.set((Math.random() - 0.5) * 15, Math.random() * 11 - 2, -1.5 + Math.random() * 5);
    m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    group.add(m);
    bits.push({ m, vy: 0.5 + Math.random() * 0.8, sway: Math.random() * Math.PI * 2, swaySpd: 1 + Math.random() * 2, spin: (Math.random() - 0.5) * 4 });
  }
  return { update(dt) {
    for (const b of bits) {
      b.sway += dt * b.swaySpd;
      b.m.position.y -= b.vy * dt;
      b.m.position.x += Math.sin(b.sway) * dt * 0.4;
      b.m.rotation.z += b.spin * dt; b.m.rotation.x += b.spin * 0.6 * dt;
      if (b.m.position.y < -2.2) { b.m.position.y = 8.5; b.m.position.x = (Math.random() - 0.5) * 15; }
    }
  } };
}

// Two faint volumetric light cones falling onto the podium (god-ray suggestion).
function makeLightBeams(scene) {
  const mat = new THREE.MeshBasicMaterial({ color: 0xfff3da, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
  for (const [x, z, r] of [[0.3, 1.2, 1.5], [-0.4, -0.6, 1.1]]) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, 6.5, 32, 1, true), mat);
    cone.position.set(x, 2.9, z); // apex up, base down over the podium
    scene.add(cone);
  }
}

// A flat additive halo on the floor under the bean, tinted to the rarity colour.
function makeStageGlow(scene, tex) {
  const mat = new THREE.SpriteMaterial({ map: tex, color: 0xffd23f, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
  const s = new THREE.Sprite(mat);
  s.scale.set(3.4, 3.4, 1);
  s.position.set(0, -0.44, 0.1);
  s.material.rotation = 0;
  scene.add(s);
  // Lay it flat-ish by parenting under a tilted group (sprites always face cam,
  // but a floor-ish halo reads fine as a soft bloom around the base).
  return {
    setColor(c) { mat.color.copy(c); },
    pulse(t) { mat.opacity = 0.42 + Math.sin(t * 2) * 0.12; },
  };
}

// A big soft backlight halo behind the bean (separates it from the backdrop).
function makeBackHalo(scene, tex) {
  const mat = new THREE.SpriteMaterial({ map: tex, color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
  const s = new THREE.Sprite(mat);
  s.scale.set(5.5, 5.5, 1);
  s.position.set(0, 0.95, -1.6);
  scene.add(s);
  return { setColor(c) { mat.color.copy(c.clone().lerp(new THREE.Color(0xffffff), 0.5)); } };
}

// --- helpers -----------------------------------------------------------------

function disposeTree(obj) {
  obj.traverse((n) => {
    if (n.geometry) n.geometry.dispose();
    const m = n.material;
    if (m) { (Array.isArray(m) ? m : [m]).forEach((mat) => { if (mat.map) mat.map.dispose(); mat.dispose(); }); }
  });
}

function gradient(colors, stops) {
  if (typeof document === 'undefined') return new THREE.Color(colors[0]);
  const c = document.createElement('canvas'); c.width = 4; c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  for (let i = 0; i < colors.length; i++) g.addColorStop(stops[i], colors[i]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Soft radial-gradient circle (white core -> transparent) for bokeh/glow sprites.
function makeSoftCircle() {
  if (typeof document === 'undefined') return null;
  const size = 128, c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

start();
