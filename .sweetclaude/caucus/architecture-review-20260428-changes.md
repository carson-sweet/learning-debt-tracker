---
title: DS5 — Architecture Caucus Change Classification
date: 2026-04-28
step: DS5
---

# Architecture Review — Change Classification

## Will apply automatically (uncontested — 3+ of 4 personas)

**R1 — Vitest pool configuration (4/4)**
- Finding: `file::memory:?cache=shared` has undefined isolation behavior across parallel Vitest workers using the default threads pool. Race conditions will cause flaky CI.
- Change: Add `vitest.config.ts` specifying `pool: 'forks'` to enforce process-level isolation.
- Affects: `tech-spec` §8 (note), and will be implemented in `vitest.config.ts` scaffold.

**R2 — API contract error codes (4/4)**
- Finding: Architecture §6 says "rejects" for validation failures with no HTTP status code. Untestable.
- Change: Update architecture §6 to specify: `422` for validation failures (empty title, whitespace resolution, status transition violations), `400` for malformed request body, `404` for unknown item ID.
- Affects: `architecture` §6.

**R3 — .gitignore WAL sidecar files (4/4)**
- Finding: Architecture gitignores `dev.db` but SQLite WAL mode produces `dev.db-wal` and `dev.db-shm` sidecar files. These should also be gitignored.
- Change: Note in architecture §8 that `.gitignore` must include `prisma/dev.db`, `prisma/dev.db-wal`, `prisma/dev.db-shm`. Implement in `.gitignore` during scaffold.
- Affects: `architecture` §8 (note only — implementation deferred to scaffold).

**R4 — Server-side source field length enforcement (4/4)**
- Finding: US-003 specifies 500-char max for source field. Architecture §6 and contract analysis §1 document the `POST /api/items` contract but don't enforce this limit server-side.
- Change: Update architecture §6 `POST /api/items` to specify: `source` max 500 chars enforced server-side (returns 422 if exceeded).
- Affects: `architecture` §6, `contract-analysis` §1 (invariants).

**R5 — Document Server Component / Route Handler asymmetry as intentional (3/4)**
- Finding: Architecture §3.1 allows Server Components to read Prisma directly, while §3.2 says Route Handlers are "the only entry point to Prisma." This contradiction reads as an oversight.
- Change: Clarify architecture §3.1 and §3.2: Server Components may use Prisma for read-only initial page renders (they run server-side). Route Handlers are the only entry point for writes and for reads triggered by client-side interactions. Add a clarifying note to §3.4.
- Affects: `architecture` §3.1, §3.2, §3.4.

**R6 — postinstall script for prisma generate (3/4)**
- Finding: Fresh clone requires `npx prisma generate` before TypeScript can compile. Missing from tech spec setup steps, and not in package.json scripts.
- Change: Add `"postinstall": "prisma generate"` to package.json scripts in tech spec §4. Update first-time setup steps in tech spec §2 (npm install now triggers generate automatically).
- Affects: `tech-spec` §2, §4.

**R7 — Troubleshooting section (3/4)**
- Finding: No troubleshooting guidance. Three common failures will hit every developer on first run: locked database, missing table, stale Prisma types.
- Change: Add troubleshooting section to tech spec §2 (or as a new §14) covering: "database is locked" → delete `dev.db-wal` and `dev.db-shm`, "table does not exist" → run `npx prisma migrate dev`, "TypeScript Prisma type errors" → run `npx prisma generate`.
- Affects: `tech-spec` (new section).

**R8 — Known accepted risks consolidated (3/4)**
- Finding: Accepted security risks (no CORS, no auth, no rate limiting, no input sanitization beyond what Prisma provides) are scattered across ADRs and tech spec rather than explicitly acknowledged as intentional choices.
- Change: Add "Known Accepted Risks" section to architecture document listing these explicitly as in-scope decisions for a local single-user tool, not oversights.
- Affects: `architecture` (new section).

---

## Requires user decision (contested — 1 of 4 personas)

**R9 — Title field maxLength (1/4 — Yuki Tanaka only)**
- Finding: No maximum length specified for the title field. Yuki recommends 300 characters.
- What the change would be: Add title `maxLength: 300` enforced server-side (POST returns 422 if exceeded). UI input would have `maxLength={300}` attribute.
- What it affects downstream: Architecture §6 (POST /api/items contract), contract analysis §1 (invariants), and Gherkin us-001-capture-title-only.feature would need a new scenario for title-too-long rejection.
- Why it's contested: The other three personas note this is a product decision absent from the PRD and stories. There's no user pain identified for long titles in a single-user local tool. The PRD FR-001 says "title field required" with no length constraint. Adding it would require test changes.
- Yuki's argument: All text inputs should have explicit length limits to prevent database column overflow and predictable UI behavior. Even if not user-facing, defining a contract boundary is good hygiene.

---

## Not applicable

- Hosting, auth, monitoring, scaling findings: none raised. The architecture is correctly scoped for a local tool.
- Compliance findings: none raised. gdpr_floor is satisfied.
