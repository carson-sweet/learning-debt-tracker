---
title: ADR-003 — SQLite via Prisma
date: 2026-04-28
status: Accepted
---

# ADR-003: SQLite via Prisma

**Date:** 2026-04-28
**Status:** Accepted

## Context

The app is single-user and local-only. Persistence must survive app restarts. No network database is acceptable (NFR-004: data minimization, NFR-007: no external service calls).

## Decision

SQLite as the database engine, accessed exclusively through Prisma ORM. The database file lives in the project directory (e.g., `prisma/dev.db`). Prisma Client is instantiated as a singleton to avoid connection pool exhaustion in development.

## Rationale

SQLite requires zero infrastructure — no separate process, no network, no credentials. It is the correct choice for a local single-user application. Prisma provides type-safe queries, migration management, and shields the application from raw SQL injection risk.

## Consequences

- No concurrent write access (SQLite single-writer model) — acceptable for single-user
- Migration history is tracked in `prisma/migrations/`
- Prisma Client must be instantiated as a singleton (`lib/prisma.ts`) to avoid "too many clients" warnings in Next.js development mode

## Alternatives Considered

- **PostgreSQL / MySQL:** Rejected — require a separate running process; no benefit for a local single-user app.
- **Raw SQLite (better-sqlite3):** Rejected — loses type safety, migration management, and query builder that Prisma provides.
- **IndexedDB / localStorage:** Rejected — browser storage only, not accessible from server-side route handlers.
