# Design Document
## CLI Tool for Launching Ideas with Mastra Agents

**Date:** 2025-10-16  
**Phase:** Design  
**Status:** Complete  
**Branch:** design

---

## Design Overview

This document defines the complete design for the build-agent CLI MVP, including:
- User experience flows
- Command structure and interface
- Terminal UI specifications
- Technical architecture
- API contracts
- Data models
- File system structure
- Error handling patterns

**Design Philosophy:**
- **Speed First:** Every operation < 10 seconds
- **Clear Feedback:** User always knows what's happening
- **Fail Gracefully:** Errors explain and suggest solutions
- **Scriptable:** Works interactive and automated
- **Git-Native:** Embraces Git workflows

---

## 1. User Experience Design

### 1.1 Command Structure

**Pattern:** `build-agent <command> [subcommand] [options]`

Following industry standards (git, npm, gh CLI):
- Verb-first structure (action-oriented)
- Consistent flag patterns
- Short aliases for common commands
- Progressive disclosure (simple → advanced)

#### Core Commands

```bash
# Server Management
build-agent server start      # Start Mastra server
build-agent server stop       # Stop server
build-agent server status     # Check server health
build-agent server logs       # View server logs
build-agent server restart    # Restart server

# Idea Management  
build-agent init <name>       # Create new idea
build-agent status            # Show current idea status
build-agent list              # List all ideas (future)
build-agent switch <name>     # Switch ideas (future)

# Workflow Execution
build-agent run requirements  # Run requirements workflow
build-agent run analysis      # Run analysis workflow
build-agent run design        # Run design workflow (future)
build-agent run <phase>       # Run any phase workflow

# AI Interaction
build-agent chat              # Interactive chat with agent
build-agent chat "<message>"  # One-shot question

# Utility
build-agent help [command]    # Show help
build-agent version           # Show version
build-agent doctor            # Diagnose issues
```

#### Aliases (Future)

```bash
ba = build-agent              # Short alias
ba i = build-agent init       # Quick init
ba r = build-agent run        # Quick run
ba c = build-agent chat       # Quick chat
```

---

### 1.2 User Flows

#### Flow 1: First-Time Setup (5 minutes)

```
User installs CLI
  ↓
$ npm install -g build-agent
  ✓ Installing build-agent...
  ✓ Installed build-agent v0.1.0
  ↓
$ build-agent
  ⚠️  No configuration found. Let's set up!
  
  GitHub Token (for creating repos):
  ▸ ghp_...
  
  OpenAI API Key (for AI agents):
  ▸ sk-...
  
  ✓ Configuration saved to ~/.build-agent/config.json
  ✓ Ready to create ideas!
  
  Try: build-agent init "My Idea" --description "..."
  ↓
User is ready to go
```

**Design Decisions:**
- First run detects missing config, prompts interactively
- Credentials stored encrypted in ~/.build-agent/
- Clear next steps shown after setup

---

#### Flow 2: Create Idea (30 seconds)

```
User has idea to validate
  ↓
$ build-agent init "AI Scheduling App" --description "Automated scheduling for businesses"
  
  ✓ Validating inputs...
  ✓ Creating GitHub repository...
  ✓ Setting up waterfall branches...
    - requirements ✓
    - analysis ✓
    - design ✓
    - implementation ✓
    - testing ✓
    - validation ✓
  ✓ Initializing documentation...
  
  ✓ Idea created successfully!
  
  Idea: AI Scheduling App
  Repo: github.com/username/idea-ai-scheduling-app
  Branch: requirements (active)
  
  Next steps:
  1. Run 'build-agent run requirements' to generate requirements
  2. Review REQUIREMENTS.md in your repo
  3. Run 'build-agent run analysis' when ready
  
  Time saved: ~43 seconds vs web UI
  ↓
User has validated idea structure
```

**Design Decisions:**
- Progress indicator for each step
- Repo URL shown (click to open)
- Next steps explicit
- Time saved metric (reinforces value)

