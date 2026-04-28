# PRD Review Caucus — Learning Debt Tracker v1
**Date:** 2026-04-28
**Proctor:** John Wick (autonomous)
**Scope:** Does this PRD define a product that solves the stated problem for the stated user, with scope that is achievable and justified?
**Document reviewed:** docs/learning-debt-tracker-v1-prd-draft-v1.0-20260428.md
**Turns:** 3

---

## Committee

### Marcus Chen — PM, "The Pragmatist"
**Title:** VP Product (former), B2B SaaS (Stripe, fintech). 10 years engineering + product.
**Expertise:** Shipped 20+ features from 0→1. Known for ruthless scope discipline. Believes most products die from complexity, not lack of ambition.
**Known biases:** (1) Skeptical of features that "feel obvious" — treats them as scope creep until proven otherwise. (2) Prioritizes functional completeness over UX polish. (3) Defaults to defer-to-v2 on anything not directly tied to the core loop.
**Focus:** FR necessity, scope boundaries, success metric testability.

### Priya Nakamura — UX Researcher
**Title:** Principal UX Researcher, 8 years mixed-methods (developer tooling, diary studies, longitudinal adoption research).
**Expertise:** Ran 3-month diary studies on developer productivity tool adoption. Believes 80% of product failures trace to assumption-based personas, not bad execution.
**Known biases:** (1) Will not accept a persona without behavioral evidence. (2) Over-weights edge cases discovered in user research. (3) Believes capture UX is the only thing that matters in productivity tools — everything else is retention theater.
**Focus:** Capture flow realism, the "resolution as learning" mechanism, access path from unblocking moment to app.

### Dr. Amir Osei — Domain Expert (Cognitive Science / EdTech)
**Title:** Associate Professor, Cognitive Science and Educational Technology, UC San Diego.
**Expertise:** 15 papers on metacognition, self-explanation effects, and spaced practice. Chi et al. self-explanation replication studies. Advisory board, two EdTech startups.
**Known biases:** (1) Believes learning science should drive product design — will flag deviations from evidence. (2) Skeptical of gamification as substitute for pedagogy. (3) Tends to over-specify scientifically optimal approaches that may be impractical.
**Focus:** Self-explanation mechanism soundness, pedagogical scaffolding in the resolution UI, backlog vs. spaced repetition tradeoffs.

### Zoe Harrington — The Skeptic
**Title:** Partner, early-stage venture. Former product strategist. Evaluated 500+ product pitches.
**Expertise:** Specializes in identifying "insight debt" — founders who mistake a personal workflow problem for a market. Persistent challenger of "I have this problem" as product validation.
**Known biases:** (1) "I have this problem" is the weakest product validation. (2) Skeptical of local-only apps — believes they target users who would have solved the problem anyway. (3) Believes motivation is always the real blocker, not capture friction.
**Focus:** Problem reality vs. personal frustration, differentiation from a Markdown file, whether "no auth, local only" is a constraint or a cop-out.

---

## Turn 1 — Initial Reactions

**Proctor:** You've each reviewed the PRD for Learning Debt Tracker v1. Initial reactions: Is the problem real, is the solution appropriate for v1 scope, and are the success metrics sufficient?

---

**Marcus Chen:**

The scope discipline here is genuinely good. Five epics, 19 FRs — lean for a full CRUD application with a meaningful interaction pattern. The explicit cuts (auth, cloud, AI content generation, social features) are the right calls. The capture epic is the correct north star — FR-001 through FR-005 is the magic moment and everything else is recovery.

One flag: FR-014 (store and display the resolution explanation after closure). Who opens a resolved item to re-read their own explanation? The *storage* of the explanation is needed for data integrity and future features. The *display* UI is v2 scope. I'd trim FR-014 to "the system shall persist the resolution explanation" and cut "and display it when the item is viewed."

A softer concern: the P1/P2/P3 priority tier. For a personal tool with a single user, three priority tiers may be overkill. A binary "urgent / not urgent" or even no explicit priority (just age-ordering) might reduce cognitive overhead during the capture moment. Worth flagging but not blocking.

