import { useState } from "react";
import {
  ArrowRight,
  Circle,
  CircleDot,
  MessageCircleWarning,
  Search,
  X,
} from "lucide-react";
import { openLegalPage } from "../config/legalLinks";

const NATIVE_PLANS = {
  annual: {
    key: "annual",
    name: "Annual",
    price: "$7.50",
    cadence: "/month",
    detail: "Billed as $89.99/year",
    trialDays: 7,
  },
  monthly: {
    key: "monthly",
    name: "Monthly",
    price: "$14.99",
    cadence: "/month",
    detail: "Billed monthly",
    trialDays: null,
  },
};

const VERIFIED_WEB_OFFERS = {
  annual: {
    key: "annual",
    currency: "usd",
    unitAmount: 6000,
    interval: "year",
    trialDays: 7,
  },
  monthly: {
    key: "monthly",
    currency: "usd",
    unitAmount: 799,
    interval: "month",
    trialDays: 3,
  },
};

const fixedText = {
  wordmark: { fontSize: "var(--paywall-wordmark, 30px)", lineHeight: 1 },
  headline: { fontSize: "var(--paywall-headline, 36px)", lineHeight: 1.05 },
  benefitTitle: { fontSize: "var(--paywall-benefit-title, 20px)", lineHeight: 1.15 },
  benefitBody: { fontSize: "var(--paywall-benefit-body, 17px)", lineHeight: 1.25 },
  planTitle: { fontSize: "var(--paywall-plan-title, 26px)", lineHeight: 1 },
  price: { fontSize: "var(--paywall-price, 34px)", lineHeight: 1 },
  detail: { fontSize: "var(--paywall-detail, 17px)", lineHeight: 1.15 },
  badge: { fontSize: "var(--paywall-badge, 14px)", lineHeight: 1 },
  cta: { fontSize: "var(--paywall-cta, 25px)", lineHeight: 1.1 },
  reassurance: { fontSize: "var(--paywall-reassurance, 16px)", lineHeight: 1.3 },
  footer: { fontSize: "var(--paywall-footer, 17px)", lineHeight: 1 },
};

const WEB_OFFER_KEYS = ["currency", "interval", "key", "trialDays", "unitAmount"];

function snapshotPlainRecord(value, expectedKeys) {
  try {
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype
    ) {
      return null;
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const keys = Reflect.ownKeys(descriptors);
    if (
      keys.length !== expectedKeys.length ||
      !expectedKeys.every((key) => keys.includes(key))
    ) {
      return null;
    }
    const snapshot = Object.create(null);
    for (const key of expectedKeys) {
      const descriptor = descriptors[key];
      if (!descriptor || !("value" in descriptor)) return null;
      snapshot[key] = descriptor.value;
    }
    return snapshot;
  } catch {
    return null;
  }
}

function snapshotPlanList(plans) {
  try {
    if (!Array.isArray(plans) || Object.getPrototypeOf(plans) !== Array.prototype) {
      return null;
    }
    const descriptors = Object.getOwnPropertyDescriptors(plans);
    const keys = Reflect.ownKeys(descriptors);
    if (
      keys.length !== 3 ||
      !keys.includes("0") ||
      !keys.includes("1") ||
      !keys.includes("length") ||
      descriptors.length?.value !== 2 ||
      !("value" in descriptors[0]) ||
      !("value" in descriptors[1])
    ) {
      return null;
    }
    return [descriptors[0].value, descriptors[1].value];
  } catch {
    return null;
  }
}

function trustedOffer(key) {
  if (key === "annual") return VERIFIED_WEB_OFFERS.annual;
  if (key === "monthly") return VERIFIED_WEB_OFFERS.monthly;
  return null;
}

function freshOffer(expected) {
  return {
    key: expected.key,
    currency: expected.currency,
    unitAmount: expected.unitAmount,
    interval: expected.interval,
    trialDays: expected.trialDays,
  };
}

function verifiedWebPlans(plans) {
  const planInputs = snapshotPlanList(plans);
  if (!planInputs) return null;
  const normalized = Object.create(null);
  for (const planInput of planInputs) {
    const plan = snapshotPlainRecord(planInput, WEB_OFFER_KEYS);
    if (!plan) return null;
    const expected = trustedOffer(plan.key);
    if (
      !expected ||
      !WEB_OFFER_KEYS.every((key) => plan[key] === expected[key]) ||
      Object.hasOwn(normalized, plan.key)
    ) {
      return null;
    }
    normalized[plan.key] = freshOffer(expected);
  }
  return normalized.annual && normalized.monthly ? normalized : null;
}

