#!/bin/bash
# Develop Agent - Implements features to make tests pass

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

# Workspace: .build-agent/develop/
WORKSPACE="${1:-.build-agent/develop}"
TEST_FILE="$2"
PREVIOUS_ERROR="${3:-}"

if [ -z "$TEST_FILE" ]; then
    log_error "Usage: develop-agent.sh <workspace> <test-file-path> [previous-error]"
    exit 1
fi

log_info "Develop Agent starting..."
log_info "Workspace: $WORKSPACE"
log_info "Test file: $TEST_FILE"
if [ -n "$PREVIOUS_ERROR" ]; then
    log_info "Previous error: $PREVIOUS_ERROR"
fi

# Validate requirements
validate_requirements || exit 1

# Change to workspace
cd "$WORKSPACE" || exit 1

# Check if test file exists (should be in same workspace)
log_info "Looking for test file: $TEST_FILE"

if [ ! -f "$TEST_FILE" ]; then
    log_error "Test file not found: $TEST_FILE"
    log_info "Available test files:"
    find tests -name "*.test.ts" 2>/dev/null | head -10 || echo "  (none found)"
    log_info ""
    log_info "Make sure test-agent ran first in the same workspace"
    exit 1
fi

# Read test file
TEST_CODE=$(cat "$TEST_FILE")

log_info "Test file loaded ($(echo "$TEST_CODE" | wc -l) lines)"

# Collect codebase context
PACKAGE_INFO=""
if [ -f "package.json" ]; then
    PACKAGE_INFO=$(cat package.json | head -30)
fi

FILE_TREE=$(find src -type f 2>/dev/null | head -30 || echo "")

# Generate implementation
log_info "Generating implementation..."

ERROR_CONTEXT=""
if [ -n "$PREVIOUS_ERROR" ]; then
    ERROR_CONTEXT=$(cat <<EOF

PREVIOUS ATTEMPT FAILED WITH:
$PREVIOUS_ERROR

IMPORTANT: Your previous implementation caused the above error.
Analyze what went wrong and FIX IT in this iteration.
Do NOT repeat the same mistake.
EOF
)
fi

IMPL_PROMPT=$(cat <<EOF
You are an expert TypeScript developer focused on TDD and clean code.

TEST CODE:
\`\`\`typescript
$TEST_CODE
\`\`\`

CODEBASE CONTEXT:
Package.json:
$PACKAGE_INFO

Existing files:
$FILE_TREE
$ERROR_CONTEXT

YOUR TASK:
Write the MINIMAL implementation needed to make this test pass.

Output ONLY the implementation code, ready to save to a file.
Include:
- All necessary imports
- TypeScript types (strict mode, no 'any')
- Clean, readable functions
- Error handling
- Comments only for WHY, not WHAT

Format as complete, runnable TypeScript file.
No explanations, just code.

Remember: Write MINIMAL code, just enough to pass the test.
EOF
)

# Call OpenRouter
IMPL_CODE=$(call_openrouter "$IMPL_PROMPT" "google/gemini-2.0-flash-exp:free")

if [ -z "$IMPL_CODE" ]; then
    log_error "Failed to generate implementation code"
    exit 1
fi

# Determine implementation file path from test
# tests/commands/hello.test.ts -> src/commands/hello.ts
IMPL_FILE=$(echo "$TEST_FILE" | sed 's|^tests/|src/|' | sed 's|\.test\.ts$|.ts|')

log_info "Writing implementation file: $IMPL_FILE"

# Write implementation file
write_file "$IMPL_FILE" "$IMPL_CODE"

# Run tests (orchestrator will check results, we just run them here for logging)
log_info "Running tests..."
npm test -- "$TEST_FILE" 2>&1 | tee /tmp/test-output.log || true

# Commit (orchestrator determines pass/fail, we always commit for TDD cycle)
commit_changes "feat: Implement $(basename "$IMPL_FILE" .ts)"

log_success "Develop agent complete!"
log_info "Implementation file: $IMPL_FILE"
log_info "Lines: $(echo "$IMPL_CODE" | wc -l)"

# Output summary
cat <<EOF

💻 Implementation Created:
   File: $IMPL_FILE
   Lines: $(echo "$IMPL_CODE" | wc -l)
   
🔄 Orchestrator will verify test results
EOF

