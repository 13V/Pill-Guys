// Coin-juice preview: a FAKE world of 3 glowing coins so we can watch the idle
// bob/spin and the collect "pop". We advance the juice by hand, log the numbers
// (bob amplitude + the coin hidden after its pop), then run a live loop that
// re-pops the coins on a cycle so the screenshot catches one mid-pop (scaled
// up, rising, fading) while the others bob.
import { createScene } from '../src/scene.js';
import { createEvents } from '../src/events.js';
import { createCoinJuice } from '../src/effects/coins.js';
import * as THREE from 'three';

const { scene, renderer } = createScene();
// Darker, neutral backdrop so the glowing yellow coins read with punch (the
// level backdrop in scene.js is near-white, which washes small emissive props).
scene.background = new THREE.Color(0x0d1320);
scene.fog = null;

// --- FAKE coins: small bright-yellow icosahedrons (matching colliders.js) at
// x = -2, 0, 2, y ~ 1.5. Each gets its own material so opacity fades are
// independent during a pop.
const COIN_Y = 1.5;
const xs = [-2, 0, 2];
function makeCoin(x) {
  const geo = new THREE.IcosahedronGeometry(0.32, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffe14d,
    emissive: 0xffc400,
    emissiveIntensity: 1.2,
    metalness: 0.3,
    roughness: 0.35,
  });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, COIN_Y, 0);
  m.castShadow = true;
  return m;
}
const meshes = xs.map((x) => {
  const m = makeCoin(x);
  scene.add(m);
  return m;
});

let world = { coins: meshes.map((m, i) => ({ name: `coin:${i}`, object3D: m })) };
const events = createEvents();
let juice = createCoinJuice(world, events);

// A dedicated camera framing the cluster (scene.js' camera is aimed at the big
// level at x~15). Pulled in close, three-quarter view so bob (Y) + spin read.
const cam = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
cam.position.set(0.6, 2.0, 5.2);
cam.lookAt(0, COIN_Y + 0.1, 0);
window.addEventListener('resize', () => {
  cam.aspect = window.innerWidth / window.innerHeight;
  cam.updateProjectionMatrix();
});

// --- NUMERIC VERIFICATION ------------------------------------------------
// 1) Idle bob: advance 30 frames (per the contract) and confirm coin[0]'s Y
//    moves off its base; also sweep a full cycle to report the true amplitude.
const base0 = world.coins[0].object3D.position.y;
for (let i = 0; i < 30; i++) juice.update(1 / 60);
const y0After = world.coins[0].object3D.position.y;
const spin0After = world.coins[0].object3D.rotation.y;
console.log(`[coins] bob (30f): base0=${base0.toFixed(3)} y_after=${y0After.toFixed(3)} differs=${Math.abs(y0After - base0) > 1e-4}`);
console.log(`[coins] spin (30f): coin[0].rotation.y=${spin0After.toFixed(4)} rad (slow idle spin, >0)`);

// True amplitude: keep bobbing through a couple of full cycles and record the
// extremes of coin[0]'s Y around its base.
let minY = Infinity, maxY = -Infinity;
for (let i = 0; i < 360; i++) {
  juice.update(1 / 60);
  const y = world.coins[0].object3D.position.y;
  minY = Math.min(minY, y);
  maxY = Math.max(maxY, y);
}
console.log(`[coins] bob amplitude (full sweep): minY=${minY.toFixed(4)} maxY=${maxY.toFixed(4)} -> ±${((maxY - minY) / 2).toFixed(4)} around base ${base0.toFixed(3)} (target ±0.12)`);

// 2) Collect pop: trigger coin 1, advance ~20 frames through the pop, confirm
//    it ends up hidden while the others stay visible.
events.emit('coin', { index: 1, object3D: world.coins[1].object3D });
console.log(`[coins] emitted 'coin' index 1; visible at pop start=${world.coins[1].object3D.visible}`);
for (let i = 0; i < 20; i++) juice.update(1 / 60);
console.log(`[coins] coin[1].visible after pop=${world.coins[1].object3D.visible} (expect false)`);
console.log(`[coins] uncollected coin[0].visible=${world.coins[0].object3D.visible}, coin[2].visible=${world.coins[2].object3D.visible}`);

// --- LIVE SHOWCASE -------------------------------------------------------
// Rebuild a fresh trio and cycle collection so the live frame always has coins
// bobbing AND (around the screenshot moment) one caught mid-pop. We rebuild the
// world each cycle so the loop never runs out of coins to show.
function rebuild() {
  for (const c of world.coins) scene.remove(c.object3D);
  const ms = xs.map((x) => { const m = makeCoin(x); scene.add(m); return m; });
  world = { coins: ms.map((m, i) => ({ name: `coin:${i}`, object3D: m })) };
  juice = createCoinJuice(world, events);
  window.__coins = { world, events, juice };
}
rebuild();

let last = performance.now();
let elapsed = 0;
let ready = false;
let popTimer = 0;
let nextToPop = 0;
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  elapsed += dt;
  juice.update(dt);

  // Every ~0.9s, pop the next coin; once all are gone, rebuild a fresh trio.
  popTimer += dt;
  if (popTimer >= 0.9) {
    popTimer = 0;
    if (nextToPop < world.coins.length) {
      events.emit('coin', { index: nextToPop, object3D: world.coins[nextToPop].object3D });
      nextToPop++;
    } else {
      rebuild();
      nextToPop = 0;
    }
  }

  renderer.render(scene, cam);
  // Signal ready a touch after the first pop fires (~0.95s) so the screenshot
  // catches coin 0 mid-pop (scaled up + fading) beside the bobbing coins 1 & 2.
  if (!ready && elapsed > 0.95) { ready = true; window.__ready = true; }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
