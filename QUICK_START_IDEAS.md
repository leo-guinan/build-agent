# Quick Start: Creating New Ideas

**TL;DR:** `build-agent create` → answer prompts → `build-agent develop` → start coding

---

## The Flow

```bash
# 1. Create new idea (interactive prompts)
build-agent create

# 2. Review requirements
cd workspaces/your-idea-name
cat REQUIREMENTS.md

# 3. Start development
build-agent develop

# 4. Build!
build-agent plan . "Implement first feature"
# or
build-agent solve . "Build MVP" --use-shell-agents
# or
cursor .
```

---

## Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `build-agent create` | Start new idea | Beginning of project |
| `build-agent develop` | Create develop branch | After requirements are ready |
| `build-agent plan` | Generate feature plan | When implementing specific features |
| `build-agent solve` | Auto-implement with agents | For automated development |

---

## Branch Strategy

```
requirements branch → Source of truth (REQUIREMENTS.md)
       ↓
develop branch    → Where you code
```

**Rules:**
- Requirements branch: Documentation only
- Develop branch: All code lives here
- Update requirements first, then code

---

## Options

### Create Command

```bash
build-agent create [options]

--workspace-dir <dir>  # Where to create workspace (default: ./workspaces)
--skip-ai              # Use basic template instead of AI
```

### Develop Command

```bash
build-agent develop [idea-path] [options]

--force  # Recreate develop branch (deletes existing)
```

---

## Examples

### API Service

```bash
build-agent create
# → Task Management API
# → RESTful API for task tracking with teams
# → 1 month timeline

cd workspaces/task-management-api
build-agent develop
build-agent plan . "Implement authentication endpoints"
```

### Web App

```bash
build-agent create
# → Recipe Sharing Platform
# → Community site for sharing recipes
# → 6 weeks timeline

cd workspaces/recipe-sharing-platform
build-agent develop
cursor .  # Use Cursor to implement from requirements
```

### CLI Tool

```bash
build-agent create
# → Git Workflow Automator
# → CLI tool to automate common git workflows
# → 2 weeks timeline

cd workspaces/git-workflow-automator
build-agent develop
../../agents/tdd-orchestrator.sh "Add commit automation" 10
```

---

## Pro Tips

1. **Be specific in prompts** - AI generates better requirements from details
2. **Review AI output** - It often catches edge cases you missed
3. **Update requirements** - Keep REQUIREMENTS.md current as scope changes
4. **Use develop for everything** - Keep requirements branch clean
5. **Can recreate develop** - Requirements are permanent, code is flexible

---

## What Gets Created

### Initial Structure (requirements branch)

```
workspaces/my-idea/
├── REQUIREMENTS.md       ← AI-generated comprehensive doc
├── README.md            ← Status: Requirements Phase  
└── .gitignore           ← Standard ignores
```

### After `build-agent develop`

```
workspaces/my-idea/
├── REQUIREMENTS.md       ← Same, from requirements branch
├── README.md            ← Updated: Development Phase
├── .gitignore           ← Same
└── [your code here]     ← Start building!
```

---

## Integration with Existing Features

Works seamlessly with:

- ✅ `build-agent plan` - Generate plans for features
- ✅ `build-agent solve` - Auto-implement with agents
- ✅ Shell agents - Direct TDD workflow
- ✅ Cursor - Manual implementation

---

## Troubleshooting

**"Not a git repository"**
→ Run from idea workspace: `cd workspaces/my-idea`

**"No REQUIREMENTS.md found"**
→ Only works on idea workspaces created with `build-agent create`

**AI generation fails**
→ Use `--skip-ai` flag or check `$OPENROUTER_API_KEY`

**Want to restart development**
→ `build-agent develop --force` (recreates develop branch)

---

## Full Example Session

```bash
$ build-agent create

? What's your idea called? 
  Email Parser API

? Describe your idea in one sentence:
  RESTful API for parsing and extracting data from emails

? What problem does this solve?
  Developers waste time writing email parsing logic repeatedly

? Who are your target users?
  Backend developers building email integrations

? Any technical constraints?
  Must support IMAP, POP3, and webhook delivery

? How will you measure success?
  1000 API calls/day, <500ms response time, 99.5% accuracy

? Target timeframe:
  1 month

✅ Idea workspace created!

$ cd workspaces/email-parser-api

$ cat REQUIREMENTS.md
# Requirements: Email Parser API
... [comprehensive AI-generated requirements] ...

$ build-agent develop

✅ Develop branch created!

$ build-agent plan . "Implement IMAP connection module"

✅ Solution plan generated!

$ cursor .
# Start coding!
```

---

**Made something cool?** Use it to build your next idea! 🚀

See `IDEA_WORKFLOW.md` for complete documentation.

