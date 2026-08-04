# Pre-provisioned sponsored accounts

This runbook is for a specifically authorized production operator. It creates the fixed `EverWise001` through `EverWise500` roster for Community Partner. Merging or deploying the application does not create any accounts; provisioning is a separate, explicit production operation.

Never test this procedure with production credentials or a real roster. The browser QA in the development workflow must use local fixtures and mocked authentication only.

## Safety rules

- Use a private terminal session on an approved device. Turn off shell tracing before entering credentials.
- Keep the roster CSV on approved encrypted local storage, outside every Git checkout and outside Dropbox, iCloud Drive, OneDrive, Google Drive, or any other cloud-synced folder.
- Never paste credentials into a command, command-line option, shell history, document, issue, commit, build artifact, chat, or ordinary email.
- Never copy the roster into a repository, temporary build directory, or test-results directory. The CSV contains account credentials.
- Do not run `create` without a successful preflight, review of its redacted output, and explicit user approval for that exact production run.
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

The command creates the private CSV before it starts account provisioning and updates that same file as memberships become authoritative. Never delete, rename, edit, regenerate, or substitute the CSV during a run.

Success is only the final summary:

```text
Provisioning complete: 500 active, 0 pending, 0 failed.
```

Any other counts mean the run is incomplete. Preserve the same private CSV and follow the recovery rules below.

## 4. Resume boundary

`resume` is permitted only with the exact existing private CSV from the same run; it must never be pointed at a reconstructed roster or a new file. However, the current CLI applies the empty-pilot check (`0/500/500`) to `resume` as well as `create`. Consequently, after even one membership is active, a fresh preflight rejects the non-empty pilot and the current CLI cannot safely resume an interrupted partial run.

Do not work around this check, edit the CSV, rerun `create`, release seats, or mutate Firebase to force the counts back to zero. Stop and escalate for a reviewed recovery fix. A confirmed `resume` command may be used only if the same CSV exists, no accounts were activated, and a fresh preflight still reports exactly `0/500/500` after new explicit approval:

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

Preserve the exact CSV and terminal output. Do not run `create` again. If the interruption occurred before any activation and preflight remains exactly `0/500/500`, a same-file `resume` may proceed only after a new approval. If any account became active, stop and escalate because of the current resume boundary above.

### `EMAIL_EXISTS`

Stop. Do not delete or overwrite the existing Firebase account, do not change that row’s password, and do not generate another roster. Treat this as an identity collision requiring authorized investigation. The provisioner does not own an account that existed before the run and must never delete it.

### Partner API unavailable

If read-only preflight is unavailable, wait and rerun preflight later; no account or roster has been created. If availability fails during provisioning, preserve the CSV. A row may remain pending after bounded retries, and an ambiguous claim must not trigger deletion. Do not retry the partial run through the current CLI when any seats are active; escalate under the resume boundary.

### Suspended partner

Do not create accounts while the partner or invitation is suspended. If suspension occurs during provisioning, stop, preserve the CSV and output, and ask the authorized partner owner to resolve status before any recovery plan. Do not rotate invitations or change partner state as an ad hoc workaround.

### Non-empty partner capacity

Any preflight count other than exactly `0 claimed, 500 available, 500 total` is a stop condition. It may represent prior accounts or a partial run. Do not release memberships, delete accounts, edit the roster, or run `create` to make the state fit. Reconcile the existing membership and roster state through an approved recovery plan.

### Lost roster

Stop immediately. Do not recreate the CSV or generate replacement passwords: the existing Firebase identities and memberships may already be live. Restrict access to any remaining copies, report the credential loss through the approved security channel, and use an authorized credential-reset or account-recovery plan. A newly generated roster is not a valid resume file.

### Firebase deletion after a definitive failed claim

For a definitive claim rejection, the provisioner first verifies that authoritative partner access is `none`. It deletes a Firebase identity only when that identity was created by the current attempt; it never deletes a pre-existing account. If deletion fails or its ownership/outcome is uncertain, stop. Do not delete by username pattern alone. Reconcile the exact Firebase UID, creation ownership, authoritative membership, and saved roster row through approved Firebase operations before deciding whether deletion is safe.
