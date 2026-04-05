# Mining reward classification

The core tax question is: "Which transactions represent mining income?" This document explains how the app answers that.

## Tokens we track

Three SPL tokens on Solana are relevant to Helium mining:

| Token | Mint address | Decimals |
|-------|-------------|----------|
| HNT | `hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux` | 8 |
| IOT | `iotEVVZLEywoTn1QdwNPddxPWszn3zFhEot3MfL9fns` | 6 |
| MOBILE | `mb1eu7TzEc71KxDpsmsKoucSSuuoGLv1drys1oP2jh6` | 6 |

These are defined in `src/utils/tokens.ts`. A transaction is considered "Helium-related" if any of its balance changes involve one of these mints.

## Transaction fetching

Transactions come from the Helius `/v1/wallet/{address}/history` endpoint (see `src/services/helius.ts`). The app:

1. Pages backward through the wallet's full history using cursor-based pagination
2. Stops when it hits a transaction older than the selected tax year
3. Keeps only transactions within the tax year that involve a Helium token mint
4. Caches results in `localStorage` (1-hour TTL for current year, indefinite for past years)

## Classification logic

Classification happens in `src/utils/mining.ts`. For each transaction, the app:

1. **Extracts Helium balance changes** — filters the transaction's `balanceChanges` array to only entries whose `mint` matches a known Helium token.

2. **Determines transaction type** based on the direction of token flow:

   | Condition | Type | Meaning |
   |-----------|------|---------|
   | Helium tokens come in, none go out | `mining_reward` | Tokens appeared in the wallet with nothing sent — this is a mining payout |
   | Helium tokens go out, none come in | `transfer_out` | User sent tokens somewhere |
   | Both incoming and outgoing Helium tokens | `swap` | Token exchange (e.g. IOT → HNT via Jupiter) |
   | No balance changes match | `unknown` | Edge case |

3. **Selects the primary token** — among incoming changes, picks the one with the largest absolute amount. This is the token used for price lookup and display. For outgoing-only transactions, the largest outgoing change is used instead.

## Why this heuristic works

Helium mining rewards arrive as one-directional SPL token transfers into the wallet. The miner's wallet receives HNT (or historically IOT/MOBILE) without sending anything in return. This is distinct from:

- **Swaps** — which always have both incoming and outgoing token changes in the same transaction (e.g. sending IOT and receiving HNT)
- **Transfers out** — which only have outgoing changes
- **Staking/delegation** — which would also show outgoing changes

The heuristic is intentionally simple. It can't distinguish between mining rewards and airdrops/gifts, but for Helium wallets used primarily for mining, this covers the vast majority of cases correctly.

## User overrides

Users can manually toggle any transaction's mining classification via the UI checkbox. Overrides are stored in `localStorage` under the `heliumtax:miningOverrides` key as a `Record<signature, boolean>`. When an override exists for a transaction signature, it takes precedence over the automatic classification.

This handles edge cases like:
- A token transfer from another wallet that looks like mining but isn't
- A mining reward from an unusual program that doesn't match the heuristic
