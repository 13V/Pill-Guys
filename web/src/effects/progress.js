// RACE PROGRESS — a Fall-Guys-style top-centre progress bar showing how far each
// player has run toward the finish line. Pure DOM/CSS, headless-safe (no-op stubs
// when there's no document). game.js drives update(selfFrac, peerFracs) every frame
// with fractions in [0,1] (0 = start, 1 = 🏁 finish); the bright yellow LOCAL chip
// glides along a frosted white track while small grey peer chips trail behind it.
//
//   createProgress() -> { update(selfFrac, peerFracs), setActive(on), dispose() }
//
// Marker positions LERP toward their targets each update so everything glides
// rather than snapping. Peer chip elements are created/removed as the peer count
// changes. The local marker always renders ON TOP of the peer chips.

const TRACK_W = 'min(520px, 70vw)';
const PAD = 14;            // px of horizontal inset so chips don't overhang the caps
const LERP = 0.18;         // per-frame ease toward the target fraction (frame-rate-ish)

let styleInjected = false;
function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  styleInjected = true;
  const css = `
@keyframes pgpr-flag-wave {
  0%, 100% { transform: translateY(-50%) rotate(-4deg); }
  50%      { transform: translateY(-50%) rotate(6deg); } }
@keyframes pgpr-pop {
  0%   { transform: translate(-50%, -50%) scale(0.2); }
  60%  { transform: translate(-50%, -50%) scale(1.18); }
  100% { transform: translate(-50%, -50%) scale(1); } }
`;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

const clamp01 = (n) => (typeof n === 'number' && n === n ? (n < 0 ? 0 : n > 1 ? 1 : n) : 0);

export function createProgress() {
  const hasDOM = typeof document !== 'undefined' && !!document.body;
  if (!hasDOM) {
    return { update() {}, setActive() {}, dispose() {} };
  }
  injectStyles();

  // Frosted white track pill, fixed top-centre, above the HUD (1000) and mp tag (1100).
  const root = document.createElement('div');
  Object.assign(root.style, {
    position: 'fixed', top: '14px', left: '50%', transform: 'translateX(-50%)',
    width: TRACK_W, height: '26px', display: 'flex',
    boxSizing: 'border-box', zIndex: '1150', pointerEvents: 'none', userSelect: 'none',
    background: 'rgba(255,255,255,0.82)', borderRadius: '999px',
    border: '2px solid rgba(47,123,255,0.55)',
    boxShadow: '0 4px 0 rgba(27,80,200,0.18), 0 8px 20px rgba(16,36,63,0.22), inset 0 0 0 2px rgba(255,255,255,0.6)',
    backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
    fontFamily: '"Baloo 2", system-ui, sans-serif',
  });

  // Inner rail the chips ride along (inset so they never poke past the rounded caps).
  const rail = document.createElement('div');
  Object.assign(rail.style, {
    position: 'absolute', top: '0', bottom: '0', left: `${PAD}px`, right: `${PAD}px`,
  });
  root.appendChild(rail);

  // Faint start cap (left) — a soft tick where the run begins.
  const start = document.createElement('div');
  Object.assign(start.style, {
    position: 'absolute', left: '0', top: '50%', transform: 'translate(-50%, -50%)',
    width: '6px', height: '14px', borderRadius: '3px',
    background: 'rgba(47,123,255,0.30)',
  });
  rail.appendChild(start);

  // 🏁 finish flag at the right end, gently waving.
  const flag = document.createElement('div');
  flag.textContent = '🏁';
  Object.assign(flag.style, {
    position: 'absolute', right: '-3px', top: '50%', transform: 'translateY(-50%)',
    fontSize: '18px', lineHeight: '1', transformOrigin: '50% 80%',
    animation: 'pgpr-flag-wave 1.6s ease-in-out infinite',
    filter: 'drop-shadow(0 1px 1px rgba(16,36,63,0.35))',
  });
  rail.appendChild(flag);

  // Layer holding peer chips (BELOW the local marker by DOM order + z-index).
  const peerLayer = document.createElement('div');
  Object.assign(peerLayer.style, { position: 'absolute', inset: '0', zIndex: '1' });
  rail.appendChild(peerLayer);

  // Bright LOCAL-player marker — yellow chip with a blue outline, on top of all peers.
  const self = document.createElement('div');
  Object.assign(self.style, {
    position: 'absolute', top: '50%', left: '0', transform: 'translate(-50%, -50%)',
    width: '20px', height: '20px', borderRadius: '50%', zIndex: '2',
    background: '#ffd23f', border: '2px solid #1b50c8', boxSizing: 'border-box',
    boxShadow: '0 2px 0 rgba(255,179,0,0.9), 0 3px 8px rgba(16,36,63,0.35)',
    animation: 'pgpr-pop 0.32s cubic-bezier(0.2,1.5,0.4,1) both',
  });
  rail.appendChild(self);

  document.body.appendChild(root);

  // Eased state. `selfPos` is the lerped fraction actually shown; peers each carry
  // their own { el, cur, target } so they glide independently.
  let selfTarget = 0;
  let selfPos = 0;
  const peers = []; // [{ el, cur, target }]

  function place(el, frac) {
    el.style.left = `${clamp01(frac) * 100}%`;
  }

  function makePeerChip() {
    const c = document.createElement('div');
    Object.assign(c.style, {
      position: 'absolute', top: '50%', left: '0', transform: 'translate(-50%, -50%)',
      width: '12px', height: '12px', borderRadius: '50%', boxSizing: 'border-box',
      background: 'rgba(16,36,63,0.38)', border: '1.5px solid rgba(255,255,255,0.7)',
      boxShadow: '0 1px 3px rgba(16,36,63,0.3)',
    });
    peerLayer.appendChild(c);
    return c;
  }

  function update(selfFrac, peerFracs) {
    selfTarget = clamp01(selfFrac);
    selfPos += (selfTarget - selfPos) * LERP;
    place(self, selfPos);

    const fracs = Array.isArray(peerFracs) ? peerFracs : [];

    // Grow/shrink the chip pool to match the peer count.
    while (peers.length < fracs.length) {
      const t = clamp01(fracs[peers.length]);
      peers.push({ el: makePeerChip(), cur: t, target: t });
    }
    while (peers.length > fracs.length) {
      const p = peers.pop();
      if (p && p.el) p.el.remove();
    }

    // Ease each peer toward its latest fraction.
    for (let i = 0; i < peers.length; i++) {
      const p = peers[i];
      p.target = clamp01(fracs[i]);
      p.cur += (p.target - p.cur) * LERP;
      place(p.el, p.cur);
    }
  }

  function setActive(on) {
    root.style.display = on ? 'flex' : 'none';
  }

  function dispose() {
    for (const p of peers) { if (p && p.el) p.el.remove(); }
    peers.length = 0;
    if (root && root.parentNode) root.parentNode.removeChild(root);
  }

  return { update, setActive, dispose };
}
