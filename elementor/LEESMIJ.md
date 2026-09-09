# De Elementor-bouw — hoe het in elkaar zit

Geschreven ná de bouw, tegen de gebouwde bestanden aan. Bij het vorige project
klopten twaalf beweringen in de overdracht niet, omdat die tekst geschreven was
vóór de sjablonen bestonden — dus vanuit het ontwerp in plaats van vanuit de
JSON. Elk getal hieronder komt uit `python3 tools-controle.py`.

---

## 1. Wat er staat

- 29 sjablonen: 1 kit, 1 header, 1 footer, 6 archieven, 7 singles, 8 loop items,
  5 pagina's
- 356 containers en 523 widgets
- 135 ACF-bindingen, allemaal naar een veld dat de plugin werkelijk aanmaakt
- 3 stukjes eigen code, samen ongeveer 90 regels
- 251 foto's verdeeld over de elf stagemappen
- 3.845 regels: 564 bibliotheek, 170 validator, 2.292 bouwscripts, 819 gereedschap

Alle controles op groen:

| Controle | Uitkomst |
|---|---|
| Validator | 29 van 29 |
| Dekking sjabloon tegen ontwerp | 18 pagina's, geen enkele te kort |
| Beeld op schijf en op te halen | 18 URL's, 0 kapot |
| Beeld dat de site toont en nergens meereist | 0 |
| Bindingen naar een veld dat niet bestaat | 0 |
| Velden die geen sjabloon toont | 27, alle 27 met een vastgelegde reden |
| Foto's byte voor byte gelijk aan het origineel | 251 van 251 |
| Pagina's op de afvinklijst tegen de site | 122 tegen 122 |
| Bestanden die een README noemt | 39, allemaal aanwezig |

---

## 2. Hoe je het opnieuw bouwt

```bash
php elementor/dump-acf.php > elementor/acf.json   # de veldsleutels uit de plugin
python3 elementor/maak-dekking.py                 # de telling van de statische site
python3 elementor/build/stage1_kit.py
python3 elementor/build/stage1_shell.py
python3 elementor/build/loops.py
python3 elementor/build/archives.py
python3 elementor/build/singles.py
python3 elementor/build/pages.py
python3 elementor/build/custom_code.py
python3 elementor/build/stage8_email.py
python3 elementor/build/stage10_lijst.py
python3 tools-gen-stages.py                       # de elf README's
python3 tools-stage-assets.py                     # de foto's in de stagemappen
python3 tools-controle.py                         # en dan de vijf controles
```

`elementor/acf.json` is de enige waarheid over veldsleutels en wordt niet met de
hand bijgehouden. De sleutels worden in PHP samengesteld
(`'field_sva_' . $prefix . '_' . $naam`), dus een regex over de broncode kan ze
niet eerlijk lezen — en precies zo'n regex sloeg bij het vorige project een veld
over dat daarna voor elke controle onzichtbaar was. `dump-acf.php` draait de
structuurklasse echt en schrijft op wat eruit komt.

---

## 3. De twee spiegelvelden

Elementor schrijft één dynamische tag per widget. Vier velden aaneenrijgen met
een scheidingsteken dat verdwijnt zodra een veld leeg is, kan hij niet. De
archiefkaart doet precies dat, dus die regels worden in de generator
samengesteld en als eigen veld meegestuurd:

| Veld | Op | Wat erin staat |
|---|---|---|
| `meta_line` | sportpaard, fokmerrie, veulen | `Born 2017 · Mare · KWPN · Sold to Italy`. Bij een veulen zonder het jaar, want dat staat in zijn eigen badge |
| `status_line` | sportpaard, fokmerrie, veulen | `Available`, of `Sold to` en het land |
| `stage_badge` | kruising | `❄︎ Frozen` of `⏳︎ Due 09/05/2027` — de emoji die de klant vroeg |
| `photo_2` | sportpaard, fokmerrie, veulen | de tweede foto uit de galerij, als eigen beeldveld. Elementor kan het tweede item van een galerij niet aanwijzen |
| `video_1_url` | sportpaard, fokmerrie, veulen | dezelfde film als `video_1_id`, maar als volledig YouTube-adres, want de videowidget wil een adres |

