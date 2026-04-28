---
title: Learning Debt Tracker — Discovery
date: 2026-04-28
status: draft
---

# Learning Debt Tracker — Discovery

## Problem Statement

In the age of AI assistants, it is trivially easy to get unblocked without actually learning. A
developer asks Claude to fix a bug, gets the fix, ships it, and moves on — without understanding
why the fix works. A student asks ChatGPT to explain a concept, gets a passable answer, and
forgets it by the next day.

The result is invisible accumulating debt: a growing backlog of things you nominally "handled"
but don't actually understand. Unlike technical debt, learning debt has no ticket system, no
backlog, no visibility. It compounds silently until it manifests as a wall — a job interview,
a production incident, a problem the AI can't solve because you lack the foundation to even ask
the right question.

Concrete scenario: Alex is a junior developer who uses Copilot and Claude daily. Over six months
they have shipped features involving JWT auth, React performance optimization, database indexing,
and async JavaScript. For each, an AI tool provided the answer. Alex understood it enough to
apply it. But asked to explain JWT expiry vs. revocation, or why useCallback does not always
prevent rerenders, Alex would struggle. They have no record of these gaps, no system for closing
them, and no visibility into how many there are.

## Target Users

**Primary: The LLM-assisted learner**
- Developer, student, or knowledge worker who uses AI tools (Claude, ChatGPT, Copilot) daily
- Regularly gets unblocked by AI without fully understanding the underlying concept
- Motivated to actually learn, but lacks a system for tracking gaps
- Needs: fast capture (no friction at moment of unblocking), clear backlog, satisfying
  resolution flow

**Secondary: The voracious reader**
- Reads widely — articles, books, courses, documentation
- Regularly encounters unfamiliar concepts, either interrupts flow to look them up or forgets them
- Needs: quick capture during reading, organized backlog by topic area

## Feature Set

**Core:**
1. Capture a debt item — title, optional source/context, priority (P1/P2/P3)
2. View backlog — sorted by priority and age, filterable by status
3. Triage — change priority, add notes
4. Work — mark as in-progress, optionally add a resource link
5. Resolve — write a brief self-explanation of what you now understand (required to close)
6. Dashboard — open debt count, items closed this week and this month, oldest open item

**Critical UX constraint:** Capture must take under 10 seconds. If adding an item requires
navigation or a form with many fields, people will not do it at the moment they need to. Speed
of capture is the most important property of the system.

## Out of Scope

- AI-generated explanations or learning content
- Social features, sharing, or collaboration
- Spaced repetition scheduling (priority-ordered backlog is sufficient for v1)
- Integrations with external tools (Notion, Jira, Obsidian, etc.)
- Mobile app (web only, responsive is fine)
- User accounts or authentication (single-user, local)

## Key Design Decisions

- **No AI content generation in the app.** The app is a tracking tool, not a tutor. The moment
  it generates explanations, it becomes another LLM wrapper — the exact behavior it exists to
  counteract.
- **Self-written resolution is required.** You cannot close a debt item without writing your own
  explanation in your own words. This is the learning mechanism, not a nice-to-have.
- **Local and single-user.** No accounts, no cloud, no data leaving the machine. Removes auth
  complexity entirely and keeps scope tight.
- **Stack:** Next.js with SQLite via Prisma. Runs locally. No deployment required.
