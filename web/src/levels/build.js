import * as THREE from 'three';
import { place } from '../assets.js';

// ============================================================================
// Generic, data-driven level builder.
//
// A LEVEL is pure data (see levels/level1.js and LEVELS_DESIGN.md). This builder
// turns one descriptor into BOTH the visual meshes (glTF pieces) AND the Rapier
// physics (deck colliders, sensor regions, coins, finish) — from the same source.
// The existing effects (worldAnim spins userData.spin + scrolls 'threads' belts,
// coin-juice bobs world.coins, particles/audio react to events) then work for ANY
// level automatically.
//
// Descriptor shape:
//   { name, theme?, deckTop?=5, spawn?,
//     decks:   [ {kind:'platform', cx,cz,w,d, top?=5, color?='blue', rails?, legs?=true},
//                {kind:'strip', x0,x1, z?=0, w?=2, top?=5, color?='blue', rails?},
//                {kind:'conveyor', cx,cz, len, w?=4, top?=5, color?='blue'},   // pushes +X
//                {kind:'finish', cx,cz, w?=4,d?=4, top?=10, towerFrom?=0, color?='blue'} ],
//     hazards: [ {kind:'spikes', cx,cz, size?=4},
//                {kind:'sawblade', cx,cz, top?},
//                {kind:'sawtrap', cx,cz, top?},
//                {kind:'spikeblock', cx,cz, dir?='up', top?},
//                {kind:'spikeroller', cx,cz, top?},
//                {kind:'cone', cx,cz, top?} ],          // cone is decorative (no death)
//     springs: [ {cx,cz, top?} ],
//     coins:   [ {x,y,z} | {cx,cz, y?} ],
//     decor:   [ {kind:'pipeArch', cx, top?, color?='red'},
//                {kind:'portal',   cx,cz, top?, color?='green'},
//                {kind:'gantry',   cx, z?=3.5},
//                {kind:'arrow',    cx,cz, top?, color?='yellow'} ] }
//
// Returns { group, spawn, coins:[{name,object3D}], finishPos }.
// Progression is handled by reloading with ?level=N (see game.js), so no dispose
// is needed — each load is a fresh scene + physics world.
// ============================================================================

const DECK_BASE_TO_FLOOR = (top) => Math.max(top - 1, 0); // solid box reaches the floor
const PILLARS = [8, 4, 2, 1]; // available pillar heights

function legPieceForHeight(h) {
  for (const p of PILLARS) if (h >= p - 0.01) return { name: `pillar_2x2x${p}`, h: p };
  return { name: 'pillar_1x1x1', h: 1 };
}

