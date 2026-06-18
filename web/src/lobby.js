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

// LOBBY — the front door. The bean stands on a spotlit, slowly-rotating podium;
// the player browses Skins / Auras / Pets, previews them live, buys with coins,
// then hits PLAY to enter the levels. Reuses the studio scene + the existing
// effect/audio modules; cosmetics.js owns the persistent economy/equipped state.
function start() {
  const { scene, camera, renderer, controls } = createScene();

  // A warmer "lobby sky" backdrop than the in-game grey.
  scene.background = gradient(['#bfe0ff', '#dceaff', '#ffe7f2'], [0, 0.55, 1]);
  scene.fog = null;

  // Frame the bean (at world origin) in the clear LEFT ~40% — the UI panel owns
  // the right 58%. We just offset the camera to the right and aim straight ahead
  // so the centered podium falls to screen-left. Fixed camera + a slowly spinning
  // turntable gives the classic "locker" look (no manual orbit to fight the UI).
  camera.fov = 36; camera.updateProjectionMatrix();
  camera.position.set(1.7, 2.05, 5.4);
  camera.lookAt(1.7, 0.8, 0);
  if (controls) controls.enabled = false;

  // --- Podium: a chunky disc + a glowing rim + a soft floor glow. ------------
  const podium = new THREE.Group(); scene.add(podium);
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.55, 1.8, 0.5, 56),
    new THREE.MeshStandardMaterial({ color: 0x3f6bff, roughness: 0.5, metalness: 0.12 }),
  );
  disc.position.y = -0.25; disc.castShadow = true; disc.receiveShadow = true; podium.add(disc);
  const disc2 = new THREE.Mesh(
    new THREE.CylinderGeometry(1.75, 1.75, 0.14, 56),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0.05 }),
  );
  disc2.position.y = -0.5; disc2.receiveShadow = true; podium.add(disc2);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.56, 0.07, 14, 64),
    new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffb300, emissiveIntensity: 0.7, roughness: 0.35 }),
  );
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.012; podium.add(ring);

  // Dramatic spotlight pooling on the podium (the studio lights still do the work).
  const spot = new THREE.SpotLight(0xfff4e0, 18, 16, Math.PI * 0.28, 0.55, 1.0);
  spot.position.set(0.6, 6.5, 2.6);
  spot.target.position.set(0, 0.7, 0);
  scene.add(spot); scene.add(spot.target);

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

  // Confetti / sparkle / sfx reuse the in-game effect modules via an event bus.
  const events = createEvents();
  const particles = createParticles(scene, events);
  const audio = createAudio(events);
  if (audio && audio.resume) audio.resume();

  // What's currently DISPLAYED on the podium (preview sits on top of equipped;
  // PLAY always uses the committed equipped state from cosmetics.js).
  const eq = cosmetics.getEquipped();
  const shown = { skin: cosmetics.getItem(eq.skin), aura: cosmetics.getItem(eq.aura), pet: cosmetics.getItem(eq.pet) };
  applySkin(shown.skin);
  aura.setVariant(shown.aura);
  pet.setVariant(shown.pet);

  function showItem(item) {
    const cat = cosmetics.categoryOf(item.id);
    shown[cat] = item;
    if (cat === 'skin') applySkin(item);
    else if (cat === 'aura') aura.setVariant(item);
    else if (cat === 'pet') pet.setVariant(item);
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

    // Turntable spin — the bean slowly shows itself off.
    turntable.rotation.y += dt * 0.5;

    // Idle breathing + a gentle float, plus a celebratory hop on equip/buy.
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
    ring.material.emissiveIntensity = 0.55 + Math.sin(t * 2) * 0.2;
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

// Dispose a subtree's geometries/materials/textures (skin swaps rebuild the bean).
function disposeTree(obj) {
  obj.traverse((n) => {
    if (n.geometry) n.geometry.dispose();
    const m = n.material;
    if (m) { (Array.isArray(m) ? m : [m]).forEach((mat) => { if (mat.map) mat.map.dispose(); mat.dispose(); }); }
  });
}

// A vertical gradient CanvasTexture for the lobby backdrop.
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

start();
