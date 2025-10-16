# Shell-Based Agents Setup Guide

## Quick Start (2 minutes)

### 1. Get OpenRouter API Key (Free!)

```bash
# Visit https://openrouter.ai/
# Sign up (free)
# Get API key from dashboard
```

### 2. Set Environment Variable

```bash
# Add to ~/.zshrc or ~/.bashrc
export OPENROUTER_API_KEY="sk-or-v1-your-key-here"

# Or just for this session
export OPENROUTER_API_KEY="sk-or-v1-your-key-here"
```

### 3. Test It Works

```bash
# Test planning agent on this repo
./agents/planning-agent.sh . "Add a README file" TEST_PLAN.md

# Review output
cat TEST_PLAN.md
```

**If you see a plan, you're ready!** ✅

---

## 🎓 Detailed Usage

### Planning Agent

**Generates comprehensive solution plans for any problem:**

```bash
./agents/planning-agent.sh <repo-path> "<problem>" [output-file]
```

**Example:**
```bash
./agents/planning-agent.sh \
  workspaces/mastra-ai-mastra/main \
  "Fix bundler import transformation bug" \
  MASTRA_FIX.md
```

**Output:** Test plan + Implementation plan + Cursor instructions

---

### Test Agent

**Writes test specifications for features:**

```bash
./agents/test-agent.sh <workspace-path> "<feature-description>"
```

**Example:**
```bash
./agents/test-agent.sh \
  .build-agent/test \
  "Add server start command that runs Mastra on port 4111"
```

**Output:** Complete Vitest test file, committed to test branch

---

### Develop Agent

**Implements features to pass tests:**

```bash
./agents/develop-agent.sh <workspace-path> <test-file-path>
```

**Example:**
```bash
./agents/develop-agent.sh \
  .build-agent/develop \
  tests/commands/server.test.ts
```

**Output:** Implementation file, committed to develop branch

---

### TDD Orchestrator

**Runs complete Red-Green-Refactor cycle:**

```bash
./agents/tdd-orchestrator.sh "<feature-description>" [max-iterations]
```

**Example:**
```bash
./agents/tdd-orchestrator.sh \
  "Add server start command" \
  5
```

**What it does:**
1. Calls test-agent (write failing test)
2. Calls develop-agent (implement feature)
3. Checks if tests pass
4. Iterates if needed (up to max-iterations)
5. Syncs branches when complete

---

## 🔧 Troubleshooting

### "jq: command not found"

```bash
# MacOS
brew install jq

# Linux
sudo apt-get install jq
```

### "OPENROUTER_API_KEY not set"

```bash
export OPENROUTER_API_KEY="sk-or-v1-..."
```

### "API error" or "empty response"

Check your API key is valid:
```bash
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### Debug mode

```bash
DEBUG=1 ./agents/planning-agent.sh ...
# Shows detailed API calls and responses
```

---

## 💰 Cost

**Free tier models:**
- `google/gemini-2.0-flash-001:free` - Used by default
- `meta-llama/llama-3.1-8b-instruct:free`
- No cost, generous limits

**Paid models (if you want better quality):**
- `anthropic/claude-3.5-sonnet` - ~$3/million tokens
- `openai/gpt-4o` - ~$2.50/million tokens
- Change in agent scripts

---

## 🎯 Integration with Build Agent CLI

The plan command now uses OpenRouter:

```bash
# Via CLI (uses OpenRouter internally)
npm run dev plan \
  "https://github.com/org/repo" \
  "Problem description"

# Direct shell script
./agents/planning-agent.sh \
  workspaces/org-repo/main \
  "Problem description"
```

Both work the same way, choose your preference!

---

## 📚 Examples

### Fix Mastra Bundler Bug

```bash
# Generate plan
./agents/planning-agent.sh \
  workspaces/mastra-ai-mastra/main \
  "Fix CLI bundler that transforms @mastra/libsql to @mastra/core/dist/storage/libsql" \
  MASTRA_FIX.md

# Open in Cursor
cursor workspaces/mastra-ai-mastra/main

# Use Cursor Composer with MASTRA_FIX.md sections
# Implement fix
# Create PR!
```

### Build New Feature with TDD

```bash
# Orchestrate complete TDD cycle
./agents/tdd-orchestrator.sh "Add status command that shows agent activity" 5

# Review results
cd .build-agent/develop
git log -3
npm test

# Merge when ready
```

---

## ✨ Why Shell Scripts?

**Simplicity:**
- 400 lines total vs 3000+ lines of TypeScript
- No npm dependencies (besides OpenRouter SDK for CLI)
- No framework complexity
- Standard Unix tools

**Reliability:**
- No JSON parsing issues
- No agent coordination problems
- Direct API calls
- Predictable behavior

**Flexibility:**
- Easy to modify (just edit bash)
- Easy to debug (set -x)
- Easy to extend (add new scripts)
- Works anywhere (MacOS, Linux, WSL)

**Cost:**
- Free OpenRouter models
- No OpenAI quota issues
- Generous rate limits

---

## 🚀 Production Ready

These scripts are production-ready:
- ✅ Error handling
- ✅ Input validation
- ✅ Colored logging
- ✅ Git integration
- ✅ Workspace isolation

Use them to:
- Generate plans for any problem
- Implement TDD workflows
- Fix bugs in open source
- Build your own CLI features

---

**Simple beats complex. Shell beats frameworks. Just ship it.** 🎯

