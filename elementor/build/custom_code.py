"""De code die Elementor niet heeft, per stage in zijn eigen bestand.

Vier stukjes. Alle vier gaan ze in Elementor -> Custom Code, want dat bewaart ze
in de database van de site en niet in een plugin: als de importer straks
verwijderd wordt, blijven ze staan. Ze staan hier bij de sjablonen die ze nodig
hebben, want code die los van zijn sjabloon leeft raakt los van zijn sjabloon.

De vier zijn overgezet uit de statische site en niet opnieuw bedacht. Wat daar
een gemeten keuze was, is dat hier ook: de kopbalk meet de onderrand van de
hero, en de rails glijden met een eigen tween omdat scroll-behavior:smooth door
sommige engines wordt genegeerd zodra het element niet in beeld is.
"""
import sys, os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib_axe import stage_folder

WORTEL = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def schrijf(stage_slug, naam, tekst):
    m = os.path.join(WORTEL, "wordpress-elementor", stage_folder(stage_slug), "templates")
    os.makedirs(m, exist_ok=True)
    pad = os.path.join(m, naam)
    with open(pad, "w", encoding="utf-8") as f:
        f.write(tekst)
    return pad


KOP = """<!-- Elementor -> Custom Code -> Add New
     Location: </body>   Conditions: Entire Site
     ------------------------------------------------------------------ -->
"""


RAILS = KOP + """<!-- De rails: nieuws, partners en "more horses".

     Elementor's carousel heeft geen pijl die zichzelf uitschakelt aan het eind
     en geen scroll-snap. Dit is dezelfde controller als op de statische site.
     Zet op de loop grid die een rail moet worden de CSS-klasse `sva-rail` en
     geef de twee knoppen ernaast `sva-arrow` met data-run="<id van de rail>".
-->
<script>
(function () {
  var still = matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-run]').forEach(function (knop) {
    var rail = document.getElementById(knop.getAttribute('data-run'));
    if (!rail) return;
    var richting = knop.getAttribute('data-dir') === 'prev' ? -1 : 1;

    function stap() {
      var kaart = rail.firstElementChild;
      if (!kaart) return rail.clientWidth;
      var gat = parseFloat(getComputedStyle(rail).columnGap) || 0;
      return kaart.getBoundingClientRect().width + gat;
    }

    /* Een eigen tween in plaats van scroll-behavior:smooth. Engines laten die
       laatste vallen zodra het element niet zichtbaar is, en dan springt de
       rail in plaats van te glijden. */
    function glijd(naar) {
      if (still.matches) { rail.scrollLeft = naar; return; }
      var van = rail.scrollLeft, begin = performance.now(), duur = 420;
      (function stap_(nu) {
        var t = Math.min(1, (nu - begin) / duur);
        var e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        rail.scrollLeft = van + (naar - van) * e;
        if (t < 1) requestAnimationFrame(stap_);
      })(begin);
    }

    knop.addEventListener('click', function () {
      glijd(rail.scrollLeft + richting * stap());
    });
  });

  /* Een pijl die niets meer kan, leest als een pijl die niets meer kan. */
  function sync() {
    document.querySelectorAll('[data-run]').forEach(function (knop) {
      var rail = document.getElementById(knop.getAttribute('data-run'));
      if (!rail) return;
      var eind = rail.scrollWidth - rail.clientWidth - 1;
      knop.disabled = knop.getAttribute('data-dir') === 'prev'
        ? rail.scrollLeft <= 0
        : rail.scrollLeft >= eind;
    });
  }
  document.querySelectorAll('.sva-rail').forEach(function (r) {
    r.addEventListener('scroll', sync, { passive: true });
  });
  addEventListener('resize', sync);
  /* Ook op load, niet alleen op een rAF: op de statische site liep de eerste
     sync voordat de opmaak klaar was, en dan denkt elke rail dat hij overloopt
     en staat geen enkele pijl ooit uit. */
  addEventListener('load', sync);
  sync();
})();
</script>
"""


