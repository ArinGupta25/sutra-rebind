# Sūtra Rebind

A working circular-fashion sample storefront: Indian streetwear, rescued denim, heirloom textiles, and a bold editorial identity.

## Included

- Six illustrated sample products, search/category/sort, sizes, size guide, 70/30 material visualizer and persistent shopping bag.
- Database-backed demo checkout, order confirmation, private browser account, rewards ledger, server prices and 25% coin redemption cap.
- Stripe hosted card checkout, signed webhooks, atomic stock reservations and idempotent order/payment handling, ready for merchant credentials.
- Garment passport with QR camera reader and manual fallback; sample codes `SR-7030-JKT` and `SR01-2024`.
- Tukda Bank estimator and trade requests, 2 kg home-pickup minimum and studio-approved rewards.
- Impact dashboard and downloadable story graphic.
- Five-city Rebind Bar, map, calendar, 30-minute appointments and double-booking prevention.
- Challenge, freelance-designer and artisan applications; artisan form in English, Hindi and Marathi.
- Contact/drop-interest forms saved in the studio dashboard; WhatsApp +91 93292 31248.
- Private studio dashboard at `/admin` for requests, trade approvals, orders and inventory.

Products, pictures, events, maker records, sanitation examples and impact figures are **samples**. Demo orders charge nothing and create no shipping commitment. Contact/notification forms save records; they do not send email or automated WhatsApp messages.

## Run locally

Use Node 24 and pnpm 11. Install with `pnpm install --frozen-lockfile`. Copy `.env.example` to `.env.local`, supply Neon `DATABASE_URL`, `AUTH_SECRET` and `ADMIN_SECRET`, then run:

```sh
pnpm db:setup
pnpm dev
```

Existing deployments already have the database and secrets configured. Do not regenerate secrets or reset the database. Setup creates the table only when missing and preserves existing records.

```sh
pnpm test
pnpm build
node scripts/verify-api.mjs
```

Integration tests target localhost:3001 unless `TEST_BASE_URL` is set, require demo mode and create labelled QA records. Keep real customer data out of development testing.

## Configure the store

See [payment activation](docs/PAYMENT-ACTIVATION.md). Hosted checkout needs no frontend card key; card details stay with Stripe.

| Content | Location |
| --- | --- |
| Products, prices, tour dates, drop cadence, WhatsApp | `src/lib/catalog.ts` |
| Product/campaign pictures | `public/images/` |
| Colours and responsive layout | `src/app/globals.css` |
| Home, product pages, visualizer | `src/components/store.tsx` |
| Passports, bank, impact | `src/components/circular.tsx` |
| Events, careers, contact | `src/components/community.tsx` |
| Policies | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` |

Stock is persisted independently in the database. Changing catalog stock does not reset stored stock; update it deliberately before a real collection launches.

## Operations

Next.js App Router, React, TypeScript, Neon Postgres, Vercel, Stripe, Zod, Radix Dialog and ZXing. Mutations lock the database state row transactionally, making coin deductions, stock reservations and bookings atomic. This is a low-volume launch/demo architecture; split state into indexed tables before high-volume operations.

Visitor accounts use signed HTTP-only browser cookies. They are private to that browser, not cross-device logins. Clearing cookies loses visitor access; the studio retains records. Studio sessions expire after one hour. Keep the studio key private; never put it in GitHub.

GitHub `main` is connected to Vercel: pushes trigger deployments. Environment changes require redeployment. Rollbacks are available in Vercel. Use separate Neon databases for development/preview and production before taking real orders; the sample setup shares one database.

See [feature coverage](docs/FEATURE-CHECKLIST.md), [verification](docs/VERIFICATION.md) and [imagery](docs/IMAGERY.md).
