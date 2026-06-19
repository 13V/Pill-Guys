// REMOTE PLAYERS — renders the OTHER players as interpolated "puppet" beans.
//
//   createRemotePlayers(scene) -> { add, remove, setState, has, count, update, clear }
//
// Peers are purely visual: no physics, no collision. We smoothly lerp each bean
// toward its last-known network transform (position + yaw) and run a lightweight
// walk cycle when it's moving, so a remote bean reads the same as the local one.
// buildCharacter is reused so each peer wears its owner's skin exactly. A small
// floating name tag rides above each head.
//
// Network states arrive ~15Hz; the lerp (POS_DAMP) smooths that into continuous
// motion. A little extrapolation isn't worth the complexity for a party game, so
// we just chase the latest target — at 15Hz the visible lag is tiny.
import * as THREE from 'three';
import { buildCharacter } from '../character.js';

const POS_DAMP = 12;   // position chase rate (1/s-ish via 1-e^-k dt)
const YAW_DAMP = 12;

export function createRemotePlayers(scene) {
  const peers = new Map(); // id -> peer

  function makeNameTag(name) {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.font = '700 40px "Baloo 2", system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 8; ctx.strokeStyle = '#1b50c8'; ctx.strokeText(name, 128, 34);
    ctx.fillStyle = '#ffffff'; ctx.fillText(name, 128, 34);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    spr.scale.set(1.6, 0.4, 1);
    spr.position.y = 1.5;
    spr.renderOrder = 999;
    return spr;
  }

  function add(id, skin, name, p, r) {
    if (peers.has(id)) return;
    const object3D = new THREE.Object3D();
    const sp = Array.isArray(p) ? p : [0, 6, 0];
    object3D.position.set(sp[0], sp[1], sp[2]);
    object3D.rotation.y = r || 0;
    scene.add(object3D);
    const limbs = buildCharacter(object3D, skin);
    const tag = makeNameTag(name || 'Bean');
    if (tag) object3D.add(tag);
    peers.set(id, {
      object3D, limbs,
      target: { x: sp[0], y: sp[1], z: sp[2], ry: r || 0 },
      moving: false, walk: 0,
    });
  }

  function remove(id) {
    const pe = peers.get(id);
    if (!pe) return;
    scene.remove(pe.object3D);
    pe.object3D.traverse((o) => { if (o.geometry && o.geometry.dispose) o.geometry.dispose(); });
    peers.delete(id);
  }

  function setState(id, p, r, moving) {
    const pe = peers.get(id);
    if (!pe) return;
    if (Array.isArray(p)) { pe.target.x = p[0]; pe.target.y = p[1]; pe.target.z = p[2]; }
    pe.target.ry = r || 0;
    pe.moving = !!moving;
  }

  function update(dt) {
    const ap = 1 - Math.exp(-POS_DAMP * Math.max(dt, 0));
    const ay = 1 - Math.exp(-YAW_DAMP * Math.max(dt, 0));
    for (const pe of peers.values()) {
      const o = pe.object3D, t = pe.target;
      o.position.x += (t.x - o.position.x) * ap;
      o.position.y += (t.y - o.position.y) * ap;
      o.position.z += (t.z - o.position.z) * ap;
      // shortest-arc yaw chase
      let d = ((t.ry - o.rotation.y + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (d < -Math.PI) d += Math.PI * 2;
      o.rotation.y += d * ay;
      // walk cycle (mirrors player.js) when moving, ease to rest otherwise
      const L = pe.limbs;
      if (L) {
        if (pe.moving) {
          pe.walk += dt * 9;
          const s = Math.sin(pe.walk) * 0.8;
          L.legL.rotation.x = s; L.legR.rotation.x = -s;
          L.armL.rotation.x = -s * 0.7; L.armR.rotation.x = s * 0.7;
        } else {
          for (const m of [L.legL, L.legR, L.armL, L.armR]) m.rotation.x *= 0.85;
        }
      }
    }
  }

  function clear() { for (const id of [...peers.keys()]) remove(id); }

  return {
    add, remove, setState, update, clear,
    has: (id) => peers.has(id),
    count: () => peers.size,
    // Debug/util: snapshot each peer's latest network target (used by tests).
    list: () => [...peers.entries()].map(([id, pe]) => ({ id, x: pe.target.x, y: pe.target.y, z: pe.target.z, moving: pe.moving })),
  };
}
