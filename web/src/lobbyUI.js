// Lobby UI — DOM overlay for the customization LOBBY. Owned by the LOBBY-UI agent (this agent owns lobbyUI.js).
//
// export function createLobbyUI(opts) -> {
//   refresh(),                  // re-read state via opts.getSnapshot() and re-render coins + tab counts + active tab's cards + showcase
//   setActiveTab(category),     // 'skin' | 'aura' | 'pet' — switches tab, resets selection to that tab's equipped item, fires onTab
//   flashUnaffordable(itemId),  // brief shake/red flash on a card (and the showcase Buy button if it's the selected item)
//   root,                       // the overlay element (or null in headless)
//   dispose(),
// }
//
// opts = { catalog, rarity, getSnapshot, onPreview, onEquip, onBuy, onPlay, onTab }
//   catalog : { skin:[...], aura:[...], pet:[...] }; item = { id, name, rarity, price, icon }
//   rarity  : { <tier>: { name, color } }
//   getSnapshot() -> { coins:number, owned:Set<string>, equipped:{skin,aura,pet} }
//
// Builds a fixed-position overlay. The left ~40% of the screen is left clear/transparent for the 3D podium
// behind it (pointer-events:none on the root, pointer-events:auto only on the interactive panel + cards +
// buttons + the bottom-left showcase). Styled to match the bright candy/toy aesthetic of hud.js (rounded,
// soft drop shadows, "Baloo 2" font, juicy bouncy motion).

// Bright candy palette (matches hud.js, extended with festive accents for the bunting).
const C = {
  blue: '#2f7bff',
  blueDark: '#1b50c8',
  yellow: '#ffd23f',
  yellowDeep: '#ffb300',
  ink: '#10243f',
  white: '#ffffff',
  green: '#2faa44',
  greenLite: '#5fd06f',
  greenDark: '#1f7a2e',
  // Festive bunting accents — bright, saturated, candy-bright.
  pink: '#ff6bb0',
  mint: '#4be0c0',
  grape: '#b06bff',
  orange: '#ff8a1e',
  sky: '#5bd6ff',
  red: '#ff5a78',
};

// Rotating set of bunting flag colours (alternating bright palette).
const BUNTING = [C.red, C.orange, C.yellow, C.greenLite, C.sky, C.grape, C.pink, C.mint];

const TABS = [
  { key: 'skin', label: 'Skins', icon: '🧢' },
  { key: 'aura', label: 'Auras', icon: '✨' },
  { key: 'pet', label: 'Pets', icon: '🐾' },
];

