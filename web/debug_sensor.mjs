import { initPhysics } from './src/physics.js';
const RAPIER = (await import('@dimforge/rapier3d-compat')).default;
const dt = 1/60, G = -26;

async function jumpReach(JUMP_V, coinCy, coinHy){
  const p = await initPhysics();
  p.addStaticBoxFromTop(0, 5, 0, 6, 5, 3);
  const s = p.addSensorBox(0, coinCy, 0, 0.5, coinHy, 0.5, 'coin');
  s.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);
  const ch = p.createCharacter({ radius:0.35, halfHeight:0.4, position:{x:0,y:6.0,z:0} });
  let vy=0;
  for(let i=0;i<40;i++){ vy+=G*dt; const{grounded}=ch.computeMove({x:0,y:vy*dt,z:0}); p.stepOnce(); if(grounded&&vy<0)vy=-0.1; }
  // jump
  vy = JUMP_V; let hit=false, apex=-1e9;
  for(let i=0;i<100;i++){
    if(i>0) vy += G*dt;
    const { grounded } = ch.computeMove({x:0,y:vy*dt,z:0});
    p.stepOnce();
    if (grounded && vy < 0) vy = -0.1;
    const y=ch.translation().y; apex=Math.max(apex,y);
    if (p.sensorsOverlapping(ch.collider).includes('coin')) hit=true;
  }
  console.log(`JUMP_V=${JUMP_V} coin(cy=${coinCy},hy=${coinHy},bottom=${(coinCy-coinHy).toFixed(2)}): apex=${apex.toFixed(2)} HIT=${hit?'YES':'NO'}`);
}
for (const jv of [10,11,12]) {
  await jumpReach(jv, 7.2, 0.5);  // bottom 6.7
  await jumpReach(jv, 7.4, 0.5);  // bottom 6.9
  await jumpReach(jv, 8.0, 0.5);  // bottom 7.5
}
