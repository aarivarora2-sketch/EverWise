# Pre-provisioned Sponsored Accounts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and safely operate a resumable workflow that creates exactly 500 unique `EverWise001`-`EverWise500` learner logins, assigns each UID authoritative sponsored access, saves each learner's first-login personalization, and leaves ordinary public accounts subscription-gated.

**Architecture:** A local operator-only Node CLI owns credential generation and a private owner-readable CSV. It uses a focused Firebase Identity Toolkit client for authentication mutations and the existing EverWise partner API for capacity checks, seat claims, and access verification. The React app recognizes an authenticated sponsored UID with no Firestore profile, opens setup directly, saves the profile under that UID, and continues to derive paywall access only from the authoritative partner response.

**Tech Stack:** Node.js 22 ESM, Node `crypto` and `fs`, Firebase Identity Toolkit REST API, existing EverWise partner REST client, React 19, Firebase Auth/Firestore, Node test runner, Vitest/Testing Library, Vite, oxlint.

## Global Constraints

- Create exactly 500 separate accounts, not one shared account.
- Use usernames `EverWise001` through `EverWise500`.
- Generate a different strong password for every account.
- Do not require a password change on first login.
- A sponsored learner completes the existing short personal setup on first login.
- Save the learner's setup answers and progress to that learner's Firebase account.
- Sponsored learners bypass subscription gating for as long as their partner membership is active.
- Normal public signups continue to see the existing paywall.
- Deliver credentials in a private CSV on the operator's computer.
- Never commit or upload the credential CSV or plaintext passwords to GitHub.
- No CSV field, username pattern, local-storage value, or Firestore profile field grants sponsorship.
- Research sharing remains off for pre-provisioning.
- Creating the real production roster and pushing source code are separate explicit-confirmation actions.
- Do not add a new runtime dependency; use Node 22 platform APIs and existing project modules.

---

## File Structure

- `scripts/sponsoredRoster.mjs`: fixed roster schema, password generation, CSV encoding/decoding, private-path checks, atomic `0600` persistence, and status summaries.
- `scripts/firebaseIdentityClient.mjs`: bounded Identity Toolkit requests for project inspection, account creation, sign-in, and deletion with typed safe errors.
- `scripts/sponsoredProvisioner.mjs`: read-only preflight and idempotent account-to-seat orchestration, independent of terminal parsing.
- `scripts/provision-sponsored-accounts.mjs`: strict `preflight`, `create`, and `resume` command parsing plus redacted operator output.
- `tests/sponsored-roster.test.js`: roster identity, uniqueness, CSV, file-mode, path, symlink, and atomic-status tests.
- `tests/firebase-identity-client.test.js`: endpoint, payload validation, error classification, timeout, and redaction tests.
- `tests/sponsored-provisioner.test.js`: preflight, new account, resume, reconciliation, cleanup, stop condition, and progress-redaction tests.
- `tests/provision-sponsored-accounts.test.js`: CLI option/environment validation and no-mutation-without-confirmation tests.
- `src/App.jsx`: direct missing-profile onboarding, UID-bound persistence, and synthetic-username profile identity.
- `src/screens/ProfileInterview.jsx`: explicit existing-account mode and first-login saved-progress copy.
- `src/utils/validation.js`: existing username-to-auth-email mapping remains the single mapping contract; no format change.
- `tests/partner-client.test.jsx`: first-login setup, persistence, no second claim, retry, normal signup, and username-spoof regressions.
- `tests/access.test.js`: authoritative-access-only paywall contract.
- `.gitignore`: defense-in-depth ignore pattern for sponsored roster exports.
- `docs/operations/preprovisioned-sponsored-accounts.md`: secret-safe operator runbook with preflight, create, resume, transfer, and verification steps.

---

### Task 1: Private fixed roster and atomic CSV storage

**Files:**
- Create: `scripts/sponsoredRoster.mjs`
- Create: `tests/sponsored-roster.test.js`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `normalizeUsername()` and `usernameToAuthEmail()` from `src/utils/validation.js` only for validation tests; Node `randomBytes`, `open`, `readFile`, `rename`, `stat`, and `writeFile`.
- Produces: `SPONSORED_ACCOUNT_COUNT`, `buildSponsoredRoster({ randomBytesImpl })`, `createRosterFile({ filePath, repositoryRoot, rows })`, `readRosterFile({ filePath, repositoryRoot })`, `writeRosterFile({ filePath, rows })`, `markRosterActive(rows, accountNumber)`, and `summarizeRoster(rows)`.
- Roster row shape: `{ accountNumber: number, username: string, password: string, status: "pending" | "active" }`.

