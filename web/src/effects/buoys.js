// BUOYS — striped marker buoys bobbing on the stylised sea for nautical flavor.
// They sit OUT past the playfield (the course runs +X, x≈-2..150, lanes |z|<3); these
// scatter at x≈-20..170, |z|≈14..70, straddling SEA_LEVEL so each float's red/white
// body breaks the surface like a real channel marker — never crowding the lanes.
//
//   import { createBuoys } from './effects/buoys.js';
//   const buoys = createBuoys(scene);   // ... buoys.update(dt) each frame
//
// Each buoy is a small GROUP: a striped float (a top red hemisphere + a white base) in
// alternating red/white, a thin pole rising from the cap with a tiny yellow flag, and a
// faint translucent ripple disc lying at the waterline. Every buoy rides its own slow
// sine — a vertical bob (±0.2u about its rest height) plus a gentle rocking tilt on x/z —
// out of phase with its neighbours so the field rolls on the same swell as the water.
// Geometry-only + flat MeshStandardMaterials — fully headless-safe; no textures, canvases
// or DOM. update(dt) only nudges each group's Y and rotation.
import * as THREE from 'three';
import { SEA_LEVEL } from './ocean.js';

const TWO_PI = Math.PI * 2;

// Palette — flat "toy plastic": classic red/white channel buoy, sunny yellow flag,
// dark grey pole, pale foam for the waterline ripple.
const COL_RED   = 0xff4d4d;
const COL_WHITE = 0xffffff;
const COL_FLAG  = 0xffd23f;
const COL_POLE  = 0x37414d;
const COL_RING  = 0xcfeaff;

// How many buoys to scatter (kept in the ~8–12 band the ambience calls for).
const MIN_BUOYS = 8;
const MAX_BUOYS = 12;

export function createBuoys(scene) {
  const root = new THREE.Group();
  root.name = 'buoys';

  // Shared materials — one of each, reused across every buoy so the whole field is a
  // handful of materials. High roughness, zero metalness keeps the matte toy look.
  const matRed   = new THREE.MeshStandardMaterial({ color: COL_RED,   roughness: 0.55, metalness: 0 });
  const matWhite = new THREE.MeshStandardMaterial({ color: COL_WHITE, roughness: 0.6,  metalness: 0 });
  const matFlag  = new THREE.MeshStandardMaterial({ color: COL_FLAG,  roughness: 0.7,  metalness: 0, side: THREE.DoubleSide });
  const matPole  = new THREE.MeshStandardMaterial({ color: COL_POLE,  roughness: 0.8,  metalness: 0 });
  // Ripple disc: faint, additive-ish translucent ring sitting flat on the water.
  const matRing  = new THREE.MeshBasicMaterial({
    color: COL_RING, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide,
  });

  // Shared base geometries (unit-ish; each buoy scales its instances). Low segment
  // counts — they're small bits of background scenery, no need for smooth silhouettes.
  const geoTopDome = new THREE.SphereGeometry(1, 14, 8, 0, TWO_PI, 0, Math.PI / 2);          // upper red hemisphere
  const geoBotDome = new THREE.SphereGeometry(1, 14, 8, 0, TWO_PI, Math.PI / 2, Math.PI / 2); // lower white hemisphere
  const geoBand    = new THREE.CylinderGeometry(1.02, 1.02, 1, 14, 1, true);                 // thin white waterline stripe
  const geoPole    = new THREE.CylinderGeometry(0.04, 0.05, 1, 6);                           // mast on the cap
  const geoFlag    = new THREE.PlaneGeometry(1, 1);                                          // tiny pennant
  const geoRing    = new THREE.RingGeometry(1.0, 1.7, 24);                                   // waterline ripple disc

  // Per-buoy bob/tilt state. amp/speed/phase chosen per buoy so they breathe out of sync.
  const buoys = []; // [{ group, baseY, bobAmp, bobSpeed, bobPhase, tiltAmp, tiltSpeed, tiltPhase, ring }]

  const n = MIN_BUOYS + Math.floor(Math.random() * (MAX_BUOYS - MIN_BUOYS + 1));
  for (let i = 0; i < n; i++) {
    const buoy = makeBuoy(i, {
      matRed, matWhite, matFlag, matPole, matRing,
      geoTopDome, geoBotDome, geoBand, geoPole, geoFlag, geoRing,
    });
    root.add(buoy.group);
    buoys.push(buoy);
  }

  if (scene && scene.add) scene.add(root);

  return {
    group: root,
    update(dt) {
      const step = Number.isFinite(dt) ? dt : 0;
      // Advance each buoy's own phases: ride it up/down around its rest height and rock
      // it gently on x/z — a slow, shallow swell so it floats rather than bounces.
      for (const b of buoys) {
        b.bobPhase  += b.bobSpeed  * step;
        b.tiltPhase += b.tiltSpeed * step;
        b.group.position.y = b.baseY + Math.sin(b.bobPhase) * b.bobAmp;
        // Two offset sines -> a wobbly rock rather than a clean single-axis sway.
        b.group.rotation.x = Math.sin(b.tiltPhase) * b.tiltAmp;
        b.group.rotation.z = Math.sin(b.tiltPhase * 0.83 + 1.7) * b.tiltAmp;
        // Keep the ripple disc lying flat on the water (undo the group's bob + tilt) so
        // it reads as the waterline, not part of the rocking float.
        if (b.ring) {
          b.ring.position.y = -(b.group.position.y - SEA_LEVEL);
          b.ring.rotation.x = -Math.PI / 2 - b.group.rotation.x;
          b.ring.rotation.z = -b.group.rotation.z;
        }
      }
    },
    dispose() {
      if (root.parent) root.parent.remove(root);
      for (const g of [geoTopDome, geoBotDome, geoBand, geoPole, geoFlag, geoRing]) g.dispose();
      for (const m of [matRed, matWhite, matFlag, matPole, matRing]) m.dispose();
    },
  };
}

