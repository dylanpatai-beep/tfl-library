/**
 * Recipe feed parser — turns a recipe entry (frontmatter + markdown body)
 * into the structured shape the TFL app reads from /recipes.json.
 * The markdown stays the single source of truth; this only reads it.
 */
export const SITE = 'https://library.thefightlife.fit';

/** Starter catalog tags the app filters on. Plain strings — add more by using them. */
export const RECIPE_CATALOG_TAGS = ['high-protein', 'creami', 'refuel', 'camp-meal'];

type Section = { heading: string; lines: string[] };

function sections(body: string): { intro: string[]; list: Section[] } {
  const intro: string[] = [];
  const list: Section[] = [];
  let cur: Section | null = null;
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^##\s+(.*)$/);
    if (m) { cur = { heading: m[1].trim(), lines: [] }; list.push(cur); continue; }
    (cur ? cur.lines : intro).push(line);
  }
  return { intro, list };
}

/** Strip markdown emphasis/links so the app gets plain text. */
export function plain(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

const abs = (p: string) => (p.startsWith('http') ? p : SITE + p);

function parseIngredients(sec: Section) {
  const groups: { name: string | null; items: string[] }[] = [];
  let g: { name: string | null; items: string[] } | null = null;
  for (const raw of sec.lines) {
    const line = raw.trim();
    const head = line.match(/^\*\*([^*]+?)\*\*:?$/);
    if (head) { g = { name: head[1].replace(/:$/, '').trim(), items: [] }; groups.push(g); continue; }
    const item = line.match(/^[-*]\s+(.*)$/);
    if (item) {
      if (!g) { g = { name: null, items: [] }; groups.push(g); }
      g.items.push(plain(item[1]));
      continue;
    }
    // Inline group like "**Mix-ins (per pint):** a, b"
    const inline = line.match(/^\*\*([^*]+?):\*\*\s*(.+)$/);
    if (inline) groups.push({ name: inline[1].trim(), items: inline[2].split(/,\s*/).map(plain) });
  }
  return groups.filter((x) => x.items.length);
}

function parseSteps(sec: Section) {
  return sec.lines
    .map((l) => l.trim().match(/^\d+[.)]\s+(.*)$/))
    .filter(Boolean)
    .map((m) => plain(m![1]));
}

function parseMacros(sec: Section | undefined) {
  const out: { carbs_g?: number; fat_g?: number; protein_g?: number; calories?: number; note: string | null; serving: string | null } = { note: null, serving: null };
  if (!sec) return out;
  const paren = sec.heading.match(/\(([^)]+)\)/);
  const noteParts: string[] = [];
  if (paren) noteParts.push(paren[1]);
  for (const raw of sec.lines) {
    const l = raw.trim();
    const row = l.match(/^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|$/);
    if (row) {
      const [k, v] = [row[1].toLowerCase(), row[2]];
      const n = parseFloat(v.replace(/[^\d.]/g, ''));
      if (/^-+$/.test(k.replace(/\s/g, ''))) continue;
      if (!v && !out.serving) { out.serving = plain(row[1]); continue; }
      if (k.startsWith('calorie')) out.calories = n;
      else if (k.startsWith('protein')) out.protein_g = n;
      else if (k.startsWith('carb')) out.carbs_g = n;
      else if (k.startsWith('fat')) out.fat_g = n;
      continue;
    }
    if (l && !l.startsWith('|') && !/^[-*]\s/.test(l) && !/^\*\*Tip/i.test(l)) noteParts.push(plain(l));
  }
  out.note = noteParts.length ? noteParts.join(' ') : null;
  return out;
}

function parseYield(text: string): string | null {
  const y = text.match(/\*\*Yield:\*\*\s*([^\n]+)/) ?? text.match(/\*\*(Makes [^*]+?)\*\*/);
  return y ? plain(y[1]).replace(/\.$/, '') : null;
}

export function toFeedRecipe(entry: any) {
  const d = entry.data;
  const body: string = entry.body ?? '';
  const { intro, list } = sections(body);
  const find = (re: RegExp) => list.find((s) => re.test(s.heading));
  const ing = find(/^ingredients/i);
  const method = find(/^(method|steps|directions|instructions)/i);
  const macros = parseMacros(find(/^macros/i));
  const why = find(/^why/i);

  const images = [...body.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1]);
  const cards = (find(/^recipe cards/i)?.lines.join('\n').match(/\(([^)\s]+)\)/g) ?? []).map((m) => abs(m.slice(1, -1)));
  const heroPath = d.hero ?? images.find((p) => !cards.includes(abs(p))) ?? null;
  const noteLines = [...intro, ...(why?.lines ?? [])].map((l) => l.trim()).filter((l) => /^>/.test(l)).map((l) => plain(l.replace(/^>\s*/, '')));

  return {
    slug: entry.id,
    title: d.title,
    summary: d.summary,
    date: d.date.toISOString().slice(0, 10),
    tags: d.tags,
    mealType: d.meal,
    difficulty: d.difficulty,
    totalTimeMin: d.time_min,
    yield: parseYield(body),
    servingSize: macros.serving,
    calories: d.calories ?? macros.calories ?? null,
    protein_g: d.protein_g ?? macros.protein_g ?? null,
    carbs_g: macros.carbs_g ?? null,
    fat_g: macros.fat_g ?? null,
    macroNote: macros.note,
    notes: noteLines,
    heroImage: heroPath ? abs(heroPath) : null,
    cardImages: cards,
    ingredientGroups: ing ? parseIngredients(ing) : [],
    ingredients: ing ? parseIngredients(ing).flatMap((g) => g.items) : [],
    ingredientsHeading: ing ? ing.heading : null,
    steps: method ? parseSteps(method) : [],
    url: `${SITE}/recipes/${entry.id}/`,
  };
}
