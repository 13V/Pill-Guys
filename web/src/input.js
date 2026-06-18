// INPUT — keyboard (+ optional touch). Owned by the INPUT agent.
//
// export function createInput() -> {
//   axisX(): number   // -1..1  (A/Left = -1, D/Right = +1)
//   axisZ(): number   // -1..1  (W/Up = -1 i.e. "forward", S/Down = +1)
//   jumpHeld(): boolean
//   consumeJump(): boolean   // true exactly once per keypress (edge-triggered), then clears
//   restartPressed(): boolean // edge-triggered (R / Enter)
//   dispose()
// }
//
// Implementation notes for the agent: track held keys in a Set on keydown/keyup;
// latch a "jumpQueued" flag on jump keydown that consumeJump() clears so presses
// between frames aren't missed. Support WASD + arrow keys; jump = Space/W/Up.
export function createInput() {
  // Normalized key identifiers we care about.
  const LEFT = new Set(['a', 'arrowleft']);
  const RIGHT = new Set(['d', 'arrowright']);
  const FORWARD = new Set(['w', 'arrowup']); // -Z, "forward"
  const BACK = new Set(['s', 'arrowdown']); //  +Z
  const JUMP = new Set([' ', 'spacebar', 'space', 'w', 'arrowup']); // Space + forward keys
  const RESTART = new Set(['r', 'enter']);
  // Keys whose default browser behaviour (scrolling) we want to suppress.
  const PREVENT = new Set([
    'arrowleft',
    'arrowright',
    'arrowup',
    'arrowdown',
    ' ',
    'spacebar',
    'space',
  ]);

  // Set of currently-held normalized keys.
  const held = new Set();
  // Latched edge flags. Set on keydown, cleared by the matching consume*.
  let jumpQueued = false;
  let restartQueued = false;

  // Normalize a KeyboardEvent to a lowercase identifier. `event.key` gives us
  // ' ' for Space in modern browsers and 'Spacebar' in older ones; we cover both.
  function norm(e) {
    return (e.key || '').toLowerCase();
  }

  function anyHeld(set) {
    for (const k of set) if (held.has(k)) return true;
    return false;
  }

  function onKeyDown(e) {
    const k = norm(e);
    if (PREVENT.has(k)) e.preventDefault();
    // Ignore the auto-repeat stream so the jump/restart latches reflect real presses.
    if (e.repeat) return;
    held.add(k);
    if (JUMP.has(k)) jumpQueued = true;
    if (RESTART.has(k)) restartQueued = true;
  }

  function onKeyUp(e) {
    const k = norm(e);
    if (PREVENT.has(k)) e.preventDefault();
    held.delete(k);
  }

  // If the window loses focus we may miss keyup events; clear held state so the
  // character doesn't "stick" running into a wall after alt-tab etc.
  function onBlur() {
    held.clear();
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);

  // --- Optional on-screen touch controls (only created for touch-capable UAs).
  let touchRoot = null;
  function setupTouch() {
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0));
    if (!isTouch || typeof document === 'undefined' || !document.body) return;

    touchRoot = document.createElement('div');
    touchRoot.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:9999;user-select:none;-webkit-user-select:none;touch-action:none;';

    const mkBtn = (label, css) => {
      const b = document.createElement('div');
      b.textContent = label;
      b.style.cssText =
        'position:fixed;pointer-events:auto;display:flex;align-items:center;justify-content:center;' +
        'width:64px;height:64px;border-radius:50%;background:rgba(40,48,60,0.35);color:#fff;' +
        'font:24px/1 system-ui,sans-serif;border:2px solid rgba(255,255,255,0.4);bottom:24px;' +
        css;
      return b;
    };

    // Map a touch button to a synthetic held-key + (for jump) the latch.
    const bind = (el, key, isJump) => {
      const press = (ev) => {
        ev.preventDefault();
        held.add(key);
        if (isJump) jumpQueued = true;
      };
      const release = (ev) => {
        ev.preventDefault();
        held.delete(key);
      };
      el.addEventListener('touchstart', press, { passive: false });
      el.addEventListener('touchend', release, { passive: false });
      el.addEventListener('touchcancel', release, { passive: false });
      touchRoot.appendChild(el);
    };

    bind(mkBtn('◀', 'left:24px;'), 'arrowleft', false);
    bind(mkBtn('▶', 'left:104px;'), 'arrowright', false);
    bind(mkBtn('⤒', 'right:24px;'), ' ', true);

    document.body.appendChild(touchRoot);
  }
  setupTouch();

  return {
    axisX() {
      return (anyHeld(RIGHT) ? 1 : 0) - (anyHeld(LEFT) ? 1 : 0);
    },
    axisZ() {
      // forward (W/Up) is -1, back (S/Down) is +1
      return (anyHeld(BACK) ? 1 : 0) - (anyHeld(FORWARD) ? 1 : 0);
    },
    jumpHeld() {
      return anyHeld(JUMP);
    },
    consumeJump() {
      if (jumpQueued) {
        jumpQueued = false;
        return true;
      }
      return false;
    },
    restartPressed() {
      if (restartQueued) {
        restartQueued = false;
        return true;
      }
      return false;
    },
    dispose() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      if (touchRoot && touchRoot.parentNode) touchRoot.parentNode.removeChild(touchRoot);
      touchRoot = null;
      held.clear();
    },
  };
}
