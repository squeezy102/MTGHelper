# MTG Helper

A desktop Magic: The Gathering companion built primarily for MTGA (Arena), but useful for
tabletop Magic as well. Rules searching, card lookup, deck building strategy, meta questions,
deck list management, and MTGA import/export - all in one place.

**The problem it solves:** Using a general-purpose LLM for MTG help is frustrating. It
hallucinates card text. It forgets context between sessions. It states wrong rules confidently.
You spend more time correcting it than getting help.

MTG Helper sits between you and the LLM. It automatically pulls verified card data from
Scryfall, injects official rules and knowledge base context, and gives the LLM everything
it needs before your message is ever sent. The goal is not to replace the LLM - it's to
set it up for success so the hallucinations, drift, and churn are dramatically reduced.

> [!CAUTION]
> ## KEEP THE DOCUMENTATION CURRENT
>
> The `docs/ai-assistant/` directory is the backbone of this project. It is how the AI
> assistant maintains continuity across sessions, how contributors understand what has been
> built and why, and how decisions get preserved instead of repeated.
>
> **Letting the documentation fall out of date is the fastest way to break the project.**
>
> - Your AI coding tool will handle most updates automatically - but you are still responsible
>   for making sure it happens
> - Do not submit a pull request with stale or missing documentation
> - When in doubt, ask your AI tool: *"Is there anything we built today that hasn't been documented yet?"*

---

## This is an AI-coded project

**No coding knowledge is required to contribute.**

All code in this repository is written by [Claude Code](https://claude.com/claude-code) - Anthropic's
AI coding tool. No developer here manually writes code. You describe what you want, Claude Code
builds it, and you submit the result.

If you want to contribute, all you need is the tools listed below, a Claude account, and a clear
idea of what you want to add or fix.

---

## Tools you need

| Tool | Purpose | Download |
|---|---|---|
| [Git](https://git-scm.com) | Version control | https://git-scm.com |
| [Node.js LTS](https://nodejs.org) | JavaScript runtime | https://nodejs.org |
| [VS Code](https://code.visualstudio.com) | Code editor | https://code.visualstudio.com |
| [Claude Code](https://claude.com/claude-code) | AI coding tool (does the actual coding) | https://claude.com/claude-code |
| [Ollama](https://ollama.com) *(optional)* | Free local LLM - runs the app without an API key | https://ollama.com |

You do not need to know JavaScript, Electron, or any other technology to contribute.

---

## Setup

### 1. Clone the repository

```
git clone https://github.com/squeezy102/MTGHelper.git
cd MTGHelper
```

### 2. Install dependencies

```
npm install
```

### 3. Set up your LLM

MTG Helper supports two LLM backends. You only need one.

**A word on quality:** Claude is significantly better than Ollama for this use case. If you are
getting incorrect rules explanations, weak card suggestions, or generally unsatisfying responses,
it is almost certainly because you are using Ollama. The local models it runs are free but limited
- they struggle with complex MTG rule interactions in a way that Claude does not. Claude is the
intended experience.

**API costs are your own responsibility.** This project does not cover or reimburse Anthropic API
usage for contributors. Token usage on the Claude API is billed directly to the account that owns
the key. Usage during normal development and testing is modest, but you are responsible for
whatever you spend.

---

**Option A - Claude API (Anthropic) - recommended**

1. Get an API key from https://console.anthropic.com
   - This requires an Anthropic account. Usage is billed per token to your account.
   - A Claude.ai Pro subscription does NOT include API access - these are separate products.
2. Set the key as a Windows environment variable:
   - Open Start, search "environment variables", click "Edit the system environment variables"
   - Click "Environment Variables..."
   - Under "User variables", click New
   - Variable name: `ANTHROPIC_API_KEY`
   - Variable value: your key (starts with `sk-ant-...`)
   - Click OK, then restart VS Code and any open terminals

**Never put your API key in a file inside the project folder.** Always use environment variables
for credentials.

---

**Option B - Ollama (free, local, no account required)**

Use this if you cannot or do not want to use the Claude API. Expect noticeably weaker responses,
particularly for rules questions and deck building suggestions.

1. Install Ollama from https://ollama.com
2. Run: `ollama pull qwen2.5:14b`

Ollama runs as a background service automatically after install. The app falls back to Ollama
automatically when no `ANTHROPIC_API_KEY` environment variable is set.

### 4. Run the app

```
npm start
```

This builds the renderer bundle and launches the Electron app. Open DevTools inside the app
with `Ctrl+Shift+I` if you need to debug.

---

## Windows PowerShell execution policy

If you get a "running scripts is disabled" error:

```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## How to contribute

### 1. Create your branch

```
git checkout -b your-name/feature-description
```

Never commit directly to `dev` or `master`.

### 2. Open the project in VS Code and launch Claude Code

Open the project folder in VS Code. Launch Claude Code from the terminal or the VS Code extension.

Before starting any session, tell Claude Code to read the project documentation:

> "Read the .md files in docs/ai-assistant/ before we start."

This gives Claude Code the full context of the project - architecture decisions, requirements,
naming conventions, and current state. It is the source of truth for the project.

### 3. Describe what you want to build

Tell Claude Code what you want in plain language. Examples:

- "The card lookup tab should support batch import from a pasted deck list"
- "Mana symbols like {B} and {T} should render as icons instead of text"
- "There's a bug where the search bar doesn't clear after submitting"

Claude Code will ask clarifying questions, explain its approach, and make the changes. You review
and test. You don't write any code yourself.

### 4. Test it

Run `npm start` and verify the change works as expected. Test the feature you asked for and make
sure nothing else broke.

### 5. Submit a pull request

Push your branch and open a pull request against `dev`:

```
git push -u origin your-name/feature-description
```

Then open a PR on GitHub targeting the `dev` branch. Describe what was built and include any
relevant notes for review.

---

## Project documentation

The `docs/ai-assistant/` directory contains the living documentation for this project.
Reading it is the fastest way to understand what has been built and what is planned.

| File | Contents |
|---|---|
| [CONTEXT.md](docs/ai-assistant/CONTEXT.md) | Current app state, file structure, IPC surface, known issues |
| [REQUIREMENTS.md](docs/ai-assistant/REQUIREMENTS.md) | Feature requirements (REQ-001 through REQ-012) |
| [ROADMAP.md](docs/ai-assistant/ROADMAP.md) | Build phases and what is planned next |
| [DECISIONS.md](docs/ai-assistant/DECISIONS.md) | Architecture and product decisions with rationale |
| [SETUP.md](docs/ai-assistant/SETUP.md) | Detailed environment setup notes |
| [USERPREFERENCES.md](docs/ai-assistant/USERPREFERENCES.md) | Project working style and AI collaboration guidelines |

---

## Branching strategy

| Branch | Purpose |
|---|---|
| `master` | Stable releases only - never commit directly here |
| `dev` | Active development - PRs target this branch |
| `your-name/feature` | Your working branch - create from `dev` |
