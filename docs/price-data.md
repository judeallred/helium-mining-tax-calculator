# Price data pipeline

Token prices are bundled into the app at build time as static JSON files. No price API calls happen at runtime in the browser.

## Source data

The `historical-data/` folder contains CoinGecko "max" CSV exports:

| File | Token | Earliest date |
|------|-------|---------------|
| `hnt-usd-max.csv` | HNT | 2020-04-18 |
| `iot-usd-max.csv` | IOT | 2023-04-22 |
| `mobile-usd-max.csv` | MOBILE | 2023-04-20 |

These are CoinGecko's standard export format:

```
snapped_at,price,market_cap,total_volume
2020-04-18 00:00:00 UTC,0.1293653477164651,0.0,4808.150338954356
```

To refresh them, export new CSVs from CoinGecko's historical data pages and replace the files.

## Build step: `scripts/update-prices.ts`

Run with `npx tsx scripts/update-prices.ts`. Requires `COINGECKO_API_KEY` in `.env`.

The script:

1. Parses each historical CSV into a `{ "YYYY-MM-DD": price }` map
2. For HNT only, fetches the last 365 days from CoinGecko's API to fill in any dates newer than the CSV export
3. Filters to dates ≤ the configured `MAX_YEAR` (currently 2025)
4. Rounds prices to appropriate precision (8 decimal places for sub-$0.0001, 6 for sub-$0.01, 2 otherwise)
5. Writes sorted JSON to `public/data/{token}-usd-daily.json`

IOT and MOBILE don't need live API updates because their emissions ended January 29, 2025.

## Runtime price lookup

`src/services/coingecko.ts` loads the bundled JSON files at runtime and provides two functions:

- **`loadPricesForYear(year)`** — returns price maps for all three tokens, filtered to the requested year
- **`lookupPrice(priceMap, date)`** — looks up a specific date's price. If the exact date is missing, searches ±3 days and returns the nearest available price. Returns `null` if nothing is found within that window.

## Fair Market Value calculation

For each transaction classified as mining income:

```
FMV = |primary token amount| × USD price on transaction date
```

The primary token is the largest incoming balance change in the transaction (see [mining-reward-classification.md](./mining-reward-classification.md)).
