// Particles preview: build the studio scene, drop a small platform for context,
// then fire a DEATH burst and a COIN sparkle and advance a few frames so both are
// caught mid-flight for the screenshot. Keeps an update+render loop afterwards so
// the bursts animate (and re-fire periodically) in a live browser.
import * as THREE from 'three';
import { createScene } from '../src/scene.js';
import { createEvents } from '../src/events.js';
import { createParticles } from '../src/effects/particles.js';

const { scene, camera, renderer, controls, render } = createScene();

// Close-in 3/4 view framed on where the two bursts go off.
camera.position.set(10, 8, 16);
const lookAt = new THREE.Vector3(1.5, 1.4, 0);
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

// Fire both bursts and step the sim so they're mid-flight for the still.
events.emit('death', { position: { x: 0, y: 1.5, z: 0 } });
events.emit('coin', { position: { x: 3, y: 1.5, z: 0 } });
for (let i = 0; i < 10; i++) fx.update(1 / 60);

render();
render();
window.__ready = true;

// Live loop: keep animating, and periodically re-fire so the preview never goes
// empty when viewed interactively.
let acc = 0;
let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  acc += dt;
  if (acc > 1.6) {
    acc = 0;
    events.emit('death', { position: { x: 0, y: 1.5, z: 0 } });
    events.emit('coin', { position: { x: 3, y: 1.5, z: 0 } });
  }
  fx.update(dt);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
