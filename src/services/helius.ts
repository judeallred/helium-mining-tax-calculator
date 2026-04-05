import type {
  HeliusHistoryResponse,
  HeliusHistoryTransaction,
  HeliusParsedTransaction,
  FetchProgress,
  ProgramClassification,
} from "../types";
import { fetchWithRetry } from "./fetchWithRetry";
import { getWalletTxCache, isWalletTxCacheFresh, setWalletTxCache } from "./cache";
import { HELIUM_MINTS } from "../utils/tokens";

const HELIUS_BASE = "https://api.helius.xyz";
const PAGE_SIZE = 100;
const PARSED_BATCH_SIZE = 100;

const PROGRAM_LAZY_DISTRIBUTOR = "1azyuavdMyvsivtNxPoz6SucD18eDHeXzFCUPq5XU7w";
const PROGRAM_HDAO = "hdaoVTCqhfHHo75XdAMxBKdUqvq1i5bF23sisBqVgGR";
const PROGRAM_TUKTUK = "tuktukUrfhXT6ZT77QTU8RQtvgL967uRuVagWF57zVA";

function isHeliumRelated(tx: HeliusHistoryTransaction): boolean {
  return tx.balanceChanges.some((bc) =>
    Object.values(HELIUM_MINTS).includes(bc.mint),
  );
}

export async function fetchWalletHistory(
  wallet: string,
  apiKey: string,
  options?: {
    forceRefresh?: boolean;
    taxYear?: number;
    onProgress?: (progress: FetchProgress) => void;
  },
): Promise<HeliusHistoryTransaction[]> {
  const year = options?.taxYear ?? new Date().getFullYear();

  if (!options?.forceRefresh && isWalletTxCacheFresh(wallet, year)) {
    const cached = getWalletTxCache(wallet);
    if (cached) {
      options?.onProgress?.({
        phase: "transactions",
        message: "Loaded from cache",
        current: 1,
        total: 1,
        fromCache: true,
      });
      return cached.data as HeliusHistoryTransaction[];
    }
  }

  const yearStart = new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000;
  const yearEnd = new Date(`${year}-12-31T23:59:59Z`).getTime() / 1000;

  const allTxs: HeliusHistoryTransaction[] = [];
  let cursor: string | null = null;
  let page = 0;
  let reachedYearBoundary = false;

  while (!reachedYearBoundary) {
    page++;
    options?.onProgress?.({
      phase: "transactions",
      message: `Fetching page ${page}...`,
      current: allTxs.length,
      total: allTxs.length + PAGE_SIZE,
    });

    const params = new URLSearchParams({
      "api-key": apiKey,
      limit: String(PAGE_SIZE),
      tokenAccounts: "balanceChanged",
    });
    if (cursor) params.set("before", cursor);

    const url = `${HELIUS_BASE}/v1/wallet/${wallet}/history?${params.toString()}`;

    const response = await fetchWithRetry(url, {}, {
      onRetry: (attempt, _error, delayMs) => {
        options?.onProgress?.({
          phase: "transactions",
          message: `Retrying... attempt ${attempt} (waiting ${Math.round(delayMs / 1000)}s)`,
          current: allTxs.length,
          total: allTxs.length + PAGE_SIZE,
          retrying: true,
          retryAttempt: attempt,
        });
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Helius API error: ${response.status} — ${text}`);
    }

    const json = (await response.json()) as HeliusHistoryResponse;

    for (const tx of json.data) {
      const ts = tx.timestamp ?? 0;

      if (ts < yearStart) {
        reachedYearBoundary = true;
        break;
      }

      if (ts <= yearEnd && isHeliumRelated(tx)) {
        allTxs.push(tx);
      }
    }

    if (!json.pagination.hasMore || !json.pagination.nextCursor) {
      break;
    }

    cursor = json.pagination.nextCursor;

    options?.onProgress?.({
      phase: "transactions",
      message: `Fetched ${allTxs.length} Helium transactions so far (page ${page})...`,
      current: allTxs.length,
      total: allTxs.length + (json.pagination.hasMore ? PAGE_SIZE : 0),
    });
  }

  setWalletTxCache(wallet, allTxs);

  options?.onProgress?.({
    phase: "transactions",
    message: `Found ${allTxs.length} Helium transactions for ${year}`,
    current: allTxs.length,
    total: allTxs.length,
  });

  return allTxs;
}

export async function fetchAllWallets(
  wallets: string[],
  apiKey: string,
  options?: {
    forceRefresh?: boolean;
    taxYear?: number;
    onProgress?: (progress: FetchProgress) => void;
  },
): Promise<{ transactions: HeliusHistoryTransaction[]; wallet: string }[]> {
  const results: { transactions: HeliusHistoryTransaction[]; wallet: string }[] = [];

  for (const [i, wallet] of wallets.entries()) {
    options?.onProgress?.({
      phase: "transactions",
      message: `Fetching wallet ${i + 1} of ${wallets.length}...`,
      current: i,
      total: wallets.length,
    });

    const transactions = await fetchWalletHistory(wallet, apiKey, {
      forceRefresh: options?.forceRefresh,
      taxYear: options?.taxYear,
      onProgress: options?.onProgress,
    });

    results.push({ transactions, wallet });
  }

  return results;
}

function collectPrograms(tx: HeliusParsedTransaction): Set<string> {
  const progs = new Set<string>();
  for (const instr of tx.instructions) {
    progs.add(instr.programId);
    for (const inner of instr.innerInstructions ?? []) {
      progs.add(inner.programId);
    }
  }
  return progs;
}

function classifyByPrograms(progs: Set<string>): ProgramClassification {
  const hasLazy = progs.has(PROGRAM_LAZY_DISTRIBUTOR);
  const hasHdao = progs.has(PROGRAM_HDAO);
  const hasTuktuk = progs.has(PROGRAM_TUKTUK);

  if (hasLazy) return "mining";
  if (hasTuktuk && hasHdao) return "delegation";
  if (hasHdao) return "dao_utility";
  return null;
}

export async function classifyTransactions(
  signatures: string[],
  apiKey: string,
  onProgress?: (progress: FetchProgress) => void,
): Promise<Map<string, ProgramClassification>> {
  const result = new Map<string, ProgramClassification>();
  const totalBatches = Math.ceil(signatures.length / PARSED_BATCH_SIZE);

  for (let i = 0; i < signatures.length; i += PARSED_BATCH_SIZE) {
    const batch = signatures.slice(i, i + PARSED_BATCH_SIZE);
    const batchNum = Math.floor(i / PARSED_BATCH_SIZE) + 1;

    onProgress?.({
      phase: "analyzing",
      message: `Classifying transactions (batch ${batchNum}/${totalBatches})...`,
      current: i,
      total: signatures.length,
    });

    const response = await fetchWithRetry(
      `${HELIUS_BASE}/v0/transactions/?api-key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: batch }),
      },
      {
        onRetry: (attempt, _error, delayMs) => {
          onProgress?.({
            phase: "analyzing",
            message: `Classifying retry... attempt ${attempt} (waiting ${Math.round(delayMs / 1000)}s)`,
            current: i,
            total: signatures.length,
            retrying: true,
            retryAttempt: attempt,
          });
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Helius parsed API error: ${response.status} — ${text}`);
    }

    const parsed = (await response.json()) as HeliusParsedTransaction[];
    for (const tx of parsed) {
      const progs = collectPrograms(tx);
      result.set(tx.signature, classifyByPrograms(progs));
    }
  }

  return result;
}
