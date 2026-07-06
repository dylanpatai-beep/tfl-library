#!/usr/bin/env node
/**
 * Scaffold a new library entry with valid frontmatter.
 *
 *   npm run new -- recipes "Galbi Ribs"
 *   npm run new -- supplements "Fish Oil"
 *   npm run new -- techniques "Inside Low Kick"
 *   npm run new -- mobility "90/90 Hip Switch"
 *
 * Creates src/content/<lane>/<slug>.md as a DRAFT with placeholder fields
 * and the body sections that lane uses. Fill it in, flip status to
 * published, push — live in about a minute.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [lane, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ').trim();

// Same slug rule as the intake pipeline's slugify()
const slugify = (v) =>
  v.normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '').trim().toLowerCase()
    .replace(/[\s_-]+/g, '-').slice(0, 60).replace(/^-+|-+$/g, '') || 'untitled';

const today = new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD

const TEMPLATES = {
  recipes: {
    fm: `meal: dinner            # breakfast | lunch | dinner | snack | shake
time_min: 30
difficulty: easy        # easy | moderate | involved
# protein_g: 40         # optional
# calories: 500         # optional`,
    body: `## Why it's here\n\n\n\n## Ingredients\n\n- \n\n## Method\n\n1. \n\n## Notes\n\n- `,
  },
  supplements: {
    fm: `category: minerals      # vitamins | minerals | amino-acids | fatty-acids | whole-food | adaptogens | nootropics | antioxidants | gut | joints | recovery | performance | hormones | specialized
evidence: moderate      # strong | moderate | limited | experimental
dose: ""
timing: ""`,
    body: `## Mechanism\n\n\n\n## What it's for\n\n\n\n## Food first\n\n\n\n## How I take it\n\n- \n\n## Watch-outs & interactions\n\n- \n\n## For the fighter\n\n`,
  },
  techniques: {
    fm: `discipline: muay-thai   # muay-thai | boxing | grappling | mma
level: beginner         # beginner | intermediate | advanced
type: strike            # strike | clinch | defense | footwork | combo
# video_url: https://   # optional`,
    body: `## What it is\n\n\n\n## Setup\n\n- \n\n## The details that make it work\n\n1. \n\n## Common mistakes\n\n- `,
  },
  mobility: {
    fm: `focus: mobility         # mobility | strength | conditioning
body_area: hips         # hips | knees | ankles | shoulders | spine | neck | full-body
level: beginner         # beginner | intermediate | advanced
equipment: []`,
    body: `## Why\n\n\n\n## Setup\n\n1. \n\n## The work\n\n- \n\n## Progression\n\n`,
  },
};

if (!TEMPLATES[lane] || !title) {
  console.error('Usage: npm run new -- <recipes|supplements|techniques|mobility> "Entry Title"');
  process.exit(1);
}

const dir = join(root, 'src', 'content', lane);
mkdirSync(dir, { recursive: true });
let slug = slugify(title);
let path = join(dir, `${slug}.md`);
for (let i = 2; existsSync(path); i++) path = join(dir, `${slug}-${i}.md`);

const file = `---
title: ${title}
summary: ""
date: ${today}
tags: []
status: draft           # draft = dev-only. Flip to published to go live.
${TEMPLATES[lane].fm}
---

${TEMPLATES[lane].body}
`;

writeFileSync(path, file);
console.log(`Created ${path.replace(root + '/', '')}`);
console.log('Fill it in, set status: published, then commit + push to deploy.');
