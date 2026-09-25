# Payment activation

The store currently uses `PAYMENTS_MODE=demo`. Sample checkout saves an order and reward deduction without taking money or reducing physical stock. Demo rewards are separate from real rewards.

1. Use an approved Stripe merchant account supporting your business country and INR. Merchant onboarding and payment-method eligibility are controlled by Stripe.
2. In Vercel → sutra-rebind → Settings → Environment Variables, add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the canonical HTTPS `NEXT_PUBLIC_SITE_URL`. Keep secret keys server-only.
3. In Stripe, register `https://YOUR-SITE/api/webhooks/stripe` for `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed`. Use that endpoint's signing secret.
4. Start with Stripe test keys and an isolated preview database. Set `PAYMENTS_MODE=live` there to exercise Stripe (the key determines test versus real money), then redeploy.
5. Test successful, declined, cancelled and expired checkouts. Confirm order, stock, reward ledger and webhook deliveries. A redirect alone never marks an order paid.
6. After merchant and business checks, use live credentials and `PAYMENTS_MODE=live` in Production, then redeploy. Keep development in demo or provider-test mode.

No publishable key is required for hosted checkout. The implementation enables card payments; UPI is not promised. Eligible card-wallet options are controlled by Stripe.

## Implemented safeguards

Server prices, quantity validation, 25% merchandise reward cap, atomic reservations, request/Stripe idempotency keys, raw-body signature verification, session/amount/currency checks and duplicate-event protection are included. Only provider-confirmed failed/expired sessions release reservations, so a delayed webhook cannot cause overselling. Stripe's default session expiry is 24 hours. Demo trade awards never become real spendable rewards.

Monitor and retry failed webhooks in Stripe. If a network error occurs before a session ID is saved, retry the same checkout; do not manually release its reservation without checking Stripe. Paid orders with delayed webhooks remain pending until confirmation arrives. Refunds and fulfilment are manual merchant operations; no shipping carrier or automated refund service is connected.

## Business inputs

Before real orders, provide actual products, size-level stock, photos, tax/shipping treatment, returns policy, operational contact and legal business details. Replace illustrative passport/impact/sanitation records and tour dates. Remove sample wording only when true. These are business inputs, not missing checkout screens.

No transactional email provider is connected. Requests are saved at `/admin` and WhatsApp is available. Add a verified sending domain/provider for automatic email receipts or alerts.

Reference: [Stripe Checkout API](https://docs.stripe.com/api/checkout/sessions/create).
