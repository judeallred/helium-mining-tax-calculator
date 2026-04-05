# 📡 Helium Mining Tax Calculator

Free, open-source, client-side Helium (HNT/IOT/MOBILE) mining tax calculator. Calculate cost basis and generate IRS-ready CSV reports — all in your browser.

**[Live Demo →](https://judeallred.github.io/heliumtax/)**

## Features

- **Multi-wallet support** — Input one or more Solana wallet addresses
- **Automatic mining detection** — Identifies mining rewards by analyzing on-chain token flow
- **Three tokens** — Tracks HNT, IOT, and MOBILE mining income
- **Cost basis calculation** — USD prices from bundled historical data at time of receipt
- **Tax year filtering** — Select a specific tax year (2023–2025)
- **CSV export** — IRS Schedule 1/C format and Koinly Universal format
- **Manual overrides** — Toggle any transaction's mining classification
- **Privacy-first** — All processing happens in your browser. No data is sent to any server beyond the Helius API.
- **Offline-capable** — Bundled historical price data, no runtime API calls for prices
- **Resilient** — Automatic retries with exponential backoff for API calls

## Quick Start

```bash
git clone https://github.com/judeallred/heliumtax.git
cd heliumtax
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Prerequisites

You'll need a free [Helius API key](https://helius.dev) to fetch wallet transaction history. Enter it in the app at runtime — it's never stored on any server.

## How It Works

1. Enter your Solana wallet address(es) that receive Helium mining rewards
2. Provide your free Helius API key
3. Select the tax year
4. Click **Calculate**
5. Review the transaction table — mining rewards are auto-detected
6. Toggle the "Mining Income" checkbox for any transaction you want to include/exclude
7. Export to CSV for tax filing

### How Mining Rewards Are Identified

A transaction is classified as a **mining reward** when Helium tokens (HNT, IOT, or MOBILE) appear in your wallet with no tokens sent out in the same transaction. This is the on-chain signature of a mining payout. Transactions with both incoming and outgoing tokens are classified as swaps; outgoing-only transactions are classified as transfers. See [docs/mining-reward-classification.md](docs/mining-reward-classification.md) for details.

## Data Sources

| Data | Source | Notes |
|------|--------|-------|
| Transaction history | [Helius API](https://helius.dev) | Free API key required (user-provided) |
| Token prices | [CoinGecko](https://www.coingecko.com) | Bundled at build time from historical CSV exports |

Price data by [CoinGecko](https://www.coingecko.com/en/api).

## Architecture

See the [docs/](docs/) folder for detailed design documentation:

- [Architecture overview](docs/architecture.md)
- [Mining reward classification](docs/mining-reward-classification.md)
- [Price data pipeline](docs/price-data.md)
- [Helius API integration](docs/helius-api.md)
- [CSV export formats](docs/csv-export.md)
- [Fetch resilience](docs/fetch-resilience.md)
- [Address validation](docs/address-validation.md)
- [Client-side caching](docs/caching.md)

## Deploying to GitHub Pages

The project includes GitHub Actions workflows that automatically build, lint, and deploy to GitHub Pages on push to `main`.

To set it up:
1. Go to your repository's Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to `main` — the site will deploy automatically

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Disclaimer

This tool does not provide tax, legal, or accounting advice. All information is for informational purposes only. Consult a qualified professional for your specific situation.

## License

[MIT](LICENSE)
