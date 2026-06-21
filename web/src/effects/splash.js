// SPLASH — the cartoon water splash when a bean plops into the sea. Owned by the
// SPLASH agent. Listens for deaths at the waterline and fires a quick, punchy plop:
// a burst of droplets that shoot up + out and rain back down, plus an expanding
// flat foam ring spreading across the surface. Reads against the stylised ocean
// (see ocean.js) and the bright toy palette.
//
//   import { createSplash } from './effects/splash.js';
//   const splash = createSplash(scene, events);  // ... splash.update(dt) each frame
//
// On 'death' {position}: if the bean died at/near the sea surface
// (position.y < SEA_LEVEL + 1.6) we centre a splash at (x, SEA_LEVEL, z):
//   • ~18-26 small droplets (a pooled THREE.Points cloud) blast UP + OUTWARD then
//     fall under gravity, white -> pale-blue, shrinking + fading over ~0.7s.
//   • an expanding flat translucent foam RING lying on the surface (a thin ring mesh
//     at y = SEA_LEVEL+0.03, rotated flat) growing r~0.3 -> ~2.5 and fading over ~0.7s.
//
// Implementation: a small POOL of reused splash slots, each owning its own droplet
// Points + foam ring mesh. Everything is added to `scene` once up front (hidden) and
// just toggled/animated — repeated deaths recycle a free slot with NO per-death
// allocations. update(dt) integrates the live droplets (gravity ~ -22), grows/fades
// the ring, and retires finished splashes. No shadows, no depthWrite; headless-safe
// (pure three, the droplet sprite falls back to a data texture when there's no DOM).
import * as THREE from 'three';
import { SEA_LEVEL } from './ocean.js';

const POOL_SIZE = 6;          // concurrent splashes (deaths near water are rare + brief)
const MAX_DROPLETS = 26;      // per-splash droplet budget (we spawn 18..26)
const GRAVITY = 22;           // downward accel (units/s^2) pulling droplets back down
const LIFE = 0.7;             // droplet + ring lifetime (s) — quick and snappy
const WATERLINE_BAND = 1.6;   // only splash for deaths within this height of the surface

const RING_Y = SEA_LEVEL + 0.03; // foam ring sits just above the surface to avoid z-fight
const RING_R0 = 0.3;             // foam ring start radius
const RING_R1 = 2.5;             // foam ring end radius

// White -> pale-blue droplet colours: bright water spray that reads on the deep-blue sea.
const DROP_COLORS = [
  new THREE.Color('#ffffff'), // white
  new THREE.Color('#dcf1ff'), // pale blue
  new THREE.Color('#bfe3ff'), // foam blue
];

export function createSplash(scene, events) {
  // Shared soft round sprite for the droplets (built once, reused by every slot's
  // Points material). Falls back to a data texture in headless / no-DOM contexts.
  const sprite = makeSoftSprite();

  // Shared foam-ring material: a flat translucent annulus, additive-ish bright foam.
  // depthWrite off + renderOrder high so it lays over the water without z-fighting,
  // and never writes depth (keeps droplets/scene behind it crisp). Each slot clones
  // this so it can fade its own opacity independently.
  const ringBaseMat = new THREE.MeshBasicMaterial({
    color: 0xbfe3ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false, // keep the foam crisp/bright rather than tone-mapped grey
  });

  // A unit ring (inner 0.62..outer 1.0) we scale per-frame to grow the foam outward.
  // Built once and shared by every slot's mesh (geometry is read-only here).
  const ringGeo = new THREE.RingGeometry(0.62, 1.0, 40);
  ringGeo.rotateX(-Math.PI / 2); // lie flat on the sea surface (local +Y -> world +Y)

  // --- The pool: each slot is a fully self-contained, reusable splash.
  const slots = new Array(POOL_SIZE);
  for (let i = 0; i < POOL_SIZE; i++) {
    slots[i] = makeSlot(scene, sprite, ringBaseMat, ringGeo);
  }

  // Spawn (recycle) a splash centred at (x, SEA_LEVEL, z). Picks the first free slot;
  // if all are busy we overwrite the oldest so a fresh death always gets a splash.
  function spawn(x, z) {
    let slot = null;
    let oldest = null;
    let oldestT = -1;
    for (let i = 0; i < POOL_SIZE; i++) {
      const s = slots[i];
      if (!s.active) { slot = s; break; }
      if (s.t > oldestT) { oldestT = s.t; oldest = s; }
    }
    if (!slot) slot = oldest; // all busy -> steal the longest-running one
    if (!slot) return;
    igniteSlot(slot, x, z);
  }

  // Subscribe to deaths; only splash for ones at/near the waterline. Keep the
  // unsubscribe handle for dispose().
  const offDeath = events.on('death', ({ position }) => {
    if (!position) return;
    if (!(position.y < SEA_LEVEL + WATERLINE_BAND)) return; // died up on a deck, no plop
    spawn(position.x, position.z);
  });

  function update(dt) {
    // Clamp dt into [0, 0.05]: caps a long pause / tab-switch so droplets can't be
    // flung off, and rejects a negative/NaN dt (which would integrate backward and
    // keep splashes from ever expiring).
    const step = dt > 0 ? (dt < 0.05 ? dt : 0.05) : 0;
    if (step === 0) return;
    for (let i = 0; i < POOL_SIZE; i++) {
      const s = slots[i];
      if (s.active) advanceSlot(s, step);
    }
  }

  function dispose() {
    if (offDeath) offDeath();
    for (let i = 0; i < POOL_SIZE; i++) {
      const s = slots[i];
      scene.remove(s.points);
      scene.remove(s.ring);
      s.geometry.dispose();
      s.ring.material.dispose();
    }
    ringGeo.dispose();
    ringBaseMat.dispose();
    sprite.dispose();
  }

  return { update, dispose };
}

