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
      "line": "By Ogano Sitte, jumping at the highest level with Jos Lansink until an injury ended his sport early. What he passes on is blood and scope, and Agana van het Gerendal Z shows it at five star level.",
      "source": "Zangersheide and Hippomundo, read 7 September 2026"
    },
    "BIG STAR": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/240686/big-star",
      "line": "Nick Skelton's horse: team gold in London, individual gold in Rio. A KWPN stallion by Quick Star out of a Nimmerdor mare, and named KWPN Stallion of the Year after he left the sport.",
      "source": "Wikipedia and World of Showjumping, read 7 September 2026"
    },
    "CATOKI": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/38151/catoki",
      "line": "A Holsteiner by Cambridge, one of the best sons of Caletto I. He won the Grand Prix of Rastede with Gerd Sosath and went on to World Cup shows, and his son Canoso topped the Holstein licensing.",
      "source": "Breeding News for Sport Horses and Hof Sosath, read 7 September 2026"
    },
    "CHACCO BLUE": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/118901/chacco-blue",
      "line": "Chacco Blue has led the WBFSH ranking of jumping sires, and his stock carried him there: Explosion W with Ben Maher, Chaqui Z with Shane Sweetnam. His dam Contara brought the thoroughbred blood that keeps his offspring quick.",
      "source": "World of Showjumping and The Horse Magazine, read 7 September 2026"
    },
    "COMME IL FAUT": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/285153/comme-il-faut",
      "line": "By Cornet Obolensky out of Ratina Z. He won at the highest level with Marcus Ehning and stood in the German team that took silver at the European Championship in Rotterdam.",
      "source": "Hippomundo and Jumper News, read 7 September 2026"
    },
    "CORNET OBOLENSKY": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/34480/cornet-obolensky",
      "line": "A grey by Clinton out of Rabanna van Costersveld. European team champion and an Olympic horse with Marco Kutscher, and the sire of Cornet d'Amour, who won the World Cup Final and led the world ranking.",
      "source": "The Horse Magazine and Groupe France Elevage, read 7 September 2026"
    },
    "DOMINATOR 2000 Z": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/1684104/dominator-2000-z",
      "line": "One of the most important sons of Diamant de Semilly. With Christian Ahlmann he won Global Champions Tour Grands Prix in Stockholm and Hamburg, and his dam Cephale 2000 has produced a run of licensed stallions.",
      "source": "Zangersheide and The Horse Magazine, read 7 September 2026"
    },
    "DOURKHAN HERO Z": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/2016609/dourkhan-hero-z",
      "line": "Vice World Champion at seven, and his first five star Grand Prix at ten, in Hamburg with Christian Ahlmann. A young Zangersheide stallion whose first foals are already out at the World Breeding Championship.",
      "source": "Zangersheide and Hippomundo, read 7 September 2026"
    },
    "FOR PLEASURE": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/15154/for-pleasure",
      "line": "Two Olympic team golds with Lars Nieberg, Atlanta and Sydney, and Hanoverian Stallion of the Year. He stayed in the sport until he was twenty, and his sons stand in studbooks across Europe.",
      "source": "Wikipedia and Eurodressage, read 7 September 2026"
    },
    "MOSITO VAN HET HELLENOF": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/1692956/mosito-van-het-hellehof",
      "line": "One of the first approved sons of Elvis ter Putte. Second in the Rolex Grand Prix of Knokke with Bernardo Alves, and his first crop stood in force in the final of the Belgian championship for five year olds.",
      "source": "Joris De Brabander and Hippomundo, read 7 September 2026"
    },
    "UNITED TOUCH S": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/1677488/united-touch-s",
      "line": "Individual gold at the European Championship with Richard Vogel, five rounds and not a fence down. He comes out of the Classic Touch damline, the mare that won Olympic individual gold with Ludger Beerbaum.",
      "source": "FEI and Rolex Grand Slam, read 7 September 2026"
    },
    "URICAS VD KATTEVENNEN": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/1761945/uricas-v-d-kattevennen",
      "line": "Two five star Grands Prix in one season, St Gallen and Riesenbeck, and the Olympic Games in Paris with the Dutch team. His granddam Chika's Way jumped at the highest level, and behind her stands Wodka II.",
      "source": "Harrie Smolders and Oldenburger Pferdezuchtverband, read 7 September 2026"
    },
    "ZANDOR Z": {
      "horsetelex": "https://www.horsetelex.com/horses/pedigree/26151/zandor-z",
      "line": "He jumped Grands Prix with Jos Lansink, Bordeaux among them twice, and stood at Zangersheide in Lanaken to the end. Zekina Z, Zeta de Hus and ZZ Top vh Schaarbroek Z all carry his name.",
      "source": "Equnews and Hippomundo, read 7 September 2026"
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
