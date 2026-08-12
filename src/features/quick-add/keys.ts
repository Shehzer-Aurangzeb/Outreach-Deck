export const quickAddKeys = {
  all: ["quick-add"] as const,
  classify: (hash: string) => [...quickAddKeys.all, "classify", hash] as const,
};
