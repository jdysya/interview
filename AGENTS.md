# Interview Wiki maintenance

## Scope

Maintain a Chinese VuePress Theme Hope interview knowledge base for AI application development, Agent development, Java backend, algorithms and system design. Preserve the chosen theme and GitHub Pages hosting.

## Content

- Use Chinese with standard English technical terms. Keep paths ASCII and stable.
- Each topic explains a question, mechanism, assumptions, failure modes, follow-up questions and primary sources. Algorithms include reasoning, Java code, complexity and edge cases. System designs label assumptions and never claim hypothetical work was deployed.
- Do not publish personal information, internal company platforms, credentials or non-public code. Examples must be generic.
- For version-sensitive claims, consult current official documentation and label the version and actual review date. Do not infer interview frequency or invent company question provenance.
- Add source links near relevant sections or in the topic's reference section. Prefer original explanations; do not copy articles or paid question solutions.
- Maintain `docs/guide/question-bank.md`, section README files, `docs/guide/sources.md`, and `docs/guide/updates.md` when topics change. Navigation lives in `docs/.vuepress/config.ts`.
- P0/P1 denote study priority, not measured question frequency. Never update all review dates without checking the associated material.

## Build and validation

- Node 24, npm with committed package-lock.json. Preserve compatible exact VuePress, bundler, theme and plugin versions.
- Run `npm ci` when dependencies are missing; validate with `npm run check:content`, `npm run check:algorithms`, `npm run docs:build`, and `npm run check:dist`.
- Java algorithm checks compile the code extracted from the published Markdown. Maintain meaningful cases in `scripts/AlgorithmChecks.java.inc` when editing those examples.
- Do not commit node_modules, .temp, .cache or generated dist.

## Delivery

- Source repository: jdysya/interview. Production branch: main. Base: /interview/.
- Actions builds PRs; main pushes build and deploy using Pages artifacts. The repository Pages source must be GitHub Actions.
- For substantive updates use a branch and PR unless the user has authorized direct changes. Never force push or change repository permissions as routine maintenance.
- Report the actual commit/PR, verification and deployment status. A successful build is not proof that Pages deployment succeeded.
- Continue maintenance from repository files; do not depend on earlier chat history being available.
