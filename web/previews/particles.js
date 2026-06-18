// Particles preview: build the studio scene, drop a small platform for context,
// then fire a DEATH burst and a COIN sparkle and advance a fixed number of frames
// so both bursts are caught mid-flight for the screenshot.
//
// Determinism note: we advance the sim a FIXED number of update() steps and then
// freeze (the post-ready loop only re-renders; it does not advance or re-emit).
// That keeps the still reproducible — the headless screenshot always shows the
// same mid-flight moment regardless of when it's captured.
import * as THREE from 'three';
import { createScene } from '../src/scene.js';
import { createEvents } from '../src/events.js';
import { createParticles } from '../src/effects/particles.js';

const { scene, camera, renderer, controls, render } = createScene();

// Close-in 3/4 view framed on where the two bursts go off.
camera.position.set(9, 7, 15);
const lookAt = new THREE.Vector3(1.5, 1.6, 0);
camera.lookAt(lookAt);
if (controls) controls.target.copy(lookAt);

// A simple platform under the bursts for visual context / grounding.
const platform = new THREE.Mesh(
  new THREE.BoxGeometry(8, 1, 4),
  new THREE.MeshStandardMaterial({ color: 0x6ea8ff, roughness: 0.7, metalness: 0 })
);
platform.position.set(1.5, 0, 0);
platform.castShadow = true;
platform.receiveShadow = true;
scene.add(platform);

const events = createEvents();
const fx = createParticles(scene, events);

// Expose for headless diagnostics / browser-console debugging.
window.__fx = fx;
window.__scene = scene;

// Fire both bursts and step the sim so they're mid-flight for the still.
events.emit('death', { position: { x: 0, y: 1.6, z: 0 } });
events.emit('coin', { position: { x: 3.4, y: 1.6, z: 0 } });
for (let i = 0; i < 10; i++) fx.update(1 / 60);

render();
render();
window.__ready = true;

// Live, interactive loop: re-fire periodically so the page keeps showing bursts
// when viewed in a real browser. (The headless still is already captured from the
// frozen 10-step state above; this loop is for human viewing only.)
let acc = 0;
let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  acc += dt;
  if (acc >= 0.9) {
    acc = 0;
    events.emit('death', { position: { x: 0, y: 1.6, z: 0 } });
    events.emit('coin', { position: { x: 3.4, y: 1.6, z: 0 } });
  }
  fx.update(dt);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
