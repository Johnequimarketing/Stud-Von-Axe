#!/usr/bin/env node
/* The third pass: what only a browser can answer, at three widths.
 *
 * The other two audits read the files. This one renders the pages in Chrome
 * and measures the result, because the faults it exists for are invisible to
 * anything that only reads markup: a flex rule aimed at the picture column
 * also caught the plate and spilled a paragraph across the page, and the plate
 * then sat at its own height beside a taller picture. Both pages parsed,
 * passed every check, and looked wrong.
 *
 * 31 Aug: it only ever looked at 1440, which is the width nothing breaks at.
 * Everything below is where a fixed width, a long word or a control built for
 * a mouse actually shows, so it now measures a phone, a tablet and a desktop
 * and asks six questions of each:
 *
 *   - does the page scroll sideways
 *   - is any single element wider than the screen, and which one
 *   - is anything clipped by a container that hides its overflow
 *   - do the two columns on a horse page end on the same line
 *   - is any control smaller than a finger, on the phone
 *   - is any text smaller than the scale allows, on the phone
 *
 * Needs the dev server on :5187 and Chrome. Run: node scripts/audit-layout.mjs
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { root } from './lib/shell.mjs';

const CHROME = process.env.CHROME
  || '/Users/markgerrits/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const PORT = process.env.PORT || 5187;

/* Phone, tablet, desktop. 390 is an iPhone; 768 is the width an iPad reports
   in portrait and the one most tablet breakpoints are written for; 1440 is the
   laptop this was always measured on. */
const WIDTHS = [390, 768, 1440];

/* A control you cannot hit with a thumb. Forty four is the number Apple and
   the WCAG target-size rule both land on; this asks for forty, because the
   pills on this site are 38 to 42 and a two pixel argument is not worth a
   redesign. */
const TAP = 40;
/* The smallest size on the homepage type scale. Anything under it on a phone
   is either a mistake or a decision nobody wrote down. */
const MIN_TEXT = 9;

const HORSES = new Function(readFileSync(join(root, 'horses-data.js'), 'utf-8') + '; return HORSES;')();
const SEMEN = new Function(readFileSync(join(root, 'semen-data.js'), 'utf-8') + '; return SEMEN;')();
const DIRS = { broodmare: 'breeding-mares', foal: 'foals', embryo: 'embryos', sport: 'sport-horses',
               stallion: 'icsi-semen' };

const exists = (p) => existsSync(join(root, `${p.slice(1)}.html`))
  || existsSync(join(root, p.slice(1), 'index.html'));

/* Every page that is not a horse, and three horses per category. The singles
   are one template per category, so the fourth of a kind measures the same
   markup as the first; the pages that differ from each other are the ones
   worth every width. */
const singles = Object.entries(DIRS).flatMap(([cat, dir]) =>
  [...HORSES, ...SEMEN].filter((h) => h.category === cat).slice(0, 3)
    .map((h) => `/${dir}/${h.slug}`));

const others = ['/', '/about', '/contact', '/news', '/privacy', '/terms', '/404',
  ...Object.values(DIRS).map((d) => `/${d}`),
  ...readdirSync(join(root, 'news')).filter((f) => f.endsWith('.html') && f !== 'index.html')
    .slice(0, 1).map((f) => `/news/${f.replace(/\.html$/, '')}`)];

const pages = [...others, ...singles].filter(exists);

/* Every horse page still gets the column check at the desktop width, which is
   what it was written for and where the two columns exist. */
const allHorses = [...HORSES, ...SEMEN]
  .filter((h) => h.category !== 'embryo' && h.category !== 'stallion')
  .map((h) => `/${DIRS[h.category]}/${h.slug}`).filter(exists);

