# Verification record

Checked during implementation on 26 September 2026.

Production: https://sutra-rebind.vercel.app. GitHub push automatically created the production deployment; Vercel reported Ready. All 19 API checks also passed against the public HTTPS site, including the database, private accounts and authenticated studio actions.

- Production build completed with TypeScript validation and all routes.
- Ten business tests passed: coin cap, estimator, cadence, checkout validation, pickup/date validation, one-time reservation return, portfolio URL, demo/live wallet isolation, stock totals and verified/idempotent payment events.
- Nineteen API checks passed, including studio login, request visibility, trade approval, duplicate-approval prevention and reward persistence. Checks also cover private database account, sample checkout, retry idempotency, server price/rewards, order ownership, invalid quantity, origin checks, saved contact, pickup minimum, booking conflicts and unauthenticated admin rejection.
- Browser sample checkout completed: shacket M, ₹3,490 subtotal, 250 demo coins, ₹3,240 total. Confirmation explicitly states no payment/shipment.
- Browser contact flow returned its saved reference and dashboard explanation.
- Mobile home, product and tour pages checked at 390-pixel viewport with no horizontal overflow. Calendar next-month and event selection correctly updated the booking form. Sample passport rendered its QR code and lineage.

Stripe credentials were not supplied. An actual hosted Stripe session, card transaction and external webhook delivery have not been executed. State handling has local tests; complete sandbox verification when credentials are supplied. Camera hardware permission/scanning is user-dependent; manual passport lookup is available. No email or WhatsApp delivery service is connected.
