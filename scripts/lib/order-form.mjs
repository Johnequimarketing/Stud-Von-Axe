/* The ICSI order form: five steps, one on screen at a time.
 *
 * Asked for on 31 Aug: "er moet een groter formulier komen met aanvraag van de
 * gegevens dan standaard ... dit moet in een configurator achtig gevoel, dus
 * met stappen, niet zo standaard onder elkaar". The fields are Mark's list,
 * in the order he wrote it.
 *
 * It is not a second form design. The plate, the navy half, the labels and the
 * fields are the .ask recipe that the other sixty pages already carry, lifted
 * from index.html; what is added here is the rail down the left, the panels,
 * and the walk between them. A stallion page shows this instead of .ask, never
 * both.
 *
 * Three places where Mark's list is a Dutch stallion station's and this is an
 * Italian stud selling across Europe, changed on purpose and flagged on the
 * checklist:
 *   - the country list was Nederland / België / Duitsland / Anders. Italy is
 *     where the stud is and France buys from it, so both are in the list.
 *   - the examples were a Dutch mobile number and a Dutch postcode.
 *   - "Vorm van sperma: Vers / Diepvries" is a choice this stud does not
 *     offer. The owners said on 31 Aug that they do ICSI and nothing else, so
 *     the field states ICSI rather than asking a question with one answer.
 *
 * No server: the send button opens the mail client with every answer in the
 * body, which is what every other form on this site does. The summary step
 * shows exactly what will be sent, so nobody presses send on something they
 * have not read.
 */

/* ── the fields, in Mark's order ─────────────────────────────────────────
   One list, read by both the markup and the summary, so a field cannot be
   asked for and then left out of the mail.
     k     the name attribute
     l     the label
     t     text | tel | email | date | select | textarea | fixed
     req   must be filled before the step will advance
     when  only asked while another field holds this value
     hint  the small grey line under the label                            */
