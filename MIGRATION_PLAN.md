# Migration plan — prototype to ENZA marketplace

Status: planning only. No production system, domain, deployment or existing file is changed by this plan. Canonical source is `infoenzastore-cmd/enza3.mvmnt1`; `enza.in` remains the live store until its owners provide access and approve a cutover.

## Migration rule

Build the new marketplace **alongside** the Vite concept site. Keep its static preview and local Testnet demo available while a separate application proves the buyer journey. Add only new files/directories in the first implementation slice. Avoid renaming or deleting the current entry pages until a reviewed replacement and redirect map exist. Never migrate live customer/order data from screenshots or assumptions.

## What to carry forward

| Current asset | Plan |
| --- | --- |
| `index.html`, `movement.css` | Reference for ENZA wordmark, palette, typography, editorial layout and responsive behavior; translate into design tokens and accessible components. Preserve as static preview during build. |
| `demo.html`, `demo.js`, `demo.css` | Keep clearly labelled Testnet/simulation demo. Use as UX evidence for review, pending and confirmation states; do not treat server-held signing as production wallet connection. |
| `payment.js`, `test/payment.test.js` | Extract decimal-safe amount and exact Horizon reconciliation behavior into a typed payment module, then strengthen with persistent idempotency and network/source checks. Keep tests as regression inputs. |
| `server.js`, `demo-wallet.js` | Retain for isolated local demonstration only. Replace JSON-file orders and in-memory demo wallet in the new commerce runtime. |
| `blueprint.html`, `README.md`, `thesis.md`, `docs/*` | Preserve historical strategy and accurate status labels. Update links and status only during a later reviewed implementation. |
| `enza.in` | External live commerce property. Its framework, product source, API, auth, cart, Cashfree contract, fulfillment and SEO behavior are **unverified** from this repository. Audit before proposing integration or migration. |

## Stages and gates

1. **Foundation and decisions (this part).** Approve audience, first sales region/currency, scope of the first checkout, ownership of live product data, wallet UX and hosting. Inventory existing site routes and get legitimate read access if a migration is desired. Gate: owners accept architecture, data source and no-risk boundary.
2. **Design system and public shell.** Add a separate Next.js/TypeScript application with tokenized cream/earth/olive design, responsive navigation, editorial homepage, category/product/story templates and clear Shop EnZa and Experience Antidote labels. Keep the cultural offer conceptual unless there is real inventory. Gate: accessibility, mobile layouts, SEO metadata and visual review against the supplied references.
3. **Discovery with 20 placeholders.** Seed 20 explicitly non-purchasable sample records with categories, images, maker/story fields and safe copy. Add search/filter, preference quiz or guided discovery and product detail pages. Capture preferences only by consent. Gate: all 20 records render, filtering works, no placeholder claims stock or verified health/sourcing benefits.
4. **Commerce and fiat baseline.** Connect an approved inventory/order source (reuse the live store if its APIs support the required flow; otherwise persist orders in a selected database). Implement cart, server-priced checkout, shipping/tax/returns and a selected fiat gateway. Gate: real product availability, end-to-end paid order, refund/cancellation policy and idempotent fulfillment are tested in the provider's sandbox before selling.
5. **Optional Stellar Testnet USDC.** Add customer-controlled wallet path, merchant receiving account, trustline guidance, exact verified issuer, pending orders and server verification. Keep Testnet explicit. Gate: wrong network/issuer/destination/amount/memo, failed/pending tx, duplicate hash and repeated callbacks cannot mark an order paid; successful payment is confirmed from network data before fulfillment.
6. **Vendor, content and growth.** Add vendor application/qualification, admin review, editorial CMS if needed, consent-based CRM and analytics. Add dedicated search only if the catalogue and measured search quality warrant it. Gate: role permissions, data retention and event tracking are verified. Vendor payouts require a separate approval and audit design.
7. **Production rollout (separate authorization).** Choose host and region, provision DB/secrets/backups, staging domain and monitoring; run content, data, legal and security checks; plan URL redirects and canonical tags. Pilot with a limited catalogue. Move or redirect production traffic only after explicit owner approval and rollback rehearsal. No deployment is authorized by this document.

## Data and SEO migration if the live store is included

Obtain the real product schema, stock source, image rights, customer/account export rights, order status contract, shipping/tax rules, gateway integration, current URL map and analytics baseline. Map source IDs to immutable new IDs; keep price/stock authority in one system. Dry-run imports in staging, compare record counts and sample orders, then choose either API-backed coexistence or a scheduled migration. Preserve canonical product URLs where possible; prepare 301 redirects for changed paths, sitemap and structured data. Do not copy passwords or payment tokens. Existing orders remain accessible through the old system until an approved retention and support plan exists.

## Rollback and ownership

The static site and live store remain independent until cutover. During implementation, rollback is simply routing users back to the existing destination and disabling new checkout in staging. After a cutover, rollback requires a tested order and inventory reconciliation process; no dual writes without a documented owner of truth. ENZA owns catalogue claims, pricing, legal terms, fulfillment rules and vendor approval. Engineering owns code, access boundaries, migrations, monitoring and verification.

## Decisions needed before implementation

- Is the first working checkout native to the new marketplace, or a handoff to `enza.in`? Who can grant read access to its product/order APIs or source?
- Which buyer region, display/settlement currency, shipping area and tax rules come first?
- Which 20 product categories and brand assets are approved, and should placeholder cards allow only discovery or a waitlist until real stock exists?
- Which fiat gateway and customer-controlled Stellar wallet UX (extension optional, passkey/embedded provider, recovery and custody model) are acceptable?
- Which hosting, database region, CMS/CRM, privacy/consent and analytics choices meet the business requirements?

These are explicit decision gates, not missing credentials to guess. Secrets and access should be shared only through the chosen secure environment, never in chat or repository files.
