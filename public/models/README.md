# Drop your KayKit models here

The game loads 3D models from this folder at runtime. **Until you add files,
the game runs with built-in primitive placeholders** (a pink pill, a red
spinning beam, a golden crown) — so it's playable immediately.

## What goes here

The [`src/Assets.js`](../../src/Assets.js) manifest currently expects:

| Logical name | File this folder should contain | Used for |
| ------------ | ------------------------------- | -------- |
| `character`  | `character.gltf` (+ its `.bin` / textures) | the player |
| `hammer`     | `hammer.gltf`                   | spinning beam hazards |
| `crown`      | `crown.gltf`                    | the goal you grab to win |

Names not matching? Either rename your files to the above, or edit the paths
in `src/Assets.js`.

## How to get the models

1. Download the **KayKit Platformer Pack** from <https://kaylousberg.itch.io/>.
   The base pack is free; the EXTRA pack (hammers, gears, conveyors, etc.) is
   the one shown in the promo art.
2. Unzip it and copy the `.gltf`/`.glb` files (plus any `.bin` and texture
   files they reference) into this folder.
3. Reload the game — matching models are picked up automatically.

## License

The KayKit Platformer Pack is **CC0** (public domain) — free for personal and
commercial use. See [`LICENSE-KayKit.txt`](./LICENSE-KayKit.txt). Crediting
Kay Lousberg (www.kaylousberg.com) is appreciated but not required.

> The model files are **not** committed to this repo — only this drop folder,
> the license, and these instructions. Download them from the link above.
