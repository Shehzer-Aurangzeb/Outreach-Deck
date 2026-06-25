import type { Angle } from "@prisma/client";

import {
  BriefcaseIcon,
  CodeIcon,
  GraduationIcon,
} from "@/components/icons";

export const SEARCH_ANGLE_CONFIG: Record<
  Angle,
  {
    color: string;
    bg: string;
    label: string;
    rationale: string;
    icon: typeof GraduationIcon;
  }
> = {
  ALUM: {
    color: "var(--color-accent)",
    bg: "var(--color-accent-subtle)",
    label: "Alumni",
    rationale: "Shared school connection — highest reply rate",
    icon: GraduationIcon,
  },
  STACK: {
    color: "var(--color-info)",
    bg: "var(--color-info-subtle)",
    label: "Tech Stack",
    rationale: "Mid-level dev on your stack — remembers the hiring process",
    icon: CodeIcon,
  },
  RECRUITER: {
    color: "var(--color-success)",
    bg: "var(--color-success-subtle)",
    label: "Recruiter",
    rationale: "Replies reliably — gives real pipeline info",
    icon: BriefcaseIcon,
  },
};

export const TIER_OPTIONS = [
  { value: "MID" as const, label: "Mid-size", description: "50-500 employees" },
  { value: "CONSULTANCY" as const, label: "Consultancy", description: "Tech consulting" },
  { value: "LARGE" as const, label: "Enterprise", description: "500+ employees" },
];
