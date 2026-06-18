import { createScene } from '../src/scene.js';
import * as THREE from 'three';
import { build } from '../src/props/structure.js';

const { scene, camera, controls, render } = createScene();

const level = new THREE.Group();
scene.add(level);

await build(level);

let meshes = 0;
level.traverse((o) => { if (o.isMesh) meshes++; });
console.log(`[structure] level children=${level.children.length} meshes=${meshes}`);

// Closer broadside framing for inspection (overridable via ?view=).
const view = new URLSearchParams(location.search).get('view') || 'default';
if (view === 'left') {
  camera.position.set(8, 12, 22);
  controls.target.set(7, 4.5, 0);
} else if (view === 'right') {
  camera.position.set(34, 14, 22);
  controls.target.set(26, 6, 0);
} else if (view === 'front') {
  camera.position.set(15, 9, 30);
  controls.target.set(15, 4.5, 0);
} else if (view === 'close') {
  camera.position.set(24, 16, 26);
  controls.target.set(15, 4.5, 0);
}
controls.update();

render();
window.__ready = true;

function loop() {
  render();
  requestAnimationFrame(loop);
}
loop();
