# Helius API integration

The app fetches Solana wallet transaction history from the [Helius API](https://helius.dev). This is the only runtime API call the app makes.

## Endpoint

```
GET https://api.helius.xyz/v1/wallet/{address}/history
```

Query parameters:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `api-key` | User-provided | Authentication |
| `limit` | `100` | Page size |
| `tokenAccounts` | `balanceChanged` | Include SPL token balance changes in the response |
| `before` | Cursor string | Pagination — fetch transactions older than this cursor |

## Authentication

Users provide their own free Helius API key at runtime. The key is stored in `localStorage` for convenience but never sent anywhere except Helius.

## Pagination

The API returns transactions in reverse chronological order. The app pages backward using cursor-based pagination (`pagination.nextCursor`) until either:

- A transaction's timestamp falls before the start of the selected tax year, or
- `pagination.hasMore` is `false`

## Filtering

Each page of results is filtered to keep only transactions that involve a Helium token mint (HNT, IOT, or MOBILE). The mint addresses are defined in `src/utils/tokens.ts`. Transactions outside the selected tax year are also discarded.

## Response shape

The app expects this structure from each transaction:

```typescript
interface HeliusHistoryTransaction {
  signature: string;
  timestamp: number | null;
  slot: number;
  fee: number;
  feePayer: string;
  error: string | null;
  balanceChanges: {
    mint: string;
    amount: number;    // Already decimal-adjusted by Helius
    decimals: number;
  }[];
}
```

The `balanceChanges` array is the key data — it lists every SPL token whose balance changed in the transaction, with the amount already adjusted for decimals (i.e. a change of 1.5 HNT is reported as `1.5`, not `150000000`).

## Error handling

All Helius requests go through `fetchWithRetry` (see [fetch-resilience.md](./fetch-resilience.md)), which handles rate limits (429), server errors (5xx), timeouts, and network failures with automatic retries.

## File map

| File | Role |
|------|------|
| `src/services/helius.ts` | `fetchWalletHistory()`, `fetchAllWallets()` — pagination, filtering, caching |
| `src/utils/tokens.ts` | `HELIUM_MINTS` — the mint addresses used for filtering |
| `src/services/cache.ts` | Transaction caching in `localStorage` |
