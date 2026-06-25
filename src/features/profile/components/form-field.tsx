interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  multiline?: boolean;
}

export function FormField({ label, error, multiline, ...props }: FormFieldProps) {
  const inputStyles: React.CSSProperties = {
    backgroundColor: "var(--color-void)",
    color: "var(--color-text)",
    border: error ? "2px solid var(--color-danger)" : "1px solid var(--color-edge)",
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className="w-full px-4 py-3 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2"
          style={inputStyles}
        />
      ) : (
        <input
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={inputStyles}
        />
      )}
      {error && (
        <p className="mt-1 text-sm" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
