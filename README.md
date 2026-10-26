# ENZA Movement

The [ENZA shopper prototype](https://infoenzastore-cmd.github.io/enza3.mvmnt1/prototype/) is a static preview of the foundation and design layer. Product images and USD prices are illustrative. The separate [Testnet checkout page](demo.html) contains a sample product and experience for wallet integration work.

## Testnet purchase and payout

The checkout code uses a customer-controlled Freighter wallet. It creates a 15-minute order, builds one exact Circle test USDC payment, asks Freighter to sign it, submits it to Stellar Testnet, and has the server independently verify the successful ledger result before marking the order paid. A 90% vendor payout can then be built and signed by the **merchant** Freighter wallet. The remaining 10% stays in the merchant wallet. No buyer can authorize payout.

All transactions use **Testnet assets with no monetary value**. Sample orders do not reserve stock, ship products or book events. Pollar sign-in is available on the shopper prototype, but this sample checkout currently uses Freighter for transaction signing. Vendor payout is a demo allocation, not a production settlement policy.

GitHub Pages cannot run the API or persist orders. The public checkout page remains a preview until a persistent Node host is configured and its HTTPS API URL is placed in the `enza-api-base` meta tag in `demo.html`. Do not claim the public purchase works before an end-to-end Testnet transaction has been checked.

## Run locally

1. Use Node.js 22 or newer. Run `npm ci`, `npm test`, and `npm run build`.
2. Copy `.env.example` to ignored `.env`. Set public **Testnet** merchant and vendor G-addresses. The example issuer is Circle test USDC as shown in [Stellar's asset documentation](https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/api-reference/get-all-assets); verify it again before a demo. Both destinations need that exact trustline. The merchant account needs test XLM and holds the received test USDC.
3. Run `set -a; source .env; set +a; npm start` and open `http://127.0.0.1:3000/demo.html`.
4. Connect Freighter on Testnet. Give the customer wallet test XLM and [Circle faucet](https://faucet.circle.com/) test USDC, then create a sample order. Review the network, issuer, destination, amount and memo in the page and in Freighter before signing.
5. After payment confirmation, switch Freighter to the configured merchant account and explicitly sign the vendor payout. Open both Testnet explorer links.

For a public demo, deploy the API on a Node host with durable storage, set `PUBLIC_ORIGIN=https://infoenzastore-cmd.github.io`, `HOST=0.0.0.0`, and the same Testnet addresses. Serve it behind HTTPS. Its `.data/orders.json` must persist across restarts; the included JSON storage is appropriate only for one process and a small demonstration. Set the public API URL in `demo.html`. Keep signing keys out of the server, repository and browser configuration.

See [AGENTS.md](AGENTS.md), [thesis.md](thesis.md), and [Pollar setup](docs/POLLAR_WALLET_SETUP.md) for the wider architecture.