- [ ] **Step 1: Write failing fixed-roster tests**

Create tests that assert the exact public labels and internal login mapping:

```js
let state = 0x6d2b79f5;
const deterministicBytes = (size) => Buffer.from(
  Array.from({ length: size }, () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state & 0xff;
  }),
);
const rows = buildSponsoredRoster({ randomBytesImpl: deterministicBytes });

assert.equal(rows.length, 500);
assert.deepEqual(
  [rows[0].username, rows[99].username, rows[499].username],
  ["EverWise001", "EverWise100", "EverWise500"],
);
assert.equal(new Set(rows.map(({ password }) => password)).size, 500);
assert.ok(rows.every(({ status }) => status === "pending"));
assert.equal(usernameToAuthEmail(rows[0].username), "everwise001@accounts.everwise.app");
```

Also assert every generated password is at least 16 characters, contains upper-case, lower-case, number, and symbol classes, and contains none of `0O1Il,\"'` or whitespace. Inject deterministic byte buffers that differ for all 500 rows; production uses `crypto.randomBytes`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/sponsored-roster.test.js`

Expected: FAIL because `scripts/sponsoredRoster.mjs` does not exist.

- [ ] **Step 3: Implement the fixed roster generator**

Use immutable constants and a rejection-sampling password generator:

```js
export const SPONSORED_ACCOUNT_COUNT = 500;
const PASSWORD_LENGTH = 20;
const PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*-_";

export function buildSponsoredRoster({ randomBytesImpl = randomBytes } = {}) {
  const rows = [];
  const passwords = new Set();
  for (let accountNumber = 1; accountNumber <= SPONSORED_ACCOUNT_COUNT; accountNumber += 1) {
    let password;
    do password = generatePassword(randomBytesImpl, PASSWORD_LENGTH);
    while (passwords.has(password) || !hasRequiredPasswordClasses(password));
    passwords.add(password);
    rows.push({
      accountNumber,
      username: `EverWise${String(accountNumber).padStart(3, "0")}`,
      password,
      status: "pending",
    });
  }
  return rows;
}
```

Map random bytes without modulo bias: accept a byte only when it is less than `256 - (256 % PASSWORD_ALPHABET.length)`.

- [ ] **Step 4: Run fixed-roster tests and verify GREEN**

Run: `node --test tests/sponsored-roster.test.js`

Expected: all generator tests PASS.

- [ ] **Step 5: Write failing private-file and CSV tests**

Test these exact contracts:

```js
await createRosterFile({ filePath, repositoryRoot, rows });
assert.equal((await stat(filePath)).mode & 0o777, 0o600);
assert.deepEqual(await readRosterFile({ filePath, repositoryRoot }), rows);
await assert.rejects(
  createRosterFile({ filePath: join(repositoryRoot, "roster.csv"), repositoryRoot, rows }),
  /outside the repository/i,
);
```

Cover an existing destination, a destination symlink, a symlinked parent, malformed headers, duplicate usernames/passwords/account numbers, unexpected status text, fewer or more than 500 rows, CR/LF injection, and a failed atomic rename that leaves the previous file byte-identical. Assert `writeRosterFile` preserves `0600` after marking one row active.

- [ ] **Step 6: Run the private-file tests and verify RED**

Run: `node --test tests/sponsored-roster.test.js`

Expected: FAIL because CSV and file functions are not implemented.

- [ ] **Step 7: Implement validated CSV persistence**

Use the fixed header `account_number,username,password,status`. Encode every field with RFC 4180 double-quote escaping even though generated passwords exclude comma and quote. Validate all rows against the fixed 500-account identity before returning them. Resolve the repository and nearest existing output parent with `realpath`; reject output paths inside the repository or through symlinks.

For creation, open with exclusive flags and `0o600`. For updates, write a sibling temporary file using exclusive mode `0o600`, `fsync` it, rename it over the destination, then verify the destination mode. Delete only the known sibling temporary file on failure.

Add this defense-in-depth pattern to `.gitignore`:

```gitignore
everwise-sponsored-accounts*.csv
```

- [ ] **Step 8: Run Task 1 tests and commit**

Run:

```bash
node --test tests/sponsored-roster.test.js
git diff --check
git add .gitignore scripts/sponsoredRoster.mjs tests/sponsored-roster.test.js
git commit -m "Add private sponsored account roster"
```

Expected: tests PASS; only the module, test, and ignore rule are committed.

---

### Task 2: Safe Firebase Identity Toolkit client

**Files:**
- Create: `scripts/firebaseIdentityClient.mjs`
- Create: `tests/firebase-identity-client.test.js`

**Interfaces:**
- Consumes: an API key and injectable `fetchImpl`/timeout functions.
- Produces: `FirebaseIdentityError`, `createFirebaseIdentityClient({ apiKey, fetchImpl, timeoutMs })` with `getProject()`, `createAccount({ email, password })`, `signIn({ email, password })`, and `deleteAccount({ idToken })`.
- Successful account result: `{ uid: string, idToken: string }`.
- Safe error codes: `EMAIL_EXISTS`, `INVALID_LOGIN_CREDENTIALS`, `OPERATION_NOT_ALLOWED`, `RATE_LIMITED`, `INVALID_RESPONSE`, and `UNAVAILABLE`.

- [ ] **Step 1: Write failing request-contract tests**

Use an injectable fetch recorder and assert exact endpoints and bodies:

```js
const client = createFirebaseIdentityClient({ apiKey: "public-test-key", fetchImpl });
assert.deepEqual(await client.createAccount({
  email: "everwise001@accounts.everwise.app",
  password: "Example-Password-29!",
}), { uid: "firebase-uid-1", idToken: "id-token-1" });

