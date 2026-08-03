# Partner-Sponsored Access Local QA Ledger

Date: 2026-08-03

Branch: `agent/partner-sponsored-access`

Reviewed feature base: `7f7fe6f`

Focused QA repair: `745466c Enable isolated partner browser QA`

## Readiness decision

The partner feature passes the complete automated gate and the safe local Browser, fixture, privacy, capacity, and responsive checks described below. It is **not production-verified or production-ready yet** because this task intentionally did not create real Firebase accounts, touch the live domain, use production partner data, or deploy. A genuine 200% Browser zoom run and an actual VoiceOver session also remain pending.

No production token, production partner record, production Firebase account, GitHub secret, live domain, DigitalOcean service, or deployment setting was read or changed. All partner data used by this ledger was generated locally under `/tmp`.

## Success criteria

| Requirement | Evidence | Result | Fix or residual risk |
|---|---|---|---|
| 1. A partner can be provisioned with a hard limit of exactly 500 active learner accounts. | `npm test`: `production stores accept exactly 500 seats`, `claim 501 fails after claims 1 through 500 succeed`, and `serialized concurrent claims cannot exceed the 500-seat limit`; rendered dashboard at `/tmp/everwise-partner-qa-20260803/desktop-1440x1000-partner-dashboard.png` showed `0 of 500 seats in use`. | Pass — automated and rendered local | Production provisioning remains unverified. |
| 2. The partner receives a private learner link and a private reporting link. | Local `scripts/manage-partners.mjs create` generated separate 43-character learner/admin links once; tokens were not copied into this ledger. Browser learner and admin fragments both disappeared from the URL before their first meaningful screen. | Pass — automated and rendered local | Real partner delivery and server-side production handling remain pending. |
| 3. The learner link presents the partner name and optional logo alongside Everwise. | Browser DOM exposed the accessible name `Everwise with LOCAL QA Partner`; screenshot `/tmp/everwise-partner-qa-20260803/desktop-1440x1000-partner-landing.png`; UI tests cover safe same-origin optional logos and reject external logo URLs. | Pass — automated and rendered local | The local partner intentionally had no logo; an organization-provided production logo is pending. |
| 4. A learner can complete the starting assessment and create an account with their own email and password. | Browser completed the safe assessment through research opt-out and reached `Save your personal plan`, with labeled email/password fields and `Build my plan`. The real Firebase submit was intentionally not pressed. | Partial | Real Firebase account creation is pending Task 11 approval. |
| 5. Claiming a seat is atomic, idempotent, and impossible after the 500-seat limit. | Full store tests cover 500/501, idempotency, cross-partner rejection, and final-seat concurrency. Sanitized fixture evidence at `/tmp/everwise-partner-qa-20260803/fixture-evidence.json` additionally shows a two-seat LOCAL partner at 2/2 and third claim `PARTNER_FULL`. | Pass — automated and local fixture | No real Firebase ID token was used locally. |
| 6. A sponsored learner goes from Personal Plan directly into learning and never sees a subscription paywall on the web. | UI test `claims before writing the profile and routes the active learner Home without Paywall`; pure access test `active sponsored users have full access without subscription controls`. | Pass — automated | Rendered post-Firebase Browser proof is pending. |
| 7. A returning sponsored learner receives the same full access after login on another browser or device. | UI tests `restores authoritative sponsored access after reload before routing Home` and `keeps a mirrored sponsored profile away from pricing when access verification is unavailable`. | Pass — automated | A real cross-browser Firebase logout/login journey is pending. |
| 8. Public users retain Lesson 1 free and incomplete Lesson 2 onward subscription gating. | Pure access test `public expired users remain gated`; UI test `preserves the ordinary public signup route to plan options`. | Pass — automated | No public Firebase Browser account was created. |
| 9. Research answers are collected only after optional informed consent. | Browser screenshot `/tmp/everwise-partner-qa-20260803/desktop-1440x1000-research-consent.png` shows the separate choice, no-sale statement, group-totals boundary, and free-access assurance; UI tests cover required explicit choice and minimized opt-in. | Pass — automated and rendered local | None for the local consent UI. |
| 10. Declining research consent does not affect sponsored access. | Browser selected `No, use my answers only for my personal plan` and advanced to account creation; UI test `choosing no still permits account creation and emits no research snapshot`; store test `research opt-out stores nothing`. | Pass — automated and rendered local to pre-account boundary | Real Firebase claim after opt-out is pending. |
| 11. Reporting contains seat counts and aggregates, never learner-level identities or answers. | Browser dashboard says `combined group totals only`; invalid admin link showed only `This admin link is not available`; sanitized fixture proves four-record suppression, five-record aggregates, no forbidden report keys, no fixture UID, and no learner/admin token. UI CSV tests passed. | Pass — automated, rendered local, and fixture | IAB did not expose a blob download event; the exact CSV is covered by the passing allowlist test rather than a saved Browser download. |
| 12. Deleting a sponsored account removes membership/research and frees the seat. | Two-seat fixture: confirmed release changed the old UID to `none`, replacement UID to `active`, and restored the partner to 2/2 after seat reuse. UI test `reauthenticates and releases a sponsored account in the exact destructive order` covers Firebase/Firestore/server ordering and recovery. | Pass — automated and local fixture | Real Firebase reauthentication/account deletion is pending. |
| 13. Desktop, iPad, keyboard, screen-reader, large-text, reduced-motion behavior remains usable. | Exact normalized screenshots listed below; DOM metrics showed `scrollWidth === clientWidth`; primary buttons remained within the client width and at least 60 px tall (77 px at maximum app text). Roving radio Arrow-key selection worked, all radiogroups/controls had names, visible focus was a 2.5 px solid dark outline, `size-10` resolved to `--text-scale: 1.89`, and reduced-motion emulation returned no active animations with button transitions reduced to `1e-06s`. | Partial | Actual VoiceOver and genuine 200% Browser zoom remain pending. The IAB kept the same DPR/layout dimensions when zoom shortcuts and CDP page-scale commands were requested. Full keyboard-only button activation could not be proven through the IAB key injector, although native buttons and focused radio Arrow behavior were rendered and automated keyboard tests pass. |
| 14. The public production domain passes real sponsored signup, logout, login, unrestricted lesson, and deletion. | No production action was authorized or attempted. | Pending | Required production gate after Task 11 approval. |

