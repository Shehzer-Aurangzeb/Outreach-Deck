"use client";

import type { UseFormReturn } from "react-hook-form";

import { Modal } from "@/components/modal";

import { TIER_CONFIG, TIER_ORDER } from "../constants";
import type { Company, CompanyFormInput } from "../types";

interface CompanyFormModalProps {
  form: UseFormReturn<CompanyFormInput>;
  editingCompany: Company | null;
  onClose: () => void;
  onSave: (data: CompanyFormInput) => Promise<void>;
}

export function CompanyFormModal({
  form,
  editingCompany,
  onClose,
  onSave,
}: CompanyFormModalProps) {
  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-bright)" }}>
        {editingCompany ? "Edit Company" : "Add Company"}
      </h2>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <div>
          <label className="label">Company Name</label>
          <input
            {...form.register("name")}
            className="input"
            placeholder="e.g. Shopify"
            autoFocus
          />
          {form.formState.errors.name && (
            <p className="text-sm mt-1" style={{ color: "var(--color-danger)" }}>
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label className="label">Location</label>
          <input
            {...form.register("city")}
            className="input"
            placeholder="e.g. Toronto / remote"
          />
          <p className="text-xs mt-1" style={{ color: "var(--color-ghost)" }}>
            Use "/" to separate multiple locations
          </p>
        </div>
        <div>
          <label className="label">Tier</label>
          <div className="grid grid-cols-3 gap-2">
            {TIER_ORDER.map((tier) => (
              <label
                key={tier}
                className="relative flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all"
                style={{
                  backgroundColor:
                    form.watch("tier") === tier
                      ? "var(--color-accent-subtle)"
                      : "var(--color-raised)",
                  border: `2px solid ${
                    form.watch("tier") === tier ? "var(--color-accent)" : "var(--color-edge)"
                  }`,
                }}
              >
                <input
                  type="radio"
                  value={tier}
                  {...form.register("tier")}
                  className="sr-only"
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color:
                      form.watch("tier") === tier ? "var(--color-accent)" : "var(--color-text)",
                  }}
                >
                  {TIER_CONFIG[tier].label}
                </span>
                <span className="text-xs mt-0.5 text-center" style={{ color: "var(--color-ghost)" }}>
                  {tier === "MID" && "Best odds"}
                  {tier === "CONSULTANCY" && "Fast hiring"}
                  {tier === "LARGE" && "Stretch goal"}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="btn btn-primary flex-1"
          >
            {form.formState.isSubmitting ? "Saving..." : editingCompany ? "Update" : "Add Company"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
