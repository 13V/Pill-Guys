import * as THREE from 'three';
import { getSize, fitBox, fitUniform, placeBase } from './Assets.js';

// Shared material helper.
const mat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05, ...opts });

const COLORS = {
  hazard: 0xff5a4d,
  trim: 0xeef6ff,
  pole: 0xb0bcc9,
  belt: 0x39424e,
  chevron: 0xffd23f,
  metal: 0x9aa7b4,
  spike: 0x4a5560,
};

// ---------------------------------------------------------------------------
// SpinningBeam — a bar that sweeps a horizontal circle. Hit = respawn.
// Place it low so players must time a run-through, or jump it.
// ---------------------------------------------------------------------------
export class SpinningBeam {
  constructor(scene, physics, assets, opts) {
    const { x, y, z, length, height = 1.2, speed = 1.6, phase = 0 } = opts;
    this.isHazard = true;
    this.pivot = new THREE.Vector3(x, y + height, z);
    this.length = length;
    this.heightBand = 1.0;
    this.speed = speed;
    this.phase = phase;

    this.group = new THREE.Group();
    this.group.position.copy(this.pivot);

    const m = assets.get('red', 'swiper_double');
    if (m) {
      m.scale.set((this.length * 2) / 5.5, 1, 1);
      m.position.y = -0.75;
      this.group.add(m);
    } else {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(length * 2, 0.4, 0.4), mat(COLORS.hazard, { roughness: 0.4 }));
      bar.castShadow = true;
      this.group.add(bar);

      const capGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      const capMat = mat(COLORS.trim);
      for (const s of [-1, 1]) {
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.x = s * length;
        cap.castShadow = true;
        this.group.add(cap);
      }
    }
    scene.add(this.group);

    // Decorative center pole.
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, height, 10), mat(COLORS.pole));
    pole.position.set(x, y + height / 2, z);
    scene.add(pole);
  }

  update(_dt, elapsed) {
    this.group.rotation.y = this.phase + elapsed * this.speed;
  }

  hitTest(pos, pr) {
    if (Math.abs(pos.y - this.pivot.y) > this.heightBand) return false;
    const a = this.group.rotation.y;
    const ux = Math.sin(a);
    const uz = Math.cos(a);
    const rx = pos.x - this.pivot.x;
    const rz = pos.z - this.pivot.z;
    const along = rx * ux + rz * uz;
    if (Math.abs(along) > this.length) return false;
    const perpX = rx - along * ux;
    const perpZ = rz - along * uz;
    return Math.hypot(perpX, perpZ) <= pr + 0.3;
  }
}

// ---------------------------------------------------------------------------
// SpikeRoller — a spiked cylinder spanning the path that rolls back and forth
// along Z. Jump over it as it passes. Hit (while low) = respawn.
// ---------------------------------------------------------------------------
export class SpikeRoller {
  constructor(scene, physics, assets, opts) {
    const { x, y, z, span = 5, radius = 0.6, range = 4, speed = 1.4, phase = 0 } = opts;
    this.isHazard = true;
    this.base = new THREE.Vector3(x, y + radius, z);
    this.span = span;
    this.radius = radius;
    this.range = range;
    this.speed = speed;
    this.phase = phase;
    this.center = this.base.clone();

    this.group = new THREE.Group();
    this.spinner = new THREE.Group();

    const saw = assets.get('blue', 'saw_trap');
    if (saw) {
      this.usingModel = true;
      // Scale the saw across the lane (~ the span) and drop it so its underside
      // rests just above the deck. The spin is about Y, so this Y-shift is on the
      // spin axis and stays put as it rotates.
      fitUniform(saw, this.span);
      const box = new THREE.Box3().setFromObject(saw);
      const deckLocalY = -radius; // deck surface in group-local space (center is radius above deck)
      saw.position.y += deckLocalY - box.min.y + 0.02;
      this.spinner.add(saw);
    } else {
      // Cylinder axis is Y by default; rotate to lie along X (across the path).
      const core = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, span, 16), mat(COLORS.metal, { metalness: 0.3 }));
      core.rotation.z = Math.PI / 2;
      core.castShadow = true;
      this.spinner.add(core);

