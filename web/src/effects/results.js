// RESULTS — the Fall-Guys-style "QUALIFIED!" overlay shown once players cross the
// finish line. game.js calls recordFinish() as each bean clears (the call ORDER is
// the placing: 1st, 2nd, 3rd…), then show() reveals a celebratory podium panel
// listing the finish order with medals, with the LOCAL player's row highlighted.
// Pure DOM/CSS, headless-safe (no-op stubs when there's no document). Visually it
// matches the win-banner vibe (blue→dark-blue gradient, thick white border, big
// drop shadow) and pops in via an injected @keyframes.

// Bright toy palette.
const C = {
  blue: '#2f7bff',
  blueDark: '#1b50c8',
  yellow: '#ffd23f',
  yellowDeep: '#ffb300',
  ink: '#10243f',
  white: '#ffffff',
  green: '#74ec6a',
};

let styleInjected = false;
function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  styleInjected = true;
  const css = `
@keyframes pgr-pop {
  0%   { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
  60%  { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } }
@keyframes pgr-row-in {
  0%   { transform: translateX(-14px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; } }
@keyframes pgr-title-bob {
  0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
`;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

// Ordinal label: 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th"…
function ordinal(n) {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function createResults() {
  const hasDOM = typeof document === 'undefined' || !document.body ? false : true;

  // Headless / non-DOM safety: keep the same shape but do nothing.
  if (!hasDOM) {
    return { recordFinish() {}, show() {}, reset() {}, dispose() {} };
  }

  injectStyles();

  // Ordered finish list. Each entry: { name, isLocal }. The index = placing - 1.
  const finishers = [];
  let localRecorded = false;

  // --- Root + panel ---------------------------------------------------------
  const root = document.createElement('div');
  Object.assign(root.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '1550',
    pointerEvents: 'none',
    display: 'none',
    fontFamily: '"Baloo 2", "Trebuchet MS", system-ui, sans-serif',
    userSelect: 'none',
    overflow: 'hidden',
  });

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '18px',
    minWidth: 'min(420px, 80vw)',
    maxWidth: '90vw',
    maxHeight: '88vh',
    padding: '34px 48px 40px',
    boxSizing: 'border-box',
    background: `linear-gradient(180deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
    border: `6px solid ${C.white}`,
    borderRadius: '32px',
    boxShadow: '0 14px 0 rgba(16,36,63,0.4), 0 26px 60px rgba(16,36,63,0.5)',
    textAlign: 'center',
    pointerEvents: 'none',
  });

  const title = document.createElement('div');
  Object.assign(title.style, {
    color: C.yellow,
    fontSize: 'min(11vw, 64px)',
    fontWeight: '900',
    letterSpacing: '2px',
    lineHeight: '1',
    WebkitTextStroke: `2px ${C.blueDark}`,
    textShadow: `0 4px 0 ${C.yellowDeep}, 0 8px 16px rgba(0,0,0,0.35)`,
  });

  // Scrollable list of finisher rows (so a big lobby can't overflow the screen).
  const list = document.createElement('div');
  Object.assign(list.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    maxHeight: '52vh',
    overflowY: 'auto',
    paddingRight: '2px',
  });

  panel.appendChild(title);
  panel.appendChild(list);
  root.appendChild(panel);
  document.body.appendChild(root);

  // Build a single finisher row "<medal/ordinal> <name>" with the local one lit up.
  function makeRow(entry, placing, i) {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 16px',
      borderRadius: '16px',
      background: entry.isLocal
        ? `linear-gradient(180deg, ${C.yellow} 0%, ${C.yellowDeep} 100%)`
        : 'rgba(255,255,255,0.14)',
      border: entry.isLocal ? `3px solid ${C.white}` : '3px solid rgba(255,255,255,0.22)',
      boxShadow: entry.isLocal
        ? '0 5px 0 rgba(204,140,0,0.8), 0 8px 18px rgba(16,36,63,0.35)'
        : 'none',
      color: entry.isLocal ? C.ink : C.white,
      fontWeight: '800',
      fontSize: 'min(5vw, 26px)',
      lineHeight: '1.1',
      // Stagger each row in just after the panel pop.
      animation: `pgr-row-in 0.32s ease ${0.18 + i * 0.07}s both`,
    });

    const badge = document.createElement('span');
    badge.textContent = MEDALS[placing - 1] || ordinal(placing);
    Object.assign(badge.style, {
      flex: '0 0 auto',
      minWidth: placing <= 3 ? 'auto' : '2.2em',
      textAlign: placing <= 3 ? 'center' : 'right',
      fontSize: placing <= 3 ? 'min(6vw, 30px)' : 'inherit',
      fontWeight: '900',
      color: entry.isLocal ? C.ink : C.yellow,
    });

    const place = document.createElement('span');
    place.textContent = ordinal(placing);
    Object.assign(place.style, {
      flex: '0 0 auto',
      minWidth: '2.6em',
      textAlign: 'left',
      fontWeight: '900',
      opacity: '0.92',
    });

    const nameEl = document.createElement('span');
    nameEl.textContent = entry.name || (entry.isLocal ? 'You' : 'Player');
    Object.assign(nameEl.style, {
      flex: '1 1 auto',
      textAlign: 'left',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });

    row.appendChild(badge);
    row.appendChild(place);
    row.appendChild(nameEl);

    if (entry.isLocal) {
      const tag = document.createElement('span');
      tag.textContent = 'YOU';
      Object.assign(tag.style, {
        flex: '0 0 auto',
        marginLeft: 'auto',
        padding: '3px 10px',
        borderRadius: '10px',
        background: C.blueDark,
        color: C.white,
        fontSize: '0.62em',
        fontWeight: '900',
        letterSpacing: '1px',
      });
      row.appendChild(tag);
    }

    return row;
  }

  function render() {
    list.innerHTML = '';
    if (finishers.length === 0) {
      // Nobody finished yet: minimal, graceful "FINISH!" state (no list).
      title.textContent = 'FINISH!';
      title.style.animation = 'pgr-title-bob 1.6s ease-in-out infinite';
      list.style.display = 'none';
      return;
    }
    title.textContent = 'QUALIFIED!';
    title.style.animation = 'pgr-title-bob 1.6s ease-in-out infinite';
    list.style.display = 'flex';
    finishers.forEach((entry, i) => {
      list.appendChild(makeRow(entry, i + 1, i));
    });
  }

  return {
    // Append a finisher; call ORDER is the placing. Duplicate local finishes are
    // ignored so the local bean can't be listed twice.
    recordFinish(name, isLocal) {
      if (isLocal) {
        if (localRecorded) return;
        localRecorded = true;
      }
      finishers.push({ name: name == null ? '' : String(name), isLocal: !!isLocal });
    },

    // Reveal the panel, (re)building the list and re-triggering the pop animation.
    show() {
      render();
      root.style.display = 'block';
      panel.style.animation = 'none';
      // Force reflow so the animation can replay on a repeated show().
      void panel.offsetWidth;
      panel.style.animation = 'pgr-pop 0.5s cubic-bezier(0.2, 1.4, 0.4, 1)';
    },

    // Clear the finish list and hide the panel (e.g. between rounds).
    reset() {
      finishers.length = 0;
      localRecorded = false;
      list.innerHTML = '';
      root.style.display = 'none';
    },

    // Tear down: remove the root and the injected <style>.
    dispose() {
      finishers.length = 0;
      localRecorded = false;
      if (root.parentNode) root.parentNode.removeChild(root);
    },
  };
}
