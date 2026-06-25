"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { generateAdHocSearches, type AdHocSearch, type SearchProfile } from "../lib/daily-search-generator";
import { adHocSearchSchema, type AdHocSearchInput } from "../schema";
import { AdHocSearchCard } from "./ad-hoc-search-card";

function SearchIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function SparklesIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}

function XIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowRightIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

interface AdHocSearchBoxProps {
  profile: SearchProfile;
  onContactFound?: (search: AdHocSearch) => void;
}

export function AdHocSearchBox({ profile, onContactFound }: AdHocSearchBoxProps) {
  const [searches, setSearches] = useState<AdHocSearch[]>([]);
  const [searchedName, setSearchedName] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdHocSearchInput>({
    resolver: zodResolver(adHocSearchSchema),
  });

  const onSubmit = (data: AdHocSearchInput) => {
    const results = generateAdHocSearches(data.companyName, profile);
    setSearches(results);
    setSearchedName(data.companyName);
  };

  const handleClear = () => {
    setSearches([]);
    setSearchedName("");
    reset();
  };

  const handleSelect = (search: AdHocSearch) => {
    onContactFound?.(search);
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-base)",
          border: "1px solid var(--color-edge)",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{
            backgroundColor: "var(--color-raised)",
            borderBottom: "1px solid var(--color-edge)",
          }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--color-warning-subtle)" }}
          >
            <SparklesIcon className="w-5 h-5" style={{ color: "var(--color-warning)" }} />
          </div>
          <div>
            <h2
              className="font-semibold"
              style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
            >
              Quick Company Search
            </h2>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              Search any company — not just your saved list
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="p-5">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon 
                className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-ghost)" }}
              />
              <input
                {...register("companyName")}
                placeholder="Enter company name (e.g. Shopify, Stripe, Notion)..."
                className="w-full h-12 pl-12 pr-4 rounded-xl text-sm transition-all"
                style={{
                  backgroundColor: "var(--color-void)",
                  color: "var(--color-text)",
                  border: errors.companyName 
                    ? "2px solid var(--color-danger)" 
                    : "1px solid var(--color-edge)",
                }}
                autoComplete="off"
              />
              {errors.companyName && (
                <p
                  className="absolute text-xs mt-1 left-0"
                  style={{ color: "var(--color-danger)" }}
                >
                  {errors.companyName.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="h-12 px-6 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "white",
              }}
            >
              <span>Generate</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {["Alumni connections", "Tech stack matches", "Recruiter outreach"].map((feature) => (
              <span
                key={feature}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: "var(--color-void)",
                  color: "var(--color-muted)",
                  border: "1px solid var(--color-edge)",
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {searches.length > 0 && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3
                className="font-semibold"
                style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
              >
                Results for &quot;{searchedName}&quot;
              </h3>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: "var(--color-accent-subtle)",
                  color: "var(--color-accent)",
                }}
              >
                3 search angles
              </span>
            </div>
            <button
              onClick={handleClear}
              className="h-9 px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2 hover:bg-[var(--color-raised)]"
              style={{
                backgroundColor: "transparent",
                color: "var(--color-muted)",
                border: "1px solid var(--color-edge)",
              }}
            >
              <XIcon className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>

          {/* Results Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {searches.map((search) => (
              <AdHocSearchCard
                key={search.angle}
                search={search}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
