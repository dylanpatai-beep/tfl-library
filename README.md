# The Fight Life — Library

The public reference shelf at **library.thefightlife.fit**. Four lanes — Recipes,
Supplements, Techniques, Mobility & S&C — plus the interactive Supplement Field Guide.
No CMS, no accounts: every entry is a markdown file in this repo, and pushing to
`main` publishes the site automatically.

## Where this fits

The Fight Life runs one funnel. **Direction lives in one place:
[`tfl-app/docs/DIRECTION.md`](https://github.com/dylanpatai-beep/tfl-app/blob/main/docs/DIRECTION.md)** (private repo). If this README disagrees with it,
it wins.

1. **Newsletter** (Beehiiv, [thefightlife.fit](https://thefightlife.fit)) and reposted
   shorts bring people here for free.
2. **This site** gives free tools and free outputs: your numbers, your stack, a program.
3. **The paid TFL app** is the deeper version of each tool: it tracks it every day and
   adjusts. Every tool here has an in-app upgrade path (the map is in DIRECTION.md).

Email capture is the link between them: every tool result, the footer, and the empty-lane
messages should end in a Beehiiv signup. *(Not wired up yet; it's Phase 1 work.)*

## Add an entry in 60 seconds

The easiest way: open this folder in Claude Code and say what you want —
*"add a recipe: my post-weigh-in rice bowl, here's roughly how I make it…"* —
and review what it writes. Or by hand:

```sh
npm run new -- recipes "Post-Weigh-In Rice Bowl"   # scaffolds the file as a draft
# … fill in the file it created under src/content/recipes/ …
# … change  status: draft  →  status: published …
git add -A && git commit -m "library: add Post-Weigh-In Rice Bowl" && git push
```

About a minute later it's live. Lanes: `recipes`, `supplements`, `techniques`, `mobility`.

**Drafts are safe.** Anything with `status: draft` is visible only on your machine
(`npm run dev`, with a red DRAFT badge) and never on the live site. The eight sample
entries in the repo are drafts — keep them as templates or delete them.

**The build protects you.** If a file has a typo in its frontmatter (a meal type that
doesn't exist, a missing field), the build fails and tells you the exact file and field.
The live site keeps running the last good version; nothing breaks in public.

## Working on it

```sh
npm run dev       # local preview at localhost:4321 (drafts visible)
npm run build     # what the deploy runs: build + search index
npm run preview   # view the built site exactly as production will serve it
```

## How it's put together (plain terms)

- **Astro** turns the markdown files into a fast static site — plain HTML, no servers.
- **Search** (Pagefind) is baked in at build time — it searches full entry text,
  scoped to each lane, with zero backend.
- **Design** is **Brand Foundation v1.3**: navy, gold, and platinum on a near-black
  ground, one accent colour per lane, Bebas Neue + Inter + JetBrains Mono. All colors
  live as tokens at the top of `src/styles/global.css`; the rules are in `AGENTS.md`.
  This is the brand for the whole of TFL (the app is moving to it too).
- **The Supplement Field Guide** (`public/supplement-field-guide/`) is the standalone
  interactive tool, served as-is at `/supplement-field-guide/` and featured on the
  Supplements lane. The lane's categories and evidence scale mirror it exactly.
- **The Energy Calculator** (`public/energy-calculator/`) is the second tool, featured
  on the Mobility & S&C lane.
- **JSON feeds** (`/api/index.json`, `/api/<lane>.json`, `/api/field-guide.json`) are
  what the TFL app reads. Don't break their shape without updating the app.
- **Deploys** run on GitHub Actions → GitHub Pages on every push to `main`
  (`.github/workflows/deploy.yml`).

More detail for working sessions: see `CLAUDE.md`.
