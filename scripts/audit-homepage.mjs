#!/usr/bin/env node
/* Stud Von Axe · automated design audit.
 * Run: node scripts/audit-homepage.mjs [files...]
 * Defaults to homepage-v3.html and 00-design-system.html.
 *
 * Checks, per the design system rules:
 *  1. Token consistency: no raw hex / rgb() colour literals in CSS
 *     outside the :root block, no literal font-family names outside :root.
 *  2. WCAG contrast of every documented text/ground pair, computed by
 *     resolving the color-mix() maths in code. AA floor, honest report.
 *  3. Writing rules: no long dashes as style pauses, no decorative
 *     dashes before eyebrows, no digit-digit ranges, no banned filler words.
 *  4. Assets: every referenced local asset exists and is under 500 KB.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['homepage-v3.html', '00-design-system.html'];

let failures = 0, warnings = 0;
const fail = (file, msg) => { failures++; console.log(`  ✗ FAIL  ${msg}`); };
const warn = (file, msg) => { warnings++; console.log(`  ! note  ${msg}`); };
const pass = (msg) => console.log(`  ✓ pass  ${msg}`);

/* ── colour maths ─────────────────────────────────────────── */
const hex = (h) => {
  h = h.replace('#',''); if (h.length === 3) h = [...h].map(c => c+c).join('');
  return [0,2,4].map(i => parseInt(h.slice(i,i+2),16));
};
/* color-mix(in srgb, A p%, B) = linear interpolation per sRGB channel */
const mix = (a, pa, b) => a.map((v,i) => Math.round(v*pa + b[i]*(1-pa)));
const lum = (rgb) => {
  const f = c => { c/=255; return c<=.04045 ? c/12.92 : ((c+.055)/1.055)**2.4; };
  const [r,g,b] = rgb.map(f); return .2126*r + .7152*g + .0722*b;
};
const ratio = (fg,bg) => {
  const [a,b] = [lum(fg),lum(bg)].sort((x,y)=>y-x); return (a+.05)/(b+.05);
};

/* The palette, single source: parsed OUT of the file's :root so the audit
   can never drift from the page. */
function parsePalette(css){
  const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\s*\}/);
  if (!rootBlock) return null;
  const raw = {};
  for (const m of rootBlock[1].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g))
    raw[m[1]] = hex(m[2]);
  return raw;
}

