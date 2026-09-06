# Interview Wiki maintenance

## Scope and editorial priority

Maintain a GENERAL Chinese interview knowledge base for Java backend, AI application engineering, Agent engineering, algorithms and system design. Preserve VuePress Theme Hope, GitHub Pages and stable URLs.

The user's explicit correction on 2026-09-05 overrides the earlier project-led editorial direction: this is NOT a personal knowledge base. Do not use user memories, chat history, employer systems, hardware, internships or personal projects to choose topics or write examples. Existing case studies are optional teaching appendices, not the syllabus backbone. Never invent company interview provenance or measured question frequency.

Content value takes priority over page counts, icons, progress widgets and CI assertion counts. Do not add another batch of shallow pages to appear comprehensive. A passing build proves only a build; many tests do not prove pedagogical quality or factual completeness.

## Source-first writing workflow

1. Read current files before editing. Search online BEFORE drafting or materially rewriting a technical topic.
2. Use identifiable original public interview guides/collections to discover question coverage (for example JavaGuide, Xiaolin, Datawhale, System Design Primer). Treat author-reported interviews as reports, not verified industry frequency.
3. Read primary documentation, specifications, source code or original papers for technical claims. Distinguish question-selection sources from answer-validation sources. Search snippets alone are insufficient for nuanced guarantees.
4. Record the source URL, applicable version/section, exact question supported and disagreements or limitations. Do not blindly reproduce an overbroad claim from a popular guide.
5. Write original self-contained explanations, worked examples, counterexamples and answered follow-ups. Readers should not have to leave the site to obtain the actual answer. Link to sources near the relevant reasoning, with an annotated reference list.
6. Clearly label author-created deductions, synthetic values, teaching examples and unexecuted experiments. Never present an example parameter as a universal optimum, or a source link as proof of a benchmark.
7. Validate runnable snippets, links and build. State precisely which checks ran. Do not update review dates or source-reviewed metadata for untouched/unreviewed pages.

## Minimum useful content

A mechanism chapter should make the reader able to explain what it is, why it works, how to derive a concrete example, when it fails, and how alternatives differ. Follow-up questions need answers, not just a list of prompts. No fixed word or page quota: add depth only when it adds a distinct mechanism, example or boundary.

Algorithms include problem assumptions, reasoning/invariant, Java implementation, complexity, edge cases and primary problem links. System designs include requirements, capacity assumptions, data/API model, competing designs, failure paths and tradeoffs. Designs are not claims of deployed work. Examples must be general and contain no personal information, company-internal details or credentials.

Use Chinese with conventional English technical terms and ASCII stable paths. Preserve existing question anchors and routes. Update guide/question-bank.md, section indexes, guide/sources.md and guide/updates.md when relevant. Navigation is docs/.vuepress/config.ts. P0/P1 are study priorities, not measured interview frequency.

Use diagrams only when they explain a mechanism, interleaving or state transition more clearly than prose. They need text alternatives and must match the article. Do not let styling work replace content research.

## Build and validation

Node 24; npm with committed package-lock.json; Java 21 in CI. Preserve compatible VuePress/bundler/theme/plugin versions. Do not add dependencies just for editorial revisions.

Run the applicable checks: check:content, check:learning, check:algorithms, check:extended, check:engineering, docs:build, check:dist, check:ui. The source-example checker additionally executes specific original examples extracted from rewritten pages; it does not verify SDK interoperability or factual claims.

Java algorithm checks compile examples extracted from published Markdown. Keep meaningful tests. Do not commit node_modules, generated dist, caches or test screenshots to source.

## Delivery

Repository jdysya/interview; production branch main; base /interview/. PRs build without deploying; main pushes build and publish with Pages artifacts.

Use a branch and PR for substantive changes unless direct changes are explicitly authorized. Do not force-push or change repository permissions. For a corrective content pass, do not describe the entire knowledge base as fixed just because a few sample chapters were rewritten.

Report the actual commit/PR, check results and deployment status. Build success is not deployment success, and deployment success is not a public-browser retest. Continue maintenance from repository evidence and explicit current requests, not personal chat memory.
