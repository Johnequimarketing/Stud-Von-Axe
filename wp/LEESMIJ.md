# De importer voor Stud Von Axe

Een plugin die de post types, de taxonomieën en de ACF-velden aanmaakt, alle
inhoud en alle foto's importeert, en daarna weggegooid mag worden. **Alles wat
hij maakt blijft staan als je hem verwijdert**, want de post types en de
veldgroepen worden als ACF's eigen databaserecords weggeschreven en niet vanuit
PHP geregistreerd.

Geschreven ná de bouw, tegen de gebouwde bestanden aan. Elk getal hieronder komt
uit een draai, niet uit het ontwerp.

---

## Bouwen

```
python3 wp/bouw_payload.py    leest de site, schrijft payload.json, verzamelt de media
python3 wp/bouw_plugin.py     php -l, de test, en dan pas de drie zips
```

Beide weigeren iets af te leveren als er iets niet klopt. De generator schrijft
geen enkel bestand als één foto ontbreekt of één slug dubbel is; het bouwscript
zipt niet als een PHP-bestand niet parseert of de test faalt.

De zips komen in `wp/uit/`.

---

## Wat erin zit

| | |
|---|---|
| Post types | 7 |
| Taxonomieën | 7 |
| Veldgroepen | 7, samen 144 velden |
| Posts | 113 |
| Foto's | 251, samen 33,2 MB |
| Controles | 1151, allemaal groen |

De posts:

| | |
|---|---|
| Sport horses | 12 |
| Breeding mares | 12 |
| Foals | 20 |
| Embryos | 30 |
| ICSI stallions | 32 |
| News | 4 |
| Partners | 3 |

De termen die de import aanmaakt: availability 2, embryo_stage 2, horse_sex 4,
studbook 8, birth_year 15, sold_to 15, sire 63. Niets hoeft voorgezaaid: termen
worden bij eerste gebruik gemaakt.