---

**Priya Nakamura:**

I want to address the 10-second capture constraint directly, because I think it's the most important design decision in this PRD and the spec doesn't fully honor it.

FR-004 says: "complete the capture flow in no more than 3 user interactions." The success criterion G1 says: "open the app and save a new item in under 10 seconds from page load." But neither addresses the path from "I was just unblocked by Claude" to "the app is open and loaded." That path involves: switching windows, opening or focusing a browser tab, navigating to localhost:3000 if not already there, and waiting for Next.js to hydrate. That's potentially 8-10 seconds before the user types anything.

The PRD's 10-second promise is aspirational unless it includes an assumption about the app's deployment context. Is this always-on in a browser tab? Is there a keyboard shortcut to focus the capture input? The PRD is silent on this, and it's the most important UX decision in the product.

On FR-013 (required non-empty explanation): I've seen completion theater in diary studies — users write "done" or "ok" to clear the cognitive loop and move on. The PRD notes this in the discovery doc context but doesn't address it in the requirements. A minimum length or a reflective placeholder would help. Not blocking, but this is where the product's core learning mechanism is most at risk.

---

**Dr. Amir Osei:**

The self-explanation effect is among the most replicated findings in cognitive science. Chi, de Leeuw, Chiu, and LaVancher (1994), Renkl (1997), and a 2019 meta-analysis across 64 studies all show that generating explanatory inferences produces significantly better long-term retention than passive review. The product's core mechanism — requiring a written explanation to close an item — is scientifically sound.

My concern is specificity. "Write a brief self-explanation" is not specific enough to reliably activate the effect. The research distinguishes between *monitoring explanations* ("I understand this now") and *elaborative explanations* ("This works because X, which means Y"). The monitoring type shows weaker learning outcomes. A prompting strategy in the resolution UI — even a placeholder text — can shift users toward elaborative explanation without adding friction.

On the backlog vs. spaced repetition question: the PRD correctly excludes SRS scheduling. Priority-ordered backlog is a reasonable v1 approach. But there's a structural risk: P1 items dominate attention, and P3 items accumulate indefinitely. The dashboard's "oldest open item" metric partially addresses this, but the product may benefit from a simple rule — items not touched in 30 days auto-escalate in priority. Not a v1 requirement, but worth flagging as a known gap.

---

**Zoe Harrington:**

I want to name the uncomfortable question: what is this product that a Markdown file with a checkbox system cannot be?

The differentiation claim rests on three features: (1) under-10-second capture, (2) priority backlog, (3) required self-explanation. On (1): a keyboard shortcut appending to a text file is also under 10 seconds. On (2): manual sort order or a frontmatter-based priority field in Obsidian. On (3): this is the only genuine differentiator, and it's a UX constraint, not a feature. You could replicate it with a commit message linter.

My concern isn't that this is a bad idea. My concern is that the PRD doesn't articulate *why this needs to be a web app*. The hypothesis implied by the product is: "people who already have Anki, Obsidian, TIL repos, and Notion available will use this instead because it's purpose-built." That's a behavioral assumption that requires one paragraph of justification. The competitive analysis (which is strong, and lives in a separate doc) isn't pulled through to the problem statement. The PRD needs to say, explicitly, why existing tools fail for the stated user — not abstractly, but concretely.

---

**Proctor — Turn 1 Synthesis:**

**Consensus so far:**
- Core mechanism (required self-explanation) is scientifically sound and represents genuine differentiation
- Scope is appropriately lean; capture-first prioritization is correct
- FR-014 display UI may be v2 scope (Marcus — no disagreement from others)

**Key tensions:**
- Priya: The 10-second constraint is aspirational without an explicit access path assumption
- Zoe: The PRD doesn't pull competitive analysis into the problem statement — differentiation from existing tools is implicit, not stated
- Dr. Amir: Resolution mechanism needs a prompting strategy to activate learning science benefits

**What shifted:** None — first turn positions established.

