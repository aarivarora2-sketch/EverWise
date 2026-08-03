# Pre-provisioned Sponsored Accounts Design

**Date:** 2026-08-03
**Status:** User-approved design; implementation not started
**Scope:** Add a secure, resumable way to create exactly 500 unique EverWise learner logins whose accounts are already sponsored, while preserving the normal public signup and paywall behavior.

## 1. Purpose

EverWise must be able to hand a sponsoring organization a private roster of 500 ready-to-use learner credentials. Each learner signs in with a unique username and password, completes the short personal setup on first login, and then uses the app without encountering the subscription paywall. Their setup answers and course progress must remain saved to their own account.

People who create ordinary public accounts are not sponsored. Their existing subscription and paywall rules remain unchanged.

## 2. Approved Product Decisions

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

## 3. Goals and Non-goals

### Goals

1. Pre-create 500 Firebase Authentication users with unique credentials.
2. Claim one sponsored seat for each successfully created Firebase UID before the credential is marked active.
3. Make the operation safe to resume after a network failure or interruption.
4. Preserve a strict one-account-to-one-seat relationship.
5. Prove with automated tests that provisioned learners bypass the paywall and public users do not.
6. Avoid exposing passwords in terminal output, application logs, source control, test fixtures, or server storage.

### Non-goals

- A public interface for generating sponsored accounts.
- Shared credentials or a shared learner profile.
- Password recovery by email for synthetic username accounts.
- Changing the existing price, public signup path, subscription rules, or exact 500-seat partner limit.
- Automatically emailing or otherwise distributing credentials to learners.
- Creating production accounts merely by merging or deploying the code.

## 4. Existing System Constraints

Public EverWise usernames are converted to Firebase-compatible internal email addresses under `accounts.everwise.app`. The login screen already accepts either a username or an email. Sponsored access is authoritative on the EverWise partner API: an authenticated Firebase UID bypasses the paywall only when the partner store reports an active membership.

The current sponsored invite flow creates an account in the browser and claims a seat through `/api/partner/claim`. The pre-provisioning flow will use the same authenticated claim contract, so it cannot grant access by writing a client-only flag or modifying a Firestore profile.

## 5. Recommended Architecture

### 5.1 Operator-only provisioning command

Add a dedicated Node command under `scripts/` for pre-provisioning a roster. It is an operator tool and is never exposed through the website. It accepts:

- the production API origin;
- a count, which must equal `500`;
- the approved username prefix and numeric range;
- a destination CSV path outside the repository; and
- the Firebase web API key, partner learner invitation token, and partner admin
  token through the process environment.

The command must reject unknown, duplicate, malformed, or unsafe options. Production mode requires an HTTPS API origin. The output path must not resolve inside the repository, must not be a symlink, and must be created with owner-only permissions (`0600`). Existing files are never overwritten unless an explicit resume mode verifies that the file has the expected schema and roster.

The Firebase web API key identifies the Firebase project but is not treated as a password. Even so, it is supplied by environment rather than copied into the roster. The partner invitation and admin tokens are sensitive. Supplying them only through the process environment keeps them out of shell history; they must never be printed or written to the CSV.

### 5.2 Credential generation

Before any account mutation, the command creates the private CSV with all 500 approved usernames and cryptographically random passwords. Passwords must:

- be generated with Node's cryptographic random source;
- be long enough to resist guessing;
- contain a readable mix of upper-case, lower-case, numbers, and symbols;
- be different across all 500 rows; and
- avoid ambiguous characters where practical for older learners.

CSV columns are:

`account_number,username,password,status`

The initial status is `pending`. The command updates each row to `active` only after both Firebase account creation and sponsored-seat confirmation succeed. It never prints password values.

### 5.3 Account creation and sponsorship

For each pending row, sequentially:

1. Convert the username to the same internal Firebase auth email used by the web app.
2. Create the Firebase Authentication user through the official Identity Toolkit REST endpoint.
3. Receive the new user's Firebase ID token and UID.
4. Call the production `/api/partner/claim` endpoint with that ID token, the partner invite token, and `researchConsent: false`.
5. Confirm the returned access status is `active`.
6. Mark the CSV row `active` using an atomic file replacement that preserves owner-only permissions.

The command uses bounded sequential requests rather than creating 500 accounts concurrently. This reduces rate-limit pressure and makes failures easy to identify and resume.

### 5.4 Resuming safely

Resume mode reads the existing private CSV and validates all 500 usernames before doing anything. For every row:

- `active`: sign in with the stored credential, call `/api/partner/access`, and leave it active only if the server confirms sponsored access;
- `pending`: attempt sign-in first, because Firebase account creation may have succeeded immediately before an interruption; create the account only when Firebase confirms that the credential does not already exist; then claim or verify the sponsored seat; and
- unrecoverable credential conflict: stop and identify only the account number and username, never its password.

All reruns are idempotent from the operator's perspective: they verify existing work and continue the roster rather than creating duplicate usernames or consuming duplicate seats.

If Firebase user creation succeeds but the sponsored claim receives a definitive rejection, the command deletes that newly created Firebase user with its current ID token and leaves the row pending. If the failure is ambiguous, it first queries authoritative access. It never deletes an account that existed before the current attempt.

### 5.5 First-login learner flow

Provisioned accounts intentionally begin without a completed Firestore learner profile. On first login:

