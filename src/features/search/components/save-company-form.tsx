"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { CheckCircleIcon, CheckIcon, MapPinIcon, PlusIcon, XIcon } from "@/components/icons";

import { TIER_OPTIONS } from "../constants";

const saveCompanySchema = z.object({
  tier: z.enum(["MID", "CONSULTANCY", "LARGE"]),
  city: z.string().optional(),
});

type SaveCompanyInput = z.infer<typeof saveCompanySchema>;

interface SaveCompanyFormProps {
  companyName: string;
  companyExists: boolean;
  onSave: (data: { tier: "MID" | "CONSULTANCY" | "LARGE"; city: string | null }) => Promise<void>;
  isPending: boolean;
}

export function SaveCompanyForm({
  companyName,
  companyExists,
  onSave,
  isPending,
}: SaveCompanyFormProps) {
  const [showForm, setShowForm] = useState(false);

  const form = useForm<SaveCompanyInput>({
    resolver: zodResolver(saveCompanySchema),
    defaultValues: {
      tier: "MID",
      city: "",
    },
  });

  const handleSave = async (data: SaveCompanyInput) => {
    await onSave({
      tier: data.tier,
      city: data.city?.trim() || null,
    });
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        disabled={companyExists}
        className="w-full h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-raised)]"
        style={{
          backgroundColor: "transparent",
          color: companyExists ? "var(--color-muted)" : "var(--color-text)",
          border: "1px dashed var(--color-edge)",
        }}
      >
        {companyExists ? (
          <>
            <CheckCircleIcon className="w-4 h-4" style={{ color: "var(--color-success)" }} />
            <span>Already saved</span>
          </>
        ) : (
          <>
            <PlusIcon className="w-4 h-4" />
            <span>Save to my companies</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {/* Tier Selection */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-muted)" }}>
          Company Tier
        </label>
        <div className="flex gap-2">
          {TIER_OPTIONS.map((tier) => (
            <button
              key={tier.value}
              type="button"
              onClick={() => form.setValue("tier", tier.value)}
              className="flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor:
                  form.watch("tier") === tier.value ? "var(--color-accent)" : "var(--color-void)",
                color: form.watch("tier") === tier.value ? "white" : "var(--color-text)",
                border:
                  form.watch("tier") === tier.value
                    ? "1px solid var(--color-accent)"
                    : "1px solid var(--color-edge)",
              }}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* City Input */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--color-muted)" }}>
          City (optional)
        </label>
        <div className="relative">
          <MapPinIcon
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-ghost)" }}
          />
          <input
            {...form.register("city")}
            placeholder="e.g. Montreal"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: "var(--color-void)",
              color: "var(--color-text)",
              border: "1px solid var(--color-edge)",
            }}
          />
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="flex-1 h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{
            backgroundColor: "var(--color-raised)",
            color: "var(--color-text)",
            border: "1px solid var(--color-edge)",
          }}
        >
          <XIcon className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <button
          type="button"
          onClick={form.handleSubmit(handleSave)}
          disabled={isPending}
          className="flex-1 h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-success)",
            color: "white",
          }}
        >
          {isPending ? (
            <span>Saving...</span>
          ) : (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>Save</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
