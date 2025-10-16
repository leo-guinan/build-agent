# Build Agent CLI

> AI-powered CLI tool for validating startup ideas with waterfall methodology

## 🚀 Quick Start

```bash
# Install
npm install -g build-agent

# Configure
export OPENAI_API_KEY="sk-..."
export GITHUB_TOKEN="ghp_..."

# Create idea
build-agent init "My Idea" --description "Solve X problem"

# Run requirements
build-agent run requirements

# Check status
build-agent status
```

## 📋 Development

```bash
# Install dependencies
npm install

# Run in dev mode
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## 🏗️ Architecture

- **CLI Framework:** Commander.js
- **AI Backend:** Mastra
- **APIs:** GitHub REST API, OpenAI GPT-4
- **Storage:** ~/.build-agent/

## 📚 Documentation

See design branch for complete specification:
- `DESIGN.md` - Technical architecture
- `MVP_DEFINITION.md` - Feature definitions
- `BUILD_REFERENCE.md` - Quick reference

## 🧪 Testing

This project follows Test-Driven Development (TDD):
- **develop branch:** Implementation
- **test branch:** Test specs

Run tests: `npm test`

## 📦 Project Structure

```
build-agent/
├── src/
│   ├── index.ts           # CLI entry point
│   ├── commands/          # Command handlers
│   ├── lib/               # Core logic
│   ├── ui/                # Terminal UI
│   └── utils/             # Utilities
├── tests/                 # Test suite
├── package.json
└── tsconfig.json
```

## ⚡ MVP Features

1. **Server Management** - Start/stop Mastra server
2. **Idea Initialization** - Create GitHub repo with waterfall branches
3. **Workflow Execution** - Run AI-guided phase workflows
4. **Status Tracking** - Show progress and next steps
5. **Agent Chat** - Interactive Q&A with phase-specific AI

## 🎯 Timeline

- Week 3-5: Implementation
- Week 6: Testing
- Week 7: Beta
- Week 8: Launch

## 📄 License

MIT

