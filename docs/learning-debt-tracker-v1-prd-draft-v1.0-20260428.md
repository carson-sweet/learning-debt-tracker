---
title: Learning Debt Tracker v1 PRD
version: 1.0
status: approved
author: Carson Sweet
assisted_by: Claude Code + SweetClaude (John Wick mode)
date: 2026-04-28
generated: autonomous
---

# Learning Debt Tracker v1 — Product Requirements Document

## 1. Executive Summary

[1] Learning Debt Tracker interrupts the escape hatch that AI tools create — the ability to get unblocked without understanding — by installing a structured closure ritual at the moment of resolution. You cannot close an item without explaining, in your own words, what you now understand. The product's value is not the capture flow or the backlog; it is the enforcement of a ritual that open-ended tools cannot enforce by design.

[2] The app runs entirely locally — no accounts, no cloud, no network. Built with Next.js and SQLite via Prisma. It is intentionally not a tutor and does not generate AI explanations, because doing so would replicate the exact behavior it exists to counteract.

---

## 2. Problem Statement

[3] In the age of AI assistants, it is trivially easy to get unblocked without actually learning. A developer asks Claude to fix a bug, gets the fix, ships it, and moves on — without understanding why the fix works. A student asks ChatGPT to explain a concept, gets a passable answer, and forgets it by the next day.

[4] The result is invisible, accumulating debt: a growing backlog of things nominally "handled" but not understood. Unlike technical debt, learning debt has no ticket system, no backlog, no visibility. It compounds silently until it manifests as a wall — a job interview, a production incident, a problem the AI can't solve because you lack the foundation to even ask the right question.

[5] **Concrete scenario:** Alex is a junior developer who uses Copilot and Claude daily. Over six months they shipped features involving JWT auth, React performance optimization, database indexing, and async JavaScript. For each, an AI tool provided the answer. Alex understood it enough to apply it. But asked to explain JWT expiry vs. revocation, or why `useCallback` does not always prevent rerenders, Alex would struggle. No record of these gaps, no system for closing them, no visibility into how many there are.

[6] A second scenario: a voracious reader encounters an unfamiliar concept mid-article. They either interrupt their reading flow to look it up (losing context) or keep reading and forget it entirely. There is no lightweight system for parking the concept and coming back to it with intention.

[6a] Existing tools do not solve this problem by design. Anki requires constructing a flashcard — wrong moment, wrong cognitive mode. Obsidian and Notion accept the item but impose no closure ceremony — the checkbox is sufficient and the learning is optional. GitHub TIL repos accept prose but have no backlog, no priority, and no closure gate. The product fills this gap not by adding features these tools lack, but by enforcing a constraint they deliberately omit.

---

## 3. Goals and Success Metrics

[7] The following criteria are binary — each evaluates as true or false after the app ships.

| # | Goal | Success Criterion |
|---|------|-------------------|
| G1 | Fast capture | A user can open the app and save a new debt item (title only) in under 10 seconds from page load |
| G2 | Visible backlog | The backlog displays all open items sorted by priority then age, filterable by status |
| G3 | Enforced resolution | A debt item cannot be marked resolved without a non-empty, user-authored written explanation |
| G4 | Progress visibility | The dashboard shows: open item count, items resolved this week, items resolved this month, oldest open item |
| G5 | Local operation | The app runs with no internet connection, no accounts, and no external service calls |
| G6 | Keyboard-first capture | A user can complete the capture flow — open, type title, submit — without using a mouse |

---

## 4. Functional Requirements

[8] Requirements numbered `FR-###`. Each requirement is testable and describes one unit of observable system behavior.

### 4.1 Capture

**FR-001:** The system shall allow a user to create a new debt item with only a title field required.

**FR-002:** The system shall allow a user to optionally set a priority (P1 / P2 / P3) when creating an item. Default priority shall be P2.

**FR-003:** The system shall allow a user to optionally add a source or context note when creating an item.

**FR-004:** The system shall complete the capture flow — from app open to item saved — in no more than 3 user interactions (e.g., focus title field → type title → press Enter).

**FR-005:** The system shall confirm successful save with visible feedback (e.g., item appears in backlog, brief confirmation state).

### 4.2 Backlog

**FR-006:** The system shall display a backlog of all debt items sorted by priority (P1 first) then by creation date (oldest first within each priority tier).

**FR-007:** The system shall allow the backlog to be filtered by status: Open, In Progress, Resolved.

**FR-008:** The system shall display for each item: title, priority, status, age (time since creation), and source/context if present.

### 4.3 Triage

**FR-009:** The system shall allow a user to change the priority of any debt item.

**FR-010:** The system shall allow a user to add or edit a notes field on any debt item.

### 4.4 Work

**FR-011:** The system shall allow a user to mark a debt item as "In Progress." In-progress items shall be visually distinct in the backlog (e.g., distinct background color or pinned to the top of their priority group).

**FR-012:** The system shall allow a user to optionally add a resource link to an In Progress item.

### 4.5 Resolution

**FR-013:** The system shall require a non-empty, user-authored written explanation before a debt item can be marked "Resolved." The resolution textarea shall use the placeholder text: "What do you understand now that you didn't when you captured this?"

**FR-014:** The system shall store the resolution explanation with the item and display it when the item is viewed after resolution.

