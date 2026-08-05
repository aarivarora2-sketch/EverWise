# Restore Web Stripe Subscriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the temporary one-time Stripe Payment Link with secure monthly and annual Stripe subscriptions: $7.99/month with a 3-day trial and $60/year with a 7-day trial.

**Architecture:** The React paywall receives a server-verified two-plan offer matrix and requests a server-created Stripe Checkout Session in `subscription` mode. Firebase-authenticated API routes create Checkout and Customer Portal sessions, while verified Stripe webhooks are the only source of paid access. The DigitalOcean release installs the pinned server-only Stripe SDK before health checks and activation.

**Tech Stack:** React 19, Vite, Node.js 22, Stripe SDK 22.4.0 / API 2026-02-25.clover, Firebase authentication, Node test runner, Vitest.

## Global Constraints

- Monthly: $7.99 USD per month with a 3-day trial.
- Annual: $60 USD per year with a 7-day trial.
- Product: EverWise Membership.
- Use the supplied monthly and annual Stripe Price IDs only as runtime configuration; never expose them in client output.
- Never store, log, commit, or use the live secret key pasted into chat; require a rotated replacement through encrypted runtime secrets.
- Grant web access only from verified webhook-backed `trialing` or `active` subscription state.
- Active sponsored partner members bypass the paywall; username patterns never bypass it.
- Lesson 1 remains free; incomplete Lesson 2 onward is gated; completed lessons remain replayable.

---

### Task 1: Restore the recurring web paywall

**Files:**
- Modify: `tests/paywall-billing.test.jsx`
- Modify: `tests/billing-client.test.jsx`
- Modify: `src/screens/Paywall.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `billingPlans` with exact annual/monthly amounts, intervals, and trial days.
- Produces: `onStartTrial("annual" | "monthly")`, followed by a validated `checkout.stripe.com` redirect.

- [x] Add failing tests proving a caller-supplied direct Payment Link cannot replace the recurring offers and that unavailable billing fails closed.
- [x] Run the focused Vitest tests and confirm they fail on the temporary direct-link behavior.
- [x] Remove `WEB_ONE_TIME_CHECKOUT_URL`, `checkoutUrl`, and the one-time offer branch.
- [x] Keep annual selected by default, both plan cards visible, exact trial/renewal copy, keyboard radio behavior, and the existing hosted-Checkout URL validation.
- [x] Run the focused UI tests and confirm they pass.

### Task 2: Make the recurring backend deployable

**Files:**
- Create: `server/package.json`
- Create: `server/package-lock.json`
- Modify: `tests/deploy-helper.test.js`
- Modify: `tests/deployment-secrets.test.js`
- Modify: `ops/deploy-everwise`
- Modify: `.github/workflows/deploy-digitalocean.yml`

**Interfaces:**
- Consumes: pinned Stripe SDK dependency and the existing immutable release archive.
- Produces: a release-local `server/node_modules/stripe` installed from the lockfile before activation.

- [x] Add failing archive/deployment tests requiring the server package manifest and lockfile while still rejecting uploaded `node_modules` and arbitrary server files.
- [x] Run the focused Node tests and confirm the package is incomplete under the old helper.
- [x] Add the minimal server-only manifest pinned to Stripe 22.4.0 and generate its lockfile.
- [x] Extend the exact archive allowlist and completeness checks for only the two package files.
- [x] Install production dependencies with scripts disabled and a fixed timeout, then verify the Stripe gateway import before switching the release symlink.
- [x] Package the two manifest files in the GitHub deployment workflow.
- [x] Run the focused deployment tests and confirm they pass.

### Task 3: Verify subscription and security behavior

**Files:**
- Test: `tests/billing-config.test.js`
- Test: `tests/stripe-gateway.test.js`
- Test: `tests/billing-webhook.test.js`
- Test: `tests/billing-api.test.js`
- Test: `tests/access.test.js`
- Test: `tests/settings-billing.test.jsx`

**Interfaces:**
- Consumes: encrypted runtime secret, webhook signing secret, two Price IDs, and exact HTTPS app origin.
- Produces: verified plans, subscription Checkout, webhook-backed entitlements, Customer Portal management, expiration/revocation, and sponsored suppression.

- [x] Run focused plan, Checkout, webhook, access, Settings, and sponsored-access tests.
- [x] Run all Node/UI tests, lint, production build, paywall browser layout tests, and a secret scan.
- [x] Confirm no secret value or Payment Link remains in tracked source or built assets.

### Task 4: Production handoff and deployment

**Files:**
- Runtime only: GitHub Actions secrets/variables and Stripe webhook configuration.

**Interfaces:**
- Consumes: a newly rotated live Stripe secret entered directly by the operator and an enabled live webhook endpoint.
- Produces: production subscription Checkout and webhook-backed access.

- [ ] Verify the Price objects are active recurring USD Prices with the exact amounts and intervals.
- [ ] Rotate the exposed secret, save the replacement directly as `STRIPE_SECRET_KEY`, and never disclose it in chat or logs.
- [ ] Enable the live webhook endpoint for the existing reviewed event set and save its signing secret directly as `STRIPE_WEBHOOK_SECRET`.
- [x] Verify the two Price IDs and `EVERWISE_PUBLIC_APP_ORIGIN` runtime variables.
- [ ] Show the exact push scope and obtain fresh approval before pushing.
- [ ] After approval, merge, install the matching deployment helper, deploy, and verify live paywall layout and test-mode Checkout without charging a real card.
