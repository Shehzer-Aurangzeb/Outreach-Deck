"use client";

import { useQuery } from "@tanstack/react-query";

import { MOCK_COMPANIES, USE_MOCK_DATA } from "@/lib/mock-data";

import { getCompaniesForSearches } from "../actions/search-actions";

export const searchKeys = {
  all: ["searches"] as const,
  companies: () => [...searchKeys.all, "companies"] as const,
};

export function useCompaniesForSearches() {
  return useQuery({
    queryKey: searchKeys.companies(),
    queryFn: () =>
      USE_MOCK_DATA
        ? Promise.resolve(
            MOCK_COMPANIES.map((c) => ({ id: c.id, name: c.name, tier: c.tier }))
          )
        : getCompaniesForSearches(),
    staleTime: 1000 * 60 * 5,
  });
}
