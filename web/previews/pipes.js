// Preview for the RED pipe gateway. Renders a reference deck + build(group).
import * as THREE from 'three';
import { createScene } from '../src/scene.js';
import { place } from '../src/assets.js';
import { DECK, TOWER, SEG } from '../src/layout.js';
import { build } from '../src/props/pipes.js';

const { scene, camera, controls, render } = createScene();

// Frame the gateway: pulled-in 3/4 view of the landmark deck (verification only;
// does NOT affect the real scene/build).
const cx = SEG.landmark.cx;
const focus = new THREE.Vector3(cx, 7, 0);
camera.position.set(cx + 20, 16, 22);
camera.lookAt(focus);
controls.target.copy(focus);
controls.update();

const group = new THREE.Group();
scene.add(group);

async function main() {
  // Reference deck so we can see where the gateway sits.
  await place(group, ['platform_6x6x1', 'blue', cx, 0, DECK.y]);
  await build(group);
}

main().then(() => {
  render();
  render();
  window.__ready = true;
});

function loop() {
  render();
  requestAnimationFrame(loop);
}
loop();
