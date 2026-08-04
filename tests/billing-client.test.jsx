import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

await vi.hoisted(async () => {
  globalThis.React = (await import("react")).default;
});

import App from "../src/App.jsx";
import BillingConfirmation from "../src/screens/BillingConfirmation.jsx";
import BillingAccessErrorScreen from "../src/screens/BillingAccessError.jsx";
import {
  challengesByOrder,
  examsByOrder,
  lessonsByOrder,
} from "../src/data/lessons.js";

const mocks = vi.hoisted(() => ({
  authCallback: null,
  initialAuthUser: null,
  native: false,
  createBillingCheckout: vi.fn(),
  createBillingPortal: vi.fn(),
  fetchBillingAccess: vi.fn(),
  fetchBillingPlans: vi.fn(),
  fetchPartnerAccess: vi.fn(),
  getCurrentEntitlement: vi.fn(),
  getDoc: vi.fn(),
  getSubscriptionProducts: vi.fn(),
  purchaseSubscription: vi.fn(),
  restoreSubscriptions: vi.fn(),
  signOut: vi.fn(),
  updateDoc: vi.fn(),
}));
const realSetTimeout = window.setTimeout.bind(window);

vi.mock("firebase/auth", () => ({
  EmailAuthProvider: { credential: vi.fn() },
  createUserWithEmailAndPassword: vi.fn(),
  deleteUser: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    mocks.authCallback = callback;
    callback(mocks.initialAuthUser);
    return vi.fn();
  }),
  reload: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: mocks.signOut,
}));

vi.mock("firebase/firestore", () => ({
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, collection, uid) => ({ collection, uid })),
  getDoc: mocks.getDoc,
  setDoc: vi.fn(),
  updateDoc: mocks.updateDoc,
}));

vi.mock("../src/firebase", () => ({ auth: {}, db: {} }));
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: vi.fn(() => (mocks.native ? "ios" : "web")),
    isNativePlatform: vi.fn(() => mocks.native),
  },
}));
vi.mock("@capacitor/keyboard", () => ({
  Keyboard: { setAccessoryBarVisible: vi.fn(() => Promise.resolve()) },
}));
vi.mock("../src/services/purchases", () => ({
  getCurrentEntitlement: mocks.getCurrentEntitlement,
  getSubscriptionProducts: mocks.getSubscriptionProducts,
  nativePurchasesAvailable: vi.fn(() => mocks.native),
  planForProduct: vi.fn((productId) =>
    productId?.endsWith("monthly") ? "monthly" : "annual",
  ),
  purchaseSubscription: mocks.purchaseSubscription,
  restoreSubscriptions: mocks.restoreSubscriptions,
}));
vi.mock("../src/services/billingAccess.js", async (importOriginal) => ({
  ...(await importOriginal()),
  createBillingCheckout: mocks.createBillingCheckout,
  createBillingPortal: mocks.createBillingPortal,
  fetchBillingAccess: mocks.fetchBillingAccess,
  fetchBillingPlans: mocks.fetchBillingPlans,
}));
vi.mock("../src/services/partnerAccess.js", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchPartnerAccess: mocks.fetchPartnerAccess,
}));
vi.mock("../src/utils/apiEndpoint", () => ({
  apiEndpoint: vi.fn((path) => path),
  warnIfNativeApiIsMissing: vi.fn(),
}));

