// Decor preview: a few REFERENCE decks for spatial context (conveyor deck,
// finish tower deck, and a deck under the gantry at x=13), then the decor
// agent's build() on top, so we can judge the star arc, gantry framing,
// signage flow, and the celebratory finish against the KayKit samples.
import * as THREE from 'three';
import { createScene } from '../src/scene.js';
import { place } from '../src/assets.js';
import { DECK, TOWER, SEG } from '../src/layout.js';
import { build } from '../src/props/decor.js';

const { scene, render } = createScene();

const group = new THREE.Group();
scene.add(group);

async function main() {
  // Context-only reference decks (the structure/pipes/hazard agents own the
  // real geometry; these just give the decor something to sit on).
  await place(group, ['platform_4x4x1', 'blue', SEG.conveyor.cx, 0, DECK.y]); // conveyor deck
  await place(group, ['platform_4x4x1', 'blue', 13, 0, DECK.y]);              // deck under gantry
  await place(group, ['platform_4x4x2', 'blue', SEG.finish.cx, 0, TOWER.deckY]); // finish tower deck
  // A start deck for the arrow stand to sit on.
  await place(group, ['platform_6x6x1', 'blue', SEG.start.cx, 0, DECK.y]);

  // The decor pass under test.
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
