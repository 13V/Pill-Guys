import { preview } from 'vite';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = process.env.OUT || 'shots';
mkdirSync(OUT, { recursive: true });

// Self-host the production build so timing is never an issue.
const server = await preview({ preview: { port: 4173, strictPort: true } });
const url = server.resolvedUrls.local[0];
console.log('preview at', url);

const browser = await chromium.launch({
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--enable-webgl',
  ],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', (m) => {
  if (m.type() === 'error') console.log('PAGE ERROR:', m.text());
});
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));

await page.goto(`${url}?nopost`, { waitUntil: 'load' });
await page.waitForSelector('#play-button:not([disabled])', { timeout: 45000 });
await page.waitForTimeout(500);

await page.screenshot({ path: `${OUT}/01-title.png` });

await page.click('#play-button');
await page.waitForTimeout(300);
await page.evaluate(() => {
  window.game.state = 'ready';
  window.game._noPost = true; // skip slow GTAO in software WebGL for screenshots
});

async function shot(name, p) {
  await page.evaluate((s) => {
    const g = window.game;
    g.player.respawn({ x: s.x, y: s.y, z: s.z });
    g._freeCam = { px: s.px, py: s.py, pz: s.pz, lx: s.lx, ly: s.ly, lz: s.lz };
  }, p);
  await page.evaluate(
    () =>
      new Promise((r) => {
        let n = 0;
        const f = () => {
          n += 1;
          n > 12 ? r() : requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
      }),
  );
  await page.screenshot({ path: `${OUT}/${name}` });
  console.log('shot:', name);
}

const PR = 0.84;

await shot('02-hero.png', { x: 0, y: PR, z: 8, px: 34, py: 30, pz: -8, lx: 0, ly: 0, lz: 26 });
await shot('03-down.png', { x: 0, y: PR, z: 6, px: 0, py: 9, pz: -8, lx: 0, ly: 1.5, lz: 26 });
await shot('04-conveyor.png', { x: 0, y: PR, z: 18, px: 14, py: 9, pz: 11, lx: 0, ly: 1, lz: 20 });
await shot('05-pipe.png', { x: 0, y: PR, z: 24, px: 14, py: 9, pz: 17, lx: 0, ly: 1.5, lz: 25 });
await shot('06-saws.png', { x: 0, y: PR, z: 30, px: 13, py: 9, pz: 24, lx: 0, ly: 1, lz: 31 });
await shot('07-ramp.png', { x: 0, y: 2 + PR, z: 39.5, px: 13, py: 9, pz: 33, lx: 0, ly: 2, lz: 40 });
await shot('08-finish.png', { x: 0, y: 0.5 + PR, z: 46.5, px: 12, py: 8, pz: 40, lx: 0, ly: 1.5, lz: 47.5 });

await browser.close();
console.log('screenshots done ->', OUT);
process.exit(0);