assert.equal(request.url,
  "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=public-test-key");
assert.deepEqual(JSON.parse(request.options.body), {
  email: "everwise001@accounts.everwise.app",
  password: "Example-Password-29!",
  returnSecureToken: true,
});
```

Repeat for `accounts:signInWithPassword`, `accounts:delete`, and `projects`. Assert project results are accepted only when `{ projectId: "games-caf0e" }` is present.

- [ ] **Step 2: Run the client test and verify RED**

Run: `node --test tests/firebase-identity-client.test.js`

Expected: FAIL because the client module does not exist.

- [ ] **Step 3: Implement bounded validated requests**

Implement a private `identityRequest(path, body)` that:

```js
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);
const response = await fetchImpl(
  `https://identitytoolkit.googleapis.com/v1/${path}?key=${encodeURIComponent(apiKey)}`,
  {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: controller.signal,
  },
);
```

Read at most 25,000 response bytes. Return only allowlisted fields after type/length validation. Convert Firebase messages beginning with `EMAIL_EXISTS`, `INVALID_LOGIN_CREDENTIALS`, `EMAIL_NOT_FOUND`, `INVALID_PASSWORD`, `OPERATION_NOT_ALLOWED`, or `TOO_MANY_ATTEMPTS_TRY_LATER` to the safe codes above. Never include the response body, API key, email, password, or ID token in `FirebaseIdentityError.message`.

- [ ] **Step 4: Write and pass failure/redaction tests**

Test malformed JSON, oversized response, abort, network rejection, missing `localId`, missing `idToken`, Firebase `EMAIL_EXISTS`, invalid-login variants, rate limiting, and operation-disabled responses. For every error, assert:

```js
for (const secret of [apiKey, email, password, idToken, firebaseRawMessage]) {
  assert.equal(`${error.name}:${error.code}:${error.message}`.includes(secret), false);
}
```

Run: `node --test tests/firebase-identity-client.test.js`

Expected: all client tests PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add scripts/firebaseIdentityClient.mjs tests/firebase-identity-client.test.js
git commit -m "Add safe Firebase identity client"
```

---

### Task 3: Read-only preflight and resumable sponsorship orchestration

**Files:**
- Create: `scripts/sponsoredProvisioner.mjs`
- Create: `tests/sponsored-provisioner.test.js`

