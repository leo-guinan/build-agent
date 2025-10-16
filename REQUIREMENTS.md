# Requirements Document
## CLI Tool for Launching Ideas with Mastra Agents

**Date:** 2025-10-16  
**Phase:** Requirements  
**Status:** Complete  
**Branch:** requirements

---

## 1. Problem Statement

### The Core Problem

Developers and founders have access to the AI Cofounder Platform's sophisticated waterfall methodology and branch-locked agent system, but they are **forced to use a web interface** to interact with it. This creates several painful inefficiencies:

1. **Context Switching:** Developers live in the terminal. Forcing them to open a browser, navigate to a UI, click buttons, and wait for web-based feedback breaks their flow state.

2. **Automation Limitations:** Web UIs cannot be easily integrated into existing developer workflows, CI/CD pipelines, or automation scripts. You can't pipe web interactions into other tools.

3. **Speed and Efficiency:** Every action requires page loads, navigation, and visual rendering that adds latency. CLIs are instant.

4. **Power User Friction:** Experienced developers want keyboard-driven, scriptable, composable tools. Web UIs are designed for discoverability, not efficiency.

5. **Server Management Complexity:** Running the Mastra server, managing workflows, and executing agents requires understanding the entire backend architecture. There's no simple "just run it" option.

### Why This Matters

The AI Cofounder Platform has proven that structured AI guidance prevents vibecoding and produces better outcomes. But if the interface itself creates Time Violence through unnecessary complexity and context switching, we're solving one problem while creating another.

**Time Violence Score:** 
- Current web flow: ~45 seconds per idea creation (page load, form fill, navigation, feedback)
- Current local development: ~10 minutes to set up Mastra server, configure env, run workflows
- Potential CLI flow: ~5 seconds per idea creation
- **Potential time saved:** 40 seconds per operation × 10 operations/day = 6.6 minutes/day = 40 hours/year per user

### Success Vision

A developer can:
```bash
# Initialize a new idea
build-agent init "AI Scheduling App" --description "Help businesses schedule appointments"

# Run requirements phase
build-agent run requirements

# Check status
build-agent status

# Chat with current phase agent
build-agent chat "What assumptions should I validate first?"

# Execute workflows
build-agent workflow execute requirements-phase

# All without leaving terminal. All instantly. All scriptable.
```

---

## 2. Target Users

### Primary User: The Terminal-Native Developer

**Demographics:**
- Age: 25-45
- Experience: 3+ years software development
- Current role: Founder, solo developer, indie hacker, or technical lead
- Technical skill: High (comfortable with Git, CLI tools, scripting)
- Operating system: macOS/Linux primarily (Windows WSL secondary)

**Behaviors:**
- Lives in terminal (zsh, bash, fish)
- Uses CLI tools daily (git, npm, docker, make, etc.)
- Prefers keyboard over mouse
- Values speed and efficiency
- Writes scripts to automate repetitive tasks
- Integrates tools via pipes and composition

**Pain Points:**
- Forced to use web UIs for AI tools
- Can't integrate AI workflows into existing scripts
- Context switching between terminal and browser kills productivity
- Slow feedback loops in web interfaces
- Can't compose AI tools with other CLI utilities

**Goals:**
- Launch ideas quickly without leaving terminal
- Integrate AI guidance into development workflow
- Automate idea creation and validation
- Access Mastra agents via command line
- Script entire waterfall methodology

**Quote:** 
> "I love the AI Cofounder methodology, but every time I have to open the browser, fill out a form, and click through the UI, I lose my train of thought. I just want to `build-agent init` and keep coding."

### Secondary User: The Automation Engineer

**Demographics:**
- Age: 28-50
- Experience: 5+ years in DevOps/automation
- Current role: Platform engineer, DevOps lead, automation specialist
- Technical skill: Very high (writes custom tooling)

**Behaviors:**
- Builds internal tools and workflows
- Integrates multiple systems via APIs and CLIs
- Creates CI/CD pipelines
- Values scriptability and composability
- Documents and shares automation patterns

**Pain Points:**
- Web UIs can't be automated
- Need to integrate AI guidance into team workflows
- Want to create custom wrappers around AI agents
- Require programmatic access to Mastra workflows

**Goals:**
- Integrate idea creation into team onboarding
- Automate requirements gathering for new projects
- Build custom workflows on top of base agents
- Create CI/CD integration for idea validation

**Quote:**
> "I want to trigger the requirements workflow from our project creation script. Can't do that with a web UI."

