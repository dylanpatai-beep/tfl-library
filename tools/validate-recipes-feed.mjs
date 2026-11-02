// Checks dist/recipes.json after `npm run build`. Fails on missing title/ingredients/steps;
// warns (doesn't fail) on a missing hero photo, since not every recipe has one yet.
import { readFileSync } from 'node:fs';
const feed = JSON.parse(readFileSync('dist/recipes.json', 'utf8'));
let bad = 0;
for (const r of feed.recipes) {
  const miss = ['title', 'ingredients', 'steps'].filter((k) => !r[k] || (Array.isArray(r[k]) && !r[k].length));
  if (miss.length) { bad++; console.error(`✗ ${r.slug}: missing ${miss.join(', ')}`); }
  if (!r.heroImage) console.warn(`! ${r.slug}: no hero photo`);
}
console.log(`${feed.recipes.length} recipes checked, ${bad} with errors`);
process.exit(bad ? 1 : 0);
