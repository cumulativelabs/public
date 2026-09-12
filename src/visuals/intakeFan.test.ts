import { readFileSync } from 'node:fs';
import { drawKnowledgeScene } from './drawKnowledgeScene';
import { createKnowledgeScene, type Pointer } from './knowledgeScene';
import production from './fixtures/production-intake.json';

const neutral: Pointer = { x: -1000, y: -1000, strength: 0 };
function paintedCurves(extension: number, attractor = neutral) {
  const curves: number[][] = [];
  let start = [0, 0];
  const methods = {
    moveTo: (x: number, y: number) => { start = [x, y]; },
    bezierCurveTo: (...coords: number[]) => { curves.push([...start, ...coords]); start = coords.slice(-2); },
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
  };
  const context = new Proxy(methods, { get: (target, key) => Reflect.get(target, key) ?? (() => {}) }) as unknown as CanvasRenderingContext2D;
  drawKnowledgeScene(context, createKnowledgeScene(), { cx: 0, cy: 0, scale: 1, flatten: 1, intakeExtension: extension }, 1440, 835, 28, neutral, true, attractor);
  return [...new Map(curves.map(c => [JSON.stringify(c), c])).values()];
}
function yAtX(curve: number[], x: number) {
  if (x < curve[0] || x > curve[6]) return null;
  const point = (t: number, offset: number) => (1-t)**3*curve[offset]+3*(1-t)**2*t*curve[2+offset]+3*(1-t)*t*t*curve[4+offset]+t**3*curve[6+offset];
  let lo = 0, hi = 1;
  for (let i = 0; i < 50; i++) { const mid = (lo+hi)/2; if (point(mid,0) < x) lo = mid; else hi = mid; }
  return point((lo+hi)/2,1);
}
const envelope = (curves: number[][], x: number) => {
  const values = curves.map(c => yAtX(c,x)).filter((y): y is number => y !== null);
  return { top: Math.min(...values), bottom: Math.max(...values) };
};

describe('production intake fan preservation', () => {
  it('retains every production SVG path verbatim and continues each along its tangent', () => {
    const svg = readFileSync('public/visuals/hero-nexus-anchored-desktop.svg','utf8');
    for (const path of production.svgPaths) expect(svg).toContain(path);
    const group = svg.match(/<g mask="url\(#intake-continuation\)"[^>]*>(.*?)<\/g>/)![1];
    const prefixes = [...group.matchAll(/d="M([^"]+)"/g)].map(m => m[1].replace('C','').split(/[ ,]+/).map(Number));
    expect(prefixes).toHaveLength(production.svgPaths.length);
    const original = production.svgPaths.map(p => p.match(/d="M([^"]+)"/)![1].replace('C','').split(/[ ,]+/).map(Number));
    prefixes.forEach((p,i) => {
      const c = original[i]; expect(p.slice(-2)).toEqual(c.slice(0,2));
      expect(p[0]).toBeLessThan(0);
      expect((p[6]-p[4])*(c[3]-c[1])-(p[7]-p[5])*(c[2]-c[0])).toBeCloseTo(0,1);
    });
    for (const x of [450,500,550,600,650,700,800,900,975]) {
      const a = envelope(original,x), b = envelope([...original,...prefixes],x);
      expect(b.top).toBeLessThanOrEqual(a.top); expect(b.bottom).toBeGreaterThanOrEqual(a.bottom);
    }
  });
  it('paints all 86 original live curves unchanged, with no narrower x-slice', () => {
    const current = paintedCurves(650);
    const original = current.filter(c => c[6] === -76);
    // Math.sin may differ in its last bits across JS runtimes. Keep the
    // immutable fixture comparison far below a rendered pixel (1e-8 units).
    expect(original).toHaveLength(production.canvasCurves.length);
    original.forEach((curve,i) => curve.forEach((value,j) => {
      expect(Math.abs(value-production.canvasCurves[i][j])).toBeLessThan(1e-8);
    }));
    for (const x of [-460,-420,-360,-300,-240,-180,-120,-80]) {
      const actual = envelope(original,x), expected = envelope(production.canvasCurves,x);
      expect(Math.abs(actual.top-expected.top)).toBeLessThan(1e-8);
      expect(Math.abs(actual.bottom-expected.bottom)).toBeLessThan(1e-8);
    }
  });
  it('attracts only nearby extensions and leaves the production fan and output fixed', () => {
    const resting = paintedCurves(650), active = paintedCurves(650,{x:-720,y:50,strength:1});
    const changed = active.filter((c,i) => JSON.stringify(c)!==JSON.stringify(resting[i]));
    expect(changed.length).toBeGreaterThan(0); expect(changed.length).toBeLessThan(production.canvasCurves.length);
    expect(changed.every(c => c[6] < -470)).toBe(true);
    expect(active.filter(c => c[6] >= -76)).toEqual(resting.filter(c => c[6] >= -76));
    expect(paintedCurves(0,{x:-720,y:50,strength:1})).toEqual(paintedCurves(0));
  });
});
