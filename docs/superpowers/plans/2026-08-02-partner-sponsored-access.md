# EverWise Partner-Sponsored Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a production-verified partner web flow that provisions exactly 500 sponsored learner accounts, collects optional minimized and pseudonymized assessment data, co-brands the experience, and never shows sponsored learners a paywall.

**Architecture:** Firebase Authentication continues to own learner email/password accounts and Firestore continues to own private profile/progress data. The existing same-origin DigitalOcean Node API verifies Firebase ID tokens and owns partner invitations, memberships, seat limits, minimized research records, branding, release receipts, and aggregate reports in an atomic persistent JSON store under `/var/lib/everwise`. React consumes that API through a focused partner-access service and keeps the current subscription rule for non-sponsored users.

**Tech Stack:** React 19, Vite 8, Firebase Authentication and Firestore, Node.js 22, built-in Node HTTP/crypto/fs modules, Node test runner, Vitest, Testing Library, jsdom, Nginx, systemd, GitHub Actions, DigitalOcean.

## Global Constraints

- A commercial partner receives exactly 500 active learner seats for a one-time $500 agreement handled outside the learner interface.
- Sponsored learners create their own Firebase email/password accounts; EverWise never receives their passwords.
- Sponsored web users never see subscription pricing, trial, restore, or payment controls.
- Public users keep Lesson 1 free and incomplete Lesson 2 onward subscription-gated.
- Optional research consent defaults off and declining it never affects sponsored access.
- Partner reports expose only aggregate consented results and suppress category breakdowns below five consenting responses.
- Invite and admin tokens use at least 32 random bytes, are stored only as SHA-256 hashes, and are never logged or committed.
- Learner and admin tokens travel in URL fragments and POST bodies, never query strings.
- Persistent partner data stays outside release folders at `/var/lib/everwise/partners.json`.
- Desktop, iPad, keyboard, screen-reader, large-text, reduced-motion, and existing mobile behavior must remain usable.
- No GitHub push occurs until the exact files and user-visible changes are presented and explicitly approved.

---

## File Responsibility Map

### Backend

- `server/firebaseTokenVerifier.mjs`: parse and cryptographically verify Firebase Secure Token JWTs.
- `server/partnerErrors.mjs`: stable partner error codes and safe HTTP status mapping.
- `server/partnerResearch.mjs`: assessment versioning, minimization, and aggregate privacy thresholds.
- `server/partnerStore.mjs`: schema validation, hashing, serialized mutations, atomic JSON persistence, membership state, release receipts, and reports.
- `server/partnerApi.mjs`: same-origin partner HTTP endpoints, body validation, authentication, and admin rate limits.
- `server.mjs`: compose existing narration/scam routes with partner routes and health flags.
- `scripts/manage-partners.mjs`: create, list, rotate, suspend, reactivate, remove disposable partners, and reconcile expired release receipts.
- `ops/deploy-everwise`: version-controlled restricted SSH deployment helper.

### Frontend

- `src/utils/partnerResearch.js`: build the minimized research snapshot from interview answers.
- `src/utils/access.js`: resolve public subscription access versus authoritative sponsored access.
- `src/utils/partnerLinks.js`: consume and scrub learner/admin fragments.
- `src/services/partnerAccess.js`: same-origin partner API client using Firebase ID tokens.
- `src/components/PartnerBrand.jsx`: reusable accessible co-brand treatment.
- `src/screens/PartnerAccessError.jsx`: invalid, full, suspended, and unavailable states.
- `src/screens/PartnerDashboard.jsx`: aggregate partner reporting and invite rotation.
- `src/App.jsx`: orchestrate invitation preview, signup claim, returning entitlement, routing, and deletion.
- `src/screens/Landing.jsx`: partner-provided free-access message.
- `src/screens/ProfileInterview.jsx`: sponsored consent step and assessment payload.
- `src/screens/PersonalPlan.jsx`: “Start learning” path for sponsored learners.
- `src/screens/Settings.jsx`: sponsored-access status and reauthenticated deletion.
- `src/index.css`: responsive partner branding, dashboard, consent, and error states.
- `public/privacy.html`: sponsored access and optional research disclosure.

### Tests

- `tests/partner-research.test.js`: age bands, minimization, and consent behavior.
- `tests/access.test.js`: public versus sponsored gating.
- `tests/partner-links.test.js`: token fragment capture and scrubbing.
- `tests/partner-store.test.js`: quota, concurrency, idempotency, rotation, release, and reporting.
- `tests/firebase-token-verifier.test.js`: JWT signature and claim validation.
- `tests/partner-api.test.js`: endpoint validation, authentication, privacy, and rate limiting.
- `tests/partner-client.test.jsx`: React onboarding, no-paywall, returning-login, deletion, and dashboard states.
- `tests/deployment-secrets.test.js`: expanded release archive and health verification contract.

---

### Task 1: Add Test Infrastructure and Pure Partner Rules

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Create: `tests/setup-dom.js`
- Create: `src/utils/partnerResearch.js`
- Create: `src/utils/access.js`
- Create: `tests/partner-research.test.js`
- Create: `tests/access.test.js`

**Interfaces:**
- Produces: `buildResearchSnapshot(interview, { consent, consentedAt })`
- Produces: `ageBand(age)`
- Produces: `resolveFullAccess({ sponsoredStatus, subscriptionStatus, developmentBypass })`
- Produces: `shouldShowSubscriptionControls({ sponsoredStatus })`

