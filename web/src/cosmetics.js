// COSMETICS — the catalog of skins / auras / pets, the single COINS economy, and
// localStorage-backed ownership/equipped state. Pure data + state: NO three.js,
// NO required DOM, so it's safe to import anywhere (lobby, game, headless tests).
//
//   import { CATALOG, RARITY, cosmetics } from './cosmetics.js';
//   cosmetics.getCoins() / addCoins(n) / isOwned(id) / getEquipped()
//   cosmetics.getEquippedItem('skin'|'aura'|'pet')  -> the item object (never null)
//   cosmetics.buy(id) -> { ok, reason }   cosmetics.equip(id) -> { ok }
//
// Item param shapes (consumed by character.js / aura.js / pet.js / lobbyUI.js):
//   skin: { id,name,rarity,price,icon, body,limb,cap, pattern, patternColor, finish }
//          pattern  : 'none'|'stripes'|'spots'|'gradient'|'stars'|'zigzag'
//          finish   : 'matte'|'gloss'|'metal'
//   aura: { id,name,rarity,price,icon, kind, color, color2 }
//          kind     : 'none'|'sparkle'|'hearts'|'frost'|'embers'|'voltage'|'rainbow'
//   pet : { id,name,rarity,price,icon, model, color, color2 }
//          model    : 'none'|'cube'|'coin'|'duck'|'star'|'ghost'|'saw'

export const RARITY = {
  common:    { name: 'Common',    color: '#b8c2cc' },
  uncommon:  { name: 'Uncommon',  color: '#5bd66a' },
  rare:      { name: 'Rare',      color: '#4aa3ff' },
  epic:      { name: 'Epic',      color: '#b06bff' },
  legendary: { name: 'Legendary', color: '#ffc23f' },
};

const SKINS = [
  { id: 'skin_coral',     name: 'Classic Coral', rarity: 'common',    price: 0,    icon: '🔴', body: '#ff4d4d', limb: '#e23b3b', cap: '#fff0e6', pattern: 'none',     patternColor: '#ffffff', finish: 'matte' },
  { id: 'skin_bubblegum', name: 'Bubblegum',     rarity: 'uncommon',  price: 300,  icon: '🩷', body: '#ff7fb6', limb: '#ee5fa0', cap: '#fff0f6', pattern: 'none',     patternColor: '#ffffff', finish: 'gloss' },
  { id: 'skin_mint',      name: 'Mint Choc',     rarity: 'uncommon',  price: 350,  icon: '🍃', body: '#6fe3b0', limb: '#3fc790', cap: '#fff8e6', pattern: 'spots',    patternColor: '#5a3a2a', finish: 'matte' },
  { id: 'skin_watermelon',name: 'Watermelon',    rarity: 'rare',      price: 550,  icon: '🍉', body: '#3fb84f', limb: '#ff5a78', cap: '#ffe0e6', pattern: 'spots',    patternColor: '#16161e', finish: 'matte' },
  { id: 'skin_hotdog',    name: 'Hot Dog',       rarity: 'rare',      price: 650,  icon: '🌭', body: '#c7762e', limb: '#a55f22', cap: '#ffcc2e', pattern: 'zigzag',   patternColor: '#ffcc2e', finish: 'gloss' },
  { id: 'skin_frostbite', name: 'Frostbite',     rarity: 'epic',      price: 1300, icon: '🧊', body: '#a9e4ff', limb: '#7fc8ee', cap: '#ffffff', pattern: 'gradient', patternColor: '#ffffff', finish: 'gloss' },
  { id: 'skin_tiger',     name: 'Tiger',         rarity: 'epic',      price: 1200, icon: '🐯', body: '#ff8a1e', limb: '#d9740f', cap: '#fff0e6', pattern: 'stripes',  patternColor: '#16161e', finish: 'matte' },
  { id: 'skin_galaxy',    name: 'Galaxy',        rarity: 'epic',      price: 1500, icon: '🌌', body: '#2b1b66', limb: '#5b2b99', cap: '#d9c2ff', pattern: 'stars',    patternColor: '#ffffff', finish: 'gloss' },
  { id: 'skin_gold',      name: 'Golden Bean',   rarity: 'legendary', price: 3000, icon: '🏆', body: '#ffd23f', limb: '#e0a800', cap: '#fff6cc', pattern: 'gradient', patternColor: '#fff6cc', finish: 'metal' },
];

const AURAS = [
  { id: 'aura_none',    name: 'No Aura',       rarity: 'common',    price: 0,    icon: '🚫', kind: 'none',    color: '#ffffff', color2: '#ffffff' },
  { id: 'aura_sparkle', name: 'Sparkle',       rarity: 'uncommon',  price: 250,  icon: '✨', kind: 'sparkle', color: '#fff3b0', color2: '#ffffff' },
  { id: 'aura_hearts',  name: 'Hearts',        rarity: 'uncommon',  price: 300,  icon: '💗', kind: 'hearts',  color: '#ff6b9d', color2: '#ff3b6b' },
  { id: 'aura_frost',   name: 'Frost',         rarity: 'rare',      price: 500,  icon: '❄️', kind: 'frost',   color: '#bfefff', color2: '#ffffff' },
  { id: 'aura_embers',  name: 'Embers',        rarity: 'rare',      price: 650,  icon: '🔥', kind: 'embers',  color: '#ff8a1e', color2: '#ffd23f' },
  { id: 'aura_voltage', name: 'Voltage',       rarity: 'epic',      price: 1200, icon: '⚡', kind: 'voltage', color: '#5bd6ff', color2: '#ffffff' },
  { id: 'aura_rainbow', name: 'Rainbow Trail', rarity: 'legendary', price: 3000, icon: '🌈', kind: 'rainbow',  color: '#ff3b3b', color2: '#3b8aff' },
];

