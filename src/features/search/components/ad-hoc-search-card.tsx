"use client";

import { useState } from "react";

import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  LinkedInIcon,
  UserPlusIcon,
} from "@/components/icons";
import { useCompanies, useCreateCompany } from "@/features/companies/hooks/use-companies";
import { useToast } from "@/components/toast";

import { SEARCH_ANGLE_CONFIG } from "../constants";
import type { AdHocSearch } from "../lib/daily-search-generator";
import { QueryBox } from "./query-box";
import { SaveCompanyForm } from "./save-company-form";

interface AdHocSearchCardProps {
  search: AdHocSearch;
  onSelect: (search: AdHocSearch) => void;
}

export function AdHocSearchCard({ search, onSelect }: AdHocSearchCardProps) {
  const [copied, setCopied] = useState(false);
  const { data: companies = [] } = useCompanies();
  const createCompany = useCreateCompany();
  const { addToast } = useToast();

  const angleConfig = SEARCH_ANGLE_CONFIG[search.angle];
  const AngleIcon = angleConfig.icon;

  // Check if company already exists (case-insensitive)
  const companyExists = companies.some(
    (c) => c.name.toLowerCase().trim() === search.companyName.toLowerCase().trim()
  );

  const copyQuery = async () => {
    await navigator.clipboard.writeText(search.query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveCompany = async (data: {
    tier: "MID" | "CONSULTANCY" | "LARGE";
    city: string | null;
  }) => {
    if (companyExists) return;

    try {
      await createCompany.mutateAsync({
        name: search.companyName.trim(),
        tier: data.tier,
        city: data.city,
      });
      addToast(`Added "${search.companyName}" to your companies`, "success");
    } catch {
      addToast("Failed to save company", "error");
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col h-full group transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: "var(--color-base)",
        border: "1px solid var(--color-edge)",
      }}
    >
      {/* Header with Angle Indicator */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: angleConfig.bg }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <AngleIcon className="w-4 h-4" style={{ color: angleConfig.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: angleConfig.color }}
            >
              {angleConfig.label}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "var(--color-warning)",
              }}
            >
              Ad-hoc
            </span>
          </div>
        </div>
      </div>

      {/* Company Name */}
      <div className="px-4 pt-4 pb-2">
        <h3
          className="font-semibold text-lg truncate"
          style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
          title={search.companyName}
        >
          {search.companyName}
        </h3>
        <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
          {angleConfig.rationale}
        </p>
      </div>

      {/* Query Box */}
      <div className="px-4 py-3 flex-1">
        <QueryBox query={search.query} />
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 space-y-2">
        {/* Primary Actions Row */}
        <div className="flex gap-2">
          <button
            onClick={copyQuery}
            className="flex-1 h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: copied ? "var(--color-success)" : "var(--color-raised)",
              color: copied ? "white" : "var(--color-text)",
              border: copied ? "none" : "1px solid var(--color-edge)",
            }}
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
          <a
            href={search.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: "#0A66C2",
              color: "white",
            }}
          >
            <LinkedInIcon className="w-4 h-4" />
            <span>Open</span>
            <ExternalLinkIcon className="w-3 h-3 opacity-70" />
          </a>
        </div>

        {/* Found Someone Button */}
        <button
          onClick={() => onSelect(search)}
          className="w-full h-11 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "white",
          }}
        >
          <UserPlusIcon className="w-4 h-4" />
          <span>Found Someone</span>
        </button>

        {/* Save to Companies Section */}
        <div className="pt-2 border-t" style={{ borderColor: "var(--color-edge)" }}>
          <SaveCompanyForm
            companyName={search.companyName}
            companyExists={companyExists}
            onSave={handleSaveCompany}
            isPending={createCompany.isPending}
          />
        </div>
      </div>
    </div>
  );
}
