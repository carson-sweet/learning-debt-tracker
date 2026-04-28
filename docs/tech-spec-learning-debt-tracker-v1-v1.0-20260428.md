---
title: Learning Debt Tracker v1 — Tech Spec
version: 1.0
status: draft
author: Carson Sweet
assisted_by: Claude Code + SweetClaude (John Wick mode)
date: 2026-04-28
generated: autonomous
---

# Learning Debt Tracker v1 — Tech Spec

## 1. Repo and Source Control

**Structure:** Single monorepo. One Next.js project — no separate packages, no workspace tooling needed.

**Platform:** GitHub.

**Branching strategy:** Feature branches off `main`. Short-lived branches per story (see §6). Direct merges to `main` via PR after tests pass.

**PR workflow:** One PR per issue/story. PR must have green CI (lint, typecheck, tests) before merge. Squash-merge to keep `main` history clean.

---

## 2. Local Development Setup

This app runs locally only. There is no staging or production environment.

### Prerequisites

- Node.js 18+ (tested on Node 20 LTS)
- npm 9+

### First-time setup

```bash
git clone <repo>
cd learning-debt-tracker
npm install
npx prisma migrate dev --name init
npm run dev
```

Open `http://localhost:3000`.

### Daily workflow

```bash
npm run dev        # Start dev server (hot reload)
npx prisma studio  # Optional: browse/edit SQLite data via browser UI
```

### Environment variables

The app has no required environment variables. An `.env` file at the project root is used only for Prisma's `DATABASE_URL`:

```
DATABASE_URL="file:./prisma/dev.db"
```

This file is committed as `.env.example` and gitignored as `.env`. The default value is correct for local development.

### Toolchain

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 14+ | App framework |
| TypeScript | 5+ | Type safety |
| Prisma | 5+ | ORM + migrations |
| ESLint | 8+ | Linting (`next/core-web-vitals` config) |
| Prettier | 3+ | Code formatting (optional, project preference) |
| Vitest | 1+ | Unit and integration test runner |
| Playwright | 1.40+ | End-to-end tests for acceptance criteria |

---

## 3. Environments

This is a local-only tool. There is no deployment, no staging environment, and no production infrastructure.

| Environment | Purpose | How to run |
|---|---|---|
| Local dev | Daily development and testing | `npm run dev` |
| Local test | CI and pre-commit test runs | `npm run test` |

The SQLite database file at `prisma/dev.db` serves both environments. Tests use an in-memory SQLite database (`:memory:`) via a separate test-scoped Prisma client configured in `vitest.setup.ts`.

**No environment promotion chain.** There is no staging → production deploy. The app is considered "shipped" when it runs correctly on the developer's machine.

---

## 4. CI/CD

### CI pipeline (GitHub Actions)

Runs on every PR and on every push to `main`.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, 'learning-debt-tracker-v1']
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
```

### Scripts (package.json)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

### No CD pipeline

There is no automated deployment. The app is never pushed to a server.

---

## 5. Hosting Architecture

```
Developer's machine
├── Terminal: npm run dev
│     └── Next.js dev server (port 3000)
│           ├── Server Components → direct Prisma reads
│           ├── Route Handlers (app/api/) → Prisma mutations
│           └── Client Components → fetch() to Route Handlers
│
├── Filesystem: prisma/dev.db (SQLite)
│
└── Browser: http://localhost:3000
```

No external services. No CDN. No load balancer. No DNS. No TLS (localhost only).

---

## 6. Branch and Issue Strategy

Each user story is an issue. Each issue gets a feature branch.

**Branch naming:** `{issue-number}-{story-slug}`
Examples: `1-capture-title-only`, `13-write-self-explanation-to-resolve`

**Merge strategy:** Squash merge to `main` (feature branch → main, no intermediate branch).

**Issue tracking:** Local issue list at `.sweetclaude/state/issue-list.md` (not GitHub Issues).

---

## 7. Authentication

None. See ADR-005.

No login screen, no session management, no user table. All requests to `localhost:3000` are trusted as coming from the legitimate user.

---

## 8. Test Strategy

### Test runner: Vitest + Playwright

| Layer | Tool | What it tests |
|---|---|---|
| Route Handlers (API) | Vitest + in-memory SQLite | HTTP request → response, business rules, status transitions |
| Components | Vitest + Testing Library | Interactive behavior, accessible attributes, keyboard navigation |
| End-to-end | Playwright | Full user flows (capture → backlog → resolve) |

### Database isolation for tests

Tests that touch the database use a test-scoped Prisma client pointing to `:memory:` SQLite. The test setup file (`vitest.setup.ts`) creates a fresh schema before each test suite and tears it down after.

```typescript
// vitest.setup.ts
import { execSync } from 'child_process'
import { beforeAll, afterAll } from 'vitest'