**Interfaces:**
- Consumes: the Task 1 roster functions, Task 2 Firebase client, and existing `previewInvite`, `fetchPartnerReport`, `claimPartnerSeat`, and `fetchPartnerAccess` from `src/services/partnerAccess.js`.
- Produces: `preflightSponsoredProvisioning(options)` and `provisionSponsoredRoster(options)`.
- `preflightSponsoredProvisioning` returns `{ partnerId, partnerName, firebaseProjectId, seats: { claimed: 0, available: 500, limit: 500 } }`.
- `provisionSponsoredRoster` returns `{ active: number, pending: number, failed: number }` and receives `persistRows(nextRows)` plus `onProgress({ accountNumber, username, status })` callbacks that never include passwords or tokens.

- [ ] **Step 1: Write failing preflight tests**

Inject the four partner operations and Firebase `getProject`. The happy path must verify:

```js
const result = await preflightSponsoredProvisioning({
  apiOrigin: "https://everwise.dexio-games.com",
  inviteToken,
  adminToken,
  firebaseClient,
  partnerOperations,
});
assert.deepEqual(result, {
  partnerId: "community-partner",
  partnerName: "Community Partner",
  firebaseProjectId: "games-caf0e",
  seats: { claimed: 0, available: 500, limit: 500 },
});
```

Reject HTTP origins in production, preview/report partner-ID mismatch, inactive/suspended partner, `seatAvailable: false`, any seat counts other than `0/500/500`, and any Firebase project other than `games-caf0e`. Assert the thrown messages contain none of the three environment credentials.

- [ ] **Step 2: Run the preflight test and verify RED**

Run: `node --test tests/sponsored-provisioner.test.js`

Expected: FAIL because the provisioner module does not exist.

- [ ] **Step 3: Implement the preflight**

Build the API resolver without placing tokens in URLs:

```js
const apiEndpointImpl = (path) => new URL(path, `${apiOrigin}/`).toString();
const [preview, report, project] = await Promise.all([
  partnerOperations.previewInvite({ inviteToken, apiEndpointImpl }),
  partnerOperations.fetchPartnerReport({ adminToken, apiEndpointImpl }),
  firebaseClient.getProject(),
]);
```

Validate exact shapes again at the orchestration boundary, require the same partner ID/name, and return only the redacted result.

- [ ] **Step 4: Write failing new-account and active-resume tests**

For a pending row whose sign-in returns `INVALID_LOGIN_CREDENTIALS`, assert this order:

```js
assert.deepEqual(order, [
  "firebase.signIn",
  "firebase.createAccount",
  "partner.claim",
  "roster.persist.active",
]);
```

Assert the claim receives `{ idToken, inviteToken, researchConsent: false }`, the response must be active for the preflight partner ID, and persistence occurs before progress says `active`.

For an active row, assert sign-in plus `/api/partner/access` verification occur, with no account creation and no claim.

- [ ] **Step 5: Implement the minimal row state machine**

Implement private helpers with these outcomes:

```js
async function authenticatePending(row) {
  try {
    return { ...(await firebaseClient.signIn(credentialsFor(row))), created: false };
  } catch (error) {
    if (error.code !== "INVALID_LOGIN_CREDENTIALS") throw error;
    return { ...(await firebaseClient.createAccount(credentialsFor(row))), created: true };
  }
}
```

After authentication, query authoritative access first when recovering an ambiguous claim. Treat active access for the expected partner as success. Treat `none` after a newly created account as claimable. A different partner, suspended access, malformed access, or `EMAIL_EXISTS` after failed sign-in is a terminal row conflict and stops the run with only account number/username in the safe error.

- [ ] **Step 6: Write failing reconciliation and cleanup tests**

Cover:

- claim succeeds: persist `active` exactly once;
- claim times out, access says active: persist `active`, do not delete;
- claim returns `PARTNER_FULL`, `INVALID_INVITE`, `PARTNER_SUSPENDED`, or `ALREADY_SPONSORED`: delete only when this attempt created the Firebase account;
- claim is unavailable and access is unavailable/none: leave pending and do not delete because status is ambiguous;
- an account that existed before the run is never deleted;
- persistence fails after a successful claim: leave the external account/membership intact and stop so resume can verify it;
- active-row sign-in failure stops without creating a replacement;
- progress and error output never contains password, ID token, invite token, admin token, or API key.

- [ ] **Step 7: Implement reconciliation and bounded retries**

