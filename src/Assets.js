import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// import.meta.env is Vite-only; fall back to '/' so this module is importable in Node (tests).
const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/';
const ROOT = `${BASE}models/kaykit/`;

// KayKit Platformer Pack models to preload, as `${color}/${name}`.
// File path resolves to: models/kaykit/{color}/{name}_{color}.gltf
// (KayKit's grid is 1:1 with our world units, and models are base-origin: minY = 0.)
export const PRELOAD = [
  // platforms (blue = normal, green = finish)
  'blue/platform_2x2x1', 'blue/platform_4x4x1', 'blue/platform_6x6x1',
  'blue/platform_6x2x1', 'blue/platform_4x2x1', 'blue/platform_4x4x2',
  'green/platform_6x6x1', 'green/platform_4x4x1',
  'blue/platform_slope_2x4x4', 'blue/platform_slope_4x4x4',
  'blue/platform_arrow_4x4x1', 'blue/platform_arrow_2x2x1',
  // conveyor
  'blue/conveyor_4x8x1', 'blue/conveyor_4x4x1',
  // hazards
  'red/swiper_double', 'red/swiper_long', 'red/ball', 'red/hammer_large',
  'blue/saw_trap', 'red/saw_trap', 'blue/saw_trap_long',
  // arches / gates / decoration
  'blue/arch_wide', 'red/arch_wide', 'blue/hoop',
  'blue/arch_tall', 'green/arch_tall',
  // raised blocks, pipes, rails, signage, nets, accents (dense diorama dressing)
  'blue/platform_4x4x2', 'blue/platform_2x2x2', 'green/platform_4x4x2',
  'red/pipe_180_A', 'red/pipe_straight_A', 'red/pipe_90_A',
  'blue/railing_straight_double', 'blue/railing_corner_double',
  'blue/signage_arrows_right', 'blue/signage_arrow_stand',
  'blue/safetynet_4x2x1',
  'red/barrier_2x1x2', 'yellow/barrier_1x1x1', 'red/cone', 'red/ball',
  // flags / goal
  'green/flag_C', 'green/flag_B', 'green/flag_A', 'red/flag_B', 'yellow/star',
  // extras
  'blue/spring_pad', 'blue/barrier_4x1x4',
  // ---- decoration library (used by decorations.js to dress the deck) ----
  'red/barrier_2x1x1', 'yellow/barrier_2x1x1', 'green/barrier_2x1x2',
  'yellow/barrier_1x1x2', 'red/barrier_2x1x2', 'blue/barrier_2x1x4',
  'blue/bracing_medium', 'blue/bracing_small',
  'blue/railing_corner_double', 'blue/signage_arrows_left', 'blue/signage_arrow_wall',
  'blue/floor_net_2x2x1', 'blue/safetynet_2x2x1', 'blue/safetynet_6x2x1',
  'red/pipe_90_B', 'red/pipe_end', 'blue/pipe_straight_A',
  'yellow/chest', 'yellow/chest_large', 'blue/bomb_A', 'red/heart', 'yellow/diamond',
  'yellow/cone', 'yellow/ball', 'blue/spikeblock_up', 'red/spikeblock_up',
  'yellow/platform_4x4x1', 'green/platform_4x4x1', 'yellow/platform_6x6x1',
];

export class Assets {
  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map(); // "color/name" -> THREE.Object3D template (or null)
  }

  async preload(onProgress) {
    let done = 0;
    await Promise.all(
      PRELOAD.map(async (key) => {
        const [color, name] = key.split('/');
        const url = `${ROOT}${color}/${name}_${color}.gltf`;
        try {
          const gltf = await this.loader.loadAsync(url);
          this.cache.set(key, gltf.scene);
        } catch {
          this.cache.set(key, null); // tolerate missing; callers fall back
        } finally {
          done += 1;
          onProgress?.(done, PRELOAD.length);
        }
      }),
    );
  }

  has(color, name) {
    return Boolean(this.cache.get(`${color}/${name}`));
  }

  // A fresh clone ready to add to the scene, or null if unavailable.
  get(color, name) {
    const tpl = this.cache.get(`${color}/${name}`);
    if (!tpl) return null;
    const obj = tpl.clone(true);
    obj.traverse((m) => {
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return obj;
  }
}

// --- fit / placement helpers ------------------------------------------------

export function getSize(obj) {
  const s = new THREE.Vector3();
  new THREE.Box3().setFromObject(obj).getSize(s);
  return s;
}

// Scale per-axis so the model fills `size` (full w,h,d), then move it so its
// bounding-box center sits at `center`. Best for box-like props (platforms,
// conveyors, ramps). `center`/`size` are THREE.Vector3 (or {x,y,z}).
export function fitBox(obj, center, size) {
  const s = getSize(obj);
  obj.scale.set(size.x / (s.x || 1), size.y / (s.y || 1), size.z / (s.z || 1));
  const c = new THREE.Vector3();
  new THREE.Box3().setFromObject(obj).getCenter(c);
  obj.position.set(center.x - c.x, center.y - c.y, center.z - c.z);
  return obj;
}

// Uniform scale (keeps proportions) so a native dimension equals `target`.
// axis: 'x' | 'y' | 'z' | 'max'.
export function fitUniform(obj, target, axis = 'max') {
  const s = getSize(obj);
  const dim = axis === 'max' ? Math.max(s.x, s.y, s.z) : s[axis];
  obj.scale.setScalar(target / (dim || 1));
  return obj;
}

// After any scaling, position so the model's base (min.y) is at `baseY` and its
// XZ bounding-box center is at (x, z). Good for upright props (gates, flags, star).
export function placeBase(obj, x, baseY, z) {
  const b = new THREE.Box3().setFromObject(obj);
  const c = new THREE.Vector3();
  b.getCenter(c);
  obj.position.x += x - c.x;
  obj.position.z += z - c.z;
  obj.position.y += baseY - b.min.y;
  return obj;
}
