import React from "react";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

await vi.hoisted(async () => {
  globalThis.React = (await import("react")).default;
});

import Paywall from "../src/screens/Paywall.jsx";

const VERIFIED_PLANS = [
  {
    key: "annual",
    currency: "usd",
    unitAmount: 6000,
    interval: "year",
    trialDays: 7,
  },
  {
    key: "monthly",
    currency: "usd",
    unitAmount: 799,
    interval: "month",
    trialDays: 3,
  },
];

function deferred() {
  let resolve;
  const promise = new Promise((onResolve) => {
    resolve = onResolve;
  });
  return { promise, resolve };
}

function renderWebPaywall(overrides = {}) {
  const props = {
    platform: "web",
    billingAvailable: true,
    billingPlans: VERIFIED_PLANS,
    billingBusy: false,
    sponsored: false,
    onStartTrial: vi.fn(async () => {}),
    onMaybeLater: vi.fn(),
    onRetry: vi.fn(async () => {}),
    onRestore: vi.fn(async () => {}),
    ...overrides,
  };
  return { ...render(<Paywall {...props} />), props };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("browser Stripe paywall", () => {
  test("renders only the two verified server offers with exact trial and renewal copy", () => {
    renderWebPaywall();

    expect(screen.getByText("$7.99/month")).toBeVisible();
    expect(
      screen.getByText("3 days free, then $7.99/month unless canceled."),
    ).toBeVisible();
    expect(screen.getByText("$60/year")).toBeVisible();
    expect(
      screen.getByText("7 days free, then $60/year unless canceled."),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Your payment method is collected now. Billing starts automatically after your trial unless you cancel.",
      ),
    ).toBeVisible();
    expect(document.body).not.toHaveTextContent(/save\s*\d+%/i);
    expect(document.body).not.toHaveTextContent("$14.99");
    expect(document.body).not.toHaveTextContent("$89.99");
    expect(screen.queryByRole("button", { name: "Restore" })).not.toBeInTheDocument();
  });

  test("selects annual by default and names the selected trial in the checkout action", async () => {
    const user = userEvent.setup();
    const { props } = renderWebPaywall();
    const group = screen.getByRole("radiogroup", {
      name: "Choose a subscription plan",
    });
    const annual = within(group).getByRole("radio", { name: /Annual/i });
    const monthly = within(group).getByRole("radio", { name: /Monthly/i });

    expect(annual).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Start 7-day free trial" })).toBeVisible();

    await user.click(monthly);
    expect(monthly).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("button", { name: "Start 3-day free trial" }));
    expect(props.onStartTrial).toHaveBeenCalledWith("monthly");
  });

  test("ignores a caller-supplied Payment Link and uses authenticated subscription Checkout", async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });
    const { props } = renderWebPaywall({
      checkoutUrl: "https://example.invalid/temporary-one-time-link",
    });

    expect(screen.getByText("$7.99/month")).toBeVisible();
    expect(screen.getByText("$60/year")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Start 7-day free trial" }));

    expect(props.onStartTrial).toHaveBeenCalledWith("annual");
    expect(assign).not.toHaveBeenCalled();
  });

  test("returns to free lessons without starting Checkout", async () => {
    const user = userEvent.setup();
    const { props } = renderWebPaywall();

    await user.click(screen.getByRole("button", { name: "Back to free lessons" }));
    expect(props.onMaybeLater).toHaveBeenCalledTimes(1);
    expect(props.onStartTrial).not.toHaveBeenCalled();
  });

  test.each([
    ["missing", []],
    [
      "wrong price",
      VERIFIED_PLANS.map((plan) =>
        plan.key === "monthly" ? { ...plan, unitAmount: 1499 } : plan,
      ),
    ],
    ["partial", [VERIFIED_PLANS[0]]],
    ["extra fields", [{ ...VERIFIED_PLANS[0], priceId: "price_private" }, VERIFIED_PLANS[1]]],
  ])("fails closed for %s offers and exposes only Retry", async (_label, billingPlans) => {
    const user = userEvent.setup();
    const { props } = renderWebPaywall({ billingPlans });

    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /free trial/i })).not.toBeInTheDocument();
    expect(screen.queryByText("$7.99/month")).not.toBeInTheDocument();
    expect(screen.queryByText("$60/year")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  test("rejects a stateful offer getter instead of validating one price and rendering another", () => {
    let reads = 0;
    const annual = { ...VERIFIED_PLANS[0] };
    Object.defineProperty(annual, "unitAmount", {
      enumerable: true,
      get() {
        reads += 1;
        return reads === 1 ? 6000 : 1;
      },
    });

    renderWebPaywall({ billingPlans: [annual, VERIFIED_PLANS[1]] });

    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /free trial/i })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("$0.01/year");
  });

  test.each([
    ["throwing property", () => Object.defineProperty({}, "key", { enumerable: true, get() { throw new Error("private getter detail"); } })],
    ["throwing Proxy", () => new Proxy({}, { ownKeys() { throw new Error("private proxy detail"); } })],
    ["custom prototype", () => Object.assign(Object.create({ unsafe: true }), VERIFIED_PLANS[0])],
  ])("fails closed without throwing for a %s offer", (_label, makeAnnual) => {
    expect(() => {
      renderWebPaywall({ billingPlans: [makeAnnual(), VERIFIED_PLANS[1]] });
    }).not.toThrow();

    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /free trial/i })).not.toBeInTheDocument();
  });

  test("revalidates a caller-owned offer after post-validation mutation", async () => {
    const user = userEvent.setup();
    const plans = VERIFIED_PLANS.map((plan) => ({ ...plan }));
    renderWebPaywall({ billingPlans: plans });
    expect(screen.getByRole("button", { name: "Start 7-day free trial" })).toBeVisible();

    plans[0].unitAmount = 1;
    await user.click(screen.getByRole("radio", { name: /Monthly/i }));

    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /free trial/i })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("$0.01/year");
  });

  test("shows Retry when browser billing is unavailable and never exposes Apple Restore", () => {
    renderWebPaywall({ billingAvailable: false, billingPlans: [] });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Subscription options are temporarily unavailable.",
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Restore" })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/Apple Account/i);
  });

  test("hides all plan and checkout controls while sponsored access is active", () => {
    renderWebPaywall({ sponsored: true });

    expect(screen.getByText("Your access is provided by a community partner.")).toBeVisible();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /free trial/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Restore" })).not.toBeInTheDocument();
  });

  test("uses one roving tab stop with wrapped Arrow, Home, and End navigation", async () => {
    const user = userEvent.setup();
    renderWebPaywall();
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
    expect(monthly).toHaveAttribute("tabindex", "0");
    expect(annual).toHaveAttribute("tabindex", "-1");
    await user.keyboard("{ArrowDown}");
    expect(annual).toHaveFocus();
    await user.keyboard("{End}");
    expect(monthly).toHaveFocus();
    await user.keyboard("{Home}");
    expect(annual).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(monthly).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(annual).toHaveFocus();
  });

  test("keeps the selected trial label while external or local Checkout work disables controls", async () => {
    const pending = deferred();
    const user = userEvent.setup();
    const { rerender, props } = renderWebPaywall({
      onStartTrial: vi.fn(() => pending.promise),
    });
    const start = screen.getByRole("button", { name: "Start 7-day free trial" });
    await user.click(start);

    expect(start).toBeDisabled();
    expect(start).toHaveAccessibleName("Start 7-day free trial");
    expect(screen.getAllByRole("radio").every((radio) => radio.disabled)).toBe(true);

    pending.resolve();
    await waitFor(() => expect(start).not.toBeDisabled());
    rerender(<Paywall {...props} billingBusy />);
    expect(screen.getByRole("button", { name: "Start 7-day free trial" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Back to free lessons" })).toBeDisabled();
  });

  test("announces browser status and safe Checkout errors", async () => {
    const user = userEvent.setup();
    renderWebPaywall({
      billingMessage: "Checkout was canceled. Your access has not changed.",
      onStartTrial: vi.fn(async () => {
        throw new Error("Checkout is not available right now.");
      }),
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Checkout was canceled. Your access has not changed.",
    );
    await user.click(screen.getByRole("button", { name: "Start 7-day free trial" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Checkout is not available right now.",
    );
  });

  test.each([1440, 768])("keeps the %ipx browser layout width-safe with visible keyboard focus", (width) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    renderWebPaywall();

    const root = screen.getByTestId("browser-paywall");
    expect(root).toHaveClass("w-full", "max-w-full", "overflow-x-hidden");
    expect(screen.getByRole("radiogroup")).toHaveClass("min-w-0");
    for (const button of screen.getAllByRole("button")) {
      expect(button.className).toMatch(/(?:h-11|min-h-11|min-h-\[(?:44|68|104|148)px\])/);
    }
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio.className).toMatch(/focus-visible:/);
    }
  });
});
