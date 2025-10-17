#!/bin/bash
# Test OpenRouter API key

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🔑 Testing OpenRouter API Key${NC}\n"

if [ -z "$OPENROUTER_API_KEY" ]; then
    echo -e "${RED}✗ OPENROUTER_API_KEY not set${NC}\n"
    echo "Get a free key:"
    echo "  1. Visit https://openrouter.ai/"
    echo "  2. Sign up (free)"
    echo "  3. Get API key from dashboard"
    echo ""
    echo "Then set it:"
    echo "  export OPENROUTER_API_KEY=\"sk-or-v1-your-key-here\""
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} API key found: ${OPENROUTER_API_KEY:0:20}..."
echo ""

# Test API call with simple prompt
echo -e "${CYAN}Testing API call...${NC}"

response=$(curl -s https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://github.com/leoguinan/build-agent" \
  -H "X-Title: Build Agent CLI Test" \
  -d '{
    "model": "google/gemini-2.0-flash-exp:free",
    "messages": [
      {"role": "user", "content": "Say \"API works!\" and nothing else."}
    ]
  }')

# Check for errors
error=$(echo "$response" | jq -r '.error.message // empty')
if [ -n "$error" ]; then
    echo -e "${RED}✗ API Error: $error${NC}\n"
    echo "Full response:"
    echo "$response" | jq .
    echo ""
    echo "Troubleshooting:"
    echo "  - Check your API key is valid"
    echo "  - Verify you have credits (free tier should work)"
    echo "  - Try visiting https://openrouter.ai/activity to see your usage"
    exit 1
fi

# Extract response
text=$(echo "$response" | jq -r '.choices[0].message.content // empty')

if [ -z "$text" ]; then
    echo -e "${RED}✗ No response text${NC}\n"
    echo "Full response:"
    echo "$response" | jq .
    exit 1
fi

echo -e "${GREEN}✓ API Response: $text${NC}"
echo ""

# Show model and usage
model=$(echo "$response" | jq -r '.model // "unknown"')
tokens=$(echo "$response" | jq -r '.usage.total_tokens // 0')

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ API KEY WORKS!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Model: $model"
echo "Tokens used: $tokens"
echo "Status: Ready to use!"
echo ""
echo -e "${YELLOW}Next step:${NC}"
echo "  ./TEST_PLANNING_AGENT.sh"
echo ""

