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

## How this project is built

This project is built primarily using [Claude Code](https://claude.com/claude-code) - Anthropic's
AI coding tool. I describe what I want, Claude Code writes the code, and I review and test the result.
I don't write any code manually.

You don't have to work that way. Manual coding is welcome. So is any other AI-assisted tool -
Copilot, Cursor, Gemini, whatever you prefer. The setup and contribution guide below describes
my approach. If you work differently, adapt it to your workflow.

The only non-negotiable is the documentation. Whatever approach you use, `docs/ai-assistant/`
must stay current. See the callout at the top of this file.

---

## Tools you need

| Tool | Purpose | Download |
|---|---|---|
| [Git](https://git-scm.com) | Version control | https://git-scm.com |
| [Node.js LTS](https://nodejs.org) | JavaScript runtime | https://nodejs.org |
| [VS Code](https://code.visualstudio.com) | Code editor | https://code.visualstudio.com |
| [Claude Code](https://claude.com/claude-code) *(optional)* | AI coding tool - how I build this project | https://claude.com/claude-code |
| [Ollama](https://ollama.com) *(optional)* | Local/offline LLM - runs entirely on your machine, no internet required after setup. Quality is significantly degraded vs. cloud providers. | https://ollama.com |

If you are following my approach with Claude Code, you do not need to know JavaScript, Electron, or any other technology to contribute.

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

MTG Helper supports three LLM providers. You only need one.

**Supported LLM Providers**

MTGHelper is designed and optimized for the Anthropic Claude API. This is the only
provider that delivers the full intended experience and is strongly recommended.

**Gemini** (Google AI Studio) is supported as a free alternative for contributors.
A free API key requires no credit card. Response quality is good but some behavioral
variance from Claude should be expected.

**Ollama** is supported for users who require fully local, offline operation. Be
aware: Ollama's open-weight models are significantly less capable than Claude or
Gemini for this use case. Rules interpretation, deck building reasoning, and
structured output reliability will all be noticeably degraded. If you can use
Claude or Gemini, you should.

**API costs are your own responsibility.** This project does not cover or reimburse
API usage for contributors. Usage during normal development and testing is modest,
but you are responsible for whatever you spend.

---

**Option A - Claude API (Anthropic) - recommended**

1. Get an API key from https://console.anthropic.com
   - Usage is billed per token to your account.
   - A Claude.ai Pro subscription does NOT include API access - these are separate products.
2. Set these as Windows environment variables (Start → "Edit the system environment variables" → Environment Variables → User variables → New):
   - `LLM_PROVIDER` = `claude`
   - `ANTHROPIC_API_KEY` = your key (starts with `sk-ant-...`)
3. Restart VS Code and any open terminals.

**Never put your API key in a file inside the project folder.** Always use environment variables.

---

**Option B - Gemini (Google AI Studio) - free, no credit card required**

1. Get a free API key from https://aistudio.google.com
2. Set these as Windows environment variables:
   - `LLM_PROVIDER` = `gemini`
   - `GEMINI_API_KEY` = your key
3. Restart VS Code and any open terminals.

---

**Option C - Ollama (local/offline only)**

Use this only if you specifically need offline operation and accept significantly
degraded response quality.

1. Install Ollama from https://ollama.com
2. Run: `ollama pull qwen2.5:14b`
3. Set this as a Windows environment variable:
   - `LLM_PROVIDER` = `ollama`
4. Restart VS Code and any open terminals.

Ollama runs as a background service automatically after install.

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

Branches must follow this naming convention or your pull request will be automatically blocked:

| Prefix | Use it for |
|---|---|
| `feature/` | New features or enhancements |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes only |
| `chore/` | Maintenance, cleanup, dependency updates |

The part after the slash should be short and descriptive, using hyphens between words:

```
git checkout -b feature/mana-symbol-rendering
git checkout -b fix/lookup-search-bar-not-clearing
git checkout -b docs/update-workshop-requirements
git checkout -b chore/remove-unused-images
```

Never commit directly to `dev` or `master` - always work on a branch and submit a pull request.
Branches are short-lived: one branch per piece of work, deleted automatically when the PR merges.
New work always means a new branch checked out fresh from `dev`.

### 2. Load the project documentation

Before starting any session, make sure your tool has read the project documentation:

If using Claude Code:
> "Read the .md files in docs/ai-assistant/ before we start."

If coding manually or with a different tool, read through `docs/ai-assistant/` yourself - especially
`CONTEXT.md`, `REQUIREMENTS.md`, and `DECISIONS.md`. These files are the source of truth for the
project: what has been built, why decisions were made, and what is planned next.

### 3. Build the change

Tell your AI tool what you want, or write the code yourself. If using Claude Code:

- "The card lookup tab should support batch import from a pasted deck list"
- "Mana symbols like {B} and {T} should render as icons instead of text"
- "There's a bug where the search bar doesn't clear after submitting"

Claude Code will ask clarifying questions, explain its approach, and make the changes. You review
and test.

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
| [REQUIREMENTS.md](docs/ai-assistant/REQUIREMENTS.md) | Feature requirements (REQ-001 through REQ-021) |
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