**Open questions entering Turn 2:**
1. Does the product need an access path assumption (always-on tab, keyboard shortcut)?
2. Should the resolution mechanism include a reflective prompt or placeholder?
3. Does the problem statement need an explicit paragraph naming why existing tools fail?

---

## Turn 2 — Deep Dive on Key Disagreements

**Proctor:** Three threads from Turn 1. Address at least one other person's prior position: (1) Zoe's differentiation challenge — does the PRD justify the web app form factor? (2) Priya's access path concern — what assumption should the PRD make about how users reach the app? (3) Dr. Amir's prompting question — should the resolution mechanism include pedagogical scaffolding?

---

**Marcus Chen:**

Responding to Zoe: The Markdown file analogy is intellectually honest but misses the key value. The product's real differentiator isn't the individual features — it's the opinionated workflow. A Markdown file is infinitely flexible, which means users never converge on a consistent closure ritual. The product's rigidity (required explanation, status transitions, priority tiers) creates the ritual *by constraint*. Obsidian could theoretically do this with plugins — but the moment you open plugin settings, the 10-second constraint is already broken.

That said, Zoe is right that this argument isn't in the PRD. The Executive Summary describes what the app does, not why the form factor justifies itself. The problem statement needs one paragraph: "Existing tools treat learning as a checkbox. This product treats resolution as a ritual — and the ritual requires enforcement that open-ended tools cannot provide by design."

Responding to Priya: The access path issue is real and I missed it. FR-004 says "from app open" — the clock starts at app open, not at moment of unblocking. The PRD should add an assumption to Section 8: "The app is expected to be open in a persistent browser tab while the user is working. The 10-second constraint assumes the tab is already loaded and hydrated." Without this assumption, FR-004 and G1 are aspirational.

---

**Priya Nakamura:**

Responding to Dr. Amir on prompting strategy: I want to push back — not on the science, but on the implementation risk. The resolution moment is when the user finally has clarity. Interrupting that with a structured prompt ("explain the underlying principle, not just the answer") may feel like homework. I've seen this pattern in diary studies — tools that scaffold too aggressively at the point of completion get abandoned precisely because the ritual becomes burdensome.

My recommendation: a reflective placeholder in the textarea, not a required prompt. "What do you understand now that you didn't when you captured this?" is sufficient scaffolding without being coercive. It's a one-line change to the implementation, costs nothing, and may meaningfully shift resolution quality. This should be added to FR-013 as implementation guidance, not a new FR.

Responding to Zoe: The Markdown file comparison is a legitimate stress test, and I think the product passes it — but only on one criterion: the *separation of backlog from resolution ritual* as distinct workflow states. In Obsidian, there is no closure ceremony — you mark a checkbox and the item is done. This product makes resolution a distinct state with a required artifact. That's the differentiator. But Zoe is right that this isn't stated. The problem statement needs this explicitly: "existing tools treat learning as a checkbox; this product treats resolution as a ritual."

---

**Dr. Amir Osei:**

Responding to Priya's pushback on prompting: I accept the pragmatic constraint. The research does show that heavy scaffolding can reduce intrinsic motivation if perceived as burdensome. My revised recommendation: placeholder text only — "What do you understand now that you didn't before?" This is a micro-decision, not a feature. It shifts the user toward elaborative explanation at zero implementation cost and zero friction cost. I'm satisfied with this as the consensus position.

Responding to Marcus and Zoe on the form factor question: I'd go further than "opinionated workflow." The product is a *behavioral intervention*, not an information management tool. Anki, Obsidian, and TIL repos are all information management tools — the user decides when to engage. This product is designed to interrupt the escape hatch (get answer, move on) and install a loop-closure mechanism at the moment of unblocking. That framing belongs in the Executive Summary. Current framing: "a local web application." Proposed framing: "a behavioral intervention that installs a loop-closure mechanism at the moment of AI-assisted unblocking."

This isn't cosmetic. It will ground every subsequent design decision.

---

**Zoe Harrington:**

