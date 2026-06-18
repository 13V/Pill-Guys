// AURA — cosmetic glowing particle fields that envelop the bean character, both in
// the customization lobby and in-game. Owned by the AURA agent.
//
//   const aura = createAura(parent, opts);   // parent = character root Object3D
//   aura.setVariant(item);   // cosmetics aura item { id,name,kind,color,color2 } | null
//   aura.update(dt);         // animate; call every frame (dt seconds)
//   aura.dispose();          // remove from parent + free geometry/materials/textures
//
// createAura adds its OWN THREE.Group as a child of `parent`, so the aura follows
// the character automatically. The character is a chunky bean ~1.5 units tall whose
// Object3D origin is the body center; the aura envelops roughly y ∈ [-0.8, +1.0],
// radius ~0.6, centered on the character.
//
// Variants (item.kind):
//   'none'    -> clears all particles (cheap, nothing rendered)
//   'sparkle' -> small twinkling gold/white specks orbiting + drifting up, fading in/out
//   'hearts'  -> little billboarded heart sprites spawning low, floating up + fading
//   'frost'   -> slow swirling pale-cyan flecks drifting around + gently downward
//   'embers'  -> warm flame-colored ember specks streaming upward with flicker
//   'voltage' -> fast-jittering electric-blue sparks crackling around the shell
//   'rainbow' -> saturated hue-cycling swirl of specks (the flashy legendary)
//
// Implementation: dot-based kinds share ONE pooled THREE.Points (single
// BufferGeometry with per-point position/color/size/alpha, a tiny ShaderMaterial
// drawing a soft round sprite — same approach as particles.js). Hearts use a small
// pool of reused THREE.Sprite instances with a heart canvas texture so they
// billboard toward the camera. Total particles stay modest (a few dozen). No
// shadows, no depthWrite. Blending is chosen per-kind (additive for energetic
// glows, normal for hearts/frost) so it reads on the bright studio background.
import * as THREE from 'three';

// Per-kind tuning. Each entry describes the look + motion of one aura. `count` is
// the live particle budget for that kind (kept small so the effect is always cheap).
// `blend` picks additive (glowy energy) vs normal (solid/soft) blending.
const KINDS = {
  sparkle: { count: 28, blend: 'add' },
  hearts:  { count: 12, blend: 'normal' }, // sprite-based, handled separately
  frost:   { count: 30, blend: 'normal' },
  embers:  { count: 30, blend: 'add' },
  voltage: { count: 30, blend: 'add' },
  rainbow: { count: 36, blend: 'add' },
};

const TWO_PI = Math.PI * 2;

