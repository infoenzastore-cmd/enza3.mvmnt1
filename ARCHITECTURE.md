# ENZA Movement architecture — foundation proposal

Status: **proposed**, 26 October 2026. This document audits the `enza3.mvmnt1` prototype and describes a new, unified ENZA Movement marketplace for holistic wellbeing products and experiences. It does not describe a deployed commerce service. The former `enza.in` business is being retired as a separate destination; no integration or migration from it is planned.

## Current system

| Area | Observed in this repository | Consequence |
| --- | --- | --- |
| Frontend | Plain `index.html`, `demo.html`, `blueprint.html`, `movement.css`, `demo.css`, `demo.js`; Vite 8 build | Concept site and two-item checkout demonstration, not a product application |
| Deployment | GitHub Pages serves static files from `main`; local `server.js` serves built pages and API on `127.0.0.1:3000` | Pages checkout is explicitly simulated; it cannot execute the local Node API |
| Products, cart, orders | Two hard-coded samples in `payment.js`; no catalogue, variants, inventory, cart, customer accounts or shipping; local orders in `.data/orders.json` | No reusable production commerce backend is available here |
| Payments | `@stellar/stellar-sdk` 16, Horizon Testnet, server-side exact payment checks in `payment.js`; local disposable server-held signing key in `demo-wallet.js` | Verification rules are useful; the demo signing model is not a customer wallet architecture |
| Content, search, CRM, analytics | No CMS, search service, lead database, consent system or event analytics | All require selection and implementation |
| Reusable UI | Wordmark, warm cream/ink/olive/gold tokens, serif/sans type, hero, cards, buttons, responsive grids and reduced-motion rules in `movement.css` | Extract as tokens/components; retain ENZA identity while broadening into wellness commerce |

Sources: [`README.md`](README.md), [`package.json`](package.json), [`server.js`](server.js), [`payment.js`](payment.js), [`demo.js`](demo.js), [`movement.css`](movement.css), [`docs/STELLAR_INTEGRATION.md`](docs/STELLAR_INTEGRATION.md).

## Framework and deployment decision

