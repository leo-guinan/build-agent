# TDD Network Debug Status

**Date:** 2025-10-16  
**Current State:** Network functional, agents not using file-writer tool yet

---

## ✅ What's Working

1. **Workspace Architecture** - `.build-agent/test/` and `.build-agent/develop/` exist
2. **Routing Agent** - Successfully analyzes requests and routes to sub-agents
3. **System State Tool** - Collects codebase from workspaces correctly
4. **Git Manager Tool** - Can commit, push, pull in workspaces
5. **File Writer Tool** - Implemented and registered
6. **Test & Develop Agents** - Start successfully, have access to tools
7. **gpt-4o-mini** - All agents using fast/cheap model

---

## ⚠️ Current Issue

**Test Agent generates test CODE but doesn't call file-writer tool to write it to disk**

### Debug Output Shows:
```
[test-agent started]
[agent streaming test code as text]
```typescript
import { describe, it, expect } from 'vitest';
...test code...
```
[agent calls git-manager commit]  ← NO FILE TO COMMIT
[loops checking git status]
```

**Root Cause:** Agent instructions say "use file-writer" but LLM is generating text instead of calling tool.

---

## 🔍 Debug Evidence

### From Last Run:
```
✅ Routing agent started
✅ System-state tool called (analyzed develop workspace)
✅ Test Agent started
❌ Test Agent streamed code as text (not using file-writer)
❌ No files written to .build-agent/test/tests/
❌ Git commits attempted with no files
```

### File Check:
```bash
cd .build-agent/test
find tests -name "*.ts"
# Result: NO FILES
# Tests directory is empty
```

---

## 💡 Possible Solutions

### Option 1: Make file-writer Tool More Explicit

Update test-agent instructions to be even more explicit:
```
CRITICAL: DO NOT RETURN CODE AS TEXT.
STEP 1: Call file-writer tool
STEP 2: ONLY THEN call git-manager
STEP 3: Return file path

Example tool call:
{
  "tool": "fileWriter",
  "operation": "write",
  "workspace": "test",
  "filePath": "tests/commands/hello.test.ts",
  "content": "<full test code here>"
}
```

### Option 2: Add Result Tool

Force agent to return structured output with file paths:
```typescript
resultTool: {
  description: "Return TDD results",
  parameters: z.object({
    filesWritten: z.array(z.string()),
    testCode: z.string()
  })
}
```

### Option 3: Simplify Agent (No Streaming)

Remove streaming, make agent return JSON with file paths and content:
```typescript
const response = await testAgent.generate({
  prompt: "Write test for: hello command",
  format: "json",
  schema: {
    filePath: string,
    testCode: string
  }
});

// THEN call file-writer manually with response
```

### Option 4: Manual File Writing

Don't use agent tools for file writing, write files in the command handler:
```typescript
// In tdd.ts command
const testCode = await testAgent.generate("Write test...");
await writeFile('.build-agent/test/tests/hello.test.ts', testCode);
```

---

## 🎯 Recommended Approach

**Option 4: Manual File Writing (Fastest to implement)**

Why:
- Agents are good at generating CODE
- Agents are unreliable at using TOOLS
- We control the workflow from command handler
- Guaranteed to work

Implementation:
```typescript
// src/commands/tdd.ts

1. Call test-agent.generate() → get test code as string
2. Extract code from markdown fences
3. Write to .build-agent/test/tests/... using fs
4. Commit using execSync
5. Call develop-agent.generate() → get implementation
6. Write to .build-agent/develop/src/... using fs
7. Commit using execSync
8. Loop until done
```

**Time to implement:** 30 minutes  
**Certainty:** 95% (we control everything)

---

## 📊 Current Stats

**Time Spent on TDD Network:** ~3 hours  
**Time Remaining:** 7 weeks for MVP  
**Network Status:** 85% complete (agents work, just need file handling)

**Critical Decision:** 

Spend more time debugging agent tool usage? (uncertain timeline)  
OR  
Switch to manual file handling? (30 min, guaranteed)

---

## 🚀 Next Steps

### If Continuing with Agent Tools:
1. Update test-agent with VERY explicit file-writer instructions
2. Test with simple prompt
3. Check if files written
4. Iterate

### If Switching to Manual (Recommended):
1. Modify `src/commands/tdd.ts`
2. Call agents for code generation only
3. Handle file writing in command
4. Handle git operations in command
5. Test and ship

**Both paths get to same place. Manual is faster and more certain.**

What's your call?  

Time is ticking - 7 weeks to launch. 🕐

