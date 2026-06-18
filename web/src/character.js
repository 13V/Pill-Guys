import * as THREE from 'three';

// CHARACTER — the shared "pill guy" mesh builder, redesigned to read like the
// real Fall Guys bean. Used by BOTH the in-game player (player.js) and the lobby
// preview (lobby.js) so the equipped SKIN looks identical everywhere.
//
//   buildCharacter(parent, skin?) -> { rig, body, legL, legR, armL, armR, eyes }
//     skin = a cosmetics 'skin' item: { body, limb, cap, pattern, patternColor, finish }
//            (hex strings). Omitted -> the default Classic Coral.
//
// Design (from Fall Guys reference): a bottom-heavy GUMDROP body (LatheGeometry,
// widest in the lower third, fuller rounded dome top) with a baked soft bottom
// ambient-occlusion; BIG tall-oval eyes (glossy white sclera + a large dark wet
// pupil + crisp unlit catchlights) set in the upper-middle with a clear forehead;
// and TINY stubby mitten arms + boot legs that peek past the body. A satin
// "jelly/vinyl toy" MeshPhysicalMaterial (clearcoat + sheen + faint fake-SSS).
//
// Contract for the owner: everything lives under one THREE.Group `rig` (the
// squash/stretch handle); legL/R + armL/R are hinged pivot Groups (rotation.x
// swings them); `eyes` is an array of eye GROUPS so a blink scales each .y -> 0.1.

// Capsule dimensions — exported so player.js builds its physics capsule to match.
export const BEAN_RADIUS = 0.35;
export const BEAN_HALF_HEIGHT = 0.4;

const DEFAULT_SKIN = {
  body: '#ff4d4d', limb: '#e23b3b', cap: '#fff0e6',
  pattern: 'none', patternColor: '#ffffff', finish: 'matte',
};

// Body profile (radius, y) — generated as TWO quarter-ellipses joined at the
// widest point so the silhouette is a smooth bottom-heavy GUMDROP: a fat round
// bottom (short lower ellipse) under a tall ROUNDED DOME (taller upper ellipse),
// never a cone/point. Widest ~0.44 at ~34% up; round bottom y -0.62; domed top
// y +0.72. Feet/boots hang just below to y -0.78.
const BODY_PROFILE = (() => {
  const pts = [];
  const maxR = 0.45, bottomY = -0.55, widestY = -0.12, topY = 0.62;
  const lo = widestY - bottomY, hi = topY - widestY, N = 11;
  for (let i = 0; i <= N; i++) { const a = (i / N) * (Math.PI / 2); pts.push([maxR * Math.sin(a), bottomY + lo * (1 - Math.cos(a))]); }
  for (let i = 1; i <= N + 2; i++) { const b = (i / (N + 2)) * (Math.PI / 2); pts.push([maxR * Math.cos(b), widestY + hi * Math.sin(b)]); }
  return pts;
})();

// Per-finish material numbers for the body. default/'satin' -> the jelly defaults.
function finishParams(finish) {
  switch (finish) {
    case 'matte': return { roughness: 0.5, metalness: 0.0, clearcoat: 0.12, clearcoatRoughness: 0.6, env: 0.7 };
    case 'gloss': return { roughness: 0.2, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.25, env: 1.25 };
    case 'metal': return { roughness: 0.28, metalness: 0.9, clearcoat: 0.35, clearcoatRoughness: 0.25, env: 1.6 };
    default:      return { roughness: 0.4, metalness: 0.0, clearcoat: 0.28, clearcoatRoughness: 0.45, env: 0.9 };
  }
}

