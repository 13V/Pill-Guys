// THROWAWAY driver for the FEEL harness. Boots Vite on PORT 5191, loads
// /previews/feel.html, waits for __ready, then drives the sim via keyboard +
// window.__h.step(n) and measures run speed / jump apexes / coyote / events.
// Delete after use (the FEEL agent keeps only previews/feel.*).
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

const PORT = 5191;
const URL = `http://localhost:${PORT}/previews/feel.html`;

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

const results = {};
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  page.on('console', (m) => console.log('PAGE:', m.text()));
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });

  const FIXED_DT = await page.evaluate(() => window.__h.FIXED_DT);

  // Helpers run in the page context.
  const rest = () => page.evaluate(() => {
    window.__h.player.respawn();
    window.__h.step(20); // settle onto the pad
    return window.__h.player.translation();
  });

  // --- (a) RUN SPEED: hold ArrowRight 60 steps, measure Δx ----------------
  await rest();
  const x0 = await page.evaluate(() => window.__h.player.translation().x);
  await page.keyboard.down('ArrowRight');
  await page.evaluate(() => window.__h.step(60));
  const x1 = await page.evaluate(() => window.__h.player.translation().x);
  await page.keyboard.up('ArrowRight');
  const runSpeed = (x1 - x0) / (60 * FIXED_DT);
  results.runSpeed = runSpeed;
  results.runDx = x1 - x0;

  // --- (b) FULL JUMP APEX: hold Space, step until landed again ------------
  const rb = await rest();
  results.restY = rb.y;
  await page.keyboard.down('Space');
  const fullApex = await page.evaluate(() => {
    const t0 = window.__h.player.translation().y;
    let maxY = t0;
    // Step until we have left the ground and come back, or a cap.
    let left = false;
    for (let i = 0; i < 200; i++) {
      window.__h.step(1);
      const y = window.__h.player.translation().y;
      if (y > maxY) maxY = y;
      if (!window.__h.player.grounded) left = true;
      else if (left && i > 3) break; // grounded again after being airborne
    }
    return { maxY, base: t0 };
  });
  await page.keyboard.up('Space');
  results.fullApex = fullApex.maxY - fullApex.base;
  results.jumpsAfterFull = await page.evaluate(() => window.__h.jumps);

  // --- (c) SHORT HOP APEX: 1-step Space tap, release immediately ----------
  const rc = await rest();
  // Press, advance exactly one step (jump fires this step, key held), then
  // release and let the variable-height cut chop the rise.
  await page.keyboard.down('Space');
  await page.evaluate(() => window.__h.step(1));
  await page.keyboard.up('Space');
  const shortApex = await page.evaluate(() => {
    const base = (window.__h.__shortBase ??= null);
    let maxY = window.__h.player.translation().y;
    let left = !window.__h.player.grounded;
    for (let i = 0; i < 200; i++) {
      window.__h.step(1);
      const y = window.__h.player.translation().y;
      if (y > maxY) maxY = y;
      if (!window.__h.player.grounded) left = true;
      else if (left && i > 3) break;
    }
    return maxY;
  });
  results.shortApex = shortApex - rc.y;

  // --- (d) COYOTE: walk off the x=0 edge of the start deck, jump within ~0.1s
  // Start deck footprint x:0..6; walking LEFT (ArrowLeft) leaves open air at x<0
  // (kill floor far below at y=-6, rails only line the z-sides). After grounded
  // flips false we press Space within the coyote window and expect a real jump.
  const rd = await rest();
  const jumpsBeforeCoyote = await page.evaluate(() => window.__h.jumps);
  const coyote = await page.evaluate(() => {
    window.__h.input; // noop
    return { startY: window.__h.player.translation().y, startX: window.__h.player.translation().x };
  });
  await page.keyboard.down('ArrowLeft');
  // Step until we walk off the edge (grounded becomes false), capped.
  const offInfo = await page.evaluate(() => {
    let steps = 0;
    while (window.__h.player.grounded && steps < 240) {
      window.__h.step(1);
      steps++;
    }
    return { steps, grounded: window.__h.player.grounded, t: window.__h.player.translation() };
  });
  await page.keyboard.up('ArrowLeft');
  // Now within the coyote window (press jump immediately, a few steps in).
  await page.keyboard.down('Space');
  const coyoteResult = await page.evaluate(() => {
    // Advance 1 step so the buffered jump is consumed while coyote is still live.
    const yBefore = window.__h.player.translation().y;
    window.__h.step(1);
    const yAfter1 = window.__h.player.translation().y;
    // Track apex over the resulting hop.
    let maxY = Math.max(yBefore, yAfter1);
    for (let i = 0; i < 60; i++) {
      window.__h.step(1);
      const y = window.__h.player.translation().y;
      if (y > maxY) maxY = y;
    }
    return { yBefore, yAfter1, maxY };
  });
  await page.keyboard.up('Space');
  const jumpsAfterCoyote = await page.evaluate(() => window.__h.jumps);
  results.coyote = {
    offEdgeSteps: offInfo.steps,
    leftGround: offInfo.grounded === false,
    jumpFired: jumpsAfterCoyote > jumpsBeforeCoyote,
    apexAboveStart: coyoteResult.maxY - coyote.startY,
    risePostJump: coyoteResult.maxY - coyoteResult.yBefore,
  };

  results.totalJumps = await page.evaluate(() => window.__h.jumps);
  results.totalLands = await page.evaluate(() => window.__h.lands);
} finally {
  await browser.close();
  try { process.kill(-vite.pid, 'SIGKILL'); } catch { /* group already gone */ }
}

// ---- Report + assertions ---------------------------------------------------
console.log('\n==== FEEL MEASUREMENTS ====');
console.log(JSON.stringify(results, null, 2));

const checks = [];
const ok = (name, cond, detail) => { checks.push({ name, pass: !!cond, detail }); };

ok('run speed ~8 (7.0–9.0)', results.runSpeed >= 7.0 && results.runSpeed <= 9.0, results.runSpeed);
ok('full apex 2.6–3.2', results.fullApex >= 2.6 && results.fullApex <= 3.2, results.fullApex);
ok('short hop < full apex', results.shortApex < results.fullApex - 0.3, `${results.shortApex} < ${results.fullApex}`);
ok('coyote: left ground', results.coyote.leftGround, results.coyote.offEdgeSteps);
ok('coyote: jump fired off-edge', results.coyote.jumpFired && results.coyote.risePostJump > 0.5, results.coyote);
ok('jump event fired (>0)', results.totalJumps > 0, results.totalJumps);

console.log('\n==== CHECKS ====');
let allPass = true;
for (const c of checks) {
  console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}  (${JSON.stringify(c.detail)})`);
  if (!c.pass) allPass = false;
}
console.log(`\n${allPass ? 'ALL PASS' : 'SOME FAILED'}`);
process.exit(allPass ? 0 : 1);
