# Stripe Web Subscriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure browser subscriptions using Stripe-hosted Checkout and Customer Portal, with $7.99 monthly/3-day trial and $60 annual/7-day trial, while active sponsored learners always bypass billing.

**Architecture:** The existing Node API verifies Firebase identity, owns logical plan configuration, creates Stripe sessions, receives raw signature-verified webhooks, and stores a minimal atomic authorization cache under `/var/lib/everwise`. The React client never trusts redirects or Firestore subscription fields; it asks the authenticated billing API for access. Native Apple purchases remain a separate provider selected by platform.

**Tech Stack:** Node.js 22 ESM, Stripe Node SDK 22.4.0 using API `2026-02-25.clover`, Firebase bearer authentication, React 19, Vite, Vitest/Testing Library, Node test runner, oxlint, DigitalOcean/systemd deployment.

## Global Constraints

- Implement the residual hardening plan and pass its acceptance gate first.
- Collect a card in Stripe Checkout before either trial begins; automatically renew unless canceled.
- Monthly is exactly USD 799 cents every month with a 3-day trial.
- Annual is exactly USD 6000 cents every year with a 7-day trial.
- The client submits only `monthly` or `annual`; it never selects amount, currency, trial length, Price ID, customer ID, or subscription ID.
- Only Stripe statuses `trialing` and `active` grant web paid access.
- Active sponsored access takes precedence and hides/rejects Stripe controls.
- Lesson 1 stays free; completed items stay replayable.
- Stripe redirects do not grant access; only authenticated, webhook-backed server state does.
- One introductory trial per Firebase UID.
- Never store card data, payment-method objects, webhook bodies, Firebase tokens, Checkout/Portal URLs, or Stripe secrets.
- Use test mode throughout implementation. Do not create live prices, live webhooks, charges, deployments, or pushes without separate approval.

## Shared Contracts

Logical offers returned by `POST /api/billing/plans`:

```js
{
  plans: [
    { key: "annual", currency: "usd", unitAmount: 6000, interval: "year", trialDays: 7 },
    { key: "monthly", currency: "usd", unitAmount: 799, interval: "month", trialDays: 3 },
  ],
}
```

Authenticated access returned by `POST /api/billing/access`:

```js
{
  access: "full" | "none",
  status: "trialing" | "active" | "past_due" | "unpaid" |
    "incomplete" | "incomplete_expired" | "paused" | "canceled" | "none",
  plan: "monthly" | "annual" | null,
  trialEndsAt: string | null,
  currentPeriodEndsAt: string | null,
  cancelAtPeriodEnd: boolean,
  canStartTrial: boolean,
  canManage: boolean,
}
```

All API errors use `{ error: { code, message } }` with a stable allowlisted `code` and a non-sensitive learner-safe message.

---

### Task 1: Stripe configuration and gateway boundary

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `server/billingConfig.mjs`
- Create: `server/stripeGateway.mjs`
- Create: `tests/billing-config.test.js`
- Create: `tests/stripe-gateway.test.js`

**Interfaces:**
- `loadBillingConfig(env) -> { configured, appOrigin, webhookSecret, plans }`.
- `createStripeGateway({ secretKey, fetchImpl })` returns `verifyPlans`, `findOrCreateCustomer`, `createCheckoutSession`, `createPortalSession`, `listBlockingSubscriptions`, `retrieveSubscription`, `cancelSubscription`, and `constructWebhookEvent`.
- Plan constants are immutable and keyed only by `monthly`/`annual`.

- [ ] **Step 1: Install the pinned Stripe SDK**

Run: `npm install stripe@22.4.0`

Expected: only `package.json` and `package-lock.json` change; the SDK is a production dependency.

- [ ] **Step 2: Write failing configuration tests**

Assert exact plan values, HTTPS application origin normalization, missing/blank environment behavior, matching test/live modes across the secret and Price IDs, and redacted errors. `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are required only when billing is enabled; partial configuration is unhealthy.

- [ ] **Step 3: Run config tests and verify RED**

Run: `node --test tests/billing-config.test.js`

Expected: FAIL because `billingConfig.mjs` does not exist.

- [ ] **Step 4: Implement configuration parsing**

Use these environment names exactly: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_ANNUAL_PRICE_ID`, and `EVERWISE_PUBLIC_APP_ORIGIN`. Return public plan data without any secret or raw key.

