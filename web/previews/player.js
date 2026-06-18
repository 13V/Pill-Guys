// Player preview / verification harness.
// Minimal scene: a single start-pad at deck top (y=5) with the pill guy spawned
// just above it. Runs a fixed-step loop (fixedUpdate -> stepOnce -> syncVisual)
// so we can screenshot seating and drive movement/jump from puppeteer.
import * as THREE from 'three';
import { createScene } from '../src/scene.js';
import { initPhysics, FIXED_DT } from '../src/physics.js';
import { createInput as createStubInput } from '../src/input.js'; // contract check (still a stub)
import { createPlayer } from '../src/player.js';

const { scene, camera, controls, renderer, render } = createScene();

const physics = await initPhysics();
// Start-pad: a solid box whose TOP surface is at y=5 (deck top), centered at x=3,z=0.
physics.addStaticBoxFromTop(3, 5, 0, 3, 1, 3);

// Matching visual mesh for the pad (preview only) so screenshots clearly show
// the pill resting ON the deck. Box is 6x1x6, top at y=5 -> center y=4.5.
const pad = new THREE.Mesh(
  new THREE.BoxGeometry(6, 1, 6),
  new THREE.MeshStandardMaterial({ color: 0x5b8dd6, roughness: 0.7, metalness: 0.05 })
);
pad.position.set(3, 4.5, 0);
pad.castShadow = true;
pad.receiveShadow = true;
scene.add(pad);

// The project input.js is still a stub (always returns 0), so for keyboard-driven
// verification we attach a small REAL keyboard input here. We still import the
// stub above to confirm createPlayer composes against the real module signature.
void createStubInput;
const input = createKeyboardInput();

const player = createPlayer(scene, physics, input, { x: 3, y: 6.5, z: 0 });

// Frame the start pad for a clear seating read (a bit higher/closer so the pad
// surface reads against the ground, not just the backdrop).
camera.position.set(9, 9.5, 10);
const lookAt = { x: 3, y: 5.2, z: 0 };
camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
if (controls) controls.target.set(lookAt.x, lookAt.y, lookAt.z);
if (controls) controls.update();

// Warm up so the pill settles onto the pad before the first screenshot.
for (let i = 0; i < 30; i++) {
  player.fixedUpdate(FIXED_DT, 0);
  physics.stepOnce();
  player.syncVisual();
}
render();

window.__ready = true;
window.__game = { player, physics, scene, camera, input };
// Debug/test hook so the headless driver can read live input state and (as a
// reliable fallback to synthetic key events) drive held keys / jump directly.
window.__input = input;

// Drive the fixed-step sim from a wall-clock accumulator (mirrors src/game.js)
// rather than requestAnimationFrame — rAF is throttled hard in headless Chromium,
// which would starve the physics step. A setInterval tick keeps real time moving.
let last = performance.now();
let acc = 0;
function tick() {
  const now = performance.now();
  acc += Math.min((now - last) / 1000, 0.1);
  last = now;
  let guard = 0;
  while (acc >= FIXED_DT && guard++ < 8) {
    player.fixedUpdate(FIXED_DT, 0);
    physics.stepOnce();
    player.syncVisual();
    acc -= FIXED_DT;
  }
}
setInterval(tick, 8);

// Keep rendering on rAF (cheap, only affects what a screenshot shows).
function draw() {
  renderer.render(scene, camera);
  requestAnimationFrame(draw);
}
draw();

// --- Minimal real keyboard input (mirrors src/input.js contract) ------------
function createKeyboardInput() {
  const held = new Set();
  let jumpQueued = false;
  const isJump = (c) => c === 'Space' || c === 'KeyW' || c === 'ArrowUp';
  const onDown = (e) => {
    held.add(e.code);
    if (isJump(e.code) && !e.repeat) jumpQueued = true;
  };
  const onUp = (e) => held.delete(e.code);
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  const axis = (neg, pos) => (held.has(neg) ? -1 : 0) + (held.has(pos) ? 1 : 0);
  return {
    axisX: () => axis('KeyA', 'KeyD') + axis('ArrowLeft', 'ArrowRight'),
    axisZ: () => axis('KeyW', 'KeyS') + axis('ArrowUp', 'ArrowDown'),
    jumpHeld: () => held.has('Space') || held.has('KeyW') || held.has('ArrowUp'),
    consumeJump: () => {
      const q = jumpQueued;
      jumpQueued = false;
      return q;
    },
    restartPressed: () => false,
    dispose() {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    },
    // --- Test helpers (headless driver) so verification doesn't depend on
    // synthetic-key focus quirks. ---
    _setHeld: (code, down) => { if (down) held.add(code); else held.delete(code); },
    _queueJump: () => { jumpQueued = true; },
    _held: () => [...held],
  };
}
