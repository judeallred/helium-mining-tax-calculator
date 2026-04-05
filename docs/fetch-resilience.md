# Fetch resilience

All external API calls go through `fetchWithRetry` (`src/services/fetchWithRetry.ts`), a wrapper around the native `fetch` API that adds timeout, retry, and backoff behavior.

## Configuration

| Option | Default | Purpose |
|--------|---------|---------|
| `maxAttempts` | 5 | Total number of attempts before giving up |
| `baseDelayMs` | 1000 | Base delay for exponential backoff |
| `timeoutMs` | 30000 | Per-request timeout (aborts via `AbortController`) |
| `onRetry` | — | Callback invoked before each retry (used for progress UI) |

## Backoff strategy

Delay between retries uses exponential backoff with jitter:

```
delay = baseDelay × 2^attempt + random(0, baseDelay × 2^attempt × 0.5)
```

This prevents thundering herd problems when multiple requests fail simultaneously.

## What triggers a retry

| Condition | Behavior |
|-----------|----------|
| HTTP 429 (rate limited) | Retry after `Retry-After` header value, or backoff if header is missing |
| HTTP 5xx (server error) | Retry with backoff |
| Network error / timeout | Retry with backoff |
| HTTP 4xx (other than 429) | **No retry** — returned immediately as-is |
| HTTP 2xx | **No retry** — returned immediately |

## Timeout

Each individual attempt has a 30-second timeout enforced by `AbortController`. If the request hasn't completed in 30 seconds, it's aborted and counts as a failed attempt.

## Progress feedback

The `onRetry` callback receives the attempt number, the error, and the delay until the next attempt. The Helius service uses this to update the progress panel in the UI, so users see "Retrying... attempt 2 (waiting 3s)" instead of a silent hang.
