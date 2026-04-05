export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center space-y-3">
        <p className="text-sm text-gray-600">
          Made with 📡 by{" "}
          <a
            href="https://github.com/judeallred"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            @judeallred
          </a>
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>
            Powered by{" "}
            <a href="https://helius.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-500">Helius</a>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Price data provided by{" "}
            <a
              href="https://www.coingecko.com/en/api"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-500"
            >
              CoinGecko API
            </a>
          </span>
        </div>
        <p className="text-xs text-gray-300">
          Not financial advice.
        </p>
      </div>
    </footer>
  );
}
