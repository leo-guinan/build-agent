# Build Agent CLI
## AI-Powered Development Tool with Shell-Based Agents

**Launch validated ideas with AI-guided waterfall methodology**

---

## 🎯 What is This?

Build Agent is a CLI tool for systematic software development powered by AI:

1. **Planning** - Generate comprehensive solution plans for any problem
2. **TDD Workflow** - Automated test-driven development with AI agents
3. **Problem Solving** - Fix bugs in any GitHub repository
4. **Workspace Management** - Isolated git environments for parallel development

**Built on proven software engineering principles:**
- Waterfall methodology (Requirements → Analysis → Design → Implementation)
- Test-Driven Development (Red → Green → Refactor)
- Workspace isolation (no branch switching conflicts)

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

- `agents/README.md` - Shell agents documentation
- `agents/SETUP.md` - Setup guide
- See `requirements` and `design` branches for full waterfall docs

---

## 🎯 Workflow Examples

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

