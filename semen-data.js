/* The ICSI semen list: the twenty four stallions Stud Von Axe offers doses of.
 *
 * THE LIST IS THEIRS. They sent it on 4 Sep 2026 as their own card, headed
 * "ICSI SEMEN - Book your spot!", with three of the twenty four crowned:
 * Chacco Blue, Cumano and United Touch S. That card also carries their
 * terms, word for word: fixed prices, no extra costs for embryos produced.
 * This answers question one on 01-build-checklist.html, which had been open
 * since 31 Aug: we no longer guess which stallions they hold. The thirteen
 * names that used to stand here were read out of their own crosses and are
 * gone; five of those are not on their list at all.
 *
 * WHERE EVERY PEDIGREE COMES FROM. Nothing here is typed from memory.
 *   - Twenty of the twenty four are read out of the pedigree tables their own
 *     site publishes on their horses. A stallion that sired one of their
 *     horses brings his own sire, dam and four grandparents with him, because
 *     those tables run three generations deep. `sourcePedigree` names the
 *     horse each one came from.
 *   - Four are not in those tables: Baloubet du Rouet, Stakkato Gold,
 *     Vigo d'Arsouilles and El Torreo de Muze. Their sire and dam are looked
 *     up, and `sourcePedigree` names where. Their grandparents are left
 *     empty, and the pedigree on the page says "To be filled in" rather than
 *     inventing a name.
 *
 * WHAT IS STILL MISSING. Horsetelex links, and they cannot be fetched here:
 * horsetelex.com runs a bot check, and working around one is not something
 * this project does. Each URL has to be opened by hand and pasted into
 * `horsetelex`; nothing is drawn for a link that is not there.
 * Photographs too. Their own site carries no photograph of any stallion, so
 * all twenty four cards fall back to the mark.
 *
 * `crosses` is counted, not claimed: it lists the horses in horses-data.js
 * whose sire is this stallion, so "we have used him ourselves" is checkable
 * against their own records. Fourteen of the twenty four have produce here.
 *
 * The shape is horses-data.js's, so scripts/build-horses.mjs builds the
 * archive and the twenty four pages from it the way it builds the other four
 * groups. This file is source, not output: edit it by hand.
 */
