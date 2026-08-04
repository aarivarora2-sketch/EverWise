# Pre-provisioned sponsored accounts

This runbook is for a specifically authorized production operator. It creates the fixed `EverWise001` through `EverWise500` roster for Community Partner. Merging or deploying the application does not create any accounts; provisioning is a separate, explicit production operation.

The fixed usernames are reserved from public signup. Each row also contains a random `auth_email` used internally by Firebase. Learners sign in with the fixed username and password; they must never be asked to use or share the internal address. The production API binds the fixed username to that opaque address only after the same authenticated Firebase UID has claimed its sponsored membership.

Never test this procedure with production credentials or a real roster. The browser QA in the development workflow must use local fixtures and mocked authentication only.

## Safety rules

- Use a private terminal session on an approved device. Turn off shell tracing before entering credentials.
- Keep the roster CSV on approved encrypted local storage, outside every Git checkout and outside Dropbox, iCloud Drive, OneDrive, Google Drive, or any other cloud-synced folder.
- Never paste credentials or internal `auth_email` values into a command, command-line option, shell history, document, issue, commit, build artifact, chat, or ordinary email.
- Never copy the roster into a repository, temporary build directory, or test-results directory. The CSV contains account credentials.
- Do not run a confirmed `create` or `resume` without a successful read-only preflight, review of its redacted output, and explicit user approval for that exact production run.
- Do not run a second `create` for the same pilot. Never regenerate or replace an existing roster.

## 1. Prepare the terminal and private output path

From the approved EverWise checkout, enter the three credentials through silent prompts. These commands place values only in the current process environment; the values are not part of the commands saved in shell history.

```zsh
set +x
IFS= read -rs "EVERWISE_FIREBASE_WEB_API_KEY?Firebase Web API key: "
printf '\n'
IFS= read -rs "EVERWISE_PARTNER_INVITE_TOKEN?Partner invite token: "
printf '\n'
IFS= read -rs "EVERWISE_PARTNER_ADMIN_TOKEN?Partner admin token: "
printf '\n'
export EVERWISE_FIREBASE_WEB_API_KEY
export EVERWISE_PARTNER_INVITE_TOKEN
export EVERWISE_PARTNER_ADMIN_TOKEN
```

Choose the roster destination interactively so the path itself is not hard-coded into this runbook:

```zsh
umask 077
IFS= read -r "ROSTER_PATH?Absolute path for the private roster CSV: "
[[ "$ROSTER_PATH" = /* ]] || { print -u2 "The roster path must be absolute."; return 1; }
export ROSTER_PATH
```

Before continuing, confirm manually that the parent folder is approved encrypted local storage, is not inside any Git worktree, and is not cloud-synced. For a new run, the destination file must not already exist. Keep the same exact `ROSTER_PATH` for the entire authorized operation.

## 2. Run the read-only production preflight

```zsh
npm run provision:sponsored -- preflight \
  --api-origin https://everwise.dexio-games.com \
  --count 500 \
  --prefix EverWise \
  --start 1 \
  --end 500 \
  --output "$ROSTER_PATH"
```

Preflight must report all of the following and must state that no accounts or credential files were created:

- Partner ID `community-partner` and partner name `Community Partner`
- Firebase project `games-caf0e`
- Seats `0 claimed, 500 available, 500 total`

The deployed `/healthz` response must also show both `"partnerAccessConfigured":true` and `"partnerStoreHealthy":true`. A missing store is an unavailable service, not an empty pilot; do not continue when either value is false.

Do not continue if any identity, status, or count differs. Present only this redacted preflight output to the user and obtain explicit approval to create the 500 production accounts. The three environment values and roster contents must never appear in the approval request.

## 3. Create only after explicit approval

For the first and only creation run, repeat the fixed target and add the production confirmation flag:

```zsh
npm run provision:sponsored -- create \
  --api-origin https://everwise.dexio-games.com \
  --count 500 \
  --prefix EverWise \
  --start 1 \
  --end 500 \
  --output "$ROSTER_PATH" \
  --confirm-production
```

The command creates the private CSV before it starts account provisioning and updates that same file as memberships and privileged username bindings become authoritative. Its exact schema is `account_number,username,auth_email,password,status`. Never delete, rename, edit, regenerate, or substitute the CSV during a run.

Success is only the final summary:

```text
Provisioning complete: 500 active, 0 pending, 0 failed.
```

Any other counts mean the run is incomplete. Preserve the same private CSV and follow the recovery rules below.

An exact result exits with status 0. Every result containing a pending or failed row prints `Provisioning incomplete`, includes same-file resume guidance, and exits non-zero. Treat a zero exit status plus the exact `500/0/0` summary as a single success condition; never rely on only one of them.

## 4. Resume boundary

`resume` is permitted only with the exact existing private CSV from the same run; it must never be pointed at a reconstructed roster or a new file. Keep the file at owner-only `0600` permissions. The command rejects an unsafe file mode before reading credentials.

First run `resume` without `--confirm-production`. This is the read-only recovery preflight: it validates the saved 500-row roster, compares its active/pending status summary with the authoritative partner seat report, and does not authenticate, create, claim, delete, or update any account or credential file.

```zsh
npm run provision:sponsored -- resume \
  --api-origin https://everwise.dexio-games.com \
  --count 500 \
  --prefix EverWise \
  --start 1 \
  --end 500 \
  --output "$ROSTER_PATH"
```

Review the reported partner, Firebase project, and seat counts against the same private roster:

