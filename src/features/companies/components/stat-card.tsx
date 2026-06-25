interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

export function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-2xl font-bold" style={{ color: color ?? "var(--color-bright)" }}>
        {value}
      </p>
      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
        {label}
      </p>
    </div>
  );
}
