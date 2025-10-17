#!/bin/bash
# TDD Orchestrator - Runs test-agent and develop-agent in Red-Green-Refactor loop

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

FEATURE="$1"
MAX_ITERATIONS="${2:-10}"
TEST_WORKSPACE="${3:-.build-agent/test}"
DEVELOP_WORKSPACE="${4:-.build-agent/develop}"

if [ -z "$FEATURE" ]; then
    log_error "Usage: tdd-orchestrator.sh <feature-description> [max-iterations] [test-workspace] [develop-workspace]"
    echo ""
    echo "Example:"
    echo "  tdd-orchestrator.sh \"Add hello command\" 5"
    echo "  tdd-orchestrator.sh \"Fix bug\" 10 ../test ../develop"
    exit 1
fi

log_info "TDD Orchestrator starting..."
log_info "Feature: $FEATURE"
log_info "Max iterations: $MAX_ITERATIONS"
echo ""

# Validate requirements
validate_requirements || exit 1

# Resolve workspace paths to absolute
if [[ "$TEST_WORKSPACE" != /* ]]; then
    TEST_WORKSPACE="$(cd "$TEST_WORKSPACE" 2>/dev/null && pwd || echo "$TEST_WORKSPACE")"
fi
if [[ "$DEVELOP_WORKSPACE" != /* ]]; then
    DEVELOP_WORKSPACE="$(cd "$DEVELOP_WORKSPACE" 2>/dev/null && pwd || echo "$DEVELOP_WORKSPACE")"
fi

# Check workspaces exist
if [ ! -d "$TEST_WORKSPACE" ] || [ ! -d "$DEVELOP_WORKSPACE" ]; then
    log_error "Workspaces not found:"
    log_info "  Test: $TEST_WORKSPACE"
    log_info "  Develop: $DEVELOP_WORKSPACE"
    log_info ""
    log_info "For .build-agent workspaces: npm run dev workspace init"
    log_info "For solve workspaces: Use workspaces/repo/test and workspaces/repo/develop"
    exit 1
fi

# Note: TEST_WORKSPACE and DEVELOP_WORKSPACE can be the same for single-workspace mode
WORKSPACE="$TEST_WORKSPACE"

log_info "Working in: $WORKSPACE"
echo ""

# Phase 1: Write Tests (RED)
log_info "📝 Phase 1: Writing tests..."
echo ""

bash "$SCRIPT_DIR/test-agent.sh" "$WORKSPACE" "$FEATURE"

# Get test file that was created
TEST_FILE=$(cd "$WORKSPACE" && git log -1 --name-only --pretty=format: | grep "\.test\.ts$" | head -1)

if [ -z "$TEST_FILE" ]; then
    log_error "No test file found in last commit"
    exit 1
fi

log_success "Test file created: $TEST_FILE"
echo ""

# Phase 2: Implement (GREEN)
log_info "💻 Phase 2: Implementing feature..."
echo ""

ITERATION=1
TESTS_PASS=false

LAST_ERROR=""
REPEATED_ERROR_COUNT=0

while [ $ITERATION -le $MAX_ITERATIONS ] && [ "$TESTS_PASS" = false ]; do
    log_info "Iteration $ITERATION/$MAX_ITERATIONS"
    
    # Pass last error to develop agent
    bash "$SCRIPT_DIR/develop-agent.sh" "$WORKSPACE" "$TEST_FILE" "$LAST_ERROR"
    
    # Check if tests pass and capture output
    cd "$WORKSPACE"
    TEST_OUTPUT=$(npm test -- "$TEST_FILE" 2>&1 || true)
    
    # Parse test output for actual pass/fail
    if echo "$TEST_OUTPUT" | grep -q "Test Files.*[1-9].* passed"; then
        TESTS_PASS=true
        log_success "Tests PASS! Feature complete! ✓"
    else
        # Extract error from output
        CURRENT_ERROR=$(echo "$TEST_OUTPUT" | grep -E "(Error|TypeError|FAIL)" | head -5)
        
        # Check if same error repeated
        if [ "$CURRENT_ERROR" = "$LAST_ERROR" ]; then
            REPEATED_ERROR_COUNT=$((REPEATED_ERROR_COUNT + 1))
        else
            REPEATED_ERROR_COUNT=0
        fi
        
        LAST_ERROR="$CURRENT_ERROR"
        
        # Early termination if same error 3 times
        if [ $REPEATED_ERROR_COUNT -ge 3 ]; then
            log_error "Same error repeated 3 times. Stopping iteration."
            log_error "Error: $CURRENT_ERROR"
            break
        fi
        
        log_warning "Tests still failing, will iterate..."
        log_info "Error: $CURRENT_ERROR"
    fi
    
    ITERATION=$((ITERATION + 1))
done

cd - >/dev/null

if [ "$TESTS_PASS" = false ]; then
    log_error "Failed to pass tests after $MAX_ITERATIONS iterations"
    exit 1
fi

log_success "All tests passing!"
echo ""

# Summary
cat <<EOF
${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
${GREEN}🎉 TDD CYCLE COMPLETE!${NC}
${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

Feature: $FEATURE
Workspace: $WORKSPACE
Test file: $TEST_FILE

✓ Tests written and committed
✓ Implementation written and committed
✓ All tests passing
✓ Ready for PR

Iterations: $ITERATION/$MAX_ITERATIONS

${CYAN}Next steps:${NC}
  Review changes: cd $WORKSPACE && git log -10
  Run all tests: cd $WORKSPACE && npm test
  Create PR: cd $WORKSPACE && gh pr create

${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
EOF

