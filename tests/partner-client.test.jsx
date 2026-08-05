import React from "react";
import { readFileSync } from "node:fs";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import postcss from "postcss";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

await vi.hoisted(async () => {
  globalThis.React = (await import("react")).default;
});

import App from "../src/App.jsx";
import AppShell from "../src/components/AppShell.jsx";
import Landing from "../src/screens/Landing.jsx";
import PartnerDashboard, {
  buildPartnerReportCsv,
} from "../src/screens/PartnerDashboard.jsx";
import ProfileInterview from "../src/screens/ProfileInterview.jsx";
import PartnerAccessErrorScreen from "../src/screens/PartnerAccessError.jsx";
import Settings from "../src/screens/Settings.jsx";
import {
  challengesByOrder,
  examsByOrder,
  lessonsByOrder,
} from "../src/data/lessons.js";
import { PartnerAccessError } from "../src/services/partnerAccess.js";
import { storePartnerClaimRecovery } from "../src/utils/partnerClaimRecovery.js";

const appStyles = readFileSync("src/index.css", "utf8");

const TOKEN = "a".repeat(43);
const scheduleTimeout = window.setTimeout.bind(window);
const PARTNER = {
  name: "Community Partner",
  logoPath: null,
  accent: "#2F6B61",
};
const ACTIVE_PARTNER_ACCESS = {
  status: "active",
  partnerId: "community-partner",
  name: "Community Partner",
  branding: PARTNER,
};
const BRANDED_PARTNER = {
  ...PARTNER,
  logoPath: "/partners/community-partner.svg",
};
const PARTNER_RELEASE_RECOVERY_KEY = "everwise-partner-release-receipt";
const PARTNER_RELEASE_CONFIRMABLE_KEY = "everwise-partner-release-confirmable";
const PARTNER_CLAIM_RECOVERY_KEY = "everwise-partner-claim-recovery";

function storeConfirmablePartnerRecovery(
  receipt,
  expiresAt = "2099-08-03T00:00:00.000Z",
) {
  window.sessionStorage.setItem(
    PARTNER_RELEASE_RECOVERY_KEY,
    JSON.stringify({ receipt, expiresAt, state: "prepared" }),
  );
  window.sessionStorage.setItem(
    PARTNER_RELEASE_CONFIRMABLE_KEY,
    JSON.stringify({ receipt, expiresAt, state: "confirmable" }),
  );
}

function storeByteExactConfirmablePartnerRecovery(
  receipt,
  expiresAt = "2099-08-04T00:00:00.000Z",
) {
  const prepared = `{
  "state": "prepared",
  "expiresAt": "${expiresAt}",
  "receipt": "${receipt}"
}`;
  const confirmable = `{
  "receipt": "${receipt}",
  "state": "confirmable",
  "expiresAt": "${expiresAt}"
}`;
  window.sessionStorage.setItem(PARTNER_RELEASE_RECOVERY_KEY, prepared);
  window.sessionStorage.setItem(PARTNER_RELEASE_CONFIRMABLE_KEY, confirmable);
  return { confirmable, prepared };
}

function storeMatchingPartnerClaimRecovery(uid) {
  const stored = storePartnerClaimRecovery({
    storage: window.sessionStorage,
    now: Date.now(),
    uid,
    inviteToken: TOKEN,
    partner: { name: "Community Partner" },
    profileBase: {
      name: "Jane",
      email: "jane@example.com",
      profileInterview: {
        age: 74,
        internetUse: "",
        primaryDevice: "",
        confidence: "",
        scamFrequency: "",
        concerns: [],
        scamScenario: "",
        aiExperience: "",
        accessibilityNeeds: [],
        trustedContact: "",
      },
      onboardingCompleted: true,
      scamsCaught: 0,
      badges: [],
      completedLessons: [],
      trialStartedAt: null,
      subscriptionStatus: "expired",
      plan: null,
    },
    research: null,
  });
  expect(stored).toBe(true);
  return window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY);
}

afterEach(cleanup);

const mocks = vi.hoisted(() => ({
  authCallback: null,
  deferInitialAuth: false,
  initialAuthUser: null,
  beginPartnerRelease: vi.fn(),
  cancelPartnerRelease: vi.fn(),
  claimPartnerSeat: vi.fn(),
  confirmPartnerRelease: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  credential: vi.fn(),
  deleteDoc: vi.fn(),
  deleteUser: vi.fn(),
  cancelBillingSubscription: vi.fn(async () => ({ canceled: false })),
  createBillingCheckout: vi.fn(),
  createBillingPortal: vi.fn(),
  fetchBillingAccess: vi.fn(),
  fetchBillingPlans: vi.fn(),
  fetchPartnerAccess: vi.fn(),
  fetchPartnerReport: vi.fn(),
  getDoc: vi.fn(),
  previewInvite: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  resolveProvisionedLogin: vi.fn(),
  reload: vi.fn(),
  setDoc: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateDoc: vi.fn(),
  rotatePartnerInvite: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  EmailAuthProvider: { credential: mocks.credential },
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  deleteUser: mocks.deleteUser,
  onAuthStateChanged: vi.fn((_auth, callback) => {
    mocks.authCallback = callback;
    if (!mocks.deferInitialAuth) callback(mocks.initialAuthUser);
    return vi.fn();
  }),
  reauthenticateWithCredential: mocks.reauthenticateWithCredential,
  reload: mocks.reload,
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  signOut: mocks.signOut,
}));

vi.mock("firebase/firestore", () => ({
  Timestamp: { now: vi.fn(() => ({ seconds: 1 })) },
  deleteDoc: mocks.deleteDoc,
  doc: vi.fn((_db, collection, uid) => ({ collection, uid })),
  getDoc: mocks.getDoc,
  setDoc: mocks.setDoc,
  updateDoc: mocks.updateDoc,
}));

vi.mock("../src/firebase", () => ({ auth: {}, db: {} }));
vi.mock("../src/services/billingAccess.js", () => ({
  cancelBillingSubscription: mocks.cancelBillingSubscription,
  createBillingCheckout: mocks.createBillingCheckout,
  createBillingPortal: mocks.createBillingPortal,
  fetchBillingAccess: mocks.fetchBillingAccess,
  fetchBillingPlans: mocks.fetchBillingPlans,
}));
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: vi.fn(() => "web"),
    isNativePlatform: vi.fn(() => false),
  },
}));
vi.mock("@capacitor/keyboard", () => ({
  Keyboard: { setAccessoryBarVisible: vi.fn(() => Promise.resolve()) },
}));
vi.mock("../src/services/purchases", () => ({
  getCurrentEntitlement: vi.fn(),
  getSubscriptionProducts: vi.fn(() => Promise.resolve([])),
  nativePurchasesAvailable: vi.fn(() => false),
  planForProduct: vi.fn(),
  purchaseSubscription: vi.fn(),
  restoreSubscriptions: vi.fn(),
}));
vi.mock("../src/utils/apiEndpoint", () => ({
  apiEndpoint: vi.fn((path) => path),
  warnIfNativeApiIsMissing: vi.fn(),
}));
vi.mock("../src/services/partnerAccess.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    beginPartnerRelease: mocks.beginPartnerRelease,
    cancelPartnerRelease: mocks.cancelPartnerRelease,
    claimPartnerSeat: mocks.claimPartnerSeat,
    confirmPartnerRelease: mocks.confirmPartnerRelease,
    fetchPartnerAccess: mocks.fetchPartnerAccess,
    fetchPartnerReport: mocks.fetchPartnerReport,
    previewInvite: mocks.previewInvite,
    resolveProvisionedLogin: mocks.resolveProvisionedLogin,
    rotatePartnerInvite: mocks.rotatePartnerInvite,
  };
});
vi.mock("../src/screens/Home.jsx", () => ({
  default: ({ onOpenSettings, onStart }) => (
    <div>
      <h1>Home screen</h1>
      <button type="button" onClick={onOpenSettings}>Open Settings</button>
      <button type="button" onClick={onStart}>Open Course</button>
    </div>
  ),
}));
vi.mock("../src/screens/Paywall.jsx", () => ({
  default: () => <h1>Pricing and subscription</h1>,
}));

function makeInterviewPayload(researchConsent, researchSnapshot = null) {
  return {
    name: "Jane",
    age: 74,
    email: "jane@example.com",
    password: "secret12",
    internetUse: "Every day",
    primaryDevice: "Tablet",
    confidence: "Sometimes I need help",
    scamFrequency: "few",
    concerns: ["Suspicious links"],
    scamScenario: "Call the bank using its official number",
    aiExperience: "I’ve heard of it",
    accessibilityNeeds: ["Vision loss"],
    trustedContact: "Maybe later",
    researchConsent,
    researchSnapshot,
  };
}

function learnerProfile(overrides = {}) {
  return {
    name: "Jane",
    email: "jane@example.com",
    profileInterview: {},
    onboardingCompleted: true,
    scamsCaught: 0,
    badges: [],
    completedLessons: [],
    trialStartedAt: null,
    subscriptionStatus: "expired",
    plan: null,
    ...overrides,
  };
}

