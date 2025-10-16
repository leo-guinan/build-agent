# Workspace Architecture
## Multi-Branch TDD with Isolated Working Directories

**Date:** 2025-10-16  
**Problem:** Agents switching branches in same directory causes conflicts  
**Solution:** Each branch gets its own permanent working directory

---

## 🏗️ New Architecture

### Directory Structure

```
build-agent/                           # Production branch (orchestrator)
├── src/mastra/                        # TDD network code (orchestrator)
│   ├── agents/                        # Routing, test, develop agents
│   ├── tools/                         # System state, git manager
│   └── storage/                       # LibSQL storage
├── workspaces/                        # Agent working directories
│   ├── test/                          # Test branch checkout (permanent)
│   │   ├── .git/                      # Full git repo
│   │   ├── src/
│   │   ├── tests/                     # Test files written here
│   │   ├── package.json
│   │   └── (all project files)
│   └── develop/                       # Develop branch checkout (permanent)
│       ├── .git/                      # Full git repo
│       ├── src/                       # Implementation written here
│       ├── tests/                     # Synced from test branch
│       ├── package.json
│       └── (all project files)
└── package.json                       # Orchestrator dependencies
```

---

## 🔄 Workflow Process

### Phase 1: Initialization

User runs from any project directory:
```bash
cd ~/my-cli-project
build-agent tdd init
```

**What happens:**
1. Creates `.build-agent/` directory in project root
2. Clones project into `.build-agent/test/` (checkout test branch)
3. Clones project into `.build-agent/develop/` (checkout develop branch)
4. Each workspace has its own `.git` directory
5. No branch switching - permanent checkouts

---

### Phase 2: TDD Cycle

```
User: "Implement server management"
    ↓
TDD Routing Agent (runs in production branch)
    ↓
    ├─→ Test Agent
    │   ├─ Works in: .build-agent/test/
    │   ├─ Always on: test branch
    │   ├─ Writes: tests/commands/server.test.ts
    │   ├─ Commits: git commit in .build-agent/test/
    │   └─ Pushes: git push origin test
    ↓
    ├─→ Develop Agent  
    │   ├─ Works in: .build-agent/develop/
    │   ├─ Always on: develop branch
    │   ├─ Pulls tests: git pull origin test (get latest tests)
    │   ├─ Runs: npm test (see failing tests)
    │   ├─ Writes: src/commands/server.ts
    │   ├─ Commits: git commit in .build-agent/develop/
    │   └─ Pushes: git push origin develop
    ↓
    ├─→ Test Agent (next iteration)
    │   ├─ Pulls develop: git pull origin develop (get latest code)
    │   ├─ Writes: Next test
    │   └─ Commits and pushes
    ↓
Repeat until complete
```

**Key Benefits:**
- No branch switching (test always in test/, develop always in develop/)
- Agents work in parallel (no conflicts)
- Each workspace is full git repo (can pull from other branches)
- Clean separation of concerns

---

## 🛠️ Updated Git Manager Tool

