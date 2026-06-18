// Headless integration test: drives the real /game.html deterministically
// (pause rAF, step the sim via window.__game.step) and verifies every mechanic.
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

const PORT = 5186;
const URL = `http://localhost:${PORT}/game.html`;

const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'inherit'],
  detached: true,
});
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('vite did not start')), 30000);
  vite.stdout.on('data', (d) => {
    if (/Local:|ready in/.test(d.toString())) { clearTimeout(t); setTimeout(resolve, 700); }
  });
});

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

const results = [];
const ok = (name, cond, detail) => { results.push({ name, pass: !!cond, detail }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}  ${detail ?? ''}`); };

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1.5 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });

  const pos = () => page.evaluate(() => window.__game.player.translation());
  const coins = () => page.evaluate(() => window.__game.hud.coins);
  const step = (n) => page.evaluate((k) => window.__game.step(k), n);
  const warp = (x, y, z) => page.evaluate(([a, b, c]) => window.__game.testWarp(a, b, c), [x, y, z]);
  const settle = async (n = 12) => { await step(n); };
  const wait = (ms) => page.evaluate((m) => new Promise((r) => setTimeout(r, m)), ms);

  await page.evaluate(() => window.__game.pause());

  // 0) spawn
  await warp(3, 6.2, 0); await settle(12);
  const spawn = await pos();
  ok('spawn seated on start pad', Math.abs(spawn.y - 5.77) < 0.6 && Math.abs(spawn.x - 3) < 0.6, `y=${spawn.y.toFixed(2)} x=${spawn.x.toFixed(2)}`);

  // 1) move right (1s) — should advance along start+conveyor decks and collect coins
  await page.keyboard.down('ArrowRight'); await wait(40);
  await step(60);
  await page.keyboard.up('ArrowRight'); await wait(40);
  const moved = await pos();
  ok('moves right', moved.x - spawn.x > 3, `dx=${(moved.x - spawn.x).toFixed(2)}`);
  ok('stays on deck while running', moved.y > 4.5, `y=${moved.y.toFixed(2)}`);
  ok('collects coins while passing over them', (await coins()) > 0, `coins=${await coins()}`);

  // 2) jump — HOLD Space through the rise for a full jump (variable-jump cuts
  // the height if you release early, so a held jump must clear ~2+ units).
  await warp(3, 6.2, 0); await settle(15);
  const restY = (await pos()).y;
  await page.keyboard.down('Space'); await wait(40);
  let maxY = restY;
  for (let i = 0; i < 34; i++) { await step(1); maxY = Math.max(maxY, (await pos()).y); }
  await page.keyboard.up('Space');
  ok('full jump (held) clears ~2+ units', maxY > restY + 1.8, `restY=${restY.toFixed(2)} apexY=${maxY.toFixed(2)}`);

  // 2b) variable jump: a quick tap rises clearly less than a held jump
  await warp(3, 6.2, 0); await settle(15);
  await page.keyboard.down('Space'); await step(1); await page.keyboard.up('Space');
  let tapY = (await pos()).y;
  for (let i = 0; i < 34; i++) { await step(1); tapY = Math.max(tapY, (await pos()).y); }
  ok('variable jump: tap < full', tapY < maxY - 0.5, `tapApex=${tapY.toFixed(2)} fullApex=${maxY.toFixed(2)}`);

  // 3) conveyor pushes with NO input
  await warp(10, 6.2, 0); await settle(8);
  const convX0 = (await pos()).x;
  await step(40);
  const convX1 = (await pos()).x;
  ok('conveyor pushes player (no input)', convX1 - convX0 > 0.5, `dx=${(convX1 - convX0).toFixed(2)}`);

  // 4) spring launches
  await warp(25, 5.95, 0); await settle(1);
  let springMax = (await pos()).y;
  for (let i = 0; i < 24; i++) { await step(1); springMax = Math.max(springMax, (await pos()).y); }
  ok('spring launches player upward', springMax > 8, `apexY=${springMax.toFixed(2)}`);

  // 5) spikes kill + respawn to start
  await warp(16.5, 6.0, 0); await step(4);
  const afterDeath = await pos();
  ok('spikes respawn player to start', Math.abs(afterDeath.x - 3) < 1.5, `x=${afterDeath.x.toFixed(2)}`);

  // 6) gameplay hero screenshot (before triggering the win banner)
  await warp(8, 6.2, 0); await settle(18);
  await page.evaluate(() => window.__game.followCam.snap());
  await page.screenshot({ path: 'gameplay.png' });
  console.log('saved gameplay.png');

  // 6b) death-burst effect shot (emit the event; particles animate via rAF)
  await page.evaluate(() => {
    const p = window.__game.player.translation();
    window.__game.events.emit('death', { position: { x: p.x, y: p.y + 0.3, z: p.z } });
  });
  await wait(220);
  await page.screenshot({ path: 'deathburst.png' });
  console.log('saved deathburst.png');

  // 7) finish triggers win banner
  await warp(27.5, 11.0, 0); await step(4);
  const won = await page.evaluate(() => /finish/i.test(document.body.innerText));
  ok('reaching finish shows win banner', won, `bannerText=${won}`);

  ok('no uncaught page errors', errors.length === 0, errors.join(' | ') || 'none');

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} checks passed ===`);
} finally {
  await browser.close();
  try { process.kill(-vite.pid, 'SIGKILL'); } catch {}
}
process.exit(0);
