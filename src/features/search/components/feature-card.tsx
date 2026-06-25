interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: "var(--color-base)",
        border: "1px solid var(--color-edge)",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{
          backgroundColor: "var(--color-accent-subtle)",
          color: "var(--color-accent)",
        }}
      >
        {icon}
      </div>
      <h3 className="font-semibold mb-1" style={{ color: "var(--color-bright)" }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        {description}
      </p>
    </div>
  );
}