      // Spikes around the drum.
      const spikeMat = mat(COLORS.spike);
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        for (let k = -1; k <= 1; k += 1) {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 6), spikeMat);
          spike.position.set(k * (span / 3), Math.cos(a) * radius, Math.sin(a) * radius);
          spike.rotation.x = -a + Math.PI / 2;
          spike.castShadow = true;
          this.spinner.add(spike);
        }
      }
    }
    this.group.add(this.spinner);
    this.group.position.copy(this.center);
    scene.add(this.group);
  }

  update(_dt, elapsed) {
    const offset = Math.sin(elapsed * this.speed + this.phase) * this.range;
    this.center.set(this.base.x, this.base.y, this.base.z + offset);
    this.group.position.copy(this.center);
    // Roll visually in the direction of travel.
    if (this.usingModel) {
      this.spinner.rotation.y = (elapsed * this.speed * this.range) / this.radius;
    } else {
      this.spinner.rotation.x = (elapsed * this.speed * this.range) / this.radius;
    }
  }

  hitTest(pos, pr) {
    if (Math.abs(pos.x - this.center.x) > this.span / 2) return false;
    if (Math.abs(pos.z - this.center.z) > this.radius + pr) return false;
    return pos.y <= this.center.y; // jumping above the drum keeps you safe
  }
}

// ---------------------------------------------------------------------------
// Conveyor — a static belt that pushes whatever stands on it. The belt's
// collider handle is registered so the player picks up its surface velocity.
// ---------------------------------------------------------------------------
export class Conveyor {
  constructor(scene, physics, assets, opts) {
    const { x, y, z, w, d, dir = 'z', speed = 4 } = opts;
    const axis = dir === 'x' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
    this.push = axis.multiplyScalar(speed);

    const center = new THREE.Vector3(x, y - 0.5, z);
    const res = physics.addStaticBox(center, new THREE.Vector3(w, 1, d));
    this.surfaceHandle = res.collider.handle;

    // Scrolling belt texture (motion cue). Set when the KayKit model exposes a
    // mapped material; otherwise the model/box stays static.
    this._beltMap = null;

    const model = assets.get('blue', 'conveyor_4x8x1');
    if (model) {
      fitBox(model, { x, y: y - 0.5, z }, { x: w, y: 1, z: d });
      model.traverse((m) => {
        if (this._beltMap || !m.isMesh) return;
        const material = Array.isArray(m.material) ? m.material.find((mm) => mm && mm.map) : m.material;
        if (material && material.map) {
          material.map.wrapS = THREE.RepeatWrapping;
          material.map.wrapT = THREE.RepeatWrapping;
          this._beltMap = material.map;
        }
      });
      scene.add(model);
    } else {
      const belt = new THREE.Mesh(new THREE.BoxGeometry(w, 1, d), mat(COLORS.belt, { roughness: 0.85 }));
      belt.position.copy(center);
      belt.receiveShadow = true;
      scene.add(belt);
    }
  }

  surfaceVelocity() {
    return this.push;
  }

  update(dt) {
    if (this._beltMap) {
      this._beltMap.offset.y += dt * 0.35 * Math.sign(this.push.z || this.push.x || 1);
    }
  }
}

