# Pill-Guys — Asset Guide & First-Level Blueprint

Analysis of the **KayKit Platformer Pack 1.0 (EXTRA)** (CC0, by Kay Lousberg) so we
can build our first level — and make it look as good as the official samples.

- **155 unique models**, each shipped in **4 colors** (blue, green, red, yellow) plus
  **neutral** (grey/metal). Colored sets = 118 models each; neutral = 53.
- **4 export formats:** `gltf` (+`.bin`), `fbx`, `fbx(unity)`, `obj` (+`.mtl`).
- **One shared texture atlas** (`Textures/platformer_texture.png`, 38 KB) drives the whole
  look; conveyor belts add `threads.png`. This single-atlas design is *why* everything
  looks cohesive — keep using it.
- Machine-readable list of every model is in [`catalog.csv`](catalog.csv).

---

## 1. Grid system (read this before placing anything)

| Property | Value |
|---|---|
| **1 grid cell** | **1.0 model-space unit** on every axis (exact) |
| **Horizontal origin (X, Z)** | **Centered** — a piece's pivot is the center of its footprint |
| **Vertical origin (Y)** | **Base-aligned** — `y = 0` is the bottom; pieces grow upward |
| **Name → size** | `name_WxDxH` = **Width(X) × Depth(Z) × Height(Y)**; the *last* digit is height |

**Examples (POSITION bbox read straight from the glTF):**

| Model | extents (x, y, z) | cells |
|---|---|---|
| `platform_1x1x1` | 1 × 1 × 1 | 1×1×1 |
| `platform_6x6x1` | 6 × 1 × 6 | 6×6×1 |
| `barrier_4x1x2` | 4 × 2 × 1 | W4·D1·H2 (a wall) |
| `pillar_1x1x8` | 0.8 × 8 × 0.8 | 1×1 footprint, 8 tall (mesh inset 0.1 each side) |
| `floor_wood_4x4` | 4 × **0.5** × 4 | thin half-height floor |
| `conveyor_4x4x1` | **4.2** × 1 × 4 | 4×4, rollers overhang 0.1 each end |
| `spring` | 1 × **~2.2** × 1 | 1-cell footprint, non-integer height |

**Placement rules**
- **Lay floors/platforms** by snapping the (centered) origin to grid-cell centers.
- **Stack vertically** by setting the next piece's `y` to the running sum of heights below
  it — since every piece's base is at `y = 0`, a `pillar_1x1x4` at `y=0` ends at `y=4` and
  the next piece's origin goes to `y=4`. No gaps, no overlap.
- Watch the cosmetic quirks: pillars are inset to 0.8, conveyors overhang ~0.2 on the long
  axis, `floor_wood_*` are half-height, springs are ~2.2 tall. Treat them as full
  1-/2-cell occupants for snapping; the insets are intentional visual gaps.
- Typical piece = **1 mesh / 1 material**. Conveyors = 2 materials (atlas + `threads`).

---

## 2. Format & color parity

| Format | per colored set | neutral | files | size |
|---|---|---|---|---|
| `gltf` (+bin) | 118 | 53 | 1,059 | 16 MB |
| `fbx` | 118 | 53 | 534 | 19 MB |
| `fbx(unity)` | 118 | 53 | 534 | 19 MB |
| `obj` (+mtl) | 132* | 55* | 1,175 | 23 MB |

`gltf`, `fbx`, `fbx(unity)` are in **perfect parity**. `obj` (*) additionally exports
**separated sub-parts** — chest lids, cannon turrets/barrels, sawblades, lever arms,
trap spikes, finish boards — as standalone files. Use `obj` if you need those parts as
**independent, animatable pieces**; otherwise `gltf` is the cleanest pipeline (web/Godot/
three.js) and `fbx(unity)` for Unity. All formats reference the same shared atlas. All
`.gltf`/`.bin` and `.obj`/`.mtl` pairs are intact — no orphans.

---

## 3. Catalog by category (155 models)

