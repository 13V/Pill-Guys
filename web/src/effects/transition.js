// LEVEL TRANSITION — fullscreen fade overlay for boot + between-level swaps. Owned by the TRANSITION agent.
//
// export function createTransition(opts = {}) -> {
//   fadeIn(durationMs = 450),            // fade the cover OUT (reveal the game): opaque -> transparent
//   fadeOut(durationMs = 450, onDone),   // fade the cover IN (hide the game): transparent -> opaque, then onDone()
//   cover(),                             // instantly fully opaque (no animation)
//   el,                                  // the overlay element (or null in headless)
// }
// A fixed, full-viewport <div> sitting ABOVE the HUD (z-index 2000 vs HUD's 1000), pointer-events:none,
// painted with a soft Fall-Guys sky gradient. It STARTS fully opaque so the very first fadeIn() reveals
// the scene smoothly on boot. Animation is a plain CSS opacity transition (wall-clock), so there's no
// per-frame update() — just set opacity and let the browser do the work.

// Soft Fall-Guys sky tone — a gentle vertical gradient.
const COVER = 'linear-gradient(180deg, #cfe6ff 0%, #eaf2ff 100%)';

const DEFAULT_MS = 450;

let styleInjected = false;
function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  styleInjected = true;
  const css = `
.pg-transition {
  position: fixed;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
  opacity: 1;
  background: ${COVER};
  will-change: opacity;
}
`;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

export function createTransition(opts = {}) {
  void opts; // reserved for future tuning (custom cover color, etc.)

  // Headless / non-DOM safety: no overlay, but fadeOut MUST still drive onDone so
  // game logic that waits for the cover before reloading still proceeds in tests.
  const hasDOM = typeof document !== 'undefined' && !!document.body;

  if (!hasDOM) {
    return {
      fadeIn() {},
      fadeOut(durationMs = DEFAULT_MS, onDone) {
        void durationMs;
        if (typeof onDone === 'function') setTimeout(onDone, 0);
      },
      cover() {},
      el: null,
    };
  }

  injectStyles();

  const el = document.createElement('div');
  el.className = 'pg-transition';
  // Inline opacity/transition so each call can set its own duration dynamically.
  el.style.opacity = '1'; // start fully opaque so boot fadeIn() reveals the scene
  el.style.transition = `opacity ${DEFAULT_MS}ms ease`;
  document.body.appendChild(el);

  function setDuration(ms) {
    const d = ms >= 0 ? ms : DEFAULT_MS;
    el.style.transition = `opacity ${d}ms ease`;
  }

  return {
    // Reveal the game: opaque -> transparent.
    fadeIn(durationMs = DEFAULT_MS) {
      setDuration(durationMs);
      // Force a reflow so a fresh duration + the opacity change reliably animate.
      void el.offsetWidth;
      el.style.opacity = '0';
    },
    // Hide the game: transparent -> opaque, then onDone() once fully covered.
    fadeOut(durationMs = DEFAULT_MS, onDone) {
      const d = durationMs >= 0 ? durationMs : DEFAULT_MS;
      setDuration(d);
      void el.offsetWidth;
      el.style.opacity = '1';
      if (typeof onDone === 'function') setTimeout(onDone, d);
    },
    // Instantly fully opaque, no animation.
    cover() {
      el.style.transition = 'none';
      el.style.opacity = '1';
      void el.offsetWidth; // commit before any later transition is re-applied
    },
    el,
  };
}
