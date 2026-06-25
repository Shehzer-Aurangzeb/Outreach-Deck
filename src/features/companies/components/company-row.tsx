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
      className="card-interactive p-4 flex items-center gap-4"
      onClick={onEdit}
    >
      {/* Tier Badge */}
      <div
        className="w-2 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: tier.color }}
        title={tier.label}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" style={{ color: "var(--color-bright)" }}>
          {company.name}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          {company.city && (
            <span className="flex items-center gap-1 text-sm" style={{ color: "var(--color-muted)" }}>
              <MapPinIcon className="w-3.5 h-3.5" />
              <span className="truncate max-w-[200px]">{company.city}</span>
            </span>
          )}
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${tier.color}20`,
              color: tier.color,
            }}
          >
            {tier.label}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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
