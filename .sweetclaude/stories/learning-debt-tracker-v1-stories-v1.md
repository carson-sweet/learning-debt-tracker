---
title: Learning Debt Tracker v1 — User Stories
version: 1.0
status: draft
author: Carson Sweet
assisted_by: Claude Code + SweetClaude (John Wick mode)
date: 2026-04-28
format: generic
scope: all
audience: Development handoff
---

# Learning Debt Tracker v1 — User Stories

**Personas covered:**
- User (single-user app — both Alex the LLM-assisted learner and the voracious reader share all tasks and acceptance criteria)

**Epics:**
- E1: Capture
- E2: Backlog
- E3: Triage & Work
- E4: Resolution
- E5: Dashboard

---

## E1: Capture

### US-001: Capture a debt item with title only

As a user, I want to save a new learning debt item by typing only a title, so that I can capture the gap in under 10 seconds without thinking about metadata.

**Acceptance criteria:**
- A capture input (text field) is visible and focusable from the main view without navigation
- Submitting with only a title saves the item with: title (required), priority defaulting to P2, status defaulting to Open, created_at timestamp
- The item appears in the backlog immediately after submission
- The capture input is cleared and ready for the next entry after submission
- No other fields are required to complete the capture

---

### US-002: Set priority at capture

As a user, I want to optionally set a priority (P1, P2, P3) when capturing an item, so that high-urgency gaps are immediately visible in my backlog without a separate triage step.

**Acceptance criteria:**
- A priority selector (P1 / P2 / P3) is available within the capture flow
- Priority defaults to P2 if not explicitly set
- The selected priority is saved with the item
- The priority selector does not require interaction to complete a capture — it is optional

---

### US-003: Add source context at capture

As a user, I want to optionally add a source or context note when capturing an item, so that I can remember where the gap came from without having to reconstruct it later.

**Acceptance criteria:**
- A source/context text field is available within the capture flow
- The field is optional — submitting without it does not produce an error
- The source text is saved with the item and displayed in the backlog row (FR-008)
- The source field accepts free text up to a reasonable length (no structured format required)

---

### US-004: Complete capture keyboard-first

As a user, I want to capture a new item without using a mouse, so that I can stay in my coding or reading flow without switching input devices.

**Acceptance criteria:**
- The capture input field is automatically focused on page load or can be focused with a single keyboard shortcut (e.g., pressing `/` or `N` while not in another input)
- The user can tab between capture fields (title → source → priority) using the keyboard
- Pressing Enter from the title field submits the item (when title is non-empty)
- After submission, focus returns to the title field automatically

---

### US-005: Receive capture confirmation

As a user, I want visible feedback when an item is saved, so that I know the capture succeeded and can return to what I was doing.

**Acceptance criteria:**
- After a successful save, a confirmation is visible — either the item appearing in the backlog, a brief success state on the capture form, or both
- The confirmation does not require user dismissal (it clears automatically or the new empty state communicates success)
- If the save fails (e.g., database write error), an error message is displayed and the item data is preserved in the form

---

## E2: Backlog

### US-006: View backlog sorted by priority and age

As a user, I want to see all my open debt items sorted by priority then by age, so that the most important and most neglected items are at the top.

**Acceptance criteria:**
- The backlog displays all debt items by default (status filter defaults to "Open")
- Items are sorted: P1 items first, then P2, then P3
- Within each priority tier, items are sorted oldest-first (by created_at)
- Sort order updates immediately when an item's priority changes

---

### US-007: Filter backlog by status

As a user, I want to filter my backlog by status (Open, In Progress, Resolved), so that I can focus on what needs attention without resolved items cluttering the view.

**Acceptance criteria:**
- A status filter is available on the backlog view with options: All, Open, In Progress, Resolved
- The default view shows Open items only
- Selecting a filter immediately updates the displayed items without a page reload
- The active filter is visually indicated
- Filter state persists across page refreshes (stored in localStorage or URL param)

---

### US-008: See item details in the backlog

As a user, I want to see the key details of each item in the backlog row, so that I can identify items at a glance without opening each one.

**Acceptance criteria:**
- Each backlog row displays: title, priority badge (P1/P2/P3), status badge, age (e.g., "3 days ago"), and source/context if present
- In-progress items are visually distinct from open items (e.g., different background color, border, or pin indicator)
- Resolved items (when filtered in) show a visual indicator that they are closed

---

## E3: Triage & Work

### US-009: Change item priority

As a user, I want to change the priority of any debt item, so that I can reorganize my backlog as my understanding of urgency evolves.

