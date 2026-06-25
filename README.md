# Outreach Deck

**A focused tool for the part of the job search that actually moves the needle: networking.**

Most job-search tools optimize the wrong thing. They automate applications — firing your résumé into the same saturated pipelines everyone else uses, where a single posting draws hundreds of applicants and your odds round to zero. Outreach Deck is built on a different premise: in a tight market, **referrals and conversations get you hired, not application volume.** The leverage is in reaching the right people, asking good questions, and building a real network — and that's the work this tool removes the friction from.

> A live demo isn't linked publicly — the app runs on a personal Anthropic API budget, so it's kept private. The screenshots below show the full experience.

---

## The idea

The hardest part of finding a job — especially in a competitive market — isn't applying. It's not knowing anyone. The fix is unglamorous: find people at companies you'd want to work for, reach out, and ask how *they* got in and what they'd focus on. That builds referrals, surfaces unposted roles, and teaches you what each company actually screens for.

But doing it consistently is a grind: searching LinkedIn, filtering, writing a tailored note for each person, tracking who you've contacted, remembering to follow up, and figuring out what to say when someone replies. Outreach Deck turns that grind into a short daily loop.

---

## What it does

**A daily loop, not a dashboard you dread opening.**

1. **Daily targets.** Each day the app generates three LinkedIn search queries from your list of target companies — each using a different angle (a shared-school connection, a developer on your stack, or a recruiter), because different angles open different doors.
2. **AI-drafted outreach.** You find someone, paste their profile, and the app drafts a concise connection note (kept under LinkedIn's 200-character limit) tuned to *learn how they got hired* — not a blunt "refer me," which strangers ignore.
3. **A pipeline that remembers.** Every contact moves through a Kanban board: Contacted → Replied → In conversation → Closed. Nothing falls through the cracks.
4. **Reply help that keeps context.** When someone responds, you paste their message and the app drafts your next reply using the full conversation history — so you never lose the thread or stall on what to say. It escalates naturally: light early, warmer over time, and only raises a referral once the conversation has earned it.
5. **Your profile drives everything.** Upload a CV (or paste it), review the extracted details, and every search and message is personalized to you.

---

## Screenshots

> _Replace these placeholders with real screenshots (PNG) committed under `docs/screenshots/`._

**Today — your daily three searches and the drafting composer**
![Today view](docs/screenshots/today.png)

**Pipeline — contacts moving through stages**
![Pipeline board](docs/screenshots/pipeline.png)

**Contact detail — conversation thread and AI reply drafting**
![Contact detail](docs/screenshots/contact-detail.png)

**Profile — CV upload and the editable review form**
![Profile setup](docs/screenshots/profile.png)

---

## How it works

The flow is deliberately **human-in-the-loop**. The app does the tedious, automatable work — generating searches, drafting messages, tracking state — while the person stays in control of the parts that should never be automated: who to contact, what to send, and when. There's no scraping and no auto-messaging; you run the searches and hit send yourself, which keeps your LinkedIn account safe and your outreach genuine.

The search generation is **deterministic** — seeded by the date, so the same day always produces the same three targets (with a one-tap reshuffle for more). The AI drafting runs entirely **server-side**: the Anthropic key never touches the browser, and conversation context is rebuilt from the stored message thread on each call rather than held in any session.

---

## Architecture & engineering

This is a personal project built to a production standard — the structure and conventions are documented and enforced so the codebase stays clean as it grows.

**Stack**
- **Next.js (App Router) + TypeScript** (strict) — frontend and server actions / route handlers
- **Supabase** — Postgres + auth (magic link), with Row-Level Security scoping every row to its owner
- **Prisma** — typed data layer and migrations
- **TanStack Query** — all client server-state, with optimistic updates on pipeline changes
- **React Hook Form + Zod** — every form, with schemas shared between client and server validation
- **Anthropic Claude (Haiku)** — message drafting and CV parsing, server-side only
- **Tailwind CSS** — a token-based dark design system
- **Vitest** — focused tests on the logic that would silently break

**Principles** (see [`docs/Architecture.md`](docs/Architecture.md))
- **Feature-based modular structure** — each domain (`contacts`, `companies`, `drafting`, `search`, `profile`) owns its components, hooks, actions, schema, and types. A feature is deletable as one folder.
- **Strict one-direction layering** — UI never fetches or touches the database; logic lives in hooks and server actions. Lower layers never import from higher ones.
- **Server is the source of truth** — auth, validation, and authorization happen server-side; the client is never the security boundary. RLS is the final backstop.
- **Types flow from the edges in** — Prisma generates DB types; Zod schemas define input/output types via inference. Nothing hand-written is duplicated.
- **Production discipline, not enterprise ceremony** — no dependency injection, no service layers, no global stores. As lean as a solo project should be, as disciplined as a production one.

The standard is enforced mechanically — strict TypeScript, ESLint rules banning `any` and floating promises, and pre-commit hooks — so correctness is maintained by tooling rather than manual review.

---

## Project structure

```
src/
├── app/              # routing & composition only (thin pages)
├── features/         # domain modules — the heart of the app
│   ├── contacts/     #   pipeline, contact detail, CRUD
│   ├── companies/    #   target-company management
│   ├── drafting/     #   AI connection notes & reply drafting
│   ├── search/       #   deterministic daily search generator
│   └── profile/      #   CV parsing & profile setup
├── shared/           # cross-feature UI primitives & utils
├── lib/              # infrastructure (supabase, prisma, anthropic, env)
└── providers/        # app-wide context
```

---

## Running it locally

```bash
# 1. Install
npm install

# 2. Environment — copy the example and fill in your own values
cp .env.example .env.local
#    (Supabase URL + keys, a Postgres connection string, an Anthropic API key)
#    Prisma reads .env, so also add DATABASE_URL / DIRECT_URL there.

# 3. Database
npm run db:push        # apply the Prisma schema to your Supabase Postgres

# 4. Run
npm run dev
```

Then sign in with a magic link, complete your profile, and the daily searches will generate.

**Useful scripts**
```bash
npm run dev        # local dev
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm test           # vitest
```

---

## Notes

- This is a personal tool, intentionally **not indexed** by search engines and not publicly hosted.
- There's no scraping or automated messaging — outreach is always sent manually by the user.
- A license may be added later; for now the code is here to read, not necessarily to reuse.
```