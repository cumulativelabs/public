import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const assets = [
  {
    sources: ['assets/raster/apple-touch-icon.png.b64'],
    destination: 'public/favicons/apple-touch-icon.png',
  },
  {
    sources: [
      'assets/raster/cumulative-labs-og.jpg.b64.001',
      'assets/raster/cumulative-labs-og.jpg.b64.002',
      'assets/raster/cumulative-labs-og.jpg.b64.003',
      'assets/raster/cumulative-labs-og.jpg.b64.004',
      'assets/raster/cumulative-labs-og.jpg.b64.005',
    ],
    destination: 'public/og/cumulative-labs-og.jpg',
  },
];

for (const asset of assets) {
  const encodedParts = await Promise.all(
    asset.sources.map(async (source) =>
      (await readFile(resolve(root, source), 'utf8')).replace(/\s+/g, ''),
    ),
  );
  const destination = resolve(root, asset.destination);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(encodedParts.join(''), 'base64'));
}

console.log(`Generated ${assets.length} optimized raster assets.`);
