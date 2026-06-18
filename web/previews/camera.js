// Follow-camera preview: builds the real level, then drives a FAKE player that
// pans along +X so we can judge the follow framing (3/4 high angle, pill a touch
// below center, level reading left -> right with headroom).
import * as THREE from 'three';
import { createScene } from '../src/scene.js';
import { buildVisualLevel } from '../src/buildVisual.js';
import { createFollowCamera } from '../src/followCamera.js';

const { scene, camera, renderer } = createScene();

// Build the real level so the camera frames the actual geometry.
await buildVisualLevel(scene);

// FAKE player: walks left -> right along the deck. Pill stands on the deck top
// (deck top y=5), so origin ~5.7 puts the capsule body on the surface. Start `t`
// is overridable via ?t= so we can re-render at a few positions to confirm it
// follows.
let t = Number(new URLSearchParams(location.search).get('t'));
if (!Number.isFinite(t)) t = 3;
const player = { translation: () => ({ x: t, y: 5.7, z: 0 }) };

// Small visible marker mesh at the player position so we can see where the pill
// is in frame. A bright capsule-ish marker that stands out against the level.
const marker = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.45, 0.9, 8, 16),
  new THREE.MeshStandardMaterial({ color: 0xff3b30, roughness: 0.4, metalness: 0.0, emissive: 0x330000 })
);
marker.castShadow = true;
scene.add(marker);
function syncMarker() {
  const p = player.translation();
  marker.position.set(p.x, p.y, p.z);
}
syncMarker();

const followCam = createFollowCamera(camera, player);
followCam.snap(); // frame correctly on the very first frame

let ready = false;
let last = performance.now();
const T_END = 27;
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  // Advance the fake player slowly to the right so the camera pans the level.
  t = Math.min(T_END, t + dt * 1.6);
  syncMarker();
  followCam.update(dt);
  renderer.render(scene, camera);
  if (!ready) { ready = true; window.__ready = true; }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Expose for debugging in the console.
window.__followCam = followCam;
window.__yawDeg = (followCam.yaw() * 180) / Math.PI;
console.log(`[camera] yaw=${followCam.yaw().toFixed(4)} rad (${window.__yawDeg.toFixed(1)} deg)`);