Retry only `UNAVAILABLE`, `PARTNER_UNAVAILABLE`, HTTP 429, and HTTP 5xx failures, with at most three attempts and injectable backoff. Do not retry invalid credentials, conflicts, capacity, suspension, invalid invitation, or invalid admin. Before deleting a just-created account after a definitive claim rejection, query access once; skip deletion if access is active.

Update the in-memory row immutably and call `persistRows` after each success:

```js
const nextRows = rows.map((candidate) =>
  candidate.accountNumber === row.accountNumber
    ? { ...candidate, status: "active" }
    : candidate,
);
await persistRows(nextRows);
rows = nextRows;
```

- [ ] **Step 8: Run and commit Task 3**

```bash
node --test tests/sponsored-provisioner.test.js
git add scripts/sponsoredProvisioner.mjs tests/sponsored-provisioner.test.js
git commit -m "Add resumable sponsored provisioning"
```

Expected: all orchestration tests PASS without network access.

---

### Task 4: Strict redacted operator CLI

**Files:**
- Create: `scripts/provision-sponsored-accounts.mjs`
- Create: `tests/provision-sponsored-accounts.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: Tasks 1-3 modules and environment variables `EVERWISE_FIREBASE_WEB_API_KEY`, `EVERWISE_PARTNER_INVITE_TOKEN`, and `EVERWISE_PARTNER_ADMIN_TOKEN`.
- Produces commands `preflight`, `create`, and `resume`; exported `runSponsoredAccountsCli({ argv, env, dependencies, stdout, stderr })` for isolated tests.
- Fixed production arguments: `--api-origin https://everwise.dexio-games.com --count 500 --prefix EverWise --start 1 --end 500 --output <absolute path>`.

- [ ] **Step 1: Write failing parser and boundary tests**

Assert unknown, duplicate, `--name=value`, missing-value, relative-output, non-HTTPS origin, and values other than `500`, `EverWise`, `1`, and `500` are rejected before any dependency call. Require all three environment values without echoing them.

Assert `preflight` calls only `preflightSponsoredProvisioning`. Assert `create` and `resume` without `--confirm-production` complete the same read-only preflight and then stop before roster creation, Firebase account creation, seat claims, or file writes.

- [ ] **Step 2: Run the CLI test and verify RED**

Run: `node --test tests/provision-sponsored-accounts.test.js`

Expected: FAIL because the CLI does not exist.

- [ ] **Step 3: Implement strict parsing and the production gate**

Use a command map rather than a general-purpose parser. Secrets are environment-only and cannot be supplied as flags. Print this redacted preflight form:

```text
Production preflight passed.
Partner: Community Partner (community-partner)
Firebase project: games-caf0e
Seats: 0 claimed, 500 available, 500 total
No accounts or credential files were created.
```

For unconfirmed `create`/`resume`, add: `Re-run with --confirm-production only after reviewing this target.`

- [ ] **Step 4: Write failing create/resume tests**

For confirmed `create`, assert a new 500-row file is created before `provisionSponsoredRoster` runs and is passed as `pending`. For confirmed `resume`, assert the existing validated file is read and no passwords are regenerated. Assert both use `writeRosterFile` as `persistRows` and print only count summaries:

```text
Provisioning complete: 500 active, 0 pending, 0 failed.
Private roster saved to the approved output path.
```

Assert even a dependency error whose raw message contains every secret is converted to a safe message without those values.

- [ ] **Step 5: Implement CLI orchestration**

Create the client with the environment API key, perform preflight first, then:

```js
const rows = command === "create"
  ? buildSponsoredRoster()
  : await readRosterFile({ filePath: output, repositoryRoot });

if (command === "create") {
  await createRosterFile({ filePath: output, repositoryRoot, rows });
}

const summary = await provisionSponsoredRoster({
  rows,
  preflight,
  inviteToken,
  firebaseClient,
  partnerOperations,
  persistRows: (nextRows) => writeRosterFile({ filePath: output, rows: nextRows }),
  onProgress: ({ accountNumber, username, status }) =>
    stdout.write(`Account ${accountNumber}/500 ${username}: ${status}\n`),
});
```

Top-level errors set `process.exitCode = 1` and print only a safe error class/code plus account number/username where available.

- [ ] **Step 6: Add the package entry and pass Task 4 tests**

Add:

```json
"provision:sponsored": "node scripts/provision-sponsored-accounts.mjs"
```

Run:

