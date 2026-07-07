/**
 * Feed manifest — a tiny freshness check for the companion app.
 * One small request tells the app whether any lane changed since
 * its last download, before it fetches full lane feeds.
 */
import type { APIRoute } from 'astro';
import { LANES } from '../../lib/lanes';
import { getLaneEntries } from '../../lib/content';

export const GET: APIRoute = async () => {
  const lanes: Record<string, { count: number; latest: string | null }> = {};
  for (const lane of LANES) {
    const entries = await getLaneEntries(lane);
    lanes[lane.id] = {
      count: entries.length,
      latest: entries[0]?.data.date?.toISOString() ?? null,
    };
  }

  return new Response(
    JSON.stringify({ generatedAt: new Date().toISOString(), lanes }),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