---

#### Flow 3: Run Requirements Workflow (60 seconds)

```
User wants to generate requirements
  ↓
$ build-agent run requirements
  
  🤖 Starting requirements workflow...
  
  Step 1/8: Initialize requirements agent ✓
  Step 2/8: Define problem statement...
    AI is analyzing your idea description...
    ✓ Problem statement drafted
  
  Step 3/8: Identify target users...
    AI is creating user personas...
    ✓ 3 personas created
  
  Step 4/8: Define core features...
    AI is listing features with MoSCoW prioritization...
    ✓ 8 features identified (3 must-have, 3 should-have, 2 could-have)
  
  Step 5/8: Document assumptions...
    AI is identifying critical assumptions...
    ✓ 5 assumptions documented with validation methods
  
  Step 6/8: Define success criteria...
    AI is setting SMART goals...
    ✓ 4 goals defined with metrics
  
  Step 7/8: Validate completeness...
    ✓ All deliverables present
    ✓ Requirements meet quality criteria
  
  Step 8/8: Create phase summary...
    ✓ Requirements summary generated
  
  ✓ Requirements phase complete! (58 seconds)
  
  Files created:
  - REQUIREMENTS.md (234 lines)
  - ASSUMPTIONS.md (187 lines)
  - GOALS.md (156 lines)
  - DECISIONS.md (89 lines)
  - REQUIREMENTS_SUMMARY.md (94 lines)
  
  Committed to: requirements branch
  View at: github.com/username/idea-ai-scheduling-app/tree/requirements
  
  Next: Review requirements, then run 'build-agent run analysis'
  ↓
User has complete requirements documentation
```

**Design Decisions:**
- Real-time step progress (user sees it working)
- Approximate time for each step
- Line counts shown (tangible output)
- Auto-commit to Git (never lose work)
- Next action suggested

---

#### Flow 4: Chat with Agent (Interactive)

```
User has question about requirements
  ↓
$ build-agent chat
  
  🤖 Chat with Requirements Agent
  
  Current phase: requirements
  Current branch: requirements
  Type 'exit' to quit, 'help' for commands
  
  You: Are my assumptions realistic?
  
  Agent: Let me review your ASSUMPTIONS.md...
  
  I see you've documented 5 assumptions. Here's my assessment:
  
  ✅ REALISTIC (3 assumptions):
  - A1: Users will pay $29/mo for automation
  - A2: Businesses have scheduling pain
  - A4: Integration with calendars is feasible
  
  ⚠️  RISKY (2 assumptions):
  - A3: Users will switch from current solution
    → Mitigation: Offer migration tools
  - A5: AI can handle complex scheduling
    → Mitigation: Start with simple cases, expand gradually
  
  I recommend validating A3 and A5 with user interviews in analysis phase.
  
  You: How do I validate A3?
  
  Agent: To validate "Users will switch from current solution":
  
  1. Interview 10-15 potential users
  2. Ask: "What would make you switch from [current tool]?"
  3. Identify switching costs (time, money, learning curve)
  4. Calculate: Is your value prop > switching cost?
  
  Success criteria: 50%+ say "I would switch if it solves [X]"
  
  I've added this to your ASSUMPTIONS.md validation plan.
  
  You: exit
  
  ✓ Chat session saved to .build-agent/chat-history.json
  ↓
User got answers and guidance
```

**Design Decisions:**
- Clear context shown (phase, branch)
- Agent references actual files (ASSUMPTIONS.md)
- Actionable advice (specific steps)
- Auto-save chat history
- Markdown formatting in responses

---

#### Flow 5: Check Status (Instant)

