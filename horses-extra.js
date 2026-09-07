/* Hand filled, and never touched by the harvest.
   scripts/harvest-horses.mjs rewrites horses-data.js from the client's site
   every time it runs, so anything typed by hand lives here instead and the
   builder lays it over the harvested data.

   sires:   one entry per stallion used in a cross. Paste the Horsetelex URL
            and the page draws a "View <name> on Horsetelex" link. Leave it
            empty and no link is drawn: nothing is better than a search page
            standing in for a record.
            'line' is the sire line in a sentence or two, for the section
            under the pedigree.
   crosses: per cross, when the sire or dam line needs saying differently
            for that pairing. Empty falls back to the sire entry above and
            to the dam's own listing.

   The dams need nothing here: all fifteen already carry a Horsetelex link
   on their own page, which the builder reads out of the data. */
var HORSES_EXTRA = {
  /* hippomundo: one entry per breeding mare, keyed by her slug. Paste the
     URL of her Hippomundo page and the pedigree section draws "Her record
     is also on Hippomundo". Asked for by the client on 3 Sep. Their own
     site carries none of these, so every one has to come from them; empty
     draws nothing. */
  hippomundo: {
    "hayley-vd-berghoeve-z": "",   /* HAYLEY VD BERGHOEVE Z */
    "cabri-vd-berghoeve-z": "",   /* CABRI VD BERGHOEVE Z */
    "patchina-vant-merelsnest": "",   /* Patchina Van’t Merelsnest */
    "carma-vd-bergheove-z": "",   /* CARMA VD BERGHEOVE Z */
    "hypnotic-jt-z": "",   /* HYPNOTIC JT Z */
    "cortina-de-jolie-z": "",   /* CORTINA DE JOLIE Z */
    "agousha-vd-berghoeve-z": "",   /* AGOUSHA VD BERGHOEVE Z */
    "cartoona-blue": "",   /* CARTOONA BLUE */
    "waikiki-vd-berghoeve": "",   /* WAIKIKI VD BERGHOEVE */
    "heaven-vd-berghoeve-z": "",   /* HEAVEN VD BERGHOEVE Z */
    "unguessable-von-axe": "",   /* Unguessable Von Axe */
    "cardesse-von-axe": "",   /* Cardesse Von Axe */
  },
  sires: {
    "AGANIX DU SEIGNEUR Z": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/166591/aganix-du-seigneur",
      "line": ""
    },
    "BIG STAR": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/240686/big-star",
      "line": ""
    },
    "CATOKI": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/38151/catoki",
      "line": ""
    },
    "CHACCO BLUE": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/118901/chacco-blue",
      "line": ""
    },
    "COMME IL FAUT": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/285153/comme-il-faut",
      "line": ""
    },
    "CORNET OBOLENSKY": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/34480/cornet-obolensky",
      "line": ""
    },
    "DOMINATOR 2000 Z": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/1684104/dominator-2000-z",
      "line": ""
    },
    "DOURKHAN HERO Z": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/2016609/dourkhan-hero-z",
      "line": ""
    },
    "FOR PLEASURE": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/15154/for-pleasure",
      "line": ""
    },
    "MOSITO VAN HET HELLENOF": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/1692956/mosito-van-het-hellehof",
      "line": ""
    },
    "UNITED TOUCH S": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/1677488/united-touch-s",
      "line": ""
    },
    "URICAS VD KATTEVENNEN": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/1761945/uricas-v-d-kattevennen",
      "line": ""
    },
    "ZANDOR Z": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/26151/zandor-z",
      "line": ""
    }
  },
  crosses: {
    "mosito-van-het-hellenof-x-carma-vd-berghoeve-z": {
      "sireLine": "",
      "damLine": ""
    },
    "cornet-obolensky-x-agousha-vd-berghoeve-z": {
      "sireLine": "",
      "damLine": ""
    },
    "dominator-2000-z-x-hypnotic-jt-z": {
      "sireLine": "",
      "damLine": ""
    },
    "united-touch-s-x-cabri-vd-berghoeve-z": {
      "sireLine": "",
      "damLine": ""
    },
    "zandor-z-x-cabri-vd-berghoeve-z": {
      "sireLine": "",
      "damLine": ""
    },
    "chacco-blue-x-cabri-vd-berghoeve-z": {
      "sireLine": "",
      "damLine": ""
    },
    "comme-il-faut-x-patchina-vant-merelsnest": {
      "sireLine": "",
      "damLine": ""
    },
    "catoki-x-cortina-de-jolie-z": {
      "sireLine": "",
      "damLine": ""
    },
    "for-pleasure-x-hypnotic-jt-z": {
      "sireLine": "",
      "damLine": ""
    },
    "aganix-du-seigneur-z-x-cortina-de-jolie-z": {
      "sireLine": "",
      "damLine": ""
    },
    "catoki-x-hypnotic-jt-z": {
      "sireLine": "",
      "damLine": ""
    },
    "united-touch-s-x-cortina-de-jolie-z": {
      "sireLine": "",
      "damLine": ""
    },
    "dourkhan-hero-z-x-cortina-de-jolie-z": {
      "sireLine": "",
      "damLine": ""
    },
    "big-star-x-cortina-de-jolie-z": {
      "sireLine": "",
      "damLine": ""
    },
    "uricas-vd-kattevennen-x-cortina-de-jolie-z": {
      "sireLine": "",
      "damLine": ""
    }
  }
};
if (typeof module !== 'undefined') module.exports = HORSES_EXTRA;