- [ ] **Step 5: Write failing gateway tests**

Use an injected fake Stripe client and assert:

- SDK construction uses `{ apiVersion: "2026-02-25.clover" }`;
- `verifyPlans` retrieves both Prices and rejects mismatched currency, amount, recurring interval, inactive Price, wrong mode, or different product;
- customer lookup uses stored ID first, then searches `metadata.firebase_uid`, and creates at most one customer with that metadata;
- Checkout uses `mode: "subscription"`, `payment_method_collection: "always"`, exactly one configured Price, the server trial days only when eligible, `client_reference_id: uid`, and UID metadata on session/subscription;
- success/cancel/portal URLs are built from the configured origin only;
- returned Checkout URL begins `https://checkout.stripe.com/` and Portal URL begins `https://billing.stripe.com/`;
- blocking statuses are `trialing`, `active`, `incomplete`, and `past_due`;
- no error includes the secret key, webhook secret, customer email, or Stripe response body.

- [ ] **Step 6: Run gateway tests and verify RED**

Run: `node --test tests/stripe-gateway.test.js`

Expected: FAIL because `stripeGateway.mjs` does not exist.

- [ ] **Step 7: Implement the narrow gateway**

Keep all Stripe SDK calls in `stripeGateway.mjs`. Export normalized records only. Reject non-Stripe HTTPS URLs. For idempotent creation, pass deterministic keys scoped to UID and operation attempt; do not reuse a completed Checkout Session URL.

- [ ] **Step 8: Verify Task 1**

```bash
node --test tests/billing-config.test.js tests/stripe-gateway.test.js
npx oxlint server/billingConfig.mjs server/stripeGateway.mjs
git diff --check
```

---

### Task 2: Atomic billing authorization store

**Files:**
- Create: `server/billingStore.mjs`
- Create: `tests/billing-store.test.js`

**Interfaces:**
- `createBillingStore({ filePath = "/var/lib/everwise/billing.json", now, fsImpl })`.
- Methods: `health()`, `getByUid(uid)`, `getByCustomerId(customerId)`, `bindCustomer({ uid, customerId })`, `applySubscriptionSnapshot(snapshot)`, `hasUsedTrial(uid)`, and `recordProcessedEvent({ eventId, created })`.
- Schema: `{ version: 1, learners: Record<uid, BillingRecord>, processedEvents: Array<{ id, created }> }`.
- `BillingRecord`: `{ uid, customerId, subscriptionId, plan, status, trialUsedAt, trialEndsAt, currentPeriodEndsAt, cancelAtPeriodEnd, lastEventCreated, lastEventId, updatedAt }`.

- [ ] **Step 1: Write failing schema and authorization tests**

Cover empty initialization, strict schema validation, allowed statuses/plans, normalized ISO timestamps, `trialing`/`active` access, and `hasUsedTrial` remaining true after cancellation/deletion.

- [ ] **Step 2: Write failing durability and race tests**

Follow `partnerStore.mjs` safety patterns and assert:

- file and parent permissions are owner/service-group only;
- sibling temporary file, flush, atomic rename, directory sync, and old-file preservation on failure;
- process lock serializes concurrent writes;
- duplicate customer/subscription bindings across UIDs are rejected;
- duplicate event IDs are no-ops;
- an older `event.created` cannot overwrite a newer snapshot;
- equal timestamps use lexicographic event ID ordering;
- processed-event history is bounded to 2,000 newest entries;
- corrupt/unhealthy storage fails closed and never self-resets over recoverable data.

- [ ] **Step 3: Run store tests and verify RED**

Run: `node --test tests/billing-store.test.js`

Expected: FAIL because `billingStore.mjs` does not exist.

- [ ] **Step 4: Implement the store**

Build each saved record from an allowlist. Never serialize Stripe objects. `applySubscriptionSnapshot` must atomically update both UID and customer indexes represented by the single learner record. Deleted subscriptions normalize to `canceled`, retain `trialUsedAt`, and revoke access.

- [ ] **Step 5: Verify Task 2**

```bash
node --test tests/billing-store.test.js
npx oxlint server/billingStore.mjs tests/billing-store.test.js
git diff --check
```

---

### Task 3: Authenticated billing API

**Files:**
- Create: `server/billingApi.mjs`
- Create: `tests/billing-api.test.js`

