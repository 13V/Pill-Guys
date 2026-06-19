// OCEAN — a big stylised sea the courses float above. Falling in is lethal (the
// death waterline is SEA_LEVEL; build.js puts a kill sensor there). It's a
// MeshStandardMaterial plane with shader-injected rolling waves, so it still
// catches the scene's key/rim lights and RECEIVES the platforms' shadows (which
// grounds the floating courses on the water). No external texture/asset needed —
// the swell, crest foam and glints are all procedural, matching the toy look.
//
//   import { createOcean, SEA_LEVEL } from './effects/ocean.js';
//   const ocean = createOcean(scene);  // ... ocean.update(dt) each frame
import * as THREE from 'three';

// World-Y of the (mean) sea surface. The courses sit on legs from y=0 up, so the
// water sits just below them; this is also the height build.js kills at.
export const SEA_LEVEL = -1.4;

export function createOcean(scene) {
  // Big enough to run past the fog into the horizon; segmented enough that the
  // long swells are smooth (wavelength ~90u vs ~8u vertex spacing).
  const geo = new THREE.PlaneGeometry(2400, 2400, 260, 260);
  geo.rotateX(-Math.PI / 2); // lie flat: local +Y -> world +Y, local x/-y -> world x/z

  const mat = new THREE.MeshStandardMaterial({
    color: 0x1f93d6, roughness: 0.16, metalness: 0.0, envMapIntensity: 1.15,
  });

  const uniforms = { uTime: { value: 0 } };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', /* glsl */`
        #include <common>
        uniform float uTime;
        varying float vCrest;
        // summed sines -> gentle rolling swell (kept low so the surface reads flat
        // enough for gameplay; the shimmer/foam sell the motion).
        float oceanWave(vec2 p) {
          float w = 0.0;
          w += sin(p.x * 0.070 + uTime * 0.90) * 0.30;
          w += sin(p.y * 0.085 - uTime * 1.10) * 0.24;
          w += sin((p.x + p.y) * 0.050 + uTime * 0.60) * 0.18;
          return w;
        }`)
      .replace('#include <beginnormal_vertex>', /* glsl */`
        #include <beginnormal_vertex>
        {
          vec2 p = position.xz;
          float e = 1.0;
          float h0 = oceanWave(p);
          // analytic gradient -> per-vertex normal so the swells catch the light
          objectNormal = normalize(vec3(-(oceanWave(p + vec2(e, 0.0)) - h0) / e, 1.0,
                                        -(oceanWave(p + vec2(0.0, e)) - h0) / e));
        }`)
      .replace('#include <begin_vertex>', /* glsl */`
        #include <begin_vertex>
        float _h = oceanWave(position.xz);
        transformed.y += _h;
        vCrest = _h;`);

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n varying float vCrest;')
      .replace('#include <color_fragment>', /* glsl */`
        #include <color_fragment>
        // white-ish foam toward the wave crests
        float foam = smoothstep(0.16, 0.32, vCrest);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.95, 1.0), foam * 0.55);`);
  };

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = SEA_LEVEL;
  mesh.receiveShadow = true;
  mesh.renderOrder = -1; // draw before the props
  scene.add(mesh);

  return {
    mesh,
    update(dt) { uniforms.uTime.value += (Number.isFinite(dt) ? dt : 0); },
  };
}
