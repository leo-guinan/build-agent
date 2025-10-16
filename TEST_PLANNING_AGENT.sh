#!/bin/bash
# Test the planning agent on the Mastra bundler bug

set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🧪 Testing Planning Agent on Mastra Bundler Bug${NC}\n"

# Check for API key
if [ -z "$OPENROUTER_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  OPENROUTER_API_KEY not set${NC}"
    echo ""
    echo "Get a free key at: https://openrouter.ai/"
    echo ""
    echo "Then run:"
    echo "  export OPENROUTER_API_KEY=\"sk-or-v1-your-key\""
    echo "  ./TEST_PLANNING_AGENT.sh"
    exit 1
fi

# Read bug description
BUG_DESCRIPTION=$(cat MASTRA_BUG.txt)

echo -e "${GREEN}✓${NC} API key found"
echo -e "${GREEN}✓${NC} Bug description loaded"
echo ""

# Run planning agent (will auto-clone Mastra if needed)
echo -e "${CYAN}Running planning agent...${NC}"
echo ""

./agents/planning-agent.sh \
  "https://github.com/mastra-ai/mastra" \
  "$BUG_DESCRIPTION" \
  MASTRA_BUNDLER_FIX_PLAN.md

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ PLAN GENERATED!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Review the plan:${NC}"
echo "  cat MASTRA_BUNDLER_FIX_PLAN.md"
echo ""
echo -e "${YELLOW}Use with Cursor:${NC}"
echo "  cursor workspaces/mastra-ai-mastra/main"
echo "  # Feed plan sections to Cursor Composer"
echo ""
echo -e "${YELLOW}Create PR after implementing:${NC}"
echo "  cd workspaces/mastra-ai-mastra/main"
echo "  gh pr create"
echo ""
