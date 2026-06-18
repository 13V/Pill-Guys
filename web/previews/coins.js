// Coin-juice preview: a FAKE world of glowing coins so we can watch the idle
// bob/spin and the collect "pop". We first advance the juice by hand and log
// the numbers (bob amplitude + the coin hidden after its pop). Then a live
// showcase keeps a row of coins bobbing and continuously re-pops them on
// staggered timers, so the screenshot (taken ~1.2s after __ready) reliably
// catches some coins floating and at least one mid-pop (scaled up + fading).
import { createScene } from '../src/scene.js';
import { createEvents } from '../src/events.js';
import { createCoinJuice } from '../src/effects/coins.js';
import * as THREE from 'three';

const { scene, renderer } = createScene();
// Darker, neutral backdrop so the glowing yellow coins read with punch (the
// level backdrop in scene.js is near-white, which washes small emissive props).
scene.background = new THREE.Color(0x0d1320);
scene.fog = null;

// --- Coin factory (matches colliders.js: small bright-yellow icosahedron). ---
function makeCoin(x, y) {
  const geo = new THREE.IcosahedronGeometry(0.32, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffe14d,
    emissive: 0xffc400,
    emissiveIntensity: 1.25,
    metalness: 0.3,
    roughness: 0.35,
  });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, 0);
  m.castShadow = true;
  return m;
}

// =========================================================================
// PART A — numeric verification on the exact fake world from the contract.
// =========================================================================
{
  const COIN_Y = 1.5;
  const xs = [-2, 0, 2];
  const meshes = xs.map((x) => makeCoin(x, COIN_Y)); // numbers only; not in scene
  const world = { coins: meshes.map((m, i) => ({ name: `coin:${i}`, object3D: m })) };
  const events = createEvents();
  const juice = createCoinJuice(world, events);

  // 1) Idle bob over 30 frames (per the contract): Y moves off base.
  const base0 = world.coins[0].object3D.position.y;
  for (let i = 0; i < 30; i++) juice.update(1 / 60);
  const y0After = world.coins[0].object3D.position.y;
  const spin0 = world.coins[0].object3D.rotation.y;
  console.log(`[coins] bob (30f): base0=${base0.toFixed(3)} y_after=${y0After.toFixed(3)} differs=${Math.abs(y0After - base0) > 1e-4}`);
  console.log(`[coins] spin (30f): coin[0].rotation.y=${spin0.toFixed(4)} rad (>0, slow idle spin)`);

  // True amplitude: sweep a few full cycles, record coin[0]'s Y extremes.
  let minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < 360; i++) {
    juice.update(1 / 60);
    const y = world.coins[0].object3D.position.y;
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  console.log(`[coins] bob amplitude (full sweep): minY=${minY.toFixed(4)} maxY=${maxY.toFixed(4)} -> ±${((maxY - minY) / 2).toFixed(4)} around ${base0.toFixed(3)} (target ±0.12)`);

  // 2) Collect pop: trigger coin 1, advance ~20 frames, confirm it hides while
  //    the uncollected coins stay visible.
  events.emit('coin', { index: 1, object3D: world.coins[1].object3D });
  console.log(`[coins] emitted 'coin' index 1; visible at pop start=${world.coins[1].object3D.visible}`);
  for (let i = 0; i < 20; i++) juice.update(1 / 60);
  console.log(`[coins] coin[1].visible after pop=${world.coins[1].object3D.visible} (expect false)`);
  console.log(`[coins] uncollected coin[0].visible=${world.coins[0].object3D.visible}, coin[2].visible=${world.coins[2].object3D.visible}`);
}

// =========================================================================
// PART B — live, lively showcase for the screenshot.
//
// Each coin is its own little world + juice instance so their lifecycles are
// fully independent: one coin popping/respawning never disturbs another's
// in-flight pop. Pops are staggered across the row, so any given frame shows a
// mix of bobbing coins and at least one mid-pop — robust to screenshot timing.
// =========================================================================
const SHOW_Y = 1.5;
const SHOW_XS = [-2.4, -1.2, 0, 1.2, 2.4];

const lanes = SHOW_XS.map((x, i) => {
  const lane = {
    x,
    events: createEvents(),
    mesh: null,
    world: null,
    juice: null,
    nextPopIn: 0.6 + i * 0.4, // staggered first pop
    respawnIn: -1,            // <0 means "alive"
  };
  spawn(lane);
  return lane;
});

function spawn(lane) {
  const m = makeCoin(lane.x, SHOW_Y);
  scene.add(m);
  lane.mesh = m;
  lane.world = { coins: [{ name: 'coin:0', object3D: m }] };
  lane.juice = createCoinJuice(lane.world, lane.events);
}

// Camera framing the row: pulled in, three-quarter so bob (Y) + spin read.
const cam = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
cam.position.set(0.8, 2.1, 6.0);
cam.lookAt(0, SHOW_Y + 0.05, 0);
window.addEventListener('resize', () => {
  cam.aspect = window.innerWidth / window.innerHeight;
  cam.updateProjectionMatrix();
});

const POP_PERIOD = 2.4;     // time between a coin's pops once respawned
const RESPAWN_DELAY = 0.45; // beat after hidden before it returns

let last = performance.now();
let elapsed = 0;
let ready = false;
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  elapsed += dt;

  for (const lane of lanes) {
    if (lane.respawnIn >= 0) {
      lane.respawnIn -= dt;
      if (lane.respawnIn <= 0) {
        scene.remove(lane.mesh);
        spawn(lane);
        lane.respawnIn = -1;
        lane.nextPopIn = POP_PERIOD;
      }
    } else {
      lane.nextPopIn -= dt;
      if (lane.nextPopIn <= 0 && lane.mesh.visible) {
        lane.events.emit('coin', { index: 0, object3D: lane.mesh });
        lane.respawnIn = 0.18 /*pop*/ + RESPAWN_DELAY;
      }
    }
    lane.juice.update(dt);
  }

  renderer.render(scene, cam);
  if (!ready && elapsed > 0.9) { ready = true; window.__ready = true; }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.__coins = { lanes };
