---
title: Learning Debt Tracker v1 — Service Contract Analysis
version: 1.0
status: draft
author: Carson Sweet
assisted_by: Claude Code + SweetClaude (John Wick mode)
date: 2026-04-28
generated: autonomous
---

# Learning Debt Tracker v1 — Service Contract Analysis

## 1. Outbound Contracts

What this service promises to consumers. The only consumer is the browser-side React application running on the same machine.

### API endpoints exposed (Route Handlers)

| Endpoint | Method | Request shape | Response shape | Implied SLA |
|---|---|---|---|---|
| `/api/items` | POST | `{ title, priority?, source? }` | `201 DebtItem` | Synchronous, completes on next request |
| `/api/items` | GET | `?status=` (optional) | `200 DebtItem[]` sorted priority→createdAt | Synchronous |
| `/api/items/:id` | GET | — | `200 DebtItem` or `404` | Synchronous |
| `/api/items/:id` | PATCH | Partial `{ title?, priority?, status?, source?, notes?, resourceLink? }` | `200 DebtItem` | Synchronous |
| `/api/items/:id/resolve` | POST | `{ resolution: string }` | `200 DebtItem` | Synchronous |
| `/api/dashboard` | GET | — | `200 DashboardMetrics` | Synchronous |

**Invariants this service promises:**
- `status: RESOLVED` is never returned on a PATCH response (RESOLVED is only set via `/resolve`)
- A RESOLVED item's `resolution` field is always non-null and non-empty
- `resolvedAt` is set server-side (not client-supplied)
- Item sort order: priority ascending (P1 < P2 < P3), then `createdAt` ascending within each tier
- Dashboard rolling windows are computed at query time (not cached) from `resolvedAt` values

---

## 2. Inbound Contracts

What this service requires from providers. **There are none.**

This service has no runtime dependencies on external APIs, services, databases, or message queues. All data is read from and written to the local SQLite file at `prisma/dev.db`. No network egress occurs at runtime.

---

## 3. Implicit Contracts

Assumptions about the environment that are not explicitly documented.

| Assumption | Where it appears | Risk if violated |
|---|---|---|
| Node.js 18+ is available on the host | Tech spec §2 | Build fails or runtime errors on older Node |
| `npm run dev` runs on port 3000 | Architecture §2 | Browser-side `fetch()` calls to hardcoded localhost:3000 would fail |
| SQLite file is on a POSIX filesystem (not network-mounted) | Architecture §4 | SQLite WAL mode has known issues on NFS |
| Single writer access only | ADR-003 | Concurrent writes (e.g., two browser tabs simultaneously) could cause lock contention |
| The `DATABASE_URL` env var points to a writable path | Tech spec §2 | Prisma throws on startup if DB is read-only |
| `resolvedAt` precision is millisecond (JavaScript Date) | Data model | Dashboard rolling window edge cases at day boundaries if microsecond precision is needed |

---

## 4. Compliance Obligations

**Framework applied: `gdpr_floor` (data minimization)**

| Obligation | Status |
|---|---|
| Collect only data necessary for the stated purpose | Met — data model contains no fields beyond debt tracking data |
| No data transmission to external services | Met — no external network calls at runtime (enforced by NFR-019) |
| No telemetry, analytics, or crash reporting | Met — no third-party SDKs imported |

No downstream consumers receive data from this service (single-user local tool), so no data processing agreement obligations flow to consumers.

---

## 5. Risk Surface

| Contract | Type | Spec Available? | Risk |
|---|---|---|---|
| Browser ↔ Route Handlers | outbound | Yes (architecture §6) | Low — same process, localhost only |
| Server Component ↔ Prisma | internal | Yes (architecture §3.1) | Low — server-side only |
| Route Handler ↔ Prisma | internal | Yes (architecture §3.2) | Low — singleton, ACID guarantees |
| Prisma ↔ SQLite file | internal | Yes (ADR-003) | Low — single writer, no concurrent access expected |
| CI ↔ in-memory SQLite | internal (test) | Yes (tech spec §8) | Low-medium — `file::memory:?cache=shared` behavior must be validated on first test run |

**External service dependencies: 0**

No inbound contracts from external services. No outbound contracts to external services. The service contract surface is entirely internal (browser ↔ Next.js ↔ Prisma ↔ SQLite, all on the same machine).

---

## 6. Scope Check Result

External service dependencies identified: **0** (zero).

No scope warning applicable. Contract surface is internal-only.
