---
title: Learning Debt Tracker v1 — Architecture Document
version: 1.0
status: approved
author: Carson Sweet
assisted_by: Claude Code + SweetClaude (John Wick mode)
date: 2026-04-28
generated: autonomous
---

# Learning Debt Tracker v1 — Architecture

## 1. Overview

Learning Debt Tracker is a single-user, locally-hosted web application. It runs as a Next.js development server on localhost. There is no deployment infrastructure, no remote database, and no network calls at runtime. The full system is a single Node.js process: Next.js App Router, serving both the React UI and the Route Handler API, backed by a SQLite database file accessed via Prisma.

**Key architectural constraint:** All database access goes through server-side Route Handlers. Prisma is never imported in client components or page-level code that runs in the browser.

---

## 2. System Context

```
User (browser, localhost)
        │
        ▼
Next.js App Router (localhost:3000)
├── Server Components (React, SSR — initial page renders)
├── Client Components (React, hydrated — interactive UI)
└── Route Handlers (app/api/**) ← only entry point to Prisma
        │
        ▼
Prisma Client (singleton, lib/prisma.ts)
        │
        ▼
SQLite (prisma/dev.db, local filesystem)
```

No external systems. No network egress. The browser, the server, and the database all run on the same machine.

---

## 3. Component Breakdown

### 3.1 Next.js App Router (Page Layer)

All pages live under `app/`. Pages are Server Components by default and may use Prisma directly for **read-only** initial renders — they run on the server and never reach the browser. Client Components are opted-in with `"use client"` and handle all interactive behavior.

| Route | Type | Purpose |
|---|---|---|
| `app/page.tsx` | Server Component | Dashboard — initial metric render |
| `app/backlog/page.tsx` | Server Component | Backlog — initial item list render |
| `app/backlog/[id]/page.tsx` | Server Component | Item detail — initial item render |

Page-level Server Component reads happen directly via Prisma for the first render. Subsequent mutations and dynamic reads go through Route Handlers via `fetch()`.

### 3.2 Route Handler Layer (`app/api/`)

Route Handlers are the only server-side entry point for **writes** and for any reads triggered by **client-side interactions**. Client components call these via `fetch()`. All business logic (validation, status transitions, resolution enforcement) lives here.

| Route | Methods | Purpose |
|---|---|---|
| `app/api/items/route.ts` | GET, POST | List all items; create new item |
| `app/api/items/[id]/route.ts` | GET, PATCH, DELETE | Get, update, or delete item |
| `app/api/items/[id]/resolve/route.ts` | POST | Resolve an item with explanation |
| `app/api/dashboard/route.ts` | GET | Aggregate dashboard metrics |

The resolve endpoint is separate from the general PATCH endpoint to enforce the resolution gate: it requires a non-empty explanation body and validates the status transition.

### 3.3 Client Component Layer

Client Components live within the page tree and are used for all interactive UI: the capture form, filter controls, inline priority changes, the in-progress toggle, and the resolution form.

| Component | Purpose |
|---|---|
| `components/CaptureForm` | New item form — title (required), priority, source |
| `components/BacklogList` | Filterable, sorted item list |
| `components/ItemCard` | Single backlog item with inline actions |
| `components/FilterBar` | Status filter controls (Open / In Progress / Resolved) |
| `components/ResolutionForm` | Explanation textarea + submit; button disabled until non-empty text |
| `components/DashboardMetrics` | Four metric tiles (client-renderable from SSR data) |

### 3.4 Server Component vs. Route Handler — Intentional Asymmetry

Server Components (§3.1) read Prisma directly. Route Handlers (§3.2) are required for all writes and all client-triggered reads. This asymmetry is intentional, not an oversight:

- Server Components run exclusively on the server during SSR. Prisma reads there are safe and avoid a client-side fetch roundtrip for the initial paint.
- Route Handlers provide a stable, independently-testable HTTP contract. All mutations go through them so they can be tested in isolation without mounting the full React tree.
- Prisma is never imported in client components (files with `"use client"`). TypeScript import discipline enforces this.

### 3.5 Prisma / SQLite Layer

Prisma is instantiated as a singleton in `lib/prisma.ts` to avoid connection exhaustion in Next.js development mode (hot reload creates new module instances).

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

