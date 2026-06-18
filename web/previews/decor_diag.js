import * as THREE from 'three';
import { createScene } from '../src/scene.js';
import { place } from '../src/assets.js';
import { DECK, TOWER, SEG } from '../src/layout.js';
import { build } from '../src/props/decor.js';

const { scene, camera, controls, render } = createScene();
const group = new THREE.Group();
scene.add(group);

async function main() {
  await place(group, ['platform_4x4x2', 'blue', SEG.finish.cx, 0, TOWER.deckY]);
  await build(group);
  // tight camera on the finish tower
  camera.position.set(34, 17, 18);
  controls.target.set(27.5, 11, 0);
  camera.lookAt(27.5, 11, 0);
  controls.update();
  render(); render();
  window.__ready = true;
}
main();
function loop(){ render(); requestAnimationFrame(loop); }
loop();
