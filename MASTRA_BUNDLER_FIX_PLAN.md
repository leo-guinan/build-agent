# Solution Plan: Fix Mastra CLI Bundler Import Transformation Bug

**Repository:** https://github.com/mastra-ai/mastra  
**Generated:** 2025-10-17T00:30:35Z  
**Problem:** CLI bundler incorrectly transforms @mastra/libsql imports

---

## 📋 How to Use This Plan

1. **Review the test plan** - Understand what needs testing
2. **Review the implementation plan** - Understand the fix approach  
3. **Use with Cursor Composer** - Feed it sections of this plan
4. **Work in TDD order** - Tests first, then implementation
5. **Validate thoroughly** - Run tests and check edge cases

---

# Test Plan

## Problem Analysis

The core issue is that the Mastra CLI bundler is incorrectly transforming imports from official `@mastra/*` scoped packages to internal paths within the `@mastra/core` package (specifically `@mastra/core/dist/storage/libsql`). This results in `MODULE_NOT_FOUND` errors at runtime because `@mastra/libsql` is a separate, externally installable package. The bundler needs to preserve imports from all official `@mastra/*` packages. This requires testing different import scenarios, focusing particularly on those involving `@mastra/*` packages.

## Files to Test

- `packages/cli/src/bundler.ts` - Contains the core bundling logic, including import transformations (assumed location)
- `packages/cli/test/bundler.test.ts` - Unit tests for the bundler
- `examples/basic-agent/index.ts` - Example using @mastra/libsql for integration testing

## Test Scenarios

### Unit Tests
**File:** `packages/cli/test/bundler.test.ts`

**Test case 1:** Import `@mastra/libsql` is NOT transformed
- Description: Verify that `import { ... } from '@mastra/libsql';` remains unchanged after bundling
- Input: Code snippet with the above import statement
- Expected Output: Import statement in bundled output is identical to input

**Test case 2:** Import `@mastra/core/internal/module` IS transformed if in a different package
- Description: Verify that internal `@mastra/core` import is transformed correctly
- Input: `import { ... } from '@mastra/core/internal/module';`
- Expected Output: Transformed to correct relative path like `@mastra/core/dist/location/of/module`

**Test case 3:** Import `@mastra/memory` is NOT transformed
- Description: Verify that `import { ... } from '@mastra/memory';` remains unchanged
- Input: Code snippet with the above import
- Expected Output: Import preserved in bundled output

**Test case 4:** Import from non-@mastra package is NOT transformed
- Description: Ensure external library imports are untouched
- Input: `import _ from 'lodash';`
- Expected Output: `import _ from 'lodash';` preserved

**Test case 5:** Invalid `@mastra/*` package import throws error
- Description: Verify invalid package names error appropriately
- Input: `import { ... } from '@mastra/nonexistent-package';`
- Expected Output: MODULE_NOT_FOUND error

### Integration Tests
**File:** `examples/basic-agent/index.ts`

