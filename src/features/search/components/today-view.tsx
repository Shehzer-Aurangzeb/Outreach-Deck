"use client";

import { useState, useMemo, useEffect, useRef } from "react";

import { ErrorState } from "@/components/error-state";
import {
  CalendarIcon,
  ChevronDownIcon,
  FilterIcon,
  InfoIcon,
  RefreshIcon,
  SearchIcon,
  SparklesIcon,
} from "@/components/icons";
import { MOCK_DAILY_SEARCHES, USE_MOCK_DATA } from "@/lib/mock-data";
import { useProfile } from "@/features/profile/hooks/use-profile";
import type { Tier } from "@prisma/client";

import { useCompaniesForSearches } from "../hooks/use-searches";
import {
  generateDailySearches,
  type DailySearch,
  type AdHocSearch,
  type SearchProfile,
} from "../lib/daily-search-generator";
import { AdHocSearchBox } from "./ad-hoc-search-box";
import { FeatureCard } from "./feature-card";
import { ProfileComposer } from "./profile-composer";
import { SearchCard } from "./search-card";
import { StepCard } from "./step-card";

const TIER_OPTIONS: { value: Tier; label: string }[] = [
  { value: "MID", label: "Mid-size" },
  { value: "CONSULTANCY", label: "Consultancy" },
  { value: "LARGE", label: "Large" },
];

const STORAGE_KEY = "search-tier-filter";

