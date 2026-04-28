---
title: ADR-004 — Server-Side Database Access via Route Handlers
date: 2026-04-28
status: Accepted
---

# ADR-004: Server-Side Database Access via Route Handlers

**Date:** 2026-04-28
**Status:** Accepted

## Context

Prisma Client cannot run in the browser. NFR-007 requires that the SQLite database file be accessible only via server-side code. This ADR defines where the database boundary lives.

## Decision

All database reads and writes go through Next.js Route Handlers in `app/api/`. Client components call these Route Handlers via `fetch()`. Prisma is never imported in client components or page components that render on the client.

## Rationale

This enforces a clean data access boundary. It also means the API layer is independently testable (integration tests can call the API routes without mounting the full UI), which aligns with the TDD Level 3 approach used in this pipeline.

## Consequences

- An API layer exists even though there is no external consumer — this is the correct trade-off for testability
- Client components use `fetch()` to API routes for data mutations and reads
- Server Components can use Prisma directly (they run on the server) for read-only initial renders

## Alternatives Considered

- **Server Actions:** Rejected for mutations — Route Handlers provide a stable HTTP contract that the test suite can call directly. Server Actions mix UI and data logic in a way that complicates integration testing.
- **Direct Prisma in Server Components for all reads:** Acceptable for simple reads; used for initial page renders where there is no user interaction. Not acceptable for mutations.
