# Idea Creation Workflow

**New Feature:** Create and manage "possible futures" with structured requirements

---

## Overview

The build-agent now supports creating **new ideas** from scratch with:
- Git repository initialization
- Requirements-first approach (requirements branch)
- AI-enhanced requirements generation
- Smooth transition to development (develop branch)
- Integration with existing agents

---

## Commands

### 1. `build-agent create`

**Purpose:** Initialize a new idea with structured requirements

**What it does:**
- Interactive prompts gather idea details:
  - Idea name
  - Description (one sentence)
  - Problem statement
  - Target users
  - Technical constraints
  - Success criteria
  - Timeframe (1 week to 6 months)
- Creates git repository in `./workspaces/<idea-name>/`
- Initializes with `requirements` branch (NOT main/master)
- Generates AI-enhanced REQUIREMENTS.md (or basic template with `--skip-ai`)
- Creates README.md and .gitignore

**Usage:**
```bash
build-agent create

# With options
build-agent create --workspace-dir ~/my-ideas
build-agent create --skip-ai  # Use basic template
```

**Output Structure:**
```
workspaces/my-awesome-app/
├── REQUIREMENTS.md       # AI-generated comprehensive requirements
├── README.md            # Status: Requirements Phase
├── .gitignore
└── .git/
    └── [requirements branch]
```

---

### 2. `build-agent develop`

**Purpose:** Create develop branch when ready to start coding

**What it does:**
- Verifies you're in an idea workspace (checks for REQUIREMENTS.md)
- Handles uncommitted changes on requirements branch
- Creates `develop` branch from requirements
- Updates README for development phase
- Shows next steps for building

**Usage:**
```bash
# From within idea workspace
cd workspaces/my-awesome-app
build-agent develop

# Or specify path
build-agent develop ./workspaces/my-awesome-app

# Force recreate
build-agent develop --force
```

**Smart Features:**
- Detects if already on develop branch
- Handles existing develop branch (ask user what to do)
- Prompts to commit uncommitted changes
- Safe by default

---

## Complete Workflow

### Phase 1: Idea Creation

```bash
# Create new idea
build-agent create
```

**Interactive prompts:**
```
? What's your idea called? 
  → Task Management API

? Describe your idea in one sentence:
  → A RESTful API for managing tasks with teams and priorities

? What problem does this solve?
  → Teams struggle with task coordination across tools

? Who are your target users?
  → Small development teams (5-20 people)

? Any technical constraints or requirements?
  → Must be RESTful, use PostgreSQL, deploy to AWS

? How will you measure success?
  → 10 teams using it, <200ms response time, 99.9% uptime

? Target timeframe:
  → 1 month
```

**Result:**
- `workspaces/task-management-api/` created
- Requirements branch initialized
- Comprehensive REQUIREMENTS.md generated (with AI)
- Ready for review

### Phase 2: Requirements Review

```bash
cd workspaces/task-management-api

# Review AI-generated requirements
cat REQUIREMENTS.md

# Refine if needed
vim REQUIREMENTS.md
git add REQUIREMENTS.md
git commit -m "Add specific performance requirements"

# Or switch to requirements branch anytime
git checkout requirements
```

### Phase 3: Start Development

```bash
# Create develop branch
build-agent develop

# Now on develop branch, ready to build
```

### Phase 4: Implementation

```bash
# Option A: Use agents to generate plan
build-agent plan . "Implement user authentication endpoint"

# Option B: Use agents to build automatically
build-agent solve . "Build MVP endpoints" --use-shell-agents

# Option C: Use Cursor manually
cursor .
# In Cursor: "Review REQUIREMENTS.md and implement the authentication module"
```

### Phase 5: Testing & Iteration

```bash
# Use TDD orchestrator
cd workspaces/task-management-api
../../agents/tdd-orchestrator.sh "Add task priority filtering" 10

# Or manual TDD
npm test
git commit -m "Add task filtering tests"
# Implement feature
git commit -m "Implement task filtering"
```

---

## Integration with Existing Commands

### `build-agent plan` - Works with idea workspaces

```bash
# From requirements branch - analyze before building
git checkout requirements
build-agent plan . "Overall architecture design" --output ARCHITECTURE.md

# From develop branch - plan specific features
git checkout develop
build-agent plan . "Implement WebSocket notifications" --output FEATURE_PLAN.md
```

### `build-agent solve` - Can work on idea repos

```bash
# If you created idea locally, treat it as a local repo
build-agent solve "file://$(pwd)/workspaces/my-idea" "Build MVP"
```

### Shell Agents - Work directly in workspaces

```bash
# Planning agent
./agents/planning-agent.sh \
  workspaces/my-idea \
  "Build authentication system" \
  AUTH_PLAN.md

# TDD orchestrator (from develop branch)
cd workspaces/my-idea
git checkout develop
../../agents/tdd-orchestrator.sh "Add user login" 10
```

---

## Architecture Details

### Branch Strategy

**requirements branch:**
- Source of truth for what to build
- Contains REQUIREMENTS.md
- Updated when requirements change
- Never contains code (except examples in docs)

**develop branch:**
- Where all development happens
- Branched from requirements
- Contains actual implementation
- Can be recreated from requirements if needed