function profileSnapshot(profile) {
  return {
    exists: () => true,
    data: () => profile,
  };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function mediaMatchesWidth(conditionText, width) {
  const minimum = conditionText.match(/min-width:\s*(\d+)px/);
  const maximum = conditionText.match(/max-width:\s*(\d+)px/);
  return (
    (!minimum || width >= Number(minimum[1])) &&
    (!maximum || width <= Number(maximum[1]))
  );
}

function installStylesForWidth(width) {
  const activeRules = [];
  function collectRules(nodes) {
    for (const node of nodes) {
      if (node.type === "rule") {
        activeRules.push(node.toString());
      } else if (
        node.type === "atrule" &&
        node.name === "media" &&
        mediaMatchesWidth(node.params, width)
      ) {
        collectRules(node.nodes || []);
      } else if (node.type === "atrule" && node.name !== "media") {
        collectRules(node.nodes || []);
      }
    }
  }
  collectRules(postcss.parse(appStyles).nodes);

  const active = document.createElement("style");
  active.textContent = activeRules.join("\n");
  document.head.append(active);
  return () => active.remove();
}

function installMatchMedia(width = 1280) {
  vi.stubGlobal("matchMedia", (query) => ({
    matches: mediaMatchesWidth(query, width),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.scrollTo = vi.fn();
}

function partnerReport({
  branding = PARTNER,
  consentedCount = 5,
  suppressed = false,
} = {}) {
  return {
    partnerId: "community-partner",
    name: "Community Partner",
    status: "active",
    branding,
    seats: { claimed: 6, available: 494, limit: 500 },
    invitation: { status: "active" },
    research: {
      consentedCount,
      consentedPercentage: 83.3,
      suppressed,
      distributions: suppressed
        ? null
        : {
            primaryDevice: { Computer: 2, Smartphone: 1, Tablet: 2 },
            concerns: { "Account hacking": 1, "Suspicious links": 5 },
          },
    },
    updatedAt: "2026-08-02T12:00:00.000Z",
    email: "private@example.com",
    uid: "private-firebase-uid",
    password: "private-password",
    tokenHash: "private-token-hash",
    individuals: [{ name: "Jane Learner", assessment: "private answer" }],
  };
}

describe("aggregate partner dashboard", () => {
  beforeEach(() => {
    mocks.fetchPartnerReport.mockReset();
    mocks.rotatePartnerInvite.mockReset();
  });

  test("shows five-response group totals and exports only aggregate allowlisted CSV", async () => {
    const report = partnerReport();
    mocks.fetchPartnerReport.mockResolvedValue(report);

    render(<PartnerDashboard adminToken={TOKEN} />);

    expect(await screen.findByText(/Reporting for Community Partner/)).toBeVisible();
    expect(screen.getByText("6 of 500 seats in use")).toBeVisible();
    expect(screen.getByText("494 seats available")).toBeVisible();
    expect(screen.getByText("Learner invitation status: Active")).toBeVisible();
    expect(screen.getByText("83.3%")).toBeVisible();
    expect(
      screen.getByRole("row", { name: "Tablet 2 40%" }),
    ).toBeVisible();
    expect(
      screen.getByRole("row", { name: "Suspicious links 5 100%" }),
    ).toBeVisible();
    expect(screen.getByRole("time")).toHaveAttribute(
      "datetime",
      "2026-08-02T12:00:00.000Z",
    );

    const pageText = document.body.textContent;
    for (const privateValue of [
      "private@example.com",
      "private-firebase-uid",
      "private-password",
      "private-token-hash",
      "Jane Learner",
      "private answer",
    ]) {
      expect(pageText).not.toContain(privateValue);
    }
    for (const forbiddenTerm of [
      "name",
      "email",
      "uid",
      "password",
      "token",
      "hash",
      "individual",
    ]) {
      expect(pageText.toLowerCase()).not.toContain(forbiddenTerm);
    }

    const csv = buildPartnerReportCsv(report);
    expect(csv.split("\n")[0]).toBe("metric,category,count,percentage");
    expect(csv).toContain("seats,claimed,6,1.2");
    expect(csv).toContain("primaryDevice,Tablet,2,40");
    expect(csv).toContain('concerns,"Account hacking",1,20');
    for (const forbidden of [
      "name",
      "email",
      "uid",
      "password",
      "token",
      "hash",
      "individual",
      "private answer",
    ]) {
      expect(csv.toLowerCase()).not.toContain(forbidden);
    }
  });

  test("suppresses group breakdowns below five research responses", async () => {
    mocks.fetchPartnerReport.mockResolvedValue(
      partnerReport({ consentedCount: 4, suppressed: true }),
    );

    render(<PartnerDashboard adminToken={TOKEN} />);

    expect(
      await screen.findByText(
        "More responses are needed before group breakdowns can be shown.",
      ),
    ).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  test("fails closed when a four-response report incorrectly includes unsuppressed distributions", async () => {
    const inconsistentReport = partnerReport({
      consentedCount: 4,
      suppressed: false,
    });
    mocks.fetchPartnerReport.mockResolvedValue(inconsistentReport);

    render(<PartnerDashboard adminToken={TOKEN} />);

    expect(
      await screen.findByText(
        "More responses are needed before group breakdowns can be shown.",
      ),
    ).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText("Tablet")).not.toBeInTheDocument();

    const csv = buildPartnerReportCsv(inconsistentReport);
    expect(csv.split("\n")[0]).toBe("metric,category,count,percentage");
    expect(csv).not.toContain("primaryDevice");
    expect(csv).not.toContain("Tablet");
    expect(csv).not.toContain("Suspicious links");
  });

  test("invalid admin access reveals no partner metadata", async () => {
    mocks.fetchPartnerReport.mockRejectedValue(
      new PartnerAccessError("INVALID_ADMIN", 401),
    );

    render(<PartnerDashboard adminToken={TOKEN} />);

    expect(
      await screen.findByText("This admin link is not available."),
    ).toBeVisible();
    expect(screen.queryByText("Community Partner")).not.toBeInTheDocument();
    expect(screen.queryByText(/seat/i)).not.toBeInTheDocument();
  });

  test("confirms invite replacement before showing the one-session learner link", async () => {
    const replacementToken = "r".repeat(43);
    mocks.fetchPartnerReport.mockResolvedValue(partnerReport());
    mocks.rotatePartnerInvite.mockResolvedValue({
      partnerId: "community-partner",
      inviteToken: replacementToken,
    });
    const user = userEvent.setup();

    render(<PartnerDashboard adminToken={TOKEN} />);
    await screen.findByText(/Reporting for Community Partner/);
    const originalUpdatedAt = screen.getByRole("time").getAttribute("datetime");
    const rotationStartedAt = Date.now();
    await user.click(
      screen.getByRole("button", { name: "Replace learner link" }),
    );

    expect(
      screen.getByText(
        "The previous learner link will stop working as soon as you replace it.",
      ),
    ).toBeVisible();
    expect(mocks.rotatePartnerInvite).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Replace link now" }));
    const replacement = await screen.findByLabelText(
      "Replacement learner link",
    );
    expect(replacement).toHaveValue(
      `${window.location.origin}/#partner=${replacementToken}`,
    );
    expect(screen.getByRole("button", { name: "Copy replacement link" })).toBeVisible();
    expect(screen.getAllByDisplayValue(new RegExp(replacementToken))).toHaveLength(1);
    expect(mocks.rotatePartnerInvite).toHaveBeenCalledWith({ adminToken: TOKEN });
    expect(screen.getByRole("time")).not.toHaveAttribute(
      "datetime",
      originalUpdatedAt,
    );
    expect(
      Date.parse(screen.getByRole("time").getAttribute("datetime")),
    ).toBeGreaterThanOrEqual(rotationStartedAt);
  });

  test("routes a scrubbed admin fragment before Firebase learner authentication", async () => {
    mocks.deferInitialAuth = true;
    mocks.authCallback = null;
    mocks.fetchPartnerReport.mockResolvedValue(partnerReport());
    window.history.replaceState(null, "", `/#partner-admin=${TOKEN}`);

    render(<App />);

    expect(await screen.findByText(/Reporting for Community Partner/)).toBeVisible();
    expect(window.location.hash).toBe("");
    expect(mocks.authCallback).toBeNull();
    window.history.replaceState(null, "", "/");
    mocks.deferInitialAuth = false;
  });

  test("shows a safe same-origin partner logo while keeping Everwise primary across dashboard, shell, and Home", async () => {
    const RealHome = (await vi.importActual("../src/screens/Home.jsx")).default;
    mocks.fetchPartnerReport.mockResolvedValue(
      partnerReport({ branding: BRANDED_PARTNER }),
    );
    const { rerender } = render(<PartnerDashboard adminToken={TOKEN} />);

    expect(
      await screen.findByRole("img", { name: "Community Partner logo" }),
    ).toHaveAttribute("src", "/partners/community-partner.svg");
    expect(screen.getByText("Everwise")).toBeVisible();

    rerender(
      <AppShell screen="settings" isAuthenticated partner={BRANDED_PARTNER}>
        <p>Learning</p>
      </AppShell>
    );

    expect(screen.getByText("Everwise")).toBeVisible();
    expect(screen.getByText("Access provided by Community Partner")).toBeVisible();
    expect(
      screen.getByRole("img", { name: "Community Partner logo" }),
    ).toHaveAttribute("src", "/partners/community-partner.svg");

    rerender(
      <RealHome
        partner={BRANDED_PARTNER}
        textSize="size-2"
        onTextSizeChange={() => {}}
        onStart={() => {}}
        onOpenBadges={() => {}}
        onOpenSettings={() => {}}
        onOpenScamChecker={() => {}}
      />,
    );
    expect(screen.getByText("Everwise")).toBeVisible();
    expect(screen.getByText("Access provided by Community Partner")).toBeVisible();
    expect(
      screen.getByRole("img", { name: "Community Partner logo" }),
    ).toHaveAttribute("src", "/partners/community-partner.svg");
  });

  test("keeps Everwise visible and semantically primary before partner attribution at iPad width", () => {
    const previousTextSize = document.documentElement.getAttribute("data-text-size");
    document.documentElement.setAttribute("data-text-size", "size-10");
    const removeViewportStyles = installStylesForWidth(800);

    try {
      render(
        <AppShell screen="settings" isAuthenticated partner={BRANDED_PARTNER}>
          <p>Learning</p>
        </AppShell>,
      );

      const navigation = screen.getByRole("navigation", {
        name: "Primary navigation",
      });
      const everwise = within(navigation).getByText("Everwise", { exact: true });
      const attribution = within(navigation).getByText(
        "Access provided by Community Partner",
      );

      expect(getComputedStyle(navigation).flexDirection).toBe("column");
      expect(everwise).toBeVisible();
      expect(everwise.tagName).toBe("STRONG");
      expect(attribution.tagName).toBe("SMALL");
      expect(
        everwise.compareDocumentPosition(attribution) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).not.toBe(0);
      expect(
        within(navigation).getByRole("img", { name: "Community Partner logo" }),
      ).toBeVisible();
    } finally {
      removeViewportStyles();
      if (previousTextSize === null) {
        document.documentElement.removeAttribute("data-text-size");
      } else {
        document.documentElement.setAttribute("data-text-size", previousTextSize);
      }
    }
  });

  test("never renders or leaks an external partner logo URL", async () => {
    const RealHome = (await vi.importActual("../src/screens/Home.jsx")).default;
    const unsafePartner = {
      ...PARTNER,
      logoPath: "https://tracker.example/private-logo.svg",
    };
    mocks.fetchPartnerReport.mockResolvedValue(
      partnerReport({ branding: unsafePartner }),
    );
    const { container, rerender } = render(
      <PartnerDashboard adminToken={TOKEN} />,
    );
    await screen.findByText(/Reporting for Community Partner/);
    expect(
      screen.queryByRole("img", { name: "Community Partner logo" }),
    ).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("tracker.example");

    rerender(
      <AppShell screen="settings" isAuthenticated partner={unsafePartner}>
        <p>Learning</p>
      </AppShell>,
    );
    expect(
      screen.queryByRole("img", { name: "Community Partner logo" }),
    ).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("tracker.example");

    rerender(
      <RealHome
        partner={unsafePartner}
        textSize="size-2"
        onTextSizeChange={() => {}}
        onStart={() => {}}
        onOpenBadges={() => {}}
        onOpenSettings={() => {}}
        onOpenScamChecker={() => {}}
      />,
    );
    expect(
      screen.queryByRole("img", { name: "Community Partner logo" }),
    ).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("tracker.example");
  });
});

async function reachConsent(user) {
  await user.type(screen.getByLabelText("What should we call you?"), "Jane");
  await user.type(screen.getByLabelText("Your age"), "74");
  await user.click(screen.getByRole("button", { name: "Start" }));
  for (let index = 0; index < 6; index += 1) {
    await user.click(screen.getByRole("button", { name: "Skip" }));
  }
}

async function completeSponsoredAppInterview(user, consentLabel) {
  await user.click(await screen.findByRole("button", { name: "Get Started" }));
  await reachConsent(user);
  await user.click(screen.getByRole("radio", { name: consentLabel }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.type(screen.getByLabelText("Email"), "jane@example.com");
  await user.type(screen.getByLabelText("Choose a password"), "secret12");
  await user.click(screen.getByRole("button", { name: "Build my plan" }));
}

async function openReturningSponsoredSettings(overrides = {}) {
  window.history.replaceState(null, "", "/");
  const returningUser = {
    uid: "returning-sponsored-delete",
    email: "jane@example.com",
    getIdToken: vi.fn(async () => "returning-delete-token"),
    ...overrides,
  };
  const returningProfile = learnerProfile({
    accessSource: "partner",
    partnerId: "community-partner",
  });
  mocks.getDoc.mockResolvedValue(profileSnapshot(returningProfile));
  mocks.fetchPartnerAccess.mockResolvedValue({
    status: "active",
    partnerId: "community-partner",
    name: "Community Partner",
    branding: PARTNER,
  });
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("button", { name: "Get Started" });
  await act(async () => {
    await mocks.authCallback(returningUser);
  });
  await user.click(screen.getByRole("button", { name: "Open Settings" }));
  await user.click(screen.getByRole("button", { name: /^Delete account/i }));
  await user.type(screen.getByLabelText("Current password"), "delete-password");
  return { returningProfile, returningUser, user };
}

async function openReturningPublicSettings(overrides = {}) {
  window.history.replaceState(null, "", "/");
  const returningUser = {
    uid: "returning-public-delete",
    email: "public@example.com",
    getIdToken: vi.fn(async () => "returning-public-token"),
    ...overrides,
  };
  const returningProfile = learnerProfile({ email: returningUser.email });
  mocks.getDoc.mockResolvedValue(profileSnapshot(returningProfile));
  mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("button", { name: "Get Started" });
  await act(async () => {
    await mocks.authCallback(returningUser);
  });
  await user.click(screen.getByRole("button", { name: "Open Settings" }));
  await user.click(screen.getByRole("button", { name: /^Delete account/i }));
  await user.type(screen.getByLabelText("Current password"), "public-password");
  return { returningProfile, returningUser, user };
}

async function switchToPublicAccount(uid) {
  const currentUser = {
    uid,
    email: `${uid}@example.com`,
    getIdToken: vi.fn(async () => `${uid}-token`),
  };
  mocks.getDoc.mockResolvedValue(
    profileSnapshot(learnerProfile({ email: currentUser.email })),
  );
  mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
  await act(async () => {
    await mocks.authCallback(currentUser);
  });
  expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
  return currentUser;
}

async function openReturningSponsoredAppWithFakeTimers({
  uid,
  completedLessons = [],
}) {
  window.history.replaceState(null, "", "/");
  const returningUser = {
    uid,
    email: `${uid}@example.com`,
    getIdToken: vi.fn(async () => `${uid}-token`),
  };
  mocks.getDoc.mockResolvedValue(
    profileSnapshot(
      learnerProfile({
        accessSource: "partner",
        partnerId: "community-partner",
        completedLessons,
      }),
    ),
  );
  const rendered = render(<App />);
  await screen.findByRole("button", { name: "Get Started" });
  vi.useFakeTimers();
  await act(async () => mocks.authCallback(returningUser));
  expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
  return { rendered, returningUser };
}

async function clickWithFakeTimers(element) {
  await act(async () => {
    fireEvent.click(element);
    await Promise.resolve();
  });
}

async function finishVisibleLessonUntilProgressSaveStarts() {
  for (let step = 0; step < 100 && mocks.updateDoc.mock.calls.length === 0; step += 1) {
    const skip =
      screen.queryByRole("button", { name: "Skip this step" }) ||
      screen.queryByRole("button", { name: "Skip" });
    expect(skip).not.toBeNull();
    await clickWithFakeTimers(skip);
  }
  expect(mocks.updateDoc).toHaveBeenCalledTimes(1);
}

async function startStoredPartnerConfirmation(receipt, confirmation) {
  window.history.replaceState(null, "", "/");
  storeConfirmablePartnerRecovery(receipt);
  mocks.confirmPartnerRelease.mockReturnValue(confirmation.promise);
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole("button", { name: "Retry" }));
  await waitFor(() => expect(mocks.confirmPartnerRelease).toHaveBeenCalledTimes(1));
  return user;
}

describe("partner landing and calm errors", () => {
  test("shows verified co-branding and clearly states that access is free", () => {
    render(
      <Landing
        partner={PARTNER}
        onGetStarted={() => {}}
        onLogIn={() => {}}
      />,
    );

    expect(screen.getByText("Everwise with Community Partner")).toBeVisible();
    expect(screen.getByText(/Your access is provided free/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Get Started" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Log In" })).toBeVisible();
  });

  test.each([
    [
      "INVALID_INVITE",
      "This access link is not available. Ask the volunteer or organization that shared it for a new link.",
    ],
    [
      "PARTNER_FULL",
      "All sponsored places are currently in use. Please contact Community Partner for help.",
    ],
    [
      "PARTNER_SUSPENDED",
      "Sponsored access from Community Partner is temporarily unavailable. Please contact Community Partner for help.",
    ],
  ])("shows the approved %s message without a retry action", (code, message) => {
    render(
      <PartnerAccessErrorScreen
        code={code}
        partnerName="Community Partner"
        onRetry={() => {}}
      />,
    );

    expect(screen.getByText(message)).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  test("offers Retry only when sponsored access is temporarily unavailable", () => {
    render(
      <PartnerAccessErrorScreen
        code="PARTNER_UNAVAILABLE"
        partnerName="Community Partner"
        onRetry={() => {}}
      />,
    );

    expect(
      screen.getByText(
        "Sponsored access is temporarily unavailable. Your answers are still here. Please try again.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
  });
});

describe("sponsored settings", () => {
  test("does not promise email recovery for username-only accounts", () => {
    render(
      <Settings
        subscriptionStatus="expired"
        onBack={() => {}}
        onLogOut={() => {}}
        onOpenPaywall={() => {}}
        onManageSubscription={() => {}}
        onDeleteAccount={() => {}}
      />,
    );

    expect(screen.queryByText("Reset password")).not.toBeInTheDocument();
  });

  test("shows the verified provider and removes every subscription control", () => {
    render(
      <Settings
        sponsored
        partner={PARTNER}
        subscriptionStatus="trial"
        trialStartedAt={{ seconds: 1 }}
        plan="monthly"
        onBack={() => {}}
        onLogOut={() => {}}
        onOpenPaywall={() => {}}
        onManageSubscription={() => {}}
        onResetPassword={() => {}}
        onDeleteAccount={() => {}}
      />,
    );

    expect(
      screen.getByText("Full access provided by Community Partner"),
    ).toBeVisible();
    expect(screen.queryByText("Subscription")).not.toBeInTheDocument();
    expect(screen.queryByText("Trial")).not.toBeInTheDocument();
    expect(screen.queryByText("Monthly plan")).not.toBeInTheDocument();
    expect(screen.queryByText("Start free trial")).not.toBeInTheDocument();
    expect(screen.queryByText("Manage subscription")).not.toBeInTheDocument();
  });

  test("requires the current password inside the sponsored destructive flow", async () => {
    const onDeleteAccount = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    render(
      <Settings
        sponsored
        partner={PARTNER}
        subscriptionStatus="expired"
        onBack={() => {}}
        onLogOut={() => {}}
        onOpenPaywall={() => {}}
        onManageSubscription={() => {}}
        onResetPassword={() => {}}
        onDeleteAccount={onDeleteAccount}
      />,
    );

    expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Delete account/i }));
    const password = screen.getByLabelText("Current password");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("button", { name: "Yes, delete" })).toBeDisabled();

    await user.type(password, "private-current-password");
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    await waitFor(() =>
      expect(onDeleteAccount).toHaveBeenCalledWith("private-current-password"),
    );
    expect(password).toHaveValue("");
  });

  test("disables Back, Log out, Cancel, and repeated deletion while sponsored deletion is pending", async () => {
    const pendingDeletion = deferred();
    const onDeleteAccount = vi.fn(() => pendingDeletion.promise);
    const user = userEvent.setup();
    render(
      <Settings
        sponsored
        partner={PARTNER}
        subscriptionStatus="expired"
        onBack={() => {}}
        onLogOut={() => {}}
        onOpenPaywall={() => {}}
        onManageSubscription={() => {}}
        onResetPassword={() => {}}
        onDeleteAccount={onDeleteAccount}
      />,
    );

    await user.click(screen.getByRole("button", { name: /^Delete account/i }));
    await user.type(screen.getByLabelText("Current password"), "delete-password");
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    await waitFor(() => expect(onDeleteAccount).toHaveBeenCalledTimes(1));

    expect(screen.getByRole("button", { name: "Back to home" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Log out" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Deleting…" }));
    expect(onDeleteAccount).toHaveBeenCalledTimes(1);

    pendingDeletion.resolve();
  });

  test("requires recent authentication for public deletion too", async () => {
    const onDeleteAccount = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    render(
      <Settings
        subscriptionStatus="expired"
        onBack={() => {}}
        onLogOut={() => {}}
        onOpenPaywall={() => {}}
        onManageSubscription={() => {}}
        onResetPassword={() => {}}
        onDeleteAccount={onDeleteAccount}
      />,
    );

    await user.click(screen.getByRole("button", { name: /^Delete account/i }));
    const password = screen.getByLabelText("Current password");
    expect(screen.getByRole("button", { name: "Yes, delete" })).toBeDisabled();
    await user.type(password, "public-delete-password");
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    await waitFor(() =>
      expect(onDeleteAccount).toHaveBeenCalledWith("public-delete-password"),
    );
  });
});

describe("sponsored research choice", () => {
  test("requires an explicit optional research choice before account creation", async () => {
    const user = userEvent.setup();
    render(
      <ProfileInterview
        partner={PARTNER}
        onComplete={vi.fn()}
        onBack={() => {}}
        onLogIn={() => {}}
      />,
    );

    await reachConsent(user);

    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.getByText(/answers are not sold/i)).toBeVisible();
    expect(screen.getByText(/Community Partner receives group totals only/i)).toBeVisible();
    expect(screen.getByText(/does not affect your free access/i)).toBeVisible();
    for (const choice of screen.getAllByRole("radio")) {
      expect(choice).toHaveAttribute("aria-checked", "false");
    }

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please choose Yes or No before continuing.",
    );
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });

  test("choosing no still permits account creation and emits no research snapshot", async () => {
    const onComplete = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    render(
      <ProfileInterview
        partner={PARTNER}
        onComplete={onComplete}
        onBack={() => {}}
        onLogIn={() => {}}
      />,
    );
    await reachConsent(user);

    await user.click(
      screen.getByRole("radio", {
        name: "No, use my answers only for my personal plan",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByLabelText("Email")).toBeVisible();
    await user.type(screen.getByLabelText("Email"), "JANE@EXAMPLE.COM");
    await user.type(screen.getByLabelText("Choose a password"), "secret12");
    await user.click(screen.getByRole("button", { name: "Build my plan" }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toMatchObject({
      email: "jane@example.com",
      researchConsent: false,
      researchSnapshot: null,
    });
  });

  test("choosing yes emits a minimized snapshot without direct identifiers", async () => {
    const onComplete = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    render(
      <ProfileInterview
        partner={PARTNER}
        onComplete={onComplete}
        onBack={() => {}}
        onLogIn={() => {}}
      />,
    );
    await reachConsent(user);

    await user.click(
      screen.getByRole("radio", {
        name: "Yes, share a minimized copy to improve EverWise",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Choose a password"), "secret12");
    await user.click(screen.getByRole("button", { name: "Build my plan" }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    const payload = onComplete.mock.calls[0][0];
    expect(payload.researchConsent).toBe(true);
    expect(payload.researchSnapshot).toMatchObject({
      assessmentVersion: "partner-assessment-v2",
      ageBand: "70-79",
    });
    expect(payload.researchSnapshot).not.toHaveProperty("name");
    expect(payload.researchSnapshot).not.toHaveProperty("email");
    expect(payload.researchSnapshot).not.toHaveProperty("age");
    expect(payload.researchSnapshot).not.toHaveProperty("password");
    expect(payload.researchSnapshot).toMatchObject({
      internetUse: "Prefer not to say",
      primaryDevice: "Prefer not to say",
      confidence: "Prefer not to say",
      scamFrequency: "Prefer not to say",
      aiExperience: "Prefer not to say",
    });
  });

  test("keeps the public interview at eight steps without a research choice", async () => {
    const user = userEvent.setup();
    render(
      <ProfileInterview
        onComplete={vi.fn()}
        onBack={() => {}}
        onLogIn={() => {}}
      />,
    );
    await reachConsent(user);

    expect(screen.getByLabelText("Username")).toBeVisible();
    expect(screen.getByText("8 of 8")).toBeVisible();
    expect(screen.queryByText(/answers are not sold/i)).not.toBeInTheDocument();
  });

  test("moves keyboard focus to the heading for each newly displayed onboarding step", async () => {
    const user = userEvent.setup();
    render(
      <ProfileInterview
        onComplete={vi.fn()}
        onBack={vi.fn()}
        onLogIn={vi.fn()}
      />,
    );
    await user.type(screen.getByLabelText("What should we call you?"), "Jane");
    await user.type(screen.getByLabelText("Your age"), "72");
    await user.click(screen.getByRole("button", { name: "Start" }));

    const nextHeading = screen.getByRole("heading", {
      name: "How often do you use the internet, and which device do you use most often?",
    });
    await waitFor(() => expect(nextHeading).toHaveFocus());
    expect(nextHeading).toHaveAttribute("tabindex", "-1");
  });
});

describe("custom radio accessibility", () => {
  test("names every interview radiogroup and supports wrapped arrow-key selection", async () => {
    const user = userEvent.setup();
    render(
      <ProfileInterview
        partner={PARTNER}
        onComplete={vi.fn()}
        onBack={() => {}}
        onLogIn={() => {}}
      />,
    );
    await user.type(screen.getByLabelText("What should we call you?"), "Jane");
    await user.type(screen.getByLabelText("Your age"), "74");
    await user.click(screen.getByRole("button", { name: "Start" }));

    const internetGroup = screen.getByRole("radiogroup", {
      name: "How often do you use the internet?",
    });
    const internetRadios = within(internetGroup).getAllByRole("radio");
    expect(internetRadios[0]).toHaveAttribute("tabindex", "0");
    expect(internetRadios[1]).toHaveAttribute("tabindex", "-1");
    internetRadios[0].focus();
    await user.keyboard("{ArrowLeft}");
    expect(internetRadios.at(-1)).toHaveFocus();
    expect(internetRadios.at(-1)).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Home}");
    expect(internetRadios[0]).toHaveFocus();
    expect(internetRadios[0]).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{End}");
    expect(internetRadios.at(-1)).toHaveFocus();
    internetRadios[1].focus();
    await user.keyboard("{Enter}");
    expect(internetRadios[1]).toHaveAttribute("aria-checked", "true");
    internetRadios[2].focus();
    await user.keyboard(" ");
    expect(internetRadios[2]).toHaveAttribute("aria-checked", "true");

    const deviceGroup = screen.getByRole("radiogroup", {
      name: "Which device do you use most?",
    });
    await user.click(within(deviceGroup).getByRole("radio", { name: "Tablet" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByRole("radiogroup", {
        name: "How confident do you feel online?",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("radiogroup", {
        name: "Have you ever lost money or information to a scam?",
      }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Skip" }));
    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(
      screen.getByRole("radiogroup", {
        name: "What would you do about the urgent bank message?",
      }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(
      screen.getByRole("radiogroup", {
        name: "Have you used artificial intelligence?",
      }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(
      screen.getByRole("radiogroup", {
        name: "Would you like trusted-person help later?",
      }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(
      screen.getByRole("radiogroup", { name: "Optional research choice" }),
    ).toBeVisible();
  });

  test("subscription plan radios use roving focus and arrow, Home, and End keys", async () => {
    const RealPaywall = (await vi.importActual("../src/screens/Paywall.jsx")).default;
    const user = userEvent.setup();
    render(
      <RealPaywall
        onStartTrial={vi.fn()}
        onMaybeLater={() => {}}
        onRestore={vi.fn()}
      />,
    );
    const group = screen.getByRole("radiogroup", {
      name: "Choose a subscription plan",
    });
    const annual = within(group).getByRole("radio", { name: /Annual/i });
    const monthly = within(group).getByRole("radio", { name: /Monthly/i });
    expect(annual).toHaveAttribute("tabindex", "0");
    expect(monthly).toHaveAttribute("tabindex", "-1");

    annual.focus();
    await user.keyboard("{ArrowLeft}");
    expect(monthly).toHaveFocus();
    expect(monthly).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Continue with monthly" })).toBeVisible();
    // Monthly is presented first, so Home lands on it and End on Annual.
    await user.keyboard("{Home}");
    expect(monthly).toHaveFocus();
    expect(monthly).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{End}");
    expect(annual).toHaveFocus();
    expect(annual).toHaveAttribute("aria-checked", "true");
  });

  test("browser paywall does not promise or restore an unavailable App Store purchase", async () => {
    const RealPaywall = (await vi.importActual("../src/screens/Paywall.jsx")).default;
    render(
      <RealPaywall
        purchasesAvailable={false}
        onStartTrial={vi.fn()}
        onMaybeLater={() => {}}
        onRestore={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Continue learning on the web" }),
    ).toBeVisible();
    expect(screen.getByText(/Lesson 1 is free/i)).toBeVisible();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /free trial/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Restore" })).not.toBeInTheDocument();
  });
});

describe("compatible account credentials", () => {
  const completedInterview = {
    name: "Jane",
    age: 74,
    internetUse: "Every day",
    primaryDevice: "Tablet",
    confidence: "Sometimes I need help",
    scamFrequency: "Never",
    concerns: [],
    scamScenario: "Call my bank using the number on my card",
    aiExperience: "No",
    accessibilityNeeds: [],
    trustedContact: "Maybe later",
  };

  test("keeps username signup for the public app", async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(
      <ProfileInterview
        initialInterview={completedInterview}
        onComplete={onComplete}
        onBack={() => {}}
        onLogIn={() => {}}
      />,
    );

    expect(screen.getByLabelText("Username")).toBeVisible();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Username"), " Jane.Miller ");
    await user.type(screen.getByLabelText("Choose a password"), "secret12");
    await user.click(screen.getByRole("button", { name: "Build my plan" }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toMatchObject({
      username: "jane.miller",
      password: "secret12",
    });
    expect(onComplete.mock.calls[0][0]).not.toHaveProperty("email");
  });

  test("keeps recoverable email signup for sponsored learners", () => {
    render(
      <ProfileInterview
        partner={PARTNER}
        initialInterview={{ ...completedInterview, researchConsent: false }}
        onComplete={vi.fn()}
        onBack={() => {}}
        onLogIn={() => {}}
      />,
    );

    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(screen.queryByLabelText("Username")).not.toBeInTheDocument();
  });
});

describe("sponsored signup orchestration", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(window, "setTimeout").mockImplementation((handler, delay, ...args) =>
      scheduleTimeout(handler, delay === 3000 ? 0 : delay, ...args),
    );
    window.history.replaceState(null, "", `/#partner=${TOKEN}`);
    window.sessionStorage.clear();
    mocks.deferInitialAuth = false;
    mocks.initialAuthUser = null;
    mocks.beginPartnerRelease.mockReset();
    mocks.cancelPartnerRelease.mockReset();
    mocks.claimPartnerSeat.mockReset();
    mocks.confirmPartnerRelease.mockReset();
    mocks.createUserWithEmailAndPassword.mockReset();
    mocks.credential.mockReset();
    mocks.deleteDoc.mockReset();
    mocks.deleteUser.mockReset();
    mocks.createBillingCheckout.mockReset();
    mocks.createBillingPortal.mockReset();
    mocks.fetchBillingAccess.mockReset();
    mocks.fetchBillingPlans.mockReset();
    mocks.fetchPartnerAccess.mockReset();
    mocks.getDoc.mockReset();
    mocks.previewInvite.mockReset();
    mocks.reauthenticateWithCredential.mockReset();
    mocks.resolveProvisionedLogin.mockReset();
    mocks.reload.mockReset();
    mocks.setDoc.mockReset();
    mocks.signInWithEmailAndPassword.mockReset();
    mocks.signOut.mockReset();
    mocks.updateDoc.mockReset();
    mocks.previewInvite.mockResolvedValue({
      partnerId: "community-partner",
      branding: PARTNER,
      seatAvailable: true,
    });
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt: "r".repeat(43),
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    mocks.cancelPartnerRelease.mockResolvedValue({ cancelled: true });
    mocks.confirmPartnerRelease.mockResolvedValue({
      released: true,
      idempotent: false,
    });
    mocks.credential.mockImplementation((email, password) => ({ email, password }));
    mocks.deleteDoc.mockResolvedValue(undefined);
    mocks.deleteUser.mockResolvedValue(undefined);
    mocks.fetchBillingAccess.mockResolvedValue({
      access: "none",
      status: "none",
      plan: null,
      canManage: false,
      trialEndsAt: null,
      currentPeriodEnd: null,
    });
    mocks.fetchBillingPlans.mockResolvedValue({ plans: [] });
    mocks.reauthenticateWithCredential.mockResolvedValue(undefined);
    mocks.reload.mockResolvedValue(undefined);
    mocks.resolveProvisionedLogin.mockResolvedValue({
      authEmail: "ewp-0123456789abcdef0123456789abcdef0123456789abcdef@accounts.everwise.app",
    });
    mocks.signOut.mockResolvedValue(undefined);
    mocks.setDoc.mockResolvedValue(undefined);
    mocks.updateDoc.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete Element.prototype.scrollIntoView;
    delete Element.prototype.scrollTo;
    window.history.replaceState(null, "", "/");
  });

  test("roster-style username remains gated when authoritative sponsorship is none", async () => {
    installMatchMedia();
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "roster-style-public-user",
      email: "everwise001@accounts.everwise.app",
      getIdToken: vi.fn(async () => "roster-style-public-token"),
    };
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(
        learnerProfile({
          username: "everwise001",
          subscriptionStatus: "expired",
          completedLessons: ["welcome", "internet"],
        }),
      ),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });

    await act(async () => {
      await mocks.authCallback(returningUser);
    });
    await user.click(screen.getByRole("button", { name: "Open Course" }));
    await user.click(
      screen.getByRole("button", { name: "Start lesson: What is AI?" }),
    );

    expect(
      screen.getByRole("heading", { name: "Pricing and subscription" }),
    ).toBeVisible();
  });

  test("fixed sponsored usernames resolve to an opaque pre-registered Firebase identity", async () => {
    installMatchMedia();
    window.history.replaceState(null, "", "/");
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Log In" }));
    await user.type(screen.getByLabelText("Username or email"), "EverWise001");
    await user.type(screen.getByLabelText("Password"), "Private-password-2!");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(mocks.resolveProvisionedLogin).toHaveBeenCalledWith({
      username: "EverWise001",
    });
    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "ewp-0123456789abcdef0123456789abcdef0123456789abcdef@accounts.everwise.app",
      "Private-password-2!",
    );
    expect(mocks.signInWithEmailAndPassword).not.toHaveBeenCalledWith(
      expect.anything(),
      "everwise001@accounts.everwise.app",
      expect.anything(),
    );
  });

  test("authoritative sponsored membership opens paid lessons and hides subscription controls", async () => {
    installMatchMedia();
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "authoritative-sponsored-user",
      email: "everwise001@accounts.everwise.app",
      getIdToken: vi.fn(async () => "authoritative-sponsored-token"),
    };
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(
        learnerProfile({
          username: "everwise001",
          subscriptionStatus: "expired",
          completedLessons: ["welcome", "internet"],
        }),
      ),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });

    await act(async () => {
      await mocks.authCallback(returningUser);
    });
    await user.click(screen.getByRole("button", { name: "Open Course" }));
    await user.click(
      screen.getByRole("button", { name: "Start lesson: What is AI?" }),
    );

    expect(screen.getByRole("heading", { name: "What is AI?" })).toBeVisible();
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Go back" }));
    await user.click(screen.getByRole("button", { name: "Settings" }));

    expect(
      screen.getByText("Full access provided by Community Partner"),
    ).toBeVisible();
    expect(screen.queryByText("Subscription")).not.toBeInTheDocument();
    expect(screen.queryByText("Start free trial")).not.toBeInTheDocument();
  });

  test("window focus removes suspended sponsorship without ejecting safe Home", async () => {
    installMatchMedia();
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "focus-refresh-sponsored-user",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "focus-refresh-token"),
    };
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({
        accessSource: "partner",
        partnerId: "community-partner",
      })),
    );
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      })
      .mockResolvedValueOnce({
        status: "suspended",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => mocks.authCallback(returningUser));
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();

    await act(async () => window.dispatchEvent(new Event("focus")));

    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
    expect(screen.queryByText(/Full access provided by/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/temporarily unavailable/i)).not.toBeInTheDocument();
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(2);
  });

  test("active sponsored access is revalidated after exactly 60,000 ms", async () => {
    installMatchMedia();
    const timerRefresh = deferred();
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockImplementationOnce(() => timerRefresh.promise);
    await openReturningSponsoredAppWithFakeTimers({
      uid: "timer-refresh-sponsored-user",
    });

    await act(async () => vi.advanceTimersByTimeAsync(59_999));
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(1);

    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(2);

    await act(async () => {
      timerRefresh.resolve(ACTIVE_PARTNER_ACCESS);
      await timerRefresh.promise;
    });
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
  });

  test("only one sponsored refresh interval runs and it stops after logout", async () => {
    installMatchMedia();
    mocks.fetchPartnerAccess.mockResolvedValue(ACTIVE_PARTNER_ACCESS);
    const { returningUser } = await openReturningSponsoredAppWithFakeTimers({
      uid: "single-refresh-interval-user",
    });

    await act(async () => vi.advanceTimersByTimeAsync(120_000));
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(3);

    await act(async () => mocks.authCallback(null));
    expect(screen.getByRole("button", { name: "Get Started" })).toBeVisible();
    const callsAfterLogout = mocks.fetchPartnerAccess.mock.calls.length;

    await act(async () => vi.advanceTimersByTimeAsync(120_000));
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(callsAfterLogout);
    expect(returningUser.getIdToken).toHaveBeenCalledTimes(3);
  });

  test("the sponsored refresh interval stops after unmount", async () => {
    installMatchMedia();
    mocks.fetchPartnerAccess.mockResolvedValue(ACTIVE_PARTNER_ACCESS);
    const { rendered } = await openReturningSponsoredAppWithFakeTimers({
      uid: "unmounted-refresh-interval-user",
    });

    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(2);
    rendered.unmount();

    await act(async () => vi.advanceTimersByTimeAsync(120_000));
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(2);
  });

  test("authoritative none ejects an unfinished protected lesson to the subscription paywall", async () => {
    installMatchMedia();
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockResolvedValueOnce({ status: "none" });
    await openReturningSponsoredAppWithFakeTimers({
      uid: "none-ejects-protected-lesson",
      completedLessons: ["welcome", "internet"],
    });
    await clickWithFakeTimers(screen.getByRole("button", { name: "Open Course" }));
    await clickWithFakeTimers(
      screen.getByRole("button", { name: "Start lesson: What is AI?" }),
    );
    expect(screen.getByRole("heading", { name: "What is AI?" })).toBeVisible();

    await act(async () => vi.advanceTimersByTimeAsync(60_000));

    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(3);
    expect(
      screen.getByRole("heading", { name: "Pricing and subscription" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "What is AI?" }),
    ).not.toBeInTheDocument();
  });

  test("a delayed none refresh does not eject after the learner navigates away", async () => {
    installMatchMedia();
    const pendingRefresh = deferred();
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockImplementationOnce(() => pendingRefresh.promise);
    await openReturningSponsoredAppWithFakeTimers({
      uid: "none-refresh-navigation-race",
      completedLessons: ["welcome", "internet"],
    });
    await clickWithFakeTimers(screen.getByRole("button", { name: "Open Course" }));
    await clickWithFakeTimers(
      screen.getByRole("button", { name: "Start lesson: What is AI?" }),
    );
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(3);

    await clickWithFakeTimers(screen.getByRole("button", { name: "Go back" }));
    expect(screen.getByRole("heading", { name: "Your path" })).toBeVisible();
    await act(async () => {
      pendingRefresh.resolve({ status: "none" });
      await pendingRefresh.promise;
    });

    expect(screen.getByRole("heading", { name: "Your path" })).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Pricing and subscription" }),
    ).not.toBeInTheDocument();
  });

  test("a delayed none refresh observes lesson completion while the progress save is pending", async () => {
    installMatchMedia();
    const pendingRefresh = deferred();
    const pendingProgressSave = deferred();
    mocks.updateDoc.mockReturnValue(pendingProgressSave.promise);
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockImplementationOnce(() => pendingRefresh.promise);
    await openReturningSponsoredAppWithFakeTimers({
      uid: "none-refresh-completion-race",
      completedLessons: ["welcome", "internet"],
    });
    await clickWithFakeTimers(screen.getByRole("button", { name: "Open Course" }));
    await clickWithFakeTimers(
      screen.getByRole("button", { name: "Start lesson: What is AI?" }),
    );
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(3);

    await finishVisibleLessonUntilProgressSaveStarts();
    expect(screen.getByRole("progressbar", { name: "Lesson progress" })).toBeVisible();
    await act(async () => {
      pendingRefresh.resolve({ status: "none" });
      await pendingRefresh.promise;
    });

    expect(
      screen.queryByRole("heading", { name: "Pricing and subscription" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Lesson progress" })).toBeVisible();

    await act(async () => {
      pendingProgressSave.resolve();
      await pendingProgressSave.promise;
    });
    expect(screen.getByRole("heading", { name: "Great Job!" })).toBeVisible();
  });

  test("authoritative none does not eject free Lesson 1", async () => {
    installMatchMedia();
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockResolvedValue({ status: "none" });
    await openReturningSponsoredAppWithFakeTimers({
      uid: "none-keeps-free-lesson",
      completedLessons: ["welcome"],
    });
    await clickWithFakeTimers(screen.getByRole("button", { name: "Open Course" }));
    await clickWithFakeTimers(
      screen.getByRole("button", { name: "Redo completed lesson: Welcome to Everwise" }),
    );
    expect(screen.getByRole("heading", { name: "How Everwise Works" })).toBeVisible();

    await act(async () => vi.advanceTimersByTimeAsync(60_000));

    expect(screen.getByRole("heading", { name: "How Everwise Works" })).toBeVisible();
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  // Completion lives in the learner's own profile document, so it cannot stand
  // in for entitlement: when sponsored access ends, paid lessons close again
  // even if they were previously finished.
  test("authoritative none ejects a completed paid lesson", async () => {
    installMatchMedia();
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockResolvedValue({ status: "none" });
    await openReturningSponsoredAppWithFakeTimers({
      uid: "none-ejects-completed-lesson",
      completedLessons: ["welcome", "internet", "ai"],
    });
    await clickWithFakeTimers(screen.getByRole("button", { name: "Open Course" }));
    await clickWithFakeTimers(
      screen.getByRole("button", { name: "Redo completed lesson: What is AI?" }),
    );
    expect(screen.getByRole("heading", { name: "What is AI?" })).toBeVisible();

    await act(async () => vi.advanceTimersByTimeAsync(60_000));

    expect(screen.queryByRole("heading", { name: "What is AI?" })).not.toBeInTheDocument();
  });

  test(
    "authoritative suspension keeps free Lesson 1 replayable but blocks the next unfinished protected entry",
    async () => {
      installMatchMedia();
      const suspendedAccess = {
        ...ACTIVE_PARTNER_ACCESS,
        status: "suspended",
      };
      mocks.fetchPartnerAccess
        .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
        .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
        .mockResolvedValue(suspendedAccess);
      await openReturningSponsoredAppWithFakeTimers({
        uid: "suspended-replay-free",
        completedLessons: ["welcome"],
      });
      await clickWithFakeTimers(
        screen.getByRole("button", { name: "Open Course" }),
      );
      await clickWithFakeTimers(
        screen.getByRole("button", { name: "Redo completed lesson: Welcome to Everwise" }),
      );
      expect(screen.getByRole("heading", { name: "How Everwise Works" })).toBeVisible();

      await act(async () => vi.advanceTimersByTimeAsync(60_000));

      expect(screen.getByRole("heading", { name: "How Everwise Works" })).toBeVisible();
      expect(screen.queryByText(/temporarily unavailable/i)).not.toBeInTheDocument();
      await clickWithFakeTimers(screen.getByRole("button", { name: "Go back" }));
      await clickWithFakeTimers(
        screen.getByRole("button", { name: "Start lesson: What is the Internet?" }),
      );

      expect(screen.getByText(/temporarily unavailable/i)).toBeVisible();
      expect(screen.getByRole("button", { name: "Log out" })).toBeVisible();
      expect(
        screen.queryByRole("heading", { name: "What is the Internet?" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Pricing and subscription" }),
      ).not.toBeInTheDocument();
    },
  );

  test.each([
    {
      name: "lesson",
      completedLessons: ["welcome", "internet"],
      buttonName: "Start lesson: What is AI?",
      visibleContent: "What is AI?",
    },
    {
      name: "challenge",
      completedLessons: lessonsByOrder.map(({ id }) => id),
      buttonName: `Start challenge: ${challengesByOrder[0].title}`,
      visibleContent: "Quick review",
    },
    {
      name: "exam",
      completedLessons: [
        ...lessonsByOrder.map(({ id }) => id),
        ...challengesByOrder.map(({ id }) => id),
      ],
      buttonName: `Start exam: ${examsByOrder[0].title}`,
      visibleContent: examsByOrder[0].title,
    },
  ])("authoritative suspension ejects an unfinished protected $name", async ({
    completedLessons,
    buttonName,
    visibleContent,
  }) => {
    installMatchMedia();
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockResolvedValueOnce({
        ...ACTIVE_PARTNER_ACCESS,
        status: "suspended",
      });
    await openReturningSponsoredAppWithFakeTimers({
      uid: `suspended-${visibleContent.replaceAll(" ", "-")}`,
      completedLessons,
    });
    await clickWithFakeTimers(screen.getByRole("button", { name: "Open Course" }));
    await clickWithFakeTimers(screen.getByRole("button", { name: buttonName }));
    expect(screen.getByText(visibleContent)).toBeVisible();

    await act(async () => vi.advanceTimersByTimeAsync(60_000));

    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(3);
    expect(screen.getByText(/temporarily unavailable/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Log out" })).toBeVisible();
    expect(screen.queryByText(visibleContent)).not.toBeInTheDocument();
  });

  test("a focus refresh coalesces with an older in-flight timer refresh", async () => {
    installMatchMedia();
    const olderTimerRefresh = deferred();
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockImplementationOnce(() => olderTimerRefresh.promise);
    await openReturningSponsoredAppWithFakeTimers({
      uid: "timer-focus-race-user",
    });

    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await Promise.resolve();
    });
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(2);

    await act(async () => {
      olderTimerRefresh.resolve({
        ...ACTIVE_PARTNER_ACCESS,
        status: "suspended",
      });
      await olderTimerRefresh.promise;
    });

    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    await clickWithFakeTimers(
      screen.getByRole("button", { name: "Open Settings" }),
    );
    expect(screen.getByText("Start free trial")).toBeVisible();
    expect(screen.queryByText(/Full access provided by/i)).not.toBeInTheDocument();
  });

  test("a timer response for the previous UID cannot affect the next account", async () => {
    installMatchMedia();
    const previousUidRefresh = deferred();
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce(ACTIVE_PARTNER_ACCESS)
      .mockImplementationOnce(() => previousUidRefresh.promise)
      .mockResolvedValueOnce({ status: "none" });
    await openReturningSponsoredAppWithFakeTimers({
      uid: "previous-timer-user",
    });

    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(2);
    const nextUser = {
      uid: "next-public-user",
      email: "next-public@example.com",
      getIdToken: vi.fn(async () => "next-public-token"),
    };
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(
        learnerProfile({ name: "Next learner", email: nextUser.email }),
      ),
    );
    await act(async () => mocks.authCallback(nextUser));
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();

    await act(async () => {
      previousUidRefresh.resolve({
        ...ACTIVE_PARTNER_ACCESS,
        status: "suspended",
      });
      await previousUidRefresh.promise;
    });
    await clickWithFakeTimers(
      screen.getByRole("button", { name: "Open Settings" }),
    );

    expect(screen.getByText("Start free trial")).toBeVisible();
    expect(screen.queryByText(/temporarily unavailable/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Full access provided by/i)).not.toBeInTheDocument();
  });

  test("an older background refresh cannot overwrite a newer entry suspension", async () => {
    installMatchMedia();
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "out-of-order-refresh-user",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "out-of-order-refresh-token"),
    };
    const olderRefresh = deferred();
    const newerRefresh = deferred();
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({
        accessSource: "partner",
        partnerId: "community-partner",
      })),
    );
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      })
      .mockImplementationOnce(() => olderRefresh.promise)
      .mockImplementationOnce(() => newerRefresh.promise);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => mocks.authCallback(returningUser));
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();

    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await Promise.resolve();
    });
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "Open Course" }));
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Start lesson: Welcome to Everwise",
        }),
      );
      await Promise.resolve();
    });
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(3);
    await act(async () => {
      newerRefresh.resolve({
        status: "suspended",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      });
      await newerRefresh.promise;
    });
    await act(async () => {
      olderRefresh.resolve({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      });
      await olderRefresh.promise;
    });

    await user.click(screen.getByRole("button", { name: "Go back" }));
    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
    expect(screen.queryByText(/Full access provided by/i)).not.toBeInTheDocument();
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(3);
  });

  test("protected lesson entry revalidates active sponsorship before opening content", async () => {
    installMatchMedia();
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "entry-refresh-sponsored-user",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "entry-refresh-token"),
    };
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({
        accessSource: "partner",
        partnerId: "community-partner",
        completedLessons: ["welcome", "internet"],
      })),
    );
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      })
      .mockResolvedValueOnce({ status: "none" });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => mocks.authCallback(returningUser));
    await user.click(screen.getByRole("button", { name: "Open Course" }));
    await user.click(screen.getByRole("button", { name: "Start lesson: What is AI?" }));

    expect(await screen.findByRole("heading", {
      name: "Pricing and subscription",
    })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "What is AI?" })).not.toBeInTheDocument();
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(2);
  });

  test("claims before writing the profile and routes the active learner Home without Paywall", async () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    const order = [];
    const getIdToken = vi.fn(async (forceRefresh) => {
      order.push("id-token");
      expect(forceRefresh).toBe(true);
      return "firebase-id-token";
    });
    const firebaseUser = { uid: "learner-1", getIdToken };
    mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      order.push("firebase-signup");
      return { user: firebaseUser };
    });
    mocks.claimPartnerSeat.mockImplementation(async () => {
      order.push("partner-claim");
      return {
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      };
    });
    mocks.setDoc.mockImplementation(async () => {
      order.push("firestore-profile");
    });
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByText("Everwise with Community Partner")).toBeVisible();

    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );
    await act(async () => {});
    expect(mocks.setDoc).toHaveBeenCalledTimes(1);
    expect(order).toEqual([
      "firebase-signup",
      "id-token",
      "partner-claim",
      "firestore-profile",
    ]);
    expect(mocks.claimPartnerSeat).toHaveBeenCalledWith({
      idToken: "firebase-id-token",
      inviteToken: TOKEN,
      researchConsent: false,
      researchSnapshot: null,
    });
    expect(mocks.setDoc.mock.calls[0][1]).toMatchObject({
      accessSource: "partner",
      partnerId: "community-partner",
    });
    const loggedText = consoleLog.mock.calls
      .flatMap((args) => args)
      .map((value) =>
        typeof value === "string" ? value : JSON.stringify(value),
      )
      .join(" ");
    expect(loggedText).not.toContain("jane@example.com");
    expect(loggedText).not.toContain("profileInterview");

    expect(await screen.findByRole("button", { name: "Start learning" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Start learning" }));
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  test("recovers a committed claim whose successful response was lost", async () => {
    const firebaseUser = {
      uid: "claim-response-lost",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "same-account-token"),
    };
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
    mocks.claimPartnerSeat.mockRejectedValue(
      new PartnerAccessError("PARTNER_UNAVAILABLE", 503),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");

    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );

    expect(await screen.findByRole("button", { name: "Start learning" })).toBeVisible();
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(mocks.claimPartnerSeat).toHaveBeenCalledTimes(1);
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(1);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(mocks.setDoc.mock.calls[0][1]).toMatchObject({
      accessSource: "partner",
      partnerId: "community-partner",
    });
  });

  test("deletes the newly created Firebase user and signs out after a full-seat claim race", async () => {
    const order = [];
    const firebaseUser = {
      uid: "learner-2",
      getIdToken: vi.fn(async () => "firebase-id-token"),
    };
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
    mocks.claimPartnerSeat.mockRejectedValue(
      new PartnerAccessError("PARTNER_FULL", 409),
    );
    mocks.deleteUser.mockImplementation(async () => {
      order.push("delete-user");
    });
    mocks.signOut.mockImplementation(async () => {
      order.push("sign-out");
    });
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByText("Everwise with Community Partner")).toBeVisible();

    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );

    await act(async () => {});
    expect(
      screen.getByText(
        "All sponsored places are currently in use. Please contact Community Partner for help.",
      ),
    ).toBeVisible();
    expect(mocks.deleteUser).toHaveBeenCalledWith(firebaseUser);
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(order).toEqual(["delete-user", "sign-out"]);
    expect(mocks.setDoc).not.toHaveBeenCalled();
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  test("keeps the sponsored account form and its friendly error when Firebase signup fails", async () => {
    mocks.createUserWithEmailAndPassword.mockRejectedValue({
      code: "auth/email-already-in-use",
      message: "Email already in use",
    });
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByText("Everwise with Community Partner")).toBeVisible();

    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("That email already has an account. Try logging in instead.");
    expect(screen.getByLabelText("Email")).toHaveValue("jane@example.com");
    expect(mocks.claimPartnerSeat).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  test("retries an indeterminate claim with the same Firebase UID", async () => {
    const firebaseUser = {
      uid: "learner-retry-same-uid",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "same-id-token"),
    };
    mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      await mocks.authCallback(firebaseUser);
      return { user: firebaseUser };
    });
    mocks.claimPartnerSeat
      .mockRejectedValueOnce(new PartnerAccessError("PARTNER_UNAVAILABLE", 503))
      .mockResolvedValueOnce({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      });
    mocks.fetchPartnerAccess
      .mockRejectedValueOnce(new PartnerAccessError("PARTNER_UNAVAILABLE", 503))
      .mockResolvedValueOnce({ status: "none" });
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByText("Everwise with Community Partner")).toBeVisible();

    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );
    expect(await screen.findByRole("button", { name: "Retry" })).toBeVisible();
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(mocks.setDoc).toHaveBeenCalledTimes(1));
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(mocks.claimPartnerSeat.mock.calls[0][0]).toMatchObject({
      researchConsent: false,
      researchSnapshot: null,
    });
    expect(mocks.claimPartnerSeat.mock.calls[1][0]).toMatchObject({
      researchConsent: false,
      researchSnapshot: null,
    });
    expect(mocks.claimPartnerSeat.mock.calls[1][0].idToken).toBe("same-id-token");
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: "Start learning" })).toBeVisible();
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  test("preserves an ambiguous claim across logout and rehydrates it only for the same UID", async () => {
    const firebaseIdToken = "durable-firebase-id-token";
    const firebaseUser = {
      uid: "durable-claim-owner",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => firebaseIdToken),
    };
    const otherUser = {
      uid: "different-account",
      email: "other@example.com",
      getIdToken: vi.fn(async () => "other-firebase-id-token"),
    };
    mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      await mocks.authCallback(firebaseUser);
      return { user: firebaseUser };
    });
    mocks.claimPartnerSeat
      .mockRejectedValueOnce(new PartnerAccessError("PARTNER_UNAVAILABLE", 503))
      .mockResolvedValueOnce({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      });
    mocks.fetchPartnerAccess
      .mockRejectedValueOnce(new PartnerAccessError("PARTNER_UNAVAILABLE", 503))
      .mockResolvedValue({ status: "none" });
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(
        learnerProfile({ name: "Other learner", email: otherUser.email }),
      ),
    );
    const user = userEvent.setup();
    const rendered = render(<App />);
    await screen.findByText("Everwise with Community Partner");

    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );
    expect(await screen.findByRole("button", { name: "Retry" })).toBeVisible();
    const serializedRecovery = window.sessionStorage.getItem(
      PARTNER_CLAIM_RECOVERY_KEY,
    );
    expect(serializedRecovery).not.toBeNull();
    expect(JSON.parse(serializedRecovery)).toMatchObject({
      version: 1,
      uid: firebaseUser.uid,
      inviteToken: TOKEN,
      partner: { name: "Community Partner" },
      research: null,
    });
    expect(serializedRecovery).not.toContain("secret12");
    expect(serializedRecovery).not.toContain(firebaseIdToken);

    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();
    expect(window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY)).toBe(
      serializedRecovery,
    );

    await act(async () => {
      await mocks.authCallback(otherUser);
    });
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY)).toBe(
      serializedRecovery,
    );

    await act(async () => {
      await mocks.authCallback(firebaseUser);
    });
    expect(await screen.findByRole("button", { name: "Retry" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(mocks.setDoc).toHaveBeenCalledTimes(1));
    expect(mocks.claimPartnerSeat).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole("button", { name: "Start learning" })).toBeVisible();
    expect(window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY)).toBeNull();

    const diagnostics = JSON.stringify([
      ...console.error.mock.calls,
      ...console.warn.mock.calls,
    ]);
    expect(rendered.container.innerHTML).not.toContain("secret12");
    expect(rendered.container.innerHTML).not.toContain(firebaseIdToken);
    expect(diagnostics).not.toContain("secret12");
    expect(diagnostics).not.toContain(firebaseIdToken);
  });

  test("definitive retry rejection clears durable claim recovery after cleanup", async () => {
    const firebaseUser = {
      uid: "durable-definitive-rejection",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "definitive-id-token"),
    };
    mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      await mocks.authCallback(firebaseUser);
      return { user: firebaseUser };
    });
    mocks.claimPartnerSeat
      .mockRejectedValueOnce(new PartnerAccessError("PARTNER_UNAVAILABLE", 503))
      .mockRejectedValueOnce(new PartnerAccessError("PARTNER_FULL", 409));
    mocks.fetchPartnerAccess
      .mockRejectedValueOnce(new PartnerAccessError("PARTNER_UNAVAILABLE", 503))
      .mockResolvedValueOnce({ status: "none" });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");

    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );
    await screen.findByRole("button", { name: "Retry" });
    expect(window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY)).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByText(/All sponsored places are currently in use/i),
    ).toBeVisible();
    expect(mocks.deleteUser).toHaveBeenCalledWith(firebaseUser);
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY)).toBeNull();
  });

  test("expired durable claim recovery is removed during same-UID bootstrap", async () => {
    const firebaseUser = {
      uid: "expired-durable-claim",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "expired-id-token"),
    };
    mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      await mocks.authCallback(firebaseUser);
      return { user: firebaseUser };
    });
    mocks.claimPartnerSeat.mockRejectedValue(
      new PartnerAccessError("PARTNER_UNAVAILABLE", 503),
    );
    mocks.fetchPartnerAccess.mockRejectedValueOnce(
      new PartnerAccessError("PARTNER_UNAVAILABLE", 503),
    );
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");
    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );
    await screen.findByRole("button", { name: "Retry" });
    const expired = JSON.parse(
      window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY),
    );
    expired.createdAt = 0;
    expired.expiresAt = 900_000;
    window.sessionStorage.setItem(
      PARTNER_CLAIM_RECOVERY_KEY,
      JSON.stringify(expired),
    );

    await user.click(screen.getByRole("button", { name: "Log out" }));
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({ email: firebaseUser.email })),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    await act(async () => {
      await mocks.authCallback(firebaseUser);
    });

    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY)).toBeNull();
  });

  test.each([
    ["UNAUTHENTICATED", 401],
    ["RATE_LIMITED", 429],
  ])(
    "preserves the same Firebase UID after retryable %s claim rejection",
    async (code, status) => {
      const firebaseUser = {
        uid: `retry-${code.toLowerCase()}`,
        email: "jane@example.com",
        getIdToken: vi.fn(async () => "same-id-token"),
      };
      mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
        await mocks.authCallback(firebaseUser);
        return { user: firebaseUser };
      });
      mocks.claimPartnerSeat
        .mockRejectedValueOnce(new PartnerAccessError(code, status))
        .mockResolvedValueOnce({
          status: "active",
          partnerId: "community-partner",
          name: "Community Partner",
          branding: PARTNER,
        });
      mocks.fetchPartnerAccess
        .mockRejectedValueOnce(
          new PartnerAccessError("PARTNER_UNAVAILABLE", 503),
        )
        .mockResolvedValueOnce({ status: "none" });
      const user = userEvent.setup();
      render(<App />);
      await screen.findByText("Everwise with Community Partner");

      await completeSponsoredAppInterview(
        user,
        "No, use my answers only for my personal plan",
      );
      await user.click(await screen.findByRole("button", { name: "Retry" }));

      await waitFor(() => expect(mocks.setDoc).toHaveBeenCalledTimes(1));
      expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(mocks.claimPartnerSeat).toHaveBeenCalledTimes(2);
      expect(mocks.claimPartnerSeat.mock.calls[1][0].idToken).toBe(
        "same-id-token",
      );
      expect(mocks.deleteUser).not.toHaveBeenCalled();
      expect(mocks.signOut).not.toHaveBeenCalled();
      expect(
        await screen.findByRole("button", { name: "Start learning" }),
      ).toBeVisible();
    },
  );

  test("restores authoritative sponsored access after reload before routing Home", async () => {
    window.history.replaceState(null, "", "/");
    const accessResult = deferred();
    const returningUser = {
      uid: "returning-sponsored",
      email: "jane@example.com",
      // A returning user's routine access check must not force a token
      // refresh: the server only reads the token's uid, and forcing a
      // refresh on every bootstrap/retry drove repeated auth-state churn
      // that left the billing-fetch effect never settled.
      getIdToken: vi.fn(async (forceRefresh) => {
        expect(forceRefresh).toBeUndefined();
        return "returning-id-token";
      }),
    };
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(
        learnerProfile({
          accessSource: "partner",
          partnerId: "community-partner",
        }),
      ),
    );
    mocks.fetchPartnerAccess.mockReturnValue(accessResult.promise);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });

    let authLoad;
    act(() => {
      authLoad = mocks.authCallback(returningUser);
    });
    await waitFor(() => expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("heading", { name: "Home screen" })).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Starting Everwise" })).toBeVisible();

    await act(async () => {
      accessResult.resolve({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      });
      await authLoad;
    });

    expect(mocks.fetchPartnerAccess).toHaveBeenCalledWith({
      idToken: "returning-id-token",
    });
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(
      screen.getByText("Full access provided by Community Partner"),
    ).toBeVisible();
    expect(screen.queryByText("Start free trial")).not.toBeInTheDocument();
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  test("restores a public profile when Firebase user deletion fails", async () => {
    mocks.deleteUser.mockRejectedValue({
      code: "auth/internal-error",
      message: "private Firebase detail",
    });
    const { returningProfile, returningUser, user } =
      await openReturningPublicSettings();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    await waitFor(() => expect(mocks.deleteUser).toHaveBeenCalledWith(returningUser));
    expect(mocks.credential).toHaveBeenCalledWith(
      "public@example.com",
      "public-password",
    );
    expect(mocks.reauthenticateWithCredential).toHaveBeenCalledWith(
      returningUser,
      { email: "public@example.com", password: "public-password" },
    );
    expect(mocks.deleteDoc).toHaveBeenCalledWith({
      collection: "users",
      uid: "returning-public-delete",
    });
    expect(mocks.setDoc).toHaveBeenCalledWith(
      { collection: "users", uid: "returning-public-delete" },
      returningProfile,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not delete your account right now. Your saved profile was restored.",
    );
  });

  test("cancels the subscription before destroying anything on deletion", async () => {
    const { returningUser, user } = await openReturningPublicSettings();
    const order = [];
    mocks.cancelBillingSubscription.mockImplementation(async () => {
      order.push("cancel");
      return { canceled: true };
    });
    mocks.deleteDoc.mockImplementation(async () => {
      order.push("deleteDoc");
    });
    mocks.deleteUser.mockImplementation(async () => {
      order.push("deleteUser");
    });

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    await waitFor(() => expect(mocks.deleteUser).toHaveBeenCalledWith(returningUser));
    expect(mocks.cancelBillingSubscription).toHaveBeenCalledWith(returningUser);
    // Billing must stop first: deleting the Firebase user first would leave a
    // live subscription charging a card its owner can no longer reach.
    expect(order).toEqual(["cancel", "deleteDoc", "deleteUser"]);
  });

  test("aborts deletion and keeps the account when the subscription cannot be cancelled", async () => {
    const { user } = await openReturningPublicSettings();
    mocks.cancelBillingSubscription.mockRejectedValue(
      new Error("billing unavailable"),
    );

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    await waitFor(() =>
      expect(mocks.cancelBillingSubscription).toHaveBeenCalledTimes(1),
    );
    // Nothing may be destroyed while the subscription is still live.
    expect(mocks.deleteDoc).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not cancel your subscription/i,
    );
  });

  test("confirmed Firebase deletion clears matching claim recovery after auth signs out first", async () => {
    const { returningUser, user } = await openReturningPublicSettings();
    storeMatchingPartnerClaimRecovery(returningUser.uid);
    mocks.deleteUser.mockImplementation(async () => {
      await mocks.authCallback(null);
    });

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    await waitFor(() => expect(mocks.deleteUser).toHaveBeenCalledWith(returningUser));

    expect(window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY)).toBeNull();
    expect(screen.getByRole("button", { name: "Get Started" })).toBeVisible();
  });

  test("reauthenticates and releases a sponsored account in the exact destructive order", async () => {
    const receipt = "s".repeat(43);
    const order = [];
    const realSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function setItem(key, value) {
      if (key === "everwise-partner-release-receipt") {
        order.push("receipt-durable");
      }
      if (key === "everwise-partner-release-confirmable") {
        order.push("receipt-confirmable");
      }
      return realSetItem.call(this, key, value);
    });
    mocks.reauthenticateWithCredential.mockImplementation(async () => {
      order.push("reauthenticate");
    });
    mocks.beginPartnerRelease.mockImplementation(async () => {
      order.push("release-intent");
      return { receipt, expiresAt: "2099-08-03T00:00:00.000Z" };
    });
    mocks.deleteDoc.mockImplementation(async () => {
      order.push("firestore-profile");
      expect(
        JSON.parse(
          window.sessionStorage.getItem("everwise-partner-release-receipt"),
        ),
      ).toEqual({
        receipt,
        expiresAt: "2099-08-03T00:00:00.000Z",
        state: "prepared",
      });
      expect(
        window.sessionStorage.getItem("everwise-partner-release-confirmable"),
      ).toBeNull();
    });
    mocks.deleteUser.mockImplementation(async () => {
      order.push("firebase-user");
      expect(
        window.sessionStorage.getItem("everwise-partner-release-receipt"),
      ).not.toBeNull();
      expect(
        window.sessionStorage.getItem("everwise-partner-release-confirmable"),
      ).toBeNull();
    });
    mocks.confirmPartnerRelease.mockImplementation(async (options) => {
      order.push("release-confirm");
      expect(options).toEqual({ receipt });
      expect(
        JSON.parse(
          window.sessionStorage.getItem("everwise-partner-release-receipt"),
        ),
      ).toEqual({
        receipt,
        expiresAt: "2099-08-03T00:00:00.000Z",
        state: "prepared",
      });
      expect(
        JSON.parse(
          window.sessionStorage.getItem("everwise-partner-release-confirmable"),
        ),
      ).toEqual({
        receipt,
        expiresAt: "2099-08-03T00:00:00.000Z",
        state: "confirmable",
      });
      return { released: true, idempotent: false };
    });
    const { returningUser, user } = await openReturningSponsoredSettings();
    storeMatchingPartnerClaimRecovery(returningUser.uid);

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();
    expect(order).toEqual([
      "reauthenticate",
      "release-intent",
      "receipt-durable",
      "firestore-profile",
      "firebase-user",
      "receipt-confirmable",
      "release-confirm",
    ]);
    expect(mocks.credential).toHaveBeenCalledWith(
      "jane@example.com",
      "delete-password",
    );
    expect(mocks.reauthenticateWithCredential).toHaveBeenCalledWith(
      returningUser,
      { email: "jane@example.com", password: "delete-password" },
    );
    expect(mocks.beginPartnerRelease).toHaveBeenCalledWith({
      idToken: "returning-delete-token",
    });
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).toBeNull();
    expect(window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY)).toBeNull();
  });

  test("does not begin a sponsored release when reauthentication fails", async () => {
    mocks.reauthenticateWithCredential.mockRejectedValue({
      code: "auth/wrong-password",
      message: "Firebase raw wrong-password detail",
    });
    const { returningUser, user } = await openReturningSponsoredSettings();
    const claimRecovery = storeMatchingPartnerClaimRecovery(returningUser.uid);

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That password isn't right. Please try again.",
    );
    expect(screen.queryByText(/Firebase raw/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Current password")).toHaveValue("");
    expect(mocks.beginPartnerRelease).not.toHaveBeenCalled();
    expect(mocks.deleteDoc).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.cancelPartnerRelease).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY)).toBe(
      claimRecovery,
    );
  });

  test("cancels and aborts before deletion when receipt recovery cannot be durably verified", async () => {
    const receipt = "d".repeat(43);
    const realSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function setItem(key, value) {
      if (key === "everwise-partner-release-receipt") {
        throw new DOMException("Storage is full", "QuotaExceededError");
      }
      return realSetItem.call(this, key, value);
    });
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    const { user } = await openReturningSponsoredSettings();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not safely prepare account deletion. Your account and progress are still here. Please try again.",
    );
    expect(mocks.cancelPartnerRelease).toHaveBeenCalledWith({
      idToken: "returning-delete-token",
      receipt,
    });
    expect(mocks.deleteDoc).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).toBeNull();
  });

  test("reload remains support-only when current cleanup cannot read, remove, or rewrite recovery", async () => {
    const receipt = "j".repeat(43);
    const storageKey = "everwise-partner-release-receipt";
    const realGetItem = Storage.prototype.getItem;
    const realSetItem = Storage.prototype.setItem;
    let recoveryWrites = 0;
    let readBackFailed = false;
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function getItem(key) {
      if (key === storageKey && recoveryWrites === 1 && !readBackFailed) {
        readBackFailed = true;
        throw new Error("read-back failed");
      }
      return realGetItem.call(this, key);
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function setItem(key, value) {
      if (key === storageKey) {
        recoveryWrites += 1;
        if (recoveryWrites > 1) throw new Error("terminal rewrite failed");
      }
      return realSetItem.call(this, key, value);
    });
    const realRemoveItem = Storage.prototype.removeItem;
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function removeItem(key) {
      if (key === storageKey) throw new Error("cleanup failed");
      return realRemoveItem.call(this, key);
    });
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    const { user } = await openReturningSponsoredSettings();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(
      await screen.findByText(/could not safely clear the private deletion recovery record/i),
    ).toBeVisible();
    expect(mocks.deleteDoc).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    cleanup();
    render(<App />);
    expect(
      await screen.findByText(/cannot safely retry the sponsored-place release/i),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
  });

  test.each([
    ["missing", undefined],
    ["expired", "2000-01-01T00:00:00.000Z"],
    ["malformed", "tomorrow"],
  ])("cancels an intent with %s receipt expiry before deleting data", async (_label, expiresAt) => {
    const receipt = "e".repeat(43);
    mocks.beginPartnerRelease.mockResolvedValue({ receipt, expiresAt });
    const { user } = await openReturningSponsoredSettings();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not safely prepare account deletion. Your account and progress are still here. Please try again.",
    );
    expect(mocks.cancelPartnerRelease).toHaveBeenCalledWith({
      idToken: "returning-delete-token",
      receipt,
    });
    expect(mocks.deleteDoc).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).toBeNull();
  });

  test.each([
    ["Firestore profile deletion", "firestore", mocks.deleteDoc],
    ["Firebase user deletion", "firebase", mocks.deleteUser],
  ])("cancels release intent after %s fails while authentication remains valid", async (_label, failedStage, failedMock) => {
    const receipt = "c".repeat(43);
    const order = [];
    mocks.reauthenticateWithCredential.mockImplementation(async () => {
      order.push("reauthenticate");
    });
    mocks.beginPartnerRelease.mockImplementation(async () => {
      order.push("release-intent");
      return { receipt, expiresAt: "2099-08-03T00:00:00.000Z" };
    });
    mocks.deleteDoc.mockImplementation(async () => {
      order.push("firestore-profile");
      if (failedStage === "firestore") throw new Error("delete failed");
    });
    mocks.deleteUser.mockImplementation(async () => {
      order.push("firebase-user");
      if (failedStage === "firebase") throw new Error("delete failed");
    });
    failedMock.mockName(`${failedStage}-deletion`);
    mocks.cancelPartnerRelease.mockImplementation(async () => {
      order.push("release-cancel");
      return { cancelled: true };
    });
    mocks.setDoc.mockImplementation(async () => {
      order.push("profile-restore");
    });
    const { returningProfile, returningUser, user } =
      await openReturningSponsoredSettings();
    const claimRecovery = storeMatchingPartnerClaimRecovery(returningUser.uid);

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not delete your account right now. Please try again.",
    );
    expect(mocks.cancelPartnerRelease).toHaveBeenCalledWith({
      idToken: "returning-delete-token",
      receipt,
    });
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).toBeNull();
    expect(window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY)).toBe(
      claimRecovery,
    );
    if (failedStage === "firebase") {
      expect(mocks.setDoc).toHaveBeenCalledWith(
        { collection: "users", uid: "returning-sponsored-delete" },
        returningProfile,
      );
    } else {
      expect(mocks.setDoc).not.toHaveBeenCalled();
    }
    expect(order).toEqual(
      failedStage === "firestore"
        ? ["reauthenticate", "release-intent", "firestore-profile", "release-cancel"]
        : [
            "reauthenticate",
            "release-intent",
            "firestore-profile",
            "firebase-user",
            "release-cancel",
            "profile-restore",
          ],
    );
  });

  test("confirms release when Firebase deletion committed but its response was lost", async () => {
    const receipt = "q".repeat(43);
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    mocks.deleteUser.mockRejectedValue({
      code: "auth/network-request-failed",
      message: "response lost after commit",
    });
    mocks.reload.mockRejectedValue({
      code: "auth/user-not-found",
      message: "account no longer exists",
    });
    const { returningUser, user } = await openReturningSponsoredSettings();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();
    expect(mocks.reload).toHaveBeenCalledWith(returningUser);
    expect(mocks.cancelPartnerRelease).not.toHaveBeenCalled();
    expect(mocks.setDoc).not.toHaveBeenCalled();
    expect(mocks.confirmPartnerRelease).toHaveBeenCalledWith({ receipt });
    expect(window.sessionStorage.getItem(PARTNER_RELEASE_RECOVERY_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(PARTNER_RELEASE_CONFIRMABLE_KEY)).toBeNull();
  });

  test("retains the receipt when Firebase deletion outcome remains indeterminate", async () => {
    const receipt = "u".repeat(43);
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    mocks.deleteUser.mockRejectedValue({
      code: "auth/network-request-failed",
      message: "deletion response unavailable",
    });
    mocks.reload.mockRejectedValue({
      code: "auth/network-request-failed",
      message: "account lookup unavailable",
    });
    const { returningUser, user } = await openReturningSponsoredSettings();
    const claimRecovery = storeMatchingPartnerClaimRecovery(returningUser.uid);

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(
      await screen.findByText(/could not confirm whether Firebase deleted your account/i),
    ).toBeVisible();
    expect(mocks.cancelPartnerRelease).not.toHaveBeenCalled();
    expect(mocks.setDoc).not.toHaveBeenCalled();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
    expect(
      JSON.parse(window.sessionStorage.getItem(PARTNER_RELEASE_RECOVERY_KEY)),
    ).toEqual({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
      state: "prepared",
      reconciliation: "deletion-status",
    });
    expect(window.sessionStorage.getItem(PARTNER_CLAIM_RECOVERY_KEY)).toBe(
      claimRecovery,
    );
  });

  test("shows support reconciliation when a cancelled Firebase failure cannot restore the profile", async () => {
    const receipt = "h".repeat(43);
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    mocks.deleteUser.mockRejectedValue(new Error("Firebase deletion failed"));
    mocks.cancelPartnerRelease.mockResolvedValue({ cancelled: true });
    mocks.setDoc.mockRejectedValue(new Error("Profile restoration failed"));
    const { returningProfile, user } = await openReturningSponsoredSettings();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(
      await screen.findByText(/could not safely restore your saved profile/i),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Contact support" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Yes, delete" })).not.toBeInTheDocument();
    expect(mocks.cancelPartnerRelease).toHaveBeenCalledTimes(1);
    expect(mocks.setDoc).toHaveBeenCalledWith(
      { collection: "users", uid: "returning-sponsored-delete" },
      returningProfile,
    );
    expect(
      JSON.parse(window.sessionStorage.getItem("everwise-partner-release-receipt")),
    ).toEqual({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
      state: "prepared",
      reconciliation: "compensation",
    });
  });

  test("reload remains support-only when current terminal reconciliation cannot be rewritten", async () => {
    const receipt = "k".repeat(43);
    const storageKey = "everwise-partner-release-receipt";
    const realSetItem = Storage.prototype.setItem;
    let recoveryWrites = 0;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function setItem(key, value) {
      if (key === storageKey) {
        recoveryWrites += 1;
        if (recoveryWrites > 1) throw new Error("terminal rewrite failed");
      }
      return realSetItem.call(this, key, value);
    });
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    mocks.deleteDoc.mockRejectedValue(new Error("profile deletion failed"));
    mocks.cancelPartnerRelease.mockRejectedValue(new Error("cancellation failed"));
    const { user } = await openReturningSponsoredSettings();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(
      await screen.findByText(/could not safely cancel the sponsored-place release/i),
    ).toBeVisible();
    cleanup();
    render(<App />);
    expect(
      await screen.findByText(/cannot safely retry the sponsored-place release/i),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
  });

  test("invalidates a delayed deletion when the learner logs out during reauthentication", async () => {
    const reauthentication = deferred();
    mocks.reauthenticateWithCredential.mockReturnValue(reauthentication.promise);
    const { user } = await openReturningSponsoredSettings();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    await waitFor(() =>
      expect(mocks.reauthenticateWithCredential).toHaveBeenCalledTimes(1),
    );
    await act(async () => {
      await mocks.authCallback(null);
    });
    await act(async () => {
      reauthentication.resolve();
      await reauthentication.promise;
    });

    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();
    expect(mocks.beginPartnerRelease).not.toHaveBeenCalled();
    expect(mocks.deleteDoc).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  test("disables every AppShell destination while sponsored deletion is active", async () => {
    const reauthentication = deferred();
    mocks.reauthenticateWithCredential.mockReturnValue(reauthentication.promise);
    const { user } = await openReturningSponsoredSettings();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    await waitFor(() =>
      expect(mocks.reauthenticateWithCredential).toHaveBeenCalledTimes(1),
    );
    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });
    for (const label of ["Home", "Course", "Scam Checker", "Badges", "Settings"]) {
      expect(within(navigation).getByRole("button", { name: label })).toBeDisabled();
    }
    await user.click(within(navigation).getByRole("button", { name: "Home" }));
    expect(screen.getByRole("heading", { name: "Settings" })).toBeVisible();

    await act(async () => {
      reauthentication.reject({ code: "auth/wrong-password" });
      await reauthentication.promise.catch(() => {});
    });
  });

  test("cancels and compensates a delayed Firestore deletion after an account switch", async () => {
    const firestoreDeletion = deferred();
    mocks.deleteDoc.mockReturnValue(firestoreDeletion.promise);
    const { returningProfile, user } = await openReturningSponsoredSettings();
    const publicUser = {
      uid: "new-public-account",
      email: "public@example.com",
      getIdToken: vi.fn(async () => "new-public-token"),
    };

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    await waitFor(() => expect(mocks.deleteDoc).toHaveBeenCalledTimes(1));
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({ email: "public@example.com" })),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    await act(async () => {
      await mocks.authCallback(publicUser);
    });
    await act(async () => {
      firestoreDeletion.resolve();
      await firestoreDeletion.promise;
    });

    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
    await waitFor(() => expect(mocks.cancelPartnerRelease).toHaveBeenCalledTimes(1));
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.setDoc).toHaveBeenCalledWith(
      { collection: "users", uid: "returning-sponsored-delete" },
      returningProfile,
    );
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).toBeNull();
  });

  test.each([
    [
      "cancellation",
      /could not safely cancel the sponsored-place release/i,
    ],
    [
      "compensation",
      /could not safely restore your saved profile/i,
    ],
    [
      "storage-cleanup",
      /could not safely clear the private deletion recovery record/i,
    ],
  ])("preserves private %s reconciliation after a stale account switch", async (failureKind, supportCopy) => {
    const receipt = "v".repeat(43);
    const firestoreDeletion = deferred();
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    mocks.deleteDoc.mockReturnValue(firestoreDeletion.promise);
    const { user } = await openReturningSponsoredSettings();
    const publicUser = {
      uid: `public-after-${failureKind}`,
      email: "public@example.com",
      getIdToken: vi.fn(async () => "public-token"),
    };
    if (failureKind === "cancellation") {
      mocks.cancelPartnerRelease.mockRejectedValue(new Error("cancel failed"));
    }
    if (failureKind === "compensation") {
      mocks.setDoc.mockRejectedValue(new Error("restore failed"));
    }
    if (failureKind === "storage-cleanup") {
      const realRemoveItem = Storage.prototype.removeItem;
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function removeItem(key) {
        if (key === "everwise-partner-release-receipt") {
          throw new Error("remove failed");
        }
        return realRemoveItem.call(this, key);
      });
    }

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    await waitFor(() => expect(mocks.deleteDoc).toHaveBeenCalledTimes(1));
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({ email: "public@example.com" })),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    await act(async () => {
      await mocks.authCallback(publicUser);
    });
    await act(async () => {
      firestoreDeletion.resolve();
      await firestoreDeletion.promise;
    });

    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(document.body).not.toHaveTextContent(receipt);
    const stored = JSON.parse(
      window.sessionStorage.getItem("everwise-partner-release-receipt"),
    );
    expect(stored).toEqual({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
      state: "prepared",
      reconciliation: failureKind,
    });

    cleanup();
    render(<App />);
    expect(await screen.findByText(supportCopy)).toBeVisible();
    expect(screen.getByRole("link", { name: "Contact support" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(receipt);
  });

  test("stale terminal rewrite failure leaves only support recovery after reload", async () => {
    const receipt = "n".repeat(43);
    const storageKey = "everwise-partner-release-receipt";
    const firestoreDeletion = deferred();
    const realSetItem = Storage.prototype.setItem;
    let recoveryWrites = 0;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function setItem(key, value) {
      if (key === storageKey) {
        recoveryWrites += 1;
        if (recoveryWrites > 1) throw new Error("terminal rewrite failed");
      }
      return realSetItem.call(this, key, value);
    });
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    mocks.deleteDoc.mockReturnValue(firestoreDeletion.promise);
    mocks.setDoc.mockRejectedValue(new Error("restore failed"));
    const { user } = await openReturningSponsoredSettings();
    const publicUser = {
      uid: "public-after-terminal-write-failure",
      email: "public@example.com",
      getIdToken: vi.fn(async () => "public-token"),
    };

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    await waitFor(() => expect(mocks.deleteDoc).toHaveBeenCalledTimes(1));
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({ email: "public@example.com" })),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    await act(async () => {
      await mocks.authCallback(publicUser);
      firestoreDeletion.resolve();
      await firestoreDeletion.promise;
    });

    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
    cleanup();
    render(<App />);
    expect(
      await screen.findByText(/cannot safely retry the sponsored-place release/i),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
  });

  test("confirms the old receipt without clearing a newer account switched during Firebase deletion", async () => {
    const receipt = "w".repeat(43);
    const firebaseDeletion = deferred();
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    mocks.deleteUser.mockReturnValue(firebaseDeletion.promise);
    const { user } = await openReturningSponsoredSettings();
    const publicUser = {
      uid: "public-during-firebase-delete",
      email: "public@example.com",
      getIdToken: vi.fn(async () => "public-token"),
    };

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    await waitFor(() => expect(mocks.deleteUser).toHaveBeenCalledTimes(1));
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({ email: "public@example.com" })),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    await act(async () => {
      await mocks.authCallback(publicUser);
    });
    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Open Course" }));
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    await act(async () => {
      firebaseDeletion.resolve();
      await firebaseDeletion.promise;
    });

    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
    await waitFor(() => expect(mocks.confirmPartnerRelease).toHaveBeenCalledWith({ receipt }));
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).toBeNull();
    expect(screen.queryByText(/Finishing account deletion/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
  });

  test("preserves the old receipt without blocking a newer account switched during confirmation", async () => {
    const receipt = "y".repeat(43);
    const confirmation = deferred();
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    mocks.confirmPartnerRelease.mockReturnValue(confirmation.promise);
    const { user } = await openReturningSponsoredSettings();
    const publicUser = {
      uid: "public-during-confirmation",
      email: "public@example.com",
      getIdToken: vi.fn(async () => "public-token"),
    };

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    await waitFor(() => expect(mocks.confirmPartnerRelease).toHaveBeenCalledTimes(1));
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({ email: "public@example.com" })),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    await act(async () => {
      await mocks.authCallback(publicUser);
    });
    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();

    await act(async () => {
      confirmation.reject(new Error("confirmation unavailable"));
      await confirmation.promise.catch(() => {});
    });

    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(
      JSON.parse(window.sessionStorage.getItem("everwise-partner-release-receipt")),
    ).toEqual({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
      state: "prepared",
    });
    expect(screen.queryByText(/Finishing account deletion/i)).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(receipt);
  });

  test("preserves a post-deletion receipt and retries receipt-only confirmation idempotently", async () => {
    const receipt = "p".repeat(43);
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    mocks.confirmPartnerRelease
      .mockRejectedValueOnce(new Error("confirmation network failure"))
      .mockResolvedValueOnce({ released: true, idempotent: true });
    const { user } = await openReturningSponsoredSettings();
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(
      await screen.findByText(/account has been deleted, but we still need to finish releasing/i),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
    expect(document.body).not.toHaveTextContent(receipt);
    expect(document.body).not.toHaveTextContent("delete-password");
    expect(log.mock.calls.flat().join(" ")).not.toContain(receipt);
    expect(log.mock.calls.flat().join(" ")).not.toContain("delete-password");
    expect(
      JSON.parse(window.sessionStorage.getItem("everwise-partner-release-receipt")),
    ).toEqual({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
      state: "prepared",
    });

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();
    expect(mocks.confirmPartnerRelease).toHaveBeenCalledTimes(2);
    expect(mocks.confirmPartnerRelease.mock.calls).toEqual([
      [{ receipt }],
      [{ receipt }],
    ]);
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).toBeNull();
  });

  test.each(["write", "read-back"])(
    "keeps post-deletion recovery support-only when confirmable %s fails",
    async (failedStep) => {
      const receipt = failedStep === "write" ? "1".repeat(43) : "2".repeat(43);
      const realGetItem = Storage.prototype.getItem;
      const realSetItem = Storage.prototype.setItem;
      let markerWritten = false;
      let markerReadFailed = false;
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(function setItem(key, value) {
        if (key === PARTNER_RELEASE_CONFIRMABLE_KEY) {
          if (failedStep === "write") throw new Error("confirmable write failed");
          markerWritten = true;
        }
        return realSetItem.call(this, key, value);
      });
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(function getItem(key) {
        if (
          key === PARTNER_RELEASE_CONFIRMABLE_KEY &&
          failedStep === "read-back" &&
          markerWritten &&
          !markerReadFailed
        ) {
          markerReadFailed = true;
          throw new Error("confirmable read-back failed");
        }
        return realGetItem.call(this, key);
      });
      mocks.beginPartnerRelease.mockResolvedValue({
        receipt,
        expiresAt: "2099-08-03T00:00:00.000Z",
      });
      const { user } = await openReturningSponsoredSettings();

      await user.click(screen.getByRole("button", { name: "Yes, delete" }));

      expect(
        await screen.findByText(/could not safely clear the private deletion recovery record/i),
      ).toBeVisible();
      expect(mocks.deleteDoc).toHaveBeenCalledTimes(1);
      expect(mocks.deleteUser).toHaveBeenCalledTimes(1);
      expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
      cleanup();
      render(<App />);
      expect(
        await screen.findByText(/could not safely clear the private deletion recovery record/i),
      ).toBeVisible();
      expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    },
  );

  test("marker removal failure after confirmation reloads as support-only recovery", async () => {
    const receipt = "3".repeat(43);
    const realRemoveItem = Storage.prototype.removeItem;
    const realSetItem = Storage.prototype.setItem;
    let markerWritten = false;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function setItem(key, value) {
      if (key === PARTNER_RELEASE_CONFIRMABLE_KEY) markerWritten = true;
      return realSetItem.call(this, key, value);
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function removeItem(key) {
      if (key === PARTNER_RELEASE_CONFIRMABLE_KEY && markerWritten) {
        throw new Error("confirmable cleanup failed");
      }
      return realRemoveItem.call(this, key);
    });
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    const { user } = await openReturningSponsoredSettings();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(
      await screen.findByText(/could not safely clear the private deletion recovery record/i),
    ).toBeVisible();
    expect(mocks.confirmPartnerRelease).toHaveBeenCalledWith({ receipt });
    cleanup();
    render(<App />);
    expect(
      await screen.findByText(/could not safely clear the private deletion recovery record/i),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  test.each([
    ["missing released", {}],
    ["released false", { released: false }],
  ])("retains recovery when confirmation resolves with %s", async (_label, response) => {
    const receipt = "m".repeat(43);
    mocks.beginPartnerRelease.mockResolvedValue({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
    });
    mocks.confirmPartnerRelease.mockResolvedValue(response);
    const { user } = await openReturningSponsoredSettings();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(
      await screen.findByText(/account has been deleted, but we still need to finish releasing/i),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
    expect(mocks.confirmPartnerRelease).toHaveBeenCalledWith({ receipt });
    expect(
      JSON.parse(window.sessionStorage.getItem("everwise-partner-release-receipt")),
    ).toEqual({
      receipt,
      expiresAt: "2099-08-03T00:00:00.000Z",
      state: "prepared",
    });
  });

  test("stops retrying and offers support when confirmation rejects an invalid receipt", async () => {
    const receipt = "t".repeat(43);
    window.history.replaceState(null, "", "/");
    storeConfirmablePartnerRecovery(receipt);
    mocks.confirmPartnerRelease.mockRejectedValue(
      new PartnerAccessError("INVALID_RECEIPT", 400),
    );
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Retry" });

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByText(/cannot safely retry the sponsored-place release/i),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact support" })).toBeVisible();
    expect(document.body).not.toHaveTextContent(receipt);
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).not.toBeNull();
  });

  test("treats an expired stored receipt as terminal without sending confirmation", async () => {
    const receipt = "x".repeat(43);
    window.history.replaceState(null, "", "/");
    window.sessionStorage.setItem(
      "everwise-partner-release-receipt",
      JSON.stringify({
        receipt,
        expiresAt: "2000-01-01T00:00:00.000Z",
        state: "prepared",
      }),
    );
    render(<App />);

    expect(
      await screen.findByText(/cannot safely retry the sponsored-place release/i),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact support" })).toBeVisible();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
    expect(document.body).not.toHaveTextContent(receipt);
  });

  test("treats stored recovery without expiry as terminal support-only evidence", async () => {
    const receipt = "z".repeat(43);
    window.history.replaceState(null, "", "/");
    window.sessionStorage.setItem(
      "everwise-partner-release-receipt",
      JSON.stringify({ receipt, state: "prepared" }),
    );
    render(<App />);

    expect(
      await screen.findByText(/cannot safely retry the sponsored-place release/i),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact support" })).toBeVisible();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
    expect(document.body).not.toHaveTextContent(receipt);
  });

  test("recovers a pending release after reload without authentication or a bearer token", async () => {
    const receipt = "q".repeat(43);
    window.history.replaceState(null, "", "/");
    storeConfirmablePartnerRecovery(receipt);
    mocks.confirmPartnerRelease.mockResolvedValue({ released: true, idempotent: true });
    const user = userEvent.setup();
    render(<App />);

    expect(
      await screen.findByText(/account has been deleted, but we still need to finish releasing/i),
    ).toBeVisible();
    expect(document.body).not.toHaveTextContent(receipt);
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();
    expect(mocks.confirmPartnerRelease).toHaveBeenCalledWith({ receipt });
    expect(mocks.fetchPartnerAccess).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).toBeNull();
  });

  test("does not authorize stored recovery after startup timeout until Firebase explicitly reports signed out", async () => {
    const receipt = "4".repeat(43);
    let authStartupTimeout = null;
    window.setTimeout.mockImplementation((handler, delay, ...args) => {
      if (delay === 2500) {
        authStartupTimeout = handler;
        return 2500;
      }
      return scheduleTimeout(handler, delay === 3000 ? 0 : delay, ...args);
    });
    window.history.replaceState(null, "", "/");
    storeConfirmablePartnerRecovery(receipt);
    mocks.deferInitialAuth = true;
    mocks.confirmPartnerRelease.mockResolvedValue({
      released: true,
      idempotent: true,
    });
    const user = userEvent.setup();
    render(<App />);

    expect(authStartupTimeout).toEqual(expect.any(Function));
    await act(async () => {
      authStartupTimeout();
      await new Promise((resolve) => scheduleTimeout(resolve, 0));
    });

    expect(screen.getByRole("progressbar", { name: "Starting Everwise" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();

    await act(async () => {
      await mocks.authCallback(null);
    });
    await user.click(await screen.findByRole("button", { name: "Retry" }));

    expect(mocks.confirmPartnerRelease).toHaveBeenCalledWith({ receipt });
    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();
  });

  test("lets a delayed authenticated callback win after startup timeout without old receipt work", async () => {
    const receipt = "5".repeat(43);
    let authStartupTimeout = null;
    window.setTimeout.mockImplementation((handler, delay, ...args) => {
      if (delay === 2500) {
        authStartupTimeout = handler;
        return 2500;
      }
      return scheduleTimeout(handler, delay === 3000 ? 0 : delay, ...args);
    });
    window.history.replaceState(null, "", "/");
    storeConfirmablePartnerRecovery(receipt);
    mocks.deferInitialAuth = true;
    render(<App />);

    expect(authStartupTimeout).toEqual(expect.any(Function));
    await act(async () => {
      authStartupTimeout();
      await new Promise((resolve) => scheduleTimeout(resolve, 0));
    });

    expect(screen.getByRole("progressbar", { name: "Starting Everwise" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    await switchToPublicAccount("authenticated-after-timeout");

    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(screen.queryByText(/Finishing account deletion/i)).not.toBeInTheDocument();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(PARTNER_RELEASE_RECOVERY_KEY)).not.toBeNull();
  });

  test("a recovered receipt never replaces a newer user present at startup", async () => {
    const receipt = "u".repeat(43);
    const currentUser = {
      uid: "current-at-startup",
      email: "current@example.com",
      getIdToken: vi.fn(async () => "current-token"),
    };
    window.history.replaceState(null, "", "/");
    storeConfirmablePartnerRecovery(receipt);
    mocks.initialAuthUser = currentUser;
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({ email: "current@example.com" })),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(screen.queryByText(/Finishing account deletion/i)).not.toBeInTheDocument();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
  });

  test("a newer user replaces recovery UI that was already visible", async () => {
    const receipt = "o".repeat(43);
    const currentUser = {
      uid: "current-after-recovery",
      email: "current@example.com",
      getIdToken: vi.fn(async () => "current-token"),
    };
    window.history.replaceState(null, "", "/");
    storeConfirmablePartnerRecovery(receipt);
    render(<App />);
    expect(await screen.findByRole("button", { name: "Retry" })).toBeVisible();
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({ email: "current@example.com" })),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });

    await act(async () => {
      await mocks.authCallback(currentUser);
    });

    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(screen.queryByText(/Finishing account deletion/i)).not.toBeInTheDocument();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
  });

  test("switch during Retry clears only the old receipt after semantic success", async () => {
    const receipt = "i".repeat(43);
    const confirmation = deferred();
    const currentUser = {
      uid: "current-during-retry-success",
      email: "current@example.com",
      getIdToken: vi.fn(async () => "current-token"),
    };
    window.history.replaceState(null, "", "/");
    storeConfirmablePartnerRecovery(receipt);
    mocks.confirmPartnerRelease.mockReturnValue(confirmation.promise);
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Retry" }));
    await waitFor(() => expect(mocks.confirmPartnerRelease).toHaveBeenCalledTimes(1));
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({ email: "current@example.com" })),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    await act(async () => {
      await mocks.authCallback(currentUser);
    });

    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
    await act(async () => {
      confirmation.resolve({ released: true, idempotent: true });
      await confirmation.promise;
    });

    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).toBeNull();
    expect(screen.queryByText(/Finishing account deletion/i)).not.toBeInTheDocument();
  });

  test("switch during Retry retains private recovery after a transient failure", async () => {
    const receipt = "f".repeat(43);
    const confirmation = deferred();
    const currentUser = {
      uid: "current-during-retry-failure",
      email: "current@example.com",
      getIdToken: vi.fn(async () => "current-token"),
    };
    window.history.replaceState(null, "", "/");
    storeConfirmablePartnerRecovery(receipt);
    mocks.confirmPartnerRelease.mockReturnValue(confirmation.promise);
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Retry" }));
    await waitFor(() => expect(mocks.confirmPartnerRelease).toHaveBeenCalledTimes(1));
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({ email: "current@example.com" })),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    await act(async () => {
      await mocks.authCallback(currentUser);
      confirmation.reject(new Error("confirmation unavailable"));
      await confirmation.promise.catch(() => {});
    });

    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).not.toBeNull();
    expect(screen.queryByText(/Finishing account deletion/i)).not.toBeInTheDocument();
  });

  test("old semantic confirmation cannot clear byte-exact newer recovery", async () => {
    const oldReceipt = "6".repeat(43);
    const newerReceipt = "7".repeat(43);
    const confirmation = deferred();
    const user = await startStoredPartnerConfirmation(oldReceipt, confirmation);
    await switchToPublicAccount("newer-after-semantic-success");
    const newer = storeByteExactConfirmablePartnerRecovery(newerReceipt);

    await act(async () => {
      confirmation.resolve({ released: true, idempotent: true });
      await confirmation.promise;
    });

    expect(window.sessionStorage.getItem(PARTNER_RELEASE_RECOVERY_KEY)).toBe(
      newer.prepared,
    );
    expect(window.sessionStorage.getItem(PARTNER_RELEASE_CONFIRMABLE_KEY)).toBe(
      newer.confirmable,
    );
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(screen.queryByText(/Finishing account deletion/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
  });

  test("old invalid-receipt terminalization cannot overwrite byte-exact newer recovery", async () => {
    const oldReceipt = "8".repeat(43);
    const newerReceipt = "9".repeat(43);
    const confirmation = deferred();
    const user = await startStoredPartnerConfirmation(oldReceipt, confirmation);
    await switchToPublicAccount("newer-after-invalid-receipt");
    const newer = storeByteExactConfirmablePartnerRecovery(newerReceipt);

    await act(async () => {
      confirmation.reject(new PartnerAccessError("INVALID_RECEIPT", 400));
      await confirmation.promise.catch(() => {});
    });

    expect(window.sessionStorage.getItem(PARTNER_RELEASE_RECOVERY_KEY)).toBe(
      newer.prepared,
    );
    expect(window.sessionStorage.getItem(PARTNER_RELEASE_CONFIRMABLE_KEY)).toBe(
      newer.confirmable,
    );
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(screen.queryByText(/Finishing account deletion/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
  });

  test.each([
    ["transient rejection", "reject"],
    ["nonsemantic response", "nonsemantic"],
  ])("old %s leaves byte-exact newer recovery and account untouched", async (_label, outcome) => {
    const oldReceipt = outcome === "reject" ? "A".repeat(43) : "B".repeat(43);
    const newerReceipt = outcome === "reject" ? "C".repeat(43) : "D".repeat(43);
    const confirmation = deferred();
    const user = await startStoredPartnerConfirmation(oldReceipt, confirmation);
    await switchToPublicAccount(`newer-after-${outcome}`);
    const newer = storeByteExactConfirmablePartnerRecovery(newerReceipt);

    await act(async () => {
      if (outcome === "reject") {
        confirmation.reject(new Error("confirmation unavailable"));
      } else {
        confirmation.resolve({ released: false });
      }
      await confirmation.promise.catch(() => {});
    });

    expect(window.sessionStorage.getItem(PARTNER_RELEASE_RECOVERY_KEY)).toBe(
      newer.prepared,
    );
    expect(window.sessionStorage.getItem(PARTNER_RELEASE_CONFIRMABLE_KEY)).toBe(
      newer.confirmable,
    );
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(screen.queryByText(/Finishing account deletion/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
  });

  test("old cleanup failure cannot terminalize byte-exact newer recovery", async () => {
    const oldReceipt = "E".repeat(43);
    const newerReceipt = "F".repeat(43);
    const confirmation = deferred();
    const realRemoveItem = Storage.prototype.removeItem;
    let newerInstalled = false;
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function removeItem(key) {
      if (newerInstalled && key === PARTNER_RELEASE_CONFIRMABLE_KEY) {
        throw new Error("newer confirmation marker is not removable");
      }
      return realRemoveItem.call(this, key);
    });
    const user = await startStoredPartnerConfirmation(oldReceipt, confirmation);
    await switchToPublicAccount("newer-after-cleanup-failure");
    const newer = storeByteExactConfirmablePartnerRecovery(newerReceipt);
    newerInstalled = true;

    await act(async () => {
      confirmation.resolve({ released: true, idempotent: true });
      await confirmation.promise;
    });

    expect(window.sessionStorage.getItem(PARTNER_RELEASE_RECOVERY_KEY)).toBe(
      newer.prepared,
    );
    expect(window.sessionStorage.getItem(PARTNER_RELEASE_CONFIRMABLE_KEY)).toBe(
      newer.confirmable,
    );
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(screen.queryByText(/Finishing account deletion/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
  });

  test("ignores and clears corrupted release recovery storage safely", async () => {
    window.history.replaceState(null, "", "/");
    window.sessionStorage.setItem(
      "everwise-partner-release-receipt",
      JSON.stringify({ receipt: "not-a-receipt", password: "must-not-survive" }),
    );
    render(<App />);

    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();
    expect(window.sessionStorage.getItem("everwise-partner-release-receipt")).toBeNull();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
  });

  test("continues safely when session storage is unavailable", async () => {
    window.history.replaceState(null, "", "/");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    render(<App />);

    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();
    expect(mocks.confirmPartnerRelease).not.toHaveBeenCalled();
  });

  test("treats a confirmed missing partner membership as ordinary public access", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "former-sponsored",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "former-id-token"),
    };
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(
        learnerProfile({
          accessSource: "partner",
          partnerId: "community-partner",
        }),
      ),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });

    await act(async () => {
      await mocks.authCallback(returningUser);
    });

    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
    expect(
      screen.queryByText(/Full access provided by/i),
    ).not.toBeInTheDocument();
  });

  test("keeps a mirrored sponsored profile away from pricing when access verification is unavailable", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "unverified-sponsored",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "returning-id-token"),
    };
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(
        learnerProfile({
          accessSource: "partner",
          partnerId: "community-partner",
        }),
      ),
    );
    mocks.fetchPartnerAccess
      .mockRejectedValueOnce(new PartnerAccessError("PARTNER_UNAVAILABLE", 503))
      .mockResolvedValueOnce({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });

    await act(async () => {
      await mocks.authCallback(returningUser);
    });

    expect(
      screen.getByText(/cannot confirm your sponsored access right now/i),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Log out" })).toBeVisible();
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(2);
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  test("a no-profile access failure offers retry and logout, then resumes onboarding", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "bootstrap-retry-user",
      email: "ewp-111111111111111111111111111111111111111111111111@accounts.everwise.app",
      getIdToken: vi.fn(async () => "bootstrap-retry-token"),
    };
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    mocks.fetchPartnerAccess
      .mockRejectedValueOnce(new PartnerAccessError("PARTNER_UNAVAILABLE", 503))
      .mockResolvedValueOnce({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
        username: "everwise001",
      });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => mocks.authCallback(returningUser));

    expect(screen.getByText(/cannot confirm your sponsored access right now/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Log out" })).toBeVisible();

    mocks.initialAuthUser = returningUser;
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("heading", {
      name: "Let’s personalize your EverWise lessons",
    })).toBeVisible();
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(2);
  });

  test("a profile-read failure offers retry and logout, then resumes the saved account", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "profile-read-retry-user",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "profile-read-retry-token"),
    };
    mocks.getDoc
      .mockRejectedValueOnce(new Error("Firestore unavailable"))
      .mockResolvedValueOnce(
        profileSnapshot(learnerProfile({ email: "jane@example.com" })),
      );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => mocks.authCallback(returningUser));

    expect(screen.getByText(/could not load your account right now/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Log out" })).toBeVisible();

    mocks.initialAuthUser = returningUser;
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(mocks.getDoc).toHaveBeenCalledTimes(2);
  });

  test("lets an authenticated returning learner log out of authoritative suspended access", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "returning-suspended-user",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "returning-id-token"),
    };
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(
        learnerProfile({
          accessSource: "partner",
          partnerId: "community-partner",
        }),
      ),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "suspended",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => {
      await mocks.authCallback(returningUser);
    });

    expect(
      screen.getByText(
        "Sponsored access from Community Partner is temporarily unavailable. Please contact Community Partner for help.",
      ),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });

  test("keeps a public suspended invite generic and offers no authenticated action", async () => {
    mocks.previewInvite.mockRejectedValue(
      new PartnerAccessError("PARTNER_SUSPENDED", 403),
    );
    render(<App />);

    expect(
      await screen.findByText(
        "Sponsored access from the organization that shared this link is temporarily unavailable. Please contact the organization that shared this link for help.",
      ),
    ).toBeVisible();
    expect(screen.queryByText("Community Partner")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
  });

  test("clears active sponsorship before a different public account is routed", async () => {
    window.history.replaceState(null, "", "/");
    const sponsoredUser = {
      uid: "sponsored-user",
      email: "sponsor@example.com",
      getIdToken: vi.fn(async () => "sponsor-token"),
    };
    const publicUser = {
      uid: "public-user",
      email: "public@example.com",
      getIdToken: vi.fn(async () => "public-token"),
    };
    mocks.getDoc
      .mockResolvedValueOnce(
        profileSnapshot(
          learnerProfile({ accessSource: "partner", partnerId: "community-partner" }),
        ),
      )
      .mockResolvedValueOnce(profileSnapshot(learnerProfile({ email: "public@example.com" })));
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      })
      .mockResolvedValueOnce({ status: "none" });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });

    await act(async () => {
      await mocks.authCallback(sponsoredUser);
    });
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText(/Full access provided by Community Partner/i)).toBeVisible();

    await act(async () => {
      await mocks.authCallback(publicUser);
    });
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
    expect(screen.queryByText(/Full access provided by/i)).not.toBeInTheDocument();
  });

  test("keeps the same sponsored account when repeated claim reconciliation is unavailable", async () => {
    const firstUser = {
      uid: "retry-source-user",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "first-id-token"),
    };
    mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      await mocks.authCallback(firstUser);
      return { user: firstUser };
    });
    mocks.claimPartnerSeat.mockRejectedValue(
      new PartnerAccessError("PARTNER_UNAVAILABLE", 503),
    );
    mocks.fetchPartnerAccess.mockRejectedValue(
      new PartnerAccessError("PARTNER_UNAVAILABLE", 503),
    );
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");
    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );
    await user.click(await screen.findByRole("button", { name: "Retry" }));

    expect(await screen.findByRole("button", { name: "Retry" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Log out" })).toBeVisible();
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  test("retries only the idempotent profile write after a successful claim", async () => {
    const firebaseUser = {
      uid: "profile-recovery-user",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "firebase-id-token"),
    };
    mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      await mocks.authCallback(firebaseUser);
      return { user: firebaseUser };
    });
    mocks.claimPartnerSeat.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    mocks.setDoc
      .mockRejectedValueOnce(new Error("Firestore unavailable"))
      .mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");
    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );

    expect(
      await screen.findByText(/free place is confirmed, but we could not finish saving your profile/i),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Log out" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Retry saving profile" }));

    expect(await screen.findByRole("button", { name: "Start learning" })).toBeVisible();
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(mocks.claimPartnerSeat).toHaveBeenCalledTimes(1);
    expect(mocks.setDoc).toHaveBeenCalledTimes(2);
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  test("profile-write retry preserves an authoritative suspension instead of fabricating active access", async () => {
    const firebaseUser = {
      uid: "profile-suspended-recovery-user",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "profile-suspended-recovery-token"),
    };
    mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      await mocks.authCallback(firebaseUser);
      return { user: firebaseUser };
    });
    mocks.claimPartnerSeat.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "suspended",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    mocks.setDoc
      .mockRejectedValueOnce(new Error("Firestore unavailable"))
      .mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");
    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );
    await user.click(await screen.findByRole("button", {
      name: "Retry saving profile",
    }));

    expect(await screen.findByText(/temporarily unavailable/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Log out" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Start learning" })).not.toBeInTheDocument();
    expect(mocks.fetchPartnerAccess).toHaveBeenCalledTimes(1);
  });

  test("restores server-active sponsorship after reload and lets a missing profile be completed without another signup or claim", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "missing-profile-user",
      email: "everwise001@accounts.everwise.app",
      getIdToken: vi.fn(async () => "returning-id-token"),
    };
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });

    await act(async () => {
      await mocks.authCallback(returningUser);
    });

    expect(screen.getByRole("heading", {
      name: "Let’s personalize your EverWise lessons",
    })).toBeVisible();
    expect(screen.getByText(
      "Your answers and lesson progress will be saved to this account.",
    )).toBeVisible();
    expect(screen.queryByRole("button", { name: "Complete my profile" }))
      .not.toBeInTheDocument();
    expect(screen.queryByLabelText("Username")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Choose a password")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(returningUser.email);
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();

    await reachConsent(user);
    expect(screen.getByText("8 of 8")).toBeVisible();
    expect(screen.queryByLabelText("Username")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Choose a password")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Finish my profile" }));

    expect(await screen.findByRole("button", { name: "Start learning" })).toBeVisible();
    expect(mocks.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(mocks.claimPartnerSeat).not.toHaveBeenCalled();
    expect(mocks.setDoc).toHaveBeenCalledTimes(1);
    expect(mocks.setDoc.mock.calls[0][0]).toEqual({
      collection: "users",
      uid: "missing-profile-user",
    });
    expect(mocks.setDoc.mock.calls[0][1]).toMatchObject({
      username: "everwise001",
      accessSource: "partner",
      partnerId: "community-partner",
    });
    expect(mocks.setDoc.mock.calls[0][1]).not.toHaveProperty("email");
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  test("pre-provisioned real-email accounts retain email identity without creating or claiming an account", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "real-email-profile-user",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "real-email-id-token"),
    };
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "active",
      partnerId: "authoritative-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });

    await act(async () => {
      await mocks.authCallback(returningUser);
    });
    await reachConsent(user);
    await user.click(screen.getByRole("button", { name: "Finish my profile" }));

    expect(await screen.findByRole("button", { name: "Start learning" })).toBeVisible();
    expect(mocks.setDoc).toHaveBeenCalledTimes(1);
    expect(mocks.setDoc.mock.calls[0][0]).toEqual({
      collection: "users",
      uid: "real-email-profile-user",
    });
    expect(mocks.setDoc.mock.calls[0][1]).toMatchObject({
      email: "jane@example.com",
      accessSource: "partner",
      partnerId: "authoritative-partner",
    });
    expect(mocks.setDoc.mock.calls[0][1]).not.toHaveProperty("username");
    expect(mocks.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(mocks.claimPartnerSeat).not.toHaveBeenCalled();
  });

  test("profile write retry preserves the pre-provisioned UID and profile without another claim", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "retry-pre-provisioned-profile",
      email: "everwise002@accounts.everwise.app",
      getIdToken: vi.fn(async () => "retry-profile-id-token"),
    };
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    mocks.setDoc
      .mockRejectedValueOnce(new Error("Firestore unavailable"))
      .mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => {
      await mocks.authCallback(returningUser);
    });
    await reachConsent(user);
    await user.click(screen.getByRole("button", { name: "Finish my profile" }));

    const retry = await screen.findByRole("button", {
      name: "Retry saving profile",
    });
    const [firstTarget, firstProfile] = mocks.setDoc.mock.calls[0];
    expect(firstTarget).toEqual({
      collection: "users",
      uid: "retry-pre-provisioned-profile",
    });
    expect(firstProfile).toMatchObject({
      username: "everwise002",
      accessSource: "partner",
      partnerId: "community-partner",
    });
    expect(firstProfile).not.toHaveProperty("email");

    await user.click(retry);

    expect(await screen.findByRole("button", { name: "Start learning" })).toBeVisible();
    expect(mocks.setDoc).toHaveBeenCalledTimes(2);
    expect(mocks.setDoc.mock.calls[1][0]).toEqual(firstTarget);
    expect(mocks.setDoc.mock.calls[1][1]).toEqual(firstProfile);
    expect(mocks.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(mocks.claimPartnerSeat).not.toHaveBeenCalled();
  });

  test("reload loads a saved pre-provisioned profile and routes the sponsored learner home", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "reload-pre-provisioned-profile",
      email: "everwise003@accounts.everwise.app",
      getIdToken: vi.fn(async () => "reload-profile-id-token"),
    };
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    const user = userEvent.setup();
    const firstRender = render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => {
      await mocks.authCallback(returningUser);
    });
    await reachConsent(user);
    await user.click(screen.getByRole("button", { name: "Finish my profile" }));
    await screen.findByRole("button", { name: "Start learning" });
    const savedProfile = mocks.setDoc.mock.calls[0][1];

    firstRender.unmount();
    mocks.getDoc.mockResolvedValue(profileSnapshot(savedProfile));
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => {
      await mocks.authCallback(returningUser);
    });

    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    expect(mocks.setDoc).toHaveBeenCalledTimes(1);
    expect(mocks.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(mocks.claimPartnerSeat).not.toHaveBeenCalled();
  });

  test("Back from pre-provisioned setup returns to recoverable profile completion", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "back-from-pre-provisioned-profile",
      email: "everwise004@accounts.everwise.app",
      getIdToken: vi.fn(async () => "back-profile-id-token"),
    };
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => {
      await mocks.authCallback(returningUser);
    });

    await user.click(screen.getByRole("button", { name: "Back to welcome" }));

    expect(
      screen.getByText(/sponsored access is active, but your personal profile still needs to be completed/i),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Complete my profile" })).toBeVisible();
    expect(mocks.setDoc).not.toHaveBeenCalled();
    expect(mocks.claimPartnerSeat).not.toHaveBeenCalled();
  });

  test("auth timing: logout during pre-provisioned setup clears the pending profile", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "logout-during-pre-provisioned-setup",
      email: "everwise005@accounts.everwise.app",
      getIdToken: vi.fn(async () => "logout-setup-id-token"),
    };
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => {
      await mocks.authCallback(returningUser);
    });
    expect(screen.getByRole("heading", {
      name: "Let’s personalize your EverWise lessons",
    })).toBeVisible();

    await act(async () => {
      await mocks.authCallback(null);
    });

    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();
    expect(screen.queryByRole("heading", {
      name: "Let’s personalize your EverWise lessons",
    })).not.toBeInTheDocument();
    expect(mocks.setDoc).not.toHaveBeenCalled();
    expect(mocks.claimPartnerSeat).not.toHaveBeenCalled();
  });

  test("auth timing: account switch during pre-provisioned setup keeps the newer public account", async () => {
    window.history.replaceState(null, "", "/");
    const returningUser = {
      uid: "old-pre-provisioned-profile",
      email: "everwise006@accounts.everwise.app",
      getIdToken: vi.fn(async () => "old-setup-id-token"),
    };
    const publicUser = {
      uid: "new-public-setup-user",
      email: "public@example.com",
      getIdToken: vi.fn(async () => "public-setup-id-token"),
    };
    mocks.getDoc
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce(
        profileSnapshot(learnerProfile({ name: "Public learner", email: "public@example.com" })),
      );
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      })
      .mockResolvedValueOnce({ status: "none" });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => {
      await mocks.authCallback(returningUser);
    });
    await user.type(screen.getByLabelText("What should we call you?"), "Jane");

    await act(async () => {
      await mocks.authCallback(publicUser);
    });

    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
    expect(screen.queryByText(/Full access provided by/i)).not.toBeInTheDocument();
    expect(mocks.setDoc).not.toHaveBeenCalled();
    expect(mocks.claimPartnerSeat).not.toHaveBeenCalled();
  });

  test("reports incomplete cleanup honestly and never offers account recreation", async () => {
    const firebaseUser = {
      uid: "cleanup-failed-user",
      getIdToken: vi.fn(async () => "firebase-id-token"),
    };
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
    mocks.claimPartnerSeat.mockRejectedValue(
      new PartnerAccessError("PARTNER_FULL", 409),
    );
    mocks.deleteUser.mockRejectedValue(new Error("delete failed"));
    mocks.signOut.mockRejectedValue(new Error("sign out failed"));
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");
    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );

    expect(mocks.deleteUser).toHaveBeenCalledWith(firebaseUser);
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText(/could not safely finish cleaning up your new account/i),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Try to log out" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Contact support" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  test("disables account navigation while a sponsored claim is in progress", async () => {
    const claimResult = deferred();
    const firebaseUser = {
      uid: "busy-user",
      getIdToken: vi.fn(async () => "firebase-id-token"),
    };
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
    mocks.claimPartnerSeat.mockReturnValue(claimResult.promise);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");
    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );
    await waitFor(() => expect(mocks.claimPartnerSeat).toHaveBeenCalledTimes(1));

    expect(screen.getByRole("button", { name: "Previous question" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Log in" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Claiming your free access…" })).toBeDisabled();

    await act(async () => {
      claimResult.resolve({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      });
    });
    expect(await screen.findByRole("button", { name: "Start learning" })).toBeVisible();
  });

  test("ignores a stale claim completion after Firebase changes to another account", async () => {
    const claimResult = deferred();
    const signupUser = {
      uid: "stale-signup-user",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "signup-token"),
    };
    const newerPublicUser = {
      uid: "newer-public-user",
      email: "public@example.com",
      getIdToken: vi.fn(async () => "public-token"),
    };
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: signupUser });
    mocks.claimPartnerSeat.mockReturnValue(claimResult.promise);
    mocks.getDoc.mockResolvedValue(
      profileSnapshot(learnerProfile({ email: "public@example.com" })),
    );
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");
    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );
    await waitFor(() => expect(mocks.claimPartnerSeat).toHaveBeenCalledTimes(1));

    await act(async () => {
      await mocks.authCallback(newerPublicUser);
    });
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();

    await act(async () => {
      claimResult.resolve({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      });
    });
    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
    expect(screen.queryByText(/Full access provided by/i)).not.toBeInTheDocument();
    expect(mocks.setDoc).not.toHaveBeenCalled();
  });

  test("auth timing: a logout during profile-write retry cannot restore the sponsored learner", async () => {
    const retryWrite = deferred();
    const firebaseUser = {
      uid: "logout-during-profile-retry",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "firebase-id-token"),
    };
    mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      await mocks.authCallback(firebaseUser);
      return { user: firebaseUser };
    });
    mocks.claimPartnerSeat.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    mocks.setDoc
      .mockRejectedValueOnce(new Error("Firestore unavailable"))
      .mockReturnValueOnce(retryWrite.promise);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");
    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );
    await user.click(await screen.findByRole("button", { name: "Retry saving profile" }));
    await waitFor(() => expect(mocks.setDoc).toHaveBeenCalledTimes(2));

    await act(async () => {
      await mocks.authCallback(null);
    });
    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();

    await act(async () => {
      retryWrite.resolve();
      await retryWrite.promise;
    });

    expect(screen.getByRole("button", { name: "Get Started" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Start learning" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Full access provided by/i)).not.toBeInTheDocument();
  });

  test("auth timing: logout during missing-profile completion cannot restore the sponsored learner", async () => {
    window.history.replaceState(null, "", "/");
    const profileWrite = deferred();
    const returningUser = {
      uid: "logout-during-profile-completion",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "returning-id-token"),
    };
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    mocks.fetchPartnerAccess.mockResolvedValue({
      status: "active",
      partnerId: "community-partner",
      name: "Community Partner",
      branding: PARTNER,
    });
    mocks.setDoc.mockReturnValue(profileWrite.promise);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => {
      await mocks.authCallback(returningUser);
    });
    await reachConsent(user);
    await user.click(screen.getByRole("button", { name: "Finish my profile" }));
    await waitFor(() => expect(mocks.setDoc).toHaveBeenCalledTimes(1));

    await act(async () => {
      await mocks.authCallback(null);
    });
    expect(await screen.findByRole("button", { name: "Get Started" })).toBeVisible();

    await act(async () => {
      profileWrite.resolve();
      await profileWrite.promise;
    });

    expect(screen.getByRole("button", { name: "Get Started" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Start learning" })).not.toBeInTheDocument();
  });

  test("auth timing: account switch during missing-profile completion keeps the newer public account", async () => {
    window.history.replaceState(null, "", "/");
    const profileWrite = deferred();
    const returningUser = {
      uid: "old-missing-profile-user",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "returning-id-token"),
    };
    const publicUser = {
      uid: "new-public-user",
      email: "public@example.com",
      getIdToken: vi.fn(async () => "public-id-token"),
    };
    mocks.getDoc
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce(
        profileSnapshot(learnerProfile({ name: "Public learner", email: "public@example.com" })),
      );
    mocks.fetchPartnerAccess
      .mockResolvedValueOnce({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      })
      .mockResolvedValueOnce({ status: "none" });
    mocks.setDoc.mockReturnValue(profileWrite.promise);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Get Started" });
    await act(async () => {
      await mocks.authCallback(returningUser);
    });
    await reachConsent(user);
    await user.click(screen.getByRole("button", { name: "Finish my profile" }));
    await waitFor(() => expect(mocks.setDoc).toHaveBeenCalledTimes(1));

    await act(async () => {
      await mocks.authCallback(publicUser);
    });
    await act(async () => {
      profileWrite.resolve();
      await profileWrite.promise;
    });

    expect(screen.getByRole("heading", { name: "Home screen" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(screen.getByText("Start free trial")).toBeVisible();
    expect(screen.queryByText(/Full access provided by/i)).not.toBeInTheDocument();
  });

  test("auth timing: account creation callback cannot interrupt a delayed sponsored claim", async () => {
    const claimResult = deferred();
    const firebaseUser = {
      uid: "listener-before-delayed-claim",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "firebase-id-token"),
    };
    let authCallbackPromise;
    mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      authCallbackPromise = mocks.authCallback(firebaseUser);
      return { user: firebaseUser };
    });
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    mocks.claimPartnerSeat.mockReturnValue(claimResult.promise);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");
    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );
    await waitFor(() => expect(mocks.claimPartnerSeat).toHaveBeenCalledTimes(1));
    await act(async () => {
      await authCallbackPromise;
    });

    expect(mocks.getDoc).not.toHaveBeenCalled();
    expect(mocks.fetchPartnerAccess).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Claiming your free access…" })).toBeDisabled();

    await act(async () => {
      claimResult.resolve({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      });
    });
    expect(await screen.findByRole("button", { name: "Start learning" })).toBeVisible();
  });

  test("auth timing: account creation callback cannot replace a sponsored claim failure", async () => {
    const firebaseUser = {
      uid: "listener-before-failed-claim",
      email: "jane@example.com",
      getIdToken: vi.fn(async () => "firebase-id-token"),
    };
    mocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      await mocks.authCallback(firebaseUser);
      return { user: firebaseUser };
    });
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    mocks.claimPartnerSeat.mockRejectedValue(
      new PartnerAccessError("PARTNER_FULL", 409),
    );
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Everwise with Community Partner");
    await completeSponsoredAppInterview(
      user,
      "No, use my answers only for my personal plan",
    );

    expect(
      await screen.findByText(
        "All sponsored places are currently in use. Please contact Community Partner for help.",
      ),
    ).toBeVisible();
    expect(mocks.getDoc).not.toHaveBeenCalled();
    expect(mocks.fetchPartnerAccess).not.toHaveBeenCalled();
    expect(mocks.setDoc).not.toHaveBeenCalled();
  });

  test("preserves the ordinary public signup route to plan options", async () => {
    window.history.replaceState(null, "", "/");
    const firebaseUser = { uid: "public-learner" };
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Get Started" }));
    await reachConsent(user);
    expect(screen.getByLabelText("Username")).toBeVisible();
    await user.type(screen.getByLabelText("Username"), "Jane.Miller");
    await user.type(screen.getByLabelText("Choose a password"), "secret12");
    await user.click(screen.getByRole("button", { name: "Build my plan" }));

    expect(await screen.findByRole("button", { name: "See my plan options" })).toBeVisible();
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      "jane.miller@accounts.everwise.app",
      "secret12",
    );
    expect(mocks.setDoc.mock.calls[0][1]).toMatchObject({
      username: "jane.miller",
    });
    expect(mocks.setDoc.mock.calls[0][1]).not.toHaveProperty("email");
    await user.click(screen.getByRole("button", { name: "See my plan options" }));
    expect(screen.getByRole("heading", { name: "Pricing and subscription" })).toBeVisible();
    expect(mocks.claimPartnerSeat).not.toHaveBeenCalled();
  });

  test("removes a public Firebase account when its profile cannot be created", async () => {
    window.history.replaceState(null, "", "/");
    const firebaseUser = {
      uid: "public-profile-failed",
      email: "janemiller@accounts.everwise.app",
    };
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
    mocks.setDoc.mockRejectedValue(new Error("private Firestore detail"));
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Get Started" }));
    await reachConsent(user);
    await user.type(screen.getByLabelText("Username"), "janemiller");
    await user.type(screen.getByLabelText("Choose a password"), "secret12");
    await user.click(screen.getByRole("button", { name: "Build my plan" }));

    await waitFor(() => expect(mocks.deleteUser).toHaveBeenCalledWith(firebaseUser));
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again.",
    );
    expect(screen.queryByRole("button", { name: "See my plan options" })).not.toBeInTheDocument();
  });
});
