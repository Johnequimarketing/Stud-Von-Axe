/* The ICSI semen line: the stallions Stud Von Axe has used, offered as ICSI
 * doses.
 *
 * The owners confirmed on 31 Aug 2026 that ICSI is the only kind they do.
 * There is no fresh and no frozen semen, so there is one product here and
 * no split.
 *
 * What is real in this file and what is not:
 *
 *   real       the name and the pedigree of every stallion. Both are read
 *              out of the pedigree tables on their own embryo pages: a
 *              cross names its sire, and that sire's own sire, dam and four
 *              grandparents sit in the same table. Nothing here is typed
 *              from memory or from a stud book we do not have.
 *   not real   the stock. Nobody has said which of these thirteen they hold
 *              doses of. Mark's decision on 31 Aug is to keep the list,
 *              because straws of stallions like these are bought and stored
 *              and they may well have them, but the site says on every card
 *              and on every page that availability is on request and still
 *              to be confirmed. It is question one on 01-build-checklist.html.
 *   missing    photographs, prices, dose counts. Their own site carries no
 *              photograph of any stallion, so there is none to use.
 *
 * The shape is horses-data.js's, so scripts/build-horses.mjs builds the
 * archive and the thirteen pages from it the way it builds the other four
 * groups. Edit here by hand when the owners answer: this file is source,
 * not output.
 */
