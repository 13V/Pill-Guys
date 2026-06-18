# 💊 Pill Guys

A chaotic, **Fall Guys-style** physics party platformer that runs in the
browser — plus a companion **Solana token (PILL)** scaffold.

Wobble your little pill through a floating obstacle course, dodge the spinning
beams, hit the checkpoints, and grab the crown to qualify.

> Fresh-start foundation: a polished, playable prototype you can build a full
> game on. Not a finished product (yet).

## Tech

- **[Three.js](https://threejs.org/)** — 3D rendering
- **[Rapier](https://rapier.rs/)** (`@dimforge/rapier3d-compat`) — physics &
  kinematic character controller
- **[Vite](https://vitejs.dev/)** — dev server & bundler
- **[@solana/web3.js](https://solana.com/) + SPL Token + Metaplex** — the token
  scaffold in [`token/`](./token)

## Run the game

```bash
npm install
npm run dev        # open the printed localhost URL
```

Build for production:

```bash
npm run build      # outputs to dist/
npm run preview
```

### Controls

| Action | Keys |
| ------ | ---- |
| Move   | `W A S D` / Arrow keys |
| Jump   | `Space` |
| Camera | Drag mouse (orbit) · Scroll (zoom) |

## Art assets (KayKit)

The game ships with built-in **primitive placeholders**, so it's playable with
zero downloads. To use the real **KayKit Platformer Pack** (CC0) art shown in
the design, drop the model files into [`public/models/`](./public/models) —
see the [instructions there](./public/models/README.md). Matching models are
loaded automatically; missing ones fall back to placeholders.

Credits and licensing: see [`CREDITS.md`](./CREDITS.md).

## The PILL token

A **scaffold-only** Solana token lives in [`token/`](./token). It defaults to
**devnet** and refuses to touch mainnet without an explicit
`CONFIRM_MAINNET=yes`. Nothing deploys until you run it. See the
[token README](./token/README.md).

```bash
cd token && npm install && npm run create-token   # devnet by default
```

## Project structure

```
.
├── index.html              # game shell + HUD/overlays
├── src/
│   ├── main.js             # bootstrap
│   ├── Game.js             # scene, lights, loop, state machine
│   ├── PhysicsWorld.js     # Rapier wrapper
│   ├── Player.js           # pill + kinematic character controller
│   ├── Level.js            # obstacle course, hazards, checkpoints, finish
│   ├── FollowCamera.js     # orbit/zoom follow camera
│   ├── Assets.js           # GLTF loader + KayKit manifest
│   ├── Input.js            # keyboard
│   ├── Hud.js              # DOM overlays
│   └── config.js           # gameplay tuning
├── public/models/          # drop KayKit .gltf/.glb here (+ CC0 license)
└── token/                  # Solana PILL token scripts (scaffold)
```

## Roadmap ideas

- Real KayKit models for player, hammers, platforms
- More obstacle types (conveyor belts, swinging axes, push bars, see-saws)
- Multiplayer races (WebRTC / authoritative server)
- Skins / cosmetics gated by holding PILL
- Leaderboards with on-chain time attestations

## License

Game code: MIT (see below). KayKit assets: CC0. See [`CREDITS.md`](./CREDITS.md).