## Browser environment and target flows

Browser availability: **Available**. The Browser plugin selected the Codex In-app Browser for `http://127.0.0.1:5174/`; no standalone Playwright fallback was used.

Primary learner flow under test:

`local partner fragment -> scrubbed URL -> co-branded free landing -> assessment -> explicit research opt-out -> labeled account form`

Primary reporting flow under test:

`local admin fragment -> scrubbed URL -> aggregate-only dashboard -> confirm learner-link replacement -> one-session replacement link -> old invite INVALID_INVITE`

Page identity checks:

- URL after both valid fragments: `http://127.0.0.1:5174/` with no fragment.
- Title: `Everwise — one short lesson a day`.
- Privacy route: `http://127.0.0.1:5174/privacy.html`, title `Privacy Policy — Everwise`.
- Meaningful DOM rendered on all checked routes; no Vite/React error overlay.
- Browser error/warning logs were empty for learner landing, learner assessment, dashboard, invalid-admin state, and privacy page.

Interaction evidence:

- The learner fragment was scrubbed before the initial API preview completed.
- After the focused local CORS repair, Retry changed the unavailable state into the co-branded landing without losing the in-memory invite.
- The assessment advanced through all safe questions; ArrowDown changed `Every day` to `A few times a week`, moved focus, set `aria-checked=true`, and maintained roving `tabIndex`.
- Research opt-out reported `aria-checked=true` and advanced to the account form.
- Invalid admin state exposed no partner name, counts, token, or report data.
- Learner-link rotation required a confirmation alert, produced a new 43-character link once, and made the old local invite return HTTP 400 `INVALID_INVITE` with generic text.
- Clicking aggregate CSV produced no console error, but the IAB download event was not observable within five seconds; exact CSV privacy is therefore attributed only to the passing component test.

## Responsive and accessibility evidence

The IAB captures at an internal scale. Raw Browser captures were retained with `raw-iab-` prefixes; proportional copies were normalized outside committed source to the requested exact pixel dimensions, confirmed with `sips`, and inspected with `view_image`:

