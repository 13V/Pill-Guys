// FEEL harness — an ISOLATED rig for tuning + measuring the pill guy's movement.
// Builds the real scene/physics/colliders, wires the input + event bus, and
// exposes window.__h with a manual `step(n)` so a puppeteer driver can advance
// the simulation deterministically (rAF is throttled headless).
import { createScene } from '../src/scene.js';
import { initPhysics, FIXED_DT } from '../src/physics.js';
import { buildColliders } from '../src/colliders.js';
import { createInput } from '../src/input.js';
import { createPlayer } from '../src/player.js';
import { createEvents } from '../src/events.js';

const { scene, camera, renderer } = createScene();
const physics = await initPhysics();
const world = buildColliders(physics, scene);
const input = createInput();
const events = createEvents();

let jumps = 0;
let lands = 0;
events.on('jump', () => jumps++);
events.on('land', () => lands++);

const player = createPlayer(scene, physics, input, world.spawn, events);

window.__h = {
  player,
  physics,
  input,
  events,
  FIXED_DT,
  get jumps() { return jumps; },
  get lands() { return lands; },
  // Advance the whole fixed pipeline n substeps: read input -> queue move ->
  // step physics -> sync the visual. Mirrors the game loop's fixed cadence.
  step(n) {
    for (let i = 0; i < n; i++) {
      player.fixedUpdate(FIXED_DT, 0);
      physics.stepOnce();
      player.syncVisual();
    }
  },
};

// Settle onto the start pad so y is at rest before any measurement.
window.__h.step(15);
window.__ready = true;

// A light render loop so the page is alive (and renderable if anyone looks).
function loop() {
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
