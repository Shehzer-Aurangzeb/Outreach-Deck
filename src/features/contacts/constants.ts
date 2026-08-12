import type { Stage, Category } from "@prisma/client";

export const STAGE_CONFIG: Record<Stage, { label: string; color: string; bg: string; hint: string }> = {
  REQUESTED: { label: "Requested", color: "var(--color-warning)", bg: "var(--color-warning-subtle)", hint: "Waiting for them to accept" },
  CONTACTED: { label: "Contacted", color: "var(--color-text)", bg: "rgba(161, 161, 170, 0.20)", hint: "Your message has reached them" },
  REPLIED: { label: "Replied", color: "var(--color-info)", bg: "var(--color-info-subtle)", hint: "They responded" },
  TALKING: { label: "Talking", color: "var(--color-accent)", bg: "var(--color-accent-subtle)", hint: "Active conversation" },
  CLOSED: { label: "Closed", color: "var(--color-success)", bg: "var(--color-success-subtle)", hint: "Conversation complete" },
};

export const STAGE_ORDER: Stage[] = ["REQUESTED", "CONTACTED", "REPLIED", "TALKING", "CLOSED"];

export const CATEGORY_CONFIG: Record<Category, { color: string; bg: string; label: string; short: string }> = {
  RECRUITER_EMBEDDED: { color: "var(--color-success)", bg: "var(--color-success-subtle)", label: "Embedded Recruiter", short: "Embedded" },
  RECRUITER_AGENCY: { color: "var(--color-success)", bg: "var(--color-success-subtle)", label: "Agency Recruiter", short: "Agency" },
  RECRUITER_VENDOR: { color: "var(--color-success)", bg: "var(--color-success-subtle)", label: "Vendor Recruiter", short: "Vendor" },
  ALUMNI: { color: "var(--color-accent)", bg: "var(--color-accent-subtle)", label: "Alumni", short: "Alum" },
  STACK_MATCH: { color: "var(--color-info)", bg: "var(--color-info-subtle)", label: "Tech Stack Match", short: "Stack" },
  HIRING_MANAGER: { color: "var(--color-warning)", bg: "var(--color-warning-subtle)", label: "Hiring Manager", short: "HM" },
  UNKNOWN: { color: "var(--color-muted)", bg: "rgba(161, 161, 170, 0.15)", label: "Unknown", short: "?" },
};
