import type {
  HeliusHistoryTransaction,
  Transaction,
  TransactionType,
  TokenPriceMap,
  HeliumToken,
  HeliumBalanceChange,
} from "../types";
import { MINT_TO_TOKEN } from "./tokens";
import { lookupPrice } from "../services/coingecko";
import { getMiningOverrides } from "../services/cache";

function extractHeliumChanges(tx: HeliusHistoryTransaction): HeliumBalanceChange[] {
  const results: HeliumBalanceChange[] = [];
  for (const bc of tx.balanceChanges) {
    const token = MINT_TO_TOKEN[bc.mint];
    if (token) {
      results.push({ token, amount: bc.amount, mint: bc.mint });
    }
  }
  return results;
}

function detectType(changes: HeliumBalanceChange[]): TransactionType {
  const incoming = changes.filter((c) => c.amount > 0);
  const outgoing = changes.filter((c) => c.amount < 0);

  if (incoming.length > 0 && outgoing.length > 0) {
    return "swap";
  }

  if (incoming.length > 0 && outgoing.length === 0) {
    return "mining_reward";
  }

  if (outgoing.length > 0 && incoming.length === 0) {
    return "transfer_out";
  }

  return "unknown";
}

function shouldClassifyAsMining(type: TransactionType): boolean {
  return type === "mining_reward";
}

function getPrimaryChange(changes: HeliumBalanceChange[]): { token: HeliumToken; amount: number } {
  const incoming = changes.filter((c) => c.amount > 0);
  if (incoming.length > 0) {
    const best = incoming.reduce((a, b) => (Math.abs(a.amount) > Math.abs(b.amount) ? a : b));
    return { token: best.token, amount: best.amount };
  }

  const outgoing = changes.filter((c) => c.amount < 0);
  if (outgoing.length > 0) {
    const best = outgoing.reduce((a, b) => (Math.abs(a.amount) > Math.abs(b.amount) ? a : b));
    return { token: best.token, amount: best.amount };
  }

  const first = changes[0];
  return first ? { token: first.token, amount: first.amount } : { token: "HNT", amount: 0 };
}

export function processTransactions(
  rawTxs: HeliusHistoryTransaction[],
  walletAddress: string,
  prices: TokenPriceMap,
): Transaction[] {
  const overrides = getMiningOverrides();

  return rawTxs.map((raw): Transaction => {
    const changes = extractHeliumChanges(raw);
    const type = detectType(changes);
    const primary = getPrimaryChange(changes);
    const date = new Date((raw.timestamp ?? 0) * 1000);
    const autoMining = shouldClassifyAsMining(type);
    const isMiningIncome = overrides[raw.signature] ?? autoMining;
    const tokenPrices = prices[primary.token];
    const priceUsd = tokenPrices ? lookupPrice(tokenPrices, date) : null;
    const valueFmvUsd = priceUsd !== null ? Math.abs(primary.amount) * priceUsd : null;

    return {
      id: raw.signature,
      signature: raw.signature,
      date,
      timestamp: raw.timestamp ?? 0,
      balanceChanges: changes,
      primaryToken: primary.token,
      primaryAmount: primary.amount,
      type,
      isMiningIncome,
      priceUsd,
      valueFmvUsd,
      walletAddress,
      fee: raw.fee,
      feePayer: raw.feePayer,
      error: raw.error,
    };
  }).sort((a, b) => a.timestamp - b.timestamp);
}
