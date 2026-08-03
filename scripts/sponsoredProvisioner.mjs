import { markRosterActive, summarizeRoster } from "./sponsoredRoster.mjs";
import { usernameToAuthEmail } from "../src/utils/validation.js";

const EXPECTED_FIREBASE_PROJECT_ID = "games-caf0e";
const EXPECTED_SEATS = Object.freeze({ claimed: 0, available: 500, limit: 500 });
const DISTRIBUTION_KEYS = [
  "accessibilityNeeds",
  "ageBand",
  "aiExperience",
  "bankSafetyCategory",
  "concerns",
  "confidence",
  "internetUse",
  "primaryDevice",
  "scamFrequency",
];

function safeProvisioningError(message) {
  return new Error(message);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value, expectedKeys) {
  if (!isPlainObject(value)) return false;
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  return (
    actualKeys.length === sortedExpectedKeys.length &&
    actualKeys.every((key, index) => key === sortedExpectedKeys[index])
  );
}

function validBranding(branding) {
  return Boolean(
    hasExactKeys(branding, ["accent", "logoPath", "name"]) &&
      typeof branding.name === "string" &&
      branding.name.length >= 2 &&
      branding.name.length <= 100 &&
      branding.name === branding.name.trim() &&
      (branding.logoPath === null ||
        (typeof branding.logoPath === "string" &&
          branding.logoPath.startsWith("/partners/") &&
          !branding.logoPath.includes(".."))) &&
      typeof branding.accent === "string" &&
      /^#[A-Fa-f0-9]{6}$/.test(branding.accent),
  );
}

function validPreview(preview) {
  return Boolean(
    hasExactKeys(preview, ["branding", "partnerId", "seatAvailable"]) &&
      typeof preview.partnerId === "string" &&
      /^[a-z0-9-]{3,50}$/.test(preview.partnerId) &&
      validBranding(preview.branding) &&
      typeof preview.seatAvailable === "boolean"
  );
}

