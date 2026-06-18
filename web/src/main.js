import * as THREE from 'three';
import { createScene } from './scene.js';
import { place } from './assets.js';
import { PLACEMENTS } from './level.js';

const { scene, render } = createScene();

async function buildLevel() {
  const level = new THREE.Group();
  scene.add(level);

  // Load every placement (in parallel; the loader caches by model).
  await Promise.all(PLACEMENTS.map((p) => place(level, p)));

  render();
  // Signal for the headless screenshot tool that the scene is ready.
  window.__ready = true;
  console.log(`[level] built ${level.children.length} / ${PLACEMENTS.length} pieces`);
}

buildLevel();

// Interactive loop (orbit controls) for live viewing in the browser.
function loop() {
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
