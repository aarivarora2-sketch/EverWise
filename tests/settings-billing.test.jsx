import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

await vi.hoisted(async () => {
  globalThis.React = (await import("react")).default;
});

import Settings from "../src/screens/Settings.jsx";

const PERIOD_END = "2026-09-03T00:00:00.000Z";
const TRIAL_END = "2026-08-11T00:00:00.000Z";

function billing(overrides = {}) {
  return {
    provider: "stripe",
    status: "active",
    plan: "annual",
    trialEndsAt: null,
    currentPeriodEndsAt: PERIOD_END,
    cancelAtPeriodEnd: false,
    canManage: true,
    busy: false,
    error: null,
    ...overrides,
  };
}

function renderSettings(overrides = {}) {
  const props = {
    billing: billing(),
    onBack: vi.fn(),
    onLogOut: vi.fn(),
    onOpenPaywall: vi.fn(),
    onManageSubscription: vi.fn(async () => {}),
    onRetryBilling: vi.fn(async () => {}),
    onDeleteAccount: vi.fn(async () => {}),
    ...overrides,
  };
  return { ...render(<Settings {...props} />), props };
}

afterEach(cleanup);

describe("provider-aware Settings billing", () => {
  test("shows active partner-provided access without any payment action", () => {
    renderSettings({
      billing: billing({
        provider: "sponsor",
        partnerName: "Community Partner",
        status: "active",
        plan: null,
        currentPeriodEndsAt: null,
        canManage: false,
      }),
    });

    expect(screen.getByText("Full access provided by Community Partner")).toBeVisible();
    expect(screen.getByText("No subscription or payment is required.")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Manage subscription" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View plans" })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/Stripe|Apple/i);
  });

  test("shows normalized active Stripe plan history and opens the billing Portal", async () => {
    const user = userEvent.setup();
    const { props } = renderSettings();

    expect(screen.getByText("Active")).toBeVisible();
    expect(screen.getByText("Annual plan")).toBeVisible();
    expect(screen.getByText("Renews September 3, 2026.")).toBeVisible();
    expect(document.body).not.toHaveTextContent(/sub_|cus_|price_/i);
    expect(document.body).not.toHaveTextContent(/Apple subscription settings/i);

    await user.click(screen.getByRole("button", { name: "Manage subscription" }));
    expect(props.onManageSubscription).toHaveBeenCalledTimes(1);
  });

  test("shows the normalized web trial end and selected plan", () => {
    renderSettings({
      billing: billing({
        status: "trialing",
        plan: "monthly",
        trialEndsAt: TRIAL_END,
        currentPeriodEndsAt: TRIAL_END,
      }),
    });

    expect(screen.getByText("Trial")).toBeVisible();
    expect(screen.getByText("Monthly plan")).toBeVisible();
    expect(screen.getByText("Trial ends August 11, 2026.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Manage subscription" })).toBeVisible();
  });

  test("states that cancel-at-period-end access continues through the exact period end", () => {
    renderSettings({ billing: billing({ cancelAtPeriodEnd: true }) });

    expect(
      screen.getByText("Canceled — access continues through September 3, 2026."),
    ).toBeVisible();
    expect(document.body).not.toHaveTextContent("Renews September 3, 2026.");
  });

  test("offers View plans when the learner has no subscription", async () => {
    const user = userEvent.setup();
    const { props } = renderSettings({
      billing: billing({
        provider: "none",
        status: "none",
        plan: null,
        currentPeriodEndsAt: null,
        canManage: false,
      }),
    });

    expect(screen.getByText("No subscription")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "View plans" }));
    expect(props.onOpenPaywall).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Manage subscription" })).not.toBeInTheDocument();
  });

  test.each([
    ["provider outage", billing({ provider: "unavailable", status: "unavailable", plan: null, currentPeriodEndsAt: null, canManage: false, error: "Billing is temporarily unavailable." })],
    ["malformed active date", billing({ currentPeriodEndsAt: "09/03/2026" })],
    ["unknown provider", billing({ provider: "other" })],
  ])("fails closed for %s, announces the error, and retries without claiming active", async (_label, viewModel) => {
    const user = userEvent.setup();
    const { props } = renderSettings({ billing: viewModel });

    expect(screen.getByRole("alert")).toHaveTextContent("Billing is temporarily unavailable.");
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Manage subscription" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(props.onRetryBilling).toHaveBeenCalledTimes(1);
  });

  test("preserves Apple management only for an explicit native provider", () => {
    renderSettings({
      billing: billing({ provider: "apple", currentPeriodEndsAt: null }),
    });

    expect(screen.getByText("Manage your subscription in Apple subscription settings.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Manage subscription" })).toBeVisible();
  });

  test("keeps billing action labels while busy and reports Portal failures", async () => {
    const user = userEvent.setup();
    const { rerender, props } = renderSettings({
      onManageSubscription: vi.fn(async () => {
        throw new Error("private provider detail");
      }),
    });

    await user.click(screen.getByRole("button", { name: "Manage subscription" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Billing management is temporarily unavailable.",
    );
    expect(document.body).not.toHaveTextContent("private provider detail");

    rerender(<Settings {...props} billing={billing({ busy: true })} />);
    expect(screen.getByRole("button", { name: "Manage subscription" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Manage subscription" })).toHaveAccessibleName(
      "Manage subscription",
    );
  });
});
