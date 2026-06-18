import * as THREE from 'three';
import { DECK, TOWER, SEG } from './layout.js';

// COLLIDERS + COINS — the static physics world and sensor regions. Owned by the COLLIDERS agent.
//
// export function buildColliders(physics, scene) -> {
//   spawn: {x,y,z},                       // player start, on the start pad just above DECK.top
//   coins: [{ name:'coin:0', object3D }],  // collectible visuals (added to scene), paired with 'coin:N' sensors
// }
//
// Use physics.addStaticBoxFromTop(cx, topY, cz, hx, height, hz) for every walkable deck so its TOP is at the
// walking surface (DECK.top = 5; finish deck top = TOWER.deckTop = 10). hx/hz are HALF the deck size.
//   start    : SEG.start    6x6  -> hx=3, hz=3
//   conveyor : SEG.conveyor 8(x) x 4(z) -> hx=4, hz=2
//   spikes   : SEG.spikes   4x4  -> hx=2, hz=2
//   landmark : SEG.landmark 6x6  -> hx=3, hz=3
//   bridge   : SEG.bridge   2x2  -> hx=1, hz=1
//   finish   : SEG.finish   4x4 at topY=TOWER.deckTop -> hx=2, hz=2
// Add thin invisible side walls along the strip edges (z = ±deckHalf) if you want to stop the player falling off
// sideways — optional but improves feel.
//
// Sensor regions via physics.addSensorBox(cx, cy, cz, hx, hy, hz, name), centered ~0.6 above the deck top:
//   'death'    : over the spike deck (SEG.spikes), thin slab at deck top
//   'spring'   : small box on the bridge (SEG.bridge)
//   'conveyor' : a band covering the conveyor deck (SEG.conveyor) just above its surface
//   'finish'   : over the finish deck (SEG.finish) at TOWER.deckTop
//   'coin:N'   : ~5-8 along the route; ALSO add a small glowing collectible mesh (a torus/sphere or load a
//                'diamond'/'star' via place()) at each so interactions can hide it on pickup.
// Also add a 'death' floor sensor well below the level (e.g. y=-6, very wide) so falling off respawns the player.
//
// Return spawn = { x: SEG.start.cx, y: DECK.top + 1.2, z: 0 } and the coins array.
export function buildColliders(physics, scene) {
  return {
    spawn: { x: SEG.start.cx, y: DECK.top + 1.2, z: 0 },
    coins: [],
  };
}
