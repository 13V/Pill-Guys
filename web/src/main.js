import { createScene } from './scene.js';
import { buildVisualLevel } from './buildVisual.js';

// Static showcase entry (used by render.mjs for hero shots).
const { scene, render } = createScene();

await buildVisualLevel(scene);

render();
window.__ready = true;
console.log('[main] static showcase built');

(function loop() {
  render();
  requestAnimationFrame(loop);
})();
