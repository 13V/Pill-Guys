// Robust per-level hero screenshot. LEVEL=N node shot.mjs  -> levelN.png
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

const LEVEL = parseInt(process.env.LEVEL || '1', 10);
const PORT = Number(process.env.RENDER_PORT) || 5196;
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'], detached: true });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('no vite')), 30000); vite.stdout.on('data', (d) => { if (/Local:|ready in/.test(d.toString())) { clearTimeout(t); setTimeout(res, 700); } }); });
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 180000, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/game.html?level=${LEVEL}`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });
  await page.evaluate(() => {
    const g = window.__game;
    g.pause();
    const sx = Math.round(g.world.finishPos.x * 0.42); // scenic mid-level point
    g.testWarp(sx, (g.levelData.deckTop ?? 5) + 1.2, 0);
    g.step(20);
    g.followCam.snap();
  });
  await new Promise((r) => setTimeout(r, 2000)); // let the GPU settle on big scenes
  await page.screenshot({ path: `level${LEVEL}.png` });
  console.log(`saved level${LEVEL}.png`);
} finally {
  await browser.close();
  try { process.kill(-vite.pid, 'SIGKILL'); } catch {}
}
process.exit(0);
