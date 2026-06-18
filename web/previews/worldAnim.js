// World-animation preview: builds the real visual level, runs createWorldAnim,
// advances it MANY frames so the sawblade is visibly rotated and the conveyor
// belt has scrolled, then logs proof numbers (saw rotation + threads map.offset)
// before flagging __ready for the headless screenshot.
import { createScene } from '../src/scene.js';
import { buildVisualLevel } from '../src/buildVisual.js';
import { createWorldAnim } from '../src/effects/worldAnim.js';
import * as THREE from 'three';

const { scene, camera, renderer } = createScene();

// Frame the hazard/conveyor cluster broadside so both the saw (landmark deck,
// x≈18) and the conveyor (x≈10) are clearly in view.
camera.position.set(33, 18, 29);
const lookAt = new THREE.Vector3(14, 5, 0);
camera.lookAt(lookAt);

const level = await buildVisualLevel(scene);
const anim = createWorldAnim(level);

// Re-traverse to grab the live saw object and a threads material so we can read
// their state before/after advancing — this proves the values actually change.
function findSaw() {
  let saw = null;
  level.traverse((o) => { if (!saw && o.userData && o.userData.spin) saw = o; });
  return saw;
}
function findThreads() {
  let mat = null;
  level.traverse((o) => {
    if (mat || !o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) if (m && m.name === 'threads') { mat = m; break; }
  });
  return mat;
}

const saw = findSaw();
const threads = findThreads();

const beforeRotY = saw ? saw.rotation.y : null;
const beforeOffset = threads && threads.map
  ? { x: threads.map.offset.x, y: threads.map.offset.y }
  : null;

// Allow overriding the pre-advance count via ?steps= so we can render a rest
// pose (steps=0) or a second count and confirm the belt keeps moving.
const stepsParam = new URLSearchParams(location.search).get('steps');
const steps = stepsParam != null && stepsParam !== '' && Number.isFinite(Number(stepsParam))
  ? Number(stepsParam)
  : 150;

// ADVANCE A LOT so motion is unmistakable in the still frame.
for (let i = 0; i < steps; i++) anim.update(1 / 60);

const afterRotY = saw ? saw.rotation.y : null;
const afterOffset = threads && threads.map
  ? { x: threads.map.offset.x, y: threads.map.offset.y }
  : null;

console.log(`[worldAnim] steps=${steps} dt=${1 / 60}`);
console.log(`[worldAnim] SAW found=${!!saw} spin=${saw ? JSON.stringify(saw.userData.spin) : 'n/a'}`);
console.log(`[worldAnim] SAW rotation.y before=${beforeRotY} after=${afterRotY} delta=${afterRotY != null ? (afterRotY - beforeRotY).toFixed(4) : 'n/a'} rad`);
console.log(`[worldAnim] BELT threads found=${!!threads} hasMap=${!!(threads && threads.map)} wrapS=${threads && threads.map ? threads.map.wrapS : 'n/a'} wrapT=${threads && threads.map ? threads.map.wrapT : 'n/a'} (RepeatWrapping=${THREE.RepeatWrapping})`);
console.log(`[worldAnim] BELT map.offset before=${JSON.stringify(beforeOffset)} after=${JSON.stringify(afterOffset)}`);
if (beforeOffset && afterOffset) {
  console.log(`[worldAnim] BELT offset delta x=${(afterOffset.x - beforeOffset.x).toFixed(4)} y=${(afterOffset.y - beforeOffset.y).toFixed(4)}`);
}

renderer.render(scene, camera);
window.__ready = true;

// Keep advancing + rendering after the flag too, so an interactive open shows
// continuous motion (harmless for the headless single-shot).
let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  anim.update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Expose for console poking.
window.__anim = anim;
window.__saw = saw;
window.__threads = threads;
