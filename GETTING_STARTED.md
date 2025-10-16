# Getting Started with Build Agent TDD Network

**Date:** 2025-10-16  
**Status:** Ready to use

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create a `.env` file:

```bash
# Required
OPENAI_API_KEY=sk-your-openai-key-here
GITHUB_TOKEN=ghp_your-github-token-here
GITHUB_USER=your-github-username
```

### 3. Build the CLI

```bash
npm run build
```

### 4. Run Your First TDD Workflow

```bash
# Use the TDD agent network to implement a feature
npm run dev tdd "Add a hello world command to the CLI"
```

---

## 🤖 How the TDD Network Works

The TDD agent network is a Mastra agent network that autonomously implements features using test-driven development.

### Architecture

```
User Request: "Implement feature X"
    ↓
TDD Routing Agent (orchestrator)
    ↓
    ├─→ System State Tool (collects current code)
    ├─→ Test Agent (writes tests)
    ├─→ Develop Agent (implements code)
    └─→ Git Manager (commits everything)
```

### Autonomous TDD Process

1. **Analysis Phase**
   - Routing agent parses your feature request
   - System State Tool collects current codebase
   - Identifies what needs to be built

2. **Test Specification Phase**
   - Switches to `test` branch
   - Test Agent writes integration test (E2E behavior)
   - Test Agent writes first unit test (smallest piece)
   - Commits tests to test branch

3. **Implementation Phase**
   - Switches to `develop` branch
   - Develop Agent reads failing test
   - Implement MINIMAL code to pass that test
   - Commits implementation to develop branch

4. **Iteration Phase**
   - Test Agent writes next unit test
   - Develop Agent implements next piece
   - Repeats until all tests passing

5. **Completion Phase**
   - Merges develop into test branch
   - Returns summary of work completed

---

## 📋 Usage Examples

### Example 1: Implement Server Management

```bash
npm run dev tdd "Implement server management commands:
- build-agent server start (start Mastra server)
- build-agent server stop (stop server)
- build-agent server status (check if running)
- build-agent server logs (view logs)

Should detect Docker vs Node environment and start in < 10 seconds."
```

**What Happens:**
1. Network analyzes the request
2. Test Agent writes integration test for server commands
3. Test Agent writes unit test for MastraClient.start()
4. Develop Agent implements MastraClient.start()
5. Test Agent writes unit test for MastraClient.stop()
6. Develop Agent implements MastraClient.stop()
7. ... continues until all commands implemented
8. All tests passing, code committed to both branches

---

### Example 2: Implement Idea Initialization

```bash
npm run dev tdd "Implement idea initialization:
- build-agent init <name> --description <desc>
- Should create GitHub repository
- Should setup 6 waterfall branches (requirements, analysis, design, implementation, testing, validation)
- Should initialize docs (REQUIREMENTS.md, ASSUMPTIONS.md, GOALS.md)
- Should complete in < 10 seconds

File structure:
- src/commands/init.ts (command handler)
- src/lib/github-client.ts (GitHub API)
- src/lib/git-manager.ts (local Git ops)"
```

---

### Example 3: Fix a Bug

```bash
npm run dev tdd "The init command is slow (takes 25 seconds).
Optimize to complete in < 10 seconds while maintaining all existing tests passing."
```

---

## 🎯 Command Options

```bash
build-agent tdd <feature> [options]

Arguments:
  feature                    Feature description to implement

Options:
  --max-iterations <number>  Maximum TDD iterations (default: 20)
  -h, --help                Display help for command
```

---

## 📊 Monitoring Progress

The TDD network streams progress in real-time:

```
🤖 TDD Agent Network Starting...
Feature: Implement server management

✓ Collecting system state...
✓ TDD Routing Agent analyzing...
📝 Test Agent writing specifications...
✓ Writing Tests complete
  Tests: 0/1 passing

💻 Develop Agent implementing code...
✓ Implementing complete
  Tests: 1/1 passing
  Coverage: 87%

✅ TDD workflow complete!

📊 Summary:
  Tests Written: 12
  Tests Passing: 12
  Files Changed: 4
  
  src/commands/server.ts
  src/lib/mastra-client.ts
  tests/commands/server.test.ts
  tests/lib/mastra-client.test.ts
```

