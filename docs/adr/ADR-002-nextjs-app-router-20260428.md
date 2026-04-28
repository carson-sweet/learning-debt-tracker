---
title: ADR-002 — Next.js App Router
date: 2026-04-28
status: Accepted
---

# ADR-002: Next.js App Router

**Date:** 2026-04-28
**Status:** Accepted

## Context

The stack was specified in discovery: Next.js with SQLite via Prisma. This ADR records the decision to use the App Router (Next.js 14+) rather than Pages Router.

## Decision

Use Next.js 14+ App Router with TypeScript. All data mutations and database reads go through Route Handlers (API routes in the `app/api/` directory), not through Server Actions or direct client-side Prisma calls.

## Rationale

App Router is the current Next.js standard and provides React Server Components, which reduce client bundle size for read-heavy pages (backlog, dashboard). Route Handlers maintain a clear server/client boundary — the SQLite database is never accessible from client-side code.

## Consequences

- Route Handlers (`app/api/`) serve as the only entry point to Prisma
- Server Components can be used for initial page renders without client-side data fetching boilerplate
- Client Components are needed for interactive UI (capture form, inline edits, filter controls)

## Alternatives Considered

- **Next.js Pages Router:** Rejected — App Router is the current standard; no reason to use the legacy approach for a new project.
- **Server Actions for mutations:** Rejected — Route Handlers provide a cleaner API boundary that the test suite can target independently of the UI framework.
