# Learning Debt Tracker

A local, single-user web app for tracking concepts you got unblocked on via AI but didn't fully understand. Captures "learning debt" items, manages a priority-ordered backlog, and requires a self-written explanation to close each item.

## Key directories

- `src/` — Next.js app source
- `docs/` — Product docs, plans, specs
- `.sweetclaude/` — SweetClaude state, artifacts, traceability
- `strategy/` — Research, competitive analysis, positioning

## Stack

- Next.js (App Router)
- SQLite via Prisma
- Runs locally — no deployment required

## Build / test commands

```bash
# TODO: fill in after scaffold
npm run dev
npm run build
npm test
```

## Project rules

- Capture flow must complete in under 10 seconds — never add friction to this path
- Self-written resolution is required to close a debt item — this is the core learning mechanism
- No AI content generation in the app
- No auth, no cloud, no external integrations in v1

## SweetClaude

- Phase tracking, TDD enforcement, and artifact management are active for this project
- Run `/sweetclaude:status` to see current phase and open items
- Run `/sweetclaude:help` for available commands

## Distribution

This project runs locally. No credentials, API keys, or user data should be committed.
