// props/pipes.js — owned by the "pipes" agent. Exposes async build(level).
import * as THREE from 'three';
import { place } from '../assets.js';
import { DECK, TOWER, SEG } from '../layout.js';

// DISCOVERY BUILD — confirm orientations before assembling the arch.
// Geometry discovered from the .bin vertex data (local space, no rotation):
//   pipe_straight_A: bore along Y. openings at y=0 and y=2 (x=0,z=0). 2 tall.
//   pipe_90_A: opening A center (0,0,0) bore faces -Y (down);
//              opening B center (0,2,2) bore faces +Z. bbox y:[0,3] z:[-1,2].
//   pipe_180_A: two down-facing openings (y=0) at z=0 and z=4, arc up to y=3.
//   pipe_end:   2.4x1x2.4, base y=0, opening faces +Y (up).
export async function build(level) {
  const cx = SEG.landmark.cx;
  // Spread test pieces along X so we can read each one against the deck.
  await place(level, ['pipe_straight_A', 'red', cx - 4, 0, DECK.top]);           // vertical reference
  await place(level, ['pipe_90_A',       'red', cx,     0, DECK.top]);           // elbow reference
  await place(level, ['pipe_end',        'green', cx + 4, 0, DECK.top]);         // portal reference
}