// ---- one pooled splash slot -------------------------------------------------

// Build a single reusable slot: its own droplet Points (fixed-capacity buffers) and
// its own flat foam-ring mesh. Both are added to the scene now and left hidden until
// the slot is ignited.
function makeSlot(scene, sprite, ringBaseMat, ringGeo) {
  // Droplet buffers — capacity MAX_DROPLETS, only `count` points drawn each frame.
  const positions = new Float32Array(MAX_DROPLETS * 3);
  const colors = new Float32Array(MAX_DROPLETS * 3);
  const sizes = new Float32Array(MAX_DROPLETS);
  const alphas = new Float32Array(MAX_DROPLETS);

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
  // Generous bounding sphere so droplets are never frustum-culled mid-flight (we move
  // them on the CPU without recomputing bounds). Recentred on ignite.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, SEA_LEVEL, 0), 1000);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: sprite },
      uScale: { value: 1.0 }, // device-pixel scale so world `aSize` reads consistently
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
        // Perspective size attenuation: closer droplets are bigger.
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
    blending: THREE.NormalBlending, // alpha-blended spray stays crisp over the sea
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 10; // draw above the scene / ocean
  points.castShadow = false;
  points.receiveShadow = false;
  points.visible = false;
  scene.add(points);

  // Foam ring: shares the unit geometry, owns a cloned material so it fades alone.
  const ring = new THREE.Mesh(ringGeo, ringBaseMat.clone());
  ring.frustumCulled = false;
  ring.renderOrder = 9; // over the ocean, under the droplet spray
  ring.castShadow = false;
  ring.receiveShadow = false;
  ring.visible = false;
  ring.position.y = RING_Y;
  scene.add(ring);

  // CPU droplet records (reused in place each ignite — no per-death allocation).
  const drops = new Array(MAX_DROPLETS);
  for (let i = 0; i < MAX_DROPLETS; i++) {
    drops[i] = { px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0, r: 1, g: 1, b: 1, size: 1 };
  }

  const slot = {
    active: false,
    t: 0,            // seconds since ignite
    count: 0,        // live droplet count for this firing
    cx: 0, cz: 0,    // splash centre (world XZ)
    geometry, material, points,
    posAttr, colAttr, sizeAttr, alphaAttr,
    positions, colors, sizes, alphas,
    ring,
    drops,
  };

  // Keep the droplet point-size scale synced to the render height so droplets look
  // the same physical size at any viewport (gl_PointSize is in device pixels).
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

  return slot;
}

// Fire a slot: seed its droplets + ring at (x, SEA_LEVEL, z) and make it visible.
function igniteSlot(slot, x, z) {
  slot.active = true;
  slot.t = 0;
  slot.cx = x;
  slot.cz = z;

  // Droplet burst: 18..26 bits blasting UP and OUTWARD from the surface point.
  const n = 18 + ((Math.random() * 9) | 0); // 18..26
  slot.count = n;
  const drops = slot.drops;
  for (let i = 0; i < n; i++) {
    const d = drops[i];
    // Heading splayed outward in XZ; velocity is mostly up with an outward kick so
    // the spray makes a crown then rains back down.
    const theta = Math.random() * Math.PI * 2;
    const outward = 1.6 + Math.random() * 3.0;       // 1.6..4.6 — sideways spread
    const up = 4.5 + Math.random() * 4.0;            // 4.5..8.5 — strong upward pop
    d.vx = Math.cos(theta) * outward;
    d.vz = Math.sin(theta) * outward;
    d.vy = up;
    // Start in a tight ring around the impact so the origin reads as a column, not a dot.
    const r0 = Math.random() * 0.25;
    d.px = x + Math.cos(theta) * r0;
    d.pz = z + Math.sin(theta) * r0;
    d.py = SEA_LEVEL + Math.random() * 0.15;
    d.size = 0.16 + Math.random() * 0.16;            // small droplets (~0.16..0.32)
    const c = DROP_COLORS[(Math.random() * DROP_COLORS.length) | 0];
    d.r = c.r; d.g = c.g; d.b = c.b;
  }
  // Recentre the bounding sphere on this firing so culling is safe (it's off anyway).
  slot.geometry.boundingSphere.center.set(x, SEA_LEVEL + 2, z);

  slot.points.visible = true;
  slot.geometry.setDrawRange(0, n);

  // Foam ring starts small + bright, centred on the impact.
  const ring = slot.ring;
  ring.position.set(x, RING_Y, z);
  ring.scale.setScalar(RING_R0);
  ring.material.opacity = 0.0; // brought up on the first advance
  ring.visible = true;

  // Write the initial droplet attributes so frame 0 already looks right.
  packSlot(slot, 0);
}