// ---------------------------------------------------------------------------
// MovingPlatform — a kinematic platform oscillating along X or Z. The player
// is carried by adding its surface velocity (computed analytically).
// ---------------------------------------------------------------------------
export class MovingPlatform {
  constructor(scene, physics, assets, opts) {
    const { x, y, z, w, d, axis = 'x', amplitude = 4, speed = 1.2, phase = 0, color = 0x49c7ff } = opts;
    this.base = new THREE.Vector3(x, y, z);
    this.axis = axis === 'x' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
    this.amplitude = amplitude;
    this.speed = speed;
    this.phase = phase;
    this.elapsed = 0;

    const res = physics.addKinematicBox(new THREE.Vector3(x, y - 0.5, z), new THREE.Vector3(w, 1, d));
    this.body = res.body;
    this.surfaceHandle = res.collider.handle;

    this.mesh = new THREE.Group();
    const model = assets.get('blue', 'platform_arrow_4x4x1');
    if (model) {
      fitBox(model, { x: 0, y: 0, z: 0 }, { x: w, y: 1, z: d });
      this.mesh.add(model);
    } else {
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, 1, d), mat(color));
      box.castShadow = true;
      box.receiveShadow = true;
      this.mesh.add(box);

      // Trim so it reads as a moving tile.
      const trim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.12, d + 0.2), mat(COLORS.trim));
      trim.position.set(0, 0.56, 0);
      box.add(trim);
    }
    this.mesh.position.set(x, y - 0.5, z);
    scene.add(this.mesh);
  }

  _offset(t) {
    return Math.sin(this.speed * t + this.phase) * this.amplitude;
  }

  update(_dt, elapsed) {
    this.elapsed = elapsed;
    const o = this._offset(elapsed);
    const px = this.base.x + this.axis.x * o;
    const pz = this.base.z + this.axis.z * o;
    this.body.setNextKinematicTranslation({ x: px, y: this.base.y - 0.5, z: pz });
    this.mesh.position.set(px, this.base.y - 0.5, pz);
  }

  surfaceVelocity() {
    const v = this.amplitude * this.speed * Math.cos(this.speed * this.elapsed + this.phase);
    return new THREE.Vector3(this.axis.x * v, 0, this.axis.z * v);
  }
}

// ---------------------------------------------------------------------------
// Pendulum — a ball on an arm swinging in the Z-Y plane across the path.
// Vertical-arc timing, distinct from the flat spinner sweep. Hit = respawn.
// ---------------------------------------------------------------------------
export class Pendulum {
  constructor(scene, _physics, assets, opts) {
    const { x, y, z, armLength = 3, swing = 0.9, speed = 1.6, phase = 0, ballR = 0.6 } = opts;
    this.isHazard = true;
    this.pivot = new THREE.Vector3(x, y + armLength + 1, z);
    this.armLength = armLength;
    this.swing = swing;
    this.speed = speed;
    this.phase = phase;
    this.ballR = ballR;
    this.ball = new THREE.Vector3();

    this.group = new THREE.Group();
    this.group.position.copy(this.pivot);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, armLength, 0.12), mat(COLORS.pole));
    arm.position.y = -armLength / 2;
    this.group.add(arm);
    const ballModel = assets.get('red', 'ball');
    if (ballModel) {
      fitUniform(ballModel, ballR * 2);
      ballModel.position.set(0, -armLength, 0);
      this.group.add(ballModel);
    } else {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(ballR, 16, 12), mat(COLORS.hazard, { roughness: 0.4 }));
      ball.position.y = -armLength;
      ball.castShadow = true;
      this.group.add(ball);
    }

    // A small mount so the pivot reads as anchored above the track.
    const mount = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), mat(COLORS.metal));
    mount.position.copy(this.pivot);
    scene.add(mount);
    scene.add(this.group);
  }

  update(_dt, elapsed) {
    const a = Math.sin(elapsed * this.speed + this.phase) * this.swing;
    this.group.rotation.x = a;
    this.ball.set(
      this.pivot.x,
      this.pivot.y - Math.cos(a) * this.armLength,
      this.pivot.z + Math.sin(a) * this.armLength,
    );
  }

  hitTest(pos, pr) {
    return this.ball.distanceTo(pos) <= this.ballR + pr;
  }
}

