// PARTICLES — bursts for death + coin pickup. Owned by the PARTICLES agent.
//
// export function createParticles(scene, events) -> { update(dt) }
//   On 'death' {position}: a burst of ~16-24 small bits (reds/whites) that fly out,
//     are pulled down by gravity, and fade/shrink out over ~0.6s.
//   On 'coin' {position}: a small bright-yellow sparkle pop (~8 bits, quick).
//   Use THREE.Points (a pooled BufferGeometry) or a small pool of meshes; advance in
//   update(dt) and cull expired particles. Additive/no-shadow, lightweight. Keep a
//   cap on live particles.
export function createParticles(scene, events) {
  return { update() {} };
}
