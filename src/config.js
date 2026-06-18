// Central place for gameplay tuning. Tweak freely.
export const CONFIG = {
  // Physics
  gravity: -26,

  // Player movement
  moveSpeed: 8,
  jumpSpeed: 11,
  airControl: 0.7, // 0..1 — how much steering you keep mid-air

  // Player capsule (a "pill"): total height = 2*halfHeight + 2*radius
  player: {
    radius: 0.42,
    halfHeight: 0.42,
    start: { x: 0, y: 2.5, z: 0 },
  },

  // Follow camera
  camera: {
    distance: 10,
    minDistance: 5,
    maxDistance: 20,
    height: 5,
    lookHeight: 1.3,
    startYaw: 0, // camera behind player, looking down the course (+Z)
    yawSensitivity: 0.005,
    followLerp: 8, // higher = snappier
  },

  // World rules
  respawnY: -14, // fall below this -> respawn at last checkpoint
};
