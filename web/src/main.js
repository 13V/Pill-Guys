import * as THREE from 'three';
import { createScene } from './scene.js';
import * as structure from './props/structure.js';
import * as hazards from './props/hazards.js';
import * as pipes from './props/pipes.js';
import * as decor from './props/decor.js';

const { scene, render } = createScene();

const level = new THREE.Group();
scene.add(level);

// Each module owns one concern and exposes async build(level).
const modules = [structure, hazards, pipes, decor];
await Promise.all(modules.map((m) => m.build?.(level)));

render();
window.__ready = true;
console.log(`[main] level built (${level.children.length} groups/pieces)`);

(function loop() {
  render();
  requestAnimationFrame(loop);
})();
