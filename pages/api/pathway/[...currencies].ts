import fetch from 'isomorphic-unfetch';
import { RateLimit } from 'async-sema';
import RedisCache from 'node-cache-redis';

import { popularCurrencies } from '../../../src/utils/currencies';

const LEAGUE = 'Metamorph';
const lim = RateLimit(3);
const cache = new RedisCache({
  redisOptions: {
    host: 'redis',
    port: 6379,
    logErrors: true,
  },
  ttlInSeconds: 180,
});

const fetchCurrencyTrades = async (
  haveCurrency: string,
  wantCurrency: string,
  minimumStock: number,
): Promise<Response> =>
  fetch(`https://www.pathofexile.com/api/trade/exchange/${LEAGUE}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: `POESESSID=${process.env.POESESSID};`,
    },
    body: JSON.stringify({
      exchange: {
        status: { option: 'online' },
        minimum: minimumStock,
        have: [haveCurrency],
        want: [wantCurrency],
      },
    }),
  });

const fetchCurrencyTradeResults = async (
  commaSeparatedTrades: Array<string>,
  query: string,
): Promise<Response> =>
  fetch(
    `https://www.pathofexile.com/api/trade/fetch/${commaSeparatedTrades}?query=${query}&exchange`,
    {
      method: 'GET',
      headers: {
        Cookie: `POESESSID=${process.env.POESESSID};`,
      },
    },
  );

export default async (req, res) => {
  const currencies = req.query.currencies as Array<string>;
  const reverseRatio = req.query.reverseRatio;
  if (!currencies || currencies.length !== 2)
    return res.status(500).send('Invalid or missing currencies');

  const [haveCurrency, wantCurrency] = currencies;
  const haveCurrencyCacheKey = `${LEAGUE}-${haveCurrency}-${wantCurrency}-response`;

  /**
   * result	[…]
   *   0	b5b0f5706bf1cc732f49dd95b779fe6be783ad951232eaf6dd7ab25bb912891b
   *   1	448f5a310b69e7826071c62a1a5e2790d0df55fa945e71d474943d9e2488aadf
   *   2	48a8a6ed5a5e10e259ff5ba5380816a0d3888915f2f64fedff8bde0690f981a9
   *   ...
   */
  let haveCurrencyResJson;

  const haveCurrencyResJsonCacheResult = await cache.get(haveCurrencyCacheKey);
  if (haveCurrencyResJsonCacheResult) {
    haveCurrencyResJson = await JSON.parse(haveCurrencyResJsonCacheResult);
  } else {
    const wantCurrencyMinimumStock = popularCurrencies.find(
      popularCurrency => popularCurrency.shorthand === wantCurrency,
    ).minimumStock;

    await lim();
    const haveCurrencyRes = await fetchCurrencyTrades(
      haveCurrency,
      wantCurrency,
      wantCurrencyMinimumStock,
    );

    if (haveCurrencyRes.status === 200) {
      haveCurrencyResJson = await haveCurrencyRes.json();
      cache.set(haveCurrencyCacheKey, JSON.stringify(haveCurrencyResJson));
    } else {
      const err = `Currency trades could not be fetched for currencies "${haveCurrency}"->"${wantCurrency}":`;
      console.log(err, haveCurrencyRes.statusText);
      return res.status(500).send(err);
    }
  }

  const narrowedHaveCurrencyTrades = haveCurrencyResJson.result.slice(0, 19);
  const haveCurrencyTradesQuery =
    haveCurrencyResJson.query || haveCurrencyResJson.id;
  const haveCurrencyTradesResultsCacheKey = `${LEAGUE}-${haveCurrency}-${wantCurrency}-trades-results`;

  /**
   * result	[…]
   * 0 {…}
   *  id	b5b0f5706bf1cc732f49dd95b779fe6be783ad951232eaf6dd7ab25bb912891b
   *  item	{…}
   *  listing	{…}
   * 1 {…}
   *  id	448f5a310b69e7826071c62a1a5e2790d0df55fa945e71d474943d9e2488aadf
   *  item	{…}
   *  listing	{…}
   */
  let haveCurrencyTradesResultsJson;

  const cacheResult = await cache.get(haveCurrencyTradesResultsCacheKey);
  if (cacheResult) {
    haveCurrencyTradesResultsJson = await JSON.parse(cacheResult);
  } else {
    await lim();
    const haveCurrencyTradesResults = await fetchCurrencyTradeResults(
      narrowedHaveCurrencyTrades.join(','),
      haveCurrencyTradesQuery,
    );

    if (haveCurrencyTradesResults.status !== 200) {
      const err = `Currency trade results could not be fetched for currencies "${haveCurrency}"->"${wantCurrency}" with query "${haveCurrencyTradesQuery}":`;
      console.log(err, haveCurrencyTradesResults.statusText);
      return res.status(500).send(err);
    }
    haveCurrencyTradesResultsJson = await haveCurrencyTradesResults.json();
    cache.set(
      haveCurrencyTradesResultsCacheKey,
      JSON.stringify(haveCurrencyTradesResultsJson),
    );
  }

  if (haveCurrencyTradesResultsJson.result.length === 0)
    return res.status(204).send('No trade results found');

  const {
    listing: {
      price: { exchange, item },
    },
  } = haveCurrencyTradesResultsJson.result[0];

  const ratio = reverseRatio
    ? exchange.amount / item.amount
    : item.amount / exchange.amount;

  if (haveCurrencyTradesResultsJson.result.length > 1) {
    const {
      listing: {
        price: { exchange: secondListingExchange, item: secondListingItem },
      },
    } = haveCurrencyTradesResultsJson.result[1];

    const secondListingRatio = reverseRatio
      ? secondListingExchange.amount / secondListingItem.amount
      : secondListingItem.amount / secondListingExchange.amount;

    if (Math.abs(secondListingRatio * 2) < Math.abs(ratio)) {
      return res.status(200).json({
        ratio: secondListingRatio,
      });
    }
  }

  return res.status(200).json({
    ratio,
  });
};