The database file lives at `prisma/dev.db`. Migrations are tracked in `prisma/migrations/`. SQLite WAL mode produces sidecar files `dev.db-wal` and `dev.db-shm` — all three must be in `.gitignore`.

---

## 4. Data Model

One primary entity: `DebtItem`.

```prisma
model DebtItem {
  id             String    @id @default(cuid())
  title          String
  priority       Priority  @default(P2)
  status         Status    @default(OPEN)
  source         String?
  notes          String?
  resourceLink   String?
  resolution     String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  resolvedAt     DateTime?
}

enum Priority {
  P1
  P2
  P3
}

enum Status {
  OPEN
  IN_PROGRESS
  RESOLVED
}
```

`resourceLink` is stored on the item but only shown/editable in the UI when status is `IN_PROGRESS` (FR-012). `resolution` is required (non-empty) for the resolve transition. `resolvedAt` is set by the resolve Route Handler, not by a client-side timestamp.

---

## 5. Status Transition Rules

As decided in ADR-006:

```
OPEN ──────────────────► IN_PROGRESS
OPEN ──────────────────► RESOLVED  (skip In Progress — allowed)
IN_PROGRESS ───────────► OPEN      (revert)
IN_PROGRESS ───────────► RESOLVED  (standard resolution path)
RESOLVED ──────────────► (nothing — terminal state)
```

The Route Handler at `app/api/items/[id]/resolve/route.ts` enforces:
1. Item is not already RESOLVED (reject if so)
2. Resolution body is non-empty (reject if whitespace-only)

The PATCH handler at `app/api/items/[id]/route.ts` enforces:
1. Target status is not RESOLVED (direct status field PATCH to RESOLVED is rejected — resolution only via the dedicated endpoint)
2. Transition from RESOLVED to any state is rejected

---

## 6. API Contract Summary

All routes return `application/json`. Error responses use standard HTTP status codes with a `{ error: string }` body.

**Standard error codes used across all routes:**
- `400` — malformed request body (unparseable JSON, wrong content-type)
- `404` — item ID not found
- `422` — validation failure (constraint violated but body is well-formed)

### POST /api/items
Creates a new debt item.

Request body:
```json
{
  "title": "string (required, non-empty, max 300 chars)",
  "priority": "P1 | P2 | P3 (optional, default P2)",
  "source": "string (optional, max 500 chars)"
}
```
Response: `201 Created` with the created `DebtItem`.
Errors: `422` if title is empty or exceeds 300 chars; `422` if source exceeds 500 chars.

### GET /api/items
Returns all items. Supports optional `?status=OPEN|IN_PROGRESS|RESOLVED` query param.

Response: `200 OK` with array of `DebtItem`, sorted by priority then `createdAt` ascending.

### GET /api/items/:id
Returns a single item by ID.
Errors: `404` if item not found.

### PATCH /api/items/:id
Updates mutable fields: `title`, `priority`, `status` (OPEN↔IN_PROGRESS only), `source`, `notes`, `resourceLink`.
`resourceLink`, when provided, must begin with `http://` or `https://` — enforced server-side.
Errors: `404` if not found; `422` if attempting to set `status: RESOLVED` directly; `422` if attempting any transition out of `RESOLVED`; `422` if title exceeds 300 chars; `422` if source exceeds 500 chars; `422` if resourceLink does not begin with `http://` or `https://`.

### POST /api/items/:id/resolve
Resolves an item.

Request body:
```json
{ "resolution": "string (required, non-empty after trim)" }
```
Sets `status: RESOLVED`, `resolvedAt: now()`, `resolution: body.resolution`.
Errors: `404` if not found; `422` if item is already RESOLVED; `422` if resolution is empty or whitespace-only.

### GET /api/dashboard
Returns aggregate metrics:
```json
{
  "openCount": number,         // items with status OPEN or IN_PROGRESS
  "resolvedLast7Days": number,
  "resolvedLast30Days": number,
  "oldestOpenItem": { "id": string, "title": string, "createdAt": string } | null
  // oldestOpenItem: earliest createdAt among OPEN or IN_PROGRESS items
}
```

---

## 7. Rendering Strategy

