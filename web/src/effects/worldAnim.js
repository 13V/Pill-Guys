// WORLD ANIMATION — spinning sawblade + scrolling conveyor belt. Owned by the WORLD-ANIM agent.
//
// export function createWorldAnim(level) -> { update(dt) }
//   `level` is the visual THREE.Group from buildVisualLevel.
//
//   - SAWBLADE: the big circular saw is tagged (in props/hazards.js) with
//     userData.spin = { localY: true, speed: 6 }. The disc is tipped vertical
//     (placed rx=90) but its LOCAL Y axis is the disc normal regardless of that
//     tilt, so object.rotateY(speed*dt) spins it in its own plane like a real
//     circular saw. We collect every object carrying userData.spin so any future
//     spinner works too; a missing speed falls back to a sensible default.
//
//   - CONVEYOR BELT: the conveyor_4x8x1 glTF has a mesh material literally named
//     'threads' (the tread texture, threads.png). Reading the glTF UVs: the U
//     coordinate is locked to the belt's narrow width (corr 1.0 with the local X
//     extent ±1.6) while the V coordinate is the one that spans the long belt run
//     (V range ≈ -0.2..1.8 across the 8-unit local-Z length). So scrolling
//     map.offset.Y is what moves the tread pattern ALONG the belt's travel; offset.x
//     would just slide it sideways across the width. The deck is placed ry=90, which
//     maps the belt's local +Z run onto world +X — the same direction the gameplay
//     conveyor pushes the player — so we advance offset.y to read as motion toward +X.
//
// All discovery is done once on the first update and then cached; per-frame work is
// just a rotateY per spinner and an offset bump per unique belt texture.
import * as THREE from 'three';

// Spin fallback (rad/s) if a tagged object omits a speed. Matches the sawblade tag.
const DEFAULT_SPIN_SPEED = 6;

// Belt scroll rate in UV units/sec. The tread texture tiles several times along
// the belt, so a few tenths/sec reads clearly as a moving belt without strobing.
const BELT_SPEED = 0.35;

export function createWorldAnim(level) {
  // Caches populated lazily on the first update (the level may still be filling
  // in when createWorldAnim is called, so we defer the traversal one frame).
  let spinners = null; // [{ obj, speed, axis }]
  let swingers = null; // [{ obj, axis, amp, speed, phase, base }] — pendulum hazards
  let beltMaps = null; // [THREE.Texture] — unique tread maps, RepeatWrapping enabled
  let clock = 0;

  function collect() {
    spinners = [];
    swingers = [];
    beltMaps = [];
    const seenMaps = new Set(); // dedupe maps shared across cloned conveyor instances

    level.traverse((obj) => {
      // --- Sawblade / generic spinners (any axis) ----------------------------
      const spin = obj.userData && obj.userData.spin;
      if (spin) {
        const speed = Number.isFinite(spin.speed) ? spin.speed : DEFAULT_SPIN_SPEED;
        spinners.push({ obj, speed, axis: spin.axis || (spin.localY === false ? 'x' : 'y') });
      }

      // --- Swinging / pendulum hazards (spikeball, hammer, swiper arm) --------
      const sw = obj.userData && obj.userData.swing;
      if (sw) {
        const axis = sw.axis || 'z';
        swingers.push({ obj, axis, amp: sw.amp ?? 0.6, speed: sw.speed ?? 2, phase: sw.phase || 0, base: obj.rotation[axis] });
      }

      // --- Conveyor belt 'threads' materials ---------------------------------
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of mats) {
          if (mat && mat.name === 'threads' && mat.map) {
            const map = mat.map;
            // Scrolling the offset only tiles correctly with repeat wrapping.
            map.wrapS = THREE.RepeatWrapping;
            map.wrapT = THREE.RepeatWrapping;
            map.needsUpdate = true;
            if (!seenMaps.has(map)) {
              seenMaps.add(map);
              beltMaps.push(map);
            }
          }
        }
      }
    });
  }

  return {
    update(dt) {
      if (spinners === null) collect();
      if (!Number.isFinite(dt)) return;
      clock += dt;

      // Spin each tagged hazard about the requested local axis.
      for (const { obj, speed, axis } of spinners) {
        if (axis === 'x') obj.rotateX(speed * dt);
        else if (axis === 'z') obj.rotateZ(speed * dt);
        else obj.rotateY(speed * dt);
      }

      // Swing each pendulum hazard around its base rotation.
      for (const s of swingers) {
        s.obj.rotation[s.axis] = s.base + s.amp * Math.sin(clock * s.speed + s.phase);
      }

      // Scroll each belt's tread along its travel axis (V → toward world +X).
      const ds = BELT_SPEED * dt;
      for (const map of beltMaps) {
        map.offset.y += ds;
        // Keep the offset bounded so it never loses float precision over a long run.
        if (map.offset.y > 1) map.offset.y -= 1;
      }
    },
  };
}
