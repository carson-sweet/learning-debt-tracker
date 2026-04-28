# PRD Caucus Changes — D3 Applied + D4 Pending
**Date:** 2026-04-28
**Step:** D3 (applied uncontested) + D4 pending items

---

## Applied (uncontested — 3+ personas)

- **Executive Summary reframe** → Changed from tool description to behavioral intervention framing. "Learning Debt Tracker interrupts the escape hatch that AI tools create..."
- **Section 8 access path assumption** → Added explicit constraint: app is expected to be open in a persistent browser tab; 10-second constraint assumes tab is loaded.
- **Section 7 out-of-scope access path** → Added: instant global access (keyboard shortcut, browser extension, CLI) is explicitly out of scope for v1.
- **Problem Statement paragraph on existing tool failure** → Added paragraph [6a] naming why Anki, Obsidian, Notion, and TIL repos specifically fail — not abstractly but by design constraint.

---

## Pending User Decision (contested)

- **Resolution minimum length** — Zoe advocates for minimum character count (e.g., 20 chars) to prevent completion theater. Priya argues this adds friction at a critical moment. Marcus and Dr. Amir are neutral. Proposed default in PRD: any non-empty text. **Confirm or override at D4.**

- **FR-014 scope (display resolution text on closed item)** — Marcus proposes storing the explanation (already required for data integrity) but deferring the *display UI* to v2. No other persona objected but none explicitly endorsed. FR-014 currently includes both storage and display. **Confirm scope at D4.**

- **FR-013 implementation note (reflective placeholder)** — Priya and Dr. Amir recommend adding placeholder text to the resolution textarea: "What do you understand now that you didn't when you captured this?" Marcus and Zoe neutral. Not a new FR — implementation guidance only. **Confirm at D4.**

---

## D1 Flags (from autonomous PRD generation)

- Open Questions section flagged 4 unresolved design questions. Three are now addressed or have proposed defaults:
  - Priority default at capture: P2 proposed — still needs D4 confirmation
  - Minimum resolution length: contested — needs D4 decision
  - In-progress item visual treatment: still open
  - Dashboard rolling vs. calendar-aligned: still open
