// ISLANDS — far-horizon tropical islets that float on the swell, purely for depth.
// They sit OUT past the playfield (the course runs +X, x≈-2..150, lanes |z|<3); these
// land at x≈-80..240, |z|≈45..170, parked at the waterline near the fog, so they read
// as distant scenery and never crowd the lanes or the camera's 3/4 framing.
//
//   import { createIslands } from './effects/islands.js';
//   const islands = createIslands(scene);   // ... islands.update(dt) each frame
//
// Each islet is a small GROUP: a darker rock base (#8a8f9a) just breaking the surface,
// a low squashed sandy landmass (#e8d8a8) on top, then EITHER a simple palm (thin
// angled trunk + a few flat green fronds), a rounded grassy cap, or — for a couple —
// nothing (a bare weathered rock stack). Random yaw + size; some are tiny on the far
// horizon. Every islet gets a very gentle, slow, per-island sine bob (~0.1–0.2u) about
// its rest height so the cluster feels like it's riding the same ocean swell as the
// water plane. Geometry-only + flat MeshStandardMaterials — fully headless-safe; no
// textures, canvases or DOM. update(dt) only nudges each group's Y.
import * as THREE from 'three';
import { SEA_LEVEL } from './ocean.js';

const TWO_PI = Math.PI * 2;

// Palette — flat "toy plastic": sandy beach, cool grey rock, leafy palm/grass green.
const COL_SAND  = 0xe8d8a8;
const COL_ROCK  = 0x8a8f9a;
const COL_TRUNK = 0x9a6b3f;
const COL_FROND = 0x4cc06a;
const COL_GRASS = 0x57c46a;

// How many islets to scatter (kept in the 5–7 band the ambience calls for).
const MIN_ISLES = 5;
const MAX_ISLES = 7;

export function createIslands(scene) {
  const root = new THREE.Group();
  root.name = 'islands';

  // Shared materials — one of each, reused across every islet so the whole field is a
  // handful of materials. High roughness, zero metalness keeps the matte toy look.
  const matSand  = new THREE.MeshStandardMaterial({ color: COL_SAND,  roughness: 0.95, metalness: 0 });
  const matRock  = new THREE.MeshStandardMaterial({ color: COL_ROCK,  roughness: 0.9,  metalness: 0 });
  const matTrunk = new THREE.MeshStandardMaterial({ color: COL_TRUNK, roughness: 0.85, metalness: 0 });
  const matFrond = new THREE.MeshStandardMaterial({ color: COL_FROND, roughness: 0.7,  metalness: 0, side: THREE.DoubleSide });
  const matGrass = new THREE.MeshStandardMaterial({ color: COL_GRASS, roughness: 0.8,  metalness: 0 });

  // Shared base geometries (unit-ish; each islet scales/squashes its instances). Low
  // segment counts — they're tiny on the horizon, no need for smooth silhouettes.
  const geoDome = new THREE.SphereGeometry(1, 12, 8);   // sandy landmass / grassy cap (squashed)
  const geoRock = new THREE.IcosahedronGeometry(1, 0);  // faceted rock base / bare stack
  const geoTrunk = new THREE.CylinderGeometry(0.06, 0.11, 1, 6); // palm trunk
  const geoFrond = new THREE.ConeGeometry(0.42, 1, 5);  // flattened cone -> drooping palm frond

  // Per-island bob state. amp/speed/phase chosen per islet so they breathe out of sync.
  const isles = []; // [{ group, baseY, amp, speed, phase }]

  const n = MIN_ISLES + Math.floor(Math.random() * (MAX_ISLES - MIN_ISLES + 1));
  for (let i = 0; i < n; i++) {
    const islet = makeIslet(i, {
      matSand, matRock, matTrunk, matFrond, matGrass,
      geoDome, geoRock, geoTrunk, geoFrond,
    });
    root.add(islet.group);
    isles.push(islet);
  }

  if (scene && scene.add) scene.add(root);

  return {
    group: root,
    update(dt) {
      const step = Number.isFinite(dt) ? dt : 0;
      // Advance each islet's own phase and ride it up/down around its rest height —
      // a slow, shallow swell so they bob like they're floating, not bouncing.
      for (const isle of isles) {
        isle.phase += isle.speed * step;
        isle.group.position.y = isle.baseY + Math.sin(isle.phase) * isle.amp;
      }
    },
    dispose() {
      if (root.parent) root.parent.remove(root);
      for (const g of [geoDome, geoRock, geoTrunk, geoFrond]) g.dispose();
      for (const m of [matSand, matRock, matTrunk, matFrond, matGrass]) m.dispose();
    },
  };
}

