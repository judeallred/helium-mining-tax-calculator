import { useState, useEffect } from "react";
import { isValidSolanaAddress } from "../services/addressValidation";
import { getAddresses, setAddresses as saveAddresses } from "../services/cache";

interface AddressInputProps {
  onChange: (addresses: string[]) => void;
}

export default function AddressInput({ onChange }: AddressInputProps) {
  const [addresses, setAddresses] = useState<string[]>(() => getAddresses());
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onChange(addresses);
  }, [addresses, onChange]);

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isValidSolanaAddress(trimmed)) {
      setError("Invalid Solana address. Must be a valid base58-encoded 32-byte address.");
      return;
    }
    if (addresses.includes(trimmed)) {
      setError("Address already added.");
      return;
    }
    const updated = [...addresses, trimmed];
    setAddresses(updated);
    saveAddresses(updated);
    setInput("");
    setError(null);
  }

  function handleRemove(index: number) {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    saveAddresses(updated);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        Wallet Addresses
        <span
          className="relative inline-flex items-center justify-center h-4 w-4 rounded-full bg-gray-200 text-gray-500 text-xs cursor-help group"
          aria-label="Wallet address help"
        >
          i
          <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-gray-800 px-3 py-2 text-xs font-normal text-white shadow-lg z-10">
            Enter the Solana wallet address that receives your Helium mining rewards (HNT, IOT, or MOBILE). Check your Helium Wallet app for this address.
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
          </span>
        </span>
      </label>

      {addresses.length > 0 && (
        <ul className="space-y-2">
          {addresses.map((addr, i) => (
            <li
              key={addr}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono"
            >
              <span className="flex-1 truncate">{addr}</span>
              <button
                onClick={() => handleRemove(i)}
                className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove address"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Solana wallet address..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <button
          onClick={handleAdd}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          Add
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
