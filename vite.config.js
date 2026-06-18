import { defineConfig } from 'vite';

// Relative base so the build can be hosted from any sub-path (e.g. GitHub Pages).
// @dimforge/rapier3d-compat ships the physics engine as inlined base64 WASM,
// so no extra plugins or WASM handling are required here.
export default defineConfig({
  base: './',
  server: {
    open: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