**Acceptance criteria:**
- Priority can be changed from the item's detail/edit view or inline in the backlog row
- Priority changes are saved immediately (no separate "save" button required)
- The backlog sort order updates immediately to reflect the new priority
- All three priority values (P1, P2, P3) are selectable regardless of current priority

---

### US-010: Add or edit notes on an item

As a user, I want to add or edit free-text notes on any debt item, so that I can record partial understanding, useful links, or context as I work toward resolution.

**Acceptance criteria:**
- A notes field is accessible from the item's detail/edit view
- Notes are free text with no format requirements
- Notes are saved when the user exits the field or presses a save action (no auto-save to avoid partial saves)
- Existing notes are displayed when the item is opened for editing
- Notes are distinct from the source/context field captured at creation

---

### US-011: Mark an item as in-progress

As a user, I want to mark a debt item as "In Progress," so that I can signal to myself that I am actively working on understanding this concept.

**Acceptance criteria:**
- A transition to "In Progress" is available from the item's detail/edit view or as an inline action in the backlog
- In-progress items appear visually distinct in the backlog (distinct background or pinned to top of their priority group — FR-011)
- An item can be moved back to "Open" from "In Progress" (status is reversible before resolution)
- The transition is recorded with a timestamp

---

### US-012: Add a resource link to an in-progress item

As a user, I want to add a URL resource link to an item I am actively working on, so that I can track the article, documentation, or video I am using to close the gap.

**Acceptance criteria:**
- A resource link field (URL) is available on items with "In Progress" status
- The field is optional — an item can be In Progress without a resource link
- The URL is displayed as a clickable link in the item detail view
- Basic URL validation is applied (must begin with http:// or https://)
- The resource link field is not shown or is disabled for Open or Resolved items

---

## E4: Resolution

### US-013: Write a self-explanation to resolve an item

As a user, I want to be required to write my own explanation before closing a debt item, so that I am forced to consolidate my understanding before marking the gap as closed.

**Acceptance criteria:**
- A "Resolve" action is available from the item's detail/edit view
- The resolve action reveals (or navigates to) a resolution textarea with placeholder text: "What do you understand now that you didn't when you captured this?"
- The resolution textarea is required — submitting with an empty field is blocked with a clear error message
- Any non-empty text is accepted (no minimum character count)
- Submitting a non-empty resolution changes the item's status to "Resolved" and records the resolved_at timestamp

---

### US-014: View a resolution explanation after closing an item

As a user, I want to see my self-written explanation when I view a resolved item, so that I can review what I understood at the time of resolution.

**Acceptance criteria:**
- When a resolved item is opened or viewed, the resolution explanation text is displayed
- The explanation is read-only after resolution (cannot be edited once the item is resolved)
- The resolved_at timestamp is displayed alongside the explanation
- The resolution text is visually distinguished from the notes field

---

### US-015: Cannot resolve without an explanation

As a user, I want the system to prevent me from closing an item without writing something, so that the closure ritual is enforced even when I'm tempted to skip it.

**Acceptance criteria:**
- The "Resolve" / "Mark Done" button/action is not available until the resolution textarea contains at least one non-whitespace character
- Attempting to submit an empty or whitespace-only explanation displays an inline error: "Write what you understand before closing this item"
- The item remains in its current status (Open or In Progress) if the resolve action is blocked

---

## E5: Dashboard

### US-016: View debt summary on the dashboard

As a user, I want to see a summary of my learning debt at a glance, so that I can understand how my backlog is growing or shrinking over time.

**Acceptance criteria:**
- A dashboard view is available (distinct from the backlog view)
- The dashboard displays all four metrics:
  1. **Total open items** — count of items with status Open or In Progress
  2. **Resolved last 7 days** — count of items with resolved_at within the last 7 days (rolling window from current timestamp)
  3. **Resolved last 30 days** — count of items with resolved_at within the last 30 days (rolling window)
  4. **Oldest open item** — title and age of the item with the earliest created_at that is still Open or In Progress
- Metrics update in real time (on page load; no manual refresh required)
- If no open items exist, the "Oldest open item" metric displays a positive empty state ("No open items")
- If no items were resolved in the window, the metric displays 0

---

## Non-Functional Story

### US-NFR-001: App runs fully locally with no network calls

As a user, I want the app to work with no internet connection, so that I can use it in any environment without privacy concerns or connectivity dependencies.

**Acceptance criteria:**
- The app loads and functions fully when the host machine has no internet connection
- No network requests are made to external services at runtime (verifiable via browser DevTools network tab)
- All data is read from and written to the local SQLite database via Prisma
- The app does not fail, degrade, or show errors when offline
