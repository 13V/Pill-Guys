import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Studio-style presentation tuned to match the KayKit sample renders:
// soft key light from upper-front-left, soft contact shadows, neutral light
// ground, gentle PBR environment for that glossy "toy plastic" sheen, and a
// 3/4 high-angle camera looking at the level broadside.
export function createScene() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe9edf2);

  // Soft image-based lighting for nice plastic highlights.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const target = new THREE.Vector3(15, 4, 0);
  const camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(35, 23, 30);
  camera.lookAt(target);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.update();

  // Key light, upper-front-left.
  const key = new THREE.DirectionalLight(0xfff4e6, 2.4);
  key.position.set(-14, 24, 16);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const s = key.shadow.camera;
  s.left = -42; s.right = 42; s.top = 34; s.bottom = -22; s.near = 1; s.far = 110;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  // Cool sky / warm bounce fill.
  scene.add(new THREE.HemisphereLight(0xdfefff, 0x96a3b2, 0.55));
  scene.add(new THREE.AmbientLight(0xffffff, 0.22));

  // Ground plane to catch shadows.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshStandardMaterial({ color: 0xdde4ec, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

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
