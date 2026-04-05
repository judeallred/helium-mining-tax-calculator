# Address validation

Helium tokens are SPL tokens on Solana, so wallet addresses are standard Solana addresses — base58-encoded 32-byte public keys.

## Validation logic

`src/services/addressValidation.ts` validates addresses in two steps:

1. **Regex check** — the string must match `[1-9A-HJ-NP-Za-km-z]{32,44}`, which is the base58 character set (no `0`, `O`, `I`, `l`) at the expected length range.

2. **Decode check** — the string is decoded from base58 using the `bs58` library. The decoded bytes must be exactly 32 bytes long (a Solana public key).

Both checks must pass for the address to be accepted. Invalid addresses are rejected with an inline error message in the address input component.

## Examples

| Input | Valid | Why |
|-------|-------|-----|
| `7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV` | Yes | 32-byte base58-encoded key |
| `xch1qyq...` | No | Chia address (bech32m), not base58 |
| `0x742d35...` | No | Ethereum address, not base58 |
| `abc` | No | Too short |

## Dependency

The `bs58` package (v6+) is used for base58 decoding. It's the standard library for this in the Solana ecosystem.
