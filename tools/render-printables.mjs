#!/usr/bin/env node
/**
 * Render the printables in tools/printables/ into public/downloads/.
 * Needs Google Chrome/Chromium on the machine (no npm dependency):
 *
 *   node tools/render-printables.mjs            # uses google-chrome
 *   CHROME=/path/to/chrome node tools/render-printables.mjs
 *
 * Edit the HTML in tools/printables/, re-run this, commit the outputs.
 * Needs `npm ci` first — the fonts load from node_modules/@fontsource.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'tools', 'printables');
const out = join(root, 'public', 'downloads');
const chrome = process.env.CHROME || 'google-chrome';
mkdirSync(out, { recursive: true });

// name, CSS width × height, whether to also make a Letter PDF
const JOBS = [
  { name: 'the-elastic-engine', w: 816, h: 1056, pdf: true },
  { name: 'the-elastic-engine-week', w: 1080, h: 1350, pdf: false },
];

const base = ['--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--virtual-time-budget=3000'];

for (const job of JOBS) {
  const url = pathToFileURL(join(src, `${job.name}.html`)).href;
  if (job.pdf) {
    execFileSync(chrome, [...base, '--no-pdf-header-footer', `--print-to-pdf=${join(out, `${job.name}.pdf`)}`, url], { stdio: 'inherit' });
  }
  execFileSync(chrome, [...base, '--force-device-scale-factor=2', `--window-size=${job.w},${job.h}`, `--screenshot=${join(out, `${job.name}.png`)}`, url], { stdio: 'inherit' });
  console.log(`rendered ${job.name}`);
}