```bash
node --check scripts/provision-sponsored-accounts.mjs
node --test tests/provision-sponsored-accounts.test.js
npm run lint
```

Expected: parser, mutation-gate, output-redaction, and lint checks PASS.

- [ ] **Step 7: Commit Task 4**

```bash
git add package.json scripts/provision-sponsored-accounts.mjs tests/provision-sponsored-accounts.test.js
git commit -m "Add sponsored account provisioning command"
```

---

### Task 5: Direct first-login personalization for pre-provisioned accounts

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/screens/ProfileInterview.jsx`
- Modify: `tests/partner-client.test.jsx`

**Interfaces:**
- Consumes: `authEmailToUsername(email)` from `src/utils/validation.js`, authoritative access from `fetchPartnerAccess`, and the existing `profileCompletion` operation guard.
- Produces: `ProfileInterview` prop `existingAccount: boolean`; saved pre-provisioned profile uses `{ username }` for `@accounts.everwise.app` identities and `{ email }` for real-email identities.

- [ ] **Step 1: Rewrite the missing-profile regression to fail on the required direct flow**

Update the existing test `restores server-active sponsorship after reload...` so the active sponsored user goes straight to personalization after the auth callback:

```jsx
await act(async () => mocks.authCallback(returningUser));

expect(screen.getByRole("heading", {
  name: "Let’s personalize your EverWise lessons",
})).toBeVisible();
expect(screen.queryByRole("button", { name: "Complete my profile" }))
  .not.toBeInTheDocument();
expect(screen.queryByLabelText("Username")).not.toBeInTheDocument();
expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
expect(screen.queryByLabelText("Choose a password")).not.toBeInTheDocument();
expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
```

Use `returningUser.email = "everwise001@accounts.everwise.app"`. Complete the eight-step setup and assert the `setDoc` profile contains `username: "everwise001"`, no `email`, `accessSource: "partner"`, and the authoritative partner ID. Assert no account creation and no claim.

- [ ] **Step 2: Run the focused UI test and verify RED**

Run:

```bash
npx vitest run tests/partner-client.test.jsx -t "restores server-active sponsorship"
```

Expected: FAIL because the current app first shows the missing-profile recovery screen and the old heading/copy.

- [ ] **Step 3: Implement explicit existing-account mode**

In `ProfileInterview`, replace the implicit truthiness of `existingAccountEmail` with `existingAccount = false`:

```js
const activeStepIds = partner && !existingAccount
  ? SPONSORED_STEP_IDS
  : PUBLIC_STEP_IDS;