**Interfaces:**
- `createBillingApi({ config, store, gateway, partnerStore, verifyIdToken, now })`.
- `handle({ request, response, pathname, body }) -> Promise<boolean>` returns true only for a handled billing path.
- Paths: `POST /api/billing/plans`, `/api/billing/access`, `/api/billing/checkout`, `/api/billing/portal`.

- [ ] **Step 1: Write failing route/auth tests**

Assert POST-only routing, 256 KiB JSON limit, `application/json`, Firebase bearer verification, UID-only ownership, stable error codes, no CORS widening, and no secret/customer/subscription identifiers in responses.

- [ ] **Step 2: Write failing checkout policy tests**

Prove:

- only `{ plan: "monthly" }` or `{ plan: "annual" }` is accepted and unknown keys are rejected;
- active authoritative partner membership returns `SPONSORED_ACCESS_ACTIVE` without calling Stripe;
- an existing blocking subscription returns `SUBSCRIPTION_EXISTS` with `canManage: true`;
- first subscription includes the plan trial; any UID with `trialUsedAt` gets no new trial;
- customer creation/binding happens server-side;
- a second eligibility check immediately before Checkout creation closes the concurrent-request window;
- plan verification failure returns `BILLING_NOT_CONFIGURED` and creates no session.

- [ ] **Step 3: Write failing access and portal tests**

Assert the exact shared access shape, fail-closed behavior for unhealthy store/config, Portal only for the authenticated UID's stored customer, and no Portal for a learner without billing history.

- [ ] **Step 4: Run API tests and verify RED**

Run: `node --test tests/billing-api.test.js`

Expected: FAIL because `billingApi.mjs` does not exist.

- [ ] **Step 5: Implement the API**

Reuse the existing Firebase token verifier and partner-store authoritative UID lookup. Return offers from verified server configuration. Set `Cache-Control: no-store` for every authenticated response. Convert internal/Stripe errors to the small allowlisted error contract and log only code/request ID.

- [ ] **Step 6: Verify Task 3**

```bash
node --test tests/billing-api.test.js
npx oxlint server/billingApi.mjs tests/billing-api.test.js
git diff --check
```

---

### Task 4: Raw webhook verification and server composition

**Files:**
- Create: `server/billingWebhook.mjs`
- Create: `tests/billing-webhook.test.js`
- Modify: `server.mjs`
- Create: `tests/server-billing-routing.test.js`

**Interfaces:**
- `createBillingWebhook({ config, store, gateway, logger })`.
- `handle(request, response) -> Promise<void>` consumes the raw request stream exactly once.
- Raw-body maximum: 256 KiB.

- [ ] **Step 1: Write failing signature and body tests**

Assert that the webhook:

- accepts only POST;
- collects raw bytes before any JSON parsing;
- requires `Stripe-Signature` and calls `constructWebhookEvent(rawBody, signature, webhookSecret)`;
- rejects invalid signature, malformed event, unsupported livemode, and bodies over 256 KiB;
- returns 2xx for a verified duplicate or irrelevant event so Stripe does not retry forever;
- never logs headers, body, email, metadata, secrets, or Checkout URL.

- [ ] **Step 2: Write failing lifecycle tests**

