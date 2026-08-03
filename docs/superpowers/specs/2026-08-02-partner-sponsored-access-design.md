# EverWise Partner-Sponsored Access Design

## Purpose

EverWise will support a commercial pilot in which a nonprofit, teen volunteer organization, or sponsor pays EverWise a one-time $500 fee for up to 500 active learner accounts. The organization distributes a private, co-branded web link. Learners complete the existing starting assessment, create their own Firebase email/password account, and receive full sponsored web access without seeing subscription pricing.

The $500 transaction happens outside the learner experience through an invoice or direct agreement. EverWise does not collect payment from sponsored learners.

## Success Criteria

The partner flow is complete only when all of the following are true:

1. A partner can be provisioned with a hard limit of exactly 500 active learner accounts.
2. The partner receives a private learner link and a private reporting link.
3. The learner link presents the partner's name and optional logo alongside EverWise.
4. A learner can complete the starting assessment and create an account with their own email and password.
5. Claiming a seat is atomic, idempotent, and impossible after the 500-seat limit is reached.
6. A sponsored learner goes from their personal plan directly into learning and never sees a subscription paywall on the web.
7. A returning sponsored learner receives the same full access after logging in on another browser or device.
8. Regular public users retain the existing product rule: Lesson 1 is free, while incomplete Lesson 2 onward is subscription-gated.
9. Assessment answers used for research are collected only after an optional, informed consent choice.
10. Declining research consent does not affect free sponsored access.
11. Partner reporting contains seat counts and aggregated consented results, not names, email addresses, passwords, raw Firebase user IDs, or individual answer records.
12. Deleting a sponsored EverWise account removes its membership and research record and makes that seat available again.
13. Desktop, iPad, keyboard, screen-reader, large-text, and reduced-motion behavior remain usable.
14. The public production domain passes a real sponsored signup, logout, login, unrestricted-lesson, and account-deletion test.

## Scope

This specification covers the complete first commercial partner pilot:

- sponsored learner invitation and access;
- the 500-seat entitlement;
- assessment consent and research data minimization;
- co-branding;
- partner aggregate reporting;
- partner provisioning and token rotation;
- account deletion and seat release;
- production storage, deployment, and verification.

It does not add learner billing, in-app partner purchasing, volunteer access to individual learner profiles, testimonial publishing, marketing automation, or a general customer relationship management system. Testimonials require a separate future consent flow.

## Selected Architecture

The existing Firebase Authentication remains responsible for email/password accounts, and Firestore remains responsible for each learner's personal profile and course progress. The existing DigitalOcean Node API becomes the authoritative source for partner invitations, sponsored entitlements, seat limits, research consent records, branding, and aggregate reports.

This choice fits the deployed system. The repository already has a secured Node API and DigitalOcean release workflow, but it has no versioned Firebase Functions project, Firestore rules, or Firebase deployment configuration. A global browser environment bypass would not enforce seats, and pre-generated passwords would create avoidable security and support problems.

The API stores partner data outside release directories at:

`/var/lib/everwise/partners.json`

The service runs as `www-data`. The directory is owned by `www-data:www-data` with mode `750`, and the data file uses mode `600`. Writes are serialized inside the single API process, written to a temporary sibling file, synced, and atomically renamed. The prior valid file is retained as a backup before replacement. Deployment and release rollback never overwrite the partner data directory.

This storage model is intentionally sized for the pilot: hundreds, not millions, of memberships. The partner store is isolated behind an interface so it can later be replaced by Postgres without changing the learner or reporting APIs.

## Partner Records and Seat Semantics

Each partner record contains:

- stable `partnerId` and display name;
- status: `active` or `suspended`;
- `seatLimit`, set to `500` for the commercial pilot;
- co-branding: partner name, optional same-origin logo path, and accessible accent color;
- SHA-256 hashes of a high-entropy learner invitation token and a separate admin reporting token;
- active memberships keyed by Firebase UID;
- consented, minimized research submissions keyed internally by Firebase UID;
- creation and token-rotation timestamps.

