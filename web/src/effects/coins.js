// COIN JUICE — idle bob/spin + collect "pop". Owned by the COIN-JUICE agent.
//
// export function createCoinJuice(world, events) -> { update(dt) }
//   world.coins: [{ name, object3D }] — glowing collectibles placed by colliders.js.
//   IDLE: each still-visible, un-collected coin gently bobs (sine, ~±0.12 around its
//     original Y) and slowly spins around Y. Capture each coin's base position once.
//   COLLECT: on 'coin' {index, object3D}, play a quick pop on that coin — scale up
//     (~1.6x) while fading/raising over ~0.18s, THEN set object3D.visible = false.
//     (interactions.js no longer hides coins; this effect owns hiding them.)
//   update(dt) drives the bob for idle coins and advances any in-progress pops.

const BOB_AMP = 0.12;        // ±metres the idle coin floats around its base Y
const BOB_FREQ = 2.2;        // rad/s — gentle, lazy float
const SPIN_SPEED = 1.6;      // rad/s — slow idle spin around Y
const POP_DURATION = 0.18;   // s — quick, snappy collect pop
const POP_SCALE = 1.6;       // peak scale the coin punches out to
const POP_RISE = 0.55;       // metres the coin lifts as it pops

// Smooth ease-out so the pop punches out fast then settles (1 - (1-t)^2).
const easeOut = (t) => 1 - (1 - t) * (1 - t);

export function createCoinJuice(world, events) {
  const coins = (world && world.coins) || [];

  // Per-coin animation state, captured once on first sight of each coin.
  //   base: original position (idle bob is relative to this)
  //   scale0: original uniform scale (pop scales relative to this)
  //   phase: offset so coins don't bob in lockstep
  //   collected: true once a pop has been triggered (idle bob skips it)
  //   pop: { t, mats:[{m, opacity0, transparent0}] } while a pop is in progress
  const state = coins.map((c, i) => {
    const obj = c && c.object3D;
    const base = obj ? obj.position.clone() : null;
    return {
      obj,
      base,
      baseY: base ? base.y : 0,
      scale0: obj ? obj.scale.x || 1 : 1,
      // Spread phases around the circle; a touch of position-based jitter keeps
      // adjacent coins from syncing even if indices line up.
      phase: i * 1.7 + (base ? base.x * 0.6 + base.z * 0.9 : 0),
      collected: false,
      pop: null,
    };
  });

  // Map object3D -> state index so a 'coin' event can find its coin even if the
  // payload index is missing/stale (match on the actual mesh as a fallback).
  const byObject = new Map();
  state.forEach((s, i) => { if (s.obj) byObject.set(s.obj, i); });

  let clock = 0; // seconds, drives the idle sine

  // Gather the materials of a coin (single or array) so we can fade opacity.
  function materialsOf(obj) {
    const out = [];
    obj.traverse((node) => {
      const m = node.material;
      if (!m) return;
      if (Array.isArray(m)) out.push(...m);
      else out.push(m);
    });
    return out;
  }

  function startPop(s) {
    if (!s || !s.obj || s.collected) return;
    s.collected = true; // idle bob stops touching this coin immediately

    // Snapshot each material's opacity/transparent so we restore nothing (the
    // coin is hidden at the end) but can detect opacity support up front.
    const mats = materialsOf(s.obj).map((m) => {
      const supportsOpacity = typeof m.opacity === 'number';
      if (supportsOpacity) {
        m.transparent = true;
        m.depthWrite = false; // avoid the fading coin punching a hole in itself
      }
      return { m, supportsOpacity, opacity0: supportsOpacity ? m.opacity : 1 };
    });
    const anyOpacity = mats.some((x) => x.supportsOpacity);

    s.pop = {
      t: 0,
      mats,
      anyOpacity,
      // Pop rises from wherever the coin currently is (its bobbed Y), not the
      // base, so it launches from where the player grabbed it.
      fromY: s.obj.position.y,
    };
  }

  function resolveTarget(payload) {
    if (!payload) return null;
    // Prefer the object3D so we hide exactly the coin that was picked up.
    if (payload.object3D && byObject.has(payload.object3D)) {
      return state[byObject.get(payload.object3D)];
    }
    if (Number.isInteger(payload.index) && state[payload.index]) {
      return state[payload.index];
    }
    return null;
  }

  if (events && events.on) {
    events.on('coin', (payload) => startPop(resolveTarget(payload)));
  }

  function update(dt) {
    if (!(dt > 0)) dt = 0;
    clock += dt;

    for (const s of state) {
      const obj = s.obj;
      if (!obj || !s.base) continue;

      // --- In-progress pop: punch up + rise + fade, then hide. -------------
      if (s.pop) {
        s.pop.t += dt;
        const raw = Math.min(s.pop.t / POP_DURATION, 1);
        const e = easeOut(raw);

        const scale = s.scale0 * (1 + (POP_SCALE - 1) * e);
        obj.scale.setScalar(scale);
        obj.position.y = s.pop.fromY + POP_RISE * e;

        if (s.pop.anyOpacity) {
          // Fade out over the pop; hold full opacity for the very first slice
          // so the punch reads before it vanishes.
          const fade = 1 - raw;
          for (const x of s.pop.mats) {
            if (x.supportsOpacity) x.m.opacity = x.opacity0 * fade;
          }
        }

        if (raw >= 1) {
          // Done: hide it. If the material had no opacity, the ease already
          // pushed scale to its peak — collapse it to nothing so it disappears
          // cleanly even without a fade.
          if (!s.pop.anyOpacity) obj.scale.setScalar(0);
          obj.visible = false;
          s.pop = null;
        }
        continue;
      }

      // --- Idle bob + spin for live, un-collected coins. -------------------
      if (s.collected || !obj.visible) continue;
      obj.position.y = s.baseY + Math.sin(clock * BOB_FREQ + s.phase) * BOB_AMP;
      obj.rotation.y += SPIN_SPEED * dt;
    }
  }

  return { update };
}
