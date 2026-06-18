import * as THREE from 'three';
import { CONFIG } from './config.js';

// Palette inspired by the KayKit pack: bright blue platforms with accent trims.
const COLORS = {
  platform: 0x2fb6ff,
  platformAlt: 0x4ad1ff,
  start: 0x7b5cff,
  finish: 0x32d96a,
  trim: 0xeef6ff,
  hazard: 0xff5a4d,
  hazardPole: 0xb0bcc9,
};

const PLAYER_LIFT = CONFIG.player.halfHeight + CONFIG.player.radius + 0.3;

// The obstacle course is built from this declarative layout.
// `top` is the Y of the platform's walking surface; platforms are 1 unit thick.
const LAYOUT = {
  platforms: [
    { x: 0, z: 0, w: 9, d: 9, top: 0, color: COLORS.start }, // start pad
    { x: 0, z: 8.5, w: 4.5, d: 4.5, top: 0 },
    { x: 0, z: 15.5, w: 4, d: 4, top: 0 },
    { x: 0, z: 24, w: 12, d: 9, top: 0 }, // hazard arena #1
    { x: 0, z: 33.5, w: 2.6, d: 8, top: 0 }, // narrow beam
    { x: 0, z: 41, w: 5, d: 5, top: 0.8 }, // step up
    { x: 0, z: 47, w: 5, d: 5, top: 1.8 },
    { x: 0, z: 56, w: 13, d: 9, top: 1.8 }, // hazard arena #2
    { x: 0, z: 66, w: 6, d: 6, top: 2.8 },
    { x: 0, z: 74, w: 9, d: 9, top: 3.6, color: COLORS.finish }, // finish podium
  ],
  // Spinning beams: a bar that sweeps a horizontal circle around `pivot`.
  hazards: [
    { x: 0, z: 24, top: 0, length: 5.2, height: 1.4, speed: 1.6, phase: 0 },
    { x: -3, z: 56, top: 1.8, length: 4.6, height: 1.4, speed: -2.0, phase: 0 },
    { x: 3, z: 56, top: 1.8, length: 4.6, height: 1.4, speed: 2.0, phase: Math.PI / 2 },
  ],
  // Checkpoints advance your respawn point as you progress.
  checkpoints: [
    { z: 24, top: 0 },
    { z: 56, top: 1.8 },
  ],
};

export class Level {
  constructor(scene, physics, assets) {
    this.scene = scene;
    this.physics = physics;
    this.assets = assets;

    this.hazards = [];
    this.checkpoints = [];
    this.currentIndex = -1;

    this._buildPlatforms();
    this._buildHazards();
    this._buildCheckpoints();
    this._buildFinish();

    // Start respawn point sits just above the start pad.
    const start = LAYOUT.platforms[0];
    this.startRespawn = new THREE.Vector3(start.x, start.top + PLAYER_LIFT, start.z);
    this.currentCheckpoint = this.startRespawn.clone();
  }

  _addBox(center, size, color, opts = {}) {
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.65,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(center);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (!opts.noCollider) this.physics.addStaticBox(center, size);
    return mesh;
  }

  _buildPlatforms() {
    const thickness = 1;
    LAYOUT.platforms.forEach((p, i) => {
      const cy = p.top - thickness / 2;
      const color = p.color ?? (i % 2 ? COLORS.platformAlt : COLORS.platform);
      this._addBox(
        new THREE.Vector3(p.x, cy, p.z),
        new THREE.Vector3(p.w, thickness, p.d),
        color,
      );
      // Decorative trim around the rim.
      this._addBox(
        new THREE.Vector3(p.x, p.top + 0.06, p.z),
        new THREE.Vector3(p.w + 0.25, 0.12, p.d + 0.25),
        COLORS.trim,
        { noCollider: true },
      );
    });
  }