De onderdelen blijven in hun eigen velden staan. Dit is een spiegel, geen
vervanging, en allebei komen ze uit dezelfde bron zodat ze niet uiteen kunnen
lopen. Controle 5 in `wp/bouw_payload.py` leest de archiefpagina's terug en
bewijst dat 118 spiegelwaarden letterlijk zo op de kaart staan.

Die controle vond meteen twee dingen: de hengstenkaart drukt helemaal geen
kaartregel af (`meta_line` is daar weer weggehaald), en de veulenkaart draagt
wél het stamboek maar niet het jaar.

---

## 4. Wat Elementor niet kan, en wat er dan gebeurt

| | |
|---|---|
| **De kopbalk die omslaat** | Hij zit ín de hero, doorzichtig, met het witte logo, en slaat om op de onderrand van de hero — niet op een scrollafstand, want die hero's zijn niet even hoog. Vijftien regels in `custom-code-header.txt`. Twee logobestanden die overvloeien, geen filter: de merken zijn van de klant |
| **De rails** | Nieuws, partners en "more horses". Elementor's carousel heeft geen pijl die zichzelf uitschakelt aan het eind en geen scroll-snap. `custom-code-rails.txt`, met een eigen tween omdat `scroll-behavior:smooth` door engines wordt genegeerd zodra het element niet in beeld is |
| **De inhoudsopgave** | Sticky is van Elementor, het meelopen is `custom-code-toc.txt` |
| **De filterbalk** | Wél gebouwd, en wél native. `search` en `taxonomy-filter` zijn echte Elementor Pro-widgets; ze vinden de loop grid via het query_id dat ze delen. Het enige wat Elementor niet kan is de **telling áchter elke chip**, en dat is versiering. Eén onzekerheid: `selected_type: checkbox_list` tekent de chips als pillen, en die waarde is niet tegen een draaiende Elementor getoetst |
| **De vijf tabbladen** | Vijf echte panelen met foto, zin en knop. Elementor's Tabs-widget wisselt ze zelf; hier is geen regel code voor nodig. De eerste versie had vijf lege panelen die op eigen JavaScript wachtten, en dat is teruggedraaid |
| **Lege secties** | Niet elk paard heeft een film of losse foto's. Acht regels in `custom-code-hide-empty.txt` halen een sectie weg die leeg blijft; Elementor kan een sectie niet per record verbergen op een leeg ACF-veld |
| **De stamboom** | Geen widget, maar wél zonder code te bouwen: vijftien containers met expliciete `grid-column` en `grid-row`. Auto-flow zette bij het vorige project een paard stilletjes een generatie te hoog toen er één vakje leeg was. Een leeg vakje leest "To be filled in" via de terugvalwaarde van het veld |

Alle drie de codestukjes gaan in **Elementor → Custom Code**, niet in een
plugin. Dat bewaart ze in de database van de site, zodat ze blijven staan als de
importer straks verwijderd wordt.

---

## 5. Wat de controles niet kunnen zien

Per controle opgeschreven, want een controle die slaagt bewijst alleen wat hij
meet.

1. **De validator** ziet niet of een sjabloon er goed uitziet, en niet of
   Elementor hem op de doelsite werkelijk inleest.
2. **De dekking** telt secties, niet wat erin staat. En hij **ondertelt het
   nieuwsarchief en het nieuwsbericht**: hun inhoud staat op de statische site
   buiten elke `<section>`, dus de teller ziet er één waar er meer zijn. Die
   twee staan met zoveel woorden als niet-telbaar in de uitvoer.
3. **De beeldcontrole** ziet niet of het de júiste foto is. Een verkeerde foto
   met het goede pad haalt hem moeiteloos.
4. **De kruiscontrole** ziet een veld dat de plugin wél aanmaakt maar dat geen
   sjabloon toont niet als fout — daarom staat daar een vrijstellingstabel bij
   met per veld de reden, en faalt de controle op een veld zonder reden.
   Hij ziet ook `crosses` niet als gebruikt, terwijl dat wel zo is: dat loopt
   via een gerelateerde query en niet via een dynamische tag.
5. **De stagecontrole** telt bestandsnamen, niet inhoud.

En geen van vijven ziet **of de JSON werkelijk importeert in Elementor op
staging**. Daarom staat stage 1 vooraan: komt daar iets uit, dan is het in één
herbouw voor alle 29 sjablonen te herstellen, want ze komen uit één bibliotheek.

---

## 6. Wat er nog open staat

