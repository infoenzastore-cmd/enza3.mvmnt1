# Testnet demonstration

1. Verify the Circle test USDC issuer and configure distinct public customer, merchant and vendor Testnet G-addresses. Give all needed accounts test XLM and an authorized test USDC trustline.
2. Start the persistent Node API with the environment in `.env.example`. Open `demo.html` from the same origin locally, or set its `enza-api-base` meta tag to the deployed HTTPS API URL.
3. In Freighter on Testnet, connect the funded customer wallet. Create the sample order. Review and sign the exact USDC payment.
4. Wait for independent ledger confirmation, show the Testnet explorer link and the demo ticket for the event sample.
5. Switch Freighter to the merchant wallet. Review and sign the 90% vendor payout. Wait for its independent confirmation and show that explorer link.

All assets are Testnet assets without monetary value. If any submission outcome is unclear, use the confirmation retry before signing another transaction.
