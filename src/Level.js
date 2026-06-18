import * as THREE from 'three';
import { CONFIG } from './config.js';
import { getSize, fitBox, fitUniform, placeBase } from './Assets.js';
import { SpinningBeam, TubeArch, Gate } from './obstacles.js';

const COLORS = {
  platform: 0x2fb6ff,
  finish: 0x32d96a,
  pole: 0xb0bcc9,
};

const PLAYER_LIFT = CONFIG.player.halfHeight + CONFIG.player.radius + 0.3;

// A clean, stacked-tile voxel structure in the KayKit style: a terraced pyramid
// you climb (modular platform tiles at changing elevations, connected by
// slopes), built on a walkable checkered floor. Composition over clutter.
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

    this.startRespawn = new THREE.Vector3(0, PLAYER_LIFT, -3);
    this.currentCheckpoint = this.startRespawn.clone();
  }

  _mat(color) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0 });
  }

  // Big walkable ground collider at y=0 (the checkered studio floor sits here).
  _ground() {
    this.physics.addStaticBox(new THREE.Vector3(0, -0.5, 10), new THREE.Vector3(140, 1, 140));
  }

  // A solid voxel block from y=0 up to `top`, visually built by stacking
  // height-2 (and a height-1 cap if odd) KayKit platform tiles. One collider.
  _voxel({ x, z, w, d, top, color = 'blue' }) {
    this.physics.addStaticBox(new THREE.Vector3(x, top / 2, z), new THREE.Vector3(w, top, d));
    let y = 0;
    while (y < top - 1e-6) {
      const lh = Math.min(2, top - y);
      const name = lh >= 2 ? 'platform_4x4x2' : 'platform_4x4x1';
      const m = this.assets.get(color, name) || this.assets.get('blue', name);
      const center = new THREE.Vector3(x, y + lh / 2, z);
      if (m) {
        fitBox(m, center, { x: w, y: lh, z: d });
        this.scene.add(m);
      } else {
        const box = new THREE.Mesh(new THREE.BoxGeometry(w, lh, d), this._mat(COLORS.platform));
        box.position.copy(center);
        box.castShadow = true;
        box.receiveShadow = true;
        this.scene.add(box);
      }
      y += lh;
    }
  }

  // A slope connecting two elevations (collider + KayKit slope tile).
  _ramp({ x = 0, z, w, fromTop, toTop, length }) {
    const rise = toTop - fromTop;
    const angle = Math.atan2(rise, length);
    const span = Math.hypot(length, rise);
    const center = new THREE.Vector3(x, (fromTop + toTop) / 2 - 0.25, z);
    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-angle, 0, 0));
    this.physics.addStaticBoxRotated(center, new THREE.Vector3(w, 0.5, span), {
      x: quat.x, y: quat.y, z: quat.z, w: quat.w,
    });
    const m = this.assets.get('blue', 'platform_slope_2x4x4');
    if (m) {
      const s = getSize(m);
      m.scale.set(w / s.x, 0.5 / s.y, span / s.z);
      m.position.copy(center);
      m.quaternion.copy(quat);
      m.castShadow = true;
      m.receiveShadow = true;
      this.scene.add(m);
    } else {
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, span), this._mat(0x49c7ff));
      box.position.copy(center);
      box.quaternion.copy(quat);
      this.scene.add(box);
    }
  }

  // A floating collectible platform: a thin pole + a small tile + a spinning star.
  _starPole(x, z, top) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, top, 10),
      this._mat(COLORS.pole),
    );
    pole.position.set(x, top / 2, z);
    pole.castShadow = true;
    this.scene.add(pole);

    const tile = this.assets.get('blue', 'platform_2x2x1');
    if (tile) {
      fitBox(tile, new THREE.Vector3(x, top - 0.5, z), { x: 2, y: 1, z: 2 });
      this.scene.add(tile);
    }
    const star = this.assets.get('yellow', 'star');
    if (star) {
      fitUniform(star, 1.0);
      star.position.set(x, top + 1.1, z);
      star.castShadow = true;
      this.scene.add(star);
      this.obstacles.push({ update: (dt) => { star.rotation.y += dt * 1.6; } });
    }
  }

  // A decorative KayKit prop (no collider).
  _prop(color, name, { x, y, z, uniform, rotY = 0 }) {
    const m = this.assets.get(color, name);
    if (!m) return;
    if (uniform) fitUniform(m, uniform);
    m.rotation.y = rotY;
    placeBase(m, x, y, z);
    this.scene.add(m);
  }

  _checkpoint(x, z, top) {
    const index = this.checkpoints.length;
    this.checkpoints.push({
      index,
      center: new THREE.Vector3(x, top + 1.5, z),
      half: new THREE.Vector3(5, 3, 3),
      respawn: new THREE.Vector3(x, top + PLAYER_LIFT, z),
    });
    this._prop('green', 'flag_C', { x: x + 2.5, y: top, z, uniform: 2.6 });
  }

  // ---- the structure -------------------------------------------------------

  _build() {
    const S = this.scene;
    const P = this.physics;

    this._ground();

    // Start area on the floor + entry gate.
    this._add(new Gate(S, P, this.assets, { x: 0, y: 0, z: -4, width: 8, height: 5 }));

    // Terraced pyramid: solid voxel steps climbing back (+z) and up.
    this._voxel({ x: 0, z: 3, w: 11, d: 7, top: 2 });
    this._voxel({ x: 0, z: 9, w: 9, d: 6, top: 4 });
    this._voxel({ x: 0, z: 14, w: 7, d: 5, top: 6 });
    this._voxel({ x: 0, z: 18, w: 5, d: 4, top: 8, color: 'green' });

    // Slopes connecting each level at the front face.
    this._ramp({ x: 0, z: -0.6, w: 4, fromTop: 0, toTop: 2, length: 3.4 });
    this._ramp({ x: 0, z: 5.6, w: 4, fromTop: 2, toTop: 4, length: 3.2 });
    this._ramp({ x: 0, z: 11, w: 4, fromTop: 4, toTop: 6, length: 3 });
    this._ramp({ x: 0, z: 15.4, w: 4, fromTop: 6, toTop: 8, length: 3 });

    // Pass-through hoop on the first terrace.
    this._prop('red', 'arch_wide', { x: 0, y: 2, z: 3.5, uniform: 5.5 });

    // Green pipes poking up from terraces (KayKit flavour).
    this._prop('green', 'pipe_straight_A', { x: -3, y: 4, z: 9, uniform: 2.2 });
    this._prop('green', 'pipe_straight_A', { x: 3.2, y: 6, z: 14, uniform: 2 });

    // A single spinning hazard on the mid terrace.
    this._add(new SpinningBeam(S, P, this.assets, { x: 0, y: 4, z: 9, length: 4, height: 1, speed: 1.4 }));
    this._checkpoint(0, 9, 4);

    // Floating star-pole platforms flanking the climb (varied heights).
    this._starPole(-7, 5, 3);
    this._starPole(7, 8, 4);
    this._starPole(-7, 12, 5.5);

    // Clean battlement accents along the top terrace edge.
    for (const bx of [-1.5, 0, 1.5]) {
      this._prop('blue', 'barrier_1x1x1', { x: bx, y: 8, z: 19.6, uniform: 1.2 });
    }

    // Flag + crown on the summit; the goal.
    this._prop('red', 'flag_B', { x: -1.6, y: 8, z: 18, uniform: 3 });
    this._buildCrown(0, 18, 8);
  }

  _add(obstacle) {
    this.obstacles.push(obstacle);
    if (obstacle.isHazard) this.hazards.push(obstacle);
    if (obstacle.surfaceHandle != null) {
      this.surfaceByHandle.set(obstacle.surfaceHandle, () => obstacle.surfaceVelocity());
    }
    return obstacle;
  }

  _buildCrown(x, z, top) {
    let crown = this.assets.get('yellow', 'star');
    if (crown) {
      fitUniform(crown, 1.8);
    } else {
      crown = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 0.9, 5),
        new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.6, roughness: 0.25 }),
      );
    }
    crown.castShadow = true;
    this.crownMesh = crown;
    this.crownBaseY = top + 1.6;
    crown.position.set(x, this.crownBaseY, z);
    this.scene.add(crown);
    this.finish = {
      center: new THREE.Vector3(x, top + 1.5, z),
      half: new THREE.Vector3(3, 2.5, 2.5),
    };
  }

  update(dt, elapsed) {
    for (const o of this.obstacles) o.update(dt, elapsed);
    if (this.crownMesh) {
      this.crownMesh.rotation.y += dt * 1.5;
      this.crownMesh.position.y = this.crownBaseY + Math.sin(elapsed * 2) * 0.15;
    }
  }

  surfaceVelocity(player) {
    const t = player.body.translation();
    const maxToi = CONFIG.player.halfHeight + CONFIG.player.radius + 0.25;
    const handle = this.physics.groundSurfaceHandle({ x: t.x, y: t.y, z: t.z }, maxToi, player.collider);
    if (handle == null) return null;
    const provider = this.surfaceByHandle.get(handle);
    return provider ? provider() : null;
  }

  checkHazard(pos) {
    const pr = CONFIG.player.radius;
    for (const h of this.hazards) if (h.hitTest(pos, pr)) return true;
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
