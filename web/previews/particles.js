// Particles preview: build the studio scene, drop a small platform for context,
// then fire a DEATH burst and a COIN sparkle and advance a fixed number of frames
// so both bursts are mid-flight, set __ready, and keep a live update+render loop.
//
// The live loop re-fires both bursts on a short cadence (shorter than a burst's
// lifetime) so there are ALWAYS bits in flight — that way the headless screenshot,
// which is captured ~1.2s after __ready, reliably catches a lively mid-burst frame
// instead of an empty one.
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

function fire() {
  events.emit('death', { position: { x: 0, y: 1.6, z: 0 } });
  events.emit('coin', { position: { x: 3.4, y: 1.6, z: 0 } });
}

// Fire both bursts and step the sim so they're mid-flight for the still.
fire();
for (let i = 0; i < 10; i++) fx.update(1 / 60);

render();
render();
window.__ready = true;

// Live loop: advance with a sane per-frame dt and re-fire often enough that there
// are ALWAYS bits in flight, so the headless screenshot (taken ~1.2s after __ready)
// can't land on an empty frame. We derive dt from the rAF timestamp itself (not
// performance.now(), whose time origin can differ from rAF's in headless Chromium),
// and clamp it to a safe positive range.
let acc = 0;
let last = -1;
function loop(now) {
  let dt = last < 0 ? 1 / 60 : (now - last) / 1000;
  last = now;
  if (!(dt > 0) || dt > 0.05) dt = Math.min(Math.max(dt, 1 / 120), 0.05);
  acc += dt;
  if (acc >= 0.3) { acc = 0; fire(); } // death lasts ~0.6s; 0.3s cadence overlaps
  fx.update(dt);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
