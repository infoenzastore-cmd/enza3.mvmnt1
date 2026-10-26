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

The GitHub Pages storefront remains a concept preview. Pollar sign-in there
does not create an order or send USDC. The separate `demo.html` checkout uses
Freighter to sign a sample Testnet payment and merchant-authorized payout,
provided that its persistent API is deployed and configured. See
`docs/STELLAR_INTEGRATION.md` for the exact flow.
