// SEA SPARKLE — shimmering sun-glints scattered across the stylised ocean. A
// single additive THREE.Points cloud (one draw call) sitting just above the sea
// surface; each glint twinkles independently (per-point phase) and the whole
// field drifts very slowly along +X and wraps, selling a sunlit, restless sea.
// The immediate playfield (lanes) is kept clear so the glitter never distracts.
//
//   import { createSeaSparkle } from './effects/seaSparkle.js';
//   const sparkle = createSeaSparkle(scene); // ... sparkle.update(dt) each frame
import * as THREE from 'three';
import { SEA_LEVEL } from './ocean.js';

const COUNT = 200;              // tiny bright glints — cheap as one Points cloud
const Y = SEA_LEVEL + 0.06;     // float a hair above the water so they read clearly
// Wide spread across the sea; X span doubles as the drift/wrap window.
const X_MIN = -60, X_MAX = 230;
const Z_MIN = -150, Z_MAX = 150;
// Keep the lane area clear: no glints with |z| < this AND x inside the course.
const CLEAR_Z = 13, CLEAR_X_MIN = -5, CLEAR_X_MAX = 155;
const DRIFT = 1.6;              // m/s — very slow scroll along +X
const X_SPAN = X_MAX - X_MIN;

export function createSeaSparkle(scene) {
  const positions = new Float32Array(COUNT * 3);
  const phases = new Float32Array(COUNT);    // per-point twinkle offset
  const speeds = new Float32Array(COUNT);    // per-point twinkle rate

  // Rejection-sample positions so none land on the lanes.
  for (let i = 0; i < COUNT; i++) {
    let x, z;
    do {
      x = X_MIN + Math.random() * X_SPAN;
      z = Z_MIN + Math.random() * (Z_MAX - Z_MIN);
    } while (Math.abs(z) < CLEAR_Z && x > CLEAR_X_MIN && x < CLEAR_X_MAX);
    positions[i * 3] = x;
    positions[i * 3 + 1] = Y;
    positions[i * 3 + 2] = z;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 1.6 + Math.random() * 2.4;   // each glint twinkles at its own pace
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.55,
    sizeAttenuation: true,
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Per-point twinkle: multiply each glint's alpha by a sine of (time + phase),
  // so they fade in/out individually rather than all together. Cheap — still one
  // draw call, just a tweaked built-in points shader.
  const uniforms = { uTime: { value: 0 } };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', /* glsl */`
        #include <common>
        uniform float uTime;
        attribute float aPhase;
        attribute float aSpeed;
        varying float vTwinkle;`)
      .replace('#include <begin_vertex>', /* glsl */`
        #include <begin_vertex>
        // 0..1 sparkle envelope, sharpened so glints spend more time dim than lit.
        float s = sin(uTime * aSpeed + aPhase) * 0.5 + 0.5;
        vTwinkle = s * s;`)
      // Shrink dim points too, so they don't just dim to a faint square but
      // genuinely twinkle out (and back).
      .replace('gl_PointSize = size;', 'gl_PointSize = size * (0.35 + 0.65 * vTwinkle);');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', /* glsl */`
        #include <common>
        varying float vTwinkle;`)
      // Soften the square point into a round glint and apply the twinkle alpha.
      .replace('#include <opaque_fragment>', /* glsl */`
        vec2 _c = gl_PointCoord - vec2(0.5);
        float _r = dot(_c, _c);
        float _mask = smoothstep(0.25, 0.0, _r);
        diffuseColor.a *= _mask * vTwinkle;
        if (diffuseColor.a < 0.01) discard;
        #include <opaque_fragment>`);
  };

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;   // spans the whole sea; never pop out at edges
  points.renderOrder = 2;         // draw over the water surface
  scene.add(points);

  let t = 0;
  return {
    update(dt) {
      const d = (typeof dt === 'number' && isFinite(dt)) ? dt : 0;
      t += d;
      uniforms.uTime.value = t;
      // Gentle global shimmer on top of the per-point twinkle.
      mat.opacity = 0.8 + 0.2 * Math.sin(t * 0.7);
      // Very slow scroll along +X, wrapped within the field so it tiles seamlessly.
      points.position.x = (t * DRIFT) % X_SPAN;
    },
  };
}