A seat means one active Firebase UID. Logging in on multiple devices does not consume more seats. Repeating a claim with the same UID is idempotent. A different UID cannot claim seat 501. Explicit EverWise account deletion removes the membership and frees one seat. Suspension prevents new claims and access without deleting data; it is reserved for contract termination, abuse, or incident response.

Invite and admin tokens are generated from at least 32 random bytes. Plain tokens are shown only once during provisioning or rotation and are never written to application logs or committed to Git.

## Learner Invitation Flow

The organization shares a URL shaped like:

`https://everwise.dexio-games.com/#partner=<high-entropy-token>`

The token is placed in the URL fragment so it is not sent in the initial HTTP request or Nginx access log. The app reads it into session memory, immediately removes it from the visible address with `history.replaceState`, and sends it only in POST request bodies over HTTPS.

The app calls `POST /api/partner/preview`. A valid active invitation returns only:

- `partnerId`;
- public co-branding;
- whether a seat is currently available.

It never returns token hashes, membership data, or research results.

The landing screen becomes “Everwise with [Partner Name]” and states that access is provided free by the organization. The normal public landing screen remains unchanged when there is no partner invitation.

If the token is invalid, suspended, or full, the app displays a calm, accessible explanation before assessment or account creation. It tells the learner to contact the volunteer or organization that shared the link. It does not route the learner into a paid signup by accident.

## Starting Assessment and Consent

The current eight-step Profile Interview remains the starting assessment because it already covers name and age, internet use, primary device, confidence, scam experience, concerns, a safety scenario, AI familiarity, accessibility preferences, trusted-person preference, and account creation.

Sponsored onboarding adds a clear consent panel before the account step:

- **Required use:** “Save my answers to create my personal plan and remember my accessibility preferences.”
- **Optional research use:** “EverWise may use a de-identified copy of my answers and learning progress to improve lessons and measure whether the program helps.”

The optional choice defaults to off. The copy states that EverWise will not sell the answers, the partner will receive only group totals, and declining will not affect free access. The learner can continue after making an explicit yes/no choice. “Prefer not to say” remains available for accessibility questions.

The learner's full answers remain in their private Firestore profile for personalization. The partner service stores a research snapshot only when optional consent is yes. That snapshot excludes name, email, password, exact age, raw UID in exports, trusted-person contact details, free text, and message-checker content.

The stored research snapshot contains:

- age band: 18–39, 40–59, 60–69, 70–79, 80–89, or 90+;
- internet-use frequency;
- primary device;
- confidence category;
- scam-frequency category;
- selected concern categories;
- whether the safe bank-verification answer was selected;
- AI-experience category;
- accessibility preference categories, including “prefer not to say”;
- consent timestamp and assessment version.

The partner report does not expose a category breakdown until at least five consenting learners are represented in that result, reducing re-identification risk in small cohorts.

## Account Creation and Atomic Seat Claim

The client first previews the invitation, completes the assessment, and creates the Firebase email/password account using the existing secure Firebase SDK. The password is never sent to EverWise's Node API.

Immediately after Firebase signup, the client obtains a fresh Firebase ID token and calls `POST /api/partner/claim` with:

- `Authorization: Bearer <Firebase ID token>`;
- the learner invitation token;
- the explicit research consent value;
- the minimized research snapshot when consent is yes.

The API verifies the Firebase ID token signature using Google's published Secure Token certificates, then validates issuer, audience `everwise-46cf0`, expiration, issued-at time, authentication time, and non-empty subject. Public certificates are cached only for their advertised lifetime.

Within one serialized store mutation, the server:

1. validates the invitation token using a timing-safe comparison;
2. confirms that the partner is active;
3. returns the existing entitlement when the UID already belongs to that partner;
4. rejects a UID already attached to a different partner;
5. confirms active membership count is below 500;
6. creates the membership;
7. stores or omits the research snapshot according to consent;
8. atomically commits the file;
9. returns the sponsored entitlement and branding.