const STEPS = [
  {
    n: '01', title: 'Your details',
    hint: 'So we know who we are talking to.',
    fields: [
      { k: 'title', l: 'Title', t: 'select', req: true, options: ['Mr', 'Mrs'] },
      { k: 'initials', l: 'Initials', t: 'text', hint: 'J.A.' },
      { k: 'firstname', l: 'First name', t: 'text', req: true },
      { k: 'lastname', l: 'Last name', t: 'text', req: true },
      { k: 'kind', l: 'Type of enquiry', t: 'select', req: true, options: ['Private', 'Business'] },
      { k: 'company', l: 'Company name', t: 'text', req: true, when: ['kind', 'Business'] },
      { k: 'tel', l: 'Telephone', t: 'tel', req: true, hint: '+39 349 591 8565' },
      { k: 'email', l: 'Email', t: 'email', req: true, hint: 'you@example.com' },
    ],
  },
  {
    n: '02', title: 'Billing address',
    hint: 'Also the delivery address, unless you say otherwise below.',
    fields: [
      { k: 'street', l: 'Street and number', t: 'text', req: true },
      { k: 'postcode', l: 'Postcode', t: 'text', req: true },
      { k: 'town', l: 'Town', t: 'text', req: true },
      { k: 'country', l: 'Country', t: 'select', req: true,
        options: ['Italy', 'Belgium', 'Netherlands', 'Germany', 'France', 'Other'] },
      { k: 'same', l: 'The delivery address is the same as the billing address',
        t: 'check', checked: true },
      { k: 'dstreet', l: 'Delivery street and number', t: 'text', req: true, when: ['same', ''] },
      { k: 'dpostcode', l: 'Delivery postcode', t: 'text', req: true, when: ['same', ''] },
      { k: 'dtown', l: 'Delivery town', t: 'text', req: true, when: ['same', ''] },
      { k: 'dcountry', l: 'Delivery country', t: 'select', req: true, when: ['same', ''],
        options: ['Italy', 'Belgium', 'Netherlands', 'Germany', 'France', 'Other'] },
    ],
  },
  {
    n: '03', title: 'Stallion and mare',
    hint: 'The stallion is the page you came from. Tell us the mare.',
    fields: [
      { k: 'stallion', l: 'Stallion', t: 'fixed' },
      { k: 'mare', l: 'Name of the mare', t: 'text', req: true },
      { k: 'ueln', l: 'Life number of the mare', t: 'text', hint: 'UELN' },
      { k: 'studbook', l: 'Studbook of the mare', t: 'text', hint: 'KWPN, BWP, Zangersheide' },
    ],
  },
  {
    n: '04', title: 'Delivery',
    hint: 'When you want it and anything we should know.',
    fields: [
      { k: 'date', l: 'Preferred delivery date', t: 'date', req: true },
      { k: 'form', l: 'Form of semen', t: 'fixed', value: 'ICSI',
        hint: 'The only kind this stud produces' },
      { k: 'notes', l: 'Notes', t: 'textarea',
        hint: 'The cycle of your mare, or a moment that suits you' },
    ],
  },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const field = (f, horseName) => {
  const id = `ord-${f.k}`;
  const req = f.req ? ' data-req="1"' : '';
  /* A hint is either the grey line under the label or the placeholder inside
     the box, never both: printed twice it reads as a mistake, which is what
     J.A. above an empty box saying J.A. looked like. */
  const wrap = (inner, showHint) =>
    `<div class="ask__row"${f.when ? ` data-when="${f.when[0]}" data-is="${esc(f.when[1])}" hidden` : ''}>` +
    `<label for="${id}">${esc(f.l)}${f.req ? '' : ' <span class="ask__opt">optional</span>'}</label>` +
    (f.hint && showHint ? `<span class="ord__hint">${esc(f.hint)}</span>` : '') +
    inner + '</div>';

  if (f.t === 'check') {
    return `<div class="ask__row ord__check">` +
      `<label for="${id}"><input type="checkbox" id="${id}" name="${f.k}"${f.checked ? ' checked' : ''}>` +
      `<span>${esc(f.l)}</span></label></div>`;
  }
  if (f.t === 'fixed') {
    const v = f.value || horseName;
    return wrap(`<input type="text" id="${id}" name="${f.k}" value="${esc(v)}" readonly>`, true);
  }
  if (f.t === 'select') {
    return wrap(`<select id="${id}" name="${f.k}"${req}>` +
      `<option value="">Choose one</option>` +
      f.options.map((o) => `<option>${esc(o)}</option>`).join('') + '</select>', true);
  }
  if (f.t === 'textarea') {
    return wrap(`<textarea id="${id}" name="${f.k}" rows="4"${req}` +
      `${f.hint ? ` placeholder="${esc(f.hint)}"` : ''}></textarea>`, false);
  }
  return wrap(`<input type="${f.t}" id="${id}" name="${f.k}"${req}` +
    `${f.hint ? ` placeholder="${esc(f.hint)}"` : ''}>`, false);
};

export const orderSection = (horseName) => `
  <section class="ask ord" id="order">
    <div class="wrap">
      <div class="ask__box">
        <div class="ask__side">
          <div>
            <p class="plaque">ICSI semen</p>
            <h2 class="ask__h">Order your ICSI <em>through us</em></h2>
            <p class="ask__lead">Five steps. We answer with what we hold of ${esc(horseName)}, what it
            costs and when it can leave.</p>
          </div>
          <ol class="ord__rail">
${STEPS.map((s, i) => `            <li><button class="ord__tab" type="button" data-go="${i}"${i === 0 ? ' aria-current="step"' : ''}>
              <span class="ord__no">${s.n}</span><span class="ord__tt">${esc(s.title)}</span></button></li>`).join('\n')}
            <li><button class="ord__tab" type="button" data-go="${STEPS.length}">
              <span class="ord__no">0${STEPS.length + 1}</span><span class="ord__tt">Summary</span></button></li>
          </ol>
          <div class="ask__people">
            <a class="ask__p" href="tel:+393495918565">
              <span class="ask__pk">Elisabetta</span><span class="ask__pv">+39 349 591 8565</span></a>
            <a class="ask__p" href="mailto:studvonaxe@gmail.com">
              <span class="ask__pk">By mail</span><span class="ask__pv">studvonaxe@gmail.com</span></a>
          </div>
        </div>

        <form class="ask__form ord__form" data-horse="${esc(horseName)}">
${STEPS.map((s, i) => `          <fieldset class="ord__step"${i ? ' hidden' : ''}>
            <legend class="ord__h"><span class="ord__no">${s.n}</span> ${esc(s.title)}</legend>
            <p class="ord__lead">${esc(s.hint)}</p>
            <div class="ord__grid">
${s.fields.map((f) => '              ' + field(f, horseName)).join('\n')}
            </div>
          </fieldset>`).join('\n')}

          <fieldset class="ord__step" hidden>
            <legend class="ord__h"><span class="ord__no">0${STEPS.length + 1}</span> Summary</legend>
            <p class="ord__lead">Everything you have filled in. This is what reaches us, word for word.</p>
            <dl class="ord__sum"></dl>
            <!-- Both link out since 31 Aug: a box asking somebody to agree to a
                 document they cannot open is not worth ticking. -->
            <div class="ask__row ord__check">
              <label for="ord-terms"><input type="checkbox" id="ord-terms" name="terms" data-req="1">
              <span>I agree to the <a href="/terms" target="_blank" rel="noopener">terms and conditions</a></span></label>
            </div>
            <div class="ask__row ord__check">
              <label for="ord-privacy"><input type="checkbox" id="ord-privacy" name="privacy" data-req="1">
              <span>I agree to the <a href="/privacy" target="_blank" rel="noopener">privacy policy</a></span></label>
            </div>
          </fieldset>

          <p class="ord__note" role="status" aria-live="polite"></p>
          <div class="ord__acts">
            <button type="button" class="btn btn-ghost btn-pill" data-ord="back" hidden>Back</button>
            <button type="button" class="btn btn-gold btn-pill" data-ord="next">Next <span class="a" aria-hidden="true">&rarr;</span></button>
            <button type="submit" class="btn btn-gold btn-pill" data-ord="send" hidden>Send the order <span class="a" aria-hidden="true">&rarr;</span></button>
          </div>
        </form>
      </div>
    </div>
  </section>
`;

/* ── the look ────────────────────────────────────────────────────────────
   Only the rail, the panel and the two checkbox rows are new. Everything
   else is .ask, which is why a stallion's order form and a foal's enquiry
   form are recognisably the same object.                                */
export const orderCss = `
  /* The rail is the configurator: five numbered steps down the navy half,
     the one you are on in gold, the ones behind you in white. It is the
     progress bar and the way back in one control. */
  .ord__rail{ list-style:none; margin:1.6rem 0; padding:0; display:grid; gap:.15rem; }
  .ord__tab{
    display:flex; align-items:center; gap:.8rem; width:100%;
    padding:.6rem .7rem; border-radius:var(--ctl-radius);
    background:none; border:0; cursor:pointer; text-align:left;
    color:rgba(255,255,255,.5);
    transition:background .3s var(--ease), color .3s var(--ease);
  }
  .ord__tab:hover{ color:var(--color-white); background:rgba(255,255,255,.06); }
  .ord__tab .ord__no{
    flex:none; font-family:var(--font-body); font-weight:700; font-size:10px;
    letter-spacing:.18em; color:inherit;
  }
  .ord__tt{ font-family:var(--font-display); font-size:15px; line-height:1.2; }
  .ord__tab.is-done{ color:rgba(255,255,255,.82); }
  .ord__tab[aria-current="step"]{ background:var(--color-gold); color:var(--color-navy); }
  .ord__tab[aria-current="step"] .ord__tt{ font-weight:400; }

  /* The panel. A fieldset carries a border and padding of its own in every
     browser; this one is a plain block, and its legend is the heading. */
  .ord__step{ border:0; margin:0; padding:0; min-width:0; }
  /* The hidden attribute is a browser default of display:none, and a default
     loses to any class in the sheet. .ask__row is display:flex and .btn is
     display:inline-flex, so a row waiting on an answer and a button waiting
     for its step were both drawn anyway: the company name stood there with
     nothing choosing it, and Next and Send were on screen at once. */
  .ord__step[hidden]{ display:none; }
  .ask__row[hidden]{ display:none; }
  .ord__acts .btn[hidden]{ display:none; }
  .ord__h{
    display:flex; align-items:baseline; gap:.7rem; padding:0; margin:0 0 .3rem;
    font-family:var(--font-display); font-weight:400;
    font-size:clamp(1.3rem,1.4vw + .8rem,1.7rem); line-height:1.1; color:var(--color-ink);
  }
  .ord__h .ord__no{
    font-family:var(--font-body); font-weight:700; font-size:10px; letter-spacing:.18em;
    color:var(--color-gold);
  }
  .ord__lead{ margin:0 0 1.4rem; font-size:14px; line-height:1.55; color:var(--color-ink-soft); }
  .ord__grid{ display:grid; gap:0 1rem; }
  @media (min-width:620px){ .ord__grid{ grid-template-columns:1fr 1fr; } }
  /* The three that need the full width whatever the screen does. */
  .ord__grid > .ask__row:has(textarea),
  .ord__grid > .ord__check{ grid-column:1 / -1; }
  .ord__hint{
    font-family:var(--font-body); font-size:12.5px; line-height:1.4;
    color:var(--color-ink-soft); margin-top:-.15rem;
  }
  .ord__step input[readonly]{
    background:var(--color-base-alt); color:var(--color-ink); cursor:default;
  }

  /* A checkbox is the one control here that reads left to right. */
  .ord__check label{
    display:flex; align-items:flex-start; gap:.7rem; cursor:pointer;
    font-family:var(--font-body); font-weight:400; font-size:14px; line-height:1.5;
    letter-spacing:0; text-transform:none; color:var(--color-ink);
  }
  .ord__check input{ flex:none; width:18px; height:18px; margin-top:.15rem; accent-color:var(--color-gold); }
  .ord__check a{ color:var(--color-navy); border-bottom:1px solid var(--color-line); }
  .ord__check a:hover{ border-color:var(--color-gold); }

  /* The summary. Their answers back to them, in the order they were asked. */
  .ord__sum{ margin:0 0 1.4rem; display:grid; gap:0; }
  .ord__sum div{
    display:flex; flex-wrap:wrap; gap:.2rem 1rem; justify-content:space-between;
    padding:.55rem 0; border-top:1px solid var(--color-line);
  }
  .ord__sum dt{
    font-family:var(--font-body); font-weight:700; font-size:10px; letter-spacing:.18em;
    text-transform:uppercase; color:var(--color-gold);
  }
  .ord__sum dd{ margin:0; font-family:var(--font-display); font-size:15px; color:var(--color-ink);
    text-align:right; }

  .ord__acts{ display:flex; flex-wrap:wrap; gap:.7rem; margin-top:1.4rem; }
  .ord__note{ margin:1rem 0 0; font-size:14px; line-height:1.55; color:var(--color-ink-soft); }
  .ord__note.is-bad{ color:var(--color-navy); }
  /* The form is a walk, not a column: it starts at the top of its half.
     Named on its own class rather than scoped through .ord, so the class in
     the markup has a rule of its own and the audit can see it. It is later in
     the sheet than .ask__form, so it wins the centring. */
  .ord__form{ justify-content:flex-start; }
`;

export const orderScript = `<script>
(function(){
  var form = document.querySelector('.ord__form');
  if(!form) return;
  var steps = [].slice.call(form.querySelectorAll('.ord__step'));
  var tabs  = [].slice.call(document.querySelectorAll('.ord__tab'));
  var back  = form.querySelector('[data-ord="back"]');
  var next  = form.querySelector('[data-ord="next"]');
  var send  = form.querySelector('[data-ord="send"]');
  var note  = form.querySelector('.ord__note');
  var sum   = form.querySelector('.ord__sum');
  var last  = steps.length - 1;
  var at = 0;
  var seen = 0;   /* the furthest step that has been filled in and passed */

  /* A row that only applies while another answer holds a value. The empty
     string means "while that box is NOT ticked", which is how the delivery
     address works. */
  function conditions(){
    form.querySelectorAll('[data-when]').forEach(function(row){
      var src = form.elements[row.getAttribute('data-when')];
      if(!src) return;
      var want = row.getAttribute('data-is');
      var have = src.type === 'checkbox' ? (src.checked ? 'on' : '') : src.value;
      row.hidden = have !== want;
    });
  }
  form.addEventListener('change', conditions);
  conditions();

  function live(el){
    var row = el.closest('.ask__row');
    return !(row && row.hidden);
  }

  function check(i){
    var bad = [];
    steps[i].querySelectorAll('[data-req]').forEach(function(el){
      if(!live(el)) return;
      var ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
      if(ok && el.type === 'email') ok = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(el.value.trim());
      if(!ok) bad.push(el);
    });
    if(!bad.length) return true;
    note.textContent = bad.length === 1
      ? 'One answer is still missing or not complete on this step.'
      : bad.length + ' answers are still missing or not complete on this step.';
    note.classList.add('is-bad');
    bad[0].focus();
    return false;
  }

  /* Every answer that was actually asked, in the order it was asked, which is
     both the summary on screen and the body of the mail. */
  function answers(){
    var out = [];
    steps.slice(0, last).forEach(function(step){
      step.querySelectorAll('input, select, textarea').forEach(function(el){
        if(!live(el)) return;
        var row = el.closest('.ask__row');
        var label = row && row.querySelector('label');
        var name = label ? label.textContent.replace(/optional/i, '').trim() : el.name;
        var value = el.type === 'checkbox' ? (el.checked ? 'Yes' : 'No') : el.value.trim();
        if(value) out.push([name, value]);
      });
    });
    return out;
  }

  function fill(){
    sum.innerHTML = answers().map(function(p){
      return '<div><dt>' + p[0] + '</dt><dd>' + p[1] + '</dd></div>';
    }).join('');
  }

  /* The heading takes focus when somebody walks to a step, so a screen reader
     lands on the new panel rather than staying on the button. Not on arrival:
     that scrolled the page down to the form and drew a focus ring around a
     heading nobody had touched. */
  function show(i, move){
    at = Math.max(0, Math.min(i, last));
    steps.forEach(function(s, n){ s.hidden = n !== at; });
    tabs.forEach(function(t, n){
      if(n === at) t.setAttribute('aria-current', 'step');
      else t.removeAttribute('aria-current');
      t.classList.toggle('is-done', n < at);
    });
    back.hidden = at === 0;
    next.hidden = at === last;
    send.hidden = at !== last;
    note.textContent = '';
    note.classList.remove('is-bad');
    if(at === last) fill();
    var h = steps[at].querySelector('.ord__h');
    if(h && move){ h.setAttribute('tabindex', '-1'); h.focus(); }
  }

  next.addEventListener('click', function(){
    if(!check(at)) return;
    seen = Math.max(seen, at + 1);
    show(at + 1, true);
  });
  back.addEventListener('click', function(){ show(at - 1, true); });
  tabs.forEach(function(t){
    t.addEventListener('click', function(){
      var to = Number(t.getAttribute('data-go'));
      /* Back to anything already filled in, forward only through the door. */
      if(to > at && !check(at)) return;
      if(to > seen && to > at + 1) return;
      if(to > at) seen = Math.max(seen, to);
      show(to, true);
    });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    /* Walk to the step that is short of an answer and say what is missing
       there. check() writes the line and show() clears it, so the check is
       run again once the step is on screen: without that the send button
       simply did nothing on a page with an unticked box. */
    for(var i = 0; i <= last; i++){ if(!check(i)){ show(i, true); check(i); return; } }
    var horse = form.getAttribute('data-horse');
    var body = answers().map(function(p){ return p[0] + ': ' + p[1]; });
    body.push('', 'Agreed to the breeding terms and the privacy statement.');
    note.classList.remove('is-bad');
    note.textContent = 'Opening your mail app with the order ready to send. If nothing happens, write to studvonaxe@gmail.com.';
    location.href = 'mailto:studvonaxe@gmail.com'
      + '?subject=' + encodeURIComponent('ICSI order: ' + horse)
      + '&body=' + encodeURIComponent(body.join('\\n'));
  });

  show(0, false);
})();
<\/script>`;
