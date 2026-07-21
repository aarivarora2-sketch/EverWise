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
}) {
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
        className="mt-2 w-full rounded-2xl border-2 border-ink/20 bg-cream-card px-5 text-xl text-ink placeholder:text-ink-faint transition-colors focus:border-clay"
        style={{ minHeight: "62px" }}
      />
    </div>
  );
}
