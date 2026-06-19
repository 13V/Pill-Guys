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

export async function buildLevel(level, { scene, physics, seaLevel = -8 }) {
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

  // ---- START PAD (widened starting LINE) + spawn grid ------------------------
  // For a Fall-Guys-style pack we widen the spawn hub across Z (perpendicular to
  // the +X run) into a starting line and lay a grid of spawn SLOTS on it. Only the
  // START is widened (per design) — the lane courses past it are untouched. It's
  // derived generically from the hub deck, so no level data changes. Single-player
  // still uses level.spawn; multiplayer assigns built.spawns[slot].
  const spawns = [];
  const sp0 = level.spawn || { x: level.decks?.[0]?.cx ?? 3, y: deckTopDefault + 1.2, z: 0 };
  const spx = sp0.x, spz = sp0.z ?? 0;
  const startHub = (level.decks || []).find((d) => d.kind === 'platform'
    && spx >= d.cx - d.w / 2 - 0.5 && spx <= d.cx + d.w / 2 + 0.5
    && spz >= d.cz - d.d / 2 - 0.5 && spz <= d.cz + d.d / 2 + 0.5);
  const START_PAD_DEPTH = 16; // Z extent of the widened starting line

  function fillSpawnGrid(cx, cz, w, d, top) {
    // ranks ALONG X (staggered a little back from the line), columns ACROSS Z.
    const rows = w >= 6 ? 3 : 2;
    const usableX = Math.max(w - 2.4, 0.001), usableZ = Math.max(d - 2, 1);
    const y = top + 1.2;
    const cols = Math.max(2, Math.floor(usableZ / 1.8) + 1);
    for (let ci = 0; ci < cols; ci++) {
      const z = cz - usableZ / 2 + (usableZ * ci) / (cols - 1);
      for (let ri = 0; ri < rows; ri++) {
        const x = cx - usableX / 2 + (rows === 1 ? usableX / 2 : (usableX * ri) / (rows - 1));
        spawns.push({ x, y, z });
      }
    }
  }

  function buildStartPad(dk) {
    const top = dk.top ?? deckTopDefault;
    const base = DECK_BASE_TO_FLOOR(top);
    const col = dk.color || color;
    const w = dk.w || 6;
    const cz0 = dk.cz ?? 0;
    // tile fixed-size platform pieces across Z to reach START_PAD_DEPTH (no custom
    // wide asset exists; 6x2 tiles fill any depth, 4x4 for w=4 hubs). No interior
    // rails so the starting line reads open.
    const pieceZ = w === 4 ? 4 : 2;
    const pieceName = w === 4 ? 'platform_4x4x1' : 'platform_6x2x1';
    const n = Math.max(1, Math.round(START_PAD_DEPTH / pieceZ));
    const fullD = n * pieceZ;
    for (let i = 0; i < n; i++) P([pieceName, col, dk.cx, cz0 - fullD / 2 + pieceZ / 2 + i * pieceZ, base]);
    solid(dk.cx, top, cz0, w / 2, fullD / 2, top); // one collider for the whole pad
    for (let i = 0; i <= n; i += Math.max(1, Math.floor(n / 4))) addLegs(dk.cx, cz0 - fullD / 2 + i * pieceZ, w, pieceZ, base);
    noteX(dk.cx - w / 2); noteX(dk.cx + w / 2);
    fillSpawnGrid(dk.cx, cz0, w, fullD, top);
  }

  // ---- DECKS ----
  for (const dk of level.decks || []) {
    const top = dk.top ?? deckTopDefault;
    const base = DECK_BASE_TO_FLOOR(top);
    const col = dk.color || color;

    if (dk.kind === 'platform') {
      if (dk === startHub) { buildStartPad(dk); continue; }
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
  // DECLUTTER: the decorative chaos props (non-lethal menace/sawblade/cone) are
  // authored very densely (60-130 per level), which reads as visual NOISE. Thin
  // them to a clean, spaced stream — keep only ones >= DECOR_SPACING apart in x —
  // so each obstacle reads and the course looks designed, not messy. Every
  // GAMEPLAY hazard (spikes gauntlets, lethal pit saws, etc.) is always kept.
  const DECOR_SPACING = 6.5;
  const isDecor = (h) => (h.kind === 'menace' || h.kind === 'sawblade' || h.kind === 'cone') && !h.lethal;
  const keepDecor = new Set();
  {
    const sorted = (level.hazards || []).filter(isDecor).map((h, i) => ({ h, i }))
      .sort((a, b) => ((a.h.cx ?? 0) - (b.h.cx ?? 0)) || (a.i - b.i));
    let lastX = -Infinity;
    for (const { h } of sorted) { const x = h.cx ?? 0; if (x - lastX >= DECOR_SPACING) { keepDecor.add(h); lastX = x; } }
  }
  const hazardsToBuild = (level.hazards || []).filter((h) => !isDecor(h) || keepDecor.has(h));
  for (const hz of hazardsToBuild) {
    const top = hz.top ?? deckTopDefault;
    if (hz.kind === 'spikes') {
      const s = hz.size || 4;
      const sp = place(group, [`floor_spikes_${s}x${s}x1`, 'neutral', hz.cx, hz.cz, top]);
      // Menacing extend/retract pulse. VISUAL ONLY — the death box is always-on,
      // so the bed never fully sinks (worldAnim keeps scaleY well above zero).
      tasks.push(sp.then((o) => { if (o) o.userData.pulse = { amp: 0.22, speed: 3.2, phase: (hz.cx + hz.cz) * 0.5 }; }));
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
      const sb = place(group, [`spikeblock_${dir}`, hz.color || color, hz.cx, hz.cz, top]);
      // Piston thrust in Y (visual only; the death sensor stays put).
      tasks.push(sb.then((o) => { if (o) o.userData.osc = { axis: 'y', amp: 0.18, speed: 2.6, phase: hz.cz }; }));
      sensor(hz.cx, top + 0.6, hz.cz, 0.6, 0.6, 0.6, 'death');
    } else if (hz.kind === 'spikeroller') {
      const r = place(group, ['spikeroller_horizontal', 'neutral', hz.cx, hz.cz, top + 2]);
      tasks.push(r.then((o) => { if (o) o.userData.spin = { localY: false, speed: 4, axis: 'x' }; }));
      if (hz.lethal) sensor(hz.cx, top + 0.8, hz.cz, 2, 0.8, 2, 'death');
    } else if (hz.kind === 'cone') {
      P(['cone', 'red', hz.cx, hz.cz, top]); // decorative warning only
    } else if (hz.kind === 'menace') {
      // Generic animated hazard. SWINGING ones (hammers / spikeballs / wrecking
      // arms) hang from a pivot anchored ABOVE the head and swing the PIVOT, so the
      // head sweeps a real pendulum arc instead of the model rocking about its own
      // base. Others place in place and optionally spin. Decorative by default (no
      // death box) so it never blocks a lane; flag lethal sparingly.
      const dy = hz.dy ?? 0;
      if (hz.swing) {
        const axis = hz.swing.axis === 'z' ? 'z' : 'x'; // vertical-plane pendulum (a 'y' swing isn't one -> x)
        const arm = hz.arm ?? 2.8;                       // how far the head hangs below the pivot
        const pivot = new THREE.Group();
        pivot.position.set(hz.cx, top + dy + arm, hz.cz);
        pivot.userData.swing = { axis, amp: hz.swing.amp ?? 0.7, speed: hz.swing.speed ?? 1.6, phase: hz.swing.phase || 0 };
        group.add(pivot);
        // a thin metal arm rod from the anchor down to the head
        const rod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, arm, 8),
          new THREE.MeshStandardMaterial({ color: 0x556070, roughness: 0.5, metalness: 0.55 }),
        );
        rod.position.y = -arm / 2; rod.castShadow = true; pivot.add(rod);
        const mp = place(pivot, [hz.model, hz.color || 'neutral', 0, 0, -arm, hz.ry || 0, hz.rx || 0, hz.rz || 0]);
        tasks.push(mp.then((o) => { if (o && hz.spin) o.userData.spin = { axis: hz.spin.axis || 'y', speed: hz.spin.speed ?? 5, localY: hz.spin.localY }; }));
      } else {
        const mp = place(group, [hz.model, hz.color || 'neutral', hz.cx, hz.cz, top + dy, hz.ry || 0, hz.rx || 0, hz.rz || 0]);
        tasks.push(mp.then((o) => { if (o && hz.spin) o.userData.spin = { axis: hz.spin.axis || 'y', speed: hz.spin.speed ?? 5, localY: hz.spin.localY }; }));
      }
      if (hz.lethal) sensor(hz.cx, top + (hz.lethalDy ?? 0.6), hz.cz, hz.hx ?? 0.8, hz.hy ?? 0.8, hz.hzz ?? 0.8, 'death');
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

  // ---- Ocean kill: a thick slab whose TOP sits at the waterline, so touching
  // the sea (or falling past it) is lethal. Wide + deep so a sprung/launched
  // player can't clear it and a fast fall can't tunnel through. ----
  const cxAll = (minX + maxX) / 2;
  const span = Math.max(maxX - minX, 10) + 80;
  sensor(cxAll, seaLevel - 12, 0, span / 2, 12, 140, 'death');

  await Promise.all(tasks);

  // Fallback grid if the spawn wasn't on a recognised hub (so multiplayer still
  // has slots to spread across, just without the widening).
  if (spawns.length === 0) fillSpawnGrid(spx, spz, 5, 5, (sp0.y ?? deckTopDefault + 1.2) - 1.2);

  const spawn = level.spawn || { x: (level.decks?.[0]?.cx ?? 3), y: deckTopDefault + 1.2, z: 0 };
  return { group, spawn, spawns, coins, finishPos: finishCenter || { x: maxX, y: deckTopDefault + 1, z: 0 }, lengthX: maxX - minX };
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
