# System Invariants

These are behavioral properties that must **always** be true, regardless of how
the system reaches a given state. The test suite protects them. Before making
any change to business logic, check this list — if your change would violate an
invariant, either the invariant is wrong (update it and the tests) or the change
is wrong.

---

## Status Transition Invariants

**I-001:** A Resolved item can never transition to Open or In Progress.
- Once `status = RESOLVED`, the only valid PATCH operations are to `notes` and
  `resourceLink`. Any attempt to change `status` away from RESOLVED must return
  `400 Bad Request`.
- *Source: ADR-006, FR-013*

**I-002:** An item can be resolved directly from Open without passing through
In Progress.
- The `status` transition `OPEN → RESOLVED` is valid. `IN_PROGRESS` is not a
  required intermediate state.
- *Source: CK2 finding — Gherkin originally missed this; corrected before
  implementation.*

**I-003:** Resolution requires a non-empty `resolutionText`.
- `POST /api/items/:id/resolve` must reject any request where `resolutionText`
  is absent, null, or empty string with `422 Unprocessable Entity`.
- *Source: FR-013, FR-015*

---

## Data Integrity Invariants

**I-004:** An item's `createdAt` timestamp is immutable after creation.
- No Route Handler or Prisma operation may update `createdAt`. It is set once
  on `POST /api/items` and never changed.
- *Source: FR-018*

**I-005:** An item's `id` is immutable.
- Item IDs are assigned by the database and never reassigned or reused.

**I-006:** `resolutionText` is null on non-Resolved items.
- The `resolutionText` field must be `null` when `status` is `OPEN` or
  `IN_PROGRESS`. It may only be non-null when `status = RESOLVED`.
- *Source: FR-014*

---

## Computation Invariants

**I-007:** `openCount` equals the count of items with `status = OPEN` or
`status = IN_PROGRESS`.
- Items with `status = RESOLVED` are never included in `openCount`.
- *Source: FR-016, CK3 finding — this was inconsistent across four documents
  before implementation; confirmed correct definition here.*

**I-008:** Backlog sort order is: P1 before P2 before P3; within each priority
tier, oldest `createdAt` first.
- No item with a lower priority (P2, P3) appears before an item with higher
  priority (P1) in the default sort.
- *Source: FR-006*

---

## Security / Data Boundary Invariants

**I-009:** Prisma is never imported in client-side code.
- Any file with `"use client"` at the top must not import from `lib/prisma.ts`
  or `@prisma/client` directly. TypeScript module boundaries enforce this.
- *Source: NFR-007, ADR-004*

**I-010:** No network requests are made to external services at runtime.
- The app produces zero outbound HTTP requests during normal operation.
  All data lives in the local SQLite file.
- *Source: FR-019, NFR-004*

---

## How to Use This File

**When adding a feature:** Check whether any new behavior could silently violate
an invariant. If it does, the tests will catch it — but check here first to
understand why the test exists.

**When a test is failing unexpectedly:** If the failure isn't obvious from the
test name, check whether it protects one of these invariants. The invariant
description explains the business rule; the source reference explains where the
rule came from.

**When changing a business rule:** If a rule changes, update the relevant
invariant here, update the test, and update the source document (PRD or ADR).
Change all three or change none — partial updates create the exact kind of
cross-document drift that caused CK3 to escalate during the original build.
