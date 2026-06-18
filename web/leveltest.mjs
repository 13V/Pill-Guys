// Generic per-level smoke test. Usage (from web/):
//   LEVEL=3 RENDER_PORT=5188 node leveltest.mjs
// Loads /game.html?level=LEVEL, verifies the level builds and is structurally
// sound (spawn is grounded, the finish triggers a win, coins exist, no errors),
// reports length/coins, and saves level<N>.png. Use this to validate any level.
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

const LEVEL = parseInt(process.env.LEVEL || '1', 10);
const PORT = Number(process.env.RENDER_PORT) || 5188;
const URL = `http://localhost:${PORT}/game.html?level=${LEVEL}`;

const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'], detached: true });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('no vite')), 30000); vite.stdout.on('data', (d) => { if (/Local:|ready in/.test(d.toString())) { clearTimeout(t); setTimeout(res, 700); } }); });
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

const results = [];
const ok = (n, c, d) => { results.push(c); console.log(`${c ? 'PASS' : 'FAIL'}  L${LEVEL}: ${n}  ${d ?? ''}`); };
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1.25 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });

  const ev = (fn, a) => page.evaluate(fn, a);
  const pos = () => ev(() => window.__game.player.translation());
  const meta = await ev(() => ({
    name: window.__game.levelName,
    coins: window.__game.world.coins.length,
    length: window.__game.world.lengthX,
    spawn: window.__game.player.spawn,
    finish: window.__game.world.finishPos,
  }));
  await ev(() => window.__game.pause());

  // spawn grounded
  await ev((s) => window.__game.testWarp(s.x, s.y, s.z), meta.spawn);
  await ev(() => window.__game.step(16));
  const sp = await pos();
  ok('spawn is grounded (does not fall)', sp.y > meta.spawn.y - 2.0, `y=${sp.y.toFixed(2)}`);

  // finish triggers win
  await ev((f) => window.__game.testWarp(f.x, f.y + 0.5, f.z), meta.finish);
  await ev(() => window.__game.step(5));
  const won = await ev(() => /finish|complete/i.test(document.body.innerText));
  ok('finish triggers win', won, `finish=(${meta.finish.x.toFixed(1)},${meta.finish.y.toFixed(1)})`);

  ok('has coins', meta.coins > 0, `coins=${meta.coins}`);
  ok('no page errors', errors.length === 0, errors.join(' | ') || 'none');

  // hero shot mid-level
  await ev(() => { window.__game.testWarp(window.__game.player.spawn.x + 4, window.__game.player.spawn.y, 0); window.__game.step(18); window.__game.followCam.snap(); });
  await page.screenshot({ path: `level${LEVEL}.png` });

  console.log(`\nL${LEVEL} "${meta.name}": length≈${meta.length.toFixed(0)}u, coins=${meta.coins}, ${results.filter(Boolean).length}/${results.length} checks · saved level${LEVEL}.png`);
} finally {
  await browser.close();
  try { process.kill(-vite.pid, 'SIGKILL'); } catch {}
}
process.exit(0);
