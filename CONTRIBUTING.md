# Contributing to Helium Mining Tax Calculator

Thank you for your interest in contributing! This project is open source and we welcome pull requests, bug reports, and feature requests.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/heliumtax.git`
3. Install dependencies: `npm install`
4. Start the dev server: `npm run dev`

## Development

- **`npm run dev`** — Start Vite dev server with HMR
- **`npm run build`** — Type-check and build for production
- **`npm run lint`** — Run ESLint
- **`npm run typecheck`** — Run TypeScript compiler checks

## Before Submitting a PR

1. Run `npm run lint` and fix any issues
2. Run `npm run typecheck` to ensure no type errors
3. Run `npm run build` to verify the production build works
4. Write a clear PR description explaining what changed and why

## Code Style

- TypeScript strict mode is enforced (`noUncheckedIndexedAccess`, `noUnusedLocals`, etc.)
- ESLint with `typescript-eslint` strict rules is configured
- Use functional React components with hooks
- Tailwind CSS for styling (no external CSS files)
- Keep components focused and composable

## Project Structure

See the [architecture docs](docs/architecture.md) for a full overview.

- `src/services/` — API clients, caching, address validation
- `src/components/` — React UI components
- `src/utils/` — Pure utility functions (CSV, formatting, mining detection)
- `src/types.ts` — Shared TypeScript type definitions
- `docs/` — Design documentation (great for understanding the codebase)

## Reporting Bugs

Please use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) when filing issues.

## Feature Requests

Please use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).
