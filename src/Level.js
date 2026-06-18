import * as THREE from 'three';
import { CONFIG } from './config.js';
import {
  SpinningBeam,
  SpikeRoller,
  Conveyor,
  MovingPlatform,
  Gear,
  TubeArch,
  Gate,
} from './obstacles.js';

const COLORS = {
  platform: 0x2fb6ff,
  platformAlt: 0x49c7ff,
  start: 0x7b5cff,
  finish: 0x32d96a,
  trim: 0xeef6ff,
  pillar: 0x6b7785,
  flag: 0x32d96a,
};

const PLAYER_LIFT = CONFIG.player.halfHeight + CONFIG.player.radius + 0.3;
const SLIME_Y = -8;

// A winding obstacle course inspired by the KayKit Platformer Pack promo
// layouts: an elevated track on pillars that snakes through hazards.
export class Level {
  constructor(scene, physics, assets) {
    this.scene = scene;
    this.physics = physics;
    this.assets = assets;

    this.obstacles = [];
    this.hazards = [];
    this.surfaceByHandle = new Map();
    this.checkpoints = [];
    this.currentIndex = -1;

    this._build();

    this.startRespawn = new THREE.Vector3(0, 0 + PLAYER_LIFT, 0);
    this.currentCheckpoint = this.startRespawn.clone();
  }

  // ---- building blocks -----------------------------------------------------