- Desktop 1440 x 1000: `/tmp/everwise-partner-qa-20260803/desktop-1440x1000-partner-landing.png`
- iPad portrait 820 x 1180: `/tmp/everwise-partner-qa-20260803/ipad-portrait-820x1180-partner-dashboard.png`
- iPad landscape 1180 x 820: `/tmp/everwise-partner-qa-20260803/ipad-landscape-1180x820-partner-dashboard.png`
- Narrow mobile 390 x 844: `/tmp/everwise-partner-qa-20260803/mobile-390x844-partner-dashboard.png`
- Consent detail 1440 x 1000: `/tmp/everwise-partner-qa-20260803/desktop-1440x1000-research-consent.png`
- Maximum app text 390 x 844: `/tmp/everwise-partner-qa-20260803/mobile-390x844-max-app-text-dashboard.png`

Visual inspection found no horizontal clipping, overlapping text, unreadable contrast, missing images, blank shells, or clipped visible primary action. The landscape screenshot ends above the invitation action because that content remains available by ordinary vertical scrolling; it is not horizontally clipped.

Maximum app text was exercised by temporarily applying the app's exact `data-text-size="size-10"` state to the local dashboard, then removing it. Reduced motion was emulated through the Browser tab's developer capability and reset afterward. These were local presentation fixtures, not claims that Settings was reached through Firebase.

The Browser surface did not change DPR, layout viewport, or visual viewport in response to its supported zoom shortcuts or page-scale command, so a genuine 200% Browser zoom result is not claimed.

## Reporting, capacity, rotation, and privacy fixtures

Temporary script: `/tmp/everwise-partner-qa-20260803/qa-fixtures.mjs`

Sanitized output: `/tmp/everwise-partner-qa-20260803/fixture-evidence.json`

Temporary store: `/tmp/everwise-partner-qa-20260803/two-seat-partners.json`

The production management CLI intentionally accepts exactly 500 seats, so the Browser-connected CLI partner remained a 500-seat `LOCAL QA Partner`. The required two-seat capacity journey used `createPartnerStore({ testOnlyAllowCustomSeatLimits: true })` in the external `/tmp` fixture. That test-only option is not enabled by `server.mjs` or the production CLI.

Sanitized fixture result:

```json
{
  "tokensGenerated": { "learnerLength": 43, "adminLength": 43 },
  "twoSeatCapacity": {
    "full": { "claimed": 2, "available": 0, "limit": 2 },
    "thirdClaimCode": "PARTNER_FULL",
    "afterConfirmedReleaseAndReuse": { "claimed": 2, "available": 0, "limit": 2 },
    "releasedUidHasAccess": "none",
    "replacementUidHasAccess": "active"
  },
  "privacyThreshold": {
    "four": { "consentedCount": 4, "suppressed": true, "distributions": null },
    "five": { "consentedCount": 5, "suppressed": false, "primaryDevice": { "Computer": 2, "Tablet": 3 } }
  },
  "reportPrivacy": {
    "forbiddenReportKeys": [],
    "containsFixtureUid": false,
    "containsFixtureUidPrefix": false,
    "containsLearnerToken": false,
    "containsAdminToken": false
  },
  "rotation": { "oldInviteCode": "INVALID_INVITE", "newTokenLength": 43 }
}
```

## Automated gate and exact commands

Post-repair final gate:

| Command | Result |
|---|---|
| `npm test` | Exit 0; 126 Node tests/subtests passed and 90 Vitest UI tests passed. |
| `npm run lint` | Exit 0; oxlint reported no findings. |
| `npm run build` | Exit 0; 1,663 modules transformed; CSS 48.95 kB / 10.26 kB gzip; JS 1,833.20 kB / 493.05 kB gzip. Known large-chunk warning remains. |
| `node --check server.mjs` | Exit 0. |
| `bash -n ops/deploy-everwise` | Exit 0. |
| `git diff --check` | Exit 0. |
| `node --test tests/partner-api.test.js` | Exit 0; 27 tests/subtests passed after Fix Round 1. |
| `npm run test:ui -- tests/partner-client.test.jsx -t "shows five-response group totals and exports only aggregate allowlisted CSV\|suppresses group breakdowns below five research responses"` | Exit 0; 2 selected tests passed. |
| `node /tmp/everwise-partner-qa-20260803/qa-fixtures.mjs` | Exit 0; sanitized two-seat/privacy/rotation evidence above. |

Isolated services:

