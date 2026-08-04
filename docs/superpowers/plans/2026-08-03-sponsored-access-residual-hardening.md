# Sponsored Access Residual Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the three remaining sponsored-access review findings before Stripe billing work begins: bounded membership revalidation with immediate protected-content ejection, accurate private-roster disclosure, and UID-bound ambiguous-claim recovery that survives account switching safely.

**Architecture:** Keep the server authoritative for sponsored status. Add a pure route-access decision, invoke it from the existing guarded refresh path on focus, visibility, and a 60-second timer, and fail closed only for protected unfinished content. Persist only the minimum retry state for an ambiguous seat claim in `sessionStorage`, validate it strictly, bind it to a Firebase UID, and expire it after 15 minutes. Update the legal copy to distinguish ordinary Firebase passwords from operator-held pre-provisioned credentials.

**Tech Stack:** React 19, Firebase Auth/Firestore, browser `sessionStorage`, Vitest/Testing Library, Node test runner, Vite, oxlint.

## Global Constraints

- Preserve the exact-500 sponsored-account contract and the server as sponsorship authority.
- Preserve Lesson 1 as free and completed lessons as replayable.
- A `none` or `suspended` refresh must close an unfinished protected lesson, challenge, or exam immediately.
- A `none` refresh routes an otherwise ordinary learner to the subscription paywall; `suspended` routes to the authenticated partner error with Log out.
- Keep the existing auth-generation, UID, and newest-refresh race guards.
- Never persist a password, Firebase ID token, credential, or unbounded server response in recovery storage.
- Recovery applies only to the same Firebase UID and expires exactly 15 minutes after creation.
- Do not push, deploy, provision accounts, or begin Stripe work until all three tasks and the final review pass.

---

### Task 1: Bounded sponsored-access refresh and immediate ejection

**Files:**
- Modify: `src/utils/access.js`
- Modify: `tests/access.test.js`
- Modify: `src/App.jsx`
- Modify: `tests/partner-client.test.jsx`

**Interfaces:**
- Add `shouldExitProtectedContent({ screen, itemId, completedIds, fullAccess }) -> boolean` to `src/utils/access.js`.
- Add `PARTNER_ACCESS_REFRESH_INTERVAL_MS = 60_000` next to the existing partner storage constants in `src/App.jsx`.
- Keep `refreshAuthoritativePartnerAccess() -> Promise<{ status: "active" | "none" | "suspended", ... } | null>` as the only refresh entry point.

- [ ] **Step 1: Write failing pure access tests**

Add table-driven tests proving that unfinished `lesson`, `challenge`, and `exam` screens exit when access is false; completed items, the free `welcome`/`internet` lessons, and non-player screens do not.

```js
assert.equal(shouldExitProtectedContent({
  screen: "lesson",
  itemId: "devices",
  completedIds: [],
  fullAccess: false,
}), true);
assert.equal(shouldExitProtectedContent({
  screen: "lesson",
  itemId: "internet",
  completedIds: [],
  fullAccess: false,
}), false);
assert.equal(shouldExitProtectedContent({
  screen: "challenge",
  itemId: "challenge-1",
  completedIds: ["challenge-1"],
  fullAccess: false,
}), false);
```

- [ ] **Step 2: Run the access test and verify RED**

Run: `node --test tests/access.test.js`

Expected: FAIL because `shouldExitProtectedContent` is not exported.

- [ ] **Step 3: Implement the pure decision**

For `lesson`, delegate to `canOpenLesson`. For `challenge` and `exam`, exit only when the item is unfinished and `fullAccess` is false. Return false for missing item IDs and all other screens.

- [ ] **Step 4: Write failing App timer and revocation regressions**

In `tests/partner-client.test.jsx`, use fake timers and a deferred `fetchPartnerAccess` result to prove:

1. active sponsored access is revalidated after exactly 60,000 ms;
2. only one interval exists and it is cleared after logout/unmount;
3. `none` while an unfinished protected lesson is open renders the normal subscription paywall;
4. `none` does not eject a completed lesson or free Lesson 1;
5. `suspended` while a protected lesson/challenge/exam is open renders `PARTNER_SUSPENDED` with Log out;
6. an older timer response cannot overwrite a newer focus response;
7. a response for the previous UID cannot affect the next signed-in account.

- [ ] **Step 5: Run the App regressions and verify RED**

