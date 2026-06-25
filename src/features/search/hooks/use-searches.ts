"use client";

import { useQuery } from "@tanstack/react-query";

import { getCompaniesForSearches } from "../actions/search-actions";

export const searchKeys = {
  all: ["searches"] as const,
  companies: () => [...searchKeys.all, "companies"] as const,
};

export function useCompaniesForSearches() {
  return useQuery({
    queryKey: searchKeys.companies(),
    queryFn: () => getCompaniesForSearches(),
    staleTime: 1000 * 60 * 5,
  });
}
