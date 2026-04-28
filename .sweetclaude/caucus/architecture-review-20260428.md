# Architecture Review Caucus — Learning Debt Tracker v1
**Date:** 2026-04-28
**Step:** DS4
**Scope:** Architecture document, tech spec, contract analysis, compliance context
**Question:** Does this architecture correctly handle the service's compliance obligations, service contracts, and failure modes? What will break first in production?
**Turns:** 3

---

## Committee Profiles

### Marcus Osei — Principal Architect, Thoughtworks
15 years distributed systems. Has designed service meshes for financial institutions and event-driven pipelines for logistics platforms. Strong opinions on interface contracts — believes every "we'll figure it out" in a design is a future incident report. Biased toward over-specifying boundaries rather than under-specifying them. Known for writing 20-page API contract documents when the team asked for "a quick spec."

**Known biases:** Challenges every implicit assumption; sees dual-access patterns as future inconsistency seeds; prefers explicit error shapes over "returns an error."

**Focus areas for this review:** API contract completeness, dual-path DB access, error response specification.

---

### Yuki Tanaka — AppSec Engineer, Trail of Bits
8 years application security, specializing in web APIs and threat modeling. Reads every design for attack surface. Sees trust boundaries others miss. Believes "localhost only" is a description of intent, not a security guarantee. Known for finding SSRF vulnerabilities in products that "don't make external calls."

**Known biases:** Treats every unvalidated input as a potential injection point; skeptical of "single user, trust everything" threat models; always asks "what if this runs somewhere it's not supposed to?"

**Focus areas for this review:** Input validation gaps, unbound field lengths, rendered content safety, accepted-risk documentation.

---

### Priya Venkataraman — SRE, Stripe
9 years reliability engineering. Frames every design question as "what does this look like at 3am when it's broken?" — for this project, "3am" is "Sunday night when the app stops working." Believes undocumented failure modes are future mysteries. Has strong opinions on first-run developer experience after seeing too many "works on my machine" incidents.

**Known biases:** Flags missing runbooks; insists on troubleshooting documentation; believes `postinstall` scripts are the most underused developer experience tool; skeptical of "ACID guarantees" claims that don't account for dirty shutdowns.

**Focus areas for this review:** First-run failure scenarios, WAL file management, test isolation reliability in CI.

---

### Dmitri Sorokin — Former Prisma Core Contributor, Independent Consultant
7 years SQLite internals and ORM behavior analysis. Contributed to Prisma's connection management and migration tooling. Knows every edge case of Prisma in Next.js dev mode, WAL mode behavior under stress, and the precise semantics of `file::memory:?cache=shared` across different process configurations.

**Known biases:** Assumes developers underestimate SQLite's complexity; believes `cache=shared` is the most misunderstood feature in SQLite; has opinions on `postinstall` scripts that conflict with Priya's.

**Focus areas for this review:** Prisma singleton correctness, in-memory test isolation semantics, WAL edge cases.

---

## Turn 1 — Initial Reactions

**Proctor framing:** Each panelist gives first impressions on the full design set. Flag concerns independently before cross-examination begins. Question: *What in this design worries you, and what will break first?*

---

**Marcus Osei:**

The architecture is intentionally minimal, and for the stated scope — a local, single-user hobby tool — minimal is correct. I won't argue for complexity that isn't warranted. What I will flag is one architectural inconsistency that's easy to miss: the design has two access paths to the database. Server Components read from Prisma directly. Route Handlers handle all mutations and also offer reads via the API. These are not symmetric. If any cross-cutting concern ever needs to apply to database reads — caching, timing, audit logging, even just request-scoped logging — the Server Component path will need to be retrofitted separately. For now, this is fine. But it's worth naming explicitly rather than letting it be discovered during implementation.

The resolution endpoint separation is exactly right. Having a dedicated `POST /api/items/:id/resolve` endpoint rather than allowing `PATCH /api/items/:id` to set `status: RESOLVED` is the correct pattern for enforcing a business rule at the API boundary. My one complaint is that the contract says the PATCH handler "rejects" invalid status transitions, but doesn't specify the HTTP status code or error message. A 422 with a structured body is the correct answer, and I'd want it specified before the test writer generates tests that assert against an underdefined behavior.

---

**Yuki Tanaka:**

