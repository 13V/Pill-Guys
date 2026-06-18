// Preview for the RED pipe gateway. Renders a reference deck + build(group).
import * as THREE from 'three';
import { createScene } from '../src/scene.js';
import { place } from '../src/assets.js';
import { DECK, TOWER, SEG } from '../src/layout.js';
import { build } from '../src/props/pipes.js';

const { scene, render } = createScene();

const group = new THREE.Group();
scene.add(group);

async function main() {
  // Reference deck so we can see where the gateway sits.
  await place(group, ['platform_6x6x1', 'blue', SEG.landmark.cx, 0, DECK.y]);
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