export function createAura(parent, opts = {}) {
  // Our own group, parented to the character so the aura follows it everywhere.
  const group = new THREE.Group();
  group.name = 'aura';
  // Never cull: the character may be offscreen briefly (lobby/camera cuts) but we
  // keep simulating so it's continuous when it comes back into view.
  group.frustumCulled = false;
  if (parent && parent.add) parent.add(group);

  // Optional uniform scale of the whole aura (e.g. if a caller scales the bean).
  const scale = Number.isFinite(opts.scale) ? opts.scale : 1;
  group.scale.setScalar(scale);

  // --- Shared soft round sprite texture (built lazily, reused across re-variants).
  let sprite = null;
  function getSprite() {
    if (!sprite) sprite = makeSoftSprite();
    return sprite;
  }

  // --- Dot-based system (sparkle/frost/embers/voltage/rainbow): ONE pooled Points.
  // Built on demand the first time a dot-kind is selected, then reused (the draw
  // range goes to 0 when not in use, so it's free to leave allocated).
  let dots = null; // { geometry, material, points, positions, colors, sizes, alphas, posAttr, ... }
  let pool = [];   // CPU particle records for the active dot-kind
  let dotCount = 0; // capacity currently in use (== KINDS[kind].count for dot kinds)

  function ensureDots(capacity) {
    if (dots) return dots;
    const max = capacity;
    const positions = new Float32Array(max * 3);
    const colors = new Float32Array(max * 3);
    const sizes = new Float32Array(max);
    const alphas = new Float32Array(max);

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
    // Local-space bounding sphere covering the envelope; frustumCulled is off anyway.
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.1, 0), 4);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: getSprite() },
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
      blending: THREE.NormalBlending, // overridden per-kind in applyVariant
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.renderOrder = 11; // above scene + the death/coin particle pool
    points.castShadow = false;
    points.receiveShadow = false;
    group.add(points);

    // Preallocate a generous CPU pool (max over all dot-kinds) so switching kinds
    // never allocates. Each record carries position + per-kind motion params.
    const poolMax = Math.max(
      KINDS.sparkle.count, KINDS.frost.count, KINDS.embers.count,
      KINDS.voltage.count, KINDS.rainbow.count,
    );
    pool = new Array(poolMax);
    for (let i = 0; i < poolMax; i++) {
      pool[i] = {
        px: 0, py: 0, pz: 0,         // local position within the group
        r: 1, g: 1, b: 1,            // color
        size: 0.3,                   // base world size
        baseAlpha: 1,                // peak alpha for this particle
        // per-kind motion state
        angle: 0,                    // orbital angle (sparkle/frost/rainbow)
        angVel: 1,                   // orbital angular velocity
        radius: 0.5,                 // orbital radius
        vy: 0,                       // vertical velocity
        wobblePhase: 0,              // phase for twinkle / lateral wobble
        wobbleFreq: 1,
        hueOff: 0,                   // hue offset (rainbow)
        // lifetime: particles loop continuously (life counts 0->maxLife then respawn)
        life: 0,
        maxLife: 1,
      };
    }

    dots = { geometry, material, points, positions, colors, sizes, alphas, posAttr, colAttr, sizeAttr, alphaAttr };
    updateScale();
    return dots;
  }

  // --- Hearts system: a small pool of reused billboarded sprites. Built on demand.
  let hearts = null; // { texture, material, sprites: [{ sprite, ...motion }] }
  function ensureHearts(capacity) {
    if (hearts) return hearts;
    const texture = makeHeartTexture();
    // One shared material is enough; per-sprite color/opacity is set on clones so
    // each heart can tint + fade independently we use per-sprite materials (cheap,
    // a handful of them) cloned from a base.
    const base = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
    });
    const sprites = new Array(capacity);
    for (let i = 0; i < capacity; i++) {
      const mat = base.clone();
      mat.map = texture; // clones share the same texture (disposed once)
      const sp = new THREE.Sprite(mat);
      sp.castShadow = false;
      sp.receiveShadow = false;
      sp.frustumCulled = false;
      sp.renderOrder = 11;
      sp.visible = false;
      group.add(sp);
      sprites[i] = {
        sprite: sp,
        px: 0, py: 0, pz: 0,
        vy: 0,
        size: 0.3,
        swayPhase: 0,
        swayFreq: 1,
        swayAmp: 0.1,
        life: 0,
        maxLife: 1,
        baseR: 1, baseG: 0.4, baseB: 0.6,
      };
    }
    hearts = { texture, base, sprites };
    return hearts;
  }

  // --- Current variant state.
  let kind = 'none';
  let col1 = new THREE.Color('#ffffff');
  let col2 = new THREE.Color('#ffffff');
  let hueCycle = 0; // advancing global phase for rainbow

  // Keep gl_PointSize consistent across viewport sizes (point size is device px).
  function updateScale() {
    if (!dots) return;
    const h = (typeof window !== 'undefined' && window.innerHeight) || 900;
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio)
      ? Math.min(window.devicePixelRatio, 2)
      : 1;
    dots.material.uniforms.uScale.value = h * dpr * 0.5;
  }
  const hasWindow = typeof window !== 'undefined' && window.addEventListener;
  if (hasWindow) window.addEventListener('resize', updateScale);

  // ---- Per-kind initial seeding of a single particle record. `t01` lets us stagger
  // initial lifetimes so the field looks continuous from the first frame.
  function seedDot(p, t01) {
    if (kind === 'sparkle') {
      p.maxLife = 1.6 + Math.random() * 1.4;          // slow twinkle/fade cycle
      p.angle = Math.random() * TWO_PI;
      p.angVel = (0.5 + Math.random() * 0.7) * (Math.random() < 0.5 ? 1 : -1); // gentle orbit, mixed dir
      p.radius = 0.42 + Math.random() * 0.22;          // ~0.42..0.64
      p.vy = 0.25 + Math.random() * 0.35;              // slow upward drift
      p.py = -0.7 + Math.random() * 1.6;               // anywhere in the column
      p.wobblePhase = Math.random() * TWO_PI;
      p.wobbleFreq = 4 + Math.random() * 5;            // fast twinkle
      p.size = 0.16 + Math.random() * 0.16;            // small specks
      // warm white -> gold mix
      mixColor(p, Math.random() * 0.7);
      p.baseAlpha = 0.9;
    } else if (kind === 'frost') {
      p.maxLife = 2.6 + Math.random() * 2.0;           // slow, lingering
      p.angle = Math.random() * TWO_PI;
      p.angVel = (0.25 + Math.random() * 0.4) * (Math.random() < 0.5 ? 1 : -1); // lazy swirl
      p.radius = 0.4 + Math.random() * 0.28;
      p.vy = -(0.12 + Math.random() * 0.22);           // gentle downward drift (snow)
      p.py = -0.6 + Math.random() * 1.6;
      p.wobblePhase = Math.random() * TWO_PI;
      p.wobbleFreq = 1.2 + Math.random() * 1.4;        // slow lateral sway
      p.size = 0.14 + Math.random() * 0.16;
      mixColor(p, Math.random() * 0.6);                // pale cyan -> white
      p.baseAlpha = 0.85;
    } else if (kind === 'embers') {
      p.maxLife = 1.1 + Math.random() * 0.9;           // short — they rise + wink out
      p.angle = Math.random() * TWO_PI;
      p.angVel = (0.6 + Math.random() * 0.9) * (Math.random() < 0.5 ? 1 : -1);
      p.radius = 0.18 + Math.random() * 0.4;           // start nearer the core
      p.vy = 0.9 + Math.random() * 0.9;                // stream upward
      p.py = -0.8 + Math.random() * 0.8;               // spawn low
      p.wobblePhase = Math.random() * TWO_PI;
      p.wobbleFreq = 8 + Math.random() * 8;            // fast flicker
      p.size = 0.13 + Math.random() * 0.16;
      mixColor(p, Math.random());                      // orange <-> bright yellow
      p.baseAlpha = 0.95;
    } else if (kind === 'voltage') {
      p.maxLife = 0.18 + Math.random() * 0.22;         // very short — crackle/restrike
      p.angle = Math.random() * TWO_PI;
      p.angVel = (3 + Math.random() * 4) * (Math.random() < 0.5 ? 1 : -1); // fast skitter around shell
      p.radius = 0.5 + Math.random() * 0.16;           // hug the shell
      p.vy = (Math.random() - 0.5) * 1.4;              // dart up or down
      p.py = -0.7 + Math.random() * 1.6;
      p.wobblePhase = Math.random() * TWO_PI;
      p.wobbleFreq = 30 + Math.random() * 30;          // violent jitter
      p.size = 0.12 + Math.random() * 0.14;
      mixColor(p, Math.random() * 0.5);                // electric blue -> white
      p.baseAlpha = 1.0;
    } else { // rainbow
      p.maxLife = 2.0 + Math.random() * 1.6;
      p.angle = Math.random() * TWO_PI;
      p.angVel = (0.7 + Math.random() * 0.8) * (Math.random() < 0.5 ? 1 : -1);
      p.radius = 0.38 + Math.random() * 0.26;
      p.vy = 0.15 + Math.random() * 0.5;               // drift up, swirling
      p.py = -0.7 + Math.random() * 1.6;
      p.wobblePhase = Math.random() * TWO_PI;
      p.wobbleFreq = 2 + Math.random() * 3;
      p.hueOff = Math.random();                        // each speck cycles from a different hue
      p.size = 0.15 + Math.random() * 0.17;
      p.baseAlpha = 0.95;
    }
    // Stagger initial life so the very first frame already looks populated.
    p.life = (t01 != null ? t01 : Math.random()) * p.maxLife;
    syncDot(p, 0); // place it immediately
  }

  // Pick a color between col1 and col2 by `m` ∈ [0,1] and store on the record.
  function mixColor(p, m) {
    const r = col1.r + (col2.r - col1.r) * m;
    const g = col1.g + (col2.g - col1.g) * m;
    const b = col1.b + (col2.b - col1.b) * m;
    p.r = r; p.g = g; p.b = b;
  }

  // Advance one dot particle's MOTION by `dt`, respawn if its loop completed, and
  // write its current local position into the record (px/py/pz). Color/alpha are
  // computed in the pack loop in update().
  function syncDot(p, dt) {
    p.life += dt;
    if (p.life >= p.maxLife) {
      // Loop: reseed in place (continuous field, no popping gaps).
      seedDot(p, 0);
      return;
    }
    // Orbit + vertical drift + lateral wobble.
    p.angle += p.angVel * dt;
    p.py += p.vy * dt;
    p.wobblePhase += p.wobbleFreq * dt;

    let rad = p.radius;
    if (kind === 'voltage') {
      // Jittery radius so sparks snap in/out from the shell like arcs.
      rad += Math.sin(p.wobblePhase) * 0.08 + (Math.random() - 0.5) * 0.05;
    } else if (kind === 'embers') {
      // Embers taper inward slightly as they rise (rising column narrows a touch).
      rad += Math.sin(p.wobblePhase * 0.2) * 0.03;
    } else {
      rad += Math.sin(p.wobblePhase) * 0.05; // soft breathing of the ring
    }
    p.px = Math.cos(p.angle) * rad;
    p.pz = Math.sin(p.angle) * rad;

    // Recycle vertically so the column stays full (wrap top->bottom / bottom->top).
    if (p.py > 1.05) p.py = -0.8 + (p.py - 1.05);
    else if (p.py < -0.85) p.py = 1.0 - (-0.85 - p.py);
  }

  // ---- Hearts: seed one heart sprite record.
  function seedHeart(h, t01) {
    h.maxLife = 1.6 + Math.random() * 1.0;             // float-up + fade duration
    const ang = Math.random() * TWO_PI;
    const rad = 0.18 + Math.random() * 0.34;           // spawn within the column
    h.px = Math.cos(ang) * rad;
    h.pz = Math.sin(ang) * rad;
    h.py = -0.75 + Math.random() * 0.35;               // spawn LOW
    h.vy = 0.55 + Math.random() * 0.5;                 // float up
    h.size = 0.22 + Math.random() * 0.16;              // little hearts
    h.swayPhase = Math.random() * TWO_PI;
    h.swayFreq = 1.6 + Math.random() * 1.6;            // gentle side-to-side
    h.swayAmp = 0.06 + Math.random() * 0.08;
    // pink <-> red mix
    const m = Math.random();
    h.baseR = col1.r + (col2.r - col1.r) * m;
    h.baseG = col1.g + (col2.g - col1.g) * m;
    h.baseB = col1.b + (col2.b - col1.b) * m;
    h.life = (t01 != null ? t01 : Math.random()) * h.maxLife;
    syncHeart(h, 0);
  }

  function syncHeart(h, dt) {
    h.life += dt;
    if (h.life >= h.maxLife) { seedHeart(h, 0); return; }
    h.py += h.vy * dt;
    h.swayPhase += h.swayFreq * dt;
    const t = h.life / h.maxLife; // 0 -> 1
    // Fade in quickly, hold, fade out at the top.
    const alpha = Math.min(1, t * 5) * Math.min(1, (1 - t) * 3);
    // Pop in scale slightly at birth then settle.
    const s = h.size * (0.6 + 0.4 * Math.min(1, t * 4));
    const sp = h.sprite;
    sp.visible = true;
    sp.position.set(h.px + Math.sin(h.swayPhase) * h.swayAmp, h.py, h.pz);
    sp.scale.set(s, s, s);
    const m = sp.material;
    m.color.setRGB(h.baseR, h.baseG, h.baseB);
    m.opacity = alpha;
  }

  // ---- Apply a new variant: dispose the previous kind's visible state and set up
  // the new one. Idempotent + leak-free across switches.
  function applyVariant(item) {
    const newKind = item && item.kind ? item.kind : 'none';

    // Resolve colors with sensible fallbacks.
    col1 = safeColor(item && item.color, '#ffffff');
    col2 = safeColor(item && item.color2, item && item.color ? item.color : '#ffffff');

    // If clearing or kind unknown -> hide everything (cheap; keep allocations).
    if (newKind === 'none' || !KINDS[newKind]) {
      kind = 'none';
      clearVisible();
      return;
    }

    // Switching away from hearts (sprites) -> hide them; switching away from a
    // dot-kind -> zero the draw range. We hide BOTH systems then re-enable the one
    // this kind uses, so re-variants never leave stragglers from the old kind.
    clearVisible();

    kind = newKind;
    const cfg = KINDS[kind];

    if (kind === 'hearts') {
      const hs = ensureHearts(cfg.count);
      for (let i = 0; i < cfg.count; i++) seedHeart(hs.sprites[i], i / cfg.count);
    } else {
      const d = ensureDots(maxDotCapacity());
      dotCount = cfg.count;
      // Blending per kind: additive for energetic glows, normal for soft frost.
      d.material.blending = (cfg.blend === 'add') ? THREE.AdditiveBlending : THREE.NormalBlending;
      d.material.needsUpdate = true;
      // Seed all live records, staggered so the field is full immediately.
      for (let i = 0; i < dotCount; i++) seedDot(pool[i], i / dotCount);
    }
  }

  function maxDotCapacity() {
    return Math.max(
      KINDS.sparkle.count, KINDS.frost.count, KINDS.embers.count,
      KINDS.voltage.count, KINDS.rainbow.count,
    );
  }

  // Hide both subsystems' visible output without freeing GPU resources.
  function clearVisible() {
    if (dots) {
      dotCount = 0;
      dots.geometry.setDrawRange(0, 0);
    }
    if (hearts) {
      for (const h of hearts.sprites) {
        h.sprite.visible = false;
        h.life = 0;
      }
    }
  }

  function setVariant(item) {
    applyVariant(item);
  }

  function update(dt) {
    // Guard: clamp dt into [0, 0.05]; reject NaN / non-positive (no backward sim).
    let step = (typeof dt === 'number' && dt > 0 && dt < Infinity) ? dt : 0;
    if (step > 0.05) step = 0.05; // cap long pauses / tab-switches
    if (step <= 0) return;        // nothing to advance (also guards NaN)

    if (kind === 'none') return;

    // Advance rainbow's shared hue phase regardless (cheap) so it cycles smoothly.
    hueCycle += step * 0.18; // ~5.5s per full rotation
    if (hueCycle > 1) hueCycle -= Math.floor(hueCycle);

    if (kind === 'hearts') {
      if (!hearts) return;
      const n = KINDS.hearts.count;
      for (let i = 0; i < n; i++) syncHeart(hearts.sprites[i], step);
      return;
    }

    // Dot kinds.
    if (!dots || dotCount === 0) return;
    const { positions, colors, sizes, alphas } = dots;
    const isRainbow = kind === 'rainbow';

    for (let i = 0; i < dotCount; i++) {
      const p = pool[i];
      syncDot(p, step);

      const t = p.life / p.maxLife; // 0 -> 1

      // Per-kind alpha envelope.
      let alpha;
      if (kind === 'sparkle') {
        // Twinkle: fade in/out over life AND shimmer with the wobble phase.
        const env = Math.min(1, t * 4) * Math.min(1, (1 - t) * 4);
        const twinkle = 0.55 + 0.45 * Math.sin(p.wobblePhase);
        alpha = p.baseAlpha * env * twinkle;
      } else if (kind === 'voltage') {
        // Hard, strobing flicker — sparks snap bright then vanish.
        const env = Math.min(1, (1 - t) * 2.5);
        const strobe = Math.sin(p.wobblePhase) > 0.1 ? 1 : 0.25;
        alpha = p.baseAlpha * env * strobe;
      } else if (kind === 'embers') {
        // Rise + flicker, dimming as they climb.
        const env = Math.min(1, t * 6) * (1 - t * 0.85);
        const flick = 0.7 + 0.3 * Math.sin(p.wobblePhase);
        alpha = p.baseAlpha * env * flick;
      } else { // frost + rainbow: smooth fade in/out
        alpha = p.baseAlpha * Math.min(1, t * 5) * Math.min(1, (1 - t) * 5);
      }

      // Per-kind color (rainbow cycles hue; others use the precomputed mix).
      let r = p.r, g = p.g, b = p.b;
      if (isRainbow) {
        const hue = (hueCycle + p.hueOff + p.angle / TWO_PI) % 1;
        const rgb = hsvToRgb(hue < 0 ? hue + 1 : hue, 0.95, 1.0);
        r = rgb[0]; g = rgb[1]; b = rgb[2];
      }

      const o = i * 3;
      positions[o] = p.px;
      positions[o + 1] = p.py;
      positions[o + 2] = p.pz;
      colors[o] = r;
      colors[o + 1] = g;
      colors[o + 2] = b;
      // Embers shrink a touch as they rise; others gently pulse with their wobble.
      let sizeMul;
      if (kind === 'embers') sizeMul = 1 - t * 0.5;
      else if (kind === 'voltage') sizeMul = 0.7 + 0.5 * Math.abs(Math.sin(p.wobblePhase));
      else sizeMul = 0.85 + 0.3 * Math.sin(p.wobblePhase * 0.5);
      sizes[i] = p.size * Math.max(0.05, sizeMul);
      alphas[i] = alpha < 0 ? 0 : alpha;
    }

    dots.geometry.setDrawRange(0, dotCount);
    dots.posAttr.needsUpdate = true;
    dots.colAttr.needsUpdate = true;
    dots.sizeAttr.needsUpdate = true;
    dots.alphaAttr.needsUpdate = true;
  }

  function dispose() {
    if (hasWindow) {
      try { window.removeEventListener('resize', updateScale); } catch {}
    }
    // Dots.
    if (dots) {
      group.remove(dots.points);
      dots.geometry.dispose();
      dots.material.dispose();
      dots = null;
    }
    // Hearts.
    if (hearts) {
      for (const h of hearts.sprites) {
        group.remove(h.sprite);
        if (h.sprite.material) h.sprite.material.dispose();
      }
      if (hearts.base) hearts.base.dispose();
      if (hearts.texture) hearts.texture.dispose();
      hearts = null;
    }
    // Shared sprite texture.
    if (sprite) { sprite.dispose(); sprite = null; }
    // Detach our group from the character.
    if (group.parent) group.parent.remove(group);
    pool = [];
    dotCount = 0;
    kind = 'none';
  }

  // Apply any initial variant passed via opts (handy for one-shot construction).
  if (opts.variant) applyVariant(opts.variant);

  return { setVariant, update, dispose };
}

