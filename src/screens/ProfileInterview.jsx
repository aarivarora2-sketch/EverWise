import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, HelpCircle } from "lucide-react";
import Field from "../components/Field";
import ReadAloud from "../components/ReadAloud";
import { authErrorMessage } from "../utils/authErrors";
import { isValidEmail, normalizeEmail } from "../utils/validation";

const STEP_IDS = [1, 2, 3, 4, 5, 7, 11, 12];
const TOTAL_STEPS = STEP_IDS.length;

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
  12: "Create a secure account so your personal plan and lesson progress are saved.",
};

function ChoiceButton({ selected, children, onClick, multi = false }) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
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

function Choices({ values, selected, onSelect, multi = false }) {
  return (
    <div className="mt-3 space-y-3" role={multi ? undefined : "radiogroup"}>
      {values.map((option) => {
        const value = typeof option === "string" ? option : option.value;
        const label = typeof option === "string" ? option : option.label;
        return (
          <ChoiceButton
            key={value}
            multi={multi}
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

export default function ProfileInterview({ onComplete, onBack, onLogIn }) {
  const contentRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [internetUse, setInternetUse] = useState("");
  const [primaryDevice, setPrimaryDevice] = useState("");
  const [confidence, setConfidence] = useState("");
  const [scamFrequency, setScamFrequency] = useState("");
  const [concerns, setConcerns] = useState([]);
  const [scamScenario, setScamScenario] = useState("");
  const [aiExperience, setAiExperience] = useState("");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState([]);
  const [trustedContact, setTrustedContact] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const step = STEP_IDS[stepIndex];
  const progress = useMemo(
    () => ((stepIndex + 1) / TOTAL_STEPS) * 100,
    [stepIndex],
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
    if (step === 12) {
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
    const nextError = validateStep();
    if (nextError) {
      setError(nextError);
      return;
    }
    setError("");

    if (stepIndex < TOTAL_STEPS - 1) {
      setStepIndex((current) => current + 1);
      setShowHelp(false);
      return;
    }

    setBusy(true);
    try {
      await onComplete({
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
      });
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  };

  const skip = () => {
    setError("");
    setShowHelp(false);
    if (stepIndex < TOTAL_STEPS - 1) {
      setStepIndex((current) => current + 1);
    }
  };

  const previous = () => {
    setError("");
    setShowHelp(false);
    if (stepIndex === 0) onBack();
    else setStepIndex((current) => current - 1);
  };

  const question = prompts[step];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-cream">
      <header className="shrink-0 px-6 pb-3 pt-5">
        <div className="grid grid-cols-[44px_1fr_60px] items-center gap-2">
          <button
            type="button"
            onClick={previous}
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
            aria-label={
              stepIndex === 0 ? "Back to welcome" : "Previous question"
            }
          >
            <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
          </button>
          <p className="text-center text-base font-bold text-ink-soft">
            {stepIndex + 1} of {TOTAL_STEPS}
          </p>
          {stepIndex > 0 && stepIndex < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={skip}
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
          aria-valuemax={TOTAL_STEPS}
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
                : step === 12
                  ? "Save your personal plan"
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
                Create a secure account so your answers and lesson progress stay
                available.
              </p>
            ) : null}
          </div>
        </div>

        {step < 12 ? (
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
            />
            <fieldset className="mt-7">
              <legend className="text-xl font-bold text-ink">
                Have you ever lost money or information to a scam?
              </legend>
              <Choices
                values={options.scamFrequency}
                selected={scamFrequency}
                onSelect={setScamFrequency}
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
              />
            </fieldset>
          </div>
        ) : null}

        {step === 12 ? (
          <div className="mt-7 space-y-6 animate-fade-up">
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
                className="font-bold text-clay underline underline-offset-4"
              >
                Log in
              </button>
            </p>
          </div>
        ) : null}

        {stepIndex > 0 && stepIndex < TOTAL_STEPS - 1 ? (
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

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-2xl bg-alert/12 px-5 py-4 text-lg font-semibold text-alert"
          >
            {error}
          </p>
        ) : null}
      </main>

      <footer className="shrink-0 border-t border-ink/10 bg-cream px-7 pb-6 pt-4">
        <button
          type="button"
          className="btn-primary"
          onClick={submit}
          disabled={busy}
        >
          {busy
            ? "Saving your answers…"
            : stepIndex === TOTAL_STEPS - 1
              ? "Build my plan"
              : stepIndex === 0
                ? "Start"
                : "Continue"}
        </button>
      </footer>
    </div>
  );
}
