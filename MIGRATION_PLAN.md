# Migration plan — prototype to ENZA marketplace

Status: living plan. The branded static prototype is published at `/prototype/`; no production commerce system or domain has been changed. Canonical source is `infoenzastore-cmd/enza3.mvmnt1`. ENZA Movement is the new unified business; old `enza.in` product pages are reference material, not a checkout dependency.

## Migration rule

Build the new marketplace **alongside** the Vite concept site. Keep its static preview and local Testnet demo available while a separate application proves the buyer journey. Add only new files/directories in the first implementation slice. Avoid renaming or deleting the current entry pages until a reviewed replacement is ready. No old-store customer or order data is assumed or required.

## What to carry forward

| Current asset | Plan |
| --- | --- |
| `prototype/index.html`, `prototype/style.css`, `prototype/app.js`, `prototype/assets/` | Current ENZA brand palette, supplied lotus artwork, 14-item catalogue, responsive discovery, search/filter and concept cart; translate into typed components when server commerce begins. |
| `demo.html`, `demo.js`, `demo.css` | Keep clearly labelled Testnet/simulation demo. Use as UX evidence for review, pending and confirmation states; do not treat server-held signing as production wallet connection. |
| `payment.js`, `test/payment.test.js` | Extract decimal-safe amount and exact Horizon reconciliation behavior into a typed payment module, then strengthen with persistent idempotency and network/source checks. Keep tests as regression inputs. |
| `server.js`, `demo-wallet.js` | Retain for isolated local demonstration only. Replace JSON-file orders and in-memory demo wallet in the new commerce runtime. |
| `blueprint.html`, `README.md`, `thesis.md`, `docs/*` | Preserve historical strategy and accurate status labels. Update links and status only during a later reviewed implementation. |
| Former `enza.in` | Product pages supplied by the owner provide naming and initial context for 14 catalogue concepts. Do not link checkout to it or treat its accounts, payment methods or data as ENZA Movement dependencies. |

## Stages and gates

1. **Foundation and decisions.** Shopper-first homepage, new-marketplace checkout, USD/USDC direction and the 14 supplied product references are approved. The owner requests real Testnet checkout. Choose the public API host and extension-free wallet model before exposing payment. Gate: clear prototype/production boundaries.
2. **Design system and public shell.** Add a separate Next.js/TypeScript application with tokenized cream/earth/olive design, responsive navigation, editorial homepage, category/product/story templates and clear Shop EnZa and Experience Antidote labels. Keep the cultural offer conceptual unless there is real inventory. Gate: accessibility, mobile layouts, SEO metadata and visual review against the supplied references.
3. **Discovery with 14 concepts.** The prototype now renders 14 owner-referenced concepts with individual generated product imagery, four categories, search/filter and a simple mood edit. Add product detail pages and maker/story fields after content approval. Capture preferences only by consent. Gate: all 14 records render, filtering works, no concept claims stock or verified health/sourcing benefits.
4. **Commerce and payments.** Create the new marketplace's persistent catalogue/orders in a selected database once real selling begins. Implement cart, server-priced USD checkout, shipping/tax/returns and a selected fiat gateway if fiat is in launch scope. Gate: real product availability, end-to-end paid order, refund/cancellation policy and idempotent fulfillment are tested before selling.
5. **Optional Stellar Testnet USDC.** Add customer-controlled wallet path, merchant receiving account, trustline guidance, exact verified issuer, pending orders and server verification. Keep Testnet explicit. Gate: wrong network/issuer/destination/amount/memo, failed/pending tx, duplicate hash and repeated callbacks cannot mark an order paid; successful payment is confirmed from network data before fulfillment.
6. **Vendor, content and growth.** Add vendor application/qualification, admin review, editorial CMS if needed, consent-based CRM and analytics. Add dedicated search only if the catalogue and measured search quality warrant it. Gate: role permissions, data retention and event tracking are verified. Vendor payouts require a separate approval and audit design.
7. **Production rollout (separate authorization).** Choose host and region, provision DB/secrets/backups, staging domain and monitoring; run content, data, legal and security checks; plan URL redirects and canonical tags. Pilot with a limited catalogue. Move or redirect production traffic only after explicit owner approval and rollback rehearsal. No deployment is authorized by this document.

## Content and SEO launch

Create new ENZA Movement product and experience records from approved source information. Confirm image rights, prices, stock, fulfillment, shipping/tax rules and claims before enabling purchase. Give pages stable slugs, canonical URLs, sitemap, structured data and accessible metadata. If the business later wants redirects from the old domain, plan and approve them separately; they are not part of today's prototype. Never import passwords or payment tokens.

## Rollback and ownership

The current static prototype stays available while the new application is built. Rollback is returning to that preview and disabling new checkout in staging. Before any live launch, establish a tested order and inventory reconciliation process. ENZA owns catalogue claims, pricing, legal terms, fulfillment rules and vendor approval. Engineering owns code, access boundaries, migrations, monitoring and verification.

## Decisions needed before implementation

- The owner requested real Stellar Testnet USDC. Confirm public payment API host, persistent order storage, merchant public account and the no-extension signing model before publishing that action.
- Which buyer region and shipping area come first? USD is the display currency; USDC is the requested digital payment denomination.
- The 14 named references, Food/Fashion/Lifestyle/Home categories and supplied ENZA brand art are approved for the prototype. Confirm final USD prices, product claims, inventory, packaging, image rights and fulfillment before real sales.
- Which fiat gateway and customer-controlled Stellar wallet UX (extension optional, passkey/embedded provider, recovery and custody model) are acceptable?
- Which hosting, database region, CMS/CRM, privacy/consent and analytics choices meet the business requirements?

These are explicit decision gates, not missing credentials to guess. Secrets and access should be shared only through the chosen secure environment, never in chat or repository files.
