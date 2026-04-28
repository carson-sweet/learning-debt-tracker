# Learning Debt Tracker v1 — Issue List

Generated at IP6. All issues start as `pending`. Implemented one at a time in IM1.

---

## ISS-001: App scaffold

**Status:** pending  
**Stories:** all  
**Scope:** Next.js app directory structure, layout.tsx, home page shell, tailwind config, Prisma migration

Files to create:
- `next.config.js`
- `tailwind.config.ts`
- `postcss.config.js`
- `tsconfig.json`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `prisma/migrations/` (run `prisma migrate dev --name init`)

---

## ISS-002: Items list and create API

**Status:** pending  
**Stories:** US-001, US-002, US-003, US-006, US-007  
**Scope:** Route handler at `app/api/items/route.ts`

Contracts:
- `POST /api/items` — validate title (required, ≤ 300 chars), source (≤ 500 chars), priority (P1/P2/P3 default P2). Returns 201 with created item. 422 for constraint violations, 400 for malformed JSON.
- `GET /api/items` — filter by `?status=OPEN|IN_PROGRESS|RESOLVED|ALL` (default OPEN). Sort: P1 > P2 > P3, then oldest-first. 400 for unrecognized status value.

---

## ISS-003: Item operations API

**Status:** pending  
**Stories:** US-008, US-009, US-010, US-011, US-012  
**Scope:** Route handler at `app/api/items/[id]/route.ts`

Contracts:
- `GET /api/items/:id` — return item or 404
- `PATCH /api/items/:id` — update priority, notes, resourceLink, status (OPEN↔IN_PROGRESS only; RESOLVED source is forbidden; attempt to change from RESOLVED → 422). resourceLink must start http:// or https:// (422 otherwise). Returns 200 with updated item. 404 if not found.
- `DELETE /api/items/:id` — delete item or 404

---

## ISS-004: Resolve API

**Status:** pending  
**Stories:** US-013, US-014, US-015  
**Scope:** Route handler at `app/api/items/[id]/resolve/route.ts`

Contracts:
- `POST /api/items/:id/resolve` — body: `{ resolution: string }`. Validate resolution non-empty after trim. Item must be OPEN or IN_PROGRESS (422 if already RESOLVED). Sets status=RESOLVED, resolvedAt=now, saves resolution text. Returns 200 with updated item.

---

## ISS-005: Dashboard API

**Status:** pending  
**Stories:** US-016  
**Scope:** Route handler at `app/api/dashboard/route.ts`

Contracts:
- `GET /api/dashboard` — returns `{ openCount, resolvedLast7Days, resolvedLast30Days, oldestOpenItem }`. openCount = OPEN + IN_PROGRESS. oldestOpenItem = earliest createdAt among OPEN/IN_PROGRESS, or null.

---

## ISS-006: Capture and backlog UI

**Status:** pending  
**Stories:** US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-011  
**Scope:** Components `CaptureForm` and `BacklogList`, wired into `app/page.tsx`

Components:
- `components/CaptureForm.tsx` — title input (auto-focus), priority selector (P1/P2/P3 default P2), source field (maxlength=500), keyboard submit on Enter, loading state, double-submit prevention, onSuccess callback, error preservation
- `components/BacklogList.tsx` — filter controls (Open/In Progress/Resolved/All), sorted list, priority badge, status badge, age indicator, inline priority selector, Mark In Progress button (OPEN only), empty states

---

## ISS-007: Item detail and dashboard UI

**Status:** pending  
**Stories:** US-009, US-010, US-011, US-012, US-013, US-014, US-015, US-016  
**Scope:** Components `ItemDetail` and `Dashboard`, wired into page routing

Components:
- `components/ItemDetail.tsx` — priority selector (auto-save on change), notes field (save on blur/save button), Mark In Progress / Move back to Open, resource link field (IN_PROGRESS only, http/https validation, opens in `_blank` with `rel="noopener noreferrer"`), Resolve flow (button → textarea with placeholder → Submit Resolution disabled until non-whitespace), read-only resolution display, resolvedAt timestamp, loading + error states
- `components/Dashboard.tsx` — four metrics: openCount, resolvedLast7Days, resolvedLast30Days, oldestOpenItem (null → positive empty state); accessible metric labels
