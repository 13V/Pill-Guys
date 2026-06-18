# Pill-Guys — Lobby & Cosmetics Design

A customization **lobby** is the front door (`index.html`). The bean stands on a
spotlit, slowly-rotating podium; the player browses **Skins / Auras / Pets**,
previews them live, buys them with **coins** earned in the levels, then hits
**PLAY**. Equipped cosmetics persist (localStorage) and show up in-game.

## Research → what Fall Guys did (and how we adapted it)

Fall Guys cosmetics (sources: Fall Guys Wiki, Epic support, GameSpot):
- **Costumes** (Upper + Lower halves, mix-and-match), **Colours**, **Patterns**
  (polkadots/stripes/zebra/watermelon…), **Faceplates**, **Emotes**,
  **Nameplates/Nicknames**. Bright, hyper-saturated, chunky, cute, parody-heavy
  (food/animals/robots/collabs). Iconic: Pigeon, Hot Dog, Dinosaur, Pineapple.
- **Economy:** *Kudos* (soft, earned), *Show-Bucks* (premium), *Crowns → Crown
  Rank* (won, unlocks costumes). Rotating Store + Season Pass. Five rarity tiers:
  **Common → Uncommon → Rare → Epic → Legendary**; price + flashiness scale with
  rarity.
- **Locker screen:** character large on a rotating stage, category tabs, click to
  auto-equip and preview live, big rounded playful buttons.

**Our adaptation** (single-player, one bean, single COINS currency):
- **Skins** = recolour the bean body/limbs/hands+feet + optional surface pattern
  (stripes/spots/gradient/stars/zigzag) + finish (matte/gloss/metal).
- **Auras** = particle/glow fields around the bean (sparkle/hearts/frost/embers/
  voltage/rainbow).
- **Pets** = small companions that bob and follow (cube/coin/duck/star/ghost/saw).
- One currency, **COINS**, earned by finishing levels (+ pickups). No premium
  tier, no timers — everything browsable and ownable.

## Catalog (see `web/src/cosmetics.js`)

Rarity colours: Common `#b8c2cc`, Uncommon `#5bd66a`, Rare `#4aa3ff`, Epic
`#b06bff`, Legendary `#ffc23f`.

- **Skins (9):** Classic Coral *(free default)*, Bubblegum, Mint Choc (uncommon
  300/350) · Watermelon, Hot Dog (rare 550/650) · Frostbite, Tiger, Galaxy (epic
  1300/1200/1500) · Golden Bean (legendary 3000).
- **Auras (7):** No Aura *(free default)* · Sparkle, Hearts (uncommon 250/300) ·
  Frost, Embers (rare 500/650) · Voltage (epic 1200) · Rainbow Trail (legendary
  3000).
- **Pets (7):** No Pet *(free default)* · Cube Buddy (common 150) · Coin Sprite,
  Duckling (uncommon 300/350) · Lil' Star, Boo (rare 600/700) · Mini Sawblade
  (epic 1200).

**Economy:** start with **500 coins**; each level finish banks its collected
coins **+ 100** bonus. A Rare unlocks in a couple of runs, Epics in several,
Legendaries are the long chase. Defaults (Classic Coral / No Aura / No Pet) are
always owned so the bean is never naked.

## Architecture

| File | Role |
|---|---|
| `src/cosmetics.js` | Catalog + rarity + **single source of truth**: coins, owned set, equipped-per-slot, `buy/equip/addCoins`, localStorage-backed (in-memory fallback). No THREE/DOM. |
| `src/character.js` | Shared bean builder `buildCharacter(parent, skin)` — used by BOTH the in-game player and the lobby preview so a skin looks identical everywhere. |
| `src/effects/aura.js` | `createAura(parent)` → `setVariant/update/dispose`; pooled particle field that envelops the bean. |
| `src/pet.js` | `createPet(scene)` → `setVariant/update(dt,target,yaw)`; procedural companion that bobs + trails the bean. |
| `src/lobbyUI.js` | DOM overlay: top bar + coins, Skins/Auras/Pets tabs, rarity-coloured item cards (owned/equipped/buy/locked states), PLAY. Pure DOM + callbacks. |
| `src/lobby.js` | The hub scene: studio lighting + podium + spotlight, builds the preview bean, wires `lobbyUI` callbacks ↔ `cosmetics`, live preview, buy confetti, PLAY → `game.html`. |
| `index.html` | Lobby front door (old asset viewer preserved at `showcase.html`). |
| `src/player.js` / `src/game.js` | Player takes an equipped `skin`; the game attaches the equipped aura + pet and banks coins on finish. |

**Preview vs commit:** clicking a card previews it live on the podium; only
**Buy**/**Equip** commit to `cosmetics`. PLAY always uses the committed equipped
state. Buying deducts coins, marks owned, auto-equips, and fires a confetti +
coin-burst celebration (reusing the in-game particle/audio effects).