- [ ] **Step 1: Write failing research-minimization tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  ASSESSMENT_VERSION,
  ageBand,
  buildResearchSnapshot,
} from "../src/utils/partnerResearch.js";

test("ageBand minimizes exact ages", () => {
  assert.equal(ageBand(68), "60-69");
  assert.equal(ageBand(77), "70-79");
  assert.equal(ageBand(93), "90+");
});

test("research snapshot excludes direct identifiers", () => {
  const snapshot = buildResearchSnapshot(
    {
      name: "Jane",
      email: "jane@example.com",
      age: 77,
      internetUse: "Every day",
      primaryDevice: "Tablet",
      confidence: "Sometimes I need help",
      scamFrequency: "few",
      concerns: ["Suspicious links"],
      scamScenario: "Call the bank using its official number",
      aiExperience: "I’ve heard of it",
      accessibilityNeeds: ["Vision loss"],
      trustedContact: "Yes",
    },
    { consent: true, consentedAt: "2026-08-02T12:00:00.000Z" },
  );

  assert.deepEqual(snapshot, {
    assessmentVersion: ASSESSMENT_VERSION,
    consentedAt: "2026-08-02T12:00:00.000Z",
    ageBand: "70-79",
    internetUse: "Every day",
    primaryDevice: "Tablet",
    confidence: "Sometimes I need help",
    scamFrequency: "few",
    concerns: ["Suspicious links"],
    bankSafetyCategory: "safe",
    aiExperience: "I’ve heard of it",
    accessibilityNeeds: ["Vision loss"],
  });
  for (const forbidden of ["name", "email", "age", "trustedContact", "password"]) {
    assert.equal(forbidden in snapshot, false);
  }
});

test("research snapshot is omitted when consent is false", () => {
  assert.equal(buildResearchSnapshot({ age: 77 }, { consent: false }), null);
});
```

- [ ] **Step 2: Write failing access-resolution tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveFullAccess,
  shouldShowSubscriptionControls,
} from "../src/utils/access.js";

test("active sponsored users have full access without subscription controls", () => {
  assert.equal(
    resolveFullAccess({
      sponsoredStatus: "active",
      subscriptionStatus: "expired",
      developmentBypass: false,
    }),
    true,
  );
  assert.equal(
    shouldShowSubscriptionControls({
      sponsoredStatus: "active",
    }),
    false,
  );
});

test("public expired users remain gated", () => {
  assert.equal(
    resolveFullAccess({
      sponsoredStatus: "none",
      subscriptionStatus: "expired",
      developmentBypass: false,
    }),
    false,
  );
});
```

- [ ] **Step 3: Run the new tests and verify RED**

Run:

```bash
node --test tests/partner-research.test.js tests/access.test.js
```

Expected: FAIL because `partnerResearch.js` and `access.js` do not exist.

- [ ] **Step 4: Implement the pure rules**

```js
// src/utils/access.js
import { hasFullAccess } from "./subscription.js";

export function resolveFullAccess({
  sponsoredStatus,
  subscriptionStatus,
  developmentBypass = false,
}) {
  return (
    sponsoredStatus === "active" ||
    developmentBypass ||
    hasFullAccess(subscriptionStatus)
  );
}

export function shouldShowSubscriptionControls({ sponsoredStatus }) {
  return sponsoredStatus !== "active";
}
```

`partnerResearch.js` must export `ASSESSMENT_VERSION = "partner-assessment-v2"`, convert exact ages to the six approved bands, copy only allowlisted enum/array fields, normalize the bank-safety answer to `safe`, `unsafe-or-other`, or `skipped`, return `null` on opt-out, and throw `TypeError` for an invalid age or missing consent timestamp on opt-in.

- [ ] **Step 5: Add DOM test tooling**

Update `package.json`:

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:ui",
    "test:unit": "node --test tests/*.test.js tests/*.test.mjs",
    "test:ui": "vitest run --passWithNoTests"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "jsdom": "^26.1.0",
    "vitest": "^3.2.4"
  }
}
```

Create `vitest.config.js` with `environment: "jsdom"`, `setupFiles: ["./tests/setup-dom.js"]`, and include only `tests/**/*.test.jsx`. Import `@testing-library/jest-dom/vitest` from `tests/setup-dom.js`.

- [ ] **Step 6: Verify GREEN and the existing suite**

Run:

```bash
npm install --no-audit --no-fund
npm test
npm run lint
```

Expected: all existing Node tests, the new pure tests, and an empty Vitest suite pass; lint has no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.js tests/setup-dom.js src/utils/partnerResearch.js src/utils/access.js tests/partner-research.test.js tests/access.test.js
git commit -m "Add sponsored access rules"
```

---

### Task 2: Build the Atomic Partner Store

**Files:**
- Create: `server/partnerErrors.mjs`
- Create: `server/partnerResearch.mjs`
- Create: `server/partnerStore.mjs`
- Create: `tests/partner-store.test.js`

**Interfaces:**
- Consumes: research snapshot shape from Task 1
- Produces: `PartnerStoreError`
- Produces: `createPartnerStore({ filePath, now, randomBytes })`
- Produces store methods: `createPartner`, `listPartners`, `previewInvite`, `claimSeat`, `getAccess`, `beginRelease`, `cancelRelease`, `confirmRelease`, `getAdminReport`, `rotateInvite`, `rotateAdmin`, `setPartnerStatus`, `removePartner`, `reconcileMembership`, `health`