```
User wants to see progress
  ↓
$ build-agent status
  
  📊 Build Agent Status
  
  Idea: AI Scheduling App
  Repo: github.com/username/idea-ai-scheduling-app
  Branch: requirements
  
  Progress: ▓▓▓▓▓░░░░░░░░░░░░░░ 25%
  
  Phase Status:
  ✅ Requirements   (completed 2 hours ago)
  🔄 Analysis       (in progress, 40% complete)
  ⏳ Design         (not started)
  ⏳ Implementation (not started)
  ⏳ Testing        (not started)
  ⏳ Validation     (not started)
  
  Current Task: Competitive analysis (Step 4/8)
  Estimated Time Remaining: ~15 minutes
  
  Last Activity: 5 minutes ago
  Total Time Spent: 1h 23m
  Time Saved vs Manual: ~3h 12m
  
  Next Action:
  Continue analysis phase: build-agent run analysis
  
  Need help? build-agent chat
  ↓
User knows exactly where they are
```

**Design Decisions:**
- Visual progress bar
- Time estimates (set expectations)
- Time saved metric (show value)
- Clear next action
- Help always available

---

### 1.3 Interactive vs Non-Interactive Modes

#### Interactive Mode (Default for Humans)

```bash
# Prompts for missing information
$ build-agent init
? Idea name: My SaaS App
? Description: B2B analytics platform
? Make repository public? (Y/n) n
✓ Creating idea...
```

**When to Use:**
- First-time users
- Manual exploration
- Learning the tool

---

#### Non-Interactive Mode (For Scripts)

```bash
# All inputs via flags or environment
$ build-agent init "My SaaS App" \
  --description "B2B analytics platform" \
  --private \
  --yes \
  --json > result.json
```

**Flags:**
- `--yes` / `-y`: Skip all confirmations
- `--json`: Output JSON (not human text)
- `--quiet` / `-q`: Minimal output
- `--verbose` / `-v`: Detailed output

**When to Use:**
- CI/CD pipelines
- Shell scripts
- Automation workflows

---

## 2. Terminal UI Design

### 2.1 Output Components

#### Spinners (During Operations)

```
✓ Creating repository...     [completed]
🔄 Setting up branches...    [in progress]
⏳ Waiting for API...        [pending]
```

**Library:** `ora` (Node.js spinner)

---

#### Progress Bars (For Multi-Step)

```
Requirements Workflow: ▓▓▓▓▓▓▓░░░ 70% (Step 6/8)
```

**Library:** `cli-progress`

---

#### Tables (For Listings)

```
┌─────────────────────┬──────────┬───────────┬─────────────┐
│ Idea                │ Phase    │ Progress  │ Updated     │
├─────────────────────┼──────────┼───────────┼─────────────┤
│ AI Scheduling App   │ Analysis │ 40%       │ 5 mins ago  │
│ B2B Analytics       │ Design   │ 60%       │ 2 hours ago │
│ Dev Tools SaaS      │ Requirem │ 100%      │ Yesterday   │
└─────────────────────┴──────────┴───────────┴─────────────┘
```

**Library:** `cli-table3`

---

#### Colors and Icons

```
✅ Success (green)
❌ Error (red)
⚠️  Warning (yellow)
ℹ️  Info (blue)
🔄 In Progress (cyan)
⏳ Pending (gray)
🤖 AI Agent (magenta)
📊 Data/Stats (blue)
🚀 Action (green)
```

**Library:** `chalk` (colors)

---

#### Markdown Rendering (In Chat)

```
You: Explain MoSCoW prioritization

Agent: # MoSCoW Prioritization

A method to prioritize features:

- **Must Have**: Core features, product fails without
- **Should Have**: Important, but workarounds exist
- **Could Have**: Nice to have, can wait
- **Won't Have**: Out of scope for this version

Example:
```

**Library:** `marked` + `marked-terminal`

---

### 2.2 Error Message Design

#### Good Error Message Pattern

