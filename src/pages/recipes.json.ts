/**
 * /recipes.json — structured recipe feed for the TFL app's recipe catalog.
 * Built at deploy time from the same markdown as the Library pages, so one
 * edit updates both. Published recipes only. Format: docs/recipes-feed.md.
 */
import type { APIRoute } from 'astro';
import { getLane } from '../lib/lanes';
import { getLaneEntries } from '../lib/content';
import { toFeedRecipe, RECIPE_CATALOG_TAGS } from '../lib/recipe-feed';

export const GET: APIRoute = async () => {
  const entries = await getLaneEntries(getLane('recipes'));
  const recipes = entries.map(toFeedRecipe);
  const updated = recipes.reduce((a, r) => (r.date > a ? r.date : a), '');
  return new Response(
    JSON.stringify({
      version: 1,
      generatedAt: new Date().toISOString(),
      updated,
      count: recipes.length,
      catalogTags: RECIPE_CATALOG_TAGS,
      recipes,
    }, null, 2),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
