import { createScene } from '../src/scene.js';
import * as THREE from 'three';
import { build } from '../src/props/structure.js';

const { scene, render } = createScene();

const level = new THREE.Group();
scene.add(level);

await build(level);
render();
window.__ready = true;

function loop() {
  render();
  requestAnimationFrame(loop);
}
loop();
