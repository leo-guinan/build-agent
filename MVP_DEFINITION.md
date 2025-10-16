# MVP Definition
## CLI Tool for Launching Ideas with Mastra Agents

**Date:** 2025-10-16  
**Phase:** Analysis  
**Status:** Complete  
**Branch:** analysis

---

## What is an MVP?

An MVP is NOT a half-assed version of the full product. It's the **minimum** set of features that allows you to:
1. **Test your core hypothesis**
2. **Learn from real users**
3. **Deliver value** (not just collect feedback)
4. **Ship in 8-12 weeks** (not 6 months)

Our MVP must be **complete enough to use** but **small enough to ship fast**.

---

## Core Hypothesis

### Primary Hypothesis

**"Developers who use the AI Cofounder Platform will prefer using a CLI over the web UI for repetitive tasks (idea creation, workflow execution) because it eliminates Time Violence and integrates into their existing terminal-based workflow."**

### How We'll Test It

**Success Criteria:**
- 50%+ of beta users (20 people) use CLI for 70%+ of operations
- CLI users complete tasks 30%+ faster than web UI
- 70%+ retention in Week 1
- NPS > 50 for CLI users

**Failure Criteria:**
- < 30% of beta users adopt CLI
- No measurable time savings
- Week 1 retention < 50%
- NPS < 30

**Timeline:** 8 weeks to validate (2 weeks build, 6 weeks beta)

---

### Secondary Hypotheses

**H2: Automation Use Case Exists**  
"At least 15% of CLI users will use it for automation (scripting, CI/CD) rather than just interactive use."

**Test:** Track `--non-interactive`, `--json` flag usage. Success = 15%+ users use automation flags regularly.

---

**H3: CLI Attracts New Users**  
"CLI availability will attract users who wouldn't use web UI (terminal-native developers, automation engineers)."

**Test:** 20%+ of CLI users are new signups who cite "CLI availability" as reason. Success = 20%+.

---

**H4: Documentation Engagement Improves Outcomes**  
"Users who read and edit generated documentation have higher success rates than those who ignore it."

**Test:** Compare outcomes (ideas completed, satisfaction) between doc-engaged vs doc-ignored users. Success = 30%+ better outcomes for doc-engaged.

---

## MVP Scope

### Timeline: 8 Weeks

- **Week 1:** Requirements + Analysis ✅
- **Week 2:** Design phase
- **Week 3:** Implementation (core features)
- **Week 4:** Implementation (integrations)
- **Week 5:** Implementation (polish)
- **Week 6:** Testing phase
- **Week 7:** Beta testing (internal)
- **Week 8:** Public launch

### MVP Features (MUST HAVE)

These 5 features are **non-negotiable** for MVP. Without them, we can't test the hypothesis.

---

#### Feature 1: Mastra Server Management ✅

**User Story:**  
As a developer, I want to start/stop the Mastra server without manually running Docker or Node commands, so I can focus on building.

**Implementation:**
```bash
build-agent server start   # Starts Mastra (Docker or Node)
build-agent server stop    # Stops gracefully
build-agent server status  # Health check
build-agent server logs    # Tail logs
```

