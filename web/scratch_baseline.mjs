// SCRATCH baseline-measurement harness (temporary; deleted at end).
// RENDER_PORT=5220 node scratch_baseline.mjs
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

const LEVEL = 4;
const PORT = Number(process.env.RENDER_PORT) || 5220;
const URL = `http://localhost:${PORT}/game.html?level=${LEVEL}`;

const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'], detached: true });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('no vite')), 30000); vite.stdout.on('data', (d) => { if (/Local:|ready in/.test(d.toString())) { clearTimeout(t); setTimeout(res, 800); } }); });
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 480, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });

  const ev = (fn, a) => page.evaluate(fn, a);

  await ev(() => {
    window.__h = {
      key(type, k) { const e = new KeyboardEvent(type, { key: k, bubbles: true }); window.dispatchEvent(e); },
      settle(x, y, z, n = 40) { window.__game.testWarp(x, y, z); window.__game.step(n); return window.__game.player.translation(); },
    };
  });

  const rest = await ev(() => window.__h.settle(20, 6.5, 0, 60));
  console.log(`RESTING_Y on top=5 deck: y=${rest.y.toFixed(4)}`);
  const REST_Y = rest.y;

  // --- 1) MAX FULL RUNNING JUMP (HOLD space through the whole rise) ---
  const runJump = await ev((REST_Y) => {
    const g = window.__game; const h = window.__h;
    g.testWarp(15, 6.5, 0); g.step(30);
    h.key('keydown', 'ArrowRight');
    g.step(40); // reach steady run speed
    const x0 = g.player.translation().x;
    h.key('keydown', ' '); // hold jump (do NOT release while rising -> full height)
    let landX = null, peakY = -Infinity; const startY = g.player.translation().y;
    let releasedSpace = false;
    const trace = [];
    for (let i = 0; i < 140; i++) {
      g.step(1);
      const t = g.player.translation(); const gnd = g.player.grounded;
      peakY = Math.max(peakY, t.y);
      trace.push({ i, x: +t.x.toFixed(3), y: +t.y.toFixed(3), g: gnd });
      // release space once we are clearly falling (past apex) so it doesn't matter
      if (!releasedSpace && t.y < peakY - 0.05) { h.key('keyup', ' '); releasedSpace = true; }
      if (i > 6 && gnd && t.y < REST_Y + 0.3 && landX === null) { landX = t.x; break; }
    }
    h.key('keyup', 'ArrowRight'); h.key('keyup', ' ');
    return { x0, startY, peakY, landX, trace };
  }, REST_Y);
  console.log(`\n=== FULL RUNNING JUMP (space held) ===`);
  console.log(`takeoff x0=${runJump.x0.toFixed(3)}, peakY=${runJump.peakY.toFixed(3)} (rise=${(runJump.peakY-REST_Y).toFixed(3)})`);
  console.log(`landX=${runJump.landX?.toFixed(3)}, horiz dist=${runJump.landX!=null?(runJump.landX-runJump.x0).toFixed(3):'n/a'}`);
  console.log('trace(every3):', runJump.trace.filter((_,i)=>i%3===0).map(p=>`${p.i}:${p.x}/${p.y}${p.g?'G':''}`).join(' '));

  // --- 2) FULL CONVEYOR-ASSISTED JUMP (belt then full jump) ---
  const convJump = await ev((REST_Y) => {
    const g = window.__game; const h = window.__h;
    g.testWarp(87, 6.5, 0); g.step(20);
    h.key('keydown', 'ArrowRight');
    for (let i = 0; i < 30; i++) g.step(1); // ride to belt end (~x94)
    const x0 = g.player.translation().x;
    h.key('keydown', ' '); // full jump
    let landX = null, peakY = -Infinity; let releasedSpace = false;
    const trace = [];
    for (let i = 0; i < 140; i++) {
      g.step(1);
      const t = g.player.translation(); const gnd = g.player.grounded;
      peakY = Math.max(peakY, t.y);
      trace.push({ i, x: +t.x.toFixed(3), y: +t.y.toFixed(3), g: gnd });
      if (!releasedSpace && t.y < peakY - 0.05) { h.key('keyup', ' '); releasedSpace = true; }
      if (i > 6 && gnd && t.y < REST_Y + 0.3 && landX === null) { landX = t.x; break; }
    }
    h.key('keyup', 'ArrowRight'); h.key('keyup', ' ');
    return { x0, peakY, landX, trace };
  }, REST_Y);
  console.log(`\n=== FULL CONVEYOR-ASSISTED JUMP ===`);
  console.log(`jump takeoff x0=${convJump.x0.toFixed(3)}, peakY=${convJump.peakY.toFixed(3)} (rise=${(convJump.peakY-REST_Y).toFixed(3)})`);
  console.log(`landX=${convJump.landX?.toFixed(3)}, horiz dist=${convJump.landX!=null?(convJump.landX-convJump.x0).toFixed(3):'n/a'}`);
  console.log('trace(every3):', convJump.trace.filter((_,i)=>i%3===0).map(p=>`${p.i}:${p.x}/${p.y}${p.g?'G':''}`).join(' '));

  // Also: conveyor-assisted jump but jump EARLIER (mid-belt) to see if reach differs
  const convJumpMid = await ev((REST_Y) => {
    const g = window.__game; const h = window.__h;
    g.testWarp(87, 6.5, 0); g.step(20);
    h.key('keydown', 'ArrowRight');
    for (let i = 0; i < 12; i++) g.step(1); // jump while still well on belt (~x90)
    const x0 = g.player.translation().x;
    h.key('keydown', ' ');
    let landX = null, peakY = -Infinity; let releasedSpace = false; const trace=[];
    for (let i = 0; i < 140; i++) {
      g.step(1);
      const t = g.player.translation(); const gnd = g.player.grounded;
      peakY = Math.max(peakY, t.y);
      trace.push({ i, x:+t.x.toFixed(3), y:+t.y.toFixed(3), g:gnd });
      if (!releasedSpace && t.y < peakY - 0.05) { h.key('keyup', ' '); releasedSpace = true; }
      if (i > 6 && gnd && t.y < REST_Y + 0.3 && landX === null) { landX = t.x; break; }
    }
    h.key('keyup', 'ArrowRight'); h.key('keyup', ' ');
    return { x0, peakY, landX, trace };
  }, REST_Y);
  console.log(`\n=== CONVEYOR JUMP fired MID-BELT (x~90) ===`);
  console.log(`takeoff x0=${convJumpMid.x0.toFixed(3)}, landX=${convJumpMid.landX?.toFixed(3)}, horiz dist=${convJumpMid.landX!=null?(convJumpMid.landX-convJumpMid.x0).toFixed(3):'n/a'}`);
  console.log('trace(every3):', convJumpMid.trace.filter((_,i)=>i%3===0).map(p=>`${p.i}:${p.x}/${p.y}${p.g?'G':''}`).join(' '));

  // --- 3) SPRING LAUNCH (holding right) ---
  const spring = await ev((REST_Y) => {
    const g = window.__game; const h = window.__h;
    g.testWarp(27, 6.5, 0); g.step(20);
    h.key('keydown', 'ArrowRight');
    const x0 = g.player.translation().x;
    let peakY = -Infinity, springX = null, landX = null, landY = null;
    const trace = []; let launched = false;
    for (let i = 0; i < 220; i++) {
      g.step(1);
      const t = g.player.translation(); const gnd = g.player.grounded;
      if (peakY === -Infinity || t.y > peakY) { peakY = t.y; }
      trace.push({ i, x: +t.x.toFixed(3), y: +t.y.toFixed(3), g: gnd });
      if (t.y > REST_Y + 1.0 && !launched) { launched = true; springX = trace.length>1?trace[trace.length-2].x:t.x; }
      if (launched && gnd && landX === null && t.y < REST_Y + 0.4) { landX = t.x; landY = t.y; break; }
    }
    h.key('keyup', 'ArrowRight');
    return { x0, peakY, springX, landX, landY, trace };
  }, REST_Y);
  console.log(`\n=== SPRING LAUNCH (holding ArrowRight) ===`);
  console.log(`enter x0=${spring.x0.toFixed(3)}, launch~x=${spring.springX?.toFixed(3)}, peakY=${spring.peakY.toFixed(3)} (rise above rest=${(spring.peakY-REST_Y).toFixed(3)})`);
  console.log(`landX=${spring.landX?.toFixed(3)} (drift from spring center cx=30: ${spring.landX!=null?(spring.landX-30).toFixed(3):'n/a'})`);
  console.log('spring trace(every4):', spring.trace.filter((_,i)=>i%4===0).map(p=>`${p.i}:${p.x}/${p.y}${p.g?'G':''}`).join(' '));

  // --- 3b) SPRING: at what Y is the player at various forward X offsets (for landing a higher deck) ---
  // Report y-height as a function of x past the spring, so we can pick higher-deck top & cx.
  const springProfile = await ev((REST_Y) => {
    const g = window.__game; const h = window.__h;
    g.testWarp(27, 6.5, 0); g.step(20);
    h.key('keydown', 'ArrowRight');
    const out = [];
    let launched = false;
    for (let i = 0; i < 140; i++) {
      g.step(1);
      const t = g.player.translation();
      if (t.y > REST_Y + 1.0) launched = true;
      if (launched) out.push({ x: +t.x.toFixed(2), y: +t.y.toFixed(2) });
      if (launched && t.y < REST_Y + 0.4 && out.length > 4) break;
    }
    h.key('keyup', 'ArrowRight');
    return out;
  }, REST_Y);
  console.log('\nSPRING height profile (x -> y) while rising/falling:');
  console.log(springProfile.map(p=>`${p.x}:${p.y}`).join('  '));

  console.log(`\nerrors: ${errors.length ? errors.join(' | ') : 'none'}`);
} finally {
  await browser.close();
  try { process.kill(-vite.pid, 'SIGKILL'); } catch {}
}
process.exit(0);
