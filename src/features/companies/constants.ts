import type { Tier } from "./types";

export const TIER_CONFIG: Record<Tier, { label: string; color: string; description: string }> = {
  MID: {
    label: "Mid-size",
    color: "var(--color-info)",
    description: "Realistic product companies, best 1–2 month odds",
  },
  CONSULTANCY: {
    label: "Consultancy",
    color: "var(--color-success)",
    description: "Fast-hiring services/consulting shops",
  },
  LARGE: {
    label: "Large",
    color: "var(--color-accent)",
    description: "Big names / stretch goals (slower, more competitive)",
  },
};

export const TIER_ORDER: Tier[] = ["MID", "CONSULTANCY", "LARGE"];

export type SortOption = "name-asc" | "name-desc" | "tier" | "city";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
  { value: "tier", label: "Tier" },
  { value: "city", label: "Location" },
];
