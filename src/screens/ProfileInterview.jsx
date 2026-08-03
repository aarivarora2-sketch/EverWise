import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, HelpCircle } from "lucide-react";
import Field from "../components/Field";
import ReadAloud from "../components/ReadAloud";
import { authErrorMessage } from "../utils/authErrors";
import { buildResearchSnapshot } from "../utils/partnerResearch.js";
import { isValidEmail, normalizeEmail } from "../utils/validation";

const PUBLIC_STEP_IDS = [1, 2, 3, 4, 5, 7, 11, 12];
const SPONSORED_STEP_IDS = [1, 2, 3, 4, 5, 7, 11, "consent", 12];

const options = {
  internetUse: [
    "Every day",
    "A few times a week",
    "Rarely",
    "Almost never",
  ],
  primaryDevice: [
    "Smartphone",
    "Tablet",
    "Computer",
    "TV",
  ],
  confidence: [
    "Confident",
    "Sometimes I need help",
    "I often have difficulties",
    "I’m just getting started",
  ],
  scamFrequency: [
    { value: "never", label: "Never" },
    { value: "few", label: "A few times (1–4)" },
    { value: "often", label: "Often (5–10)" },
    { value: "many", label: "Many times (10+)" },
  ],
  concerns: [
    "Scam calls and messages",
    "Money or bank-card theft",
    "Suspicious links",
    "Account hacking",
    "Fake news",
    "Knowing what to trust",
  ],
  scamScenario: [
    "Open the link",
    "Reply to the message",
    "Call the bank using its official number",
    "I’m not sure",
  ],
  aiExperience: [
    "Yes, regularly",
    "I’ve tried it a few times",
    "I’ve heard of it",
    "I don’t know what it is yet",
  ],
  accessibility: [
    "Arthritis or joint discomfort",
    "Memory difficulties",
    "Vision loss",
    "Tremors or hand movement",
    "Hearing difficulties",
    "Another need",
    "Prefer not to say",
  ],
  trustedContact: ["Yes", "Maybe later", "No"],
};

const prompts = {
  1: "Let’s make the internet and artificial intelligence easier and safer. Tell us what we should call you and your age.",
  2: "How often do you use the internet, and which device do you use most often?",
  3: "How confident do you feel online? Sometimes needing help is completely normal.",
  4: "What worries you most about online safety? Choose all that apply.",
  5: "Your bank card is locked. Open this link immediately. What would you do?",
  7: "Have you used artificial intelligence, such as ChatGPT or a voice assistant?",
  11: "Tell us what could make the app more comfortable, and whether you may want help from a trusted person.",
  consent: "Would you like to share a minimized copy to help improve EverWise?",
  12: "Create a secure account so your personal plan and lesson progress are saved.",
};

function ChoiceButton({ selected, children, onClick, multi = false, tabIndex }) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      tabIndex={tabIndex}
      onClick={onClick}
      className={`flex min-h-[60px] w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold transition-colors ${
        selected
          ? "border-sage bg-sage/10 text-ink"
          : "border-ink/15 bg-cream-card text-ink hover:border-ink/30"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center ${
          multi ? "rounded-lg" : "rounded-full"
        } border-2 ${
          selected
            ? "border-sage bg-sage text-cream-card"
            : "border-ink/30 bg-transparent"
        }`}
        aria-hidden="true"
      >
        {selected ? <Check className="h-5 w-5" strokeWidth={3} /> : null}
      </span>
      <span>{children}</span>
    </button>
  );
}