```typescript
// src/mastra/tools/git-manager.ts

export const gitManagerTool = new Tool({
  id: 'git-manager',
  description: `
    Manages Git operations for TDD workflow with isolated workspaces.
    
    Operations:
    - init-workspace: Create .build-agent/test/ and .build-agent/develop/
    - pull-branch: Pull changes from other branch
    - commit: Commit changes in workspace
    - push: Push commits to remote
    - sync: Pull from other branch's latest commits
    
    Workspaces:
    - .build-agent/test/ - Test agent works here (test branch)
    - .build-agent/develop/ - Develop agent works here (develop branch)
  `,
  inputSchema: z.object({
    operation: z.enum([
      'init-workspace',
      'pull-branch', 
      'commit',
      'push',
      'sync',
      'status'
    ]),
    workspace: z.enum(['test', 'develop']).optional(),
    sourceBranch: z.string().optional(), // For pulling from other branch
    message: z.string().optional(),
    files: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    workspace: z.string().optional(),
    branch: z.string().optional(),
  }),
  execute: async ({ context }: any) => {
    const { operation, workspace, sourceBranch, message, files } = context || {};
    const projectRoot = process.cwd();
    const workspaceRoot = `${projectRoot}/.build-agent`;
    
    try {
      switch (operation) {
        case 'init-workspace':
          // Create .build-agent directory
          execSync(`mkdir -p ${workspaceRoot}`);
          
          // Clone into test workspace
          if (!fs.existsSync(`${workspaceRoot}/test`)) {
            execSync(
              `git clone -b test . ${workspaceRoot}/test`,
              { cwd: projectRoot }
            );
          }
          
          // Clone into develop workspace  
          if (!fs.existsSync(`${workspaceRoot}/develop`)) {
            execSync(
              `git clone -b develop . ${workspaceRoot}/develop`,
              { cwd: projectRoot }
            );
          }
          
          return {
            success: true,
            message: 'Workspaces initialized at .build-agent/{test,develop}',
          };
          
        case 'pull-branch':
          // Pull changes from another branch
          const workspacePath = `${workspaceRoot}/${workspace}`;
          execSync(
            `git pull origin ${sourceBranch}`,
            { cwd: workspacePath }
          );
          
          return {
            success: true,
            message: `Pulled ${sourceBranch} into ${workspace} workspace`,
            workspace,
          };
          
        case 'commit':
          const commitPath = `${workspaceRoot}/${workspace}`;
          
          // Add files
          if (files && files.length > 0) {
            execSync(`git add ${files.join(' ')}`, { cwd: commitPath });
          } else {
            execSync('git add -A', { cwd: commitPath });
          }
          
          // Commit
          execSync(`git commit -m "${message}"`, { cwd: commitPath });
          
          return {
            success: true,
            message: `Committed in ${workspace}: ${message}`,
            workspace,
          };
          
        case 'push':
          const pushPath = `${workspaceRoot}/${workspace}`;
          const currentBranch = execSync('git branch --show-current', {
            cwd: pushPath,
            encoding: 'utf-8',
          }).trim();
          
          execSync(`git push origin ${currentBranch}`, { cwd: pushPath });
          
          return {
            success: true,
            message: `Pushed ${workspace} workspace to origin/${currentBranch}`,
            workspace,
            branch: currentBranch,
          };
          
        case 'sync':
          // Sync: pull latest from other branch
          const syncPath = `${workspaceRoot}/${workspace}`;
          const otherBranch = workspace === 'test' ? 'develop' : 'test';
          
          execSync(`git fetch origin ${otherBranch}`, { cwd: syncPath });
          execSync(`git merge origin/${otherBranch} --no-ff`, { cwd: syncPath });
          
          return {
            success: true,
            message: `Synced ${otherBranch} into ${workspace} workspace`,
          };
          
        case 'status':
          const statusPath = `${workspaceRoot}/${workspace}`;
          const status = execSync('git status --short', {
            cwd: statusPath,
            encoding: 'utf-8',
          });
          
          return {
            success: true,
            message: status || 'No changes',
            workspace,
          };
          
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Git operation failed: ${error.message}`,
      };
    }
  },
});
```

---

## 🤖 Updated Agent Instructions

### Test Agent (Works in .build-agent/test/)

```typescript
instructions: `
  You work in the .build-agent/test/ directory.
  This directory has the 'test' branch permanently checked out.
  
  Your workflow:
  1. Write test files in .build-agent/test/tests/
  2. Use git-manager with workspace: 'test' to commit
  3. Push changes to origin/test branch
  
  Never switch branches. You always work in test branch.
  
  File paths are relative to .build-agent/test/:
  - tests/commands/server.test.ts
  - tests/lib/mastra-client.test.ts
  
  After writing tests, return file paths so Develop Agent can find them.
`
```

### Develop Agent (Works in .build-agent/develop/)

```typescript
instructions: `
  You work in the .build-agent/develop/ directory.
  This directory has the 'develop' branch permanently checked out.
  
  Your workflow:
  1. Pull latest tests: git-manager pull-branch from 'test'
  2. Run tests: npm test in .build-agent/develop/
  3. See which tests are failing
  4. Write implementation in .build-agent/develop/src/
  5. Run tests until passing
  6. Use git-manager with workspace: 'develop' to commit
  7. Push changes to origin/develop branch
  
  Never switch branches. You always work in develop branch.
  
  File paths are relative to .build-agent/develop/:
  - src/commands/server.ts
  - src/lib/mastra-client.ts
  
  After implementation, return test results.
`
```

---

## 📁 .gitignore Updates

```
# Build Agent workspaces (each has own .git)
.build-agent/
```

The entire `.build-agent/` directory is ignored in the main repo, but each workspace has its own git repo inside.

---

## 🚀 Usage

### Initialize Workspaces

```bash
# From your project root
build-agent tdd init

