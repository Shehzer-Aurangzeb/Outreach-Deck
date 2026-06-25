interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

export function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "white",
        }}
      >
        {number}
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
        {title}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
        {description}
      </p>
    </div>
  );
}
