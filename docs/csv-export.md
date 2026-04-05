# CSV export

The app exports mining income transactions in two formats. Only transactions marked as mining income are included in exports.

## IRS format

Intended for IRS Schedule 1 / Schedule C reporting. Filename: `helium-mining-income-{year}-irs.csv`

| Column | Example | Notes |
|--------|---------|-------|
| Date Received | `2025-01-15` | ISO date |
| Description | `Helium Mining Reward (HNT)` | Includes token symbol |
| Amount | `0.12345678` | Absolute token amount |
| Token | `HNT` | Token symbol |
| Fair Market Value per Token (USD) | `6.230000` | 6 decimal places, or `N/A` |
| Total Fair Market Value (USD) | `0.77` | 2 decimal places, or `N/A` |

## Koinly Universal format

Compatible with [Koinly](https://koinly.io/) import. Filename: `helium-mining-income-{year}-koinly.csv`

| Column | Example | Notes |
|--------|---------|-------|
| Date | `2025-01-15 00:00:00 UTC` | ISO datetime with UTC |
| Sent Amount | | Always empty for mining income |
| Sent Currency | | Always empty |
| Received Amount | `0.12345678` | Absolute token amount |
| Received Currency | `HNT` | Token symbol |
| Fee Amount | | Always empty |
| Fee Currency | | Always empty |
| Net Worth Amount | `0.77` | FMV in USD |
| Net Worth Currency | `USD` | Always USD |
| Label | `mining` | Koinly label for mining income |
| Description | `Helium Mining Reward (HNT)` | |
| TxHash | `5Kj2...` | Solana transaction signature |

## Implementation

CSV generation lives in `src/utils/csv.ts`. Fields containing commas, quotes, or newlines are escaped per RFC 4180. The download is triggered by creating a temporary `<a>` element with a `blob:` URL.

## Edge cases

- Transactions with `N/A` prices (no price data found within ±3 days) are still included in the export with `N/A` in the price/FMV columns.
- Only transactions where `isMiningIncome === true` are exported, regardless of the automatic classification. User overrides are respected.