var SEMEN = [
  /* their own pedigree tables, via CHARINA VON AXE Z */
  {"slug": "chacco-blue", "category": "stallion", "name": "CHACCO BLUE", "sold": false, "tagline": "", "genetics": "CHAMBERTIN x CONTENDER", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/118901/chacco-blue", "pedigree": {"sire": "CHAMBERTIN", "dam": "CONTARA", "sireSire": "CAMBRIDGE", "sireDam": "DESIREE VII", "damSire": "CONTENDER", "damDam": "GODAHRA", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": true, "crosses": ["charina-von-axe-z", "coolrock-von-axe-z", "cacao-von-axe-z", "chacco-blue-x-cabri-vd-berghoeve-z"]},
  /* their own pedigree tables, via CUMAX VON AXE Z */
  {"slug": "cumano", "category": "stallion", "name": "CUMANO", "sold": false, "tagline": "", "genetics": "CASSINI I x LANDGRAF I", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/18102/cumano", "pedigree": {"sire": "CASSINI I", "dam": "CHANEL II", "sireSire": "CAPITOL", "sireDam": "WISMA", "damSire": "LANDGRAF I", "damDam": "WEISSE DAME", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": true, "crosses": ["cumax-von-axe-z"]},
  /* their own pedigree tables, via UNIQUE TOUCH VON AXE Z */
  {"slug": "united-touch-s", "category": "stallion", "name": "UNITED TOUCH S", "sold": false, "tagline": "", "genetics": "UNTOUCHED x LUX Z", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/1677488/united-touch-s", "pedigree": {"sire": "UNTOUCHED", "dam": "TOUCH OF CLASS", "sireSire": "UNTOUCHABLE", "sireDam": "CANTANTE TOUCH", "damSire": "LUX Z", "damDam": "CANTANTE TOUCH", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": true, "crosses": ["unique-touch-von-axe-z", "united-touch-s-x-cabri-vd-berghoeve-z", "united-touch-s-x-cortina-de-jolie-z"]},
  /* their own pedigree tables, via Coachella Von Axe */
  {"slug": "conthargos", "category": "stallion", "name": "CONTHARGOS", "sold": false, "tagline": "", "genetics": "Converter I x Carthago Z", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/396837/conthargos", "pedigree": {"sire": "Converter I", "dam": "Cajandra Z", "sireSire": "Contender", "sireDam": "Fontirell", "damSire": "Carthago Z", "damDam": "lorem", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": ["coachella-von-axe", "contouch-sva"]},
  /* their own pedigree tables, via URICAS VD KATTEVENNEN X CORTINA DE JOLIE Z */
  {"slug": "uricas-van-kattevennen", "category": "stallion", "name": "URICAS VAN KATTEVENNEN", "sold": false, "tagline": "", "genetics": "URIKO x CASSINI I", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/1761945/uricas-v-d-kattevennen", "pedigree": {"sire": "URIKO", "dam": "T-CASSINA", "sireSire": "UNTOUCHABLE", "sireDam": "WIZZARD", "damSire": "CASSINI I", "damDam": "CHIKA’S WAY", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": []},
  /* Wikipedia, Hippomundo listing */
  {"slug": "baloubet-du-rouet", "category": "stallion", "name": "BALOUBET DU ROUET", "sold": false, "tagline": "", "genetics": "GALOUBET A x STARTER", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/2859/baloubet-du-rouet", "pedigree": {"sire": "GALOUBET A", "dam": "MESANGE DU ROUET", "sireSire": "", "sireDam": "", "damSire": "STARTER", "damDam": "", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": []},
  /* their own pedigree tables, via WAIKIKI VD BERGHOEVE */
  {"slug": "catoki", "category": "stallion", "name": "CATOKI", "sold": false, "tagline": "", "genetics": "CAMBRIDGE x SILVESTER", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/38151/catoki", "pedigree": {"sire": "CAMBRIDGE", "dam": "BILDA", "sireSire": "CALETTO I", "sireDam": "HILGUNDE", "damSire": "SILVESTER", "damDam": "VORDULA", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": ["waikiki-vd-berghoeve", "catoki-x-cortina-de-jolie-z", "catoki-x-hypnotic-jt-z"]},
  /* their own pedigree tables, via BIG STAR X CORTINA DE JOLIE Z */
  {"slug": "big-star", "category": "stallion", "name": "BIG STAR", "sold": false, "tagline": "", "genetics": "QUICK STAR x NIMMERDOR", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/240686/big-star", "pedigree": {"sire": "QUICK STAR", "dam": "JOLANDA", "sireSire": "GALOUBET A", "sireDam": "STELLA", "damSire": "NIMMERDOR", "damDam": "ELYSITTE", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": ["big-star-x-cortina-de-jolie-z"]},
  /* their own pedigree tables, via CABRI VD BERGHOEVE Z */
  {"slug": "cornet-obolensky", "category": "stallion", "name": "CORNET OBOLENSKY", "sold": false, "tagline": "", "genetics": "CLINTON x HEARTBREAKER", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/34480/cornet-obolensky", "pedigree": {"sire": "CLINTON", "dam": "RABANNA VAN COSTERSVELD", "sireSire": "CORRADO I", "sireDam": "URTE", "damSire": "HEARTBREAKER", "damDam": "HOLIVEA VAN COSTERSVELD", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": ["cabri-vd-berghoeve-z", "cortina-de-jolie-z", "cornet-obolensky-x-agousha-vd-berghoeve-z"]},
  /* their own pedigree tables, via DUNE VON AXE Z */
  {"slug": "diamant-de-semilly", "category": "stallion", "name": "DIAMANT DE SEMILLY", "sold": false, "tagline": "", "genetics": "LE TOT DE SEMILLY x ELF III", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/33956/diamant-de-semilly", "pedigree": {"sire": "LE TOT DE SEMILLY", "dam": "VENICES DES CRESLES", "sireSire": "GRAN VENEUR", "sireDam": "VENUE DU TOT", "damSire": "ELF III", "damDam": "MISS DES CRESLES", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": ["dune-von-axe-z", "diamecho-von-axe-z", "diabalou-sva"]},
  /* their own pedigree tables, via Unguessable Von Axe (dam side) */
  {"slug": "casall", "category": "stallion", "name": "CASALL", "sold": false, "tagline": "", "genetics": "Caretino", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/49609/casall", "pedigree": {"sire": "Caretino", "dam": "Kira XVII", "sireSire": "", "sireDam": "", "damSire": "", "damDam": "", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": []},
  /* Hannoveraner Verband, eurodressage */
  {"slug": "stakkato-gold", "category": "stallion", "name": "STAKKATO GOLD", "sold": false, "tagline": "", "genetics": "STAKKATO x WERTHER", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/39246/stakkato-gold", "pedigree": {"sire": "STAKKATO", "dam": "WERTHERROESCHEN", "sireSire": "", "sireDam": "", "damSire": "WERTHER", "damDam": "", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": []},
  /* rimondo, SporthorseData */
  {"slug": "vigo-d-arsouilles", "category": "stallion", "name": "VIGO D'ARSOUILLES", "sold": false, "tagline": "", "genetics": "NABAB DE REVE", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/69655/vigo-d-arsouilles", "pedigree": {"sire": "NABAB DE REVE", "dam": "ILLICO D'ARSOUILLES", "sireSire": "", "sireDam": "", "damSire": "", "damDam": "", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": []},
  /* their own pedigree tables, via FOR PLEASURE X HYPNOTIC JT Z */
  {"slug": "for-pleasure", "category": "stallion", "name": "FOR PLEASURE", "sold": false, "tagline": "", "genetics": "FURIOSO II x GRANNUS", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/15154/for-pleasure", "pedigree": {"sire": "FURIOSO II", "dam": "GIGANTIN", "sireSire": "FURIOSO XX", "sireDam": "DAME DE RANVILLE", "damSire": "GRANNUS", "damDam": "GOLDI", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": ["for-pleasure-x-hypnotic-jt-z"]},
  /* their own pedigree tables, via CARMA VD BERGHEOVE Z */
  {"slug": "comme-il-faut", "category": "stallion", "name": "COMME IL FAUT", "sold": false, "tagline": "", "genetics": "CORNET OBOLENSKY x RAMIRO Z", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/285153/comme-il-faut", "pedigree": {"sire": "CORNET OBOLENSKY", "dam": "RATINA Z", "sireSire": "CLINTON", "sireDam": "RABANNA VAN COSTERSVELD", "damSire": "RAMIRO Z", "damDam": "ARGENTINA Z", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": ["carma-vd-bergheove-z", "comme-il-faut-x-hypnotic-jt-z", "cosmopolitan-von-axe-z", "comme-il-faut-x-patchina-vant-merelsnest"]},
  /* their own pedigree tables, via CARMA VD BERGHEOVE Z (dam side) */
  {"slug": "nabab-de-reve", "category": "stallion", "name": "NABAB DE REVE", "sold": false, "tagline": "", "genetics": "QUIDAM DE REVEL", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/13035/nabab-de-reve", "pedigree": {"sire": "QUIDAM DE REVEL", "dam": "MELODIE EN FA", "sireSire": "", "sireDam": "", "damSire": "", "damDam": "", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": []},
  /* their own pedigree tables, via HAYLEY VD BERGHOEVE Z */
  {"slug": "heartbreaker", "category": "stallion", "name": "HEARTBREAKER", "sold": false, "tagline": "", "genetics": "NIMMERDOR x SILVANO", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/1002/heartbreaker", "pedigree": {"sire": "NIMMERDOR", "dam": "BACAROLE", "sireSire": "FARN", "sireDam": "RAMONAA", "damSire": "SILVANO", "damDam": "ORCHIDEE", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": ["hayley-vd-berghoeve-z", "heaven-vd-berghoeve-z", "hyori-von-axe-z"]},
  /* their own pedigree tables, via ELECTRA VON AXE Z */
  {"slug": "emerald-van-t-ruytershof", "category": "stallion", "name": "EMERALD VAN'T RUYTERSHOF", "sold": false, "tagline": "", "genetics": "DIAMANT DE SEMILLY x CARTHAGO", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/196504/emerald-van-t-ruytershof", "pedigree": {"sire": "DIAMANT DE SEMILLY", "dam": "CARTHINA", "sireSire": "LE TOT DE SEMILLY", "sireDam": "VENISE DES CRESLES", "damSire": "CARTHAGO", "damDam": "TANAGRA’S VAN HET DAROHOF", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": ["electra-von-axe-z", "bec-emerald-sam"]},
  /* their own pedigree tables, via Patchina Van’t Merelsnest */
  {"slug": "kannan", "category": "stallion", "name": "KANNAN", "sold": false, "tagline": "", "genetics": "VOLTAIRE x NIMMERDOR", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/42058/kannan-gfe", "pedigree": {"sire": "VOLTAIRE", "dam": "CEMETA", "sireSire": "FURIOSO II", "sireDam": "GOGO MOEVE", "damSire": "NIMMERDOR", "damDam": "WOZIETA", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": ["patchina-vant-merelsnest"]},
  /* their own pedigree tables, via Unguessable Von Axe */
  {"slug": "untouchable", "category": "stallion", "name": "UNTOUCHABLE", "sold": false, "tagline": "", "genetics": "Hors la Loi II x Heartbreaker", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/46156/untouchable", "pedigree": {"sire": "Hors la Loi II", "dam": "Promesse", "sireSire": "Papillon Rouge", "sireDam": "Ariane du Plessis II", "damSire": "Heartbreaker", "damDam": "Chablis", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": ["unguessable-von-axe"]},
  /* their own pedigree tables, via Contouch SVA (dam side) */
  {"slug": "toulon", "category": "stallion", "name": "TOULON", "sold": false, "tagline": "", "genetics": "Heartbreaker", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/30086/toulon", "pedigree": {"sire": "Heartbreaker", "dam": "Nikita", "sireSire": "", "sireDam": "", "damSire": "", "damDam": "", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": []},
  /* their own pedigree tables, via Diamecho Von Axe Z (dam side) */
  {"slug": "echo-van-t-spieveld", "category": "stallion", "name": "ECHO VAN'T SPIEVELD", "sold": false, "tagline": "", "genetics": "Heartbreaker", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/175051/echo-van-t-spieveld", "pedigree": {"sire": "Heartbreaker", "dam": "Tequila van’t Spieveld", "sireSire": "", "sireDam": "", "damSire": "", "damDam": "", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": []},
  /* Hippomundo, clipmyhorse */
  {"slug": "el-torreo-de-muze", "category": "stallion", "name": "EL TORREO DE MUZE", "sold": false, "tagline": "", "genetics": "TARAN DE LA POMME", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/1551442/el-torreo-de-muze", "pedigree": {"sire": "TARAN DE LA POMME", "dam": "FUNKY MUSIC", "sireSire": "", "sireDam": "", "damSire": "", "damDam": "", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": []},
  /* their own pedigree tables, via MEDILLÍN VON AXE Z */
  {"slug": "mumbai-vd-moerhoeve", "category": "stallion", "name": "MUMBAI VD MOERHOEVE", "sold": false, "tagline": "", "genetics": "Diamant de semilly x Nabab de Reve", "year": "", "studbook": "", "sex": "Stallion", "height": "", "horsetelex": "https://www.horsetelex.com/horses/pedigree/1692953/mumbai", "pedigree": {"sire": "Diamant de semilly", "dam": "Ischgl de muze", "sireSire": "Le tot de Semilly", "sireDam": "Venise des Cresles", "damSire": "Nabab de Reve", "damDam": "VDL group Aureka", "third": []}, "body": [], "photos": [], "videos": [], "country": "", "crowned": false, "crosses": []},
];
if (typeof module !== 'undefined') { module.exports = SEMEN; }