```bash
partner_test_dir="$(mktemp -d /tmp/everwise-partner-test.XXXXXX)"
EVERWISE_PARTNER_STORE_PATH="$partner_test_dir/partners.json" \
  node scripts/manage-partners.mjs create \
  --id local-qa --name "LOCAL QA Partner" --seats 500
EVERWISE_PARTNER_STORE_PATH="$partner_test_dir/partners.json" \
  EVERWISE_LOCAL_QA_ORIGIN=http://127.0.0.1:5174 \
  PORT=8788 node server.mjs
VITE_EVERWISE_API_URL=http://127.0.0.1:8788 \
  npm run dev -- --host 127.0.0.1 --port 5174
curl -sS http://127.0.0.1:8788/healthz
```

Health returned HTTP 200 with `partnerAccessConfigured: true` and `partnerStoreHealthy: true`. Direct preview returned HTTP 200 before Browser use. Generated local tokens are deliberately omitted.

## Build warning comparison

The large JavaScript chunk warning existed before the partner feature. A detached build of the pre-feature commit `1ee4ad4` produced 1,786.12 kB / 479.53 kB gzip. The final build produced 1,833.20 kB / 493.05 kB gzip: an increase of 47.08 kB raw (2.64%) and 13.52 kB gzip (2.82%). This is a small relative increase and does not materially change the pre-existing warning, so no dashboard `React.lazy` split was introduced in this QA task.

## Defect and focused repair

Initial Browser reproduction:

1. API health and direct preview were both HTTP 200.
2. Browser opened the mandated Vite/API ports and scrubbed the fragment.
3. The UI rendered `Sponsored access is temporarily unavailable`.
4. The server had no browser preflight path; focused regression expected 204 but received 405.

TDD repair:

- RED: `node --test --test-name-pattern="configured local QA origin" tests/partner-api.test.js` failed `405 !== 204`.
- GREEN: the same command passed after the repair.
- Initial repair: `server.mjs` accepted a configured HTTP loopback origin through `EVERWISE_LOCAL_QA_ORIGIN`, answered local preflight, and added exact CORS headers to matching responses. Browser Retry immediately rendered the co-branded landing.
- Initial focused verification: 18/18 partner API tests, lint, syntax, and diff checks passed.
- Commit: `745466c Enable isolated partner browser QA`.

### Fix Round 1 security hardening

A reviewer found that the initial parser validated only the normalized `URL` fields. JavaScript URL normalization erased forbidden raw syntax from `/.`, `/%2e`, `/?`, `/#`, and `http://:@...`, so those configurations incorrectly enabled the normalized loopback origin.

- RED: `node --test --test-name-pattern="server rejects non-exact local QA origin" tests/partner-api.test.js` reported six failures. Each of the five disguised configurations returned 204 instead of 405; the enclosing test also failed. External, mismatched-request, and absent configuration cases already failed closed.
- Repair: the configured value must now be byte-for-byte equal to `url.origin`, use HTTP, use the existing `127.0.0.1` or `localhost` host allowlist, and include a nonzero explicit port. Production behavior remains unchanged when the environment variable is absent.
- GREEN: the valid preflight and actual POST retained the exact allow-origin header with no wildcard or credentials header. All five disguised forms, external origin, mismatched request origin, and absent configuration returned no CORS enablement. The focused run passed 10/10 tests/subtests; the full partner API file passed 27/27.
- Full gate: 126 Node tests/subtests and 90 UI tests passed; lint, build, server syntax, deploy-script syntax, and diff checks passed.
- Fixture correction: the sanitized report check now tests all five generated research UIDs and the shared `local-research-` prefix. Both `containsFixtureUid` and `containsFixtureUidPrefix` are false; no raw token or UID was added to this ledger.
- Commit: `f2dc72c Reject normalized local QA origins`.

## Residual production risks

- Real Firebase signup, claim with a real ID token, logout/login restore, Settings subscription suppression, Lesson 2 access, reauthentication, account deletion, and cleanup were not run.
- Public production domain, Nginx, DigitalOcean filesystem ownership/modes, live health, outbound Google certificate access, real partner provisioning/removal, and production rollback were not inspected.
- Actual VoiceOver and genuine Browser zoom at 200% remain pending.
- The IAB did not expose the aggregate CSV blob download event; automated allowlist/privacy tests passed, but a saved Browser CSV artifact was not obtained.
- This ledger does not authorize deployment, push, merge, real account creation, or partner provisioning.
