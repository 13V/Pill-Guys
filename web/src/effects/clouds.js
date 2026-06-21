// CLOUDS — soft puffy stylised clouds drifting high over the stylised ocean, far
// above and to the sides/back of the course so they never crowd the playfield.
// Each cloud is a small THREE.Group of a few overlapping flattened spheres sharing
// one near-white MeshStandardMaterial (a touch of emissive so they glow softly and
// keep the flat "toy plastic" look). A gentle -X breeze drifts them all; when one
// sails off the front (x < -90) it wraps back to the far +X with a fresh random
// z/y so the loop never reads as an obvious repeat. Headless-safe — pure three.js
// geometry/material, no textures, no DOM.
//
//   import { createClouds } from './effects/clouds.js';
//   const clouds = createClouds(scene);  // ... clouds.update(dt) each frame
import * as THREE from 'three';

// How many cloud clumps to scatter across the sky.
const CLOUD_COUNT = 14;

// Spawn volume. Kept HIGH (well above the y≈0..14 playfield) and biased to the
// background/sides so nothing ever hangs directly over the gameplay lanes.
const Y_MIN = 25, Y_MAX = 58;     // cloud altitude band
const X_MIN = -70, X_MAX = 230;   // along-course spread (course is x ≈ -2..150)
const Z_MIN = -130, Z_MAX = 130;  // depth spread (course lanes are z ∈ [-3,3])

// Drift: a slow breeze toward -X with a little per-cloud variance (units/sec).
const DRIFT_MIN = 0.3, DRIFT_MAX = 0.8;

// Once a cloud passes this front edge it loops back to the far edge.
const WRAP_X_MIN = -90;   // recycle when x drops below here
const WRAP_X_MAX = 230;   // ...back to roughly here (re-randomised a touch)

const rand = (a, b) => a + Math.random() * (b - a);

// Re-place a cloud at a fresh background spot (used at spawn and on wrap). On wrap
// we pin x near the far edge; on first spawn x is randomised across the whole band.
function placeCloud(group, freshX) {
  group.position.set(
    freshX !== undefined ? freshX : rand(X_MIN, X_MAX),
    rand(Y_MIN, Y_MAX),
    rand(Z_MIN, Z_MAX),
  );
}

export function createClouds(scene) {
  const group = new THREE.Group();
  group.name = 'clouds';

  // Reused puff geometry (unit sphere, low poly — it's distant and soft). Each
  // puff is scaled wider than tall per-instance for the flattened toy-cloud look.
  const puffGeo = new THREE.SphereGeometry(1, 10, 8);

  // One shared near-white material for every puff: rough + faintly emissive so the
  // clouds read as soft glowing plastic rather than shiny or harshly lit.
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf6fbff,
    roughness: 0.9,
    metalness: 0.0,
    emissive: 0xffffff,
    emissiveIntensity: 0.15,
  });

  const clouds = []; // [{ group, speed }]

  for (let i = 0; i < CLOUD_COUNT; i++) {
    const cloud = new THREE.Group();

    // Overall scale of this clump (some small wisps, some big banks).
    const size = rand(0.7, 1.6);
    // 4–7 overlapping puffs, jittered around the clump centre.
    const puffs = 4 + Math.floor(Math.random() * 4);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(puffGeo, mat);
      // Cluster the puffs tightly so they read as one soft mass.
      puff.position.set(rand(-5, 5) * size, rand(-1.2, 1.2) * size, rand(-3.5, 3.5) * size);
      // Flattened: noticeably wider than tall -> stylised pancake cloud.
      const w = rand(3.2, 5.2) * size;
      puff.scale.set(w, rand(1.2, 2.0) * size, w * rand(0.7, 1.0));
      puff.castShadow = false;
      puff.receiveShadow = false;
      cloud.add(puff);
    }

    placeCloud(cloud);
    group.add(cloud);
    clouds.push({ group: cloud, speed: rand(DRIFT_MIN, DRIFT_MAX) });
  }

  scene.add(group);

  return {
    group,
    update(dt) {
      if (!Number.isFinite(dt)) return;
      for (const c of clouds) {
        c.group.position.x -= c.speed * dt;
        // Off the front edge -> recycle to the back at a fresh height/depth so the
        // wraparound never lines up obviously.
        if (c.group.position.x < WRAP_X_MIN) {
          placeCloud(c.group, rand(WRAP_X_MAX - 10, WRAP_X_MAX + 10));
          c.speed = rand(DRIFT_MIN, DRIFT_MAX);
        }
      }
    },
  };
}
