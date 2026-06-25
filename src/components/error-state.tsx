import { InfoIcon } from "@/components/icons";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const handleRetry = onRetry ?? (() => window.location.reload());

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card p-8 text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "var(--color-danger-subtle)" }}
        >
          <InfoIcon className="w-6 h-6" style={{ color: "var(--color-danger)" }} />
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--color-bright)" }}>
          {title}
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
          {message}
        </p>
        <button onClick={handleRetry} className="btn btn-primary">
          Retry
        </button>
      </div>
    </div>
  );
}
