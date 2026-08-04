# EverWise Stripe Web Subscriptions and Final Sponsored-Access Hardening

**Date:** 2026-08-03
**Status:** Approved design; implementation and live activation remain separate
**Surface:** React/Vite website and the existing DigitalOcean Node API

## 1. Objective

EverWise will sell individual website subscriptions through Stripe while preserving the existing product rule:

- the introduction and Lesson 1 are free;
- an unfinished Lesson 2 or later requires active individual subscription access or active sponsored access;
- completed lessons remain replayable;
- the 500 pre-provisioned sponsored accounts never see Stripe pricing or payment controls while their server-reported partner membership is active.

The approved offers are:

- **Monthly:** $7.99 USD per month with a 3-day free trial;
- **Annual:** $60 USD per year with a 7-day free trial.

Both trials collect a payment method at the start and convert automatically to paid subscriptions unless the customer cancels before the trial ends.

## 2. Scope

### Included

- Resolve the three residual sponsored-access review findings before billing work:
  - periodically revalidate sponsored access and immediately leave protected content when authoritative access becomes `none` or `suspended`;
  - correct the privacy disclosure about the private operator credential roster;
  - preserve enough ambiguous-claim recovery context across logout/account switching to resume safely.
- Stripe-hosted Checkout for web subscriptions.
- Stripe Billing subscription lifecycle and trials.
- Stripe Customer Portal for cancellation, plan management, invoices, billing details, and payment methods.
- A signature-verified Stripe webhook.
- Server-authoritative web subscription access.
- Monthly and annual paywall presentation for browser users.
- Stripe sandbox tests and local mocked integration tests.
- Terms and Privacy updates that distinguish website Stripe billing from native Apple billing.
- Deployment configuration and operator documentation for Stripe secrets, price identifiers, webhook configuration, and test-mode acceptance.

### Excluded

- Processing a live charge during implementation.
- Creating or changing live Stripe products or prices without separate confirmation.
- Activating a production webhook without separate confirmation.
- Pushing, merging, deploying, or provisioning the 500 production accounts without the existing explicit approval boundaries.
- Replacing native Apple In-App Purchase. Native Apple billing remains a separate platform-specific path.
- A custom card-entry form, marketplace, usage billing, family plan, coupons, or team-seat subscription product.

## 3. Chosen Approach

Use Stripe Billing with Stripe-hosted Checkout Sessions in `subscription` mode, followed by webhook-driven access and Stripe's hosted Customer Portal.

This is preferred over an embedded payment form because Stripe owns the sensitive payment UI, Strong Customer Authentication flows, localization, and payment-method handling. It is preferred over Payment Links because EverWise must bind a verified payment lifecycle to an authenticated Firebase learner and enforce lesson access automatically.

## 4. Product and Price Configuration

The server accepts only the logical plan keys `monthly` and `annual`. It maps them to server-side environment configuration:

- `STRIPE_MONTHLY_PRICE_ID`
- `STRIPE_ANNUAL_PRICE_ID`

The candidate identifiers supplied for the existing `EverWise Membership` product are:

- monthly: `price_1U0WJ9JcTf3xkVv2rYdCsFPn`
- annual: `price_1U0WJ8JcTf3xkVv2GrbGU17Z`

These identifiers are not secrets, but they are not trusted until verified in the intended Stripe account and correct mode. Test-mode price identifiers are used during development. The reported Stripe account label `ges-it.info` must be confirmed as the intended EverWise account before any live activation.

Trial durations are server constants bound to the logical plan:

- monthly: 3 days;
- annual: 7 days.

The client cannot submit a price identifier, amount, currency, or trial length. Future price changes use a new Stripe Price and an environment/configuration change; existing subscribers keep their current Stripe subscription price unless a separately approved migration changes it.

## 5. Learner Flow

1. A signed-in ordinary learner opens an unfinished Lesson 2-or-later item.
2. EverWise verifies current server-authoritative sponsored and billing access.
3. If sponsored access is active, the lesson opens and no Stripe controls appear.
4. If web subscription access is `trialing` or `active`, the lesson opens.
5. Otherwise, the website paywall appears with monthly and annual options.
6. The learner selects a plan and confirms the free-trial and renewal terms.
7. EverWise sends the Firebase ID token and logical plan key to the billing API.
8. The server verifies the learner, confirms the learner is not actively sponsored, enforces trial eligibility and duplicate-subscription rules, and creates a Stripe Checkout Session.
9. Stripe collects the payment method and creates the subscription with the server-selected 3-day or 7-day trial.
10. Stripe redirects back to an EverWise confirmation route. The redirect itself grants no access.
11. EverWise displays a bounded `Confirming subscription` state and polls the authenticated billing-access endpoint until a verified webhook-backed state is available or the attempt times out with Retry and Customer Portal guidance.
12. `trialing` or `active` opens paid lessons. Other states remain gated.