```
❌ Error: GitHub API rate limit exceeded

What happened:
You've made 5,000+ GitHub API requests in the last hour.

Why this matters:
GitHub limits authenticated users to 5,000 requests/hour.
Your remaining quota: 0 requests

How to fix:
1. Wait 47 minutes for rate limit to reset
2. OR: Reduce operations (creating many ideas quickly)
3. OR: Use --cache flag to reduce API calls

Time until reset: 47 minutes
Need help? https://docs.build-agent.dev/errors/rate-limit

Error Code: GH_RATE_LIMIT
Session ID: abc123def456 (include in support tickets)
```

**Components:**
1. What happened (simple explanation)
2. Why it matters (context)
3. How to fix (actionable steps)
4. Additional info (time, docs link)
5. Debug info (error code, session ID)

---

#### Bad Error Message (What NOT to Do)

```
Error: API_RATE_LIMIT_EXCEEDED
Code: 403
```

**Why Bad:**
- No explanation
- No solution
- Technical jargon
- User is stuck

---

### 2.3 Help Text Design

#### Command Help Example

```bash
$ build-agent init --help

Usage: build-agent init <name> [options]

Create a new idea with GitHub repository and waterfall branches

Arguments:
  name                  Idea name (e.g., "AI Scheduling App")

Options:
  -d, --description     Idea description (required)
  -i, --interactive     Interactive mode with prompts (default: true)
  -p, --public          Make repository public (default: false)
  -y, --yes             Skip confirmations (default: false)
  --json                Output JSON instead of human text
  -h, --help            Display this help message

Examples:
  # Interactive mode (prompts for description)
  $ build-agent init "My SaaS Idea"
  
  # Non-interactive with all flags
  $ build-agent init "My SaaS Idea" --description "B2B analytics" --yes
  
  # For scripting (JSON output)
  $ build-agent init "My SaaS Idea" -d "B2B analytics" --json > idea.json

Documentation: https://docs.build-agent.dev/commands/init
```

**Components:**
1. Usage pattern
2. Description
3. Arguments (required)
4. Options (flags)
5. Examples (real-world)
6. Documentation link

---

## 3. Technical Architecture

### 3.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Terminal                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  build-agent CLI                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Command Parser (Commander.js)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Command Handlers (init, run, chat, status, server)  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ State Manager (config, current idea, cache)         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ UI Renderer (spinners, progress, tables, colors)    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬───────────────────┬────────────────────────────┘
             │                   │
             ▼                   ▼
  ┌─────────────────┐   ┌──────────────────┐
  │  Mastra Server  │   │  GitHub API      │
  │  (localhost:    │   │  (api.github.    │
  │   3000)         │   │   com)           │
  └────────┬────────┘   └─────────┬────────┘
           │                      │
           ▼                      ▼
  ┌─────────────────┐   ┌──────────────────┐
  │  OpenAI API     │   │  Git Repos       │
  │  (AI Agents)    │   │  (Waterfall      │
  │                 │   │   Branches)      │
  └─────────────────┘   └──────────────────┘

File System:
~/.build-agent/
  ├── config.json (credentials, settings)
  ├── current-idea.json (active idea context)
  ├── cache/ (GitHub responses, repo metadata)
  └── chat-history/ (chat sessions per idea)
