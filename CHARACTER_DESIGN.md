# Pill-Guys — Character Redesign (Fall-Guys bean)

The player character (and lobby preview) was rebuilt in `web/src/character.js` to
read like the real Fall Guys bean instead of a plain capsule. Done with a
research → many-candidates → synthesis pipeline.

## Research (what the real Fall Guys bean is)

- **Body:** a bottom-heavy **gumdrop/teardrop**, NOT a uniform capsule — fat,
  near-hemispherical bottom, **widest ~35–40% up**, tapering to a **rounded
  domed top** (no neck). Body-alone height:width ≈ 1.25:1 (squat). Build with a
  revolved profile (LatheGeometry).
- **Eyes = the whole expression:** **big, tall-oval** eyes (not small spheres),
  a large **dark wet pupil** (~60% of the white), and crisp **specular
  catchlight dots** (the "alive" highlight — unlit so they always pop). Set high
  on the front with a clear forehead dome. No mouth/nose/brows on the base bean.
- **Limbs:** **tiny** vs the body (¼–⅕ its size) — stubby rounded **mitten**
  arms high on the shoulder slope, short thick **boot** legs close together,
  feet poking out the bottom.
- **Material:** soft **"jelly/vinyl toy"** — satin, NOT chrome: a soft sheen +
  light clearcoat, a faint fake sub-surface glow, and gentle bottom ambient
  occlusion so it feels grounded and doughy.

(Sources: Fall Guys Wiki, Mediatonic anatomy art, modeling breakdowns.)

## Process

1. **2 research agents** — one on body/limb geometry & proportions (produced a
   LatheGeometry gumdrop profile + limb dimensions), one on face/eyes & material
   (eye anatomy + a MeshPhysicalMaterial spec).
2. **5 candidate agents in parallel**, each a different approach, all drop-in
   compatible (`buildCharacter(parent, skin) -> { rig, body, legL, legR, armL, armR, eyes }`):
   - A — faithful LatheGeometry gumdrop (came out a touch squat)
   - B — blended/stacked spheres (visible seams — rejected)
   - C — sculpted/displaced capsule (over-tapered to a cone — rejected)
   - D — taller stylized lathe + extra-expressive twin-catchlight eyes ✅ best form
   - E — premium materials (clearcoat/sheen/fake-SSS + baked bottom-AO vertex colors) ✅ best shading
   A throwaway preview harness rendered each on a podium for side-by-side compare.
3. **Synthesis** into the shipped `character.js`: D's tall body + expressive eyes
   and E's premium materials/AO, then refined — a generated **two-ellipse gumdrop**
   (round bottom + tall *rounded* dome, no cone/point), eyes raised to the
   upper-middle, and arms/feet pushed out so they're clearly visible from the
   high in-game camera (boots stick **forward** so the feet read).

## Final spec (in `character.js`)

- Body: LatheGeometry from a generated gumdrop profile (round bottom y≈-0.55,
  widest ~37% up, domed top y≈+0.62), with a baked bottom-AO **vertex-color**
  multiply (0.8 at the base → 1.0 by mid-body, survives every skin recolor).
- Eyes: tall-oval glossy sclera + big wet near-black pupil + two unlit white
  catchlights (same screen-side on both eyes for a focused gaze), slight toe-in.
- Limbs: tiny mitten-capped arms splayed at the body's side surface; short legs
  with flattened, **forward** boots; foot bottom at y≈-0.78 so it stands on decks.
- Material: `MeshPhysicalMaterial` satin jelly — clearcoat + sheen + faint
  emissive SSS; glossier eyes; `skin.finish` (matte/gloss/metal) honored; skin
  **pattern** textures still supported (stripes/spots/gradient/stars/zigzag).

The physics capsule (`BEAN_RADIUS 0.35`, `BEAN_HALF_HEIGHT 0.4`) and the
player's squash/walk/blink rig are unchanged, so gameplay is identical (L1 both
lanes still finish, 0 deaths) and the cosmetic skin system works as before.
