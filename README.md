# Build Agent CLI
## AI-Powered Development Tool with Shell-Based Agents

**Launch validated ideas with AI-guided waterfall methodology**

---

## 🎯 What is This?

Build Agent is a CLI tool for systematic software development powered by AI:

1. **Idea Creation** - Create new ideas with structured requirements
2. **Agent Transforms** - Fork into specialized agents that play specific games
3. **Planning** - Generate comprehensive solution plans for any problem
4. **TDD Workflow** - Automated test-driven development with AI agents
5. **Problem Solving** - Fix bugs in any GitHub repository
6. **Workspace Management** - Isolated git environments for parallel development

**Built on proven software engineering principles:**
- Requirements-first development (think before building)
- Waterfall methodology (Requirements → Analysis → Design → Implementation)
- Test-Driven Development (Red → Green → Refactor)
- Workspace isolation (no branch switching conflicts)
- Domain-specific optimization (different agents for different games)

---

## ⚡ Quick Start

### 1. Install

```bash
npm install
npm run build
npm link  # Makes 'build-agent' available globally
```

### 2. Configure OpenRouter

```bash
# Get free API key: https://openrouter.ai/
export OPENROUTER_API_KEY="sk-or-v1-your-key-here"

# Add to ~/.zshrc or ~/.bashrc to persist
echo 'export OPENROUTER_API_KEY="sk-or-v1-..."' >> ~/.zshrc
```

### 3. Use It!

```bash
# Generate solution plan for any problem
build-agent plan "https://github.com/org/repo" "Fix the bug"

# Or use shell agents directly
./agents/planning-agent.sh ./repo "Problem description" PLAN.md
```

---

## 📖 Commands

### Create New Idea

```bash
# Start a new idea/project with structured requirements
build-agent create
```

**Interactive prompts guide you through:**
- Idea name and description
- Problem statement
- Target users
- Technical constraints
- Success criteria
- Timeline

**Creates:**
- New git repository in `./workspaces/<idea-name>/`
- `requirements` branch with AI-enhanced REQUIREMENTS.md
- Structured requirements document
- Ready for development

**Options:**
- `--workspace-dir <dir>` - Custom workspace location
- `--skip-ai` - Use basic template instead of AI enhancement

---

### Start Development

```bash
# Create develop branch from requirements
build-agent develop [idea-path]
```

**Run from idea workspace or specify path.**

**Creates:**
- `develop` branch from requirements
- Development-ready workspace
- Updated README for development phase

**Options:**
- `--force` - Force recreate develop branch if exists

---

### Transform into Specialized Agent

```bash
# Fork build-agent into domain-specific version
build-agent transform <type>

# Example: Create entrepreneur agent
build-agent transform entrepreneur
```

**Available Transforms:**
- 💰 **entrepreneur** - Tracks ROI → Financial projections
- 🔨 **builder** - Ship velocity → AI Cofounder Webapp ✅
- 🔄 **activist** - Pivot speed → Marketing Page ✅
- 🔮 **speculator** - Future accuracy → Sales & Investment Flows ✅
- 🔬 **researcher** - Pattern recognition → External Context ✅
- ✅ **validator** - User feedback (coming soon)
- 🐋 **whale** - Scale impact (coming soon)

**Creates:**
- Complete specialized agent (e.g., `entrepreneur-agent/`)
- Domain-specific prompts and requirements
- Game-specific tracking system
- Independent git repository

**Options:**
- `--output-dir <dir>` - Where to create agent
- `--list` - Show all available transforms

**See:** `TRANSFORM_SYSTEM.md` for complete documentation

---

### Planning

```bash
# Generate solution plan (test + implementation guide)
build-agent plan <repo-url> "<problem>" --output PLAN.md
```

**Output:** Comprehensive markdown plan to use with Cursor

---

### Problem Solving

```bash
# Clone repo, create workspaces, attempt to solve problem
build-agent solve <repo-url> "<problem>"
```

**Creates:** test/ and develop/ workspaces with branches

---

### Dev Server

```bash
# Start Mastra dev server (for testing Mastra-based agents)
build-agent dev         # Start
build-agent dev:stop    # Stop
build-agent dev:status  # Check
build-agent dev:logs    # View logs
```

---

### TDD Workflow (Mastra-based)

```bash
# Run TDD agent network (experimental)
build-agent tdd "<feature-description>"
```

**Note:** Mastra agents have parsing issues. Use shell agents instead (see below).

---

## 🐚 Shell-Based Agents (RECOMMENDED)

**Simple bash scripts that actually work:**

### Planning Agent

```bash
./agents/planning-agent.sh <repo-path> "<problem>" OUTPUT.md
```

**Example:**
```bash
./agents/planning-agent.sh \
  workspaces/mastra-ai-mastra/main \
  "Fix bundler LibSQL import transformation" \
  MASTRA_FIX.md
```

### TDD Orchestrator

```bash
./agents/tdd-orchestrator.sh "<feature-description>" [max-iterations]
```

**Example:**
```bash
./agents/tdd-orchestrator.sh "Add hello command" 5
```

**Runs complete TDD cycle:**
1. Test agent writes failing test
2. Develop agent implements feature  
3. Iterates until tests pass
4. Syncs branches

### Individual Agents