- For a normal partial resume with `N` active rows and `500 - N` pending rows, the report must show `N claimed, 500 - N available, 500 total`.
- The command also permits exactly `N + 1` claimed seats when at least one roster row remains pending. This is the supported crash window where the partner claim became authoritative but the next atomic CSV update did not finish. The confirmed resume authenticates the pending row, verifies its existing matching membership, and records it active without claiming a second seat.
- For a fully active roster, the report must show `500 claimed, 0 available, 500 total`.

The CLI fails closed if the partner identity, Firebase project, seat arithmetic, 500-seat limit, or roster-to-seat relationship differs. Do not edit the CSV, rerun `create`, release seats, delete accounts, or mutate Firebase to force a match. Preserve the CSV and output and escalate the mismatch for an approved reconciliation.

During confirmed resume, every active or newly reconciled row also re-registers the same fixed username binding with the authenticated learner token and admin token. A mismatched username, UID, or opaque auth email is a terminal conflict; do not bypass or rewrite it manually.

After the read-only resume preflight passes, present only its redacted output and the matching active/pending and claimed/available counts for explicit user approval. Do not include roster rows or credentials. Then rerun the same command with only `--confirm-production` added:

```zsh
npm run provision:sponsored -- resume \
  --api-origin https://everwise.dexio-games.com \
  --count 500 \
  --prefix EverWise \
  --start 1 \
  --end 500 \
  --output "$ROSTER_PATH" \
  --confirm-production
```

## 5. Verify the completed roster

After the command reports `500 active, 0 pending, 0 failed`, sample a small set of accounts spread across the beginning, middle, and end of the range. For each sampled account:

1. Sign in through the normal learner login and complete first-time setup.
2. Confirm that setup does not ask for username, email, or password again and that the saved-progress explanation is readable.
3. Open an incomplete Lesson 2-or-later item and confirm that no paywall appears.
4. Open Settings and confirm that it shows partner-provided full access and no subscription or payment controls.
5. Complete a small progress action, reload the app, and confirm the saved profile and progress return.
6. Confirm Back and Log out provide a clear recovery route, then log out before testing the next sample.

Do not include sampled credentials, screenshots containing credentials, or roster rows in the verification record.

## 6. Transfer and close out

Transfer the roster only through the private channel approved for credential delivery. Never attach it to a GitHub issue, pull request, commit, build artifact, chat message, ticket, shared document, or ordinary email. Confirm the intended recipient and channel immediately before transfer, and do not make convenience copies.

When the authorized work is complete, remove the credentials from the current shell and close the terminal session:

```zsh
unset EVERWISE_FIREBASE_WEB_API_KEY
unset EVERWISE_PARTNER_INVITE_TOKEN
unset EVERWISE_PARTNER_ADMIN_TOKEN
unset ROSTER_PATH
```

Retain or destroy the approved roster copy only according to the organization’s credential-retention policy. Do not move it into a Git or cloud-synced location for storage.

## Recovery rules

### Interrupted run

Preserve the exact CSV and terminal output. Do not run `create` again. Use the same-file, unconfirmed `resume` recovery preflight in section 4. If its roster and seat counts match exactly, or differ only by the supported one-seat-ahead crash window, obtain new explicit approval and rerun the same resume command with `--confirm-production`. Any larger, lower, or otherwise inconsistent count is a stop condition requiring approved reconciliation.

### `EMAIL_EXISTS`

Stop. This refers to the row's high-entropy internal `auth_email`, not a predictable address derived from the public fixed username. Do not delete or overwrite the existing Firebase account, do not change that row’s password, and do not generate another roster. Treat this as an identity collision requiring authorized investigation. The provisioner does not own an account that existed before the run and must never delete it.

### Partner API unavailable

If a first-run read-only preflight is unavailable, wait and rerun it later; no account or roster has been created. If availability fails during provisioning, preserve the exact CSV and output. A row may remain pending after bounded retries, and an ambiguous claim must not trigger deletion. When the API is available again, use the unconfirmed same-file `resume` recovery preflight, review its reconciled counts, obtain new explicit approval, and only then run confirmed resume.

### Suspended partner

Do not create accounts while the partner or invitation is suspended. If suspension occurs during provisioning, stop, preserve the CSV and output, and ask the authorized partner owner to resolve status before any recovery plan. Do not rotate invitations or change partner state as an ad hoc workaround.

### Non-empty partner capacity

For a new `create`, any preflight count other than exactly `0 claimed, 500 available, 500 total` is a stop condition. For `resume`, non-empty capacity is expected only when it matches the exact saved roster or the supported one-seat-ahead crash window described in section 4; a fully active roster must match `500/0/500`. Any other relationship is a stop condition. Do not release memberships, delete accounts, edit the roster, or run `create` to make the state fit. Reconcile the existing membership and roster state through an approved recovery plan.

### Lost roster

Stop immediately. Do not recreate the CSV or generate replacement passwords: the existing Firebase identities and memberships may already be live. Restrict access to any remaining copies, report the credential loss through the approved security channel, and use an authorized credential-reset or account-recovery plan. A newly generated roster is not a valid resume file.

### Firebase deletion after a definitive failed claim

For a definitive claim rejection, the provisioner first verifies that authoritative partner access is `none`. It deletes a Firebase identity only when that identity was created by the current attempt; it never deletes a pre-existing account. It then persists the unchanged pending roster, reports the row failed for that run, and stops before authenticating or mutating any later row. If deletion fails or its ownership/outcome is uncertain, stop. Do not delete by username pattern alone. Reconcile the exact Firebase UID, creation ownership, authoritative membership, and saved roster row through approved Firebase operations before deciding whether deletion is safe.
