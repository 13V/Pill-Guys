import * as THREE from 'three';
import { DECK, TOWER, SEG } from './layout.js';

// COLLIDERS + COINS — the static physics world and sensor regions. Owned by the COLLIDERS agent.
//
// export function buildColliders(physics, scene) -> {
//   spawn: {x,y,z},                       // player start, on the start pad just above DECK.top
//   coins: [{ name:'coin:0', object3D }],  // collectible visuals (added to scene), paired with 'coin:N' sensors
// }
//
// See physics.js for the API:
//   addStaticBox(cx,cy,cz, hx,hy,hz)              -> collider (half-extents)
//   addStaticBoxFromTop(cx,topY,cz, hx,height,hz) -> collider (box whose TOP is at topY)
//   addSensorBox(cx,cy,cz, hx,hy,hz, name)        -> sensor region tagged `name`

// How far a deck top reaches down to the floor below. The strip decks sit at
// top y=5 over a floor near y=0, so a ~5-unit-tall box reaches their legs.
const DECK_HEIGHT = 5;       // strip decks (top at DECK.top=5)
const FINISH_HEIGHT = 10;    // finish deck (top at TOWER.deckTop=10) reaches the ground
const RAIL_H = 0.6;          // half-height of the thin invisible side rails
const RAIL_THICK = 0.15;     // half-thickness of the side rails

// A small, bright, self-lit collectible mesh so pickups read clearly and so
// interactions.js can simply flip object3D.visible = false on collect.
function makeCoinMesh(x, y, z) {
  const geo = new THREE.IcosahedronGeometry(0.32, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffe14d,
    emissive: 0xffc400,
    emissiveIntensity: 0.9,
    metalness: 0.3,
    roughness: 0.35,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

export function buildColliders(physics, scene) {
  // ------------------------------------------------------------------
  // 1) SOLID DECK COLLIDERS — top surface at the walking height.
  // ------------------------------------------------------------------
  // start    6x6  -> hx=3, hz=3   @ top 5
  physics.addStaticBoxFromTop(SEG.start.cx, DECK.top, SEG.start.cz, 3, DECK_HEIGHT, 3);
  // conveyor 8(x) x 4(z) -> hx=4, hz=2  @ top 5
  physics.addStaticBoxFromTop(SEG.conveyor.cx, DECK.top, SEG.conveyor.cz, 4, DECK_HEIGHT, 2);
  // spikes   4x4  -> hx=2, hz=2   @ top 5
  physics.addStaticBoxFromTop(SEG.spikes.cx, DECK.top, SEG.spikes.cz, 2, DECK_HEIGHT, 2);
  // landmark 6x6  -> hx=3, hz=3   @ top 5
  physics.addStaticBoxFromTop(SEG.landmark.cx, DECK.top, SEG.landmark.cz, 3, DECK_HEIGHT, 3);
  // bridge   2x2  -> hx=1, hz=1   @ top 5
  physics.addStaticBoxFromTop(SEG.bridge.cx, DECK.top, SEG.bridge.cz, 1, DECK_HEIGHT, 1);
  // finish   4x4  -> hx=2, hz=2   @ top 10 (the tower deck)
  physics.addStaticBoxFromTop(SEG.finish.cx, TOWER.deckTop, SEG.finish.cz, 2, FINISH_HEIGHT, 2);

  // ------------------------------------------------------------------
  // 2) THIN INVISIBLE SIDE RAILS along the strip edges (z = ±deckHalf) to
  //    reduce accidental sideways falls. These run from the start deck
  //    through the bridge (the flat strip at top y=5). No visuals.
  // ------------------------------------------------------------------
  const railTop = DECK.top + RAIL_H;             // rail centered just above deck top
  const railCy = railTop - RAIL_H;               // == DECK.top, center
  const stripX0 = SEG.start.cx - 3;              // left edge of start deck (x=0)
  const stripX1 = SEG.bridge.cx + 1;             // right edge of bridge deck (x=26)
  const stripCx = (stripX0 + stripX1) / 2;       // 13
  const stripHx = (stripX1 - stripX0) / 2;       // 13
  const deckHalfZ = 3;                           // widest strip decks are 6 wide (hz=3)
  physics.addStaticBox(stripCx, railCy, deckHalfZ + RAIL_THICK, stripHx, RAIL_H, RAIL_THICK);
  physics.addStaticBox(stripCx, railCy, -(deckHalfZ + RAIL_THICK), stripHx, RAIL_H, RAIL_THICK);

  // ------------------------------------------------------------------
  // 3) SENSOR REGIONS — gameplay triggers, ~0.6 above the deck tops.
  // ------------------------------------------------------------------
  // Wide kill floor far below: falling off the world respawns the player.
  physics.addSensorBox(13, -6, 0, 60, 1, 40, 'death');

  // Spike deck: thin death slab just above its surface.
  physics.addSensorBox(SEG.spikes.cx, DECK.top + 0.6, SEG.spikes.cz, 2, 0.5, 2, 'death');

  // Bridge: small spring launch pad.
  physics.addSensorBox(SEG.bridge.cx, DECK.top + 0.6, SEG.bridge.cz, 0.9, 0.5, 0.9, 'spring');

  // Conveyor: band covering the full 8(x) x 4(z) deck just above its surface.
  physics.addSensorBox(SEG.conveyor.cx, DECK.top + 0.4, SEG.conveyor.cz, 4, 0.4, 2, 'conveyor');

  // Finish: trigger over the finish deck at the tower top.
  physics.addSensorBox(SEG.finish.cx, TOWER.deckTop + 0.6, SEG.finish.cz, 2, 0.6, 2, 'finish');

  // ------------------------------------------------------------------
  // 4) COINS — 'coin:N' sensors + matching glowing meshes (coins[N] <-> coin:N).
  //    Spaced along the route at jump-reachable height. Avoid the spike deck.
  // ------------------------------------------------------------------
  const COIN_Y = DECK.top + 1.2;          // 6.2 over the strip decks
  const FINISH_COIN_Y = TOWER.deckTop + 1.2; // 11.2 over the finish deck
  const coinSpots = [
    { x: SEG.start.cx,        y: COIN_Y,        z: 0 },   // 0: on the start pad
    { x: SEG.start.cx + 3.5,  y: COIN_Y,        z: 0 },   // 1: leaving start
    { x: SEG.conveyor.cx,     y: COIN_Y,        z: 0 },   // 2: over the conveyor
    { x: SEG.conveyor.cx + 3, y: COIN_Y,        z: 0 },   // 3: end of conveyor / before spikes
    { x: SEG.landmark.cx,     y: COIN_Y,        z: 0 },   // 4: on the landmark deck
    { x: SEG.bridge.cx,       y: COIN_Y + 0.4,  z: 0 },   // 5: above the spring (a bit higher)
    { x: SEG.finish.cx,       y: FINISH_COIN_Y, z: 0 },   // 6: on the finish deck
    { x: SEG.finish.cx,       y: FINISH_COIN_Y + 1.2, z: 0 }, // 7: floating prize above finish
  ];

  const coins = [];
  coinSpots.forEach((p, i) => {
    physics.addSensorBox(p.x, p.y, p.z, 0.5, 0.5, 0.5, `coin:${i}`);
    const mesh = makeCoinMesh(p.x, p.y, p.z);
    mesh.name = `coin:${i}`;
    scene.add(mesh);
    coins.push({ name: `coin:${i}`, object3D: mesh });
  });

  return {
    spawn: { x: SEG.start.cx, y: DECK.top + 1.2, z: 0 },
    coins,
  };
}