---

## 🏗️ Project Structure

After the TDD network runs, your code will be organized as:

```
build-agent/
├── src/
│   ├── commands/         # Command handlers (from TDD network)
│   │   ├── init.ts
│   │   ├── server.ts
│   │   └── ...
│   ├── lib/              # Core logic (from TDD network)
│   │   ├── github-client.ts
│   │   ├── mastra-client.ts
│   │   └── ...
│   ├── mastra/           # TDD agent network
│   │   ├── agents/
│   │   ├── tools/
│   │   └── workflows/
│   └── index.ts          # CLI entry point
├── tests/                # Test specs (from TDD network)
│   ├── commands/
│   ├── lib/
│   └── integration/
└── package.json
```

---

## 🧪 Running Tests Manually

The TDD network automatically runs tests, but you can also run them manually:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Check test coverage
open coverage/index.html
```

---

## 🔧 Development Workflow

### Option 1: Let AI Build Everything (Recommended)

```bash
# Just describe what you want
npm run dev tdd "Implement <feature>"

# The network will:
# - Write all tests
# - Implement all code
# - Commit everything
# - Return when complete
```

### Option 2: Traditional TDD (Manual)

```bash
# If you want to write code yourself
git checkout test
# Write tests manually

git checkout develop
# Implement manually

npm test  # Check if passing
```

---

## 📚 Key Files

### Agent Network

- `src/mastra/agents/tdd-routing-agent.ts` - Orchestrates workflow
- `src/mastra/agents/test-agent.ts` - Writes test specs
- `src/mastra/agents/develop-agent.ts` - Implements features

### Tools

- `src/mastra/tools/system-state.ts` - Collects codebase context
- `src/mastra/tools/git-manager.ts` - Automates Git operations

### Commands

- `src/commands/tdd.ts` - CLI command to run TDD network

---

## ⚠️ Important Notes

### Environment Variables

The TDD network needs:
- `OPENAI_API_KEY` - For AI agents (GPT-4)
- `GITHUB_TOKEN` - For creating repositories
- `GITHUB_USER` - Your GitHub username

### Git Branch Management

The network automatically manages branches:
- `test` - Test specifications
- `develop` - Implementation code
- Don't manually switch branches while network is running

### Cost Considerations

The TDD network uses GPT-4 which has costs:
- Simple features: ~$0.50-$2.00
- Complex features: ~$2.00-$10.00
- Monitor your OpenAI usage dashboard

---

## 🎯 Success Criteria

The TDD network completes successfully when:

✅ All tests passing (100%)  
✅ Test coverage ≥ 85%  
✅ All code committed to both branches  
✅ `develop` branch merged to `test` branch  
✅ Feature working as described  

---

## 🐛 Troubleshooting

### "OpenAI API key not found"

```bash
# Set in .env file
echo "OPENAI_API_KEY=sk-your-key" >> .env
```

### "GitHub token not found"

```bash
# Create token: https://github.com/settings/tokens/new
# Scopes needed: repo, workflow
echo "GITHUB_TOKEN=ghp_your-token" >> .env
echo "GITHUB_USER=your-username" >> .env
```

### "Network timeout"

The network has a default timeout of 30 minutes. For complex features:

```bash
# Increase iterations
npm run dev tdd "feature" --max-iterations 50
```

### "Tests failing"

The network will retry, but if consistently failing:

```bash
# Check the test output
npm test

# Fix manually, then resume
git checkout develop
# Fix the issue
git commit -m "fix: Manual fix for failing test"
```

---

## 📈 Next Steps

1. **Implement your first feature** using the TDD network
2. **Review the generated code** to understand patterns
3. **Iterate** - Let the network build your entire CLI
4. **Deploy** when all 5 MVP features are complete

---

## 🎉 You're Ready!

The autonomous TDD system is running. Just describe what you want to build and the agent network will:
- Write comprehensive tests
- Implement clean code
- Commit everything to Git
- Return when complete

**Let's build!** 🚀

```bash
npm run dev tdd "Implement server management commands"
```

