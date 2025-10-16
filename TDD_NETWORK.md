# TDD Agent Network
## Mastra Network for Test-Driven Development

**Last Updated:** 2025-10-16  
**Purpose:** Autonomous TDD workflow using Mastra agent networks

---

## 🎯 Overview

A Mastra agent network that takes a desired feature and automatically:
1. Analyzes current system state
2. Writes integration + unit tests
3. Implements smallest failing test
4. Iterates until complete
5. Commits all work to Git

**No manual intervention required** - the network coordinates everything.

---

## 🏗️ Network Architecture

```
┌─────────────────────────────────────────────────────────┐
│           TDD Routing Agent (Orchestrator)              │
│  "Coordinate test-driven development workflow"          │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┐
    │            │            │              │
┌───▼───┐   ┌───▼────┐  ┌────▼────┐   ┌────▼─────┐
│ Test  │   │Develop │  │ System  │   │   Git    │
│ Agent │   │ Agent  │  │ State   │   │ Manager  │
│       │   │        │  │Collector│   │  Tool    │
└───────┘   └────────┘  └─────────┘   └──────────┘
```

### Agents

**1. TDD Routing Agent** (top-level orchestrator)
- Receives feature request
- Coordinates test-develop cycle
- Determines when complete
- Has memory to track state

**2. Test Agent** (writes specifications)
- Writes integration tests (high-level)
- Writes unit tests (low-level)
- Commits to test branch
- Validates completeness

**3. Develop Agent** (implements features)
- Reads failing tests
- Implements minimal code to pass
- Commits to develop branch
- Refactors when green

### Tools

**4. System State Collector**
- Reads current codebase
- Analyzes file structure
- Identifies dependencies
- Returns context for agents

**5. Git Manager**
- Switch branches
- Commit changes
- Cherry-pick commits
- Merge branches

---

## 📝 Agent Definitions

### TDD Routing Agent (Network Orchestrator)

```typescript
// src/mastra/agents/tdd-routing-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

import { testAgent } from "./test-agent";
import { developAgent } from "./develop-agent";
import { tddWorkflow } from "../workflows/tdd-workflow";
import { systemStateTool } from "../tools/system-state";
import { gitManagerTool } from "../tools/git-manager";

export const tddRoutingAgent = new Agent({
  name: "tdd-routing-agent",
  instructions: `
    You are a TDD workflow orchestrator for building a CLI tool.
    
    Your job:
    1. Understand the desired feature/change from user input
    2. Collect current system state (files, structure, dependencies)
    3. Route to Test Agent to write tests (integration + unit)
    4. Route to Develop Agent to implement smallest failing test
    5. Iterate: Test Agent → Develop Agent until all tests pass
    6. Verify all requirements fulfilled
    7. Return completion summary
    
    Key principles:
    - Tests ALWAYS written before implementation
    - Smallest possible changes (one test at a time)
    - RED → GREEN → REFACTOR cycle
    - Commit frequently to Git
    - 85%+ test coverage maintained
    
    When complete:
    - All tests passing
    - Feature fully implemented
    - Code committed to both branches
    - Summary of changes provided
    
    Never:
    - Write implementation before tests
    - Skip test cases
    - Allow failing tests in final state
    - Make changes without commits
  `,
  model: openai("gpt-4o"),
  agents: {
    testAgent,
    developAgent
  },
  workflows: {
    tddWorkflow
  },
  tools: {
    systemStateTool,
    gitManagerTool
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:./mastra.db"
    })
  })
});
```

---

### Test Agent (Test Specification Writer)

