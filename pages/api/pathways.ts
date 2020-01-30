import fetch from 'isomorphic-unfetch';
import { RateLimit } from 'async-sema';

import { popularCurrencyCombinations } from '../../src/utils/currencies';
console.log(popularCurrencyCombinations);

const lim = RateLimit(3);

const fetchPathwayRatio = async (
  want: string,
  have: string,
  reverse: boolean = false,
) => {
  const response = await fetch(
    'https://www.pathofexile.com/api/trade/exchange/Metamorph',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: `POESESSID=${process.env.POESESSID};`,
      },
      body: JSON.stringify({
        exchange: {
          status: { option: 'online' },
          want: [want],
          have: [have],
        },
      }),
    },
  );

  if (response.status !== 200) {
    throw new Error('Fetching pathway ratio failed: ' + response.statusText);
  }

  const { result: pathways, id } = await response.json();
  if (pathways.length === 0) return null;

  const pathwaysResponse = await fetch(
    `https://www.pathofexile.com/api/trade/fetch/${pathways
      .slice(0, 1)
      .join(',')}?query=${id}&exchange`,
  );

  const { result } = await pathwaysResponse.json();
  if (result.length === 0) return null;
  try {
    const {
      listing: {
        price: { exchange, item },
      },
    } = result[0];

    return reverse
      ? exchange.amount / item.amount
      : item.amount / exchange.amount;
  } catch (e) {
    return null;
  }
};

export default async (req, res) => {
  try {
    const pathwayPromises = popularCurrencyCombinations.map(
      async ([currencyOne, currencyTwo]) => {
        await lim();
        const haveRatio = await fetchPathwayRatio(currencyOne, currencyTwo);
        await lim();
        const wantRatio = await fetchPathwayRatio(
          currencyTwo,
          currencyOne,
          true,
        );
        return {
          [`${currencyOne}${currencyTwo}`]: {
            haveRatio,
            wantRatio,
            profitMargin: Math.abs((1 - haveRatio / wantRatio) * 100).toFixed(
              2,
            ),
          },
        };
      },
    );
    const pathways = await Promise.all(pathwayPromises);
    console.log(pathways);
    return res.status(200).json(pathways);
  } catch (e) {
    console.log(e);
    res.status(500).send('Something broke');
  }

  // const enrichedPathways = pathways.map(pathway => {
  //   return;
  // });

  // return res.status(200).json(formattedItems);
};
