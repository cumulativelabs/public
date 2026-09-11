import { drawIntakeTethers } from './drawKnowledgeScene';

const layout = { cx: 1080, cy: 430, scale: 1, flatten: 1, intakeExtension: 650 };
function paint(x: number, y: number, strength = 1, disabled = false, extension = 650) {
  const tips: number[][] = [];
  const context = new Proxy({
    bezierCurveTo: (...a: number[]) => tips.push(a.slice(-2)),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
  }, { get: (o, k) => Reflect.get(o, k) ?? (() => {}) }) as unknown as CanvasRenderingContext2D;
  drawIntakeTethers(context, { ...layout, intakeExtension: extension }, 1440, 900, { x, y, strength }, disabled);
  return tips;
}

describe('interaction-only cursor reach', () => {
  it('paints 16 deterministic tips at a distant cursor, including vertical offsets', () => {
    for (const [x, y] of [[120, 710], [150, 220], [20, 430]]) {
      const tips = paint(x, y);
      expect(tips).toHaveLength(16);
      expect(tips.every(([a, b]) => Math.hypot(a - x, b - y) <= 20)).toBe(true);
      expect(paint(x, y)).toEqual(tips);
    }
  });
  it('leaves no tethers for exit, disabled policies, mobile or the output side', () => {
    expect(paint(120, 430, 0)).toEqual([]);
    expect(paint(120, 430, 1, true)).toEqual([]);
    expect(paint(120, 430, 1, false, 0)).toEqual([]);
    expect(paint(1200, 430)).toEqual([]);
  });
});