function smoothstep(e0, e1, x) { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
function lighten(hex, amt) { return new THREE.Color(hex).lerp(new THREE.Color(0xffffff), amt); }

export function buildCharacter(parent, skin) {
  const s = { ...DEFAULT_SKIN, ...(skin || {}) };
  const fin = finishParams(s.finish);
  const hasPattern = s.pattern && s.pattern !== 'none';

  // --- Body material: satin jelly/vinyl. clearcoat = thin glossy lacquer; sheen
  // = soft velvety fresnel rim; faint emissive of the body hue fakes sub-surface
  // glow so shadowed faces don't go muddy. vertexColors = the baked bottom AO.
  // When the skin has a pattern, the texture carries the albedo (body colour +
  // pattern), so the material colour is white to avoid double-tinting.
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: hasPattern ? 0xffffff : new THREE.Color(s.body),
    roughness: fin.roughness, metalness: fin.metalness,
    clearcoat: fin.clearcoat, clearcoatRoughness: fin.clearcoatRoughness,
    sheen: 0.7, sheenRoughness: 0.6, sheenColor: lighten(s.body, 0.35),
    envMapIntensity: fin.env,
    emissive: new THREE.Color(s.body), emissiveIntensity: 0.1,
    vertexColors: true,
  });
  if (hasPattern) {
    const tex = makePatternTexture(s.body, s.patternColor, s.pattern);
    if (tex) bodyMat.map = tex;
  }
  const limbMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(s.limb), roughness: Math.max(0.12, fin.roughness - 0.05), metalness: fin.metalness,
    clearcoat: Math.min(1, fin.clearcoat + 0.1), clearcoatRoughness: fin.clearcoatRoughness,
    sheen: 0.5, sheenRoughness: 0.6, sheenColor: lighten(s.limb, 0.3), envMapIntensity: fin.env,
  });
  const capMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(s.cap), roughness: 0.28, metalness: fin.metalness * 0.4,
    clearcoat: 0.35, clearcoatRoughness: 0.35, sheen: 0.4, sheenRoughness: 0.6,
    sheenColor: lighten(s.cap, 0.25), envMapIntensity: fin.env,
  });
  // Eyes: glossiest, wettest element. Sclera = wet white; pupil = deep wet black.
  const scleraMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.12, clearcoat: 0.8, clearcoatRoughness: 0.08, envMapIntensity: 1.4 });
  const pupilMat = new THREE.MeshPhysicalMaterial({ color: 0x16161e, roughness: 0.08, clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 1.6 });
  const catchMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });

  // Squash & stretch rig: one Group holding ALL meshes.
  const rig = new THREE.Group();
  parent.add(rig);

  // --- Body: revolved gumdrop + baked bottom-AO vertex colours. ---------------
  const bodyGeo = new THREE.LatheGeometry(BODY_PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 64);
  bodyGeo.computeVertexNormals();
  const pos = bodyGeo.getAttribute('position');
  let minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); if (y < minY) minY = y; if (y > maxY) maxY = y; }
  const aoTop = minY + (maxY - minY) * 0.5; // full albedo by ~mid-body
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const f = 0.8 + 0.2 * smoothstep(minY, aoTop, pos.getY(i)); // 0.8 at base -> 1.0 by mid
    colors[i * 3] = f; colors[i * 3 + 1] = f; colors[i * 3 + 2] = f;
  }
  bodyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true; body.receiveShadow = true;
  rig.add(body);

  // --- Limbs: pivot Group at (px,py) with a capsule + rounded cap hanging below
  // the hinge, so rotation.x swings it. baseZ splays it outward; capSY flattens
  // the cap (boots), capFwd nudges it forward (toe).
  function limb(px, py, length, r, capR, baseZ, capSY, capFwd, capSZ) {
    const g = new THREE.Group();
    g.position.set(px, py, 0);
    g.rotation.z = baseZ || 0;
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, length, 6, 12), limbMat);
    m.position.y = -(length / 2 + r * 0.5);
    m.castShadow = true;
    g.add(m);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(capR, 16, 12), capMat);
    cap.position.set(0, -(length + r * 0.5), capFwd || 0);
    if (capSY || capSZ) cap.scale.set(1, capSY || 1, capSZ || 1.08);
    cap.castShadow = true;
    g.add(cap);
    rig.add(g);
    return g;
  }
  // Legs: thick short stubs with flattened boots pushed FORWARD and lengthened in
  // z (toe) so the feet poke out the front-bottom — visible even from the high
  // in-game camera. Boot bottom lands at ~y -0.78 (stands on decks).
  const legL = limb(-0.16, -0.565, 0.05, 0.12, 0.15, 0, 0.7, 0.16, 1.5);
  const legR = limb(0.16, -0.565, 0.05, 0.12, 0.15, 0, 0.7, 0.16, 1.5);
  // Arms: attached out at the body's SIDE surface (x ~ body radius at that
  // height) and splayed outward, so the mitten hands clearly clear the fat belly
  // instead of hiding inside it.
  const armL = limb(-0.37, 0.26, 0.13, 0.08, 0.10, 0.5, 1, 0.05);
  const armR = limb(0.37, 0.26, 0.13, 0.08, 0.10, -0.5, 1, 0.05);

  // --- Eyes: big tall-ovals in the upper-middle, clear forehead dome above.
  // Each eye is a GROUP (sclera + pupil + 2 catchlights) so a blink scales .y.
  // Catchlights sit on the SAME screen-side on both eyes (not mirrored) for a
  // single focused gaze. A slight toe-in faces them forward on the curved body.
  const eyes = [];
  const eyeY = 0.24, eyeX = 0.15, eyeZ = 0.35;
  for (const sx of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(sx * eyeX, eyeY, eyeZ);
    eye.rotation.y = -sx * 0.14; // toe in toward the front centre
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), scleraMat);
    sclera.scale.set(0.86, 1.5, 0.7); sclera.castShadow = true;
    eye.add(sclera);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.062, 18, 14), pupilMat);
    pupil.scale.set(0.85, 1.32, 0.62); pupil.position.z = 0.055;
    eye.add(pupil);
    const main = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), catchMat);
    main.position.set(0.022, 0.04, 0.1); eye.add(main); // upper, screen-right
    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), catchMat);
    spark.position.set(-0.022, -0.032, 0.1); eye.add(spark); // lower-opposite
    rig.add(eye);
    eyes.push(eye);
  }

  return { rig, body, legL, legR, armL, armR, eyes };
}

// Bake a small skin pattern into a CanvasTexture (base colour + pattern colour).
// Guarded so it never throws where there's no DOM (returns null -> solid colour).
function makePatternTexture(baseHex, patHex, pattern) {
  if (typeof document === 'undefined' || !document.createElement) return null;
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  if (pattern === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, patHex); g.addColorStop(1, baseHex);
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  } else {
    ctx.fillStyle = baseHex; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = patHex; ctx.strokeStyle = patHex;
    if (pattern === 'stripes') {
      ctx.lineWidth = 26;
      for (let x = -size; x < size * 2; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + size, size); ctx.stroke(); }
    } else if (pattern === 'zigzag') {
      ctx.lineWidth = 22;
      for (let y = 24; y < size; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y);
        for (let x = 0; x <= size; x += 32) ctx.lineTo(x, y + (x / 32 % 2 ? 26 : -26));
        ctx.stroke();
      }
    } else if (pattern === 'spots') {
      for (let i = 0; i < 26; i++) { const x = Math.random() * size, y = Math.random() * size, r = 10 + Math.random() * 14; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    } else if (pattern === 'stars') {
      for (let i = 0; i < 40; i++) { const x = Math.random() * size, y = Math.random() * size, r = 2 + Math.random() * 4; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}
