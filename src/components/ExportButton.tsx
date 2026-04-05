import type { Transaction } from "../types";
import { generateIrsCsv, generateKoinlyCsv, downloadCsv } from "../utils/csv";
import { useState, useRef, useEffect } from "react";

interface ExportButtonProps {
  transactions: Transaction[];
  taxYear: number;
}

export default function ExportButton({ transactions, taxYear }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const miningCount = transactions.filter((t) => t.isMiningIncome).length;

  function handleIrs() {
    const csv = generateIrsCsv(transactions);
    downloadCsv(csv, `helium-mining-income-${taxYear}-irs.csv`);
    setOpen(false);
  }

  function handleKoinly() {
    const csv = generateKoinlyCsv(transactions);
    downloadCsv(csv, `helium-mining-income-${taxYear}-koinly.csv`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={miningCount === 0}
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
          <button
            onClick={handleIrs}
            className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors rounded-t-lg"
          >
            <span className="font-medium">IRS Format</span>
            <span className="block text-xs text-gray-500">Schedule 1 / Schedule C</span>
          </button>
          <button
            onClick={handleKoinly}
            className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors border-t border-gray-100 rounded-b-lg"
          >
            <span className="font-medium">Koinly Format</span>
            <span className="block text-xs text-gray-500">Compatible with TurboTax, Koinly</span>
          </button>
        </div>
      )}
    </div>
  );
}
