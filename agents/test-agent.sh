#!/bin/bash
# Test Agent - Writes test specifications for features

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

# Workspace: .build-agent/test/
WORKSPACE="${1:-.build-agent/test}"
FEATURE="$2"

if [ -z "$FEATURE" ]; then
    log_error "Usage: test-agent.sh <workspace> <feature-description>"
    exit 1
fi

log_info "Test Agent starting..."
log_info "Workspace: $WORKSPACE"
log_info "Feature: $FEATURE"

# Validate requirements
validate_requirements || exit 1

# Change to workspace
cd "$WORKSPACE" || exit 1

# Collect codebase context
log_info "Analyzing codebase..."

PACKAGE_INFO=""
if [ -f "package.json" ]; then
    PACKAGE_INFO=$(cat package.json | head -30)
fi

FILE_TREE=$(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | head -50)

# Generate test specification
log_info "Generating test specification..."

TEST_PROMPT=$(cat <<EOF
You are a test specification expert using Vitest and TypeScript.

FEATURE TO TEST:
$FEATURE

CODEBASE CONTEXT:
Package.json:
$PACKAGE_INFO

File structure:
$FILE_TREE

YOUR TASK:
Analyze the feature description carefully:
1. If this is a NEW feature, create tests for a new module
2. If this is a BUG FIX, identify which EXISTING file needs testing and import from it
3. If unclear, create tests for a new module

Write comprehensive test code using Vitest.

CRITICAL REQUIREMENTS:
- Import from EXISTING files in the codebase when fixing bugs
- Use correct import paths (check the file structure above)
- All imports must be valid TypeScript module paths
- Test file must be able to RUN (no import errors)

Output ONLY the test code, ready to save to a file.
Include:
- All necessary imports (with correct paths!)
- describe() blocks
- test() cases for happy path and edge cases
- Mocks for external dependencies if needed
- TypeScript types

Format as complete, runnable Vitest test file.
No explanations, just code.
EOF
)

# Call OpenRouter
TEST_CODE=$(call_openrouter "$TEST_PROMPT" "google/gemini-2.0-flash-exp:free")

if [ -z "$TEST_CODE" ]; then
    log_error "Failed to generate test code"
    exit 1
fi

# Determine test file path
TEST_FILE="tests/$(echo "$FEATURE" | tr ' ' '-' | tr '[:upper:]' '[:lower:]').test.ts"

log_info "Writing test file: $TEST_FILE"

# Write test file
write_file "$TEST_FILE" "$TEST_CODE"

# Commit
commit_changes "test: Add test for $FEATURE"

log_success "Test agent complete!"
log_info "Test file: $TEST_FILE"
log_info "Lines: $(echo "$TEST_CODE" | wc -l)"

# Output summary
cat <<EOF

📝 Test Created:
   File: $TEST_FILE
   Lines: $(echo "$TEST_CODE" | wc -l)
   
🔄 Next: Run develop-agent to implement feature
EOF