// Advance one live slot by `step` seconds: integrate droplets under gravity, grow +
// fade the foam ring, and retire the slot once its lifetime is spent.
function advanceSlot(slot, step) {
  slot.t += step;
  const t = slot.t / LIFE; // 0 -> 1 over the splash lifetime

  if (t >= 1) {
    // Done: hide + free the slot for the next death (no disposal, just recycle).
    slot.active = false;
    slot.count = 0;
    slot.points.visible = false;
    slot.ring.visible = false;
    slot.geometry.setDrawRange(0, 0);
    return;
  }

  // --- Droplets: gravity then position. Bits that fall back below the surface stop
  // contributing (clamped to the surface) so the spray reads as "into the water".
  const drops = slot.drops;
  for (let i = 0; i < slot.count; i++) {
    const d = drops[i];
    d.vy -= GRAVITY * step;
    d.px += d.vx * step;
    d.py += d.vy * step;
    d.pz += d.vz * step;
    if (d.py < SEA_LEVEL) d.py = SEA_LEVEL; // sink into the sea, don't tunnel through
  }
  packSlot(slot, t);

  // --- Foam ring: ease the radius outward (fast then settling) and fade out. Pop the
  // opacity up quickly at birth, then fall away so the foam dissipates on the surface.
  const ease = 1 - (1 - t) * (1 - t);           // ease-out 0 -> 1
  const r = RING_R0 + (RING_R1 - RING_R0) * ease;
  slot.ring.scale.setScalar(r);
  // Fade: rises over the first ~15% of life, then fades to nothing.
  const fade = Math.min(1, t * 6) * (1 - t);
  slot.ring.material.opacity = Math.max(0, 0.6 * fade);
}

// Pack a slot's live droplet records into its GPU buffers, applying the shrink +
// fade envelope. `t` ∈ [0,1] is the splash progress (0 birth -> 1 death).
function packSlot(slot, t) {
  const { positions, colors, sizes, alphas, drops } = slot;
  const fade = 1 - t;            // 1 -> 0 over life
  const ease = fade * fade;      // ease-out so droplets linger then snap away
  const alpha = Math.min(1, fade * 1.6); // hold near-full bright, fade at the tail
  for (let i = 0; i < slot.count; i++) {
    const d = drops[i];
    const o = i * 3;
    positions[o] = d.px;
    positions[o + 1] = d.py;
    positions[o + 2] = d.pz;
    colors[o] = d.r;
    colors[o + 1] = d.g;
    colors[o + 2] = d.b;
    sizes[i] = d.size * (0.35 + 0.65 * ease); // shrink toward (not fully to) zero
    alphas[i] = alpha;
  }
  slot.posAttr.needsUpdate = true;
  slot.colAttr.needsUpdate = true;
  slot.sizeAttr.needsUpdate = true;
  slot.alphaAttr.needsUpdate = true;
}

// ---- shared sprite ----------------------------------------------------------

// Soft round glow sprite: bright core fading to transparent at the rim so each
// droplet reads as a little ball of water, not a hard square. Mirrors the sprite
// used by particles.js/aura.js; falls back to a procedural data texture when there's
// no DOM (headless puppeteer), so construction never throws offscreen.
function makeSoftSprite() {
  const size = 64;
  if (typeof document !== 'undefined' && document.createElement) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    if (ctx) {
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
  }
  return makeRadialDataTexture(size);
}

// Headless fallback: a procedurally-filled RGBA DataTexture with a soft radial
// falloff (so neither sprite construction nor disposal touches the DOM).
function makeRadialDataTexture(size) {
  const data = new Uint8Array(size * size * 4);
  const c = (size - 1) / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - c) / c;
      const dy = (y - c) / c;
      const d = Math.sqrt(dx * dx + dy * dy);
      const a = Math.max(0, 1 - d);
      const i = (y * size + x) * 4;
      data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
      data[i + 3] = Math.round(a * a * 255);
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
