import * as THREE from 'three';

// PET — a small cosmetic companion that floats/bobs and trails the bean
// character (in the customization lobby AND in-game). Built from cheap THREE
// primitives in the same spirit as player.js (capsules/spheres/boxes, groups,
// MeshStandardMaterial, castShadow). Pure visual: NO physics, NO required DOM.
//
//   import { createPet } from './pet.js';
//   const pet = createPet(scene);
//   pet.setVariant(cosmetics.getEquippedItem('pet')); // pet item, null, or 'none' -> hide
//   pet.update(dt, { x, y, z }, yaw);  // each frame: follow target world pos, optional facing
//   pet.object3D;                       // the pet's root THREE.Group (added to scene)
//   pet.dispose();                      // remove from scene + free all geo/materials
//
// Pet item shape (from cosmetics.js):
//   { id, name, model, color, color2 }
//   model ∈ 'none'|'cube'|'coin'|'duck'|'star'|'ghost'|'saw'
//   color/color2 are hex strings.

// --- Follow / float tuning ---------------------------------------------------
const SIDE_OFFSET = 0.9;   // units to the character's side
const BACK_OFFSET = 0.35;  // a touch behind so it trails, not blocks the view
const UP_OFFSET = 0.6;     // ~upper-body height above the target origin
const FOLLOW_K = 6;        // exponential-smoothing rate (higher = snappier trail)
const BOB_AMP = 0.08;      // vertical bob amplitude (units)
const BOB_FREQ = 2.2;      // vertical bob frequency (rad/s)

