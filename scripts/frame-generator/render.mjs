/**
 * Render exactly 100 WebP frames of the Miki & Miki journey sequence.
 *
 * Requires Google Chrome (macOS) and: npm install (puppeteer-core, sharp, three)
 *
 * Usage: node scripts/frame-generator/render.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, copyFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const OUT = join(ROOT, 'public/frames');
const LOGO_SRC = join(ROOT, 'public/images/logo-transparent.png');
const LOGO_DST = join(__dirname, 'logo-transparent.png');
const WIDTH = 1280;
const HEIGHT = 720;
const FRAME_COUNT = 100;

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json',
};

function findChrome() {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  throw new Error('Chrome nije pronađen. Instalirajte Google Chrome ili podesite CHROME_PATH.');
}

function startStaticServer(rootDirs) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath === '/') urlPath = '/scene.html';

      // Try each root
      for (const root of rootDirs) {
        const filePath = join(root, urlPath.replace(/^\//, ''));
        if (existsSync(filePath) && statSync(filePath).isFile()) {
          const ext = extname(filePath);
          res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
          res.end(readFileSync(filePath));
          return;
        }
      }
      // node_modules resolve for three
      if (urlPath.startsWith('/node_modules/')) {
        const filePath = join(ROOT, urlPath.replace(/^\//, ''));
        if (existsSync(filePath) && statSync(filePath).isFile()) {
          const ext = extname(filePath);
          res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
          res.end(readFileSync(filePath));
          return;
        }
      }
      res.writeHead(404);
      res.end('Not found: ' + urlPath);
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  if (!existsSync(LOGO_SRC)) {
    throw new Error('Nedostaje logo: ' + LOGO_SRC);
  }
  copyFileSync(LOGO_SRC, LOGO_DST);

  // Serve logo at /logo-transparent.png
  copyFileSync(LOGO_SRC, join(__dirname, 'logo-transparent.png'));
  const { server, port } = await startStaticServer([
    __dirname,
    join(ROOT, 'public/images'),
    ROOT,
  ]);
  const chromePath = process.env.CHROME_PATH || findChrome();
  console.log(`Server :${port}`);
  console.log(`Chrome: ${chromePath}`);
  console.log(`Output: ${OUT}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.error('PAGEERROR:', err.message));
  page.on('requestfailed', (req) => console.error('REQFAIL:', req.url(), req.failure()?.errorText));

  await page.goto(`http://127.0.0.1:${port}/scene.html`, {
    waitUntil: 'networkidle0',
    timeout: 90000,
  });

  const boot = await page.evaluate(() => ({
    ready: window.__ready,
    error: window.__error || null,
  }));
  console.log('Boot state:', boot);

  await page.waitForFunction(() => window.__ready === true || window.__error, { timeout: 60000 });
  const after = await page.evaluate(() => ({ ready: window.__ready, error: window.__error || null }));
  if (!after.ready) throw new Error('Scene failed: ' + after.error);

  for (let i = 0; i < FRAME_COUNT; i++) {
    await page.evaluate(async (frame) => {
      await window.renderFrame(frame);
    }, i);

    // small settle for GPU
    await new Promise((r) => setTimeout(r, 16));

    const pngBuffer = await page.screenshot({ type: 'png', omitBackground: false });
    const name = `frame-${String(i).padStart(3, '0')}.webp`;
    const outPath = join(OUT, name);
    await sharp(pngBuffer)
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .webp({ quality: 78, effort: 4 })
      .toFile(outPath);

    if (i % 10 === 0 || i === FRAME_COUNT - 1) {
      console.log(`Rendered ${name}`);
    }
  }

  // Copy poster (first + last)
  copyFileSync(join(OUT, 'frame-000.webp'), join(OUT, 'poster.webp'));
  copyFileSync(join(OUT, 'frame-099.webp'), join(OUT, 'poster-end.webp'));

  await browser.close();
  server.close();

  const files = readdirSync(OUT).filter((f) => /^frame-\d{3}\.webp$/.test(f));
  let total = 0;
  for (const f of files) total += statSync(join(OUT, f)).size;
  console.log(`\nGotovo: ${files.length} frejmova`);
  console.log(`Ukupna veličina sekvence: ${(total / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
