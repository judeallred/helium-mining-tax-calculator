import * as fs from "node:fs";
import * as path from "node:path";

const envPath = path.join(import.meta.dirname, "..", ".env");
try {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // .env file not found
}

interface PriceMap {
  [dateKey: string]: number;
}

const TOKENS = [
  { symbol: "HNT", file: "hnt-usd-daily.json", csv: "hnt-usd-max.csv", coingeckoId: "helium" },
  { symbol: "IOT", file: "iot-usd-daily.json", csv: "iot-usd-max.csv" },
  { symbol: "MOBILE", file: "mobile-usd-daily.json", csv: "mobile-usd-max.csv" },
] as const;

const HISTORICAL_DIR = path.join(import.meta.dirname, "..", "historical-data");
const OUTPUT_DIR = path.join(import.meta.dirname, "..", "public", "data");

function roundPrice(price: number): number {
  if (price < 0.0001) return Math.round(price * 100_000_000) / 100_000_000;
  if (price < 0.01) return Math.round(price * 1_000_000) / 1_000_000;
  return Math.round(price * 100) / 100;
}

function loadHistoricalCsv(csvFile: string): PriceMap {
  const csvPath = path.join(HISTORICAL_DIR, csvFile);
  const raw = fs.readFileSync(csvPath, "utf-8");
  const prices: PriceMap = {};

  for (const line of raw.split("\n").slice(1)) {
    if (!line.trim()) continue;
    // Format: "2020-04-18 00:00:00 UTC,0.1293653477164651,0.0,4808.15..."
    const firstComma = line.indexOf(",");
    if (firstComma === -1) continue;
    const dateStr = line.slice(0, firstComma).trim();
    const dateKey = dateStr.split(" ")[0];
    const priceStr = line.slice(firstComma + 1, line.indexOf(",", firstComma + 1));
    const price = parseFloat(priceStr);
    if (dateKey && price > 0) {
      prices[dateKey] = roundPrice(price);
    }
  }

  return prices;
}

async function fetchRecentHnt(coingeckoId: string, apiKey: string): Promise<PriceMap> {
  console.log(`  Fetching recent prices from CoinGecko...`);
  const url = `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=365&interval=daily`;
  const response = await fetch(url, {
    headers: { "x-cg-demo-api-key": apiKey },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko error: ${response.status}`);
  }

  const json = (await response.json()) as { prices: [number, number][] };
  const prices: PriceMap = {};
  for (const [timestampMs, price] of json.prices) {
    if (price > 0) {
      const dateKey = new Date(timestampMs).toISOString().split("T")[0] ?? "";
      if (dateKey) {
        prices[dateKey] = roundPrice(price);
      }
    }
  }
  return prices;
}

const MAX_YEAR = 2025;

function writeSorted(prices: PriceMap, outputPath: string): number {
  const sorted: PriceMap = {};
  for (const key of Object.keys(prices).sort()) {
    if (key > `${MAX_YEAR}-12-31`) continue;
    const value = prices[key];
    if (value !== undefined) {
      sorted[key] = value;
    }
  }
  fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2));
  return Object.keys(sorted).length;
}

async function main(): Promise<void> {
  const cgKey = process.env["COINGECKO_API_KEY"] ?? "";
  if (!cgKey) {
    console.error("COINGECKO_API_KEY not set. Add it to .env or set the env var.");
    process.exit(1);
  }

  console.log("Updating bundled Helium token daily prices...\n");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const token of TOKENS) {
    console.log(`[${token.symbol}]`);

    // Historical CSV is the baseline for all tokens
    const prices = loadHistoricalCsv(token.csv);
    console.log(`  Loaded ${Object.keys(prices).length} entries from ${token.csv}`);

    // Only HNT gets live updates — IOT/MOBILE emissions ended Jan 29, 2025
    if ("coingeckoId" in token) {
      try {
        const recent = await fetchRecentHnt(token.coingeckoId, cgKey);
        let added = 0;
        for (const [date, price] of Object.entries(recent)) {
          if (prices[date] === undefined) {
            prices[date] = price;
            added++;
          }
        }
        if (added > 0) console.log(`  CoinGecko added ${added} new dates`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`  CoinGecko error: ${msg}`);
      }
    }

    const outputPath = path.join(OUTPUT_DIR, token.file);
    const count = writeSorted(prices, outputPath);
    const filtered = Object.keys(prices).filter((k) => k <= `${MAX_YEAR}-12-31`).sort();
    console.log(`  Wrote ${count} entries to ${token.file}`);
    console.log(`  Range: ${filtered[0]} to ${filtered.at(-1)}\n`);
  }

  console.log("Done!");
}

main().catch(console.error);
