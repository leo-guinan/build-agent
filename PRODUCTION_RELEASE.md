# Build Agent CLI v0.1.0
## Production Release - Shell-Based AI Development

**Release Date:** October 16, 2025  
**Version:** 0.1.0  
**Branch:** production  
**Status:** ✅ Stable & Production Ready

---

## 🎉 What This Is

A simple, reliable CLI tool for AI-assisted software development using shell-based agents and OpenRouter.

**Core Capabilities:**
1. **Plan Generation** - AI creates comprehensive solution plans for any problem
2. **Workspace Management** - Isolated git environments for TDD workflows
3. **Problem Solving** - Clone any repo, set up TDD infrastructure
4. **Shell Agents** - Simple bash scripts for automated development

---

## ⚡ Quick Start

### Installation

```bash
# Clone and install
git clone <repo-url> build-agent
cd build-agent
git checkout production
npm install
npm run build
npm link

# Configure
export OPENROUTER_API_KEY="sk-or-v1-..."  # Get free key at openrouter.ai
```

### Basic Usage

```bash
# Generate plan for any problem
build-agent plan "https://github.com/org/repo" "Fix the bug"

# Set up TDD workspaces
build-agent solve "https://github.com/org/repo" "Problem description"

# Use shell agents directly
./agents/planning-agent.sh ./repo "Problem" PLAN.md
./agents/tdd-orchestrator.sh "Feature description" 5
```

---

## 📦 What's Included

### CLI Commands (TypeScript)

**`build-agent plan`**
- Generates comprehensive solution plans
- Uses OpenRouter (Gemini 2.0 Flash - free)
- Perfect for use with Cursor
- Output: Markdown file with test + implementation guides

**`build-agent solve`**
- Clones GitHub repository
- Creates test & develop workspaces
- Sets up TDD infrastructure
- Provides next-step instructions

### Shell Agents (Bash)

**`agents/planning-agent.sh`**
- Analyzes problems
- Generates test + implementation plans
- Direct OpenRouter API calls
- ~160 lines of bash

**`agents/test-agent.sh`**
- Writes test specifications
- Creates Vitest test files
- Commits to test workspace
- ~80 lines of bash

**`agents/develop-agent.sh`**
- Implements features
- Makes tests pass
- Commits to develop workspace
- ~110 lines of bash

**`agents/tdd-orchestrator.sh`**
- Orchestrates complete TDD cycles
- Red → Green → Refactor loop
- Automatic iteration
- ~95 lines of bash

**`agents/lib.sh`**
- Shared functions
- API calls, file ops, git ops
- Colored logging
- ~100 lines of bash

**Total:** ~545 lines of simple, readable bash

---

## 🏗️ Architecture

### Workspace Isolation

```
.build-agent/
├── test/      # Test branch (permanently checked out)
└── develop/   # Develop branch (permanently checked out)

workspaces/
└── org-repo/
    ├── main/     # Original repository
    ├── test/     # Test branch workspace
    └── develop/  # Develop branch workspace
```

**No branch switching. No conflicts. Clean separation.**

### Technology Stack

**Runtime:**
- Node.js 20+
- TypeScript (CLI commands)
- Bash (agent scripts)

**AI:**
- OpenRouter API
- Google Gemini 2.0 Flash (free tier)
- Direct API calls (no framework)

**Dependencies (5 total):**
- `@openrouter/ai-sdk-provider` - OpenRouter integration
- `ai` - AI SDK for text generation
- `chalk` - Terminal colors
- `commander` - CLI framework
- `ora` - Loading spinners

---

## 🎯 Use Cases

### 1. Generate Plan for Cursor

```bash
# Generate comprehensive plan
build-agent plan "https://github.com/org/repo" "Fix authentication bug"

# Output: SOLUTION_PLAN.md

# Open in Cursor
cursor workspaces/org-repo/main

# Use plan with Cursor Composer
# AI implements guided by plan
# Create PR
```

### 2. Automated TDD

```bash
# Set up workspaces first
build-agent solve "https://github.com/your/project" "Add feature"

# Run TDD orchestrator
cd workspaces/your-project/main
../../../agents/tdd-orchestrator.sh "Add hello command" 5

# Review and merge
cd ../develop
git log -5
npm test
```

### 3. Manual TDD with AI Assistance

```bash
# Set up workspaces
build-agent solve "https://github.com/your/project" "Add feature"

# Use Cursor in test workspace
cd workspaces/your-project/test
cursor .
# Write tests with AI help

# Use Cursor in develop workspace  
cd ../develop
cursor .
# Implement with AI help

# Standard git workflow
git commit && git push
```

---

## ✨ Philosophy

**Simple beats complex:**
- 545 lines of bash vs 3000+ lines of TypeScript/Mastra
- Direct API calls vs framework abstractions
- Standard Unix tools vs custom implementations
- Debuggable with `set -x` vs complex traces

**Hybrid AI development:**
- AI for planning & analysis
- Cursor for code generation
- You for orchestration
- Result: Quality code, shipped fast

**Production ready:**
- Error handling throughout
- Input validation
- Graceful failures
- Comprehensive logging

---

## 📊 Comparison to Development Version

| Aspect | Develop Branch | Production Branch |
|--------|---------------|-------------------|
| Code | 3000+ TS + 545 bash | 545 bash only |
| Dependencies | 20+ npm packages | 5 npm packages |
| Complexity | High (Mastra framework) | Low (direct API) |
| Reliability | Parsing issues | Rock solid |
| Maintenance | Complex | Simple |
| Status | Experimental | Stable |

**Production branch is the recommended version for all users.**

---

## 🚀 Roadmap

### v0.1.0 (Current) ✅
- Plan generation
- Workspace setup
- Shell-based agents
- OpenRouter integration

### v0.2.0 (Planned)
- Init command (project initialization)
- Status command (show agent activity)
- Chat command (interactive AI assistant)
- Template system

### v0.3.0 (Future)
- Multiple AI provider support
- Advanced TDD orchestration
- CI/CD integration
- Team collaboration features

---

## 📚 Documentation

- `README.md` - Main documentation
- `agents/README.md` - Shell agents documentation
- `agents/SETUP.md` - Setup guide
- `SESSION_COMPLETE.md` - Development history

**Branches:**
- `requirements` - Requirements & analysis documents
- `design` - Design specifications
- `develop` - Development branch (experimental features)
- `production` - Stable release (recommended)

---

## 🎓 Credits

**Developed by:** Leo Guinan  
**Powered by:** OpenRouter + Google Gemini  
**Methodology:** Waterfall + TDD  
**Philosophy:** Simple beats complex

---

## 📝 License

MIT

---

## 🚀 Get Started

```bash
# 1. Get OpenRouter key (free)
https://openrouter.ai/

# 2. Set environment
export OPENROUTER_API_KEY="sk-or-v1-..."

# 3. Test it
./agents/planning-agent.sh . "Add a feature" TEST.md

# 4. Start shipping!
cursor .
```

**Simple. Reliable. Production ready.** ✅

