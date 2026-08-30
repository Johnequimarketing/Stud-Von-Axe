#!/usr/bin/env node
/* The third pass: what only a browser can answer.
 *
 * The other two audits read the files. This one renders every horse page in
 * Chrome and measures the result, because two of the faults this week were
 * invisible to anything that only reads markup: a flex rule aimed at the
 * picture column also caught the plate and spilled a paragraph across the
 * page, and the plate then sat at its own height beside a taller picture. Both
 * pages parsed, passed every check, and looked wrong.
 *
 * It answers three questions:
 *   - do the two columns end on the same line, on every page
 *   - is anything clipped by a container that hides its overflow
 *   - does any page scroll sideways
 *
 * Needs the dev server on :5187 and Chrome. Run: node scripts/audit-layout.mjs
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { root } from './lib/shell.mjs';

const CHROME = process.env.CHROME
  || '/Users/markgerrits/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const PORT = process.env.PORT || 5187;
const HORSES = new Function(readFileSync(join(root, 'horses-data.js'), 'utf-8') + '; return HORSES;')();
const DIRS = { broodmare: 'breeding-mares', foal: 'foals', embryo: 'embryos', sport: 'sport-horses' };

const pages = HORSES
  .filter((h) => h.category !== 'embryo')
  .map((h) => `/${DIRS[h.category]}/${h.slug}`)
  .filter((p) => existsSync(join(root, `${p.slice(1)}.html`)));

/* The pages are measured inside iframes on one throwaway page, so Chrome is
   started once rather than forty five times. The answer is written into the
   document, which is what --dump-dom carries back out. */
const RUNNER = '_audit-layout.html';
writeFileSync(join(root, RUNNER), `<!DOCTYPE html><html><head><meta charset="utf-8"><title>measuring</title></head>
<body><div id="out"></div><script>
var PAGES = ${JSON.stringify(pages)};
(async () => {
  var rows = [];
  for (var i = 0; i < PAGES.length; i++) {
    var f = document.createElement('iframe');
    f.width = 1440; f.height = 2000;
    f.style.cssText = 'position:absolute;left:-9999px;border:0';
    f.src = PAGES[i];
    document.body.appendChild(f);
    await new Promise(function (r) { f.onload = r; setTimeout(r, 2500); });
    try {
      var d = f.contentDocument;
      var cols = d.querySelectorAll('.hp--hero .hp__col');
      var tray = d.querySelector('.hp__tray');
      /* Only a container that hides its overflow actually clips anything. A
         serif with a tight line-height reports five pixels of scrollHeight it
         never loses, which is why this asks about overflow rather than about
         the numbers alone. */
      var clipped = [].slice.call(d.querySelectorAll('.hp__tray, .hp__tray *, .hp__fact, .ask__box, .hz__card'))
        .filter(function (el) {
          var o = getComputedStyle(el).overflow;
          if (o === 'visible') return false;
          return el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
        })
        .map(function (el) { return el.className || el.tagName; });
      rows.push([PAGES[i],
        cols[0] ? Math.round(cols[0].getBoundingClientRect().height) : 0,
        tray ? Math.round(tray.getBoundingClientRect().height) : 0,
        clipped.length ? clipped[0] : '',
        d.documentElement.scrollWidth > 1441 ? 'sideways' : '']);
    } catch (e) { rows.push([PAGES[i], -1, -1, 'unreadable', '']); }
    f.remove();
  }
  document.getElementById('out').textContent = JSON.stringify(rows);
})();
<\/script></body></html>`);

const dom = await new Promise((done) => {
  const p = spawn(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
    '--window-size=1440,900', '--virtual-time-budget=180000', '--dump-dom',
    `http://localhost:${PORT}/${RUNNER}`], { stdio: ['ignore', 'pipe', 'ignore'] });
  let out = '';
  p.stdout.on('data', (d) => { out += d; });
  p.on('close', () => done(out));
});
unlinkSync(join(root, RUNNER));

const found = dom.match(/<div id="out">([\s\S]*?)<\/div>/);
if (!found || !found[1].trim()) {
  console.log('  \x1b[31m✗ FAIL\x1b[0m  the browser returned nothing: is the dev server on :' + PORT + '?');
  process.exit(1);
}
const rows = JSON.parse(found[1]);

let failures = 0;
const report = (ok, msg, lines = []) => {
  console.log(`  ${ok ? '\x1b[32m✓ pass\x1b[0m' : '\x1b[31m✗ FAIL\x1b[0m'}  ${msg}`);
  lines.slice(0, 5).forEach((l) => console.log(`           ${l}`));
  if (lines.length > 5) console.log(`           …and ${lines.length - 5} more`);
  if (!ok) failures++;
};

const uneven = rows.filter(([, col, tray]) => Math.abs(col - tray) > 2);
report(!uneven.length, uneven.length
  ? `${uneven.length} page(s) where the columns do not end on the same line`
  : `${rows.length} page(s), both columns ending on the same line`,
  uneven.map(([p, c, t]) => `${p}: picture ${c}px, plate ${t}px`));

const clipped = rows.filter(([, , , c]) => c);
report(!clipped.length, clipped.length
  ? `${clipped.length} page(s) with something clipped by its container`
  : 'nothing clipped by a container that hides its overflow',
  clipped.map(([p, , , c]) => `${p}: .${c}`));

const sideways = rows.filter(([, , , , s]) => s);
report(!sideways.length, sideways.length
  ? `${sideways.length} page(s) scrolling sideways at 1440`
  : 'no page scrolls sideways at 1440',
  sideways.map(([p]) => p));

console.log('\n══════════════════════════════════════════════');
console.log(`${failures} failure(s) across 3 rendered check(s), ${rows.length} pages measured\n`);
process.exit(failures ? 1 : 0);