Run: `npx vitest run tests/partner-client.test.jsx`

Expected: timer/ejection tests FAIL against the current focus-only behavior.

- [ ] **Step 6: Add the timer and central revocation routing**

Extend the existing `sponsoredActive` effect with `window.setInterval(refresh, PARTNER_ACCESS_REFRESH_INTERVAL_MS)` and clear it in cleanup. After an authoritative result passes all existing refresh/generation/UID guards, compute current access and call the pure helper using the current `screen` and active item ID. If ejection is required:

- `suspended`: keep the authenticated partner owner, set `partnerStatus` to `suspended`, and set `screen` to `partner-error`;
- `none`: clear authoritative partner state, set paywall variant to `subscribe`, and set `screen` to `paywall`.

Do not eject on transport failure; retain the existing `returning-access` retry state, which already fails closed for future protected-entry attempts.

- [ ] **Step 7: Verify Task 1**

Run:

```bash
node --test tests/access.test.js
npx vitest run tests/partner-client.test.jsx
npx oxlint src/utils/access.js src/App.jsx tests/access.test.js tests/partner-client.test.jsx
git diff --check
```

Expected: all focused tests and lint pass.

---

### Task 2: Accurate password and roster privacy disclosure

**Files:**
- Modify: `public/privacy.html`
- Modify: `tests/legal-links.test.mjs`

- [ ] **Step 1: Write a failing legal-copy regression**

Require the privacy page to state all of these facts:

- ordinary learner passwords are handled by Firebase and are not visible to EverWise;
- the operator-generated pre-provisioned roster contains plaintext usernames and passwords for private distribution;
- that roster is kept outside GitHub, cloud-synced storage, and cloud deployment artifacts with owner-only local access;
- pre-provisioned credentials are not temporary and users are not forced to change them.

Also reject the current absolute assertion that plaintext passwords are never stored or visible to EverWise.

- [ ] **Step 2: Run the legal test and verify RED**

Run: `node --test tests/legal-links.test.mjs`

Expected: FAIL because the current disclosure contradicts the roster design.

- [ ] **Step 3: Replace the inaccurate paragraph**

Use plain-language copy suitable for older adults. Keep the statement narrowly scoped: Firebase handles normal account passwords, while a private operator roster necessarily contains the 500 pre-provisioned distribution credentials. Do not imply those credentials are uploaded to the partner, GitHub, Firebase profile data, or the DigitalOcean release.

- [ ] **Step 4: Verify Task 2**

Run:

```bash
node --test tests/legal-links.test.mjs
git diff --check
```

Expected: all legal-link and disclosure tests pass.

---

### Task 3: Durable UID-bound ambiguous-claim recovery

**Files:**
- Create: `src/utils/partnerClaimRecovery.js`
- Create: `tests/partner-claim-recovery.test.js`
- Modify: `src/App.jsx`
- Modify: `tests/partner-client.test.jsx`

**Interfaces:**
- Storage key: `everwise-partner-claim-recovery`.
- TTL: `PARTNER_CLAIM_RECOVERY_TTL_MS = 15 * 60 * 1000`.
- Export `storePartnerClaimRecovery({ storage, now, uid, inviteToken, partner, profileBase, research })`.
- Export `readPartnerClaimRecovery({ storage, now, uid })`.
- Export `clearPartnerClaimRecovery({ storage, expectedUid })`.
- Persisted shape: `{ version: 1, uid, createdAt, expiresAt, inviteToken, partner, profileBase, research }`.

The validator accepts only own-object values with exactly those top-level keys. It requires:

- `uid`: non-empty string of at most 128 characters;
- `createdAt` and `expiresAt`: finite integer epoch milliseconds, with `expiresAt - createdAt === 900000`;
- `inviteToken`: the same token syntax and maximum length accepted by `previewInvite`/`claimPartnerSeat`;
- `partner`: only the normalized preview fields already rendered by the client (`name`, optional same-origin `logoPath`) with strings bounded to the partner client limits;
- `profileBase`: only the profile fields already supplied to `partnerProfileFromBase`, with every string/array bounded by the existing onboarding validators;
- `research`: only the normalized `buildResearchSnapshot` fields, using the same categorical allowlists and string limits as the partner client contract.

