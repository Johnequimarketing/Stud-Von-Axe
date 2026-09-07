/* ============================================================
   INGEST THE WHATSAPP EXPORT

   On 6 September the owners sent the whole stud through WhatsApp: the
   photographs first, category by category, then the mare texts in the
   evening. Mark exported the chat with media. This reads that export and
   writes horses-whatsapp.js, which build-horses.mjs merges over the
   harvested data.

   Why a separate file rather than editing horses-data.js: that file says
   "Regenerate rather than edit" at the top and harvest-horses.mjs rewrites
   it whole. Anything typed into it dies at the next harvest. horses-extra.js
   already exists for exactly this reason; this is the same idea, for a
   batch too large to hand-write.

   The one rule this script holds to: it never guesses. Where a photograph
   cannot be tied to a horse with certainty, the photograph goes on the
   review sheet with the reason, and not into the data.

   Usage:  node scripts/ingest-whatsapp.mjs
   Reads:  content/whatsapp-2026-09-06/_chat.txt and its media
   Writes: horses-whatsapp.js, content/whatsapp-2026-09-06/review.html
   ============================================================ */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(root, 'content', 'whatsapp-2026-09-06');
const DAY = '06-09-2026';

/* ---------- 1. the transcript ----------
   iOS exports as "[dd-mm-yyyy, hh:mm:ss] Sender: text", CRLF line endings,
   and sprinkles U+200E (left-to-right mark) in front of lines that carry an
   attachment. A message runs on until the next line that opens a stamp. */

const HEAD = /^\u200e?\[(\d\d-\d\d-\d{4}), (\d\d:\d\d:\d\d)\] ([^:]+?): ?(.*)$/;
const ATTACH = /\u200e?<bijgevoegd: ([^>]+)>|\u200e?<attached: ([^>]+)>/;

export function readChat(file) {
  const raw = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const out = [];
  let cur = null;
  for (const line of raw.split('\n')) {
    const m = HEAD.exec(line);
    if (m) {
      if (cur) out.push(cur);
      cur = { date: m[1], time: m[2], who: m[3].trim(), raw: m[4] };
    } else if (cur) {
      cur.raw += '\n' + line;
    }
  }
  if (cur) out.push(cur);

  return out.map((m, i) => {
    const a = ATTACH.exec(m.raw);
    const file = a ? (a[1] || a[2]) : null;
    const text = m.raw.replace(ATTACH, '').replace(/\u200e/g, '').trim();
    return {
      i, date: m.date, time: m.time, who: m.who,
      hhmm: m.time.slice(0, 5),
      file,
      kind: file ? (/-PHOTO-/.test(file) ? 'photo'
                  : /-AUDIO-/.test(file) ? 'audio'
                  : /-VIDEO-/.test(file) ? 'video' : 'doc')
                 : 'text',
      text,
      deleted: /Dit bericht is verwijderd|This message was deleted/.test(text)
    };
  });
}

/* ---------- 2. the blocks ----------
   She announced each category herself, so the boundaries are her words
   rather than a guess at the clock. Each opener is matched on the day's
   messages in order; a block runs until the next opener. */

const OPENERS = [
  { key: 'broodmare', re: /pictures all similar for the mares/i },
  { key: 'stallion',  re: /pictures of stallions for ICSI semen/i },
  { key: 'sport',     re: /Pictures for sport horses/i },
  { key: 'foal',      re: /Now I will send you the Foals/i },
  { key: 'maretext',  re: /texts for the breeding mares/i }
];

export function blocks(msgs) {
  const day = msgs.filter(m => m.date === DAY);
  const marks = [];
  for (const m of day) {
    const hit = OPENERS.find(o => o.re.test(m.text));
    if (hit && !marks.some(x => x.key === hit.key)) marks.push({ key: hit.key, i: m.i });
  }
  marks.sort((a, b) => a.i - b.i);
  return day.map(m => {
    let key = null;
    for (const mk of marks) if (m.i >= mk.i) key = mk.key;
    return { ...m, block: key };
  });
}

