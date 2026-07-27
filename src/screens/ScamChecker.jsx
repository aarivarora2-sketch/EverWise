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
    <section className="mt-5">
      <h2 className="font-sans text-xl font-semibold text-ink">{title}</h2>
      <ul className="mt-2 space-y-2">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-3 text-lg leading-snug text-ink-soft"
          >
            <span
              className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-clay"
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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-4">
      <BackButton onClick={onBack} label="Back to home" />

      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-clay/10 text-clay">
          <MessageSearchIcon className="h-7 w-7" />
        </div>
        <h1 className="page-title">Is this message a scam?</h1>
      </div>
      <p className="mt-2 text-lg leading-snug text-ink-soft">
        Paste a text, email, or social media message for a careful second
        opinion.
      </p>

      {status !== "success" ? (
        <form
          className="mt-4 rounded-3xl bg-cream-card p-4 shadow-card"
          onSubmit={checkMessage}
        >
          <label htmlFor="message-to-check" className="text-lg font-bold text-ink">
            Message to check
          </label>
          <textarea
            id="message-to-check"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={6}
            autoComplete="off"
            spellCheck="true"
            placeholder="Paste the message here…"
            className="mt-2 w-full resize-none rounded-2xl border-2 border-ink/20 bg-cream px-4 py-3 text-lg leading-snug text-ink placeholder:text-ink-faint focus:border-clay"
          />
          <div className="responsive-split mt-2 flex items-start justify-between gap-3 text-sm leading-snug text-ink-faint">
            <p>Remove passwords and account numbers first.</p>
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
            className="btn-primary mt-4 py-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Checking carefully…" : "Check this message"}
          </button>
          <p className="mt-3 text-center text-sm leading-snug text-ink-faint">
            Everwise gives a careful opinion, not a guarantee.
          </p>
        </form>
      ) : (
        <div className="mt-5 animate-fade-up" aria-live="polite">
          <div className={`rounded-3xl border-2 px-5 py-5 ${details.className}`}>
            <p className="text-base font-bold uppercase tracking-[0.1em] text-ink-soft">
              {details.eyebrow}
            </p>
            <h2
              className={`mt-1 font-sans text-2xl font-bold leading-tight ${details.titleClassName}`}
            >
              {details.title}
            </h2>
            <p className="mt-3 text-lg leading-snug text-ink">
              {result.summary}
            </p>
          </div>

          {result.urgent_action ? (
            <div className="mt-4 rounded-2xl bg-ink px-5 py-4 text-cream-card">
              <p className="text-lg font-bold">Act now</p>
              <p className="mt-1 text-lg leading-snug">{result.urgent_action}</p>
            </div>
          ) : null}

          <ResultSection title="Warning signs" items={result.warning_signs} />
          <ResultSection title="What to do next" items={result.next_steps} />

          <div className="mt-5">
            <ReadAloud text={readAloudText} label="Read this result aloud" />
          </div>

          <p className="mt-5 rounded-2xl bg-cream-deep px-5 py-4 text-base leading-snug text-ink-soft">
            Never use a link, phone number, or contact detail from a suspicious
            message. Find the organization’s official website, app, card, or
            statement yourself.
          </p>

          <button type="button" className="btn-secondary mt-5" onClick={startOver}>
            Check another message
          </button>
        </div>
      )}
    </div>
  );
}
