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

await page.goto(url, { waitUntil: 'load' });
await page.waitForSelector('#play-button:not([disabled])', { timeout: 45000 });
await page.waitForTimeout(500);

await page.screenshot({ path: `${OUT}/01-title.png` });

await page.click('#play-button');
await page.waitForTimeout(300);
await page.evaluate(() => {
  window.game.state = 'ready';
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

await shot('02-hero.png', { x: 0, y: PR, z: 0, px: 52, py: 50, pz: -14, lx: 0, ly: 0, lz: 56 });
await shot('03-start.png', { x: 0, y: PR, z: 0, px: 11, py: 8, pz: -11, lx: 0, ly: 0, lz: 8 });
await shot('04-beams.png', { x: 0, y: PR, z: 29, px: 13, py: 8, pz: 18, lx: 0, ly: 1, lz: 30 });
await shot('05-conveyor.png', { x: 0, y: PR, z: 38, px: 11, py: 7, pz: 29, lx: 0, ly: 0.5, lz: 39 });
await shot('06-platforms.png', { x: 0, y: PR, z: 52, px: 14, py: 8, pz: 44, lx: 0, ly: 0, lz: 56 });
await shot('07-pendulums.png', { x: 0, y: PR, z: 71, px: 12, py: 8, pz: 62, lx: 0, ly: 1.2, lz: 71 });
await shot('08-corridor.png', { x: 0, y: 2 + PR, z: 90, px: 14, py: 9, pz: 80, lx: 0, ly: 2, lz: 91 });
await shot('09-finish.png', { x: 0, y: 2 + PR, z: 102, px: 11, py: 8, pz: 93, lx: 0, ly: 2.5, lz: 103 });

await browser.close();
console.log('screenshots done ->', OUT);
process.exit(0);
