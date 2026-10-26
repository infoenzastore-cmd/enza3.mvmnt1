# Pollar and Freighter on the ENZA prototype

The public `/prototype/` page offers two Stellar Testnet wallet sign-in options:
Pollar Google sign-in and Freighter external-wallet sign-in through the built-in
Pollar 0.12 adapter. It displays the resulting Stellar address. The publishable
Pollar key is in `prototype/wallet.js`; no secret key belongs in GitHub Pages.

In the Pollar testnet dashboard, add these exact entries under **Build > Domains**:

- Allowed origin: `https://infoenzastore-cmd.github.io`
- OAuth redirect URI: `https://infoenzastore-cmd.github.io/enza3.mvmnt1/prototype/`

An allowed origin contains no path. The redirect URI does include the prototype
path. Enable Stellar under **Wallets > Wallet settings**. Freighter users must
choose Testnet in their extension before signing in.

The GitHub Pages storefront remains a concept preview. Connecting a wallet does
not create an order or send USDC. A payment button should only be enabled after
deploying a server-side payment-intent and Stellar verification service, adding
the merchant's Circle Testnet USDC trustline, and checking an end-to-end Testnet
payment. See `thesis.md` for the payment and vendor payout acceptance criteria.
