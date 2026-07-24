"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ErrorState } from "@/components/error-state";
import { BuildingIcon, PlusIcon, UploadIcon } from "@/components/icons";

import { TIER_ORDER, type SortOption } from "../constants";
import {
  useCompanies,
  useCreateCompany,
  useDeleteCompany,
  useSeedCompanies,
  useUpdateCompany,
  useBulkImportCompanies,
} from "../hooks/use-companies";
import { companyFormSchema } from "../schema";
import type { Company, CompanyFormInput, Tier } from "../types";
import { CompaniesSkeleton } from "./companies-skeleton";
import { CompanyFormModal } from "./company-form-modal";
import { CompanyRow } from "./company-row";
import { CsvImportModal } from "./csv-import-modal";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { EmptyState } from "./empty-state";
import { FilterBar } from "./filter-bar";
import { StatsBar } from "./stats-bar";

export function CompaniesView() {
  // Data fetching
  const { data: companies = [], isLoading, error, refetch } = useCompanies();
  const seedMutation = useSeedCompanies();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();
  const bulkImportMutation = useBulkImportCompanies();

  // Filter & search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<Tier | "ALL">("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("tier");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  // Form
  const form = useForm<CompanyFormInput>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: { name: "", city: "", tier: "MID" },
  });

  // Extract unique cities for filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    companies.forEach((c) => {
      if (c.city) {
        const primary = c.city.split("/")[0]?.trim();
        if (primary && !primary.includes("remote") && !primary.includes("national")) {
          cities.add(primary);
        }
      }
    });
    return Array.from(cities).sort();
  }, [companies]);

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) || c.city?.toLowerCase().includes(query)
      );
    }

    if (selectedTier !== "ALL") {
      result = result.filter((c) => c.tier === selectedTier);
    }

    if (selectedCity !== "ALL") {
      result = result.filter((c) => c.city?.includes(selectedCity));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "tier":
          return (
            TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) ||
            a.name.localeCompare(b.name)
          );
        case "city":
          return (
            (a.city ?? "").localeCompare(b.city ?? "") || a.name.localeCompare(b.name)
          );
        default:
          return 0;
      }
    });

    return result;
  }, [companies, searchQuery, selectedTier, selectedCity, sortBy]);

  // Stats
  const stats = useMemo(
    () => ({
      total: companies.length,
      mid: companies.filter((c) => c.tier === "MID").length,
      consultancy: companies.filter((c) => c.tier === "CONSULTANCY").length,
      large: companies.filter((c) => c.tier === "LARGE").length,
      locations: uniqueCities.length,
    }),
    [companies, uniqueCities]
  );

  const openCreateModal = useCallback(() => {
    setEditingCompany(null);
    form.reset({ name: "", city: "", tier: "MID" });
    setModalOpen(true);
  }, [form]);

  const openEditModal = useCallback(
    (company: Company) => {
      setEditingCompany(company);
      form.reset({
        name: company.name,
        city: company.city ?? "",
        tier: company.tier,
      });
      setModalOpen(true);
    },
    [form]
  );

  const handleSave = async (data: CompanyFormInput) => {
    if (editingCompany) {
      await updateMutation.mutateAsync({ id: editingCompany.id, input: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTier("ALL");
    setSelectedCity("ALL");
  }, []);

  const hasActiveFilters = searchQuery || selectedTier !== "ALL" || selectedCity !== "ALL";

  // Loading state
  if (isLoading) {
    return <CompaniesSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState title="Failed to load companies" message={error.message} onRetry={refetch} />
    );
  }

  return (
    <div
      style={{ backgroundColor: "var(--color-void)", color: "var(--color-text)" }}
    >
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3"
              style={{ color: "var(--color-accent)", fontFamily: "var(--font-display)" }}
            >
              <BuildingIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              Companies
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Target companies for your job search outreach
            </p>
          </div>
          <div className="flex gap-2">
            {companies.length > 0 && (
              <button
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                className="btn btn-secondary text-xs sm:text-sm flex-1 sm:flex-none"
              >
                {seedMutation.isPending ? "Restoring..." : "Restore Defaults"}
              </button>
            )}
            <button
              onClick={() => setImportModalOpen(true)}
              className="btn btn-secondary text-sm flex-1 sm:flex-none"
            >
              <UploadIcon className="w-4 h-4 mr-1 sm:mr-1.5 inline" />
              Import CSV
            </button>
            <button onClick={openCreateModal} className="btn btn-primary text-sm flex-1 sm:flex-none">
              <PlusIcon className="w-4 h-4 mr-1 sm:mr-1.5 inline" />
              Add Company
            </button>
          </div>
        </header>

        {/* Stats Bar */}
        {companies.length > 0 && <StatsBar stats={stats} />}

        {/* Search & Filters */}
        {companies.length > 0 && (
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTier={selectedTier}
            onTierChange={setSelectedTier}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            sortBy={sortBy}
            onSortChange={setSortBy}
            uniqueCities={uniqueCities}
            onClearFilters={clearFilters}
          />
        )}

        {/* Results Count */}
        {companies.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {hasActiveFilters ? (
                <>
                  Showing{" "}
                  <strong style={{ color: "var(--color-text)" }}>
                    {filteredCompanies.length}
                  </strong>{" "}
                  of {companies.length} companies
                </>
              ) : (
                <>
                  <strong style={{ color: "var(--color-text)" }}>{companies.length}</strong>{" "}
                  companies
                </>
              )}
            </p>
          </div>
        )}

        {/* Empty State - No Companies */}
        {companies.length === 0 && (
          <EmptyState
            variant="no-companies"
            onSeed={() => seedMutation.mutate()}
            onAddManually={openCreateModal}
            isSeeding={seedMutation.isPending}
          />
        )}

        {/* Empty State - No Results */}
        {companies.length > 0 && filteredCompanies.length === 0 && (
          <EmptyState variant="no-results" onClearFilters={clearFilters} />
        )}

        {/* Company List */}
        {filteredCompanies.length > 0 && (
          <div className="space-y-2">
            {filteredCompanies.map((company) => (
              <CompanyRow
                key={company.id}
                company={company}
                onEdit={() => openEditModal(company)}
                onDelete={() => setDeleteTarget(company)}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {modalOpen && (
          <CompanyFormModal
            form={form}
            editingCompany={editingCompany}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <DeleteConfirmationModal
            company={deleteTarget}
            isDeleting={deleteMutation.isPending}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}

        {/* CSV Import Modal */}
        {importModalOpen && (
          <CsvImportModal
            onClose={() => setImportModalOpen(false)}
            onImport={bulkImportMutation.mutateAsync}
          />
        )}
      </div>
    </div>
  );
}