The threat model for localhost is genuinely different from a deployed service, and the architecture correctly scopes itself to localhost-only. I'm not going to manufacture risks that don't exist for a local single-user tool. What I will flag are the *documented accepted risks* that should be named more explicitly.

First: the data model has `title String` with no length constraint. In Prisma's SQLite mapping, an unbound `String` is stored as SQLite `TEXT`, which has no practical limit. The stories specify a 500-character max for `source` but nothing for `title`, `notes`, or `resolution`. For a local tool where you're the only writer, submitting a 10MB resolution text only hurts yourself — but a malformed payload could cause rendering issues in the UI if the component doesn't handle extremely long strings gracefully. This is low-risk but should be a noted implementation decision rather than a silent default.

Second: the contract analysis correctly identifies that the `/resolve` endpoint enforces non-empty resolution text. But the API contract spec doesn't say what HTTP status is returned when validation fails. The architecture mentions `{ error: string }` as the error shape but is silent on which status codes map to which conditions. This is the same concern Marcus raised from a different angle — the contract needs to be complete to generate deterministic tests.

---

**Priya Venkataraman:**

My first question when reading a new design is: what happens to a developer who clones this repo fresh and types `npm run dev` without reading the README? For this app, the answer is: Next.js starts, the browser opens, the first database query fires, Prisma throws a `P1003: Database does not exist` or schema validation error, and the browser shows a 500 error. The terminal shows a cryptic Prisma stack trace. The developer has no idea what happened.

The fix is `prisma generate` in the `postinstall` script. This is not the same as running migrations — `prisma generate` is idempotent and just regenerates the TypeScript types. The CI workflow already runs it explicitly, which means the CI knows you need it. Bring it into `package.json` where everyone else can benefit.

The second concern is the WAL file. The architecture says "SQLite ACID guarantees on clean shutdown." This is true for `Ctrl+C` on `npm run dev`. It is not true for `kill -9`, a machine crash, or a battery death mid-write. SQLite WAL mode will recover automatically on next startup — but the recovery sometimes leaves `dev.db-wal` and `dev.db-shm` files on disk, and if those are accidentally committed to git or deleted manually, you get a corrupted or inconsistent database. The `.gitignore` should explicitly list `*.db-wal` and `*.db-shm` — the architecture mentions `dev.db` is gitignored but is silent on the WAL files.

---

**Dmitri Sorokin:**

The Prisma singleton pattern in `lib/prisma.ts` is correct. I've reviewed enough Next.js codebases to know that teams not doing this hit "too many clients" warnings in hot reload within their first hour of development. The implementation uses `globalThis` as the storage key, which is the correct approach for Next.js where module-level singletons are reset on every hot reload but `globalThis` persists for the process lifetime.

However, I need to flag the test isolation strategy, because `file::memory:?cache=shared` has semantics that the tech spec doesn't fully account for. The `cache=shared` qualifier in SQLite's URI means the in-memory database is shared across all connections *within the same process* that use the same cache name. When Vitest runs with its default `threads` pool, all test workers run as threads in the same process — so they share the in-memory database, even across test files. This will cause race conditions if tests run concurrently, which is Vitest's default behavior.

The solution is either: (a) set `pool: 'forks'` in `vitest.config.ts`, which gives each worker its own process and therefore automatic DB isolation, or (b) generate a unique cache name per worker (e.g., `file::memory:?cache=test-${process.env.VITEST_WORKER_ID}`). The tech spec's `vitest.setup.ts` example will work correctly with `forks` pool — each fork gets its own in-memory DB regardless of the cache name. But this needs to be explicit. Right now the tech spec shows the setup code without specifying the pool configuration, and a developer who doesn't know this will hit intermittent test failures in CI.

---

**Proctor Synthesis — Turn 1**

*Position tally:*
- Architecture appropriateness: all four endorse minimal design for the scope
- Most significant gap: **Vitest pool configuration** (Dmitri — `cache=shared` + parallel workers = race conditions)
- Secondary gaps: **API error contract incompleteness** (Marcus + Yuki, independently), **WAL file gitignore** (Priya), **first-run migration experience** (Priya)

*Key themes:*
The architecture is appropriate. No panelist is arguing for more complexity. The technical risks identified are all implementation-level gaps rather than design flaws. The highest-priority finding is the Vitest thread-pool + `cache=shared` interaction — it's the most likely source of CI test failures during the implementation phase.