`colored` = available in blue/green/red/yellow · `neutral` = available in grey/metal.
Sizes are encoded in names (W×D×H). Full table in `catalog.csv`.

### Walkable surfaces
- **Platforms (16)** `platform_{1x1x1, 2x2x1, 2x2x2, 2x2x4, 4x2x1, 4x2x2, 4x2x4, 4x4x1,
  4x4x2, 4x4x4, 6x2x1, 6x2x2, 6x2x4, 6x6x1, 6x6x2, 6x6x4}` — the solid building blocks.
- **Slopes (9)** `platform_slope_{2x2x2, 2x4x4, 2x6x4, 4x2x2, 4x4x4, 4x6x4, 6x2x2, 6x4x4,
  6x6x4}` — ramps connecting heights.
- **Platforms · special (6)** `platform_arrow_2x2x1`, `platform_arrow_4x4x1` (directional),
  `platform_decorative_1x1x1`, `platform_decorative_2x2x2`, `platform_hole_6x6x1` (gap),
  `platform_wood_1x1x1`.
- **Floors / nets (9)** `floor_wood_{1x1,2x2,2x6,4x4}` (thin), `floor_net_{2x2x1,4x4x1}`,
  `safetynet_{2x2x1,4x2x1,6x2x1}`.

### Supports & edges
- **Pillars (7)** `pillar_{1x1x1,1x1x2,1x1x4,1x1x8,2x2x2,2x2x4,2x2x8}` — the legs that hold
  elevated strips up (neutral grey).
- **Structure / support (11)** `structure_A/B/C`, `strut_horizontal`, `strut_vertical`,
  `bracing_small/medium/large`, `arch`, `arch_tall`, `arch_wide` — gantries, trusses, bracing.
- **Barriers (12)** `barrier_{1..4}x1x{1,2,4}` — solid wall segments (colored + neutral).
- **Railings (6)** `railing_{straight,corner}_{single,double,padded}` — **edge trim; the #1
  polish element.**

### Mechanics & movement
- **Conveyors (4)** `conveyor_{2x4x1,2x8x1,4x4x1,4x8x1}` — directional belt floors (yellow treads).
- **Pipes (7)** `pipe_{straight_A/B, 90_A/B, 180_A/B, end}` — signature decorative runs /
  warp portals.
- **Springs (2)** `spring`, `spring_pad` — vertical boosters.
- **Mechanisms (6)** `button_base`, `lever_floor_base`, `lever_wall_base_A/B`, `hoop`,
  `hoop_angled`.

### Hazards
- **Static (14)** `floor_spikes_{2x2x1,4x4x1}`, `floor_spikes_curved_4x2x2`,
  `floor_spikes_trap_{2x2x1,4x4x1}`, `spikeblock_{up,down,left,right,omni,quad,
  double_horizontal,double_vertical}`, `cone`.
- **Moving (24)** `sawblade`, `saw_trap`, `saw_trap_double`, `saw_trap_long`, `spikeball`,
  `spikeball_hanger`, `spikeroller_horizontal/vertical`, `hammer`, `hammer_large`,
  `hammer_spikes`, `hammer_large_spikes`, `hammerblock`, `hammerblock_spikes`, `swiper`,
  `swiper_long`, `swiper_double`, `swiper_double_long`, `swiper_quad`, `swiper_quad_long`,
  `chain_full`, `chain_link`, `chain_link_end_top/bottom`.
- **Projectiles (6)** `cannon_base`, `cannon_bullet`, `bomb`, `bomb_A`, `bomb_B`, `ball`.

### Reward & signposting
- **Collectibles (6)** `star`, `diamond`, `heart`, `power`, `chest`, `chest_large`.
- **Signage / flags (10)** `flag_A/B/C`, `sign`, `signage_arrow_stand`, `signage_arrow_wall`,
  `signage_arrows_left/right`, `signage_finish`, `signage_finish_wide`.

> Note: there is **no coin** model — use `star`/`diamond` as the primary pickup.

---

## 4. Art direction — how to make it look like the samples

