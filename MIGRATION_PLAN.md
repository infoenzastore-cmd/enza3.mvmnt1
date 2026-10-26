# Migration plan — prototype to ENZA marketplace

Status: planning only. No production system, domain, deployment or existing source file is changed by this plan. Canonical source is `infoenzastore-cmd/enza3.mvmnt1`. ENZA Movement is the new unified business; no dependency on `enza.in` is planned.

## Migration rule

Build the new marketplace **alongside** the Vite concept site. Keep its static preview and local Testnet demo available while a separate application proves the buyer journey. Add only new files/directories in the first implementation slice. Avoid renaming or deleting the current entry pages until a reviewed replacement is ready. No old-store customer or order data is assumed or required.

## What to carry forward

| Current asset | Plan |
| --- | --- |
| `index.html`, `movement.css` | Reference for ENZA wordmark, palette, typography, editorial layout and responsive behavior; translate into design tokens and accessible components. Preserve as static preview during build. |
| `demo.html`, `demo.js`, `demo.css` | Keep clearly labelled Testnet/simulation demo. Use as UX evidence for review, pending and confirmation states; do not treat server-held signing as production wallet connection. |
| `payment.js`, `test/payment.test.js` | Extract decimal-safe amount and exact Horizon reconciliation behavior into a typed payment module, then strengthen with persistent idempotency and network/source checks. Keep tests as regression inputs. |
| `server.js`, `demo-wallet.js` | Retain for isolated local demonstration only. Replace JSON-file orders and in-memory demo wallet in the new commerce runtime. |
| `blueprint.html`, `README.md`, `thesis.md`, `docs/*` | Preserve historical strategy and accurate status labels. Update links and status only during a later reviewed implementation. |
| Former `enza.in` | Outside this build. Do not link checkout to it or treat its products, accounts, payment methods or data as ENZA Movement dependencies. |

## Stages and gates

1. **Foundation and decisions (this part).** Shopper-first homepage, new-marketplace checkout and USD/USDC direction are approved. Confirm whether today's prototype should submit real Testnet payments, the first product mix, approved imagery, wallet UX and hosting. Gate: owners accept clear prototype/production boundaries.
2. **Design system and public shell.** Add a separate Next.js/TypeScript application with tokenized cream/earth/olive design, responsive navigation, editorial homepage, category/product/story templates and clear Shop EnZa and Experience Antidote labels. Keep the cultural offer conceptual unless there is real inventory. Gate: accessibility, mobile layouts, SEO metadata and visual review against the supplied references.
3. **Discovery with 20 placeholders.** Seed 20 explicitly non-purchasable sample records with categories, images, maker/story fields and safe copy. Add search/filter, preference quiz or guided discovery and product detail pages. Capture preferences only by consent. Gate: all 20 records render, filtering works, no placeholder claims stock or verified health/sourcing benefits.
4. **Commerce and payments.** Create the new marketplace's persistent catalogue/orders in a selected database once real selling begins. Implement cart, server-priced USD checkout, shipping/tax/returns and a selected fiat gateway if fiat is in launch scope. Gate: real product availability, end-to-end paid order, refund/cancellation policy and idempotent fulfillment are tested before selling.
5. **Optional Stellar Testnet USDC.** Add customer-controlled wallet path, merchant receiving account, trustline guidance, exact verified issuer, pending orders and server verification. Keep Testnet explicit. Gate: wrong network/issuer/destination/amount/memo, failed/pending tx, duplicate hash and repeated callbacks cannot mark an order paid; successful payment is confirmed from network data before fulfillment.
6. **Vendor, content and growth.** Add vendor application/qualification, admin review, editorial CMS if needed, consent-based CRM and analytics. Add dedicated search only if the catalogue and measured search quality warrant it. Gate: role permissions, data retention and event tracking are verified. Vendor payouts require a separate approval and audit design.
7. **Production rollout (separate authorization).** Choose host and region, provision DB/secrets/backups, staging domain and monitoring; run content, data, legal and security checks; plan URL redirects and canonical tags. Pilot with a limited catalogue. Move or redirect production traffic only after explicit owner approval and rollback rehearsal. No deployment is authorized by this document.

## Content and SEO launch

Create new ENZA Movement product and experience records from approved source information. Confirm image rights, prices, stock, fulfillment, shipping/tax rules and claims before enabling purchase. Give pages stable slugs, canonical URLs, sitemap, structured data and accessible metadata. If the business later wants redirects from the old domain, plan and approve them separately; they are not part of today's prototype. Never import passwords or payment tokens.

## Rollback and ownership

The current static prototype stays available while the new application is built. Rollback is returning to that preview and disabling new checkout in staging. Before any live launch, establish a tested order and inventory reconciliation process. ENZA owns catalogue claims, pricing, legal terms, fulfillment rules and vendor approval. Engineering owns code, access boundaries, migrations, monitoring and verification.

## Decisions needed before implementation

- Should today's prototype stop at cart/payment review, or submit real Stellar Testnet USDC? The new marketplace owns checkout either way.
- Which buyer region and shipping area come first? USD is the display currency; USDC is the requested digital payment denomination.
- Which 20 product categories and brand assets are approved, and should placeholder cards allow only discovery or a waitlist until real stock exists?
- Which fiat gateway and customer-controlled Stellar wallet UX (extension optional, passkey/embedded provider, recovery and custody model) are acceptable?
- Which hosting, database region, CMS/CRM, privacy/consent and analytics choices meet the business requirements?

These are explicit decision gates, not missing credentials to guess. Secrets and access should be shared only through the chosen secure environment, never in chat or repository files.
