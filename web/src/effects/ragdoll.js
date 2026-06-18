import * as THREE from 'three';

// RAGDOLL — a temporary jointed physics puppet spawned when the pill-guy is hit.
// Five dynamic Rapier bodies (torso + 2 arms + 2 legs) wired with spherical
// joints, launched with the player's velocity plus a random "hit" impulse so it
// tumbles and flails realistically (colliding with the level), then disposes.
//
//   const ragdoll = createRagdoll(scene, physics);
//   ragdoll.spawn({x,y,z}, {x,y,z} velocity, 0xff4d4d);  // on death
//   ragdoll.update(dt);   // each fixed step while active (after physics.stepOnce)
//   ragdoll.active        // true while flailing
//   ragdoll.torso()       // {x,y,z} of the torso (for the camera to watch)

const LIFETIME = 1.5; // seconds the ragdoll flails before it's cleared

export function createRagdoll(scene, physics) {
  const { world, RAPIER } = physics;
  let parts = [];   // [{ body, collider, mesh, half }]
  let joints = [];
  let group = null;
  let timer = 0;
  let active = false;

  function dynBody(x, y, z, vel) {
    const desc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y, z)
      .setLinvel((vel?.x || 0) + rand(3), (vel?.y || 0) + 4 + Math.random() * 5, (vel?.z || 0) + rand(3))
      .setAngvel({ x: rand(10), y: rand(10), z: rand(10) })
      .setLinearDamping(0.2)
      .setAngularDamping(0.3);
    return world.createRigidBody(desc);
  }

  function capsulePart(x, y, z, r, hh, color, vel) {
    const body = dynBody(x, y, z, vel);
    const collider = world.createCollider(RAPIER.ColliderDesc.capsule(hh, r).setDensity(1.0).setRestitution(0.3), body);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.05 });
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, hh * 2, 6, 12), mat);
    mesh.castShadow = true;
    group.add(mesh);
    const part = { body, collider, mesh };
    parts.push(part);
    return part;
  }

  function spawn(pos, vel, color = 0xff4d4d) {
    clear();
    group = new THREE.Group();
    scene.add(group);
    const limbColor = new THREE.Color(color).multiplyScalar(0.7).getHex();

    // torso (the bean), 2 arms at the shoulders, 2 legs below.
    const torso = capsulePart(pos.x, pos.y, pos.z, 0.32, 0.36, color, vel);
    const armL = capsulePart(pos.x - 0.5, pos.y + 0.15, pos.z, 0.13, 0.18, limbColor, vel);
    const armR = capsulePart(pos.x + 0.5, pos.y + 0.15, pos.z, 0.13, 0.18, limbColor, vel);
    const legL = capsulePart(pos.x - 0.18, pos.y - 0.6, pos.z, 0.15, 0.2, limbColor, vel);
    const legR = capsulePart(pos.x + 0.18, pos.y - 0.6, pos.z, 0.15, 0.2, limbColor, vel);

    // spherical joints: shoulders + hips.
    joint(torso.body, armL.body, { x: -0.36, y: 0.15, z: 0 }, { x: 0.22, y: 0, z: 0 });
    joint(torso.body, armR.body, { x: 0.36, y: 0.15, z: 0 }, { x: -0.22, y: 0, z: 0 });
    joint(torso.body, legL.body, { x: -0.18, y: -0.4, z: 0 }, { x: 0, y: 0.24, z: 0 });
    joint(torso.body, legR.body, { x: 0.18, y: -0.4, z: 0 }, { x: 0, y: 0.24, z: 0 });

    timer = LIFETIME;
    active = true;
    update(0);
  }

  function joint(b1, b2, a1, a2) {
    const jd = RAPIER.JointData.spherical(a1, a2);
    joints.push(world.createImpulseJoint(jd, b1, b2, true));
  }

  function update() {
    if (!active) return;
    for (const p of parts) {
      const t = p.body.translation();
      const q = p.body.rotation();
      p.mesh.position.set(t.x, t.y, t.z);
      p.mesh.quaternion.set(q.x, q.y, q.z, q.w);
    }
    // fade out near the end
    const k = Math.min(1, timer / 0.4);
    for (const p of parts) {
      if (k < 1) { p.mesh.material.transparent = true; p.mesh.material.opacity = k; }
    }
  }

  function tick(dt) {
    if (!active) return;
    timer -= dt;
    update();
    if (timer <= 0) clear();
  }

  function clear() {
    for (const j of joints) { try { world.removeImpulseJoint(j, false); } catch {} }
    for (const p of parts) {
      try { world.removeRigidBody(p.body); } catch {}
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    }
    if (group) scene.remove(group);
    parts = []; joints = []; group = null; active = false;
  }

  return {
    spawn,
    update: tick,
    clear,
    get active() { return active; },
    torso() { return parts[0] ? parts[0].body.translation() : null; },
  };
}

function rand(m) { return (Math.random() * 2 - 1) * m; }