vi.mock("../src/screens/Home.jsx", () => ({
  default: ({ onStart }) => (
    <main>
      <h1>Home</h1>
      <button type="button" onClick={onStart}>Open course</button>
    </main>
  ),
}));
vi.mock("../src/screens/LessonPath.jsx", () => ({
  default: ({ completedLessons, onSelectChallenge, onSelectExam, onSelectLesson }) => (
    <main>
      <h1>Course path</h1>
      <p>{completedLessons.join(",")}</p>
      <button type="button" onClick={() => onSelectLesson(1)}>Open free lesson</button>
      <button type="button" onClick={() => onSelectLesson(2)}>Open protected lesson</button>
      <button type="button" onClick={() => onSelectChallenge(challengesByOrder[0])}>Open challenge</button>
      <button type="button" onClick={() => onSelectExam(examsByOrder[0])}>Open exam</button>
    </main>
  ),
}));
vi.mock("../src/screens/LessonPlayer.jsx", () => ({
  default: ({ lesson }) => <h1>Lesson: {lesson.id}</h1>,
}));
vi.mock("../src/screens/ChallengePlayer.jsx", () => ({
  default: ({ challenge }) => <h1>Challenge: {challenge.id}</h1>,
}));
vi.mock("../src/screens/ExamPlayer.jsx", () => ({
  default: ({ exam }) => <h1>Exam: {exam.id}</h1>,
}));
vi.mock("../src/screens/Paywall.jsx", () => ({
  default: ({ billingStatus, onMaybeLater, onStartLearning, onStartTrial }) => (
    <main>
      <h1>Subscription options</h1>
      <span data-testid="paywall-billing-status">{billingStatus}</span>
      <button
        type="button"
        onClick={() => void onStartTrial("annual").catch(() => {})}
      >
        Start annual trial
      </button>
      <button type="button" onClick={onMaybeLater}>Back free</button>
      <button type="button" onClick={onStartLearning}>Start learning</button>
    </main>
  ),
}));
vi.mock("../src/screens/Settings.jsx", () => ({
  default: ({ onOpenPaywall }) => (
    <main>
      <h1>Settings screen</h1>
      <button type="button" onClick={onOpenPaywall}>View plans</button>
    </main>
  ),
  PartnerDeletionReconciliation: () => null,
  PartnerReleaseRecovery: () => null,
}));

const PLANS = {
  plans: [
    { key: "annual", currency: "usd", unitAmount: 6000, interval: "year", trialDays: 7 },
    { key: "monthly", currency: "usd", unitAmount: 799, interval: "month", trialDays: 3 },
  ],
};
const NONE = {
  access: "none",
  status: "none",
  plan: null,
  trialEndsAt: null,
  currentPeriodEndsAt: null,
  cancelAtPeriodEnd: false,
  canStartTrial: true,
  canManage: false,
};
const ACTIVE = {
  ...NONE,
  access: "full",
  status: "active",
  plan: "annual",
  currentPeriodEndsAt: "2026-09-03T00:00:00.000Z",
  canStartTrial: false,
  canManage: true,
};
const INACTIVE_MANAGEABLE = {
  ...NONE,
  status: "canceled",
  plan: "annual",
  canStartTrial: false,
  canManage: true,
};
const ACTIVE_SPONSOR = {
  status: "active",
  partnerId: "community-partner",
  name: "Community Partner",
  branding: { name: "Community Partner", logoPath: null, accent: "#2F6B61" },
};
const BILLING_RETURN_INTENT_KEY = "everwise.billing-return-intent.v1";
const BILLING_RETURN_INTENT_TTL_MS = 10 * 60 * 1000;

function serializedBillingIntent({
  uid = "return-user",
  screen: destination = "lesson",
  itemId = lessonsByOrder[1].id,
  createdAt = Date.now(),
  extra = {},
} = {}) {
  return JSON.stringify({
    version: 1,
    nonce: "0123456789abcdef0123456789abcdef",
    uid,
    screen: destination,
    itemId,
    createdAt,
    expiresAt: createdAt + BILLING_RETURN_INTENT_TTL_MS,
    ...extra,
  });
}

function profile(overrides = {}) {
  return {
    name: "Jane",
    email: "jane@example.com",
    profileInterview: {},
    onboardingCompleted: true,
    scamsCaught: 0,
    badges: [],
    completedLessons: ["welcome", "internet"],
    trialStartedAt: null,
    subscriptionStatus: "expired",
    plan: null,
    ...overrides,
  };
}

function firebaseUser(uid = "billing-user") {
  return {
    uid,
    email: `${uid}@example.com`,
    getIdToken: vi.fn(async () => `${uid}-token`),
  };
}

