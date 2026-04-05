import bs58 from "bs58";

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidSolanaAddress(address: string): boolean {
  const trimmed = address.trim();
  if (!SOLANA_ADDRESS_REGEX.test(trimmed)) return false;
  try {
    const decoded = bs58.decode(trimmed);
    return decoded.length === 32;
  } catch {
    return false;
  }
}