const RUNNER = '_audit-layout.html';
writeFileSync(join(root, RUNNER), `<!DOCTYPE html><html><head><meta charset="utf-8"><title>measuring</title></head>
<body><div id="out"></div><script>
var PAGES = ${JSON.stringify(pages)};
var COLPAGES = ${JSON.stringify(allHorses)};
var WIDTHS = ${JSON.stringify(WIDTHS)};
var TAP = ${TAP}, MIN_TEXT = ${MIN_TEXT};

function name(el){
  return (el.tagName || '').toLowerCase() + (el.className && typeof el.className === 'string'
    ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');
}

async function load(url, w, h){
  var f = document.createElement('iframe');
  f.width = w; f.height = h;
  f.style.cssText = 'position:absolute;left:-9999px;border:0';
  f.src = url;
  document.body.appendChild(f);
  await new Promise(function (r){ f.onload = r; setTimeout(r, 2200); });
  return f;
}

function measure(d, w, phone){
  var out = { wide: [], clipped: [], small: [], tiny: [], rhythm: [], sideways: '' };

  /* The space between sections comes off one scale, or it comes off nobody's.
     3 Sep: the homepage had five sections and five different hand written
     clamps, so the gap between two neighbours was anywhere from 144 to 226
     pixels depending on which pair you looked at, and shell.mjs redeclared
     --sec-half with a value the homepage's :root did not have, so the same
     token meant two different things on two pages. Both are the sort of thing
     nobody sees until it is measured side by side.
     Every <section> now pads itself with 0, the half step or the full step.
     Two are exempt and named: the services band's top has to clear the
     diagonal cut above it, and a horse page's first section has to clear the
     hero, which is measured in vh rather than in the scale. */
  /* Resolved, not declared: getPropertyValue hands back the clamp() as it was
     written, so comparing a computed "48px" with "clamp(2rem,3.4vw,3rem)"
     fails on every page. A probe in the page's own document turns each step
     into the pixels this width actually gives. */
  var probe = d.createElement('div');
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;height:0;'
    + 'padding-top:var(--sec-half);padding-bottom:var(--sec-full)';
  d.body.appendChild(probe);
  var pcs = getComputedStyle(probe);
  var STEP = { '0px': 1 };
  STEP[pcs.paddingTop] = 1;
  STEP[pcs.paddingBottom] = 1;
  probe.remove();
  /* Each exemption names the end it covers, because two of these are about a
     section's head and the third is about its foot, and a list that only ever
     meant "top" quietly let a bottom through. */
  var EXEMPT = {
    sv:           { end: 'top',    why: 'clears the diagonal cut above it' },
    hp:           { end: 'top',    why: 'clears the hero' },
    'nhero--cut': { end: 'bottom', why: 'makes room for the filter bar to climb into it' }
  };
  /* Page sections only. On the legal pages every clause is a <section> of its
     own inside one, and a clause is a block with its own spacing, not a step
     in the page's rhythm. */
  var secs = d.querySelectorAll('body > section, body > main > section, main > section');
  for (var si = 0; si < secs.length; si++){
    var sec = secs[si];
    var scs = getComputedStyle(sec);
    if (scs.display === 'none') continue;
    var classes = (sec.className || '').trim().split(/\\s+/);
    var first = classes[0];
    var pt = scs.paddingTop, pb = scs.paddingBottom;
    var skipTop = false, skipBottom = false;
    for (var ci = 0; ci < classes.length; ci++){
      var e = EXEMPT[classes[ci]];
      if (!e) continue;
      if (e.end === 'top') skipTop = true;
      if (e.end === 'bottom') skipBottom = true;
    }
    if (!skipTop && !STEP[pt] && out.rhythm.length < 6) out.rhythm.push(name(sec) + ' top ' + pt);
    if (!skipBottom && !STEP[pb] && out.rhythm.length < 6) out.rhythm.push(name(sec) + ' bottom ' + pb);
  }
  /* Against the page's own client width, not the width we asked the iframe
     for: an iframe reports two pixels more than it was given, and comparing
     with the request calls that a sideways scroll on every page. */
  var vw = d.documentElement.clientWidth;
  if (d.documentElement.scrollWidth > vw + 1) out.sideways = d.documentElement.scrollWidth;

  var all = d.body.getElementsByTagName('*');
  for (var i = 0; i < all.length; i++){
    var el = all[i];
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;

    /* Wider than the screen. Skip anything the page scrolls on purpose: a
       rail is meant to be wider than its window and says so with overflow. */
    if (r.width > vw + 1 && out.wide.length < 4){
      /* Anything an ancestor clips or scrolls is not the visitor's problem: a
         rail is meant to be wider than its window, and a backdrop scaled by
         five per cent inside a section that hides its overflow never reaches
         the edge of the page. Only what actually widens the page counts. */
      var par = el.parentElement, held = false;
      while (par && par !== d.body){
        var po = getComputedStyle(par).overflowX;
        if (po === 'auto' || po === 'scroll' || po === 'hidden' || po === 'clip') { held = true; break; }
        par = par.parentElement;
      }
      var own = cs.overflowX;
      if (!held && own !== 'auto' && own !== 'scroll' && cs.position !== 'fixed')
        out.wide.push(name(el) + ' ' + Math.round(r.width) + 'px');
    }

    /* Wide enough to fit and still hanging off the right edge. An element can
       be narrower than the screen and start too far along, which is the other
       half of a sideways scroll and the half the width test cannot see. */
    if (out.wide.length < 4 && r.right > vw + 1 && r.width <= vw + 1){
      var p2 = el.parentElement, held2 = false;
      while (p2 && p2 !== d.body){
        var po2 = getComputedStyle(p2).overflowX;
        if (po2 === 'auto' || po2 === 'scroll' || po2 === 'hidden' || po2 === 'clip') { held2 = true; break; }
        p2 = p2.parentElement;
      }
      if (!held2 && cs.position !== 'fixed')
        out.wide.push(name(el) + ' ends at ' + Math.round(r.right));
    }

    /* Clipped by a container that hides its overflow. Two pixels of slack: a
       serif with a tight line-height reports a few it never loses. */
    /* Only words. A window that crops a photograph, a rail that scrolls, a
       label parked off screen for a screen reader and a strip that opens on
       hover are all clipping on purpose; a paragraph with its last line cut
       off is the fault this is looking for. So: it has to hold text of its
       own, and it has to be tall enough to be reading rather than hiding. */
    var cls = ' ' + (typeof el.className === 'string' ? el.className : '') + ' ';
    var hides = cls.indexOf('visually-hidden') >= 0 || cls.indexOf('sr-only') >= 0;
    var ownText = el.children.length === 0 && (el.textContent || '').trim().length > 0;
    if (out.clipped.length < 4 && !hides && ownText && el.clientHeight > 14
        && cs.overflow !== 'visible'
        && (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)
        && cs.overflowY !== 'auto' && cs.overflowX !== 'auto' && cs.overflowY !== 'scroll'
        && cs.overflowX !== 'scroll')
      out.clipped.push(name(el) + ' ' + el.clientHeight + '/' + el.scrollHeight);

    if (!phone) continue;

    /* A control smaller than a finger. */
    var tag = el.tagName;
    /* A control is a button or a field, or a link drawn as one: with a border,
       a ground of its own or the button class. A link in a sentence and a link
       in a footer column are text, and text is not sized with a thumb in mind
       anywhere on the web. */
    var drawn = cs.borderTopWidth !== '0px'
      || (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent')
      || cls.indexOf(' btn') >= 0;
    var control = tag === 'BUTTON' || tag === 'SELECT' || tag === 'TEXTAREA'
      || (tag === 'INPUT' && el.type !== 'hidden')
      || (tag === 'A' && el.getAttribute('href') && drawn);
    if (control && out.small.length < 6 && cs.display !== 'inline'
        && (r.height < TAP || r.width < TAP) && r.height > 4)
      out.small.push(name(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));

    /* Text under the smallest size on the scale. */
    if (out.tiny.length < 6 && el.children.length === 0 && (el.textContent || '').trim()){
      var fs = parseFloat(cs.fontSize);
      if (fs && fs < MIN_TEXT) out.tiny.push(name(el) + ' ' + fs + 'px');
    }
  }
  return out;
}

(async () => {
  var rows = [];
  for (var wi = 0; wi < WIDTHS.length; wi++){
    var w = WIDTHS[wi], phone = w <= 430;
    for (var i = 0; i < PAGES.length; i++){
      var f = await load(PAGES[i], w, 2000);
      try { rows.push([PAGES[i], w, measure(f.contentDocument, w, phone)]); }
      catch (e) { rows.push([PAGES[i], w, { unreadable: true }]); }
      f.remove();
    }
  }
  /* The column check, at the width the two columns exist at. */
  var cols = [];
  for (var j = 0; j < COLPAGES.length; j++){
    var g = await load(COLPAGES[j], 1440, 2000);
    try {
      var d = g.contentDocument;
      var c = d.querySelectorAll('.hp--hero .hp__col');
      var tray = d.querySelector('.hp__tray');
      cols.push([COLPAGES[j],
        c[0] ? Math.round(c[0].getBoundingClientRect().height) : 0,
        tray ? Math.round(tray.getBoundingClientRect().height) : 0]);
    } catch (e) { cols.push([COLPAGES[j], -1, -1]); }
    g.remove();
  }
  document.getElementById('out').textContent = JSON.stringify({ rows: rows, cols: cols });
})();
<\/script></body></html>`);

