# Pill-Guys — web

A three.js + [Rapier](https://rapier.rs/) prototype of **"Assembly Line 01"**, a
first level built entirely from the KayKit Platformer Pack (CC0). See
[`../ASSET_GUIDE.md`](../ASSET_GUIDE.md) for the asset analysis and grid system.

## Run

```bash
npm install
npm run dev          # open the printed localhost URL
```

- `/` — static showcase (the lit hero scene used for `preview.png`)
- `/game.html` — **play it**: WASD / arrows to move, **Space** to jump, **R** to restart

## Other scripts

```bash
npm run render            # screenshot the static showcase -> preview.png
node integration_test.mjs # headless gameplay regression test (10 checks: move,
                          # jump, conveyor, spring, spikes-respawn, coins, finish)
```

## Layout

| File | Responsibility |
|---|---|
| `src/scene.js` | lighting, camera, presentation (gradient backdrop, soft shadows, PBR env) |
| `src/buildVisual.js` | composes the visual level from `src/props/*` |
| `src/props/{structure,hazards,pipes,decor}.js` | one level concern each |
| `src/layout.js` | shared segment coordinates (single source of truth) |
| `src/physics.js` | Rapier world, fixed step, static/sensor helpers, kinematic capsule |
| `src/colliders.js` | static deck colliders + sensor regions + collectible coins |
| `src/player.js` | the "pill guy" character controller |
| `src/input.js` | keyboard (+ touch) input |
| `src/followCamera.js` | smooth follow camera |
| `src/interactions.js` + `src/hud.js` | sensor reactions + DOM HUD |
| `src/game.js` | wires everything into a fixed-step loop (entry: `game.html`) |

`public/Assets` is a symlink to the repo's `../Assets` so the dev server serves the
glTF pack without copying it.