function snapshot(value) {
  return { exists: () => true, data: () => value };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

async function settleLaunch() {
  if (vi.isFakeTimers()) {
    await act(async () => vi.advanceTimersByTimeAsync(3000));
  } else {
    await act(async () => new Promise((resolve) => realSetTimeout(resolve, 0)));
  }
}

async function openAuthenticatedApp({
  access = ACTIVE,
  completedLessons,
  partner = { status: "none" },
  uid = "billing-user",
} = {}) {
  const user = firebaseUser(uid);
  mocks.getDoc.mockResolvedValue(snapshot(profile({ completedLessons })));
  mocks.fetchPartnerAccess.mockResolvedValue(partner);
  mocks.fetchBillingPlans.mockResolvedValue(PLANS);
  mocks.fetchBillingAccess.mockResolvedValue(access);
  const rendered = render(<App />);
  await settleLaunch();
  await act(async () => mocks.authCallback(user));
  expect(screen.getByRole("heading", { name: "Home" })).toBeVisible();
  return { rendered, user };
}

async function openProtected(kind = "lesson") {
  fireEvent.click(screen.getByRole("button", { name: "Open course" }));
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", {
        name:
          kind === "lesson"
            ? "Open protected lesson"
            : kind === "challenge"
              ? "Open challenge"
              : "Open exam",
      }),
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(screen.getByRole("heading", { name: new RegExp(`^${kind}`, "i") })).toBeVisible();
}

describe("browser billing bootstrap and provider selection", () => {
  beforeEach(() => {
    mocks.initialAuthUser = null;
    mocks.native = false;
    for (const mock of Object.values(mocks)) {
      if (typeof mock?.mockReset === "function") mock.mockReset();
    }
    mocks.getSubscriptionProducts.mockResolvedValue([]);
    mocks.getCurrentEntitlement.mockResolvedValue({ active: false });
    mocks.signOut.mockResolvedValue(undefined);
    mocks.updateDoc.mockResolvedValue(undefined);
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/");
    vi.spyOn(window, "setTimeout").mockImplementation((handler, delay, ...args) =>
      realSetTimeout(handler, delay === 3000 ? 0 : delay, ...args),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.history.replaceState(null, "", "/");
  });

  test("fetches verified plans and access only after an authenticated browser profile settles", async () => {
    const { user } = await openAuthenticatedApp();

    expect(mocks.fetchBillingPlans).toHaveBeenCalledWith(user);
    expect(mocks.fetchBillingAccess).toHaveBeenCalledWith(user);
    expect(mocks.fetchBillingPlans).toHaveBeenCalledTimes(1);
    expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(1);
    expect(mocks.updateDoc).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ billingStatus: expect.anything() }),
    );
  });

  test("never calls authenticated billing for anonymous or actively sponsored use", async () => {
    render(<App />);
    await settleLaunch();
    expect(screen.getByRole("button", { name: "Get Started" })).toBeVisible();
    expect(mocks.fetchBillingAccess).not.toHaveBeenCalled();

    cleanup();
    await openAuthenticatedApp({ partner: ACTIVE_SPONSOR, access: NONE });
    expect(mocks.fetchBillingPlans).not.toHaveBeenCalled();
    expect(mocks.fetchBillingAccess).not.toHaveBeenCalled();
    await openProtected("lesson");
    expect(screen.getByRole("heading", { name: /^Lesson:/ })).toBeVisible();
  });

  test("ignores an active billing response belonging to a previous UID", async () => {
    const oldAccess = deferred();
    const oldUser = firebaseUser("old-user");
    const newUser = firebaseUser("new-user");
    mocks.getDoc.mockResolvedValue(snapshot(profile()));
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    mocks.fetchBillingPlans.mockResolvedValue(PLANS);
    mocks.fetchBillingAccess
      .mockImplementationOnce(() => oldAccess.promise)
      .mockResolvedValueOnce(NONE)
      .mockResolvedValue(NONE);

    render(<App />);
    await settleLaunch();
    let oldAuth;
    await act(async () => {
      oldAuth = mocks.authCallback(oldUser);
      await Promise.resolve();
    });
    await act(async () => mocks.authCallback(newUser));
    expect(screen.getByRole("heading", { name: "Home" })).toBeVisible();
    await act(async () => {
      oldAccess.resolve(ACTIVE);
      await oldAuth;
    });

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "View plans" }));
    expect(screen.getByTestId("paywall-billing-status")).toHaveTextContent("none");
  });

  test("fails paid access closed when verification is unavailable without erasing a sponsor", async () => {
    await openAuthenticatedApp({ access: ACTIVE });
    mocks.fetchBillingAccess.mockRejectedValue(new Error("provider detail"));
    fireEvent.click(screen.getByRole("button", { name: "Open course" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open protected lesson" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText(/could not verify your subscription/i)).toBeVisible();
    expect(document.body).not.toHaveTextContent("provider detail");

    cleanup();
    await openAuthenticatedApp({ partner: ACTIVE_SPONSOR });
    await openProtected("lesson");
    expect(screen.queryByText(/could not verify/i)).not.toBeInTheDocument();
  });

  test("uses validated browser Checkout while the stable native path keeps StoreKit", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", {
      ...window.location,
      assign,
      href: "http://localhost/",
      origin: "http://localhost",
      pathname: "/",
      search: "",
      hash: "",
    });
    mocks.createBillingCheckout.mockResolvedValue({
      url: "https://checkout.stripe.com/c/pay/cs_test_safe",
    });
    await openAuthenticatedApp({ access: NONE });
    fireEvent.click(screen.getByRole("button", { name: "Open course" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open protected lesson" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Start annual trial" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(assign).toHaveBeenCalledWith(
      "https://checkout.stripe.com/c/pay/cs_test_safe",
    );
    expect(mocks.createBillingCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "billing-user" }),
      "annual",
    );

    cleanup();
    mocks.native = true;
    mocks.purchaseSubscription.mockResolvedValue({
      active: true,
      productId: "com.everwise.app.annual",
    });
    await openAuthenticatedApp({ access: NONE, uid: "native-user" });
    fireEvent.click(screen.getByRole("button", { name: "Open course" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open protected lesson" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Start annual trial" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mocks.purchaseSubscription).toHaveBeenCalledWith("annual");
    expect(mocks.createBillingCheckout).toHaveBeenCalledTimes(1);
  });

  test("never assigns an unsafe URL returned across the Checkout boundary", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", {
      ...window.location,
      assign,
      href: "http://localhost/",
      origin: "http://localhost",
      pathname: "/",
      search: "",
      hash: "",
    });
    mocks.createBillingCheckout.mockResolvedValue({
      url: "https://checkout.stripe.com.evil.example/session",
    });
    await openAuthenticatedApp({ access: NONE, uid: "unsafe-checkout-user" });
    fireEvent.click(screen.getByRole("button", { name: "Open course" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open protected lesson" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Start annual trial" }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(assign).not.toHaveBeenCalled();
  });
});

