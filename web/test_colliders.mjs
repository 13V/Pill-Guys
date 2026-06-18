import { initPhysics } from './src/physics.js';
import { buildColliders } from './src/colliders.js';
import { DECK, TOWER, SEG } from './src/layout.js';

const p = await initPhysics();
const sceneAdds = [];
const fakeScene = { add(o) { sceneAdds.push(o); } };
const r = buildColliders(p, fakeScene);

console.log('=== COUNTS ===');
console.log('colliders.len():', p.world.colliders.len(), '(should be > 12)');
console.log('spawn:', JSON.stringify(r.spawn));
console.log('coins.length:', r.coins.length);
console.log('scene.add calls:', sceneAdds.length);
console.log('coin names:', r.coins.map((c) => c.name).join(', '));
console.log('coins[N] matches coin:N:', r.coins.every((c, i) => c.name === `coin:${i}`));
console.log('coin object3D have .visible:', r.coins.every((c) => 'visible' in c.object3D));

// ------------------------------------------------------------------
// LANDING TEST using the SAME kinematic character controller the game uses.
// The controller ignores sensor colliders, so it lands on the solid decks.
// ------------------------------------------------------------------
console.log('\n=== LANDING TESTS (kinematic character dropped onto each deck) ===');
function dropChar(label, cx, cz, expectedTop) {
  const halfHeight = 0.4, radius = 0.35;
  const ch = p.createCharacter({ radius, halfHeight, position: { x: cx, y: expectedTop + 6, z: cz } });
  let vy = 0;
  const dt = p.FIXED_DT, g = -26;
  for (let i = 0; i < 120; i++) {
    vy += g * dt;
    const { grounded } = ch.computeMove({ x: 0, y: vy * dt, z: 0 });
    p.stepOnce();
    if (grounded && vy < 0) vy = 0;
  }
  const t = ch.translation();
  // capsule center rests at deckTop + radius + halfHeight = top + 0.75
  const target = expectedTop + radius + halfHeight;
  const ok = Math.abs(t.y - target) < 0.15 && Math.abs(t.x - cx) < 0.4 && Math.abs(t.z - cz) < 0.4;
  console.log(`  ${label}: rest y=${t.y.toFixed(3)} (target ~${target.toFixed(2)}), grounded=${ch.grounded}, x=${t.x.toFixed(2)}, z=${t.z.toFixed(2)}  ${ok ? 'OK' : 'FAIL'}`);
  return { ok, ch };
}
let allLand = true;
const built = [];
for (const [label, cx, cz, top] of [
  ['start', SEG.start.cx, 0, DECK.top],
  ['conveyor', SEG.conveyor.cx, 0, DECK.top],
  ['spikes', SEG.spikes.cx, 0, DECK.top],
  ['landmark', SEG.landmark.cx, 0, DECK.top],
  ['bridge', SEG.bridge.cx, 0, DECK.top],
  ['finish', SEG.finish.cx, 0, TOWER.deckTop],
]) {
  const res = dropChar(label, cx, cz, top);
  allLand &&= res.ok;
}

// ------------------------------------------------------------------
// SENSOR OVERLAP TEST: put a character at each region center, step, and read
// sensorsOverlapping(character.collider) — exactly how interactions.js works.
// ------------------------------------------------------------------
console.log('\n=== SENSOR OVERLAP (via character.collider, as interactions.js does) ===');
function senseAt(label, x, y, z) {
  const ch = p.createCharacter({ radius: 0.35, halfHeight: 0.4, position: { x, y, z } });
  // step a couple times so intersection pairs are computed
  for (let i = 0; i < 2; i++) { ch.computeMove({ x: 0, y: 0, z: 0 }); p.stepOnce(); }
  const names = p.sensorsOverlapping(ch.collider);
  console.log(`  ${label} @ (${x},${y},${z}):`, names.length ? names.join(', ') : '(NONE)');
  return names;
}
const seen = new Set();
[
  ['spike death', SEG.spikes.cx, DECK.top + 0.8, 0],
  ['bridge spring', SEG.bridge.cx, DECK.top + 0.8, 0],
  ['conveyor band', SEG.conveyor.cx, DECK.top + 0.7, 0],
  ['finish', SEG.finish.cx, TOWER.deckTop + 0.8, 0],
  ['kill floor', 13, -5.5, 0],
  ['coin:0', SEG.start.cx, DECK.top + 1.2, 0],
  ['coin:5 (spring height)', SEG.bridge.cx, DECK.top + 1.6, 0],
  ['coin:7 (finish high)', SEG.finish.cx, TOWER.deckTop + 2.4, 0],
].forEach(([l, x, y, z]) => senseAt(l, x, y, z).forEach((n) => seen.add(n)));

console.log('\n=== RESULT ===');
console.log('all decks catch the character:', allLand);
console.log('collider count > 12:', p.world.colliders.len() > 12);
console.log('distinct sensor names observed:', [...seen].sort().join(', '));
