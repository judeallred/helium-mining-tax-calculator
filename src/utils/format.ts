import type { HeliumToken, TransactionType } from "../types";

export function formatTokenAmount(amount: number, token: HeliumToken): string {
  switch (token) {
    case "HNT":
      if (Math.abs(amount) >= 1) return amount.toFixed(4);
      if (Math.abs(amount) >= 0.01) return amount.toFixed(6);
      return amount.toFixed(8);
    case "IOT":
    case "MOBILE":
      if (Math.abs(amount) >= 1000) return amount.toFixed(2);
      if (Math.abs(amount) >= 1) return amount.toFixed(4);
      return amount.toFixed(6);
  }
}

export function formatUsd(amount: number | null): string {
  if (amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUsdPrice(amount: number | null): string {
  if (amount === null) return "N/A";
  if (amount < 0.01) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(amount);
  }
  return formatUsd(amount);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDatetime(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function truncateMiddle(str: string, maxLen: number = 16): string {
  if (str.length <= maxLen) return str;
  const half = Math.floor((maxLen - 3) / 2);
  return `${str.slice(0, half)}...${str.slice(-half)}`;
}

export function transactionTypeLabel(type: TransactionType): string {
  switch (type) {
    case "mining_reward":
      return "Mining Reward";
    case "delegation_reward":
      return "Delegation Reward";
    case "dao_utility_reward":
      return "DAO Utility Reward";
    case "swap":
      return "Swap";
    case "transfer_in":
      return "Transfer In";
    case "transfer_out":
      return "Transfer Out";
    case "unknown":
      return "Unknown";
  }
}

export function transactionTypeColor(type: TransactionType): string {
  switch (type) {
    case "mining_reward":
      return "bg-violet-100 text-violet-800";
    case "delegation_reward":
      return "bg-emerald-100 text-emerald-800";
    case "dao_utility_reward":
      return "bg-sky-100 text-sky-800";
    case "swap":
      return "bg-amber-100 text-amber-800";
    case "transfer_out":
      return "bg-red-100 text-red-800";
    case "transfer_in":
      return "bg-green-100 text-green-800";
    case "unknown":
      return "bg-gray-100 text-gray-800";
  }
}

export function tokenColor(token: HeliumToken): string {
  switch (token) {
    case "HNT":
      return "bg-violet-100 text-violet-800";
    case "IOT":
      return "bg-teal-100 text-teal-800";
    case "MOBILE":
      return "bg-blue-100 text-blue-800";
  }
}
