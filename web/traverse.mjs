// Traversability check, lane-aware. Auto-plays a chosen route (strafe to z=LANE,
// then hold right + jump that lane's gaps/gauntlets) and reports whether it
// reaches the finish.  Usage: LEVEL=4 LANE=3 node traverse.mjs   (LANE default 0)
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

const LEVEL = parseInt(process.env.LEVEL || '1', 10);
const LANE = parseFloat(process.env.LANE || '0');
const PORT = Number(process.env.RENDER_PORT) || 5190;
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'], detached: true });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('no vite')), 30000); vite.stdout.on('data', (d) => { if (/Local:|ready in/.test(d.toString())) { clearTimeout(t); setTimeout(res, 700); } }); });
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/game.html?level=${LEVEL}`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });
  const r = await page.evaluate((LANE) => {
    const g = window.__game;
    const L = g.levelData;
    const xspan = (d) => d.kind === 'strip' ? [d.x0, d.x1] : d.kind === 'conveyor' ? [d.cx - d.len / 2, d.cx + d.len / 2] : [d.cx - (d.w || 4) / 2, d.cx + (d.w || 4) / 2];
    const zspan = (d) => {
      if (d.kind === 'strip') { const z = d.z ?? 0, w = d.w || 2; return [z - w / 2, z + w / 2]; }
      if (d.kind === 'conveyor') return [d.cz - (d.w || 4) / 2, d.cz + (d.w || 4) / 2];
      const dd = d.d || 4; return [d.cz - dd / 2, d.cz + dd / 2];
    };
    const onLane = (d) => { const [z0, z1] = zspan(d); return z0 - 0.2 <= LANE && LANE <= z1 + 0.2; };
    const laneDecks = (L.decks || []).filter(onLane).map(xspan).sort((a, b) => a[0] - b[0]);
    const triggers = [];
    for (let i = 0; i < laneDecks.length - 1; i++) { const gap = laneDecks[i + 1][0] - laneDecks[i][1]; if (gap >= 1.5) { const full = gap > 3.5; triggers.push({ x: laneDecks[i][1] - (full ? 0.6 : 0.3), hold: full ? 32 : 3 }); } }
    for (const h of L.hazards || []) if (h.kind === 'spikes') { const s = h.size || 4; if (Math.abs((h.cz ?? 0) - LANE) <= s / 2 + 0.5) triggers.push({ x: h.cx - s / 2 - 0.9, hold: 32 }); }
    triggers.sort((a, b) => a.x - b.x);

    const held = new Set();
    const key = (k, on) => { if (on && !held.has(k)) { held.add(k); window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); } else if (!on && held.has(k)) { held.delete(k); window.dispatchEvent(new KeyboardEvent('keyup', { key: k, bubbles: true })); } };
    g.pause();
    key('ArrowRight', true);
    const spawnX = g.player.spawn.x, finishX = g.world.finishPos.x;
    let maxX = spawnX, deaths = 0, won = false, stuck = 0, lastX = spawnX, holding = 0, ti = 0, steps = 0;
    for (let i = 0; i < 4000; i++) {
      steps = i + 1;
      const t0 = g.player.translation();
      // strafe toward the target lane
      if (t0.z - LANE > 0.4) { key('ArrowDown', false); key('ArrowUp', true); }
      else if (LANE - t0.z > 0.4) { key('ArrowUp', false); key('ArrowDown', true); }
      else { key('ArrowUp', false); key('ArrowDown', false); }
      while (ti < triggers.length && t0.x > triggers[ti].x + 3) ti++;
      if (holding > 0) { holding--; if (holding === 0) key(' ', false); }
      else if (g.player.grounded && ti < triggers.length && t0.x >= triggers[ti].x - 0.7 && t0.x <= triggers[ti].x + 0.7) { key(' ', true); holding = triggers[ti].hold; ti++; }
      g.step(1);
      const t = g.player.translation();
      if (t.x > maxX) maxX = t.x;
      if (lastX > spawnX + 4 && t.x < spawnX + 1.5) deaths++;
      stuck = Math.abs(t.x - lastX) < 0.004 ? stuck + 1 : 0;
      lastX = t.x;
      if (/finish|complete/i.test(document.body.innerText)) { won = true; break; }
      if (stuck > 240) break;
    }
    for (const k of [...held]) key(k, false);
    return { spawnX, finishX, maxX: +maxX.toFixed(1), deaths, won, steps, progress: +((maxX - spawnX) / (finishX - spawnX) * 100).toFixed(0) };
  }, LANE);
  console.log(`L${LEVEL} lane z=${LANE}: ${r.won ? 'REACHED FINISH ✓' : 'did NOT finish'} — ${r.steps} steps (${(r.steps / 60).toFixed(1)}s), maxX=${r.maxX}/${r.finishX} (${r.progress}%), deaths=${r.deaths}`);
} finally {
  await browser.close();
  try { process.kill(-vite.pid, 'SIGKILL'); } catch {}
}
process.exit(0);
