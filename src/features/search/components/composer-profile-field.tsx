interface ProfileFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
  placeholder?: string;
}

export function ComposerProfileField({
  label,
  value,
  onChange,
  multiline = false,
  required = false,
  placeholder,
}: ProfileFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-muted)" }}>
        {label} {required && <span style={{ color: "var(--color-danger)" }}>*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg text-sm resize-none transition-colors"
          style={{
            backgroundColor: "var(--color-void)",
            color: "var(--color-text)",
            border: "1px solid var(--color-edge)",
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: "var(--color-void)",
            color: "var(--color-text)",
            border: "1px solid var(--color-edge)",
          }}
        />
      )}
    </div>
  );
}
