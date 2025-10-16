# Branch Comparison - Develop vs Production

## 📊 Overview

Build Agent CLI has two main branches for different use cases:

---

## 🟢 Production Branch (v0.1.0) ⭐ **RECOMMENDED**

**Status:** ✅ Stable & Production Ready  
**Code:** 1,328 lines (545 bash + 783 TypeScript)  
**Dependencies:** 5 npm packages  
**Approach:** Shell-based agents + OpenRouter

### What's Included

**Shell Agents:**
- `lib.sh` - Core functions (API, file ops, git)
- `planning-agent.sh` - Generate solution plans
- `test-agent.sh` - Write test specifications
- `develop-agent.sh` - Implement features
- `tdd-orchestrator.sh` - Complete TDD cycles

**CLI Commands:**
- `build-agent plan` - Generate plans for Cursor
- `build-agent solve` - Set up TDD workspaces

**Infrastructure:**
- Workspace architecture
- OpenRouter integration
- Complete documentation

### Pros

✅ **Simple** - 545 lines of bash  
✅ **Reliable** - No parsing issues  
✅ **Fast** - Direct API calls  
✅ **Debuggable** - Standard Unix tools  
✅ **Cheap** - Free OpenRouter tier  
✅ **Production Ready** - Error handling, logging

### Cons

❌ Less features than develop  
❌ No framework-based extensibility  
❌ Requires bash/Unix environment

### Use Production If:

- You want simple, reliable tools
- You're using Cursor for implementation
- You need it to just work
- You prefer shell scripts over frameworks
- **You want to ship code, not debug infrastructure**

---

## 🔵 Develop Branch (Experimental)

**Status:** ⚠️ Experimental  
**Code:** ~4,000 lines TypeScript  
**Dependencies:** 20+ npm packages  
**Approach:** Mastra framework + TypeScript agents

### What's Included

**Everything from production, PLUS:**

**Mastra Agents:**
- TDD Routing Agent (orchestrator)
- Test Agent (Mastra-based)
- Develop Agent (Mastra-based)
- Planning Agents (tool-free)

**Mastra Tools:**
- System State Tool
- Git Manager Tool
- Workspace Manager Tool
- Shell Executor Tool
- Debug Inspector Tool
- File Writer Tool

**Additional Commands:**
- `build-agent tdd` - Mastra TDD network
- `build-agent dev` - Dev server
- `build-agent dev:stop/status/logs`

### Pros

✅ More features  
✅ Framework-based extensibility  
✅ TypeScript end-to-end  
✅ Sophisticated agent coordination (when working)

### Cons

❌ Complex (3000+ lines)  
❌ Agent network parsing issues  
❌ Higher maintenance  
❌ More dependencies  
❌ **Not production-ready yet**

### Use Develop If:

- You want to experiment with Mastra
- You're contributing to agent development
- You want to debug framework issues
- You prefer TypeScript over bash
- **You're willing to debug infrastructure**

---

## 📈 Comparison

| Aspect | Production | Develop |
|--------|-----------|----------|
| **Code Size** | 1,328 lines | ~4,000 lines |
| **Dependencies** | 5 | 20+ |
| **Reliability** | ✅ High | ⚠️ Medium |
| **Complexity** | Low | High |
| **Setup** | 2 minutes | 10 minutes |
| **Debugging** | Easy (bash) | Complex (framework) |
| **AI Provider** | OpenRouter | OpenAI/OpenRouter |
| **Cost** | Free tier | Quota limits |
| **Status** | Stable | Experimental |
| **Recommended For** | Everyone | Developers only |

---

## 🎯 Which Should You Use?

### Use **Production** if:

- ✅ You want reliability
- ✅ You're building real projects
- ✅ You use Cursor for coding
- ✅ You want simple tools
- ✅ **You want to ship features**

### Use **Develop** if:

- ✅ You're interested in Mastra framework
- ✅ You want to contribute to agent development
- ✅ You're debugging AI orchestration
- ✅ You want more features (even if experimental)
- ✅ **You want to experiment**

---

## 🔄 Merging Between Branches

**Production → Develop:**
```bash
git checkout develop
git merge production
# Gets stable fixes into experimental branch
```

**Develop → Production:**
```bash
git checkout production
git cherry-pick <commit-hash>
# Only merge proven, stable features
```

**Philosophy:** Production stays stable, develop can break.

---

## 📦 What's in Each Branch

### Production Files

```
build-agent/
├── agents/              # Shell-based agents (545 lines)
│   ├── lib.sh
│   ├── planning-agent.sh
│   ├── test-agent.sh
│   ├── develop-agent.sh
│   ├── tdd-orchestrator.sh
│   ├── README.md
│   └── SETUP.md
│
├── src/                 # Minimal TypeScript CLI
│   ├── commands/
│   │   ├── plan.ts     # Plan generation (OpenRouter)
│   │   └── solve.ts    # Workspace setup
│   └── index.ts         # CLI entry point
│
├── package.json         # 5 dependencies
├── README.md            # Main docs
└── PRODUCTION_RELEASE.md # This file
```

### Develop Additional Files

```
+ src/mastra/            # Mastra framework integration
    ├── agents/          # Mastra agents
    ├── tools/           # Mastra tools
    └── server.ts        # Dev server
    
+ src/commands/
    ├── tdd.ts           # Mastra TDD command
    └── dev.ts           # Dev server commands
    
+ 15+ additional dependencies
```

---

## ✨ Recommendation

**Start with production branch.**

It's simple, reliable, and production-ready. You can always switch to develop later if you need more features.

The shell agents work great with Cursor for the hybrid AI development workflow.

---

**Production v0.1.0 is ready to ship!** 🚀

