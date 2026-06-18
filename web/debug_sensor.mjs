import { initPhysics } from './src/physics.js';

const p = await initPhysics();
const RAPIER = p.RAPIER;
const w = p.world;

// One solid floor at top y=5 (center 2.5, hy 2.5), and one sensor box at y=6.2.
p.addStaticBoxFromTop(0, 5, 0, 3, 5, 3);
const sensor = p.addSensorBox(0, 6.2, 0, 0.5, 0.5, 0.5, 'coin:0');

// Character placed so it overlaps the sensor.
const ch = p.createCharacter({ radius: 0.35, halfHeight: 0.4, position: { x: 0, y: 6.2, z: 0 } });

console.log('character collider handle:', ch.collider.handle, 'isSensor:', ch.collider.isSensor());
console.log('sensor handle:', sensor.handle);

// Step a few times so the broad/narrow phase populates intersection pairs.
for (let i = 0; i < 3; i++) {
  ch.computeMove({ x: 0, y: 0, z: 0 });
  p.stepOnce();
}
const t = ch.translation();
console.log('character pos after steps:', JSON.stringify({ x: +t.x.toFixed(3), y: +t.y.toFixed(3), z: +t.z.toFixed(3) }));

console.log('\n--- p.sensorsOverlapping(ch.collider):', p.sensorsOverlapping(ch.collider));

console.log('\n--- raw intersectionPairsWith(ch.collider):');
w.intersectionPairsWith(ch.collider, (other) => {
  console.log('   overlaps handle', other.handle, 'isSensor=', other.isSensor());
});

console.log('\n--- intersectionPair(ch.collider, sensor):', w.intersectionPair(ch.collider, sensor));

console.log('\n--- contactPairsWith(ch.collider):');
w.contactPairsWith(ch.collider, (other) => {
  console.log('   contact with handle', other.handle, 'isSensor=', other.isSensor());
});

// Now drop the character from above to see what it rests on.
console.log('\n--- DROP TEST onto floor (top y=5) with a coin sensor at 6.2 in the way:');
const ch2 = p.createCharacter({ radius: 0.35, halfHeight: 0.4, position: { x: 0, y: 12, z: 0 } });
let vy = 0; const dt = p.FIXED_DT;
for (let i = 0; i < 120; i++) {
  vy += -26 * dt;
  const { grounded } = ch2.computeMove({ x: 0, y: vy * dt, z: 0 });
  p.stepOnce();
  if (grounded && vy < 0) vy = 0;
}
const t2 = ch2.translation();
console.log('   rest y =', t2.y.toFixed(3), '(expected ~5.75 if it ignores the sensor; ~6.70 if it sits on the sensor)');
