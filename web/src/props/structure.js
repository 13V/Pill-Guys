// props/structure.js — owned by the "structure" agent. Exposes async build(level).
//
// Builds the elevated walkway backbone of the level: blue decks carried on
// evenly-spaced grey pillar legs, cross-braced underneath with grey struts, and
// trimmed with blue railings on every edge that isn't an entry/exit. Matches the
// KayKit sample look: a long clean strip on grey supports, broadside to camera.
import * as THREE from 'three';
import { place } from '../assets.js';
import { DECK, TOWER, SEG } from '../layout.js';

// --- piece metrics (verified from the glTF POSITION bounds) ---
// pillar_2x2x4 : 1.6 x 4 x 1.6, base 0 -> top 4 (== DECK.y)
// pillar_2x2x8 : 1.6 x 8 x 1.6, base 0 -> top 8 (== TOWER.deckY)
// strut_horizontal : 2 x 0.5 x 0.5 (a beam that runs along local X)
// railing_straight_single : 2(X) x 1.2 x 0.4, bar sits at local z=-0.8 (faces -Z at ry=0)
// railing_straight_padded : 2(X) x 1.2 x 0.6, bar at local z=-0.9
// railing_corner_*  : 2x2 L-piece, bars on the local -X and -Z faces

const LEG = 'pillar_2x2x4';   // grey leg from ground (0) up to the deck base (4)
const TALL_LEG = 'pillar_2x2x8'; // grey leg up to the tower deck (8)

// Place four grey legs under a deck, inset `inset` from the deck centre on each
// axis so the 1.6-wide footprints tuck under the corners.
async function legs(level, cx, cz, inset, name = LEG) {
  const dx = inset, dz = inset;
  await Promise.all([
    place(level, [name, 'neutral', cx - dx, cz - dz, 0]),
    place(level, [name, 'neutral', cx + dx, cz - dz, 0]),
    place(level, [name, 'neutral', cx - dx, cz + dz, 0]),
    place(level, [name, 'neutral', cx + dx, cz + dz, 0]),
  ]);
}

// Grey cross-beams just under the deck base, tying the leg tops together so the
// underside reads as a trussed support instead of floating posts. Beams run
// along X (one per Z side) plus along Z at each end (rotated 90).
async function underBracing(level, cx, cz, halfX, halfZ, y = DECK.y) {
  const by = y - 0.55;            // sit the 0.5-tall beam right beneath the deck
  const ix = halfX - 0.2;         // pull beam ends in toward the legs
  const iz = halfZ - 0.2;
  const jobs = [];
  // beams running along X, one at each Z side
  const spanX = ix * 2;           // length needed; strut is 2 long -> tile it
  const nX = Math.max(1, Math.round(spanX / 2));
  for (let zside of [-iz, iz]) {
    for (let i = 0; i < nX; i++) {
      const x = cx - ix + (i + 0.5) * (spanX / nX);
      jobs.push(place(level, ['strut_horizontal', 'neutral', x, cz + zside, by]));
    }
  }
  // beams running along Z at each X end (rotated 90)
  const spanZ = iz * 2;
  const nZ = Math.max(1, Math.round(spanZ / 2));
  for (let xside of [-ix, ix]) {
    for (let i = 0; i < nZ; i++) {
      const z = cz - iz + (i + 0.5) * (spanZ / nZ);
      jobs.push(place(level, ['strut_horizontal', 'neutral', cx + xside, z, by, 90]));
    }
  }
  await Promise.all(jobs);
}

// Rail a straight edge with `count` 2-unit railing segments, centred on the edge.
//  - edge 'z': a Z-facing edge (the bar runs along X). side = +1 for +Z edge
//    (ry 180 so the bar faces outward), -1 for the -Z edge (ry 0).
//  - edge 'x': an X-facing edge (the bar runs along Z). side = +1 for +X edge
//    (ry 270), -1 for the -X edge (ry 90).
async function railEdge(level, kind, cx, cz, edge, side, length, y = DECK.top) {
  const seg = kind === 'padded' ? 'railing_straight_padded' : 'railing_straight_single';
  const n = Math.max(1, Math.round(length / 2));
  const start = -length / 2 + 1;        // centre of first 2-unit segment
  const jobs = [];
  for (let i = 0; i < n; i++) {
    const t = start + i * 2;            // offset along the edge
    if (edge === 'z') {
      const ry = side > 0 ? 180 : 0;    // bar at local -Z; flip for +Z edge
      jobs.push(place(level, [seg, 'blue', cx + t, cz, y, ry]));
    } else {
      const ry = side > 0 ? 270 : 90;
      jobs.push(place(level, [seg, 'blue', cx, cz + t, y, ry]));
    }
  }
  await Promise.all(jobs);
}

