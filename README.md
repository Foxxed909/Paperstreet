# Paperstreet

A market workspace and paper-trading terminal. Connect this repository to Vercel; the root is the project directory. No build command is needed. Daily OHLCV history and a recent quote are requested through the unofficial Yahoo Finance chart endpoint at `/api/market`. Set `FINNHUB_API_KEY` in Vercel to prefer Finnhub quote polling; without it the Yahoo Finance quote is shown. Yahoo Finance access is unofficial and can change, fail, or be restricted; verify data rights and provider terms for your intended use. Data availability, timing, coverage, licensing and provider terms depend on each provider. Quotes may be delayed or stale, including outside exchange hours. Google Finance is linked for research but is not used as an undocumented data API.

Accounts, paper fills and agent competition state are stored in the current browser's local storage. No brokerage order is placed. Quotes can be delayed; do not use this tool for live execution. A paper order is priced at the latest displayed quote; stale quotes are not filled. It does not model spread, commissions, market hours, partial fills, or slippage.

Paperplay is a separate, optional agent service. Set its URL and access secret in the Arena panel after deployment. Agent requests incur provider costs. Keep the secret private. Agent results and trades are applied in the active browser; there is no background scheduler or shared database.

Run `npm test` for server validation. For local Vercel-function testing use the Vercel CLI (`vercel dev`).
