---
title: ADR-001 — Monolith Architecture
date: 2026-04-28
status: Accepted
---

# ADR-001: Monolith Architecture

**Date:** 2026-04-28
**Status:** Accepted

## Context

Learning Debt Tracker is a single-user, local-only application with no deployment infrastructure. There is one user, one machine, and no concurrency requirements. The app handles five feature areas (Capture, Backlog, Triage & Work, Resolution, Dashboard) that all operate on the same SQLite database.

## Decision

Single deployable monolith: one Next.js application containing all UI, API routes, and database access.

## Rationale

A service-oriented architecture would add deployment complexity (multiple processes, inter-service communication, service discovery) with no benefit. There is one user, one data store, and no independent scaling requirements. A monolith is strictly correct here.

## Consequences

- All feature areas share one database connection pool (Prisma singleton)
- Module separation is enforced by code organization conventions, not by service boundaries
- No inter-service communication overhead

## Alternatives Considered

- **Microservices / separate API + frontend:** Rejected — operational overhead with zero benefit for a local single-user app.
