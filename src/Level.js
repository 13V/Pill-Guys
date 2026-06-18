import * as THREE from 'three';
import { CONFIG } from './config.js';
import { getSize, fitBox, fitUniform, placeBase } from './Assets.js';
import {
  SpinningBeam,
  SpikeRoller,
  Conveyor,
  Pendulum,
  Gear,
  TubeArch,
  Gate,
} from './obstacles.js';
import { scatter } from './decorations.js';

const COLORS = {
  platform: 0x2fb6ff,
  platformAlt: 0x49c7ff,
  finish: 0x32d96a,
  trim: 0xeef6ff,
  pillar: 0x6b7785,
};

const PLAYER_LIFT = CONFIG.player.halfHeight + CONFIG.player.radius + 0.3;
const SLIME_Y = -8;

// Deck bounds: a solid tiled "table" the whole diorama sits on.
const DECK = { x0: -6, x1: 6, z0: 0, z1: 48, top: 0 };

// A dense KayKit-promo-style station: a tiled deck on legs, packed edge to edge
// with platforms, ramps, pipes, blocks, rails, hazards and scattered props.
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

    this.startRespawn = new THREE.Vector3(0, DECK.top + PLAYER_LIFT, 4);
    this.currentCheckpoint = this.startRespawn.clone();
  }

  _mat(color) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.0 });
  }

  // A KayKit model placed as pure decoration (no collider).
  _prop(color, name, { x, y = DECK.top, z, uniform, size, rotY = 0, fallback }) {
    const m = this.assets.get(color, name);
    if (!m) {
      if (fallback) this.scene.add(fallback());
      return null;
    }
    if (size) fitBox(m, { x: 0, y: 0, z: 0 }, size);
    else if (uniform) fitUniform(m, uniform);
    m.rotation.y = rotY;
    placeBase(m, x, y, z);
    this.scene.add(m);
    return m;
  }

  // A raised, walkable block (collider + KayKit platform model on top).
  _block({ x, z, w, h, d, top, color = 'blue' }) {
    const cy = top - h / 2;
    const center = new THREE.Vector3(x, cy, z);
    this.physics.addStaticBox(center, new THREE.Vector3(w, h, d));
    const model = h >= 1.5 ? 'platform_4x4x2' : 'platform_4x4x1';
    const m = this.assets.get(color, model);
    if (m) {
      fitBox(m, center, { x: w, y: h, z: d });
      this.scene.add(m);
    } else {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this._mat(COLORS.platformAlt));
      mesh.position.copy(center);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    }
  }

  _leg(x, z) {
    const height = DECK.top - 1 - SLIME_Y;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(1.4, height, 1.4), this._mat(COLORS.pillar));
    leg.position.set(x, SLIME_Y + height / 2, z);
    leg.castShadow = true;
    leg.receiveShadow = true;
    this.scene.add(leg);
  }

  _ramp({ x = 0, z, w, fromTop, toTop, length }) {
    const rise = toTop - fromTop;
    const angle = Math.atan2(rise, length);
    const span = Math.hypot(length, rise);
    const center = new THREE.Vector3(x, (fromTop + toTop) / 2 - 0.25, z);
    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-angle, 0, 0));
    this.physics.addStaticBoxRotated(center, new THREE.Vector3(w, 0.5, span), {
      x: quat.x, y: quat.y, z: quat.z, w: quat.w,
    });
    const m = this.assets.get('blue', 'platform_slope_2x4x4') || this.assets.get('blue', 'platform_4x2x1');
    if (m) {
      const s = getSize(m);
      m.scale.set(w / s.x, 0.5 / s.y, span / s.z);
      m.position.copy(center);
      m.quaternion.copy(quat);
      m.castShadow = true;
      m.receiveShadow = true;
      this.scene.add(m);
    } else {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, span), this._mat(COLORS.platformAlt));
      mesh.position.copy(center);
      mesh.quaternion.copy(quat);
      this.scene.add(mesh);
    }
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
      half: new THREE.Vector3(6, 3.5, 3),
      respawn: new THREE.Vector3(x, top + PLAYER_LIFT, z),
    });
    this._prop('green', 'flag_C', { x, y: top, z, uniform: 3 });
  }

  // ---- the diorama ---------------------------------------------------------

  _build() {
    const P = this.physics;
    const S = this.scene;

    // Solid deck collider (one box) + tiled top.
    const dw = DECK.x1 - DECK.x0;
    const dd = DECK.z1 - DECK.z0;
    const dcx = (DECK.x0 + DECK.x1) / 2;
    const dcz = (DECK.z0 + DECK.z1) / 2;
    P.addStaticBox(new THREE.Vector3(dcx, DECK.top - 0.5, dcz), new THREE.Vector3(dw, 1, dd));
    for (let tz = DECK.z0 + 3; tz < DECK.z1; tz += 6) {
      for (const tx of [DECK.x0 + 3, DECK.x1 - 3]) {
        const tile = this.assets.get('blue', 'platform_6x6x1');
        if (tile) {
          fitBox(tile, { x: tx, y: DECK.top - 0.5, z: tz }, { x: 6, y: 1, z: 6 });
          S.add(tile);
        } else {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(6, 1, 6), this._mat(COLORS.platform));
          mesh.position.set(tx, DECK.top - 0.5, tz);
          mesh.receiveShadow = true;
          S.add(mesh);
        }
      }
    }

    // Legs under the deck.
    for (const lz of [5, 24, 43]) {
      this._leg(DECK.x0 + 1.5, lz);
      this._leg(DECK.x1 - 1.5, lz);
    }

    // Edge railings down both sides (framed-station look).
    for (let rz = DECK.z0 + 2; rz < DECK.z1; rz += 2) {
      this._prop('blue', 'railing_straight_double', { x: DECK.x0 + 0.5, y: DECK.top, z: rz, rotY: 0 });
      this._prop('blue', 'railing_straight_double', { x: DECK.x1 - 0.5, y: DECK.top, z: rz, rotY: Math.PI });
    }

    // Start gate + signage.
    this._add(new Gate(S, P, this.assets, { x: 0, y: DECK.top, z: 1, width: 9, height: 5 }));
    this._prop('blue', 'signage_arrow_stand', { x: -3.5, y: DECK.top, z: 4, uniform: 2 });

    // --- Section 1: warm-up blocks + first sweeper ---
    this._block({ x: -3.5, z: 8, w: 2, h: 1, d: 2 });
    this._block({ x: 3.5, z: 10, w: 2, h: 1, d: 2 });
    this._prop('yellow', 'barrier_1x1x1', { x: -3.5, y: DECK.top + 1, z: 8, uniform: 1.6 });
    this._prop('yellow', 'barrier_1x1x1', { x: 3.5, y: DECK.top + 1, z: 10, uniform: 1.6 });
    this._add(new SpinningBeam(S, P, this.assets, { x: 0, y: DECK.top, z: 13, length: 5, height: 0.9, speed: 1.4 }));

    // --- Section 2: conveyor strip + raised cover blocks ---
    this._add(new Conveyor(S, P, this.assets, { x: 0, y: DECK.top + 0.06, z: 18, w: 6, d: 6, dir: 'z', speed: -3.5 }));
    this._block({ x: -4.5, z: 18, w: 2, h: 2, d: 4, color: 'blue' });
    this._block({ x: 4.5, z: 18, w: 2, h: 2, d: 4, color: 'blue' });
    this._checkpoint(0, 16, DECK.top);

    // --- Section 3: big red pipe arch + swinging hammers ---
    this._prop('red', 'pipe_180_A', { x: 0, y: DECK.top, z: 24, uniform: 6, rotY: Math.PI / 2 });
    this._add(new Pendulum(S, P, this.assets, { x: -2, y: DECK.top, z: 23, armLength: 3, swing: 0.8, speed: 1.7 }));
    this._add(new Pendulum(S, P, this.assets, { x: 2, y: DECK.top, z: 26, armLength: 3, swing: 0.8, speed: 1.7, phase: Math.PI }));
    this._prop('red', 'ball', { x: -5, y: DECK.top, z: 22, uniform: 1.4 });

    // --- Section 4: spinning saws + gears + rails ---
    this._add(new SpikeRoller(S, P, this.assets, { x: 0, y: DECK.top, z: 30, span: 6, radius: 0.7, range: 3, speed: 1.4 }));
    this._add(new Gear(S, P, this.assets, { x: -4.5, y: DECK.top + 1, z: 30, radius: 1.4, speed: 1.2 }));
    this._add(new Gear(S, P, this.assets, { x: 4.5, y: DECK.top + 1, z: 30, radius: 1.4, speed: -1.2 }));
    this._checkpoint(0, 33, DECK.top);

    // --- Section 5: ramp up to a raised platform, swiper on top, slope down ---
    this._ramp({ x: 0, z: 36, w: 6, fromTop: DECK.top, toTop: DECK.top + 2, length: 3.5 });
    this._block({ x: 0, z: 39.5, w: 8, h: 2, d: 4, color: 'blue' });
    this._add(new SpinningBeam(S, P, this.assets, { x: 0, y: DECK.top + 2, z: 39.5, length: 4.5, height: 1.0, speed: -1.6 }));
    this._ramp({ x: 0, z: 43, w: 6, fromTop: DECK.top + 2, toTop: DECK.top, length: 3.5 });
    this._prop('blue', 'signage_arrows_right', { x: 4, y: DECK.top + 2, z: 39.5, uniform: 3 });

    // --- Finish: green podium block, archway, star + flag ---
    this._block({ x: 0, z: 46.5, w: 8, h: 1, d: 4, top: DECK.top + 0.5, color: 'green' });
    this._add(new Gate(S, P, this.assets, { x: 0, y: DECK.top + 0.5, z: 48, width: 9, height: 5, color: COLORS.finish }));
    this._buildCrown(0, 46.5, DECK.top + 0.5);

    // Floating collectible stars over the path (visual flair).
    for (const [sx, sz] of [[-2, 20], [2, 28], [0, 37]]) {
      const star = this.assets.get('yellow', 'star');
      if (star) {
        fitUniform(star, 1.2);
        star.position.set(sx, DECK.top + 3, sz);
        this.scene.add(star);
        this.obstacles.push({ update: (dt) => { star.rotation.y += dt * 1.5; } });
      }
    }

    // Dense decorative dressing along the deck edges (packed-promo look).
    scatter(S, this.assets, DECK);
  }

  _buildCrown(x, z, top) {
    let crown = this.assets.get('yellow', 'star');
    if (crown) {
      fitUniform(crown, 1.8);
    } else {
      crown = new THREE.Group();
      const gold = new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.6, roughness: 0.25 });
      crown.add(new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 5), gold));
    }
    crown.castShadow = true;
    this.crownMesh = crown;
    this.crownBaseY = top + 1.6;
    crown.position.set(x, this.crownBaseY, z);
    this.scene.add(crown);
    this.finish = {
      center: new THREE.Vector3(x, top + 1.5, z),
      half: new THREE.Vector3(4.5, 2.5, 2.5),
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
