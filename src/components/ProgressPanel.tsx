import type { FetchProgress } from "../types";

interface ProgressPanelProps {
  progress: FetchProgress | null;
  isLoading: boolean;
}

export default function ProgressPanel({ progress, isLoading }: ProgressPanelProps) {
  if (!isLoading || !progress) return null;

  const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  const phaseLabel = {
    transactions: "Fetching Transactions",
    prices: "Loading Prices",
    analyzing: "Analyzing",
  }[progress.phase];

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
      <div className="flex items-center gap-3">
        {!progress.fromCache && (
          <svg className="h-5 w-5 animate-spin text-violet-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {progress.fromCache && (
          <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-violet-800">{phaseLabel}</span>
            {progress.fromCache && (
              <span className="text-xs rounded-full bg-violet-200 px-2 py-0.5 text-violet-700">
                Cached
              </span>
            )}
            {progress.retrying && (
              <span className="text-xs rounded-full bg-amber-200 px-2 py-0.5 text-amber-700">
                Retry #{progress.retryAttempt}
              </span>
            )}
          </div>
          <p className="text-sm text-violet-700 mt-0.5">{progress.message}</p>
          {progress.total > 1 && (
            <div className="mt-2 h-1.5 w-full rounded-full bg-violet-200">
              <div
                className="h-1.5 rounded-full bg-violet-600 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
