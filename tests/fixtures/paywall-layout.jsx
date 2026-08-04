import React from "react";
import { createRoot } from "react-dom/client";
import Paywall from "../../src/screens/Paywall";
import "../../src/index.css";

const VERIFIED_WEB_PLANS = [
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

if (new URLSearchParams(window.location.search).get("mutation") === "wide-card") {
  const mutation = document.createElement("style");
  mutation.textContent = `
    .release-paywall { contain: paint; }
    .paywall-plan-card { min-width: 900px !important; }
  `;
  document.head.append(mutation);
}

createRoot(document.getElementById("root")).render(
  <Paywall
    billingAvailable
    billingPlans={VERIFIED_WEB_PLANS}
    onMaybeLater={() => {}}
    onRetry={() => {}}
    onStartTrial={() => Promise.resolve()}
    platform="web"
  />,
);

function rectFor(element) {
  const { left, right, width } = element.getBoundingClientRect();
  return { left, right, width };
}

async function recordGeometry() {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const root = document.querySelector('[data-testid="browser-paywall"]');
  const cards = Array.from(document.querySelectorAll('[role="radio"]'));
  const action = document.querySelector('[aria-label^="Start "]');
  const geometry = {
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    root: rectFor(root),
    cards: cards.map(rectFor),
    action: rectFor(action),
  };

  document.body.dataset.geometry = btoa(JSON.stringify(geometry));
  document.body.dataset.geometryReady = "true";
}

recordGeometry();
