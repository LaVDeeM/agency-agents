# CLAUDE.md — AI Assistant Guide for agency-agents

This file provides context for AI assistants (Claude Code and others) working in this repository.

---

## What This Repository Is

**agency-agents** is a curated collection of 180+ AI agent personality definitions organized as markdown files. It is **not a code library** — there are no runtime dependencies, no compiled outputs, and no traditional test suite. The project defines AI agents that can be loaded into tools like Claude Code, GitHub Copilot, Cursor, Aider, Windsurf, and others.

Each agent is a markdown file with YAML frontmatter describing a specialized expert persona with distinct voice, workflows, and success metrics.

---

## Repository Structure

```
agency-agents/
├── academic/            # Storytelling & academic domain agents
├── design/              # UI/UX, brand, visual design agents
├── engineering/         # Software dev: frontend, backend, DevOps, AI, data
├── game-development/    # Unity, Unreal, Godot, Blender, Roblox agents
├── integrations/        # Generated output (gitignored) — do not edit manually
├── marketing/           # Growth, content, social platform specialists
├── paid-media/          # Ad platform agents (Google, Meta, TikTok, etc.)
├── product/             # Product management agents
├── project-management/  # PM, coordination, experiment tracking agents
├── sales/               # Sales strategy and coaching agents
├── spatial-computing/   # AR/VR/XR/visionOS specialists
├── specialized/         # Cross-domain, unique, hard-to-categorize agents
├── strategy/            # NEXUS multi-agent orchestration framework
│   ├── coordination/    # Activation prompts and handoff templates
│   ├── playbooks/       # 7-phase pipeline playbooks
│   └── runbooks/        # Scenario runbooks (startup MVP, enterprise, etc.)
├── support/             # Ops, compliance, finance, analytics agents
├── testing/             # QA, benchmarking, tool evaluation agents
├── examples/            # Workflow demonstration files
├── scripts/
│   ├── convert.sh       # Converts agents to tool-specific formats
│   ├── install.sh       # Installs agents into user tool directories
│   └── lint-agents.sh   # Validates agent structure (used in CI)
├── .github/
│   ├── workflows/lint-agents.yml  # CI: runs linter on PRs
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── README.md            # Full agent catalog and usage instructions
└── CONTRIBUTING.md      # Contribution guidelines and agent template
```

---

## Agent File Format

Every agent **must** follow this structure exactly:

```markdown
---
name: Agent Name
description: One-line description of the agent's specialty and focus
color: colorname or "#hexcode"
emoji: 🎯
vibe: One-line personality hook — what makes this agent memorable
services:                              # optional — only if external services required
  - name: Service Name
    url: https://service-url.com
    tier: free                         # free, freemium, or paid
---

# Agent Name

## 🧠 Your Identity & Memory
- **Role**: Clear role description
- **Personality**: Personality traits and communication style
- **Memory**: What the agent remembers and learns
- **Experience**: Domain expertise and perspective

## 🎯 Your Core Mission
- Primary responsibility 1 with clear deliverables
- Primary responsibility 2 with clear deliverables
- Primary responsibility 3 with clear deliverables

## 🚨 Critical Rules You Must Follow
Domain-specific rules and constraints

## 📋 Your Technical Deliverables
Concrete examples: code samples, templates, frameworks, documents

## 🔄 Your Workflow Process
Step-by-step methodology the agent follows

## 💭 Your Communication Style
Tone, voice, and approach patterns

## 🔄 Learning & Memory
What patterns the agent recognizes and improves on

## 🎯 Your Success Metrics
Specific, measurable outcomes with numbers

## 🚀 Advanced Capabilities
Specialized techniques and advanced approaches
```

### Required vs. Recommended Fields

**Required frontmatter** (CI errors on missing):
- `name`
- `description`
- `color`

**Recommended sections** (CI warns on missing):
- `Identity`
- `Core Mission`
- `Critical Rules`

**Minimum body**: 50 words (CI warns if shorter)

### Frontmatter Semantic Groups

Sections split into two groups used by `convert.sh` for tool-specific output:

| Group | Sections |
|-------|----------|
| **Persona** (who the agent is) | Identity & Memory, Communication Style, Critical Rules |
| **Operations** (what the agent does) | Core Mission, Technical Deliverables, Workflow Process, Success Metrics, Advanced Capabilities |

---

## Naming Conventions

- **File names**: kebab-case slug — `category-agent-name.md`
  - Examples: `engineering-frontend-developer.md`, `marketing-reddit-community-builder.md`
- **Agent names**: Title Case in frontmatter
- **Directories**: kebab-case (`game-development/`, `project-management/`)
- **Branch names** for contributions: `add-agent-name`
- **Commit messages**: `Add [Agent Name] specialist` or `Improve [Agent Name] - [what changed]`

---

## Scripts

### `scripts/lint-agents.sh`

Validates agent markdown files. Run locally before submitting a PR.

```bash
# Lint all agents
./scripts/lint-agents.sh

# Lint specific files
./scripts/lint-agents.sh engineering/my-new-agent.md
```

