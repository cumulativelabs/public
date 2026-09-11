// Verify both desktop attraction layers respect capability and live policy changes.
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = process.env.POLICY_EVIDENCE_DIR;
await mkdir(out, { recursive: true });
const results = [], failures = [];
for (const [name, engine, executablePath] of [['chromium', chromium, process.env.CHROMIUM_EXECUTABLE], ['webkit', webkit, process.env.WEBKIT_EXECUTABLE]]) {
  const browser = await engine.launch({ executablePath });
  for (const policy of ['reduced-motion', 'save-data', 'low-core', 'touch', 'mobile', 'coarse', 'no-canvas', 'live-reduced-motion']) {
    const mobile = policy === 'mobile';
    const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: mobile || policy === 'coarse', isMobile: mobile, reducedMotion: policy === 'reduced-motion' ? 'reduce' : 'no-preference' });
    if (policy === 'save-data') await page.addInitScript(() => { const c = new EventTarget(); c.saveData = true; Object.defineProperty(navigator, 'connection', { get: () => c }); });
    if (policy === 'low-core') await page.addInitScript(() => Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 }));
    if (policy === 'no-canvas') await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
    if (policy === 'coarse') await page.addInitScript(() => { const original = window.matchMedia; window.matchMedia = query => { const result = original(query); if (query.includes('any-pointer: fine')) Object.defineProperty(result, 'matches', { value: false }); return result; }; });
    await page.goto(process.env.HERO_URL, { waitUntil: 'networkidle' }); await page.waitForTimeout(200);
    const before = await page.locator('.hero-knowledge__canvas').evaluate(c => c.toDataURL());
    if (policy === 'touch') await page.locator('.hero-section').dispatchEvent('pointermove', { pointerType: 'touch', clientX: 120, clientY: 710 });
    else await page.mouse.move(120, 710);
    await page.waitForTimeout(500);
    let activeBeforeDisable = null;
    if (policy === 'live-reduced-motion') {
      activeBeforeDisable = await page.locator('.hero-knowledge__tethers').evaluate(c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data.some((v, i) => i % 4 === 3 && v > 0));
      await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(200);
    }
    const after = await page.locator('.hero-knowledge__canvas').evaluate(c => c.toDataURL());
    const tetherEmpty = await page.locator('.hero-knowledge__tethers').evaluate(c => { const context = c.getContext('2d'); return !context || context.getImageData(0, 0, c.width, c.height).data.every((v, i) => i % 4 !== 3 || v === 0); });
    const data = await page.locator('.hero-knowledge').evaluate(e => ({ ...e.dataset }));
    const staticPolicy = ['reduced-motion', 'save-data', 'low-core'].includes(policy);
    const pass = tetherEmpty && (staticPolicy ? before === after && data.pointerInteraction === 'disabled' : policy === 'live-reduced-motion' ? activeBeforeDisable && data.pointerInteraction === 'disabled' : policy === 'no-canvas' ? !data.ready : data.pointerActive !== 'true');
    if (!pass) failures.push(name + ' ' + policy);
    results.push({ engine: name, policy, pixelIdentical: before === after, tetherEmpty, activeBeforeDisable, data, pass }); await page.close();
  }
  await browser.close();
}
await writeFile(out + '/results.json', JSON.stringify({ results, failures }, null, 2) + '\n');
console.log({ cases: results.length, failures }); if (failures.length) process.exitCode = 1;
