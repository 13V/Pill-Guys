import { initPhysics } from './src/physics.js';
import { buildColliders } from './src/colliders.js';
import { DECK, TOWER, SEG } from './src/layout.js';
const RAPIER = (await import('@dimforge/rapier3d-compat')).default;

const p = await initPhysics();
buildColliders(p, { add(){} });

// Drop dynamic probe at start center (3,0), trace y every 10 steps.
const b = p.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(3, 13, 0));
p.world.createCollider(RAPIER.ColliderDesc.ball(0.3), b);
for(let i=0;i<120;i++){ p.stepOnce(); if(i%10===0||i>40&&i<60) console.log('step',i,'y=',b.translation().y.toFixed(3),'x=',b.translation().x.toFixed(3)); }
console.log('FINAL start probe y=', b.translation().y.toFixed(3), '(deck top 5 -> want ~5.30)');
