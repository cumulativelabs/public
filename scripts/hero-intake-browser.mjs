// Deterministic screenshots for intake extent review; external Playwright only.
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.HERO_URL || 'http://127.0.0.1:4173/';
const out = process.env.INTAKE_EVIDENCE_DIR;
if (!out) throw new Error('Set INTAKE_EVIDENCE_DIR to a new before/after evidence directory.');
await mkdir(out, { recursive: true });
const results = [];
for (const [name, engine, executablePath] of [['chromium', chromium, process.env.CHROMIUM_EXECUTABLE], ['webkit', webkit, process.env.WEBKIT_EXECUTABLE]]) {
  const browser = await engine.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  for (const [width, height] of [[1440, 900], [1280, 800], [1024, 768], [768, 1024], [430, 932], [390, 844], [320, 568]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/${name}-${width}x${height}.png` });
    const geometry = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      plate: document.querySelector('.hero-knowledge').getBoundingClientRect().toJSON(),
      mark: document.querySelector('.hero-section__mark').getBoundingClientRect().toJSON(),
      source: new URL(document.querySelector('.hero-knowledge img').currentSrc).pathname,
    }));
    results.push({ name, width, height, errors, ...geometry });
    await page.close();
  }
  await browser.close();
}
await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2) + '\n');
if (results.some(r => r.overflow || r.errors.length)) process.exitCode = 1;
console.log(`${results.length} viewport captures; ${results.filter(r => r.overflow || r.errors.length).length} failures`);
