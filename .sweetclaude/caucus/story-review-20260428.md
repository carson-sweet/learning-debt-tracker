---
title: Story Review Caucus — Learning Debt Tracker v1 User Stories
date: 2026-04-28
stories_version: learning-debt-tracker-v1-stories-v1.md
question: "Are these stories specific enough to write deterministic acceptance tests? Are any acceptance criteria ambiguous, unmeasurable, or missing?"
personas:
  - Jordan Park (Product Owner)
  - Fatima Osei (Senior Engineer)
  - Marcus Reyes (QA Lead)
  - Aisha Lindqvist (Accessibility Reviewer)
---

# Story Review Caucus — Learning Debt Tracker v1 User Stories

**Question:** Are these stories specific enough to write deterministic acceptance tests? Are any acceptance criteria ambiguous, unmeasurable, or missing?

---

## Turn 1: Initial Reactions

### Jordan Park — Product Owner

**Top concern: "Reasonable length" in US-003 is not a pass/fail criterion.**

US-003 says the source field "accepts free text up to a reasonable length." That is a design note, not an acceptance criterion. It cannot be tested. A test either passes or fails — "reasonable" is an editorial opinion. This needs a concrete character limit: 500, 1000, something. The same vagueness creeps into US-013: "Any non-empty text is accepted (no minimum character count)." That half is fine. But the preceding criterion says "submitting with an empty field is blocked with a clear error message" — what is the error message? I'll accept "clear" as a qualifier only if the exact message text is specified or if a content pattern is defined. US-015 gives the exact error string ("Write what you understand before closing this item") — that is what every story should do. US-013 should match that standard.

Secondary flags: US-005's "brief success state" is unmeasurable. How long does the success state last? "Brief" is not a duration. If Marcus tries to write a timing test for this, he has nothing to anchor to. And US-007's "visually indicated" for the active filter gives no pass/fail specification — is a color change sufficient? A border? A label change? "Visually indicated" is not testable without a design reference, and there is no design reference in the stories.

---

### Fatima Osei — Senior Engineer

**Top concern: US-012's resource link field availability logic is underspecified for state transitions.**

US-012 says "the resource link field is not shown or is disabled for Open or Resolved items." "Not shown or disabled" is two different behaviors and the story doesn't commit to one. These have different implementation paths: hidden means the DOM element doesn't exist; disabled means it exists but is non-interactive. A test for "field not present" and a test for "field present but disabled" are different tests. The story should specify which behavior is required.

Deeper concern: US-011 says an item can be moved back to "Open" from "In Progress." What happens to the resource link if an In Progress item with a saved URL is reverted to Open? Is the URL preserved? Cleared? This state transition is completely unaddressed in either US-011 or US-012. If the URL is preserved silently and then the field is hidden, the data exists in the database but is invisible to the user. If the URL is cleared on revert, that's a destructive action with no warning. Neither behavior is specified.

Additional flag: US-013's "reveals (or navigates to) a resolution textarea" — which is it? These are different interaction patterns. "Reveals" implies inline expansion; "navigates to" implies a route change or modal. The implementation choice has consequences for how focus is managed (which Aisha will have thoughts on), what the URL state is, and how the back button behaves.

---

### Marcus Reyes — QA Lead

**Top concern: Missing negative cases throughout E4 (Resolution).**

US-013 and US-015 handle the empty-field block, but neither addresses what happens when a user attempts to resolve an item that is still in "Open" status (never transitioned through In Progress). The stories don't define whether resolution requires prior In Progress status or whether it is available from any status. If resolution is available from Open directly, no story covers that path. If it requires In Progress first, no story calls out that constraint.

US-015 duplicates some of US-013's empty-field logic but frames it differently: US-013 says the button/action is not available until text is present; US-015 says it "displays an inline error" if you attempt to submit anyway. These are contradictory. If the action is unavailable (disabled/hidden) per US-015, there is no submit path that triggers the inline error in US-013. One of these stories has a broken AC.

