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
boundary. It notes in its Consequences section that "Server Components can use
Prisma directly (they run on the server) for read-only initial renders." This
exception was correct but underdocumented — it appeared as a footnote rather
than a deliberate, reasoned decision. A maintainer reading the architecture
document's summary statement ("Route Handlers are the only entry point to the
database") would see a contradiction with actual page-level code, with no
explanation.

This ADR elevates the exception to a first-class decision.

## Decision

Page-level Server Components may import and use Prisma directly, but only for
**read-only** queries during **server-side rendering (SSR)** of the initial page.
This applies to:

- `app/page.tsx` (Dashboard initial render)
- `app/backlog/page.tsx` (Backlog initial render)
- `app/backlog/[id]/page.tsx` (Item detail initial render)

All writes and all reads triggered by client-side interaction continue to go
through Route Handlers as specified in ADR-004.

## Rationale

1. **Server Components run exclusively on the server.** They execute during SSR
   and their output is serialized HTML sent to the browser. Prisma code in a
   Server Component never reaches the browser. The security boundary established
   in ADR-004 and NFR-007 is not violated.

2. **Avoiding a roundtrip on initial paint improves perceived performance.**
   If Server Components fetched their own data via Route Handlers, the initial
   render would require an HTTP request from the server to itself — adding
   latency before any content reaches the user. Direct Prisma reads eliminate
   this roundtrip.

3. **Route Handlers remain the testable HTTP boundary.** The integration test
   suite tests Route Handlers directly. Server Component reads do not need to
   be tested via HTTP — they are exercised by component tests that mock Prisma
   or by the integration tests that confirm the underlying data is correct.

## The Boundary in Plain English

| Context | Can use Prisma? | Notes |
|---|---|---|
| `"use client"` component | Never | Build will fail or runtime error |
| Server Component (page-level) | Yes, read-only | This ADR |
| Route Handler (`app/api/**`) | Yes, read and write | ADR-004 |
| Shared lib / utility imported by client component | Never | Would be bundled into client JS |

## Consequences

- Two patterns for reading data exist: Server Component direct reads (SSR only)
  and Route Handler fetches (client-triggered). New developers must learn both.
- This is documented here so a maintainer who sees `import { prisma }` in a
  page file does not assume it is a mistake and remove it.
- Any new page that needs SSR data should follow the Server Component pattern
  here. Any new page interaction that occurs after initial load must use a
  Route Handler.

## Alternatives Considered

- **Require all reads to go through Route Handlers (no exceptions):** Rejected.
  This would require a `fetch()` from the Next.js server to itself on every
  page load — unnecessary latency with no security benefit, since the call
  never leaves the server.
- **Use Next.js Server Actions for SSR data:** Out of scope for v1. Server
  Actions mix data-fetching and UI concerns in a way that complicates the
  current test strategy.
