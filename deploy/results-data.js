/* The results this stud can actually show, taken from their own four news
   items and nowhere else. Every line here is theirs, word for word or one
   step from it, and `from` names the item it came out of so the two cannot
   quietly disagree.

   What is NOT here and why: there is no results field on any of the sixty
   three horses, so there is no feed to render. Horsetelex would supply one
   and that is still a to do on the checklist. Until it exists this is the
   record, and it is real.

   No dates. Their own stamps were unreliable enough that the news pages show
   none either; a wrong date on a result is worse than no date.

   Order: the sport result first, then the prices, largest first.

   `kind` says what the number is, because three of these five are what a
   horse made at auction and two are where one finished in the ring, and a
   card showing 150,000 beside a card showing 1st has to say which is which.
   Mark asked exactly that on 4 Sep. */
var RESULTS = [
  {
    kind: 'In the ring',
    mark: '1st',
    horse: 'Calleryama',
    sire: 'Casall x Contender x Corrado',
    event: 'Nations Cup, Barcelona',
    with: 'Gilles Thomas',
    note: 'Dam of our own Unguessable Von Axe.',
    from: 'calleryama-wins-barcelona',
  },
  {
    kind: 'Sold at auction',
    mark: '€150,000',
    horse: 'Contouch SVA',
    sire: 'Conthargos x Toulon x Cento',
    event: 'Top price, Your Auction',
    note: 'Sold by us at five years old.',
    from: 'contouch-top-price',
  },
  {
    kind: 'Sold at auction',
    mark: '€57,000',
    horse: 'Foal out of the three quarter sister of Hypnotic JT Z',
    event: 'Zangersheide auction, Lanaken',
    note: 'A second foal from the same family made €54,000.',
    from: 'results-from-lanaken',
  },
  {
    kind: 'Sold at auction',
    mark: '€40,000',
    horse: 'Colt out of Cortina de Jolie Z',
    sire: 'by For Pleasure',
    event: 'Zangersheide auction, Lanaken',
    note: 'Her first colt, out of Cornet Obolensky x Calato x Darco x Chin Chin.',
    from: 'results-from-lanaken',
  },
  {
    kind: 'In the ring',
    mark: 'Final',
    horse: 'Costantino Van’t Ravennest',
    event: 'Seven year olds, World Championships, Lanaken',
    note: 'A half brother to our Unguessable Von Axe.',
    from: 'results-from-lanaken',
  },
];
if (typeof module !== 'undefined') { module.exports = RESULTS; }
