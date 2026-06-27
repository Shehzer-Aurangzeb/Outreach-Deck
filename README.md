# Outreach Deck

**A focused tool for the part of the job search that actually moves the needle: networking.**

Most job-search tools optimize the wrong thing. They automate applications — firing your résumé into the same saturated pipelines everyone else uses, where a single posting draws hundreds of applicants and your odds round to zero. Outreach Deck is built on a different premise: in a tight market, **referrals and conversations get you hired, not application volume.** The leverage is in reaching the right people, asking good questions, and building a real network — and that's the work this tool removes the friction from.

> A live demo isn't linked publicly — the app runs on a personal Anthropic API budget, so it's kept private. The walkthrough below shows the full experience.

---

## The idea

The hardest part of finding a job — especially in a competitive market — isn't applying. It's not knowing anyone. The fix is unglamorous: find people at companies you'd want to work for, reach out, and ask how *they* got in and what they'd focus on. That builds referrals, surfaces unposted roles, and teaches you what each company actually screens for.

But doing it consistently is a grind: searching LinkedIn, filtering, writing a tailored note for each person, tracking who you've contacted, remembering to follow up, and figuring out what to say when someone replies. Outreach Deck turns that grind into a short daily loop.

---

## How it works

Outreach Deck turns job-search networking into a short daily loop — find the right people, reach out well, and track every conversation in one place.

### 1. Start your day with outreach targets

Each day the app generates LinkedIn search queries from your target companies, each using a different angle — a shared school, a developer on your stack, or a recruiter — because different angles open different doors.

![Today view with daily searches](PASTE_SUPABASE_URL_01_TODAY)

### 2. Found someone? Paste their profile

Click a search, find someone worth reaching out to, and paste their LinkedIn profile. The app extracts the relevant details — no manual entry.

<table>
  <tr>
    <td width="50%"><img src="PASTE_SUPABASE_URL_02_PASTE_PROFILE" width="100%"/><br/><sub><b>Paste their profile</b></sub></td>
    <td width="50%"><img src="PASTE_SUPABASE_URL_03_EXTRACTED_INFO" width="100%"/><br/><sub><b>Details extracted automatically</b></sub></td>
  </tr>
</table>

### 3. Get an AI-drafted message

The app drafts a concise, personalized connection note — tuned to ask how they got in and what to focus on, not a generic "refer me." You review, edit, and send.

![Generated connection message](PASTE_SUPABASE_URL_04_GENERATED_MESSAGE)

### 4. Track every contact through the pipeline

Each person moves through a Kanban board: **Requested -> Contacted -> Replied -> In conversation -> Closed.** Nothing falls through the cracks.

![Pipeline board](PASTE_SUPABASE_URL_05_PIPELINE)

### 5. Keep the whole conversation in one place

Open any contact to see the full thread. When they reply, the app drafts your next message using the entire conversation as context — so you never lose the thread or stall on what to say.

![Contact conversation thread](PASTE_SUPABASE_URL_06_CONTACT_THREAD)

### Behind the loop

Manage your target companies and your profile — both drive the searches and the personalized messaging. Your profile is built once from your CV, then every search and message is personalized to you.

<table>
  <tr>
    <td width="50%"><img src="PASTE_SUPABASE_URL_07_COMPANIES" width="100%"/><br/><sub><b>Target companies</b></sub></td>
    <td width="50%"><img src="PASTE_SUPABASE_URL_08_PROFILE" width="100%"/><br/><sub><b>Your profile, built from your CV</b></sub></td>
  </tr>
</table>

---

## Design decisions

The flow is deliberately **human-in-the-loop**. The app does the tedious, automatable work — generating searches, drafting messages, tracking state — while the person stays in control of the parts that should never be automated: who to contact, what to send, and when. There's no scraping and no auto-messaging; you run the searches and hit send yourself, which keeps your LinkedIn account safe and your outreach genuine.

A few choices worth calling out:

- **Deterministic search generation** — the daily targets are seeded by the date, so the same day always produces the same set (with a one-tap reshuffle for more). No wasted storage on something cheap to regenerate.
- **Two message modes** — a connection note is kept under LinkedIn's 200-character limit; once a contact accepts, the first direct message is drafted as a fuller note, since the character limit no longer applies.
- **Server-side AI** — the Anthropic key never touches the browser. Conversation context is rebuilt from the stored message thread on each call rather than held in any session, which keeps it stateless and cheap.
- **Profile-driven** — nothing is hardcoded to one user. Searches and messages are generated from the logged-in user's own profile, so the tool works for anyone.

---

## Architecture & engineering

This is a personal project built to a production standard — the structure and conventions are documented and enforced so the codebase stays clean as it grows.

**Stack**
- **Next.js (App Router) + TypeScript** (strict) — frontend, server actions, and route handlers
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
