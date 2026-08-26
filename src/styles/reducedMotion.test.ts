import { readFile } from 'node:fs/promises';

describe('reduced motion', () => {
  it('provides an explicit reduced-motion presentation', async () => {
    const css = await readFile(new URL('./global.css', import.meta.url), 'utf8');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('scroll-behavior: auto');
    expect(css).toContain('animation-duration: 0.01ms');
  });
});
