/**
 * Static JSON feed for the companion app — one file per lane.
 * Prerendered at build time; GitHub Pages serves them as plain files
 * (/api/recipes.json, /api/supplements.json, …).
 *
 * Reuses getLaneEntries, so the site's one rule carries over:
 * drafts never appear in a published build.
 */
import type { APIRoute } from 'astro';
import { LANES, getLane } from '../../lib/lanes';
import { getLaneEntries } from '../../lib/content';

export function getStaticPaths() {
  return LANES.map((lane) => ({ params: { lane: lane.id } }));
}

export const GET: APIRoute = async ({ params }) => {
  const lane = getLane(params.lane!);
  const entries = await getLaneEntries(lane);

  const body = JSON.stringify({
    lane: lane.id,
    generatedAt: new Date().toISOString(),
    entries: entries.map((e: any) => ({
      slug: e.id,
      ...e.data,
      body: e.body ?? '',
    })),
  });

  return new Response(body, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
