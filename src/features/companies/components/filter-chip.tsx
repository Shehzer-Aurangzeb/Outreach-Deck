interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}

export function FilterChip({ active, onClick, color, children }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
      style={{
        backgroundColor: active ? (color ?? "var(--color-accent)") : "var(--color-base)",
        color: active ? "white" : "var(--color-text)",
        border: `1px solid ${active ? "transparent" : "var(--color-edge)"}`,
      }}
    >
      {children}
    </button>
  );
}
