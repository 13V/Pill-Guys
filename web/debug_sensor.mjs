import { initPhysics } from './src/physics.js';

const p = await initPhysics();
const RAPIER = p.RAPIER;
const w = p.world;

console.log('ActiveCollisionTypes:', JSON.stringify(RAPIER.ActiveCollisionTypes));

p.addStaticBoxFromTop(0, 5, 0, 3, 5, 3);

// Sensor WITH active collision types set to ALL (so KINEMATIC_FIXED is detected).
const sensor = p.addSensorBox(0, 6.2, 0, 0.5, 0.5, 0.5, 'coin:0');
sensor.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);

const ch = p.createCharacter({ radius: 0.35, halfHeight: 0.4, position: { x: 0, y: 6.2, z: 0 } });
console.log('char default activeCollisionTypes? testing with sensor.ALL set\n');

for (let i = 0; i < 3; i++) {
  ch.computeMove({ x: 0, y: 0, z: 0 });
  p.stepOnce();
}
console.log('p.sensorsOverlapping(ch.collider):', p.sensorsOverlapping(ch.collider));

// Drop test: does the kinematic controller pass THROUGH the sensor down to the floor?
console.log('\n--- DROP TEST (sensor active types = ALL) ---');
const ch2 = p.createCharacter({ radius: 0.35, halfHeight: 0.4, position: { x: 0, y: 12, z: 0 } });
let vy = 0; const dt = p.FIXED_DT;
for (let i = 0; i < 150; i++) {
  vy += -26 * dt;
  const { grounded } = ch2.computeMove({ x: 0, y: vy * dt, z: 0 });
  p.stepOnce();
  if (grounded && vy < 0) vy = 0;
}
console.log('rest y =', ch2.translation().y.toFixed(3), '(want ~5.75 = floor top 5 + 0.75)');
console.log('overlaps while resting on floor:', p.sensorsOverlapping(ch2.collider));
