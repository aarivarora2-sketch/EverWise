import React from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

await vi.hoisted(async () => {
  globalThis.React = (await import("react")).default;
});

import App from "../src/App.jsx";
import Landing from "../src/screens/Landing.jsx";
import ProfileInterview from "../src/screens/ProfileInterview.jsx";
import PartnerAccessErrorScreen from "../src/screens/PartnerAccessError.jsx";
import { PartnerAccessError } from "../src/services/partnerAccess.js";

const TOKEN = "a".repeat(43);
const scheduleTimeout = window.setTimeout.bind(window);
const PARTNER = {
  name: "Community Partner",
  logoPath: null,
  accent: "#2F6B61",
};

afterEach(cleanup);

const mocks = vi.hoisted(() => ({
  authCallback: null,
  claimPartnerSeat: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  deleteUser: vi.fn(),
  getDoc: vi.fn(),
  previewInvite: vi.fn(),
  setDoc: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  deleteUser: mocks.deleteUser,
  onAuthStateChanged: vi.fn((_auth, callback) => {
    mocks.authCallback = callback;
    callback(null);
    return vi.fn();
  }),
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: mocks.signOut,
}));

vi.mock("firebase/firestore", () => ({
  Timestamp: { now: vi.fn(() => ({ seconds: 1 })) },
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, collection, uid) => ({ collection, uid })),
  getDoc: mocks.getDoc,
  setDoc: mocks.setDoc,
  updateDoc: vi.fn(),
}));

vi.mock("../src/firebase", () => ({ auth: {}, db: {} }));
vi.mock("@capacitor/core", () => ({
  Capacitor: { getPlatform: vi.fn(() => "web") },
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
    claimPartnerSeat: mocks.claimPartnerSeat,
    previewInvite: mocks.previewInvite,
  };
});
vi.mock("../src/screens/Home.jsx", () => ({
  default: () => <h1>Home screen</h1>,
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
        name: "Yes, share a de-identified copy to improve EverWise",
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
      assessmentVersion: "partner-assessment-v1",
      ageBand: "70-79",
    });
    expect(payload.researchSnapshot).not.toHaveProperty("name");
    expect(payload.researchSnapshot).not.toHaveProperty("email");
    expect(payload.researchSnapshot).not.toHaveProperty("age");
    expect(payload.researchSnapshot).not.toHaveProperty("password");
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

    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(screen.getByText("8 of 8")).toBeVisible();
    expect(screen.queryByText(/answers are not sold/i)).not.toBeInTheDocument();
  });
});

describe("sponsored signup orchestration", () => {
  beforeEach(() => {
    vi.spyOn(window, "setTimeout").mockImplementation((handler, delay, ...args) =>
      scheduleTimeout(handler, delay === 3000 ? 0 : delay, ...args),
    );
    window.history.replaceState(null, "", `/#partner=${TOKEN}`);
    mocks.claimPartnerSeat.mockReset();
    mocks.createUserWithEmailAndPassword.mockReset();
    mocks.deleteUser.mockReset();
    mocks.getDoc.mockReset();
    mocks.previewInvite.mockReset();
    mocks.setDoc.mockReset();
    mocks.signOut.mockReset();
    mocks.previewInvite.mockResolvedValue({
      partnerId: "community-partner",
      branding: PARTNER,
      seatAvailable: true,
    });
    mocks.deleteUser.mockResolvedValue(undefined);
    mocks.signOut.mockResolvedValue(undefined);
    mocks.setDoc.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
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

  test("retries an unavailable claim from answers kept in memory without showing pricing", async () => {
    const firstUser = {
      uid: "learner-retry-1",
      getIdToken: vi.fn(async () => "first-id-token"),
    };
    const secondUser = {
      uid: "learner-retry-2",
      getIdToken: vi.fn(async () => "second-id-token"),
    };
    mocks.createUserWithEmailAndPassword
      .mockResolvedValueOnce({ user: firstUser })
      .mockResolvedValueOnce({ user: secondUser });
    mocks.claimPartnerSeat
      .mockRejectedValueOnce(new PartnerAccessError("PARTNER_UNAVAILABLE", 503))
      .mockResolvedValueOnce({
        status: "active",
        partnerId: "community-partner",
        name: "Community Partner",
        branding: PARTNER,
      });
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
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledTimes(2);
    expect(mocks.claimPartnerSeat.mock.calls[0][0]).toMatchObject({
      researchConsent: false,
      researchSnapshot: null,
    });
    expect(mocks.claimPartnerSeat.mock.calls[1][0]).toMatchObject({
      researchConsent: false,
      researchSnapshot: null,
    });
    expect(await screen.findByRole("button", { name: "Start learning" })).toBeVisible();
    expect(screen.queryByText("Pricing and subscription")).not.toBeInTheDocument();
  });

  test("preserves the ordinary public signup route to plan options", async () => {
    window.history.replaceState(null, "", "/");
    const firebaseUser = { uid: "public-learner" };
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Get Started" }));
    await reachConsent(user);
    expect(screen.getByLabelText("Email")).toBeVisible();
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Choose a password"), "secret12");
    await user.click(screen.getByRole("button", { name: "Build my plan" }));

    expect(await screen.findByRole("button", { name: "See my plan options" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "See my plan options" }));
    expect(screen.getByRole("heading", { name: "Pricing and subscription" })).toBeVisible();
    expect(mocks.claimPartnerSeat).not.toHaveBeenCalled();
  });
});