- [ ] **Step 1: Write failing schema and token tests**

Create a temporary directory per test with `mkdtemp`. Inject deterministic `now` and `randomBytes`. Assert:

```js
const created = await store.createPartner({
  partnerId: "pilot",
  name: "Community Partner",
  seatLimit: 500,
  branding: { name: "Community Partner", logoPath: null, accent: "#2F6B61" },
});
assert.match(created.inviteToken, /^[A-Za-z0-9_-]{43}$/);
assert.match(created.adminToken, /^[A-Za-z0-9_-]{43}$/);
const disk = JSON.parse(await readFile(filePath, "utf8"));
assert.equal(JSON.stringify(disk).includes(created.inviteToken), false);
assert.equal(JSON.stringify(disk).includes(created.adminToken), false);
```

- [ ] **Step 2: Write failing quota, concurrency, and idempotency tests**

Use `seatLimit: 500`, claim 499 deterministic UIDs, then issue two `Promise.allSettled` claims for the final seat. Assert exactly one succeeds, one fails with `PARTNER_FULL`, and `getAccess` for an existing UID remains idempotent. Add a separate test proving claim 501 fails.

- [ ] **Step 3: Write failing consent and report-privacy tests**

Assert opt-out membership stores no research record. Assert opt-in stores only the allowlisted snapshot. With four consenting records, report distributions equal `null` and `suppressed: true`. With five, distributions appear. Recursively scan the report and assert it contains no names, emails, raw UIDs, individual submissions, or token hashes.

- [ ] **Step 4: Write failing release lifecycle tests**

Use an injected clock to assert:

```js
const intent = await store.beginRelease({ uid: "uid-1" });
assert.equal((await store.getAccess("uid-1")).status, "active");
await store.cancelRelease({ uid: "uid-1", receipt: intent.receipt });
assert.equal((await store.getAccess("uid-1")).status, "active");

const retryIntent = await store.beginRelease({ uid: "uid-1" });
await store.confirmRelease({ receipt: retryIntent.receipt });
await store.confirmRelease({ receipt: retryIntent.receipt });
assert.equal((await store.getAccess("uid-1")).status, "none");
```

Also prove unconfirmed intent expiration returns to active, confirmed release frees a seat, expired receipts are rejected, and `reconcileMembership` can remove an owner-confirmed orphan.

- [ ] **Step 5: Run the store tests and verify RED**

Run:

```bash
node --test tests/partner-store.test.js
```

Expected: FAIL because the server modules do not exist.

- [ ] **Step 6: Implement the store**

Use this public construction boundary:

```js
export function createPartnerStore({
  filePath,
  now = () => new Date(),
  randomBytes = cryptoRandomBytes,
}) {
  return {
    createPartner,
    listPartners,
    previewInvite,
    claimSeat,
    getAccess,
    beginRelease,
    cancelRelease,
    confirmRelease,
    getAdminReport,
    rotateInvite,
    rotateAdmin,
    setPartnerStatus,
    removePartner,
    reconcileMembership,
    health,
  };
}
```

Implement `hashToken` with SHA-256 and `timingSafeEqual`. Serialize all mutations through one promise queue. Before each mutation validate schema version `1`, normalize expired pending releases, clone the current data, apply exactly one mutation, write a mode-`600` sibling temporary file, sync it, copy the prior valid file to `partners.json.backup`, and atomically rename the temporary file.

Keep confirmed receipt hashes as 24-hour tombstones so confirmation retries are idempotent. Do not store plaintext tokens or direct learner identifiers beyond internal Firebase UID membership keys.

- [ ] **Step 7: Verify GREEN and durability**

Run:

```bash
node --test tests/partner-store.test.js
npm test
git diff --check
```

Expected: quota, concurrency, privacy, release, corruption, backup, and full suite tests pass.

- [ ] **Step 8: Commit**

```bash
git add server/partnerErrors.mjs server/partnerResearch.mjs server/partnerStore.mjs tests/partner-store.test.js
git commit -m "Add atomic partner seat store"
```

---

### Task 3: Verify Firebase ID Tokens

**Files:**
- Create: `server/firebaseTokenVerifier.mjs`
- Create: `tests/firebase-token-verifier.test.js`

**Interfaces:**
- Produces: `createFirebaseTokenVerifier({ projectId, fetchImpl, now })`
- Produces verifier method: `verifyIdToken(token) -> { uid, email, authTime }`

- [ ] **Step 1: Write failing cryptographic tests**

Generate an RSA key pair inside the test. Create compact JWTs with header `{ alg: "RS256", kid: "test-key", typ: "JWT" }` and claims:

```js
{
  aud: "everwise-46cf0",
  iss: "https://securetoken.google.com/everwise-46cf0",
  sub: "firebase-uid-1",
  exp: nowSeconds + 3600,
  iat: nowSeconds - 10,
  auth_time: nowSeconds - 10,
  email: "learner@example.com",
}
```

