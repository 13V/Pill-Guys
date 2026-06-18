// Throwaway puppeteer driver for player verification (port 5182).
// Launch pattern/args copied from render.mjs.
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

const PORT = 5182;
const ENTRY = '/previews/player.html';
const URL = `http://localhost:${PORT}${ENTRY}`;

const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'inherit'],
  detached: true,
});

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = true;
const log = (...a) => console.log('[drive]', ...a);

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 700, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => { console.log('PAGE ERROR:', e.message); pass = false; });
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });
  // Focus the page so keydown events are delivered.
  await page.bringToFront();
  await page.mouse.click(600, 350);

  const tr = () => page.evaluate(() => window.__game.player.translation());
  const grounded = () => page.evaluate(() => window.__game.player.grounded);

  // --- 1) SEATING: after warmup the pill should rest with its center near y≈5.75
  // (capsule bottom = center - (halfHeight+radius) = center - 0.75, so center≈5.75
  // puts the bottom at y≈5). ---
  await sleep(300);
  const seated = await tr();
  const seatedG = await grounded();
  const bottom = seated.y - 0.75;
  log(`SEATED: center.y=${seated.y.toFixed(4)} bottom.y=${bottom.toFixed(4)} grounded=${seatedG}`);
  if (Math.abs(bottom - 5) > 0.2) { pass = false; log('  FAIL: bottom not at ~5'); }
  if (!seatedG) { pass = false; log('  FAIL: not grounded while seated'); }

  // --- 2) MOVE RIGHT: hold ArrowRight ~0.5s, x should increase, y stays ~rest. ---
  const before = await tr();
  await page.keyboard.down('ArrowRight');
  await sleep(500);
  await page.keyboard.up('ArrowRight');
  await sleep(100);
  const after = await tr();
  const dx = after.x - before.x;
  const dyDuringMove = after.y - before.y;
  log(`MOVE RIGHT: dx=${dx.toFixed(4)} (y: ${before.y.toFixed(3)} -> ${after.y.toFixed(3)}, dy=${dyDuringMove.toFixed(4)})`);
  if (dx < 0.5) { pass = false; log('  FAIL: did not move right enough'); }
  if (Math.abs(dyDuringMove) > 0.2) { pass = false; log('  FAIL: y drifted while moving (fell/climbed)'); }

  // Re-seat read after move (should still be grounded, didn't fall through pad).
  const afterMoveG = await grounded();
  log(`  after-move grounded=${afterMoveG}, center.y=${after.y.toFixed(4)}`);
  if (!afterMoveG) { pass = false; log('  FAIL: not grounded after move (fell through?)'); }

  // --- 3) JUMP: press Space, sample apex over ~0.7s, y should rise then return. ---
  const preJumpY = (await tr()).y;
  await page.keyboard.down('Space');
  await sleep(30);
  await page.keyboard.up('Space');
  let apex = preJumpY;
  for (let i = 0; i < 14; i++) {
    await sleep(50);
    const y = (await tr()).y;
    if (y > apex) apex = y;
  }
  // Let it settle back down.
  await sleep(400);
  const landedY = (await tr()).y;
  const landedG = await grounded();
  const rise = apex - preJumpY;
  log(`JUMP: preY=${preJumpY.toFixed(4)} apex=${apex.toFixed(4)} rise=${rise.toFixed(4)} landedY=${landedY.toFixed(4)} grounded=${landedG}`);
  if (rise < 1.0) { pass = false; log('  FAIL: jump did not raise y enough'); }
  if (Math.abs(landedY - preJumpY) > 0.2) { pass = false; log('  FAIL: did not return to rest height after jump'); }
  if (!landedG) { pass = false; log('  FAIL: not grounded after landing'); }

  log(pass ? 'RESULT: ALL PASS' : 'RESULT: FAIL');
} catch (e) {
  console.log('DRIVER ERROR:', e.message);
  pass = false;
} finally {
  await browser.close();
  try { process.kill(-vite.pid, 'SIGKILL'); } catch { /* group gone */ }
}
process.exit(pass ? 0 : 1);
