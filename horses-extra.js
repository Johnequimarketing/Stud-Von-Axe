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
  sires: {
    "AGANIX DU SEIGNEUR Z": {
      "horsetelex": "",
      "line": ""
    },
    "BIG STAR": {
      "horsetelex": "",
      "line": ""
    },
    "CATOKI": {
      "horsetelex": "",
      "line": ""
    },
    "CHACCO BLUE": {
      "horsetelex": "",
      "line": ""
    },
    "COMME IL FAUT": {
      "horsetelex": "",
      "line": ""
    },
    "CORNET OBOLENSKY": {
      "horsetelex": "",
      "line": ""
    },
    "DOMINATOR 2000 Z": {
      "horsetelex": "",
      "line": ""
    },
    "DOURKHAN HERO Z": {
      "horsetelex": "",
      "line": ""
    },
    "FOR PLEASURE": {
      "horsetelex": "",
      "line": ""
    },
    "MOSITO VAN HET HELLENOF": {
      "horsetelex": "",
      "line": ""
    },
    "UNITED TOUCH S": {
      "horsetelex": "",
      "line": ""
    },
    "URICAS VD KATTEVENNEN": {
      "horsetelex": "",
      "line": ""
    },
    "ZANDOR Z": {
      "horsetelex": "",
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