export function createPet(scene, opts = {}) {
  const object3D = new THREE.Group();
  object3D.visible = false; // nothing until a real variant is set
  scene.add(object3D);

  // `spinner` holds the meshes whose whole-model idle spin we drive (coin/saw
  // spin fast on their own axis; others get a gentle wobble). Rebuilt per model.
  let model = 'none';      // current model id
  let spinner = null;      // THREE.Group child holding the built meshes
  const disposables = [];  // geometries + materials to free on rebuild/dispose

  let t = 0;               // accumulated time for bob/spin (seconds)
  let placed = false;      // has the pet been snapped to a target yet?
  const phase = Math.random() * Math.PI * 2; // per-pet bob phase offset

  // Scratch vectors (avoid per-frame allocation).
  const desired = new THREE.Vector3();
  const off = new THREE.Vector3();

  function clearMeshes() {
    if (spinner) {
      object3D.remove(spinner);
      spinner = null;
    }
    for (const d of disposables) { try { d.dispose(); } catch {} }
    disposables.length = 0;
  }

  // Track a geometry/material so it gets freed, then return it for chaining.
  function track(resource) { disposables.push(resource); return resource; }

  function mat(hex, extra) {
    return track(new THREE.MeshStandardMaterial(Object.assign({
      color: new THREE.Color(hex),
      roughness: 0.4,
      metalness: 0.05,
    }, extra)));
  }

  function mesh(geometry, material) {
    const m = new THREE.Mesh(track(geometry), material);
    m.castShadow = true;
    return m;
  }

  function setVariant(pet) {
    const next = pet && typeof pet.model === 'string' ? pet.model : 'none';
    if (!pet || next === 'none') {
      clearMeshes();
      model = 'none';
      object3D.visible = false;
      return;
    }
    // Rebuild meshes (free the previous geometry/materials first — no leaks).
    clearMeshes();
    model = next;
    spinner = new THREE.Group();
    object3D.add(spinner);
    object3D.visible = true;

    const c1 = pet.color || '#ffffff';
    const c2 = pet.color2 || '#16161e';
    const builder = BUILDERS[model] || BUILDERS.cube;
    builder(spinner, c1, c2);
  }

  // --- Builders: each fills `g` with simple primitives (~0.3–0.5 units). ------
  const BUILDERS = {
    // Small rounded box body + two little eye dots. color = body, color2 = eyes.
    cube(g, color, eye) {
      const body = mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), mat(color, { roughness: 0.5 }));
      g.add(body);
      addEyes(g, eye, 0.17, 0.07, 0.05);
    },

    // Flat cylinder "coin" standing on edge; spins around its vertical axis.
    // Disc lives in the XY plane (rotate the cylinder so its round face points
    // along +Z) and the parent group spins on Y in update().
    coin(g, color) {
      const disc = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24), mat(color, { roughness: 0.25, metalness: 0.85 }));
      disc.rotation.x = Math.PI / 2; // round face -> front
      g.add(disc);
    },

    // Sphere body + smaller sphere head + a little cone beak (color2).
    duck(g, color, beakColor) {
      const bodyMat = mat(color, { roughness: 0.45 });
      const body = mesh(new THREE.SphereGeometry(0.18, 16, 12), bodyMat);
      body.scale.set(1.15, 0.95, 1.0);
      g.add(body);
      const head = mesh(new THREE.SphereGeometry(0.12, 16, 12), bodyMat);
      head.position.set(0, 0.17, 0.06);
      g.add(head);
      const beak = mesh(new THREE.ConeGeometry(0.045, 0.12, 12), mat(beakColor, { roughness: 0.5 }));
      beak.rotation.x = Math.PI / 2; // point forward (+Z)
      beak.position.set(0, 0.16, 0.18);
      g.add(beak);
      // Eyes on the head.
      addEyes(g, '#16161e', 0.05, 0.04, 0.13, 0.21, 0.045);
    },

    // 5-point extruded star + 2 eye dots.
    star(g, color, eye) {
      const shape = starShape(0.22, 0.1, 5);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1 });
      geo.center();
      const star = mesh(geo, mat(color, { roughness: 0.35 }));
      g.add(star);
      addEyes(g, eye, 0.07, 0.035, 0.07, 0.0, 0.028);
    },

    // Rounded, tapered body with a semi-transparent material + 2 eyes.
    // Bobs and wobbles (the wobble is applied in update via the spinner group).
    ghost(g, color, eye) {
      const ghostMat = mat(color, { roughness: 0.2, transparent: true, opacity: 0.65 });
      const body = mesh(new THREE.CapsuleGeometry(0.16, 0.18, 6, 14), ghostMat);
      body.position.y = 0.04;
      g.add(body);
      // A little "skirt" cone at the base so it reads as a ghost, not a pill.
      const skirt = mesh(new THREE.ConeGeometry(0.18, 0.16, 14, 1, true), ghostMat);
      skirt.position.y = -0.13;
      g.add(skirt);
      addEyes(g, eye, 0.07, 0.04, 0.13, 0.07, 0.035);
    },

    // Low-poly sawblade disc (grey metal) with a few teeth; spins fast.
    saw(g, color, teeth) {
      const metal = mat(color, { roughness: 0.3, metalness: 0.9 });
      const teethMat = mat(teeth, { roughness: 0.4, metalness: 0.8 });
      const disc = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20), metal);
      disc.rotation.x = Math.PI / 2; // flat face -> front, spin on Z via group
      g.add(disc);
      // Hub.
      const hub = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 12), teethMat);
      hub.rotation.x = Math.PI / 2;
      g.add(hub);
      // Teeth around the rim (shared box geometry, separate transforms).
      const toothGeo = track(new THREE.BoxGeometry(0.07, 0.07, 0.05));
      const COUNT = 8;
      for (let i = 0; i < COUNT; i++) {
        const a = (i / COUNT) * Math.PI * 2;
        const tooth = new THREE.Mesh(toothGeo, teethMat);
        tooth.castShadow = true;
        tooth.position.set(Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0);
        tooth.rotation.z = a;
        g.add(tooth);
      }
    },
  };

  // Two eye dots on the +Z face. Shared sphere geometry for both eyes.
  function addEyes(g, hex, spread, radius, z, y = 0.04, r) {
    const eyeR = r != null ? r : radius;
    const eyeMat = mat(hex, { roughness: 0.4, metalness: 0 });
    const geo = track(new THREE.SphereGeometry(eyeR, 10, 8));
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(geo, eyeMat);
      e.castShadow = true;
      e.position.set(sx * spread, y, z);
      g.add(e);
    }
  }

  function update(dt, target, yaw) {
    // Guard against bad dt (paused tab, NaN, negative).
    if (!(dt > 0) || !isFinite(dt)) dt = 1 / 60;
    if (dt > 0.1) dt = 0.1; // clamp huge catch-up steps
    t += dt;

    if (model === 'none' || !spinner) return;

    // --- Follow: damp toward (target + side/back/up offset) -------------------
    if (target && isFinite(target.x) && isFinite(target.y) && isFinite(target.z)) {
      // Offset beside + slightly behind the character. If yaw is given, rotate
      // the offset so the pet stays beside the character as it turns; otherwise
      // a fixed world offset is fine.
      off.set(SIDE_OFFSET, UP_OFFSET, -BACK_OFFSET);
      if (typeof yaw === 'number' && isFinite(yaw)) {
        const c = Math.cos(yaw), s = Math.sin(yaw);
        const ox = off.x * c + off.z * s;
        const oz = -off.x * s + off.z * c;
        off.x = ox; off.z = oz;
      }
      desired.set(target.x + off.x, target.y + off.y, target.z + off.z);

      if (!placed) {
        object3D.position.copy(desired); // snap on first placement (no fly-in)
        placed = true;
      } else {
        // Frame-rate-independent exponential smoothing: lerp factor 1-exp(-k*dt).
        const a = 1 - Math.exp(-FOLLOW_K * dt);
        object3D.position.lerp(desired, a);
      }
    }
    // If target is missing we keep the last position and just bob in place.

    // --- Gentle vertical bob (applied to the root so it layers on follow) -----
    object3D.position.y += Math.sin(t * BOB_FREQ + phase) * BOB_AMP * dt * BOB_FREQ;
    // (bob is a small additive oscillation; using d/dt of the sine keeps it from
    //  fighting the follow lerp and reads as a smooth hover.)

    // --- Per-model idle motion on the spinner group --------------------------
    if (model === 'coin') {
      spinner.rotation.y += dt * 3.0;        // coin spins on its vertical axis
    } else if (model === 'saw') {
      spinner.rotation.z += dt * 14.0;       // sawblade spins fast on its face
      spinner.rotation.x = Math.PI * 0.06;   // slight tilt so the spin reads
    } else if (model === 'ghost') {
      spinner.rotation.y = Math.sin(t * 1.3 + phase) * 0.35;  // slow wobble
      spinner.rotation.z = Math.sin(t * 0.9 + phase) * 0.12;
    } else {
      // cube / duck / star: slow idle turn + a tiny tilt wobble.
      spinner.rotation.y += dt * 0.8;
      spinner.rotation.z = Math.sin(t * 1.5 + phase) * 0.08;
    }
  }

  function dispose() {
    clearMeshes();
    if (object3D.parent) object3D.parent.remove(object3D);
    else if (scene) scene.remove(object3D);
  }

  return { setVariant, update, object3D, dispose };
}

// --- Helpers -----------------------------------------------------------------

// A 5-point star outline as a THREE.Shape, alternating outer/inner radii.
function starShape(outer, inner, points) {
  const shape = new THREE.Shape();
  const step = Math.PI / points; // half-step between outer & inner vertices
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2; // start at the top point
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}