/* ---------- 3. names ----------
   A photograph carries its horse's name in one of two ways, and both occur
   in this batch: as the caption on the photograph itself, or as the very
   next text message. Anything longer than this is an instruction, not a
   name, so a length ceiling separates them. Her instructions are recognised
   by their opening words and never read as names. */

/* Some of her captions are not about a horse at all: they offer a picture
   for the top of a page. Those must not be pinned to whichever horse came
   last, so they are recognised first and answered with a role of their own. */
const PAGE_IMAGE = [
  [/use this one for the page\s*[“"']?([a-z ]+)/i, 'page image for '],
  [/can be the main picture of\s*[“"']?([a-z ]+)/i, 'page image for '],
  /* "Can you turn also Agousha to have all of them looking to the same side"
     came with a photograph of her own screen showing our archive, 1152 by
     2048. It is her pointing at a card, not a picture of the horse. Read as
     a name it would have replaced Agousha's photograph with a snapshot of a
     laptop. */
  [/can you turn(?: also)?\s+([A-Za-z' ]+?)\s+to have\b/i, 'her screen, feedback about ']
];

/* The ways she actually writes a name in this batch. Ordered, and each one
   explicit, because the first version of this stripped
   "The main pic of Charina is ok" down to "The" and carried that across
   eight foal photographs. A pattern that can silently truncate a name is
   worse than no pattern. */
const NAME_RULES = [
  [/^the name of the .+? is\s+(.+?)(?:\s*$)/i,        'she names it in a sentence'],
  [/^the main pic(?:ture)? of\s+(.+?)\s+is ok\b/i,    'main pic of X is ok'],
  [/^this picture is of\s+(.+?)(?:\s*\(|\s*$)/i,      'this picture is of X'],
  [/^(.+?)\s+main pic(?:ture)?\b/i,                   'X main pic'],
  [/^(.+?)\s+is ok\b/i,                               'X is ok'],
  [/^([^,.]+?)\s*$/,                                  'bare name']
];

const NOT_A_NAME = /^(now |please|if some|i would|we can|and |use |thanks|ok\b|this one|sorry|you can|let me|hi |good |perfect|i will|exactly|it |but )/i;

export function nameFrom(text) {
  if (!text) return { name: null, role: null };
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  if (!lines.length) return { name: null, role: null };

  for (const [re, label] of PAGE_IMAGE) {
    const m = re.exec(text);
    if (m) return { name: null, role: label + m[1].trim() };
  }

  const ok = t => {
    t = t.trim().replace(/[”"']/g, '');
    if (!t || t.length > 34 || t.length < 3) return null;
    if (NOT_A_NAME.test(t)) return null;
    if (!/[A-Za-z]{3}/.test(t)) return null;
    /* a fragment that is only a stop word is a truncation, not a name */
    if (/^(the|a|an|this|that|it|one)$/i.test(t)) return null;
    return t;
  };

  /* The sentence forms can sit on any line: she opened the day thanking
     Mark for two lines and named Hayley on the third. The bare-name form is
     read from the first line only, or every stray line would be a horse. */
  for (const [re, how] of NAME_RULES) {
    const bare = how === 'bare name';
    for (const line of (bare ? lines.slice(0, 1) : lines)) {
      const m = re.exec(line);
      if (!m) continue;
      const t = ok(m[1]);
      if (t) return { name: t, role: null, how };
    }
  }
  return { name: null, role: null };
}

/* ---------- 4. pairing ----------
   Walk the day in order. A photograph takes the name on its own caption, or
   the name in the next text message when it has no caption of its own. A
   photograph with neither belongs to the horse last named: those are the
   "let the face inside" second shots she asked for. A photograph before any
   name at all is not attributed; it goes on the review sheet. */

export function pair(day) {
  const shots = [];
  let last = null;

  for (let k = 0; k < day.length; k++) {
    const m = day[k];
    if (m.kind !== 'photo') {
      if (!m.deleted) {
        const r = nameFrom(m.text);
        if (r.name) last = { name: r.name, at: m.hhmm, block: m.block };
      }
      continue;
    }

    const own = nameFrom(m.text);
    let name = own.name;
    let how = name ? 'caption (' + own.how + ')' : null;
    let role = own.role;

    if (!name && !role) {
      /* the next text message, but only when it is a bare name. A sentence
         such as "The main pic of Charina is ok" comments on a photograph
         already sent; reading it as a label put Charina's name on Arkhana's
         two frames. "Cara Von Axe Z main pic" is the opposite: it labels the
         frame just sent, so that form is allowed. */
      const nxt = day.slice(k + 1).find(x => x.kind === 'text' && !x.deleted && x.text);
      const r2 = nxt ? nameFrom(nxt.text) : { name: null };
      /* the offer of a page picture arrives the same two ways a name does.
         "We can use this one for the page foals" came after its photograph,
         so reading only the caption filed the foals hero under Waikiki. */
      if (r2.role && nxt.i - m.i <= 2) role = r2.role;
      /* only when it follows closely: a name six messages later belongs to
         another photograph */
      const LABELS = ['bare name', 'X main pic'];
      if (r2.name && LABELS.includes(r2.how) && nxt.i - m.i <= 2) {
        name = r2.name; how = 'next message';
      }
    }

    /* an unnamed shot in one of the photograph blocks belongs to the horse
       last named: these are the second and third frames she asked to put
       inside. Never in the evening text block, where the only picture is the
       reference image she sent with her note about the hero. */
    if (!name && !role && last && last.block === m.block && m.block !== 'maretext') {
      name = last.name;
      how = 'follows ' + last.name;
    }
    if (!name && !role && m.block === 'maretext') role = 'reference image, sent with her feedback';

    if (name && how && !how.startsWith('follows')) last = { name, at: m.hhmm, block: m.block };

    shots.push({
      file: m.file, at: m.hhmm, block: m.block, name, how, role,
      note: m.text || '',
      /* "main pic" is her word for the card photograph; a caption that names
         the horse outright is the same thing */
      main: /main pic/i.test(m.text) || (!!how && !how.startsWith('follows'))
    });
  }
  return shots;
}

/* ---------- 5. the mare texts ----------
   Each is one message: the name on the first line, then her paragraphs. */

export function mareTexts(day) {
  return day
    .filter(m => m.block === 'maretext' && m.kind === 'text' && m.text.length > 200)
    .map(m => {
      const lines = m.text.split('\n').map(s => s.trim()).filter(Boolean);
      return { name: lines[0], body: lines.slice(1), at: m.hhmm, chars: m.text.length };
    });
}

/* ---------- 6. the embryo list ---------- */

export function embryoList(day) {
  const m = day.find(x => /full list of embryos/i.test(x.text));
  if (!m) return { implanted: [], frozen: [] };
  const out = { implanted: [], frozen: [] };
  let bucket = null;
  for (const line of m.text.split('\n').map(s => s.trim())) {
    if (/^implanted:?$/i.test(line)) { bucket = 'implanted'; continue; }
    if (/^frozen:?$/i.test(line)) { bucket = 'frozen'; continue; }
    if (!bucket || !line || !/ x /i.test(line)) continue;
    const due = /\(([^)]+)\)/.exec(line);
    /* the last line of the list carries WhatsApp's own "<this message was
       edited>" marker; it is not part of the cross. */
    const cross = line
      .replace(/\s*\([^)]*\)\s*/g, '')
      .replace(/\u200e?<[^>]*>\s*$/, '')
      .replace(/\u200e/g, '')
      .trim();
    if (cross) out[bucket].push({ cross, due: due ? due[1].trim() : '' });
  }
  return out;
}

/* ---------- 7. her remarks about the site ----------
   Everything she said on the day that is neither a name nor a mare text.
   Mark asked for this as a list; it is also the record of what she is still
   waiting on. */

export function remarks(msgs) {
  return msgs
    .filter(m => m.who !== 'EquiMarketing')
    .filter(m => m.date === DAY || m.date === '07-09-2026')
    .filter(m => !m.deleted)
    .filter(m => m.kind === "audio" || (m.text && m.text.length > 40 && m.text.length < 400 && !nameFrom(m.text).name))
    .map(m => ({ at: m.date.slice(0, 5) + ' ' + m.hhmm, kind: m.kind, file: m.file, text: m.text }));
}


/* ---------- 8. matching her names to the site ----------
   She writes "Cornet" where the record says "CORNET OBOLENSKY", and
   "Amnésia SVA" where the slug is amnesia-sva. Matching is on letters only,
   accents folded, and it must be unambiguous: a name that matches two
   records matches none, and lands on the review sheet instead. */

const fold = s => (s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]/g, '');

/* She renamed one horse on the day. It stood under its cross because it had
   no name yet; at 14:49 she wrote: "The name of the Comme il faut x Hypnotic
   filly is Claire Von Axe Z". A rename is not something to infer from a
   fuzzy match, so it is written down here, with the words that justify it. */
export const RENAMES = {
  'Claire Von Axe Z': {
    slug: 'comme-il-faut-x-hypnotic-jt-z',
    said: '06-09-2026 14:49  "The name of the Comme il faut x Hypnotic filly is Claire Von Axe Z"'
  }
};

/* The block she was in tells us the category, which settles the two names
   that would otherwise be ambiguous: in the stallion block "Cornet" is
   CORNET OBOLENSKY, not the embryo CORNET OBOLENSKY X AGOUSHA. */
const BLOCK_CATEGORY = { broodmare: 'broodmare', foal: 'foal', sport: 'sport', stallion: 'stallion' };

export function matchName(name, records, block) {
  const n = fold(name);
  if (n.length < 3) return { hit: null, why: 'too short to match' };

  const rn = RENAMES[name];
  if (rn) {
    const hit = records.find(r => r.slug === rn.slug);
    if (hit) return { hit, why: 'renamed by her', renamedFrom: hit.name, said: rn.said };
  }

  const want = BLOCK_CATEGORY[block];
  const pool = want ? records.filter(r => r.category === want) : records;
  const tries = pool.length ? [pool, records] : [records];

  for (const set of tries) {
    const scope = set === pool && want ? ' among the ' + want + 's' : '';

    const exact = set.filter(r => fold(r.name) === n);
    if (exact.length === 1) return { hit: exact[0], why: 'exact' + scope };

    /* her short form opens the record's name, or the other way round */
    const pre = set.filter(r => {
      const f = fold(r.name);
      return (f.startsWith(n) || n.startsWith(f)) && Math.min(f.length, n.length) >= 5;
    });
    if (pre.length === 1) return { hit: pre[0], why: 'opening' + scope };

    /* "Vigo" for VIGO D'ARSOUILLES, "Echo van spieveld" for ECHO VAN'T
       SPIEVELD: their first words agree and the rest is punctuation she
       leaves out. Four letters minimum so "Cara" cannot take "Caracho". */
    const head = t => fold(t.split(/\s+/)[0]);
    const h = head(name);
    if (h.length >= 4) {
      const tok = set.filter(r => head(r.name) === h);
      if (tok.length === 1) return { hit: tok[0], why: 'first word' + scope };
      if (tok.length > 1 && set === records)
        return { hit: null, why: 'matches ' + tok.length + ': ' + tok.map(r => r.name).join(', ') };
    }
  }
  return { hit: null, why: 'no record' };
}


/* ---------- 9. how big is the picture ----------
   Read straight out of the JPEG's start-of-frame marker, the way
   audit-site.mjs measures the share cards. The site resizes to 1100 wide and
   never upscales, so anything under that will be shown soft and has to be
   visible on the review sheet rather than discovered on the page. */

export function jpegSize(buf) {
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xC0 && marker <= 0xCF && ![0xC4, 0xC8, 0xCC].includes(marker)) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

/* ---------- run ---------- */

if (process.argv[1] && process.argv[1].endsWith('ingest-whatsapp.mjs')) {
  const chat = join(DIR, '_chat.txt');
  if (!existsSync(chat)) {
    console.error('No transcript at ' + chat + '. Unpack the export there first.');
    process.exit(1);
  }
  const msgs = readChat(chat);
  const day = blocks(msgs);
  const shots = pair(day);
  const texts = mareTexts(day);
  const emb = embryoList(day);
  const rem = remarks(msgs);

  const onDisk = new Set(readdirSync(DIR));
  for (const sh of shots) {
    if (!onDisk.has(sh.file)) continue;
    const d = jpegSize(readFileSync(join(DIR, sh.file)));
    if (d) { sh.w = d.w; sh.h = d.h; sh.small = d.w < 1100; }
  }
  const missing = shots.filter(s => !onDisk.has(s.file));
  const unnamed = shots.filter(s => !s.name);

  const byBlock = {};
  for (const s of shots) (byBlock[s.block || 'before any block'] ||= []).push(s);

  console.log('messages          ' + msgs.length + ', of which ' + day.length + ' on ' + DAY);
  console.log('photographs       ' + shots.length + (missing.length ? '  (' + missing.length + ' NOT on disk)' : ''));
  for (const [k, v] of Object.entries(byBlock)) {
    const named = new Set(v.filter(s => s.name).map(s => s.name));
    console.log('  ' + k.padEnd(18) + v.length + ' shot(s), ' + named.size + ' horse(s)');
  }
  console.log('mare texts        ' + texts.length);
  console.log('embryos           ' + emb.implanted.length + ' implanted, ' + emb.frozen.length + ' frozen');
  console.log('her remarks       ' + rem.length + ' (' + rem.filter(r => r.kind === 'audio').length + ' voice, not listened to)');
  if (unnamed.length) console.log('UNATTRIBUTED      ' + unnamed.length + ' photograph(s) — see the review sheet');

  /* ---- match her names to the records on the site ---- */
  const ctx = {};
  new Function('g', readFileSync(join(root, 'horses-data.js'), 'utf8') + '\ng.H=HORSES;')(ctx);
  new Function('g', readFileSync(join(root, 'semen-data.js'), 'utf8') + '\ng.S=SEMEN;')(ctx);
  const records = [...ctx.H, ...ctx.S];

  const byName = new Map();
  for (const sh of shots) {
    if (!sh.name) continue;
    if (!byName.has(sh.name)) byName.set(sh.name, []);
    byName.get(sh.name).push(sh);
  }

  const rows = [];
  for (const [name, list] of byName) {
    const m = matchName(name, records, list[0].block);
    rows.push({
      name, shots: list, block: list[0].block,
      slug: m.hit ? m.hit.slug : null,
      onSite: m.hit ? m.hit.name : null,
      category: m.hit ? m.hit.category : null,
      why: m.why,
      renamedFrom: m.renamedFrom || null,
      said: m.said || null,
      state: m.hit ? (m.renamedFrom ? 'renamed' : 'known') : (m.why === 'no record' ? 'new' : 'unsure')
    });
  }
  rows.sort((a, b) => (a.block || '').localeCompare(b.block || '') || a.name.localeCompare(b.name));

  const count = k => rows.filter(r => r.state === k).length;
  console.log('\nnames               ' + rows.length + ':  ' + count('known') + ' on the site, '
    + count('renamed') + ' renamed, ' + count('new') + ' new, ' + count('unsure') + ' unsure');

  /* the mare texts, matched the same way */
  const textRows = texts.map(t => {
    const m = matchName(t.name, records, 'broodmare');
    return { ...t, slug: m.hit ? m.hit.slug : null, onSite: m.hit ? m.hit.name : null, why: m.why };
  });
  const textMiss = textRows.filter(t => !t.slug);
  if (textMiss.length) console.log('mare texts unmatched ' + textMiss.map(t => t.name).join(', '));

  writeFileSync(join(DIR, 'parsed.json'),
    JSON.stringify({ shots, rows, texts: textRows, embryos: emb, remarks: rem }, null, 1));

  /* ---- the review sheet ----
     Every photograph beside the horse it has been given to, so the pairing
     can be checked by eye before anything is published. The pictures are in
     this same folder, so the page works straight off disk. */
  const esc = t => String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* Mark asked for one search token on everything that needs a decision, so
     he can walk them with cmd+F rather than scrolling. Two brackets, his
     choice, and counted at the top so he knows when he has seen them all. */
  let marks = 0;
  const MARK = () => { marks++; return '<b class="mark">()</b>'; };

  const BLOCK_TITLE = {
    broodmare: 'Breeding mares', stallion: 'ICSI stallions',
    sport: 'Sport horses', foal: 'Foals', maretext: 'Sent with the evening texts'
  };

  const cardsFor = list => list.map(sh => `
      <figure${sh.main ? ' class="main"' : ''}>
        <img src="${esc(sh.file)}" alt="" loading="lazy">
        <figcaption>${esc(sh.at)}${sh.main ? ' &middot; main' : ''}
          ${'<span' + (sh.small ? ' class="soft"' : '') + '>' + sh.w + '&times;' + sh.h + (sh.small ? ', soft' : '') + '</span>'}
          <br><span>${esc(sh.how || sh.role || '')}</span></figcaption>
      </figure>`).join('');

  const groups = [...new Set(rows.map(r => r.block))].map(b => {
    const list = rows.filter(r => r.block === b);
    return `<h2>${esc(BLOCK_TITLE[b] || b)} <small>${list.length} horses, ${list.reduce((n, r) => n + r.shots.length, 0)} photographs</small></h2>` +
      list.map(r => `
    <section class="horse ${r.state}">
      <h3>${esc(r.name)}
        ${r.state === 'renamed' ? MARK() + '<b class="flag">renamed, was ' + esc(r.renamedFrom) + '</b>'
          : r.state === 'known' ? '<span class="ok">&rarr; ' + esc(r.onSite) + '</span>'
          : MARK() + '<b class="flag">' + esc(r.why) + '</b>'}
        <small>${esc(r.why)}</small>
      </h3>
      ${r.said ? '<p class="said">' + esc(r.said) + '</p>' : ''}
      <div class="run">${cardsFor(r.shots)}</div>
    </section>`).join('');
  }).join('');

  const loose = shots.filter(sh => !sh.name);
  const looseHtml = loose.length ? `<h2>Not given to a horse <small>${loose.length}</small></h2>
    <section class="horse unsure"><div class="run">${cardsFor(loose)}</div>
    <p class="said">${loose.map(l => MARK() + ' ' + esc(l.at + ' — ' + (l.role || 'no name anywhere near it'))).join('<br>')}</p></section>` : '';

  /* Her remarks all want an answer, so every one of them is marked. The
     voice message is marked twice over: nobody has heard it yet. */
  const remarkHtml = rem.map(r => `<tr><td>${esc(r.at)}</td><td>${MARK()} ${
    r.kind === 'audio' ? '<b class="flag">voice message, not listened to</b> <code>' + esc(r.file) + '</code>'
                       : esc(r.text)}</td></tr>`).join('');

  const onSiteCross = new Set(ctx.H.filter(h => h.category === 'embryo').map(h => fold(h.name)));
  const embHtml = ['implanted', 'frozen'].map(k => {
    const items = emb[k].map(e => {
      const known = onSiteCross.has(fold(e.cross));
      return `<li>${known ? '' : MARK() + ' '}${esc(e.cross)}` +
        (e.due ? ' <span class="ok">due ' + esc(e.due) + '</span>' : '') +
        (known ? '' : ' <b class="flag">not on the site yet</b>') + '</li>';
    }).join('');
    return `<h3>${k} <small>${emb[k].length}</small></h3><ol>${items}</ol>`;
  }).join('');

  writeFileSync(join(DIR, 'review.html'), `<!doctype html><meta charset="utf-8">
<title>WhatsApp 6 September &mdash; what was found</title>
<style>
 body{font:15px/1.5 -apple-system,system-ui,sans-serif;margin:0;padding:2rem;background:#f8f5ef;color:#14202e;max-width:1200px}
 h1{font-size:1.6rem;margin:0 0 .3rem} h2{margin:2.4rem 0 .8rem;font-size:1.15rem;border-bottom:1px solid #d9d2c4;padding-bottom:.4rem}
 h3{font-size:1rem;margin:0 0 .5rem;font-weight:600}
 small{font-weight:400;color:#7b756a;font-size:.8rem;margin-left:.5rem}
 .horse{background:#fff;border-radius:12px;padding:1rem 1.1rem;margin-bottom:.9rem;border:1px solid #e6e0d4}
 .horse.renamed{border-color:#b3924f;background:#fffaf0}
 .horse.new,.horse.unsure{border-color:#c0392b;background:#fff5f4}
 .run{display:flex;gap:.6rem;flex-wrap:wrap}
 figure{margin:0;width:150px} figure img{width:150px;height:150px;object-fit:cover;border-radius:8px;display:block;background:#eee}
 figure.main img{outline:3px solid #b3924f;outline-offset:2px}
 figcaption{font-size:.72rem;color:#7b756a;margin-top:.3rem} figcaption span{color:#a49c8e}
 .ok{color:#2c6e49;font-weight:400;font-size:.85rem} .flag{color:#c0392b;font-size:.8rem}
 .said{font-size:.8rem;color:#7b756a;margin:.2rem 0 .7rem;font-style:italic}
 table{border-collapse:collapse;width:100%;background:#fff;border-radius:12px;overflow:hidden}
 td{padding:.5rem .8rem;border-bottom:1px solid #eee;vertical-align:top} td:first-child{white-space:nowrap;color:#7b756a;width:6rem}
 ol{margin:.3rem 0 1rem;padding-left:1.4rem} li{margin:.15rem 0}
 code{font-size:.75rem;background:#f0ece2;padding:.1rem .3rem;border-radius:4px}
 .mark{background:#ffd84d;color:#14202e;border-radius:4px;padding:0 .25rem;margin-right:.35rem;font-weight:700}
 .soft{color:#9a8f7d}
 .legend{background:#fff;border:1px solid #e6e0d4;border-radius:12px;padding:.8rem 1rem;margin:1rem 0}
</style>
<h1>WhatsApp, 6 September</h1>
<p>${shots.length} photographs, ${rows.length} horses, ${texts.length} mare texts.
Gold outline is the card photograph. Sizes are shown for information; the site resizes to
1100 wide and never enlarges, so anything under that is simply used as it came. Mark, 7 Sep:
resolution is not a decision, so it carries no marker.</p>
<div class="legend"><b>${marks} things need a decision.</b> Each one carries the yellow
tag; search for it and step through them. The count above is exactly what the search
will find, because this line does not print the tag itself.</div>
${groups}
${looseHtml}
<h2>Her remarks about the site <small>${rem.length}</small></h2>
<table>${remarkHtml}</table>
<h2>The embryo list <small>${emb.implanted.length + emb.frozen.length} against 15 on the site</small></h2>
${embHtml}
`);
  console.log('wrote content/whatsapp-2026-09-06/parsed.json and review.html  (' + marks + ' marked)');
}
