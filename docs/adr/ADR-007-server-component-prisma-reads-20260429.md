---
title: ADR-007 — Server Component Direct Prisma Reads
date: 2026-04-29
status: Accepted
supersedes: null
clarifies: ADR-004
---

# ADR-007: Server Component Direct Prisma Reads

**Date:** 2026-04-29
**Status:** Accepted
**Clarifies:** ADR-004 (Server-Side Database Access via Route Handlers)

## Context

ADR-004 establishes that Route Handlers are the server-side database access
boundary. Its Consequences section notes: "Server Components can use Prisma
directly (they run on the server) for read-only initial renders." This is
architecturally sound but was a footnote rather than a deliberate, reasoned
decision.

The current v1 implementation uses `'use client'` page components throughout —
all pages fetch data from Route Handlers via `fetch()`. No page currently reads
Prisma directly. The pattern is permitted by the architecture but not yet
implemented.

This ADR elevates the permission to a first-class policy so future pages are
built consistently and maintainers understand when direct Prisma reads are
acceptable.

## Decision

Page-level Server Components **may** import and use Prisma directly for
**read-only** queries during **server-side rendering (SSR)** of the initial page,
if and when Server Components are introduced.

The current v1 pages (`app/page.tsx` and any future backlog pages) are client
components that fetch data via Route Handlers. If a future page is converted to
or introduced as a Server Component, it may read Prisma directly for its initial
SSR render.

All writes and all reads triggered by client-side interaction must continue to go
through Route Handlers as specified in ADR-004.

## Rationale

1. **Server Components run exclusively on the server.** They execute during SSR
   and their output is serialized HTML sent to the browser. Prisma code in a
   Server Component never reaches the browser. The security boundary established
   in ADR-004 and NFR-007 is not violated — provided the file does not carry
   a `'use client'` directive.

2. **Avoiding a roundtrip on initial paint improves perceived performance.**
   If Server Components fetched their own data via Route Handlers, the initial
   render would require an HTTP request from the server to itself — adding
   latency before any content reaches the user. Direct Prisma reads eliminate
   this roundtrip.

3. **Route Handlers remain the testable HTTP boundary.** The integration test
   suite tests Route Handlers directly. Server Component reads are exercised by
   component tests and by the integration tests that confirm the underlying data
   is correct.

## The Boundary in Plain English

| Context | Can use Prisma? | Notes |
|---|---|---|
| `"use client"` component | Never | Prisma uses Node.js internals not available in the browser bundle |
| Server Component (no `'use client'`) | Yes, read-only | This ADR — SSR initial render only |
| Route Handler (`app/api/**`) | Yes, read and write | ADR-004 |
| Shared lib imported by a client component | Never | Would be bundled into client JS |

## Consequences

- If a page is converted to a Server Component, it may read Prisma directly for
  its initial render — this is intentional, not a mistake.
- All subsequent reads (after initial page load) and all writes must use Route
  Handlers regardless of whether the page is a Server Component.
- Adding `'use client'` to a page that reads Prisma directly would break the
  application — the page must be split into a Server Component wrapper and a
  client component if client-side interactivity is needed alongside SSR Prisma reads.

## Alternatives Considered

- **Require all reads to go through Route Handlers (no exceptions):** Viable for
  the current all-client-component implementation. Rejected as a permanent policy
  because it would require a `fetch()` from the Next.js server to itself on SSR —
  unnecessary latency with no security benefit.
- **Use Next.js Server Actions for SSR data:** Out of scope for v1. Server
  Actions mix data-fetching and UI concerns in a way that complicates the
  current test strategy.
