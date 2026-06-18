import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// KayKit Platformer Pack loader.
// Every model is exported per-color as: /Assets/gltf/<color>/<name>_<color>.gltf
// Grid convention (see ../../ASSET_GUIDE.md): 1 cell = 1.0 unit, footprint is
// centered on X/Z, and the mesh base sits at y = 0.

export const COLORS = ['blue', 'green', 'red', 'yellow', 'neutral'];

const loader = new GLTFLoader();
const cache = new Map();

export function modelPath(name, color) {
  // Colored exports carry a suffix (cone_red.gltf); neutral ones do not
  // (pillar_2x2x4.gltf lives in the neutral/ folder with no suffix).
  return color === 'neutral'
    ? `/Assets/gltf/neutral/${name}.gltf`
    : `/Assets/gltf/${color}/${name}_${color}.gltf`;
}

// Load (and cache) a model's source scene, then return a fresh clone so the
// same model can be placed many times. Materials are shared across clones.
export async function loadModel(name, color) {
  const key = `${name}_${color}`;
  if (!cache.has(key)) {
    cache.set(key, loader.loadAsync(modelPath(name, color)).then((gltf) => gltf.scene));
  }
  const src = await cache.get(key);
  const obj = src.clone(true);
  obj.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return obj;
}

// Place one piece. (x, z) is the world position of its footprint center;
// y is the base height (bottom of the piece). ry/rx/rz are rotations in
// degrees (ry = around vertical; rx/rz let us tip pipes/props upright).
export async function place(group, [name, color, x, z, y = 0, ry = 0, rx = 0, rz = 0]) {
  try {
    const obj = await loadModel(name, color);
    obj.position.set(x, y, z);
    obj.rotation.set(
      THREE.MathUtils.degToRad(rx),
      THREE.MathUtils.degToRad(ry),
      THREE.MathUtils.degToRad(rz)
    );
    group.add(obj);
    return obj;
  } catch (err) {
    console.error(`[assets] failed to load ${name}_${color}:`, err.message);
    return null;
  }
}