# Creates:
# .build-agent/test/ (test branch checked out)
# .build-agent/develop/ (develop branch checked out)
```

### Run TDD Workflow

```bash
build-agent tdd "Implement server management"

# Behind the scenes:
# 1. Test Agent writes tests in .build-agent/test/
# 2. Test Agent commits and pushes to origin/test
# 3. Develop Agent pulls test branch changes
# 4. Develop Agent sees failing tests
# 5. Develop Agent writes code in .build-agent/develop/
# 6. Develop Agent commits and pushes to origin/develop
# 7. Repeat until complete
```

---

## 🎯 Advantages

### No Branch Switching
- test/ is always on test branch
- develop/ is always on develop branch
- No git checkout conflicts

### Parallel Work
- Both agents can work simultaneously
- No waiting for branch switches
- Faster iteration

### Clean State
- Each workspace is independent
- Can blow away and re-clone if issues
- Easy to debug (inspect actual files)

### Standard Git Workflow
- Each workspace is normal git repo
- Can manually inspect: `cd .build-agent/test && git log`
- Can manually fix: `cd .build-agent/develop && vim src/...`

---

## 🔧 Implementation Changes Needed

### 1. Update Git Manager Tool
- Remove branch switching
- Add workspace initialization
- Add pull-from-branch operation
- All operations specify workspace

### 2. Update Agent Instructions
- Test Agent: "You work in .build-agent/test/"
- Develop Agent: "You work in .build-agent/develop/"
- All file paths relative to workspace

### 3. Update System State Tool
- Accept workspace parameter
- Scan files in specified workspace
- Return workspace-relative paths

### 4. Add Workspace Manager
- Initialize workspaces
- Sync between workspaces
- Clean up workspaces

---

## 📊 File Structure After Init

```
my-cli-project/                        # User's project
├── .git/                              # Main repo
├── .build-agent/                      # TDD workspaces
│   ├── test/                          # Test agent workspace
│   │   ├── .git/                      # Separate git (test branch)
│   │   ├── src/
│   │   ├── tests/                     # Tests written here
│   │   │   ├── commands/
│   │   │   └── lib/
│   │   ├── package.json
│   │   └── node_modules/              # Separate deps
│   └── develop/                       # Develop agent workspace
│       ├── .git/                      # Separate git (develop branch)
│       ├── src/                       # Code written here
│       │   ├── commands/
│       │   └── lib/
│       ├── tests/                     # Pulled from test branch
│       ├── package.json
│       └── node_modules/              # Separate deps
├── src/                               # Production code
├── package.json
└── README.md
```

---

## 🔄 Updated TDD Flow

```
User: "Implement feature X"
    ↓
TDD Routing Agent (in main directory)
    ↓
Step 1: Initialize Workspaces (if needed)
    git-manager init-workspace
    → .build-agent/test/ (clone from origin, checkout test)
    → .build-agent/develop/ (clone from origin, checkout develop)
    ↓
Step 2: Test Agent Writes Tests
    working-directory: .build-agent/test/
    writes: tests/commands/server.test.ts
    git add tests/commands/server.test.ts
    git commit -m "test: Add server command tests"
    git push origin test
    ↓
