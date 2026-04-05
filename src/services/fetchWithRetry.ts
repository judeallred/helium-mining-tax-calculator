export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_BASE_DELAY = 1000;
const DEFAULT_TIMEOUT = 30000;

function jitteredDelay(baseMs: number, attempt: number): number {
  const exponential = baseMs * Math.pow(2, attempt);
  const jitter = exponential * 0.5 * Math.random();
  return exponential + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  options: RetryOptions = {},
): Promise<Response> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const baseDelay = options.baseDelayMs ?? DEFAULT_BASE_DELAY;
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const delayMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : jitteredDelay(baseDelay, attempt);

        const err = new Error(`Rate limited (429)`);
        lastError = err;
        options.onRetry?.(attempt + 1, err, delayMs);
        await sleep(delayMs);
        continue;
      }

      if (response.status >= 500) {
        const err = new Error(`Server error (${response.status})`);
        lastError = err;
        if (attempt < maxAttempts - 1) {
          const delayMs = jitteredDelay(baseDelay, attempt);
          options.onRetry?.(attempt + 1, err, delayMs);
          await sleep(delayMs);
          continue;
        }
      }

      return response;
    } catch (e: unknown) {
      clearTimeout(timer);
      const err = e instanceof Error ? e : new Error(String(e));
      lastError = err;

      if (attempt < maxAttempts - 1) {
        const delayMs = jitteredDelay(baseDelay, attempt);
        options.onRetry?.(attempt + 1, err, delayMs);
        await sleep(delayMs);
      }
    }
  }

  throw lastError ?? new Error("fetchWithRetry: all attempts exhausted");
}