If the claim fails after Firebase account creation, the client immediately attempts to delete the new Firebase account and signs out. It explains what happened without showing a paywall. A full-seat race therefore does not silently create a paid learner.

## Returning Login and Access Resolution

After every Firebase authentication state change, the app calls `POST /api/partner/access` with a fresh Firebase ID token. The API returns either:

- an active sponsored entitlement and partner branding; or
- no sponsored entitlement.

The web access resolver grants full access when the server returns active sponsored access. Otherwise it applies the existing subscription/trial rule. Client-editable Firestore fields and `VITE_BYPASS_SUBSCRIPTION` are not used as production proof of partner access.

For an active sponsored learner:

- Personal Plan ends with **Start learning** instead of **See my plan options**;
- onboarding never routes to Paywall;
- every incomplete lesson, challenge, and exam is accessible;
- Settings shows **Full access provided by [Partner Name]**;
- subscription plan, trial, restore, and payment controls are hidden on the website;
- co-branding remains visible but secondary to EverWise.

If the entitlement API is temporarily unavailable, the app shows a retryable service message rather than pricing or a false loss of sponsorship. It does not downgrade a known partner learner into a sales funnel.

## Partner Reporting

The provisioning command produces a separate private admin URL:

`https://everwise.dexio-games.com/#partner-admin=<high-entropy-admin-token>`

The fragment is removed from the address immediately after capture. The admin token is kept in session memory and sent only in POST bodies. The reporting screen provides:

- partner name and co-branding preview;
- seats claimed, seats available, and the 500-seat limit;
- invitation status and a control that rotates the learner link when the original has been lost;
- number and percentage of learners who consented to research;
- group distributions for age band, device, confidence, concerns, scenario result, AI familiarity, and accessibility preferences;
- CSV download of aggregate rows only;
- last-updated time.

The original learner URL is shown once during provisioning because only its hash is stored. Rotating the learner link invalidates the previous link and returns the replacement URL once.

The report never lists learner names, emails, Firebase UIDs, passwords, individual profiles, individual progress, or individual assessment submissions. Reporting is limited to 30 successful requests per minute per admin token and IP address. Ten invalid admin-token attempts from one IP address within ten minutes produce a ten-minute cooldown. Invalid tokens return no partner metadata.

## Partner Provisioning and Rotation

A versioned production utility provisions partners directly against the protected server data file. A command such as:

`node scripts/manage-partners.mjs create --id community-pilot --name "Community Partner" --seats 500`

generates the learner and admin tokens internally, creates the partner record, and prints the two URLs once. Token arguments are not accepted, preventing secrets from entering shell history. Additional commands list non-sensitive partner status, rotate either token, suspend, and reactivate a partner.

The exact partner name and logo are supplied when a real organization signs the pilot. Until then, production verification uses a clearly labeled disposable test partner with a two-seat limit and removes it after the test. No organization is implied to have purchased EverWise before an agreement exists.

## Account Deletion and Privacy

Sponsored account deletion first requires Firebase reauthentication. After successful reauthentication, the app calls `POST /api/partner/release-intent` with the learner's Firebase ID token. The server keeps the seat active, marks a 15-minute pending deletion, and returns a high-entropy, single-use release receipt. The app then deletes the Firestore profile and Firebase account. Only after Firebase deletion succeeds does it call `POST /api/partner/release-confirm` with that receipt. Confirmation removes membership and research data and frees the seat.

If Firestore or Firebase deletion fails, the still-authenticated client calls `POST /api/partner/release-cancel`. Unconfirmed intents automatically return to active after 15 minutes and continue counting against the seat limit. A confirmed receipt is idempotent so the client can safely retry after a network interruption. The receipt is stored in session storage until confirmation succeeds and expires after 24 hours; an expired orphaned receipt requires the owner-side provisioning utility to reconcile that membership.