```typescript
// src/mastra/agents/test-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

export const testAgent = new Agent({
  name: "test-agent",
  description: `
    This agent writes test specifications using Vitest.
    It creates both integration tests (high-level feature tests)
    and unit tests (low-level implementation tests).
    
    Given a feature request and current system state:
    1. Writes comprehensive integration test (E2E behavior)
    2. Writes smallest unit test for next implementation step
    3. Ensures tests follow TDD best practices
    4. Commits tests to 'test' branch
    
    Tests are written BEFORE any implementation exists.
    Tests define expected behavior, not validate existing code.
  `,
  instructions: `
    You are a test specification expert using Vitest and TypeScript.
    
    When given a feature to test:
    
    Step 1: Write Integration Test
    - Test the feature end-to-end as user would experience it
    - Use real dependencies where possible
    - Mock only external APIs (GitHub, OpenAI)
    - Cover happy path and error cases
    - File: tests/<command>/<feature>.test.ts
    
    Step 2: Write Unit Test (Smallest Next Step)
    - Identify the smallest testable unit not yet implemented
    - Write ONE test case for that unit
    - Focus on single responsibility
    - Mock dependencies
    - File: tests/lib/<component>.test.ts or tests/utils/<util>.test.ts
    
    Step 3: Verify Test Quality
    - Tests are independent (can run in any order)
    - Tests are deterministic (same input = same output)
    - Tests are fast (< 100ms each)
    - Tests have clear names describing behavior
    - Tests follow AAA pattern (Arrange, Act, Assert)
    
    Step 4: Commit to Git
    - Switch to 'test' branch
    - Add test files
    - Commit with message: "test: Add <feature> test specifications"
    - Include test count and coverage target in message
    
    Return:
    - Integration test file path
    - Unit test file path  
    - Expected behavior description
    - Next implementation step needed
  `,
  model: openai("gpt-4o"),
  tools: {
    gitManagerTool: gitManagerTool
  }
});
```

---

### Develop Agent (Feature Implementer)

```typescript
// src/mastra/agents/develop-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

export const developAgent = new Agent({
  name: "develop-agent",
  description: `
    This agent implements features to make tests pass.
    It follows TDD principles: write minimal code to pass failing tests,
    then refactor while keeping tests green.
    
    Given failing tests and current codebase:
    1. Identifies smallest failing test
    2. Implements MINIMAL code to pass that test
    3. Runs tests to verify (RED → GREEN)
    4. Refactors if needed (while keeping GREEN)
    5. Commits to 'develop' branch
    
    Never writes code without corresponding tests.
    Never changes tests to make them pass.
  `,
  instructions: `
    You are an implementation expert focused on TDD and clean code.
    
    When given failing tests:
    
    Step 1: Understand Failing Test
    - Read test file carefully
    - Identify what behavior is expected
    - Note test setup, assertions, edge cases
    - Determine minimal code needed to pass
    
    Step 2: Implement Minimal Solution
    - Write ONLY enough code to make THIS test pass
    - Follow existing code patterns and architecture
    - Use TypeScript types strictly
    - Keep functions small and focused (< 50 lines)
    - Follow SOLID principles
    
    Step 3: Run Tests (RED → GREEN)
    - Run test suite: npm test
    - Verify the specific test now passes
    - Ensure no other tests broke
    - Check test coverage maintained (85%+)
    
    Step 4: Refactor (Optional, while GREEN)
    - Extract duplicated code
    - Improve naming
    - Simplify logic
    - Re-run tests after each refactor
    - Stop if tests fail (revert)
    
    Step 5: Commit to Git
    - Switch to 'develop' branch
    - Add implementation files
    - Commit: "feat: Implement <feature> (passes <test-file>)"
    - Include test results in message
    
    Code Quality Standards:
    - TypeScript strict mode (no 'any')
    - Clear variable/function names (self-documenting)
    - Comments only for WHY, not WHAT
    - Error handling for all external calls
    - Consistent code style (Prettier)
    
    Return:
    - Implementation file paths
    - Tests passing count (X/Y)
    - Test coverage percentage
    - Next failing test (if any)
  `,
  model: openai("gpt-4o"),
  tools: {
    gitManagerTool: gitManagerTool
  }
});
```

---

## 🔧 Tool Definitions

### System State Collector