The samples are long, **elevated "assembly-line" strips on grey legs**, read left→right,
broadside to a 3/4 high camera with soft shadows on a neutral ground.

**Color budget (the single most important rule):**
- **~65% BLUE** — every play surface: platforms, slopes, conveyor frames, the run itself.
- **~20% GREY/METAL (neutral)** — *all* structure & machinery: support legs, struts,
  bracing, gears/sawblades, hammer shafts, railings, signage poles.
- **~15% accents, in repeating pulses, never as floor:**
  - **RED** = pipe runs + hero accents (spring pads, trim).
  - **YELLOW/ORANGE** = conveyor treads + caution.
  - **GREEN** = pipe entrances/portals (sparingly).
  - **brown/wood** = the odd crate for warmth.

**Polish checklist (do these and it reads "finished"):**
1. Put every elevated platform on **grey legs** (`pillar_*` / `structure_*`) — don't leave
   big platforms floating. Add `bracing_*`/`strut_*` at the joints.
2. **Rail every elevated edge** with `railing_*` (single on low runs, padded near hazards).
3. **Segment** the level into 4–5 themed beats, one hazard/idea each, with safe footing
   between — keep hazard density **low**; let it breathe.
4. **Repeat each accent at least twice** (two red pipe runs, recurring yellow conveyors) so
   color reads as rhythm, not noise.
5. **Mark flow:** `signage_arrow_*` at decisions, a finish landmark **high and at the right
   end** (`signage_finish` + `flag_*` on a tower).
6. **Lead the eye with sparse collectibles** — an arc of `star` over a jump, a `chest` on a
   high ledge. Don't scatter.
7. Keep **negative space** around the strip and under floating jump islands.
8. Present it: key light upper-front-left, soft contact shadows, neutral light ground,
   3/4 high-angle camera.

---

## 5. First-level blueprint — "Assembly Line 01"

A linear elevated strip, **~24 units long × 6 wide**, deck raised to **y = 4** on grey legs,
flowing left (start) → right (finish). Coordinates are grid cells; deck top sits at y≈5.

| # | Beat (X range) | Build | Color |
|---|---|---|---|
| 1 | **Start pad** (0–6) | `platform_6x6x1` spawn deck on 4× `pillar_2x2x4` + `bracing_medium`; `railing_straight_single` on the 3 outer edges; `signage_arrow_stand` → right | deck **blue**, legs **grey** |
| 2 | **Conveyor run** (6–14) | `conveyor_4x8x1` belt as the floor; flank with `railing_straight_single`; arc of 3× `star` on `pillar_1x1x2` above | frame **blue** / treads **yellow** |
| 3 | **Hazard gap** (14–18) | Two `platform_2x2x1` stepping stones across a `platform_hole_6x6x1`; `saw_trap_long` (grey) set in the mid stone; `floor_spikes_4x4x1` in the pit below; `railing_straight_padded` on approach | stones **blue**, blade **grey** |
| 4 | **Pipe landmark** (18–22) | Signature: `pipe_90_A` + `pipe_straight_A` + `pipe_180_A` arcing over the deck (**red**); land at a `pipe_end` **portal** (green); an `arch_wide` gantry frames it overhead | pipes **red**, portal **green**, gantry **grey** |
| 5 | **Spring finish** (22–26) | `spring` + `spring_pad` (red) launches up to a `platform_4x4x2` finish deck on a `pillar_2x2x8` tower; top it with `signage_finish` + `flag_C`, ring it with `railing_corner_*`, place `chest_large` as the reward | deck **blue**, tower **grey**, pad/flag **red** |

**Throughout:** grey `strut_*`/`bracing_*` under the deck and at every joint; `barrier_*`
where there's no railing; 2–3 `cone`s flagging hazards; one wood `platform_wood_1x1x1` crate
for warmth. Keep the ground plane empty for clean shadows.

This blueprint is engine-agnostic. The next step is to pick a target (three.js/web, Godot,
or Unity) and assemble it — see the chat for the recommendation.