Van de 251 foto's zijn er 205 van een paard, een kruising of een partner, en 46
ontwerpbeelden (hero's, archiefkoppen, tabbeelden, het logo) die in de
mediabibliotheek landen zonder aan een post te hangen, zodat de Elementor-bouw
ze kan pakken. Negentien beelden die wel op schijf staan reizen bewust niet mee:
restanten van een eerdere bouw en beelden die alleen in het ontwerpdocument
staan. Die staan met de reden erbij in `DOOD` in de generator.

---

## Welke zip

```
stud-von-axe-importer.zip                 33 MB   alles, als de host het aanneemt
stud-von-axe-importer-zonder-fotos.zip    46 KB   de code en de payload
stud-von-axe-importer-fotos.zip           33 MB   de foto's
```

Probeer de hele zip. Weigert de host hem, dan:

1. upload `stud-von-axe-importer-zonder-fotos.zip` als plugin;
2. pak `stud-von-axe-importer-fotos.zip` uit **in `wp-content/uploads/`**, zodat
   de bestanden in `wp-content/uploads/stud-von-axe-media/` komen te staan.

De mediaklasse kijkt eerst in de plugin en dan op die tweede plek. Er hoeft dus
niets aan de code te veranderen, welke route je ook neemt.

---

## Installeren

1. **ACF Pro 6.1 of nieuwer eerst.** De plugin weigert te draaien onder 6.1 en
   zegt waarom: dat is de versie waarin post types databaserecords werden, en
   daar hangt de hele belofte aan.
2. Plugin uploaden en activeren.
3. **Tools → Stud Von Axe Importer.**
4. **Eerst "Dry run".** Die loopt de hele import langs, meldt wat hij zou doen,
   en schrijft niets. Lees die uitkomst voordat je verder gaat.
5. Dan "Run the import". **Laat het tabblad openstaan**: het werk gaat stap voor
   stap over AJAX, twintig records per keer, juist omdat 113 posts en 270 foto's
   in één verzoek op een gewone host tegen `max_execution_time` aanlopen.

De laatste twee stappen zijn "Design images" en "Linking the crosses to their
sires". Die tweede moet als laatste, want een hengst wijst naar wat er met hem
gefokt is en die posts moeten er dan al zijn.

---

## Een nieuwe versie uploaden

Twee dingen die niets met elkaar te maken hebben, en die allebei niet dubbelen.

**De plugin opnieuw uploaden.** Elke bouw stempelt een versienummer uit de
bouwdatum, bijvoorbeeld `2026.09.09.2010`, dus een nieuwe zip is altijd
zichtbaar nieuwer. Upload hem via **Plugins → Nieuwe plugin → Plugin uploaden**.
WordPress ziet dat er al een plugin met die map staat, laat de twee versies
naast elkaar zien, en biedt **"Replace current with uploaded"**. Klik dat. Er
komt geen tweede plugin bij.

Je hoeft de oude dus niet eerst te verwijderen. Doe je dat toch, dan is dat ook
niet erg: verwijderen haalt alleen de plugin weg en laat de inhoud staan.

**De import opnieuw draaien.** Dat dubbelt evenmin, en dat is met opzet zo
gebouwd. Elke post draagt een stempel `_sva_slug` en elke foto een `_sva_src`,
en dat is waar een tweede draai op zoekt: gevonden betekent bijwerken, niet
gevonden betekent aanmaken. De post types en de veldgroepen worden op hun ACF
sleutel gevonden. De test controleert dit ook echt: een tweede draai voegt nul
posts toe, en dat is een van de 1151 controles.

Wat een tweede draai wél doet: de velden overschrijven die de payload draagt.
Wat jij in een leeg veld hebt gezet blijft staan, en een post die je hernoemd
hebt houdt zijn URL.

---

## Wat de import niet doet

- **Hij verwijdert nooit iets.** Een tweede draai werkt bij wat er is en voegt
  toe wat ontbreekt.
- **Een tweede draai overschrijft wel jouw handmatige wijzigingen**, maar alleen
  in de velden die de payload draagt. Wat je in een leeg veld hebt gezet blijft.
- **Een record dat uit de payload verdwijnt, laat zijn post staan.** Die moet met
  de hand weg.
- **De URL van een post blijft van jou.** Hernoem je hem in WordPress, dan laat
  een volgende import hem met rust.

---

## Verwijderen

Deactiveren en verwijderen. `uninstall.php` haalt precies één regel weg, de
optie die bijhoudt wanneer de laatste import liep. Verder blijft alles staan.

**Test dat op staging voordat je het gelooft**: verwijder de plugin en kijk of de
post types, de velden, de 113 posts en de foto's er nog zijn. Dat is de belofte
waar dit hele ontwerp op rust, en hij hoort daar getest te worden en niet op de
live site.

---

## Voor de Elementor-bouw

Drie dingen die er niet uitzien als de fout die ze zijn, en die dus letterlijk in
de eerste taak horen:

1. **Flexbox Container moet aanstaan**, anders rendert elk geïmporteerd sjabloon
   een witte pagina.
2. **`type` bepaalt waar een sjabloon in de theme builder landt.**
3. **Een loop grid komt binnen zonder loop item.** Een JSON kan geen post-id op
   iemand anders zijn site kennen. Eén klik per grid, en het moet opgeschreven
   staan of het leest als een bug.

En één ding uit deze bouw:

4. **De embryopagina zet zichzelf op volgorde: eerst implanted, dan frozen.** Dat
   is een volgorde die de pagina oplegt en niet een die de records meebrengen.
   Een loop grid dat op een datumveld sorteert zet de twee stadia weer door
   elkaar, want een frozen record heeft geen vervaldatum om op te sorteren. Bouw
   het als twee loops op één pagina, elk met zijn eigen filter, implanted eerst.
   Hetzelfde geldt voor de splitsing beschikbaar/verkocht bij merries, veulens en
   sportpaarden.

---

## Wat er nog aangevuld moet worden

Alles hieronder reist leeg mee, met opzet: het scherm laat dan zien wat er nog
komt in plaats van het te verbergen.

| | |
|---|---|
| Partners | geen website en geen tekst, voor alle drie. Die bestaan nergens; de eigenaren moeten ze aanleveren |
| Stokmaat | 30 van de 44 paarden hebben er geen |
| Verhaaltekst | 32 van de 44 paarden hebben er geen |
| Dam line | leeg op alle 30 kruisingen |
| Vervaldatum | leeg op de 18 bevroren embryo's, en dat hoort zo |
| Derde generatie | niet compleet bij de hengsten: hun eigen tabellen dragen die namen niet, en de pagina zegt "To be filled in" in plaats van te gokken |
| Kroontje | drie hengsten dragen er een op hun eigen kaart. Niemand heeft gezegd wat het betekent, dus er wordt niets mee getekend |
| Hero-foto | het gelicenseerde bestand van SASSO FOTOGRAFIE moet nog komen |
| Btw-nummer | nog niet bevestigd tegen de nieuwe naam Stud Von Axe SRL |

Eén ding is er bewust uit gefilterd, en de generator zegt het hardop bij elke
draai: Emerald van't Ruytershof verwees nog naar Electra Von Axe Z, het veulen
dat de eigenaren op 6 september uit de catalogus lieten halen. De statische site
tekende die verwijzing al niet meer; de import laat hem nu net zo weg.

---

## Eén gevolg van zeven post types

Sportpaarden, fokmerries en veulens zijn drie aparte post types, op verzoek van
9 september. Dat betekent dat **een veulen dat doorgroeit naar sportpaard met de
hand verplaatst moet worden**: nieuwe post onder het andere type, en de oude URL
verandert mee. Dat gebeurt bij deze stal echt, Diamecho Von Axe Z staat nu als
sportpaard met dezelfde naamgeving als de veulens.

Het alternatief was één post type met een taxonomie, waar dat één klik zou zijn
geweest. Dat is voorgelegd en afgewezen; dit staat hier zodat het later geen
verrassing is.

---

## Hoe het gecontroleerd wordt

Vier controles, en per controle staat erbij wat hij **niet** kan zien. Dat is de
les van de vorige bouw, waar drie geslaagde controles een hele categorie beeld
misten.

1. **In de generator**, voordat er iets geschreven wordt: elke genoemde foto
   bestaat op schijf, elke slug is uniek, elk record in een groep heeft dezelfde
   veldsleutels, en niemand draagt twee termen waar er één hoort.
   *Ziet niet:* een veld dat helemaal niet bestaat.
2. **De mapping-test**, `php wp/stud-von-axe-importer/tests/test-mapping.php`:
   1151 controles. Aantallen per groep, `post_content` overal leeg, geen post
   type met de editor aan, alle zeven types zichtbaar voor de REST API, elk
   gedeclareerd veld ook echt geschreven, beeldvelden met ids en geen paden,
   veertien stamboomcellen op elk paard, en een tweede draai die nul posts
   toevoegt.
   *Ziet niet:* of jouw ACF-versie de definities accepteert, en of het uploaden
   op jouw host werkt.
3. **De kruiscontrole tegen de gerenderde site**: 867 stamboomcellen, waarden en
   alinea's plus 106 titels worden teruggelezen uit de gebouwde HTML. Dit ving de eerste versie
   van de generator, die "Van’t Roosakker" schreef waar de site "van't
   Roosakker" toont. 137 cellen, en alle andere controles stonden op groen.
   *Ziet niet:* een veld dat nergens gerenderd wordt.
4. **De naamgeving komt uit de site zelf.** De generator licht het blok tussen
   `words:start` en `words:end` uit `scripts/build-horses.mjs` en draait het,
   in plaats van het na te schrijven. Eén definitie, dus de import en de site
   kunnen niet uit elkaar lopen.

Om te bewijzen dat controle 2 werkt: zet een veld in `class-structure.php` dat de
generator niet schrijft, draai de test, en zie hem falen. Dat is gedaan en het
werkt.