for (const rel of files) {
  const file = join(root, rel);
  const src = readFileSync(file, 'utf-8');
  console.log(`\n━━ ${rel} ━━`);
  /* An internal working document is not a page of the site. It carries its
     own small token block, links to originals on purpose, and teaches the
     words the site may not use. It gets the structural checks only. */
  const isInternal = /<meta name="internal-doc"/.test(src);
  if (isInternal) console.log('  · internal document: token, copy and weight rules not applied');

  /* split out css and visible text */
  const cssBlocks = [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  const inlineStyles = [...src.matchAll(/style="([^"]*)"/g)].map(m => m[1]).join('\n');
  /* Teaching examples in the design system carry data-audit-exempt. */
  const exempted = src.replace(/<(td|p)[^>]*data-audit-exempt[^>]*>[\s\S]*?<\/\1>/g, '');
  const noScript = exempted.replace(/<script>[\s\S]*?<\/script>/g, '');
  const text = noScript
    .replace(/<style>[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ');
  const scriptBlocks = [...src.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const scripts = scriptBlocks.join('\n');

  /* Every inline block has to parse. Generated pages are written from template
     literals, where two things end a script early and silently: a single
     backslash-n that becomes a real line break inside a string, and the
     characters of a closing script tag appearing anywhere in the block,
     comments included. Both shipped once. A page that renders is not proof:
     the browser simply stops running the rest. */
  const broken = [];
  for (const block of scriptBlocks) {
    try { new Function(block); }
    catch (e) { broken.push(e.message); }
  }
  broken.length
    ? fail(rel, `${broken.length} inline script(s) do not parse: ${broken[0]}`)
    : pass(`${scriptBlocks.length} inline script(s) all parse`);

  /* A control that promises something and has nothing behind it. Twice now a
     page has shipped with arrows, dots or a play button and no code to hear
     them: once because the script was cut out of the build by an edit next to
     it, once because the condition that attaches it matched class="hgal" and
     the page said class="hgal is-stand". Neither is a parse error and neither
     shows in a render, so nothing caught them. Every data hook a control
     carries must be read by a script on the same page. */
  const hooks = [
    ['data-yt', 'the film player'],
    ['data-full', 'the picture viewer'],
    ['data-step', 'the slider arrows'],
    ['data-to', 'the slider dots'],
  ];
  const deadHooks = hooks.filter(([hook]) =>
    new RegExp(`<[^>]+\\s${hook}=`).test(exempted) && !scripts.includes(hook));
  deadHooks.length
    ? fail(rel, `${deadHooks.length} control(s) with no script behind them: ${deadHooks.map(([h, what]) => `${h} (${what})`).join(', ')}`)
    : pass('every control on the page has a script that reads it');

  /* 1 ── token consistency */
  const afterRoot = cssBlocks.replace(/:root\s*\{[\s\S]*?\n\s*\}/, '');
  /* A mask stop and an eight digit hex are treatments, not colour choices:
     #000 inside a mask-image is a shape, and #ffffffa8 is white at an
     opacity. Only an opaque six or three digit hex should have been a token. */
  /* Comments are prose, not declarations: a note explaining why a veil is
     navy rather than black names the hex, and that is not a colour choice
     made outside :root. Stripped before the scan so the check stays about
     what the browser reads. */
  const maskless = afterRoot
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/[-\w]*mask-image:[^;]+;/g, '');
  const hexLit = /#[0-9a-fA-F]{3,8}\b/g;
  const opaqueHex = (h) => h.length === 4 || h.length === 7;
  const rogueHex = [...maskless.matchAll(hexLit), ...inlineStyles.matchAll(hexLit)]
    .filter(m => opaqueHex(m[0]));
  if (isInternal) pass('token rules skipped');
  else rogueHex.length
    ? fail(rel, `${rogueHex.length} raw hex value(s) outside :root: ${rogueHex.slice(0,4).map(m=>m[0]).join(', ')}`)
    : pass('no raw hex colours outside :root');
  /* A scrim, a veil or a pane of glass IS an alpha value and cannot be a
     token: rgba(10,21,38,.62) is a treatment, not a colour choice. Only
     opaque literals are rogue, because those should have been tokens. */
  const rgbLit = /rgba?\(([^)]*)\)/g;
  const isOpaque = (args) => {
    /* rgba(var(--veil-rgb), .9) is the token doing its job, not a literal.
       The regex stops at the first ")" and hands back "var(--veil-rgb",
       which then looks like a three-part opaque colour and failed every
       page the moment the veils were moved onto the token. A check that
       fails correct work teaches people to ignore it. */
    if (args.includes('var(')) return false;
    const parts = args.split(',').map(x => x.trim());
    return parts.length < 4 || Number(parts[3]) >= 1;
  };
  const rogueRgb = [...afterRoot.matchAll(rgbLit), ...inlineStyles.matchAll(rgbLit)]
    .filter(m => isOpaque(m[1]));
  if (!isInternal) rogueRgb.length
    ? fail(rel, `${rogueRgb.length} opaque rgb() literal(s) outside :root`)
    : !isInternal && pass('no opaque rgb() literals outside :root');
  const rogueFont = [...afterRoot.matchAll(/font-family:\s*(?!var\()/g), ...inlineStyles.matchAll(/font-family:\s*(?!var\()/g)];
  rogueFont.length
    ? fail(rel, `${rogueFont.length} font-family literal(s) not using var(--font-*)`)
    : pass('all font-family declarations use tokens');

  /* 2 ── contrast.
     Token names differ between the pages (homepage-v3 says `bone`, the
     editorial page says `color-base`), so the palette is normalised first
     and any pair whose colours are missing is skipped rather than crashing
     the run. A check that cannot run is worse than one that fails loudly. */
  const raw = parsePalette(cssBlocks);
  if (isInternal) { /* its palette is a copy of the site's */ }
  else if (raw) {
    const norm = {};
    for (const [k, v] of Object.entries(raw)) norm[k.replace(/^color-/, '')] = v;
    const pick = (...names) => names.map(n => norm[n]).find(Boolean);
    const P = {
      navy:  pick('navy'),
      navyG: pick('navy-graphic', 'navy-deep'),
      gold:  pick('gold'),
      bone:  pick('bone', 'base'),
      sky:   pick('sky', 'base-alt'),
      white: pick('white'),
      ink:   pick('ink'),
      inkSoft: pick('ink-soft'),
    };
    const has = (...c) => c.every(Boolean);
    const D = {
      textMuted: has(P.navy, P.sky)        ? mix(P.navy, .78, P.sky)   : null,
      accentInk: has(P.gold, P.navy)       ? mix(P.gold, .46, P.navy)  : null,
      goldSoft:  has(P.gold, P.white)      ? mix(P.gold, .62, P.white) : null,
      darkMuted: has(P.bone, P.navyG)      ? mix(P.bone, .74, P.navyG) : null,
    };
    const pairs = [
      ['body ink on the page ground',     P.ink || P.navy, P.bone,  4.5],
      ['muted body text on the ground',   P.inkSoft || D.textMuted, P.bone, 4.5],
      ['gold as small text on the ground',D.accentInk, P.bone,  4.5],
      ['navy on the alternate ground',    P.navy,      P.sky,   4.5],
      ['navy on a white card',            P.navy,      P.white, 4.5],
      ['page ground on the deep navy',    P.bone,      P.navyG, 4.5],
      ['muted text on the deep navy',     D.darkMuted, P.navyG, 4.5],
      ['white on navy (hero)',            P.white,     P.navy,  4.5],
      ['button: navy ink on gold',        P.navy,      P.gold,  4.5],
      ['eyebrow: gold on navy',           P.gold,      P.navyG, 3.0],
    ];
    const runnable = pairs.filter(([, fg, bg]) => fg && bg);
    const skipped = pairs.length - runnable.length;
    let worst = null, contrastOk = true;
    for (const [name, fg, bg, floor] of runnable) {
      const r = ratio(fg, bg);
      if (!worst || r < worst[1]) worst = [name, r];
      if (r < floor) { fail(rel, `contrast ${r.toFixed(2)}:1 on ${name}, needs ${floor}:1`); contrastOk = false; }
    }
    if (contrastOk && runnable.length)
      pass(`${runnable.length} contrast pair(s) at or above their floor, worst ${worst[1].toFixed(2)}:1 on ${worst[0]}`);
    if (skipped) warn(rel, `${skipped} contrast pair(s) skipped, the palette does not define those tokens`);
  } else if (!isInternal) fail(rel, 'could not parse :root palette');

  /* 3 ── writing rules (visible text only, scripts carry copy too).
     Structured data is data, not prose: a phone number and a URL are not
     subject to the punctuation rules and were failing the dash-range check. */
  const prose = isInternal ? '' : text + '\n' + [...scripts.matchAll(/(?:title|text|cta):'([^']*)'/g)].map(m=>m[1]).join('\n');
  const emDash = (prose.match(/—|–/g) || []).length;
  emDash ? fail(rel, `${emDash} long dash(es) in copy`) : pass('no long dashes in copy');
  const spacedDash = (prose.match(/\s-\s/g) || []).length;
  spacedDash ? fail(rel, `${spacedDash} spaced hyphen(s) used as a pause`) : pass('no spaced hyphens as pauses');
  const ranges = (prose.match(/\b\d+-\d+\b/g) || []).filter(r => !/^\d{4}-\d{2}/.test(r));
  ranges.length ? fail(rel, `digit ranges written with a dash: ${ranges.join(', ')}`) : pass('no dash-written ranges');
  const banned = ['innovative','seamless','effortless','world-class','world class','cutting-edge','solutions'];
  const hits = banned.filter(w => new RegExp(`\\b${w}\\b`,'i').test(prose));
  hits.length ? fail(rel, `banned filler words: ${hits.join(', ')}`) : pass('no banned filler words');

  /* 4 ── eyebrows carry no number and no dash.
     House rule: an eyebrow is plain text. Numbering it ("01 · The stud")
     or prefixing it with a dash is exactly the decoration the brief bans,
     and it crept back in through a plaque pattern. */
  const eyebrows = [...src.matchAll(/<p class="(?:plaque|eyebrow)[^"]*"[^>]*>([\s\S]{0,90}?)<\/p>/g)];
  const badEyebrow = eyebrows
    .map(m => m[1].replace(/<[^>]+>/g, '').replace(/&middot;/g, '·').trim())
    .filter(t => /^\s*(?:\d+|[-\u2013\u2014·])\s*(?:·|-|\u2013)?/.test(t) && /^(?:\d|[-\u2013\u2014·])/.test(t));
  badEyebrow.length
    ? fail(rel, `${badEyebrow.length} eyebrow(s) start with a number or a dash: ${badEyebrow.slice(0,3).map(t=>JSON.stringify(t.slice(0,34))).join(', ')}`)
    : pass(`${eyebrows.length} eyebrow(s), none numbered or dashed`);

  /* 5 ── logo variant matches its ground.
     A white reverse logo on a light ground is invisible. Every logo <img>
     must declare data-ground, and it must agree with the filename. */
  const logos = [...src.matchAll(/<img[^>]*src="(?:\.\.\/|\/)?assets\/logo\/([^"]+)"[^>]*>/g)];
  let logoOk = true;
  for (const [tag, fileName] of logos) {
    const ground = (tag.match(/data-ground="(light|dark)"/) || [])[1];
    if (!ground) { fail(rel, `logo <img> without data-ground: ${fileName}`); logoOk = false; continue; }
    const wants = fileName.includes('-onlight') ? 'light'
                : fileName.includes('-ondark')  ? 'dark' : null;
    if (!wants) { fail(rel, `logo file does not name its ground: ${fileName} (use -onlight / -ondark)`); logoOk = false; continue; }
    if (wants !== ground) { fail(rel, `${fileName} is the ${wants}-ground logo but sits on a ${ground} ground`); logoOk = false; }
  }
  if (logoOk && logos.length) pass(`${logos.length} logo(s) each on the right ground`);

  /* 5b ── words that are ours rather than theirs.
     Checked because "pairing" survived the whole build before anyone asked
     whether horse people say it. They say cross. The rule is not that these
     words are wrong English, it is that they are not this market's English
     and none of them appear in a sentence quoted from the client. */
  const houseWords = [
    ['pairing',      'cross, the word the jumping world uses for a sire and dam combination'],
    ['on the record','plain English: news, results'],
    /* The stem, not the noun: "mediation" was on this list from the start
       and "Sourced and mediated" sat on the homepage through every run of
       it. A banned word that only catches one of its own forms is not a
       ban. \b keeps it off "immediate". */
    ['mediat(?:e|ed|es|ing|ion)', 'brokering, or acting between buyer and seller; mediation is dispute resolution'],
    ['the herd',     'name what it is: the mares, the foals, every horse we have'],
    ['both yards',   'two countries, one programme; Lanaken is not a yard of the stud'],
    ['two yards',    'two countries, one programme; Lanaken is not a yard of the stud'],
    ['curated',      'say who chose it and why'],
    ['bespoke',      'say what is actually made to order'],
    ['boasts',       'state the fact without the verb'],
    ['nestled',      'say where it is'],
    ['unparalleled', 'a claim nobody can check'],
    ['world-class',  'a claim nobody can check'],
  ];
  const houseHits = isInternal ? []
    : houseWords.filter(([w]) => new RegExp(`\\b${w}`, 'i').test(text));
  houseHits.length
    ? fail(rel, `word(s) that are not this market's English: ${houseHits.map(([w,f]) => `"${w.replace(/\(\?:[^)]*\)/, '…')}" (use ${f})`).join('; ')}`)
    : pass(isInternal ? 'internal document, copy rules not applied' : 'no house-banned words in the copy');

  /* 6 ── no invented mark.
     Mark, 29 Aug: "nooit zelfgemaakte logo's gebruiken". A drawn crown or a
     typographic wordmark reads as the brand and quietly becomes it. Only the
     supplied files may stand for Von Axe. Country flags are data, not a mark,
     so they are the one inline-SVG family allowed. */
  const drawn = [...src.matchAll(/class="([^"]*(?:wordmark|crown|logo-mark|brand-mark)[^"]*)"/g)]
    .map(m => m[1]).filter(c => !/hz__flag|flag/.test(c));
  const svgs = [...src.matchAll(/<svg[\s\S]{0,400}?<\/svg>/g)].map(m => m[0]);
  const nonFlagSvg = svgs.filter(t => !/viewBox="0 0 24 16"/.test(t));
  if (drawn.length) fail(rel, `drawn brand mark in markup: ${[...new Set(drawn)].slice(0,3).join(', ')}`);
  else if (nonFlagSvg.length) warn(rel, `${nonFlagSvg.length} inline SVG(s) that are not country flags, check none of them is a logo`);
  else pass('no drawn brand mark; every logo comes from assets/logo');

  /* 7 ── every in-page anchor lands somewhere.
     A link to a section that was removed does nothing at all when clicked,
     which reads as a broken page rather than a missing feature. */
  const ids = new Set([...src.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  const anchors = [...new Set([...src.matchAll(/href="#([^"]+)"/g)].map(m => m[1]))];
  const dead = anchors.filter(a => !ids.has(a));
  dead.length ? fail(rel, `${dead.length} dead in-page anchor(s): ${dead.slice(0,5).map(a=>'#'+a).join(', ')}`)
              : pass(`${anchors.length} in-page anchor(s), all landing on a real id`);

  /* 8 ── ids are unique and every label owns a field.
     Duplicate ids break label/field pairing silently, and a placeholder is
     not a label: it disappears the moment someone types. */
  const idList = [...src.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dupes = [...new Set(idList.filter((v,i) => idList.indexOf(v) !== i))];
  dupes.length ? fail(rel, `duplicate id(s): ${dupes.slice(0,5).join(', ')}`)
               : pass(`${idList.length} id(s), all unique`);
  const labels = [...src.matchAll(/<label[^>]*for="([^"]+)"/g)].map(m => m[1]);
  const orphan = labels.filter(f => !ids.has(f));
  const fields = [...src.matchAll(/<(?:input|select|textarea)[^>]*\sid="([^"]+)"/g)].map(m => m[1]);
  const unlabelled = fields.filter(f => !labels.includes(f));
  if (orphan.length) fail(rel, `label(s) pointing at nothing: ${orphan.join(', ')}`);
  else if (unlabelled.length) fail(rel, `field(s) without a label: ${unlabelled.join(', ')}`);
  else if (labels.length) pass(`${labels.length} label(s), each tied to a real field`);

  /* 9 ── a stand-in photograph is always labelled.
     Provenance rule: a picture may only name a horse when it came from that
     horse's own page. Where it did not, the card has to say so. */
  const placeholders = (src.match(/data-placeholder="true"/g) || []).length;
  const pending = (src.match(/Photo pending/g) || []).length;
  if (placeholders && pending < 1) fail(rel, `${placeholders} placeholder frame(s) and no "Photo pending" label`);
  else if (placeholders) pass(`${placeholders} placeholder frame(s), labelled`);

  /* 10 ── numbers written on the page must be countable.
     "ten countries" survived three passes before anyone counted six. Any
     spelled-out or digit count in body copy is listed for a human to check. */
  const claims = [...src.matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|seventeen|twenty|\d{1,3})\s+(countries|pairings|damlines|horses|foals|mares|yards|embryos)\b/gi)]
    .map(m => m[0].toLowerCase());
  if (claims.length) warn(rel, `counts stated in copy, verify each against the data: ${[...new Set(claims)].join(', ')}`);

  /* 11 ── heading structure.
     One h1, and no level skipped. A page that jumps from h2 to h5 reads as a
     broken outline to a screen reader and to a crawler, and it happened here
     because the footer columns were h5 with nothing between. */
  const heads = [...src.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/g)]
    .map(m => ({ level: Number(m[1][1]), text: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }));
  const h1s = heads.filter(h => h.level === 1);
  const skips = [];
  let prev = 1;
  for (const h of heads) { if (h.level > prev + 1) skips.push(`h${prev} to h${h.level} at "${h.text.slice(0,28)}"`); prev = h.level; }
  if (h1s.length !== 1) fail(rel, `${h1s.length} h1 element(s); a page needs exactly one`);
  else if (skips.length) fail(rel, `heading level skipped: ${skips.slice(0,3).join('; ')}`);
  else pass(`${heads.length} heading(s), one h1 and no level skipped`);

  /* 12 ── the head a search engine reads.
     Checked because none of these existed until someone asked. */
  const headBits = isInternal ? [] : [
    ['<title>', 'a title'],
    ['name="description"', 'a meta description'],
    ['rel="canonical"', 'a canonical link'],
    ['property="og:title"', 'an Open Graph title'],
    ['property="og:image"', 'an Open Graph image'],
    ['application/ld+json', 'structured data'],
  ].filter(([needle]) => !src.includes(needle));
  headBits.length
    ? fail(rel, `head is missing ${headBits.map(b => b[1]).join(', ')}`)
    : pass(isInternal ? 'internal document, search head not required'
                      : 'title, description, canonical, social cards and structured data all present');
  if (/name="robots"[^>]*noindex/.test(src))
    warn(rel, 'this page carries noindex: correct while it is a draft, remove it the day it goes live');

  /* 13 ── links resolve from anywhere.
     A relative href resolves against the DIRECTORY of the current URL, so
     on a page served at /news with no trailing slash, href="story" points
     at /story. Every internal link on a subpage must therefore be root
     absolute. Caught after four news pages shipped with 404 links. */
  const relLinks = [...src.matchAll(/(?:href|src)="((?!https?:|mailto:|tel:|#|\/|data:)[^"]+)"/g)]
    .map(m => m[1])
    .filter(h => !/^[a-z0-9-]+\.(?:js|css)$/i.test(h));   /* same-folder assets are fine */
  const inSubfolder = rel.includes('/');
  if (inSubfolder && relLinks.length)
    fail(rel, `${relLinks.length} relative link(s) on a subpage; use root absolute: ${[...new Set(relLinks)].slice(0,4).join(', ')}`);
  else if (inSubfolder) pass('every internal link is root absolute');

  /* 14 ── every internal link lands on a file that exists.
     The relative-link check above catches links that resolve against the
     wrong directory; this one catches links that resolve correctly and
     still point at nothing. cleanUrls means /news/story is news/story.html
     and /news is news/index.html, so the check has to try both. */
  const linkTargets = [...new Set([...src.matchAll(/href="(\/[^"#?]*)"/g)].map(m => m[1]))]
    .filter(h => !/\.(?:jpe?g|png|webp|svg|ico|js|css|pdf)$/i.test(h));
  const missing = linkTargets.filter((h) => {
    const bare = h.replace(/^\//, '').replace(/\/$/, '');
    if (bare === '') return !existsSync(join(root, 'index.html'));
    return !existsSync(join(root, bare)) &&
           !existsSync(join(root, `${bare}.html`)) &&
           !existsSync(join(root, bare, 'index.html'));
  });
  missing.length
    ? fail(rel, `${missing.length} internal link(s) point at nothing on disk: ${missing.slice(0,4).join(', ')}`)
    : linkTargets.length && pass(`${linkTargets.length} internal link target(s) all exist`);

  /* 15 ── assets exist and are light */
  /* Three shapes reach the same file: assets/... on the homepage,
     ../assets/... from a subfolder, and /assets/... on every generated
     page. Root absolute resolves against the project, the other two
     against the file that names them. The generated pages use the third
     shape exclusively, so a pattern that missed it reported "0 assets" and
     passed: a check that finds nothing must never read as a clean bill. */
  const refs = [...new Set([...src.matchAll(/(?:src|href)="(\/?(?:\.\.\/)?assets\/[^"]+)"/g)].map(m => m[1]))];
  if (!refs.length && /assets\//.test(src)) {
    fail(rel, 'the asset check matched nothing while the page references assets: the pattern is blind');
  }
  let assetsOk = true;
  for (const a of refs) {
    const p = a.startsWith('/') ? join(root, a.slice(1)) : join(dirname(file), a);
    if (!existsSync(p)) { fail(rel, `missing asset: ${a}`); assetsOk = false; continue; }
    const kb = statSync(p).size / 1024;
    if (kb > 500 && !isInternal) { fail(rel, `asset over 500 KB: ${a} (${Math.round(kb)} KB)`); assetsOk = false; }
  }
  if (assetsOk) pass(`${refs.length} referenced assets all exist and are under 500 KB`);
}

console.log(`\n${'═'.repeat(46)}\n${failures} failure(s), ${warnings} note(s)`);
process.exit(failures ? 1 : 0);