Unknown keys, arrays where objects are required, non-canonical timestamps, invalid nested types, overlong strings, passwords, ID tokens, and malformed JSON invalidate and remove the record.

- [ ] **Step 1: Write failing storage-contract tests**

Use an in-memory Storage double to prove:

- round-trip for the same UID before expiry;
- null for a different UID without applying or deleting the other UID's record;
- removal at exactly `expiresAt`;
- compare-before-delete behavior in `clearPartnerClaimRecovery`;
- rejection/removal for every extra top-level key, password-like key, token-like auth field, invalid invite token, overlong nested value, invalid research category, and malformed JSON;
- storage exceptions return null/false and never crash the app.

- [ ] **Step 2: Run the utility test and verify RED**

Run: `node --test tests/partner-claim-recovery.test.js`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement strict storage helpers**

Build a fresh allowlisted object rather than serializing caller-owned objects. Validate again after reading. `clearPartnerClaimRecovery` must re-read and remove only when the stored UID equals `expectedUid`; this prevents an old async operation from clearing a newer account's recovery.

- [ ] **Step 4: Write failing App account-switch regressions**

In `tests/partner-client.test.jsx`, exercise the full flow:

1. claim returns an ambiguous transport/server result after Firebase signup;
2. the app stores the retry snapshot;
3. Log out preserves that snapshot;
4. signing into another UID never displays or retries it;
5. signing back into the original UID rehydrates the claim recovery and Retry action;
6. Retry success writes the sponsored profile and clears storage;
7. definitive claim rejection, account deletion cleanup, and expiry clear storage;
8. no rendered HTML, console output, or storage string contains a password or Firebase ID token.

- [ ] **Step 5: Run App recovery tests and verify RED**

Run: `npx vitest run tests/partner-client.test.jsx`

Expected: account-switch recovery tests FAIL because logout currently clears the in-memory retry context.

- [ ] **Step 6: Integrate recovery with the existing claim state machine**

Store the snapshot immediately before the ambiguous claim request becomes retryable. During authenticated bootstrap, read only the record matching `user.uid` and reconstruct the existing `partnerRecovery.kind === "claim"` state. Do not clear it in ordinary `logOut`. Clear it after successful claim/profile completion, a code in `DEFINITIVE_PARTNER_CLAIM_REJECTIONS`, confirmed cleanup/deletion, or expiry. Keep all existing operation and auth-generation guards around every state transition.

- [ ] **Step 7: Verify Task 3**

Run:

```bash
node --test tests/partner-claim-recovery.test.js
npx vitest run tests/partner-client.test.jsx
npx oxlint src/utils/partnerClaimRecovery.js src/App.jsx tests/partner-claim-recovery.test.js tests/partner-client.test.jsx
git diff --check
```

Expected: utility and App regressions pass with no credential leakage.

---

### Task 4: Residual hardening acceptance gate

- [ ] **Step 1: Run the complete verification suite**

```bash
npm test
npm run test:ui
npm run lint
npm run build
git diff --check
```

- [ ] **Step 2: Run secret and scope checks**

```bash
git diff --name-only
git diff -- public/privacy.html src/App.jsx src/utils/access.js src/utils/partnerClaimRecovery.js tests/access.test.js tests/legal-links.test.mjs tests/partner-claim-recovery.test.js tests/partner-client.test.jsx
rg -n "sk_live_|sk_test_|whsec_|BEGIN PRIVATE KEY|OPENAI_API_KEY=|ELEVENLABS_API_KEY=" . --glob '!node_modules/**' --glob '!.git/**'
```

Expected: only the eight planned files changed; no secrets found.

- [ ] **Step 3: Request a read-only whole-change review**

Use `superpowers:requesting-code-review`. The reviewer must specifically verify timer cleanup/races, current-screen ejection, privacy accuracy, TTL/UID binding, strict nested recovery validation, and credential non-persistence. Address any supported finding and rerun the complete gate before proceeding to the Stripe plan.

- [ ] **Step 4: Commit the residual fixes locally**

```bash
git add public/privacy.html src/App.jsx src/utils/access.js src/utils/partnerClaimRecovery.js tests/access.test.js tests/legal-links.test.mjs tests/partner-claim-recovery.test.js tests/partner-client.test.jsx
git commit -m "Fix residual sponsored access findings"
git status --short
```

Expected: a clean worktree. Do not push. Begin Stripe work only after this gate is green.
