import { readFileSync } from 'node:fs';
import { NEXUS_ART, NEXUS_PORT_RADIUS, artPointInScene, nexusScale } from './nexusGeometry';
import { drawKnowledgeScene } from './drawKnowledgeScene';
import { createKnowledgeScene, type Pointer } from './knowledgeScene';

type Stroke = { start: number[]; control: number[] };
function render(pointer: Pointer, scale = 1) {
  const arcs: number[][] = []; const strokes: Stroke[] = []; let start: number[] = [];
  const gradient = { addColorStop: () => undefined };
  const context = new Proxy({}, {
    get: (_target, key) => {
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => gradient;
      if (key === 'arc') return (...args: number[]) => arcs.push(args);
      if (key === 'moveTo') return (...args: number[]) => { start = args; };
      if (key === 'bezierCurveTo') return (...args: number[]) => strokes.push({ start, control: args });
      return () => undefined;
    },
    set: () => true,
  }) as CanvasRenderingContext2D;
  drawKnowledgeScene(context, createKnowledgeScene(), { cx: 500, cy: 350, scale, flatten: 1 }, 1100, 800, 8, pointer, false);
  return { arcs, strokes };
}

describe('one Nexus coordinate plane', () => {
  it.each([false, true])('maps the native art center and both visible ports to the live scene: mobile=%s', mobile => {
    const art = mobile ? NEXUS_ART.mobile : NEXUS_ART.desktop;
    expect(artPointInScene(art.cx, art.cy, mobile)).toEqual({ x: 0, y: 0 });
    expect(artPointInScene(art.inlet, art.cy, mobile).x).toBe(-NEXUS_PORT_RADIUS);
    expect(artPointInScene(art.outlet, art.cy, mobile).x).toBe(NEXUS_PORT_RADIUS);
    const asset = readFileSync(new URL(`../../public/visuals/hero-nexus-anchored-${mobile ? 'mobile' : 'desktop'}.svg`, import.meta.url), 'utf8');
    expect(asset).toContain(`id="nexus-inlet-glow" cx="${art.inlet}" cy="${art.cy}"`);
    expect(asset).toContain(`data-nexus-cx="${art.cx}" data-nexus-cy="${art.cy}"`);
    expect(asset).toContain('preserveAspectRatio="none"');
    expect(asset).toMatch(new RegExp(`M${art.outlet}[ ,]`));
  });
  it('keeps responsive scale independent of variable copy height', () => {
    expect(nexusScale(432, 1440)).toBeCloseTo(432 / 390);
    expect(nexusScale(130.4, 390)).toBeCloseTo(0.78);
    expect(nexusScale(130.4, 768)).toBe(0.88);
  });
  it.each([1.1, 0.78])('actually draws every permanent ring at the logo center at scale %s', scale => {
    const { arcs } = render({ x: 400, y: 350, strength: 1 }, scale);
    for (const radius of [76, 85.5, 95, 104.5, 114, 123.5]) {
      const rings = arcs.filter(a => Math.abs(a[2] - radius * scale) < 0.0001);
      expect(rings).toHaveLength(1);
      expect(rings[0].slice(0, 2)).toEqual([500, 350]);
    }
  });
  it('keeps the intake anchored while the actual rendered paths respond to the pointer', () => {
    const baseline = render({ x: 0, y: 0, strength: 0 });
    const moved = render({ x: 340, y: 330, strength: 1 });
    expect(moved.strokes).not.toEqual(baseline.strokes);
    const incoming = moved.strokes.filter(s => s.control[4] < 500);
    expect(incoming.length).toBeGreaterThan(80);
    expect(incoming.every(s => s.control[4] === 500 - NEXUS_PORT_RADIUS)).toBe(true);
    expect(incoming.every(s => Math.abs(s.control[5] - 350) <= 2.5)).toBe(true);
  });
});