function Choices({ values, selected, onSelect, multi = false, label }) {
  const radioValues = values.map((option) =>
    typeof option === "string" ? option : option.value,
  );
  const selectedIndex = multi
    ? -1
    : radioValues.findIndex((value) => value === selected);

  const handleKeyDown = (event) => {
    if (multi) return;
    const keys = [
      "ArrowRight",
      "ArrowDown",
      "ArrowLeft",
      "ArrowUp",
      "Home",
      "End",
    ];
    if (!keys.includes(event.key)) return;
    const buttons = Array.from(
      event.currentTarget.querySelectorAll('[role="radio"]'),
    );
    const currentIndex = buttons.indexOf(event.target.closest('[role="radio"]'));
    if (currentIndex < 0 || buttons.length === 0) return;
    event.preventDefault();
    let nextIndex;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = buttons.length - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % buttons.length;
    } else {
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    }
    onSelect(radioValues[nextIndex]);
    buttons[nextIndex].focus();
  };

  return (
    <div
      className="mt-3 space-y-3"
      role={multi ? undefined : "radiogroup"}
      aria-label={multi ? undefined : label}
      onKeyDown={handleKeyDown}
    >
      {values.map((option, index) => {
        const value = typeof option === "string" ? option : option.value;
        const label = typeof option === "string" ? option : option.label;
        return (
          <ChoiceButton
            key={value}
            multi={multi}
            tabIndex={
              multi
                ? undefined
                : selectedIndex < 0
                  ? index === 0
                    ? 0
                    : -1
                  : index === selectedIndex
                    ? 0
                    : -1
            }
            selected={
              multi ? selected.includes(value) : selected === value
            }
            onClick={() => onSelect(value)}
          >
            {label}
          </ChoiceButton>
        );
      })}
    </div>
  );
}

function HelpfulNote({ children }) {
  return (
    <div
      className="mt-5 rounded-2xl border-2 border-sage/30 bg-sage/10 px-5 py-4 text-lg leading-relaxed text-ink"
      role="status"
    >
      <p className="font-bold text-sage-dark">A useful first step</p>
      <p className="mt-1">{children}</p>
    </div>
  );
}