const dom = await new Promise((done) => {
  const p = spawn(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
    '--window-size=1500,900', '--virtual-time-budget=600000', '--dump-dom',
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
const { rows, cols } = JSON.parse(found[1]);

let failures = 0;
const report = (ok, msg, lines = []) => {
  console.log(`  ${ok ? '\x1b[32m✓ pass\x1b[0m' : '\x1b[31m✗ FAIL\x1b[0m'}  ${msg}`);
  lines.slice(0, 6).forEach((l) => console.log(`           ${l}`));
  if (lines.length > 6) console.log(`           …and ${lines.length - 6} more`);
  if (!ok) failures++;
};

const at = (w) => rows.filter(([, width]) => width === w);
const hits = (w, key) => at(w).filter(([, , m]) => m[key] && m[key].length);

for (const w of WIDTHS) {
  const side = at(w).filter(([, , m]) => m.sideways);
  report(!side.length, side.length
    ? `${side.length} page(s) scroll sideways at ${w}`
    : `no page scrolls sideways at ${w}`,
    side.map(([p, , m]) => `${p}: document is ${m.sideways}px wide`));

  const wide = hits(w, 'wide');
  report(!wide.length, wide.length
    ? `${wide.length} page(s) with an element wider than ${w}`
    : `nothing wider than the screen at ${w}`,
    wide.map(([p, , m]) => `${p}: ${m.wide.join(', ')}`));
}

const clipped = rows.filter(([, , m]) => m.clipped && m.clipped.length);
report(!clipped.length, clipped.length
  ? `${clipped.length} page(s) with something clipped by its container`
  : 'nothing clipped by a container that hides its overflow',
  clipped.map(([p, w, m]) => `${p} at ${w}: ${m.clipped.join(', ')}`));

const small = hits(390, 'small');
report(!small.length, small.length
  ? `${small.length} page(s) with a control under ${TAP}px on a phone`
  : `every control is at least ${TAP}px on a phone`,
  small.map(([p, , m]) => `${p}: ${m.small.join(', ')}`));

const tiny = hits(390, 'tiny');
report(!tiny.length, tiny.length
  ? `${tiny.length} page(s) with text under ${MIN_TEXT}px on a phone`
  : `no text under ${MIN_TEXT}px on a phone`,
  tiny.map(([p, , m]) => `${p}: ${m.tiny.join(', ')}`));

const rhythm = rows.filter(([, , m]) => m.rhythm && m.rhythm.length);
report(!rhythm.length, rhythm.length
  ? `${rhythm.length} page(s) where a section sets its own vertical space`
  : 'every section takes its vertical space from the one scale',
  rhythm.map(([p, w, m]) => `${p} at ${w}: ${m.rhythm.join(', ')}`));

const uneven = cols.filter(([, col, tray]) => Math.abs(col - tray) > 2);
report(!uneven.length, uneven.length
  ? `${uneven.length} page(s) where the columns do not end on the same line`
  : `${cols.length} page(s), both columns ending on the same line`,
  uneven.map(([p, c, t]) => `${p}: picture ${c}px, plate ${t}px`));

const checks = WIDTHS.length * 2 + 5;
console.log('\n══════════════════════════════════════════════');
console.log(`${failures} failure(s) across ${checks} rendered check(s), `
  + `${pages.length} page(s) at ${WIDTHS.join(', ')} and ${cols.length} measured for columns\n`);
process.exit(failures ? 1 : 0);
