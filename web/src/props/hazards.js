// props/hazards.js — owned by the "hazards" agent. Exposes async build(level).
//
// Places the static + moving hazards and the spring launch on the elevated
// "Assembly Line 01" walkway. Everything is seated on the deck surface
// (DECK.top = 5) so nothing sinks through the boards or floats above them.
//
// Seating notes (bbox read straight from each glTF):
//   floor_spikes_4x4x1  : 4×1×4, base at y=0  -> base sits at DECK.top.
//   sawblade            : flat disc Ø6.8 (r≈3.4), origin at the disc CENTER
//                         (y -0.45..0.45). Tipped vertical with rx=90 so it
//                         stands like a circular saw; its center is dropped
//                         just below the deck so the lower teeth disappear into
//                         a slot and ~2.5 cells of blade rise above the boards.
//   spikeroller_horizontal : 4×4×4, origin at CENTER -> origin y = DECK.top+2.
//   spring_pad_red      : 1.5×1×1.5, base0 -> base at DECK.top.
//   spring              : 1×2.2×1, base0   -> base at DECK.top (sits in pad).
//   cone_red            : 0.5×0.65×0.5, base0 -> base at DECK.top.
import * as THREE from 'three';
import { place } from '../assets.js';
import { DECK, TOWER, SEG } from '../layout.js';

export async function build(level) {
  const top = DECK.top; // 5 — the walkway surface

  // --- Static hazard: floor spikes centered on the spike deck (4×4) ---
  await place(level, ['floor_spikes_4x4x1', 'neutral', SEG.spikes.cx, 0, top]);

  // --- Moving hazard: big circular sawblade rising through a deck slot ---
  // Disc tipped vertical (rx=90). Origin = disc center; dropping it below the
  // deck buries the bottom teeth so it reads as a saw rising through a slot.
  // r≈3.4: center at top-0.9 -> top of blade ≈ 7.5, lower arc ≈ 0.7 (in slot).
  // Aligned across the walkway (face toward camera, spins about the run axis).
  const sawCenterY = top - 0.9; // 4.1
  await place(level, ['sawblade', 'neutral', SEG.landmark.cx, 0, sawCenterY, 0, 90, 0]);

  // --- Moving hazard: spike roller resting on the conveyor-side of the deck ---
  // 4×4×4 cube, origin at center -> origin y = top + 2 so it rests ON the deck.
  await place(level, ['spikeroller_horizontal', 'neutral', SEG.spikes.cx - 6, 0, top + 2]);

  // --- Spring launch on the bridge deck: red pad with a spring sitting in it ---
  await place(level, ['spring_pad', 'red', SEG.bridge.cx, 0, top]);
  await place(level, ['spring', 'neutral', SEG.bridge.cx, 0, top]);

  // --- Red cones flagging the hazards (warning markers) ---
  // Placed on the front edge (toward camera) so they read as caution markers
  // without being occluded by the spikes/saw behind them.
  const cones = [
    [SEG.spikes.cx - 1.4, -1.4],
    [SEG.spikes.cx + 1.4, -1.4],
    [SEG.landmark.cx - 2.4, -2.4],
    [SEG.landmark.cx + 2.4, -2.4],
  ];
  for (const [cx, cz] of cones) {
    await place(level, ['cone', 'red', cx, cz, top]);
  }
}
