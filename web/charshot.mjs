// Character + ragdoll verification shots.
//   node charshot.mjs   ->  character.png (mid-stride close-up) + ragdoll.png (flailing)
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

const PORT = Number(process.env.RENDER_PORT) || 5198;
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'], detached: true });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('no vite')), 30000); vite.stdout.on('data', (d) => { if (/Local:|ready in/.test(d.toString())) { clearTimeout(t); setTimeout(res, 700); } }); });
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 180000, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/game.html?level=1`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });

  // --- Character portrait: warp to flat ground, walk a few steps (so the legs
  //     and arms are mid-swing), then frame a close 3/4 front view. ---
  const target = await page.evaluate(() => {
    const g = window.__game;
    g.testWarp(5, (g.levelData.deckTop ?? 5) + 1.5, 0);
    g.step(10);                               // settle on the deck
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' })); // walk +X
    g.step(9);                                // legs/arms now mid-stride
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
    g.pause();
    const t = g.player.translation();
    const cam = g.camera;                     // face points +X after walking right
    cam.position.set(t.x + 2.9, t.y + 0.7, t.z + 1.9);
    cam.lookAt(t.x, t.y - 0.05, t.z);
    return { x: t.x, y: t.y, z: t.z };
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: 'character.png' });
  console.log('saved character.png at', target);

  // --- Ragdoll: emit death at the player spot with a sideways kick, freeze the
  //     camera on it, let the rAF loop flail the puppet, then screenshot. ---
  await page.evaluate((t) => {
    const g = window.__game;
    const cam = g.camera;
    cam.position.set(t.x + 3.4, t.y + 2.2, t.z + 4.0);
    cam.lookAt(t.x + 0.5, t.y + 0.3, t.z);
    g.events.emit('death', { position: { x: t.x, y: t.y + 0.4, z: t.z }, velocity: { x: 7, y: 3, z: 1 } });
    if (g.player.die) g.player.die();
  }, target);
  await new Promise((r) => setTimeout(r, 420)); // ~0.4s into the 1.5s flail
  await page.screenshot({ path: 'ragdoll.png' });
  console.log('saved ragdoll.png');
} finally {
  await browser.close();
  try { process.kill(-vite.pid, 'SIGKILL'); } catch {}
}
process.exit(0);