```bash
# Write tests
./agents/test-agent.sh .build-agent/test "Add feature X"

# Implement feature
./agents/develop-agent.sh .build-agent/develop tests/feature.test.ts
```

**See:** `agents/README.md` for complete documentation

---

## 🏗️ Architecture

### Workspace Structure

```
.build-agent/
├── test/       # Test branch (permanently checked out)
└── develop/    # Develop branch (permanently checked out)
```

**No branch switching = No conflicts**

### Two Approaches

**1. Shell Agents (Simple, Reliable)** ⭐
- Direct OpenRouter API calls
- 400 lines of bash
- No frameworks
- Just works

**2. Mastra Agents (Complex, Experimental)**
- TypeScript/framework-based
- 3000+ lines of code
- Powerful but has issues
- For advanced use cases

**Recommendation: Start with shell agents.**

---

## 📚 Documentation

- `MULTI_AGENT_SYSTEM.md` - Complete business system (5 agents) **[NEW]**
- `TRANSFORM_SYSTEM.md` - Agent transforms and games
- `IDEA_WORKFLOW.md` - Creating and developing ideas
- `QUICK_START_IDEAS.md` - Quick reference for idea creation
- `agents/README.md` - Shell agents documentation
- `agents/SETUP.md` - Setup guide
- See `requirements` and `design` branches for full waterfall docs

---

## 🎯 Workflow Examples

### Create a New Idea

```bash
# 1. Create new idea with requirements
build-agent create

# Answer the interactive prompts:
# - Idea name: My Awesome App
# - Description: A tool that does X for Y users
# - Problem: Users struggle with Z
# - Target users: Developers who need...
# - etc.

# 2. Review generated requirements
cd workspaces/my-awesome-app
cat REQUIREMENTS.md

# 3. Refine requirements (optional)
vim REQUIREMENTS.md
git add REQUIREMENTS.md
git commit -m "Refine user stories"

# 4. Start development
build-agent develop

# 5. Build features
build-agent plan . "Implement core authentication"
# Or use Cursor to implement from requirements

# 6. Ship! ✅
```

### Transform into Specialized Agent

```bash
# 1. Create entrepreneur agent (tracks ROI)
build-agent transform entrepreneur

# 2. Setup
cd entrepreneur-agent
npm install && npm run build && npm link

# 3. Create idea with ROI tracking
entrepreneur-agent create

# Interactive prompts include:
# - Initial budget: $5000
# - Monthly costs: $500
# - Revenue model: Subscription
# - Price point: $49/month
# - Target customers: 100
# - Weekly hours: 20
# - Weeks to MVP: 8
# - Weeks to revenue: 4

# 4. Review requirements with ROI calculations
cd workspaces/my-idea
cat REQUIREMENTS.md
# Includes: Predicted ROI, break-even time, financial projections

# 5. Build and track
entrepreneur-agent develop
entrepreneur-agent plan . "Build MVP"
# Track actuals monthly to improve predictions

# 6. Win the game!
# Success = accurate predictions + positive ROI
```

### Fix a Bug in Open Source

```bash
# 1. Generate plan
build-agent plan \
  "https://github.com/org/project" \
  "Fix the import transformation bug" \
  FIX_PLAN.md

# 2. Review plan
cat FIX_PLAN.md

# 3. Open in Cursor
cursor workspaces/org-project/main

# 4. Use Cursor Composer with plan sections
# Let AI implement guided by plan

# 5. Create PR
cd workspaces/org-project/main
gh pr create
```

### Build Feature with TDD

```bash
# 1. Run TDD cycle
./agents/tdd-orchestrator.sh "Add server management commands" 10

# 2. Review implementation
cd .build-agent/develop
git log -5
npm test

# 3. Merge to main
git checkout main
git merge develop
```

### Use with Cursor (Hybrid Approach)

```bash
# 1. Generate plan
./agents/planning-agent.sh . "Add new feature" FEATURE_PLAN.md

# 2. Open in Cursor
cursor .

# 3. In Cursor Composer:
"Using the plan in FEATURE_PLAN.md, implement the test section"

# 4. In Cursor again:
"Using the plan in FEATURE_PLAN.md, implement the feature"

# Ship! ✅
```

---

## 🎓 Philosophy

**Hybrid AI Development:**

- **AI Plans** (they're excellent at analysis)
- **Cursor Implements** (reliable code generation)
- **You Orchestrate** (full control)
- **Result:** Quality code, shipped fast

**Keep it simple:**
- Use shell scripts when possible
- Frameworks when necessary
- Always validate with tests
- Ship often

---

## 📊 Project Status

**Complete:** ✅
- Requirements & Analysis (21,700 lines)
- Design Phase (2,332 lines)  
- Workspace Architecture
- Shell-based agent system
- Plan command (OpenRouter)
- Solve command
- Dev server

**Ready to use:**
- Shell agents for TDD
- Plan generation for Cursor
- Workspace isolation

---

## 🚀 Get Started

```bash
# 1. Setup
export OPENROUTER_API_KEY="sk-or-v1-..."
npm install

# 2. Test planning
./agents/planning-agent.sh . "Add a feature" TEST.md
cat TEST.md

# 3. If it works, you're ready!

# 4. Start building
./agents/tdd-orchestrator.sh "First feature" 5
```

---

## 📝 License

MIT

---

**Simple. Reliable. Ships code.** ✅