**Test case 1:** Example application runs without MODULE_NOT_FOUND errors
- Description: Verify example compiles and runs successfully
- Input: Execute `npx mastra dev`
- Expected Output: Application starts successfully, no MODULE_NOT_FOUND errors for @mastra/* packages

**Test case 2:** Local relative imports still transform correctly
- Description: Verify internal imports work properly
- Input: Application with `import {} from ./localImportedFile.ts`
- Expected Output: Application starts successfully, local imports resolve

### Mocks Required

- None for unit tests (focus on string transformation logic)
- For integration tests: Mock/in-memory database if needed

## Validation Criteria

- [ ] All unit and integration tests pass
- [ ] Test coverage > 80% for bundler code
- [ ] Edge cases handled:
  - [ ] Different casing (`@Mastra/libsql`)
  - [ ] Query parameters (`@mastra/libsql?foo=bar`)
  - [ ] Dynamic imports (`import('@mastra/libsql')`)

---

# Implementation Plan

## Root Cause Analysis

The Mastra CLI bundler rewrites imports from `@mastra/libsql` to `@mastra/core/dist/storage/libsql` incorrectly. This is due to overly aggressive import rewriting logic that assumes all `@mastra/*` packages are part of `@mastra/core`. The bundler doesn't distinguish between internal modules of `@mastra/core` and official, separately published `@mastra` scoped packages like `@mastra/libsql`.

## Solution Approach

Modify the import rewriting logic to prevent rewriting imports from official `@mastra/*` scoped packages that are published separately on npm. Add a check to ensure the imported module is not a direct dependency or known `@mastra` package. If it's an officially published package, the import should remain unchanged.

## Files to Modify

### File 1: `packages/cli/src/bundle/transformers.ts` (assumed location)

**Current behavior:** Unconditionally rewrites any import paths starting with `@mastra` to point to `@mastra/core/dist/storage/libsql`

**Change needed:** Add condition to prevent rewrite if the imported module is a published `@mastra/*` package

**Code changes:**
```typescript
// packages/cli/src/bundle/transformers.ts

const officialMastraPackages = [
  '@mastra/libsql', 
  '@mastra/rag', 
  '@mastra/memory',
  '@mastra/postgres',
  // Add other published packages
];

function transformImport(importPath: string): string {
  if (importPath.startsWith('@mastra/')) {
    // Don't transform official published packages
    if (officialMastraPackages.includes(importPath)) {
      return importPath;
    }
    
    // Transform internal @mastra/core modules
    if (importPath.startsWith('@mastra/core/')) {
      // Apply internal transformation logic
      return importPath.replace('@mastra/core/', '@mastra/core/dist/');
    }
  }
  
  return importPath;
}
```

### File 2: Bundler Configuration File (if applicable)

Check for Rollup, Webpack, or esbuild configuration that defines transformation rules. May need to add externals or preserve rules.

## Step-by-Step Implementation

1. **Identify faulty transformation logic** - Look in `packages/cli/src` for import rewriting code
2. **Create `officialMastraPackages` array** - List all published @mastra/* packages
3. **Implement conditional check** - Skip transformation for official packages
4. **Test changes** - Run `npx mastra dev` and verify imports aren't rewritten
5. **Expand the array** - Add all @mastra/* packages to whitelist
6. **Add automated tests** - Test bundler transformation logic

## Edge Cases

- **Nested packages:** Only apply to top-level `@mastra/*` packages
- **Different bundler configs:** Apply fix to dev and prod configurations
- **Aliased imports:** Handle import aliases correctly
- **Dynamic imports:** Verify `import('@mastra/libsql')` works

## Validation Steps

- [ ] Tests pass - Verify @mastra/libsql imports not rewritten
- [ ] No regressions - Check other bundling functionality works
- [ ] Performance acceptable - Measure bundling time impact
- [ ] Security checked - No new vulnerabilities introduced

---

## 🚀 Quick Start Guide for Cursor

### 1. Create Feature Branch
```bash
cd workspaces/mastra-ai-mastra/main
git checkout -b fix/bundler-preserve-mastra-imports
```

### 2. Write Tests (Use Test Plan Above)
**In Cursor Composer, paste:**
> Using the test plan above, create `packages/cli/test/bundler.test.ts` with all 5 unit test cases listed. Include test case 1 (libsql not transformed), test case 3 (memory not transformed), and test case 4 (lodash not transformed).

### 3. Verify Tests Fail (RED)
```bash
pnpm test packages/cli
# Should fail - bundler currently transforms incorrectly
```

### 4. Implement Fix (Use Implementation Plan Above)
**In Cursor Composer, paste:**
> Using the implementation plan above, locate the bundler import transformation code in packages/cli/src and add the officialMastraPackages array with conditional check as shown in the plan. Preserve imports from @mastra/libsql, @mastra/memory, @mastra/postgres, and other official packages.

### 5. Verify Tests Pass (GREEN)
```bash
pnpm test packages/cli
# Should pass now
```

### 6. Test End-to-End
```bash
# Build the CLI
pnpm build

# Test with a real project using @mastra/libsql
npx mastra dev
# Should NOT get MODULE_NOT_FOUND for @mastra/libsql
```

### 7. Create PR
```bash
git add .
git commit -m "fix: Preserve @mastra/* package imports in CLI bundler

Fixes issue where bundler incorrectly transforms @mastra/libsql
and other official packages to @mastra/core/dist/* paths.

Added whitelist of official packages to exclude from transformation:
- @mastra/libsql
- @mastra/memory  
- @mastra/postgres
- Others as needed

Tests included to prevent regression."

git push origin fix/bundler-preserve-mastra-imports
gh pr create --title "fix: Preserve @mastra/* package imports in CLI bundler"
```

---

## ✅ Completion Checklist

- [ ] Feature branch created
- [ ] Tests written (5 unit + 2 integration)
- [ ] Tests fail initially (RED) ✅
- [ ] Implementation written (add officialMastraPackages)
- [ ] Tests pass (GREEN) ✅
- [ ] No regressions
- [ ] Edge cases handled
- [ ] PR created

---

**Generated by Build Agent CLI v0.1.0**  
**Shell-Based Planning Agent + OpenRouter + Google Gemini 2.0 Flash**

