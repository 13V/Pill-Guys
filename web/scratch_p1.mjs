// SCRATCH Pattern-1 harness (temporary; deleted at end). RENDER_PORT=5220 node scratch_p1.mjs
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';
const PORT = Number(process.env.RENDER_PORT) || 5220;
const URL = `http://localhost:${PORT}/game.html?level=4`;
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'], detached: true });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('no vite')), 30000); vite.stdout.on('data', (d) => { if (/Local:|ready in/.test(d.toString())) { clearTimeout(t); setTimeout(res, 800); } }); });
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 480 });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });
  const ev = (fn, a) => page.evaluate(fn, a);
  await ev(() => { window.__h = { key(type,k){const e=new KeyboardEvent(type,{key:k,bubbles:true});window.dispatchEvent(e);} }; });

  const meta = await ev(() => ({ decks: window.__game.world ? null : null, finish: window.__game.world.finishPos }));

  // --- A) Cross hub -> w2 bridge -> landing: start on hub far edge, run right, jump the gap. ---
  // Hub at cx=3 (x0..6). Start the player a bit back so they reach full run speed before the edge.
  const cross = await ev(() => {
    const g = window.__game; const h = window.__h;
    g.testWarp(1.0, 6.5, 0); g.step(25); // settle on hub at x~1, safe center lane z=0
    h.key('keydown', 'ArrowRight');
    g.step(28); // accelerate toward edge (x climbs to ~6)
    const xEdge = g.player.translation().x;
    h.key('keydown', ' '); // full jump
    let minYafterPeak=Infinity, peakY=-Infinity, landed=false, landX=null, landY=null, died=false, releasedSpace=false;
    let startX=xEdge; const trace=[]; let startY=g.player.translation().y;
    for (let i=0;i<160;i++){
      g.step(1);
      const t=g.player.translation(); const gnd=g.player.grounded;
      peakY=Math.max(peakY,t.y);
      trace.push({i,x:+t.x.toFixed(2),y:+t.y.toFixed(2),g:gnd});
      if(!releasedSpace && t.y<peakY-0.05){h.key('keyup',' ');releasedSpace=true;}
      // death = respawn => x jumps back near spawn (3) and y back to ~6.x suddenly while we were far
      if(t.x < startX - 1 && i>4){died=true;break;}
      if(i>6 && gnd && t.y<6.2 && !landed){landed=true;landX=t.x;landY=t.y;break;}
    }
    h.key('keyup','ArrowRight'); h.key('keyup',' ');
    return {xEdge,startY,peakY,landed,landX,landY,died,trace};
  });
  console.log(`=== P1 CROSS hub->bridge ===`);
  console.log(`takeoff(edge)=${cross.xEdge.toFixed(2)}, peakY=${cross.peakY.toFixed(2)}, landed=${cross.landed}, landX=${cross.landX?.toFixed(2)}, landY=${cross.landY?.toFixed(2)}, died=${cross.died}`);
  console.log('trace:', cross.trace.filter((_,i)=>i%2===0).map(p=>`${p.i}:${p.x}/${p.y}${p.g?'G':''}`).join(' '));

  // --- B) Continue: from wherever we landed, can we walk to finish? (sanity) skipped; focus on landing. ---

  // --- C) SAW lane lethality. Saw lethal sensor: hx=1.6,hy=1.0,hz=0.5 centered (cx=3, top+0.4=5.4, cz=1.5) => z in [1.0,2.0], x in [1.4,4.6]. ---
  // Safe lane cz=-1.5: walk along z=-1.5 across the hub through x=1.4..4.6. Should NOT die.
  const safeLane = await ev(() => {
    const g=window.__game; const h=window.__h;
    g.testWarp(0.5, 6.5, -1.5); g.step(25);
    const startX=g.player.translation().x;
    h.key('keydown','ArrowRight');
    let died=false; const samples=[];
    for(let i=0;i<60;i++){ g.step(1); const t=g.player.translation(); samples.push(`${t.x.toFixed(1)}/${t.z.toFixed(2)}`); if(t.x<startX-1){died=true;break;} if(t.x>5.5)break; }
    h.key('keyup','ArrowRight');
    const t=g.player.translation();
    return {died, endX:+t.x.toFixed(2), endZ:+t.z.toFixed(2)};
  });
  console.log(`\n=== P1 SAFE LANE cz=-1.5 (walk x0.5->5.5) ===`);
  console.log(`died=${safeLane.died}, endX=${safeLane.endX}, endZ=${safeLane.endZ}  (died=false expected)`);

  // Saw lane cz=+1.5: walk along z=+1.5 INTO the saw. Should die (respawn -> x back to spawn).
  const sawLane = await ev(() => {
    const g=window.__game; const h=window.__h;
    g.testWarp(0.5, 6.5, 1.5); g.step(15);
    const startX=g.player.translation().x;
    h.key('keydown','ArrowRight');
    let died=false; let dx=null;
    for(let i=0;i<60;i++){ g.step(1); const t=g.player.translation(); if(t.x<startX-1){died=true;dx=t.x;break;} if(t.x>5.5)break; }
    h.key('keyup','ArrowRight');
    const t=g.player.translation();
    return {died, dx, endX:+t.x.toFixed(2)};
  });
  console.log(`\n=== P1 SAW LANE cz=+1.5 (walk into saw) ===`);
  console.log(`died=${sawLane.died} (true expected), respawnX=${sawLane.dx?.toFixed?.(2)}, endX=${sawLane.endX}`);

  // --- D) Standing-still check at z=-1.5 right next to saw (x=3) to be sure no overlap. ---
  const standSafe = await ev(() => {
    const g=window.__game; g.testWarp(3, 6.5, -1.5); const sx=g.player.translation().x;
    let died=false; for(let i=0;i<40;i++){g.step(1); const t=g.player.translation(); if(t.x<sx-1){died=true;break;}}
    const t=g.player.translation(); return {died, x:+t.x.toFixed(2), z:+t.z.toFixed(2), y:+t.y.toFixed(2)};
  });
  console.log(`\n=== P1 STAND at (3,-1.5) next to saw ===`);
  console.log(`died=${standSafe.died} (false expected), pos=(${standSafe.x},${standSafe.y},${standSafe.z})`);

  // Stand at z=+1.5 x=3 (saw center) — must die.
  const standDie = await ev(() => {
    const g=window.__game; g.testWarp(3, 6.5, 1.5); const sx=g.player.translation().x;
    let died=false; for(let i=0;i<20;i++){g.step(1); const t=g.player.translation(); if(t.x<sx-1){died=true;break;}}
    return {died};
  });
  console.log(`STAND at (3,+1.5) on saw: died=${standDie.died} (true expected)`);

  console.log(`\nerrors: ${errors.length?errors.join(' | '):'none'}`);
} finally { await browser.close(); try { process.kill(-vite.pid,'SIGKILL'); } catch {} }
process.exit(0);