export function TodayView() {
  const { data: companies = [], isLoading: isLoadingCompanies, error: companiesError, refetch } = useCompaniesForSearches();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const [selectedSearch, setSelectedSearch] = useState<DailySearch | null>(null);
  const [selectedAdHocSearch, setSelectedAdHocSearch] = useState<AdHocSearch | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showTierFilter, setShowTierFilter] = useState(false);
  const [selectedTiers, setSelectedTiers] = useState<Set<Tier>>(new Set(["MID", "CONSULTANCY", "LARGE"]));
  const [searchOffset, setSearchOffset] = useState(0);
  const tierFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Tier[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedTiers(new Set(parsed));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tierFilterRef.current && !tierFilterRef.current.contains(e.target as Node)) {
        setShowTierFilter(false);
      }
    };
    if (showTierFilter) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTierFilter]);

  const handleTierToggle = (tier: Tier) => {
    setSelectedTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tier)) {
        if (next.size > 1) next.delete(tier);
      } else {
        next.add(tier);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const isLoading = isLoadingCompanies || isLoadingProfile;
  const error = companiesError;

  const searchProfile: SearchProfile = useMemo(() => ({
    role: profile?.role ?? "software engineer",
    stack: profile?.stack ?? "React TypeScript",
    education: profile?.education ?? "",
  }), [profile]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => selectedTiers.has(c.tier));
  }, [companies, selectedTiers]);

  const searches = useMemo(() => {
    if (USE_MOCK_DATA) {
      return MOCK_DAILY_SEARCHES as DailySearch[];
    }
    if (filteredCompanies.length === 0) return [];
    return generateDailySearches(filteredCompanies, new Date(), searchProfile, searchOffset);
  }, [filteredCompanies, searchProfile, searchOffset]);

  const today = useMemo(() => {
    const now = new Date();
    return {
      full: now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      short: now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  }, []);

  const handleSelect = (search: DailySearch) => {
    setSelectedSearch(search);
  };

  const handleAdHocSelect = (search: AdHocSearch) => {
    setSelectedAdHocSearch(search);
  };

  const handleClose = () => {
    setSelectedSearch(null);
    setSelectedAdHocSearch(null);
  };

  const handleSuccess = () => {
    setSelectedSearch(null);
    setSelectedAdHocSearch(null);
  };

  const handleNewSearches = () => {
    setSearchOffset((prev) => prev + 1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-24 rounded-xl" style={{ backgroundColor: "var(--color-base)" }} />
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl" style={{ backgroundColor: "var(--color-base)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState title="Failed to load searches" message={error.message} onRetry={refetch} />;
  }

  // Empty state - no companies yet
  if (companies.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div
          className="rounded-2xl p-6 sm:p-8 md:p-12 mb-6 sm:mb-8 relative overflow-hidden"
          style={{
            backgroundColor: "var(--color-base)",
            border: "1px solid var(--color-edge)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: "var(--color-accent)" }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--color-accent)" }}>
                {today.full}
              </span>
            </div>
            
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3"
              style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
            >
              Ready to find connections?
            </h1>
            <p
              className="text-base sm:text-lg mb-6 sm:mb-8 max-w-xl"
              style={{ color: "var(--color-muted)" }}
            >
              Add some target companies to generate 3 targeted LinkedIn searches. Each search uses a different angle to maximize your chances.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/companies" className="btn btn-primary px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-center flex items-center justify-center gap-2">
                <SparklesIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                Add Companies
              </a>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3 mb-6 sm:mb-8">
          <FeatureCard
            icon={<SearchIcon className="w-6 h-6" />}
            title="Smart Targeting"
            description="3 different angles: Alumni, Tech Stack, and Recruiter connections"
          />
          <FeatureCard
            icon={<CalendarIcon className="w-6 h-6" />}
            title="Daily Rotation"
            description="New company selections each day to keep your outreach fresh"
          />
          <FeatureCard
            icon={<SparklesIcon className="w-6 h-6" />}
            title="AI-Powered Notes"
            description="Generate personalized connection messages with one click"
          />
        </div>

        {/* Ad-hoc Search */}
        <AdHocSearchBox profile={searchProfile} onContactFound={handleAdHocSelect} />

        {/* Profile Composer Modal */}
        {selectedAdHocSearch && (
          <ProfileComposer
            search={{
              company: { id: "", name: selectedAdHocSearch.companyName, tier: "MID" },
              angle: selectedAdHocSearch.angle,
              query: selectedAdHocSearch.query,
              linkedinUrl: selectedAdHocSearch.linkedinUrl,
            }}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    );
  }

  // Main view with searches
  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Card */}
        <div
          className="rounded-xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          style={{
            backgroundColor: "var(--color-base)",
            border: "1px solid var(--color-edge)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--color-accent)" }}>
                {today.full}
              </span>
            </div>
            <h1
              className="text-xl sm:text-2xl font-bold"
              style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
            >
              Today&apos;s Searches
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              3 targeted searches from your company list
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{
                backgroundColor: "var(--color-info-subtle)",
                color: "var(--color-info)",
              }}
            >
              <InfoIcon className="w-3.5 h-3.5" />
              <span>Refresh for different picks</span>
            </div>

            <div className="relative" ref={tierFilterRef}>
              <button
                onClick={() => setShowTierFilter(!showTierFilter)}
                className="btn btn-secondary flex items-center gap-2 whitespace-nowrap"
              >
                <FilterIcon className="w-4 h-4" />
                Tiers
                {selectedTiers.size < 3 && (
                  <span
                    className="ml-1 px-1.5 py-0.5 text-xs rounded-full"
                    style={{ backgroundColor: "var(--color-accent)", color: "var(--color-void)" }}
                  >
                    {selectedTiers.size}
                  </span>
                )}
              </button>
              {showTierFilter && (
                <div
                  className="absolute right-0 top-full mt-2 z-10 rounded-lg shadow-lg p-3 min-w-45"
                  style={{ backgroundColor: "var(--color-raised)", border: "1px solid var(--color-edge)" }}
                >
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--color-muted)" }}>
                    Include companies
                  </p>
                  {TIER_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 py-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTiers.has(option.value)}
                        onChange={() => handleTierToggle(option.value)}
                        className="rounded"
                        style={{ accentColor: "var(--color-accent)" }}
                      />
                      <span className="text-sm" style={{ color: "var(--color-text)" }}>{option.label}</span>
                    </label>
                  ))}
                  <p className="text-xs mt-2 pt-2" style={{ color: "var(--color-ghost)", borderTop: "1px solid var(--color-edge)" }}>
                    {filteredCompanies.length} of {companies.length} companies
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleNewSearches}
              className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshIcon className="w-4 h-4" />
              New Searches
            </button>
          </div>
        </div>

        {/* Search Cards */}
        {searches.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {searches.map((search, index) => (
              <SearchCard
                key={`${search.company.id}-${search.angle}-${index}`}
                search={search}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl p-8 text-center"
            style={{ backgroundColor: "var(--color-base)", border: "1px solid var(--color-edge)" }}
          >
            <FilterIcon className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--color-muted)" }} />
            <p className="font-medium" style={{ color: "var(--color-text)" }}>No companies match your filter</p>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Select more tiers to see searches
            </p>
          </div>
        )}

        {/* How It Works - Collapsible */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--color-base)",
            border: "1px solid var(--color-edge)",
          }}
        >
          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <InfoIcon className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
              <span className="font-medium" style={{ color: "var(--color-bright)" }}>
                How this works
              </span>
            </div>
            <ChevronDownIcon
              className="w-5 h-5 transition-transform"
              style={{
                color: "var(--color-muted)",
                transform: showHowItWorks ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {showHowItWorks && (
            <div
              className="px-6 pb-6 pt-2 border-t"
              style={{ borderColor: "var(--color-edge)" }}
            >
              <div className="grid gap-4 md:grid-cols-5">
                <StepCard number={1} title="Copy Query" description="Click to copy or open LinkedIn directly" />
                <StepCard number={2} title="Find Someone" description="Browse results for interesting profiles" />
                <StepCard number={3} title="Click Found" description="Select the matching search card" />
                <StepCard number={4} title="Generate Note" description="AI creates a personalized message" />
                <StepCard number={5} title="Add to Pipeline" description="Track your outreach progress" />
              </div>

              <div
                className="mt-4 p-4 rounded-lg text-sm"
                style={{
                  backgroundColor: "var(--color-raised)",
                  color: "var(--color-muted)",
                }}
              >
                <strong style={{ color: "var(--color-text)" }}>About daily searches:</strong>{" "}
                The default 3 searches are deterministic for each day — same date, same picks.
                Click &quot;New Searches&quot; to reshuffle to a different set. Reload the page to return to the default daily 3.
              </div>
            </div>
          )}
        </div>

        {/* Ad-hoc Search Section */}
        <AdHocSearchBox profile={searchProfile} onContactFound={handleAdHocSelect} />
      </div>

      {/* Profile Composer Modal */}
      {selectedSearch && (
        <ProfileComposer
          search={selectedSearch}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
      {selectedAdHocSearch && (
        <ProfileComposer
          search={{
            company: { id: "", name: selectedAdHocSearch.companyName, tier: "MID" },
            angle: selectedAdHocSearch.angle,
            query: selectedAdHocSearch.query,
            linkedinUrl: selectedAdHocSearch.linkedinUrl,
          }}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
