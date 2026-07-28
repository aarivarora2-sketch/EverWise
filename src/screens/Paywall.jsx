import { useState } from "react";
import {
  ArrowRight,
  Circle,
  CircleDot,
  MessageCircleWarning,
  Search,
  X,
} from "lucide-react";

const PLANS = {
  annual: {
    name: "Annual",
    price: "$7.50",
    cadence: "/month",
    detail: "Billed as $89.99/year",
  },
  monthly: {
    name: "Monthly",
    price: "$14.99",
    cadence: "/month",
    detail: "Billed monthly",
  },
};

const fixedText = {
  wordmark: { fontSize: "var(--paywall-wordmark, 30px)", lineHeight: 1 },
  headline: { fontSize: "var(--paywall-headline, 36px)", lineHeight: 1.05 },
  benefitTitle: { fontSize: "var(--paywall-benefit-title, 20px)", lineHeight: 1.15 },
  benefitBody: { fontSize: "var(--paywall-benefit-body, 17px)", lineHeight: 1.25 },
  planTitle: { fontSize: "var(--paywall-plan-title, 26px)", lineHeight: 1 },
  price: { fontSize: "var(--paywall-price, 34px)", lineHeight: 1 },
  cadence: { fontSize: "var(--paywall-cadence, 17px)", lineHeight: 1 },
  detail: { fontSize: "var(--paywall-detail, 17px)", lineHeight: 1.15 },
  badge: { fontSize: "var(--paywall-badge, 14px)", lineHeight: 1 },
  cta: { fontSize: "var(--paywall-cta, 25px)", lineHeight: 1.1 },
  reassurance: { fontSize: "var(--paywall-reassurance, 16px)", lineHeight: 1.15 },
  footer: { fontSize: "var(--paywall-footer, 17px)", lineHeight: 1 },
};

function Benefit({ icon, title, body }) {
  return (
    <li className="paywall-benefit flex min-h-0 items-center gap-4 border-b border-ink/15 py-4 last:border-b-0">
      <span className="paywall-benefit-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F1ECE4] text-sage-dark">
        {icon}
      </span>
      <span className="min-w-0">
        <span
          className="block font-sans font-bold text-ink"
          style={fixedText.benefitTitle}
        >
          {title}
        </span>
        <span
          className="mt-1 block font-sans text-ink-soft"
          style={fixedText.benefitBody}
        >
          {body}
        </span>
      </span>
    </li>
  );
}