  _buildHazards() {
    LAYOUT.hazards.forEach((h) => {
      const pivot = new THREE.Vector3(h.x, h.top + h.height, h.z);

      let mesh = this.assets.get('hammer');
      if (mesh) {
        mesh.scale.setScalar(h.length / 2);
      } else {
        // Built-in spinning beam: a bar with chunky caps.
        mesh = new THREE.Group();
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(h.length * 2, 0.4, 0.4),
          new THREE.MeshStandardMaterial({ color: COLORS.hazard, roughness: 0.5 }),
        );
        bar.castShadow = true;
        mesh.add(bar);
        const capGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const capMat = new THREE.MeshStandardMaterial({ color: COLORS.trim });
        for (const s of [-1, 1]) {
          const cap = new THREE.Mesh(capGeo, capMat);
          cap.position.x = s * h.length;
          cap.castShadow = true;
          mesh.add(cap);
        }
      }
      mesh.position.copy(pivot);
      this.scene.add(mesh);

      // A support pole for looks.
      this._addBox(
        new THREE.Vector3(h.x, h.top + h.height / 2, h.z),
        new THREE.Vector3(0.35, h.height, 0.35),
        COLORS.hazardPole,
        { noCollider: true },
      );

      this.hazards.push({
        pivot,
        length: h.length,
        heightBand: 1.1,
        speed: h.speed,
        phase: h.phase,
        mesh,
      });
    });
  }

  _buildCheckpoints() {
    LAYOUT.checkpoints.forEach((c, i) => {
      this.checkpoints.push({
        index: i,
        center: new THREE.Vector3(c.x ?? 0, c.top + 1, c.z),
        half: new THREE.Vector3(5, 3, 4),
        respawn: new THREE.Vector3(c.x ?? 0, c.top + PLAYER_LIFT, c.z),
      });

      // A little flag so the player can see the checkpoint.
      this._addBox(
        new THREE.Vector3((c.x ?? 0) + 3, c.top + 1.4, c.z),
        new THREE.Vector3(0.18, 2.8, 0.18),
        COLORS.trim,
        { noCollider: true },
      );
      this._addBox(
        new THREE.Vector3((c.x ?? 0) + 3.6, c.top + 2.4, c.z),
        new THREE.Vector3(1.2, 0.8, 0.08),
        COLORS.finish,
        { noCollider: true },
      );
    });
  }

  _buildFinish() {
    const podium = LAYOUT.platforms[LAYOUT.platforms.length - 1];
    this.finish = {
      center: new THREE.Vector3(podium.x, podium.top + 1.5, podium.z),
      half: new THREE.Vector3(podium.w / 2, 2.5, podium.d / 2),
    };

    // The crown to grab.
    let crown = this.assets.get('crown');
    if (crown) {
      crown.scale.setScalar(1.5);
    } else {
      crown = new THREE.Group();
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.4, 16, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0xffd23f,
          metalness: 0.6,
          roughness: 0.25,
          side: THREE.DoubleSide,
        }),
      );
      crown.add(band);
      const spikeMat = new THREE.MeshStandardMaterial({
        color: 0xffd23f,
        metalness: 0.6,
        roughness: 0.25,
      });
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 8), spikeMat);
        spike.position.set(Math.cos(a) * 0.5, 0.35, Math.sin(a) * 0.5);
        crown.add(spike);
      }
    }
    crown.castShadow = true;
    this.crownMesh = crown;
    this.crownBaseY = podium.top + 1.4;
    crown.position.set(podium.x, this.crownBaseY, podium.z);
    this.scene.add(crown);
  }

  update(dt, elapsed) {
    for (const h of this.hazards) {
      h.mesh.rotation.y = h.phase + elapsed * h.speed;
    }
    if (this.crownMesh) {
      this.crownMesh.rotation.y += dt * 1.5;
      this.crownMesh.position.y = this.crownBaseY + Math.sin(elapsed * 2) * 0.15;
    }
  }

  // True if the player is being swept by any spinning beam.
  checkHazard(pos) {
    const pr = CONFIG.player.radius + 0.3; // beam half-thickness + body radius
    for (const h of this.hazards) {
      if (Math.abs(pos.y - h.pivot.y) > h.heightBand) continue;

      const angle = h.mesh.rotation.y;
      const ux = Math.sin(angle);
      const uz = Math.cos(angle);
      const rx = pos.x - h.pivot.x;
      const rz = pos.z - h.pivot.z;

      const along = rx * ux + rz * uz; // projection onto beam axis
      if (Math.abs(along) > h.length) continue;

      const perpX = rx - along * ux;
      const perpZ = rz - along * uz;
      if (Math.hypot(perpX, perpZ) <= pr) return true;
    }
    return false;
  }

  // Advances the active checkpoint when the player reaches a new one.
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
