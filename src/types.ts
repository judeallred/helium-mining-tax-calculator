export type HeliumToken = "HNT" | "IOT" | "MOBILE";

export type TransactionType =
  | "mining_reward"
  | "swap"
  | "transfer_in"
  | "transfer_out"
  | "unknown";

export interface HeliumBalanceChange {
  token: HeliumToken;
  amount: number;
  mint: string;
}

export interface Transaction {
  id: string;
  signature: string;
  date: Date;
  timestamp: number;
  balanceChanges: HeliumBalanceChange[];
  primaryToken: HeliumToken;
  primaryAmount: number;
  type: TransactionType;
  isMiningIncome: boolean;
  priceUsd: number | null;
  valueFmvUsd: number | null;
  walletAddress: string;
  fee: number;
  feePayer: string;
  error: string | null;
}

export interface PriceMap {
  [dateKey: string]: number;
}

export interface TokenPriceMap {
  HNT: PriceMap;
  IOT: PriceMap;
  MOBILE: PriceMap;
}

export interface CachedData<T> {
  data: T;
  fetchedAt: number;
}

export interface FetchProgress {
  phase: "transactions" | "prices" | "analyzing";
  message: string;
  current: number;
  total: number;
  fromCache?: boolean;
  retrying?: boolean;
  retryAttempt?: number;
}

export interface ExportRowIRS {
  dateReceived: string;
  description: string;
  amount: string;
  token: string;
  fairMarketValuePerToken: string;
  totalFmvUsd: string;
}

export interface ExportRowKoinly {
  date: string;
  sentAmount: string;
  sentCurrency: string;
  receivedAmount: string;
  receivedCurrency: string;
  feeAmount: string;
  feeCurrency: string;
  netWorthAmount: string;
  netWorthCurrency: string;
  label: string;
  description: string;
  txHash: string;
}

export interface HeliusHistoryTransaction {
  signature: string;
  timestamp: number | null;
  slot: number;
  fee: number;
  feePayer: string;
  error: string | null;
  balanceChanges: HeliusBalanceChange[];
}

export interface HeliusBalanceChange {
  mint: string;
  amount: number;
  decimals: number;
}

export interface HeliusHistoryResponse {
  data: HeliusHistoryTransaction[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}
