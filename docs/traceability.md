# Requirements Traceability

Maps every Functional Requirement to: the user story that owns it, the Gherkin
feature file that specifies it, and the test file(s) that verify it.

**How to use:** When a bug is reported or a requirement changes, look up the FR here
to find every artifact that will need updating.

---

## Traceability Table

| FR | Description (short) | User Story | Gherkin Feature | Test File(s) |
|---|---|---|---|---|
| FR-001 | Create item — title only required | US-001 | `us-001-capture-title-only.feature` | `api/items.test.ts`, `components/CaptureForm.test.tsx` |
| FR-002 | Optional priority at capture; default P2 | US-002 | `us-002-set-priority-at-capture.feature` | `api/items.test.ts`, `components/CaptureForm.test.tsx` |
| FR-003 | Optional source/context note at capture | US-003 | `us-003-add-source-context-at-capture.feature` | `api/items.test.ts`, `components/CaptureForm.test.tsx` |
| FR-004 | Capture in ≤3 user interactions | US-004 | `us-004-keyboard-first-capture.feature` | `components/CaptureForm.test.tsx` |
| FR-005 | Visible confirmation after save | US-005 | `us-005-capture-confirmation.feature` | `components/CaptureForm.test.tsx` |
| FR-006 | Backlog sorted: priority then age | US-006 | `us-006-backlog-sorted-by-priority-and-age.feature` | `api/items.test.ts`, `components/BacklogList.test.tsx` |
| FR-007 | Filter backlog by status | US-007 | `us-007-filter-backlog-by-status.feature` | `api/items.test.ts`, `components/BacklogList.test.tsx` |
| FR-008 | Display title, priority, status, age, source per item | US-008 | `us-008-see-item-details-in-backlog.feature` | `components/BacklogList.test.tsx` |
| FR-009 | Change item priority | US-009 | `us-009-change-item-priority.feature` | `api/items.test.ts`, `components/ItemDetail.test.tsx` |
| FR-010 | Add / edit notes field | US-010 | `us-010-add-edit-notes.feature` | `api/items.test.ts`, `components/ItemDetail.test.tsx` |
| FR-011 | Mark item In Progress; visually distinct | US-011 | `us-011-mark-in-progress.feature` | `api/items.test.ts`, `components/ItemDetail.test.tsx` |
| FR-012 | Add resource link to In Progress item | US-012 | `us-012-add-resource-link.feature` | `api/items.test.ts`, `components/ItemDetail.test.tsx` |
| FR-013 | Require non-empty explanation to resolve | US-013, US-015 | `us-013-write-self-explanation-to-resolve.feature`, `us-015-cannot-resolve-without-explanation.feature` | `api/items.test.ts`, `components/ItemDetail.test.tsx` |
| FR-014 | Store and display resolution after close | US-014 | `us-014-view-resolution-after-closing.feature` | `api/items.test.ts`, `components/ItemDetail.test.tsx` |
| FR-015 | No AI integration — free-text only | US-013, US-015 | `us-015-cannot-resolve-without-explanation.feature` | `api/items.test.ts` |
| FR-016 | Dashboard: open count, weekly/monthly resolved, oldest open | US-016 | `us-016-dashboard-summary.feature` | `api/dashboard.test.ts`, `components/Dashboard.test.tsx` |
| FR-017 | Persist all data to local SQLite via Prisma | — | (infrastructure; covered by all API tests) | `api/items.test.ts`, `api/dashboard.test.ts` |
| FR-018 | Data survives browser refresh and app restart | — | (infrastructure; covered by API tests using real DB) | `api/items.test.ts` |
| FR-019 | No network requests to external services at runtime | — | `us-nfr-001-fully-local-no-network.feature` | `e2e/offline.test.ts` |

All Gherkin feature file paths are relative to `.sweetclaude/features/`.
All test file paths are relative to `__tests__/`.

---

## NFR Traceability

| NFR | Description | Test Coverage |
|---|---|---|
| NFR-001 | Capture under 10 seconds on localhost | `components/CaptureForm.test.tsx` (interaction count) |
| NFR-002 | Initial page load under 2 seconds (up to 500 items) | Not explicitly tested — manual verification |
| NFR-003 | No data loss on restart | `api/items.test.ts` (persistent DB fixture) |
| NFR-004 | Data minimization — no telemetry | `e2e/offline.test.ts` |
| NFR-005 | Keyboard-navigable capture | `components/CaptureForm.test.tsx` |
| NFR-006 | Next.js App Router + TypeScript + Prisma only | Enforced by `package.json` and build |
| NFR-007 | SQLite not exposed to web process | Enforced by architecture (Prisma server-side only) |

---

## Update Policy

Update this file whenever:
- A new FR is added to the PRD
- A new Gherkin feature file is created
- A new test file is added
- An existing FR's test coverage changes
