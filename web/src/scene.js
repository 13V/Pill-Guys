import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Studio-style presentation tuned to match the KayKit sample renders:
// a warm soft KEY from upper-front-left, a cooler FILL, a subtle RIM/back light,
// soft contact shadows grounding the elevated strip, a neutral light ground, a
// gentle vertical gradient backdrop, and a PMREM environment for that glossy
// "toy plastic" sheen — all viewed from a 3/4 high-angle camera that reads the
// level left -> right.
export function createScene() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // --- Background: a subtle vertical studio gradient (light top -> slightly
  // cooler/darker toward the floor) so the backdrop has depth instead of a flat
  // fill, matching the seamless-sweep look of the official renders.
  scene.background = makeGradientTexture(
    ['#f4f7fa', '#eef2f6', '#e3e9f0', '#d9e0e8'],
    [0.0, 0.45, 0.78, 1.0]
  );
  // Gentle fog pushes distant ground toward the backdrop value for depth.
  scene.fog = new THREE.Fog(0xe6ecf2, 110, 300);

  // --- Image-based lighting: soft room env gives plastic micro-highlights and
  // fills shadowed faces with believable bounce without washing the scene out.
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.85;

  // --- Camera: 3/4 high angle, looking at the strip broadside near (15,4,0)
  // so the level reads left -> right across the frame.
  const target = new THREE.Vector3(15, 4, 0);
  const camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(36, 24, 31);
  camera.lookAt(target);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = Math.PI * 0.49; // never let the camera dip below ground
  controls.minDistance = 8;
  controls.maxDistance = 160;
  controls.update();

  // --- KEY light: warm, soft, from upper-front-left. Casts the main soft
  // contact shadow that grounds the level. Shadow camera is sized to cover
  // roughly x:[-5,32] z:[-8,8] y:[0,12] of the level with a little margin.
  const key = new THREE.DirectionalLight(0xfff1de, 3.1);
  key.position.set(-10, 20, 17);
  key.target.position.copy(target);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  const s = key.shadow.camera;
  s.left = -24; s.right = 46; s.top = 32; s.bottom = -28;
  s.near = 1; s.far = 130;
  s.updateProjectionMatrix();
  // Soft + artifact-free: a touch of blur radius with PCFSoft, tuned biases so
  // the broad flat platform tops don't shadow-acne or peter-pan off the ground.
  key.shadow.radius = 7;
  key.shadow.blurSamples = 25;
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.035;
  scene.add(key);
  scene.add(key.target);

  // --- FILL light: cooler, from the opposite (front-right) side, no shadow.
  // Lifts the shaded faces and keeps the toy-plastic look from going muddy.
  const fill = new THREE.DirectionalLight(0xdce8ff, 0.85);
  fill.position.set(34, 14, 22);
  fill.target.position.copy(target);
  scene.add(fill);
  scene.add(fill.target);

  // --- RIM / back light: cool kicker from behind-above to separate the silhouette
  // from the backdrop and add a crisp edge highlight on the glossy pieces.
  const rim = new THREE.DirectionalLight(0xeaf2ff, 1.1);
  rim.position.set(8, 20, -26);
  rim.target.position.copy(target);
  scene.add(rim);
  scene.add(rim.target);

  // --- Sky/ground hemisphere + a whisper of ambient round out the bounce so
  // nothing reads pure black; kept low so the directional key still dominates.
  scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x9aa6b4, 0.45));
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));

  // --- Ground: a large soft, light plane that receives the contact shadows.
  // Slightly cooler than the backdrop so the strip's shadow reads clearly.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 800),
    new THREE.MeshStandardMaterial({ color: 0xdfe6ee, roughness: 0.92, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01; // just under y=0 so coplanar pieces don't z-fight
  ground.receiveShadow = true;
  scene.add(ground);

  // --- Faint radial darkening baked under the structure: a soft "ambient
  // occlusion" pool centered on the level so the strip feels planted even where
  // the cast shadow is soft. Drawn just above the ground, additively darkened.
  const aoTex = makeRadialAlpha();
  const aoPool = new THREE.Mesh(
    new THREE.PlaneGeometry(54, 26),
    new THREE.MeshBasicMaterial({
      map: aoTex,
      transparent: true,
      opacity: 0.22,
      color: 0x73808f,
      depthWrite: false,
      blending: THREE.NormalBlending,
    })
  );
  aoPool.rotation.x = -Math.PI / 2;
  aoPool.position.set(12, 0.004, 0.5);
  aoPool.renderOrder = 1;
  scene.add(aoPool);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const render = () => {
    controls.update();
    renderer.render(scene, camera);
  };

  return { scene, camera, renderer, controls, render };
}

// Build a vertical-gradient CanvasTexture for the scene background. Colors run
// top -> bottom; stops are 0..1 positions matching each color.
function makeGradientTexture(colors, stops) {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  for (let i = 0; i < colors.length; i++) g.addColorStop(stops[i], colors[i]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

// Soft radial alpha falloff (opaque center -> transparent edge) used for the
// under-structure occlusion pool.
function makeRadialAlpha() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.85)');
  g.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
