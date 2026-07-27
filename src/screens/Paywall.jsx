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
  wordmark: { fontSize: "30px", lineHeight: 1 },
  headline: { fontSize: "36px", lineHeight: 1.05 },
  benefitTitle: { fontSize: "20px", lineHeight: 1.15 },
  benefitBody: { fontSize: "17px", lineHeight: 1.25 },
  planTitle: { fontSize: "26px", lineHeight: 1 },
  price: { fontSize: "34px", lineHeight: 1 },
  cadence: { fontSize: "17px", lineHeight: 1 },
  detail: { fontSize: "17px", lineHeight: 1.15 },
  badge: { fontSize: "14px", lineHeight: 1 },
  cta: { fontSize: "25px", lineHeight: 1.1 },
  reassurance: { fontSize: "16px", lineHeight: 1.15 },
  footer: { fontSize: "17px", lineHeight: 1 },
};

function Benefit({ icon, title, body }) {
  return (
    <li className="flex min-h-0 items-center gap-4 border-b border-ink/15 py-4 last:border-b-0">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F1ECE4] text-sage-dark">
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

function PlanCard({ planKey, selectedPlan, onSelect }) {
  const plan = PLANS[planKey];
  const selected = selectedPlan === planKey;
  const isAnnual = planKey === "annual";
  const SelectionIcon = selected ? CircleDot : Circle;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(planKey)}
      className={`w-full rounded-[20px] bg-[#FFFCF8] px-4 text-left transition-colors ${
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
          body: "No real purchase is made in this preview. Approved subscription terms will be connected before billing is enabled.",
        }
      : {
          title: "Privacy",
          body: "Never share passwords, security codes, or full payment details in Everwise. Approved privacy information will be connected before billing is enabled.",
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

export default function Paywall({ onStartTrial, onMaybeLater }) {
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [informationType, setInformationType] = useState(null);
  const [restoreAnnouncement, setRestoreAnnouncement] = useState("");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F8F5EF] px-5 pb-4 pt-4">
      <header className="relative flex h-14 shrink-0 items-center justify-center">
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
            className="h-[52px] w-[52px] shrink-0 object-contain"
          />
          <span
            className="truncate font-serif font-bold text-ink"
            style={fixedText.wordmark}
          >
            EverWise
          </span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <h1
          className="mt-5 shrink-0 whitespace-nowrap font-serif font-bold tracking-tight text-ink"
          style={fixedText.headline}
        >
          Feel confident online.
        </h1>

        <ul className="mt-5 shrink-0">
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
          className="mt-5 grid shrink-0 gap-3"
          role="radiogroup"
          aria-label="Choose a subscription plan"
        >
          <PlanCard
            planKey="annual"
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlan}
          />
          <PlanCard
            planKey="monthly"
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlan}
          />
        </div>

        <button
          type="button"
          className="mt-4 flex min-h-[68px] w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-clay px-5 font-sans font-bold text-cream-card shadow-btn transition-colors hover:bg-clay-dark"
          style={fixedText.cta}
          onClick={() => onStartTrial(selectedPlan)}
        >
          {selectedPlan === "annual"
            ? "Start your free trial"
            : "Continue with monthly"}
          <ArrowRight className="h-7 w-7 shrink-0" aria-hidden="true" />
        </button>

        <p
          className="mt-3 shrink-0 text-center font-sans text-ink"
          style={fixedText.reassurance}
        >
          {selectedPlan === "annual"
            ? "No charge today. Cancel anytime."
            : "$14.99 billed monthly. Cancel anytime."}
        </p>

        <div
          className="mt-auto flex min-h-10 shrink-0 items-end justify-center gap-3 font-sans font-semibold text-teal-800"
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
            onClick={() => setRestoreAnnouncement("Nothing to restore")}
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
