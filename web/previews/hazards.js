// Hazards preview: a few reference decks for context plus the hazards module,
// so we can judge that spikes/sawblade/spring/roller/cones sit correctly on the
// walkway surface and read clearly against the official KayKit sample renders.
import * as THREE from 'three';
import { createScene } from '../src/scene.js';
import { place } from '../src/assets.js';
import { DECK, SEG } from '../src/layout.js';
import { build } from '../src/props/hazards.js';

const { scene, render, camera, controls } = createScene();

// Closer 3/4 view centered on the hazard cluster for clearer seating judgment.
camera.position.set(33, 17, 27);
const lookAt = new THREE.Vector3(18, 5, 0);
camera.lookAt(lookAt);
if (controls) controls.target.copy(lookAt);

const group = new THREE.Group();
scene.add(group);

async function main() {
  // Reference decks so the hazards have something to sit on (base at DECK.y).
  await place(group, ['platform_4x4x1', 'blue', SEG.spikes.cx, 0, DECK.y]);
  await place(group, ['platform_6x6x1', 'blue', SEG.landmark.cx, 0, DECK.y]);
  await place(group, ['platform_2x2x1', 'blue', SEG.bridge.cx, 0, DECK.y]);
  // An extra deck under the roller so it has footing too.
  await place(group, ['platform_4x4x1', 'blue', SEG.spikes.cx - 6, 0, DECK.y]);

  // The hazards under test.
  await build(group);

  render();
  render();
  window.__ready = true;
}

main();

function loop() {
  render();
  requestAnimationFrame(loop);
}
loop();