var SEMEN = [
  {"slug":"aganix-du-seigneur-z","category":"stallion","name":"AGANIX DU SEIGNEUR Z","sold":false,"tagline":"","genetics":"OGANO SITTE x CHELLANO Z","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"OGANO SITTE","dam":"CADIX DU SEIGNEUR","sireSire":"DARCO","sireDam":"IALTA SITTE","damSire":"CHELLANO Z","damDam":"ATLANTA SITTE","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["aganix-du-seigneur-z-x-cortina-de-jolie-z"]},
  {"slug":"big-star","category":"stallion","name":"BIG STAR","sold":false,"tagline":"","genetics":"QUICK STAR x NIMMERDOR","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"QUICK STAR","dam":"JOLANDA","sireSire":"GALOUBET A","sireDam":"STELLA","damSire":"NIMMERDOR","damDam":"ELYSITTE","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["big-star-x-cortina-de-jolie-z"]},
  {"slug":"catoki","category":"stallion","name":"CATOKI","sold":false,"tagline":"","genetics":"CAMBRIDGE x SILVESTER","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"CAMBRIDGE","dam":"BILDA","sireSire":"CALETTO I","sireDam":"HILGUNDE","damSire":"SILVESTER","damDam":"VORDULA","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["catoki-x-hypnotic-jt-z","catoki-x-cortina-de-jolie-z"]},
  {"slug":"chacco-blue","category":"stallion","name":"CHACCO BLUE","sold":false,"tagline":"","genetics":"CHAMBERTIN x CONTENDER","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"CHAMBERTIN","dam":"CONTARA","sireSire":"CAMBRIDGE","sireDam":"DESIREE VII","damSire":"CONTENDER","damDam":"GODAHRA II","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["chacco-blue-x-cabri-vd-berghoeve-z"]},
  {"slug":"comme-il-faut","category":"stallion","name":"COMME IL FAUT","sold":false,"tagline":"","genetics":"CORNET OBOLENSKY x RAMIRO Z","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"CORNET OBOLENSKY","dam":"RATINA Z","sireSire":"CLINTON","sireDam":"RABANNA VAN COSTEVELD","damSire":"RAMIRO Z","damDam":"ARGENTINA Z","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["comme-il-faut-x-patchina-vant-merelsnest"]},
  {"slug":"cornet-obolensky","category":"stallion","name":"CORNET OBOLENSKY","sold":false,"tagline":"","genetics":"CLINTON x HEARTBREAKER","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"CLINTON","dam":"RABANNA VAN COSTEVELD","sireSire":"CORRADO I","sireDam":"URTE","damSire":"HEARTBREAKER","damDam":"OLIVEA VAN COSTERSVELD","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["cornet-obolensky-x-agousha-vd-berghoeve-z"]},
  {"slug":"dominator-2000-z","category":"stallion","name":"DOMINATOR 2000 Z","sold":false,"tagline":"","genetics":"DIAMANT DE SEMILLY x CASSINI I","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"DIAMANT DE SEMILLY","dam":"CEPHALE 2000","sireSire":"LE TOT DE SEMILLY","sireDam":"VENISE DES CRESLES","damSire":"CASSINI I","damDam":"NEPHALE","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["dominator-2000-z-x-hypnotic-jt-z"]},
  {"slug":"dourkhan-hero-z","category":"stallion","name":"DOURKHAN HERO Z","sold":false,"tagline":"","genetics":"DON’T TOUCH TIJI HERO x ZANDOR Z","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"DON’T TOUCH TIJI HERO","dam":"ZINKA DE KALVARIE","sireSire":"DIAMANT DE SEMILLY","sireDam":"CHINA TOUCH HERO","damSire":"ZANDOR Z","damDam":"INKA VAN’T ROOSAKKER","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["dourkhan-hero-z-x-cortina-de-jolie-z"]},
  {"slug":"for-pleasure","category":"stallion","name":"FOR PLEASURE","sold":false,"tagline":"","genetics":"FURIOSO II x GRANNUS","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"FURIOSO II","dam":"GIGANTIN","sireSire":"FURIOSO XX","sireDam":"DAME DE RANVILLE","damSire":"GRANNUS","damDam":"GOLDI","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["for-pleasure-x-hypnotic-jt-z"]},
  {"slug":"mosito-van-het-hellenof","category":"stallion","name":"MOSITO VAN HET HELLENOF","sold":false,"tagline":"","genetics":"ELVIS TER PUTTE x NABAB DE REVE","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"ELVIS TER PUTTE","dam":"HADISE VAN HET HELLEHOF","sireSire":"DIAMANT DE SEMILLY","sireDam":"UKASE TER PUTTE","damSire":"NABAB DE REVE","damDam":"VALENTIANA","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["mosito-van-het-hellenof-x-carma-vd-berghoeve-z"]},
  {"slug":"united-touch-s","category":"stallion","name":"UNITED TOUCH S","sold":false,"tagline":"","genetics":"UNTOUCHED x LUX Z","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"UNTOUCHED","dam":"TOUCH OF CLASS","sireSire":"UNTOUCHABLE","sireDam":"CANTANTE TOUCH","damSire":"LUX Z","damDam":"CANTANTE TOUCH S","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["united-touch-s-x-cabri-vd-berghoeve-z","united-touch-s-x-cortina-de-jolie-z"]},
  {"slug":"uricas-vd-kattevennen","category":"stallion","name":"URICAS VD KATTEVENNEN","sold":false,"tagline":"","genetics":"URIKO x CASSINI I","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"URIKO","dam":"T-CASSINA","sireSire":"UNTOUCHABLE","sireDam":"WIZZARD","damSire":"CASSINI I","damDam":"CHIKA’S WAY","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["uricas-vd-kattevennen-x-cortina-de-jolie-z"]},
  {"slug":"zandor-z","category":"stallion","name":"ZANDOR Z","sold":false,"tagline":"","genetics":"ZEUS x POLIDOR","year":"","studbook":"","sex":"Stallion","height":"","horsetelex":"","pedigree":{"sire":"ZEUS","dam":"PUSTEBLUME","sireSire":"ARLEQUIN X","sireDam":"URIELLE","damSire":"POLIDOR","damDam":"ASCONA","third":[]},"body":[],"photos":[],"videos":[],"country":"","crosses":["zandor-z-x-cabri-vd-berghoeve-z"]}
];
if (typeof module !== 'undefined') module.exports = SEMEN;
