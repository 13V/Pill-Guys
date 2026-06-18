// props/pipes.js — owned by the "pipes" agent. Exposes async build(level).
//
// Builds the signature RED pipe GATEWAY: a tall squared arch (Π) that spans the
// landmark walkway across Z so the player runs under it, plus a GREEN pipe_end
// warp-portal sitting on the deck surface.
//
// Pipe geometry (discovered from the .bin vertex data, local space, no rot):
//   pipe_straight_A: bore along Y, 2 tall. openings at y=0 and y=2 (x=0,z=0).
//   pipe_90_A elbow: down-opening center (0,0,0) normal -Y;
//                    side-opening center (0,2,2) normal +Z. bbox y:[0,3] z:[-1,2].
//   pipe_end:        2.4x1x2.4, base y=0, mouth opens +Y (up).
//
// Arch math (deck centered at cx, z edges ±3, deck top = DECK.top = 5):
//   risers: two 2-tall straights stacked per side -> 4 tall (y 5..9).
//   left elbow  (ry=0)   origin (cx,9,-3): down→left riser,  side→(cx,11,-1) +Z
//   right elbow (ry=180) origin (cx,9,+3): down→right riser, side→(cx,11,+1) -Z
//   top span    (rx=90)  origin (cx,11,-1): runs +Z, joins (cx,11,-1)→(cx,11,+1)
// => fully connected; bore crosses over at y=11, ~5 units clearance over deck.
import { place } from '../assets.js';
import { DECK, SEG } from '../layout.js';

export async function build(level) {
  const cx = SEG.landmark.cx;     // 21
  const zR = 3, zL = -3;          // deck z edges
  const t = DECK.top;            // 5

  // --- Vertical risers: two stacked 2-tall straights per side (y 5 -> 9) ---
  await place(level, ['pipe_straight_A', 'red', cx, zL, t]);       // left lower  (5->7)
  await place(level, ['pipe_straight_A', 'red', cx, zL, t + 2]);   // left upper  (7->9)
  await place(level, ['pipe_straight_A', 'red', cx, zR, t]);       // right lower (5->7)
  await place(level, ['pipe_straight_A', 'red', cx, zR, t + 2]);   // right upper (7->9)

  // --- Top corner elbows: down-opening meets riser, side-opening points inward ---
  await place(level, ['pipe_90_A', 'red', cx, zL, t + 4, 0]);     // left:  side faces +Z
  await place(level, ['pipe_90_A', 'red', cx, zR, t + 4, 180]);   // right: side faces -Z

  // --- Horizontal top span crossing the walkway at y=11 ---
  await place(level, ['pipe_straight_A', 'red', cx, zL + 2, t + 6, 0, 90]); // origin (cx,11,-1)

  // --- GREEN warp-portal: pipe_end mouth-up, on the deck surface, just off-center ---
  await place(level, ['pipe_end', 'green', cx, 0, t]);
}