### Vóór stage 3 te beslissen
- **De filterbalk.** Filterplugin (JetSmartFilters of Search & Filter Pro) of
  het bestaande script als Custom Code. Raakt vijf archieven.

### Vóór stage 8 te beslissen, en het is een vraag aan de klant
- Welk adres de formulieren ontvangt, en via welk SMTP-account we versturen.
  Vandaag versturen de formulieren niets: ze openen de mailtoepassing van de
  bezoeker.

### Vóór stage 11 te beslissen
- **De taalkiezer.** Vier labels zonder links, op alle 122 pagina's. Er staat
  geen vertaalplugin in enige stage. Italiaans is hun eigen taal, dus dit hoort
  aan de klant voorgelegd te worden en niet voor hen ingevuld.

### Wat ik eerder verkeerd meldde

Ik schreef op 9 september dat **ACF Pro niet op staging stond**. Dat klopte niet.
Ik testte op de REST-namespace `acf/v3`, en die verschijnt alleen als ACF's eigen
REST-API aanstaat — die staat standaard uit. ACF Pro **6.6.2** staat er wel,
naast Elementor Pro, Rank Math Pro en Hello Elementor. Er hoeft dus niets
geïnstalleerd te worden voordat stage 1 begint.

### Aan te leveren
| | |
|---|---|
| Partners | website-adres en een zin per partner; de velden reizen leeg mee |
| Hero | het gelicenseerde bestand van SASSO FOTOGRAFIE |
| Carma en Heaven | staan nog op een concoursfoto in plaats van een portret |
| Btw-nummer | IT02519980466 is gegeven onder de oude bedrijfsnaam |
| Nieuws | twee van de vier berichten zijn voorbeelden en dragen die markering |
| Kroontje | drie hengsten dragen er een en niemand heeft gezegd wat het betekent |

### Wat met opzet leeg is en dus geen fout
14 van 106 paarden zonder stokmaat · 40 van 106 zonder land, want alleen
verkochte paarden hebben er een · 44 van 106 zonder verhaaltekst · 24 van 32
hengsten zonder jaar en stamboek · 18 van 30 kruisingen zonder eigen foto, die
dragen die van de vader · de nieuwsberichten zonder datum, want hun eigen datums
klopten niet.

---

## 6b. Wat er bij de eindaudit alsnog uitkwam

Vijf dingen, gevonden door de gebouwde sjablonen naast de 28 bewezen sjablonen
van Stoeterij te leggen. Alle vijf gerepareerd.

1. **De vijf tabbladen waren leeg.** De widget stond er met vijf labels, de vijf
   foto's reisden mee, en de panelen bevatten niets.
2. **De drie rechtopstaande hero's reisden mee maar werden nergens gebruikt.**
   Dat is precies de mobiele snede waar de klant om vroeg. Elementor kan per
   apparaat een andere achtergrondfoto, dus dat is nu ingesteld.
3. **De foto naast de naam op een paardpagina hing aan `acf-gallery`** in een
   image-widget. Een galerij is een lijst; dat rendert niets. Nu `photo_2`.
4. **De videowidget kreeg een id waar hij een adres wil.** Nu `video_1_url`.
5. **Het zoekveld heette `search-form`; Elementor noemt hem `search`.** En hij
   had het `query_id` nodig dat op de loop grid staat, en dat stond er niet.

En één correctie op wat ik eerder zei: de filterbalk is grotendeels wél native.
Ik had hem te somber ingeschat.

---

## 7. De foto's in de Drive

Ze staan in elke stagemap onder `media-reference/`, met de naam die ze in de
mediabibliotheek krijgen (`basename()` van het bronpad, want dat is wat
`class-media.php` aan `wp_upload_bits` geeft).

**Ze zijn niet om te uploaden.** De importer-plugin zet ze in stage 2 al in de
mediabibliotheek. Ze liggen in de stagemap zodat John kan nakijken of de juiste
foto op de juiste plek staat. Uploadt hij ze opnieuw, dan krijgt elk bestand een
tweelingbroer met `-1` erachter en wijst elke sjabloon-URL naar de verkeerde.
Die zin staat in elke README en in elke ClickUp-taak.

De README van elke stage draagt een tabel `bestandsnaam → paard → veld`.

Deelkaarten (261 stuks, 25,8 MB) en videoposters (32) reizen nergens heen:
WordPress maakt zijn eigen og:image en Elementor haalt de poster bij YouTube.
