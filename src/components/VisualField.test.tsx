import { renderToStaticMarkup } from 'react-dom/server';

import { VisualField } from './VisualField';

describe('VisualField', () => {
  it('renders a dense layered signal field with a decorative canvas fallback', () => {
    const markup = renderToStaticMarkup(<VisualField phase="scatter" />);
    expect(markup).toContain('visual-field__particle-canvas');
    expect(markup).toContain('visual-field__fallback-particles');
    expect(markup).toContain('visual-field__pointer-light');
    expect(markup).toContain('data-pointer-interaction="enabled"');
    expect((markup.match(/visual-field__thread/g) ?? []).length).toBeGreaterThan(20);
    expect((markup.match(/visual-field__fallback-particle/g) ?? []).length).toBeGreaterThan(40);
  });

  it('keeps compact fields non-interactive while preserving layered threads', () => {
    const markup = renderToStaticMarkup(<VisualField phase="explore" compact />);
    expect(markup).toContain('data-pointer-interaction="disabled"');
    expect(markup).toContain('visual-field--compact');
    expect((markup.match(/visual-field__thread/g) ?? []).length).toBeGreaterThan(12);
  });
});
