"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { MOCK_COMPANIES, USE_MOCK_DATA } from "@/lib/mock-data";

import {
  createCompany,
  deleteCompany,
  getCompanies,
  updateCompany,
} from "../actions/company-actions";
import { seedCompanies } from "../actions/seed-companies";
import { companyKeys } from "../keys";
import type { CreateCompanyInput, UpdateCompanyInput } from "../types";

export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.list(),
    queryFn: () => (USE_MOCK_DATA ? Promise.resolve(MOCK_COMPANIES) : getCompanies()),
    staleTime: 1000 * 60,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCompanyInput) => {
      if (USE_MOCK_DATA) return; // No-op in mock mode
      return createCompany(input);
    },
    onSuccess: () => {
      if (!USE_MOCK_DATA) {
        void queryClient.invalidateQueries({ queryKey: companyKeys.all });
      }
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateCompanyInput }) => {
      if (USE_MOCK_DATA) return; // No-op in mock mode
      return updateCompany(id, input);
    },
    onSuccess: () => {
      if (!USE_MOCK_DATA) {
        void queryClient.invalidateQueries({ queryKey: companyKeys.all });
      }
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK_DATA) return; // No-op in mock mode
      return deleteCompany(id);
    },
    onSuccess: () => {
      if (!USE_MOCK_DATA) {
        void queryClient.invalidateQueries({ queryKey: companyKeys.all });
      }
    },
  });
}

export function useSeedCompanies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (USE_MOCK_DATA) return; // No-op in mock mode
      return seedCompanies();
    },
    onSuccess: () => {
      if (!USE_MOCK_DATA) {
        void queryClient.invalidateQueries({ queryKey: companyKeys.all });
      }
    },
  });
}