```

When `existingAccount` is true, omit account fields and research consent, use `Finish my profile`, and render:

```jsx
<h1>Let’s personalize your EverWise lessons</h1>
<p>Your answers and lesson progress will be saved to this account.</p>
```

Do not display the synthetic Firebase email.

- [ ] **Step 4: Route an active missing-profile UID directly into setup**

In the `!snap.exists()` active-access branch, set all authoritative ownership first, then:

```js
setProfileCompletion({ user: u, entitlement: authoritativeAccess });
updatePartnerRecovery(null);
setScreen("interview");
```

Keep `missing-profile` recovery for the explicit Back action and for interrupted/retry paths. Pass `existingAccount={Boolean(profileCompletion)}` to `ProfileInterview`.

- [ ] **Step 5: Save the correct login identity under the authenticated UID**

Import `authEmailToUsername`. In `completeMissingSponsoredProfile`, derive identity without changing authentication:

```js
const authEmail = completion.user.email || "";
const username = authEmailToUsername(authEmail);
const usesUsername = username !== authEmail;
const initial = {
  name,
  ...(usesUsername ? { username } : { email: authEmail || interview.email || "" }),
  profileInterview,
  onboardingCompleted: true,
  scamsCaught: 0,
  badges: [],
  completedLessons: [],
  trialStartedAt: null,
  subscriptionStatus: "expired",
  plan: null,
  accessSource: "partner",
  partnerId: completion.entitlement.partnerId,
};
await setDoc(doc(db, "users", expectedUid), initial);
```

The UID comes only from `completion.user.uid`; no username or interview value may choose the document ID.

- [ ] **Step 6: Add and pass persistence/retry regressions**

Add tests for real-email sponsored accounts retaining `{ email }`, a first `setDoc` failure showing `Retry saving profile`, retry writing the same UID/profile without a claim, reload loading the saved profile and going home, Back returning to the recoverable completion screen, logout during setup, and account switch during setup. Keep the existing stale-operation assertions.

Run:

```bash
npx vitest run tests/partner-client.test.jsx -t "missing profile|pre-provisioned|profile write|auth timing"
```

Expected: all focused setup, retry, logout, and account-switch tests PASS.

- [ ] **Step 7: Commit Task 5**

```bash
git add src/App.jsx src/screens/ProfileInterview.jsx tests/partner-client.test.jsx
git commit -m "Personalize pre-provisioned sponsored accounts"
```

---

### Task 6: End-to-end access contracts and operator documentation

**Files:**
- Modify: `tests/access.test.js`
- Modify: `tests/partner-client.test.jsx`
- Create: `docs/operations/preprovisioned-sponsored-accounts.md`

**Interfaces:**
- Consumes: completed Tasks 1-5 and existing paywall/navigation contracts.
- Produces: explicit tests that server membership, not the username pattern, controls access; a secret-safe runbook for later authorized production use.

- [ ] **Step 1: Write the failing/confirming authoritative-access tests**

Add the pure contract:

```js
test("an EverWise roster-style username does not grant access without server sponsorship", () => {
  assert.equal(resolveFullAccess({
    username: "EverWise001",
    sponsoredStatus: "none",
    subscriptionStatus: "expired",
    developmentBypass: false,
  }), false);
});
```

Add an App-level regression with a saved profile `{ username: "everwise001", subscriptionStatus: "expired" }` and authoritative access `{ status: "none" }`. Enter the course, select an incomplete Lesson 2-or-later item, and assert the paywall appears. Repeat with authoritative active sponsorship and assert the lesson opens and Settings has no subscription controls.

- [ ] **Step 2: Run focused access tests**

Run:

```bash
node --test tests/access.test.js
npx vitest run tests/partner-client.test.jsx -t "roster-style username|authoritative sponsored"
```

Expected: the pure test PASSes already because username is not an access input; the App regression identifies any UI gap and passes after only the minimal test-harness or app correction required.

- [ ] **Step 3: Write the operator runbook**

Document these exact safe phases without example secret values:

1. Store the three credentials in the current terminal environment without placing them in shell history.
2. Choose an absolute roster path outside every Git checkout and cloud-synced folder.
3. Run `npm run provision:sponsored -- preflight ...` and compare partner ID/name, Firebase project `games-caf0e`, and seats `0/500/500`.
4. Present the redacted preflight for explicit user approval.
5. Run confirmed `create`, or `resume` only with the same existing private CSV.
6. Verify summary `500 active, 0 pending, 0 failed`.
7. Sample a small set of accounts across the range, complete setup, reload, verify saved progress and no paywall, then log out.
8. Transfer the roster through a private approved channel; never attach it to GitHub issues, commits, build artifacts, chat, or ordinary email.

Include recovery rules for interrupted runs, `EMAIL_EXISTS`, unavailable partner API, suspended partner, non-empty partner capacity, lost roster, and Firebase account deletion after a definitive failed claim. State that merging/deploying code does not create accounts.

- [ ] **Step 4: Run the complete local verification gate**

Run:

```bash
node --check scripts/sponsoredRoster.mjs
node --check scripts/firebaseIdentityClient.mjs
node --check scripts/sponsoredProvisioner.mjs
node --check scripts/provision-sponsored-accounts.mjs
npm run test:unit
npm run test:ui
npm run lint
npm run build
git diff --check
git status --short
```

Expected: all tests, lint, build, syntax, and diff checks PASS; status contains source/docs changes only and no CSV.

- [ ] **Step 5: Perform local browser QA without real account creation**

Use the existing local partner fixture and mocked/test authentication path to review the first-login experience at desktop and iPad widths. Verify setup opens directly, account fields are absent, the saved-progress copy is readable, keyboard focus remains visible, Back/Logout recovery works, active sponsorship hides paywall controls, and a non-sponsored account remains gated. Do not call production Firebase or create the real roster during this step.

- [ ] **Step 6: Commit Task 6**

```bash
git add tests/access.test.js tests/partner-client.test.jsx docs/operations/preprovisioned-sponsored-accounts.md
git commit -m "Verify sponsored roster access contracts"
```

---

### Task 7: Review, push, deploy, and production-provisioning gates

**Files:**
- Review only: all files committed by Tasks 1-6 plus the earlier sponsored-access candidate.
- Production secret output: an absolute CSV path outside the repository; never add it to Git.

**Interfaces:**
- Consumes: a green implementation branch, the approved partner identity, production Firebase project `games-caf0e`, production invite/admin tokens, deployment access, and explicit user confirmations.
- Produces: first a pushed/deployed capability, and only after a second confirmation, a private 500-account roster with authoritative active sponsorship.

- [ ] **Step 1: Review the completed implementation against the design**

Read `docs/superpowers/specs/2026-08-03-preprovisioned-sponsored-accounts-design.md` line by line. Map each acceptance criterion to a passing automated check or a still-pending production check. Search tracked changes for credential-like CSV rows, 43-character partner tokens, ID tokens, and non-test passwords. Remove any generated secret artifact from the worktree without printing it; preserve the private approved roster outside the repository if one exists.

- [ ] **Step 2: Run final verification immediately before any completion claim**

Re-run the complete Task 6 gate from a clean process. Record exact pass counts and build result. Verify `git status --short` is clean and `git log origin/main..HEAD --oneline` contains only reviewed commits.

- [ ] **Step 3: Present the GitHub push boundary and stop for approval**

List every exact file in `origin/main..HEAD`, summarize user-visible changes, state exactly: `This is what I am going to push`, and wait for explicit confirmation. Do not include ignored files or the private roster. After confirmation, use the repository's approved branch/PR/merge workflow and verify the remote commit IDs and CI/deployment result.

- [ ] **Step 4: Perform read-only production provisioning preflight**

After the deployed API is healthy, load the three production values into the local process without echoing them and run the CLI `preflight`. Confirm:

```text
Firebase project: games-caf0e
Partner status: active
Seats: 0 claimed, 500 available, 500 total
Roster target: absolute path outside repository and cloud sync
Mutation performed: no
```

If the production partner does not exist, is not the intended visible organization, is not empty, or any token is unavailable, stop and report that precise boundary. Do not rotate tokens or create a substitute partner without authorization.

- [ ] **Step 5: Present the real-account mutation boundary and stop for approval**

Show the redacted partner ID/name, Firebase project, exact username range, output location, and the consequences: 500 Firebase users plus 500 claimed partner seats. State that the passwords will remain valid until individually reset and that synthetic usernames have no email recovery. Wait for explicit confirmation specific to this production operation.

- [ ] **Step 6: Create or resume the real roster only after confirmation**

Run confirmed `create` once. If interrupted, use only confirmed `resume` with the same CSV; never regenerate passwords for an existing roster. Stop on any terminal conflict. Do not paste passwords or tokens into the task transcript.

- [ ] **Step 7: Verify production outcome without disclosing credentials**

Require CLI summary `500 active, 0 pending, 0 failed`, then use the admin report to verify `500 claimed, 0 available, 500 total`. With authorization, sample accounts `EverWise001`, `EverWise250`, and `EverWise500`: sign in, confirm direct personal setup, save it, reload, confirm saved profile/progress, confirm no paywall, and log out. Separately verify a newly created ordinary public test account still receives the paywall, then delete that disposable account through the supported app flow.

- [ ] **Step 8: Deliver the private roster and final status**

Provide the roster as a local clickable file link only in the user's private Codex workspace; do not render its contents in chat. Report implementation, automated verification, deployment, account creation, seat count, sampled browser verification, and any unverified boundaries as distinct statuses.

---

## Plan Self-Review Checklist

- Spec coverage: Tasks 1-4 cover fixed credentials, private storage, safe Firebase operations, capacity preflight, resumption, cleanup, and redaction; Tasks 5-6 cover saved first-login setup and paywall separation; Task 7 covers push, deployment, explicit production mutation, and final verification.
- Placeholder scan: all tasks specify concrete files, interfaces, commands, assertions, and stop conditions; no deferred implementation markers remain.
- Type consistency: all roster rows use `accountNumber`, `username`, `password`, and `status`; Firebase results use `uid` and `idToken`; provisioner progress excludes secrets; App completion uses the authenticated Firebase `uid` and authoritative `partnerId`.
- Security boundary: neither test execution nor code deployment creates real accounts; GitHub push and production provisioning each require separate explicit confirmation.