Also flagging US-016's "real time" update claim: "Metrics update in real time (on page load; no manual refresh required)" — the parenthetical "on page load" contradicts "real time." Real-time implies continuous or event-driven updates. "On page load" means stale data until the user refreshes. These are different behaviors. A test for real-time would verify the count increments without a reload after a new item is added; a test for page-load freshness would not. This needs to be one or the other.

---

### Aisha Lindqvist — Accessibility Reviewer

**Top concern: No story across the entire backlog mentions screen reader announcements for dynamic state changes.**

US-005 describes a save confirmation — a dynamic UI update — with no mention of how screen reader users will be notified. WCAG 4.1.3 (Status Messages) requires that success and error messages be programmatically determinable without focus. None of the acceptance criteria for US-005, US-007, US-009, or US-016 mention ARIA live regions, role="status", or any equivalent mechanism.

US-007 says the active filter is "visually indicated" — a visual-only indicator. A screen reader user cannot determine which filter is active unless the selected state is communicated via aria-selected, aria-pressed, or equivalent. Jordan has flagged the untestability of "visually indicated" for a different reason; my concern is that even a testable visual implementation could still fail accessibility if it is purely visual.

US-004 is the only story that explicitly addresses keyboard interaction, and it is reasonably specific. But it only covers the capture flow. The backlog (US-006 through US-008), the triage actions (US-009 through US-012), and the resolution flow (US-013 through US-015) have no keyboard or accessibility criteria at all. For a UI application, every interactive story needs keyboard and screen reader criteria, not just the one capture story.

---

## Turn 2: Deep Dive on the 2–3 Most Significant Gaps

The panel identified three gaps significant enough for a second-pass examination: (1) the US-012/US-011 state transition problem, (2) the US-013/US-015 logical contradiction, and (3) the pervasive absence of accessibility criteria in interactive stories.

---

### Jordan Park

**On the US-013 / US-015 contradiction (Marcus's finding):**

Marcus is right that these two stories are in conflict. Reading them together: US-015 says the resolve action "is not available" until text is present, which implies a disabled or hidden control. US-013 says "submitting with an empty field is blocked with a clear error message." If the control is disabled/hidden before any text exists, the submit path in US-013 never fires — the error message described there is dead code. These stories cannot both be true simultaneously. My read is that US-015 should own the prevention behavior (the button is disabled until text is present) and US-013 should drop the error message criterion, or US-013 should own the error message path and US-015 should soften "not available" to "blocked." The stories need reconciliation before tests are written, or you will get two tests for two contradictory behaviors and one of them will always fail.

Additionally, Fatima's concern about US-013's "reveals or navigates to" language: I agree this is a branching implementation decision that should be resolved in the story, not deferred to the developer. A pass/fail test cannot be written for an ambiguous interaction pattern. "The resolve action reveals an inline textarea below the action button" is testable. "The resolve action navigates to a resolution sub-view at /item/:id/resolve" is testable. "Reveals or navigates to" is not.

**On the absence of measurable field length in US-003:**

This is unresolved from Turn 1. I want to add: "no structured format required" in the same criterion is also ambiguous. Does this mean the field accepts markdown? HTML tags? Emoji? "No structured format required" likely means plain text is sufficient, but it leaves open whether rich input is permitted or rejected. For a simple capture tool, the intent is almost certainly plain text only. Say that.

---

### Fatima Osei

**On the US-011/US-012 revert scenario (my Turn 1 finding), with Aisha's lens applied:**

Aisha's concern about dynamic state changes and screen reader announcements makes the US-011 revert case even sharper. If a user reverts an In Progress item to Open and the resource link field is silently hidden or the URL is silently cleared, there is no specified feedback — not for sighted users and certainly not for screen reader users. The missing behavior spec and the missing accessibility spec compound each other. A story that specifies "when status reverts to Open, the resource link is preserved but the field is hidden; a status change confirmation is announced via a live region" would close both gaps simultaneously.

**On US-016's "real time" vs. "on page load" contradiction (Marcus's finding):**

