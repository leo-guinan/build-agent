
# Shell-Based AI Agents
## Simple, Reliable TDD Automation Without Frameworks

**No Mastra. No complexity. Just bash + OpenRouter + jq.**

---

## 🎯 Overview

These are simple shell scripts that orchestrate TDD workflows using AI.

**Benefits:**
- ✅ Simple (100 lines of bash vs 3000 lines of TypeScript)
- ✅ Reliable (no framework parsing issues)
- ✅ Fast (direct API calls)
- ✅ Debuggable (standard Unix tools)
- ✅ No quota issues (OpenRouter, not OpenAI)

---

## 📦 Requirements

```bash
# Install dependencies
brew install jq curl git  # MacOS
# or
apt-get install jq curl git  # Linux

# Set OpenRouter API key
export OPENROUTER_API_KEY="your-key-here"

# Get free key: https://openrouter.ai/
```

---

## 🚀 Usage

### 1. Planning Agent (Generate Solution Plan)

```bash
./agents/planning-agent.sh \
  ./workspaces/mastra-ai-mastra/main \
  "Fix bundler LibSQL import transform bug" \
  MASTRA_FIX_PLAN.md
```

**Output:** Comprehensive markdown plan with test + implementation guides

**Use with Cursor:**
- Open repo in Cursor
- Feed plan sections to Cursor Composer
- Let Cursor generate code guided by AI plan

---

### 2. Test Agent (Write Test Specifications)

```bash
./agents/test-agent.sh \
  .build-agent/test \
  "Add hello command that prints greeting"
```

**What it does:**
1. Analyzes codebase
2. Generates test code with OpenRouter
3. Writes test file to disk
4. Commits to test branch

**Output:** Complete Vitest test file

---

### 3. Develop Agent (Implement Features)

```bash
./agents/develop-agent.sh \
  .build-agent/develop \
  tests/commands/hello.test.ts
```

**What it does:**
1. Pulls test from test branch
2. Generates implementation with OpenRouter
3. Writes code file to disk
4. Runs tests
5. Commits if tests pass

**Output:** Implementation that makes test pass

---

### 4. TDD Orchestrator (Complete Red-Green-Refactor)

```bash
./agents/tdd-orchestrator.sh \
  "Add hello command" \
  10  # max iterations
```

**What it does:**
1. **RED:** Calls test-agent to write failing test
2. **GREEN:** Calls develop-agent to implement fix
3. **REFACTOR:** Iterates until tests pass
4. **SYNC:** Merges develop → test

**Output:** Complete feature with tests

---

## 🏗️ Architecture

```
agents/
├── lib.sh                  # Shared functions
│   ├── call_openrouter()   # API calls
│   ├── write_file()        # File operations
│   ├── commit_changes()    # Git operations
│   └── log_*()             # Colored logging
│
├── planning-agent.sh       # Generate solution plans
├── test-agent.sh           # Write test specs
├── develop-agent.sh        # Implement features
└── tdd-orchestrator.sh     # Run complete TDD cycle
```

---

## 💡 How It Works

### Simple Direct API Calls

```bash
# lib.sh: call_openrouter()
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "model": "google/gemini-2.0-flash-001:free",
    "messages": [{"role": "user", "content": "prompt"}]
  }' | jq -r '.choices[0].message.content'
```

**That's it!** No frameworks, no parsing issues, just works.

### File Writing

```bash
# lib.sh: write_file()
mkdir -p "$(dirname "$file_path")"
echo "$content" > "$file_path"
```

**Simple and reliable.**

### Git Operations

```bash
# lib.sh: commit_changes()
git add .
git commit -m "message"
```

**Standard git workflow.**

---

## 🎯 Example Workflow

### Fix a Bug in Any Repo

```bash
# 1. Clone repo
git clone https://github.com/org/repo workspaces/repo
cd workspaces/repo

# 2. Generate plan
../../agents/planning-agent.sh . "Fix the bug description" FIX_PLAN.md

# 3. Review plan
cat FIX_PLAN.md

# 4. Use with Cursor
cursor .
# Feed plan sections to Cursor Composer
# Let AI implement guided by plan

# 5. Create PR
git add .
git commit -m "fix: Bug description"
gh pr create
```

---

### Build a Feature with TDD

```bash
# 1. Initialize workspaces (if not exists)
npm run dev workspace init

# 2. Run TDD orchestrator
./agents/tdd-orchestrator.sh "Add server start command" 5

# 3. Review results
cd .build-agent/develop
git log -5
npm test

# 4. Merge to main when ready
git checkout main
git merge develop
```

---

## 🔧 Configuration

### OpenRouter Models

Change model in any agent script:

```bash
# Free models (no cost)
google/gemini-2.0-flash-001:free  # Fast, good quality
meta-llama/llama-3.1-8b-instruct:free  # Decent quality

# Paid models (better quality)
anthropic/claude-3.5-sonnet  # Best reasoning
openai/gpt-4o  # Excellent overall
google/gemini-pro-1.5  # Good balance
```

### Environment Variables

```bash
export OPENROUTER_API_KEY="sk-or-v1-..."  # Required
export DEBUG=1  # Enable debug logging
```

---

## 📊 Comparison

| Feature | Mastra Agents | Shell Agents |
|---------|---------------|--------------|
| Setup | 3000+ lines TS | 300 lines bash |
| Dependencies | 20+ npm packages | jq, curl, git |
| API | Wrapped/abstracted | Direct calls |
| Debugging | Complex traces | stdout/stderr |
| Reliability | Parsing issues | Rock solid |
| Speed | Medium | Fast |
| Flexibility | Framework-bound | Total freedom |

---

## 🎓 Philosophy

**"Do one thing well"** - Unix philosophy

Each script:
- Does ONE thing
- Does it simply
- Composes with others
- No hidden magic
- Easy to understand
- Easy to modify

**No frameworks. No abstractions. Just code that works.**

---

## 🚀 Get Started

```bash
# 1. Get OpenRouter key (free)
open https://openrouter.ai/

# 2. Set environment variable
export OPENROUTER_API_KEY="your-key"

# 3. Make scripts executable
chmod +x agents/*.sh

# 4. Test planning agent
./agents/planning-agent.sh . "Add a new feature" PLAN.md

# 5. Review plan
cat PLAN.md

# 6. Use with Cursor!
cursor .
```

---

**Simple. Reliable. Production ready.** ✅