*What shifted:* The security framing was immediately scoped to "known and accepted" — Yuki's concerns are documentation gaps, not threat mitigations.

*Open questions entering Turn 2:*
- Is the `cache=shared` issue as serious as Dmitri claims, or does Vitest's default behavior provide isolation by some other mechanism?
- Is the dual-path Prisma access (Server Components direct + Route Handlers) a real concern worth flagging in the architecture, or over-specification for this scope?

---

## Turn 2 — Deep Dive

**Proctor framing:** Respond to at least one other panelist's Turn 1 statement. Focus the deep dive on the two open questions: (1) `cache=shared` + parallel workers, (2) whether dual-path Prisma access warrants a note. Additionally: what is the most concrete change the tech spec needs before tests are written?

---

**Marcus Osei:**

Dmitri's `cache=shared` concern is the highest-priority finding in this review. I want to be specific about why: the problem isn't that the test isolation strategy is wrong — it's that the tech spec specifies the *setup code* without specifying the *vitest configuration that makes the setup code work correctly*. A developer implementing this will copy the `vitest.setup.ts` snippet, run `vitest`, and get intermittent failures. The fix is one line in `vitest.config.ts` — `pool: 'forks'` — and it should be in the tech spec alongside the setup code.

On my Turn 1 dual-path Prisma concern: I've reconsidered its severity. For a single-user local tool with no cross-cutting requirements and no audit obligations, having Server Components read directly from Prisma is a reasonable choice. The contract is: mutations go through Route Handlers, reads can use either path. As long as this is explicitly documented as a known asymmetry (not an oversight), it's acceptable. I'd add one sentence to the architecture under section 3.4: "Server Components use Prisma directly for read-only initial renders. All mutations and client-driven reads go through Route Handlers. This asymmetry is intentional — the Route Handler layer enforces business rules for writes; Server Components are read-only and have no business rule enforcement responsibility."

The PATCH endpoint error contract: the architecture needs to specify that invalid status transitions return `422 Unprocessable Entity` with `{ error: "Invalid status transition: {from} → {to}" }`. This is not over-specifying — it's what the test writer needs to generate a test that asserts correct rejection behavior. Right now the contract says "rejects" which is not testable.

---

**Yuki Tanaka:**

I want to agree with Marcus on the `422` specification, and add one more endpoint that has the same gap: `POST /api/items/:id/resolve` should specify what HTTP status is returned when the resolution text is empty/whitespace-only. The architecture says "rejects" — but is it a `400 Bad Request` or a `422`? For consistency I'd say `422` for all validation failures, `400` for malformed request bodies (unparseable JSON), and `404` for not-found items. The contract analysis lists these endpoints in the risk surface table but doesn't specify error codes, which means the test writer will have to guess.

