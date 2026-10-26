# Foundation and design identity — implementation plan

Status: **foundation implemented, payments pending**. Read with [`ARCHITECTURE.md`](ARCHITECTURE.md), [`MIGRATION_PLAN.md`](MIGRATION_PLAN.md), [`AGENTS.md`](AGENTS.md) and [`thesis.md`](thesis.md). The earlier [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) remains a record of the existing local Testnet demo.

## Outcome and smallest path

The polished, responsive shopper-first prototype is published at `/prototype/` with 14 owner-referenced product concepts, guided discovery, a local cart and a clear USD/USDC payment review. The new marketplace owns checkout. The owner requests a real Testnet payment next; it needs a hosted API, durable order storage and server verification, and cannot mark placeholder stock as fulfilled. The path to selling then connects approved inventory, persistent orders and selected payment methods. Avoid installing a CMS, search cluster, CRM, analytics suite, marketplace engine or EVM wallet stack before their corresponding use case and provider decision exist.

## Proposed file map (additions, not edits in this part)

| Future path | Responsibility |
| --- | --- |
| `apps/web/app/(shop)/...` | Home, collection, product, cart and checkout routes; semantic SEO metadata |
| `apps/web/app/(content)/...` | Maker stories, journal and community landing |
| `apps/web/app/(account)/...`, `apps/web/app/(admin)/...` | Buyer status and role-protected operator workflows once auth is selected |
| `apps/web/components/...`, `apps/web/styles/...` | Accessible shell, cards, navigation, forms and tokens inspired by `movement.css` and supplied reference images |
| `apps/web/modules/catalogue/`, `discovery/`, `cart/`, `orders/` | Typed domain models, server pricing and persistence contracts |
| `apps/web/modules/payments/fiat/`, `stellar/` | Provider adapters; Stellar transaction construction/verification separated from route handlers |
| `apps/web/modules/content/`, `leads/`, `analytics/` | Provider-neutral interfaces with local/disabled adapters until selected |
| `apps/web/data/sample-products.ts` | The 14 owner-referenced product concepts, isolated from real inventory and checkout |
| `apps/web/tests/...` | Journey and payment boundary tests where behavior or money movement warrants them |

This layout is a proposal; adjust to the actual app scaffold when coding begins. Keep the current root Vite files operational throughout migration.

## Phase 1 — foundation and identity

**Build:** use the supplied lotus art and exact brand colors in the public shell; create the eventual Next.js/TypeScript scaffold when server commerce begins. The static prototype now has the editorial wellness hero, catalogue, experience references and maker invitation. The custom Enza Type and Museo font files remain an asset dependency; temporary web-font substitutes are used. Provide buyer, vendor and community calls to action, but send forms only to a configured server endpoint.

**Acceptance:** `npm ci`, lint/typecheck/build pass for the new app; homepage and navigation work at phone, tablet and desktop widths; keyboard and screen-reader paths are usable; reduced-motion preference works; title, description, canonical and Open Graph content are deliberate; no paid order or real integration is claimed. Existing `index.html`, `demo.html` and GitHub Pages preview still work.

## Phase 2 — catalogue and guided discovery

**Build:** the current preview has 14 concepts across Food, Fashion, Lifestyle and Home, each with an original aligned concept render. Search, filters and a short optional mood edit work locally. Add product detail pages, verified maker/source fields and a consent-based preference flow after content approval. Add newsletter/vendor interest forms only with consent and a selected destination.

**Acceptance:** all 14 records render with useful alt text; filters/search and empty states work; preference answers can be skipped and are not treated as medical data; concept stock and prices are not presented as live offers; mobile product exploration is complete. Product detail slugs and analytics remain later work.

## Phase 3 — cart, orders and fiat

**Build:** provision the new marketplace's inventory, pricing and orders in a selected persistent database, likely PostgreSQL, when real selling begins. Add auth only where needed. Select a fiat provider if USD card/bank checkout is in launch scope, and implement its hosted/SDK checkout and signed webhook flow. Add shipping, tax, cancellation, returns and fulfillment rules approved for the launch region.

**Acceptance:** server recalculates USD totals in integer minor units; unavailable items cannot be purchased; duplicate callbacks cannot double-fulfill; an order is pending before payment and paid only on verified provider confirmation; failed/cancelled/delayed payment states are clear. Run a provider sandbox order and refund before live selling.

## Phase 4 — optional Stellar Testnet USDC

**Build:** verify the current official Testnet USDC issuer before configuring; use a configured merchant public address with exact trustline. Choose a customer-controlled signing route that meets the desired no-extension UX, then support wallet connection/network review, trustline/XLM guidance, explicit authorization, transaction submission, pending state and explorer link. Persist order reference, expected asset/issuer, destination and amount. Adapt the existing exact verification logic to durable, idempotent server-side settlement. No automatic vendor payout.

**Acceptance:** confirmed on-chain success is required before order paid/fulfilled; wrong network, asset/issuer, destination, amount, memo, failed tx, expired order, duplicate hash and repeated confirmation cannot produce a paid order. A cancelled signature remains pending/cancelled without fulfillment. Show transaction hash and Testnet explorer link only for an actual submitted transaction. Tests and build alone do not prove a real payment.

## Phase 5 — vendor operations, content and measurement

**Build:** vendor application and operator qualification; admin content/catalogue review; CMS adapter only if editorial workflow requires one; CRM and analytics with consent and retention policy. Add search service only if measured relevance, volume or latency exceeds database search. Settlement ledger and payout addresses may be added after commerce is real; any payout requires separate authorization, key custody and reconciliation.

**Acceptance:** vendor applications have explicit status and no automatic onboarding; admin actions are authenticated, authorized and auditable; marketing consent can be withdrawn; analytics events match a documented dictionary and exclude PII; content claims and images are approved.

## Risks and dependencies

| Risk/dependency | Required resolution |
| --- | --- |
| New marketplace has no real inventory yet | Keep placeholders clearly labelled and non-fulfillable; approve stock, prices and policies before paid sales |
| Placeholder catalogue confused with inventory | Label samples, block payment for samples, replace with approved stock before sales |
| GitHub Pages cannot run server checkout | Keep preview explicitly simulated; choose Node-capable staging host for working orders |
| Walletless demo mistaken for customer-controlled checkout | Keep server-held Testnet signer isolated; choose a no-extension customer wallet/custody approach before production |
| Incorrect issuer or missing trustline/reserve | Verify issuer from current official source, validate merchant and payer setup on Testnet |
| Provider and compliance decisions unset | Select first region, currency, fiat provider, privacy terms, shipping/tax and return policies before live checkout |

## Decision register

1. **Launch scope:** native ENZA Movement checkout and real Testnet USDC submission are requested. The published Pages preview remains review-only until a hosted verification API exists.
2. **Primary homepage audience:** shoppers first, with a journey toward conscious consumption.
3. **Currency:** display in USD and offer USDC; choose first buyer/shipping region and decide whether fiat USD payment is included at launch.
4. **Catalogue:** 14 named product references and brand assets are supplied; concept renders are published. Final prices, inventory and claims need approval before sales.
5. **Wallet UX:** customer-controlled passkey/embedded option, Freighter optionality, recovery and custody requirements.
6. **Services:** staging/production host and data region; fiat provider; CMS, CRM and analytics only as needed.

No credentials are needed to finish these planning files. Before implementation or deployment, supply credentials through a secret manager or secure host configuration, never in this repository or chat. No production write, deployment or mainnet action is in scope here.