// Build one islet group placed far out at the waterline. `i` is only used to spread the
// islets roughly around the horizon so they don't all clump on one bearing.
function makeIslet(i, res) {
  const group = new THREE.Group();

  // --- Placement: far out, well clear of the playfield, sitting near the fog. ----
  // Spread X across the full run-and-beyond span; push Z out to either far side.
  const x = rand(-80, 240);
  const side = Math.random() < 0.5 ? -1 : 1;
  const z = side * rand(45, 170);

  // Overall size: mostly small, with a good chance of a tiny far-horizon speck. The
  // further out (bigger |z|), the more we bias toward small so distance reads right.
  const far01 = Math.min(1, (Math.abs(z) - 45) / 125); // 0 near, 1 at the far edge
  let s = rand(2.0, 6.0) * (1 - far01 * 0.5);
  if (Math.random() < 0.3) s *= 0.5; // some genuinely tiny islets

  group.position.set(x, SEA_LEVEL, z); // rest at the waterline; baseY refined below
  group.rotation.y = Math.random() * TWO_PI; // random yaw

  // Decide the islet flavor up front: mostly sandy (palm or grassy cap), with a
  // couple as bare rock stacks for variety.
  const r = Math.random();
  const bare = r < 0.25;            // ~1 in 4 -> bare weathered rock stack
  const grassy = !bare && r < 0.5;  // some sandy isles get a grassy cap instead of a palm

  // --- Rock base: a faceted stack whose base dips just under the surface so there's
  // no hard seam at the waterline, with its top poking a touch above sea level. ----
  const baseR = s * (bare ? 0.55 : 0.7);
  const baseH = s * (bare ? rand(0.9, 1.6) : 0.45); // bare stacks rise taller
  const rock = new THREE.Mesh(res.geoRock, res.matRock);
  rock.scale.set(baseR, baseH, baseR);
  // Sink the base so roughly its lower third is below y=0 (the group sits at SEA_LEVEL).
  rock.position.y = baseH * 0.35;
  rock.rotation.y = Math.random() * TWO_PI;
  applyShadow(rock);
  group.add(rock);

  let landTopY = baseH * 0.35 + baseH; // world-local height of the rock's crown

  if (bare) {
    // Bare stack: add a smaller second boulder on top for a craggy silhouette.
    const cap = new THREE.Mesh(res.geoRock, res.matRock);
    const capR = baseR * rand(0.45, 0.7);
    const capH = baseH * rand(0.4, 0.7);
    cap.scale.set(capR, capH, capR);
    cap.position.y = landTopY + capH * 0.2;
    cap.rotation.y = Math.random() * TWO_PI;
    applyShadow(cap);
    group.add(cap);
  } else {
    // --- Sandy landmass: a squashed dome sitting on the rock, sand color. ---------
    const sandR = s * rand(0.7, 0.95);
    const sandH = s * rand(0.3, 0.5);
    const sand = new THREE.Mesh(res.geoDome, res.matSand);
    sand.scale.set(sandR, sandH, sandR);
    // Seat the dome so its flat-ish base overlaps the rock crown (no floating gap).
    sand.position.y = landTopY - sandH * 0.15;
    applyShadow(sand);
    group.add(sand);

    const sandCrownY = sand.position.y + sandH; // top of the sandy mound

    if (grassy) {
      // Rounded grassy green cap nestled on the sand.
      const grassR = sandR * rand(0.6, 0.85);
      const grassH = sandH * rand(0.6, 1.0);
      const grass = new THREE.Mesh(res.geoDome, res.matGrass);
      grass.scale.set(grassR, grassH, grassR);
      grass.position.y = sandCrownY - grassH * 0.25;
      applyShadow(grass);
      group.add(grass);
    } else {
      // --- Simple palm: a thin angled trunk + a few drooping fronds. --------------
      addPalm(group, res, sandCrownY, s);
    }
  }

  // Lift the whole group so its TOP sits a few units above SEA_LEVEL (landmass breaks
  // the surface), while its base still tucks under. We nudge baseY up modestly.
  const baseY = SEA_LEVEL + s * 0.12;
  group.position.y = baseY;

  // Gentle floating swell: shallow amplitude, slow period, unique phase per islet.
  const amp = rand(0.1, 0.2);
  const speed = rand(0.35, 0.7);          // rad/s -> ~9–18s period (slow ocean roll)
  const phase = (i * 1.7 + Math.random() * TWO_PI) % TWO_PI;

  return { group, baseY, amp, speed, phase };
}

