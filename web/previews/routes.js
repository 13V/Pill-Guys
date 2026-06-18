import { createScene } from '../src/scene.js';
import { initPhysics } from '../src/physics.js';
import { buildLevel } from '../src/levels/build.js';

// Spike: a Fall-Guys-style split — entry hub, then a SAFE left lane (z-3) and a
// RISKY right lane (z+3, spike gauntlet + bigger coin), rejoining at a hub.
const test = {
  name: 'Route Test', deckTop: 5, spawn: { x: 3, y: 6.2, z: 0 },
  decks: [
    { kind: 'platform', cx: 3, cz: 0, w: 6, d: 6, rails: true },   // entry hub x0..6
    { kind: 'strip', x0: 8, x1: 20, z: -3, w: 2 },                  // LEFT (safe) lane
    { kind: 'strip', x0: 8, x1: 20, z: 3, w: 2 },                   // RIGHT (risky) lane
    { kind: 'platform', cx: 24, cz: 0, w: 6, d: 6, rails: true },   // rejoin hub x21..27
    { kind: 'finish', cx: 30, cz: 0, w: 4, d: 4, top: 10 },
  ],
  hazards: [{ kind: 'spikes', cx: 14, cz: 3, size: 4 }],            // risky lane gauntlet
  coins: [{ x: 14, y: 6.2, z: -3 }, { x: 14, y: 6.6, z: 3 }],
  decor: [{ kind: 'arrow', cx: 5 }],
};

const { scene, camera, renderer, controls } = createScene();
if (controls) controls.enabled = false;
const physics = await initPhysics();
await buildLevel(test, { scene, physics });
camera.position.set(13, 17, 22);
camera.lookAt(13, 4, 0);
renderer.render(scene, camera);
window.__ready = true;
(function loop() { renderer.render(scene, camera); requestAnimationFrame(loop); })();