export async function buildLevel(level, { scene, physics }) {
  const group = new THREE.Group();
  scene.add(group);

  const ALL = physics.RAPIER.ActiveCollisionTypes.ALL;
  const solid = (cx, top, cz, hx, hz, depthDown) =>
    physics.addStaticBox(cx, top - depthDown / 2, cz, hx, depthDown / 2, hz);
  const sensor = (cx, cy, cz, hx, hy, hz, name) => {
    const c = physics.addSensorBox(cx, cy, cz, hx, hy, hz, name);
    c.setActiveCollisionTypes(ALL);
    return c;
  };

  const deckTopDefault = level.deckTop ?? 5;
  const color = level.theme || 'blue';
  const coins = [];
  const tasks = []; // async place() calls
  const P = (tuple) => tasks.push(place(group, tuple));

  let minX = Infinity, maxX = -Infinity;
  let finishCenter = null;
  const noteX = (x) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); };

  // ---- Legs under a footprint (cx,cz) of size (w x d), deck base at `base` ----
  // Stack pillars from the floor up to `base` so legs fully reach the deck
  // (no floating gap) for any deck height, not just top=5/finish.
  function stackLegs(x, z, base) {
    let y = 0;
    for (const p of PILLARS) while (base - y >= p - 0.01) { P([`pillar_2x2x${p}`, 'neutral', x, z, y]); y += p; }
  }
  function addLegs(cx, cz, w, d, base) {
    if (base <= 0.01) return;
    const ox = Math.max(w / 2 - 1, 0.0);
    const oz = Math.max(d / 2 - 1, 0.0);
    const xs = w >= 4 ? [cx - ox, cx + ox] : [cx];
    const zs = d >= 4 ? [cz - oz, cz + oz] : [cz];
    for (const x of xs) for (const z of zs) stackLegs(x, z, base);
  }

  // ---- Side rails along the long (X) edges of a deck (rail sits ~0.8 inward) ----
  function addRails(cx, cz, w, d, top) {
    const halfZ = d / 2;
    for (let x = cx - w / 2 + 1; x <= cx + w / 2 - 1 + 0.001; x += 2) {
      P(['railing_straight_single', color, x, cz + halfZ, top, 0]);
      P(['railing_straight_single', color, x, cz - halfZ, top, 180]);
    }
  }

  // ---- DECKS ----
  for (const dk of level.decks || []) {
    const top = dk.top ?? deckTopDefault;
    const base = DECK_BASE_TO_FLOOR(top);
    const col = dk.color || color;

    if (dk.kind === 'platform') {
      const w = dk.w, d = dk.d;
      P([`platform_${w}x${d}x1`, col, dk.cx, dk.cz, base]);
      solid(dk.cx, top, dk.cz, w / 2, d / 2, top); // collider down to floor
      addLegs(dk.cx, dk.cz, w, d, base);
      if (dk.rails) addRails(dk.cx, dk.cz, w, d, top);
      noteX(dk.cx - w / 2); noteX(dk.cx + w / 2);
    } else if (dk.kind === 'strip') {
      // A long walkway from x0..x1, width w (2/4/6), tiled from platform pieces.
      const w = dk.w || 2;
      const z = dk.z ?? 0;
      const piece = w === 6 ? 6 : w === 4 ? 4 : 6; // tile length
      const pw = w === 6 ? 6 : w === 4 ? 4 : 6;     // piece X length
      const pieceName = w === 4 ? 'platform_4x4x1' : `platform_${pw}x2x1`;
      const pieceX = w === 4 ? 4 : pw;
      const pieceZ = w === 4 ? 4 : 2;
      for (let x = dk.x0 + pieceX / 2; x <= dk.x1 - pieceX / 2 + 0.001; x += pieceX) {
        P([pieceName, col, x, z, base]);
      }
      const len = dk.x1 - dk.x0;
      solid((dk.x0 + dk.x1) / 2, top, z, len / 2, (w === 4 ? 4 : 2) / 2, top);
      // periodic legs
      for (let x = dk.x0 + 1; x <= dk.x1 - 1 + 0.001; x += 4) addLegs(x, z, 2, pieceZ, base);
      if (dk.rails) {
        const halfZ = pieceZ / 2;
        for (let x = dk.x0 + 1; x <= dk.x1 - 1 + 0.001; x += 2) {
          P(['railing_straight_single', col, x, z + halfZ, top, 0]);
          P(['railing_straight_single', col, x, z - halfZ, top, 180]);
        }
      }
      noteX(dk.x0); noteX(dk.x1);
    } else if (dk.kind === 'conveyor') {
      const w = dk.w || 4;
      const len = dk.len || 8;
      P(['conveyor_4x8x1', col, dk.cx, dk.cz, base, 90]); // 8 runs along X
      solid(dk.cx, top, dk.cz, len / 2, w / 2, top);
      sensor(dk.cx, top + 0.4, dk.cz, len / 2, 0.4, w / 2, 'conveyor');
      addLegs(dk.cx - len / 4, dk.cz, 2, w, base);
      addLegs(dk.cx + len / 4, dk.cz, 2, w, base);
      noteX(dk.cx - len / 2); noteX(dk.cx + len / 2);
    } else if (dk.kind === 'finish') {
      const w = dk.w || 4, d = dk.d || 4;
      const top2 = dk.top ?? 10;
      const base2 = DECK_BASE_TO_FLOOR(top2 - 1); // deck is 2 thick (platform_4x4x2)
      // tower legs (stacked to the deck base)
      for (const x of [dk.cx - 1, dk.cx + 1]) for (const z of [dk.cz - 1, dk.cz + 1]) stackLegs(x, z, top2 - 2);
      P([`platform_${w}x${d}x2`, dk.color || col, dk.cx, dk.cz, top2 - 2]);
      solid(dk.cx, top2, dk.cz, w / 2, d / 2, top2);
      // finish dressing + sensor
      P(['signage_finish', 'neutral', dk.cx - 1.2, dk.cz, top2, 90]);
      P(['flag_C', 'red', dk.cx + 1.3, dk.cz + 1.3, top2, 180]);
      P(['chest_large', 'yellow', dk.cx - 1.2, dk.cz - 1.2, top2]);
      P(['railing_straight_padded', col, dk.cx, dk.cz + d / 2, top2, 0]);
      P(['railing_straight_padded', col, dk.cx, dk.cz - d / 2, top2, 180]);
      sensor(dk.cx, top2 + 0.6, dk.cz, w / 2, 0.6, d / 2, 'finish');
      finishCenter = { x: dk.cx, y: top2 + 1, z: dk.cz };
      noteX(dk.cx - w / 2); noteX(dk.cx + w / 2);
    }
  }

  // ---- HAZARDS ----
  for (const hz of level.hazards || []) {
    const top = hz.top ?? deckTopDefault;
    if (hz.kind === 'spikes') {
      const s = hz.size || 4;
      P([`floor_spikes_${s}x${s}x1`, 'neutral', hz.cx, hz.cz, top]);
      sensor(hz.cx, top + 0.5, hz.cz, s / 2, 0.5, s / 2, 'death');
    } else if (hz.kind === 'sawblade') {
      const saw = place(group, ['sawblade', 'neutral', hz.cx, hz.cz, top - 0.4, 0, 90, 0]);
      tasks.push(saw.then((o) => { if (o) o.userData.spin = { localY: true, speed: 7 }; }));
      // Lethal only when flagged (place it with a safe lane); otherwise menace-only.
      if (hz.lethal) sensor(hz.cx, top + 0.4, hz.cz, 1.6, 1.0, 0.5, 'death');
    } else if (hz.kind === 'sawtrap') {
      P(['saw_trap_long', 'red', hz.cx, hz.cz, top, 90]);
      sensor(hz.cx, top + 0.4, hz.cz, 0.6, 0.5, 3.0, 'death');
    } else if (hz.kind === 'spikeblock') {
      const dir = hz.dir || 'up';
      P([`spikeblock_${dir}`, hz.color || color, hz.cx, hz.cz, top]);
      sensor(hz.cx, top + 0.6, hz.cz, 0.6, 0.6, 0.6, 'death');
    } else if (hz.kind === 'spikeroller') {
      const r = place(group, ['spikeroller_horizontal', 'neutral', hz.cx, hz.cz, top + 2]);
      tasks.push(r.then((o) => { if (o) o.userData.spin = { localY: false, speed: 4, axis: 'x' }; }));
      if (hz.lethal) sensor(hz.cx, top + 0.8, hz.cz, 2, 0.8, 2, 'death');
    } else if (hz.kind === 'cone') {
      P(['cone', 'red', hz.cx, hz.cz, top]); // decorative warning only
    }
  }

  // ---- SPRINGS ----
  for (const sp of level.springs || []) {
    const top = sp.top ?? deckTopDefault;
    P(['spring_pad', 'red', sp.cx, sp.cz, top]);
    P(['spring', 'neutral', sp.cx, sp.cz, top]);
    sensor(sp.cx, top + 0.6, sp.cz, 0.9, 0.5, 0.9, 'spring');
  }

  // ---- COINS (glowing collectible + 'coin:N' sensor) ----
  (level.coins || []).forEach((c, i) => {
    const x = c.x ?? c.cx;
    const z = c.z ?? c.cz ?? 0;
    const y = c.y ?? (deckTopDefault + 1.2);
    const mesh = makeCoinMesh(x, y, z);
    mesh.name = `coin:${i}`;
    group.add(mesh);
    coins.push({ name: `coin:${i}`, object3D: mesh });
    sensor(x, y, z, 0.5, 0.5, 0.5, `coin:${i}`);
  });

  // ---- DECOR ----
  for (const d of level.decor || []) {
    const top = d.top ?? deckTopDefault;
    if (d.kind === 'pipeArch') buildPipeArch(P, d.cx, d.cz ?? 0, top, d.color || 'red');
    else if (d.kind === 'portal') P(['pipe_end', d.color || 'green', d.cx, d.cz ?? 0, top]);
    else if (d.kind === 'arrow') P(['signage_arrow_stand', d.color || 'yellow', d.cx, d.cz ?? 0, top, d.ry ?? -90]);
    else if (d.kind === 'gantry') buildGantry(P, d.cx, d.z ?? 3.5);
  }

  // ---- Fall-off-the-world kill plane spanning the whole level ----
  const cxAll = (minX + maxX) / 2;
  const span = Math.max(maxX - minX, 10) + 20;
  sensor(cxAll, -8, 0, span / 2, 1, 40, 'death');

  await Promise.all(tasks);

  const spawn = level.spawn || { x: (level.decks?.[0]?.cx ?? 3), y: deckTopDefault + 1.2, z: 0 };
  return { group, spawn, coins, finishPos: finishCenter || { x: maxX, y: deckTopDefault + 1, z: 0 }, lengthX: maxX - minX };
}