beforeAll(() => {
  process.env.DATABASE_URL = 'file::memory:?cache=shared'
  execSync('npx prisma migrate deploy', { env: process.env })
})

afterAll(() => {
  // in-memory DB is destroyed automatically
})
```

### Test file locations

```
__tests__/
├── api/                  # Route Handler integration tests
│   ├── items.test.ts
│   ├── items-resolve.test.ts
│   └── dashboard.test.ts
├── components/           # Component tests (Testing Library)
│   ├── CaptureForm.test.tsx
│   ├── BacklogList.test.tsx
│   ├── ResolutionForm.test.tsx
│   └── ...
└── e2e/                  # Playwright tests (generated from Gherkin)
    ├── capture.spec.ts
    ├── backlog.spec.ts
    ├── resolution.spec.ts
    └── ...
```

### Accessibility testing

Component tests must assert `aria-*` attributes and keyboard behavior per story acceptance criteria. `@testing-library/user-event` is used for keyboard interaction simulation. Playwright's `page.keyboard` is used for e2e keyboard flow tests.

---

## 9. Monitoring and Observability

Not applicable for a local development tool.

**Logging:** Next.js development server logs to stdout via `console`. No structured logging library, no log aggregation, no retention policy.

**Error handling:** Unhandled Route Handler errors return `500` with `{ error: "Internal server error" }`. Development mode surfaces Next.js error overlays.

**No uptime monitoring.** The app is not monitored — it runs when the developer runs it.

---

## 10. Scaling

Not applicable. Single user, single machine, SQLite single-writer model.

If the app were ever served remotely (e.g., via `ngrok` for demo purposes), the following would need revisiting:
- ADR-005 (no auth) becomes a security concern
- SQLite concurrent write limits would require connection pooling or a migration to Postgres
- CORS policy would need to be configured

These are explicitly out of scope for v1 per ADR-005.

---

## 11. Compliance Requirements

**Framework applied: `gdpr_floor` (data minimization baseline)**

| Requirement | Implementation |
|---|---|
| Collect only data necessary for the stated purpose | Data model stores: title, priority, status, source, notes, resourceLink, resolution, timestamps. No telemetry, analytics, or behavioral tracking. |
| No data transmission to external services | All data stays in `prisma/dev.db` on the local filesystem. `npm run build` produces no external API calls. No third-party SDKs included. |

No GDPR, HIPAA, PCI-DSS, or COPPA obligations apply (local single-user tool, no PII, US geography only).

---

## 12. Key Type Definitions

Shared TypeScript types used across the app boundary:

```typescript
// types/index.ts

export type Priority = 'P1' | 'P2' | 'P3'
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

export interface DebtItem {
  id: string
  title: string
  priority: Priority
  status: Status
  source?: string
  notes?: string
  resourceLink?: string
  resolution?: string
  createdAt: string       // ISO 8601
  updatedAt: string       // ISO 8601
  resolvedAt?: string     // ISO 8601, set on resolution
}

export interface CreateItemRequest {
  title: string
  priority?: Priority     // defaults to P2
  source?: string
}

export interface ResolveItemRequest {
  resolution: string      // required, non-empty after trim
}

export interface DashboardMetrics {
  openCount: number
  resolvedLast7Days: number
  resolvedLast30Days: number
  oldestOpenItem: { id: string; title: string; createdAt: string } | null
}
```

---

## 13. Decisions Not Made Here

The following are implementation details left to the implementer:

- Specific UI library or component primitives (plain HTML + CSS is acceptable)
- CSS approach (CSS modules, Tailwind, or plain global CSS)
- Specific `aria-*` implementation details beyond what stories specify
- Next.js server-side caching strategy (React cache, `revalidatePath`, etc.) — keep simple for v1
