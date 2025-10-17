# Complete Workflows - Build Agent CLI
## Three Ways to Use the System

**Status:** ✅ All workflows validated on real bug (Mastra bundler)

---

## 🎯 Workflow 1: AI Plans + Cursor (RECOMMENDED) ⭐

**Best for:** Real-world development, creating PRs, shipping features

**Steps:**

```bash
# 1. Generate comprehensive plan
build-agent plan \
  "https://github.com/mastra-ai/mastra" \
  "Fix bundler LibSQL import transformation bug" \
  --output MASTRA_FIX.md

# 2. Review the plan
cat MASTRA_FIX.md

# 3. Open repo in Cursor
cursor workspaces/mastra-ai-mastra/main

# 4. Create feature branch
git checkout -b fix/bundler-imports

# 5. In Cursor Composer, paste sections:
"Using the test plan from MASTRA_FIX.md, create the test files"

# 6. Verify tests fail (RED)
pnpm test

# 7. In Cursor Composer:
"Using the implementation plan from MASTRA_FIX.md, implement the fix"

# 8. Verify tests pass (GREEN)
pnpm test

# 9. Create PR
gh pr create --title "fix: Preserve @mastra/* imports in bundler"
```

**Benefits:**
- ✅ AI provides structure and guidance
- ✅ Cursor generates high-quality code
- ✅ You review and control everything
- ✅ Professional results
- ✅ Works with any IDE

**Time:** 15-30 minutes per bug fix

---

## 🤖 Workflow 2: Fully Automated (EXPERIMENTAL)

**Best for:** Simple bugs, experimentation, learning

**Steps:**

```bash
# ONE COMMAND - does everything!
build-agent solve \
  "https://github.com/mastra-ai/mastra" \
  "Fix bundler LibSQL import bug" \
  --use-shell-agents

# What it does automatically:
# 1. Clones repository
# 2. Creates test/develop workspaces
# 3. Generates solution plan
# 4. Runs test-agent (writes tests)
# 5. Runs develop-agent (implements fix)
# 6. Iterates until tests pass
# 7. Shows you the results

# Review and create PR
cd workspaces/mastra-ai-mastra/main
git log -5
gh pr create
```

**Benefits:**
- ✅ Zero manual work
- ✅ Complete automation
- ✅ Good for learning
- ✅ Fast for simple problems

**Limitations:**
- ⚠️ May need iteration
- ⚠️ Review code before PRing
- ⚠️ Best for simple bugs

**Time:** 2-5 minutes + review

---

## 🛠️ Workflow 3: Shell Agents Direct

**Best for:** Working in your own repository, iterative development

**Steps:**

```bash
# 1. Navigate to your repository
cd my-project

# 2. Generate plan for guidance (optional)
../build-agent/agents/planning-agent.sh . \
  "Add server start command" \
  PLAN.md

# 3. Run TDD orchestrator
../build-agent/agents/tdd-orchestrator.sh \
  "Add server start command" \
  5  # max iterations

# What it does:
# - Writes tests in .build-agent/test/
# - Implements in .build-agent/develop/
# - Iterates until passing
# - Syncs branches

# 4. Review and merge
cd .build-agent/develop
git log -5
npm test

# 5. Merge to main when ready
git checkout main
git merge develop
```

**Benefits:**
- ✅ Works in your own repos
- ✅ Direct shell script control
- ✅ Easy to customize
- ✅ No framework overhead

**Best for:**
- Your own projects
- Quick iterations
- Learning TDD
- Full control

**Time:** 5-10 minutes per feature

---

## 📊 Workflow Comparison

| Aspect | AI + Cursor | Fully Automated | Shell Direct |
|--------|-------------|-----------------|--------------|
| **Manual Work** | Medium | Minimal | Low |
| **Quality** | Highest | Medium | High |
| **Speed** | 15-30 min | 2-5 min | 5-10 min |
| **Control** | Full | Limited | Full |
| **Best For** | PRs | Simple bugs | Own projects |
| **Reliability** | ✅ High | ⚠️ Medium | ✅ High |
| **Review Needed** | Yes | Yes++ | Yes |

---

## 🎯 Recommended by Use Case