### Tertiary User: The Script-Curious Founder

**Demographics:**
- Age: 22-40
- Experience: 1-3 years development
- Current role: Non-technical founder learning to code
- Technical skill: Medium (can follow tutorials, copy-paste scripts)

**Behaviors:**
- Learning terminal basics
- Follows CLI tutorials
- Wants to "look technical"
- Intimidated by web UIs (too many options)
- Prefers guided, linear workflows

**Pain Points:**
- Web UIs are overwhelming (too many buttons)
- Uncertainty about what to do next
- Wants step-by-step guidance
- Fears making wrong choices

**Goals:**
- Simple, guided CLI experience
- Clear next steps always visible
- Can't accidentally break anything
- Learn terminal skills while building

**Quote:**
> "The web UI has so many options. With a CLI, I just type what it tells me to type. I know I can't screw it up."

---

## 3. Core Features (MoSCoW Prioritization)

### MUST HAVE (MVP - Cannot launch without these)

#### Feature 1: Mastra Server Management
**Description:** Manage the Mastra server lifecycle from CLI
**User Story:** As a developer, I want to start/stop the Mastra server without manually running Docker or Node commands, so I can focus on building.

**Acceptance Criteria:**
- `build-agent server start` - Starts Mastra server (detects Docker or local Node)
- `build-agent server stop` - Stops Mastra server gracefully
- `build-agent server status` - Shows server health and configuration
- `build-agent server logs` - Tails server logs
- Server runs in background (doesn't block terminal)
- Auto-detects required environment variables
- Validates configuration before starting

**Priority:** MUST HAVE (nothing works without the server)

---

#### Feature 2: Idea Initialization
**Description:** Create new idea with GitHub repo and waterfall branches
**User Story:** As a founder, I want to create a new idea from the command line, so I can start working immediately without opening a browser.

**Acceptance Criteria:**
- `build-agent init <name>` - Creates idea with inline name
- `--description <text>` flag for idea description
- `--interactive` flag for guided prompts
- Creates GitHub repository (private by default)
- Sets up all 6 waterfall branches
- Initializes requirements docs
- Returns repo URL and idea ID
- Progress indicator shows workflow steps
- Error handling with helpful messages

**Priority:** MUST HAVE (core functionality)

---

#### Feature 3: Workflow Execution
**Description:** Execute Mastra workflows for each waterfall phase
**User Story:** As a developer, I want to run the requirements workflow from CLI, so I can generate documentation without manual work.

**Acceptance Criteria:**
- `build-agent run <phase>` - Executes workflow for specified phase
- Supported phases: requirements, analysis, design, implementation, testing, validation
- Shows real-time progress of workflow steps
- Displays AI-generated content as it's created
- Saves deliverables to correct branch
- Commits changes to GitHub with descriptive messages
- Returns success/failure status
- Option for `--dry-run` to preview without committing

**Priority:** MUST HAVE (core AI functionality)

---

#### Feature 4: Status and Progress Tracking
**Description:** View current idea status and completion progress
**User Story:** As a founder, I want to see which phases are complete and what's next, so I know where I am in the process.

**Acceptance Criteria:**
- `build-agent status` - Shows current phase, completion %, next steps
- Visual progress bar for current phase
- List of completed phases (with checkmarks)
- List of pending phases
- Current branch information
- GitHub repo link
- Last activity timestamp
- Estimates time remaining (based on historical data)

**Priority:** MUST HAVE (essential for navigation)

---

#### Feature 5: Agent Chat Interface
**Description:** Interactive chat with current phase's AI agent
**User Story:** As a founder, I want to ask the AI questions about my current phase, so I can get guidance without reading documentation.

**Acceptance Criteria:**
- `build-agent chat` - Opens interactive chat session
- `build-agent chat "<message>"` - One-shot question/answer
- Agent responds in context of current phase
- Agent can only access current phase branch (branch-locked)
- Chat history saved to `.build-agent/chat-history.json`
- Exit with `Ctrl+C` or `exit` command
- Supports multi-line input
- Markdown rendering in terminal

**Priority:** MUST HAVE (core AI interaction)

---

### SHOULD HAVE (Important but not MVP-blocking)

#### Feature 6: Configuration Management
**Description:** Manage API keys, GitHub tokens, and settings
**User Story:** As a developer, I want to configure the CLI once and have it remember my settings, so I don't re-enter credentials every time.

**Acceptance Criteria:**
- `build-agent config set <key> <value>` - Set configuration
- `build-agent config get <key>` - Get configuration value
- `build-agent config list` - Show all configuration
- Stored in `~/.build-agent/config.json`
- Encrypted credential storage
- Supports: OPENAI_API_KEY, GITHUB_TOKEN, GITHUB_USER
- Environment variable override support
- Validates configuration before use

**Priority:** SHOULD HAVE (improves UX significantly)

---

#### Feature 7: Idea Switching
**Description:** Work on multiple ideas and switch between them
**User Story:** As a developer with multiple ideas, I want to switch between them without re-initializing, so I can work on parallel projects.

**Acceptance Criteria:**
- `build-agent list` - Show all ideas
- `build-agent switch <idea-name>` - Switch active idea
- `build-agent current` - Show current active idea
- Active idea stored in `.build-agent/current-idea.json`
- Can work on multiple ideas in different terminal sessions
- Validates idea exists before switching
- Shows idea metadata (name, phase, last activity)

**Priority:** SHOULD HAVE (multi-project workflow)

---

#### Feature 8: Documentation Viewer
**Description:** View generated documentation from CLI
**User Story:** As a developer, I want to read my requirements or analysis docs without opening GitHub, so I can stay in the terminal.

**Acceptance Criteria:**
- `build-agent docs <filename>` - Display documentation
- `build-agent docs list` - List all docs in current phase
- Markdown rendering in terminal
- Syntax highlighting for code blocks
- Pager support (less-like navigation)
- Option to open in $EDITOR
- Works offline (reads from local git clone)

**Priority:** SHOULD HAVE (reduces context switching)

---

#### Feature 9: Decision Log Viewer
**Description:** View and search decision history
**User Story:** As a founder, I want to see what decisions were made and why, so I can track my reasoning over time.

**Acceptance Criteria:**
- `build-agent decisions` - List all decisions
- `build-agent decisions --phase <phase>` - Filter by phase
- Shows: decision type, AI recommendation, confidence, user choice
- Search by keyword
- Sort by date, confidence, or phase
- Export to JSON or CSV

**Priority:** SHOULD HAVE (transparency and audit trail)

---

### COULD HAVE (Nice to have, time permitting)

#### Feature 10: Workflow Customization
**Description:** Create custom workflows or modify existing ones
**User Story:** As a power user, I want to customize the requirements workflow for my industry, so I get more relevant guidance.

**Acceptance Criteria:**
- `build-agent workflow create <name>` - Create custom workflow
- `build-agent workflow edit <name>` - Edit workflow definition
- YAML-based workflow definition
- Can extend base workflows
- Validate workflow before use
- Share workflows with team

**Priority:** COULD HAVE (advanced feature)

---

#### Feature 11: Team Collaboration
**Description:** Share ideas and collaborate with team members
**User Story:** As a founder with a co-founder, I want to share my idea and let them contribute, so we can collaborate on requirements.

**Acceptance Criteria:**
- `build-agent share <email>` - Invite collaborator
- GitHub repo permissions automatically granted
- Collaborators can run workflows
- Activity feed shows who did what
- Comment system on decisions

**Priority:** COULD HAVE (multiplayer mode)

---

#### Feature 12: Template System
**Description:** Create and use idea templates
**User Story:** As a founder who launches similar ideas, I want to create templates for common patterns, so I can start faster.

**Acceptance Criteria:**
- `build-agent template create <name>` - Save current idea as template
- `build-agent template list` - Show available templates
- `build-agent init --template <name>` - Create from template
- Templates include pre-filled requirements, assumptions, goals
- Share templates with community

**Priority:** COULD HAVE (efficiency boost)

---

### WON'T HAVE (Explicitly out of scope for MVP)

#### Feature 13: Web Dashboard from CLI
**Reason:** Defeats the purpose of CLI-first approach. Users can still access web UI separately.

#### Feature 14: Built-in Code Editor
**Reason:** Users have preferred editors. Not our job to replicate $EDITOR.

#### Feature 15: Real-time Collaboration (WebSocket)
**Reason:** Too complex for MVP. Async collaboration via Git is sufficient initially.

#### Feature 16: Mobile App
**Reason:** CLI is for desktop developers. Mobile is wrong context.

#### Feature 17: GUI Wrapper
**Reason:** Contradicts CLI-first philosophy. If users want GUI, use web version.

---

## 4. User Personas (Detailed)

### Persona 1: Alex the Indie Hacker

**Background:**
- 32 years old, solo developer
- Built 3 failed SaaS products
- Full-time job as senior engineer, building startup on nights/weekends
- Lives in terminal: uses Neovim, tmux, and custom shell scripts
- Deeply frustrated by previous failures due to lack of structure

**Goals:**
- Launch next idea with proper validation
- Work efficiently in limited time (10 hours/week)
- Integrate AI guidance into existing workflow
- Build faster without sacrificing quality

**Frustrations:**
- Previous ideas failed due to building wrong thing
- Web UIs are too slow and clunky
- Needs structure but hates overhead
- Limited time means every minute counts

**How This CLI Helps:**
- Launches ideas in seconds, not minutes
- Structured methodology prevents vibecoding
- Works in terminal (no context switching)
- Scriptable (can automate repetitive parts)

**Quote:**
> "I have 2 hours tonight to work on my idea. I can't waste 20 minutes clicking through a web UI. I need to `build-agent run requirements` and get back to coding."

---

### Persona 2: Sarah the Technical Founder

**Background:**
- 28 years old, first-time founder
- Left FAANG job to build startup
- Strong engineering skills, weak product skills
- Tends to over-engineer and build too early
- Raised $100K pre-seed, needs to show progress

**Goals:**
- Validate idea before building
- Follow proven methodology
- Show investors structured progress
- Avoid analysis paralysis

**Frustrations:**
- Knows she needs validation but doesn't know how
- Gets lost in possibilities
- Builds features nobody wants
- Struggles with "what's next?"

**How This CLI Helps:**
- Guided, linear workflow (no paralysis)
- AI prevents over-engineering
- Clear phases show investor progress
- Can't skip validation steps

**Quote:**
> "I know I should do customer research, but I don't know where to start. With `build-agent run requirements`, it just... does it for me. Asks the right questions. Creates the right docs."

---

### Persona 3: Mike the DevOps Lead

**Background:**
- 42 years old, 15 years experience
- Works at mid-size startup
- Builds internal tools for engineering team
- Automates everything
- Side project: wants to build developer tools

**Goals:**
- Integrate AI guidance into team's project creation workflow
- Automate idea validation for engineering proposals
- Build custom tooling on top of Mastra
- Create repeatable processes

**Frustrations:**
- Team has no structure for new projects
- Every project starts differently
- Can't automate web UIs
- Needs programmatic access

**How This CLI Helps:**
- Fully scriptable and automatable
- Can integrate into team workflows
- API access to Mastra agents
- Composable with other tools

**Quote:**
> "I want to add idea validation to our project creation script. Can't do that with a web UI. But with this CLI? Just add `build-agent init` to the bash script."

---

## 5. Use Cases

### Use Case 1: Quick Idea Launch

**Actor:** Alex (Indie Hacker)  
**Goal:** Launch new idea in under 2 minutes  
**Precondition:** CLI installed, configured

**Flow:**
1. Alex has idea: "Automated invoice reminder system"
2. Opens terminal (already there)
3. Types: `build-agent init "Invoice Reminder" --description "Automated payment reminders for freelancers"`
4. CLI shows progress: Creating repo... Setting up branches... Initializing docs...
5. 30 seconds later: "✓ Idea created! Run 'build-agent run requirements' to start."
6. Types: `build-agent run requirements`
7. Watches as AI generates requirements doc
8. 90 seconds later: Requirements complete
9. Types: `build-agent docs REQUIREMENTS.md` to review
10. Satisfied, moves to analysis: `build-agent run analysis`

**Outcome:** Idea launched with proper requirements and analysis in under 2 minutes.

**Time Violence Eliminated:** 
- Old way (web): ~45 seconds navigation + form + submission
- CLI way: 5 seconds to type command
- Savings: 40 seconds × 10 ideas/month = 400 seconds = 6.6 minutes/month

---

### Use Case 2: Automation Integration

**Actor:** Mike (DevOps Lead)  
**Goal:** Integrate idea validation into team's project creation workflow  
**Precondition:** Team has project creation script

**Flow:**
1. Mike opens team's `create-project.sh` script
2. Adds after line 15:
```bash
# Validate idea with AI Cofounder
build-agent init "$PROJECT_NAME" --description "$PROJECT_DESC" --interactive=false
build-agent run requirements --auto-accept
build-agent run analysis --auto-accept
build-agent docs REQUIREMENTS.md > docs/requirements.pdf
```
3. Commits to team repo
4. Next time someone creates project: automatic validation
5. Requirements and analysis docs generated automatically
6. Team lead reviews before approving

**Outcome:** Every new project now has AI-validated requirements without manual intervention.

---

### Use Case 3: Learning and Iteration

**Actor:** Sarah (Technical Founder)  
**Goal:** Understand why her assumptions are risky  
**Precondition:** Completed requirements phase

**Flow:**
1. Sarah finishes requirements: `build-agent run requirements`
2. Reviews assumptions: `build-agent docs ASSUMPTIONS.md`
3. Confused about one assumption
4. Asks AI: `build-agent chat "Why is the assumption about user payment behavior critical?"`
5. AI explains in terminal
6. Still confused, asks follow-up: `build-agent chat "What's the best way to validate this?"`
7. AI suggests interview questions
8. Sarah implements validation plan
9. Updates assumptions: Opens in editor, commits changes
10. Asks: `build-agent chat "Are my assumptions better now?"`
11. AI reviews, gives feedback

**Outcome:** Sarah learns by interacting with AI in natural, conversational way without leaving terminal.

---

## 6. Technical Requirements

### Performance Requirements
- Command execution: < 2 seconds (excluding AI calls)
- AI workflow execution: < 60 seconds per phase
- Server start time: < 10 seconds
- Memory footprint: < 100MB (CLI tool itself)
- Support for: macOS, Linux, Windows (WSL)

### Compatibility Requirements
- Node.js: 20+ required
- Git: 2.30+ required
- Docker: Optional (for Mastra server)
- Terminal: ANSI color support preferred
- Shell: bash, zsh, fish compatible

### Security Requirements
- Credentials stored encrypted
- GitHub tokens never logged
- API keys not included in git commits
- Secure credential transmission to Mastra server
- Rate limiting on API calls

### Reliability Requirements
- Graceful error handling (no crashes)
- Automatic retry on network failures
- State recovery after interruption
- Validation before destructive operations
- Backup before overwriting files

---

## 7. Constraints

### Technical Constraints
- Must use existing Mastra backend (no reimplementation)
- Must maintain branch-locking (can't bypass phase restrictions)
- Must work with existing GitHub API limits
- Must support offline docs viewing (local git clone)

### Business Constraints
- Cannot bypass subscription tiers (free users still limited)
- Must track usage for billing
- Cannot expose internal APIs publicly
- Must maintain audit trail for compliance

### User Experience Constraints
- Must work in 80-column terminal
- Must be usable without mouse
- Must provide help text for all commands
- Must follow CLI best practices (POSIX-like flags)

---

## 8. Success Criteria

### User Adoption
- **Target:** 30% of web users also adopt CLI within first month
- **Measure:** Track CLI tool downloads vs web logins

### Engagement
- **Target:** CLI users create 2x more ideas than web-only users
- **Measure:** Average ideas per user (CLI vs web)

### Efficiency
- **Target:** Average idea creation time < 10 seconds (vs 45 seconds web)
- **Measure:** Telemetry on `build-agent init` execution time

### Satisfaction
- **Target:** NPS score > 50 for CLI users
- **Measure:** Quarterly survey

### Retention
- **Target:** 70% of CLI users still active after 30 days
- **Measure:** Track CLI command execution frequency

---

## 9. Out of Scope (For This Version)

1. **Multi-language support** - English only for MVP
2. **Offline AI mode** - Requires internet connection
3. **Custom AI models** - OpenAI GPT-4 only
4. **Plugin system** - No third-party extensions
5. **GUI mode** - CLI only, no TUI or GUI wrapper
6. **Windows native** - WSL required for Windows users
7. **Mobile support** - Desktop only

---

## Requirements Approval

**Status:** ✅ COMPLETE  
**Ready for Analysis Phase:** YES  
**Reviewer:** Skippy the Magnificent (Master of Apprentices)

**Validation Checklist:**
- ✅ Problem clearly defined (Time Violence from web UI)
- ✅ Target users identified with personas (3 detailed personas)
- ✅ Core features listed with MoSCoW (12 features prioritized)
- ✅ Use cases documented (3 complete use cases)
- ✅ Success criteria defined (5 measurable metrics)
- ✅ Constraints acknowledged (technical, business, UX)
- ✅ Out of scope explicitly stated (7 items)

**Next Phase:** Analysis - Identify unknowns, define MVP, assess risks

