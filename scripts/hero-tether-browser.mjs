// Record actual canvas strokes (not predicted endpoints), normal-motion screenshots,
// and alpha pixels before/after exit. No application test hook controls the scene.
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = process.env.TETHER_EVIDENCE_DIR;
await mkdir(out, { recursive: true });
const results = [], failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const instrument = () => {
  window.__tether = { strokes: [], curves: [], rings: [], path: [], start: [] };
  for (const name of ['clearRect', 'beginPath', 'moveTo', 'bezierCurveTo', 'stroke', 'arc']) {
    const original = CanvasRenderingContext2D.prototype[name];
    CanvasRenderingContext2D.prototype[name] = function (...args) {
      const p = window.__tether;
      if (this.canvas.classList.contains('hero-knowledge__tethers')) {
        if (name === 'clearRect') p.strokes = [];
        if (name === 'beginPath') p.path = [];
        if (name === 'moveTo') p.start = args;
        if (name === 'bezierCurveTo') p.path.push([...p.start, ...args]);
        if (name === 'stroke') p.strokes.push(...p.path.map(curve => ({ curve, alpha: this.globalAlpha, width: this.lineWidth })));
      }
      if (this.canvas.classList.contains('hero-knowledge__canvas')) {
        if (name === 'clearRect') { p.curves = []; p.rings = []; }
        if (name === 'moveTo') p.fanStart = args;
        if (name === 'bezierCurveTo') { p.curves.push([...p.fanStart, ...args]); p.fanStart = args.slice(-2); }
        if (name === 'arc' && args[2] > 60) p.rings.push(args);
      }
      return original.apply(this, args);
    };
  }
};
for (const [name, engine, executablePath] of [['chromium', chromium, process.env.CHROMIUM_EXECUTABLE], ['webkit', webkit, process.env.WEBKIT_EXECUTABLE]]) {
  const browser = await engine.launch({ executablePath });
  for (const [width, height] of [[1440, 900], [1280, 800]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'no-preference' });
    await page.addInitScript(instrument);
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.HERO_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const read = () => page.evaluate(() => {
      const root = document.querySelector('.hero-knowledge'), canvas = document.querySelector('.hero-knowledge__tethers');
      const r = root.getBoundingClientRect(), mark = document.querySelector('.hero-section__mark').getBoundingClientRect();
      const cx = mark.x + mark.width / 2 - r.x, s = r.width / 1440;
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let alphaSum = 0, litPixels = 0; for (let i = 3; i < pixels.length; i += 4) { alphaSum += pixels[i]; if (pixels[i] > 20) litPixels++; }
      return { strokes: window.__tether.strokes.filter(s => Math.abs(s.curve[6] - (cx - 76 * r.width / 1440)) > 1), production: window.__tether.curves.filter(c => Math.abs(c[6] - (cx - 76 * s)) < .001 || c[0] >= cx + 76 * s), rings: window.__tether.rings, mark: mark.toJSON(), bounds: r.toJSON(), pointer: { x: +root.dataset.intakePointerX, y: +root.dataset.intakePointerY }, eventPointer: { x: +root.dataset.pointerX, y: +root.dataset.pointerY }, strength: +root.dataset.intakeStrength, alphaSum, litPixels };
    });
    const baseline = await read();
    await page.screenshot({ path: `${out}/${name}-${width}-baseline.png` });
    const cy = baseline.mark.y + baseline.mark.height / 2;
    for (const [label, x, y] of [['far-left-lower', 120, Math.min(height - 110, cy + 280)], ['far-left-upper', 150, cy - 210]]) {
      await page.mouse.move(x, y); await page.waitForTimeout(1500);
      const active = await read();
      const endpoints = active.strokes.filter(s => s.width < 2 && s.alpha > .5).map(s => ({ x: s.curve[6] + active.bounds.x, y: s.curve[7] + active.bounds.y, distance: Math.hypot(s.curve[6] - active.pointer.x, s.curve[7] - active.pointer.y) }));
      const joins = active.strokes.filter(s => s.width < 2).map(({ curve: c }) => {
        const original = baseline.production.find(p => Math.hypot(p[0] - c[0], p[1] - c[1]) < .001);
        if (!original) return { matched: false };
        const ax = c[2] - c[0], ay = c[3] - c[1], bx = original[2] - original[0], by = original[3] - original[1];
        return { matched: true, cross: ax * by - ay * bx, dot: ax * bx + ay * by };
      });
      check(joins.length === 16 && joins.every(j => j.matched && Math.abs(j.cross) < 1e-8 && j.dot < 0), `${name} ${width} ${label}: production tangent joins`);
      const screenshot = `${name}-${width}-${label}.png`;
      await page.screenshot({ path: `${out}/${screenshot}` });
      check(endpoints.length === 16 && endpoints.every(e => e.distance <= 25), `${name} ${width} ${label}: cursor reach`);
      check(Math.hypot(active.pointer.x - active.eventPointer.x, active.pointer.y - active.eventPointer.y) < .1 && Math.hypot(active.pointer.x + active.bounds.x - x, active.pointer.y + active.bounds.y - y) < .75, `${name} ${width} ${label}: eased cursor settled`);
      check(active.litPixels > 1000, `${name} ${width} ${label}: painted tether visibility`);
      check(JSON.stringify(active.production) === JSON.stringify(baseline.production) && JSON.stringify(active.rings) === JSON.stringify(baseline.rings) && JSON.stringify(active.mark) === JSON.stringify(baseline.mark), `${name} ${width} ${label}: original fan/output/core fixed`);
      await page.mouse.move(width + 50, height + 50); await page.waitForTimeout(100);
      const fading = await read(); await page.waitForTimeout(1000); const exited = await read();
      check(fading.alphaSum > 0 && fading.alphaSum < active.alphaSum, `${name} ${width} ${label}: exit eases`);
      check(exited.alphaSum === 0 && exited.strokes.length === 0, `${name} ${width} ${label}: exit baseline`);
      results.push({ engine: name, width, height, label, pointer: { x, y }, easedPointer: active.pointer, eventPointer: active.eventPointer, bounds: active.bounds, endpoints, joins, litPixels: active.litPixels, alphaSum: active.alphaSum, fadingAlphaSum: fading.alphaSum, residualAlphaSum: exited.alphaSum, originalCoordinatesFixed: JSON.stringify(active.production) === JSON.stringify(baseline.production), coreAndRingsFixed: JSON.stringify(active.rings) === JSON.stringify(baseline.rings) && JSON.stringify(active.mark) === JSON.stringify(baseline.mark), screenshot, errors });
    }
    check(!errors.length, `${name} ${width}: browser errors`); await page.close();
  }
  await browser.close();
}
await writeFile(`${out}/results.json`, JSON.stringify({ results, failures }, null, 2) + '\n');
console.log(JSON.stringify({ cases: results.length, failures }));
if (failures.length) process.exitCode = 1;
