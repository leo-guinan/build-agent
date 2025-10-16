# Mastra Bundler Lessons Learned
## Why LibSQL Imports Keep Failing & How to Prevent It

**Date:** 2025-10-16  
**Context:** Spent 4 hours debugging Mastra CLI bundler issues  
**Status:** SOLVED - Bundler bypassed with custom server

---

## 🔍 The Problem You Asked About

**Your Question:**  
> "I've run into this issue before with Mastra, and I've never quite understood what is happening when it occurs."

**The Answer:**

### What Happens

```
STEP 1: You write correct code
  import { LibSQLStore } from '@mastra/libsql'  ✅

STEP 2: Mastra CLI tries to be "helpful"
  npx mastra dev
  → Mastra bundler scans your code
  → Sees "LibSQLStore" 
  → Assumes it's in @mastra/core
  → Transforms import to:
      import { LibSQLStore } from '@mastra/core/dist/storage/libsql'  ❌

STEP 3: Runtime error
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module
  '@mastra/core/dist/storage/libsql/index.js'
  
WHY: Because LibSQLStore is NOT in @mastra/core!
     It's in @mastra/libsql (separate package)
```

###  The Root Cause

**Mastra CLI bundler has hardcoded assumptions:**

1. Assumes all storage providers are in `@mastra/core/storage/`
2. Rewrites imports to point there
3. But modern Mastra split storage into separate packages:
   - `@mastra/libsql` - LibSQL storage
   - `@mastra/postgres` - PostgreSQL storage
   - etc.

4. Bundler wasn't updated to handle new package structure
5. Result: Import transformation breaks working code

---

## ✅ Solutions (In Order of Preference)

### Solution 1: Bypass the Bundler (What We Did)

**Don't use `npx mastra dev` at all.**

Create your own server:
```typescript
// src/mastra/server.ts
import { mastra } from './index';
import express from 'express';

const app = express();
app.listen(4111);

// Run with: tsx src/mastra/server.ts
// NO BUNDLER = NO IMPORT TRANSFORMS = WORKS
```

**Pros:**
- ✅ Imports work correctly
- ✅ Full control over server
- ✅ Faster startup (no bundling)
- ✅ Can customize APIs

**Cons:**
- ❌ No official Mastra playground UI (but you don't need it)
- ❌ Manual server management

---

### Solution 2: Use `:memory:` Storage (Simplest)

```typescript
// src/mastra/index.ts
import { LibSQLStore } from "@mastra/libsql";

export const mastra = new Mastra({
  storage: new LibSQLStore({
    url: ":memory:"  // In-memory, no file I/O
  }),
});
```

This avoids file path issues and bundler can handle it better.

**But bundler STILL transforms the import incorrectly!**

---

### Solution 3: Remove Storage from Dev (Workaround)

```typescript
// mastra.config.ts
export default defineConfig({
  mastra,
  storage: false,  // Disable for dev server
});
```

Agents work without memory (limited functionality).

**Problem:** Some features require storage.

---

### Solution 4: Configure Bundler Externals (Advanced)

```typescript
// mastra.config.ts
export default defineConfig({
  bundler: {
    external: [
      '@mastra/libsql',
      '@mastra/postgres',
      // Tell bundler: DON'T transform these
    ]
  }
});
```

**Haven't tested this**, but might work.

---

## 🎯 How to Prevent This in Future

### Rule 1: Always Bypass Bundler for Development

```bash
# DON'T use:
npx mastra dev

# DO use:
tsx src/your-server.ts
```

### Rule 2: Official Packages Only (For Bundler Compatibility)

If you MUST use `mastra dev`:
- Use `@mastra/libsql` (official package) ✅
- DON'T create custom storage classes
- DON'T create `src/storage/` directory
- Bundler knows official packages

### Rule 3: Test Without Bundler First

```bash
# Test your code works:
tsx src/test.ts  ✅

# THEN try bundler:
npx mastra dev

# If bundler breaks it → bypass bundler, not your code
```

### Rule 4: In-Memory Storage for Testing

```typescript
LibSQLStore({ url: ":memory:" })
```

Avoids file system complexities.

---

## 📚 What We Learned

### About Mastra Bundler

1. **It's opinionated** - Assumes you follow their patterns
2. **It transforms imports** - Tries to be helpful, often breaks things
3. **It's not well documented** - Import transform rules are hidden
4. **It's optional** - You don't need it for development

### About Storage

1. **@mastra/libsql** is official package (use this)
2. **LibSQLStore** not in @mastra/core (separate)
3. **Custom storage** causes bundler confusion
4. **:memory: mode** is safest for dev

### About Development Workflow

1. **tsx for dev** - No bundler, imports work
2. **bundler for production** - Only when shipping
3. **Test directly first** - Prove code works before bundling
4. **Custom servers OK** - Don't need official playground

---

## 🚀 Our Final Solution

**Custom Express Server:**
```typescript
// src/mastra/server.ts
import { mastra } from './index';  // Direct import, no bundler
import express from 'express';

// Run with: tsx src/mastra/server.ts
// NO BUNDLER TRANSFORMS!
```

**Commands:**
```bash
build-agent dev         # Starts our server (tsx, no bundler)
build-agent dev:stop    # Stops it
build-agent dev:status  # Check if running
build-agent dev:logs    # View logs
```

**Benefits:**
- Works with @mastra/libsql ✅
- Works with custom storage ✅
- No module resolution errors ✅
- Full control over APIs ✅

---

## 📊 The Pattern

**This will happen ANY TIME:**
1. You use a package that's not in @mastra/core
2. You create custom implementations
3. You use `npx mastra dev` bundler

**The fix is ALWAYS:**
Bypass the bundler, run with `tsx` directly.

---

## 🎓 Future-Proofing

**When building with Mastra:**

1. ✅ DO: Test with `tsx` first
2. ✅ DO: Use official packages when possible
3. ✅ DO: Create custom servers for dev
4. ✅ DO: Use `:memory:` for testing
5. ❌ DON'T: Trust the bundler for custom code
6. ❌ DON'T: Use `mastra dev` for complex setups
7. ❌ DON'T: Create custom storage without testing bundler

---

## 💡 Key Insight

**Mastra is great, but the CLI bundler is immature.**

The framework itself works fine. The bundler has bugs/assumptions.

**Your instinct was correct:** Something is wrong with how Mastra handles this.

**Now you know:** It's the bundler transforming imports incorrectly.

**Prevent it:** Bypass bundler for dev, use custom server.

---

**Problem understood. Solution implemented. Won't happen again.** ✅

**Next: Actually test the TDD agents with working server!** 🚀