// Add a leaning palm to a sandy islet: a slightly angled trunk topped with a ring of
// flattened cones used as drooping fronds. `crownY` is the local-Y of the sand top.
function addPalm(group, res, crownY, s) {
  const palm = new THREE.Group();
  palm.position.y = crownY;

  // Trunk: thin cylinder, scaled tall, tipped over a touch so it leans like a real palm.
  const trunkH = s * rand(0.7, 1.1);
  const trunk = new THREE.Mesh(res.geoTrunk, res.matTrunk);
  trunk.scale.set(s * 0.18, trunkH, s * 0.18);
  trunk.position.y = trunkH * 0.5;
  const lean = rand(0.12, 0.28);
  trunk.rotation.z = lean * (Math.random() < 0.5 ? 1 : -1);
  applyShadow(trunk);
  palm.add(trunk);

  // Fronds: a small crown of flattened cones radiating out and drooping down, parented
  // to the trunk tip so they follow its lean.
  const crown = new THREE.Group();
  crown.position.y = trunkH;           // sit at the top of the (un-leaned) trunk
  trunk.add(crown);
  // crown lives in trunk-local space (trunk is scaled), so undo the trunk scale to keep
  // the fronds a sane size regardless of trunk thickness/height.
  crown.scale.set(1 / (s * 0.18), 1 / trunkH, 1 / (s * 0.18));

  const frondCount = 4 + Math.floor(Math.random() * 3); // 4–6 fronds
  const frondLen = s * rand(0.5, 0.8);
  for (let f = 0; f < frondCount; f++) {
    const frond = new THREE.Mesh(res.geoFrond, res.matFrond);
    // Flatten the cone into a leaf-like blade, lengthen it along its axis.
    frond.scale.set(s * 0.5, frondLen, s * 0.12);
    const ang = (f / frondCount) * TWO_PI + rand(-0.2, 0.2);
    frond.rotation.y = ang;
    // Tip the cone outward + down so it splays from the crown and droops.
    frond.rotation.z = rand(1.9, 2.4); // ~110–138° from up -> points out and down
    // Push the blade out so its base meets the crown rather than the trunk center.
    frond.position.set(Math.cos(ang) * frondLen * 0.25, -frondLen * 0.05, Math.sin(ang) * frondLen * 0.25);
    applyShadow(frond);
    crown.add(frond);
  }

  group.add(palm);
}

// These are distant scenery: cast no shadows (cheap, and they're past the shadow
// frustum anyway) but DO receive so the ocean/sky light grades them like the props.
function applyShadow(mesh) {
  mesh.castShadow = false;
  mesh.receiveShadow = true;
}

function rand(a, b) {
  return a + Math.random() * (b - a);
}
