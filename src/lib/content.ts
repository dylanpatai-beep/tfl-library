/**
 * Entry loading with the one rule that matters:
 * drafts show in `npm run dev` (badged), never in the published build.
 */
import { getCollection } from 'astro:content';
import type { Lane } from './lanes';

export const SHOW_DRAFTS = import.meta.env.DEV;

export async function getLaneEntries(lane: Lane) {
  const all = await getCollection(lane.id);
  const visible = all.filter(
    (e: any) => SHOW_DRAFTS || e.data.status === 'published'
  );
  return visible.sort(
    (a: any, b: any) => b.data.date.valueOf() - a.data.date.valueOf()
  );
}
