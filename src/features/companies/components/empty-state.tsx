"use client";

import { BuildingIcon, SearchIcon } from "@/components/icons";

interface EmptyStateProps {
  variant: "no-companies" | "no-results";
  onSeed?: () => void;
  onAddManually?: () => void;
  onClearFilters?: () => void;
  isSeeding?: boolean;
}

export function EmptyState({
  variant,
  onSeed,
  onAddManually,
  onClearFilters,
  isSeeding,
}: EmptyStateProps) {
  if (variant === "no-companies") {
    return (
      <div className="card p-12 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "var(--color-accent-subtle)" }}
        >
          <BuildingIcon className="w-8 h-8" style={{ color: "var(--color-accent)" }} />
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-bright)" }}>
          No companies yet
        </h2>
        <p className="mb-6 max-w-md mx-auto" style={{ color: "var(--color-muted)" }}>
          Add target companies to track your outreach. We can seed a default list of Canadian tech
          companies to get you started.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onSeed} disabled={isSeeding} className="btn btn-primary">
            {isSeeding ? "Seeding..." : "Seed 50+ Canadian Tech Companies"}
          </button>
          <button onClick={onAddManually} className="btn btn-secondary">
            Add Manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-12 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: "var(--color-raised)" }}
      >
        <SearchIcon className="w-8 h-8" style={{ color: "var(--color-muted)" }} />
      </div>
      <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--color-bright)" }}>
        No companies match your filters
      </h2>
      <p className="mb-4" style={{ color: "var(--color-muted)" }}>
        Try adjusting your search or filters.
      </p>
      <button onClick={onClearFilters} className="btn btn-secondary">
        Clear All Filters
      </button>
    </div>
  );
}
