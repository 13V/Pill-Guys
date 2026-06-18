import { initPhysics } from './src/physics.js';
import { buildColliders } from './src/colliders.js';

const p = await initPhysics();
buildColliders(p, { add() {} });

const w = p.world;
console.log('Total colliders:', w.colliders.len());
console.log('\nAll colliders (translation, half-extents, isSensor):');
w.forEachCollider((c) => {
  const t = c.translation();
  const he = c.halfExtents ? c.halfExtents() : null;
  console.log(
    `  pos=(${t.x.toFixed(2)},${t.y.toFixed(2)},${t.z.toFixed(2)})`,
    he ? `he=(${he.x.toFixed(2)},${he.y.toFixed(2)},${he.z.toFixed(2)})` : 'he=?',
    'sensor=' + c.isSensor()
  );
});
