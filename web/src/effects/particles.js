// PARTICLES — bursts for death + coin pickup. Owned by the PARTICLES agent.
//
// export function createParticles(scene, events) -> { update(dt) }
//   On 'death' {position}: a burst of ~18-24 small bits (cheerful reds + whites)
//     that shoot outward with random velocities, are pulled down by gravity, and
//     fade + shrink out over ~0.6s.
//   On 'coin' {position}: a quick small sparkle pop (~8 bright-yellow bits, ~0.35s).
//   On 'land' {position, hard}: a low, soft ground dust puff under the feet that
//     splays outward nearly horizontally and settles (~6-10 bits, or ~12-16 + a
//     touch faster when `hard`), short life ~0.35-0.5s.
//   On 'finish' {position}: a celebratory confetti burst (~40-60 bright toy-colored
//     bits) that shoots up and out with a strong upward bias, slow gravity, and a
//     gentle flutter so it hangs in the air ~1.0-1.5s like a party popper.
//
// Implementation: ONE pooled THREE.Points backed by a single BufferGeometry with
// per-point position / color / size / alpha attributes, drawn with a tiny
// ShaderMaterial (soft round sprite, alpha-blended, no depth-write, no shadows). A CPU-side pool of
// particle records holds velocity + lifetime; update(dt) integrates motion, applies
// gravity, fades/shrinks, culls dead bits, and repacks the live ones into the buffers.
// Total live particles are hard-capped so the effect always stays cheap.
import * as THREE from 'three';

const MAX_PARTICLES = 320; // hard cap on simultaneously-live bits (room for a full confetti burst + other effects)
const GRAVITY = 9.0; // downward accel (units/s^2) applied to every bit

// Cheerful death palette: punchy saturated reds + crisp whites. The reds are kept
// vivid so they pop against either the light studio sky or darker level geometry;
// the whites read as bright sparks over the dark pieces and as soft glints on sky.
const DEATH_COLORS = [
  new THREE.Color('#ff2a1f'), // vivid red
  new THREE.Color('#ff4a3a'), // warm coral red
  new THREE.Color('#ff1e48'), // pink-red
  new THREE.Color('#ffffff'), // white
  new THREE.Color('#ffd9d9'), // warm white-pink
];
// Coin sparkle palette: bright, saturated golds/yellows that stay legible on light.
const COIN_COLORS = [
  new THREE.Color('#ffcf1a'), // bright gold-yellow
  new THREE.Color('#ffb300'), // amber gold
  new THREE.Color('#fff27a'), // pale highlight
];
// Landing dust palette: pale greys + warm whites that read as soft kicked-up dust
// over both the light studio sky and darker level geometry.
const DUST_COLORS = [
  new THREE.Color('#e9eef3'), // pale cool grey
  new THREE.Color('#d7dde6'), // soft grey
  new THREE.Color('#ffffff'), // white
];
// Finish confetti palette: bright saturated toy colors — reds, blues, yellows,
// greens, pinks + white — for a party-popper celebration burst.
const CONFETTI_COLORS = [
  new THREE.Color('#ff3b30'), // red
  new THREE.Color('#ff2d78'), // pink
  new THREE.Color('#2e7dff'), // blue
  new THREE.Color('#ffd21a'), // yellow
  new THREE.Color('#2ecc55'), // green
  new THREE.Color('#ffffff'), // white
];

