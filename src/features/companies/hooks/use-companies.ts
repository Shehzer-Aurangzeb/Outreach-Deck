"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    queryFn: () => getCompanies(),
    staleTime: 1000 * 60,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCompanyInput) => createCompany(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCompanyInput }) =>
      updateCompany(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useSeedCompanies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => seedCompanies(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}
