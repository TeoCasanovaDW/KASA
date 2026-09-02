// Shared presentational field for LoginForm and RegisterForm. No "use
// client" directive of its own: it inherits the client boundary from
// whichever form imports it, so it must stay free of server-only imports.
// Sizing follows the mockups: 14px label, 40px input, hairline gray border.
export default function AuthField({
  id,
  name,
  label,
  type = "text",
  defaultValue,
  error,
  required,
  minLength,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-kasa-black">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className="mt-1.5 h-10 w-full rounded-lg border border-kasa-gray-light px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kasa-red"
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-kasa-red">
          {error}
        </p>
      )}
    </div>
  );
}