| Page | Initial render | Dynamic updates |
|---|---|---|
| Dashboard | Server Component reads Prisma directly for initial metric values | Client refetches via `/api/dashboard` after any resolution action |
| Backlog | Server Component reads Prisma directly for initial item list | Client manages filter state and refetches via `/api/items?status=` |
| Item detail | Server Component reads Prisma directly for item data | Client posts to `/api/items/:id/resolve` or PATCH to `/api/items/:id` |

The Server Component initial render avoids any client-side loading state for the first paint. Client components then take over for interactivity.

---

## 8. Directory Structure

```
learning-debt-tracker/
├── app/
│   ├── page.tsx                    # Dashboard (Server Component)
│   ├── layout.tsx                  # Root layout
│   ├── backlog/
│   │   ├── page.tsx                # Backlog list (Server Component)
│   │   └── [id]/
│   │       └── page.tsx            # Item detail (Server Component)
│   └── api/
│       ├── items/
│       │   ├── route.ts            # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts        # GET, PATCH, DELETE
│       │       └── resolve/
│       │           └── route.ts    # POST resolve
│       └── dashboard/
│           └── route.ts            # GET metrics
├── components/
│   ├── CaptureForm.tsx
│   ├── BacklogList.tsx
│   ├── ItemCard.tsx
│   ├── FilterBar.tsx
│   ├── ResolutionForm.tsx
│   └── DashboardMetrics.tsx
├── lib/
│   └── prisma.ts                   # Prisma singleton
├── prisma/
│   ├── schema.prisma
│   ├── dev.db                      # SQLite file (gitignored)
│   └── migrations/
└── types/
    └── index.ts                    # Shared TypeScript types
```

---

## 9. Architectural Decisions (ADRs)

| ADR | Decision | Rationale |
|---|---|---|
| ADR-001 | Single deployable monolith | No service boundary justification for a single-user local tool |
| ADR-002 | Next.js App Router | Current standard; Server Components reduce client bundle for read-heavy pages |
| ADR-003 | SQLite via Prisma | Zero infrastructure, type-safe queries, migration management |
| ADR-004 | Server-side DB access via Route Handlers | Enforces clean server/client boundary; independently testable API |
| ADR-005 | No authentication | Single user, local only — OS is the access control |
| ADR-006 | Open→Resolved allowed | Avoids mandatory In Progress friction; resolution ritual is the value, not state sequence |

Full ADR text in `docs/adr/`.

---

## 10. Known Accepted Risks

The following are intentional design choices for a local single-user tool, not oversights. They would need revisiting if the app were ever served remotely.

| Risk | Accepted because | Mitigation if context changes |
|---|---|---|
| No CORS headers | Same-origin by construction (browser and server both on localhost:3000) | Add `cors` middleware if serving remotely |
| No authentication | OS user account is the access boundary; single user | ADR-005 — revisit if exposed via ngrok or similar |
| No rate limiting | No external attacker surface; single user | Add middleware if exposed remotely |
| No input sanitization beyond Prisma | Prisma uses parameterized queries (no SQL injection risk); React escapes output (no XSS risk); no `dangerouslySetInnerHTML` usage permitted | Audit if raw SQL or HTML rendering is ever introduced |
| No TLS | localhost only — TLS provides no security benefit on loopback | Add reverse proxy with TLS if serving remotely |
| SQLite single-writer | Single user by design — no concurrent write scenario | Migrate to Postgres with connection pooling if multi-user |

---

## 11. Non-Functional Traceability

| NFR | Architectural mechanism |
|---|---|
| NFR-001 (Capture <10s) | Server Components for first render; Route Handler for item creation — no client-side DB roundtrip |
| NFR-002 (Page load <2s) | Server Component SSR; Prisma indexed queries on priority + createdAt |
| NFR-003 (No data loss) | SQLite ACID guarantees on clean shutdown; `resolvedAt` set server-side |
| NFR-004 (Data minimization) | No telemetry imports, no analytics, no external fetch at runtime |
| NFR-005 (Keyboard-first) | CaptureForm autofocuses title on mount; form submits on Enter; filter controls use keyboard events |
| NFR-006 (Maintainability) | App Router + TypeScript + Prisma; no additional state library unless needed |
| NFR-007 (DB not exposed) | Prisma never imported in client components; `app/api/` is the only boundary |