I'm partially persuaded. The "resolution as ritual, not checkbox" framing is the clearest differentiation argument I've heard, and it's not in the PRD. The Markdown file cannot enforce this distinction. Obsidian with plugins could theoretically enforce it — but doesn't by default, and the setup cost is high enough that users don't bother.

I'm conceding that this is differentiated from a Markdown file in a meaningful way — but only if the product actually enforces the ritual. If the minimum resolution text is one character ("k"), the differentiation disappears. My remaining concern: without a minimum length or a reflective prompt, the resolution gate becomes theater.

On FR-019 and the access path: I agree with Priya and Marcus. The "under 10 seconds" claim needs to be grounded in an assumption about app availability. The simplest honest solution is to add it to the Assumptions section. No new feature needed — just honesty about the deployment model.

My top remaining concern: Section 7 (Out of Scope) should explicitly note the access path limitation. "This product does not solve the problem of instantly accessing the capture UI from any context. It assumes the app is already open. A keyboard shortcut, browser extension, or CLI tool would extend this — those are deferred to a future version." Making the limitation explicit prevents it from becoming a hidden scope item.

---

**Proctor — Turn 2 Synthesis:**

**What shifted:**
- Zoe moved from "not differentiated" to "differentiation is real but not articulated"
- Marcus aligned with Priya on the access path assumption
- Priya and Dr. Amir converged on placeholder text as light scaffolding (no required structured prompt)
- Full committee agrees the Executive Summary needs a behavioral reframe

**Remaining disagreement:**
- Resolution minimum length: Zoe wants a minimum length; Priya prefers placeholder only; Marcus and Dr. Amir haven't committed. This needs a decision at D4.

**Emerging consensus:**
1. Add assumption to Section 8: app is expected to be open in a persistent browser tab
2. Reframe Executive Summary as behavioral intervention, not information management tool
3. Add one paragraph to Problem Statement naming why existing tools fail
4. Add FR-013 implementation note: use reflective placeholder text
5. Add one sentence to Section 7 (Out of Scope) acknowledging the access path limitation

**Open questions entering Turn 3:**
- Resolution minimum length: any non-empty text, 20 characters, or placeholder only?
- Should FR-014 (display resolution text) be cut or kept?

---

## Turn 3 — Final Verdict + Recommendations

**Proctor:** Final turn. Verdict on PRD readiness to advance to story writing, and top recommendation — one specific change that would most improve the PRD before it advances.

---

**Marcus Chen:**

**Verdict: Ready to advance.** The PRD is lean, functional, and appropriately scoped. Success metrics are binary and testable. The five epics map cleanly to the feature set.

**Top recommendation:** Reframe the Executive Summary as a behavioral intervention, not a tool description. One paragraph — two or three sentences — that says: the product's core value is not the capture flow or the backlog; it's the enforcement of a resolution ritual that open-ended tools cannot enforce by design. This paragraph will serve as the north star for every implementation decision downstream.

**Secondary:** Defer the *display* half of FR-014 to v2. Store the explanation (necessary for data integrity). Displaying it is a feature no one needs in v1.

---

**Priya Nakamura:**

**Verdict: Ready to advance.**

**Top recommendation:** Add a single assumption to Section 8 — "The app is expected to be open in a persistent browser tab while the user is working. The 10-second capture constraint assumes the tab is already loaded." Without this, the product's most important success criterion is untestable. One sentence in the Assumptions section closes this gap completely.

On FR-013 resolution placeholder: I'm satisfied with placeholder text as the scaffolding mechanism. The text "What do you understand now that you didn't when you captured this?" should be in the FR as implementation guidance. Minimum length is a product call that can be deferred to implementation — the behavior of trivially gaming it should be noted as a known risk in the Assumptions section, not a hard requirement.

---

**Dr. Amir Osei:**

**Verdict: Ready to advance.**

