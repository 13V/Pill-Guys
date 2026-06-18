// Headless screenshot of the level for previewing the look.
// Boots the Vite dev server, loads the page in headless Chromium, waits for the
// scene to finish loading, and writes preview.png.
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

const PORT = 5179;
const URL = `http://localhost:${PORT}/`;
const OUT = process.argv[2] || 'preview.png';

// Spawn vite directly (not via npx) in its own process group so we can reliably
// tear the whole tree down afterwards and never leak a dev server.
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'inherit'],
  detached: true,
});

// Wait until Vite reports it is listening.
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('vite did not start in time')), 30000);
  vite.stdout.on('data', (d) => {
    process.stdout.write(d);
    if (d.toString().includes('ready in') || d.toString().includes('Local:')) {
      clearTimeout(timer);
      setTimeout(resolve, 800);
    }
  });
});

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--enable-webgl',
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1.5 });
  page.on('console', (m) => console.log('PAGE:', m.text()));
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200)); // let textures/env settle
  await page.screenshot({ path: OUT });
  console.log(`saved ${OUT}`);
} finally {
  await browser.close();
  try { process.kill(-vite.pid, 'SIGKILL'); } catch { /* group already gone */ }
}
process.exit(0);