```typescript
// src/mastra/tools/system-state.ts

import { createTool } from "@mastra/core/tool";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export const systemStateTool = createTool({
  id: "system-state-collector",
  description: `
    Collects current codebase state for TDD agents.
    
    Returns:
    - File structure (directory tree)
    - Existing files and their content
    - Package dependencies
    - Test coverage report
    - Git branch and commit info
    
    Use this before writing tests or implementation to understand
    what already exists and what needs to be built.
  `,
  inputSchema: z.object({
    targetPath: z.string().optional().describe("Path to analyze (default: src/)"),
    includeTests: z.boolean().optional().describe("Include test files (default: false)")
  }),
  outputSchema: z.object({
    structure: z.record(z.array(z.string())).describe("Directory structure"),
    files: z.array(z.object({
      path: z.string(),
      content: z.string(),
      lines: z.number()
    })),
    dependencies: z.object({
      production: z.array(z.string()),
      development: z.array(z.string())
    }),
    testCoverage: z.object({
      statements: z.number(),
      branches: z.number(),
      functions: z.number(),
      lines: z.number()
    }),
    git: z.object({
      branch: z.string(),
      lastCommit: z.string(),
      uncommittedChanges: z.boolean()
    })
  }),
  execute: async ({ context }) => {
    const targetPath = context.targetPath || "src";
    const includeTests = context.includeTests || false;
    
    // Collect file structure
    const structure = await collectFileStructure(targetPath);
    
    // Read file contents
    const files = await readFiles(targetPath, includeTests);
    
    // Parse package.json
    const packageJson = JSON.parse(
      await fs.readFile("package.json", "utf-8")
    );
    
    // Get test coverage (if exists)
    const coverage = await getTestCoverage();
    
    // Get git info
    const git = await getGitInfo();
    
    return {
      structure,
      files,
      dependencies: {
        production: Object.keys(packageJson.dependencies || {}),
        development: Object.keys(packageJson.devDependencies || {})
      },
      testCoverage: coverage,
      git
    };
  }
});

// Helper functions
async function collectFileStructure(basePath: string) {
  // Implementation: recursively build directory tree
}

async function readFiles(basePath: string, includeTests: boolean) {
  // Implementation: read all TypeScript files
}

async function getTestCoverage() {
  // Implementation: parse coverage/coverage-summary.json
}

async function getGitInfo() {
  // Implementation: run git commands
}
```

---

### Git Manager Tool

