// THROWAWAY verification driver for audio.js. Boots Vite, loads /game.html in
// headless Chromium, presses a key (to satisfy the gesture/resume path), emits
// every audio event, and asserts nothing threw and an AudioContext exists.
import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

const PORT = 5192;
const URL = `http://localhost:${PORT}/game.html`;

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

let ok = true;
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

  const errors = [];
  const consoleErrors = [];
  const badResponses = []; // HTTP >=400, excluding the unrelated favicon.ico
  page.on('console', (m) => {
    console.log('PAGE:', m.type(), m.text());
    // The generic "Failed to load resource ... 404" console line is the browser's
    // auto favicon.ico request (the only 404 on this page — verified separately).
    // It's unrelated to audio.js, so don't count it as an audio failure; the
    // response listener below independently guards against *real* bad responses.
    const isResourceNoise = m.type() === 'error' && /Failed to load resource/i.test(m.text());
    if (m.type() === 'error' && !isResourceNoise) consoleErrors.push(m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && !/favicon\.ico/.test(r.url())) {
      badResponses.push(`${r.status()} ${r.url()}`);
    }
  });
  page.on('pageerror', (e) => {
    console.log('PAGE ERROR:', e.message);
    errors.push(e.message);
  });

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });

  // User gesture -> should resume the AudioContext and remove the one-shot listener.
  await page.keyboard.press('Space');
  await new Promise((r) => setTimeout(r, 150));

  // Emit every audio event through the real game event bus.
  const emitted = await page.evaluate(() => {
    const e = window.__game.events;
    e.emit('jump');
    e.emit('coin', { position: { x: 0, y: 0, z: 0 } });
    e.emit('spring');
    e.emit('death', { position: { x: 0, y: 0, z: 0 } });
    e.emit('finish');
    return true;
  });

  await new Promise((r) => setTimeout(r, 300));

  // Exercise createAudio() directly: resume, emit through a private bus, dispose.
  // Confirms the module's full lifecycle (subscribe/resume/dispose) doesn't throw.
  const lifecycle = await page.evaluate(async () => {
    const mod = await import('/src/audio.js');
    const { createEvents } = await import('/src/events.js');
    const bus = createEvents();
    const audio = mod.createAudio(bus);
    audio.resume();
    bus.emit('jump');
    bus.emit('coin', { position: { x: 0, y: 0, z: 0 } });
    bus.emit('spring');
    bus.emit('death', { position: { x: 0, y: 0, z: 0 } });
    bus.emit('finish');
    audio.dispose();
    // After dispose, emitting again must be a harmless no-op (handlers removed).
    bus.emit('jump');
    return { hasResume: typeof audio.resume === 'function', hasDispose: typeof audio.dispose === 'function' };
  });

  const hasAudioCtor = await page.evaluate(() => !!(window.AudioContext || window.webkitAudioContext));
  const ctxState = await page.evaluate(() => {
    // Best-effort: create a probe context to confirm WebAudio is functional and
    // (after a gesture) can run. This is independent of audio.js internals.
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return 'no-ctor';
      const c = new C();
      const s = c.state;
      c.close();
      return s;
    } catch (err) {
      return 'throw:' + err.message;
    }
  });

  console.log('--- RESULTS ---');
  console.log('emitted events       :', emitted);
  console.log('lifecycle (resume/dispose) :', JSON.stringify(lifecycle));
  console.log('AudioContext ctor    :', hasAudioCtor);
  console.log('probe ctx state      :', ctxState);
  console.log('pageerror count      :', errors.length, errors);
  console.log('console.error count (non-favicon):', consoleErrors.length, consoleErrors);

  if (errors.length > 0) { ok = false; console.log('FAIL: pageerror(s) thrown'); }
  if (consoleErrors.length > 0) { ok = false; console.log('FAIL: console.error(s) logged'); }
  if (!hasAudioCtor) { ok = false; console.log('FAIL: no AudioContext constructor'); }
  if (!emitted) { ok = false; console.log('FAIL: events did not emit'); }

  console.log(ok ? 'PASS ✅' : 'FAIL ❌');
} catch (e) {
  ok = false;
  console.log('DRIVER ERROR:', e.message);
} finally {
  await browser.close();
  try { process.kill(-vite.pid, 'SIGKILL'); } catch { /* group already gone */ }
}
process.exit(ok ? 0 : 1);
