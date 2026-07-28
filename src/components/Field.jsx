// Accessible form field: a large, clearly associated label above a big input.
// High contrast and generous sizing for older eyes and hands.
export default function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
  min,
  onBlur,
  ariaInvalid,
  describedBy,
  inputMode,
  error = "",
}) {
  const errorId = `${id}-error`;
  const helpIds = [describedBy, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xl font-semibold text-ink"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        min={min}
        onBlur={onBlur}
        aria-invalid={ariaInvalid || Boolean(error)}
        aria-describedby={helpIds || undefined}
        inputMode={inputMode}
        className={`mt-2 w-full rounded-2xl border-2 bg-cream-card px-5 text-xl text-ink placeholder:text-ink-faint transition-colors ${
          error
            ? "border-alert focus:border-alert"
            : "border-ink/20 focus:border-clay"
        }`}
        style={{ minHeight: "calc(62px * var(--control-scale, 1))" }}
      />
      {error ? (
        <p
          id={errorId}
          className="mt-2 text-base font-semibold leading-snug text-alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
