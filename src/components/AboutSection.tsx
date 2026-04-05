import { useState } from "react";

const REPO_URL = "https://github.com/judeallred/heliumtax";

export default function AboutSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About This Tool
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4 text-sm text-gray-600">
          <p>
            <strong>Helium Mining Tax Calculator</strong> is a free, open-source, client-side tool
            for calculating Helium (HNT/IOT/MOBILE) mining income taxes. All data processing happens
            in your browser — nothing is sent to any server beyond the Helius and CoinGecko
            public APIs.
          </p>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-xs space-y-2">
            <p>
              <strong>Important:</strong> All calculations are provided on a best-effort basis.
              Price data, transaction classification, and cost basis figures may be inaccurate or
              incomplete. <strong>You are solely responsible for verifying all data before using it
              for tax filing or any other purpose.</strong>
            </p>
            <p>
              This tool <strong>does not</strong> provide tax, legal, or accounting advice. The
              authors and contributors accept <strong>no liability</strong> for errors, omissions,
              or any losses arising from the use of this tool. Consult a qualified tax professional
              for your specific situation.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1">How It Works</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Enter your Solana wallet address(es) that receive mining rewards</li>
              <li>Provide a free Helius API key to fetch transaction history</li>
              <li>The tool identifies HNT, IOT, and MOBILE token deposits</li>
              <li>Historical USD prices are used to calculate fair market value at time of receipt</li>
              <li>Export results as IRS or Koinly-compatible CSV files</li>
            </ol>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1">How Mining Rewards Are Identified</p>
            <p className="mb-2">
              The tool examines each on-chain transaction for balance changes involving Helium
              tokens (HNT, IOT, MOBILE). A transaction is classified as a <strong>mining
              reward</strong> when Helium tokens appear in your wallet with nothing sent out in
              the same transaction — this is the signature pattern of a mining payout.
            </p>
            <p className="mb-2">
              Transactions where tokens flow both in and out are classified as <strong>swaps</strong>{" "}
              (e.g. exchanging IOT for HNT). Transactions with only outgoing tokens are
              classified as <strong>transfers out</strong>.
            </p>
            <p>
              You can manually override any transaction's classification using the checkbox in
              the results table — useful for edge cases like airdrops or transfers from another
              wallet you own.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1">Contribute</p>
            <p>
              This is an open-source project. Pull requests, bug reports, and feature requests
              are welcome!{" "}
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:text-violet-700 underline"
              >
                View on GitHub
              </a>
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1">Data Sources</p>
            <ul className="space-y-1 ml-4">
              <li>
                <a
                  href="https://helius.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:text-violet-700 underline"
                >
                  Helius
                </a>
                {" — "}Solana wallet transaction history API
              </li>
              <li>
                <a
                  href="https://www.coingecko.com/en/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:text-violet-700 underline"
                >
                  CoinGecko API
                </a>
                {" — "}Historical token price data (bundled, no API calls at runtime)
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
