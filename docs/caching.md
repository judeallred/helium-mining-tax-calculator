# Client-side caching

All persistent state lives in `localStorage` under the `heliumtax:` prefix. The caching layer is in `src/services/cache.ts`.

## What's cached

| Key pattern | Contents | TTL |
|-------------|----------|-----|
| `heliumtax:addresses` | Saved wallet addresses | Permanent |
| `heliumtax:apiKey` | Helius API key | Permanent |
| `heliumtax:taxYear` | Selected tax year | Permanent |
| `heliumtax:miningOverrides` | Manual mining classification toggles (`{ signature: bool }`) | Permanent |
| `heliumtax:tx:{wallet}` | Fetched transaction history for a wallet | 1 hour (current year), indefinite (past years) |

## TTL logic

Transaction caches for past tax years never expire — the on-chain data is immutable, so there's no reason to re-fetch. For the current tax year, caches expire after 1 hour since new transactions may have arrived.

The "Refresh Data" button in the UI bypasses the cache entirely by calling `clearCacheForWallets()` before fetching.

## Quota management

If a `localStorage` write fails with `QuotaExceededError`, the cache evicts the 3 oldest transaction caches (by `fetchedAt` timestamp) that aren't for the current year, then retries the write once.
