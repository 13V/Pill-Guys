import * as THREE from 'three';
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
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8fd6ff);
    this.scene.fog = new THREE.Fog(0x8fd6ff, 60, 160);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500,
    );

    // Lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x6688aa, 0.9);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff4e0, 1.7);
    sun.position.set(30, 60, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 200;
    const s = 70;
    sun.shadow.camera.left = -s;
    sun.shadow.camera.right = s;
    sun.shadow.camera.top = s;
    sun.shadow.camera.bottom = -s;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);
    this.sun = sun;

    // "Slime" plane far below to make falls look intentional.
    const slime = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial({
        color: 0xff5fa2,
        transparent: true,
        opacity: 0.55,
        roughness: 0.3,
      }),
    );
    slime.rotation.x = -Math.PI / 2;
    slime.position.y = -8;
    slime.receiveShadow = true;
    this.scene.add(slime);
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

  _frame() {
    const dt = Math.min(this.clock.getDelta(), 1 / 30);

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

    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