export default function ProfileInterview({
  partner = null,
  initialInterview = null,
  existingAccountEmail = "",
  externalBusy = false,
  externalError = "",
  onComplete,
  onBack,
  onLogIn,
}) {
  const contentRef = useRef(null);
  const stepIds =
    partner && !existingAccountEmail ? SPONSORED_STEP_IDS : PUBLIC_STEP_IDS;
  const totalSteps = stepIds.length;
  const initial = initialInterview || {};
  const [stepIndex, setStepIndex] = useState(
    initialInterview ? totalSteps - 1 : 0,
  );
  const [name, setName] = useState(initial.name || "");
  const [age, setAge] = useState(
    initial.age == null ? "" : String(initial.age),
  );
  const [internetUse, setInternetUse] = useState(initial.internetUse || "");
  const [primaryDevice, setPrimaryDevice] = useState(initial.primaryDevice || "");
  const [confidence, setConfidence] = useState(initial.confidence || "");
  const [scamFrequency, setScamFrequency] = useState(initial.scamFrequency || "");
  const [concerns, setConcerns] = useState(initial.concerns || []);
  const [scamScenario, setScamScenario] = useState(initial.scamScenario || "");
  const [aiExperience, setAiExperience] = useState(initial.aiExperience || "");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(
    initial.accessibilityNeeds || [],
  );
  const [trustedContact, setTrustedContact] = useState(initial.trustedContact || "");
  const [researchConsent, setResearchConsent] = useState(
    initial.researchConsent ?? null,
  );
  const [email, setEmail] = useState(
    existingAccountEmail || initial.email || "",
  );
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState(initial.password || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const isBusy = busy || externalBusy;

  const step = stepIds[stepIndex];
  const progress = useMemo(
    () => ((stepIndex + 1) / totalSteps) * 100,
    [stepIndex, totalSteps],
  );

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [stepIndex]);

  const toggle = (value, current, setCurrent) => {
    if (value === "Prefer not to say") {
      setCurrent(current.includes(value) ? [] : [value]);
      return;
    }
    const withoutPrivate = current.filter(
      (item) => item !== "Prefer not to say",
    );
    setCurrent(
      withoutPrivate.includes(value)
        ? withoutPrivate.filter((item) => item !== value)
        : [...withoutPrivate, value],
    );
  };

  const validateStep = () => {
    if (step === 1) {
      const ageNumber = Number(age);
      if (!name.trim()) return "Please enter your name.";
      if (!age || !Number.isFinite(ageNumber) || ageNumber < 18 || ageNumber > 120) {
        return "Please enter an age between 18 and 120.";
      }
    }
    if (step === 2 && (!internetUse || !primaryDevice)) {
      return "Please choose one answer for both questions.";
    }
    if (step === 3 && !confidence) return "Please choose one answer.";
    if (step === 4 && concerns.length === 0) {
      return "Please choose at least one concern, or skip this question.";
    }
    if (step === 5 && !scamScenario) return "Please choose one answer.";
    if (step === 7 && !aiExperience) return "Please choose one answer.";
    if (step === 11 && !trustedContact) {
      return "Please choose whether you may want trusted-person help.";
    }
    if (step === "consent" && researchConsent === null) {
      return "Please choose Yes or No before continuing.";
    }
    if (step === 12) {
      if (existingAccountEmail) return "";
      setEmailTouched(true);
      if (!email.trim()) return "Please enter your email.";
      if (!isValidEmail(email)) {
        return "Please enter a complete email like name@example.com.";
      }
      if (password.length < 6) {
        return "Please choose a password with at least 6 characters.";
      }
    }
    return "";
  };

  const submit = async () => {
    if (isBusy) return;
    const nextError = validateStep();
    if (nextError) {
      setError(nextError);
      return;
    }
    setError("");

    if (stepIndex < totalSteps - 1) {
      setStepIndex((current) => current + 1);
      setShowHelp(false);
      return;
    }

    setBusy(true);
    try {
      const interview = {
        name: name.trim(),
        age: Number(age),
        email: normalizeEmail(email),
        password,
        internetUse,
        primaryDevice,
        confidence,
        scamFrequency,
        concerns,
        scamScenario,
        aiExperience,
        accessibilityNeeds,
        trustedContact,
      };
      if (partner && !existingAccountEmail) {
        interview.researchConsent = researchConsent;
        interview.researchSnapshot = buildResearchSnapshot(interview, {
          consent: researchConsent,
          consentedAt: new Date().toISOString(),
        });
      }
      await onComplete(interview);
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  };

  const skip = () => {
    if (isBusy) return;
    setError("");
    setShowHelp(false);
    if (stepIndex < totalSteps - 1) {
      setStepIndex((current) => current + 1);
    }
  };

  const previous = () => {
    if (isBusy) return;
    setError("");
    setShowHelp(false);
    if (stepIndex === 0) onBack();
    else setStepIndex((current) => current - 1);
  };

  const question = prompts[step];
  const canSkip =
    stepIndex > 0 &&
    stepIndex < totalSteps - 1 &&
    step !== "consent";

  return (
    <div className="onboarding-focus interview-focus flex min-h-0 flex-1 flex-col bg-cream">
      <header className="shrink-0 px-6 pb-3 pt-5">
        <div className="grid grid-cols-[44px_1fr_60px] items-center gap-2">
          <button
            type="button"
            onClick={previous}
            disabled={isBusy}
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
            aria-label={
              stepIndex === 0 ? "Back to welcome" : "Previous question"
            }
          >
            <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
          </button>
          <p className="text-center text-base font-bold text-ink-soft">
            {stepIndex + 1} of {totalSteps}
          </p>
          {canSkip ? (
            <button
              type="button"
              onClick={skip}
              disabled={isBusy}
              className="min-h-11 text-base font-bold text-ink-soft underline decoration-transparent underline-offset-4 hover:decoration-current"
            >
              Skip
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
        <div
          className="mt-3 h-3 overflow-hidden rounded-full bg-ink/10"
          role="progressbar"
          aria-label="Personal plan progress"
          aria-valuemin="1"
          aria-valuemax={totalSteps}
          aria-valuenow={stepIndex + 1}
        >
          <div
            className="h-full rounded-full bg-clay transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main
        ref={contentRef}
        className="min-h-0 flex-1 overflow-y-auto px-7 pb-5"
      >
        <div className="flex items-start justify-between gap-3 pt-2">
          <div>
            <h1 className="page-title">
              {step === 1
                ? "Let’s make Everwise fit you"
                : step === "consent"
                  ? "Your choice about research"
                : step === 12
                  ? existingAccountEmail
                    ? "Finish your personal profile"
                    : "Save your personal plan"
                  : question.split("?")[0] + (question.includes("?") ? "?" : "")}
            </h1>
            {step === 1 ? (
              <p className="mt-3 text-lg leading-relaxed text-ink-soft">
                A few simple questions will help us prepare your starting plan.
                This takes about two minutes.
              </p>
            ) : null}
            {step === 12 ? (
              <p className="mt-3 text-lg leading-relaxed text-ink-soft">
                {existingAccountEmail
                  ? "Your secure account and sponsored access are already active. Finish these answers to rebuild your personal plan."
                  : "Create a secure account so your answers and lesson progress stay available."}
              </p>
            ) : null}
          </div>
        </div>

        {step !== 12 ? (
          <div className="mt-4">
            <ReadAloud text={question} label="Read this question" />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-7 space-y-6 animate-fade-up">
            <Field
              id="profile-name"
              label="What should we call you?"
              value={name}
              onChange={setName}
              autoComplete="name"
              placeholder="Jane"
            />
            <Field
              id="profile-age"
              label="Your age"
                type="number"
                value={age}
                onChange={(value) => {
                  if (value === "" || /^\d+$/.test(value)) setAge(value);
                }}
                autoComplete="age"
                placeholder="68"
                min="0"
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="animate-fade-up">
            <fieldset className="mt-6">
              <legend className="text-xl font-bold text-ink">
                How often do you use the internet?
              </legend>
              <Choices
                values={options.internetUse}
                selected={internetUse}
                onSelect={setInternetUse}
                label="How often do you use the internet?"
              />
            </fieldset>
            <fieldset className="mt-7">
              <legend className="text-xl font-bold text-ink">
                Which device do you use most?
              </legend>
              <Choices
                values={options.primaryDevice}
                selected={primaryDevice}
                onSelect={setPrimaryDevice}
                label="Which device do you use most?"
              />
            </fieldset>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="animate-fade-up">
            <Choices
              values={options.confidence}
              selected={confidence}
              onSelect={setConfidence}
              label="How confident do you feel online?"
            />
            <fieldset className="mt-7">
              <legend className="text-xl font-bold text-ink">
                Have you ever lost money or information to a scam?
              </legend>
              <Choices
                values={options.scamFrequency}
                selected={scamFrequency}
                onSelect={setScamFrequency}
                label="Have you ever lost money or information to a scam?"
              />
            </fieldset>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="animate-fade-up">
            <p className="mt-2 text-lg text-ink-soft">
              Choose all that apply.
            </p>
            <Choices
              values={options.concerns}
              selected={concerns}
              multi
              onSelect={(value) => toggle(value, concerns, setConcerns)}
            />
          </div>
        ) : null}

        {step === 5 ? (
          <div className="animate-fade-up">
            <blockquote className="mt-5 rounded-2xl bg-cream-card px-5 py-4 text-xl font-semibold leading-relaxed text-ink shadow-card">
              “Your bank card is locked. Open this link immediately.”
            </blockquote>
            <Choices
              values={options.scamScenario}
              selected={scamScenario}
              onSelect={setScamScenario}
              label="What would you do about the urgent bank message?"
            />
            {scamScenario ? (
              <HelpfulNote>
                Don’t open the link. Call the bank using the number on your card
                or its official website. You made a useful safety decision by
                stopping to check.
              </HelpfulNote>
            ) : null}
          </div>
        ) : null}

        {step === 7 ? (
          <div className="animate-fade-up">
            <Choices
              values={options.aiExperience}
              selected={aiExperience}
              onSelect={setAiExperience}
              label="Have you used artificial intelligence?"
            />
          </div>
        ) : null}

        {step === 11 ? (
          <div className="animate-fade-up">
            <fieldset className="mt-2">
              <legend className="text-xl font-bold text-ink">
                Could any of these affect how you use the app?
              </legend>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">
                Optional. This is not a medical assessment. It only helps us
                improve text, audio, and controls.
              </p>
              <Choices
                values={options.accessibility}
                selected={accessibilityNeeds}
                multi
                onSelect={(value) =>
                  toggle(value, accessibilityNeeds, setAccessibilityNeeds)
                }
              />
            </fieldset>
            <fieldset className="mt-7">
              <legend className="text-xl font-bold text-ink">
                Would you like trusted-person help later?
              </legend>
              <Choices
                values={options.trustedContact}
                selected={trustedContact}
                onSelect={setTrustedContact}
                label="Would you like trusted-person help later?"
              />
            </fieldset>
          </div>
        ) : null}

        {step === "consent" ? (
          <div className="mt-5 animate-fade-up">
            <div className="rounded-2xl bg-cream-card px-5 py-4 text-lg leading-relaxed text-ink shadow-card">
              <p className="font-bold">Your personal plan</p>
              <p className="mt-1">
                We save your answers to create your personal plan and remember
                your accessibility preferences.
              </p>
            </div>
            <fieldset className="mt-6">
              <legend className="text-xl font-bold leading-snug text-ink">
                Optional research choice
              </legend>
              <p className="mt-3 text-lg leading-relaxed text-ink-soft">
                Your answers are not sold. If you say yes, EverWise keeps a
                minimized, pseudonymized copy under an internal account link.
                That link is used only to delete your research data and combine
                it into group totals. {partner.name} receives group totals only,
                never your individual answers. Saying no does not affect your
                free access.
              </p>
              <Choices
                values={[
                  {
                    value: true,
                    label: "Yes, share a minimized copy to improve EverWise",
                  },
                  {
                    value: false,
                    label: "No, use my answers only for my personal plan",
                  },
                ]}
                selected={researchConsent}
                onSelect={setResearchConsent}
                label="Optional research choice"
              />
            </fieldset>
          </div>
        ) : null}

        {step === 12 ? (
          <div className="mt-7 space-y-6 animate-fade-up">
            {existingAccountEmail ? (
              <div className="rounded-2xl bg-cream-card px-5 py-5 text-lg leading-relaxed text-ink shadow-card">
                <p className="font-bold">Account ready</p>
                <p className="mt-1">
                  We will save this profile to your existing account. You do not
                  need to enter your password or claim another sponsored place.
                </p>
              </div>
            ) : (
              <>
                <Field
                  id="profile-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  onBlur={() => setEmailTouched(true)}
                  autoComplete="email"
                  placeholder="jane@example.com"
                  inputMode="email"
                  ariaInvalid={emailTouched && !isValidEmail(email)}
                  describedBy="profile-email-help"
                />
                <p
                  id="profile-email-help"
                  className={`-mt-3 text-base font-semibold ${
                    emailTouched && !isValidEmail(email)
                      ? "text-alert"
                      : "text-ink-soft"
                  }`}
                  role={emailTouched && !isValidEmail(email) ? "alert" : undefined}
                >
                  {emailTouched && !isValidEmail(email)
                    ? "Enter a complete address like name@example.com."
                    : "We’ll use this address to save your account."}
                </p>
                <Field
                  id="profile-password"
                  label="Choose a password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
                <p className="text-center text-base text-ink-soft">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onLogIn}
                    disabled={isBusy}
                    className="font-bold text-clay underline underline-offset-4"
                  >
                    Log in
                  </button>
                </p>
              </>
            )}
          </div>
        ) : null}

        {canSkip ? (
          <button
            type="button"
            onClick={() => setShowHelp((current) => !current)}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl px-2 text-lg font-bold text-clay underline decoration-transparent underline-offset-4 hover:decoration-current"
            aria-expanded={showHelp}
          >
            <HelpCircle className="h-6 w-6" aria-hidden="true" />
            I don’t understand
          </button>
        ) : null}

        {showHelp ? (
          <p
            className="mt-3 rounded-2xl bg-cream-card px-5 py-4 text-lg leading-relaxed text-ink shadow-card"
            role="status"
          >
            There is no test score and no embarrassing answer. Choose the
            closest option, or tap Skip. You can change your preferences later.
          </p>
        ) : null}

        {externalError || error ? (
          <p
            role="alert"
            className="mt-5 rounded-2xl bg-alert/12 px-5 py-4 text-lg font-semibold text-alert"
          >
            {externalError || error}
          </p>
        ) : null}
      </main>

      <footer className="shrink-0 border-t border-ink/10 bg-cream px-7 pb-6 pt-4">
        <button
          type="button"
          className="btn-primary"
          onClick={submit}
          disabled={isBusy}
        >
          {isBusy
            ? existingAccountEmail
              ? "Saving your profile…"
              : partner
                ? "Claiming your free access…"
              : "Saving your answers…"
            : stepIndex === totalSteps - 1
              ? existingAccountEmail
                ? "Finish my profile"
                : "Build my plan"
              : stepIndex === 0
                ? "Start"
                : "Continue"}
        </button>
      </footer>
    </div>
  );
}
