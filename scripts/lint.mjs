import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const scanRoots = ['src', 'docs', 'public', '.github', 'scripts'];
const textExtensions = new Set(['.ts', '.tsx', '.css', '.html', '.md', '.xml', '.txt', '.json', '.yml', '.yaml', '.mjs', '.svg', '.webmanifest']);
const prohibitedFiles = /\.(?:zip|tar|gz|7z|rar|ttf|otf|woff2?|eot)$/i;
const contactLiteral = ['accounts', 'cumulativelabs.ai'].join('@');
const prohibitedFragments = [
  ['hello', 'cumulativelabs.com'].join('@'),
  ['href=', '"#"'].join(''),
  ['lorem', 'ipsum'].join(' '),
  ['placeholder', 'copy'].join(' '),
  ['TO', 'DO'].join(''),
];

const failures = [];
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory)) {
    const path = join(directory, entry);
    const info = await stat(path);
    if (info.isDirectory()) await walk(path);
    else files.push(path);
  }
}

for (const scanRoot of scanRoots) await walk(join(root, scanRoot));

let contactOccurrences = 0;
for (const file of files) {
  const display = relative(root, file);
  if (prohibitedFiles.test(file)) failures.push(`${display}: prohibited archive or font file`);
  if (!textExtensions.has(extname(file)) && !file.endsWith('.webmanifest')) continue;

  const content = await readFile(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (/\s+$/.test(line) && line.length > 0) failures.push(`${display}:${index + 1}: trailing whitespace`);
    if (line.includes('\t')) failures.push(`${display}:${index + 1}: tab character`);
  });

  for (const fragment of prohibitedFragments) {
    if (content.toLowerCase().includes(fragment.toLowerCase())) {
      failures.push(`${display}: contains prohibited fragment “${fragment}”`);
    }
  }

  contactOccurrences += content.split(contactLiteral).length - 1;
}

if (contactOccurrences !== 1) {
  failures.push(`Public contact address must appear exactly once in scanned source; found ${contactOccurrences}`);
}

if (failures.length > 0) {
  console.error('Lint failed:\n' + failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Lint passed across ${files.length} public files.`);