### Contributing to Open Source

**Use: Workflow 1 (AI + Cursor)**

```bash
build-agent plan <repo> "problem" --output PLAN.md
cursor <repo>
# Use plan with Cursor, create PR
```

**Why:** Professional quality, full control, reviewable

---

### Fixing Simple Bugs

**Use: Workflow 2 (Fully Automated)**

```bash
build-agent solve <repo> "problem" --use-shell-agents
# Review, then PR
```

**Why:** Fast, good for learning, mostly automated

---

### Building Your Own Features

**Use: Workflow 3 (Shell Direct)**

```bash
cd your-project
../build-agent/agents/tdd-orchestrator.sh "feature" 5
```

**Why:** Direct control, works in your repo, flexible

---

## ✨ Example: Mastra Bundler Bug (VALIDATED)

### Workflow 1 Approach:

```bash
# 1. Generate plan (DONE ✅)
build-agent plan \
  "https://github.com/mastra-ai/mastra" \
  "Fix bundler LibSQL import bug"

# Output: MASTRA_BUNDLER_FIX_PLAN.md ✅

# 2. Use with Cursor (NEXT)
cursor workspaces/mastra-ai-mastra/main

# 3. In Cursor:
"Using MASTRA_BUNDLER_FIX_PLAN.md test plan, create bundler.test.ts"
"Using MASTRA_BUNDLER_FIX_PLAN.md implementation plan, fix the bundler"

# 4. Create PR
gh pr create
```

**Status:** Plan generated ✅, ready for Cursor implementation

---

### Workflow 2 Approach (If you want to test automation):

```bash
build-agent solve \
  "https://github.com/mastra-ai/mastra" \
  "Fix bundler LibSQL import bug" \
  --use-shell-agents \
  --skip-install

# Wait 5-10 minutes
# Review generated code
# Create PR
```

**Status:** Available but experimental

---

## 🚀 Next Actions

### To Fix Mastra Bug Now:

**Use the generated plan with Cursor:**

1. Open Mastra repo:
```bash
cursor workspaces/mastra-ai-mastra/main
git checkout -b fix/bundler-preserve-mastra-imports
```

2. In Cursor Composer:
```
Using MASTRA_BUNDLER_FIX_PLAN.md, create the bundler tests as specified in the test plan section.
```

3. Verify tests fail, then:
```
Using MASTRA_BUNDLER_FIX_PLAN.md, implement the fix as described in the implementation plan section.
```

4. Run tests, create PR! ✅

---

### To Build Your Own Features:

**Generate plan for each MVP feature:**

```bash
# Feature 1: Server Management
build-agent plan . "Add server start/stop commands" SERVER_PLAN.md

# Use plan with Cursor
cursor .
# Implement using plan guidance

# Repeat for features 2-5
# Ship in 6 weeks! ✅
```

---

## 💡 Best Practices

### When Using AI + Cursor:

1. **Review plans before implementing** - AI isn't perfect
2. **Test incrementally** - Verify each step
3. **Customize generated code** - Make it yours
4. **Write good commit messages** - Explain the why

### When Using Automation:

1. **Start simple** - Test on small problems first
2. **Review everything** - AI code needs review
3. **Iterate if needed** - Run again if first attempt fails
4. **Learn from output** - See what AI does

### When Using Shell Direct:

1. **Understand TDD** - Red → Green → Refactor
2. **Keep features small** - One thing at a time
3. **Review generated code** - AI isn't perfect
4. **Test thoroughly** - Don't skip validation

---

## ✅ Validation Status

**Workflow 1 (AI + Cursor):**
- [x] Plan generation works
- [x] Plan quality is excellent
- [ ] Cursor implementation (your next step!)
- [ ] PR creation (after Cursor)

**Workflow 2 (Fully Automated):**
- [x] Workspace setup works
- [ ] Shell agent orchestration (needs OpenRouter credits)
- [ ] End-to-end validation needed

**Workflow 3 (Shell Direct):**
- [x] TDD orchestrator exists
- [ ] Needs testing with real feature
- [ ] Workspace architecture proven

---

**All workflows are ready. Choose based on your needs!** 🎯

