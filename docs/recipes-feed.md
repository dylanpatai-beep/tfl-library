# Recipe feed (`/recipes.json`)

The TFL app's recipe catalog reads **https://library.thefightlife.fit/recipes.json**.
It's built from the same markdown files as the recipe pages (`src/content/recipes/*.md`),
so editing a recipe and publishing it updates the site and the app together. Only
`status: published` recipes are included.

Check it after a build: `npm run build && node tools/validate-recipes-feed.mjs`.

## Top level

| Field | Meaning |
|---|---|
| `version` | Feed format version (currently `1`). Bumped only on breaking changes. |
| `generatedAt` | When the site was built (ISO time). |
| `updated` | Newest recipe date (YYYY-MM-DD). |
| `count` | Number of recipes. |
| `catalogTags` | Starter filter tags: `high-protein`, `creami`, `refuel`, `camp-meal`. |
| `recipes` | List of recipes (below). |

## Per recipe

`slug`, `title`, `summary`, `date`, `tags` (all tags; app filters on any), `mealType`
(breakfast/lunch/dinner/snack/shake), `difficulty`, `totalTimeMin`, `yield` (e.g. "Makes 4 bowls"),
`servingSize`, `calories`, `protein_g`, `carbs_g`, `fat_g` (null when not given), `macroNote`
(e.g. "approximate; varies by brand"), `notes` (callout lines such as size notes),
`heroImage` (absolute URL or null), `cardImages` (absolute URLs), `ingredientGroups`
(`[{ name | null, items[] }]`), `ingredients` (flat list), `ingredientsHeading`,
`steps` (ordered plain-text list), `url` (recipe page).

## How the markdown is read

- **Ingredients:** bullets under the `## Ingredients…` heading. A bold line on its own
  (`**Crack sauce**`) starts a group; `**Mix-ins (…):** a, b` becomes its own group.
- **Steps:** numbered lines under `## Method`.
- **Macros:** frontmatter `calories`/`protein_g` win; carbs/fat come from the
  `## Macros…` table. The heading's (parenthesis) and the paragraph under it become `macroNote`.
- **Yield:** `**Yield:** …` or `**Makes …**`.
- **Hero:** optional frontmatter `hero: /images/recipes/<slug>/hero.jpg`, else the first
  image in the body that isn't a recipe card. Cards are images under `## Recipe cards`.
- **Tags:** the normal `tags:` list. Add catalog tags there; new tags need no code change.
