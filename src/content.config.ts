/**
 * Content schemas — the single source of truth for frontmatter.
 * Same job as lib/frontmatter.py in the intake pipeline: every entry passes
 * through here, so the schema never drifts. A bad or missing field fails the
 * build with a readable error instead of silently breaking the site.
 *
 * status: 'draft' entries are visible in `npm run dev` (with a DRAFT badge)
 * but NEVER appear in the published site. Flip to 'published' to go live.
 */
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const shared = {
  title: z.string(),
  summary: z.string().max(240, 'summary is the one-line thesis — keep it under 240 chars'),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  source_url: z.string().url().optional(),
};

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: z.object({
    ...shared,
    meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'shake']),
    time_min: z.number().int().positive(),
    difficulty: z.enum(['easy', 'moderate', 'involved']),
    protein_g: z.number().optional(),
    calories: z.number().optional(),
  }),
});

// Category + evidence taxonomy mirrors the Supplement Field Guide
// (public/supplement-field-guide/) exactly — one taxonomy, two surfaces.
const supplements = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/supplements' }),
  schema: z.object({
    ...shared,
    category: z.enum([
      'vitamins', 'minerals', 'amino-acids', 'fatty-acids', 'whole-food',
      'adaptogens', 'nootropics', 'antioxidants', 'gut', 'joints',
      'recovery', 'performance', 'hormones', 'specialized',
    ]),
    evidence: z.enum(['strong', 'moderate', 'limited', 'experimental']),
    dose: z.string(),
    timing: z.string(),
  }),
});

const techniques = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/techniques' }),
  schema: z.object({
    ...shared,
    discipline: z.enum(['muay-thai', 'boxing', 'grappling', 'mma']),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    type: z.enum(['strike', 'clinch', 'defense', 'footwork', 'combo']),
    video_url: z.string().url().optional(),
  }),
});

const mobility = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/mobility' }),
  schema: z.object({
    ...shared,
    focus: z.enum(['mobility', 'strength', 'conditioning']),
    body_area: z.enum(['hips', 'knees', 'ankles', 'shoulders', 'spine', 'neck', 'full-body']),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    equipment: z.array(z.string()).default([]),
  }),
});

export const collections = { recipes, supplements, techniques, mobility };