For `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, and `invoice.payment_failed`, require the handler to retrieve the current authoritative Stripe subscription and normalize it before saving. Verify duplicate/out-of-order behavior delegates to the store. `trial_will_end` may update observability only and must not alter access without retrieving current subscription state.

Add a trial race regression: if two subscriptions exist for one UID, retain the earliest non-terminal subscription, cancel the later duplicate immediately with no proration/invoice, record no access from it, and emit only a redacted duplicate code.

- [ ] **Step 3: Run webhook tests and verify RED**

Run: `node --test tests/billing-webhook.test.js`

Expected: FAIL because `billingWebhook.mjs` does not exist.

- [ ] **Step 4: Implement the webhook**

Resolve UID from the server-bound customer record first, then require matching Stripe `firebase_uid` metadata. Reject conflicting identity instead of guessing. Map Price ID back through the configured allowlist. Record event idempotency and subscription snapshot in one serialized store transaction.

- [ ] **Step 5: Write failing server routing tests**

Prove `/api/stripe/webhook` is dispatched before the general JSON reader, billing API routes receive parsed JSON after auth, unrelated partner/AI routes are unchanged, and `/healthz` adds:

```js
{
  billingConfigured: true,
  billingPlansVerified: true,
  billingStoreHealthy: true,
}
```

Health must be false for partial configuration, Price mismatch, or unhealthy storage without exposing a reason containing secrets.

- [ ] **Step 6: Compose the server**

Instantiate config, gateway, store, API, and webhook once at startup. Route the raw webhook before `readJsonBody`. Billing-disabled local development continues serving non-billing features, but Checkout/Portal fail closed with `BILLING_NOT_CONFIGURED`.

- [ ] **Step 7: Verify Task 4**

```bash
node --test tests/billing-webhook.test.js tests/server-billing-routing.test.js
npx oxlint server/billingWebhook.mjs server.mjs tests/billing-webhook.test.js tests/server-billing-routing.test.js
git diff --check
```

---

### Task 5: Browser billing client and provider-aware access resolution

**Files:**
- Create: `src/services/billingAccess.js`
- Create: `tests/billing-access-service.test.js`
- Modify: `src/utils/access.js`
- Modify: `tests/access.test.js`

**Interfaces:**
- `fetchBillingPlans(user)`, `fetchBillingAccess(user)`, `createBillingCheckout(user, plan)`, and `createBillingPortal(user)`.
- `resolveFullAccess({ sponsoredStatus, billingStatus, nativeSubscriptionStatus, platform, developmentBypass })`.
- `shouldShowSubscriptionControls({ sponsoredStatus, platform })` remains false for active sponsorship.

- [ ] **Step 1: Write failing service-contract tests**

Reuse the partner service's bounded fetch/timeout/error patterns. Assert Firebase bearer token use, POST bodies, exact response validators, `Cache-Control: no-store` expectation, timeout/abort, non-JSON errors, oversized response rejection, and learner-safe `BillingAccessError` codes.

Require Checkout URLs to use host `checkout.stripe.com` and Portal URLs to use host `billing.stripe.com`, protocol HTTPS, no username/password, and no lookalike suffix. Reject all other URLs before navigation.

- [ ] **Step 2: Run service tests and verify RED**

Run: `node --test tests/billing-access-service.test.js`

Expected: FAIL because the service does not exist.

- [ ] **Step 3: Implement the service**

Keep maximum response size and timeout constants exported for tests. Return freshly normalized allowlisted objects; never pass raw server JSON to components.

- [ ] **Step 4: Write failing access-provider tests**

Cover the complete matrix:

- sponsor `active` grants on every platform;
- browser grants only billing `trialing`/`active`;
- browser ignores legacy Firestore/native status;
- native grants only the existing Apple entitlement status;
- all unknown/unavailable statuses fail closed;
- development bypass works only under the existing explicit DEV flag;
- free/completed content remains open without full access.

- [ ] **Step 5: Implement provider-aware access**

Use `Capacitor.isNativePlatform()` only at the App/service boundary and pass a stable `platform: "web" | "native"` into the pure resolver. Do not import Capacitor inside `access.js`.

- [ ] **Step 6: Verify Task 5**

```bash
node --test tests/billing-access-service.test.js tests/access.test.js
npx oxlint src/services/billingAccess.js src/utils/access.js tests/billing-access-service.test.js tests/access.test.js
git diff --check
```

---

### Task 6: App bootstrap, Checkout return, and timed paid-access revocation

**Files:**
- Modify: `src/App.jsx`
- Create: `src/screens/BillingConfirmation.jsx`
- Create: `src/screens/BillingAccessError.jsx`
- Create: `tests/billing-client.test.jsx`

**State contract:**
- Add `billingStatus`, `billingAccess`, `billingPlans`, `billingBusy`, and `billingRecovery` owned by the authenticated UID.
- Confirmation polling schedule: immediately, then 1, 2, 3, 5, and 8 seconds; stop after 20 seconds, logout, UID change, unmount, or verified access.
- Paid/sponsored access refresh interval: 60 seconds plus existing focus/visible-entry refresh.

- [ ] **Step 1: Write failing authenticated-bootstrap tests**

Assert browser login fetches plans/access after Firebase settles; anonymous/free use does not call authenticated billing routes; stale responses for a previous UID are ignored; active sponsorship skips billing controls; billing unavailability does not erase sponsored access and fails closed for paid-only access.

- [ ] **Step 2: Write failing Checkout/return tests**

Prove:

- web `startFreeTrial(plan)` calls the billing API and assigns only a validated Stripe URL;
- native continues using `purchaseSubscription` unchanged;
- `?billing=success` grants nothing by itself, removes the query marker with `history.replaceState`, and shows `BillingConfirmation` while bounded polling runs;
- `?billing=cancel` removes the marker and returns to the paywall with a neutral message;
- success after any poll opens the requested protected item when still safe/current;
- timeout shows Retry and Manage billing, never full access;
- polling cleanup prevents updates after logout/unmount/account switch.

- [ ] **Step 3: Write failing current-screen revocation tests**

While an unfinished protected lesson/challenge/exam is open, change billing from `active` to `past_due`, `canceled`, `none`, or unavailable and assert immediate paywall/error routing. Completed and free lessons remain open. An active sponsor remains open even when billing expires.

- [ ] **Step 4: Run App billing tests and verify RED**

Run: `npx vitest run tests/billing-client.test.jsx`

Expected: all new browser billing flows FAIL against the Apple-only implementation.

- [ ] **Step 5: Integrate browser billing**

Unify protected-entry refresh so it obtains authoritative partner access first and, when not sponsored on web, authenticated billing access second. Reuse `shouldExitProtectedContent` from the residual plan. Store pending protected navigation in memory only and bind it to auth generation/UID. Never copy server billing status into Firestore as authority.

Use `window.location.assign(validatedUrl)` for hosted Checkout/Portal. Keep Apple purchase/restore behavior behind native platform checks.

- [ ] **Step 6: Implement accessible recovery screens**

`BillingConfirmation` must expose a named status region, visible progress text, Retry, Manage billing when available, and Back to free lessons. `BillingAccessError` must distinguish temporary verification failure from inactive subscription without revealing Stripe internals.

- [ ] **Step 7: Verify Task 6**

```bash
npx vitest run tests/billing-client.test.jsx tests/partner-client.test.jsx
npx oxlint src/App.jsx src/screens/BillingConfirmation.jsx src/screens/BillingAccessError.jsx tests/billing-client.test.jsx
npm run build
git diff --check
```

---

### Task 7: Browser paywall and Settings billing management

**Files:**
- Modify: `src/screens/Paywall.jsx`
- Modify: `src/screens/Settings.jsx`
- Create: `tests/paywall-billing.test.jsx`
- Create: `tests/settings-billing.test.jsx`

- [ ] **Step 1: Write failing paywall offer/copy tests**

Assert verified server offers render exactly:

- Monthly: `$7.99/month`; `3 days free, then $7.99/month unless canceled.`
- Annual: `$60/year`; `7 days free, then $60/year unless canceled.`
- Both: payment method is collected now and billing starts automatically after trial unless canceled.

Annual remains selected by default. The CTA names the selected trial. The paywall is closable back to free lessons. Do not calculate or display an inaccurate savings percentage.

- [ ] **Step 2: Write failing accessibility and layout tests**

Retain the named radiogroup, roving tab index, Arrow/Home/End navigation, at least 44px touch targets, error/status announcements, disabled busy state, and visible focus. Test desktop and 768px iPad width without horizontal overflow. Sponsored mode must render neither plan cards nor checkout buttons.

- [ ] **Step 3: Run paywall tests and verify RED**

Run: `npx vitest run tests/paywall-billing.test.jsx`

Expected: FAIL because browser mode currently says subscriptions are unavailable and prices are obsolete.

- [ ] **Step 4: Implement provider-aware Paywall**

Pass normalized offers, `platform`, and `billingAvailable` from App. Browser invokes Checkout and has no Apple Restore button. Native retains StoreKit product display/restore. Missing or unverified web offers show Retry, not hardcoded prices and not a purchase CTA.

- [ ] **Step 5: Write failing Settings tests**

Assert:

- active sponsor shows partner-provided access and no payment action;
- web billing history shows normalized status/renewal or trial end and `Manage subscription` invoking Portal;
- native continues linking to Apple management;
- no subscription offers `View plans`;
- `cancelAtPeriodEnd` says access continues through the normalized period end;
- billing failure offers Retry and does not claim the plan is active.

- [ ] **Step 6: Implement provider-aware Settings**

Remove the unconditional Apple management behavior. Pass an explicit provider/status view model from App and keep subscription identifiers out of component props.

- [ ] **Step 7: Verify Task 7**

```bash
npx vitest run tests/paywall-billing.test.jsx tests/settings-billing.test.jsx
npx oxlint src/screens/Paywall.jsx src/screens/Settings.jsx tests/paywall-billing.test.jsx tests/settings-billing.test.jsx
npm run build
git diff --check
```

---

### Task 8: Terms, Privacy, and cancellation disclosure

**Files:**
- Modify: `public/terms.html`
- Modify: `public/privacy.html`
- Modify: `tests/legal-links.test.mjs`

- [ ] **Step 1: Write failing legal regressions**

Require both approved web prices/trials, card-upfront and automatic-renewal language, cancellation before trial end, cancel-at-period-end behavior, Stripe as web processor, Customer Portal management, Apple as a separate native provider, and links to the configured Privacy/Terms destinations. Reject the obsolete `$14.99`/`$89.99` copy.

- [ ] **Step 2: Run legal tests and verify RED**

Run: `node --test tests/legal-links.test.mjs`

Expected: FAIL against Apple-only/old-price disclosure.

- [ ] **Step 3: Update legal pages**

State that EverWise stores Stripe customer/subscription identifiers and normalized billing status, but not full card numbers. Explain cancellation and access timing in plain language. Preserve the corrected private-roster disclosure from the residual plan. Do not promise refunds or tax treatment not supported by approved policy.

- [ ] **Step 4: Verify Task 8**

```bash
node --test tests/legal-links.test.mjs
git diff --check
```

---

### Task 9: DigitalOcean runtime, persistent store, and operator runbook

**Files:**
- Modify: `.github/workflows/deploy-digitalocean.yml`
- Modify: `ops/deploy-everwise`
- Modify: `tests/deploy-helper.test.js`
- Modify: `tests/deployment-secrets.test.js`
- Create: `docs/operations/stripe-web-subscriptions.md`

- [ ] **Step 1: Write failing deployment tests**

Require deployment configuration to accept exactly the existing OpenAI/ElevenLabs values plus the five billing variables. Assert strict line names/order, no command interpolation/newlines, safe file permissions, atomic rollback, redacted output, and no secrets in release archives or process arguments.

Require release archives to include `server/billingConfig.mjs`, `server/stripeGateway.mjs`, `server/billingStore.mjs`, `server/billingApi.mjs`, `server/billingWebhook.mjs`, and the production Stripe dependency. Require `/var/lib/everwise/billing.json` to remain outside versioned releases and survive rollback.

- [ ] **Step 2: Run deployment tests and verify RED**

Run: `node --test tests/deploy-helper.test.js tests/deployment-secrets.test.js`

Expected: FAIL because runtime validation and packaging do not include billing.

- [ ] **Step 3: Extend the deployment helper and workflow**

Add GitHub encrypted secrets `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`; add repository/environment variables `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_ANNUAL_PRICE_ID`, and `EVERWISE_PUBLIC_APP_ORIGIN`. The workflow must never echo secret values. Health verification requires all three billing health booleans only when the billing configuration is present.

Create the billing data directory with the same service owner/group and restrictive mode used by the partner store. Backup/restore only the runtime file during configuration rollback; never delete a pre-existing billing store.

- [ ] **Step 4: Write the exact operator runbook**

Document:

1. confirm the Stripe account is the intended EverWise account, not merely the reported `ges-it.info` label;
2. create matching test-mode monthly/annual recurring Prices or verify the supplied candidate IDs;
3. configure Customer Portal cancellation, invoices, payment methods, and plan changes;
4. enable Stripe's customer-level one-subscription limit as defense in depth;
5. create test webhook endpoint `https://everwise.dexio-games.com/api/stripe/webhook` with the listed events;
6. set GitHub secrets/variables without printing them;
7. run test-card scenarios for success, cancel, authentication, payment failure, renewal, cancellation, and duplicate delivery;
8. verify legal/business identity, branding, support contact, tax settings, and external Dexio legal pages before live mode;
9. rotate a webhook secret and roll back safely;
10. state that switching to live mode, deploying, and charging require separate approval.