export function createParticles(scene, events) {
  // --- Pooled geometry: fixed-capacity attribute buffers, only `draw count`
  // vertices are rendered each frame (we keep the live bits packed at the front).
  const positions = new Float32Array(MAX_PARTICLES * 3);
  const colors = new Float32Array(MAX_PARTICLES * 3);
  const sizes = new Float32Array(MAX_PARTICLES);
  const alphas = new Float32Array(MAX_PARTICLES);

  const geometry = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage);
  const colAttr = new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage);
  const sizeAttr = new THREE.BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage);
  const alphaAttr = new THREE.BufferAttribute(alphas, 1).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', posAttr);
  geometry.setAttribute('aColor', colAttr);
  geometry.setAttribute('aSize', sizeAttr);
  geometry.setAttribute('aAlpha', alphaAttr);
  geometry.setDrawRange(0, 0);
  // Generous bounding sphere so bits are never frustum-culled mid-flight (we move
  // points on the CPU without recomputing bounds every frame).
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(15, 4, 0), 1000);

  // Soft round glow sprite so each point reads as a little ball of light, not a square.
  const sprite = makeSpriteTexture();

  // ShaderMaterial: size attenuates with distance; per-point color + alpha; soft
  // circular falloff from the sprite. Alpha-blended + no depth-write keeps the burst
  // soft and order-independent over the scene without writing to the depth buffer.
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: sprite },
      uScale: { value: 1.0 }, // recomputed from viewport so world `aSize` reads consistently
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aAlpha;
      uniform float uScale;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = aColor;
        vAlpha = aAlpha;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        // Perspective size attenuation: closer bits are bigger.
        gl_PointSize = aSize * uScale / max(-mvPosition.z, 0.001);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTexture;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec4 tex = texture2D(uTexture, gl_PointCoord);
        gl_FragColor = vec4(vColor, vAlpha) * tex;
        if (gl_FragColor.a < 0.01) discard;
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    // Normal (alpha) blending rather than additive: additive bits vanish against
    // the scene's near-white studio backdrop (white + color clamps to white),
    // whereas alpha-blended saturated bits stay crisp and on-palette over both the
    // light sky and darker level geometry.
    blending: THREE.NormalBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 10; // draw above the scene / AO pool
  // Never participate in shadows.
  points.castShadow = false;
  points.receiveShadow = false;
  scene.add(points);

  // Keep the point-size scale in sync with the render height so bits look the same
  // physical size regardless of viewport (gl_PointSize is in device pixels).
  function updateScale() {
    const h = (typeof window !== 'undefined' && window.innerHeight) || 900;
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio)
      ? Math.min(window.devicePixelRatio, 2)
      : 1;
    material.uniforms.uScale.value = h * dpr * 0.5;
  }
  updateScale();
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('resize', updateScale);
  }

  // --- CPU pool of live particles, packed at the front of `pool` [0, count).
  // Each slot is reused; only `count` records are alive at any time.
  const pool = new Array(MAX_PARTICLES);
  for (let i = 0; i < MAX_PARTICLES; i++) {
    pool[i] = {
      px: 0, py: 0, pz: 0,
      vx: 0, vy: 0, vz: 0,
      r: 1, g: 1, b: 1,
      size: 1,
      drag: 0, // per-second velocity damping (helps the sparkle feel "poppy")
      gravity: GRAVITY,
      life: 0, // seconds remaining
      maxLife: 1,
    };
  }
  let count = 0;

  function spawn(x, y, z, vx, vy, vz, color, size, life, gravity, drag) {
    if (count >= MAX_PARTICLES) return; // respect the cap; drop overflow
    const p = pool[count++];
    p.px = x; p.py = y; p.pz = z;
    p.vx = vx; p.vy = vy; p.vz = vz;
    p.r = color.r; p.g = color.g; p.b = color.b;
    p.size = size;
    p.life = life;
    p.maxLife = life;
    p.gravity = gravity;
    p.drag = drag;
  }

  // --- DEATH BURST: ~18-24 reds/whites blasting outward in a full sphere, with a
  // touch of extra upward bias so it pops up before raining down. Lifetime ~0.6s,
  // fades + shrinks to nothing.
  function emitDeath(pos) {
    if (!pos) return;
    const n = 18 + Math.floor(Math.random() * 7); // 18..24
    for (let i = 0; i < n; i++) {
      // Random direction on a sphere.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const sinPhi = Math.sin(phi);
      const dx = sinPhi * Math.cos(theta);
      const dy = Math.cos(phi);
      const dz = sinPhi * Math.sin(theta);
      const speed = 3.2 + Math.random() * 3.8; // 3.2..7.0 units/s
      const vx = dx * speed;
      const vy = dy * speed + 2.6; // upward bias so the burst lifts first
      const vz = dz * speed;
      const color = DEATH_COLORS[(Math.random() * DEATH_COLORS.length) | 0];
      const size = 0.22 + Math.random() * 0.2; // small bits (~0.22..0.42)
      const life = 0.5 + Math.random() * 0.2; // ~0.5..0.7s, centered on 0.6
      // Spawn slightly jittered around the death point so the origin isn't a dot.
      spawn(
        pos.x + (Math.random() - 0.5) * 0.2,
        pos.y + (Math.random() - 0.5) * 0.2,
        pos.z + (Math.random() - 0.5) * 0.2,
        vx, vy, vz, color, size, life, GRAVITY, 0.4,
      );
    }
  }

  // --- COIN SPARKLE: a quick, tight pop of ~8 bright-yellow bits. Short life
  // (~0.35s), light gravity + a bit of drag so it feels like a snappy twinkle
  // rather than a heavy spray.
  function emitCoin(pos) {
    if (!pos) return;
    const n = 8;
    for (let i = 0; i < n; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const sinPhi = Math.sin(phi);
      const dx = sinPhi * Math.cos(theta);
      const dy = Math.cos(phi);
      const dz = sinPhi * Math.sin(theta);
      const speed = 1.8 + Math.random() * 1.8; // 1.8..3.6 units/s — tight pop
      const vx = dx * speed;
      const vy = dy * speed + 1.2; // gentle upward bias
      const vz = dz * speed;
      const color = COIN_COLORS[(Math.random() * COIN_COLORS.length) | 0];
      const size = 0.18 + Math.random() * 0.12; // small, twinkly (~0.18..0.30)
      const life = 0.28 + Math.random() * 0.14; // ~0.28..0.42s, centered ~0.35
      spawn(
        pos.x + (Math.random() - 0.5) * 0.12,
        pos.y + (Math.random() - 0.5) * 0.12,
        pos.z + (Math.random() - 0.5) * 0.12,
        vx, vy, vz, color, size, life, 4.5, 1.2,
      );
    }
  }

  // --- LAND DUST PUFF: a small, soft ground puff kicked up under the player's
  // feet on landing. Pale dust bits splay OUTWARD nearly horizontally (low vy,
  // mostly XZ), short life (~0.35..0.5s), light gravity + a bit of drag so they
  // settle quickly. A `hard` landing makes it bigger/faster; otherwise it's subtle.
  function emitLand(land) {
    if (!land || !land.position) return;
    const pos = land.position;
    const hard = !!land.hard;
    const n = hard ? 12 + Math.floor(Math.random() * 5) // 12..16 on a hard landing
                   : 6 + Math.floor(Math.random() * 5); // 6..10 normally
    // Feet are ~0.75 below the player's center; spawn the puff low at the ground.
    const fy = pos.y - 0.7;
    for (let i = 0; i < n; i++) {
      // Mostly-horizontal direction: pick a heading in XZ, splay out flat.
      const theta = Math.random() * Math.PI * 2;
      const dx = Math.cos(theta);
      const dz = Math.sin(theta);
      const speed = hard ? 2.6 + Math.random() * 2.0 // 2.6..4.6 — a touch faster
                         : 1.6 + Math.random() * 1.6; // 1.6..3.2 — subtle
      const vx = dx * speed;
      const vy = 0.4 + Math.random() * 0.7; // low upward so it puffs, not sprays
      const vz = dz * speed;
      const color = DUST_COLORS[(Math.random() * DUST_COLORS.length) | 0];
      const size = hard
        ? 0.26 + Math.random() * 0.22 // bigger bits (~0.26..0.48)
        : 0.2 + Math.random() * 0.16; // small soft bits (~0.20..0.36)
      const life = 0.35 + Math.random() * 0.15; // ~0.35..0.5s
      // Jitter around the feet, wider on the ground plane than vertically.
      spawn(
        pos.x + (Math.random() - 0.5) * 0.3,
        fy + (Math.random() - 0.5) * 0.12,
        pos.z + (Math.random() - 0.5) * 0.3,
        vx, vy, vz, color, size, life, 4.0, 2.4, // light gravity, fair bit of drag so they settle
      );
    }
  }

  // --- FINISH CONFETTI: a celebratory party-popper burst of ~40-60 bright bits
  // shooting UP and outward with a strong upward bias. Slower gravity than the
  // death bits (so they hang + flutter), longer life (~1.0..1.5s), and mild drag
  // plus a little random sideways velocity so they drift instead of going straight up.
  function emitFinish(pos) {
    if (!pos) return;
    const n = 40 + Math.floor(Math.random() * 21); // 40..60
    // Spawn a bit above the finish point so the confetti rains down over it.
    const cy = pos.y + 1;
    for (let i = 0; i < n; i++) {
      // Direction on a sphere, but heavily biased upward via the velocity below.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const sinPhi = Math.sin(phi);
      const dx = sinPhi * Math.cos(theta);
      const dy = Math.cos(phi);
      const dz = sinPhi * Math.sin(theta);
      const speed = 2.6 + Math.random() * 3.4; // 2.6..6.0 units/s
      const vx = dx * speed + (Math.random() - 0.5) * 1.6; // little sideways flutter
      const vy = Math.abs(dy * speed) + 4.5 + Math.random() * 2.0; // strong upward bias
      const vz = dz * speed + (Math.random() - 0.5) * 1.6;
      const color = CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0];
      const size = 0.2 + Math.random() * 0.18; // small confetti bits (~0.20..0.38)
      const life = 1.0 + Math.random() * 0.5; // ~1.0..1.5s — they hang and flutter
      spawn(
        pos.x + (Math.random() - 0.5) * 0.3,
        cy + (Math.random() - 0.5) * 0.3,
        pos.z + (Math.random() - 0.5) * 0.3,
        vx, vy, vz, color, size, life, 3.5, 0.9, // slower gravity + gentle drag so they flutter down
      );
    }
  }

  // Subscribe in the constructor. Keep the unsubscribe handles for dispose().
  const offDeath = events.on('death', ({ position }) => emitDeath(position));
  const offCoin = events.on('coin', ({ position }) => emitCoin(position));
  const offLand = events.on('land', (land) => emitLand(land));
  const offFinish = events.on('finish', ({ position }) => emitFinish(position));

  function update(dt) {
    if (count === 0) {
      geometry.setDrawRange(0, 0);
      return;
    }
    // Clamp dt into [0, 0.05]: caps a long pause / tab-switch so bits can't be
    // flung across the level, and guards against a negative/NaN dt (which would
    // integrate motion backward and keep particles from ever expiring).
    const step = dt > 0 ? (dt < 0.05 ? dt : 0.05) : 0;

    let i = 0;
    let write = 0;
    while (i < count) {
      const p = pool[i];
      p.life -= step;
      if (p.life <= 0) {
        // Dead: drop by swapping the last live record into this slot. The records
        // are object slots in `pool`, so swap by copying fields (no allocation).
        count--;
        if (i !== count) copyParticle(pool[count], p);
        continue; // re-process the swapped-in record at the same index
      }

      // Integrate: gravity then position; apply mild exponential drag.
      p.vy -= p.gravity * step;
      if (p.drag > 0) {
        const damp = Math.max(0, 1 - p.drag * step);
        p.vx *= damp; p.vy *= damp; p.vz *= damp;
      }
      p.px += p.vx * step;
      p.py += p.vy * step;
      p.pz += p.vz * step;

      // Fade + shrink over remaining life. ease = 1 at birth -> 0 at death.
      const t = p.life / p.maxLife; // 1 -> 0
      const ease = t * t; // ease-out so bits linger bright then snap away
      const alpha = Math.min(1, t * 1.4); // hold near-full, fade at the tail

      const o = write * 3;
      positions[o] = p.px;
      positions[o + 1] = p.py;
      positions[o + 2] = p.pz;
      colors[o] = p.r;
      colors[o + 1] = p.g;
      colors[o + 2] = p.b;
      sizes[write] = p.size * (0.35 + 0.65 * ease); // shrink toward (not fully to) zero
      alphas[write] = alpha;

      write++;
      i++;
    }

    geometry.setDrawRange(0, write);
    if (write > 0) {
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;
    }
  }

  function dispose() {
    offDeath && offDeath();
    offCoin && offCoin();
    offLand && offLand();
    offFinish && offFinish();
    scene.remove(points);
    geometry.dispose();
    material.dispose();
    sprite.dispose();
    count = 0;
  }

  return { update, dispose, points };
}

// Copy one particle record's fields into another (reused slot, no allocation).
function copyParticle(src, dst) {
  dst.px = src.px; dst.py = src.py; dst.pz = src.pz;
  dst.vx = src.vx; dst.vy = src.vy; dst.vz = src.vz;
  dst.r = src.r; dst.g = src.g; dst.b = src.b;
  dst.size = src.size;
  dst.drag = src.drag;
  dst.gravity = src.gravity;
  dst.life = src.life;
  dst.maxLife = src.maxLife;
}

// Soft round glow sprite: bright opaque core fading to transparent at the rim, so
// points read as little soft balls of light instead of hard squares.
function makeSpriteTexture() {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.25)');
  g.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