I want to address Marcus's dual-path concern from a security angle: he's right to let it go for this scope. The only scenario where Server Component direct Prisma access creates a problem is if Server Components start doing writes (they shouldn't) or if the Prisma instance gets shared with a context that has broader permissions than intended (impossible given there are no permissions in this app). So for localhost/single-user: non-issue.

On the `resolution` field length: I mentioned title length in Turn 1, but the more interesting case is `resolution`. The user writes a self-explanation to close an item — this is core product behavior. There's no upper bound specified. A user could write a 10,000-word resolution, which is fine for the product (more learning = better), but the textarea in `ResolutionForm` should allow this. The stories don't specify a max length for resolution text, and I'd recommend keeping it unbound at the server level while allowing the UI to set a reasonable `rows` attribute for usability.

---

**Priya Venkataraman:**

On the `cache=shared` thread-pool issue: Dmitri is right, and I want to make the fix concrete. Here is what needs to go into the tech spec as a configuration requirement:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: 'forks',
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

With `pool: 'forks'`, each worker is a separate process. `file::memory:?cache=shared` within that process gives a private in-memory DB to that worker only. No cross-worker contamination. The `vitest.setup.ts` code in the tech spec is then correct as written.

Responding to Dmitri's nuance from Turn 1: his observation that `cache=shared` doesn't actually share across OS process boundaries is technically correct, which means the risk is specifically the `threads` pool. Since `threads` is Vitest's default, and the tech spec doesn't mention `forks`, a developer following the tech spec will hit this. Adding the `vitest.config.ts` snippet above to the tech spec resolves it completely.

My remaining concern is the `postinstall` script. The CI workflow in the tech spec runs `npx prisma generate` explicitly. The local setup instructions also mention it in the first-time setup steps. But `package.json` `postinstall` would catch the "forgot to run setup" case automatically. The only reason not to add it is if `prisma generate` has side effects in certain environments (it downloads the Prisma engine binary on first run, which requires network access). For a CI environment or a developer machine this is fine. I'll note it as a recommendation rather than a requirement.

---

**Dmitri Sorokin:**

Priya's `vitest.config.ts` snippet is exactly right. I want to clarify my Turn 1 nuance because I may have made it sound more complex than it is: the short version is "use `pool: 'forks'`, done." The `cache=shared` mechanics are a detail; the fix is a single config line.

I want to raise one more SQLite-specific concern that hasn't been mentioned: the architecture says `createdAt DateTime @default(now())` and `resolvedAt DateTime?`. In SQLite via Prisma, `DateTime` is stored as ISO-8601 strings or Unix timestamps depending on the Prisma version and configuration. Prisma 5's default for SQLite is to store `DateTime` as `REAL` (Unix timestamp) or `TEXT` (ISO-8601) depending on the operation. The dashboard query that computes "resolved in the last 7 days" does a date comparison against `resolvedAt`. If `resolvedAt` is stored as `TEXT` (ISO-8601), the comparison `resolvedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)` will work correctly in Prisma's query builder because Prisma handles the conversion. But if a developer writes a raw SQL query (using `prisma.$queryRaw`), they'd need to know the storage format.

The architecture and contract analysis correctly note that dashboard windows are "computed at query time" via Prisma's query builder — this is the right choice. The recommendation: the tech spec should add a note that raw SQL queries on `DateTime` fields must use Prisma's date utilities, not string comparisons, to avoid storage-format ambiguity.

---

**Proctor Synthesis — Turn 2**

*Position tally:*
- `pool: 'forks'` required in vitest config: unanimous (Dmitri raised, Priya gave the fix, Marcus endorsed, Yuki didn't contest)
- `422` error code for validation failures: Marcus + Yuki both specified; uncontested
- `prisma generate` in `postinstall`: Priya recommends, Dmitri notes caveat (engine download), no strong opposition
- Dual-path Prisma access: Marcus moderated to "acceptable, document it explicitly"; no dissent
- Resolution text length: Yuki says keep unbound at server level, UI should allow it; no dissent
- DateTime raw query caveat: Dmitri raised; narrow concern, uncontested

*What shifted:* The `cache=shared` concern resolved cleanly — it's a configuration omission, not an architectural flaw. The dual-path concern is filed as "known asymmetry, document it" rather than a risk.

*Key uncontested changes entering Turn 3:*
1. Add `vitest.config.ts` with `pool: 'forks'` to tech spec
2. Specify `422` for validation failures in API contract
3. Add explicit `asymmetry` note to architecture section 3.4
4. Add `*.db-wal`, `*.db-shm` to `.gitignore` in tech spec

*Contested items:*
- `postinstall` script: Priya recommends it, Dmitri flags the engine download caveat — mild disagreement

---

## Turn 3 — Final Verdict

**Proctor framing:** Final verdict and specific actionable recommendations, ordered by priority. Each panelist must commit to a position on contested items.

---

**Marcus Osei:**

The architecture is sound. It is correctly sized for the problem. My final verdict: ship it as-is with four additions.

**Recommended additions (ordered by priority):**

1. **`vitest.config.ts` with `pool: 'forks'`** — Required. Without this, test isolation is undefined. One file, one config key.

2. **API contract: specify error HTTP status codes** — Required for deterministic test generation. `422` for validation failures (invalid transition, empty resolution, source over 500 chars). `400` for unparseable request body. `404` for not-found items. Add these to the contract analysis risk surface table.

3. **Architecture section 3.4: document the Server Component / Route Handler asymmetry** — Recommended. One sentence: "Server Components read directly from Prisma for initial page renders; all client-driven reads and all mutations go through Route Handlers. This asymmetry is intentional — Route Handlers enforce business rules for writes."

4. **`source` field 500-char max: enforce server-side in POST /api/items** — Recommended. This is specified in the stories but absent from the API contract. Add it to the contract analysis and the Route Handler specification.

These are all small. None changes the architecture. All prevent implementation ambiguity.

---

**Yuki Tanaka:**

Security verdict: architecture is appropriate for the stated threat model. No changes to the security posture are required. The localhost-only scope correctly identifies and accepts the risks.

**My three final recommendations:**

1. **Add to CLAUDE.md or architecture: `dangerouslySetInnerHTML` is prohibited in this codebase.** One line. Prevents a category of self-inflicted issues. User-supplied content (titles, notes, resolutions) must be rendered via JSX text content, never raw HTML. This is already how React works by default — the recommendation is to make it explicit so no developer adds it "just for rich text" later.

2. **`source` field server-side validation (same as Marcus #4).** The stories specify 500 chars; the API contract doesn't. Close the gap.

3. **Add a `maxLength` attribute to the CaptureForm title input.** Not for security — for UX. The stories don't specify a title length max, and I'm not recommending one be added to the PRD. But the UI input should have a reasonable `maxLength` (I'd say 300 characters) so the capture form doesn't accept a title that will look broken in the backlog.

Item 3 is my only contested recommendation — it's a UI decision that the stories don't specify. I'll note it for the DS6 gate and let the user decide.

---

**Priya Venkataraman:**

Reliability verdict: the architecture handles the "Sunday night it stops working" scenarios adequately, with one documentation gap that needs filling.

**Final recommendations:**

1. **`vitest.config.ts` with `pool: 'forks'`** — Unanimous. Required.

2. **`package.json` `postinstall` for `prisma generate`** — I'm maintaining this recommendation despite Dmitri's engine-download caveat. The caveat applies only on first install in an offline environment, which is not a meaningful constraint for a developer running this locally. Add `"postinstall": "prisma generate"`. This prevents the "TypeScript errors on fresh clone" case.

3. **`.gitignore` additions: `prisma/dev.db-wal` and `prisma/dev.db-shm`** — Required. WAL files should not be committed. The architecture mentions the db file is gitignored; extend this to the WAL sidecar files.

4. **Add a troubleshooting section to the README or CLAUDE.md** covering three scenarios: (a) "database is locked" → delete WAL files, (b) "table does not exist" → run `npx prisma migrate dev`, (c) "TypeScript import errors on Prisma types" → run `npx prisma generate`. These are the three most common first-hour failures. Documenting them upfront saves time.

---

**Dmitri Sorokin:**

SQLite/Prisma verdict: the architecture is correct. The singleton pattern is correct. The migration strategy is correct. The test isolation strategy is correct *with the addition of `pool: 'forks'`*.

**Final recommendations (SQLite/Prisma specific):**

1. **`pool: 'forks'` in `vitest.config.ts`** — Unanimous. The tech spec's `vitest.setup.ts` is correct for this configuration.

2. **`prisma generate` in `postinstall` only, not `prisma migrate dev`** — Priya and I agree on `generate`; I want to explicitly document that `migrate dev` should NOT be in `postinstall`. Migrations are destructive and schema-modifying. Running them automatically on every `npm install` is dangerous if the developer has local schema experiments. The first-time setup instructions should clearly say "run `prisma migrate dev --name init` once, manually." Auto-running it breaks the mental model of migrations as intentional, versioned operations.

3. **`.gitignore` must include `*.db-wal` and `*.db-shm`** — Priya and I agree. Uncontested.

4. **Dashboard date query: use Prisma query builder, not raw SQL** — Narrow but worth noting as an implementation guideline. The spec already implies this; make it explicit.

On Yuki's title `maxLength` recommendation: I'm neutral — it's a UI decision, not a SQLite concern. But I'll note that Prisma will happily accept a 10MB title if the form sends one. If a `maxLength` is desired, it should be enforced both in the UI and in the API handler.

---

**Proctor Final Synthesis**

---

### Position Trajectory

| Panel member | Turn 1 position | Turn 3 position | Shift |
|---|---|---|---|
| Marcus Osei | Dual-path concern + API contract gap | Dual-path acceptable (document asymmetry); API contract gaps must be specified | Moderated; maintained contract concern |
| Yuki Tanaka | Input validation gaps, accepted risks undocumented | Same, +`dangerouslySetInnerHTML` prohibition, +title `maxLength` (contested) | Refined and expanded |
| Priya Venkataraman | First-run experience, WAL gitignore, CI isolation | Same; `postinstall: prisma generate` maintained; added troubleshooting docs | Held positions; added detail |
| Dmitri Sorokin | `cache=shared` thread-pool risk (major) | Risk resolved by `pool: 'forks'`; `migrate dev` must NOT be in postinstall | Major concern resolved to a config line |

---

### Consensus Findings

All four panelists agree on:

1. **`vitest.config.ts` must specify `pool: 'forks'`** — The tech spec is incomplete without it. Without this config, the `file::memory:?cache=shared` test isolation strategy is undefined for parallel workers.

2. **API contract must specify error HTTP status codes** — `422` for validation failures, `400` for malformed body, `404` for not-found. Required for deterministic test generation.

3. **`.gitignore` must include `prisma/dev.db-wal` and `prisma/dev.db-shm`** — WAL sidecar files should not be committed. Extend the existing gitignore entry.

4. **`source` field 500-char max must be enforced server-side** — Specified in stories, absent from API contract and Route Handler spec. Close the gap.

5. **Architecture should document Server Component / Route Handler asymmetry explicitly** — One sentence; prevents the asymmetry from being read as an oversight.

---

### Unresolved Disagreements

**Title `maxLength` UI attribute (Yuki vs. others):**
- Yuki recommends a `maxLength` on the title input (suggested: 300 chars).
- Marcus notes this is a UI detail not in the stories.
- Dmitri notes that if a max is desired, it should be enforced server-side too.
- Priya is neutral.
- **This is a product decision about whether titles should have an upper bound. The stories do not specify one. Recommend escalating to DS6 gate for user decision.**

**`prisma generate` in `postinstall` (Priya for, Dmitri cautious):**
- Priya: add `"postinstall": "prisma generate"` to prevent TypeScript errors on fresh clone.
- Dmitri: agree on `generate`, explicitly oppose `migrate dev` in postinstall.
- Yuki and Marcus: no strong opinion.
- **Consensus: `prisma generate` in `postinstall` is acceptable. `migrate dev` must never be in `postinstall`. Recommend adding to tech spec as a non-disputed recommendation.**

---

### Prioritized Recommendations (by committee support)

| # | Recommendation | Support | Affects |
|---|---|---|---|
| R1 | Add `vitest.config.ts` with `pool: 'forks'` to tech spec | 4/4 | Tech spec §8 |
| R2 | Specify `422`/`400`/`404` error codes in API contract | 4/4 | Architecture §6, contract analysis §1 |
| R3 | Add `*.db-wal` and `*.db-shm` to `.gitignore` in tech spec | 4/4 | Tech spec §2 |
| R4 | Enforce `source` 500-char max in POST /api/items handler spec | 4/4 | Architecture §6, contract analysis §1 |
| R5 | Document Server Component / Route Handler asymmetry in architecture §3.4 | 3/4 (Yuki neutral) | Architecture §3.4 |
| R6 | Add `prisma generate` to `package.json` `postinstall` | 3/4 (Dmitri neutral-positive) | Tech spec §2 |
| R7 | Add troubleshooting section for 3 common failure scenarios | 3/4 (Marcus neutral) | README or CLAUDE.md |
| R8 | Prohibit `dangerouslySetInnerHTML` in codebase (architecture or CLAUDE.md) | 2/4 (Yuki + Dmitri) | Architecture or CLAUDE.md |
| R9 | Add `maxLength` to title input field (UI) | 1/4 (Yuki only) | **Escalate to DS6 — product decision** |

---

### Minority Reports

**Yuki Tanaka — on accepted security risks:**
The accepted security risks for this app (no CORS, no input length enforcement, no auth) are genuinely appropriate for a local single-user tool. My minority position is not that these should be fixed — it's that they should be *named as accepted risks* in a single place in the architecture document. Right now, the risks are scattered across ADRs, the tech spec footnote on scaling, and the contract analysis. A one-paragraph "Known Accepted Risks" section in the architecture, listing these explicitly as intentional design decisions, would make the threat model legible to any future contributor. The architecture as written implies these are oversights rather than choices.

**Dmitri Sorokin — on `migrate dev` automation:**
The tech spec and first-run setup instructions should include a clear warning: `prisma migrate dev` is an interactive, destructive command that should be run manually, not scripted. It is not the same as `prisma generate` or `prisma migrate deploy`. The distinction matters for any developer who has run Prisma in production contexts. Given that the tech spec's CI pipeline uses `prisma generate` only (correctly), the first-time setup instructions should use `prisma migrate dev` for initial schema creation but note explicitly that subsequent runs require developer intent.
