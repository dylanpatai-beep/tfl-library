#!/usr/bin/env node
/**
 * Build the free Fight Camp Recipe Pack PDF from the published recipes.
 * Source of truth stays src/content/recipes/*.md — this only reads them.
 *
 *   node tools/build-recipe-pack.mjs        (needs Google Chrome + npm ci)
 *
 * Output: public/downloads/fight-camp-recipe-pack.pdf (commit it).
 * A recipe is included when it is `status: published` and has a hero photo.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src', 'content', 'recipes');
const out = join(root, 'public', 'downloads', 'fight-camp-recipe-pack.pdf');
const chrome = process.env.CHROME || 'google-chrome';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');

function parse(file) {
  const raw = readFileSync(join(dir, file), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  const body = m[2];
  const img = fm.hero || (body.match(/!\[[^\]]*\]\(([^)]+)\)/) || [])[1];
  return { slug: file.replace(/\.md$/, ''), fm, body, img };
}

// Minimal markdown → HTML for the shapes recipe entries use.
function md(body) {
  const lines = body.replace(/!\[[^\]]*\]\([^)]+\)\n?/g, '').split('\n');
  let html = '', list = null, table = [];
  const flush = () => {
    if (list) { html += `</${list}>`; list = null; }
    if (table.length) {
      const rows = table.filter((r) => !/^\|\s*-/.test(r)).map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => inline(c.trim())));
      html += '<table>' + rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('') + '</table>';
      table = [];
    }
  };
  for (const l of lines) {
    if (/^\|/.test(l)) { if (list) { html += `</${list}>`; list = null; } table.push(l); continue; }
    if (table.length) flush();
    let mm;
    if ((mm = l.match(/^#{2,3}\s+(.*)/))) { flush(); html += `<h3>${inline(mm[1])}</h3>`; }
    else if ((mm = l.match(/^\s*[-*]\s+(.*)/))) { if (list !== 'ul') { flush(); html += '<ul>'; list = 'ul'; } html += `<li>${inline(mm[1])}</li>`; }
    else if ((mm = l.match(/^\s*\d+\.\s+(.*)/))) { if (list !== 'ol') { flush(); html += '<ol>'; list = 'ol'; } html += `<li>${inline(mm[1])}</li>`; }
    else if (l.trim()) { flush(); html += `<p>${inline(l.trim())}</p>`; }
    else if (list) { flush(); }
  }
  flush();
  return html;
}

const recipes = readdirSync(dir).filter((f) => f.endsWith('.md')).map(parse)
  .filter((r) => r.fm.status === 'published' && r.img && existsSync(join(root, 'public', r.img)))
  .sort((a, b) => a.fm.title.localeCompare(b.fm.title));

const font = (f) => pathToFileURL(join(root, 'node_modules', '@fontsource', f)).href;
const pages = recipes.map((r, i) => `
<section class="page">
  <div class="top"><span class="chip">FIGHT CAMP RECIPE PACK</span><span class="num">${String(i + 1).padStart(2, '0')}</span></div>
  <h2>${esc(r.fm.title)}</h2>
  <div class="meta">${[r.fm.calories && `~${r.fm.calories} CAL`, r.fm.protein_g && `${r.fm.protein_g} G PROTEIN`, r.fm.time_min && `${r.fm.time_min} MIN`, r.fm.meal && r.fm.meal.toUpperCase()].filter(Boolean).join(' · ')}</div>
  <img src="${pathToFileURL(join(root, 'public', r.img)).href}" alt="">
  <div class="body">${md(r.body)}</div>
  <div class="foot">LIBRARY.THEFIGHTLIFE.FIT/RECIPES/${r.slug.toUpperCase()}/ <span>EARN THE LIFE.</span></div>
</section>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Bebas;src:url(${font('bebas-neue/files/bebas-neue-latin-400-normal.woff2')})}
@font-face{font-family:Inter;src:url(${font('inter/files/inter-latin-400-normal.woff2')});font-weight:400}
@font-face{font-family:Inter;src:url(${font('inter/files/inter-latin-700-normal.woff2')});font-weight:700}
@page{size:Letter;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:#0B0C0F;color:#F7F8FA;font-family:Inter,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:8.5in;height:11in;padding:.55in .6in;position:relative;overflow:hidden;page-break-after:always;border-top:10px solid #D91F2C}
.cover{display:flex;flex-direction:column;justify-content:center}
.cover h1{font-family:Bebas;font-size:110px;line-height:.9;letter-spacing:1px}
.cover h1 b{color:#D91F2C;font-weight:400}
.cover p{color:#C9CDD3;font-size:16px;line-height:1.55;max-width:5.6in;margin-top:22px}
.cover ol{margin-top:28px;columns:2;font-size:14px;color:#F7F8FA;padding-left:18px;line-height:1.9}
.top{display:flex;justify-content:space-between;align-items:center}
.chip{background:#D91F2C;color:#fff;font-family:Bebas;font-size:16px;letter-spacing:2px;padding:4px 10px}
.num{font-family:Bebas;font-size:40px;color:#D91F2C}
h2{font-family:Bebas;font-size:50px;line-height:1;margin-top:10px}
.meta{font-family:Bebas;letter-spacing:2px;color:#8A929E;font-size:17px;margin:4px 0 12px}
img{width:100%;height:3.1in;object-fit:cover;border-radius:4px}
.body{font-size:11.5px;line-height:1.45;margin-top:10px;columns:2;column-gap:.35in}
.body h3{font-family:Bebas;font-size:20px;letter-spacing:1px;color:#F7F8FA;border-bottom:2px solid #D91F2C;margin:8px 0 5px;break-after:avoid}
.body ul,.body ol{padding-left:16px}.body li{margin:2px 0}.body p{margin:4px 0;color:#C9CDD3}
table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #23262C;padding:2px 4px}
.foot{position:absolute;left:.6in;right:.6in;bottom:.35in;font-family:Bebas;letter-spacing:1.5px;color:#5C6470;font-size:13px;display:flex;justify-content:space-between}
.foot span{color:#F7F8FA}
</style></head><body>
<section class="page cover">
  <span class="chip" style="align-self:flex-start">THE FIGHT LIFE · FREE</span>
  <h1 style="margin-top:20px">FIGHT CAMP<br>RECIPE <b>PACK</b></h1>
  <p>I'm Dylan — Las Vegas firefighter-paramedic and Muay Thai fighter. These are the simple, whole-food meals I actually eat through fight camp and long shifts. High protein, real ingredients, nothing fancy. Cook them, tweak them, make weight on food you look forward to.</p>
  <ol>${recipes.map((r) => `<li>${esc(r.fm.title)}</li>`).join('')}</ol>
  <p style="font-size:11px;color:#8A929E;margin-top:30px">Macros are estimates and vary by brand. This is food, not medical advice.</p>
  <div class="foot">LIBRARY.THEFIGHTLIFE.FIT <span>EARN THE LIFE.</span></div>
</section>${pages}
</body></html>`;

const tmp = join(root, 'tools', '.recipe-pack.html');
writeFileSync(tmp, html);
mkdirSync(dirname(out), { recursive: true });
execFileSync(chrome, ['--headless', '--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--virtual-time-budget=5000', '--no-pdf-header-footer', `--print-to-pdf=${out}`, pathToFileURL(tmp).href], { stdio: 'inherit' });
console.log(`recipe pack: ${recipes.length} recipes → ${out}`);