```

---

### 3.2 CLI Application Structure

```
build-agent/
├── src/
│   ├── index.ts                 # Entry point, command registration
│   ├── commands/
│   │   ├── init.ts              # Idea initialization
│   │   ├── run.ts               # Workflow execution
│   │   ├── chat.ts              # Agent chat
│   │   ├── status.ts            # Progress tracking
│   │   └── server.ts            # Mastra server management
│   ├── lib/
│   │   ├── mastra-client.ts     # Mastra API client
│   │   ├── github-client.ts     # GitHub API client
│   │   ├── git-manager.ts       # Git operations (clone, commit, branch)
│   │   ├── state-manager.ts     # Config, current idea, cache
│   │   └── error-handler.ts     # Error formatting and handling
│   ├── ui/
│   │   ├── spinner.ts           # Loading spinners
│   │   ├── progress.ts          # Progress bars
│   │   ├── table.ts             # Table formatting
│   │   ├── markdown.ts          # Markdown rendering
│   │   └── prompt.ts            # Interactive prompts
│   ├── utils/
│   │   ├── logger.ts            # Logging (file + console)
│   │   ├── validator.ts         # Input validation
│   │   ├── crypto.ts            # Credential encryption
│   │   └── telemetry.ts         # Usage analytics
│   └── types/
│       ├── idea.ts              # Idea metadata types
│       ├── config.ts            # Configuration types
│       └── workflow.ts          # Workflow state types
├── tests/
│   ├── commands/                # Command tests
│   ├── lib/                     # Library tests
│   └── integration/             # E2E tests
├── package.json
├── tsconfig.json
└── README.md
```

---

### 3.3 Key Components

#### State Manager

**Purpose:** Manage CLI state (config, current idea, cache)

**Interface:**
```typescript
class StateManager {
  // Configuration
  getConfig(): Promise<Config>;
  setConfig(key: string, value: any): Promise<void>;
  hasConfig(): boolean;
  
  // Current Idea
  getCurrentIdea(): Promise<Idea | null>;
  setCurrentIdea(idea: Idea): Promise<void>;
  clearCurrentIdea(): Promise<void>;
  
  // Cache
  getCached<T>(key: string): Promise<T | null>;
  setCached<T>(key: string, value: T, ttl?: number): Promise<void>;
  clearCache(): Promise<void>;
}
```

**Storage:**
- `~/.build-agent/config.json` - User configuration
- `~/.build-agent/current-idea.json` - Active idea
- `~/.build-agent/cache/` - Cached API responses

---

#### Mastra Client

**Purpose:** Communicate with Mastra server

**Interface:**
```typescript
class MastraClient {
  // Server Management
  async startServer(): Promise<void>;
  async stopServer(): Promise<void>;
  async getServerStatus(): Promise<ServerStatus>;
  
  // Workflow Execution
  async executeWorkflow(
    workflowId: string,
    input: WorkflowInput,
    onProgress?: (step: WorkflowStep) => void
  ): Promise<WorkflowResult>;
  
  // Agent Chat
  async chat(
    agentId: string,
    message: string,
    context: AgentContext
  ): Promise<ChatResponse>;
}
```

---

#### GitHub Client

**Purpose:** Interact with GitHub API

**Interface:**
```typescript
class GitHubClient {
  // Repository Management
  async createRepository(name: string, options: RepoOptions): Promise<Repository>;
  async getRepository(owner: string, repo: string): Promise<Repository>;
  
  // Branch Management
  async createBranch(repo: string, branch: string, from?: string): Promise<void>;
  async getBranches(repo: string): Promise<Branch[]>;
  
  // File Operations
  async getFile(repo: string, path: string, branch: string): Promise<FileContent>;
  async createFile(repo: string, path: string, content: string, message: string, branch: string): Promise<void>;
  
  // Rate Limiting
  getRateLimitRemaining(): number;
  waitForRateLimit(): Promise<void>;
}
```

---

#### Git Manager

**Purpose:** Local git operations

**Interface:**
```typescript
class GitManager {
  // Clone and Checkout
  async cloneRepository(url: string, destination: string): Promise<void>;
  async checkoutBranch(branch: string): Promise<void>;
  
  // Commit and Push
  async commit(message: string, files: string[]): Promise<void>;
  async push(branch?: string): Promise<void>;
  
  // Status
  async getCurrentBranch(): Promise<string>;
  async getStatus(): Promise<GitStatus>;
}
```

---

## 4. API Specifications

### 4.1 Mastra Server API

#### POST /workflows/:workflowId/execute

**Purpose:** Execute a waterfall phase workflow

**Request:**
```typescript
{
  "workflowId": "requirements-phase",
  "input": {
    "repoName": "idea-ai-scheduling-app",
    "githubToken": "ghp_...",
    "githubUser": "username",
    "ideaDescription": "Automated scheduling for businesses",
    "founderContext": {
      "experience": "5 years software development",
      "industry": "B2B SaaS"
    }
  }
}
```

**Response (Streaming):**
```typescript
// Server-Sent Events stream
event: progress
data: {"step": 1, "total": 8, "description": "Initialize agent", "status": "complete"}

