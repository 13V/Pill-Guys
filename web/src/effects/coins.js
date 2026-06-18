// COIN JUICE — idle bob/spin + collect "pop". Owned by the COIN-JUICE agent.
//
// export function createCoinJuice(world, events) -> { update(dt) }
//   world.coins: [{ name, object3D }] — glowing collectibles placed by colliders.js.
//   IDLE: each still-visible, un-collected coin gently bobs (sine, ~±0.12 around its
//     original Y) and slowly spins around Y. Capture each coin's base position once.
//   COLLECT: on 'coin' {index, object3D}, play a quick pop on that coin — scale up
//     (~1.6x) while fading/raising over ~0.18s, THEN set object3D.visible = false.
//     (interactions.js no longer hides coins; this effect owns hiding them.)
//   update(dt) drives the bob for idle coins and advances any in-progress pops.
export function createCoinJuice(world, events) {
  return { update() {} };
}
