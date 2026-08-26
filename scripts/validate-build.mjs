import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const contactLiteral = ['accounts', 'cumulativelabs.ai'].join('@');
const requiredFiles = [
  'index.html',
  'robots.txt',
  'sitemap.xml',
  'site.webmanifest',
  'brand/cumulative-labs-horizontal.svg',
  'brand/cumulative-labs-symbol.svg',
  'favicons/favicon.svg',
  'favicons/apple-touch-icon.png',
  'og/cumulative-labs-og.jpg',
];

const failures = [];
for (const file of requiredFiles) {
  try {
    const info = await stat(join(dist, file));
    if (!info.isFile() || info.size === 0) failures.push(`${file} is missing or empty`);
  } catch {
    failures.push(`${file} is missing`);
  }
}

const textFiles = [];
async function walk(directory) {
  for (const entry of await readdir(directory)) {
    const path = join(directory, entry);
    const info = await stat(path);
    if (info.isDirectory()) await walk(path);
    else if (/\.(?:html|js|css|svg|xml|txt|webmanifest)$/.test(path)) textFiles.push(path);
  }
}
await walk(dist);
const output = (await Promise.all(textFiles.map((file) => readFile(file, 'utf8')))).join('\n');

for (const text of [
  'Intelligence',
  'Private Research System',
  'League Vector',
  'Evidence Over Confidence',
  contactLiteral,
]) {
  if (!output.includes(text)) failures.push(`Production output is missing required text: ${text}`);
}
for (const text of [
  ['hello', 'cumulativelabs.com'].join('@'),
  ['href=', '"#"'].join(''),
  ['lorem', 'ipsum'].join(' '),
]) {
  if (output.toLowerCase().includes(text.toLowerCase())) failures.push(`Production output contains prohibited text: ${text}`);
}

if (failures.length > 0) {
  console.error('Build validation failed:\n' + failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Build validation passed across ${textFiles.length} text assets.`);
