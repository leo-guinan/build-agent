# Build Reference
## CLI Tool - Quick Reference for Implementation

**Last Updated:** 2025-10-16  
**Phase:** Design → Implementation  
**Purpose:** Condensed reference of critical decisions, constraints, and requirements

---

## 🎯 What We're Building

**Product:** CLI tool that helps developers validate startup ideas using AI-guided waterfall methodology

**Core Value:** Eliminate "Time Violence" - reduce idea creation from 45 minutes (web UI) to < 10 seconds (CLI)

**Target Users:** Terminal-native developers, automation engineers, technical founders

---

## 🚀 MVP Features (5 Total - 8 Week Timeline)

### 1. Server Management (3 days)
```bash
build-agent server start/stop/status/logs
```
- Auto-detect Docker vs Node environment
- Start in < 10 seconds
- Run in background

### 2. Idea Initialization (5 days)
```bash
build-agent init "Idea Name" --description "..."
```
- Create GitHub repository
- Setup 6 waterfall branches
- Initialize docs (REQUIREMENTS.md, ASSUMPTIONS.md, GOALS.md)
- Complete in < 10 seconds

### 3. Workflow Execution (7 days)
```bash
build-agent run requirements|analysis|design
```
- Execute Mastra workflows
- Real-time progress display
- Auto-commit deliverables to correct branch
- Complete in < 60 seconds per phase

### 4. Status Tracking (3 days)
```bash
build-agent status
```
- Show current phase and progress
- Visual progress bar
- Next action suggestions
- Time saved metrics

### 5. Agent Chat (5 days)
```bash
build-agent chat
build-agent chat "question"
```
- Interactive or one-shot mode
- Branch-locked (only accesses current phase)
- Markdown rendering
- Chat history saved

**Total Effort:** 23 days (~5 weeks) + 1 week buffer = 6 weeks dev

---

## 🏗️ Technical Stack

**CLI Framework:**
- TypeScript + Node.js 20+
- Commander.js (command parsing)
- Chalk + Ora (terminal UI)
- Inquirer (interactive prompts)

**Backend:**
- Existing Mastra server (localhost:3000)
- Mastra workflows and agents
- OpenAI GPT-4

**APIs:**
- GitHub REST API (create repos, branches, files)
- Mastra HTTP API (execute workflows, chat)

**Storage:**
- `~/.build-agent/config.json` (credentials, settings)
- `~/.build-agent/current-idea.json` (active idea)
- `~/.build-agent/cache/` (API responses)

---

## ⚠️ Critical Constraints

### Must-Haves
- **Speed:** < 10s for init, < 60s for workflows
- **Branch-locking:** Agents can ONLY access their phase branch
- **Git-native:** All decisions committed to Git
- **Cross-platform:** macOS, Linux, Windows WSL
- **Scriptable:** `--json`, `--yes`, `--quiet` flags

### Performance Targets
- Memory: < 100MB
- Bundle size: < 50MB
- API calls: < 10 per operation
- Test coverage: > 80%

### Security
- Encrypted credentials (AES-256-GCM)
- Never log tokens/keys
- GitHub scopes: `repo`, `workflow`

---

## 🎨 UX Patterns (Copy These)

### Command Structure
```bash
build-agent <command> [subcommand] [options]
```
- Verb-first (like git, npm, gh)
- Interactive by default
- `--yes` for automation

### Terminal Output
```
✅ Success (green)
❌ Error (red)
⚠️  Warning (yellow)
🔄 In Progress (cyan)
🤖 AI Agent (magenta)
```

### Error Messages
```
❌ Error: [What happened]

Why this matters:
[Context]

How to fix:
1. [Step 1]
2. [Step 2]

Docs: [URL]
Error Code: [CODE]
```

---

## 📊 Key Decisions

| Decision | Rationale | Confidence |
|----------|-----------|------------|
| TypeScript for CLI | Team knows it, code sharing with backend | 80% |
| Use existing Mastra | Don't duplicate agent logic | 95% |
| Branch-locked agents | Prevent cross-contamination | 90% |
| Git required | Core to platform, 99% devs have it | 95% |
| OpenAI only (MVP) | Backend uses it, proven | 75% |
| npm distribution | Target users have npm | 80% |
| macOS/Linux/WSL | 95% coverage, avoid native Windows | 85% |

---

## 🎯 Success Metrics (MVP)

**Week 8 Targets:**
- 500 installations
- 70% week-1 retention
- 80% requirements completion rate
- 50% use CLI for 70%+ of operations
- < 10 support tickets
- NPS > 50

**Hypothesis to Test:**
"Developers prefer CLI for repetitive tasks because it eliminates Time Violence"

**Failure Criteria:**
- < 30% adoption → Pivot to automation-only
- < 50% retention → Major UX problems
- Revenue cannibalization > 10% → Adjust pricing

---

## ⚠️ Top 5 Risks

### 1. Low Adoption (24/25 - CRITICAL)
**Risk:** < 30% of users install/use CLI  
**Mitigation:** Survey Week 1, beta Week 7, easy install, clear value  
**Contingency:** Reduce scope, focus on automation