1. Firebase authenticates the supplied username and password.
2. EverWise checks authoritative sponsored access by UID.
3. Because the account has no completed profile, EverWise opens the short personal setup in returning-account mode.
4. The setup collects personalization answers but does not ask the learner to create another username, password, or sponsored claim.
5. EverWise saves the profile to the learner's own Firestore document.
6. The learner enters the app with active sponsored access.

Later logins load the saved profile and progress normally. If profile saving fails, the learner remains signed in and can safely retry without losing the sponsored seat.

### 5.6 Access and paywall behavior

The partner API remains the only authority for sponsored access:

- active sponsored membership: full learner access and no subscription controls;
- suspended sponsored membership: no sponsored access, with an authenticated logout route;
- no sponsored membership: existing public free-lesson and subscription behavior;
- completed public lessons: retain their existing replay behavior.

No CSV field, username pattern, local-storage value, or Firestore profile field grants sponsorship. A person cannot obtain sponsored access merely by choosing an `EverWise###` username.

## 6. User Experience

The existing login screen remains the entry point. Learners type the supplied username and password. The app should use plain, older-adult-friendly language:

- first login: `Let's personalize your EverWise lessons.`
- setup completion: `Your progress will be saved to this account.`
- invalid credentials: the existing neutral login error, without revealing whether a username exists.

The personal setup retains large touch targets, keyboard access, readable text, and browser/iPad layouts. It must not show invitation, payment, or seat-claim language to an already provisioned learner.

## 7. Security and Privacy

- The credential file is a secret and stays outside GitHub and the web server.
- The file is created with owner-only permissions and is never attached to test artifacts.
- Passwords and invite tokens are redacted from errors and logs.
- No password is stored in the partner store or Firestore.
- Firebase stores password verifiers using its managed authentication service.
- Research sharing remains off for pre-provisioning. The learner's personal setup is used for their experience and is not added to partner research totals unless a separate, explicit consent flow is introduced later.
- The operator should transfer the final roster through an approved private channel and keep only the copies required for distribution.
- Because password changes are not required, the sponsoring organization must protect the original roster. EverWise cannot recover these synthetic-username passwords by email.

## 8. Failure Handling

The command performs a read-only preflight before mutations:

1. Validate the exact 500-row roster and output path.
2. Preview the partner invitation and require an active partner.
3. Use the partner admin report to confirm the partner has a 500-seat limit and
   zero claimed seats, leaving exactly 500 seats available.
4. Confirm the Firebase project matches the configured EverWise project.
5. Display a redacted summary and require an explicit production confirmation flag.

During execution, a bounded retry is allowed only for transient network and server-unavailable responses. Capacity, suspended-partner, invalid-invite, credential-collision, and malformed-response errors stop the run. The final summary reports counts only: active, pending, and failed.

The website handles runtime failures separately. An authenticated sponsored learner who cannot load access sees retry and logout controls; the paywall is not used as an error fallback.

## 9. Testing Strategy

Implementation follows test-driven development.

### Provisioning tests

- rejects counts other than exactly 500;
- generates the exact approved username range;
- generates 500 unique strong passwords without printing them;
- refuses repository, symlink, unsafe, or existing output targets;
- creates the CSV with `0600` permissions;
- creates a Firebase account, claims a seat, and marks the row active;
- deletes only a newly created Firebase user after definitive claim failure;
- resolves ambiguous claim results through authoritative access;
- resumes pending and active rows without duplicate account creation;
- redacts credentials and invite tokens from every failure path;
- stops cleanly when capacity, invitation, Firebase project, or partner status is wrong.

### Application contract tests

- a provisioned authenticated user with no profile enters personal setup without account-creation fields;
- setup saves under the authenticated UID and survives reload;
- completing setup does not attempt another sponsored claim;
- active sponsored access bypasses subscription gating and hides subscription controls;
- an ordinary newly registered user retains the public paywall rules;
- an `EverWise###` username without server membership does not bypass the paywall;
- suspended and temporarily unavailable authenticated learners can log out;
- desktop, iPad, mobile, keyboard, and accessible-name coverage remains green.

### Release verification

Before production provisioning:

- run unit, UI, lint, and production build checks;
- run credential and secret scans;
- perform a disposable one-account end-to-end rehearsal against a non-production partner;
- verify the production target, partner identity, capacity, Firebase project, and private output location;
- show the exact production operation to the user and obtain confirmation.

## 10. Rollout Boundaries

Merging and deploying the code adds the capability but does not create any learner accounts. Creating the real 500-account roster is a separate external mutation that requires a final explicit confirmation after the redacted production preflight.

The source-code push is also separate. Before any GitHub push, the exact changed files and user-visible behavior must be shown for approval. The credential CSV is excluded from that scope under all circumstances.

## 11. Acceptance Criteria

The feature is complete when:

1. The private roster contains exactly 500 active, unique username/password pairs.
2. Every active roster UID has one authoritative membership in the designated 500-seat partner.
3. A sampled provisioned account signs in, completes and saves personal setup, reloads successfully, and never sees the paywall while sponsorship is active.
4. A sampled ordinary public account still follows the public paywall rules.
5. No plaintext credential or invitation token appears in Git, logs, tests, server storage, or browser assets.
6. Automated tests, lint, build, and secret scanning pass.
7. The user receives the private CSV and the redacted provisioning summary.
