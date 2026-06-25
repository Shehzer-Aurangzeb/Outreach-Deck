import type { Stage, Angle } from "@prisma/client";

export const STAGE_CONFIG: Record<Stage, { label: string; color: string; bg: string }> = {
  CONTACTED: { label: "Contacted", color: "var(--color-muted)", bg: "rgba(161, 161, 170, 0.1)" },
  REPLIED: { label: "Replied", color: "var(--color-info)", bg: "var(--color-info-subtle)" },
  TALKING: { label: "Talking", color: "var(--color-accent)", bg: "var(--color-accent-subtle)" },
  CLOSED: { label: "Closed", color: "var(--color-success)", bg: "var(--color-success-subtle)" },
};

export const STAGE_ORDER: Stage[] = ["CONTACTED", "REPLIED", "TALKING", "CLOSED"];

export const ANGLE_CONFIG: Record<Angle, { color: string; bg: string; label: string }> = {
  ALUM: { color: "var(--color-accent)", bg: "var(--color-accent-subtle)", label: "Alumni" },
  STACK: { color: "var(--color-info)", bg: "var(--color-info-subtle)", label: "Tech Stack" },
  RECRUITER: { color: "var(--color-success)", bg: "var(--color-success-subtle)", label: "Recruiter" },
};
