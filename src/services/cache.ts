import type { CachedData } from "../types";

const PREFIX = "heliumtax:";
const TX_TTL_CURRENT_YEAR = 60 * 60 * 1000; // 1 hour

function key(suffix: string): string {
  return `${PREFIX}${suffix}`;
}

function currentYear(): number {
  return new Date().getFullYear();
}

function safeGet<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(k);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSet(k: string, value: unknown): void {
  const json = JSON.stringify(value);
  try {
    localStorage.setItem(k, json);
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      evictOldest();
      try {
        localStorage.setItem(k, json);
      } catch {
        // give up silently
      }
    }
  }
}

function evictOldest(): void {
  const cYear = currentYear();
  const candidates: { key: string; fetchedAt: number }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith(PREFIX)) continue;
    if (!k.startsWith(key("tx:"))) continue;
    if (k.includes(`:${cYear}`)) continue;
    const raw = safeGet<CachedData<unknown>>(k);
    if (raw?.fetchedAt) {
      candidates.push({ key: k, fetchedAt: raw.fetchedAt });
    }
  }
  candidates.sort((a, b) => a.fetchedAt - b.fetchedAt);
  for (const c of candidates.slice(0, 3)) {
    localStorage.removeItem(c.key);
  }
}

function isFresh(fetchedAt: number, ttlMs: number, year: number): boolean {
  if (year < currentYear()) return true;
  return Date.now() - fetchedAt < ttlMs;
}

export function getAddresses(): string[] {
  return safeGet<string[]>(key("addresses")) ?? [];
}

export function setAddresses(addresses: string[]): void {
  safeSet(key("addresses"), addresses);
}

export function getApiKey(): string {
  return safeGet<string>(key("apiKey")) ?? "";
}

export function setApiKey(apiKey: string): void {
  safeSet(key("apiKey"), apiKey);
}

export function getTaxYear(): number | null {
  return safeGet<number>(key("taxYear"));
}

export function setTaxYear(year: number): void {
  safeSet(key("taxYear"), year);
}

export function getMiningOverrides(): Record<string, boolean> {
  return safeGet<Record<string, boolean>>(key("miningOverrides")) ?? {};
}

export function setMiningOverrides(overrides: Record<string, boolean>): void {
  safeSet(key("miningOverrides"), overrides);
}

export function getWalletTxCache(wallet: string): CachedData<unknown[]> | null {
  return safeGet<CachedData<unknown[]>>(key(`tx:${wallet}`));
}

export function isWalletTxCacheFresh(wallet: string, year: number): boolean {
  const cached = getWalletTxCache(wallet);
  if (!cached) return false;
  return isFresh(cached.fetchedAt, TX_TTL_CURRENT_YEAR, year);
}

export function setWalletTxCache(wallet: string, data: unknown[]): void {
  const entry: CachedData<unknown[]> = { data, fetchedAt: Date.now() };
  safeSet(key(`tx:${wallet}`), entry);
}

export function clearCacheForWallets(wallets: string[]): void {
  for (const w of wallets) {
    localStorage.removeItem(key(`tx:${w}`));
  }
}
