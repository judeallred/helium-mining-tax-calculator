# Architecture

The Helium Mining Tax Calculator is a client-side React app that calculates the fair market value of Helium mining income for US tax purposes. Everything runs in the browser — no backend server, no data leaves the user's machine except API calls to Helius and the static price data bundled at build time.

## High-level flow

```
User enters wallet address(es) + Helius API key + tax year
  │
  ▼
Fetch transaction history from Helius API (paginated, filtered to tax year)
  │
  ▼
Filter to Helium-related transactions (HNT, IOT, MOBILE token mints)
  │
  ▼
Classify each transaction (mining reward, swap, transfer, etc.)
  │
  ▼
Look up bundled daily USD price for the primary token on the transaction date
  │
  ▼
Calculate Fair Market Value = |token amount| × price per token
  │
  ▼
Display results, allow CSV export (IRS / Koinly format)
```

## Key directories

```
src/
  App.tsx                  — Orchestrates the full calculate flow
  types.ts                 — All shared TypeScript interfaces
  services/
    helius.ts              — Wallet transaction fetching from Helius API
    coingecko.ts           — Loads bundled price JSON files, price lookup
    cache.ts               — localStorage caching layer
    fetchWithRetry.ts      — Fetch wrapper with exponential backoff
    addressValidation.ts   — Solana address validation (bs58)
  utils/
    mining.ts              — Transaction classification and FMV calculation
    tokens.ts              — Helium token mint addresses and metadata
    csv.ts                 — CSV export generation
    format.ts              — Display formatting helpers
  components/              — React UI components

scripts/
  update-prices.ts         — Builds bundled price JSON from historical CSVs + CoinGecko

historical-data/           — CoinGecko "max" CSV exports (source of truth for prices)
public/data/               — Bundled JSON price files (built by update-prices.ts)
```

## Data sources

| Data | Source | Auth |
|------|--------|------|
| Wallet transaction history | [Helius API](https://helius.dev) | Free API key (user-provided at runtime) |
| Historical token prices (all tokens) | CoinGecko CSV exports in `historical-data/` | None (static files) |
| Recent HNT prices | [CoinGecko API](https://www.coingecko.com/en/api) | Demo API key in `.env` (build-time only) |

IOT and MOBILE emissions ended January 29, 2025 (HIP 138 — "Return to HNT"). After that date, all Helium mining rewards are paid in HNT. The historical CSVs contain complete price data for IOT and MOBILE through their end of life, so no live API calls are needed for those tokens.