// ---------------------------------------------------------------------------
// Decorative props (no gameplay collision) — for the KayKit course look.
// ---------------------------------------------------------------------------
export class Gear {
  constructor(scene, _physics, assets, opts) {
    const { x, y, z, radius = 1.6, speed = 1, tilt = 0 } = opts;
    this.speed = speed;
    // group: position + `tilt` (aim around world Y). mount: fixed stand-up tilt
    // so the disc is vertical. spinner: the only accumulating rotation, about the
    // geometry's own face-normal, so it spins in-plane without wobble.
    this.group = new THREE.Group();
    const mount = new THREE.Group();
    this.spinner = new THREE.Group();
    mount.add(this.spinner);
    this.group.add(mount);
    const saw = assets.get('blue', 'saw_trap');
    if (saw) {
      fitUniform(saw, radius * 2);
      this.spinner.add(saw);
      // KayKit saw_trap is authored lying flat (face-normal up / +Y). Stand it up
      // so the face points down the lane (±Z); spin stays on its own +Y.
      mount.rotation.x = Math.PI / 2;
      this._spinAxis = 'y';
    } else {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.4, 24), mat(COLORS.metal, { metalness: 0.3 }));
      disc.rotation.x = Math.PI / 2; // vertical disc, face-normal along local +Z
      this.spinner.add(disc);
      const toothMat = mat(COLORS.metal, { metalness: 0.3 });
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2;
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), toothMat);
        tooth.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
        this.spinner.add(tooth);
      }
      this._spinAxis = 'z';
    }
    // `tilt` swings the upright disc to face the lane from either side.
    this.group.position.set(x, y, z);
    this.group.rotation.y = tilt;
    scene.add(this.group);
  }

  update(dt) {
    // Single, steady spin about the disc's own face-normal axis.
    this.spinner.rotation[this._spinAxis] += dt * this.speed;
  }
}

export class TubeArch {
  constructor(scene, _physics, assets, opts) {
    const { x, y, z, radius = 3, color = 0xff5a4d } = opts;
    const arch = assets.get('red', 'arch_wide');
    if (arch) {
      fitUniform(arch, radius * 2, 'x');
      placeBase(arch, x, y, z);
      scene.add(arch);
      this.mesh = arch;
    } else {
      const tube = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.5, 12, 24, Math.PI), mat(color, { roughness: 0.4 }));
      tube.position.set(x, y, z);
      tube.castShadow = true;
      scene.add(tube);
      this.mesh = tube;
    }
  }

  update() {}
}

export class Gate {
  constructor(scene, _physics, assets, opts) {
    const { x, y, z, width = 6, height = 4, checkered = true, color = 0x7b5cff } = opts;
    const arch = assets.get(color === 0x32d96a ? 'green' : 'blue', 'arch_tall');
    if (arch) {
      fitUniform(arch, width, 'x');
      placeBase(arch, x, y, z);
      scene.add(arch);
      return;
    }
    const group = new THREE.Group();
    const postGeo = new THREE.BoxGeometry(0.5, height, 0.5);
    const postMat = mat(color);
    for (const s of [-1, 1]) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set((s * width) / 2, height / 2, 0);
      post.castShadow = true;
      group.add(post);
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(width + 0.5, 0.6, 0.6), postMat);
    bar.position.y = height;
    group.add(bar);

    if (checkered) {
      const n = 8;
      const black = mat(0x1b1140);
      const white = mat(0xffffff);
      for (let i = 0; i < n; i += 1) {
        const cell = new THREE.Mesh(new THREE.BoxGeometry(width / n, 0.4, 0.4), i % 2 ? black : white);
        cell.position.set(-width / 2 + (i + 0.5) * (width / n), height - 0.6, 0);
        group.add(cell);
      }
    }
    group.position.set(x, y, z);
    scene.add(group);
  }

  update() {}
}
