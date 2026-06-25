/**
 * React Query keys for profile feature
 */
export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
} as const;
