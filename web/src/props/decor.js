// props/decor.js — owned by the "decor" agent. Exposes async build(level).
//
// The "finishing pass": collectible arcs that lead the eye, an overhead truss
// gantry that frames the mid-level, start/flow signage, and a celebratory
// finish (gate + flag + reward chest), plus a couple of warm wood crates on the
// ground. Mirrors the official KayKit sample renders (see Samples/sample1.png &
// sample3.png in particular).
import * as THREE from 'three';
import { place } from '../assets.js';
import { DECK, TOWER, SEG } from '../layout.js';

// Per-collectible glow colors (the emissive tint we paint onto the pickups so
// they read as "energized" against the matte plastic everything else).
const GLOW = {
  yellow: 0xffcf33,
  blue: 0x3aa0ff,
  red: 0xff4d4d,
  green: 0x49e06a,
};

// Place a collectible and make it glow. We CLONE each mesh material first so we
// never mutate the shared loader cache (other placements of the same model stay
// matte). Returns the placed object.
async function placeGlow(level, spec, glowColor, intensity = 0.6) {
  const obj = await place(level, spec);
  if (!obj) return null;
  const emissive = new THREE.Color(glowColor);
  obj.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    o.material = mats.map((m) => {
      const c = m.clone();
      if ('emissive' in c) {
        c.emissive = emissive.clone();
        c.emissiveIntensity = intensity;
      }
      return c;
    });
    if (!Array.isArray(o.material)) o.material = o.material[0];
  });
  return obj;
}

export async function build(level) {
  // ----------------------------------------------------------------------
  // 1. STAR ARC over the conveyor jump — leads the eye across the gap.
  //    Conveyor center is x≈10; the run lives roughly x=8..12. Stars are
  //    centered on origin & flat-facing Z, so a small ry tilt + a rising/
  //    falling y reads as a tossed arc. They glow yellow.
  // ----------------------------------------------------------------------
  const starArc = [
    // [name, color, x, z, y, ry]
    ['star', 'yellow', 7.5, 0, 6.5, -18],
    ['star', 'yellow', 9.0, 0, 7.0, -8],
    ['star', 'yellow', 10.5, 0, 7.25, 6],
    ['star', 'yellow', 12.0, 0, 6.7, 16],
  ];
  for (const s of starArc) await placeGlow(level, s, GLOW.yellow, 0.65);

  // A few bonus pickups elsewhere so the level isn't single-note:
  // a blue diamond floating near the start approach, a green power-up over the
  // spikes beat, and a red heart tucked near the finish climb.
  await placeGlow(level, ['diamond', 'blue', 5, 0, 7.0, 0], GLOW.blue, 0.6);
  await placeGlow(level, ['power', 'green', 16.5, 0, 6.8, 0], GLOW.green, 0.6);
  await placeGlow(level, ['heart', 'red', 24, 0, 6.6, 0], GLOW.red, 0.6);

  // ----------------------------------------------------------------------
  // 2. OVERHEAD GANTRY / sign-bridge spanning the walkway at x≈13.
  //    Two grey truss towers flank the walkway in Z, a horizontal beam
  //    bridges them well above the play line, and a sign + blue diamonds
  //    crown it (à la sample3). All structure is grey/metal per art direction.
  //
  //    structure_C = 1.8x2.0x1.8 truss block (base 0). Stacked y=0,2,4,6 →
  //    towers rise to ~8. strut_horizontal = 2x0.5x0.5 beam; we chain it
  //    across Z to span the ~8-unit gantry, sitting at y≈8 (clears y=7).
  // ----------------------------------------------------------------------
  const gx = 13;            // gantry X (between conveyor and spikes beats)
  const towerZ = 3.5;       // walkway is ~6 wide (z=-3..3); towers just outside
  const beamY = 8;          // beam underside well above the y=7 play line

  for (const z of [-towerZ, towerZ]) {
    for (const ty of [0, 2, 4, 6]) {
      await place(level, ['structure_C', 'neutral', gx, z, ty]);
    }
  }
  // Horizontal beam: chain strut_horizontal (2 long each) across Z from the far
  // tower to the near tower so the span looks continuous, not gapped.
  for (const z of [-3, -1, 1, 3]) {
    await place(level, ['strut_horizontal', 'neutral', gx, z, beamY, 90]);
  }
  // Sign hung at the center of the beam, facing the camera/approach.
  await place(level, ['sign', 'neutral', gx, 0, beamY + 0.5, 0]);
  // Blue diamonds perched on the beam crown (matches the sample's row of
  // collectibles on top of the gantry). Glow them blue.
  for (const z of [-2.4, 0, 2.4]) {
    await placeGlow(level, ['diamond', 'blue', gx, z, beamY + 1.0, 0], GLOW.blue, 0.6);
  }

  // ----------------------------------------------------------------------
  // 3. START-PAD signage — a yellow arrow stand on the spawn deck pointing
  //    along the path (down +X). signage_arrow_stand faces +Z by default, so
  //    ry=-90 swings the arrow to point along +X (toward the finish).
  //    Deck top is DECK.top = 5; base sits there.
  // ----------------------------------------------------------------------
  await place(level, ['signage_arrow_stand', 'yellow', 5, 1.6, DECK.top, -90]);

  // ----------------------------------------------------------------------
  // 4. FINISH dressing on the tower deck (SEG.finish.cx, 0, TOWER.deckTop=10).
  //    A neutral finish GATE straddles the approach, a tall red flag plants in
  //    a corner, and a yellow reward chest sits center-stage. Celebratory.
  // ----------------------------------------------------------------------
  const fx = SEG.finish.cx;       // ≈27.5
  const fy = TOWER.deckTop;       // 10

  // signage_finish (5.4 wide x 4.7 tall gate, base ~ -0.5). ry=90 turns it to
  // straddle the approach (gate opening faces along the run in X). Nudge it to
  // the near edge of the deck so you "pass through" it onto the finish.
  await place(level, ['signage_finish', 'neutral', fx - 1.2, 0, fy + 0.5, 90]);

  // Red victory flag (flag_C = 4.06 tall) planted in the back corner of the
  // 4x4 deck. flag_C's banner sits on -Z; ry=180 turns it to fly toward camera.
  await place(level, ['flag_C', 'red', fx + 1.2, -1.2, fy, 180]);

  // Yellow reward chest, hero of the finish, center deck facing the approach.
  await place(level, ['chest_large', 'yellow', fx, 0.6, fy + 0.16, 180]);

  // ----------------------------------------------------------------------
  // 5. GROUND CRATES — a little brown/wood warmth on the neutral floor beside
  //    the start, exactly like the scattered crates in the samples. Base y=0.
  // ----------------------------------------------------------------------
  await place(level, ['platform_wood_1x1x1', 'neutral', 1.5, 5.0, 0]);
  await place(level, ['platform_wood_1x1x1', 'neutral', 2.6, 5.6, 0]);
  await place(level, ['platform_wood_1x1x1', 'neutral', 2.0, 6.6, 0]);
}