This matters architecturally. "Real time" with a SQLite/Prisma local stack implies either polling or a reactive data layer (something like Prisma Client with subscriptions, or a file watcher). "On page load" is a simple read-on-mount pattern with no architectural complexity. These are different implementation costs. The story as written could justify either implementation and both teams could claim compliance. For a single-user local app, "updates reflect the current state when the view is loaded or navigated to" is almost certainly the right specification. The word "real time" was likely used casually to mean "not cached from yesterday," but it should be replaced with a precise statement.

**Additional flag: US-010 save trigger is ambiguous.**

"Notes are saved when the user exits the field or presses a save action." "Exits the field" means onBlur. Does tabbing away count? Does clicking elsewhere on the page count? Does closing the browser tab without tabbing away trigger a save? The onBlur behavior for a free-text notes field with no auto-save has real edge cases. Jordan flagged "should" as a red flag in acceptance criteria; I'll flag "exits the field" as an interaction verb that requires precision. At minimum: "saved on blur (when focus leaves the notes field)" or "saved on explicit save button press only" — pick one.

---

### Marcus Reyes

**On the US-013/US-015 logical contradiction (my Turn 1 finding), with Jordan's reconciliation proposal:**

Jordan's reconciliation is correct. I want to add the test-design consequence: if both stories ship as written, the test suite will have a test for "resolve button is disabled when field is empty" (US-015) and a separate test for "submitting with empty field shows error message" (US-013). One of those tests will fail by definition because the button that triggers the submission path is disabled. This will show up as a test failure in CI, not just a product ambiguity. The contradiction produces a broken test suite before a single line of implementation is written.

**On the "immediately" criterion in US-006 and US-009:**

US-006 says "sort order updates immediately when an item's priority changes." US-009 says "the backlog sort order updates immediately to reflect the new priority." Aisha flagged "immediately" in her persona description as suspicious without a time bound. I share that concern. "Immediately" in UI testing is typically operationalized as "within one render cycle" or "within X milliseconds." For a deterministic test, I need to know: does "immediately" mean synchronously (no async wait), within 100ms, within 500ms? For a local SQLite app with no network latency, this is probably "synchronous on state update," but it should say that. If these are ever tested with a Playwright or Cypress time assertion, "immediately" will be interpreted as the test runner's default timeout, which may not reflect product intent.

**On the missing negative case for resolution path from Open status:**

This is still unaddressed. The stories describe the resolution flow from an item's "detail/edit view" but never specify whether an Open item (one that was never marked In Progress) has a Resolve action available. If the intent is that resolution requires a prior In Progress transition, that is a state machine constraint that belongs in US-011 and US-013. If resolution is available from any status, then the "In Progress" state is optional in the workflow and the resource link story (US-012) should acknowledge that resolution can occur without ever adding a resource link — which it does not currently cover.

---

### Aisha Lindqvist

**On the pervasive absence of accessibility criteria (my Turn 1 finding), building on Fatima's and Marcus's findings:**

Fatima's point about the revert scenario and Marcus's point about the US-013/US-015 contradiction both touch something I want to generalize: the stories treat UI state changes as purely visual events. Every state change in this app — item saved, status updated, priority changed, resolve button enabled, error displayed — is a dynamic DOM update. WCAG 4.1.3 requires status messages to be programmatically determinable. WCAG 2.1.1 requires all functionality to be operable by keyboard.

US-004 is the only story in the entire set with keyboard criteria, and it covers only the capture form. That leaves the following interactive stories with no keyboard or screen reader coverage:

- US-007: Status filter — no keyboard navigation criteria, no aria-selected state
- US-008: Backlog row — no criteria for how priority/status badges are communicated to AT
- US-009: Priority change — inline priority selector in the backlog row with no keyboard or focus criteria
- US-011: Status transition — "inline action" with no keyboard criteria
- US-012: Resource link field — conditional visibility with no criteria for how visibility change is announced
- US-013/US-015: Resolve flow — textarea reveal/navigation with no focus management criteria
- US-016: Dashboard — dynamic metrics with no live region criteria