- [ ] **Step 5: Verify Task 9**

```bash
node --test tests/deploy-helper.test.js tests/deployment-secrets.test.js
npm run lint
git diff --check
```

---

### Task 10: End-to-end acceptance, sandbox QA, and final review

**Files:**
- Create: `tests/billing-integration.test.js`
- Create: `docs/superpowers/qa/2026-08-03-stripe-web-subscriptions.md`

- [ ] **Step 1: Write an in-process integration test**

Start the Node server with fake Firebase verification and a fake Stripe gateway, then prove:

1. ordinary authenticated learner sees verified offers;
2. Checkout creation contains the correct plan/trial and grants nothing;
3. signed webhook updates the atomic store;
4. access becomes `full` only for `trialing`/`active`;
5. `past_due`/deleted webhook revokes access;
6. replayed/older webhook does not corrupt state;
7. active sponsored learner is refused Checkout and keeps full access;
8. a prior-trial learner resubscribes without a second trial;
9. concurrent duplicate subscription is canceled and never grants duplicate access.

- [ ] **Step 2: Run the full automated gate**

```bash
npm test
npm run lint
npm run build
git diff --check
```

Expected: all Node/UI tests, lint, and production build pass.

- [ ] **Step 3: Run secret and source-of-truth checks**

```bash
rg -n "sk_live_|sk_test_|whsec_|BEGIN PRIVATE KEY|OPENAI_API_KEY=|ELEVENLABS_API_KEY=" . --glob '!node_modules/**' --glob '!.git/**'
rg -n "subscriptionStatus" src server tests
git diff --name-only
```

