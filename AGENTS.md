# TFL Library — library.thefightlife.fit

Public reference library for The Fight Life. Static Astro site, no CMS, no accounts.
Four lanes of markdown content + one embedded interactive tool. Owner is Dylan Patai
(not a coder) — explain decisions in plain terms, keep him directing, not coding.

## The one workflow that matters: adding content

1. Create the file: `npm run new -- <lane> "Title"` (scaffolds valid frontmatter as a draft),
   or write `src/content/<lane>/<slug>.md` by hand following an existing entry.
2. Fill in frontmatter + body. Drafts (`status: draft`) show in `npm run dev` with a badge,
   and NEVER appear in the published site.
3. Flip `status: published`, then commit and push to `main`:
   `library: add <title>` — GitHub Actions rebuilds and deploys in ~1 minute.

Raw material often starts in the command-center intake pipeline (yt2md, doc2md, etc.).
The path is: intake output (markdown w/ thesis) → rewrite as a library entry here →
publish. Never link or copy raw intake files directly; library entries are finished,
public writing in Dylan's voice (peer not guru, direct, no "level up"/"game-changer").

## The four lanes

| Lane | Folder | Chip filters |
|------|--------|--------------|
| Recipes | `src/content/recipes/` | meal, difficulty |
| Supplements | `src/content/supplements/` | category, evidence |
| Techniques | `src/content/techniques/` | discipline, level, type |
| Mobility & S&C | `src/content/mobility/` | focus, body_area, level |

## Where things live

- `src/content.config.ts` — **frontmatter schemas (single source of truth).** A wrong or
  missing field fails the build with a readable error. Change schemas here only.
- `src/lib/lanes.ts` — lane registry: names, copy, icons, filters, badges, meta strips,
  tool banners. Add/change a lane here, nowhere else.
- `src/styles/global.css` — **Brand Foundation v1.3** (`1 Brand/formats/Design.pdf` in the
  command center). Change colours via tokens only. See "The brand system" below.
- `src/pages/[lane]/index.astro` — lane index (chips + search). `[slug].astro` — entry page.
- `public/supplement-field-guide/index.html` — the interactive Supplement Field Guide,
  self-contained HTML authored outside this repo. Its category/evidence taxonomy is
  mirrored by the supplements schema — **if the guide's taxonomy changes, update
  `content.config.ts` + `FIELD_ORDER` in `lanes.ts` to match.**
- `public/energy-calculator/index.html` — the Energy Calculator (BMR + NEAT + per-session
  MET costing), surfaced as the Mobility & S&C tool banner. Same deal as the Field Guide:
  self-contained HTML authored outside this repo, dropped in whole. Source of truth lives
  in the command center at `2 Make/newsletter/tfl-energy-calculator.html` — edit it there
  and re-copy, don't fork it here. Both tools carry their lane's pillar accent (the
  calculator red, the guide green) in their own `:root` blocks.
- `tools/printables/` — source HTML for downloadable one-pagers (e.g. The Elastic Engine
  cheat sheet + week map). Edit the HTML, run `node tools/render-printables.mjs` (needs
  Google Chrome + `npm ci` for fonts), commit the outputs in `public/downloads/`. An entry
  links its printable via the optional `printable: { pdf, png }` frontmatter (renders a
  download banner). Optional `layout: program` styles the entry's numbered lists as a
  session sheet and a list under a `## The Week` heading as a 7-day map.
- `.github/workflows/deploy.yml` — build + deploy to GitHub Pages on push to main.

## The brand system (Brand Foundation v1.3)

Two layers. **Constants** are the brand and never move; **one accent** varies per pillar.

| Constant | Hex | Use |
|---|---|---|
| Ground | `#0B0C0F` | everything sits on this |
| Type | `#F7F8FA` | headlines and body; muted `#8A929E`, hairlines `#5C6470` |
| Surface | `#0A2A6B` | navy. A *field* — masthead, type chip. Never a pillar chip. |
| Gold | gradient `#F7E7A6 → #C9A227 → #8C6B1F` | hairlines that mark closure, the sign-off tick |
| Platinum | gradient `#FBFAF8 → #DEDCD7 → #A9A6A0` | the frame, the monogram |

Both metals are **gradients or they are not the metal** — never a flat fill. Together they
stay scarce (~4% of a surface), gold outermost.

Each lane owns one pillar, set in `lanes.ts` and scoped by `<body data-pillar>`:

| Lane | Pillar | Accent | Type on it |
|---|---|---|---|
| Techniques | 01 · The Art | `#3366F0` blue | white, 19px+ |
| Mobility & S&C | 02 · The Vehicle | `#D91F2C` red | white, **never small type** |
| Recipes | 03 (keeps its own "The Fuel" name) | `#FFD400` yellow | dark, any size |
| Supplements | 04 · The Stack | `#14A24E` green | dark, any size |

**The numeral is the pillar, not the nav position** — so the home row reads 03 · 04 · 01 · 02.
That is deliberate: the order is the Performance Hierarchy (skill first, chemistry last) and
the numeral is how it stays visible. Nav order is unchanged on purpose.

**The accent goes in four placements and nowhere else** — the chip, the corner rules, the
wash, the numeral (`.f-chip`, `.f-corner`, `.f-wash`, `.f-num`; see `.frame` in global.css).
Plus three affordances that are fills or rules, never type: the active filter chip, the focus
ring, the row hover wash. Red (3.9:1) and blue (4.0:1) are under the small-type floor, so
**no accent is ever set as label or body type anywhere.** Small labels use `--type-muted`.

Other standing rules: one accent per frame — a frame showing two pillars shows neither; the
accent stays under 20% of any surface; the wash never sits behind a headline (that is what
`--wash-h` and its mask enforce); no tints or shades of an accent — one flat hex per pillar,
at 15-20% opacity only in the wash and the numeral; there is no seventh pillar.

Below the 120px floor the badge is not shrunk — **the type chip takes over** (`.typechip`:
chamfered navy plate, gold edge). That is every use on this site, plus the favicon. The
raster badge master and the sub-floor monogram are listed as STILL OWED in the doc and are
not in this repo.

## Rules

- Search is Pagefind, generated during `npm run build` — it does not exist in dev
  (the search box falls back to title/summary/tag matching; that is expected).
- The supplements evidence scale (strong/moderate/limited/experimental) and its colors
  are shared with the Field Guide. Don't invent new levels. The four map onto the brand
  wheel in its fixed order: 04 green, 03 yellow, 05 orange, 06 purple.
- In the Field Guide, "In Stack" status is **gold**, not the accent — it is a different
  scale from the evidence rating and must not share green with "strong evidence".
- Entry slugs come from filenames. Don't rename published files (breaks URLs).
- `npm run build` locally before pushing anything structural.
- Verify: `npm run dev` → check home, the lane, and the entry; drafts show badged.