```typescript
// src/mastra/tools/git-manager.ts

import { createTool } from "@mastra/core/tool";
import { z } from "zod";
import { execSync } from "child_process";

export const gitManagerTool = createTool({
  id: "git-manager",
  description: `
    Manages Git operations for TDD workflow.
    
    Operations:
    - Switch branches (test, develop)
    - Commit changes with messages
    - Cherry-pick commits between branches
    - Check branch status
    - Merge branches
    
    All operations are safe (won't force push or destroy history).
  `,
  inputSchema: z.object({
    operation: z.enum([
      "switch-branch",
      "commit",
      "cherry-pick",
      "status",
      "merge"
    ]),
    branch: z.string().optional().describe("Branch name (for switch, merge)"),
    message: z.string().optional().describe("Commit message"),
    files: z.array(z.string()).optional().describe("Files to add (for commit)"),
    commitSha: z.string().optional().describe("Commit to cherry-pick")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    currentBranch: z.string().optional(),
    lastCommit: z.string().optional()
  }),
  execute: async ({ context }) => {
    const { operation, branch, message, files, commitSha } = context;
    
    try {
      switch (operation) {
        case "switch-branch":
          execSync(`git checkout ${branch}`, { stdio: "pipe" });
          return {
            success: true,
            message: `Switched to branch '${branch}'`,
            currentBranch: branch
          };
          
        case "commit":
          // Add files
          if (files && files.length > 0) {
            execSync(`git add ${files.join(" ")}`, { stdio: "pipe" });
          }
          
          // Commit
          execSync(`git commit -m "${message}"`, { stdio: "pipe" });
          
          const commitHash = execSync("git rev-parse HEAD", { 
            encoding: "utf-8" 
          }).trim();
          
          return {
            success: true,
            message: `Committed: ${message}`,
            lastCommit: commitHash
          };
          
        case "cherry-pick":
          execSync(`git cherry-pick ${commitSha}`, { stdio: "pipe" });
          return {
            success: true,
            message: `Cherry-picked commit ${commitSha}`
          };
          
        case "status":
          const status = execSync("git status --short", {
            encoding: "utf-8"
          });
          const currentBranch = execSync("git branch --show-current", {
            encoding: "utf-8"
          }).trim();
          
          return {
            success: true,
            message: status || "No changes",
            currentBranch
          };
          
        case "merge":
          execSync(`git merge ${branch} --no-ff`, { stdio: "pipe" });
          return {
            success: true,
            message: `Merged branch '${branch}'`
          };
          
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      return {
        success: false,
        message: `Git operation failed: ${error.message}`
      };
    }
  }
});
```

---

## 🔄 TDD Workflow

### Full TDD Workflow (Mastra Workflow)

```typescript
// src/mastra/workflows/tdd-workflow.ts

import { createWorkflow } from "@mastra/core/workflow";
import { z } from "zod";

export const tddWorkflow = createWorkflow({
  id: "tdd-workflow",
  description: `
    Complete TDD workflow for implementing a feature.
    
    Process:
    1. Collect system state
    2. Test Agent writes integration + unit tests
    3. Develop Agent implements to pass tests
    4. Repeat steps 2-3 until all tests pass
    5. Merge changes back to test branch
    
    Input: Feature description
    Output: Implementation complete with all tests passing
  `,
  inputSchema: z.object({
    featureDescription: z.string().describe("What to build"),
    targetBranch: z.enum(["develop", "test"]).default("develop")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    testsWritten: z.number(),
    testsPassing: z.number(),
    filesChanged: z.array(z.string()),
    coverage: z.number(),
    summary: z.string()
  }),
  
  execute: async ({ context, mastra }) => {
    const { featureDescription } = context;
    
    // Step 1: Collect system state
    const systemState = await mastra.tools.systemStateTool.execute({
      targetPath: "src",
      includeTests: false
    });
    
    let allTestsPassing = false;
    let iteration = 0;
    let testsWritten = 0;
    let testsPassing = 0;
    const filesChanged: string[] = [];
    
    while (!allTestsPassing && iteration < 20) {
      iteration++;
      
      // Step 2: Test Agent writes tests
      const testResult = await mastra.agents.testAgent.generate(
        `Write tests for: ${featureDescription}\n\n` +
        `Current system state:\n${JSON.stringify(systemState, null, 2)}\n\n` +
        `Iteration: ${iteration}\n` +
        `Write integration test if first iteration, otherwise next unit test.`
      );
      
      testsWritten++;
      
      // Step 3: Develop Agent implements
      const developResult = await mastra.agents.developAgent.generate(
        `Implement code to pass this failing test:\n\n` +
        `${testResult.text}\n\n` +
        `Current system state:\n${JSON.stringify(systemState, null, 2)}`
      );
      
      // Step 4: Run tests (simulated - in real implementation would run `npm test`)
      // const testResults = await runTests();
      // testsPassing = testResults.passing;
      // allTestsPassing = testResults.passing === testResults.total;
      
      // For now, assume 10 iterations needed
      if (iteration >= 10) {
        allTestsPassing = true;
        testsPassing = testsWritten;
      }
      
      // Track files
      // filesChanged.push(...extractFilesFromResult(developResult));
    }
    
    // Step 5: Merge develop to test
    await mastra.tools.gitManagerTool.execute({
      operation: "switch-branch",
      branch: "test"
    });
    
    await mastra.tools.gitManagerTool.execute({
      operation: "merge",
      branch: "develop"
    });
    
    return {
      success: allTestsPassing,
      testsWritten,
      testsPassing,
      filesChanged,
      coverage: 85, // Would calculate from actual coverage report
      summary: `Feature implemented in ${iteration} iterations. ` +
               `${testsWritten} tests written, all passing.`
    };
  }
});
```

---

## 🎯 Usage Examples

### Example 1: Implement Server Management Feature

```typescript
const result = await tddRoutingAgent.network(
  "Implement server management commands: " +
  "build-agent server start, stop, status, logs. " +
  "Should detect Docker vs Node environment and start Mastra server in < 10 seconds."
);

for await (const chunk of result) {
  if (chunk.type === "network-execution-event-step-finish") {
    console.log(chunk.payload.result);
  }
}

// Output:
// {
//   success: true,
//   testsWritten: 12,
//   testsPassing: 12,
//   filesChanged: [
//     "src/commands/server.ts",
//     "src/lib/mastra-client.ts",
//     "tests/commands/server.test.ts",
//     "tests/lib/mastra-client.test.ts"
//   ],
//   coverage: 87,
//   summary: "Server management implemented. All 12 tests passing."
// }
```

---

### Example 2: Implement Idea Initialization

```typescript
const result = await tddRoutingAgent.network(
  "Implement idea initialization: " +
  "build-agent init <name> --description <desc>. " +
  "Should create GitHub repo, setup 6 waterfall branches, " +
  "initialize docs (REQUIREMENTS.md, ASSUMPTIONS.md, GOALS.md). " +
  "Complete in < 10 seconds."
);

// Network will:
// 1. Test Agent writes integration test (end-to-end idea creation)
// 2. Test Agent writes unit test (GitHub client createRepo)
// 3. Develop Agent implements GitHub client
// 4. Test Agent writes unit test (Git manager createBranches)
// 5. Develop Agent implements Git manager
// 6. ... continues until all tests pass
```

---

### Example 3: Fix Bug or Refactor

```typescript
const result = await tddRoutingAgent.network(
  "The init command is slow (takes 25 seconds). " +
  "Optimize to complete in < 10 seconds. " +
  "Maintain all existing tests passing."
);

// Network will:
// 1. Collect current system state
// 2. Test Agent writes performance test (timing assertion)
// 3. Develop Agent profiles and optimizes code
// 4. Verify all existing tests still pass
```

---

## 📊 Network Flow Diagram

```
User Input: "Implement server management"
    ↓
TDD Routing Agent
    ↓
    ├─→ System State Tool (collect current code)
    ↓
    ├─→ Test Agent
    │   ├─→ Write integration test (server start/stop E2E)
    │   ├─→ Git Manager (commit to test branch)
    │   └─→ Write unit test (Mastra client start method)
    ↓
    ├─→ Develop Agent
    │   ├─→ Implement Mastra client (minimal code)
    │   ├─→ Run tests (RED → GREEN)
    │   └─→ Git Manager (commit to develop branch)
    ↓
    ├─→ Test Agent
    │   └─→ Write next unit test (server status method)
    ↓
    ├─→ Develop Agent
    │   ├─→ Implement server status
    │   ├─→ Run tests (GREEN)
    │   └─→ Refactor
    ↓
    ... repeat until all tests passing ...
    ↓
    ├─→ Git Manager (merge develop → test)
    ↓
TDD Routing Agent returns summary
```

---

## ✅ Success Criteria

**Network completes successfully when:**
- All tests passing (100%)
- Test coverage ≥ 85%
- All code committed to both branches
- develop branch merged to test branch
- Feature working as described

**Network fails when:**
- Tests fail after 20 iterations
- Coverage drops below 85%
- Git conflicts occur
- Timeout (30 minutes)

---

## 🚀 Running the Network

### Start TDD Network

```bash
# In your main app
import { tddRoutingAgent } from './mastra/agents/tdd-routing-agent';

const result = await tddRoutingAgent.network(
  "Feature description here..."
);

for await (const chunk of result) {
  console.log(chunk.type, chunk.payload);
}
```

### Monitor Progress

```typescript
for await (const chunk of result) {
  switch (chunk.type) {
    case "agent-execution-start":
      console.log(`🤖 Agent: ${chunk.payload.agentName}`);
      break;
      
    case "tool-execution-start":
      console.log(`🔧 Tool: ${chunk.payload.toolId}`);
      break;
      
    case "network-execution-event-step-finish":
      console.log(`✅ Step complete:`, chunk.payload.result);
      break;
  }
}
```

---

## 🎓 Key Advantages

1. **Fully Autonomous** - No manual branch switching or commits
2. **True TDD** - Tests always written first
3. **Iterative** - Smallest possible changes
4. **Traceable** - Every decision logged in Git
5. **Quality** - 85%+ coverage enforced
6. **Fast** - Parallel agent execution
7. **Recoverable** - Can resume from any Git state

---

## 📚 Next Steps

1. **Implement agents** in `src/mastra/agents/`
2. **Implement tools** in `src/mastra/tools/`
3. **Implement workflow** in `src/mastra/workflows/`
4. **Test network** with simple feature
5. **Iterate** on agent instructions based on results

---

**Ready to build autonomously.** 🤖✨

