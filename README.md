# Learning Debt Tracker (SweetClaude demo)

This app was created by SweetClaude in John Wick mode as a demonstration. Its purpose is to allow people to see how SweetClaude in John Wick mode operates.

A local, single-user web app for tracking concepts you got unblocked on via AI but didn't fully understand. Capture learning debt fast, manage a priority-ordered backlog, and write a self-explanation to close each item.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![SQLite](https://img.shields.io/badge/SQLite-Prisma-blue) ![Tests](https://img.shields.io/badge/tests-178%20passing-brightgreen)

## What it does

When you're in flow and an AI unblocks you on something you didn't fully understand, you capture it in under 10 seconds. Later, you work through the backlog — adding notes, a resource link, and eventually a self-written explanation that closes the item. No AI-generated resolutions. You write it yourself.

## Getting started

```bash
git clone https://github.com/carson-sweet/learning-debt-tracker.git
cd learning-debt-tracker
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The database is created and migrated automatically on startup. No separate setup step needed.

## Stack

- **Next.js 14** — App Router, React Server Components, Route Handlers
- **Prisma + SQLite** — local file database, zero config
- **Tailwind CSS** — dark theme UI
- **Vitest + React Testing Library** — 178 tests

## Development

```bash
npm run dev        # start dev server (migrates DB automatically)
npm test           # run all tests
npm run typecheck  # TypeScript check
```

## How it works

**Capture** — Title is required, source and priority are optional. Press Enter to save.

**Backlog** — Items sorted by priority (P1 → P3), then age. Filter by status. Click any item to open details.

**Item detail** — Add notes (auto-saved on blur), add a resource link, mark in progress, move back to open.

**Resolve** — Write a self-explanation of what you now understand. Required to close. No AI. No shortcuts.

## Project rules

- Capture must complete in under 10 seconds — no friction on this path
- Self-written resolution is required to close — this is the core learning mechanism
- No AI content generation in the app
- No auth, no cloud, no external integrations

## License

MIT
