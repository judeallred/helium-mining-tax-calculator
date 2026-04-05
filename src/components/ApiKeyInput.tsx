import { useState, useEffect } from "react";
import { getApiKey, setApiKey as saveApiKey } from "../services/cache";

interface ApiKeyInputProps {
  onChange: (apiKey: string) => void;
}

export default function ApiKeyInput({ onChange }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState(() => getApiKey());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    onChange(apiKey);
  }, [apiKey, onChange]);

  function handleChange(value: string) {
    const trimmed = value.trim();
    setApiKey(trimmed);
    saveApiKey(trimmed);
  }

  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        Helius API Key
        <span
          className="relative inline-flex items-center justify-center h-4 w-4 rounded-full bg-gray-200 text-gray-500 text-xs cursor-help group"
          aria-label="API key help"
        >
          i
          <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg bg-gray-800 px-3 py-2 text-xs font-normal text-white shadow-lg z-10">
            A free Helius API key is required to fetch Solana transaction history.
            Get one at{" "}
            <a href="https://helius.dev" target="_blank" rel="noopener noreferrer" className="underline text-violet-300">
              helius.dev
            </a>{" "}
            (no affiliation; free tier: 1M credits/month). Your key is stored locally in your browser only.
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
          </span>
        </span>
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? "text" : "password"}
            value={apiKey}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter your Helius API key..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm font-mono placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={visible ? "Hide API key" : "Show API key"}
          >
            {visible ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Free at{" "}
        <a
          href="https://helius.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 hover:text-violet-700 underline"
        >
          helius.dev
        </a>
        {" "}(no affiliation) — stored locally in your browser only.
      </p>
    </div>
  );
}