Closing or canceling Checkout returns to the paywall without changing access.

## 6. Server Components

### Billing configuration

The Node API requires:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_MONTHLY_PRICE_ID`
- `STRIPE_ANNUAL_PRICE_ID`
- a configured public application origin used to construct allowlisted success, cancel, and portal return URLs.

Secret values exist only in runtime environment configuration or approved secret storage. They are never committed, returned to the browser, included in logs, or placed in build artifacts.

### Authenticated billing routes

The API adds focused routes:

- `POST /api/billing/plans` — returns the allowlisted normalized web offer display data;
- `POST /api/billing/access` — returns the authenticated learner's normalized billing access state;
- `POST /api/billing/checkout` — accepts only `monthly` or `annual` and returns a Stripe-hosted Checkout URL;
- `POST /api/billing/portal` — returns a short-lived Stripe Customer Portal URL for the authenticated learner.

All authenticated routes verify a Firebase bearer token and return only minimum required fields. Checkout and portal URLs must be HTTPS Stripe URLs before the server returns them.

### Webhook route

`POST /api/stripe/webhook` receives the untouched raw request body, verifies `Stripe-Signature` against `STRIPE_WEBHOOK_SECRET`, and rejects invalid, oversized, stale, or malformed events. It must not pass through the general JSON body parser before signature verification.

At minimum, the handler accounts for:

- `checkout.session.completed`;
- `customer.subscription.created`;
- `customer.subscription.updated`;
- `customer.subscription.deleted`;
- `invoice.paid`;
- `invoice.payment_failed`;
- `customer.subscription.trial_will_end` where useful for status and operator visibility.

Duplicate deliveries are idempotent. Out-of-order events cannot overwrite a newer stored subscription state.

## 7. Billing Store and Authority

The Node API owns a separate atomic billing store under `/var/lib/everwise`, following the partner-store safety patterns. It records only:

- Firebase UID;
- Stripe customer ID;
- Stripe subscription ID;
- allowlisted Stripe price ID and logical plan;
- normalized subscription status;
- trial-used marker and trial dates;
- current period end and cancel-at-period-end flag;
- most recent Stripe event creation time and event ID;
- bounded processed-event identifiers for idempotency.

It never stores card numbers, bank details, payment method payloads, Checkout URLs, Firebase tokens, Stripe secrets, or full webhook bodies.

Stripe is the external billing source of truth. The server's verified webhook-backed record is the fast authorization cache used by the application. Firestore `subscriptionStatus` is no longer sufficient evidence for website access and may be retained only as non-authoritative legacy/profile display data during migration.

Website full access resolves as follows:

- authoritative sponsored status `active`: grant access and hide Stripe controls;
- otherwise billing status `trialing` or `active`: grant access;
- `past_due`, `unpaid`, `incomplete`, `incomplete_expired`, `paused`, `canceled`, deleted, missing, or unavailable: do not grant paid access.

Subscriptions canceled at period end remain `active` until Stripe reports the end of the paid period. Billing-service uncertainty fails closed for paid content and provides Retry/Portal recovery without changing sponsored authority.

## 8. Trial and Duplicate-Subscription Rules

- The introductory trial is available once per Firebase UID.
- The server records trial use when Stripe creates the first trial subscription, not merely when the learner opens the paywall.
- A prior trial user can resubscribe without another free trial.
- A learner with an active, trialing, incomplete, or past-due subscription is directed to the Customer Portal rather than creating a duplicate subscription.
- An actively sponsored learner cannot start a Stripe subscription through EverWise and is told that access is already provided.
- Stripe customer identity is bound to the Firebase UID in server storage and Stripe metadata. Browser-provided customer or subscription identifiers are never trusted.

## 9. Paywall and Settings

The web paywall keeps the existing senior-friendly layout, large touch targets, named radiogroup, roving keyboard focus, clear close action, and readable renewal disclosure.

Web copy uses the verified server offer data:

- **Monthly:** `$7.99/month`; `3 days free, then $7.99/month unless canceled`.
- **Annual:** `$60/year`; `7 days free, then $60/year unless canceled`.

The annual plan remains the default selection. Both options clearly state that a payment method is collected now and that automatic billing begins after the trial unless canceled. The paywall remains closable so the learner can return to the free course path.

Settings behavior:

- active sponsored learner: show partner-provided full access and no subscription controls;
- web subscriber: show normalized plan/status and `Manage subscription` through Stripe Customer Portal;
- native Apple subscriber: retain Apple-specific management behavior;
- no access: show `Start free trial` and open the web paywall in a browser build.

## 10. Residual Sponsored-Access Repairs

Before billing implementation, the branch receives a small reviewed repair plan:

1. Add a bounded access-refresh interval while an authenticated sponsored learner remains in the app. A refresh that returns `none` or `suspended` immediately leaves currently open protected content and routes to the appropriate gated or suspended recovery state. Focus, visibility, and protected-entry refreshes remain.
2. Update Privacy wording to explain that normal application passwords are handled by Firebase, while the specially authorized pre-provisioned pilot uses a private operator-held credential roster containing the plaintext credentials distributed to approved learners. Those passwords are not described as temporary and are not forcibly changed. The roster is not committed, placed in cloud-synced storage, or used for billing.
3. Persist a minimal, expiring ambiguous-claim recovery envelope outside transient React state, excluding passwords and tokens that should not survive. Logout/account switch can later reconstruct a safe retry from the preserved invitation reference and authoritative server state, or show a truthful non-retry recovery path if the envelope expires.

These repairs remain covered by their own regressions and must be clean before Stripe work begins.

## 11. Error Handling

- Missing Stripe configuration: billing routes return a sanitized unavailable response; the app shows Retry and does not synthesize access.
- Stripe API timeout or failure: Checkout/Portal creation fails safely with a calm retry message.
- Invalid webhook signature: reject without parsing or logging sensitive payload content.
- Duplicate webhook: acknowledge idempotently without a second mutation.
- Out-of-order webhook: retain the newer authoritative state.
- Checkout abandoned/canceled: retain prior access and return to the paywall.
- Checkout completed but webhook delayed: remain in confirmation state, poll with a finite timeout, then provide Retry and Portal recovery.
- Payment failure or non-granting status: gate incomplete paid lessons and direct the learner to the Portal.
- Billing store unavailable/corrupt: fail closed, report unhealthy service state, preserve recoverable data, and do not overwrite corruption.
- Partner service failure for a known sponsored learner: preserve the existing sponsored recovery behavior; do not fall through into Stripe checkout.

## 12. Terms, Privacy, and Customer Communication

Terms and Privacy must distinguish:

- website subscriptions processed by Stripe;
- native Apple subscriptions processed by Apple;
- automatic renewal after the disclosed trial;
- cancellation through the provider-specific management surface;
- access through the end of a paid period when cancellation is scheduled;
- Stripe receiving payment and billing information while EverWise stores only identifiers and normalized status;
- the separate private sponsored credential-roster process.

The final web paywall links to the approved public Terms and Privacy URLs. The production launch checklist verifies those pages return successful HTTPS responses and contain current Stripe disclosures.

## 13. Testing and Acceptance

### Automated server tests

- Firebase authentication required on billing routes.
- Logical plan allowlist prevents arbitrary price/trial input.
- Exact monthly and annual trial configuration.
- Payment method is collected by default at trial start.
- Sponsored learners cannot create Checkout sessions.
- One-trial-per-UID and duplicate-subscription prevention.
- Checkout/Portal URL validation.
- Raw-body webhook signature verification and body bounds.
- Webhook idempotency and out-of-order protection.
- Complete status mapping for creation, renewal, cancellation, deletion, and payment failure.
- Billing-store atomicity, permission, corruption, and concurrency behavior.
- No secrets, card data, raw webhooks, or Checkout URLs persist in the store or logs.

### Automated client tests

- Lesson 1 free and unfinished Lesson 2-or-later gated for ordinary users.
- Monthly/annual amounts, trial lengths, renewal wording, selection, and keyboard behavior.
- Checkout start, cancellation, confirmation polling, delayed webhook, and failure recovery.
- Settings management for web Stripe versus native Apple.
- Sponsored active access bypasses the paywall and hides every Stripe control.
- Removed/suspended sponsorship immediately revokes currently open protected content.
- Ambiguous-claim recovery survives the approved account-switch flow.

### Manual sandbox acceptance

- Stripe test Checkout for monthly and annual plans with a collected test card.
- 3-day and 7-day trial states.
- Successful renewal, failed payment, cancellation at period end, immediate deletion, and Customer Portal management using Stripe test mode/test clocks where available.
- Desktop and iPad browser layout, 200% zoom, keyboard navigation, screen-reader announcements, and calm error recovery.
- No real card, live charge, live webhook, or production entitlement is used.

### Full repository gate

- syntax checks;
- Node unit/integration tests;
- React UI tests;
- lint;
- production Vite build;
- diff checks and credential/artifact scan;
- final independent whole-branch review.

## 14. Deployment and Activation Boundary

Implementation may prepare deployment workflow inputs and documentation, but live activation is a separate approved operation.

Before activation, an operator must verify:

- the intended Stripe account and mode;
- the exact product and Price IDs;
- Checkout and Customer Portal branding/configuration;
- the production webhook URL, event allowlist, and signing secret;
- production application and return origins;
- Terms and Privacy availability;
- sandbox acceptance evidence;
- server billing-store permissions and health;
- sponsored bypass behavior.

No GitHub push, deployment, live webhook creation, live secret change, real charge, or production account provisioning is authorized by this design document.