### 2. Revenue Cannibalization (24/25 - CRITICAL)
**Risk:** Paid users downgrade "I only need CLI"  
**Mitigation:** Gate by tier, web-exclusive features, monitor churn  
**Contingency:** Create CLI-only tier at lower price

### 3. Documentation Ignored (18/25 - HIGH)
**Risk:** Users skip generated docs, methodology fails  
**Mitigation:** Show docs automatically, make interactive, gamify  
**Contingency:** Force confirmation, simplify docs

### 4. Support Burden (16/25 - HIGH)
**Risk:** Too many support tickets  
**Mitigation:** Excellent errors, self-service docs, community  
**Contingency:** Hire support, improve error messages

### 5. Technical Delays (15/25 - HIGH)
**Risk:** MVP takes > 8 weeks  
**Mitigation:** Buffer time, early prototyping, strict scope  
**Contingency:** Cut SHOULD HAVE features, extend 2 weeks

---

## 🔥 What NOT to Build (MVP)

**Deferred to v1.1+:**
- Configuration management (`build-agent config`)
- Idea switching (`build-agent switch`)
- Documentation viewer (`build-agent docs`)
- Decision log viewer
- Workflow customization
- Team collaboration
- Templates system

**Reason:** Not needed to test core hypothesis. Can add if users request.

---

## 📁 File Structure

```
build-agent/
├── src/
│   ├── index.ts                 # Entry point
│   ├── commands/                # Command handlers
│   │   ├── init.ts
│   │   ├── run.ts
│   │   ├── chat.ts
│   │   ├── status.ts
│   │   └── server.ts
│   ├── lib/                     # Core logic
│   │   ├── mastra-client.ts
│   │   ├── github-client.ts
│   │   ├── git-manager.ts
│   │   ├── state-manager.ts
│   │   └── error-handler.ts
│   ├── ui/                      # Terminal UI
│   │   ├── spinner.ts
│   │   ├── progress.ts
│   │   ├── table.ts
│   │   └── markdown.ts
│   └── utils/                   # Utilities
│       ├── logger.ts
│       ├── validator.ts
│       └── crypto.ts
├── tests/                       # Test suite
├── package.json
└── tsconfig.json
```

---

## 🧪 Testing Strategy

**Unit Tests (85% coverage):**
- All lib/* components
- Command logic (without external APIs)

**Integration Tests:**
- CLI → Mastra → GitHub full flows
- Error handling (rate limits, network failures)

**E2E Tests:**
- Complete user flows (setup → create → run → chat)
- Cross-platform (macOS, Linux, WSL)

---

## 📅 Implementation Timeline

**Week 3: Core Infrastructure**
- Project setup (TypeScript, dependencies)
- State manager (~/.build-agent/)
- GitHub client (create repo, branches)
- Git manager (clone, commit, push)

**Week 4: Commands & Workflows**
- `build-agent init` (idea creation)
- `build-agent run` (workflow execution)
- Mastra client (workflow calls)
- Error handling

**Week 5: Chat & Polish**
- `build-agent chat` (agent interaction)
- `build-agent status` (progress tracking)
- Terminal UI (spinners, progress, colors)
- Error messages

**Week 6: Testing**
- Unit tests (85% coverage)
- Integration tests
- E2E tests
- Bug fixes

**Week 7: Beta**
- 20 power user beta testers
- Collect feedback
- Monitor adoption, retention, doc engagement
- Fix critical issues

**Week 8: Launch**
- Public npm release
- Documentation site
- Marketing (Product Hunt, HN, email list)
- Monitor metrics

---

## 🔑 Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...           # For AI agents
GITHUB_TOKEN=ghp_...            # For repo creation
GITHUB_USER=username            # GitHub username

# Optional
MASTRA_SERVER_URL=http://localhost:3000  # Custom Mastra server
NODE_ENV=development|production           # Environment
LOG_LEVEL=debug|info|warn|error          # Logging
```

---

## 📞 Quick Reference Commands

```bash
# Development
npm run dev              # Run CLI in dev mode
npm run build            # Build TypeScript
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run lint             # ESLint
npm run format           # Prettier

# Installation
npm install -g build-agent        # Install globally
npm link                          # Link for dev

# Usage
build-agent init "My Idea"        # Create idea
build-agent run requirements      # Run workflow
build-agent chat                  # Chat with agent
build-agent status                # Check progress
build-agent server start          # Start Mastra
```

---

## 🎓 For Reference Only

**Full documentation in requirements branch:**
- Complete requirements: REQUIREMENTS.md
- 13 assumptions: ASSUMPTIONS.md
- 15 goals: GOALS.md
- All decisions: DECISIONS.md
- 20+ unknowns: ANALYSIS.md
- 9 competitors: COMPETITIVE_ANALYSIS.md
- 17 risks: RISK_ASSESSMENT.md

**Design specification:**
- Complete UX flows: DESIGN.md
- API contracts: DESIGN.md
- Data models: DESIGN.md

**This file is the TL;DR. Build from DESIGN.md + MVP_DEFINITION.md + this.**

---

**Last Updated:** 2025-10-16  
**Ready to Build:** YES  
**Estimated Completion:** Week 8 (6 weeks from now)

Git gud → Git building. 🚀

