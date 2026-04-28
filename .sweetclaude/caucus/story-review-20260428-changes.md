# Story Review Caucus Changes — P3 Applied + Contested
**Date:** 2026-04-28
**Step:** P3 (applied uncontested) + contested items for reference

---

## Applied (uncontested — 3+ personas)

- **US-013/US-015 contradiction resolved** → Button-disabled mechanism chosen. US-013 updated to remove error-on-submit; US-015 updated to remove error message criterion. Single mechanism: "Submit resolution" button is disabled (aria-disabled) until textarea contains non-whitespace. No submit path for empty resolution exists.

- **"Immediately" replaced throughout** → US-006, US-007, US-009 updated to "synchronous on state update (without a page reload)" or "synchronously on selection."

- **US-012 "not shown or disabled" → "not shown"** → Resource link field is not shown for Open or Resolved items.

- **US-003 "reasonable length" → "500 characters"** → Source/context field accepts up to 500 characters.

- **Keyboard/accessibility criteria added to E2–E5** → Added to US-006 (backlog navigation, badge labels), US-007 (filter controls keyboard-operable, aria-pressed), US-008 (status not color-alone), US-009 (priority selector keyboard-operable), US-011 (In Progress action has aria-label, color-alone prohibition), US-015 (disabled state communicated to screen readers), US-016 (metric labels accessible).

---

## Contested (not applied — 1–2 personas only)

- **US-016 "real time" vs. "on page load"** — Already resolved as "on page load" in the story. No change needed.
- **US-010 onBlur save trigger ambiguity** — Fatima only. "Exits the field" is sufficient for story-level spec; implementation detail.
- **Missing state machine for resolution requiring prior In Progress** — Marcus only. PRD does not require prior In Progress state before resolution; not a story gap.
- **US-013 "reveals or navigates to" UI pattern** — Fatima + Jordan flagged but didn't reach 3 votes. Implementation detail.
