// Traversability check: auto-plays a level (hold right + hop when grounded) and
// reports how far it got and whether it reached the finish. Proves a level is
// actually beatable, not just structurally sound.  Usage: LEVEL=4 node traverse.mjs
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

const LEVEL = parseInt(process.env.LEVEL || '1', 10);
const PORT = Number(process.env.RENDER_PORT) || 5190;
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'], detached: true });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('no vite')), 30000); vite.stdout.on('data', (d) => { if (/Local:|ready in/.test(d.toString())) { clearTimeout(t); setTimeout(res, 700); } }); });
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/game.html?level=${LEVEL}`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });
  const r = await page.evaluate(() => {
    const g = window.__game;
    const L = g.levelData;
    // Deck spans -> jump triggers just before each real gap; plus before each spike gauntlet.
    const spans = [];
    for (const d of L.decks || []) {
      if (d.kind === 'strip') spans.push([d.x0, d.x1]);
      else if (d.kind === 'conveyor') spans.push([d.cx - d.len / 2, d.cx + d.len / 2]);
      else { const w = d.w || 4; spans.push([d.cx - w / 2, d.cx + w / 2]); }
    }
    spans.sort((a, b) => a[0] - b[0]);
    // Each trigger: { x: takeoff point, hold: frames to hold jump }.
    // Short hop (hold 3 -> ~4u reach) for tight gaps; full jump (hold 32 -> ~8u) for big gaps + spike gauntlets.
    const triggers = [];
    for (let i = 0; i < spans.length - 1; i++) {
      const gap = spans[i + 1][0] - spans[i][1];
      if (gap >= 1.5) { const full = gap > 3.5; triggers.push({ x: spans[i][1] - (full ? 0.6 : 0.3), hold: full ? 32 : 3 }); }
    }
    for (const h of L.hazards || []) if (h.kind === 'spikes') { const s = h.size || 4; triggers.push({ x: h.cx - s / 2 - 0.9, hold: 32 }); }
    triggers.sort((a, b) => a.x - b.x);

    const fire = (type, key) => window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
    g.pause();
    fire('keydown', 'ArrowRight');
    const spawnX = g.player.spawn.x, finishX = g.world.finishPos.x;
    let maxX = spawnX, deaths = 0, won = false, stuck = 0, lastX = spawnX, holding = 0, ti = 0;
    for (let i = 0; i < 3200; i++) {
      const x = g.player.translation().x;
      while (ti < triggers.length && x > triggers[ti].x + 3) ti++; // skip cleared triggers
      if (holding > 0) { holding--; if (holding === 0) fire('keyup', ' '); }
      else if (g.player.grounded && ti < triggers.length && x >= triggers[ti].x - 0.7 && x <= triggers[ti].x + 0.7) {
        fire('keydown', ' '); holding = triggers[ti].hold; ti++;
      }
      g.step(1);
      const t = g.player.translation();
      if (t.x > maxX) maxX = t.x;
      if (lastX > spawnX + 4 && t.x < spawnX + 1.5) deaths++;
      stuck = Math.abs(t.x - lastX) < 0.004 ? stuck + 1 : 0;
      lastX = t.x;
      if (/finish|complete/i.test(document.body.innerText)) { won = true; break; }
      if (stuck > 220) break;
    }
    fire('keyup', 'ArrowRight');
    return { spawnX, finishX, maxX: +maxX.toFixed(1), deaths, won, progress: +((maxX - spawnX) / (finishX - spawnX) * 100).toFixed(0) };
  });
  console.log(`L${LEVEL}: ${r.won ? 'REACHED FINISH ✓' : 'did NOT finish'} — maxX=${r.maxX}/${r.finishX} (${r.progress}%), deaths=${r.deaths}`);
} finally {
  await browser.close();
  try { process.kill(-vite.pid, 'SIGKILL'); } catch {}
}
process.exit(0);