TABS = KOP + """<!-- De vijf tabbladen op de homepagina, "Every horse we have".

     De Tabs-widget doet de tabbladen. Wat hij niet doet is bij het wisselen
     ook de foto, de zin en de twee knoppen omzetten. Vul TABS hieronder met de
     vijf regels; de href's zijn de vijf archieven en de foto's staan al in de
     mediabibliotheek.

     Zonder JavaScript blijven het vijf gewone links naar de vijf archieven.
     Dat is met opzet: een zoekmachine vindt ze zo nog steeds.
-->
<script>
(function () {
  var TABS = {
    'sport-horses':   { href: '/sport-horses/',   zin: 'Bred here or carefully sourced, and developed for the sport.' },
    'breeding-mares': { href: '/breeding-mares/', zin: 'Strong maternal lines, chosen for what their families produce.' },
    'foals':          { href: '/foals/',          zin: 'Born from proven bloodlines and raised in Belgium.' },
    'embryos':        { href: '/embryos/',        zin: 'Frozen from our own damlines, or already carrying.' },
    'icsi-semen':     { href: '/icsi-semen/',     zin: 'ICSI semen from selected stallions, stored at Avantea.' }
  };

  var doos = document.getElementById('sva-tabs');
  if (!doos) return;
  var zin = doos.querySelector('[data-sva-tab-text]');
  var cta = doos.querySelector('[data-sva-tab-cta]');
  var still = matchMedia('(prefers-reduced-motion: reduce)');

  function verf(sleutel) {
    var t = TABS[sleutel];
    if (!t) return;
    if (zin) zin.textContent = t.zin;
    if (cta) { cta.setAttribute('href', t.href); }
  }

  doos.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-tab-index]');
    if (!tab) return;
    var sleutel = (tab.textContent || '').trim().toLowerCase().replace(/\\s+/g, '-');
    if (still.matches) return verf(sleutel);
    doos.classList.add('is-turning');
    setTimeout(function () { verf(sleutel); doos.classList.remove('is-turning'); }, 180);
  });

  verf(Object.keys(TABS)[0]);
})();
</script>
<style>
  #sva-tabs.is-turning [data-sva-tab-text],
  #sva-tabs.is-turning [data-sva-tab-cta] { opacity: 0; }
  #sva-tabs [data-sva-tab-text],
  #sva-tabs [data-sva-tab-cta] { transition: opacity .18s; }
</style>
"""


TOC = KOP + """<!-- De inhoudsopgave op de privacy- en voorwaardenpagina.

     Sticky doet Elementor zelf. Wat hij niet doet is meelopen: markeren welke
     sectie je aan het lezen bent. Dit zet aria-current op de dichtstbijzijnde
     link en laat de opmaak daarop reageren.
-->
<script>
(function () {
  var toc = document.querySelector('[data-sva-toc]');
  if (!toc) return;
  var links = [].slice.call(toc.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;
  var doelen = links.map(function (a) {
    return document.getElementById(a.getAttribute('href').slice(1));
  });

  function marge() {
    var hd = document.getElementById('sva-header');
    return (hd ? hd.offsetHeight : 0) + 24;
  }

  function sync() {
    var grens = marge(), actief = 0;
    doelen.forEach(function (el, i) {
      if (el && el.getBoundingClientRect().top <= grens) actief = i;
    });
    links.forEach(function (a, i) {
      if (i === actief) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync);
  sync();
})();
</script>
<style>
  [data-sva-toc] a[aria-current="true"] { color: #8a6d2f; font-weight: 700; }
</style>
"""


if __name__ == "__main__":
    for stage, naam, tekst in (
        ("stage-2-homepage", "custom-code-rails.txt", RAILS),
        ("stage-2-homepage", "custom-code-tabs.txt", TABS),
        ("stage-9-about-news-legal", "custom-code-toc.txt", TOC),
    ):
        print(f"  {os.path.basename(schrijf(stage, naam, tekst))}")
