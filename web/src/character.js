import * as THREE from 'three';

// CHARACTER — the shared "pill guy" mesh builder. Used by BOTH the in-game
// player (player.js) and the lobby preview (lobby.js) so the equipped SKIN looks
// identical everywhere. A skin recolors the body/limbs/hands+feet and can add a
// surface pattern + material finish (matte/gloss/metal). Movement/physics live
// in player.js; this file is pure visuals.
//
//   buildCharacter(parent, skin?) -> { rig, body, legL, legR, armL, armR, eyes }
//     skin = a cosmetics 'skin' item: { body, limb, cap, pattern, patternColor, finish }
//            (all colours are hex strings). Omitted -> the default Classic Coral.

// Capsule dimensions — exported so player.js builds its physics capsule to match.
export const BEAN_RADIUS = 0.35;
export const BEAN_HALF_HEIGHT = 0.4;

const DEFAULT_SKIN = {
  body: '#ff4d4d', limb: '#e23b3b', cap: '#fff0e6',
  pattern: 'none', patternColor: '#ffffff', finish: 'matte',
};

// Material params per finish: roughness/metalness/env intensity for the body.
function finishParams(finish) {
  switch (finish) {
    case 'gloss': return { roughness: 0.18, metalness: 0.1, env: 1.2 };
    case 'metal': return { roughness: 0.25, metalness: 0.92, env: 1.5 };
    default:      return { roughness: 0.4, metalness: 0.05, env: 1.0 }; // matte
  }
}

export function buildCharacter(parent, skin) {
  const s = { ...DEFAULT_SKIN, ...(skin || {}) };
  const fin = finishParams(s.finish);

  const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(s.body), roughness: fin.roughness, metalness: fin.metalness, envMapIntensity: fin.env });
  // A surface pattern is baked into a small canvas texture used as the body map.
  if (s.pattern && s.pattern !== 'none') {
    const tex = makePatternTexture(s.body, s.patternColor, s.pattern);
    if (tex) bodyMat.map = tex;
  }
  const limbMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(s.limb), roughness: 0.45, metalness: fin.metalness * 0.6 });
  const capMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(s.cap), roughness: 0.3, metalness: 0.05 });

  const R = BEAN_RADIUS, HH = BEAN_HALF_HEIGHT;

  // Squash & stretch rig: a single Group holding ALL character meshes so the
  // owner can scale/offset the whole character (juice) without disturbing
  // object3D.position (physics/camera) or object3D.rotation.y (facing).
  const rig = new THREE.Group();
  parent.add(rig);

  // Torso (the bean).
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(R, 2 * HH, 8, 20), bodyMat);
  body.castShadow = true; body.receiveShadow = true;
  rig.add(body);

  // A limb hinged at (px,py): a Group at the hinge holding a capsule that hangs
  // below it, capped with a rounded sphere (hand/foot). baseZ tilts it outward.
  function limb(px, py, length, r, capR, baseZ) {
    const g = new THREE.Group();
    g.position.set(px, py, 0);
    g.rotation.z = baseZ || 0;
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, length, 5, 10), limbMat);
    m.position.y = -(length / 2 + r * 0.5);
    m.castShadow = true;
    g.add(m);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(capR, 12, 10), capMat);
    cap.position.y = -(length + r * 0.5);
    cap.castShadow = true;
    g.add(cap);
    rig.add(g);
    return g;
  }
  // Legs: spaced apart, hung from the lower bean so the cream feet peek out below.
  const legL = limb(-0.18, -HH + 0.06, 0.22, 0.12, 0.15, 0);
  const legR = limb(0.18, -HH + 0.06, 0.22, 0.12, 0.15, 0);
  // Arms: at the shoulders, splayed slightly outward (base z-tilt) with hands.
  const armL = limb(-(R + 0.02), HH * 0.2, 0.2, 0.1, 0.12, 0.32);
  const armR = limb(R + 0.02, HH * 0.2, 0.2, 0.1, 0.12, -0.32);

  // Eyes on the +Z (front) face.
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.4 });
  const eyeY = HH * 0.6, eyeX = R * 0.42, eyeZ = R * 0.92;
  const eyes = []; // eye-white meshes — Y-scaled to blink
  for (const sx of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(R * 0.26, 16, 12), whiteMat);
    white.position.set(sx * eyeX, eyeY, eyeZ); white.castShadow = true; rig.add(white);
    eyes.push(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(R * 0.13, 12, 10), pupilMat);
    pupil.position.set(sx * eyeX, eyeY, eyeZ + R * 0.16); rig.add(pupil);
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
      for (let i = 0; i < 26; i++) {
        const x = Math.random() * size, y = Math.random() * size, r = 10 + Math.random() * 14;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    } else if (pattern === 'stars') {
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * size, y = Math.random() * size, r = 2 + Math.random() * 4;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}