The privacy policy will describe sponsored access, partner group reporting, optional research consent, categories collected, retention, deletion, and contact information. Consent version and timestamp are retained with a submission while the account exists.

## Backend Boundaries

The Node API is split into focused modules:

- Firebase token verification: authenticate callers and expose verified UID only;
- partner store: validate schema, serialize mutations, perform atomic persistence, and aggregate results;
- partner routes: validate HTTP inputs and map store errors to safe responses;
- existing scam-checker and narration handlers: unchanged except for route composition;
- provisioning utility: create and manage partner records without running the web server.

No module logs bearer tokens, invitation tokens, admin tokens, passwords, assessment bodies, or individual research records.

## Error Handling

User-visible messages use plain language and preserve the learner's context:

- invalid invitation: “This access link is not available. Ask the volunteer or organization that shared it for a new link.”
- full partner: “All sponsored places are currently in use. Please contact [Partner Name] for help.”
- claim race: delete the just-created account, sign out, and show the full-partner message;
- server unavailable during onboarding: preserve assessment answers in memory and offer Retry;
- server unavailable during returning login: show Retry and Log out, never Paywall;
- suspended partner: explain that sponsored access is temporarily unavailable and provide the partner name;
- invalid admin link: show no partner metadata or report data;
- corrupt data file: refuse mutations, keep the last valid file, remain unhealthy, and alert through deployment/runtime logs.

API responses use stable error codes while keeping internal details out of the browser.

## Deployment and Operations

The production release archive expands to include the focused server modules and partner-management utility. The restricted DigitalOcean deploy helper validates an allowlist of those paths before extraction. It creates and verifies the persistent partner-data directory without changing existing data.

The service health response adds:

- `partnerAccessConfigured`;
- `partnerStoreHealthy`.

It does not include partner names, counts, or tokens.

The GitHub workflow checks both booleans after deployment. Existing OpenAI and ElevenLabs secret delivery remains unchanged. Partner tokens and partner records are not GitHub secrets because they are generated and stored only on the server.

## Testing Strategy

Automated tests cover:

- token hashing and timing-safe validation;
- valid, invalid, suspended, and rotated invitations;
- exact seat behavior: claims 1 through 500 succeed and claim 501 fails;
- concurrent claim serialization at the final available seat;
- idempotent repeat claims;
- cross-partner claim rejection;
- release and seat reuse;
- pending deletion, cancellation, confirmation, receipt retry, and expiry;
- research opt-in and opt-out storage;
- age-band minimization and assessment-version validation;
- aggregation suppression below five responses;
- admin report privacy allowlist;
- Firebase ID token signature, issuer, audience, time, and subject validation;
- sponsored versus public access resolution;
- sponsored signup routing directly to learning;
- returning sponsored login without Paywall;
- full, invalid, suspended, and temporarily unavailable UI states;
- account deletion ordering;
- deployment archive and health-check contracts.

Browser verification covers desktop and iPad layouts, keyboard-only navigation, visible focus, read-aloud controls, maximum supported text size, reduced motion, and screen-reader labels.

Production verification uses a disposable two-seat partner and disposable Firebase accounts to prove:

1. co-branded invite preview;
2. assessment and opt-out signup;
3. unrestricted access without pricing;
4. logout and returning login;
5. opt-in signup and aggregate report;
6. third-account rejection at capacity;
7. deletion, seat release, and successful replacement claim;
8. removal of all disposable accounts and partner data.

The 500-seat invariant is proven by automated store tests and a production partner configured with `seatLimit: 500`; production QA does not create 500 real Firebase accounts.

## Rollout

Implementation proceeds in four testable slices:

1. server authentication, partner store, provisioning, quota, and aggregate reporting;
2. learner invite, consent, signup, entitlement, no-paywall, and deletion flow;
3. co-branding and partner reporting interface;
4. deployment hardening, responsive/accessibility QA, disposable production end-to-end test, and real 500-seat partner provisioning after the organization is named.

No GitHub push occurs until the exact changed files and user-visible changes are presented to the user for approval.