let styleInjected = false;
function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  styleInjected = true;

  // Pull in "Baloo 2" so the candy aesthetic lands even if the host page didn't load it.
  // Fully degrades to the existing font-family fallbacks if the network/link is unavailable.
  try {
    if (!document.querySelector('link[data-pgl-font]')) {
      const pre1 = document.createElement('link');
      pre1.rel = 'preconnect';
      pre1.href = 'https://fonts.googleapis.com';
      const pre2 = document.createElement('link');
      pre2.rel = 'preconnect';
      pre2.href = 'https://fonts.gstatic.com';
      pre2.crossOrigin = 'anonymous';
      const font = document.createElement('link');
      font.rel = 'stylesheet';
      font.setAttribute('data-pgl-font', '1');
      font.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap';
      document.head.appendChild(pre1);
      document.head.appendChild(pre2);
      document.head.appendChild(font);
    }
  } catch (_) { /* font is purely cosmetic; never fatal */ }

  const css = `
@keyframes pgl-coin-pop { 0% { transform: scale(1); } 35% { transform: scale(1.45) rotate(-14deg); } 70% { transform: scale(0.92) rotate(6deg); } 100% { transform: scale(1) rotate(0); } }
@keyframes pgl-coin-bump { 0% { transform: scale(1); } 45% { transform: scale(1.12); } 100% { transform: scale(1); } }
@keyframes pgl-shake { 0%,100% { transform: translateX(0); } 15% { transform: translateX(-9px); } 30% { transform: translateX(8px); } 45% { transform: translateX(-7px); } 60% { transform: translateX(6px); } 75% { transform: translateX(-4px); } 90% { transform: translateX(3px); } }
@keyframes pgl-tab-in { 0% { transform: scale(0.9) translateY(8px); } 60% { transform: scale(1.06) translateY(-3px); } 100% { transform: scale(1) translateY(0); } }
@keyframes pgl-card-in { 0% { transform: scale(0.78) translateY(16px); opacity: 0; } 70% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
@keyframes pgl-play-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
@keyframes pgl-play-ring { 0% { transform: scale(0.9); opacity: 0.6; } 70% { opacity: 0; } 100% { transform: scale(1.35); opacity: 0; } }
@keyframes pgl-shimmer { 0% { background-position: -180% 0; } 100% { background-position: 180% 0; } }
@keyframes pgl-glow { 0%,100% { box-shadow: 0 6px 0 rgba(16,36,63,0.18), 0 10px 22px rgba(16,36,63,0.22), 0 0 4px var(--pgl-rar, ${C.yellow}); } 50% { box-shadow: 0 6px 0 rgba(16,36,63,0.18), 0 10px 22px rgba(16,36,63,0.22), 0 0 24px var(--pgl-rar, ${C.yellow}); } }
@keyframes pgl-sway { 0% { transform: rotate(-2.2deg) translateY(0); } 50% { transform: rotate(2.2deg) translateY(2px); } 100% { transform: rotate(-2.2deg) translateY(0); } }
@keyframes pgl-flag-bob { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(3px) rotate(1.5deg); } }
@keyframes pgl-show-in { 0% { transform: scale(0.86) translateY(14px); opacity: 0; } 65% { transform: scale(1.04) translateY(-3px); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
@keyframes pgl-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes pgl-sparkle { 0%,100% { transform: scale(0.7) rotate(0deg); opacity: 0.5; } 50% { transform: scale(1.15) rotate(20deg); opacity: 1; } }
@keyframes pgl-emoji-bob { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-7px) rotate(3deg); } }
.pgl-card { transition: transform 0.14s cubic-bezier(0.2,1.7,0.4,1), box-shadow 0.14s ease, filter 0.14s ease; transform-style: preserve-3d; }
.pgl-card.pgl-clickable { cursor: pointer; }
.pgl-card.pgl-clickable:hover { transform: perspective(640px) rotateX(5deg) rotateY(-5deg) scale(1.06) translateY(-5px); box-shadow: 0 14px 0 rgba(16,36,63,0.2), 0 20px 38px rgba(16,36,63,0.34); filter: brightness(1.05); z-index: 3; }
.pgl-card.pgl-clickable:active { transform: scale(0.96); }
.pgl-card .pgl-shine { position: absolute; inset: 0; border-radius: 18px; pointer-events: none; overflow: hidden; opacity: 0; transition: opacity 0.18s ease; }
.pgl-card .pgl-shine::before { content: ''; position: absolute; top: -60%; left: -120%; width: 70%; height: 220%; background: linear-gradient(105deg, transparent, rgba(255,255,255,0.85), transparent); transform: rotate(8deg); }
.pgl-card.pgl-clickable:hover .pgl-shine { opacity: 1; }
.pgl-card.pgl-clickable:hover .pgl-shine::before { transition: left 0.55s ease; left: 150%; }
.pgl-shake { animation: pgl-shake 0.5s ease !important; }
.pgl-btn { transition: filter 0.1s ease, transform 0.06s ease; }
.pgl-btn:hover { filter: brightness(1.08); }
.pgl-btn:active { transform: translateY(2px) scale(0.98); }
.pgl-tab { transition: transform 0.16s cubic-bezier(0.2,1.6,0.4,1), box-shadow 0.16s ease, background 0.16s ease, color 0.16s ease; }
.pgl-tab.pgl-active { animation: pgl-tab-in 0.34s cubic-bezier(0.2,1.6,0.4,1); }
.pgl-grid::-webkit-scrollbar { width: 10px; }
.pgl-grid::-webkit-scrollbar-track { background: rgba(16,36,63,0.08); border-radius: 8px; }
.pgl-grid::-webkit-scrollbar-thumb { background: ${C.blue}; border-radius: 8px; border: 2px solid rgba(255,255,255,0.6); }
.pgl-shimmer-bar { background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%); background-size: 220% 100%; animation: pgl-shimmer 2.6s linear infinite; }
.pgl-show { transition: transform 0.16s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.25s ease; }
.pgl-show-swap { animation: pgl-show-in 0.4s cubic-bezier(0.2,1.6,0.4,1); }
`;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

