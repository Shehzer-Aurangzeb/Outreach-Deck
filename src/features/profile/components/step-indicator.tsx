type SetupStep = "upload" | "review" | "complete";

interface StepIndicatorProps {
  currentStep: SetupStep;
}

const STEPS: { key: SetupStep; label: string }[] = [
  { key: "upload", label: "Import CV" },
  { key: "review", label: "Review" },
  { key: "complete", label: "Done" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-4 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
            style={{
              backgroundColor:
                currentStep === step.key
                  ? "var(--color-accent)"
                  : i < currentIndex
                    ? "var(--color-success)"
                    : "var(--color-surface)",
              color:
                currentStep === step.key || i < currentIndex
                  ? "white"
                  : "var(--color-muted)",
            }}
          >
            {i + 1}
          </div>
          <span
            className="text-sm"
            style={{
              color: currentStep === step.key ? "var(--color-bright)" : "var(--color-muted)",
            }}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className="w-8 h-px ml-2"
              style={{ backgroundColor: "var(--color-edge)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
