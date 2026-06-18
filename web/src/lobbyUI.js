// Lobby UI — DOM overlay for the customization LOBBY. Owned by the LOBBY-UI agent (this agent owns lobbyUI.js).
//
// export function createLobbyUI(opts) -> {
//   refresh(),                  // re-read state via opts.getSnapshot() and re-render coins + active tab's cards
//   setActiveTab(category),     // 'skin' | 'aura' | 'pet'
//   flashUnaffordable(itemId),  // brief shake/red flash on a card the player can't afford
//   root,                       // the overlay element (or null in headless)
//   dispose(),
// }
//
// opts = { catalog, rarity, getSnapshot, onPreview, onEquip, onBuy, onPlay, onTab }
//
// Builds a fixed-position overlay. The left ~40% of the screen is left clear/transparent for the 3D podium
// behind it (pointer-events:none on the root, pointer-events:auto only on the interactive panel + cards +
// buttons). Styled to match the bright toy aesthetic of hud.js (rounded, soft shadow, blue/yellow palette).

// Bright toy palette (matches hud.js).
const C = {
  blue: '#2f7bff',
  blueDark: '#1b50c8',
  yellow: '#ffd23f',
  yellowDeep: '#ffb300',
  ink: '#10243f',
  white: '#ffffff',
};

const TABS = [
  { key: 'skin', label: 'Skins', icon: '🧢' },
  { key: 'aura', label: 'Auras', icon: '✨' },
  { key: 'pet', label: 'Pets', icon: '🐾' },
];

