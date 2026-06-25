interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function ProfileField({ icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <span style={{ color: "var(--color-muted)" }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-muted)" }}>
          {label}
        </p>
        <p className="text-sm" style={{ color: "var(--color-text)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}