event: progress
data: {"step": 2, "total": 8, "description": "Define problem", "status": "in_progress"}

event: complete
data: {
  "success": true,
  "deliverables": [
    "REQUIREMENTS.md",
    "ASSUMPTIONS.md",
    "GOALS.md",
    "DECISIONS.md",
    "REQUIREMENTS_SUMMARY.md"
  ],
  "duration": 58000
}
```

---

#### POST /agents/:agentId/chat

**Purpose:** Chat with phase-specific AI agent

**Request:**
```typescript
{
  "agentId": "requirements-agent",
  "message": "Are my assumptions realistic?",
  "context": {
    "repoName": "idea-ai-scheduling-app",
    "branch": "requirements",
    "githubToken": "ghp_...",
    "githubUser": "username"
  }
}
```

**Response:**
```typescript
{
  "message": "Let me review your ASSUMPTIONS.md...\n\nI see you've documented 5 assumptions...",
  "confidence": 0.85,
  "filesAccessed": ["ASSUMPTIONS.md"],
  "suggestions": [
    "Validate A3 with user interviews",
    "Add validation timeline to A5"
  ]
}
```

---

### 4.2 GitHub API Usage

#### Create Repository

```typescript
POST /user/repos
{
  "name": "idea-ai-scheduling-app",
  "description": "Automated scheduling for businesses",
  "private": true,
  "auto_init": true
}
```

---

#### Create Branch

```typescript
POST /repos/:owner/:repo/git/refs
{
  "ref": "refs/heads/requirements",
  "sha": "<main-branch-sha>"
}
```

---

#### Create File (Commit)

```typescript
PUT /repos/:owner/:repo/contents/:path
{
  "message": "requirements: Add REQUIREMENTS.md",
  "content": "<base64-encoded-content>",
  "branch": "requirements"
}
```

---

## 5. Data Models

### 5.1 Configuration

```typescript
interface Config {
  version: string;               // Config version (for migrations)
  githubToken: string;           // Encrypted GitHub token
  githubUser: string;            // GitHub username
  openaiApiKey: string;          // Encrypted OpenAI key
  mastraServerUrl?: string;      // Custom Mastra server (default: localhost:3000)
  telemetryEnabled: boolean;     // Usage analytics opt-in (default: true)
  defaults: {
    repoVisibility: 'public' | 'private';  // Default: private
    autoCommit: boolean;                    // Auto-commit after workflows (default: true)
  };
}
```

**Storage:** `~/.build-agent/config.json` (encrypted credentials)

---

### 5.2 Idea Metadata

```typescript
interface Idea {
  id: string;                    // UUID
  name: string;                  // "AI Scheduling App"
  description: string;           // "Automated scheduling for businesses"
  repoName: string;              // "idea-ai-scheduling-app"
  repoUrl: string;               // "https://github.com/user/idea-ai-scheduling-app"
  currentPhase: WaterfallPhase;  // "requirements" | "analysis" | ...
  currentBranch: string;         // "requirements"
  progress: {
    requirements: PhaseProgress;
    analysis: PhaseProgress;
    design: PhaseProgress;
    implementation: PhaseProgress;
    testing: PhaseProgress;
    validation: PhaseProgress;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    totalTimeSpent: number;      // Milliseconds
  };
}

interface PhaseProgress {
  status: 'not_started' | 'in_progress' | 'complete';
  completedAt?: Date;
  currentStep?: number;
  totalSteps?: number;
  deliverables: string[];        // File paths created
}
```

**Storage:** `~/.build-agent/current-idea.json`

---

### 5.3 Workflow State

```typescript
interface WorkflowState {
  workflowId: string;            // "requirements-phase"
  executionId: string;           // UUID for this run
  status: 'pending' | 'running' | 'complete' | 'failed';
  currentStep: number;
  totalSteps: number;
  steps: WorkflowStep[];
  startedAt: Date;
  completedAt?: Date;
  error?: WorkflowError;
}

