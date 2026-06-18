import { initPhysics } from './src/physics.js';
const RAPIER = (await import('@dimforge/rapier3d-compat')).default;

// Q1: does a DYNAMIC body pass through a sensor (correct Rapier behavior) or rest on it?
{
  const p = await initPhysics();
  p.addStaticBoxFromTop(0,5,0,3,5,3);          // floor top 5
  p.addSensorBox(0,6.2,0,0.5,0.5,0.5,'coin');  // sensor 5.7..6.7
  const b = p.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,12,0));
  p.world.createCollider(RAPIER.ColliderDesc.ball(0.3), b);
  for(let i=0;i<120;i++) p.stepOnce();
  console.log('Q1 dynamic ball with sensor above floor -> rest y =', b.translation().y.toFixed(3), '(want ~5.30 if it falls through sensor; ~6.70 if sensor blocks)');
}
// Q2: dynamic body onto bare floor (no sensor) -> sanity
{
  const p = await initPhysics();
  p.addStaticBoxFromTop(0,5,0,3,5,3);
  const b = p.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,12,0));
  p.world.createCollider(RAPIER.ColliderDesc.ball(0.3), b);
  for(let i=0;i<120;i++) p.stepOnce();
  console.log('Q2 dynamic ball bare floor -> rest y =', b.translation().y.toFixed(3), '(want ~5.30)');
}