Expected: no secret values. Every remaining Firestore `subscriptionStatus` use is documented as native/legacy display only and never grants browser access. Changed files match this plan plus the prior residual plan.

- [ ] **Step 4: Perform local browser QA**

Run the API and Vite app with fake/test billing dependencies. Record desktop, iPad-width, and 200% zoom evidence for free Lesson 1, gated Lesson 2, annual/monthly selection, keyboard radio behavior, screen-reader status announcements, canceled Checkout return, confirmation timeout/retry, Settings Portal action, billing revocation, and sponsored bypass. Save observations and screenshot paths in the QA document; do not commit credentials or local environment files.

- [ ] **Step 5: Perform Stripe test-mode QA only when approved test credentials are available**

Use Stripe test cards and the test webhook secret. Verify 3-day/7-day trial creation, payment-method collection, webhook access, Portal cancellation, cancel-at-period-end, payment failure, duplicate delivery, and test clock/shortened lifecycle where supported. Never use a real card or live mode. If credentials are unavailable, mark this gate explicitly unverified rather than simulating completion.

- [ ] **Step 6: Request read-only security and code review**

Use `superpowers:requesting-code-review`. The reviewer must inspect raw-body routing, Firebase ownership, Price/trial allowlisting, webhook identity/idempotency/order, trial races, duplicate subscriptions, store durability, client URL validation, source-of-truth separation, sponsor precedence, legal accuracy, deploy rollback, and secret handling. Address every supported finding and rerun Steps 2-5.

