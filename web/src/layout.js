// Shared level layout constants. ALL prop modules import from here so their
// coordinates line up. Do not hardcode segment positions elsewhere.
// Grid: 1 unit = 1 cell. Decks are centered on X/Z with their base at DECK.y.

export const DECK = { y: 4, top: 5 };          // main elevated walkway
export const TOWER = { y: 0, top: 8, deckY: 8, deckTop: 10 }; // finish tower

// Each segment: cx/cz = deck footprint center; w = X size, d = Z size.
export const SEG = {
  start: { cx: 3, cz: 0, w: 6, d: 6 },     // platform_6x6x1
  conveyor: { cx: 10, cz: 0, len: 8, w: 4 }, // conveyor_4x8x1 (rotated to run along X)
  spikes: { cx: 16.5, cz: 0, w: 4, d: 4 }, // platform_4x4x1
  landmark: { cx: 21, cz: 0, w: 6, d: 6 }, // platform_6x6x1 (saw + pipe gateway)
  bridge: { cx: 25, cz: 0, w: 2, d: 2 },   // platform_2x2x1 (spring launch)
  finish: { cx: 27.5, cz: 0, w: 4, d: 4 }, // pillar_2x2x8 tower + platform_4x4x2
};