function isCanonicalIsoDate(value) {
  if (typeof value !== "string") return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function validCountMap(value) {
  return Boolean(
    isPlainObject(value) &&
      Object.entries(value).every(
        ([category, count]) =>
          category.length > 0 && Number.isSafeInteger(count) && count >= 0,
      ),
  );
}

function validDistributions(value) {
  return Boolean(
    hasExactKeys(value, DISTRIBUTION_KEYS) &&
      DISTRIBUTION_KEYS.every((key) => validCountMap(value[key])),
  );
}

function validResearch(research, claimedSeats) {
  if (
    !hasExactKeys(research, [
      "consentedCount",
      "consentedPercentage",
      "distributions",
      "suppressed",
    ]) ||
    !Number.isSafeInteger(research.consentedCount) ||
    research.consentedCount < 0 ||
    research.consentedCount > claimedSeats ||
    typeof research.consentedPercentage !== "number" ||
    !Number.isFinite(research.consentedPercentage) ||
    research.consentedPercentage < 0 ||
    research.consentedPercentage > 100 ||
    typeof research.suppressed !== "boolean"
  ) {
    return false;
  }
  if (research.suppressed) return research.distributions === null;
  return research.consentedCount >= 5 && validDistributions(research.distributions);
}

function validReport(report) {
  return Boolean(
    hasExactKeys(report, [
      "branding",
      "invitation",
      "name",
      "partnerId",
      "research",
      "seats",
      "status",
      "updatedAt",
    ]) &&
      typeof report.partnerId === "string" &&
      /^[a-z0-9-]{3,50}$/.test(report.partnerId) &&
      typeof report.name === "string" &&
      validBranding(report.branding) &&
      report.name === report.branding.name &&
      (report.status === "active" || report.status === "suspended") &&
      hasExactKeys(report.invitation, ["status"]) &&
      report.invitation.status === report.status &&
      hasExactKeys(report.seats, ["available", "claimed", "limit"]) &&
      Number.isSafeInteger(report.seats.claimed) &&
      report.seats.claimed >= 0 &&
      Number.isSafeInteger(report.seats.available) &&
      report.seats.available >= 0 &&
      Number.isSafeInteger(report.seats.limit) &&
      report.seats.limit >= 1 &&
      report.seats.claimed + report.seats.available === report.seats.limit &&
      isCanonicalIsoDate(report.updatedAt) &&
      validResearch(report.research, report.seats.claimed)
  );
}

function validAccess(access, { allowNone = true } = {}) {
  if (allowNone && hasExactKeys(access, ["status"]) && access.status === "none") {
    return true;
  }
  return Boolean(
    hasExactKeys(access, ["branding", "name", "partnerId", "status"]) &&
      (access.status === "active" || access.status === "suspended") &&
      typeof access.partnerId === "string" &&
      /^[a-z0-9-]{3,50}$/.test(access.partnerId) &&
      typeof access.name === "string" &&
      validBranding(access.branding) &&
      access.name === access.branding.name
  );
}

function productionEndpoint(apiOrigin) {
  try {
    const origin = new URL(apiOrigin);
    if (
      origin.protocol !== "https:" ||
      origin.username !== "" ||
      origin.password !== "" ||
      origin.search !== "" ||
      origin.hash !== "" ||
      origin.pathname !== "/"
    ) {
      throw safeProvisioningError("A secure API origin is required");
    }
    return (path) => new URL(path, `${origin.origin}/`).toString();
  } catch (error) {
    if (error?.message === "A secure API origin is required") throw error;
    throw safeProvisioningError("A secure API origin is required");
  }
}

export async function preflightSponsoredProvisioning({
  apiOrigin,
  inviteToken,
  adminToken,
  firebaseClient,
  partnerOperations,
} = {}) {
  const apiEndpointImpl = productionEndpoint(apiOrigin);
  if (
    typeof inviteToken !== "string" ||
    inviteToken.length === 0 ||
    typeof adminToken !== "string" ||
    adminToken.length === 0 ||
    typeof firebaseClient?.getProject !== "function" ||
    typeof partnerOperations?.previewInvite !== "function" ||
    typeof partnerOperations?.fetchPartnerReport !== "function"
  ) {
    throw safeProvisioningError("Provisioning preflight configuration is invalid");
  }

  let preview;
  let report;
  let project;
  try {
    [preview, report, project] = await Promise.all([
      partnerOperations.previewInvite({ inviteToken, apiEndpointImpl }),
      partnerOperations.fetchPartnerReport({ adminToken, apiEndpointImpl }),
      firebaseClient.getProject(),
    ]);
  } catch {
    throw safeProvisioningError("Provisioning preflight could not be verified");
  }

  if (!validPreview(preview) || !validReport(report)) {
    throw safeProvisioningError("Provisioning preflight returned an invalid response");
  }
  if (
    preview.partnerId !== report.partnerId ||
    preview.branding.name !== report.name ||
    report.status !== "active" ||
    report.invitation.status !== "active" ||
    preview.seatAvailable !== true
  ) {
    throw safeProvisioningError("Provisioning partner is not eligible");
  }
  if (
    report.seats.claimed !== EXPECTED_SEATS.claimed ||
    report.seats.available !== EXPECTED_SEATS.available ||
    report.seats.limit !== EXPECTED_SEATS.limit
  ) {
    throw safeProvisioningError("Provisioning requires an empty 500-seat pilot");
  }
  if (
    !hasExactKeys(project, ["projectId"]) ||
    project.projectId !== EXPECTED_FIREBASE_PROJECT_ID
  ) {
    throw safeProvisioningError("Provisioning Firebase project does not match");
  }

  return {
    partnerId: report.partnerId,
    partnerName: report.name,
    firebaseProjectId: project.projectId,
    seats: { ...EXPECTED_SEATS },
  };
}

function validPreflight(preflight) {
  return Boolean(
    hasExactKeys(preflight, ["firebaseProjectId", "partnerId", "partnerName", "seats"]) &&
      typeof preflight.partnerId === "string" &&
      /^[a-z0-9-]{3,50}$/.test(preflight.partnerId) &&
      typeof preflight.partnerName === "string" &&
      preflight.partnerName === preflight.partnerName.trim() &&
      preflight.firebaseProjectId === EXPECTED_FIREBASE_PROJECT_ID &&
      hasExactKeys(preflight.seats, ["available", "claimed", "limit"]) &&
      preflight.seats.claimed === EXPECTED_SEATS.claimed &&
      preflight.seats.available === EXPECTED_SEATS.available &&
      preflight.seats.limit === EXPECTED_SEATS.limit
  );
}

function safeRowError(row, reason) {
  return safeProvisioningError(
    `Sponsored account ${row.accountNumber} (${row.username}) ${reason}`,
  );
}

function credentialsFor(row) {
  return { email: usernameToAuthEmail(row.username), password: row.password };
}

function isRetryable(error) {
  if (error?.code === "UNAVAILABLE" || error?.code === "PARTNER_UNAVAILABLE") {
    return true;
  }
  if (error?.code === "RATE_LIMITED") return error?.status === 429;
  if (typeof error?.code === "string") return false;
  return (
    error?.status === 429 ||
    (Number.isInteger(error?.status) && error.status >= 500 && error.status <= 599)
  );
}

function isDefinitiveClaimRejection(error) {
  return [
    "PARTNER_FULL",
    "INVALID_INVITE",
    "PARTNER_SUSPENDED",
    "ALREADY_SPONSORED",
  ].includes(error?.code);
}

async function withBoundedRetries(operation, backoff) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return { ok: true, value: await operation() };
    } catch (error) {
      if (!isRetryable(error) || attempt === 3) return { ok: false, error };
      try {
        await backoff(attempt);
      } catch {
        return {
          ok: false,
          error: safeProvisioningError("Provisioning retry was interrupted"),
        };
      }
    }
  }
  return { ok: false, error: safeProvisioningError("Provisioning operation failed") };
}