export async function build(level) {
  // ---------------------------------------------------------------- start pad
  // platform_6x6x1 blue spawn deck on 4 grey legs, railed on the two long edges
  // (z = +/-3) and the back/start edge (x = cx-3). Front edge is the exit.
  {
    const { cx, cz, w, d } = SEG.start;
    await place(level, ['platform_6x6x1', 'blue', cx, cz, DECK.y]);
    await legs(level, cx, cz, 2);                 // corners at cx+/-2, cz+/-2
    await underBracing(level, cx, cz, w / 2, d / 2);
    await railEdge(level, 'single', cx, cz + d / 2, 'z', +1, w);   // +Z long edge
    await railEdge(level, 'single', cx, cz - d / 2, 'z', -1, w);   // -Z long edge
    await railEdge(level, 'single', cx - w / 2, cz, 'x', -1, d);   // back (start) edge
  }

  // ------------------------------------------------------------- conveyor deck
  // conveyor_4x8x1 (8 long) rotated ry=90 so the belt runs along X; 4 legs.
  // No rails — the belt is an open run between two railed decks.
  {
    const { cx, cz, len, w } = SEG.conveyor;       // len=8 (X after rotate), w=4 (Z)
    await place(level, ['conveyor_4x8x1', 'blue', cx, cz, DECK.y, 90]);
    await legs(level, cx, cz, 2.6);                // wide stance under the 8-long belt
    await underBracing(level, cx, cz, len / 2, w / 2);
  }

  // --------------------------------------------------------------- spike deck
  // platform_4x4x1 blue on 4 legs. Spikes themselves are placed by another agent.
  {
    const { cx, cz, w, d } = SEG.spikes;
    await place(level, ['platform_4x4x1', 'blue', cx, cz, DECK.y]);
    await legs(level, cx, cz, 1.2);                // corners at cx+/-1.2 under 4x4
    await underBracing(level, cx, cz, w / 2, d / 2);
  }

  // ------------------------------------------------------------ landmark deck
  // platform_6x6x1 blue on 4 legs; rails on the outer long edges (z = +/-3) only,
  // leaving the X edges open as the through-route for the saw/pipe gateway.
  {
    const { cx, cz, w, d } = SEG.landmark;
    await place(level, ['platform_6x6x1', 'blue', cx, cz, DECK.y]);
    await legs(level, cx, cz, 2);
    await underBracing(level, cx, cz, w / 2, d / 2);
    await railEdge(level, 'single', cx, cz + d / 2, 'z', +1, w);
    await railEdge(level, 'single', cx, cz - d / 2, 'z', -1, w);
  }

  // ------------------------------------------------------------------- bridge
  // platform_2x2x1 blue stepping deck on a single centred leg.
  {
    const { cx, cz } = SEG.bridge;
    await place(level, ['platform_2x2x1', 'blue', cx, cz, DECK.y]);
    await place(level, [LEG, 'neutral', cx, cz, 0]);   // one centred leg
  }

  // ------------------------------------------------------------- finish tower
  // pillar_2x2x8 grey tower from the ground; platform_4x4x2 blue finish deck on
  // top (base at TOWER.deckY = 8, top at 10). Padded rails ring the top edges
  // EXCEPT the -X side, which is the entry from the bridge/spring.
  {
    const { cx, cz, w, d } = SEG.finish;
    await place(level, [TALL_LEG, 'neutral', cx, cz, 0]);          // tower core
    // four corner legs too, so the 4x4 deck reads well supported
    await legs(level, cx, cz, 1.2, TALL_LEG);
    await place(level, ['platform_4x4x2', 'blue', cx, cz, TOWER.deckY]);

    const top = TOWER.deckTop;                                     // y = 10
    await railEdge(level, 'padded', cx, cz + d / 2, 'z', +1, w, top);  // +Z edge
    await railEdge(level, 'padded', cx, cz - d / 2, 'z', -1, w, top);  // -Z edge
    await railEdge(level, 'padded', cx + w / 2, cz, 'x', +1, d, top);  // far (+X) edge
    // -X edge is the entry: left open.
  }
}
