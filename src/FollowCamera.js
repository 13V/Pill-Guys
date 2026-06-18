import * as THREE from 'three';
import { CONFIG } from './config.js';

// A smoothed third-person follow camera.
// - Drag the mouse (or one finger) to orbit horizontally (yaw).
// - Scroll / pinch to zoom.
// Movement in Player is interpreted relative to this yaw.
export class FollowCamera {
  constructor(camera, domElement) {
    this.camera = camera;
    this.dom = domElement;

    this.yaw = CONFIG.camera.startYaw;
    this.distance = CONFIG.camera.distance;
    this.target = new THREE.Vector3();
    this._currentPos = new THREE.Vector3();
    this._initialized = false;

    this._dragging = false;
    this._lastX = 0;
    this._lastTouchDist = 0;

    this._bind();
  }

  _bind() {
    const dom = this.dom;

    dom.addEventListener('mousedown', (e) => {
      this._dragging = true;
      this._lastX = e.clientX;
    });
    window.addEventListener('mouseup', () => (this._dragging = false));
    window.addEventListener('mousemove', (e) => {
      if (!this._dragging) return;
      const dx = e.clientX - this._lastX;
      this._lastX = e.clientX;
      this.yaw -= dx * CONFIG.camera.yawSensitivity;
    });

    dom.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this._zoom(e.deltaY * 0.01);
      },
      { passive: false },
    );

    // Touch: one finger orbits, two fingers pinch-zoom.
    dom.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 1) {
          this._dragging = true;
          this._lastX = e.touches[0].clientX;
        } else if (e.touches.length === 2) {
          this._lastTouchDist = this._touchDist(e);
        }
      },
      { passive: true },
    );
    dom.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length === 1 && this._dragging) {
          const x = e.touches[0].clientX;
          this.yaw -= (x - this._lastX) * CONFIG.camera.yawSensitivity;
          this._lastX = x;
        } else if (e.touches.length === 2) {
          const d = this._touchDist(e);
          this._zoom((this._lastTouchDist - d) * 0.02);
          this._lastTouchDist = d;
        }
      },
      { passive: true },
    );
    window.addEventListener('touchend', () => (this._dragging = false));
  }

  _touchDist(e) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  _zoom(amount) {
    this.distance = THREE.MathUtils.clamp(
      this.distance + amount,
      CONFIG.camera.minDistance,
      CONFIG.camera.maxDistance,
    );
  }

  // Direction (on the XZ plane) the player moves when pressing "forward".
  getForward() {
    return new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
  }

  // Screen-right direction on the XZ plane.
  getRight() {
    return new THREE.Vector3(-Math.cos(this.yaw), 0, Math.sin(this.yaw));
  }

  update(targetPos, dt) {
    this.target.copy(targetPos);

    const forward = this.getForward();
    const desired = new THREE.Vector3(
      this.target.x - forward.x * this.distance,
      this.target.y + CONFIG.camera.height,
      this.target.z - forward.z * this.distance,
    );

    if (!this._initialized) {
      this._currentPos.copy(desired);
      this._initialized = true;
    } else {
      // Frame-rate independent smoothing.
      const t = 1 - Math.exp(-CONFIG.camera.followLerp * dt);
      this._currentPos.lerp(desired, t);
    }

    this.camera.position.copy(this._currentPos);
    this.camera.lookAt(
      this.target.x,
      this.target.y + CONFIG.camera.lookHeight,
      this.target.z,
    );
  }
}