// Bright self-lit collectible so coin-juice can just flip .visible on collect.
function makeCoinMesh(x, y, z) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffe14d, emissive: 0xffc400, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.35 });
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

// Red Π-arch pipe gateway across the walkway (bores cross at top), green-able.
function buildPipeArch(P, cx, cz, top, color) {
  P(['pipe_straight_A', color, cx, cz - 3, top]);
  P(['pipe_straight_A', color, cx, cz - 3, top + 2]);
  P(['pipe_straight_A', color, cx, cz + 3, top]);
  P(['pipe_straight_A', color, cx, cz + 3, top + 2]);
  P(['pipe_90_A', color, cx, cz - 3, top + 4, 0]);
  P(['pipe_90_A', color, cx, cz + 3, top + 4, 180]);
  P(['pipe_straight_A', color, cx, cz - 1, top + 6, 0, 90]);
}

// Grey truss gantry spanning the walkway in Z, as a framing landmark.
function buildGantry(P, cx, z) {
  for (const sx of [-z, z]) {
    P(['structure_C', 'neutral', cx, sx, 0]);
    P(['structure_C', 'neutral', cx, sx, 2]);
    P(['structure_C', 'neutral', cx, sx, 4]);
    P(['structure_C', 'neutral', cx, sx, 6]);
  }
  P(['strut_horizontal', 'neutral', cx, 0, 8]);
  P(['sign', 'neutral', cx, 0, 8]);
}
