import * as THREE from 'three';
import * as structure from './props/structure.js';
import * as hazards from './props/hazards.js';
import * as pipes from './props/pipes.js';
import * as decor from './props/decor.js';

// Compose the visual level from the polish modules. Shared by the static
// showcase (main.js) and the playable game (game.js).
export async function buildVisualLevel(scene) {
  const level = new THREE.Group();
  scene.add(level);
  await Promise.all([structure, hazards, pipes, decor].map((m) => m.build?.(level)));
  return level;
}
