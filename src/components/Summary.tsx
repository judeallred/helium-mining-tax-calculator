import type { Transaction } from "../types";
import { formatTokenAmount, formatUsd } from "../utils/format";

interface SummaryProps {
  transactions: Transaction[];
  taxYear: number;
}

export default function Summary({ transactions, taxYear }: SummaryProps) {
  const miningTxs = transactions.filter((t) => t.isMiningIncome);

  const hntTotal = miningTxs
    .filter((t) => t.primaryToken === "HNT")
    .reduce((sum, t) => sum + Math.abs(t.primaryAmount), 0);
  const iotTotal = miningTxs
    .filter((t) => t.primaryToken === "IOT")
    .reduce((sum, t) => sum + Math.abs(t.primaryAmount), 0);
  const mobileTotal = miningTxs
    .filter((t) => t.primaryToken === "MOBILE")
    .reduce((sum, t) => sum + Math.abs(t.primaryAmount), 0);

  const totalUsd = miningTxs.reduce((sum, t) => sum + (t.valueFmvUsd ?? 0), 0);
  const missingPrices = miningTxs.filter((t) => t.priceUsd === null).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {taxYear} Mining Income Summary
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-sm text-gray-500">Total Mining Income</p>
          <p className="text-2xl font-bold text-violet-600">{formatUsd(totalUsd)}</p>
        </div>
        {hntTotal > 0 && (
          <div>
            <p className="text-sm text-gray-500">HNT Received</p>
            <p className="text-lg font-semibold text-gray-900">{formatTokenAmount(hntTotal, "HNT")} HNT</p>
          </div>
        )}
        {iotTotal > 0 && (
          <div>
            <p className="text-sm text-gray-500">IOT Received</p>
            <p className="text-lg font-semibold text-gray-900">{formatTokenAmount(iotTotal, "IOT")} IOT</p>
          </div>
        )}
        {mobileTotal > 0 && (
          <div>
            <p className="text-sm text-gray-500">MOBILE Received</p>
            <p className="text-lg font-semibold text-gray-900">{formatTokenAmount(mobileTotal, "MOBILE")} MOBILE</p>
          </div>
        )}
      </div>

      {missingPrices > 0 && (
        <p className="mt-4 text-sm text-amber-600">
          {missingPrices} transaction{missingPrices !== 1 ? "s" : ""} missing price data.
          Total USD may be incomplete.
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          All {transactions.length} Helium transactions shown. {miningTxs.length} classified as mining income.
        </p>
        <p className="text-xs text-gray-400">
          Price data by{" "}
          <a
            href="https://www.coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:text-violet-600 underline"
          >
            CoinGecko
          </a>
        </p>
      </div>
    </div>
  );
}
