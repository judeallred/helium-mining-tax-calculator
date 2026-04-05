import { useState, useCallback, useRef } from "react";
import type { Transaction, FetchProgress, TokenPriceMap } from "./types";
import AddressInput from "./components/AddressInput";
import ApiKeyInput from "./components/ApiKeyInput";
import TaxYearSelector, { getDefaultTaxYear } from "./components/TaxYearSelector";
import TransactionTable from "./components/TransactionTable";
import Summary from "./components/Summary";
import ExportButton from "./components/ExportButton";
import ProgressPanel from "./components/ProgressPanel";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";
import { fetchAllWallets, classifyTransactions } from "./services/helius";
import { loadPricesForYear } from "./services/coingecko";
import { clearCacheForWallets } from "./services/cache";
import { processTransactions } from "./utils/mining";
import type { ProgramClassification } from "./types";

export default function App() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [taxYear, setTaxYear] = useState<number>(getDefaultTaxYear);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [progress, setProgress] = useState<FetchProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const handleCalculate = useCallback(
    async (forceRefresh = false) => {
      if (addresses.length === 0) {
        setError("Please add at least one wallet address.");
        return;
      }
      if (!apiKey) {
        setError("Please enter your Helius API key. Get a free one at helius.dev (no affiliation).");
        return;
      }

      setError(null);
      setIsLoading(true);
      setTransactions([]);
      abortRef.current = false;

      try {
        if (forceRefresh) {
          clearCacheForWallets(addresses);
        }

        const allResults = await fetchAllWallets(addresses, apiKey, {
          forceRefresh,
          taxYear,
          onProgress: setProgress,
        });

        if (abortRef.current) return;

        setProgress({
          phase: "prices",
          message: "Loading price data...",
          current: 0,
          total: 1,
        });
        const prices: TokenPriceMap = await loadPricesForYear(taxYear);
        const priceCount =
          Object.keys(prices.HNT).length +
          Object.keys(prices.IOT).length +
          Object.keys(prices.MOBILE).length;
        setProgress({
          phase: "prices",
          message: `Loaded ${priceCount} daily prices`,
          current: 1,
          total: 1,
        });

        if (abortRef.current) return;

        const allSigs = allResults.flatMap(({ transactions: txs }) =>
          txs.map((tx) => tx.signature),
        );

        let classifications: Map<string, ProgramClassification> | undefined;
        if (allSigs.length > 0) {
          classifications = await classifyTransactions(
            allSigs,
            apiKey,
            setProgress,
          );
        }

        if (abortRef.current) return;

        setProgress({
          phase: "analyzing",
          message: "Calculating cost basis...",
          current: 0,
          total: 1,
        });

        const allTransactions: Transaction[] = [];
        for (const { transactions: rawTxs, wallet } of allResults) {
          const txs = processTransactions(rawTxs, wallet, prices, classifications);
          allTransactions.push(...txs);
        }

        const seen = new Set<string>();
        const deduped = allTransactions.filter((tx) => {
          if (seen.has(tx.id)) return false;
          seen.add(tx.id);
          return true;
        });
        deduped.sort((a, b) => a.timestamp - b.timestamp);

        setTransactions(deduped);
        setProgress({
          phase: "analyzing",
          message: `Done! Found ${deduped.length} transactions.`,
          current: 1,
          total: 1,
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Error: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    },
    [addresses, apiKey, taxYear],
  );

  const handleMiningToggle = useCallback((id: string, value: boolean) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id ? { ...tx, isMiningIncome: value } : tx,
      ),
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="satellite antenna">📡</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Helium Mining Tax Calculator</h1>
              <p className="text-sm text-gray-500">Calculate cost basis for HNT, IOT &amp; MOBILE mining income</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <AboutSection />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="space-y-4">
          <AddressInput onChange={setAddresses} />
          <ApiKeyInput onChange={setApiKey} />
          <TaxYearSelector value={taxYear} onChange={setTaxYear} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => void handleCalculate(false)}
            disabled={isLoading || addresses.length === 0 || !apiKey}
            className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Calculating..." : "Calculate"}
          </button>
          <button
            onClick={() => void handleCalculate(true)}
            disabled={isLoading || addresses.length === 0 || !apiKey}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refresh Data
          </button>
          {transactions.length > 0 && (
            <div className="ml-auto">
              <ExportButton transactions={transactions} taxYear={taxYear} />
            </div>
          )}
        </div>

        <ProgressPanel progress={progress} isLoading={isLoading} />

        {transactions.length > 0 && (
          <>
            <Summary transactions={transactions} taxYear={taxYear} />
            <TransactionTable
              transactions={transactions}
              onMiningToggle={handleMiningToggle}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
