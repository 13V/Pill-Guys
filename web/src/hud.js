// HUD — DOM overlay. Owned by the INTERACTIONS+HUD agent (this agent owns hud.js AND interactions.js).
//
// export function createHUD(totalCoins) -> {
//   addCoin(),                 // increment collected count
//   setCoins(n, total),
//   flashDeath(),              // brief red vignette / "Ouch!" on death+respawn
//   win(),                     // show a celebratory "Finish!" banner with a Restart button
//   reset(),                   // back to playing state, zero coins
//   onRestart(cb),             // register restart-button / R-key callback
//   get coins(),
// }
// Build fixed-position DOM elements (pointer-events:none except the restart button). Style it to match the
// bright toy aesthetic (rounded, soft shadow, the blue/yellow palette). Keep it lightweight.

// Bright toy palette.
const C = {
  blue: '#2f7bff',
  blueDark: '#1b50c8',
  yellow: '#ffd23f',
  yellowDeep: '#ffb300',
  ink: '#10243f',
  white: '#ffffff',
};

let styleInjected = false;
function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  styleInjected = true;
  const css = `
@keyframes pg-pop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
@keyframes pg-flash { 0% { opacity: 0; } 12% { opacity: 0.6; } 100% { opacity: 0; } }
@keyframes pg-banner-in { 0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
  60% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } }
@keyframes pg-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.pg-btn:hover { filter: brightness(1.06); }
.pg-btn:active { transform: translateY(2px); }
`;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

export function createHUD(totalCoins = 0) {
  let coins = 0;
  let total = totalCoins || 0;
  let won = false;
  let restartCb = null;

  // Headless / non-DOM safety: still expose a working state machine.
  const hasDOM = typeof document !== 'undefined' && !!document.body;

  let root, counterEl, counterStar, counterText, flashEl, bannerWrap, bannerText, restartBtn;

  if (hasDOM) {
    injectStyles();

    root = document.createElement('div');
    Object.assign(root.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '1000',
      pointerEvents: 'none',
      fontFamily: '"Baloo 2", "Trebuchet MS", system-ui, sans-serif',
      userSelect: 'none',
      overflow: 'hidden',
    });

    // --- Coin counter (top-left) ---
    counterEl = document.createElement('div');
    Object.assign(counterEl.style, {
      position: 'absolute',
      top: '16px',
      left: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px 8px 12px',
      background: `linear-gradient(180deg, ${C.white} 0%, #eaf1ff 100%)`,
      border: `3px solid ${C.blue}`,
      borderRadius: '18px',
      boxShadow: '0 6px 0 rgba(27,80,200,0.35), 0 10px 22px rgba(16,36,63,0.28)',
      color: C.ink,
      fontWeight: '800',
      fontSize: '24px',
      lineHeight: '1',
    });

    counterStar = document.createElement('span');
    counterStar.textContent = '★';
    Object.assign(counterStar.style, {
      color: C.yellowDeep,
      fontSize: '26px',
      textShadow: `0 2px 0 ${C.yellow}`,
      display: 'inline-block',
    });

    counterText = document.createElement('span');
    Object.assign(counterText.style, { letterSpacing: '0.5px' });

    counterEl.appendChild(counterStar);
    counterEl.appendChild(counterText);
    root.appendChild(counterEl);

    // --- Death flash overlay (red vignette) ---
    flashEl = document.createElement('div');
    Object.assign(flashEl.style, {
      position: 'absolute',
      inset: '0',
      pointerEvents: 'none',
      opacity: '0',
      background:
        'radial-gradient(ellipse at center, rgba(255,40,40,0) 35%, rgba(220,20,30,0.85) 100%)',
    });
    root.appendChild(flashEl);

    // --- Win banner (centered) ---
    bannerWrap = document.createElement('div');
    Object.assign(bannerWrap.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'none',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '22px',
      padding: '40px 64px',
      background: `linear-gradient(180deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
      border: `6px solid ${C.white}`,
      borderRadius: '32px',
      boxShadow: '0 14px 0 rgba(16,36,63,0.4), 0 26px 60px rgba(16,36,63,0.5)',
      textAlign: 'center',
      pointerEvents: 'none',
    });

    bannerText = document.createElement('div');
    bannerText.textContent = 'FINISH!';
    Object.assign(bannerText.style, {
      color: C.yellow,
      fontSize: '64px',
      fontWeight: '900',
      letterSpacing: '2px',
      textShadow: `0 4px 0 ${C.yellowDeep}, 0 8px 16px rgba(0,0,0,0.35)`,
      WebkitTextStroke: `2px ${C.blueDark}`,
      animation: 'pg-bob 1.6s ease-in-out infinite',
    });

    restartBtn = document.createElement('button');
    restartBtn.type = 'button';
    restartBtn.textContent = '↻ Restart';
    restartBtn.className = 'pg-btn';
    Object.assign(restartBtn.style, {
      pointerEvents: 'auto',
      cursor: 'pointer',
      border: `3px solid ${C.blueDark}`,
      borderRadius: '16px',
      padding: '14px 34px',
      background: `linear-gradient(180deg, ${C.yellow} 0%, ${C.yellowDeep} 100%)`,
      color: C.ink,
      fontFamily: 'inherit',
      fontWeight: '900',
      fontSize: '26px',
      letterSpacing: '0.5px',
      boxShadow: '0 6px 0 rgba(204,140,0,0.9), 0 10px 20px rgba(16,36,63,0.35)',
      transition: 'filter 0.1s ease, transform 0.05s ease',
    });
    restartBtn.addEventListener('click', () => {
      if (restartCb) restartCb();
    });

    bannerWrap.appendChild(bannerText);
    bannerWrap.appendChild(restartBtn);
    root.appendChild(bannerWrap);

    document.body.appendChild(root);
  }

  function renderCounter() {
    if (!hasDOM) return;
    counterText.textContent = `${coins}/${total}`;
    // Pop the star each time the count visibly changes.
    counterStar.style.animation = 'none';
    // Force reflow so the animation can re-trigger.
    void counterStar.offsetWidth;
    counterStar.style.animation = 'pg-pop 0.35s ease';
  }

  function showBanner() {
    if (!hasDOM) return;
    bannerWrap.style.display = 'flex';
    bannerWrap.style.animation = 'none';
    void bannerWrap.offsetWidth;
    bannerWrap.style.animation = 'pg-banner-in 0.5s cubic-bezier(0.2, 1.4, 0.4, 1)';
  }

  function hideBanner() {
    if (!hasDOM) return;
    bannerWrap.style.display = 'none';
  }

  if (hasDOM) renderCounter();

  return {
    addCoin() {
      coins++;
      renderCounter();
    },
    setCoins(n, t) {
      coins = n | 0;
      if (typeof t === 'number') total = t;
      renderCounter();
    },
    flashDeath() {
      if (!hasDOM) return;
      flashEl.style.animation = 'none';
      void flashEl.offsetWidth;
      flashEl.style.animation = 'pg-flash 0.5s ease';
    },
    win() {
      won = true;
      showBanner();
    },
    reset() {
      coins = 0;
      won = false;
      hideBanner();
      renderCounter();
    },
    onRestart(cb) {
      restartCb = cb;
    },
    get coins() {
      return coins;
    },
    get won() {
      return won;
    },
  };
}
