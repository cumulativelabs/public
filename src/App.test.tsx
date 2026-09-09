import { renderToStaticMarkup } from 'react-dom/server';

import App from './App';
import { contactHref, site } from './content/site';

function renderApp() {
  return renderToStaticMarkup(<App />);
}

describe('Cumulative Labs homepage', () => {
  it('renders the complete public homepage with one page-level heading', () => {
    const markup = renderApp();
    expect((markup.match(/<h1[ >]/g) ?? []).length).toBe(1);
    expect(markup).toContain('Intelligence');
    expect(markup).toContain('Compounds.');
    expect(markup).toContain('Good Work Should');
    expect(markup).toContain('Carry Forward.');
    expect(markup).toContain('Illustrative example');
  });

  it('puts the work immediately after the hero and labels the concept as hypothetical', () => {
    const markup = renderApp();
    const ids = ['top', 'work', 'mission', 'approach', 'example', 'principles', 'contact'];
    const positions = ids.map((id) => markup.indexOf(`id="${id}"`));
    expect(positions.every((value, index) => value >= 0 && (index === 0 || value > positions[index - 1]))).toBe(true);
    expect(markup).toContain('Hypothetical scenario');
    expect(markup).toContain('not a product demonstration');
    expect(markup).not.toContain('tabindex="0"');
    expect(markup).toContain('<footer');
    expect(markup).toContain('inert=""');
  });

  it('renders every real navigation target without placeholder links', () => {
    const markup = renderApp();
    for (const id of ['mission', 'approach', 'work', 'principles', 'contact']) {
      expect(markup).toContain(`id="${id}"`);
    }
    expect(markup).not.toContain(['href=', '"#"'].join(''));
    expect(markup).toContain('href="#mission"');
    expect(markup).toContain('href="#approach"');
    expect(markup).toContain('href="#work"');
    expect(markup).toContain('href="#principles"');
  });

  it('uses the centralized public contact destination', () => {
    const markup = renderApp();
    expect(markup).toContain(`href="${contactHref}"`);
    expect(markup).toContain(site.contact.email);
  });

  it('presents both systems and all five principles', () => {
    const markup = renderApp();
    expect(markup).toContain('Private Research System');
    expect(markup).toContain('League Vector');
    expect(markup).toContain('Active Research');
    expect(markup).toContain('In Development');

    for (const principle of site.principles.items) {
      expect(markup).toContain(principle.title);
    }
  });

  it('includes the visual-phase architecture for later enhancement', () => {
    const markup = renderApp();
    for (const phase of ['scatter', 'explore', 'challenge', 'verify', 'preserve', 'compound']) {
      expect(markup).toContain(`data-visual-phase="${phase}"`);
    }
  });

  it('includes accessible navigation controls and a skip link', () => {
    const markup = renderApp();
    expect(markup).toContain('Skip to content');
    expect(markup).toContain('aria-controls="mobile-navigation"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-label="Open navigation menu"');
  });
});
