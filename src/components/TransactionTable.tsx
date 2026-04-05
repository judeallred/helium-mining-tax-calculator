import { useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import type { Transaction } from "../types";
import { formatTokenAmount, formatUsd, formatUsdPrice, formatDatetime, truncateMiddle, transactionTypeLabel, tokenColor } from "../utils/format";
import { getMiningOverrides, setMiningOverrides } from "../services/cache";

interface TransactionTableProps {
  transactions: Transaction[];
  onMiningToggle: (id: string, value: boolean) => void;
}

const columnHelper = createColumnHelper<Transaction>();

export default function TransactionTable({ transactions, onMiningToggle }: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const handleMiningToggle = useCallback(
    (id: string, checked: boolean) => {
      const overrides = getMiningOverrides();
      overrides[id] = checked;
      setMiningOverrides(overrides);
      onMiningToggle(id, checked);
    },
    [onMiningToggle],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => (
          <span className="whitespace-nowrap text-sm">{formatDatetime(info.getValue())}</span>
        ),
        sortingFn: "datetime",
      }),
      columnHelper.accessor("primaryToken", {
        header: "Token",
        cell: (info) => {
          const token = info.getValue();
          return (
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tokenColor(token)}`}>
              {token}
            </span>
          );
        },
        filterFn: "equals",
      }),
      columnHelper.accessor("primaryAmount", {
        header: "Amount",
        cell: (info) => {
          const amount = info.getValue();
          const token = info.row.original.primaryToken;
          return (
            <span className={`font-mono text-sm ${amount < 0 ? "text-red-600" : "text-gray-900"}`}>
              {amount > 0 ? "+" : ""}{formatTokenAmount(amount, token)}
            </span>
          );
        },
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => {
          const type = info.getValue();
          const color =
            type === "mining_reward"
              ? "bg-violet-100 text-violet-800"
              : type === "swap"
                ? "bg-amber-100 text-amber-800"
                : type === "transfer_out"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800";
          return (
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
              {transactionTypeLabel(type)}
            </span>
          );
        },
        filterFn: "equals",
      }),
      columnHelper.accessor("priceUsd", {
        header: "Price (USD)",
        cell: (info) => (
          <span className="text-sm">{formatUsdPrice(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("valueFmvUsd", {
        header: "Fair Market Value",
        cell: (info) => (
          <span className="text-sm font-medium">{formatUsd(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("walletAddress", {
        header: "Wallet",
        cell: (info) => (
          <span className="font-mono text-xs text-gray-500" title={info.getValue()}>
            {truncateMiddle(info.getValue(), 20)}
          </span>
        ),
      }),
      columnHelper.accessor("signature", {
        header: "Tx",
        cell: (info) => (
          <a
            href={`https://explorer.solana.com/tx/${info.getValue()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-violet-600 hover:text-violet-700"
            title={info.getValue()}
          >
            {truncateMiddle(info.getValue(), 16)}
          </a>
        ),
      }),
      columnHelper.accessor("isMiningIncome", {
        header: "Mining Income",
        cell: (info) => (
          <input
            type="checkbox"
            checked={info.getValue()}
            onChange={(e) => handleMiningToggle(info.row.original.id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
          />
        ),
      }),
    ],
    [handleMiningToggle],
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        No transactions found. Add wallet addresses and click &quot;Calculate&quot; to fetch data.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left">
        <thead className="border-b border-gray-200 bg-gray-50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-700"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[header.column.getIsSorted() as string] ?? ""}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-100">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
        {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
