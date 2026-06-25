# Outreach Deck — Claude Instructions

Read these docs every session:
- `docs/ARCHITECTURE.md` — the single source of truth for structure and conventions
- `docs/DEVELOPMENT_PLAN.md` — the build spec and roadmap

## Rules

1. **Follow `docs/ARCHITECTURE.md` for all structure and conventions.** Do not introduce patterns it forbids.

2. **Layering is non-negotiable (§3):** Components never fetch or hit the DB. Logic lives in hooks (React Query) and server actions. Pages are thin.

3. **No over-engineering (§12):** No service layers, no DI containers, no global stores, no barrel files, no premature abstraction. If tempted, raise it instead of building it.

4. **Types flow from edges:** Prisma generates DB types; Zod schemas define input/output via `z.infer`. Don't duplicate types.

5. **Quality gates enforce the standard:** `strict` + `noUncheckedIndexedAccess` in tsconfig. Pre-commit runs typecheck + lint. Non-conforming code doesn't land.