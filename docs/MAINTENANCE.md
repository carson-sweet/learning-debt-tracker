# Maintenance Guide

This guide orients any developer to this project — no prior SweetClaude knowledge required.

---

## What This Project Is

Learning Debt Tracker is a local single-user Next.js + SQLite web app. It runs on
localhost only. There is no deployment, no cloud, no auth. Run `npm run dev` and open
http://localhost:3000.

---

## Project Artifact Map

Every file here was produced by a specific pipeline step. Read these in order if you
want to understand a decision.

| File | What it is | Read when |
|---|---|---|
| `docs/learning-debt-tracker-v1-prd-draft-v1.0-20260428.md` | Product requirements — 19 FRs, 7 NFRs, success criteria | You want to know what the app is supposed to do |
| `docs/architecture-learning-debt-tracker-v1-v1.0-20260428.md` | Architecture document + 6 ADRs | You want to know why it's structured the way it is |
| `docs/tech-spec-learning-debt-tracker-v1-v1.0-20260428.md` | Tech stack choices, CI, test strategy | You want to know the tooling decisions |
| `docs/contract-analysis-learning-debt-tracker-v1-v1.0-20260428.md` | API route contracts with error codes | You want to know what each API endpoint accepts and returns |
| `docs/adr/` | Architecture Decision Records (ADR-001 through ADR-007) | You want to know why a specific decision was made |
| `docs/traceability.md` | FR → user story → Gherkin feature → test file | You want to find which test covers a requirement |
| `__tests__/INVARIANTS.md` | Behavioral invariants the tests protect | You want to know what must never change |
| `.sweetclaude/features/` | Gherkin .feature files (17 features, 130 scenarios) | You want to read the acceptance criteria in plain English |

---

## Pipeline Step Glossary

Commit messages reference pipeline step IDs from the SweetClaude John Wick pipeline.
Here is what each prefix means:

| Prefix | Phase | What happened |
|---|---|---|
| `B1–B4` | Brief | Initial project briefing and scope confirmation |
| `D1–D4` | Define | PRD drafting, review caucus, gate approval |
| `P1–P4` | Plan | User story writing, story review, Gherkin spec generation |
| `DS1–DS7` | Design | Architecture, tech spec, service contracts, design review caucus |
| `CK1–CK3` | Check-in | Cross-artifact consistency gate (caught real issues — see below) |
| `IP1–IP6` | Implement Prep | Test writing, QA caucus, test file locking |
| `IM1–IM2` | Implement | Code written to make all tests pass |
| `V1–V5` | Verify | Code review, security review, pre-merge checks |

**What the check-ins caught (real issues, not false positives):**
- **CK1:** FR-010/FR-012/FR-014 implied an item detail view not named in the PRD. Resolved without blocking.
- **CK2:** Gherkin assumed Open→Resolved requires passing through In Progress first. PRD did not require this. Fixed in Gherkin before implementation.
- **CK3 (escalated):** `openCount` was defined inconsistently across PRD, architecture, contracts, and Gherkin. Resolved: `openCount` = OPEN + IN_PROGRESS in all documents.
- **CK3-rerun:** PATCH contract missing 422 response for invalid `resourceLink` URL format. Fixed in contracts before implementation.

---

## Key Architectural Rules

**The most important rule in this codebase:**

> Prisma is never imported in client components (`"use client"` files).

All database mutations go through Route Handlers in `app/api/`. Client components call
these via `fetch()`. This is enforced by TypeScript import discipline — if you import
Prisma in a client component, the build will fail or produce a runtime error.

**The one exception (documented in ADR-007):**

Page-level Server Components (`app/page.tsx`, `app/backlog/page.tsx`,
`app/backlog/[id]/page.tsx`) may read Prisma directly for their initial SSR render.
They run exclusively on the server; Prisma never reaches the browser. Subsequent reads
and all writes go through Route Handlers.

See `docs/adr/ADR-007-server-component-prisma-reads-20260429.md` for the full rationale.

---

## Common Maintenance Tasks

### Add a new field to a debt item

1. Add the field to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add-<fieldname>`
3. Add the field to `types/index.ts`
4. Update the relevant Route Handler in `app/api/items/[id]/route.ts` to accept and return the field
5. Update the relevant component(s) in `components/`
6. Write a failing test in `__tests__/api/items.test.ts` for the new field behavior
7. Run `npm test` — verify RED
8. Implement — run `npm test` — verify GREEN
9. Update `docs/traceability.md` if the field maps to an existing FR, or add a new FR to the PRD if it's new scope

### Change a business rule (e.g., resolution validation)

1. Identify which FR the rule belongs to — check `docs/traceability.md`
2. Read the relevant Gherkin feature in `.sweetclaude/features/`
3. Update the Route Handler that enforces the rule (resolution rules live in `app/api/items/[id]/resolve/route.ts`)
4. Update or add tests in `__tests__/api/items.test.ts`
5. Update the Gherkin `.feature` file to reflect the new behavior
6. Update `__tests__/INVARIANTS.md` if the change affects a system invariant
7. Run `npm test` — verify all pass

### Debug a reported bug

1. Identify which FR the bug relates to — check `docs/traceability.md`
2. Find the Gherkin scenario(s) for that FR
3. Find the test file(s) for those scenarios
4. Run the failing test in isolation: `npm test -- --reporter=verbose <test-file>`
5. Trace from the test to the Route Handler to the Prisma query

### Add a new page or route

1. Add the page under `app/` as a Server Component
2. If it needs data: read from Prisma directly in the Server Component for initial SSR render (see ADR-007)
3. Add a Route Handler in `app/api/` for any client-side interactions
4. Add the route to the architecture doc's component table
5. Add tests in `__tests__/api/` for the Route Handler

---

## Running the Project

```bash
npm run dev        # Start dev server on localhost:3000
npm run build      # Production build
npm test           # Run full test suite (Vitest)
npm test -- --reporter=verbose  # Verbose test output
npx prisma studio  # Browse the database in a GUI
npx prisma migrate dev --name <name>  # Apply a new migration
```

---

## Test Suite Overview

178 tests across 7 files. All were written before implementation (TDD Level 3).

| File | What it tests |
|---|---|
| `__tests__/api/items.test.ts` | All item CRUD and status transition Route Handlers |
| `__tests__/api/dashboard.test.ts` | Dashboard metrics aggregation |
| `__tests__/components/CaptureForm.test.tsx` | Capture form UI and submission |
| `__tests__/components/BacklogList.test.tsx` | Backlog display, sorting, filtering |
| `__tests__/components/ItemDetail.test.tsx` | Item detail view, edit, resolve |
| `__tests__/components/Dashboard.test.tsx` | Dashboard component rendering |
| `__tests__/e2e/offline.test.ts` | Confirms no network requests are made at runtime |

Read `__tests__/INVARIANTS.md` before making changes — it lists what must never break.
