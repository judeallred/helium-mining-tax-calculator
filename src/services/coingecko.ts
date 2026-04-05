import type { PriceMap, TokenPriceMap, HeliumToken } from "../types";

let cachedPrices: TokenPriceMap | null = null;

async function loadBundledPrices(): Promise<TokenPriceMap> {
  if (cachedPrices) return cachedPrices;
  try {
    const [hnt, iot, mobile] = await Promise.all([
      fetch("./data/hnt-usd-daily.json").then((r) => (r.ok ? (r.json() as Promise<PriceMap>) : {})),
      fetch("./data/iot-usd-daily.json").then((r) => (r.ok ? (r.json() as Promise<PriceMap>) : {})),
      fetch("./data/mobile-usd-daily.json").then((r) => (r.ok ? (r.json() as Promise<PriceMap>) : {})),
    ]);
    cachedPrices = {
      HNT: hnt as PriceMap,
      IOT: iot as PriceMap,
      MOBILE: mobile as PriceMap,
    };
    return cachedPrices;
  } catch {
    return { HNT: {}, IOT: {}, MOBILE: {} };
  }
}

export async function loadPricesForYear(year: number): Promise<TokenPriceMap> {
  const all = await loadBundledPrices();
  const yearPrefix = String(year);
  const filtered: TokenPriceMap = { HNT: {}, IOT: {}, MOBILE: {} };

  for (const token of ["HNT", "IOT", "MOBILE"] as HeliumToken[]) {
    const tokenPrices = all[token];
    for (const [dateKey, price] of Object.entries(tokenPrices)) {
      if (dateKey.startsWith(yearPrefix)) {
        filtered[token][dateKey] = price;
      }
    }
  }

  return filtered;
}

export function lookupPrice(prices: PriceMap, date: Date): number | null {
  const dateKey = date.toISOString().split("T")[0] ?? "";
  const price = prices[dateKey];
  if (price !== undefined) return price;

  for (let offset = 1; offset <= 3; offset++) {
    const before = new Date(date);
    before.setDate(before.getDate() - offset);
    const beforeKey = before.toISOString().split("T")[0] ?? "";
    const beforePrice = prices[beforeKey];
    if (beforePrice !== undefined) return beforePrice;

    const after = new Date(date);
    after.setDate(after.getDate() + offset);
    const afterKey = after.toISOString().split("T")[0] ?? "";
    const afterPrice = prices[afterKey];
    if (afterPrice !== undefined) return afterPrice;
  }

  return null;
}