Stub `fetchImpl` to return `{ "test-key": publicKeyPem }` and `cache-control: public, max-age=3600`. Assert valid verification returns only `uid`, `email`, and `authTime).

- [ ] **Step 2: Add failing rejection and cache tests**

Test wrong signature, unsupported algorithm, unknown `kid`, wrong issuer, wrong audience, expired token, future `iat`, future `auth_time`, blank subject, subject longer than 128 characters, malformed JWT, and a second valid verification that does not refetch certificates before cache expiry.

- [ ] **Step 3: Run and verify RED**

Run:

```bash
node --test tests/firebase-token-verifier.test.js
```

Expected: FAIL because `firebaseTokenVerifier.mjs` does not exist.

- [ ] **Step 4: Implement certificate caching and JWT verification**

Use `node:crypto` only. Decode base64url strictly, require exactly three JWT segments, parse JSON with size limits, require `RS256`, obtain the public key from:

`https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`

Verify `RSA-SHA256` over the original header and payload segments. Cache certificates until `max-age` expires, with a maximum cache lifetime of six hours and one in-flight fetch shared by concurrent verifications.

- [ ] **Step 5: Verify GREEN and commit**

```bash
node --test tests/firebase-token-verifier.test.js
npm test
git add server/firebaseTokenVerifier.mjs tests/firebase-token-verifier.test.js
git commit -m "Verify Firebase learner tokens"
```

---

### Task 4: Add the Partner HTTP API

**Files:**
- Create: `server/partnerApi.mjs`
- Create: `tests/partner-api.test.js`
- Modify: `server.mjs`

**Interfaces:**
- Consumes: `PartnerStore` from Task 2
- Consumes: `verifyIdToken` from Task 3
- Produces: `createPartnerApi({ store, verifyIdToken, now })`
- Produces handler: `handle(request, response, pathname) -> Promise<boolean>`

- [ ] **Step 1: Write failing endpoint tests**

Start an ephemeral Node HTTP server around `createPartnerApi` and a temporary store. Cover:

- `POST /api/partner/preview`;
- `POST /api/partner/claim`;
- `POST /api/partner/access`;
- `POST /api/partner/release-intent`;
- `POST /api/partner/release-cancel`;
- `POST /api/partner/release-confirm`;
- `POST /api/partner/admin/report`;
- `POST /api/partner/admin/rotate-invite`.

Assert non-POST methods return `405`, bodies above 25 KB return `413`, malformed JSON returns `400`, missing/invalid bearer tokens return `401`, invalid invite/admin tokens return generic errors without partner metadata, and stable codes match `INVALID_INVITE`, `PARTNER_FULL`, `PARTNER_SUSPENDED`, `UNAUTHENTICATED`, `INVALID_RECEIPT`, and `RATE_LIMITED`.

- [ ] **Step 2: Write failing privacy and rate-limit tests**

Issue 10 invalid admin attempts from one IP and assert the next request receives `429` for ten minutes. Issue 30 successful report requests for one token/IP in one minute and assert request 31 receives `429`. Recursively assert API JSON never includes token hashes, UID keys, emails, or individual research rows.

- [ ] **Step 3: Run and verify RED**

```bash
node --test tests/partner-api.test.js
```

Expected: FAIL because `partnerApi.mjs` does not exist.

- [ ] **Step 4: Implement the API boundary**

Use one constructor:

```js
export function createPartnerApi({ store, verifyIdToken, now = () => new Date() }) {
  return {
    async handle(request, response, pathname) {
      // Return true only when this module owns the route.
    },
  };
}
```

Resolve the client IP from `request.socket.remoteAddress`. Trust the first syntactically valid `X-Forwarded-For` address only when the direct socket address is loopback, because production Nginx is the trusted local proxy; ignore spoofed forwarded headers on non-loopback sockets. Accept invite/admin tokens only in JSON POST bodies. Accept learner authentication only from `Authorization: Bearer`. `release-confirm` is the sole learner endpoint that accepts the high-entropy, single-use release receipt without a Firebase bearer token because the Firebase user has already been deleted. Return `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff` on every response.

- [ ] **Step 5: Compose with the existing server**

Initialize the store with:

```js
const partnerStorePath =
  process.env.EVERWISE_PARTNER_STORE_PATH ||
  "/var/lib/everwise/partners.json";