const PETS = [
  { id: 'pet_none',  name: 'No Pet',        rarity: 'common',   price: 0,    icon: '🚫', model: 'none',  color: '#ffffff', color2: '#ffffff' },
  { id: 'pet_cube',  name: 'Cube Buddy',    rarity: 'common',   price: 150,  icon: '🧊', model: 'cube',  color: '#4aa3ff', color2: '#1a1a22' },
  { id: 'pet_coin',  name: 'Coin Sprite',   rarity: 'uncommon', price: 300,  icon: '🪙', model: 'coin',  color: '#ffd23f', color2: '#e0a800' },
  { id: 'pet_duck',  name: 'Duckling',      rarity: 'uncommon', price: 350,  icon: '🦆', model: 'duck',  color: '#ffe14d', color2: '#ff8a1e' },
  { id: 'pet_star',  name: "Lil' Star",     rarity: 'rare',     price: 600,  icon: '⭐', model: 'star',  color: '#ffe14d', color2: '#16161e' },
  { id: 'pet_boo',   name: 'Boo',           rarity: 'rare',     price: 700,  icon: '👻', model: 'ghost', color: '#eaf2ff', color2: '#16161e' },
  { id: 'pet_saw',   name: 'Mini Sawblade', rarity: 'epic',     price: 1200, icon: '🪚', model: 'saw',   color: '#c0c8d0', color2: '#8a94a0' },
];

export const CATALOG = { skin: SKINS, aura: AURAS, pet: PETS };

// Flat id -> item lookup, plus id -> category.
const BY_ID = new Map();
const CAT_OF = new Map();
for (const cat of ['skin', 'aura', 'pet']) {
  for (const item of CATALOG[cat]) { BY_ID.set(item.id, item); CAT_OF.set(item.id, cat); }
}

const DEFAULT_EQUIPPED = { skin: 'skin_coral', aura: 'aura_none', pet: 'pet_none' };
const STARTING_COINS = 500; // enough to grab a couple of items and feel the shop
const STORAGE_KEY = 'pillguys.cosmetics.v1';

function freshState() {
  return { coins: STARTING_COINS, owned: ['skin_coral', 'aura_none', 'pet_none'], equipped: { ...DEFAULT_EQUIPPED } };
}

// localStorage wrapper that degrades to an in-memory store (headless/SSR/denied).
function readStore() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function writeStore(state) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

// Load + sanitize: ensure defaults are always owned/valid even if storage is stale.
function load() {
  const s = readStore() || freshState();
  if (typeof s.coins !== 'number' || !(s.coins >= 0)) s.coins = STARTING_COINS;
  const owned = new Set(Array.isArray(s.owned) ? s.owned : []);
  for (const id of ['skin_coral', 'aura_none', 'pet_none']) owned.add(id);
  // Drop any ids no longer in the catalog.
  for (const id of [...owned]) if (!BY_ID.has(id)) owned.delete(id);
  s.owned = [...owned];
  const eq = s.equipped && typeof s.equipped === 'object' ? s.equipped : {};
  s.equipped = {
    skin: BY_ID.has(eq.skin) && owned.has(eq.skin) ? eq.skin : DEFAULT_EQUIPPED.skin,
    aura: BY_ID.has(eq.aura) && owned.has(eq.aura) ? eq.aura : DEFAULT_EQUIPPED.aura,
    pet:  BY_ID.has(eq.pet)  && owned.has(eq.pet)  ? eq.pet  : DEFAULT_EQUIPPED.pet,
  };
  return s;
}

let state = load();

export const cosmetics = {
  // --- currency ---
  getCoins() { return state.coins; },
  addCoins(n) { state.coins = Math.max(0, state.coins + (n | 0)); writeStore(state); return state.coins; },

  // --- catalog helpers ---
  getItem(id) { return BY_ID.get(id) || null; },
  categoryOf(id) { return CAT_OF.get(id) || null; },

  // --- ownership / equipped ---
  isOwned(id) { return state.owned.includes(id); },
  isEquipped(id) { const c = CAT_OF.get(id); return !!c && state.equipped[c] === id; },
  getEquipped() { return { ...state.equipped }; },
  getEquippedItem(cat) { return BY_ID.get(state.equipped[cat]) || BY_ID.get(DEFAULT_EQUIPPED[cat]); },

  // Equip an owned item (un-equips the previous in that slot). -> { ok, reason }
  equip(id) {
    const cat = CAT_OF.get(id);
    if (!cat) return { ok: false, reason: 'unknown' };
    if (!state.owned.includes(id)) return { ok: false, reason: 'not-owned' };
    state.equipped[cat] = id; writeStore(state);
    return { ok: true };
  },

  // Buy an item with coins; on success it is owned + auto-equipped. -> { ok, reason }
  buy(id) {
    const item = BY_ID.get(id);
    if (!item) return { ok: false, reason: 'unknown' };
    if (state.owned.includes(id)) return this.equip(id);
    if (state.coins < item.price) return { ok: false, reason: 'too-expensive' };
    state.coins -= item.price;
    state.owned.push(id);
    state.equipped[CAT_OF.get(id)] = id;
    writeStore(state);
    return { ok: true };
  },

  // Snapshot for the UI (coins + fast lookups).
  snapshot() {
    return {
      coins: state.coins,
      owned: new Set(state.owned),
      equipped: { ...state.equipped },
    };
  },

  // Testing / reset hook.
  _reset() { state = freshState(); writeStore(state); return state; },
};
