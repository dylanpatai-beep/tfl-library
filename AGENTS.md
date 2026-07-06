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
- `src/styles/global.css` — brand tokens ported from the Fight Life OS pillars site
  (`--fight-red #CC0000`, `--black #0A0A0A`, Bebas/Inter/JetBrains Mono). Change colors
  via tokens only.
- `src/pages/[lane]/index.astro` — lane index (chips + search). `[slug].astro` — entry page.
- `public/supplement-field-guide/index.html` — the interactive Supplement Field Guide,
  self-contained HTML authored outside this repo. Its category/evidence taxonomy is
  mirrored by the supplements schema — **if the guide's taxonomy changes, update
  `content.config.ts` + `FIELD_ORDER` in `lanes.ts` to match.**
- `.github/workflows/deploy.yml` — build + deploy to GitHub Pages on push to main.

## Rules

- Search is Pagefind, generated during `npm run build` — it does not exist in dev
  (the search box falls back to title/summary/tag matching; that is expected).
- The supplements evidence scale (strong/moderate/limited/experimental) and its colors
  are shared with the Field Guide. Don't invent new levels.
- Entry slugs come from filenames. Don't rename published files (breaks URLs).
- `npm run build` locally before pushing anything structural.
- Verify: `npm run dev` → check home, the lane, and the entry; drafts show badged.
