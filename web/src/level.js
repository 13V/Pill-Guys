// "Assembly Line 01" — first-level blueprint (see ASSET_GUIDE.md).
// A continuous elevated strip on grey legs, read left (start) -> right (finish).
// Tuple: [name, color, x, z, y, rotY?, rotX?, rotZ?]
//   x,z = world position of the footprint center (1 unit = 1 grid cell)
//   y   = base height (bottom of the piece). Main deck top is y = 5.
// Sizes/pivots verified from the glTF POSITION accessors.
// Railings sit ~0.8 toward local -Z of their origin, so edge rails are placed at
// the edge with rotY 0 (+Z edge) / 180 (-Z edge) / 90,270 (X edges) -> inset 0.8.
// Colour budget: blue play surface · grey legs/machinery · red/yellow/green accents.

export const PLACEMENTS = [
  // ── Segment 1 · Start pad (X 0..6, 6 wide) ──────────────────────
  ['platform_6x6x1', 'blue', 3, 0, 4],
  ['pillar_2x2x4', 'neutral', 1, -2, 0],
  ['pillar_2x2x4', 'neutral', 5, -2, 0],
  ['pillar_2x2x4', 'neutral', 1, 2, 0],
  ['pillar_2x2x4', 'neutral', 5, 2, 0],
  ['railing_straight_single', 'blue', 1, 3, 5, 0],
  ['railing_straight_single', 'blue', 3, 3, 5, 0],
  ['railing_straight_single', 'blue', 5, 3, 5, 0],
  ['railing_straight_single', 'blue', 1, -3, 5, 180],
  ['railing_straight_single', 'blue', 3, -3, 5, 180],
  ['railing_straight_single', 'blue', 5, -3, 5, 180],
  ['railing_straight_single', 'blue', 0, -2, 5, 270],
  ['railing_straight_single', 'blue', 0, 2, 5, 270],
  ['signage_arrow_stand', 'yellow', 4.5, 0, 5, -90],
  ['platform_wood_1x1x1', 'neutral', 0.5, -5, 0], // crate on the ground for warmth

  // ── Segment 2 · Conveyor run (X 6..14, 4 wide) ──────────────────
  ['conveyor_4x8x1', 'blue', 10, 0, 4, 90], // rotate so the 8-long belt runs along X
  ['pillar_2x2x4', 'neutral', 7, -1.5, 0],
  ['pillar_2x2x4', 'neutral', 7, 1.5, 0],
  ['pillar_2x2x4', 'neutral', 13, -1.5, 0],
  ['pillar_2x2x4', 'neutral', 13, 1.5, 0],
  ['star', 'yellow', 8, 0, 6.8],
  ['star', 'yellow', 10, 0, 7.2],
  ['star', 'yellow', 12, 0, 6.8],

  // ── Segment 3 · Spike hazard (X 14.5..18.5, 4 wide) ─────────────
  ['platform_4x4x1', 'blue', 16.5, 0, 4],
  ['pillar_2x2x4', 'neutral', 15, -1.5, 0],
  ['pillar_2x2x4', 'neutral', 18, -1.5, 0],
  ['pillar_2x2x4', 'neutral', 15, 1.5, 0],
  ['pillar_2x2x4', 'neutral', 18, 1.5, 0],
  ['floor_spikes_4x4x1', 'neutral', 16.5, 0, 5], // clean 4x4 spike tile on the deck
  ['cone', 'red', 15, 1.5, 5],
  ['cone', 'red', 18, -1.5, 5],

  // ── Segment 4 · Saw + pipe landmark (X 18.5..23, 6 wide) ────────
  ['platform_6x6x1', 'blue', 21, 0, 4],
  ['pillar_2x2x4', 'neutral', 19, -2, 0],
  ['pillar_2x2x4', 'neutral', 23, -2, 0],
  ['pillar_2x2x4', 'neutral', 19, 2, 0],
  ['pillar_2x2x4', 'neutral', 23, 2, 0],
  ['sawblade', 'neutral', 20, 1.5, 5.45], // flat spinning blade resting on the deck
  ['pipe_end', 'green', 21, -1.5, 5], // green warp-portal ring on the deck
  ['pipe_straight_A', 'red', 21, -3.2, 5, 90], // bold red pipe accent along the back edge
  ['pipe_90_A', 'red', 23.2, -3.2, 5, 90],
  ['star', 'yellow', 21, 1.5, 7],

  // ── Segment 5 · Spring + Finish tower (X 23..) ──────────────────
  ['platform_2x2x1', 'blue', 25, 0, 4],
  ['pillar_2x2x4', 'neutral', 25, 0, 0],
  ['spring_pad', 'red', 25, 0, 5],
  ['spring', 'neutral', 25, 0, 5],
  ['pillar_2x2x8', 'neutral', 27.5, 0, 0],
  ['platform_4x4x2', 'blue', 27.5, 0, 8],
  ['railing_straight_padded', 'blue', 27.5, 2, 10, 0],
  ['railing_straight_padded', 'blue', 27.5, -2, 10, 180],
  ['railing_straight_padded', 'blue', 25.5, 0, 10, 270],
  ['signage_finish', 'neutral', 27.5, 0, 10, 90], // finish gate across the approach
  ['flag_C', 'red', 28.6, 1.4, 10],
  ['chest_large', 'yellow', 26.6, -1.2, 10],
];
