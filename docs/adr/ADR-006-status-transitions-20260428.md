---
title: ADR-006 — Item Status Transition Model
date: 2026-04-28
status: Accepted
---

# ADR-006: Item Status Transition Model

**Date:** 2026-04-28
**Status:** Accepted

## Context

The PRD defines three statuses: Open, In Progress, Resolved. The stories and Gherkin implicitly assume resolution requires prior In Progress status (all resolution scenarios use an In Progress item as precondition). The CK2 check-in flagged this as an unresolved ambiguity.

## Decision

Valid status transitions:
- Open → In Progress (mark as working on it)
- In Progress → Open (revert to backlog)
- Open → Resolved (skip In Progress — allowed)
- In Progress → Resolved (standard path — resolve directly from In Progress)
- Resolved → any (not allowed — resolution is final)

Any item can be resolved regardless of whether it was ever marked In Progress. The In Progress state is optional, not a required step in the resolution workflow.

## Rationale

Requiring In Progress before resolution adds friction with no learning benefit. A user who understands a concept immediately after capture should be able to resolve it without a mandatory intermediate state. The test suite should cover both the Open→Resolved and In Progress→Resolved paths.

## Consequences

- The resolution UI must be accessible from items in both Open and In Progress status
- The Gherkin for US-013 and US-015 uses In Progress as the precondition — the test writer should add a parallel scenario for Open items (or the test suite covers this via US-013's acceptance criteria which don't restrict prior status)
- The data model records transitions implicitly via status field updates, not as a separate event log

## Alternatives Considered

- **Require In Progress before resolution:** Rejected — unnecessary friction; the learning value comes from writing the explanation, not from moving through status states.
