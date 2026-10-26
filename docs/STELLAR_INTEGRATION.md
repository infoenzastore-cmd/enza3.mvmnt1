# Stellar Testnet integration

The sample checkout at `demo.html` uses Freighter 6.0.1's documented browser API. It asks for the active Testnet G-address, reads its balances, and offers a wallet-signed Circle test USDC trustline setup when needed. For a purchase it signs only after showing the exact order amount, issuer, merchant destination, memo and expiry. Pollar remains an optional sign-in route in the shopper prototype; it is not the signer for this sample checkout.

The Node API creates a unique, 15-minute order. It builds a classic payment XDR for the customer address and stores its transaction hash. It accepts a signed XDR only if the source, hash, operation, asset, amount and memo match the stored intent. Horizon submission is followed by a separate ledger read; only a successful, unique transaction in the order window marks it paid.

The 90% vendor allocation is computed with integer Stellar units. A separate payout XDR is built only for a paid order and a configured vendor address with the exact USDC trustline. The operator selects the merchant wallet in Freighter and signs. The API checks that signed XDR against the prepared payout, submits it and independently checks the confirmed source, destination, asset, amount, memo and uniqueness.

The API uses a single-process JSON file under ignored `.data/`. For a public test, deploy it on a persistent Node host behind HTTPS, with a durable volume, exact `PUBLIC_ORIGIN`, and only public G-addresses in environment variables. A production marketplace needs a transactional database, authentication, inventory/fulfillment integration, abuse controls, refunds and operational reconciliation. Do not treat this Testnet sample as a live sale or a production payout rail.

See [Freighter's signing documentation](https://docs.freighter.app/extension-freighter-api/signing.md), [Stellar Testnet](https://developers.stellar.org/docs/networks), and [Stellar's USDC asset examples](https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/api-reference/get-all-assets).