- [ ] **Step 7: Commit locally and stop before external changes**

```bash
git add package.json package-lock.json server.mjs server/billingConfig.mjs server/stripeGateway.mjs server/billingStore.mjs server/billingApi.mjs server/billingWebhook.mjs src/App.jsx src/services/billingAccess.js src/utils/access.js src/screens/Paywall.jsx src/screens/Settings.jsx src/screens/BillingConfirmation.jsx src/screens/BillingAccessError.jsx public/privacy.html public/terms.html .github/workflows/deploy-digitalocean.yml ops/deploy-everwise docs/operations/stripe-web-subscriptions.md docs/superpowers/qa/2026-08-03-stripe-web-subscriptions.md tests/billing-config.test.js tests/stripe-gateway.test.js tests/billing-store.test.js tests/billing-api.test.js tests/billing-webhook.test.js tests/server-billing-routing.test.js tests/billing-access-service.test.js tests/access.test.js tests/billing-client.test.jsx tests/paywall-billing.test.jsx tests/settings-billing.test.jsx tests/legal-links.test.mjs tests/deploy-helper.test.js tests/deployment-secrets.test.js tests/billing-integration.test.js
git commit -m "Add Stripe web subscriptions"
git status --short
```

Expected: a clean local branch with complete evidence. Do not push, merge, deploy, configure live Stripe, or provision production accounts. Follow the explicit pre-push approval protocol before any GitHub action.