**Propose Next.js App Router + TypeScript + Tailwind CSS for the new marketplace application**, introduced alongside the existing Vite prototype. Product and story pages need indexable server-rendered content; cart, account, orders and payment callbacks need server execution. Next.js has [server/client component boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components) and [route handlers](https://nextjs.org/docs/app/getting-started/route-handlers) for this combination. Tailwind has a maintained [Next.js integration](https://tailwindcss.com/docs/installation/framework-guides/nextjs). TypeScript helps enforce money, order and provider boundaries. Keep a small token layer in CSS so the existing visual language is not lost to utility classes. A UI library such as shadcn/ui is optional, to be evaluated after the first accessible components exist.

Keep GitHub Pages as a **static concept preview** during development. A working marketplace needs a Node-capable or compatible managed host plus persistent data; a static export cannot run payment verification, order writes or authenticated administration. Vercel is one candidate, not a selected provider. Host, region and domain remain open decisions. The new site owns its catalogue, cart, orders and checkout.

Proposed modular monolith, with replaceable adapters:

```text
Next.js web app (public shop, stories, buyer account, vendor application, admin)
  ├─ catalogue + discovery ─────── commerce repository ── PostgreSQL (when persistent orders begin)
  ├─ cart + checkout + orders ──── payment adapters (fiat TBD; Stellar Testnet)
  ├─ content adapter ───────────── local editorial content first; CMS TBD
  ├─ search adapter ────────────── database search first; hosted index only if needed
  ├─ CRM/consent adapter ───────── provider TBD
  └─ analytics event interface ─── provider TBD
```

Server components may read the catalogue directly; client components handle filters, cart interactions and wallet UI. Server routes own writes, webhook validation and on-chain verification. Keep domain logic outside route files to allow tests and later provider changes. Suggested modules are `catalogue`, `discovery`, `cart`, `orders`, `payments`, `content`, `leads`, `vendors`, `analytics` and `auth`. A separate microservice or Medusa installation is premature for 20 placeholders; the new marketplace can begin as a modular monolith.

## Data and integration boundaries

- **Catalogue:** `Product`, `Variant`, `Category`, `Maker`, `Media`, `Price` and availability. Seed 20 clearly labelled placeholder products across wellness, home, personal care and gifting. Placeholder copy, images and prices must not imply real stock, verified sourcing or medical benefit. Replace with approved inventory before paid sales.
- **Commerce:** `Cart`/`CartItem` lead to an immutable priced `Order` with line items, USD prices, tax/shipping decision and status history. Decimal-safe USD cents for display/fiat and exact 7-decimal asset units for Stellar USDC; never trust browser totals. Reservation, fulfillment and returns depend on approved real inventory.
- **Payments:** `PaymentIntent`/`Attempt` record provider, network, expected amount, asset, merchant, unique order reference, status, transaction hash and audit timestamps. A unique constraint on transaction hash and idempotent state transition prevents duplicate fulfillment. Fiat gateway and its webhook remain to be chosen; Stellar is optional alongside fiat.
- **Content and discovery:** Editorial stories and maker profiles drive category and product exploration. Start with curated tags, goals and consent-based preference inputs; no opaque health profiling. Store explicit answers only with consent and allow removal. Use database text search and filters for a 20-product catalogue; add Meilisearch or Algolia only after relevance/scale measurements justify it.
- **CRM and analytics:** Vendor applications, waitlist/newsletter consent and service requests flow through validated server endpoints with spam controls. Define events such as `product_viewed`, `filter_used`, `add_to_cart`, `checkout_started`, `payment_method_selected`, `order_confirmed`, `vendor_application_submitted`; do not send addresses, health answers or payment identifiers into analytics. Pick CRM and analytics vendors after consent, region and retention decisions. GA4/PostHog are candidates, not integrations.

## Stellar checkout boundary

Reuse the tested `payment.js` reconciliation requirements, not the local server wallet. For each customer order: create pending order; show Testnet, asset issuer, merchant, amount and memo; obtain explicit customer authorization through a chosen **customer-controlled** wallet path; submit; verify the resulting transaction from authoritative Testnet data on the server; mark paid once; then fulfill. Verify successful status, exact destination, `USDC` code and independently verified issuer, integer amount, unique memo/order reference, permitted source if policy requires it, network, expiry and unused hash. Show pending/failed/confirmed states and explorer link. The server never receives a customer seed or private key. Merchant signing material, if any is later required for payouts, belongs in a managed secret store and a separate approval flow.

The current no-extension local demo signs with a disposable **server-held Testnet key** and is only a test harness. A production no-extension experience requires a deliberate customer-controlled option (for example a Stellar-compatible passkey smart wallet or a licensed embedded-wallet provider), with recovery, custody, fees, trustlines and jurisdiction reviewed before selection. Freighter may remain an optional wallet path. The screenshot's `wagmi + viem` suggestion is EVM tooling and is not the default for a Stellar-only checkout. Continue to use official Stellar SDK and current wallet guidance. No mainnet or real funds are enabled by this plan.

## Experience and journeys

Visual direction from the supplied images: wellness-first editorial photography; tactile product and maker stories; warm cream, clay, cocoa and olive surfaces; large calm typography; restrained motion; mobile-first product cards. Preserve current ENZA wordmark and core tokens. The purple wallet visual is a secondary checkout cue, not the homepage identity. Provide authentic trust signals (maker, ingredients/materials, shipping, returns) only when verified. Maintain readable contrast, keyboard access, responsive layouts, image alt text and reduced motion.

| Persona | Journey | First useful conversion |
| --- | --- | --- |
| Buyer | Feel welcomed → explore curated products or experiences → learn about makers and wellbeing choices → add to cart → review USD total and choose payment method → receive confirmed order → return | Shopper-first discovery that can grow into conscious consumption; paid order only with real inventory and verified payment |
| Conscious vendor | Discover ENZA → understand criteria and terms → submit application → qualify → onboard catalogue and payout details | Validated application with explicit consent; no automatic approval |
| Administrator | Review content and vendor applications → approve products/prices → monitor orders and payment exceptions → fulfill/refund → reconcile settlement and analytics | Safe review and order state management with audit trail |
| Community member | Read story → opt into community/newsletter → engage → discover relevant products | Consent-based subscription; no fabricated community or ticket integration |

## Environment and security contract

**Existing local demo variables** in [`.env.example`](.env.example): `STELLAR_USDC_TESTNET_ISSUER`, `STELLAR_MERCHANT_ADDRESS`, optional `PORT`. They are public addresses/configuration; the issuer must be checked against a current authoritative Stellar/Circle source before use. Do not commit a filled `.env`.

**Proposed future server-only variables** (names provisional): `DATABASE_URL`, `AUTH_SECRET`, `FIAT_GATEWAY_SECRET`, `FIAT_WEBHOOK_SECRET`, `CRM_API_KEY`, `CMS_TOKEN`, `STELLAR_NETWORK_PASSPHRASE`, `STELLAR_HORIZON_URL`. Expose only deliberate non-secret client configuration through `NEXT_PUBLIC_*` (e.g. public analytics ID and Testnet label). A wallet provider may add more keys only after selection. Use separate development/Testnet and production environments; secret manager, rotation and least-privilege access. Never put wallet seed phrases, customer private keys or payout signing keys in repo, logs, analytics, browser bundles or general `.env.example` values.

Require authenticated admin/vendor roles, server-side authorization on every mutation, input validation, rate limits on forms and checkout, CSRF/session protections appropriate to the selected auth approach, signed fiat webhooks, idempotency keys, HTTPS, encrypted data storage, backups and a retention/deletion policy. Limit PII collection; record marketing consent and honor withdrawal. Health or wellness copy needs an approval process. Card details remain with a payment provider. Production readiness also depends on tax, returns, shipping, privacy and applicable crypto/consumer rules in the selected sales regions.
