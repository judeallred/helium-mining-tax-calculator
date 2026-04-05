import type { Transaction } from "../types";

function escapeField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

function formatDatetime(date: Date): string {
  return date.toISOString().replace("T", " ").replace("Z", " UTC");
}

export function generateIrsCsv(transactions: Transaction[]): string {
  const miningOnly = transactions.filter((t) => t.isMiningIncome);
  const headers = [
    "Date Received",
    "Description",
    "Amount",
    "Token",
    "Fair Market Value per Token (USD)",
    "Total Fair Market Value (USD)",
  ];

  const rows = miningOnly.map((t) => [
    escapeField(formatDate(t.date)),
    escapeField(`Helium Mining Reward (${t.primaryToken})`),
    escapeField(Math.abs(t.primaryAmount).toString()),
    escapeField(t.primaryToken),
    escapeField(t.priceUsd !== null ? t.priceUsd.toFixed(6) : "N/A"),
    escapeField(t.valueFmvUsd !== null ? t.valueFmvUsd.toFixed(2) : "N/A"),
  ]);

  return [headers.map(escapeField).join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function generateKoinlyCsv(transactions: Transaction[]): string {
  const miningOnly = transactions.filter((t) => t.isMiningIncome);
  const headers = [
    "Date",
    "Sent Amount",
    "Sent Currency",
    "Received Amount",
    "Received Currency",
    "Fee Amount",
    "Fee Currency",
    "Net Worth Amount",
    "Net Worth Currency",
    "Label",
    "Description",
    "TxHash",
  ];

  const rows = miningOnly.map((t) => [
    escapeField(formatDatetime(t.date)),
    "",
    "",
    escapeField(Math.abs(t.primaryAmount).toString()),
    escapeField(t.primaryToken),
    "",
    "",
    escapeField(t.valueFmvUsd !== null ? t.valueFmvUsd.toFixed(2) : ""),
    "USD",
    "mining",
    escapeField(`Helium Mining Reward (${t.primaryToken})`),
    escapeField(t.signature),
  ]);

  return [headers.map(escapeField).join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
