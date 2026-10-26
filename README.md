# ENZA Movement

ENZA Movement is a new unified, human-facing marketplace in development for holistic wellbeing products and experiences. The [branded shopper prototype](prototype/) has 14 owner-referenced product concepts across Food, Fashion, Lifestyle and Home, plus discovery, a local cart and past experience references. The former `enza.in` product pages are content references, not the destination for this new checkout.

The public prototype is a static GitHub Pages preview. Its generated imagery, proposed packaging and USD prices are illustrative. It does not create paid orders. The repository also contains a separate local Stellar **Testnet** USDC demo for one sample product and one sample experience; Axess.Zone is not connected. A 14-item cart-order API is prepared but not connected to the public storefront. See [the foundation plan](IMPLEMENTATION_PLAN.md) and [Stellar integration notes](docs/STELLAR_INTEGRATION.md) before extending payment.

Coding agents must read [AGENTS.md](AGENTS.md) and [thesis.md](thesis.md). This isolated demo uses a disposable server-held Testnet wallet so visitors can authorize sample payments without installing a wallet extension. A production customer checkout still needs a customer-controlled signing flow.

## Pollar Testnet checkout work

Pollar 0.12 is the selected extension-free wallet path for the next Testnet checkout: social or email sign-in, a Stellar wallet, and a user-approved USDC send. Trustless Work handles escrow and milestone release, which is a later option for vendor settlement rather than a replacement for wallet onboarding. Pollar webhooks and Pollar Pay are not available for this integration, so ENZA verifies each payment against Stellar Horizon.

The API now supports `POST /api/checkout/orders` with `{ "customerAddress": "G…", "items": [{ "id": 1, "quantity": 2 }] }`. Prices come from the server's shared 14-product catalogue, and the returned order contains a 28-character unique memo, exact USDC amount and 15-minute expiry. The client must sign a Stellar Testnet payment through Pollar using that memo, then send its hash to `POST /api/orders/{id}/confirm`. Confirmation checks the successful on-chain transaction, memo, official issuer, merchant destination, exact amount, payer address, expiry and hash reuse. A Pollar success response alone never marks an order paid.

This API is not deployed yet. A public deployment needs a `pub_testnet_…` Pollar key, a merchant Testnet G-address with the official Circle Testnet USDC trustline, a persistent `ORDERS_PATH`, `CHECKOUT_ORIGIN`, and a server host. `HOST=0.0.0.0` disables the server-held local demo wallet and its `/pay` endpoint. Never use a Pollar secret key in the frontend. The public prototype remains explicitly preview-only until the Pollar UI, API host and one end-to-end Testnet payment are verified.

## Pages

- `prototype/index.html` — current ENZA Movement shopper prototype and brand direction.
- `index.html` — earlier concept site, retained while the new application is built.
- `demo.html` — sample product and experience checkout using the same local payment API.
- `blueprint.html` — preserved strategy presentation from this repository's earlier homepage.

## GitHub Pages preview

The public [ENZA prototype](https://infoenzastore-cmd.github.io/enza3.mvmnt1/prototype/) serves source HTML, CSS, JavaScript and original concept imagery from `main`. Search, category filters, mood edits and cart review work in the browser. Checkout is deliberately unavailable there: GitHub Pages cannot run the Node verification API or persist orders. The older root sample checkout is explicitly simulated. Use the local Testnet steps below for the existing sample network flow.

## Local Testnet demo

Use Node.js 22 or newer. The demo is local only; do not expose the API publicly.

1. Run `npm ci`, `npm test`, and `npm run build`.
2. Verify the current Stellar Testnet USDC issuer against an [official Circle address list](https://developers.circle.com/stablecoins/usdc-contract-addresses). Copy `.env.example` to ignored `.env`, then set `STELLAR_USDC_TESTNET_ISSUER` and `STELLAR_MERCHANT_ADDRESS` to public Testnet addresses. The merchant must have an authorized trustline to that exact USDC asset. Never put a secret key in `.env`.
3. In one terminal, run `set -a; source .env; set +a; npm start`. This command builds the pages and starts the API and website together at `http://127.0.0.1:3000/`. `npm run dev` is an alias for the same full demo; port 5173 is not used.
4. Open `http://127.0.0.1:3000/` for the site or `http://127.0.0.1:3000/demo.html` for the sample checkout. Click **Prepare demo wallet**. The server creates a disposable account in memory, requests Testnet XLM from Friendbot, and adds the configured USDC trustline. Copy its **public** address into the [Circle faucet](https://faucet.circle.com/) with Stellar Testnet selected, then refresh the balance. One current 20 USDC faucet claim covers the two samples, priced at 5 and 10 test USDC.
5. Select a sample, review the network, issuer, destination, payer, amount and memo, then click **Authorize demo Testnet payment**. The local server signs with its demo wallet and checks the resulting transaction on Horizon before marking the order paid or issuing the demo ticket. No browser extension or visitor secret key is needed.

The server-held signing key exists only in process memory. Restarting the server creates a new wallet address; do not fund more than needed, and keep the process running through both payments. The API binds to `127.0.0.1` and must not be exposed publicly. A successful build or test suite does not prove a payment succeeded. See [Stellar integration notes](docs/STELLAR_INTEGRATION.md) and the [demo script](docs/HACKATHON_DEMO.md) for details.
