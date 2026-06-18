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

await shot('02-hero.png', { x: 0, y: PR, z: -3, px: 22, py: 16, pz: -12, lx: 0, ly: 3, lz: 8 });
await shot('03-front.png', { x: 0, y: 2 + PR, z: 3, px: 0, py: 8, pz: -14, lx: 0, ly: 3, lz: 9 });
await shot('04-side.png', { x: 0, y: 4 + PR, z: 9, px: 22, py: 11, pz: 7, lx: 0, ly: 4, lz: 9 });
await shot('05-summit.png', { x: 0, y: 8 + PR, z: 18, px: 11, py: 13, pz: 25, lx: 0, ly: 7, lz: 17 });

await browser.close();
console.log('screenshots done ->', OUT);
process.exit(0);
