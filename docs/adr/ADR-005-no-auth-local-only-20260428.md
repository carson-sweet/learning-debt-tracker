---
title: ADR-005 — No Authentication, Local Only
date: 2026-04-28
status: Accepted
---

# ADR-005: No Authentication, Local Only

**Date:** 2026-04-28
**Status:** Accepted

## Context

The app is single-user by design. There is no concept of "another user" to protect data from. Adding an authentication layer would add complexity (session management, token storage, password hashing) with no security benefit.

## Decision

No authentication. No session management. The app is served on localhost and assumed to be accessible only to the person running it. The only access control is the operating system's user account.

## Rationale

Auth complexity is the primary reason simple personal tools become unmaintainable. For a local tool with one user, the threat model does not include unauthorized access via the app's own auth layer. The OS provides sufficient access control.

## Consequences

- No login screen, no user table, no session tokens
- The app assumes all requests to localhost are from the legitimate user
- This decision is explicitly in scope (discovery out-of-scope list: "User accounts or authentication of any kind")
- If the app is ever served remotely (e.g., via ngrok), this decision would need to be revisited

## Alternatives Considered

- **Simple password gate:** Rejected — adds friction and false security. If the file system is accessible, the database is accessible regardless of an app-level password.
- **OS-level auth only:** This is the accepted approach.