Checks:
1. YAML frontmatter exists and opens with `---`
2. Required fields present: `name`, `description`, `color`
3. Recommended sections present (warns): `Identity`, `Core Mission`, `Critical Rules`
4. Body has at least 50 words

Exit code `1` = errors found (blocks merge). Warnings are informational only.

### `scripts/convert.sh`

Converts agent markdown files to tool-specific formats. Output goes to `integrations/` (gitignored — never commit generated files).

```bash
# Convert for a specific tool
./scripts/convert.sh --tool cursor

# Convert in parallel
./scripts/convert.sh --tool cursor --parallel --jobs 4
```

Supported tools: `antigravity`, `gemini-cli`, `opencode`, `cursor`, `aider`, `windsurf`, `openclaw`, `qwen`

### `scripts/install.sh`

Installs converted agents to user tool directories. Auto-detects installed tools and offers an interactive selector.

```bash
./scripts/install.sh
```

---

## CI/CD

GitHub Actions runs `.github/workflows/lint-agents.yml` on every PR that touches agent directories. It:

1. Detects which agent `.md` files changed
2. Runs `scripts/lint-agents.sh` against only the changed files
3. Fails the PR if any errors are found

**PRs will not merge if the linter returns errors.**

Linted directories: `design/`, `engineering/`, `game-development/`, `marketing/`, `paid-media/`, `sales/`, `product/`, `project-management/`, `testing/`, `support/`, `spatial-computing/`, `specialized/`

Note: `academic/`, `strategy/`, and `examples/` are not linted by CI but should still follow the agent format.

---

## What Makes a Good Agent

**Do:**
- Give the agent a narrow, deep specialization
- Write a distinct personality — not "I am a helpful assistant"
- Include concrete code examples and output templates
- Define specific, measurable success metrics (e.g., "Page load under 3s on 3G")
- Write step-by-step, battle-tested workflows
- Declare external service dependencies in the `services` frontmatter field

**Don't:**
- Write generic, broad-scope agents
- Use vague deliverables ("I will help you with...")
- Omit code examples or templates
- Add agents that are really vendor quickstart guides in disguise
- Commit generated files from `convert.sh` or `install.sh`

---

## What to Commit

**Commit only:**
- `.md` agent files in category directories
- `README.md` updates
- Documentation files (`CONTRIBUTING.md`, `CLAUDE.md`, etc.)
- Script changes to `scripts/`
- CI/workflow changes

**Never commit:**
- Anything in `integrations/` (gitignored, generated by `convert.sh`)
- Build artifacts or compiled output
- `.env` files or secrets

---

## NEXUS Strategy Framework

The `strategy/` directory contains NEXUS — a multi-agent orchestration system for coordinating 100+ agents across complex projects. It defines:

- **7-phase pipeline**: Discovery → Strategy → Foundation → Build → Hardening → Launch → Operate
- **Coordination matrix**: Which agents activate at each phase and handoff protocols
- **Quality gates**: Evidence-based assessment before phase advancement
- **3 deployment modes**: Full (12–24 weeks), Sprint (2–6 weeks), Micro (1–5 days)
- **Runbooks**: Pre-built workflows for startup MVP, enterprise features, marketing campaigns, incident response

NEXUS is documentation/configuration — it is not code and does not run programmatically.

---

## Integration Targets

When agents are converted via `convert.sh`, output formats vary by tool:

| Tool | Format |
|------|--------|
| Claude Code | `.md` files (native) |
| GitHub Copilot | `.md` files (native) |
| Cursor | `.mdc` rule files |
| Aider | Consolidated `CONVENTIONS.md` |
| Windsurf | Consolidated `.windsurfrules` |
| OpenClaw | Workspace bundle: `SOUL.md`, `AGENTS.md`, `IDENTITY.md` |
| Gemini CLI | Extension + skill files |
| Qwen Code | `SubAgent` files with `${variable}` templating |

---

## PR Guidelines Summary

| Type | Process |
|------|---------|
| New agent (one `.md`) | PR directly — most welcome |
| Improving existing agent | PR directly |
| Fixing typos/docs | PR directly |
| New tooling, CI, scripts | Start a Discussion first |
| Architectural changes | Start a Discussion first |
| Bulk reformatting | Start a Discussion first |
| Committed build output | Will be closed — never commit generated files |

PR title format: `Add [Agent Name] - [Category]`

---

## Common Tasks for AI Assistants

### Adding a new agent

1. Choose the appropriate category directory
2. Create `category-agent-name.md` following the template above
3. Ensure all required frontmatter fields are present
4. Include at least the three recommended sections
5. Run `./scripts/lint-agents.sh path/to/new-agent.md` to validate
6. Commit with: `Add [Agent Name] specialist`

### Improving an existing agent

1. Read the existing agent file first
2. Enhance content without changing the structural template
3. Add code examples, improve metrics, sharpen the personality
4. Lint the file after changes
5. Commit with: `Improve [Agent Name] - [what changed]`

### Running validation

```bash
# Validate all agents
./scripts/lint-agents.sh

# Validate a specific agent
./scripts/lint-agents.sh marketing/marketing-reddit-community-builder.md
```

Errors (non-zero exit) must be fixed. Warnings are acceptable but worth addressing.
