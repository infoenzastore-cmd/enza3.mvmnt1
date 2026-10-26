# Foundation and design identity — implementation plan

Status: **plan only**. Read with [`ARCHITECTURE.md`](ARCHITECTURE.md), [`MIGRATION_PLAN.md`](MIGRATION_PLAN.md), [`AGENTS.md`](AGENTS.md) and [`thesis.md`](thesis.md). This root plan is new; the earlier [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) remains untouched as a record of the existing Testnet demo.

## Outcome and smallest path

The first useful milestone is a polished, responsive wellness marketplace **discovery experience**, with 20 honestly labelled placeholder products and a cart that makes clear whether checkout is available. The smallest safe working-commerce path then connects a real inventory/order authority, fiat gateway and optional customer-controlled Stellar Testnet checkout. Do not label placeholders as purchasable stock or a simulated receipt as payment. Avoid installing a CMS, search cluster, CRM, analytics suite, marketplace engine or EVM wallet stack before their corresponding use case and provider decision exist.

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
| `apps/web/data/sample-products.ts` | 20 safe placeholder records, isolated from real catalogue and checkout |
| `apps/web/tests/...` | Journey and payment boundary tests where behavior or money movement warrants them |

This layout is a proposal; adjust to the actual app scaffold when coding begins. Keep the current root Vite files operational throughout migration.

## Phase 1 — foundation and identity

**Build:** create the new app scaffold with TypeScript and Tailwind; extract colors, typography and spacing from `movement.css` into tokens; design homepage with editorial wellness hero, Shop EnZa discovery, maker evidence, stories and a secondary optional payments cue. Use the supplied images as references for premium product photography, conscious interiors, mobile shopping and conversion hierarchy. Preserve the wordmark and avoid copying the four-panel screenshot literally. Provide buyer, vendor and community calls to action, but send forms only to a configured server endpoint.

**Acceptance:** `npm ci`, lint/typecheck/build pass for the new app; homepage and navigation work at phone, tablet and desktop widths; keyboard and screen-reader paths are usable; reduced-motion preference works; title, description, canonical and Open Graph content are deliberate; no paid order or real integration is claimed. Existing `index.html`, `demo.html` and GitHub Pages preview still work.

## Phase 2 — catalogue and guided discovery

**Build:** add 20 sample product records spread across agreed wellness categories, collection and product pages, filters, search over the small dataset, wish/save behavior if useful, and a short optional preference quiz. Add verified maker/source fields to the schema, but leave unverified fields visibly absent. Use approved or rights-cleared imagery. Add newsletter/vendor interest forms only with consent and a selected destination; until then use a clearly labelled local prototype state.

**Acceptance:** all 20 records render with unique slugs and useful alt text; filters/search and empty states work; preference answers can be skipped and are not treated as medical data; placeholder stock and prices are not presented as live offers; mobile product exploration is complete; analytics events use an adapter and contain no sensitive answers.

## Phase 3 — cart, orders and fiat

**Build:** decide whether the live store can provide inventory, pricing and checkout through verified APIs. If yes, use it as authority; if no, provision PostgreSQL and a small commerce module with product, variant, inventory, cart, order and payment tables. Add auth only where needed. Select a fiat provider and implement its hosted/SDK checkout and signed webhook flow. Add shipping, tax, cancellation, returns and fulfillment rules approved for the launch region.

**Acceptance:** server recalculates totals in integer minor units; unavailable items cannot be purchased; duplicate callbacks cannot double-fulfill; an order is pending before payment and paid only on verified provider confirmation; failed/cancelled/delayed payment states are clear; existing payment methods at `enza.in` are not affected. Run a provider sandbox order and refund before live selling.

## Phase 4 — optional Stellar Testnet USDC

**Build:** verify the current official Testnet USDC issuer before configuring; use a configured merchant public address with exact trustline. Choose a customer-controlled signing route that meets the desired no-extension UX, then support wallet connection/network review, trustline/XLM guidance, explicit authorization, transaction submission, pending state and explorer link. Persist order reference, expected asset/issuer, destination and amount. Adapt the existing exact verification logic to durable, idempotent server-side settlement. No automatic vendor payout.

**Acceptance:** confirmed on-chain success is required before order paid/fulfilled; wrong network, asset/issuer, destination, amount, memo, failed tx, expired order, duplicate hash and repeated confirmation cannot produce a paid order. A cancelled signature remains pending/cancelled without fulfillment. Show transaction hash and Testnet explorer link only for an actual submitted transaction. Tests and build alone do not prove a real payment.

## Phase 5 — vendor operations, content and measurement

**Build:** vendor application and operator qualification; admin content/catalogue review; CMS adapter only if editorial workflow requires one; CRM and analytics with consent and retention policy. Add search service only if measured relevance, volume or latency exceeds database search. Settlement ledger and payout addresses may be added after commerce is real; any payout requires separate authorization, key custody and reconciliation.

**Acceptance:** vendor applications have explicit status and no automatic onboarding; admin actions are authenticated, authorized and auditable; marketing consent can be withdrawn; analytics events match a documented dictionary and exclude PII; content claims and images are approved.

## Risks and dependencies

| Risk/dependency | Required resolution |
| --- | --- |
| Unknown live store architecture and API | Obtain source/API access and audit before any integration, migration or claim of feature preservation |
| Placeholder catalogue confused with inventory | Label samples, block payment for samples, replace with approved stock before sales |
| GitHub Pages cannot run server checkout | Keep preview explicitly simulated; choose Node-capable staging host for working orders |
| Walletless demo mistaken for customer-controlled checkout | Keep server-held Testnet signer isolated; choose a no-extension customer wallet/custody approach before production |
| Incorrect issuer or missing trustline/reserve | Verify issuer from current official source, validate merchant and payer setup on Testnet |
| Provider and compliance decisions unset | Select first region, currency, fiat provider, privacy terms, shipping/tax and return policies before live checkout |

## Decision register

1. **Launch scope:** new marketplace checkout or handoff to `enza.in`? Product data/API owner?
2. **Primary homepage audience:** shopper, conscious brand or community?
3. **First sales region and currency:** this determines gateway, tax, shipping and legal copy.
4. **Catalogue:** approved categories, brand assets and imagery rights for the 20 placeholders.
5. **Wallet UX:** customer-controlled passkey/embedded option, Freighter optionality, recovery and custody requirements.
6. **Services:** staging/production host and data region; fiat provider; CMS, CRM and analytics only as needed.

No credentials are needed to finish these planning files. Before implementation or deployment, supply credentials through a secret manager or secure host configuration, never in this repository or chat. No production write, deployment or mainnet action is in scope here.