// ---- helpers ----------------------------------------------------------------

// Parse a hex color string defensively; fall back to `fallback` on bad input.
function safeColor(hex, fallback) {
  try {
    if (typeof hex === 'string' && hex.length) return new THREE.Color(hex);
  } catch {}
  return new THREE.Color(fallback);
}

// HSV -> RGB (h,s,v ∈ [0,1]) -> [r,g,b] ∈ [0,1]. Used by the rainbow hue cycle.
function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    default: return [v, p, q];
  }
}

// Soft round glow sprite: bright core fading to transparent at the rim, so each
// point reads as a little ball of light instead of a hard square. Mirrors the
// sprite used by particles.js. Falls back to a tiny data texture if no DOM canvas
// is available (headless), so construction never throws offscreen.
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
  return makeRadialDataTexture(size, false);
}

// Heart sprite: a soft pink/white heart on transparent, tintable per-sprite via the
// SpriteMaterial color. Two lobes (circles) + a downward triangle, the classic cheap
// heart. Falls back to the round glow data texture when no canvas is available.
function makeHeartTexture() {
  const size = 64;
  if (typeof document !== 'undefined' && document.createElement) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = 'rgba(255,255,255,1)';
      const cx = size / 2;
      // Heart geometry tuned to sit centered in the 64px square.
      const r = size * 0.2;          // lobe radius
      const lobeY = size * 0.36;      // y of the two top lobes
      const leftX = cx - r * 0.95;
      const rightX = cx + r * 0.95;
      const tipY = size * 0.84;       // bottom point
      ctx.beginPath();
      // left lobe
      ctx.arc(leftX, lobeY, r, 0, TWO_PI);
      ctx.fill();
      // right lobe
      ctx.beginPath();
      ctx.arc(rightX, lobeY, r, 0, TWO_PI);
      ctx.fill();
      // bottom triangle joining the lobes down to the tip
      ctx.beginPath();
      ctx.moveTo(leftX - r, lobeY + r * 0.12);
      ctx.lineTo(rightX + r, lobeY + r * 0.12);
      ctx.lineTo(cx, tipY);
      ctx.closePath();
      ctx.fill();
      // Soft inner highlight so it glows a little rather than reading flat.
      const g = ctx.createRadialGradient(cx, lobeY, 0, cx, lobeY, size * 0.5);
      g.addColorStop(0.0, 'rgba(255,255,255,0.35)');
      g.addColorStop(1.0, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      ctx.globalCompositeOperation = 'source-over';
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      return tex;
    }
  }
  return makeRadialDataTexture(size, true);
}

// Headless fallback: a procedurally-filled RGBA DataTexture with a soft radial
// falloff (so neither sprite construction nor disposal touches the DOM). `heartish`
// is unused beyond signaling intent; both produce a usable round glow.
function makeRadialDataTexture(size /*, heartish */) {
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