  _mat(color) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.65, metalness: 0.05 });
  }

  _platform({ x = 0, z, w, d, top = 0, color, pillars = true, collider = true }) {
    const cy = top - 0.5;
    const c = new THREE.Vector3(x, cy, z);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 1, d), this._mat(color ?? COLORS.platform));
    mesh.position.copy(c);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (collider) this.physics.addStaticBox(c, new THREE.Vector3(w, 1, d));

    // rim trim
    const trim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.14, d + 0.3), this._mat(COLORS.trim));
    trim.position.set(x, top + 0.07, z);
    this.scene.add(trim);

    if (pillars) {
      const ox = Math.min(w / 2 - 0.8, 3);
      const oz = Math.min(d / 2 - 0.8, 3);
      this._pillar(x - ox, z - oz, top);
      this._pillar(x + ox, z + oz, top);
    }
    return mesh;
  }

  _pillar(x, z, topY) {
    const height = topY - 0.5 - SLIME_Y;
    if (height <= 0) return;
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, height, 0.7),
      this._mat(COLORS.pillar),
    );
    pillar.position.set(x, SLIME_Y + height / 2, z);
    pillar.receiveShadow = true;
    this.scene.add(pillar);
  }

  _ramp({ x = 0, z, w, fromTop, toTop, length }) {
    const rise = toTop - fromTop;
    const angle = Math.atan2(rise, length);
    const span = Math.hypot(length, rise);
    const center = new THREE.Vector3(x, (fromTop + toTop) / 2 - 0.25, z);
    const size = new THREE.Vector3(w, 0.5, span);

    const euler = new THREE.Euler(-angle, 0, 0);
    const quat = new THREE.Quaternion().setFromEuler(euler);
    this.physics.addStaticBoxRotated(center, size, {
      x: quat.x, y: quat.y, z: quat.z, w: quat.w,
    });

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, span), this._mat(COLORS.platformAlt));
    mesh.position.copy(center);
    mesh.quaternion.copy(quat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  _add(obstacle) {
    this.obstacles.push(obstacle);
    if (obstacle.isHazard) this.hazards.push(obstacle);
    if (obstacle.surfaceHandle != null) {
      this.surfaceByHandle.set(obstacle.surfaceHandle, () => obstacle.surfaceVelocity());
    }
    return obstacle;
  }

  _checkpoint(x, z, top) {
    const index = this.checkpoints.length;
    this.checkpoints.push({
      index,
      center: new THREE.Vector3(x, top + 1.5, z),
      half: new THREE.Vector3(6, 3.5, 4),
      respawn: new THREE.Vector3(x, top + PLAYER_LIFT, z),
    });
    // flag
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3, 0.18), this._mat(COLORS.trim));
    pole.position.set(x + 3.2, top + 1.5, z);
    this.scene.add(pole);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.85, 0.08), this._mat(COLORS.flag));
    flag.position.set(x + 3.85, top + 2.6, z);
    this.scene.add(flag);
  }

  // ---- the course ----------------------------------------------------------

  _build() {
    const P = this.physics;
    const S = this.scene;

    // 1) Start
    this._platform({ x: 0, z: 0, w: 10, d: 9, top: 0, color: COLORS.start });
    this._add(new Gate(S, P, { x: 0, y: 0, z: -3.6, width: 7, height: 4.5 }));

    // 2) Stepping stones (slight meander)
    this._platform({ x: -2.5, z: 9.5, w: 4, d: 4 });
    this._platform({ x: 2.5, z: 14.5, w: 4, d: 4 });
    this._platform({ x: 0, z: 19.5, w: 4.5, d: 4.5 });

    // 3) Spinning-beam arena
    this._platform({ x: 0, z: 27, w: 11, d: 8 });
    this._add(new SpinningBeam(S, P, { x: 0, y: 0, z: 25, length: 4.6, height: 0.9, speed: 1.7 }));
    this._add(new SpinningBeam(S, P, { x: 0, y: 0, z: 29.5, length: 5, height: 1.4, speed: -1.3, phase: Math.PI / 2 }));
    this._add(new TubeArch(S, P, { x: 0, y: 0.2, z: 27, radius: 4, color: 0xff5a4d }));
    this._checkpoint(0, 27, 0);

    // 4) Conveyor against you. The belt's own collider is the floor, so the
    // decorative base sits slightly lower (no z-fighting, no stray collider).
    this._platform({ x: 0, z: 36, w: 6, d: 10, top: -0.08, color: COLORS.platformAlt, collider: false });
    this._add(new Conveyor(S, P, { x: 0, y: 0, z: 36, w: 5.6, d: 9.6, dir: 'z', speed: -4 }));

    // 5) Moving platforms across the void
    this._platform({ x: 0, z: 43.5, w: 6, d: 5 });
    this._add(new MovingPlatform(S, P, { x: 0, y: 0, z: 48.5, w: 4.5, d: 4.5, axis: 'x', amplitude: 2.6, speed: 1.2 }));
    this._add(new MovingPlatform(S, P, { x: 0, y: 0, z: 53.5, w: 4.5, d: 4.5, axis: 'x', amplitude: 2.6, speed: 1.45, phase: Math.PI }));
    this._platform({ x: 0, z: 59, w: 8, d: 6 });
    this._checkpoint(0, 59, 0);

    // 6) Ramp up to the high tier
    this._platform({ x: 0, z: 63.5, w: 6, d: 3.5 });
    this._ramp({ x: 0, z: 67, w: 6, fromTop: 0, toTop: 2, length: 4 });
    this._platform({ x: 0, z: 71.5, w: 7, d: 4, top: 2 });

    // 7) Spike-roller corridor
    this._platform({ x: 0, z: 79, w: 6, d: 12, top: 2, color: COLORS.platformAlt });
    this._add(new SpikeRoller(S, P, { x: 0, y: 2, z: 76, span: 5.2, radius: 0.6, range: 3.5, speed: 1.5 }));
    this._add(new SpikeRoller(S, P, { x: 0, y: 2, z: 82, span: 5.2, radius: 0.6, range: 3.5, speed: 1.7, phase: Math.PI }));
    this._add(new Gear(S, P, { x: -4, y: 3, z: 79, radius: 1.6, speed: 1.2 }));
    this._add(new Gear(S, P, { x: 4, y: 3, z: 79, radius: 1.6, speed: -1.2 }));
    this._checkpoint(0, 71.5, 2);

    // 8) Finish
    this._platform({ x: 0, z: 89, w: 10, d: 9, top: 2, color: COLORS.finish });
    this._add(new Gate(S, P, { x: 0, y: 2, z: 92.5, width: 7, height: 4.5, color: COLORS.finish }));
    this._buildCrown(0, 89, 2);
  }

  _buildCrown(x, z, top) {
    let crown = this.assets.get('crown');
    if (crown) {
      crown.scale.setScalar(1.5);
    } else {
      crown = new THREE.Group();
      const gold = new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.6, roughness: 0.25 });
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 16, 1, true), gold);
      band.material.side = THREE.DoubleSide;
      crown.add(band);
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 8), gold);
        spike.position.set(Math.cos(a) * 0.5, 0.35, Math.sin(a) * 0.5);
        crown.add(spike);
      }
    }
    crown.castShadow = true;
    this.crownMesh = crown;
    this.crownBaseY = top + 1.5;
    crown.position.set(x, this.crownBaseY, z);
    this.scene.add(crown);

    this.finish = {
      center: new THREE.Vector3(x, top + 1.5, z),
      half: new THREE.Vector3(5, 2.5, 4.5),
    };
  }

  // ---- per-frame -----------------------------------------------------------

  update(dt, elapsed) {
    for (const o of this.obstacles) o.update(dt, elapsed);
    if (this.crownMesh) {
      this.crownMesh.rotation.y += dt * 1.5;
      this.crownMesh.position.y = this.crownBaseY + Math.sin(elapsed * 2) * 0.15;
    }
  }

  // Surface velocity (conveyor push / platform carry) under the player, if any.
  surfaceVelocity(player) {
    const t = player.body.translation();
    const maxToi = CONFIG.player.halfHeight + CONFIG.player.radius + 0.25;
    const handle = this.physics.groundSurfaceHandle(
      { x: t.x, y: t.y, z: t.z },
      maxToi,
      player.collider,
    );
    if (handle == null) return null;
    const provider = this.surfaceByHandle.get(handle);
    return provider ? provider() : null;
  }

  checkHazard(pos) {
    const pr = CONFIG.player.radius;
    for (const h of this.hazards) {
      if (h.hitTest(pos, pr)) return true;
    }
    return false;
  }

  checkCheckpoint(pos) {
    for (const c of this.checkpoints) {
      if (c.index <= this.currentIndex) continue;
      if (this._inside(pos, c.center, c.half)) {
        this.currentIndex = c.index;
        this.currentCheckpoint = c.respawn.clone();
      }
    }
  }

  checkFinish(pos) {
    return this._inside(pos, this.finish.center, this.finish.half);
  }

  reset() {
    this.currentIndex = -1;
    this.currentCheckpoint = this.startRespawn.clone();
  }

  _inside(p, center, half) {
    return (
      Math.abs(p.x - center.x) <= half.x &&
      Math.abs(p.y - center.y) <= half.y &&
      Math.abs(p.z - center.z) <= half.z
    );
  }
}
