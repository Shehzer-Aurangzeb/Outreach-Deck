interface CharCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharCounter({ current, max, className = "" }: CharCounterProps) {
  const percentage = (current / max) * 100;
  const isOver = current > max;
  const isWarning = percentage >= 80 && !isOver;

  return (
    <span
      className={`font-mono text-sm tabular-nums ${className}`}
      style={{
        color: isOver
          ? "var(--color-danger)"
          : isWarning
            ? "var(--color-warning)"
            : "var(--color-success)",
      }}
    >
      {current}/{max}
    </span>
  );
}
