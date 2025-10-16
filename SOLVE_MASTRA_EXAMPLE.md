# Example: Fix Mastra Bundler Bug

**Use Case:** Test our TDD agent network on a REAL problem we discovered  
**Target:** Mastra framework bundler  
**Problem:** Bundler transforms @mastra/libsql imports incorrectly

---

## 🎯 The Problem We Discovered

**What happens:**
```typescript
// User writes:
import { LibSQLStore } from '@mastra/libsql'

// Mastra CLI bundler transforms to:
import { LibSQLStore } from '@mastra/core/dist/storage/libsql'

// ERROR: Module not found (libsql is separate package!)
```

**Impact:** Any user using @mastra/libsql with `npx mastra dev` gets module errors

---

## 🧪 Test the TDD Agent on This Problem

### Command

```bash
build-agent solve \
  "https://github.com/mastra-ai/mastra" \
  "Mastra CLI bundler incorrectly transforms imports from @mastra/libsql to @mastra/core/dist/storage/libsql, causing MODULE_NOT_FOUND errors. The bundler should preserve imports from official Mastra packages like @mastra/libsql unchanged, as they are separate packages not included in @mastra/core."
```

### What Should Happen

**1. Setup Phase:**
```
✓ Cloning https://github.com/mastra-ai/mastra...
✓ Installing dependencies...
✓ Creating test workspace (test branch)...
✓ Creating develop workspace (develop branch)...

Workspace Structure:
  workspaces/mastra-ai-mastra/
  ├── main/     (main branch - original)
  ├── test/     (test branch - for tests)
  └── develop/  (develop branch - for fix)
```

**2. TDD Agent Analysis:**
```
🤖 TDD Routing Agent analyzing problem...
   - Identifies: Bundler transform logic
   - Locates: CLI bundler code (likely in packages/cli/)
   - Plans: Test for current behavior, implement fix
```

**3. Test Agent Writes Test:**
```
📝 Test Agent in workspaces/mastra-ai-mastra/test/

Writes: tests/cli/bundler-import-transform.test.ts

Test content:
  - Import transform should preserve @mastra/* packages
  - Should NOT rewrite @mastra/libsql to @mastra/core
  - Test current behavior (fails)
  - Defines expected behavior

Commits to test branch
```

**4. Develop Agent Implements Fix:**
```
💻 Develop Agent in workspaces/mastra-ai-mastra/develop/

Pulls latest test
Runs test (fails)
Locates bundler code
Implements fix:
  - Add @mastra/* packages to external list
  - Don't transform imports from official packages
  - Preserve package boundaries

Runs test (passes) ✅
Commits to develop branch
```

**5. Summary:**
```
✅ Problem solving complete!

Tests Written: 3
Tests Passing: 3
Files Changed:
  - tests/cli/bundler-import-transform.test.ts
  - packages/cli/src/bundler/transform.ts

Next Steps:
1. Review test files
2. Review fix
3. Run full test suite
4. Create PR to Mastra repo
```

---

## 🎯 Expected Outcome

**If TDD network works:**
- ✅ Test written that exposes bundler bug
- ✅ Fix implemented that passes test
- ✅ Ready to submit PR to Mastra
- ✅ **We validated the TDD system on REAL code!**

**If TDD network fails:**
- We'll see exactly where it fails
- Can debug with actual use case
- Learn what needs fixing

---

## 💡 Why This is Brilliant

1. **Real Problem** - Not contrived, actual bug we hit
2. **Real Codebase** - Mastra is production code
3. **Validates TDD System** - If it can fix Mastra, it can build our CLI
4. **Contributes Back** - We can submit PR, help community
5. **Dogfooding** - Using our tool to improve the tool it's built on

---

## 🧪 Test Cases for TDD Network

### Easy Problem (Warmup):
```bash
build-agent solve \
  "https://github.com/simple-repo/hello-world" \
  "Add a --verbose flag to the hello command that prints debug information"
```

### Medium Problem (Our Issue):
```bash
build-agent solve \
  "https://github.com/mastra-ai/mastra" \
  "Fix bundler import transforms for @mastra/* packages"
```

### Hard Problem (Stress Test):
```bash
build-agent solve \
  "https://github.com/vercel/next.js" \
  "Reduce build time by 20% through parallel compilation"
```

---

## 📊 Success Metrics

**TDD Network is WORKING if:**
- ✅ Test files actually written to disk
- ✅ Implementation files actually written to disk
- ✅ Git commits successful
- ✅ Tests actually pass
- ✅ Fix actually works

**TDD Network needs MORE WORK if:**
- ❌ Agents stream code but don't write files
- ❌ Tools called but fail
- ❌ Workspace operations fail
- ❌ No files created

---

## 🚀 Try It Now

```bash
# Start with simple problem
build-agent solve \
  "https://github.com/your-repo/simple-cli" \
  "Add hello world command"

# Then try the Mastra fix
build-agent solve \
  "https://github.com/mastra-ai/mastra" \
  "Fix bundler import transformation for @mastra/libsql package"
```

**This will tell us definitively if the TDD network works!** 🎯

