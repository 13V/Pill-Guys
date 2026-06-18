// Lighting preview: a small but representative slice of "Assembly Line 01" so we
// can judge key/fill/rim balance, plastic sheen, soft contact shadows, and the
// studio backdrop against the official KayKit sample renders.
import * as THREE from 'three';
import { createScene } from '../src/scene.js';
import { place } from '../src/assets.js';

const { scene, render } = createScene();

const group = new THREE.Group();
scene.add(group);

// ~10 representative pieces: a blue start deck on grey legs, a second elevated
// blue platform, a yellow star pickup, a red pipe + red flag accent, and a tall
// blue finish deck. Covers blue play surfaces, grey structure, and red/yellow
// accents so material + shadow read can be judged.
async function build() {
  const pieces = [
    ['platform_6x6x1', 'blue',    3,  4, 0,  0],
    ['pillar_2x2x4',   'neutral', 1, -2, 0,  0],
    ['pillar_2x2x4',   'neutral', 5,  2, 0,  0],
    ['platform_4x4x1', 'blue',   10,  4, 0,  0],
    ['pillar_2x2x4',   'neutral', 9, -1.5, 0, 0],
    ['star',           'yellow', 10,  7, 0,  0],
    ['pipe_straight_A','red',    10, -2.5, 5, 90],
    ['flag_C',         'red',    12,  5, 0,  0],
    ['platform_4x4x2', 'blue',   16,  4, 0,  0],
  ];
  for (const p of pieces) {
    await place(group, p);
  }
}

build().then(() => {
  // Render a couple of frames so OrbitControls damping / env map settle.
  render();
  render();
  window.__ready = true;
});

// Keep animating so the still capture is stable.
function loop() {
  render();
  requestAnimationFrame(loop);
}
loop();