let styleInjected = false;
function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  styleInjected = true;
  const css = `
@keyframes pgl-coin-pop { 0% { transform: scale(1); } 40% { transform: scale(1.4) rotate(-12deg); } 100% { transform: scale(1) rotate(0); } }
@keyframes pgl-shake { 0%,100% { transform: translateX(0); } 15% { transform: translateX(-9px); } 30% { transform: translateX(8px); } 45% { transform: translateX(-7px); } 60% { transform: translateX(6px); } 75% { transform: translateX(-4px); } 90% { transform: translateX(3px); } }
@keyframes pgl-tab-in { 0% { transform: scale(0.9) translateY(8px); opacity: 0; } 60% { transform: scale(1.04) translateY(-2px); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
@keyframes pgl-card-in { 0% { transform: scale(0.8) translateY(14px); opacity: 0; } 70% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
@keyframes pgl-play-pulse { 0%,100% { transform: scale(1); box-shadow: 0 8px 0 rgba(204,140,0,0.9), 0 14px 26px rgba(16,36,63,0.4); } 50% { transform: scale(1.045); box-shadow: 0 11px 0 rgba(204,140,0,0.9), 0 20px 34px rgba(16,36,63,0.45); } }
@keyframes pgl-shimmer { 0% { background-position: -180% 0; } 100% { background-position: 180% 0; } }
@keyframes pgl-glow { 0%,100% { box-shadow: 0 6px 0 rgba(16,36,63,0.18), 0 10px 22px rgba(16,36,63,0.22), 0 0 0px var(--pgl-rar, ${C.yellow}); } 50% { box-shadow: 0 6px 0 rgba(16,36,63,0.18), 0 10px 22px rgba(16,36,63,0.22), 0 0 22px var(--pgl-rar, ${C.yellow}); } }
.pgl-card { transition: transform 0.12s cubic-bezier(0.2,1.6,0.4,1), box-shadow 0.12s ease, filter 0.12s ease; }
.pgl-card.pgl-buyable { cursor: pointer; }
.pgl-card.pgl-buyable:hover { transform: scale(1.05) translateY(-4px); box-shadow: 0 12px 0 rgba(16,36,63,0.2), 0 18px 34px rgba(16,36,63,0.32); filter: brightness(1.04); z-index: 2; }
.pgl-card.pgl-buyable:active { transform: scale(0.97); }
.pgl-shake { animation: pgl-shake 0.5s ease; }
.pgl-btn { transition: filter 0.1s ease, transform 0.06s ease; }
.pgl-btn:hover { filter: brightness(1.07); }
.pgl-btn:active { transform: translateY(2px); }
.pgl-tab.pgl-active { animation: pgl-tab-in 0.32s cubic-bezier(0.2,1.5,0.4,1); }
.pgl-grid::-webkit-scrollbar { width: 10px; }
.pgl-grid::-webkit-scrollbar-track { background: rgba(16,36,63,0.08); border-radius: 8px; }
.pgl-grid::-webkit-scrollbar-thumb { background: ${C.blue}; border-radius: 8px; border: 2px solid rgba(255,255,255,0.6); }
.pgl-shimmer-bar { background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%); background-size: 220% 100%; animation: pgl-shimmer 2.6s linear infinite; }
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

  // Map of itemId -> card element for the currently rendered tab (used by flashUnaffordable).
  const cardEls = new Map();

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

  // ============ TOP BAR ============
  const topBar = document.createElement('div');
  Object.assign(topBar.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '84px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 26px 0 30px',
    boxSizing: 'border-box',
  });

  // Game title (left). Sits above the clear podium area but is non-interactive.
  const title = document.createElement('div');
  title.textContent = 'PILL-GUYS';
  Object.assign(title.style, {
    color: C.yellow,
    fontSize: '46px',
    fontWeight: '900',
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
    padding: '9px 20px 9px 14px',
    background: `linear-gradient(180deg, ${C.white} 0%, #eaf1ff 100%)`,
    border: `3px solid ${C.blue}`,
    borderRadius: '20px',
    boxShadow: '0 6px 0 rgba(27,80,200,0.35), 0 10px 22px rgba(16,36,63,0.28)',
    color: C.ink,
    fontWeight: '800',
    fontSize: '28px',
    lineHeight: '1',
  });

  const coinIcon = document.createElement('span');
  coinIcon.textContent = '💰';
  Object.assign(coinIcon.style, {
    fontSize: '28px',
    display: 'inline-block',
    filter: 'drop-shadow(0 2px 0 rgba(16,36,63,0.25))',
  });

  const coinText = document.createElement('span');
  coinText.textContent = '0';
  Object.assign(coinText.style, { letterSpacing: '0.5px', minWidth: '22px', textAlign: 'right' });

  coinPill.appendChild(coinIcon);
  coinPill.appendChild(coinText);
  topBar.appendChild(coinPill);
  root.appendChild(topBar);

  // ============ RIGHT PANEL (~58% width, right-aligned) ============
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    pointerEvents: 'auto',
    position: 'absolute',
    top: '96px',
    right: '22px',
    bottom: '22px',
    width: '58%',
    maxWidth: '760px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '18px',
    boxSizing: 'border-box',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(225,236,255,0.92) 100%)',
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

  const tabBtns = new Map();
  for (const t of TABS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pgl-btn pgl-tab';
    btn.dataset.tab = t.key;
    btn.innerHTML = `<span style="font-size:22px">${t.icon}</span> ${t.label}`;
    Object.assign(btn.style, {
      flex: '1 1 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      cursor: 'pointer',
      border: `3px solid ${C.blueDark}`,
      borderRadius: '18px',
      padding: '12px 8px',
      fontFamily: 'inherit',
      fontWeight: '900',
      fontSize: '21px',
      letterSpacing: '0.5px',
    });
    btn.addEventListener('click', () => setActiveTab(t.key));
    tabRow.appendChild(btn);
    tabBtns.set(t.key, btn);
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

  // --- Play button (bottom-right) ---
  const playRow = document.createElement('div');
  Object.assign(playRow.style, {
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'flex-end',
  });

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'pgl-btn';
  playBtn.textContent = '▶ PLAY';
  Object.assign(playBtn.style, {
    cursor: 'pointer',
    border: `4px solid ${C.white}`,
    borderRadius: '22px',
    padding: '16px 56px',
    background: `linear-gradient(180deg, ${C.yellow} 0%, ${C.yellowDeep} 100%)`,
    color: C.ink,
    fontFamily: 'inherit',
    fontWeight: '900',
    fontSize: '34px',
    letterSpacing: '1px',
    textShadow: `0 2px 0 rgba(255,255,255,0.4)`,
    animation: 'pgl-play-pulse 1.8s ease-in-out infinite',
  });
  playBtn.addEventListener('click', () => onPlay());
  playRow.appendChild(playBtn);
  panel.appendChild(playRow);

  root.appendChild(panel);
  document.body.appendChild(root);

  // ============ Rendering ============

  function renderCoins(coins) {
    coinText.textContent = String(coins | 0);
    coinIcon.style.animation = 'none';
    void coinIcon.offsetWidth; // force reflow so the pop can re-trigger
    coinIcon.style.animation = 'pgl-coin-pop 0.4s ease';
  }

  function styleTabs() {
    for (const t of TABS) {
      const btn = tabBtns.get(t.key);
      const on = t.key === activeTab;
      if (on) {
        btn.classList.add('pgl-active');
        Object.assign(btn.style, {
          background: `linear-gradient(180deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
          color: C.white,
          boxShadow: `0 6px 0 ${C.blueDark}, 0 10px 18px rgba(16,36,63,0.35)`,
          transform: 'translateY(0)',
        });
      } else {
        btn.classList.remove('pgl-active');
        Object.assign(btn.style, {
          background: `linear-gradient(180deg, ${C.white} 0%, #dfe9ff 100%)`,
          color: C.blueDark,
          boxShadow: `0 5px 0 rgba(27,80,200,0.28)`,
          transform: 'translateY(0)',
        });
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
      fontWeight: '900',
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
      border: `3px solid ${isBuy ? C.blueDark : '#1f7a2e'}`,
      borderRadius: '12px',
      padding: '9px 10px',
      background: isBuy
        ? `linear-gradient(180deg, ${C.yellow} 0%, ${C.yellowDeep} 100%)`
        : 'linear-gradient(180deg, #5fd06f 0%, #2faa44 100%)',
      color: isBuy ? C.ink : C.white,
      fontFamily: 'inherit',
      fontWeight: '900',
      fontSize: '17px',
      letterSpacing: '0.3px',
      boxShadow: isBuy ? '0 4px 0 rgba(204,140,0,0.9)' : '0 4px 0 rgba(20,110,40,0.9)',
    });
    return btn;
  }

  function buildCard(item, category, snapshot) {
    const rar = rarity[item.rarity] || { name: item.rarity || 'common', color: '#9aa6b8' };
    const owned = snapshot.owned && typeof snapshot.owned.has === 'function' && snapshot.owned.has(item.id);
    const equipped = snapshot.equipped && snapshot.equipped[category] === item.id;
    const affordable = (snapshot.coins | 0) >= (item.price | 0);
    const canBuy = !owned && affordable;
    const fancy = item.rarity === 'epic' || item.rarity === 'legendary';

    const card = document.createElement('div');
    card.className = 'pgl-card';
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
      boxShadow: equipped
        ? `0 6px 0 rgba(16,36,63,0.18), 0 10px 22px rgba(16,36,63,0.22), 0 0 0 4px ${C.white}, 0 0 0 7px #2faa44`
        : '0 6px 0 rgba(16,36,63,0.18), 0 10px 22px rgba(16,36,63,0.22)',
      opacity: !owned && !affordable ? '0.62' : '1',
      filter: !owned && !affordable ? 'grayscale(0.35)' : 'none',
    });

    // Animated glow + shimmer for epic/legendary.
    if (fancy) {
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
      fontWeight: '900',
      fontSize: '11px',
      letterSpacing: '0.6px',
      textShadow: '0 1px 1px rgba(16,36,63,0.4)',
      boxShadow: '0 2px 0 rgba(16,36,63,0.2)',
      pointerEvents: 'none',
    });
    card.appendChild(rarBadge);

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
      fontWeight: '900',
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
      stateRow.appendChild(makeStateBadge('EQUIPPED ✓', 'linear-gradient(180deg, #5fd06f 0%, #2faa44 100%)', C.white, '#1f7a2e'));
    } else if (owned) {
      const equipBtn = makeActionBtn('Equip', 'equip');
      equipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onEquip(item);
      });
      stateRow.appendChild(equipBtn);
    } else if (canBuy) {
      card.classList.add('pgl-buyable');
      const buyBtn = makeActionBtn(`💰 ${item.price}`, 'buy');
      buyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onBuy(item);
      });
      stateRow.appendChild(buyBtn);
    } else {
      // Not owned & can't afford — show dimmed price, disable buying.
      const priceTag = makeStateBadge(`💰 ${item.price}`, 'rgba(16,36,63,0.12)', 'rgba(16,36,63,0.55)', null);
      stateRow.appendChild(priceTag);
    }
    card.appendChild(stateRow);

    // Clicking the card body (not its action button) previews; if unaffordable, flash.
    card.addEventListener('click', () => {
      if (!owned && !affordable) {
        flashUnaffordable(item.id);
        return;
      }
      onPreview(item);
    });

    return card;
  }

  function renderGrid(snapshot) {
    cardEls.clear();
    grid.innerHTML = '';
    const items = Array.isArray(catalog[activeTab]) ? catalog[activeTab] : [];
    items.forEach((item, i) => {
      const card = buildCard(item, activeTab, snapshot);
      // Staggered bouncy entrance.
      card.style.animation = `${card.style.animation ? card.style.animation + ', ' : ''}pgl-card-in 0.34s cubic-bezier(0.2,1.5,0.4,1) ${Math.min(i, 12) * 0.03}s both`;
      cardEls.set(item.id, card);
      grid.appendChild(card);
    });
  }

  // ============ Public API ============

  function refresh() {
    let snap;
    try {
      snap = getSnapshot() || {};
    } catch (_) {
      snap = {};
    }
    if (!snap.owned || typeof snap.owned.has !== 'function') snap.owned = new Set();
    if (!snap.equipped) snap.equipped = {};
    renderCoins(snap.coins | 0);
    styleTabs();
    renderGrid(snap);
  }

  function setActiveTab(category) {
    if (!category || category === activeTab) return; // idempotent: only act on a real change
    if (!TABS.some((t) => t.key === category)) return;
    activeTab = category;
    refresh();
    try {
      onTab(category);
    } catch (_) {
      /* host callback errors are non-fatal */
    }
  }

  function flashUnaffordable(itemId) {
    const card = cardEls.get(itemId);
    if (!card) return;
    card.classList.remove('pgl-shake');
    void card.offsetWidth; // reflow to re-trigger
    card.classList.add('pgl-shake');
    const prevBorder = card.style.borderColor;
    card.style.borderColor = '#ff4040';
    setTimeout(() => {
      card.style.borderColor = prevBorder;
    }, 500);
  }

  function dispose() {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    cardEls.clear();
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