// Lighten a hex color toward white by amount (0..1). Returns an rgb() string.
function lighten(hex, amount) {
  const h = (hex || '#888888').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const mix = (c) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// Darken a hex color toward black by amount (0..1). Returns an rgb() string.
function darken(hex, amount) {
  const h = (hex || '#888888').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const mix = (c) => Math.round(c * (1 - amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// rgba() string from a hex + alpha (0..1).
function rgba(hex, a) {
  const h = (hex || '#888888').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function createLobbyUI(opts = {}) {
  const {
    catalog = {},
    rarity = {},
    getSnapshot = () => ({ coins: 0, owned: new Set(), equipped: {} }),
    onPreview = () => {},
    onEquip = () => {},
    onBuy = () => {},
    onPlay = () => {},
    onTab = () => {},
  } = opts;

  let activeTab = 'skin';
  // The currently SELECTED item id (drives the bottom-left showcase). Defaults per-tab to the equipped item.
  let selectedId = null;
  let lastCoins = null; // so coin-pop only triggers on an actual change

  // Headless / non-DOM safety: return safe no-op stubs and never build DOM.
  const hasDOM = typeof document !== 'undefined' && !!document.body;
  if (!hasDOM) {
    return {
      refresh() {},
      setActiveTab(category) {
        if (category) activeTab = category;
      },
      flashUnaffordable() {},
      root: null,
      dispose() {},
    };
  }

  injectStyles();

  // Map of itemId -> card element for the currently rendered tab (used by flashUnaffordable + selection highlight).
  const cardEls = new Map();

  const rarityOf = (item) =>
    (item && rarity[item.rarity]) || { name: (item && item.rarity) || 'common', color: '#9aa6b8' };
  const itemsOf = (cat) => (Array.isArray(catalog[cat]) ? catalog[cat] : []);
  const findItem = (cat, id) => itemsOf(cat).find((it) => it.id === id) || null;

  // --- Root overlay (pointer-events:none; clear left area for the 3D podium) ---
  const root = document.createElement('div');
  Object.assign(root.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '1200', // above HUD (1000), below transition overlay (2000)
    pointerEvents: 'none',
    fontFamily: '"Baloo 2", "Trebuchet MS", system-ui, sans-serif',
    userSelect: 'none',
    overflow: 'hidden',
  });

  // ============ FESTIVE BUNTING (garland of triangular flags across the very top) ============
  // Decorative + non-interactive, so it can stretch across the whole top including the clear left area.
  const bunting = document.createElement('div');
  Object.assign(bunting.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '46px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '0 6px',
    pointerEvents: 'none',
    zIndex: '1',
  });
  // The swaying string.
  const buntingString = document.createElement('div');
  Object.assign(buntingString.style, {
    position: 'absolute',
    top: '7px',
    left: '0',
    right: '0',
    height: '4px',
    background: `linear-gradient(90deg, ${rgba(C.ink, 0.18)}, ${rgba(C.ink, 0.32)}, ${rgba(C.ink, 0.18)})`,
    borderRadius: '4px',
    pointerEvents: 'none',
  });
  bunting.appendChild(buntingString);
  const FLAG_COUNT = 22;
  for (let i = 0; i < FLAG_COUNT; i++) {
    const flag = document.createElement('div');
    const col = BUNTING[i % BUNTING.length];
    Object.assign(flag.style, {
      width: '0',
      height: '0',
      flex: '1 1 0',
      maxWidth: '34px',
      borderLeft: '15px solid transparent',
      borderRight: '15px solid transparent',
      borderTop: `26px solid ${col}`,
      filter: `drop-shadow(0 3px 2px ${rgba(C.ink, 0.28)})`,
      transformOrigin: 'top center',
      animation: `pgl-flag-bob 2.6s ease-in-out ${(i % 6) * 0.18}s infinite`,
    });
    bunting.appendChild(flag);
  }
  // Gentle whole-string sway.
  bunting.style.animation = 'pgl-sway 4.5s ease-in-out infinite';
  root.appendChild(bunting);

  // ============ TOP BAR ============
  const topBar = document.createElement('div');
  Object.assign(topBar.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '92px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '34px 26px 0 30px',
    boxSizing: 'border-box',
    zIndex: '2',
  });

  // Game title (left). Sits above the clear podium area but is non-interactive.
  const title = document.createElement('div');
  title.textContent = 'PILL-GUYS';
  Object.assign(title.style, {
    color: C.yellow,
    fontSize: '46px',
    fontWeight: '800',
    letterSpacing: '2px',
    lineHeight: '1',
    textShadow: `0 4px 0 ${C.yellowDeep}, 0 8px 16px rgba(16,36,63,0.4)`,
    WebkitTextStroke: `2px ${C.blueDark}`,
    pointerEvents: 'none',
  });
  topBar.appendChild(title);

  // Coins balance pill (right).
  const coinPill = document.createElement('div');
  Object.assign(coinPill.style, {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 22px 9px 15px',
    background: `linear-gradient(180deg, ${C.white} 0%, #fff6d8 55%, #ffe9a8 100%)`,
    border: `3px solid ${C.yellowDeep}`,
    borderRadius: '22px',
    boxShadow: `0 6px 0 ${rgba(C.yellowDeep, 0.6)}, 0 10px 22px rgba(16,36,63,0.28), inset 0 2px 4px rgba(255,255,255,0.7)`,
    color: C.ink,
    fontWeight: '800',
    fontSize: '30px',
    lineHeight: '1',
  });

  const coinIcon = document.createElement('span');
  coinIcon.textContent = '💰';
  Object.assign(coinIcon.style, {
    fontSize: '30px',
    display: 'inline-block',
    filter: 'drop-shadow(0 2px 0 rgba(16,36,63,0.25))',
  });

  const coinText = document.createElement('span');
  coinText.textContent = '0';
  Object.assign(coinText.style, {
    letterSpacing: '0.5px',
    minWidth: '24px',
    textAlign: 'right',
    textShadow: `0 2px 0 ${rgba(C.white, 0.6)}`,
    display: 'inline-block',
  });

  coinPill.appendChild(coinIcon);
  coinPill.appendChild(coinText);
  topBar.appendChild(coinPill);
  root.appendChild(topBar);

  // ============ BOTTOM-LEFT SHOWCASE (hero "detail" card under the 3D bean) ============
  // Lives in the clear left area; tinted/transparent so it never covers the bean with a solid box.
  const showcase = document.createElement('div');
  showcase.className = 'pgl-show';
  Object.assign(showcase.style, {
    pointerEvents: 'auto',
    position: 'absolute',
    left: '18px',
    bottom: '18px',
    width: '208px',
    maxWidth: '30vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 13px 12px',
    boxSizing: 'border-box',
    borderRadius: '22px',
    border: `3px solid ${C.white}`,
    background: `linear-gradient(180deg, ${rgba(C.white, 0.9)} 0%, ${rgba(C.white, 0.82)} 100%)`,
    boxShadow: '0 10px 0 rgba(16,36,63,0.16), 0 16px 34px rgba(16,36,63,0.32)',
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
  });
  root.appendChild(showcase);

  // ============ RIGHT PANEL (~58% width, right-aligned) ============
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    pointerEvents: 'auto',
    position: 'absolute',
    top: '104px',
    right: '22px',
    bottom: '22px',
    width: '58%',
    maxWidth: '760px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '18px',
    boxSizing: 'border-box',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.93) 0%, rgba(225,236,255,0.93) 100%)',
    border: `4px solid ${C.white}`,
    borderRadius: '28px',
    boxShadow: '0 14px 0 rgba(16,36,63,0.22), 0 22px 50px rgba(16,36,63,0.38)',
  });

  // --- Tabs row ---
  const tabRow = document.createElement('div');
  Object.assign(tabRow.style, {
    display: 'flex',
    gap: '12px',
    flex: '0 0 auto',
  });

  // Each tab knows its button + count-badge element.
  const tabBtns = new Map();
  for (const t of TABS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pgl-btn pgl-tab';
    btn.dataset.tab = t.key;
    Object.assign(btn.style, {
      flex: '1 1 0',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      cursor: 'pointer',
      border: `3px solid ${C.blueDark}`,
      borderRadius: '18px',
      padding: '12px 8px',
      fontFamily: 'inherit',
      fontWeight: '800',
      fontSize: '21px',
      letterSpacing: '0.5px',
    });

    const tIcon = document.createElement('span');
    tIcon.textContent = t.icon;
    tIcon.style.fontSize = '22px';

    const tLabel = document.createElement('span');
    tLabel.textContent = t.label;

    // Owned-count badge (e.g. "2/9").
    const tCount = document.createElement('span');
    Object.assign(tCount.style, {
      fontSize: '13px',
      fontWeight: '800',
      lineHeight: '1',
      padding: '3px 7px',
      borderRadius: '999px',
      background: rgba(C.ink, 0.16),
      color: C.ink,
      minWidth: '14px',
      textAlign: 'center',
    });
    tCount.textContent = '0/0';

    btn.appendChild(tIcon);
    btn.appendChild(tLabel);
    btn.appendChild(tCount);
    btn.addEventListener('click', () => setActiveTab(t.key));
    tabRow.appendChild(btn);
    tabBtns.set(t.key, { btn, count: tCount });
  }
  panel.appendChild(tabRow);

  // --- Scrollable card grid ---
  const grid = document.createElement('div');
  grid.className = 'pgl-grid';
  Object.assign(grid.style, {
    flex: '1 1 auto',
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '14px',
    padding: '6px 8px 6px 2px',
    alignContent: 'start',
  });
  panel.appendChild(grid);

  // --- Play button (bottom-right) — the hero CTA ---
  const playRow = document.createElement('div');
  Object.assign(playRow.style, {
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'flex-end',
  });

  // Wrapper so the pulsing glow ring can sit behind the button.
  const playWrap = document.createElement('div');
  Object.assign(playWrap.style, { position: 'relative', display: 'inline-block' });

  const playRing = document.createElement('div');
  Object.assign(playRing.style, {
    position: 'absolute',
    inset: '-6px',
    borderRadius: '28px',
    border: `4px solid ${C.yellow}`,
    pointerEvents: 'none',
    animation: 'pgl-play-ring 1.8s ease-out infinite',
  });
  playWrap.appendChild(playRing);

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'pgl-btn';
  Object.assign(playBtn.style, {
    position: 'relative',
    cursor: 'pointer',
    border: `4px solid ${C.white}`,
    borderRadius: '24px',
    padding: '16px 56px',
    background: `linear-gradient(180deg, #fff0a8 0%, ${C.yellow} 35%, ${C.yellowDeep} 100%)`,
    color: C.ink,
    fontFamily: 'inherit',
    fontWeight: '800',
    fontSize: '34px',
    letterSpacing: '1px',
    textShadow: `0 2px 0 rgba(255,255,255,0.45)`,
    boxShadow: `0 9px 0 ${rgba(C.yellowDeep, 0.95)}, 0 16px 30px rgba(16,36,63,0.42), inset 0 3px 6px rgba(255,255,255,0.7)`,
    animation: 'pgl-play-pulse 1.8s ease-in-out infinite',
  });

  const playIcon = document.createElement('span');
  playIcon.textContent = '▶';
  playIcon.style.marginRight = '12px';

  const playLabel = document.createElement('span');
  playLabel.textContent = 'PLAY';

  const playSparkle = document.createElement('span');
  playSparkle.textContent = '✨';
  Object.assign(playSparkle.style, {
    position: 'absolute',
    top: '-12px',
    right: '-6px',
    fontSize: '26px',
    pointerEvents: 'none',
    filter: 'drop-shadow(0 2px 2px rgba(16,36,63,0.3))',
    animation: 'pgl-sparkle 1.6s ease-in-out infinite',
  });

  playBtn.appendChild(playIcon);
  playBtn.appendChild(playLabel);
  playBtn.appendChild(playSparkle);
  playBtn.addEventListener('click', () => {
    try { onPlay(); } catch (_) { /* host callback errors are non-fatal */ }
  });
  playWrap.appendChild(playBtn);
  playRow.appendChild(playWrap);
  panel.appendChild(playRow);

  root.appendChild(panel);
  document.body.appendChild(root);

  // ============ Rendering ============

  function renderCoins(coins) {
    const c = coins | 0;
    coinText.textContent = String(c);
    if (lastCoins !== null && c !== lastCoins) {
      // Pop the coin icon + bump the pill on an actual balance change.
      coinIcon.style.animation = 'none';
      coinPill.style.animation = 'none';
      void coinIcon.offsetWidth; // force reflow so the pop can re-trigger
      coinIcon.style.animation = 'pgl-coin-pop 0.5s ease';
      coinPill.style.animation = 'pgl-coin-bump 0.4s ease';
    }
    lastCoins = c;
  }

  function styleTabs(snapshot) {
    for (const t of TABS) {
      const entry = tabBtns.get(t.key);
      const { btn, count } = entry;
      // Owned count = |owned ∩ catalog[tab]|.
      const items = itemsOf(t.key);
      const total = items.length;
      let have = 0;
      if (snapshot.owned && typeof snapshot.owned.has === 'function') {
        for (const it of items) if (snapshot.owned.has(it.id)) have++;
      }
      count.textContent = `${have}/${total}`;

      const on = t.key === activeTab;
      if (on) {
        btn.classList.add('pgl-active');
        Object.assign(btn.style, {
          background: `linear-gradient(180deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
          color: C.white,
          boxShadow: `0 7px 0 ${C.blueDark}, 0 12px 20px rgba(16,36,63,0.4)`,
          transform: 'translateY(-2px)',
        });
        Object.assign(count.style, { background: rgba(C.white, 0.28), color: C.white });
      } else {
        btn.classList.remove('pgl-active');
        Object.assign(btn.style, {
          background: `linear-gradient(180deg, ${C.white} 0%, #dfe9ff 100%)`,
          color: C.blueDark,
          boxShadow: `0 5px 0 rgba(27,80,200,0.28)`,
          transform: 'translateY(0)',
        });
        Object.assign(count.style, { background: rgba(C.blueDark, 0.14), color: C.blueDark });
      }
    }
  }

  function makeStateBadge(text, bg, fg, ring) {
    const b = document.createElement('div');
    b.textContent = text;
    Object.assign(b.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 12px',
      borderRadius: '12px',
      background: bg,
      color: fg,
      border: ring ? `2px solid ${ring}` : 'none',
      fontWeight: '800',
      fontSize: '16px',
      width: '100%',
      boxSizing: 'border-box',
      lineHeight: '1.1',
    });
    return b;
  }

  function makeActionBtn(text, kind) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pgl-btn';
    btn.textContent = text;
    const isBuy = kind === 'buy';
    Object.assign(btn.style, {
      cursor: 'pointer',
      width: '100%',
      boxSizing: 'border-box',
      border: `3px solid ${isBuy ? C.blueDark : C.greenDark}`,
      borderRadius: '12px',
      padding: '9px 10px',
      background: isBuy
        ? `linear-gradient(180deg, ${C.yellow} 0%, ${C.yellowDeep} 100%)`
        : `linear-gradient(180deg, ${C.greenLite} 0%, ${C.green} 100%)`,
      color: isBuy ? C.ink : C.white,
      fontFamily: 'inherit',
      fontWeight: '800',
      fontSize: '17px',
      letterSpacing: '0.3px',
      boxShadow: isBuy ? `0 4px 0 ${rgba(C.yellowDeep, 0.9)}` : `0 4px 0 ${rgba(C.greenDark, 0.9)}`,
    });
    return btn;
  }

  // Resolve display state for an item against the snapshot.
  function stateOf(item, category, snapshot) {
    const owned = snapshot.owned && typeof snapshot.owned.has === 'function' && snapshot.owned.has(item.id);
    const equipped = snapshot.equipped && snapshot.equipped[category] === item.id;
    const affordable = (snapshot.coins | 0) >= (item.price | 0);
    return { owned, equipped, affordable, canBuy: !owned && affordable };
  }

  function buildCard(item, category, snapshot) {
    const rar = rarityOf(item);
    const { owned, equipped, affordable, canBuy } = stateOf(item, category, snapshot);
    const fancy = item.rarity === 'epic' || item.rarity === 'legendary';
    const selected = item.id === selectedId;

    const card = document.createElement('div');
    card.className = 'pgl-card pgl-clickable';
    card.dataset.itemId = item.id;
    card.style.setProperty('--pgl-rar', rar.color);
    Object.assign(card.style, {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 10px 12px',
      boxSizing: 'border-box',
      background: `linear-gradient(180deg, ${C.white} 0%, ${lighten(rar.color, 0.82)} 100%)`,
      border: `4px solid ${rar.color}`,
      borderRadius: '20px',
      opacity: !owned && !affordable ? '0.62' : '1',
      filter: !owned && !affordable ? 'grayscale(0.35)' : 'none',
    });
    applyCardShadow(card, { rar, equipped, selected, fancy });

    // Shine sweep layer (revealed on hover via CSS).
    const shine = document.createElement('div');
    shine.className = 'pgl-shine';
    card.appendChild(shine);

    // Animated glow + shimmer for epic/legendary.
    if (fancy) {
      card.dataset.fancy = '1';
      card.style.animation = 'pgl-glow 2.4s ease-in-out infinite';
      const shimmer = document.createElement('div');
      shimmer.className = 'pgl-shimmer-bar';
      Object.assign(shimmer.style, {
        position: 'absolute',
        inset: '0',
        borderRadius: '16px',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        opacity: '0.7',
      });
      card.appendChild(shimmer);
    }

    // Rarity badge (top-left corner).
    const rarBadge = document.createElement('div');
    rarBadge.textContent = (rar.name || '').toUpperCase();
    Object.assign(rarBadge.style, {
      position: 'absolute',
      top: '8px',
      left: '8px',
      padding: '3px 8px',
      borderRadius: '9px',
      background: rar.color,
      color: C.white,
      fontWeight: '800',
      fontSize: '11px',
      letterSpacing: '0.6px',
      textShadow: '0 1px 1px rgba(16,36,63,0.4)',
      boxShadow: '0 2px 0 rgba(16,36,63,0.2)',
      pointerEvents: 'none',
      zIndex: '2',
    });
    card.appendChild(rarBadge);

    // Equipped ribbon/checkmark (top-right corner).
    if (equipped) {
      const eq = document.createElement('div');
      eq.textContent = '✓';
      Object.assign(eq.style, {
        position: 'absolute',
        top: '6px',
        right: '6px',
        width: '26px',
        height: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: `linear-gradient(180deg, ${C.greenLite} 0%, ${C.green} 100%)`,
        color: C.white,
        fontWeight: '900',
        fontSize: '16px',
        border: `2px solid ${C.white}`,
        boxShadow: '0 2px 0 rgba(16,36,63,0.25)',
        pointerEvents: 'none',
        zIndex: '2',
      });
      card.appendChild(eq);
    }

    // Big emoji icon.
    const icon = document.createElement('div');
    icon.textContent = item.icon || '❔';
    Object.assign(icon.style, {
      fontSize: '54px',
      lineHeight: '1.1',
      marginTop: '14px',
      filter: 'drop-shadow(0 4px 3px rgba(16,36,63,0.3))',
      pointerEvents: 'none',
    });
    card.appendChild(icon);

    // Name.
    const name = document.createElement('div');
    name.textContent = item.name || item.id;
    Object.assign(name.style, {
      color: C.ink,
      fontWeight: '800',
      fontSize: '18px',
      textAlign: 'center',
      lineHeight: '1.1',
      pointerEvents: 'none',
    });
    card.appendChild(name);

    // State row.
    const stateRow = document.createElement('div');
    Object.assign(stateRow.style, {
      width: '100%',
      marginTop: 'auto',
      display: 'flex',
    });

    if (equipped) {
      stateRow.appendChild(
        makeStateBadge('EQUIPPED ✓', `linear-gradient(180deg, ${C.greenLite} 0%, ${C.green} 100%)`, C.white, C.greenDark),
      );
    } else if (owned) {
      const equipBtn = makeActionBtn('Equip', 'equip');
      equipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectItem(item.id); // selecting + equipping share intent
        safe(onEquip, item);
      });
      stateRow.appendChild(equipBtn);
    } else if (canBuy) {
      const buyBtn = makeActionBtn(`💰 ${item.price}`, 'buy');
      buyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectItem(item.id);
        safe(onBuy, item);
      });
      stateRow.appendChild(buyBtn);
    } else {
      // Not owned & can't afford — show dimmed price, disable buying.
      const priceTag = makeStateBadge(`💰 ${item.price}`, rgba(C.ink, 0.12), rgba(C.ink, 0.55), null);
      stateRow.appendChild(priceTag);
    }
    card.appendChild(stateRow);

    // Clicking the card body selects it (and previews). Unaffordable still selects + previews + flashes.
    card.addEventListener('click', () => {
      selectItem(item.id);
      safe(onPreview, item);
      if (!owned && !affordable) flashUnaffordable(item.id);
    });

    if (selected) markSelected(card, rar, true);
    return card;
  }

  // Compose a card's drop-shadow from its equipped/selected/rarity state.
  function applyCardShadow(card, { rar, equipped, selected, fancy }) {
    const base = '0 6px 0 rgba(16,36,63,0.18), 0 10px 22px rgba(16,36,63,0.22)';
    const rings = [];
    if (equipped) rings.push(`0 0 0 4px ${C.white}`, `0 0 0 7px ${C.green}`);
    if (selected) rings.push(`0 0 0 4px ${C.white}`, `0 0 0 8px ${rar.color}`, `0 0 22px ${rgba(rar.color, 0.7)}`);
    // Don't let the static glow fight the animated one on fancy cards.
    card.style.boxShadow = rings.length ? `${base}, ${rings.join(', ')}` : base;
    void fancy;
  }

  // Toggle the "selected" highlight on a card without a full re-render.
  function markSelected(card, rar, on) {
    const itemId = card.dataset.itemId;
    const item = findItem(activeTab, itemId);
    let snap = safeSnap();
    const st = item ? stateOf(item, activeTab, snap) : { equipped: false };
    const fancy = card.dataset.fancy === '1';
    applyCardShadow(card, { rar, equipped: !!st.equipped, selected: on, fancy });
    card.style.zIndex = on ? '3' : '';
  }

  function renderGrid(snapshot) {
    cardEls.clear();
    grid.innerHTML = '';
    const items = itemsOf(activeTab);
    items.forEach((item, i) => {
      const card = buildCard(item, activeTab, snapshot);
      // Staggered bouncy entrance, layered on top of any per-card (fancy glow) animation.
      const entrance = `pgl-card-in 0.36s cubic-bezier(0.2,1.6,0.4,1) ${Math.min(i, 12) * 0.03}s both`;
      card.style.animation = card.style.animation ? `${card.style.animation}, ${entrance}` : entrance;
      cardEls.set(item.id, card);
      grid.appendChild(card);
    });
  }

  // ============ Showcase (bottom-left hero detail card) ============

  // Remember the showcase's Buy button so flashUnaffordable can shake it too.
  let showBuyBtn = null;

  function renderShowcase(snapshot) {
    showBuyBtn = null;
    const item = findItem(activeTab, selectedId) || itemsOf(activeTab)[0] || null;
    showcase.innerHTML = '';
    if (!item) {
      showcase.style.display = 'none';
      return;
    }
    showcase.style.display = 'flex';

    const rar = rarityOf(item);
    const { owned, equipped, affordable, canBuy } = stateOf(item, activeTab, snapshot);
    const fancy = item.rarity === 'epic' || item.rarity === 'legendary';

    // Rarity-tinted background + a glow for epic/legendary.
    showcase.style.background = `linear-gradient(180deg, ${rgba(C.white, 0.92)} 0%, ${rgba(lighten(rar.color, 0.5), 0.92)} 100%)`;
    showcase.style.borderColor = C.white;
    showcase.style.boxShadow = fancy
      ? `0 12px 0 rgba(16,36,63,0.18), 0 18px 40px rgba(16,36,63,0.34), 0 0 30px ${rgba(rar.color, 0.85)}, 0 0 0 4px ${rgba(rar.color, 0.55)}`
      : `0 12px 0 rgba(16,36,63,0.18), 0 18px 40px rgba(16,36,63,0.34), 0 0 0 4px ${rgba(rar.color, 0.45)}`;

    // Bouncy swap animation each time the selection changes.
    showcase.classList.remove('pgl-show-swap');
    void showcase.offsetWidth;
    showcase.classList.add('pgl-show-swap');

    // "SELECTED" eyebrow.
    const eyebrow = document.createElement('div');
    eyebrow.textContent = 'SELECTED';
    Object.assign(eyebrow.style, {
      fontSize: '13px',
      fontWeight: '800',
      letterSpacing: '2px',
      color: rgba(C.ink, 0.55),
      lineHeight: '1',
    });
    showcase.appendChild(eyebrow);

    // Big emoji icon on a rarity-tinted disc.
    const disc = document.createElement('div');
    Object.assign(disc.style, {
      width: '66px',
      height: '66px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `radial-gradient(circle at 50% 38%, ${C.white} 0%, ${lighten(rar.color, 0.55)} 70%, ${lighten(rar.color, 0.3)} 100%)`,
      border: `4px solid ${rar.color}`,
      boxShadow: `0 8px 0 ${rgba(darken(rar.color, 0.25), 0.5)}, 0 10px 22px rgba(16,36,63,0.3), inset 0 3px 8px rgba(255,255,255,0.7)`,
      position: 'relative',
    });
    if (fancy) {
      const ring = document.createElement('div');
      Object.assign(ring.style, {
        position: 'absolute',
        inset: '-7px',
        borderRadius: '50%',
        border: `3px dashed ${rgba(rar.color, 0.8)}`,
        animation: 'pgl-spin 9s linear infinite',
        pointerEvents: 'none',
      });
      disc.appendChild(ring);
    }
    const bigIcon = document.createElement('div');
    bigIcon.textContent = item.icon || '❔';
    Object.assign(bigIcon.style, {
      fontSize: '36px',
      lineHeight: '1',
      filter: 'drop-shadow(0 5px 4px rgba(16,36,63,0.32))',
      animation: 'pgl-emoji-bob 3s ease-in-out infinite',
    });
    disc.appendChild(bigIcon);
    showcase.appendChild(disc);

    // Name.
    const nm = document.createElement('div');
    nm.textContent = item.name || item.id;
    Object.assign(nm.style, {
      color: C.ink,
      fontWeight: '800',
      fontSize: '19px',
      lineHeight: '1.05',
      textAlign: 'center',
      textShadow: `0 2px 0 ${rgba(C.white, 0.7)}`,
    });
    showcase.appendChild(nm);

    // Rarity ribbon/badge coloured via rarity[item.rarity].color.
    const ribbon = document.createElement('div');
    ribbon.textContent = (rar.name || '').toUpperCase();
    Object.assign(ribbon.style, {
      padding: '5px 16px',
      borderRadius: '999px',
      background: `linear-gradient(180deg, ${lighten(rar.color, 0.18)} 0%, ${rar.color} 100%)`,
      color: C.white,
      fontWeight: '800',
      fontSize: '14px',
      letterSpacing: '1.2px',
      border: `2px solid ${C.white}`,
      boxShadow: `0 4px 0 ${rgba(darken(rar.color, 0.3), 0.55)}, 0 6px 12px rgba(16,36,63,0.28)`,
      textShadow: '0 1px 1px rgba(16,36,63,0.4)',
    });
    showcase.appendChild(ribbon);

    // State line (price / OWNED / EQUIPPED ✓).
    const stateLine = document.createElement('div');
    Object.assign(stateLine.style, {
      fontSize: '17px',
      fontWeight: '800',
      lineHeight: '1',
      color: C.ink,
    });
    if (equipped) {
      stateLine.textContent = 'EQUIPPED ✓';
      stateLine.style.color = C.greenDark;
    } else if (owned) {
      stateLine.textContent = 'OWNED';
      stateLine.style.color = rgba(C.ink, 0.7);
    } else {
      stateLine.innerHTML = '';
      const coin = document.createElement('span');
      coin.textContent = '💰 ';
      const price = document.createElement('span');
      price.textContent = String(item.price | 0);
      price.style.color = affordable ? C.ink : '#d23b3b';
      stateLine.appendChild(coin);
      stateLine.appendChild(price);
    }
    showcase.appendChild(stateLine);

    // Primary action button: Equipped (disabled) / Equip / Buy.
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'pgl-btn';
    Object.assign(action.style, {
      cursor: 'pointer',
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: '13px',
      padding: '9px 11px',
      fontFamily: 'inherit',
      fontWeight: '800',
      fontSize: '16px',
      letterSpacing: '0.5px',
      marginTop: '2px',
    });

    if (equipped) {
      action.textContent = 'EQUIPPED ✓';
      action.disabled = true;
      Object.assign(action.style, {
        cursor: 'default',
        border: `3px solid ${C.greenDark}`,
        background: `linear-gradient(180deg, ${C.greenLite} 0%, ${C.green} 100%)`,
        color: C.white,
        boxShadow: `0 5px 0 ${rgba(C.greenDark, 0.9)}`,
        opacity: '0.9',
      });
    } else if (owned) {
      action.textContent = 'EQUIP';
      Object.assign(action.style, {
        border: `3px solid ${C.greenDark}`,
        background: `linear-gradient(180deg, ${C.greenLite} 0%, ${C.green} 100%)`,
        color: C.white,
        boxShadow: `0 5px 0 ${rgba(C.greenDark, 0.9)}`,
      });
      action.addEventListener('click', () => safe(onEquip, item));
    } else {
      action.textContent = `💰 ${item.price | 0}`;
      const affordableNow = canBuy;
      Object.assign(action.style, {
        border: `3px solid ${C.blueDark}`,
        background: affordableNow
          ? `linear-gradient(180deg, ${C.yellow} 0%, ${C.yellowDeep} 100%)`
          : `linear-gradient(180deg, #e9eef6 0%, #cfd8e6 100%)`,
        color: affordableNow ? C.ink : rgba(C.ink, 0.6),
        boxShadow: affordableNow ? `0 5px 0 ${rgba(C.yellowDeep, 0.9)}` : `0 5px 0 ${rgba(C.ink, 0.18)}`,
      });
      action.addEventListener('click', () => safe(onBuy, item));
      showBuyBtn = action; // so flashUnaffordable can shake it
    }
    showcase.appendChild(action);
  }

  // ============ Selection ============

  // Select an item by id: highlight its card (cheaply, no full re-render) and swap the showcase.
  function selectItem(id) {
    if (!id || id === selectedId) return;
    const prev = selectedId;
    selectedId = id;
    // Un-highlight the previous card, highlight the new one.
    if (prev && cardEls.has(prev)) {
      const pc = cardEls.get(prev);
      markSelected(pc, rarityOf(findItem(activeTab, prev)), false);
    }
    if (cardEls.has(id)) {
      const nc = cardEls.get(id);
      markSelected(nc, rarityOf(findItem(activeTab, id)), true);
    }
    renderShowcase(safeSnap());
  }

  // Default selection for a tab = its equipped item (fallback: first item).
  function defaultSelectionFor(category, snapshot) {
    const eq = snapshot.equipped && snapshot.equipped[category];
    if (eq && findItem(category, eq)) return eq;
    const first = itemsOf(category)[0];
    return first ? first.id : null;
  }

  // ============ helpers ============

  function safe(fn, arg) {
    try { fn(arg); } catch (_) { /* host callback errors are non-fatal */ }
  }

  function safeSnap() {
    let snap;
    try {
      snap = getSnapshot() || {};
    } catch (_) {
      snap = {};
    }
    if (!snap.owned || typeof snap.owned.has !== 'function') snap.owned = new Set();
    if (!snap.equipped) snap.equipped = {};
    if (typeof snap.coins !== 'number') snap.coins = snap.coins | 0;
    return snap;
  }

  // ============ Public API ============

  function refresh() {
    const snap = safeSnap();
    // Ensure a valid selection for the active tab before rendering anything that depends on it.
    if (!selectedId || !findItem(activeTab, selectedId)) {
      selectedId = defaultSelectionFor(activeTab, snap);
    }
    renderCoins(snap.coins | 0);
    styleTabs(snap);
    renderGrid(snap);
    renderShowcase(snap);
  }

  function setActiveTab(category) {
    if (!category || category === activeTab) return; // idempotent: only act on a real change
    if (!TABS.some((t) => t.key === category)) return;
    activeTab = category;
    // Reset selection to this tab's equipped item.
    selectedId = defaultSelectionFor(category, safeSnap());
    refresh();
    safe(onTab, category);
  }

  function flashUnaffordable(itemId) {
    const card = cardEls.get(itemId);
    if (card) {
      card.classList.remove('pgl-shake');
      void card.offsetWidth; // reflow to re-trigger
      card.classList.add('pgl-shake');
      const prevBorder = card.style.borderColor;
      card.style.borderColor = '#ff4040';
      setTimeout(() => {
        card.style.borderColor = prevBorder;
      }, 500);
    }
    // If it's the selected item, shake the showcase's Buy button too.
    if (itemId === selectedId && showBuyBtn) {
      showBuyBtn.classList.remove('pgl-shake');
      void showBuyBtn.offsetWidth;
      showBuyBtn.classList.add('pgl-shake');
    }
  }

  function dispose() {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    cardEls.clear();
    showBuyBtn = null;
  }

  // Initial paint.
  refresh();

  return {
    refresh,
    setActiveTab,
    flashUnaffordable,
    root,
    dispose,
  };
}
