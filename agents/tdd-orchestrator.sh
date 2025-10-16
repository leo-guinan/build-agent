#!/bin/bash
# TDD Orchestrator - Runs test-agent and develop-agent in Red-Green-Refactor loop

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

FEATURE="$1"
MAX_ITERATIONS="${2:-10}"

if [ -z "$FEATURE" ]; then
    log_error "Usage: tdd-orchestrator.sh <feature-description> [max-iterations]"
    echo ""
    echo "Example:"
    echo "  tdd-orchestrator.sh \"Add hello command that prints greeting\" 5"
    exit 1
fi

log_info "TDD Orchestrator starting..."
log_info "Feature: $FEATURE"
log_info "Max iterations: $MAX_ITERATIONS"
echo ""

# Validate requirements
validate_requirements || exit 1

# Workspace paths
TEST_WORKSPACE=".build-agent/test"
DEVELOP_WORKSPACE=".build-agent/develop"

# Check workspaces exist
if [ ! -d "$TEST_WORKSPACE" ] || [ ! -d "$DEVELOP_WORKSPACE" ]; then
    log_error "Workspaces not initialized"
    log_info "Run: npm run dev workspace init"
    exit 1
fi

# Phase 1: Write Tests (RED)
log_info "📝 Phase 1: Writing tests..."
echo ""

bash "$SCRIPT_DIR/test-agent.sh" "$TEST_WORKSPACE" "$FEATURE"

# Get test file that was created
TEST_FILE=$(cd "$TEST_WORKSPACE" && git log -1 --name-only --pretty=format: | grep "\.test\.ts$" | head -1)

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

while [ $ITERATION -le $MAX_ITERATIONS ] && [ "$TESTS_PASS" = false ]; do
    log_info "Iteration $ITERATION/$MAX_ITERATIONS"
    
    bash "$SCRIPT_DIR/develop-agent.sh" "$DEVELOP_WORKSPACE" "$TEST_FILE"
    
    # Check if tests pass
    cd "$DEVELOP_WORKSPACE"
    if npm test -- "$TEST_FILE" >/dev/null 2>&1; then
        TESTS_PASS=true
        log_success "Tests PASS! Feature complete! ✓"
    else
        log_warning "Tests still failing, iteration $((ITERATION + 1))..."
    fi
    
    ITERATION=$((ITERATION + 1))
done

cd - >/dev/null

if [ "$TESTS_PASS" = false ]; then
    log_error "Failed to pass tests after $MAX_ITERATIONS iterations"
    exit 1
fi

# Phase 3: Sync (merge develop → test)
log_info "🔄 Phase 3: Syncing branches..."
echo ""

cd "$TEST_WORKSPACE"
git pull origin develop
git push origin test
cd - >/dev/null

log_success "Branches synced!"
echo ""

# Summary
cat <<EOF
${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
${GREEN}🎉 TDD CYCLE COMPLETE!${NC}
${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

Feature: $FEATURE

✓ Tests written in $TEST_WORKSPACE
✓ Implementation in $DEVELOP_WORKSPACE
✓ Tests passing
✓ Branches synced

Iterations: $ITERATION/$MAX_ITERATIONS

${CYAN}Next steps:${NC}
  Review changes: cd $DEVELOP_WORKSPACE && git log -3
  Run all tests: cd $DEVELOP_WORKSPACE && npm test
  Create PR: gh pr create

${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
EOF