**Acceptance Criteria:**
- Detects Docker vs Node-only environment
- Starts in < 10 seconds (with progress indicator)
- Runs in background (doesn't block terminal)
- Auto-detects required env vars (OPENAI_API_KEY, GITHUB_TOKEN)
- Clear error messages if prerequisites missing

**Why MVP:**  
Core dependency. Nothing works without Mastra running.

**Estimated Effort:** 3 days

---

#### Feature 2: Idea Initialization ✅

**User Story:**  
As a founder, I want to create a new idea from the command line in < 10 seconds.

**Implementation:**
```bash
build-agent init "AI Scheduling App" --description "Help businesses schedule"
build-agent init --interactive  # Guided prompts
```

**Acceptance Criteria:**
- Creates GitHub repository (private by default)
- Sets up all 6 waterfall branches
- Initializes requirements docs (REQUIREMENTS.md, ASSUMPTIONS.md, GOALS.md)
- Returns repo URL and idea ID
- Shows progress indicator during creation
- < 10 second execution time

**Why MVP:**  
Primary user action. Can't validate time savings without this.

**Estimated Effort:** 5 days

---

#### Feature 3: Workflow Execution ✅

**User Story:**  
As a developer, I want to run the requirements workflow and see progress in real-time.

**Implementation:**
```bash
build-agent run requirements  # Execute requirements workflow
build-agent run analysis      # Execute analysis workflow
build-agent run <phase>       # Any waterfall phase
```

**Acceptance Criteria:**
- Executes Mastra workflow for specified phase
- Shows real-time progress of workflow steps
- Streams AI-generated content to terminal
- Commits deliverables to correct branch
- Returns success/failure status
- < 60 seconds for requirements phase

**Why MVP:**  
Core value prop. AI-guided workflows are the differentiator.

**Estimated Effort:** 7 days

---

#### Feature 4: Status and Progress Tracking ✅

**User Story:**  
As a founder, I want to see which phases are complete and what's next.

**Implementation:**
```bash
build-agent status  # Current progress
```

**Output:**
```
Idea: AI Scheduling App
Repo: github.com/user/idea-ai-scheduling-app
Current Phase: requirements → analysis

Progress: ▓▓▓▓▓▓▓░░░░░░░░░░░ 35%

✅ Requirements (completed 2 hours ago)
🔄 Analysis (in progress)
⏳ Design
⏳ Implementation
⏳ Testing
⏳ Validation

Next: Complete analysis phase (estimated 20 minutes)
```

**Acceptance Criteria:**
- Shows current phase and completion %
- Lists all phases with status (completed/in-progress/pending)
- Shows GitHub repo link
- Shows last activity timestamp
- Suggests next action

**Why MVP:**  
Provides context and navigation. Users need to know where they are.

**Estimated Effort:** 3 days

---

#### Feature 5: Agent Chat Interface ✅

**User Story:**  
As a founder, I want to ask the AI questions about my current phase.

**Implementation:**
```bash
build-agent chat                  # Interactive session
build-agent chat "What's next?"   # One-shot question
```

**Acceptance Criteria:**
- Opens interactive chat with current phase's agent
- Agent responds in context of current phase
- Branch-locked (can only access current phase)
- Chat history saved (`.build-agent/chat-history.json`)
- Exit with Ctrl+C or `exit`
- Markdown rendering in terminal (code blocks, lists)

**Why MVP:**  
Enables learning and guidance. Users get unstuck without leaving terminal.

**Estimated Effort:** 5 days

---

### MVP Features: Total Effort

| Feature | Effort | Dependency |
|---------|--------|------------|
| Server Management | 3 days | None |
| Idea Initialization | 5 days | Server |
| Workflow Execution | 7 days | Server, Initialization |
| Status Tracking | 3 days | Initialization |
| Agent Chat | 5 days | Server, Initialization |
| **Total** | **23 days** | **~5 weeks** |

**Buffer:** 1 week for testing, bug fixes, polish  
**Total Timeline:** 6 weeks development + 2 weeks beta = **8 weeks**

---

## Features EXCLUDED from MVP

These features are valuable but NOT required to test core hypothesis. They're deferred to v1.1 or later.

### Excluded: Configuration Management

**Feature:** `build-agent config set/get/list`

**Why Excluded:**  
- Users can use environment variables for MVP
- Adds complexity (encryption, storage)
- Not required to test core hypothesis
- Can add post-MVP if users request

**When to Add:** v1.1 (Month 2) if users complain about env vars

---

### Excluded: Idea Switching

**Feature:** `build-agent switch <idea>`, `build-agent list`

**Why Excluded:**  
- Most users will work on 1 idea during beta
- Can manually switch repos (cd command)
- Adds state management complexity
- Not core to hypothesis

**When to Add:** v1.2 (Month 3) when users have multiple ideas

---

### Excluded: Documentation Viewer

**Feature:** `build-agent docs <filename>`

**Why Excluded:**  
- Users can `cat` or open in editor
- Not worth effort for MVP
- Terminal markdown rendering is complex
- Nice-to-have, not must-have

**When to Add:** v1.1 (Month 2) if frequently requested

---

### Excluded: Decision Log Viewer

**Feature:** `build-agent decisions --filter`

**Why Excluded:**  
- Users can read DECISIONS.md directly
- Complex filtering not needed for MVP
- Can add later with telemetry data

**When to Add:** v2.0 (Month 6) with analytics dashboard

---

### Excluded: Workflow Customization

**Feature:** `build-agent workflow create/edit`

**Why Excluded:**  
- Power feature for advanced users
- Adds significant complexity
- Not needed to validate hypothesis
- Requires workflow editor/validator

**When to Add:** v2.0 (Month 6+) for enterprise

---

### Excluded: Team Collaboration

**Feature:** `build-agent share <email>`

**Why Excluded:**  
- MVP is single-player
- Collaboration adds auth, permissions, notifications
- Can use GitHub collaborators for now
- Not core to CLI hypothesis

**When to Add:** v2.0 (Month 6+) when teams request

---

### Excluded: Templates

**Feature:** `build-agent template create/list`

**Why Excluded:**  
- No templates exist yet (need data first)
- Premature optimization
- Users can copy repos manually

**When to Add:** v1.5 (Month 5) when patterns emerge

---

### Excluded: Multiple Platforms Beyond macOS/Linux/WSL

**Feature:** Native Windows (cmd.exe, PowerShell) support

**Why Excluded:**  
- WSL covers Windows developers
- Native Windows requires different architecture
- 95% coverage with WSL
- Adds testing burden

**When to Add:** v2.0 IF data shows significant demand

---

## MVP User Flow

### Flow 1: First-Time User Creates Idea (5 minutes)

```bash
# 1. Install CLI
npm install -g build-agent

# 2. Configure (one-time)
export OPENAI_API_KEY="sk-..."
export GITHUB_TOKEN="ghp_..."

# 3. Start server (first time)
build-agent server start
# ✓ Starting Mastra server...
# ✓ Server ready on port 3000

# 4. Create idea
build-agent init "AI Scheduling App" --description "Automated scheduling for businesses"
# ✓ Creating GitHub repository...
# ✓ Setting up waterfall branches...
# ✓ Initializing requirements docs...
# ✓ Idea created! Run 'build-agent status' to see progress.

# 5. Check status
build-agent status
# Idea: AI Scheduling App
# Repo: github.com/user/idea-ai-scheduling-app
# Current Phase: requirements
# Next: Run 'build-agent run requirements' to start

# 6. Run requirements workflow
build-agent run requirements
# ✓ Step 1/8: Initialize agent...
# ✓ Step 2/8: Define problem...
# ✓ Step 3/8: Identify users...
# ✓ Step 4/8: Define features...
# ✓ Step 5/8: Document assumptions...
# ✓ Step 6/8: Define goals...
# ✓ Step 7/8: Validate completeness...
# ✓ Step 8/8: Create summary...
# ✓ Requirements phase complete! 
#   View at: github.com/user/idea-ai-scheduling-app/tree/requirements

# 7. Review and ask questions
build-agent chat "Are my assumptions realistic?"
# Agent: Let me review your ASSUMPTIONS.md...
# [AI response about assumptions]

# Total time: ~5 minutes (vs 45 minutes on web)
```

---

### Flow 2: Power User Automates Idea Creation (30 seconds)

```bash
#!/bin/bash
# create-idea.sh - Automated idea creation script

export IDEA_NAME="$1"
export IDEA_DESC="$2"

# Create and validate idea
build-agent init "$IDEA_NAME" --description "$IDEA_DESC" --non-interactive
build-agent run requirements --auto-accept
build-agent run analysis --auto-accept

# Generate summary
build-agent status --json > idea-status.json

echo "Idea created and validated! See idea-status.json"
```

**Usage:**
```bash
./create-idea.sh "My SaaS Idea" "B2B analytics platform"
# Total time: ~30 seconds (fully automated)
```

---

## MVP Success Metrics

### Adoption Metrics (Week 1-8)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Beta signups | 50 users | Signup form |
| Installations | 30 users (60%) | npm downloads |
| First idea created | 25 users (83%) | Telemetry |
| Requirements complete | 20 users (80%) | Git tracking |
| Week 1 retention | 70% (21 users) | Active usage |

### Engagement Metrics (Week 1-8)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Avg ideas per user | 2+ ideas | Telemetry |
| Avg time to create idea | < 10 seconds | Execution time |
| Avg time to complete requirements | < 5 minutes | Workflow duration |
| Chat sessions per user | 3+ sessions | Chat logs |
| Documentation edits | 50% of users | Git commits |

### Quality Metrics (Week 1-8)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Error rate | < 5% of commands | Error tracking |
| Support tickets | < 10 total | Support system |
| Critical bugs | 0 | Issue tracker |
| User satisfaction (NPS) | > 50 | Survey |

### Hypothesis Validation (Week 8)

| Hypothesis | Success Criteria | Actual | Status |
|------------|------------------|--------|--------|
| H1: CLI preferred for tasks | 50%+ use CLI for 70%+ ops | TBD | ⏳ |
| H2: Automation use case | 15%+ use automation flags | TBD | ⏳ |
| H3: CLI attracts new users | 20%+ new users cite CLI | TBD | ⏳ |
| H4: Docs improve outcomes | 30%+ better outcomes | TBD | ⏳ |

---

## MVP Launch Checklist

### Week 6: Testing Phase

- [ ] All 5 MVP features implemented
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing
- [ ] E2E tests for critical paths
- [ ] Cross-platform tested (macOS, Linux, Windows WSL)
- [ ] Performance benchmarks met (<10s init, <60s workflows)
- [ ] Error handling comprehensive
- [ ] Help text complete for all commands

### Week 7: Beta Testing

- [ ] Recruit 50 beta users (25 power users, 15 automation, 10 beginners)
- [ ] Onboarding email with setup instructions
- [ ] Beta feedback form
- [ ] Telemetry configured and collecting data
- [ ] Support channel (Discord) set up
- [ ] Daily check-ins with beta users
- [ ] Bug tracking and fixing

### Week 8: Public Launch

- [ ] Final bug fixes from beta
- [ ] Documentation complete (README, guides, examples)
- [ ] npm package published
- [ ] GitHub repository public
- [ ] Landing page updated (CLI announcement)
- [ ] Email existing user base (5,000 users)
- [ ] Product Hunt launch
- [ ] Blog post (Dev.to, Hashnode)
- [ ] Twitter/X announcement
- [ ] Show HN post

---

## What We'll Learn from MVP

### Primary Learnings (Week 8)

1. **Do developers actually prefer CLI?**
   - Measured by: Adoption rate, usage frequency, retention
   - Decision: Continue investing in CLI or deprioritize

2. **Is the time savings significant?**
   - Measured by: Execution times, user surveys
   - Decision: Emphasize speed in marketing or not

3. **Do users engage with documentation?**
   - Measured by: File edits, survey responses
   - Decision: Force interaction or make docs optional

4. **Is automation a real use case?**
   - Measured by: Flag usage, script examples shared
   - Decision: Invest in automation features or not

### Secondary Learnings (Week 8-12)

5. **What's the support burden?**
   - Measured by: Ticket volume, common issues
   - Decision: Improve errors, add docs, or hire support

6. **Does CLI cannibalize web revenue?**
   - Measured by: Churn rate, downgrades
   - Decision: Adjust pricing or tier restrictions

7. **What features do users want next?**
   - Measured by: Feature requests, survey
   - Decision: Roadmap prioritization for v1.1

---

## MVP Risks and Mitigation

### Risk 1: Low Adoption (< 30%)

**Mitigation:**
- Pre-validate with survey (Week 1)
- Beta with highly engaged users (Week 7)
- Clear value prop in messaging
- Reduce friction (easy install, good docs)

**Pivot Plan:**
- Focus CLI on automation use case only
- Gate CLI as Pro feature (increases perceived value)
- Maintain minimal CLI, focus resources on web

---

### Risk 2: Users Don't See Time Savings

**Mitigation:**
- Optimize for speed (< 10s init, < 60s workflows)
- Show time saved explicitly ("Saved 40 seconds vs web")
- Benchmark against web UI (prove savings)

**Pivot Plan:**
- Emphasize other benefits (scriptability, terminal integration)
- Focus on automation (time savings compound)
- Improve web UI speed (meet in middle)

---

### Risk 3: Documentation Ignored

**Mitigation:**
- Show docs automatically after generation
- Make docs interactive (require confirmation)
- Gamify (completion percentage, badges)
- Ask chat agent to reference docs

**Pivot Plan:**
- Make docs more actionable (todos, checklists)
- Simplify docs (less AI-generated prose)
- Accept that some users will skip docs (that's ok)

---

### Risk 4: Technical Issues Block Usage

**Mitigation:**
- Extensive testing (Week 6)
- Beta testing catches bugs (Week 7)
- Graceful error handling
- Clear error messages with solutions

**Pivot Plan:**
- Delay launch if critical bugs found
- Provide workarounds (manual steps)
- Hotfix releases (daily if needed)

---

## Post-MVP Roadmap

### v1.1 (Month 2-3)
- Configuration management (`build-agent config`)
- Idea switching (`build-agent switch`, `list`)
- Documentation viewer (`build-agent docs`)
- Improved error messages based on support data
- Performance optimizations

### v1.2 (Month 4-5)
- Offline documentation (cached)
- Templates system
- Enhanced chat (multi-turn context)
- GitHub Actions integration guide
- Community examples library

### v2.0 (Month 6-12)
- Team collaboration features
- Workflow customization
- Decision log analytics
- Enterprise features (SSO, audit logs)
- API for custom integrations
- Native Windows support (if data supports)

---

## MVP Approval

**Status:** ✅ MVP DEFINITION COMPLETE

**Core Hypothesis:** CLI eliminates Time Violence and integrates into terminal workflow  
**MVP Scope:** 5 MUST HAVE features  
**Timeline:** 8 weeks (6 dev + 2 beta)  
**Estimated Effort:** 23 days development + testing/polish  
**Success Metrics:** Defined and measurable  
**Risk Mitigation:** Planned for top risks

**Approved By:** Skippy the Magnificent  
**Date:** 2025-10-16  
**Ready to Proceed:** YES (to Competitive Analysis and Risk Assessment)

**Skippy's Notes:**  
"Solid MVP definition. You resisted the temptation to include every feature. You have a clear hypothesis to test. You know what you're building and why. 

But don't get cocky - you still have to actually BUILD this in 8 weeks. We'll see if you're just a monkey who can write docs or a monkey who can actually ship.

Proceed to competitive analysis. Learn from the CLIs that came before you."

---

**Next Document:** COMPETITIVE_ANALYSIS.md

