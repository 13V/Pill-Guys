// SUN — a big warm sun disc + soft glowing halo, parked far back-left and high in
// the sky so it reads as the source of the scene's warm KEY light (which streams
// in from the upper-front-left). Both layers are THREE.Sprites so they always
// billboard toward the camera; the halo uses an additive radial-gradient texture
// (warm centre -> transparent) baked on a canvas, with a procedural DataTexture
// fallback when there's no DOM (headless). Everything has depthWrite:false and a
// very low renderOrder so it sits behind the gameplay and never occludes it (it's
// also far outside the playfield). update(dt) gives the halo a gentle slow pulse.
//
//   import { createSun } from './effects/sun.js';
//   const sun = createSun(scene);   // ... sun.update(dt) each frame
import * as THREE from 'three';

// Far back-left and high — well outside the playfield (course x≈-2..150, lanes
// z∈[-3,3], decks y≈5) and behind the action so it never crowds the camera.
const POSITION = new THREE.Vector3(-150, 60, -150);

const DISC_SIZE = 13;          // bright sun disc, ~10-16u across
const HALO_SIZE = DISC_SIZE * 5; // soft glow ~5x the disc

const DISC_COLOR = '#fff3c4';  // warm near-white sun
const HALO_INNER = [255, 230, 160]; // #ffe6a0 — warm halo centre

// Build a soft radial-gradient glow texture on a canvas: a warm opaque-ish centre
// fading to fully transparent at the rim, so the halo reads as a ball of light
// rather than a hard square. Falls back to a procedural DataTexture when there's
// no DOM (headless), so construction never throws offscreen.
function makeHaloTexture() {
  const size = 128;
  if (typeof document !== 'undefined' && document.createElement) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    if (ctx) {
      const r = size / 2;
      const g = ctx.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0.0, 'rgba(255,230,160,0.95)');
      g.addColorStop(0.3, 'rgba(255,230,160,0.55)');
      g.addColorStop(0.65, 'rgba(255,224,150,0.18)');
      g.addColorStop(1.0, 'rgba(255,224,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      return tex;
    }
  }
  return makeHaloDataTexture(size);
}

// Headless fallback: a procedurally-filled RGBA DataTexture with the same warm
// radial falloff, so neither sprite construction nor disposal touches the DOM.
function makeHaloDataTexture(size) {
  const data = new Uint8Array(size * size * 4);
  const c = (size - 1) / 2;
  const [ir, ig, ib] = HALO_INNER;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - c) / c;
      const dy = (y - c) / c;
      const d = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      // Smooth, slightly front-loaded falloff to mirror the canvas gradient.
      const a = (1 - d) * (1 - d);
      const i = (y * size + x) * 4;
      data[i] = ir;
      data[i + 1] = ig;
      data[i + 2] = ib;
      data[i + 3] = Math.round(a * 242);
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

// The DISC needs a circular alpha or a bare Sprite renders as a SQUARE. Solid warm
// out to ~0.82 of the radius, then a soft anti-aliased fade to transparent at the
// rim. Canvas when there's a DOM, procedural DataTexture fallback otherwise.
function makeDiscTexture() {
  const size = 128;
  if (typeof document !== 'undefined' && document.createElement) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    if (ctx) {
      const r = size / 2;
      const g = ctx.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0.0, 'rgba(255,247,206,1)');
      g.addColorStop(0.82, 'rgba(255,243,196,1)');
      g.addColorStop(0.95, 'rgba(255,238,180,0.5)');
      g.addColorStop(1.0, 'rgba(255,238,180,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      return tex;
    }
  }
  const data = new Uint8Array(size * size * 4);
  const cc = (size - 1) / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.min(1, Math.hypot((x - cc) / cc, (y - cc) / cc));
      const a = d < 0.82 ? 1 : Math.max(0, 1 - (d - 0.82) / 0.18);
      const i = (y * size + x) * 4;
      data[i] = 255; data[i + 1] = 245; data[i + 2] = 200; data[i + 3] = Math.round(a * 255);
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export function createSun(scene) {
  const group = new THREE.Group();
  group.name = 'sun';
  group.position.copy(POSITION);

  // --- HALO: large additive warm glow behind the disc. Additive blending +
  // depthWrite:false lets it bloom into the sky without writing depth or
  // occluding anything; a low renderOrder keeps it behind the gameplay.
  const haloMat = new THREE.SpriteMaterial({
    map: makeHaloTexture(),
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.set(HALO_SIZE, HALO_SIZE, 1);
  halo.renderOrder = -20;
  group.add(halo);

  // --- DISC: the bright sun body. A flat warm SpriteMaterial (unlit) so it reads
  // as a glowing source regardless of scene lighting. depthWrite:false +
  // depthTest:false keep it firmly in the background behind everything.
  const discMat = new THREE.SpriteMaterial({
    map: makeDiscTexture(),
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    fog: false,
  });
  const disc = new THREE.Sprite(discMat);
  disc.scale.set(DISC_SIZE, DISC_SIZE, 1);
  disc.renderOrder = -19; // just in front of the halo, still behind gameplay
  group.add(disc);

  scene.add(group);

  // Gentle, very slow breathing of the halo so the sun feels alive without
  // drawing attention. Driven by accumulated time in update(dt).
  let t = 0;
  return {
    group,
    update(dt) {
      const d = (typeof dt === 'number' && Number.isFinite(dt)) ? dt : 0;
      t += d;
      const pulse = Math.sin(t * 0.4);          // ~16s period, very slow
      const k = 1 + 0.04 * pulse;               // ±4% halo scale
      halo.scale.set(HALO_SIZE * k, HALO_SIZE * k, 1);
      haloMat.opacity = 0.85 + 0.15 * pulse;    // subtle brightness shimmer
    },
  };
}
