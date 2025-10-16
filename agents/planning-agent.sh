#!/bin/bash
# Planning Agent - Generates solution plans for problems

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

REPO_PATH="$1"
PROBLEM="$2"
OUTPUT_FILE="${3:-SOLUTION_PLAN.md}"

if [ -z "$PROBLEM" ]; then
    log_error "Usage: planning-agent.sh <repo-path> <problem-description> [output-file]"
    echo ""
    echo "Example:"
    echo "  planning-agent.sh ./mastra-repo \"Fix bundler import bug\" PLAN.md"
    exit 1
fi

log_info "Planning Agent starting..."
log_info "Repository: $REPO_PATH"
log_info "Problem: $PROBLEM"
log_info "Output: $OUTPUT_FILE"
echo ""

# Validate requirements
validate_requirements || exit 1

# Analyze repository
cd "$REPO_PATH" || exit 1

log_info "Analyzing repository..."

# Collect context
README=""
if [ -f "README.md" ]; then
    README=$(head -100 README.md)
fi

PACKAGE_INFO=""
if [ -f "package.json" ]; then
    PACKAGE_INFO=$(cat package.json)
fi

FILE_TREE=$(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.build-agent/*" | head -100)

# Generate test plan
log_info "🧪 Generating test plan..."

TEST_PLAN_PROMPT=$(cat <<EOF
You are a test strategy expert.

PROBLEM TO SOLVE:
$PROBLEM

REPOSITORY CONTEXT:
README:
$README

Package.json:
$(echo "$PACKAGE_INFO" | head -50)

File structure (first 50):
$(echo "$FILE_TREE" | head -50)

YOUR TASK:
Create a comprehensive test plan for solving this problem.

Output in markdown format with:
# Test Plan

## Problem Analysis
[Describe what needs to be tested and why]

## Files to Test
- path/to/file1.ts - [what it does]
- path/to/file2.ts - [what it does]

## Test Scenarios

### Integration Tests
File: tests/integration/feature-name.test.ts
- Test case 1: [description]
- Test case 2: [description]

### Unit Tests
File: tests/unit/component-name.test.ts
- Test case 1: [description]  
- Test case 2: [description]

## Mocks Required
- [Mock 1]
- [Mock 2]

## Validation Criteria
- [ ] All tests pass
- [ ] Coverage > 80%
- [ ] Edge cases handled

Be specific and actionable.
EOF
)

TEST_PLAN=$(call_openrouter "$TEST_PLAN_PROMPT")

if [ -z "$TEST_PLAN" ]; then
    log_error "Failed to generate test plan"
    exit 1
fi

log_success "Test plan generated ($(echo "$TEST_PLAN" | wc -l) lines)"

# Generate implementation plan
log_info "💻 Generating implementation plan..."

IMPL_PLAN_PROMPT=$(cat <<EOF
You are a software architecture expert.

PROBLEM TO SOLVE:
$PROBLEM

REPOSITORY CONTEXT:
README:
$README

Package.json:
$(echo "$PACKAGE_INFO" | head -50)

File structure (first 50):
$(echo "$FILE_TREE" | head -50)

YOUR TASK:
Create a detailed implementation plan for solving this problem.

Output in markdown format with:
# Implementation Plan

## Root Cause Analysis
[Explain why the problem occurs]

## Solution Approach
[High-level description of the fix]

## Files to Modify

### File 1: path/to/file.ts
**Current behavior:** [description]
**Change needed:** [description]
**Code changes:**
\`\`\`typescript
// Example of change
\`\`\`

### File 2: path/to/another-file.ts
**Current behavior:** [description]
**Change needed:** [description]

## Step-by-Step Implementation
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Edge Cases to Handle
- [Edge case 1]
- [Edge case 2]

## Validation Steps
- [ ] Tests pass
- [ ] No regressions
- [ ] Performance acceptable
- [ ] Security implications checked

Be specific with file paths and code examples.
EOF
)

IMPL_PLAN=$(call_openrouter "$IMPL_PLAN_PROMPT")

if [ -z "$IMPL_PLAN" ]; then
    log_error "Failed to generate implementation plan"
    exit 1
fi

log_success "Implementation plan generated ($(echo "$IMPL_PLAN" | wc -l) lines)"

# Generate complete plan document
log_info "📄 Creating complete solution plan..."

cat > "$OUTPUT_FILE" <<EOF
# Solution Plan: $PROBLEM

**Repository:** $(git remote get-url origin 2>/dev/null || echo "$REPO_PATH")  
**Generated:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")  
**Path:** $(pwd)

---

## 📋 How to Use This Plan

1. **Review the test plan** - Understand what needs testing
2. **Review the implementation plan** - Understand the fix approach  
3. **Use with Cursor Composer** - Feed it sections of this plan
4. **Work in TDD order** - Tests first, then implementation
5. **Validate thoroughly** - Run tests and check edge cases

---

$TEST_PLAN

---

$IMPL_PLAN

---

## 🚀 Quick Start Guide

### 1. Create Feature Branch
\`\`\`bash
git checkout -b fix/issue-name
\`\`\`

### 2. Write Tests (Use Test Plan Above)
Ask Cursor:
> "Using the test plan above, create the test files listed with all test cases."

### 3. Verify Tests Fail (RED)
\`\`\`bash
npm test
# Should fail - no implementation yet
\`\`\`

### 4. Implement Fix (Use Implementation Plan Above)
Ask Cursor:
> "Using the implementation plan above, modify the files listed with the changes described."

### 5. Verify Tests Pass (GREEN)
\`\`\`bash
npm test
# Should pass now
\`\`\`

### 6. Create PR
\`\`\`bash
git add .
git commit -m "fix: $PROBLEM"
git push origin fix/issue-name
gh pr create
\`\`\`

---

## ✅ Completion Checklist

- [ ] Feature branch created
- [ ] Tests written
- [ ] Tests fail initially (RED)
- [ ] Implementation written
- [ ] Tests pass (GREEN)
- [ ] No regressions
- [ ] Edge cases handled
- [ ] Code reviewed
- [ ] PR created
- [ ] CI passes

---

**Generated by Build Agent - Shell-Based Planning Agent**  
**Powered by OpenRouter + Google Gemini 2.0 Flash**
EOF

log_success "Plan written to: $OUTPUT_FILE"
echo ""

cat <<EOF
${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
${GREEN}📋 SOLUTION PLAN GENERATED!${NC}
${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

Output file: ${CYAN}$OUTPUT_FILE${NC}
Lines: $(wc -l < "$OUTPUT_FILE")

${YELLOW}Next steps:${NC}
  1. Review plan: ${GRAY}cat $OUTPUT_FILE${NC}
  2. Open in Cursor: ${GRAY}cursor $REPO_PATH${NC}
  3. Use Cursor Composer with plan sections
  4. Implement tests first, then fix
  5. Create PR!

${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
EOF