**FR-015:** The system shall not accept AI-generated text as a resolution explanation — there is no AI integration, and the field is intentionally free-text only.

### 4.6 Dashboard

**FR-016:** The system shall display a dashboard with the following four metrics:
- Total open item count (items with status Open **or** In Progress — both represent unresolved learning debt)
- Items resolved in the last 7 days (rolling window)
- Items resolved in the last 30 days (rolling window)
- Oldest open item (title and age — the earliest created_at among items with status Open or In Progress)

### 4.7 Data Persistence

**FR-017:** The system shall persist all data to a local SQLite database via Prisma ORM.

**FR-018:** All data shall survive browser refresh and app restart without loss.

**FR-019:** The system shall make no network requests to external services at runtime.

---

## 5. Non-Functional Requirements

[9] Non-functional requirements governing performance, reliability, compliance, and maintainability.

**NFR-001 (Performance):** Capture flow completion time — from page load to item saved — shall be under 10 seconds on localhost.

**NFR-002 (Performance):** Initial page load time shall be under 2 seconds on localhost with up to 500 debt items in the database.

**NFR-003 (Reliability):** No data loss on browser refresh, app restart, or process termination (assuming clean shutdown).

**NFR-004 (Compliance — gdpr_floor — Data Minimization):** The system shall collect only the data necessary for debt tracking: title, priority, status, source, notes, resolution text, and timestamps. No telemetry, analytics, crash reporting, or data transmission to external services.

**NFR-005 (Usability):** The capture flow shall be fully keyboard-navigable — the user shall be able to open the capture UI, enter a title, and submit without using a mouse.

**NFR-006 (Maintainability):** The app shall use Next.js App Router with TypeScript and Prisma. No additional ORM, no custom data layer, no global state management library unless required by complexity.

**NFR-007 (Security):** The app shall not expose the local SQLite database file to the web process. The database file shall be read/written only via Prisma's server-side API routes.

---

## 6. Epics and User Story Summary

[10] Five epics covering the full scope of v1. Each epic maps to one primary workflow.

| Epic | Name | Description | Primary FR(s) |
|------|------|-------------|---------------|
| E1 | Capture | Instant debt item creation — title, optional fields, keyboard submit | FR-001–FR-005 |
| E2 | Backlog | View, filter, and navigate all debt items | FR-006–FR-008 |
| E3 | Triage & Work | Change priority, add notes, mark in-progress, add resource links | FR-009–FR-012 |
| E4 | Resolution | Self-written explanation required to close an item | FR-013–FR-015 |
| E5 | Dashboard | Snapshot metrics: open count, weekly/monthly resolution, oldest item | FR-016 |

---

## 7. Out of Scope

[11] The following are explicitly excluded from v1:

- AI-generated explanations or learning content of any kind
- Social features — sharing, collaboration, public profiles
- Spaced repetition scheduling (priority-ordered backlog is the mechanism for v1)
- External integrations — Notion, Jira, Obsidian, Roam Research, etc.
- Mobile native app (responsive web is acceptable; no React Native or PWA install flow)
- User accounts or authentication of any kind
- Cloud sync or remote data storage
- Multi-user support
- Instant global access — keyboard shortcut integration, browser extension, or CLI capture tool are all deferred. The app assumes it is already open in a browser tab. This is a known limitation of the browser tab form factor in v1.

---

## 8. Assumptions and Constraints

[12] **Assumptions:**
- The user runs the app locally via `npm run dev` or a production build served on localhost
- A single developer/user operates the app; no concurrent access
- Node.js 18+ and npm are available on the host machine
- SQLite is sufficient for single-user local storage at the expected data volumes

[13] **Constraints:**
- Stack is fixed: Next.js 14+ (App Router), TypeScript, SQLite via Prisma
- No deployment infrastructure — the app is never pushed to a server
- No external API keys, cloud credentials, or third-party accounts required
- **The app is expected to be open in a persistent browser tab while the user is working. The 10-second capture constraint (G1, FR-004) assumes the tab is already loaded and hydrated. The constraint does not account for switching contexts, opening a browser, or navigating to localhost.**

---

## 9. Open Questions

[14] All open questions were resolved at the D4 gate (2026-04-28):

1. **Priority default at capture:** Defaults to P2. User adjusts at triage if needed.
2. **Minimum resolution length:** Any non-empty text is sufficient to close an item.
3. **In-progress visibility in backlog:** In-progress items are visually distinct (distinct background or pinned to top of priority group) — captured in FR-011.
4. **Dashboard time windows:** Rolling — last 7 days and last 30 days — captured in FR-016.

No open questions remain.

---

## 10. Additional Development

[15] The following topics are typically covered in a PRD at this stage but were not addressed in v1 discovery:

- **Data export:** No mechanism for exporting debt items (CSV, JSON, Markdown). May be desirable as a future enhancement.
- **Search:** No full-text search across item titles and notes. Would become valuable as backlog grows.
- **Keyboard shortcuts:** The spec requires keyboard-navigable capture, but broader keyboard shortcuts (e.g., `N` for new item, `J/K` for backlog navigation) were not specified.
- **Item archiving vs. deletion:** Resolved items accumulate indefinitely. No delete or archive mechanism is specified. The dashboard relies on all resolved items being retained for counts — deletion would break this.
- **Onboarding:** No first-run experience, empty state, or onboarding flow is specified. The app should work correctly on first load with an empty database.