describe("Checkout return confirmation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.initialAuthUser = null;
    mocks.native = false;
    for (const mock of Object.values(mocks)) {
      if (typeof mock?.mockReset === "function") mock.mockReset();
    }
    mocks.getSubscriptionProducts.mockResolvedValue([]);
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    mocks.fetchBillingPlans.mockResolvedValue(PLANS);
    mocks.getDoc.mockResolvedValue(snapshot(profile()));
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  test("removes a success marker, grants nothing from the query, and polls on the bounded schedule", async () => {
    window.history.replaceState({ safe: true }, "", "/?keep=1&billing=success#course");
    const replaceState = vi.spyOn(window.history, "replaceState");
    mocks.fetchBillingAccess.mockResolvedValue(NONE);
    const user = firebaseUser("return-user");
    render(<App />);
    await settleLaunch();
    await act(async () => mocks.authCallback(user));

    expect(screen.getByRole("region", { name: "Subscription confirmation status" })).toBeVisible();
    expect(screen.getByText(/Checking your access/i)).toBeVisible();
    expect(replaceState).toHaveBeenCalledWith(
      { safe: true },
      "",
      "/?keep=1#course",
    );
    expect(screen.queryByRole("heading", { name: /^Lesson:/ })).not.toBeInTheDocument();
    expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(2);

    for (const [elapsed, calls] of [[999, 2], [1, 3], [1999, 3], [1, 4], [3000, 5], [5000, 6], [8000, 7]]) {
      await act(async () => vi.advanceTimersByTimeAsync(elapsed));
      expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(calls);
    }
    expect(screen.getByText(/still could not confirm/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Back to free lessons" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Manage billing" })).not.toBeInTheDocument();
  });

  test("enforces a hard 20-second confirmation deadline and ignores a late access response", async () => {
    window.history.replaceState(null, "", "/?billing=success");
    window.sessionStorage.setItem(
      BILLING_RETURN_INTENT_KEY,
      serializedBillingIntent({ uid: "slow-return-user" }),
    );
    const slowAccess = deferred();
    mocks.fetchBillingAccess
      .mockResolvedValueOnce(NONE)
      .mockImplementationOnce(() => slowAccess.promise)
      .mockResolvedValue(NONE);
    render(<App />);
    await settleLaunch();
    await act(async () => mocks.authCallback(firebaseUser("slow-return-user")));

    await act(async () => vi.advanceTimersByTimeAsync(19_999));
    expect(screen.getByText(/Checking your access/i)).toBeVisible();
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(screen.getByText(/still could not confirm/i)).toBeVisible();
    expect(window.sessionStorage.getItem(BILLING_RETURN_INTENT_KEY)).toBeNull();
    const callsAtDeadline = mocks.fetchBillingAccess.mock.calls.length;

    await act(async () => {
      slowAccess.resolve(ACTIVE);
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(39_999);
    });
    expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(callsAtDeadline);
    expect(screen.getByText(/still could not confirm/i)).toBeVisible();
    expect(screen.queryByRole("heading", { name: /^(Lesson|Challenge|Exam):/ })).not.toBeInTheDocument();
  });

  test("a cancel marker returns to the paywall with a neutral message", async () => {
    window.history.replaceState(null, "", "/?billing=cancel");
    mocks.fetchBillingAccess.mockResolvedValue(NONE);
    render(<App />);
    await settleLaunch();
    await act(async () => mocks.authCallback(firebaseUser("cancel-user")));

    expect(screen.getByRole("heading", { name: "Subscription options" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Checkout was canceled. Your access has not changed.",
    );
    expect(window.location.search).toBe("");
  });

  test("verified access resumes only the pending protected item bound to the current account", async () => {
    mocks.fetchBillingAccess
      .mockResolvedValueOnce(NONE)
      .mockResolvedValueOnce(NONE)
      .mockResolvedValueOnce(ACTIVE);
    mocks.createBillingCheckout.mockResolvedValue({
      url: "https://checkout.stripe.com/c/pay/cs_test_safe",
    });
    const assign = vi.fn();
    vi.stubGlobal("location", {
      ...window.location,
      assign,
      href: "http://localhost/",
      origin: "http://localhost",
      pathname: "/",
      search: "",
      hash: "",
    });
    await openAuthenticatedApp({ access: NONE, uid: "bound-user" });
    fireEvent.click(screen.getByRole("button", { name: "Open course" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open protected lesson" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Start annual trial" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(assign).toHaveBeenCalledTimes(1);

    location.search = "?billing=success";
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByRole("heading", { name: /^Lesson:/ })).toBeVisible();
  });

  test("restores a one-time protected lesson intent after a real Checkout unload and remount", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", {
      ...window.location,
      assign,
      href: "http://localhost/",
      origin: "http://localhost",
      pathname: "/",
      search: "",
      hash: "",
    });
    mocks.createBillingCheckout.mockResolvedValue({
      url: "https://checkout.stripe.com/c/pay/cs_test_safe",
    });
    mocks.fetchBillingAccess.mockResolvedValue(NONE);
    const first = await openAuthenticatedApp({ access: NONE, uid: "reload-user" });
    fireEvent.click(screen.getByRole("button", { name: "Open course" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open protected lesson" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Start annual trial" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(assign).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(BILLING_RETURN_INTENT_KEY)).not.toBeNull();
    first.rendered.unmount();

    location.search = "?billing=success";
    mocks.fetchBillingAccess.mockReset();
    mocks.fetchBillingAccess.mockResolvedValueOnce(NONE).mockResolvedValueOnce(ACTIVE);
    render(<App />);
    await settleLaunch();
    await act(async () => mocks.authCallback(firebaseUser("reload-user")));

    expect(screen.getByRole("heading", { name: /^Lesson:/ })).toBeVisible();
    expect(window.sessionStorage.getItem(BILLING_RETURN_INTENT_KEY)).toBeNull();
  });

  test.each([
    ["different UID", serializedBillingIntent({ uid: "somebody-else" })],
    ["expired", serializedBillingIntent({ createdAt: Date.now() - BILLING_RETURN_INTENT_TTL_MS })],
    ["malformed", "{not-json"],
    ["unsupported destination", serializedBillingIntent({ screen: "settings" })],
    [
      "extra prototype key",
      serializedBillingIntent().replace(/}$/, ',"__proto__":{"polluted":true}}'),
    ],
    ["oversized", "x".repeat(2_000)],
  ])("ignores and clears a %s stored return intent", async (_label, storedIntent) => {
    window.sessionStorage.setItem(BILLING_RETURN_INTENT_KEY, storedIntent);
    window.history.replaceState(null, "", "/?billing=success");
    mocks.fetchBillingAccess.mockResolvedValue(ACTIVE);
    render(<App />);
    await settleLaunch();
    await act(async () => mocks.authCallback(firebaseUser("return-user")));

    expect(screen.getByRole("heading", { name: "Home" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: /^(Lesson|Challenge|Exam):/ })).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(BILLING_RETURN_INTENT_KEY)).toBeNull();
  });

  test.each(["lesson", "challenge", "exam"])(
    "Back free abandons a pending %s so later verified access cannot reopen it",
    async (kind) => {
      mocks.fetchBillingAccess.mockResolvedValue(NONE);
      await openAuthenticatedApp({ access: NONE, uid: `abandon-${kind}` });
      fireEvent.click(screen.getByRole("button", { name: "Open course" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", {
          name: kind === "lesson"
            ? "Open protected lesson"
            : kind === "challenge"
              ? "Open challenge"
              : "Open exam",
        }));
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(window.sessionStorage.getItem(BILLING_RETURN_INTENT_KEY)).not.toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Back free" }));
      expect(window.sessionStorage.getItem(BILLING_RETURN_INTENT_KEY)).toBeNull();

      mocks.fetchBillingAccess.mockResolvedValue(ACTIVE);
      window.history.replaceState(null, "", "/?billing=success");
      await act(async () => {
        window.dispatchEvent(new PopStateEvent("popstate"));
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(screen.getByRole("heading", { name: "Home" })).toBeVisible();
      expect(screen.queryByRole("heading", { name: /^(Lesson|Challenge|Exam):/ })).not.toBeInTheDocument();
    },
  );

  test("cancel clears a stored lesson intent before any later success", async () => {
    window.sessionStorage.setItem(
      BILLING_RETURN_INTENT_KEY,
      serializedBillingIntent({ uid: "cancel-user" }),
    );
    window.history.replaceState(null, "", "/?billing=cancel");
    mocks.fetchBillingAccess.mockResolvedValue(NONE);
    render(<App />);
    await settleLaunch();
    await act(async () => mocks.authCallback(firebaseUser("cancel-user")));
    expect(window.sessionStorage.getItem(BILLING_RETURN_INTENT_KEY)).toBeNull();

    mocks.fetchBillingAccess.mockResolvedValue(ACTIVE);
    window.history.replaceState(null, "", "/?billing=success");
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByRole("heading", { name: "Home" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: /^Lesson:/ })).not.toBeInTheDocument();
  });

  test("a newer protected intent replaces the earlier destination", async () => {
    mocks.fetchBillingAccess.mockResolvedValue(NONE);
    await openAuthenticatedApp({ access: NONE, uid: "replace-user" });
    fireEvent.click(screen.getByRole("button", { name: "Open course" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open protected lesson" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole("button", { name: "Back free" }));
    fireEvent.click(screen.getByRole("button", { name: "Open course" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open exam" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(JSON.parse(window.sessionStorage.getItem(BILLING_RETURN_INTENT_KEY))).toMatchObject({
      screen: "exam",
      itemId: examsByOrder[0].id,
      uid: "replace-user",
    });

    mocks.fetchBillingAccess.mockResolvedValue(ACTIVE);
    window.history.replaceState(null, "", "/?billing=success");
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByRole("heading", { name: /^Exam:/ })).toBeVisible();
    expect(screen.queryByRole("heading", { name: /^Lesson:/ })).not.toBeInTheDocument();
  });

  test("leaving temporary billing recovery clears its protected intent", async () => {
    mocks.fetchBillingAccess
      .mockResolvedValueOnce(ACTIVE)
      .mockRejectedValueOnce(new Error("temporarily unavailable"));
    await openAuthenticatedApp({ access: ACTIVE, uid: "recovery-back-user" });
    fireEvent.click(screen.getByRole("button", { name: "Open course" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open protected lesson" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText(/could not verify your subscription/i)).toBeVisible();
    expect(window.sessionStorage.getItem(BILLING_RETURN_INTENT_KEY)).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Back to free lessons" }));
    expect(window.sessionStorage.getItem(BILLING_RETURN_INTENT_KEY)).toBeNull();

    mocks.fetchBillingAccess.mockResolvedValue(ACTIVE);
    window.history.replaceState(null, "", "/?billing=success");
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByRole("heading", { name: "Home" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: /^Lesson:/ })).not.toBeInTheDocument();
  });

  test("stops confirmation work after logout, UID change, and unmount", async () => {
    window.history.replaceState(null, "", "/?billing=success");
    mocks.fetchBillingAccess.mockResolvedValue(NONE);
    const rendered = render(<App />);
    await settleLaunch();
    await act(async () => mocks.authCallback(firebaseUser("poll-user")));
    expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(2);

    window.sessionStorage.setItem(
      BILLING_RETURN_INTENT_KEY,
      serializedBillingIntent({ uid: "poll-user" }),
    );
    await act(async () => mocks.authCallback(null));
    expect(window.sessionStorage.getItem(BILLING_RETURN_INTENT_KEY)).toBeNull();
    await act(async () => vi.advanceTimersByTimeAsync(20_000));
    expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(2);

    await act(async () => mocks.authCallback(firebaseUser("next-user")));
    expect(screen.getByRole("heading", { name: "Home" })).toBeVisible();
    const afterSwitch = mocks.fetchBillingAccess.mock.calls.length;
    rendered.unmount();
    await act(async () => vi.advanceTimersByTimeAsync(120_000));
    expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(afterSwitch);
  });

  test("confirmation and access-error screens expose safe accessible recovery actions", () => {
    const retry = vi.fn();
    const manage = vi.fn();
    const back = vi.fn();
    const { rerender } = render(
      <BillingConfirmation
        phase="timeout"
        onRetry={retry}
        onManageBilling={manage}
        onBack={back}
      />,
    );
    expect(screen.getByRole("region", { name: "Subscription confirmation status" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    fireEvent.click(screen.getByRole("button", { name: "Manage billing" }));
    fireEvent.click(screen.getByRole("button", { name: "Back to free lessons" }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(manage).toHaveBeenCalledTimes(1);
    expect(back).toHaveBeenCalledTimes(1);

    rerender(<BillingAccessErrorScreen kind="temporary" onRetry={retry} onBack={back} />);
    expect(screen.getByText(/could not verify your subscription/i)).toBeVisible();
    expect(document.body).not.toHaveTextContent("Stripe");
    rerender(<BillingAccessErrorScreen kind="inactive" onRetry={retry} onBack={back} />);
    expect(screen.getByText(/subscription is not active/i)).toBeVisible();
  });

  test("opens only the validated billing Portal URL offered after confirmation timeout", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", {
      ...window.location,
      assign,
      href: "http://localhost/?billing=success",
      origin: "http://localhost",
      pathname: "/",
      search: "?billing=success",
      hash: "",
    });
    mocks.fetchBillingAccess.mockResolvedValue(INACTIVE_MANAGEABLE);
    mocks.createBillingPortal.mockResolvedValue({
      url: "https://billing.stripe.com/p/session/test_safe",
    });
    render(<App />);
    await settleLaunch();
    await act(async () => mocks.authCallback(firebaseUser("portal-user")));
    await act(async () => vi.advanceTimersByTimeAsync(19_000));

    expect(screen.getByRole("button", { name: "Manage billing" })).toBeVisible();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Manage billing" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mocks.createBillingPortal).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "portal-user" }),
    );
    expect(assign).toHaveBeenCalledWith(
      "https://billing.stripe.com/p/session/test_safe",
    );

    assign.mockClear();
    mocks.createBillingPortal.mockResolvedValue({
      url: "https://billing.stripe.com.evil.example/session",
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Manage billing" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(assign).not.toHaveBeenCalled();
  });
});

describe("authoritative billing revalidation and revocation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.initialAuthUser = null;
    mocks.native = false;
    for (const mock of Object.values(mocks)) {
      if (typeof mock?.mockReset === "function") mock.mockReset();
    }
    mocks.getSubscriptionProducts.mockResolvedValue([]);
    mocks.fetchBillingPlans.mockResolvedValue(PLANS);
    mocks.fetchPartnerAccess.mockResolvedValue({ status: "none" });
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  test.each(["past_due", "canceled", "none", "unavailable"])(
    "ejects an unfinished protected lesson when billing becomes %s",
    async (status) => {
      const revoked = status === "unavailable" ? new Error("down") : {
        ...NONE,
        status,
        plan: status === "none" ? null : "annual",
        canManage: status !== "none",
      };
      mocks.fetchBillingAccess
        .mockResolvedValueOnce(ACTIVE)
        .mockResolvedValueOnce(ACTIVE);
      if (revoked instanceof Error) mocks.fetchBillingAccess.mockRejectedValueOnce(revoked);
      else mocks.fetchBillingAccess.mockResolvedValueOnce(revoked);
      await openAuthenticatedApp({ access: ACTIVE, uid: `revoked-${status}` });
      await openProtected("lesson");

      await act(async () => vi.advanceTimersByTimeAsync(60_000));

      if (status === "unavailable") {
        expect(screen.getByText(/could not verify your subscription/i)).toBeVisible();
      } else {
        expect(screen.getByRole("heading", { name: "Subscription options" })).toBeVisible();
      }
      expect(screen.queryByRole("heading", { name: /^Lesson:/ })).not.toBeInTheDocument();
    },
  );

  test.each(["lesson", "challenge", "exam"])(
    "revalidates on protected %s entry and blocks immediately after revocation",
    async (kind) => {
      mocks.fetchBillingAccess.mockResolvedValueOnce(ACTIVE).mockResolvedValueOnce(NONE);
      await openAuthenticatedApp({ access: ACTIVE, uid: `entry-${kind}` });
      fireEvent.click(screen.getByRole("button", { name: "Open course" }));
      fireEvent.click(screen.getByRole("button", {
        name: kind === "lesson" ? "Open protected lesson" : kind === "challenge" ? "Open challenge" : "Open exam",
      }));
      await act(async () => Promise.resolve());
      expect(screen.getByRole("heading", { name: "Subscription options" })).toBeVisible();
      expect(screen.queryByRole("heading", { name: new RegExp(`^${kind}:`, "i") })).not.toBeInTheDocument();
    },
  );

  test("refreshes paid access on focus, visible resume, and exactly 60 seconds", async () => {
    mocks.fetchBillingAccess.mockResolvedValue(ACTIVE);
    await openAuthenticatedApp({ access: ACTIVE, uid: "refresh-user" });
    expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(1);

    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(2);
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    await act(async () => document.dispatchEvent(new Event("visibilitychange")));
    expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(3);
    await act(async () => vi.advanceTimersByTimeAsync(59_999));
    expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(3);
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(mocks.fetchBillingAccess).toHaveBeenCalledTimes(4);
  });

  test.each([
    ["completed protected lesson", ["welcome", "internet", lessonsByOrder[2].id], "Open protected lesson", /^Lesson:/],
    ["free lesson", ["welcome"], "Open free lesson", /^Lesson:/],
  ])("keeps a %s open after paid access ends", async (_name, completedLessons, button, heading) => {
    mocks.fetchBillingAccess.mockResolvedValueOnce(ACTIVE).mockResolvedValueOnce(NONE);
    await openAuthenticatedApp({ access: ACTIVE, completedLessons, uid: `safe-${_name}` });
    fireEvent.click(screen.getByRole("button", { name: "Open course" }));
    fireEvent.click(screen.getByRole("button", { name: button }));
    expect(screen.getByRole("heading", { name: heading })).toBeVisible();
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(screen.getByRole("heading", { name: heading })).toBeVisible();
  });

  test("keeps unfinished protected content open when active sponsorship overrides expired billing", async () => {
    mocks.fetchPartnerAccess.mockResolvedValue(ACTIVE_SPONSOR);
    mocks.fetchBillingAccess.mockResolvedValue(NONE);
    await openAuthenticatedApp({ partner: ACTIVE_SPONSOR, access: NONE, uid: "sponsor-wins" });
    await openProtected("lesson");
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(screen.getByRole("heading", { name: /^Lesson:/ })).toBeVisible();
    expect(mocks.fetchBillingAccess).not.toHaveBeenCalled();
  });
});