**Top recommendation:** Reframe the Executive Summary. Current framing is a tool description. The product should be described as a behavioral intervention: "Learning Debt Tracker interrupts the escape hatch that AI tools create — the ability to get unblocked without understanding — by installing a structured closure ritual at the moment of resolution. You cannot close an item without explaining, in your own words, what you now understand." This is not cosmetic. It will orient every future design and implementation decision toward the product's actual purpose.

The self-explanation literature is clear: the framing of the task affects the quality of the self-explanation. If users understand this as "a tool that tracks gaps," they will treat the resolution as an administrative step. If they understand it as "a product that enforces a learning ritual," they engage the metacognitive process the research shows is necessary for retention. The reframe matters.

---

**Zoe Harrington:**

**Verdict: Ready to advance, with one required addition.**

**Top recommendation:** Add one sentence to Section 7 (Out of Scope): "This product does not solve the instant-access problem — getting to the capture UI within seconds of being unblocked, regardless of context. It assumes the app is already open in a browser tab. Keyboard shortcut integration, browser extension, or CLI capture are deferred." Making this limitation explicit prevents scope drift during implementation and sets honest expectations about the 10-second claim.

I'm at peace with the differentiation question — "resolution as ritual" is real and the PRD can state it. My residual concern about motivation vs. friction remains: the product is betting that the user is motivated enough to return to the app after capture. That's a bet worth making, but it should be acknowledged as an assumption, not a given.

---

## Final Synthesis

### Position Trajectory

| Persona | Turn 1 | Turn 2 | Turn 3 |
|---------|--------|--------|--------|
| Marcus | Ready; trim FR-014 | Access path assumption needed | Ready; reframe Executive Summary |
| Priya | Conditional; access path is critical | Placeholder scaffolding only | Ready; assumption covers access path |
| Dr. Amir | Ready; add prompting strategy | Placeholder text is sufficient | Ready; reframe as behavioral intervention |
| Zoe | Skeptical; differentiation unclear | Differentiation is real but unstated | Ready; add out-of-scope access path note |

### Consensus Findings

1. **Behavioral reframe needed:** The Executive Summary should describe the product as a behavioral intervention (enforcing a closure ritual), not an information management tool. This is the clearest differentiation claim and should be stated explicitly.
2. **Access path assumption:** Section 8 should include the assumption that the app is open in a persistent browser tab. The 10-second constraint is only testable under this assumption.
3. **Resolution placeholder:** FR-013 should include implementation guidance: use reflective placeholder text ("What do you understand now that you didn't before?") rather than a required structured prompt.
4. **Out-of-scope access path:** Section 7 should acknowledge that instant global access (keyboard shortcut, browser extension) is out of scope for v1.
5. **FR-014 scope reduction:** Store the resolution explanation (data integrity). Defer the display UI to v2.

### Unresolved Disagreements

**Resolution minimum length:** Zoe advocates for a minimum length to prevent "completion theater." Priya argues this adds friction at a high-value moment. Marcus and Dr. Amir are neutral. Proposed default: any non-empty text in v1, with minimum length deferred pending user feedback. **Decision needed at D4.**

### Prioritized Recommendations

| Priority | Recommendation | Consensus |
|----------|---------------|-----------|
| 1 | Reframe Executive Summary as behavioral intervention | All four personas |
| 2 | Add access path assumption to Section 8 | All four personas |
| 3 | Add out-of-scope access path note to Section 7 | All four personas |
| 4 | FR-013 implementation note: reflective placeholder text | Priya + Dr. Amir (Marcus/Zoe neutral) |
| 5 | Scope FR-014 to storage only; defer display UI | Marcus (others neutral) |
| 6 | Add problem statement paragraph: why existing tools fail | Zoe + Priya + Marcus |

### Minority Reports

**Zoe Harrington (on motivation):** Even a well-scoped PRD cannot resolve the fundamental behavioral bet this product makes: that users are motivated enough to open the app after capture, engage with the backlog, and complete the resolution ritual. The product's success depends on motivation that the product itself cannot supply. This is not a scope problem — it's a product risk that should be acknowledged in the Open Questions or Assumptions section as a known unknown.
