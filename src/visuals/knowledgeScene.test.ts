import { createKnowledgeScene, displace, linkOpacity, mapPoint, mapPointer, MAX_DISPLACEMENT, POINTER_RADIUS } from './knowledgeScene';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { HeroKnowledgeField } from '../components/HeroKnowledgeField';

describe('decorative cumulative knowledge scene', () => {
  it('is deterministic and has a fixed linear-size graph', () => {
    const a = createKnowledgeScene();
    expect(a).toEqual(createKnowledgeScene());
    expect(a.nodes.length).toBeLessThan(150);
    expect(a.links.length).toBeLessThan(150);
    expect(a.strata).toHaveLength(5);
    expect(a.routes).toHaveLength(3);
    expect(a.links.every(l => l.a >= 0 && l.b < a.nodes.length)).toBe(true);
  });
  it('contains raw signals, evidence, retained structure, and future branches', () => {
    expect(new Set(createKnowledgeScene().nodes.map(n => n.kind)).size).toBe(4);
  });
  it('lets unsupported connections disappear instead of flashing forever', () => {
    const link = createKnowledgeScene().links.find(l => l.kind === 'rejected')!;
    expect(linkOpacity(link, 3)).toBeGreaterThan(0);
    expect(linkOpacity(link, 12)).toBe(0);
    expect(linkOpacity(link, 120)).toBe(0);
  });
  it('preserves supported connections over subsequent work without resetting a loop', () => {
    const link = createKnowledgeScene().links.find(l => l.kind === 'retained' && l.arrival > 0)!;
    expect(linkOpacity(link, 28)).toBeGreaterThan(linkOpacity(link, 0));
    expect(linkOpacity(link, 300)).toBe(linkOpacity(link, 28));
  });
  it('builds future work only after retained structure', () => {
    const future = createKnowledgeScene().links.find(l => l.kind === 'future')!;
    expect(linkOpacity(future, 0)).toBe(0);
    expect(linkOpacity(future, 12)).toBe(0);
    expect(linkOpacity(future, 28)).toBeGreaterThan(0.3);
  });
  it('maps scrolled, offset, and CSS-scaled canvas bounds correctly', () => {
    expect(mapPointer({ x: 300, y: 100 }, { left: 100, top: -200, width: 800, height: 600 }, 1600, 1200)).toEqual({ x: 400, y: 600 });
    expect(mapPoint({ x: 10, y: -20 }, { cx: 200, cy: 300, scale: 2, flatten: 0.5 })).toEqual({ x: 220, y: 280 });
  });
  it('has bounded local interaction with no cursor singularity', () => {
    const pointer = { x: 0, y: 0, strength: 1 };
    for (let x = -180; x <= 180; x += 3) {
      const next = displace({ x, y: 0 }, pointer, 1);
      expect(Number.isFinite(next.x) && Number.isFinite(next.y)).toBe(true);
      expect(Math.hypot(next.x - x, next.y)).toBeLessThanOrEqual(MAX_DISPLACEMENT * 1.01);
    }
    expect(displace({ x: POINTER_RADIUS + 1, y: 0 }, pointer, 1).influence).toBe(0);
  });
  it('lets evidence yield more than the stable archive', () => {
    const p = { x: 40, y: 0 }; const pointer = { x: 0, y: 0, strength: 1 };
    expect(Math.abs(displace(p, pointer, 1).x - p.x)).toBeGreaterThan(10);
    expect(Math.abs(displace(p, pointer, 0.1).x - p.x)).toBeLessThan(2.1);
    expect(displace(p, { ...pointer, strength: 0 }, 1).x).toBe(40);
  });
  it('prerenders an accessible decorative fallback without claiming to be telemetry', () => {
    const html = renderToStaticMarkup(createElement(HeroKnowledgeField));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-conceptual="true"');
    expect(html).toContain('focusable="false"');
    expect(html).toContain('hero-knowledge__fallback');
    expect(html).not.toContain('tabindex');
    expect(html).not.toContain('compact');
  });
});