```

Initialize the verifier with project ID `everwise-46cf0`. Invoke `partnerApi.handle` before the existing POST route switch. Add `partnerAccessConfigured` and `partnerStoreHealthy` to `GET /healthz` without exposing counts or partner names.

- [ ] **Step 6: Verify GREEN and existing integrations**

```bash
node --check server.mjs
node --test tests/partner-api.test.js
npm test
npm run lint
```

Expected: partner endpoints pass; narration and scam-checker tests/contracts remain unchanged.

- [ ] **Step 7: Commit**

```bash
git add server.mjs server/partnerApi.mjs tests/partner-api.test.js
git commit -m "Add sponsored partner API"
```

---

### Task 5: Add Partner Provisioning and Versioned Deployment Support

**Files:**
- Create: `scripts/manage-partners.mjs`
- Create: `tests/manage-partners.test.js`
- Create: `ops/deploy-everwise`
- Create: `tests/deploy-helper.test.js`
- Modify: `.github/workflows/deploy-digitalocean.yml`
- Modify: `tests/deployment-secrets.test.js`

**Interfaces:**
- Consumes: `createPartnerStore`
- Produces CLI commands: `create`, `list`, `rotate-invite`, `rotate-admin`, `suspend`, `reactivate`, `remove`, `reconcile-membership`
- Produces restricted remote commands: existing `configure-runtime`, `verify-runtime`, `deploy <sha>`

- [ ] **Step 1: Write failing CLI tests**

Spawn the CLI against a temporary `EVERWISE_PARTNER_STORE_PATH`. Assert `create --id community-pilot --name "Community Partner" --seats 500` prints exactly one learner URL and one admin URL, creates hashes only, and rejects token arguments. Assert `list` prints partner ID, name, status, claimed count, and limit but no token/hash. Assert rotation invalidates the old token.

- [ ] **Step 2: Implement the management CLI**

Parse explicit flags without adding a dependency. Generate tokens inside the store. Require:

- partner ID: lowercase letters, numbers, and hyphens, 3–50 characters;
- name: 2–100 characters;
- seat limit: exactly `500`; reject every other value so provisioning cannot diverge from the purchased 500-account contract;
- same-origin logo path beginning with `/partners/` or `null`;
- accent: six-digit hex passing the app's contrast validator.

`remove` must refuse a partner with memberships unless `--disposable-empty` is present and the member count is zero. `reconcile-membership` requires both partner ID and UID and prints a non-sensitive audit line.

- [ ] **Step 3: Write failing deploy-helper tests**

Test `ops/deploy-everwise` as text plus a temporary archive. Assert its archive allowlist accepts:

```text
server.mjs
server/
server/*.mjs
scripts/
scripts/manage-partners.mjs
dist/
dist/*
```

and rejects absolute paths, `..`, secrets, arbitrary scripts, `node_modules`, and partner data files. Assert it installs `/var/lib/everwise` as `www-data:www-data 750` without deleting or replacing `partners.json`.

- [ ] **Step 4: Implement the versioned helper and workflow archive**

Base `ops/deploy-everwise` on the currently installed restricted helper. Keep release rollback, API health, Nginx validation, and the existing configuration commands. Expand the deployment tar command to:

```bash
tar -czf - dist server.mjs server scripts/manage-partners.mjs |
  ssh ... "deploy ${GITHUB_SHA}"
```

Add post-deploy checks for `"partnerAccessConfigured":true` and `"partnerStoreHealthy":true`.

- [ ] **Step 5: Verify GREEN**

```bash
node --test tests/manage-partners.test.js tests/deploy-helper.test.js tests/deployment-secrets.test.js
bash -n ops/deploy-everwise
npm test
```

Expected: CLI output is secret-safe, archive contract is strict, and all deployment syntax checks pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/manage-partners.mjs tests/manage-partners.test.js ops/deploy-everwise tests/deploy-helper.test.js .github/workflows/deploy-digitalocean.yml tests/deployment-secrets.test.js
git commit -m "Provision and deploy partner access"
```

---

### Task 6: Capture Partner Links and Build the Browser API Client

**Files:**
- Create: `src/utils/partnerLinks.js`
- Create: `src/services/partnerAccess.js`
- Create: `tests/partner-links.test.js`
- Create: `tests/partner-access-service.test.js`

**Interfaces:**
- Produces: `consumePartnerFragment({ hash, replace }) -> { kind, token } | null`
- Produces client methods: `previewInvite`, `claimPartnerSeat`, `fetchPartnerAccess`, `beginPartnerRelease`, `cancelPartnerRelease`, `confirmPartnerRelease`, `fetchPartnerReport`, `rotatePartnerInvite`

- [ ] **Step 1: Write failing fragment tests**

Assert `#partner=<43-character-token>` returns `{ kind: "learner", token }`; `#partner-admin=<token>` returns `{ kind: "admin", token }`; the injected `replace` is called with pathname and search but no hash; invalid/short/multiple fragments return `null`; no token appears in thrown errors.

- [ ] **Step 2: Write failing service tests**

Inject `fetchImpl` and assert each method:

- uses `POST`;
- uses the existing same-origin API endpoint resolver;
- sends tokens only in JSON bodies;
- sends Firebase ID tokens only in `Authorization`;
- sets `Content-Type: application/json`;
- maps stable API codes to `PartnerAccessError`;
- never includes a token in the error message.

- [ ] **Step 3: Run and verify RED**

```bash
node --test tests/partner-links.test.js tests/partner-access-service.test.js
```

- [ ] **Step 4: Implement the fragment and client modules**

Use a shared request helper:

```js
async function partnerRequest(path, {
  idToken,
  body,
  fetchImpl = fetch,
} = {}) {
  const response = await fetchImpl(apiEndpoint(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  // Parse safe code/message and throw PartnerAccessError on non-2xx.
}
```

Do not persist learner/admin tokens in local storage. Keep them only in React state for the current session.

- [ ] **Step 5: Verify GREEN and commit**

```bash
node --test tests/partner-links.test.js tests/partner-access-service.test.js
npm test
git add src/utils/partnerLinks.js src/services/partnerAccess.js tests/partner-links.test.js tests/partner-access-service.test.js
git commit -m "Add partner link and API client"
```

---

### Task 7: Implement Sponsored Onboarding and Remove the Paywall

**Files:**
- Create: `src/components/PartnerBrand.jsx`
- Create: `src/screens/PartnerAccessError.jsx`
- Modify: `src/screens/Landing.jsx`
- Modify: `src/screens/ProfileInterview.jsx`
- Modify: `src/screens/PersonalPlan.jsx`
- Modify: `src/App.jsx`
- Create: `tests/partner-client.test.jsx`

**Interfaces:**
- Consumes: partner preview/client and pure access/research functions
- Produces: sponsored onboarding state `idle | previewing | ready | claiming | active | invalid | full | suspended | unavailable`
- Produces: interview payload fields `researchConsent` and `researchSnapshot`

- [ ] **Step 1: Write failing co-brand and error-state UI tests**

Render `Landing` with:

```jsx
<Landing
  partner={{ name: "Community Partner", logoPath: null, accent: "#2F6B61" }}
  onGetStarted={() => {}}
  onLogIn={() => {}}
/>
```

Assert “Everwise with Community Partner,” “Your access is provided free,” Get Started, and Log In are visible. Render `PartnerAccessError` for invalid, full, suspended, and unavailable codes and assert the approved calm copy plus Retry only for unavailable.

- [ ] **Step 2: Write failing consent-step tests**

Render sponsored `ProfileInterview`, navigate through the existing choices, and assert:

- consent appears before email/password;
- optional research is not preselected;
- learner must choose explicit yes/no;
- choosing no still permits account creation;
- choosing yes emits a minimized snapshot with no name/email/exact age;
- copy says answers are not sold and the partner receives group totals only.

- [ ] **Step 3: Write failing signup-routing tests**

Mock Firebase signup and partner client. Assert successful sponsored claim sets active entitlement and Personal Plan's button says **Start learning**. Clicking it reaches Home without rendering Paywall. Assert `PARTNER_FULL` after Firebase signup calls `deleteUser`, signs out, and shows the full-partner state.

- [ ] **Step 4: Run and verify RED**

```bash
npm run test:ui -- tests/partner-client.test.jsx
```

Expected: FAIL because partner props, components, consent, and orchestration do not exist.

- [ ] **Step 5: Implement presentational partner states**

`PartnerBrand` renders the EverWise logo, optional same-origin partner logo, and “Everwise with [name]” text. It must not rely on color alone. `PartnerAccessError` maps stable codes to the exact spec messages and keeps at least 60px primary actions.

- [ ] **Step 6: Add the sponsored consent step**

Change sponsored step IDs to include a consent step immediately before account creation. Add two large radio choices:

- “Yes, share a minimized copy to improve EverWise”
- “No, use my answers only for my personal plan”

Build the research snapshot only on yes. Keep normal public onboarding behavior unchanged.

- [ ] **Step 7: Orchestrate preview, claim, and no-paywall routing**

In `App.jsx`:

1. consume and scrub the partner fragment at startup;
2. preview before showing partner branding;
3. preserve the invite token in component state only;
4. after Firebase signup, obtain `cred.user.getIdToken(true)`;
5. claim the seat before writing the final Firestore profile;
6. mirror `accessSource: "partner"` and `partnerId` in Firestore only as an unavailable-state hint;
7. treat only the server entitlement as access authority;
8. on a definitive claim rejection delete the fresh Firebase user and sign out; on an indeterminate result keep the same UID, probe access, and retry idempotently;
9. route active sponsored users from Personal Plan to Home.

Restrict `VITE_BYPASS_SUBSCRIPTION` to `import.meta.env.DEV`.

- [ ] **Step 8: Verify GREEN, accessibility, and commit**

```bash
npm run test:ui -- tests/partner-client.test.jsx
npm test
npm run lint
npm run build
git add src/components/PartnerBrand.jsx src/screens/PartnerAccessError.jsx src/screens/Landing.jsx src/screens/ProfileInterview.jsx src/screens/PersonalPlan.jsx src/App.jsx tests/partner-client.test.jsx
git commit -m "Add sponsored learner onboarding"
```

---

### Task 8: Implement Returning Access, Settings, and Safe Deletion

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/screens/Settings.jsx`
- Modify: `src/screens/LogIn.jsx`
- Modify: `src/utils/authErrors.js`
- Modify: `tests/partner-client.test.jsx`

**Interfaces:**
- Consumes: `fetchPartnerAccess` and release lifecycle methods
- Produces: returning-login states `checking | active | none | unavailable`
- Produces: release receipt session key `everwise-partner-release-receipt`

- [ ] **Step 1: Write failing returning-login tests**

Mock a Firestore profile with `accessSource: "partner"`. Assert App waits for `fetchPartnerAccess`, grants every lesson when active, and shows Retry/Log out rather than Paywall when the service is unavailable. Assert a public profile with no entitlement retains existing gating.

- [ ] **Step 2: Write failing Settings tests**

For active sponsorship assert:

- “Full access provided by Community Partner” is visible;
- trial, plan, restore, and manage-subscription controls are absent;
- the account deletion flow asks for the current password to reauthenticate.

- [ ] **Step 3: Write failing release lifecycle tests**

Mock successful reauthentication, release intent, Firestore deletion, Firebase deletion, and release confirmation. Assert exact order. Add failures proving:

- reauthentication failure never begins release;
- Firestore/Firebase failure calls release cancellation while auth remains valid;
- confirmation network failure preserves the receipt in session storage and Retry confirms idempotently;
- successful confirmation clears the receipt.

- [ ] **Step 4: Run and verify RED**

```bash
npm run test:ui -- tests/partner-client.test.jsx
```

- [ ] **Step 5: Implement returning entitlement checks**

After profile load, call `user.getIdToken()` and `fetchPartnerAccess`. A mirrored partner profile plus API failure routes to the retry screen. A confirmed `none` response applies public subscription rules. Never convert an unavailable sponsored account into a paywall.

- [ ] **Step 6: Implement reauthenticated deletion**

Use Firebase `EmailAuthProvider.credential` and `reauthenticateWithCredential`. Require current password inside Settings only when deleting. Follow:

```text
reauthenticate
release-intent
delete Firestore profile
delete Firebase user
release-confirm
clear receipt
```

On pre-auth-deletion failures call release-cancel. On confirmation failure keep the receipt and show Retry.

- [ ] **Step 7: Verify GREEN and commit**

```bash
npm run test:ui -- tests/partner-client.test.jsx
npm test
npm run lint
npm run build
git add src/App.jsx src/screens/Settings.jsx src/screens/LogIn.jsx src/utils/authErrors.js tests/partner-client.test.jsx
git commit -m "Restore sponsored access on login"
```

---

### Task 9: Add Co-Branding, Aggregate Dashboard, and Privacy Copy

**Files:**
- Create: `src/screens/PartnerDashboard.jsx`
- Modify: `src/components/AppShell.jsx`
- Modify: `src/screens/Home.jsx`
- Modify: `src/App.jsx`
- Modify: `src/index.css`
- Modify: `public/privacy.html`
- Modify: `tests/partner-client.test.jsx`
- Modify: `tests/legal-links.test.mjs`

**Interfaces:**
- Consumes: admin token fragment and report client methods
- Produces: aggregate CSV containing only `metric,category,count,percentage`
- Produces: invite rotation UI that reveals the replacement URL once

- [ ] **Step 1: Write failing dashboard privacy tests**

Render a five-response report and assert seat counts, consent percentage, distributions, last-updated time, and partner branding appear. Generate CSV and assert its header is exactly:

```text
metric,category,count,percentage
```

Assert the DOM and CSV contain no `name`, `email`, `uid`, `password`, token hash, or individual row. Render a four-response report and assert “More responses are needed before group breakdowns can be shown.”

- [ ] **Step 2: Write failing invite-rotation and invalid-admin tests**

Assert invalid admin access renders no partner metadata. Assert rotating requires a confirmation explaining that the previous learner link will stop working, then displays the replacement link once with a Copy button.

- [ ] **Step 3: Write failing legal-copy tests**

Extend `legal-links.test.mjs` to require privacy copy covering sponsored access, optional research, aggregate partner reporting, no sale of assessment answers, deletion, and contact route.

- [ ] **Step 4: Run and verify RED**

```bash
npm run test:ui -- tests/partner-client.test.jsx
node --test tests/legal-links.test.mjs
```

- [ ] **Step 5: Implement the dashboard and persistent co-branding**

Route `partner-admin` fragments directly to `PartnerDashboard` without Firebase learner auth. Keep the token in component state only. Add partner branding to AppShell/Home as a quiet secondary line, not a replacement for EverWise identity. Validate accent contrast before using it for borders or text.

- [ ] **Step 6: Implement aggregate CSV and privacy copy**

Generate CSV from the report allowlist only, quote CSV fields correctly, and use a local Blob download. Update `public/privacy.html` with plain-language sponsored-access and optional-research sections matching the approved design.

- [ ] **Step 7: Add responsive styles**

Use the existing desktop/iPad constraints. Dashboard uses an open summary layout and tables/lists, not a dense card grid. Preserve 60px actions, visible focus, large-text wrapping, `prefers-reduced-motion`, and no horizontal overflow from 768px through 1440px.

- [ ] **Step 8: Verify GREEN and commit**

```bash
npm run test:ui -- tests/partner-client.test.jsx
node --test tests/legal-links.test.mjs
npm test
npm run lint
npm run build
git add src/screens/PartnerDashboard.jsx src/components/AppShell.jsx src/screens/Home.jsx src/App.jsx src/index.css public/privacy.html tests/partner-client.test.jsx tests/legal-links.test.mjs
git commit -m "Add partner branding and reporting"
```

---

### Task 10: Local Integration, Visual QA, and Production Readiness

**Files:**
- Modify as failures require: only files already named in Tasks 1–9
- Create: `docs/superpowers/qa/2026-08-02-partner-sponsored-access.md`

**Interfaces:**
- Consumes: complete local partner feature
- Produces: a QA ledger with requirement, evidence, result, and remediation

- [ ] **Step 1: Run the complete automated gate**

```bash
npm test
npm run lint
npm run build
node --check server.mjs
bash -n ops/deploy-everwise
git diff --check
```

Expected: zero failures. The known Vite chunk-size warning may remain only if no partner code increases the current production chunk materially; otherwise split the admin dashboard with `React.lazy`.

- [ ] **Step 2: Start isolated local services**

Use a temporary partner store and non-production ports:

```bash
partner_test_dir="$(mktemp -d /tmp/everwise-partner-test.XXXXXX)"
EVERWISE_PARTNER_STORE_PATH="$partner_test_dir/partners.json" PORT=8788 node server.mjs
VITE_EVERWISE_API_URL=http://127.0.0.1:8788 npm run dev -- --host 127.0.0.1 --port 5174
```

Provision a 500-seat local partner with `scripts/manage-partners.mjs`. Use a separate file-isolated store with `testOnlyAllowCustomSeatLimits: true` only when exercising a small capacity fixture. Do not reuse production tokens or data.

- [ ] **Step 3: Verify the learner journey in Browser/IAB**

Exercise:

1. partner invite opens and scrubs the fragment;
2. co-branding and free-access message;
3. assessment with research opt-out;
4. Firebase account creation and seat claim;
5. Personal Plan → Start learning;
6. open incomplete Lesson 2 without Paywall;
7. logout and login restore sponsored access;
8. Settings hides subscription controls;
9. deletion reauthentication and seat release.

Use disposable Firebase test accounts and delete them before ending QA.

- [ ] **Step 4: Verify reporting and the capacity state**

Create consenting disposable records through file-isolated test fixtures, verify suppression at four and aggregates at five, CSV privacy, invalid admin link, invite rotation, a small test-only full state, the exact 500/501 invariant, and seat reuse after deletion.

- [ ] **Step 5: Perform responsive and accessibility QA**

Capture implementation screenshots at:

- desktop: 1440 × 1000;
- iPad portrait: 820 × 1180;
- iPad landscape: 1180 × 820;
- narrow mobile regression: 390 × 844.

Inspect screenshots with `view_image`. Verify keyboard-only completion, visible focus, VoiceOver-readable labels, maximum app text size, browser zoom at 200%, reduced motion, and no clipped primary action or horizontal overflow.

- [ ] **Step 6: Write the QA ledger**

Create `docs/superpowers/qa/2026-08-02-partner-sponsored-access.md` with one row per success criterion from the design:

```markdown
| Requirement | Evidence | Result | Fix or residual risk |
|---|---|---|---|
| Sponsored user never sees Paywall | Browser journey screenshot and test name | Pass | None |
```

Include exact commands, screenshot paths, and any intentional deviations. Do not mark production items passed from local evidence.

- [ ] **Step 7: Commit the QA ledger**

```bash
git add docs/superpowers/qa/2026-08-02-partner-sponsored-access.md
git commit -m "Verify partner-sponsored web flow"
```

If QA finds a code defect, return to the owning task, add a failing regression test, implement the focused repair, rerun that task's verification, and commit the exact named test and source files before returning to this ledger step.

---

### Task 11: User-Approved Publish and Production Verification

**Files:**
- No new source files expected
- Production mutation: `/usr/local/sbin/deploy-everwise`
- Production data: `/var/lib/everwise/partners.json`

**Interfaces:**
- Consumes: verified branch and versioned `ops/deploy-everwise`
- Produces: merged PR, green deployment, disposable production proof, and a ready-to-provision 500-seat partner capability

- [ ] **Step 1: Perform the completion audit before requesting push approval**

Map every success criterion in the design to:

- automated test name;
- local browser evidence;
- remaining production evidence.

Run fresh:

```bash
git status --short --branch
git diff --name-status origin/main...HEAD
git diff --check origin/main...HEAD
npm test
npm run lint
npm run build
```

Scan the complete branch diff for Firebase ID tokens, invite/admin tokens, API-key literals, passwords, partner data, and release receipts.

- [ ] **Step 2: Request exact push approval**

Tell the user:

> This is what I am going to push

Then list every changed file and each user-visible behavior. Explicitly state that no partner token, Firebase account, password, assessment record, or secret file is included. Wait for explicit confirmation.

- [ ] **Step 3: Install the versioned deployment helper safely**

After approval, copy `ops/deploy-everwise` to a unique server staging path using the owner SSH key. Run remote `bash -n`, back up the installed helper to a timestamped recoverable file, install the new helper as `root:root 755`, and verify existing `verify-runtime` still succeeds before merging.

- [ ] **Step 4: Push, open a draft PR, inspect, and merge**

Push `agent/partner-sponsored-access`, open a draft PR to `main`, inspect the PR file list against the approved scope, mark it ready, and merge only the verified head SHA. Do not delete ignored secret files or user branches.

- [ ] **Step 5: Watch both production workflows**

Watch DigitalOcean and GitHub Pages runs to completion. On failure, inspect logs through `gh`, follow systematic debugging, and request renewed push approval if the corrective diff changes the confirmed scope.

- [ ] **Step 6: Provision a disposable 500-seat production partner**

Run the versioned management utility over the owner SSH session with:

```bash
/usr/local/bin/node /var/www/everwise-current/scripts/manage-partners.mjs create \
  --id codex-production-test \
  --name "EverWise Production Test" \
  --seats 500
```

Keep the printed links out of GitHub, logs, and the final response.

- [ ] **Step 7: Prove the live flow**

On `https://everwise.dexio-games.com/`, use only a few disposable Firebase accounts to verify:

1. opt-out sponsored signup;
2. no Paywall and access to incomplete Lesson 2;
3. logout/login entitlement restoration;
4. opt-in sponsored signup;
5. aggregate report privacy and suppression below five responses;
6. account deletion and seat reuse;
7. live read-aloud and scam-checker regressions.

Delete disposable accounts, confirm release receipts, and remove the empty disposable partner with `--disposable-empty`.

- [ ] **Step 8: Verify 500-seat capacity without creating 500 Firebase accounts**

Provision a temporary file-isolated partner with `seatLimit: 500`, run claims 1 through 500 and verify claim 501 is rejected. The disposable production partner proves that the production management command accepts exactly `--seats 500`; do not repeat the capacity test with real Firebase accounts. Do not create a real named partner until an organization is selected and an agreement exists.

- [ ] **Step 9: Final evidence**

Run:

```bash
npm test
npm run lint
npm run build
git status --short --branch
```

Confirm live site HTTP 200, green workflow URLs, active release SHA, partner health booleans, real sponsored login behavior, and absence of disposable data. Update the QA ledger with production evidence and commit/push that documentation only after showing the additional exact diff and receiving approval.