**Why this model?**
- Clear separation: requirements vs implementation
- Requirements are versioned and trackable
- Can restart development without losing requirements
- Easy to pivot: update requirements, recreate develop
- Natural documentation: requirements stay clean

### AI Enhancement

**What AI generates in REQUIREMENTS.md:**
1. Problem analysis and market context
2. User personas and use cases
3. Functional requirements (features)
4. User stories (5-7 core stories)
5. Technical requirements and architecture suggestions
6. Non-functional requirements (performance, security, scalability)
7. MVP scope vs future enhancements
8. Risk analysis
9. Open questions

**AI Model:** Google Gemini 2.0 Flash (via OpenRouter)
- Free tier available
- Fast generation (~5-10 seconds)
- Good quality for requirements analysis
- Fallback to basic template if API fails

---

## Examples

### Example 1: SaaS Product

```bash
build-agent create

Idea: Customer Feedback Platform
Description: Collect and analyze customer feedback across multiple channels
Problem: Companies lose feedback in scattered tools
Target: SaaS companies with 50-500 customers
Constraints: Must integrate with Slack, email, web widgets
Success: 5 paying customers, 10k feedback items processed
Timeframe: 3 months
```

### Example 2: Developer Tool

```bash
build-agent create

Idea: Code Quality Dashboard
Description: Real-time dashboard showing code quality metrics
Problem: Teams don't catch quality issues until code review
Target: Development teams using GitHub
Constraints: GitHub API, React frontend, Node.js backend
Success: 20 repos monitored, <1s metric updates
Timeframe: 6 weeks
```

### Example 3: API Service

```bash
build-agent create

Idea: Image Processing API
Description: RESTful API for image transformations
Problem: Current solutions too expensive for small teams
Target: Indie developers, small startups
Constraints: Must be under $10/month for 1000 images
Success: 100 users, 99.9% uptime, <2s processing
Timeframe: 1 month
```

---

## Best Practices

### Requirements Phase

1. **Be Specific:** AI generates better requirements from specific inputs
2. **Include Constraints:** Technical constraints guide architecture recommendations
3. **Define Success:** Measurable criteria help scope MVP
4. **Realistic Timeframe:** Affects scope recommendations

### Requirements Review

1. **Read AI Output:** AI often identifies edge cases you didn't think of
2. **Refine User Stories:** Make them specific to your domain
3. **Validate Technical Suggestions:** AI recommendations are starting points
4. **Document Assumptions:** Add notes about decisions made

### Development Phase

1. **Reference Requirements:** Check requirements branch when in doubt
2. **Update Requirements:** If scope changes, update requirements first
3. **Small Commits:** Commit often on develop branch
4. **Test Everything:** Use TDD agents or write tests manually

---

## Troubleshooting

### "Not a git repository" error

```bash
# Make sure you're in a workspace created by build-agent create
cd workspaces/my-idea
build-agent develop
```

### "No REQUIREMENTS.md found" error

```bash
# This command only works on idea workspaces
# For external repos, use build-agent solve instead
build-agent solve "https://github.com/org/repo" "problem"
```

### AI generation fails

```bash
# Use basic template instead
build-agent create --skip-ai

# Or check OpenRouter API key
echo $OPENROUTER_API_KEY
```

### Want to restart development

```bash
# Safe: recreate develop branch from requirements
build-agent develop --force

# Careful: this deletes current develop branch!
```

---

## File Structure

### Created Files

**REQUIREMENTS.md:**
- Comprehensive requirements document
- AI-generated or basic template
- Living document (update as needed)

**README.md (requirements branch):**
- Status: Requirements Phase
- Links to REQUIREMENTS.md
- Explains branch structure
- Next steps

**README.md (develop branch):**
- Status: Development Phase
- Links back to requirements
- Development instructions
- Workflow guide

**.gitignore:**
- Standard ignore patterns
- node_modules, dist, .env, etc.
- Safe defaults

---

## Future Enhancements

Potential additions to this workflow:

1. **Template library:** Pre-built requirements templates for common project types
2. **Requirements validation:** Check completeness before starting develop
3. **Automatic branch sync:** Keep develop aligned with requirements updates
4. **Progress tracking:** Track which requirements are implemented
5. **Multi-branch development:** Support feature branches off develop
6. **GitHub integration:** Optionally push to GitHub
7. **Requirements diff:** Compare requirements vs implemented features

---

## Summary

**New Workflow: Idea → Requirements → Development**

```
build-agent create         → requirements branch with REQUIREMENTS.md
   ↓
Review & refine           → git commits on requirements branch
   ↓
build-agent develop       → develop branch created
   ↓
build-agent plan/solve    → Implementation with AI agents
   ↓
Test & iterate            → TDD workflow
   ↓
Ship! ✅                   → Production-ready code
```

**Key Benefits:**
- ✅ Requirements first (think before building)
- ✅ AI-assisted requirements analysis
- ✅ Clear separation: requirements vs code
- ✅ Versioned requirements history
- ✅ Easy to restart development
- ✅ Works with existing build-agent commands
- ✅ Natural documentation

---

**Created:** 2025-10-17  
**Commands:** `build-agent create`, `build-agent develop`  
**Status:** Complete and ready to use ✅

