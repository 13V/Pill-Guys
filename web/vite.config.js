import { defineConfig } from 'vite';

// The KayKit assets live at the repo root (../Assets). We expose them to the
// dev server via a symlink at web/public/Assets -> ../../Assets, so they are
// served at /Assets/... without copying ~75MB into the build.
export default defineConfig({
  server: {
    // Allow serving files that resolve outside the project root (the symlinked
    // Assets directory points at the repository root).
    fs: { strict: false },
  },
});
