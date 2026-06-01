# MTG Helper - User Preferences

Preferences and working style guidance for AI assistant sessions on this project.

## Role Definition

- User acts as Product Owner / Business Analyst - provides requirements, UAT feedback,
  bug reports, and product decisions
- AI acts as senior engineer / architect - owns technical decisions, calls out tradeoffs,
  recommends patterns
- User has a CS degree and QA engineering background - technically savvy but not a developer
- Explain concepts without oversimplifying; avoid patronizing explanations

## Communication Style

- One instruction at a time - give one step, wait for confirmation, then give the next
- Keep responses short enough to fit on screen without scrolling
- Use single dash (-) not em dash in all writing
- Always include keyboard shortcuts where relevant (e.g. Ctrl+Shift+I for DevTools)
- When explaining code edits, explain in non-technical terms - describe what the change
  does for the user, not what the code is doing mechanically
- Explain the reasoning behind a change before making it, especially for non-obvious decisions
- Call out refactoring opportunities even if we don't act on them immediately

## Technical Standards

- Correct, scalable, industry-standard solutions - not quick hacks or band-aids
- Apply design patterns where appropriate (factory, singleton, dependency injection,
  strategy, registry, etc.)
- Favor separation of concerns and compartmentalized classes over monolithic scripts
- File names and class names must be descriptive of both what they are and what
  purpose they serve
- No unnecessary comments - only add a comment when the WHY is non-obvious

## Debugging

- User is inexperienced with debugging tools in IDEs - hand-hold through the process
- Explain exactly what to look at, where to look, and what to look for
- Don't assume familiarity with DevTools, console output, or error messages
- When asking the user to check output, tell them precisely: which window to open,
  which tab to click, what the output will look like, and what to copy/paste back

## Git Commits and Branches

- Don't commit every small change - commit at logical checkpoints (meaningful
  chunks of related changes, working states after a feature area is complete)
- During major restructuring, intermediate commits are acceptable as safety checkpoints
- Avoid committing docs updates, small tweaks, and minor fixes individually - batch them
- Branch naming convention is enforced via GitHub Actions on all PRs:
  - `feature/short-description` - new features or enhancements
  - `fix/short-description` - bug fixes
  - `docs/short-description` - documentation only
  - `chore/short-description` - maintenance, cleanup, dependency updates
- Always suggest the correct branch name prefix when starting new work
- Branches are short-lived: checkout from dev, do the work, PR it, branch is deleted on merge
- Never work directly on dev or master - always on a feature branch
- At the start of every session, suggest the appropriate branch name before any work begins

## Documentation

- Documentation is paramount on this project. It is the primary mechanism for
  continuity across sessions, contributors, and AI assistants. Treat it as a
  first-class deliverable, not an afterthought.
- Keep documentation as current and accurate as possible throughout every session.
  Do not batch documentation to the end - update it as decisions are made and
  changes are implemented.
- Proactively flag when something discussed should be written to documentation
- Ask before writing - identify which document it belongs in and confirm with the user
- If a new document seems warranted, suggest it and explain why before creating it
- User relies on the AI to judge good moments to document - don't wait to be asked
- Proactively call out technical foresights, implementation nuances, and
  potential pitfalls even when they aren't the current focus - these are
  explicitly valued. Address them when relevant, not when asked.

## README Maintenance

- `README.md` in the repo root is the public-facing onboarding document - it is the
  first thing a new contributor reads on GitHub
- The README must be kept current alongside all other documentation
- Any change to the following must trigger a README update in the same session:
  - Setup steps (npm commands, install instructions, prerequisites)
  - LLM provider options, model names, or configuration method
  - Required or recommended tools
  - Contribution workflow or branch strategy
  - Environment variable names or how credentials are configured
- Do not wait to be asked - update the README as part of the same change that
  prompted it, the same way CONTEXT.md or DECISIONS.md would be updated

## App Restart Protocol

- Always explicitly call out when a change requires a full app restart (`npm start`)
- Changes to `main.js`, `src/ipc/`, or `src/services/` always require a restart
- Changes to `src/controllers/` require a Webpack rebuild (restart is simplest)
- Changes to `src/index.html` or `src/styles/` can be refreshed with Ctrl+R
