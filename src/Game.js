import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CONFIG } from './config.js';
import { PhysicsWorld } from './PhysicsWorld.js';
import { Assets } from './Assets.js';
import { Input } from './Input.js';
import { FollowCamera } from './FollowCamera.js';
import { Player } from './Player.js';
import { Level } from './Level.js';
import { Hud } from './Hud.js';

const STATE = { READY: 'ready', PLAYING: 'playing', WON: 'won' };

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.state = STATE.READY;
    this.elapsed = 0;
    this.clock = new THREE.Clock();
    // `?nopost` disables the (software-WebGL-slow) post-processing — used by the
    // headless screenshot tool. Real GPU runs keep the full GTAO + SMAA pipeline.
    this._noPost =
      typeof location !== 'undefined' &&
      new URLSearchParams(location.search).has('nopost');

    this._initRenderer();
    this._initScene();

    this.input = new Input();
    this.followCamera = new FollowCamera(this.camera, canvas);
    this.hud = new Hud();

    window.addEventListener('resize', () => this._onResize());
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Filmic tone mapping + sRGB gives the clean "rendered" KayKit look.
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  _checkerTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f3f6f9';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#dde4ea';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillRect(32, 32, 32, 32);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(140, 140);
    tex.magFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe9eef3);
    this.scene.fog = new THREE.Fog(0xe9eef3, 110, 300);

    // Soft image-based studio lighting — the key to the clean KayKit render look.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      600,
    );

    // Bright sky fill + a soft key light with gentle shadows.
    const hemi = new THREE.HemisphereLight(0xffffff, 0xc9d4dd, 0.5);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.set(40, 70, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 260;
    const s = 80;
    sun.shadow.camera.left = -s;
    sun.shadow.camera.right = s;
    sun.shadow.camera.top = s;
    sun.shadow.camera.bottom = -s;
    sun.shadow.bias = -0.0004;
    sun.shadow.radius = 3;
    this.scene.add(sun);
    this.sun = sun;

    // Clean light "studio" checkerboard floor far below (matches KayKit promos).
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshStandardMaterial({ map: this._checkerTexture(), roughness: 1, metalness: 0 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -8;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this._initComposer();
  }

  _initComposer() {
    if (this._noPost) return; // screenshots skip the heavy pipeline entirely
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Offline-render-quality pipeline: GTAO contact shading + SMAA, with the
    // final OutputPass owning tone mapping + sRGB so we never double-grade.
    this.composer = new EffectComposer(this.renderer);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // Ground-truth ambient occlusion. Kept deliberately gentle: screen-space
    // radius keeps the AO footprint consistent on this large scene, and a low
    // scale + blendIntensity adds soft crevice shading without going black.
    this.gtaoPass = new GTAOPass(this.scene, this.camera, w, h);
    this.gtaoPass.output = GTAOPass.OUTPUT.Default;
    this.gtaoPass.blendIntensity = 0.6;
    this.gtaoPass.updateGtaoMaterial({
      radius: 0.35,
      distanceExponent: 1.0,
      thickness: 1.0,
      scale: 0.7,
      samples: 16,
      distanceFallOff: 1.0,
      screenSpaceRadius: true,
    });
    // A touch of denoise smoothing so the AO reads as soft shading, not noise.
    this.gtaoPass.updatePdMaterial({
      lumaPhi: 10,
      depthPhi: 2,
      normalPhi: 3,
      radius: 4,
      rings: 2,
      samples: 16,
    });
    this.composer.addPass(this.gtaoPass);

    this.smaaPass = new SMAAPass(w, h);
    this.composer.addPass(this.smaaPass);

    // OutputPass applies ACESFilmic tone mapping + sRGB conversion. The renderer
    // keeps its toneMapping set so passes that read it stay consistent, but the
    // intermediate buffers are linear, so there is no double tone-mapping.
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    // Match the renderer's pixel ratio; setPixelRatio re-sizes every pass for us.
    this.composer.setSize(w, h);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
  }

  async init() {
    await PhysicsWorld.init();
    this.physics = new PhysicsWorld();

    this.assets = new Assets();
    this.hud.setLoading('Loading models…');
    await this.assets.preload((done, total) =>
      this.hud.setLoading(`Loading models… ${done}/${total}`),
    );

    this.player = new Player(this.scene, this.physics, this.assets);
    this.level = new Level(this.scene, this.physics, this.assets);

    // Keep the sun's shadow centered on the player.
    this.sun.target = this.player.mesh;
    this.scene.add(this.sun.target);

    this.hud.onPlay(() => this.start());
    this.hud.onRestart(() => this.start());
    this.hud.ready();

    this.renderer.setAnimationLoop(() => this._frame());
  }

  start() {
    this.elapsed = 0;
    this.level.reset();
    this.player.respawn(this.level.currentCheckpoint);
    this.followCamera.update(this.player.position, 1); // snap behind player
    this.hud.startPlaying();
    this.hud.setTimer(0);
    this.state = STATE.PLAYING;
  }

  _render() {
    // Headless screenshots set _noPost to skip the (very slow in software
    // WebGL) post-processing; real GPU runs use the full composer.
    if (this._noPost) this.renderer.render(this.scene, this.camera);
    else this.composer.render();
  }

  _frame() {
    const dt = Math.min(this.clock.getDelta(), 1 / 30);

    // Free-camera mode (debug / scripted screenshots): obstacles keep animating
    // but the camera is positioned manually and gameplay is paused.
    if (this._freeCam) {
      this.level?.update(dt, this.clock.elapsedTime);
      const c = this._freeCam;
      this.camera.position.set(c.px, c.py, c.pz);
      this.camera.lookAt(c.lx, c.ly, c.lz);
      this._render();
      return;
    }

    if (this.state === STATE.PLAYING) {
      // Animate/queue moving obstacles first, then read what's underfoot.
      this.level.update(dt, this.elapsed);
      const surfaceVel = this.level.surfaceVelocity(this.player);
      this.player.preStep(dt, this.input, this.followCamera, surfaceVel);
      this.physics.step();
      this.player.postStep(dt);

      const pos = this.player.position;
      if (this.level.checkHazard(pos) || pos.y < CONFIG.respawnY) {
        this.player.respawn(this.level.currentCheckpoint);
      }
      this.level.checkCheckpoint(pos);

      if (this.level.checkFinish(pos)) {
        this.state = STATE.WON;
        this.hud.showWin(this.elapsed);
      }

      this.elapsed += dt;
      this.hud.setTimer(this.elapsed);
      this.followCamera.update(pos, dt);
    } else {
      // Idle camera still tracks the player for a lively menu backdrop.
      this.level?.update(dt, this.clock.elapsedTime);
      if (this.player) this.followCamera.update(this.player.position, dt);
    }

    this._render();
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    // EffectComposer.setSize already propagates the (pixel-ratio-scaled) size to
    // every pass, including GTAO and SMAA, so no per-pass resize is needed here.
    this.composer?.setSize(w, h);
  }
}