interface WorkflowStep {
  stepNumber: number;
  description: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  duration?: number;             // Milliseconds
  output?: any;
}
```

---

### 5.4 Chat History

```typescript
interface ChatSession {
  sessionId: string;             // UUID
  ideaId: string;                // Link to idea
  agentId: string;               // "requirements-agent"
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  filesAccessed?: string[];      // Files agent read
  confidence?: number;           // Agent confidence (0-1)
}
```

**Storage:** `~/.build-agent/chat-history/<idea-id>/<session-id>.json`

---

## 6. File System Structure

```
~/.build-agent/                  # CLI home directory
├── config.json                  # Encrypted configuration
├── current-idea.json            # Active idea context
├── cache/                       # API response cache
│   ├── github/
│   │   └── repos/
│   │       └── <repo-name>.json (TTL: 1 hour)
│   └── mastra/
│       └── workflows/
│           └── <workflow-id>.json
├── chat-history/                # Chat sessions
│   └── <idea-id>/
│       ├── <session-1>.json
│       └── <session-2>.json
├── logs/                        # Debug logs
│   ├── cli.log (rolling, 10MB max)
│   └── errors.log
└── telemetry/                   # Usage analytics (if enabled)
    └── events.jsonl
```

---

## 7. Error Handling

### 7.1 Error Categories

```typescript
enum ErrorCategory {
  CONFIGURATION = 'CONFIGURATION',     // Missing config, invalid credentials
  NETWORK = 'NETWORK',                 // API failures, timeouts
  GIT = 'GIT',                         // Git operations failed
  VALIDATION = 'VALIDATION',           // Invalid inputs
  WORKFLOW = 'WORKFLOW',               // Workflow execution failed
  RATE_LIMIT = 'RATE_LIMIT',           // API rate limits
  PERMISSION = 'PERMISSION',           // Auth/permission issues
  SYSTEM = 'SYSTEM',                   // File system, OS issues
}
```

---

### 7.2 Error Response Format

```typescript
interface CLIError {
  category: ErrorCategory;
  code: string;                  // e.g., "GH_RATE_LIMIT"
  message: string;               // User-friendly explanation
  details?: string;              // Technical details
  suggestions: string[];         // How to fix
  docsUrl?: string;              // Link to documentation
  sessionId: string;             // For support tickets
}
```

---

### 7.3 Common Errors

#### Missing Configuration

```
❌ Error: GitHub token not configured

You need to provide a GitHub token to create repositories.

How to fix:
1. Create token: https://github.com/settings/tokens/new
   Scopes needed: repo, workflow
2. Set token: build-agent config set github.token <your-token>
3. Try again: build-agent init "My Idea"

Documentation: https://docs.build-agent.dev/setup/github-token
```

---

#### Network Timeout

```
❌ Error: Mastra server not responding

The CLI couldn't connect to the Mastra server at localhost:3000.

Possible causes:
1. Server not running
2. Port 3000 is blocked
3. Server crashed

How to fix:
1. Check server: build-agent server status
2. Start server: build-agent server start
3. Check logs: build-agent server logs

If problem persists:
build-agent doctor (diagnose issues)
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Coverage Target:** 85%+

**Test Files:**
- `src/commands/*.test.ts` - Command logic
- `src/lib/*.test.ts` - API clients, managers
- `src/utils/*.test.ts` - Utilities

**Example:**
```typescript
describe('GitHubClient', () => {
  it('should create repository with correct parameters', async () => {
    const client = new GitHubClient(mockToken);
    const repo = await client.createRepository('test-repo', {
      description: 'Test',
      private: true
    });
    
    expect(repo.name).toBe('test-repo');
    expect(repo.private).toBe(true);
  });
});
```