async function authenticatePending(row, firebaseClient, backoff) {
  const signIn = await withBoundedRetries(
    () => firebaseClient.signIn(credentialsFor(row)),
    backoff,
  );
  if (signIn.ok) return { ...signIn.value, created: false };
  if (signIn.error?.code !== "INVALID_LOGIN_CREDENTIALS") throw signIn.error;

  const creation = await withBoundedRetries(
    () => firebaseClient.createAccount(credentialsFor(row)),
    backoff,
  );
  if (!creation.ok) throw creation.error;
  return { ...creation.value, created: true };
}

function isExpectedActiveAccess(access, preflight) {
  return (
    validAccess(access) &&
    access.status === "active" &&
    access.partnerId === preflight.partnerId &&
    access.name === preflight.partnerName
  );
}

function assertValidAccountResult(result) {
  if (
    !hasExactKeys(result, ["idToken", "uid"]) ||
    typeof result.uid !== "string" ||
    result.uid.length === 0 ||
    typeof result.idToken !== "string" ||
    result.idToken.length === 0
  ) {
    throw safeProvisioningError("Firebase authentication returned an invalid response");
  }
  return result;
}

export async function provisionSponsoredRoster({
  rows: initialRows,
  apiOrigin,
  inviteToken,
  preflight,
  firebaseClient,
  partnerOperations,
  persistRows,
  onProgress,
  backoff,
} = {}) {
  const apiEndpointImpl = productionEndpoint(apiOrigin);
  if (
    !validPreflight(preflight) ||
    typeof inviteToken !== "string" ||
    inviteToken.length === 0 ||
    typeof firebaseClient?.signIn !== "function" ||
    typeof firebaseClient?.createAccount !== "function" ||
    typeof partnerOperations?.fetchPartnerAccess !== "function" ||
    typeof partnerOperations?.claimPartnerSeat !== "function" ||
    typeof persistRows !== "function" ||
    typeof onProgress !== "function" ||
    typeof backoff !== "function"
  ) {
    throw safeProvisioningError("Provisioning configuration is invalid");
  }
  summarizeRoster(initialRows);

  let rows = initialRows.map((row) => ({ ...row }));
  let active = 0;
  let pending = 0;
  let failed = 0;

  const reportProgress = async (row, status) => {
    try {
      await onProgress({ accountNumber: row.accountNumber, username: row.username, status });
    } catch {
      throw safeRowError(row, "could not report progress");
    }
  };

  const fetchAccess = (idToken) =>
    partnerOperations.fetchPartnerAccess({ idToken, apiEndpointImpl });

  const activate = async (row) => {
    const nextRows = markRosterActive(rows, row.accountNumber);
    try {
      await persistRows(nextRows);
    } catch {
      throw safeRowError(row, "could not persist active status");
    }
    rows = nextRows;
    active += 1;
    await reportProgress(row, "active");
  };

  for (const originalRow of initialRows) {
    const row = rows[originalRow.accountNumber - 1];
    if (row.status === "active") {
      const authentication = await withBoundedRetries(
        () => firebaseClient.signIn(credentialsFor(row)),
        backoff,
      );
      if (!authentication.ok) {
        throw safeRowError(row, "could not be authenticated");
      }
      let account;
      try {
        account = assertValidAccountResult(authentication.value);
      } catch {
        throw safeRowError(row, "could not be authenticated");
      }

      const access = await withBoundedRetries(() => fetchAccess(account.idToken), backoff);
      if (!access.ok) {
        throw safeRowError(row, "could not be verified");
      }
      if (!isExpectedActiveAccess(access.value, preflight)) {
        throw safeRowError(row, "has conflicting sponsored access");
      }
      active += 1;
      await reportProgress(row, "active");
      continue;
    }

    let authentication;
    try {
      const result = await authenticatePending(row, firebaseClient, backoff);
      authentication = { ...assertValidAccountResult({ uid: result.uid, idToken: result.idToken }), created: result.created };
    } catch {
      throw safeRowError(row, "could not be authenticated");
    }

    const accessResult = await withBoundedRetries(
      () => fetchAccess(authentication.idToken),
      backoff,
    );
    if (!accessResult.ok) {
      if (isRetryable(accessResult.error)) {
        pending += 1;
        await reportProgress(row, "pending");
        continue;
      }
      throw safeRowError(row, "could not be verified");
    }
    const access = accessResult.value;
    if (!validAccess(access)) {
      throw safeRowError(row, "has malformed sponsored access");
    }

    if (isExpectedActiveAccess(access, preflight)) {
      await activate(row);
      continue;
    }
    if (access.status !== "none") {
      throw safeRowError(row, "has conflicting sponsored access");
    }

    const claimResult = await withBoundedRetries(
      () =>
        partnerOperations.claimPartnerSeat({
          idToken: authentication.idToken,
          inviteToken,
          researchConsent: false,
          apiEndpointImpl,
        }),
      backoff,
    );
    if (claimResult.ok) {
      if (!isExpectedActiveAccess(claimResult.value, preflight)) {
        throw safeRowError(row, "received conflicting sponsored access");
      }
      await activate(row);
      continue;
    }

    if (isRetryable(claimResult.error)) {
      const reconciliation = await withBoundedRetries(
        () => fetchAccess(authentication.idToken),
        backoff,
      );
      if (!reconciliation.ok) {
        if (isRetryable(reconciliation.error)) {
          pending += 1;
          await reportProgress(row, "pending");
          continue;
        }
        throw safeRowError(row, "could not reconcile sponsored access");
      }
      if (isExpectedActiveAccess(reconciliation.value, preflight)) {
        await activate(row);
        continue;
      }
      if (validAccess(reconciliation.value) && reconciliation.value.status === "none") {
        pending += 1;
        await reportProgress(row, "pending");
        continue;
      }
      throw safeRowError(row, "has conflicting sponsored access");
    }

    if (isDefinitiveClaimRejection(claimResult.error)) {
      let cleanupAccess;
      let cleanupVerified = true;
      try {
        cleanupAccess = await fetchAccess(authentication.idToken);
      } catch {
        cleanupVerified = false;
      }
      if (cleanupVerified && isExpectedActiveAccess(cleanupAccess, preflight)) {
        await activate(row);
        continue;
      }
      if (cleanupVerified && !validAccess(cleanupAccess)) {
        throw safeRowError(row, "has malformed sponsored access");
      }
      if (cleanupVerified && cleanupAccess.status !== "none") {
        throw safeRowError(row, "has conflicting sponsored access");
      }
      if (authentication.created && cleanupVerified && cleanupAccess.status === "none") {
        if (typeof firebaseClient.deleteAccount !== "function") {
          throw safeRowError(row, "could not clean up rejected account");
        }
        try {
          await firebaseClient.deleteAccount({ idToken: authentication.idToken });
        } catch {
          throw safeRowError(row, "could not clean up rejected account");
        }
      }
      failed += 1;
      await reportProgress(row, "failed");
      continue;
    }

    throw safeRowError(row, "could not claim sponsored access");
  }

  return { active, pending, failed };
}
