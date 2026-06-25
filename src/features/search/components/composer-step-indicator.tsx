export type ComposerStep = "paste" | "review" | "draft";

interface StepIndicatorProps {
  current: ComposerStep;
}

const STEPS: { key: ComposerStep; label: string }[] = [
  { key: "paste", label: "Paste" },
  { key: "review", label: "Review" },
  { key: "draft", label: "Draft" },
];

export function ComposerStepIndicator({ current }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center">
          {i > 0 && (
            <div
              className="w-2 h-px mx-1"
              style={{
                backgroundColor: i <= currentIndex ? "var(--color-accent)" : "var(--color-ghost)",
              }}
            />
          )}
          <span
            className="text-xs"
            style={{
              color: i <= currentIndex ? "var(--color-accent)" : "var(--color-ghost)",
              fontWeight: i === currentIndex ? 600 : 400,
            }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
