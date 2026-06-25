export function CompaniesSkeleton() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "var(--color-void)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded" style={{ backgroundColor: "var(--color-base)" }} />
          <div className="h-12 rounded" style={{ backgroundColor: "var(--color-base)" }} />
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 rounded" style={{ backgroundColor: "var(--color-base)" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
