"use client";

import { ChevronDownIcon, XIcon } from "@/components/icons";

import { SORT_OPTIONS, TIER_CONFIG, TIER_ORDER, type SortOption } from "../constants";
import type { Tier } from "../types";
import { FilterChip } from "./filter-chip";
import { SearchInput } from "./search-input";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTier: Tier | "ALL";
  onTierChange: (tier: Tier | "ALL") => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  uniqueCities: string[];
  onClearFilters: () => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedTier,
  onTierChange,
  selectedCity,
  onCityChange,
  sortBy,
  onSortChange,
  uniqueCities,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters = searchQuery || selectedTier !== "ALL" || selectedCity !== "ALL";

  return (
    <div className="space-y-4">
      {/* Search Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search companies..."
          debounceMs={300}
        />

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="input appearance-none pr-10 cursor-pointer"
            style={{ height: "44px", minWidth: "160px" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4"
            style={{ color: "var(--color-ghost)" }}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
          Filter:
        </span>

        {/* Tier Filters */}
        <FilterChip active={selectedTier === "ALL"} onClick={() => onTierChange("ALL")}>
          All Tiers
        </FilterChip>
        {TIER_ORDER.map((tier) => (
          <FilterChip
            key={tier}
            active={selectedTier === tier}
            onClick={() => onTierChange(tier)}
            color={TIER_CONFIG[tier].color}
          >
            {TIER_CONFIG[tier].label}
          </FilterChip>
        ))}

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ backgroundColor: "var(--color-edge)" }} />

        {/* City Filter */}
        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm cursor-pointer transition-colors"
            style={{
              backgroundColor:
                selectedCity !== "ALL" ? "var(--color-accent)" : "var(--color-base)",
              color: selectedCity !== "ALL" ? "white" : "var(--color-text)",
              border: "1px solid var(--color-edge)",
            }}
          >
            <option value="ALL">All Locations</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3"
            style={{ color: selectedCity !== "ALL" ? "white" : "var(--color-ghost)" }}
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-2 text-sm flex items-center gap-1 hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            <XIcon className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