Jordan's concern about "visually indicated" in US-007 is correct and understates the problem. The active filter state is one of many visual-only indicators in these stories. The fix is not just replacing "visually indicated" with a testable visual spec — it is adding a parallel accessibility criterion to every story that describes a state change, a dynamic update, or an interactive control.

A concrete recommendation: each story in E2–E5 that describes a UI interaction or dynamic content change should have an accessibility criterion block, even if minimal. For example, US-007 could add: "The active filter communicates its selected state via aria-pressed or aria-selected so that screen reader users can determine which filter is active." That is deterministic and testable.

---

## Synthesis

### Uncontested Findings (3 or more personas agree)

**1. US-013/US-015 logical contradiction must be resolved before tests are written.**
Jordan, Marcus, and Fatima all flagged this gap from different angles. Jordan identified the AC inconsistency, Marcus identified the broken test suite consequence, and Fatima noted that it compounds with the state transition problem in US-012. The resolve button either (a) is disabled until text is present (US-015) or (b) is available and shows an inline error on empty submit (US-013). Both cannot be true. Stories must be reconciled.

**2. "Immediately" in US-006 and US-009 is not deterministic enough for automated testing.**
Marcus and Jordan both flagged timing language as a red flag. For a local app, the correct specification is "synchronous on state update" or "within one render cycle after the priority change is saved." The word "immediately" should be replaced in both stories.

**3. US-012's "not shown or disabled" must resolve to one behavior.**
Fatima identified this as an implementation fork, and Jordan noted the pattern fits the broader problem of stories that leave implementation choices open when the test requires a single deterministic expectation. "Not shown" and "disabled" produce different DOM states and different test assertions. Pick one.

**4. US-003's "reasonable length" character limit must be specified.**
Jordan flagged this directly; Marcus noted it implies an untestable boundary condition. A specific character ceiling (e.g., 500 characters) is required for a pass/fail test.

**5. Interactive stories outside US-004 have no keyboard or accessibility criteria.**
Aisha identified this comprehensively; Jordan's "visually indicated" flag in US-007 is a direct instance of the same problem. Stories US-007, US-009, US-011, US-012, US-013/US-015, and US-016 all describe interactive or dynamic UI behaviors with no keyboard operability or screen reader criteria. This is a structural gap across E2–E5, not a per-story oversight.

---

### Contested Findings (1–2 personas flagged, or personas disagree)

**1. US-016's "real time" vs. "on page load" — real-time requirement.**
Flagged by Marcus and diagnosed by Fatima as an architectural decision. Jordan and Aisha did not flag this. For a single-user local SQLite app, "real time" is almost certainly casual language for "fresh on load," but the stories should be precise. The panel does not contest the finding — it is a genuine ambiguity — but whether it rises to a blocking story defect or a clarifying edit depends on whether the product intends reactive/event-driven updates or load-time freshness.

**2. US-010's onBlur save trigger ambiguity.**
Flagged by Fatima only. Jordan did not contest it, and Marcus did not flag it independently. The concern is valid — "exits the field" is ambiguous — but the other personas did not identify it as a primary gap. This may be a development-phase clarification rather than a story-level defect.

**3. Missing state machine definition for resolution from Open status.**
Flagged by Marcus only. None of the other personas independently raised the question of whether resolution requires a prior In Progress transition. This is a legitimate product design question — a workflow constraint that is implied but never stated — but it may be resolved by the product intent rather than requiring a story fix. Worth a clarifying question to the product owner before a story change is drafted.

**4. US-013's "reveals or navigates to" interaction pattern ambiguity.**
Flagged by Fatima; Jordan agreed in Turn 2. Marcus and Aisha did not flag it independently, though Aisha's focus management concern makes it adjacent. The panel's Turn 2 discussion suggests this should be resolved, but it did not reach the threshold of three independent flags before the synthesis.

---

*Caucus completed autonomously — 2026-04-28*