Step 3: Develop Agent Pulls Tests
    working-directory: .build-agent/develop/
    git pull origin test (get latest tests)
    npm test (see failing tests)
    ↓
Step 4: Develop Agent Implements
    working-directory: .build-agent/develop/
    writes: src/commands/server.ts
    npm test (verify passing)
    git add src/commands/server.ts
    git commit -m "feat: Implement server command"
    git push origin develop
    ↓
Step 5: Test Agent Pulls Code (for next iteration)
    working-directory: .build-agent/test/
    git pull origin develop (get latest implementation)
    writes: tests/lib/mastra-client.test.ts
    git commit and push
    ↓
Repeat until all tests passing
```

---

## 🎯 Key Changes

### OLD (Broken):
```bash
# All in same directory
git checkout test     # Write tests
git commit
git checkout develop  # Write code
git commit
# ❌ Branch switching breaks running processes
# ❌ Can't work in parallel
# ❌ File system thrashing
```

### NEW (Fixed):
```bash
# Test agent
cd .build-agent/test/
# Always on test branch, write tests
git commit && git push

# Develop agent
cd .build-agent/develop/
# Always on develop branch, write code
git pull origin test  # Get latest tests
npm test              # Run tests
git commit && git push

# ✅ No branch switching
# ✅ Can work in parallel
# ✅ Clean separation
```

---

## 🔧 Implementation Tasks

### 1. Create Workspace Manager Tool

```typescript
// src/mastra/tools/workspace-manager.ts

export const workspaceManagerTool = new Tool({
  id: 'workspace-manager',
  description: 'Initialize and manage TDD workspaces',
  inputSchema: z.object({
    operation: z.enum(['init', 'clean', 'status']),
    projectRoot: z.string(),
  }),
  execute: async ({ context }) => {
    const { operation, projectRoot } = context;
    const workspaceRoot = `${projectRoot}/.build-agent`;
    
    switch (operation) {
      case 'init':
        // Create workspaces with separate git repos
        // ...
        break;
      case 'clean':
        // Remove workspaces
        break;
      case 'status':
        // Show workspace status
        break;
    }
  },
});
```

### 2. Update Git Manager

- Add `workspace` parameter to all operations
- All git commands run in workspace directory: `{ cwd: workspacePath }`
- Remove branch switching operations
- Add pull-from-branch operation

### 3. Update System State Tool

- Accept `workspace` parameter
- Scan files in `.build-agent/{workspace}/src/`
- Return workspace-relative paths

### 4. Update Agent Instructions

- Test Agent: Always use workspace: 'test'
- Develop Agent: Always use workspace: 'develop'
- File paths relative to workspace

---

## 📝 Updated Command Usage

```bash
# Initialize TDD workspaces
build-agent tdd init

# Verify workspaces created
ls -la .build-agent/
# test/
# develop/

# Run TDD workflow
build-agent tdd "Implement server management"

# TDD network will:
# - Test agent writes in .build-agent/test/
# - Develop agent writes in .build-agent/develop/
# - They pull from each other's branches
# - No branch switching conflicts

# Inspect workspaces manually
cd .build-agent/test && git log
cd .build-agent/develop && npm test

# Clean up workspaces when done
build-agent tdd clean
```

---

## ✅ Benefits of This Architecture

1. **No Conflicts** - Each branch has permanent home
2. **Parallel Work** - Agents can work simultaneously
3. **Easy Debugging** - Inspect actual files in workspaces
4. **Standard Git** - Normal git operations, no tricks
5. **Isolated Deps** - Each workspace has own node_modules
6. **Clean State** - Can reset workspace without affecting main
7. **User-Friendly** - User works in main dir, agents in .build-agent/

---

## 🚀 Next Steps

1. Create workspace-manager tool
2. Update git-manager with workspace support
3. Update agent instructions with workspace paths
4. Test the workflow
5. Build MVP features

---

**This architecture solves the branch switching problem cleanly!** 🎉