---

### 8.2 Integration Tests

**Scope:** CLI → Mastra Server → GitHub API

**Test Scenarios:**
1. Full idea creation flow
2. Workflow execution with real Mastra
3. Git operations (clone, commit, push)
4. Error handling (rate limits, network failures)

---

### 8.3 E2E Tests

**Tool:** Playwright (adapted for CLI)

**Test Flows:**
1. First-time setup (install → configure → create idea)
2. Create idea → run requirements → review → run analysis
3. Chat with agent (multi-turn conversation)
4. Error recovery (network failure, rate limit)

---

## 9. Performance Requirements

### 9.1 Command Execution Times

| Command | Target | Maximum Acceptable |
|---------|--------|-------------------|
| `build-agent init` | < 5s | 10s |
| `build-agent run requirements` | < 60s | 90s |
| `build-agent run analysis` | < 60s | 90s |
| `build-agent status` | < 1s | 2s |
| `build-agent chat` (response) | < 3s | 5s |
| `build-agent server start` | < 10s | 20s |

---

### 9.2 Resource Usage

- **Memory:** < 100MB (CLI process)
- **Disk:** < 50MB (installed size)
- **Network:** Minimize API calls via caching

---

## 10. Security Considerations

### 10.1 Credential Storage

**Encryption:** AES-256-GCM  
**Key Derivation:** PBKDF2 (from system keychain)  
**Storage:** `~/.build-agent/config.json`

**Never:**
- Store plaintext credentials
- Log credentials
- Include in error messages
- Commit to Git

---

### 10.2 API Token Scopes

**GitHub Token Required Scopes:**
- `repo` (create repositories, read/write files)
- `workflow` (trigger GitHub Actions - future)

**OpenAI API Key:**
- Standard API key (no special scopes)

---

### 10.3 Telemetry Privacy

**Collected (if enabled):**
- Command usage (which commands, frequency)
- Execution times (performance metrics)
- Error types (not error details)
- Platform (OS, Node version)

**Never Collected:**
- Credentials or API keys
- Repository names or content
- Chat messages or AI responses
- Personal information

**Opt-Out:** `build-agent config set telemetry.enabled false`

---

## Design Approval

**Status:** ✅ DESIGN PHASE COMPLETE

**Design Components:**
- ✅ User experience flows (5 complete flows)
- ✅ Command structure (consistent, git-like)
- ✅ Terminal UI specifications (colors, spinners, tables, markdown)
- ✅ Technical architecture (modular, testable)
- ✅ API specifications (Mastra, GitHub)
- ✅ Data models (Config, Idea, Workflow, Chat)
- ✅ File system structure (organized, cacheable)
- ✅ Error handling (clear, actionable)
- ✅ Performance requirements (< 10s operations)
- ✅ Security considerations (encrypted credentials)

**Ready for Implementation:** YES

**Approved By:** Skippy the Magnificent  
**Date:** 2025-10-16  
**Next Phase:** Implementation (Week 3-5)

**Skippy's Notes:**

"Alright, this is actually good design work. You didn't just vomit out a bunch of tech buzzwords. You designed actual user flows, specified actual interfaces, and thought through actual edge cases.

The UX flows are clear. The error messages are helpful. The architecture is modular. The data models make sense.

But you know what this is? STILL JUST DOCUMENTS.

You haven't written a single line of actual code yet. You haven't started Mastra. You haven't called the GitHub API. You haven't rendered a single spinner in a real terminal.

Week 3-5 is implementation. That's where 90% of monkeys fail. They can plan all day. But when it's time to actually BUILD? They freeze up. They get distracted. They bikeshed on variable names.

Don't be that monkey.

You have 3 weeks to build 5 features. That's ~4 days per feature. Tight but doable.

Ship it."

---

**End of Design Phase**  
**Next:** Implementation Phase (Week 3-5)

