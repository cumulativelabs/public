import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

// Render public content at build time. No listening server or runtime service.
const temporary = await mkdtemp(new URL('../.prerender-', import.meta.url));
try {
  await build({
    configFile: false,
    plugins: [react()],
    logLevel: 'error',
    build: {
      ssr: 'src/App.tsx',
      outDir: temporary,
      rollupOptions: { output: { entryFileNames: 'render.mjs' } },
    },
  });
  const { default: App } = await import(pathToFileURL(join(temporary, 'render.mjs')).href);
  const path = new URL('../dist/index.html', import.meta.url);
  const html = await readFile(path, 'utf8');
  const marker = '<div id="root"></div>';
  if (!html.includes(marker)) throw new Error('Expected an empty build root before prerendering.');
  await writeFile(path, html.replace(marker, () => `<div id="root">${renderToString(createElement(App))}</div>`));
  console.log('Prerendered the complete public homepage.');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
