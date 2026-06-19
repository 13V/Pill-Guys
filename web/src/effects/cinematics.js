// CINEMATICS — DOM overlays for the Fall-Guys-style level transition: the FINISH
// slam banner, the level-name card, and the 3-2-1-GO countdown. Pure DOM/CSS,
// headless-safe (no-op stubs when there's no document). game.js owns the timing
// and drives each beat imperatively; each call animates one element via CSS.

let styleInjected = false;
function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  styleInjected = true;
  const css = `
@keyframes pgc-slam {
  0%   { transform: translate(-50%, -280%) scale(0.92); }
  60%  { transform: translate(-50%, 10%)   scale(1.05); }
  78%  { transform: translate(-50%, -5%)   scale(0.99); }
  100% { transform: translate(-50%, 0)     scale(1); } }
@keyframes pgc-card-in {
  0%   { opacity: 0; transform: translate(-50%, 14px) scale(0.85); }
  60%  { opacity: 1; transform: translate(-50%, -3px) scale(1.04); }
  100% { opacity: 1; transform: translate(-50%, 0)    scale(1); } }
/* count/go animate the SCALE pop only — opacity stays inline (1) so the number
   is always visible even if keyframed opacity is unreliable (headless) or the
   user has prefers-reduced-motion. */
@keyframes pgc-count {
  0%   { transform: translate(-50%, -50%) scale(2.4); }
  55%  { transform: translate(-50%, -50%) scale(0.86); }
  100% { transform: translate(-50%, -50%) scale(1); } }
@keyframes pgc-go {
  0%   { transform: translate(-50%, -50%) scale(0.4) rotate(-10deg); }
  45%  { transform: translate(-50%, -50%) scale(1.3) rotate(4deg); }
  100% { transform: translate(-50%, -50%) scale(1) rotate(0); } }
`;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

export function createCinematics() {
  const hasDOM = typeof document !== 'undefined' && !!document.body;
  if (!hasDOM) {
    return { slam() {}, levelCard() {}, hideCard() {}, count() {}, clear() {}, root: null };
  }
  injectStyles();

  const root = document.createElement('div');
  Object.assign(root.style, {
    position: 'fixed', inset: '0', zIndex: '1600', pointerEvents: 'none', overflow: 'hidden',
    fontFamily: '"Baloo 2", "Trebuchet MS", system-ui, sans-serif', userSelect: 'none',
  });
  document.body.appendChild(root);

  let cardEl = null;

  // "FINISH!" banner that SLAMS down from the top with an overshoot bounce.
  function slam(headline, sub) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'absolute', top: '15%', left: '50%', transform: 'translate(-50%,0)', textAlign: 'center',
      animation: 'pgc-slam 0.55s cubic-bezier(0.2,0.7,0.3,1.12) both',
    });
    const h = document.createElement('div');
    h.textContent = headline;
    Object.assign(h.style, {
      color: '#ffd23f', fontSize: 'min(13vw, 110px)', fontWeight: '900', letterSpacing: '3px', lineHeight: '1',
      WebkitTextStroke: '4px #1b50c8', textShadow: '0 6px 0 #ffb300, 0 14px 26px rgba(16,36,63,0.45)',
    });
    wrap.appendChild(h);
    if (sub) {
      const s = document.createElement('div');
      s.textContent = sub;
      Object.assign(s.style, { marginTop: '10px', color: '#fff', fontSize: 'min(3.4vw, 26px)', fontWeight: '800', letterSpacing: '1px', textShadow: '0 2px 8px rgba(16,36,63,0.6)' });
      wrap.appendChild(s);
    }
    root.appendChild(wrap);
    return wrap;
  }

  // The level-name card (upper-centre) shown during the establishing fly-by.
  function levelCard(line1, line2) {
    hideCard();
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'absolute', top: '13%', left: '50%', transform: 'translate(-50%,0)', textAlign: 'center',
      animation: 'pgc-card-in 0.5s cubic-bezier(0.2,1.4,0.4,1) both',
    });
    const l1 = document.createElement('div');
    l1.textContent = line1;
    Object.assign(l1.style, { color: '#bfe0ff', fontSize: 'min(2.8vw, 22px)', fontWeight: '800', letterSpacing: '5px', textShadow: '0 2px 8px rgba(16,36,63,0.6)' });
    const l2 = document.createElement('div');
    l2.textContent = line2;
    Object.assign(l2.style, { color: '#fff', fontSize: 'min(7vw, 60px)', fontWeight: '900', letterSpacing: '1px', lineHeight: '1.05', WebkitTextStroke: '2px #1b50c8', textShadow: '0 4px 0 #2f7bff, 0 12px 24px rgba(16,36,63,0.5)' });
    wrap.appendChild(l1);
    wrap.appendChild(l2);
    root.appendChild(wrap);
    cardEl = wrap;
  }
  function hideCard() {
    if (!cardEl) return;
    const c = cardEl;
    c.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    c.style.opacity = '0';
    c.style.transform = 'translate(-50%,-22px)';
    setTimeout(() => c.remove(), 320);
    cardEl = null;
  }

  // A big centre countdown number ('3'/'2'/'1') or the 'GO!' accent.
  function count(label, go) {
    const el = document.createElement('div');
    el.textContent = label;
    Object.assign(el.style, {
      position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%,-50%)',
      opacity: '1', // resting-visible; the keyframes only drive the scale pop
      color: go ? '#74ec6a' : '#ffd23f', fontSize: go ? 'min(19vw,150px)' : 'min(22vw,190px)',
      fontWeight: '900', lineHeight: '1',
      WebkitTextStroke: go ? '5px #1b7a2e' : '5px #1b50c8',
      textShadow: '0 8px 0 rgba(16,36,63,0.32), 0 18px 32px rgba(16,36,63,0.5)',
      animation: go ? 'pgc-go 0.5s cubic-bezier(0.2,1.5,0.4,1) both' : 'pgc-count 0.5s cubic-bezier(0.2,1.5,0.4,1) both',
    });
    root.appendChild(el);
    if (!go) setTimeout(() => el.remove(), 760);
    return el;
  }

  function clear() { root.innerHTML = ''; cardEl = null; }

  return { slam, levelCard, hideCard, count, clear, root };
}
