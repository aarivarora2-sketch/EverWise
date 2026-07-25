import { useMemo, useState } from "react";
import BackButton from "../components/BackButton";
import ReadAloud from "../components/ReadAloud";
import { MessageSearchIcon } from "../components/Icons";

const CHECK_MESSAGE_ENDPOINT =
  import.meta.env.VITE_CHECK_MESSAGE_ENDPOINT || "/api/check-message";
const MAX_MESSAGE_LENGTH = 6000;

const verdictDetails = {
  likely_scam: {
    eyebrow: "High risk",
    title: "This is likely a scam",
    className: "border-alert/35 bg-alert/10",
    titleClassName: "text-alert",
  },
  uncertain: {
    eyebrow: "Be careful",
    title: "Uncertain — verify before acting",
    className: "border-clay/35 bg-clay/10",
    titleClassName: "text-clay-dark",
  },
  likely_legitimate: {
    eyebrow: "Lower risk",
    title: "Likely legitimate — still verify sensitive requests",
    className: "border-sage/35 bg-sage/10",
    titleClassName: "text-sage-dark",
  },
};

function ResultSection({ title, items }) {
  if (!items?.length) return null;

  return (
    <section className="mt-6">
      <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>
      <ul className="mt-3 space-y-3">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-lg leading-relaxed text-ink-soft">
            <span
              className="mt-[0.7rem] h-2.5 w-2.5 shrink-0 rounded-full bg-clay"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ScamChecker({ onBack }) {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const cleanMessage = message.trim();
  const details = result ? verdictDetails[result.verdict] : null;

  const readAloudText = useMemo(() => {
    if (!result || !details) return "";
    const warningSigns = result.warning_signs?.length
      ? `Warning signs: ${result.warning_signs.join(". ")}.`
      : "";
    const nextSteps = result.next_steps?.length
      ? `What to do next: ${result.next_steps.join(". ")}.`
      : "";
    return `${details.title}. ${result.summary}. ${warningSigns} ${nextSteps}`;
  }, [details, result]);

  const checkMessage = async (event) => {
    event.preventDefault();
    if (!cleanMessage || cleanMessage.length > MAX_MESSAGE_LENGTH) return;

    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const response = await fetch(CHECK_MESSAGE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanMessage }),
      });

      if (!response.ok) {
        throw new Error("The checker is unavailable right now.");
      }

      const nextResult = await response.json();
      if (!verdictDetails[nextResult.verdict]) {
        throw new Error("The checker returned an unexpected result.");
      }

      setResult(nextResult);
      setStatus("success");
    } catch {
      setError(
        "We could not check this message right now. Do not click links, send money, or share a code until you verify it another way.",
      );
      setStatus("error");
    }
  };

  const startOver = () => {
    setMessage("");
    setResult(null);
    setError("");
    setStatus("idle");
  };

  return (
    <div className="flex flex-1 flex-col px-7 pb-10 pt-6">
      <BackButton onClick={onBack} label="Back to home" />

      <div className="mt-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-clay/10 text-clay">
        <MessageSearchIcon className="h-9 w-9" />
      </div>
      <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-ink">
        Is this message a scam?
      </h1>
      <p className="mt-3 text-xl leading-relaxed text-ink-soft">
        Paste the full text from an email, text message, or social media message.
      </p>

      {status !== "success" ? (
        <form className="mt-7" onSubmit={checkMessage}>
          <label htmlFor="message-to-check" className="text-xl font-bold text-ink">
            Message to check
          </label>
          <textarea
            id="message-to-check"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={9}
            autoComplete="off"
            spellCheck="true"
            placeholder="Paste the message here…"
            className="mt-3 w-full resize-y rounded-2xl border-2 border-ink/20 bg-cream-card px-5 py-4 text-xl leading-relaxed text-ink shadow-card placeholder:text-ink-faint focus:border-clay"
          />
          <div className="mt-2 flex items-start justify-between gap-4 text-base text-ink-faint">
            <p>Remove names, account numbers, and passwords if you can.</p>
            <p className="shrink-0">
              {message.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()}
            </p>
          </div>

          {error ? (
            <div
              className="mt-5 rounded-2xl border-2 border-alert/30 bg-alert/10 px-5 py-4 text-lg leading-relaxed text-ink"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!cleanMessage || status === "loading"}
            className="btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Checking carefully…" : "Check this message"}
          </button>
          <p className="mt-4 text-center text-base leading-relaxed text-ink-faint">
            Everwise gives a careful opinion, not a guarantee. Your message is
            checked only after you tap the button.
          </p>
        </form>
      ) : (
        <div className="mt-7 animate-fade-up" aria-live="polite">
          <div className={`rounded-3xl border-2 px-6 py-6 ${details.className}`}>
            <p className="text-base font-bold uppercase tracking-[0.1em] text-ink-soft">
              {details.eyebrow}
            </p>
            <h2 className={`mt-1 font-serif text-3xl font-bold leading-tight ${details.titleClassName}`}>
              {details.title}
            </h2>
            <p className="mt-4 text-xl leading-relaxed text-ink">
              {result.summary}
            </p>
          </div>

          {result.urgent_action ? (
            <div className="mt-5 rounded-2xl bg-ink px-5 py-5 text-cream-card">
              <p className="text-lg font-bold">Act now</p>
              <p className="mt-1 text-lg leading-relaxed">{result.urgent_action}</p>
            </div>
          ) : null}

          <ResultSection title="Warning signs" items={result.warning_signs} />
          <ResultSection title="What to do next" items={result.next_steps} />

          <div className="mt-7">
            <ReadAloud text={readAloudText} label="Read this result aloud" />
          </div>

          <p className="mt-6 rounded-2xl bg-cream-deep px-5 py-4 text-base leading-relaxed text-ink-soft">
            Never use a link, phone number, or contact detail from a suspicious
            message. Find the organization’s official website, app, card, or
            statement yourself.
          </p>

          <button type="button" className="btn-secondary mt-6" onClick={startOver}>
            Check another message
          </button>
        </div>
      )}
    </div>
  );
}