function webPrice(plan) {
  const amount = plan.unitAmount / 100;
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}/${plan.interval}`;
}

function Benefit({ icon, title, body }) {
  return (
    <li className="paywall-benefit flex min-h-0 items-center gap-4 border-b border-ink/15 py-4 last:border-b-0">
      <span className="paywall-benefit-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F1ECE4] text-sage-dark">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-sans font-bold text-ink" style={fixedText.benefitTitle}>
          {title}
        </span>
        <span className="mt-1 block font-sans text-ink-soft" style={fixedText.benefitBody}>
          {body}
        </span>
      </span>
    </li>
  );
}

function PlanCard({ disabled, native, offer, onSelect, selected, storeProducts, tabIndex }) {
  const storeProduct = native
    ? storeProducts.find((product) =>
        typeof product?.id === "string" && product.id.endsWith(`.${offer.key}`),
      )
    : null;
  const displayed = native
    ? {
        ...offer,
        ...(offer.key === "annual" && storeProduct
          ? { detail: `Billed as ${storeProduct.displayPrice}/year` }
          : {}),
        ...(offer.key === "monthly" && storeProduct
          ? { price: storeProduct.displayPrice }
          : {}),
      }
    : offer;
  const isAnnual = offer.key === "annual";
  const SelectionIcon = selected ? CircleDot : Circle;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      data-plan-key={offer.key}
      tabIndex={tabIndex}
      disabled={disabled}
      onClick={() => onSelect(offer.key)}
      className={`paywall-plan-card paywall-plan-${offer.key} w-full min-w-0 rounded-[20px] bg-[#FFFCF8] px-4 text-left transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ink ${
        isAnnual ? "min-h-[148px] py-5" : "min-h-[104px] py-4"
      } ${selected ? "border-[2.5px] border-clay shadow-card" : "border-2 border-ink/15"}`}
    >
      <span className="flex h-full min-w-0 items-center gap-3">
        <SelectionIcon
          className={`h-9 w-9 shrink-0 ${selected ? "text-clay" : "text-ink-faint"}`}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="font-sans font-bold text-ink" style={fixedText.planTitle}>
            {native
              ? displayed.name
              : displayed.name || (isAnnual ? "Annual" : "Monthly")}
          </span>
          {native ? (
            <>
              <span className="mt-2 flex items-baseline gap-1.5">
                <span className="font-sans font-semibold text-clay" style={fixedText.price}>
                  {displayed.price}
                </span>
                <span className="font-sans text-ink">{displayed.cadence}</span>
              </span>
              {isAnnual ? (
                <span className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-sans text-ink" style={fixedText.detail}>
                    {displayed.detail}
                  </span>
                  <span className="shrink-0 rounded-lg bg-cream px-2 py-1.5 font-sans font-bold uppercase text-sage-dark" style={fixedText.badge}>
                    7-day free trial
                  </span>
                </span>
              ) : null}
            </>
          ) : (
            <>
              <span className="mt-2 block font-sans font-semibold text-clay" style={fixedText.price}>
                {webPrice(displayed)}
              </span>
              <span className="mt-2 block font-sans text-ink" style={fixedText.detail}>
                {`${displayed.trialDays} days free, then ${webPrice(displayed)} unless canceled.`}
              </span>
            </>
          )}
        </span>
      </span>
    </button>
  );
}

function Header({ busy, label, onBack }) {
  return (
    <header className="paywall-header relative flex h-14 shrink-0 items-center justify-center">
      <button
        type="button"
        onClick={onBack}
        disabled={busy}
        className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
        aria-label={label}
      >
        <X className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
      </button>
      <div className="flex min-w-0 items-center justify-center gap-2">
        <img src="/everwise-logo-192.png" alt="" className="paywall-logo h-[52px] w-[52px] shrink-0 object-contain" />
        <span className="truncate font-serif font-bold text-ink" style={fixedText.wordmark}>
          EverWise
        </span>
      </div>
    </header>
  );
}

function LegalFooter({ busy, native, onRestore }) {
  return (
    <div
      className="paywall-footer flex min-h-12 shrink-0 items-center justify-center gap-3 font-sans font-semibold text-teal-800"
      style={{ ...fixedText.footer, color: "#146F6A" }}
    >
      <button type="button" className="min-h-11 rounded-md underline decoration-transparent underline-offset-4 hover:decoration-current" onClick={() => openLegalPage("terms")}>
        Terms
      </button>
      <span aria-hidden="true">•</span>
      <button type="button" className="min-h-11 rounded-md underline decoration-transparent underline-offset-4 hover:decoration-current" onClick={() => openLegalPage("privacy")}>
        Privacy
      </button>
      {native ? (
        <>
          <span aria-hidden="true">•</span>
          <button type="button" className="min-h-11 rounded-md underline decoration-transparent underline-offset-4 hover:decoration-current" onClick={onRestore} disabled={busy}>
            Restore
          </button>
        </>
      ) : null}
    </div>
  );
}

function Unavailable({ busy, message, onBack, onRetry, sponsored }) {
  return (
    <div data-testid="browser-paywall" className="release-paywall relative flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-[#F8F5EF] px-5 pb-6 pt-4">
      <Header busy={busy} label="Back to free lessons" onBack={onBack} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-8 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {sponsored ? "Your learning access is ready" : "Continue learning on the web"}
        </h1>
        <p className="mx-auto mt-6 text-xl leading-relaxed text-ink-soft" role="status">
          {message}
        </p>
        {!sponsored && typeof onRetry === "function" ? (
          <button type="button" className="btn-primary mx-auto mt-7 min-h-11" onClick={onRetry} disabled={busy}>
            Retry
          </button>
        ) : null}
        <button type="button" className="btn-secondary mx-auto mt-4 min-h-11" onClick={onBack} disabled={busy}>
          Continue with free lessons
        </button>
      </main>
      <LegalFooter busy={busy} native={false} />
    </div>
  );
}

export default function Paywall({
  billingAvailable = false,
  billingBusy = false,
  billingMessage = "",
  billingPlans = [],
  onMaybeLater,
  onRestore,
  onRetry,
  onStartTrial,
  platform = "native",
  purchasesAvailable = true,
  sponsored = false,
  storeProducts = [],
}) {
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [restoreAnnouncement, setRestoreAnnouncement] = useState("");
  const [localBusy, setLocalBusy] = useState(false);
  const [error, setError] = useState("");
  const native = platform === "native";
  const busy = billingBusy || localBusy;
  const webPlans = native ? null : verifiedWebPlans(billingPlans);
  const offers = native ? NATIVE_PLANS : webPlans;

  const handlePlanKeyDown = (event) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key) || busy) return;
    const cards = Array.from(event.currentTarget.querySelectorAll('[role="radio"]'));
    const currentIndex = cards.indexOf(event.target.closest('[role="radio"]'));
    if (currentIndex < 0 || cards.length === 0) return;
    event.preventDefault();
    let nextIndex;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = cards.length - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % cards.length;
    else nextIndex = (currentIndex - 1 + cards.length) % cards.length;
    setSelectedPlan(cards[nextIndex].dataset.planKey);
    cards[nextIndex].focus();
  };

  const startPurchase = async () => {
    setLocalBusy(true);
    setError("");
    try {
      await onStartTrial(selectedPlan);
    } catch (purchaseError) {
      if (purchaseError?.code !== "PURCHASE_CANCELLED") {
        setError(purchaseError?.message || "The subscription could not be started. Please try again.");
      }
    } finally {
      setLocalBusy(false);
    }
  };

  const restore = async () => {
    setLocalBusy(true);
    setError("");
    setRestoreAnnouncement("");
    try {
      await onRestore();
      setRestoreAnnouncement("Purchase restored.");
    } catch (restoreError) {
      const message = restoreError?.message || "No active subscription was found for this Apple Account.";
      setError(message);
      setRestoreAnnouncement(message);
    } finally {
      setLocalBusy(false);
    }
  };

  if (sponsored) {
    return (
      <Unavailable
        busy={busy}
        message="Your access is provided by a community partner."
        onBack={onMaybeLater}
        sponsored
      />
    );
  }

  if (
    (!native && !billingAvailable) ||
    (native && !purchasesAvailable)
  ) {
    return (
      <Unavailable
        busy={busy}
        message={native
          ? "Lesson 1 is free. Subscription purchases are not available in this browser."
          : "Subscription options are temporarily unavailable."}
        onBack={onMaybeLater}
        onRetry={native ? undefined : onRetry}
      />
    );
  }

  // Monthly first: the lower commitment is the easier first step for someone
  // still deciding, so it should be the option they read first.
  const offerList = offers
    ? ["monthly", "annual"].map((key) => offers[key]).filter(Boolean)
    : [];
  if (!native && offers === null) {
    return (
      <Unavailable
        busy={busy}
        message="Subscription options are temporarily unavailable."
        onBack={onMaybeLater}
        onRetry={onRetry}
      />
    );
  }

  const selectedOffer = offers[selectedPlan];
  const ctaLabel = native
    ? selectedPlan === "annual" ? "Start your free trial" : "Continue with monthly"
    : `Start ${selectedOffer.trialDays}-day free trial`;

  return (
    <div data-testid="browser-paywall" className="release-paywall relative flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-[#F8F5EF] px-5 pb-0 pt-4">
      <Header busy={busy} label={native ? "Close subscription options" : "Back to free lessons"} onBack={onMaybeLater} />
      <main className="paywall-main flex min-h-0 min-w-0 flex-1 flex-col justify-between">
        <div className="paywall-layout min-w-0">
          <section className="paywall-story min-w-0">
            <h1 className="paywall-headline mt-5 shrink-0 text-center font-serif font-bold tracking-tight text-ink" style={fixedText.headline}>
              Feel confident online.
            </h1>
            <ul className="paywall-benefits mt-5 shrink-0">
              <Benefit icon={<Search className="h-8 w-8" strokeWidth={2.1} />} title="Check suspicious messages" body="Get a clear explanation before responding." />
              <Benefit icon={<MessageCircleWarning className="h-8 w-8" strokeWidth={2.1} />} title="Recognize scams sooner" body="Learn the warning signs and protect your money." />
            </ul>
          </section>
          <section className="paywall-offer min-w-0">
            {billingMessage ? (
              <p className="mt-3 rounded-xl bg-sage/10 px-4 py-3 text-center font-sans text-base font-semibold text-sage-dark" role="status">
                {billingMessage}
              </p>
            ) : null}
            <div className="paywall-plans mt-5 grid min-w-0 shrink-0 gap-3" role="radiogroup" aria-label="Choose a subscription plan" aria-busy={busy} onKeyDown={handlePlanKeyDown}>
              {offerList.map((offer) => (
                <PlanCard
                  key={offer.key}
                  disabled={busy}
                  native={native}
                  offer={offer}
                  selected={selectedPlan === offer.key}
                  onSelect={setSelectedPlan}
                  storeProducts={storeProducts}
                  tabIndex={selectedPlan === offer.key ? 0 : -1}
                />
              ))}
            </div>
            {error ? (
              <p className="mt-3 rounded-xl bg-alert/10 px-4 py-3 text-center font-sans text-base font-semibold leading-snug text-alert" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              aria-label={ctaLabel}
              className="paywall-cta mt-4 flex min-h-[68px] w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-clay px-5 font-sans font-bold text-cream-card shadow-btn transition-colors hover:bg-clay-dark disabled:cursor-wait disabled:opacity-70"
              style={fixedText.cta}
              onClick={startPurchase}
              disabled={busy}
            >
              {ctaLabel}
              <ArrowRight className="h-7 w-7 shrink-0" aria-hidden="true" />
            </button>
            {busy && !native ? (
              // The browser stays on this screen while the Checkout Session is
              // created, which can take a moment. Announce the wait separately
              // so the button keeps its stable accessible name.
              <p
                className="mt-3 shrink-0 text-center font-sans text-base font-semibold text-sage-dark"
                role="status"
              >
                Opening secure checkout…
              </p>
            ) : null}
            {native ? (
              <p className="paywall-reassurance mt-3 shrink-0 text-center font-sans text-ink" style={fixedText.reassurance}>
                {selectedPlan === "annual"
                  ? "No charge today. Renews at $89.99/year after your 7-day trial unless you cancel."
                  : "$14.99 billed monthly. Renews automatically unless you cancel."}
              </p>
            ) : (
              <p className="paywall-reassurance mt-3 shrink-0 text-center font-sans text-ink" style={fixedText.reassurance}>
                Your payment method is collected now. Billing starts automatically after your trial unless you cancel.
              </p>
            )}
          </section>
        </div>
        <LegalFooter busy={busy} native={native} onRestore={restore} />
      </main>
      {restoreAnnouncement ? <span className="sr-only" role="status">{restoreAnnouncement}</span> : null}
    </div>
  );
}
