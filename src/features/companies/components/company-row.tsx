import { MapPinIcon } from "@/components/icons";

import type { Company, Tier } from "../types";

const TIER_CONFIG: Record<Tier, { label: string; color: string }> = {
  MID: { label: "Mid-size", color: "var(--color-info)" },
  CONSULTANCY: { label: "Consultancy", color: "var(--color-success)" },
  LARGE: { label: "Large", color: "var(--color-accent)" },
};

interface CompanyRowProps {
  company: Company;
  onEdit: () => void;
  onDelete: () => void;
}

export function CompanyRow({ company, onEdit, onDelete }: CompanyRowProps) {
  const tier = TIER_CONFIG[company.tier];

  return (
    <div
      className="card-interactive p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
      onClick={onEdit}
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Tier Badge */}
        <div
          className="w-2 h-10 sm:h-12 rounded-full flex-shrink-0"
          style={{ backgroundColor: tier.color }}
          title={tier.label}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate" style={{ color: "var(--color-bright)" }}>
            {company.name}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5">
            {company.city && (
              <span className="flex items-center gap-1 text-sm" style={{ color: "var(--color-muted)" }}>
                <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{company.city}</span>
              </span>
            )}
            <span
              className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                backgroundColor: `${tier.color}20`,
                color: tier.color,
              }}
            >
              {tier.label}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0 ml-5 sm:ml-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onEdit}
          className="btn btn-ghost text-sm px-3"
          aria-label="Edit company"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="btn btn-ghost text-sm px-3"
          style={{ color: "var(--color-danger)" }}
          aria-label="Delete company"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
