import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const BASE = import.meta.env.BASE_URL;

// Logical model name -> file path under `public/models/`.
// Drop the matching KayKit Platformer Pack files (.gltf/.glb) into that folder
// and they will be used automatically. If a file is missing, the game falls
// back to a built-in primitive placeholder, so it always runs.
//
// KayKit ships many files — rename (or copy) the ones you want to these names,
// or edit the paths here to match the pack's filenames.
export const MODEL_MANIFEST = {
  character: 'models/character.gltf',
  hammer: 'models/hammer.gltf',
  crown: 'models/crown.gltf',
};

export class Assets {
  constructor() {
    this.loader = new GLTFLoader();
    this.models = {}; // name -> THREE.Object3D template, or null if unavailable
  }

  // Attempts to load every entry in the manifest. Missing files are tolerated.
  async preload(onProgress) {
    const names = Object.keys(MODEL_MANIFEST);
    let done = 0;

    await Promise.all(
      names.map(async (name) => {
        const url = BASE + MODEL_MANIFEST[name];
        try {
          const gltf = await this.loader.loadAsync(url);
          this.models[name] = gltf.scene;
        } catch {
          // No file yet — that's fine, we'll use a placeholder.
          this.models[name] = null;
        } finally {
          done += 1;
          onProgress?.(done, names.length);
        }
      }),
    );

    return this.models;
  }

  has(name) {
    return Boolean(this.models[name]);
  }

  // Returns a fresh clone ready to drop into the scene, or null if unavailable.
  get(name) {
    const template = this.models[name];
    if (!template) return null;

    const clone = template.clone(true);
    clone.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return clone;
  }
}
