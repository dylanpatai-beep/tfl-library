/**
 * Extract the Supplement Field Guide dataset to JSON for the companion app.
 *
 * The interactive guide (public/supplement-field-guide/index.html) embeds its
 * data as two JS array literals (CATEGORIES and SUPPLEMENTS). This script
 * slices them out, evaluates them in a sandbox, and writes
 * public/api/field-guide.json. The HTML stays the source of truth and is
 * never modified.
 *
 * Runs as the first step of `npm run build` and fails the build loudly if
 * the markers move, so a stale or broken feed can never ship silently.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = join(root, 'public/supplement-field-guide/index.html');
const outPath = join(root, 'public/api/field-guide.json');

const html = readFileSync(htmlPath, 'utf8');

function sliceArray(name) {
  const startMarker = `const ${name} = [`;
  const start = html.indexOf(startMarker);
  if (start === -1) {
    throw new Error(
      `extract-field-guide: marker "${startMarker}" not found in ${htmlPath} — did the guide's HTML change?`
    );
  }
  const end = html.indexOf('\n];', start);
  if (end === -1) {
    throw new Error(`extract-field-guide: closing "];" for ${name} not found`);
  }
  const literal = html.slice(start + startMarker.length - 1, end + 2);
  return vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });
}

const categories = sliceArray('CATEGORIES');
const supplements = sliceArray('SUPPLEMENTS');

// Sanity floor: the guide ships 14 categories / ~63 supplements. Counts far
// below that mean the slice grabbed the wrong thing — refuse to write.
if (categories.length < 10 || supplements.length < 50) {
  throw new Error(
    `extract-field-guide: suspicious counts (categories=${categories.length}, supplements=${supplements.length}) — refusing to write`
  );
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), categories, supplements }) + '\n'
);

console.log(
  `field-guide.json: ${categories.length} categories, ${supplements.length} supplements → ${outPath}`
);
