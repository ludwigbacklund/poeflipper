export interface Currency {
  name: string;
  shorthand: string;
  iconUrl: string;
  minimumStock: number;
}

interface CurrenciesObject {
  [key: string]: Array<Currency>;
}

export const popularCurrencies: Currency[] = [
  {
    name: 'Orb of Fusing',
    shorthand: 'fuse',
    iconUrl:
      'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketLinks.png?&w=1&h=1',
    minimumStock: 50,
  },
  {
    name: 'Chaos Orb',
    shorthand: 'chaos',
    iconUrl:
      'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png?&w=1&h=1',
    minimumStock: 25,
  },
  {
    name: 'Exalted Orb',
    shorthand: 'exa',
    iconUrl:
      'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyAddModToRare.png?&w=1&h=1',
    minimumStock: 3,
  },
  {
    name: 'Orb of Alteration',
    shorthand: 'alt',
    iconUrl:
      'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollMagic.png?&w=1&h=1',
    minimumStock: 200,
  },
  {
    name: 'Orb of Alchemy',
    shorthand: 'alch',
    iconUrl:
      'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeToRare.png?&w=1&h=1',
    minimumStock: 75,
  },
  {
    name: 'Chromatic Orb',
    shorthand: 'chrom',
    iconUrl:
      'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketColours.png?&w=1&h=1',
    minimumStock: 100,
  },
  {
    name: "Jeweller's Orb",
    shorthand: 'jew',
    iconUrl:
      'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketNumbers.png?&w=1&h=1',
    minimumStock: 100,
  },
];

const f = (a, b): any => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
// @ts-ignore
const cartesian = (a, b, ...c): any => (b ? cartesian(f(a, b), ...c) : a);

export const popularCurrencyCombinations: CurrenciesObject = cartesian(
  popularCurrencies,
  popularCurrencies,
)
  .filter(currencies => !currencies.every(curr => curr === currencies[0]))
  .reduce((acc, [currencyOne, currencyTwo]) => {
    acc[currencyOne.shorthand + currencyTwo.shorthand] = [
      currencyOne,
      currencyTwo,
    ];
    return acc;
  }, {});
