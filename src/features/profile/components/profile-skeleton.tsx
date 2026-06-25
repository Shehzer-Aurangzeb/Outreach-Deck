export function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded" style={{ backgroundColor: "var(--color-surface)" }} />
            <div className="h-4 w-64 rounded" style={{ backgroundColor: "var(--color-surface)" }} />
          </div>
          <div className="h-10 w-36 rounded" style={{ backgroundColor: "var(--color-surface)" }} />
        </div>
        <div className="h-80 rounded-2xl" style={{ backgroundColor: "var(--color-surface)" }} />
        <div className="h-24 rounded-2xl" style={{ backgroundColor: "var(--color-surface)" }} />
      </div>
    </div>
  );
}
