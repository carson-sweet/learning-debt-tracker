---
title: Learning Debt Tracker — User Personas
version: 1.0
date: 2026-04-28
status: draft
---

# Learning Debt Tracker — User Personas

## Persona 1: The LLM-Assisted Learner

**Representative user:** Alex, a junior developer

**Role:** Developer, student, or knowledge worker who uses AI tools (Claude, ChatGPT, Copilot) daily.

**Context:** Regularly gets unblocked by AI without fully understanding the underlying concept. Motivated to actually learn, but lacks a system for tracking gaps.

**Trigger:** Gets unblocked by AI without understanding why — either at the moment of copy-pasting a fix (realizing they don't know what they just applied), or later when the accumulated weight of gaps becomes visible.

**Deal-breakers:**
- Too much setup before first use
- Capture takes more than 10 seconds
- Too many required fields — adds friction at the worst moment

---

### Tasks

#### Task 1: Capture a learning debt item

**Workflow:**
1. Open the app or switch to the tab
2. Type a short title — the concept or topic they just got help with (e.g. "JWT expiry vs revocation")
3. Optionally add source or context (URL, note like "asked Claude about this")
4. Submit

**Inputs needed:** A title. Everything else optional.

**Success criteria:**
- Item captured in under 10 seconds
- At most 2 fields required to complete (title required, rest optional)
- Submittable without leaving current context — keyboard-first, minimal clicks

**Failure modes:**
- Form requires too many fields before submission — user skips it entirely
- App takes too long to load — user gives up and loses the item
- No save confirmation — user loses trust or submits twice

#### Task 2: View backlog

**Success criteria:**
- Items sorted by priority and age
- Filterable by status

#### Task 3: Triage an item

**Success criteria:**
- Can change priority
- Can add notes

#### Task 4: Work on an item

**Success criteria:**
- Can mark item as in-progress
- Can optionally add a resource link

#### Task 5: Resolve an item

**Inputs needed:** A self-written explanation in the user's own words of what they now understand.

**Success criteria:**
- Cannot close an item without writing their own explanation
- Explanation is free-form text authored by the user — no AI generation

**Failure modes:**
- User writes a token explanation to game the system — mitigated by making the field obviously the point, not a compliance hurdle

#### Task 6: Check the dashboard

**Success criteria:**
- Shows open debt count
- Shows items closed this week and this month
- Shows oldest open item

---

## Persona 2: The Voracious Reader

**Role:** Reads widely — articles, books, courses, documentation — and regularly encounters unfamiliar concepts.

**Context:** Either interrupts reading flow to look up unknowns (losing context) or keeps reading and forgets them entirely.

**Trigger:** Encounters an unfamiliar concept mid-read and needs a friction-free way to log it without breaking flow.

**Deal-breakers:** Same as Persona 1 — speed of capture is the critical property.

**Tasks:** All six tasks from Persona 1 apply identically. The capture flow is the primary entry point; backlog, triage, work, resolve, and dashboard serve the same function for accumulated reading gaps as for accumulated AI-assisted coding gaps.

---

## Anti-Profile

Not defined.
