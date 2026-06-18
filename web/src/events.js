// Tiny synchronous event bus connecting gameplay (player/interactions) to the
// effects (audio, particles, coin-juice) without coupling them together.
//   const events = createEvents();
//   events.on('coin', ({ position }) => {...});
//   events.emit('coin', { index, position, object3D });
export function createEvents() {
  const map = new Map(); // type -> Set<fn>
  return {
    on(type, fn) {
      if (!map.has(type)) map.set(type, new Set());
      map.get(type).add(fn);
      return () => map.get(type)?.delete(fn);
    },
    emit(type, payload) {
      const fns = map.get(type);
      if (!fns) return;
      for (const fn of fns) {
        try { fn(payload); } catch (e) { console.error(`[events] ${type} handler:`, e); }
      }
    },
  };
}
