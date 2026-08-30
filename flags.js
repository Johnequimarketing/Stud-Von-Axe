/* Every country a horse has been sold to, drawn once.
   These used to live inside the homepage's own script, which meant the
   generated archives and horse pages had the stylesheet for a flag and no flag
   to put in it: the badge said "Sold" on sixty pages where the homepage said
   "Sold" with a flag. One file now, read by index.html as a script and by
   scripts/build-horses.mjs as data.
   Twenty four by sixteen, no strokes finer than half a unit, because these are
   eighteen pixels wide on the page. */
var FLAGS = {
      GB:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#012169"/>'+
         '<path d="M0 0l24 16M24 0L0 16" stroke="#fff" stroke-width="3.2"/>'+
         '<path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" stroke-width="1.9"/>'+
         '<path d="M12 0v16M0 8h24" stroke="#fff" stroke-width="5.2"/>'+
         '<path d="M12 0v16M0 8h24" stroke="#C8102E" stroke-width="3.1"/></svg>',
      US:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#fff"/>'+
         '<g fill="#B31942"><rect y="0" width="24" height="2.28"/><rect y="4.57" width="24" height="2.28"/>'+
         '<rect y="9.14" width="24" height="2.28"/><rect y="13.71" width="24" height="2.29"/></g>'+
         '<rect width="10" height="8.6" fill="#0A3161"/></svg>',
      NL:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#fff"/>'+
         '<rect width="24" height="5.33" fill="#AE1C28"/><rect y="10.67" width="24" height="5.33" fill="#21468B"/></svg>',
      BE:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="8" height="16" fill="#2D2926"/>'+
         '<rect x="8" width="8" height="16" fill="#FAE042"/><rect x="16" width="8" height="16" fill="#ED2939"/></svg>',
      PL:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#fff"/>'+
         '<rect y="8" width="24" height="8" fill="#DC143C"/></svg>',
      IE:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="8" height="16" fill="#169B62"/>'+
         '<rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#FF883E"/></svg>',
      BR:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#009C3B"/>'+
         '<path d="M12 2.2 21.6 8 12 13.8 2.4 8Z" fill="#FFDF00"/>'+
         '<circle cx="12" cy="8" r="3.4" fill="#002776"/></svg>',
      IT:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="8" height="16" fill="#009246"/>'+
         '<rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#CE2B37"/></svg>',
      /* The seven that were missing, drawn at the same 24 by 16 as the rest.
         Simplified where a coat of arms would be a smudge at eighteen pixels:
         Slovenia keeps its mountain because without it the flag is Russia's,
         and Argentina keeps its sun because without it nothing else is left. */
      DE:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#000"/>'+
         '<rect y="5.33" width="24" height="5.34" fill="#DD0000"/>'+
         '<rect y="10.67" width="24" height="5.33" fill="#FFCE00"/></svg>',
      FR:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="8" height="16" fill="#002395"/>'+
         '<rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ED2939"/></svg>',
      ES:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#AA151B"/>'+
         '<rect y="4" width="24" height="8" fill="#F1BF00"/></svg>',
      CZ:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="8" fill="#fff"/>'+
         '<rect y="8" width="24" height="8" fill="#D7141A"/>'+
         '<path d="M0 0 12 8 0 16Z" fill="#11457E"/></svg>',
      LT:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="5.33" fill="#FDB913"/>'+
         '<rect y="5.33" width="24" height="5.34" fill="#006A44"/>'+
         '<rect y="10.67" width="24" height="5.33" fill="#C1272D"/></svg>',
      SI:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="5.33" fill="#fff"/>'+
         '<rect y="5.33" width="24" height="5.34" fill="#005DA4"/>'+
         '<rect y="10.67" width="24" height="5.33" fill="#ED1C24"/>'+
         '<path d="M4 3.2 6 6.6 8 3.2 9 7.4H3Z" fill="#005DA4" stroke="#fff" stroke-width=".5"/></svg>',
      AR:'<svg viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#74ACDF"/>'+
         '<rect y="5.33" width="24" height="5.34" fill="#fff"/>'+
         '<circle cx="12" cy="8" r="1.7" fill="#F6B40E"/></svg>'

};
if (typeof module !== 'undefined') module.exports = FLAGS;