// Build one buoy group placed out past the playfield, straddling the waterline. `i` is
// only used to spread the buoys along the run so they don't all clump at one bearing.
function makeBuoy(i, res) {
  const group = new THREE.Group();

  // --- Placement: scattered along and a bit beyond the course, well off to the sides. -
  const x = rand(-20, 170);
  const side = Math.random() < 0.5 ? -1 : 1;
  const z = side * rand(14, 70); // |z| > 13 — clearly outside the lanes
  group.position.set(x, SEA_LEVEL, z);
  group.rotation.y = Math.random() * TWO_PI; // random yaw so flags point every which way

  // Overall size: smallish floats, biased a touch smaller the further out they sit.
  const far01 = Math.min(1, (Math.abs(z) - 14) / 56);
  const s = rand(0.7, 1.15) * (1 - far01 * 0.25);

  // --- Float: a red top hemisphere + white bottom hemisphere meeting at the waterline,
  // with a thin white stripe at the seam, so the body straddles SEA_LEVEL. ------------
  const r = s; // float radius
  const top = new THREE.Mesh(res.geoTopDome, res.matRed);
  top.scale.setScalar(r);
  applyShadow(top);
  group.add(top);

  const bot = new THREE.Mesh(res.geoBotDome, res.matWhite);
  bot.scale.setScalar(r);
  applyShadow(bot);
  group.add(bot);

  // White band straddling the equator -> a clean red-over-white stripe break.
  const band = new THREE.Mesh(res.geoBand, res.matWhite);
  band.scale.set(r, r * 0.22, r);
  applyShadow(band);
  group.add(band);

  // --- Pole: a thin dark mast rising from the crown of the float. --------------------
  const poleH = s * rand(1.1, 1.7);
  const pole = new THREE.Mesh(res.geoPole, res.matPole);
  pole.scale.set(s, poleH, s);
  pole.position.y = r + poleH * 0.5; // foot on the float crown
  applyShadow(pole);
  group.add(pole);

  // --- Flag: a tiny yellow pennant near the top of the mast, offset to one side so it
  // flies out from the pole rather than skewering it. --------------------------------
  const flag = new THREE.Mesh(res.geoFlag, res.matFlag);
  const flagW = s * 0.5, flagH = s * 0.32;
  flag.scale.set(flagW, flagH, 1);
  flag.position.set(flagW * 0.5, r + poleH * 0.86, 0); // hang from the mast top
  applyShadow(flag);
  group.add(flag);

  // --- Ripple disc: a faint flat ring lying on the sea around the float's waterline.
  // It's parented to the group but re-leveled every frame in update() so it stays flat
  // on the water while the float bobs and rocks above it. ----------------------------
  const ring = new THREE.Mesh(res.geoRing, res.matRing);
  ring.scale.set(r, r, 1);
  ring.rotation.x = -Math.PI / 2; // lie flat (re-set each frame in update)
  ring.position.y = 0;            // at SEA_LEVEL relative to the group's rest height
  ring.renderOrder = 1;           // draw over the water surface
  group.add(ring);

  // Rest height: center the float a hair high so a touch more red shows above the
  // surface than white below, the way a weighted buoy actually floats.
  const baseY = SEA_LEVEL + r * 0.12;
  group.position.y = baseY;

  // Bob: shallow amplitude (capped at ±0.2u), slow period, unique phase per buoy.
  const bobAmp = Math.min(0.2, rand(0.12, 0.2));
  const bobSpeed = rand(0.6, 1.1);                 // rad/s -> ~6–10s period (slow ocean roll)
  const bobPhase = (i * 1.3 + Math.random() * TWO_PI) % TWO_PI;

  // Tilt: a gentle rock, a few degrees, slightly slower than the bob and on its own phase.
  const tiltAmp = rand(0.05, 0.11);                // rad -> ~3–6° of sway
  const tiltSpeed = rand(0.5, 0.9);
  const tiltPhase = (i * 0.7 + Math.random() * TWO_PI) % TWO_PI;

  return { group, baseY, bobAmp, bobSpeed, bobPhase, tiltAmp, tiltSpeed, tiltPhase, ring };
}

// These are distant scenery: cast no shadows (cheap, and they're outside the shadow
// frustum anyway) but DO receive so the ocean/sky light grades them like the props.
function applyShadow(mesh) {
  mesh.castShadow = false;
  mesh.receiveShadow = true;
}

function rand(a, b) {
  return a + Math.random() * (b - a);
}