function PlanCard({ planKey, selectedPlan, onSelect, storeProducts }) {
  const storeProduct = storeProducts.find((product) =>
    product.id.endsWith(`.${planKey}`),
  );
  const plan = {
    ...PLANS[planKey],
    ...(planKey === "annual" && storeProduct
      ? { detail: `Billed as ${storeProduct.displayPrice}/year` }
      : {}),
    ...(planKey === "monthly" && storeProduct
      ? { price: storeProduct.displayPrice }
      : {}),
  };
  const selected = selectedPlan === planKey;
  const isAnnual = planKey === "annual";
  const SelectionIcon = selected ? CircleDot : Circle;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(planKey)}
      className={`paywall-plan-card paywall-plan-${planKey} w-full rounded-[20px] bg-[#FFFCF8] px-4 text-left transition-colors ${
        isAnnual ? "min-h-[148px] py-5" : "min-h-[104px] py-4"
      } ${
        selected
          ? "border-[2.5px] border-clay shadow-card"
          : "border-2 border-ink/15"
      }`}
    >
      <span className="flex h-full items-center gap-3">
        <SelectionIcon
          className={`h-9 w-9 shrink-0 ${
            selected ? "text-clay" : "text-ink-faint"
          }`}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span
              className="font-sans font-bold text-ink"
              style={fixedText.planTitle}
            >
              {plan.name}
            </span>
            {isAnnual ? (
              <span
                className="shrink-0 rounded-lg bg-sage px-2.5 py-2 font-sans font-bold uppercase text-cream-card"
                style={fixedText.badge}
              >
                Save 50%
              </span>
            ) : null}
          </span>

          <span className="mt-2 flex items-baseline gap-1.5">
            <span
              className="font-sans font-semibold text-clay"
              style={fixedText.price}
            >
              {plan.price}
            </span>
            <span className="font-sans text-ink" style={fixedText.cadence}>
              {plan.cadence}
            </span>
          </span>

          {isAnnual ? (
            <span className="mt-2 flex items-center justify-between gap-2">
              <span className="font-sans text-ink" style={fixedText.detail}>
                {plan.detail}
              </span>
              <span
                className="shrink-0 rounded-lg bg-cream px-2 py-1.5 font-sans font-bold uppercase text-sage-dark"
                style={fixedText.badge}
              >
                7-day free trial
              </span>
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

function InformationSheet({ type, onClose }) {
  const content =
    type === "terms"
      ? {
          title: "Terms",
          body: "Annual plan: 7-day free trial, then $89.99/year ($7.50/mo) unless canceled before the trial ends. Monthly plan: $14.99/month starting immediately. Both plans renew automatically until canceled. Manage or cancel anytime in Settings or in your Apple ID subscription settings — canceling stops the next renewal but doesn't refund the current period. Full terms: everwise.app/terms",
        }
      : {
          title: "Privacy",
          body: "Everwise stores your name, email, and lesson progress to run your account. Messages you check for scams are sent to our AI provider only to generate a result and are not stored by Everwise. We don't sell your data or show ads. Never share passwords, security codes, or full payment details in Everwise. Full policy: everwise.app/privacy",
        };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-ink/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-information-title"
    >
      <div className="w-full rounded-t-3xl bg-cream px-6 pb-7 pt-6 shadow-[0_-8px_40px_rgba(34,32,28,0.18)] animate-fade-up">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="paywall-information-title"
            className="font-sans text-2xl font-bold text-ink"
          >
            {content.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
            aria-label={`Close ${content.title.toLowerCase()}`}
          >
            <X className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-3 font-sans text-lg leading-snug text-ink-soft">
          {content.body}
        </p>
        <button type="button" className="btn-primary mt-5" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function Paywall({
  onStartTrial,
  onMaybeLater,
  onRestore,
  storeProducts = [],
}) {
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [informationType, setInformationType] = useState(null);
  const [restoreAnnouncement, setRestoreAnnouncement] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const startPurchase = async () => {
    setBusy(true);
    setError("");
    try {
      await onStartTrial(selectedPlan);
    } catch (purchaseError) {
      if (purchaseError?.code !== "PURCHASE_CANCELLED") {
        setError(
          purchaseError?.message ||
            "The subscription could not be started. Please try again.",
        );
      }
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    setError("");
    setRestoreAnnouncement("");
    try {
      await onRestore();
      setRestoreAnnouncement("Purchase restored.");
    } catch (restoreError) {
      const message =
        restoreError?.message ||
        "No active subscription was found for this Apple Account.";
      setError(message);
      setRestoreAnnouncement(message);
      setBusy(false);
    }
  };

  return (
    <div className="release-paywall relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#F8F5EF] px-5 pb-0 pt-4">
      <header className="paywall-header relative flex h-14 shrink-0 items-center justify-center">
        <button
          type="button"
          onClick={onMaybeLater}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
          aria-label="Close subscription options"
        >
          <X className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
        </button>

        <div className="flex min-w-0 items-center justify-center gap-2">
          <img
            src="/everwise-logo-192.png"
            alt=""
            className="paywall-logo h-[52px] w-[52px] shrink-0 object-contain"
          />
          <span
            className="truncate font-serif font-bold text-ink"
            style={fixedText.wordmark}
          >
            EverWise
          </span>
        </div>
      </header>

      <main className="paywall-main flex min-h-0 flex-1 flex-col justify-between">
        <h1
          className="paywall-headline mt-5 shrink-0 text-center font-serif font-bold tracking-tight text-ink"
          style={fixedText.headline}
        >
          Feel confident online.
        </h1>

        <ul className="paywall-benefits mt-5 shrink-0">
          <Benefit
            icon={<Search className="h-8 w-8" strokeWidth={2.1} />}
            title="Check suspicious messages"
            body="Get a clear explanation before responding."
          />
          <Benefit
            icon={<MessageCircleWarning className="h-8 w-8" strokeWidth={2.1} />}
            title="Recognize scams sooner"
            body="Learn the warning signs and protect your money."
          />
        </ul>

        <div
          className="paywall-plans mt-5 grid shrink-0 gap-3"
          role="radiogroup"
          aria-label="Choose a subscription plan"
        >
          <PlanCard
            planKey="annual"
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlan}
            storeProducts={storeProducts}
          />
          <PlanCard
            planKey="monthly"
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlan}
            storeProducts={storeProducts}
          />
        </div>

        {error ? (
          <p
            className="mt-3 rounded-xl bg-alert/10 px-4 py-3 text-center font-sans text-base font-semibold leading-snug text-alert"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="button"
          className="paywall-cta mt-4 flex min-h-[68px] w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-clay px-5 font-sans font-bold text-cream-card shadow-btn transition-colors hover:bg-clay-dark disabled:cursor-wait disabled:opacity-70"
          style={fixedText.cta}
          onClick={startPurchase}
          disabled={busy}
        >
          {busy
            ? "Please wait…"
            : selectedPlan === "annual"
              ? "Start your free trial"
              : "Continue with monthly"}
          <ArrowRight className="h-7 w-7 shrink-0" aria-hidden="true" />
        </button>

        <p
          className="paywall-reassurance mt-3 shrink-0 text-center font-sans text-ink"
          style={fixedText.reassurance}
        >
          {selectedPlan === "annual"
            ? "No charge today. Renews at $89.99/year after your 7-day trial unless you cancel."
            : "$14.99 billed monthly. Renews automatically unless you cancel."}
        </p>

        <div
          className="paywall-footer flex min-h-12 shrink-0 items-center justify-center gap-3 font-sans font-semibold text-teal-800"
          style={{ ...fixedText.footer, color: "#146F6A" }}
        >
          <button
            type="button"
            className="min-h-9 rounded-md underline decoration-transparent underline-offset-4 hover:decoration-current"
            onClick={() => setInformationType("terms")}
          >
            Terms
          </button>
          <span aria-hidden="true">•</span>
          <button
            type="button"
            className="min-h-9 rounded-md underline decoration-transparent underline-offset-4 hover:decoration-current"
            onClick={() => setInformationType("privacy")}
          >
            Privacy
          </button>
          <span aria-hidden="true">•</span>
          <button
            type="button"
            className="min-h-9 rounded-md underline decoration-transparent underline-offset-4 hover:decoration-current"
            onClick={restore}
            disabled={busy}
          >
            Restore
          </button>
        </div>
      </main>

      {restoreAnnouncement ? (
        <span className="sr-only" role="status">
          {restoreAnnouncement}
        </span>
      ) : null}

      {informationType ? (
        <InformationSheet
          type={informationType}
          onClose={() => setInformationType(null)}
        />
      ) : null}
    </div>
  );
}
