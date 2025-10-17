#!/bin/bash
# Library of shared functions for shell-based agents

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_debug() {
    if [ "$DEBUG" = "1" ]; then
        echo -e "${GRAY}[DEBUG]${NC} $1" >&2
    fi
}

# Call OpenRouter API
# Usage: call_openrouter "prompt" "model" > output.txt
call_openrouter() {
    local prompt="$1"
    local model="${2:-google/gemini-2.0-flash-001:free}"
    local api_key="${OPENROUTER_API_KEY}"
    
    if [ -z "$api_key" ]; then
        log_error "OPENROUTER_API_KEY not set"
        return 1
    fi
    
    log_debug "Calling OpenRouter with model: $model"
    
    # Create JSON payload
    local json_payload=$(cat <<EOF
{
  "model": "$model",
  "messages": [
    {
      "role": "user",
      "content": $(echo "$prompt" | jq -Rs .)
    }
  ]
}
EOF
)
    
    # Call API
    local response=$(curl -s https://openrouter.ai/api/v1/chat/completions \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        -H "HTTP-Referer: https://github.com/leoguinan/build-agent" \
        -H "X-Title: Build Agent CLI" \
        -d "$json_payload")
    
    # Check for API errors first
    local error=$(echo "$response" | jq -r '.error.message // empty')
    if [ -n "$error" ]; then
        log_error "API Error: $error"
        log_debug "Full response: $response"
        return 1
    fi
    
    # Extract text from response
    local text=$(echo "$response" | jq -r '.choices[0].message.content // empty')
    
    if [ -z "$text" ]; then
        log_error "No response from API"
        log_error "Response preview: $(echo "$response" | head -c 200)"
        echo "$response" > /tmp/openrouter-error.json
        log_info "Full response saved to: /tmp/openrouter-error.json"
        return 1
    fi
    
    echo "$text"
}

# Write file with content
# Usage: write_file "path/to/file.ts" "content"
write_file() {
    local file_path="$1"
    local content="$2"
    
    # Create parent directory
    mkdir -p "$(dirname "$file_path")"
    
    # Write file
    echo "$content" > "$file_path"
    
    log_success "Wrote $file_path"
}

# Commit changes
# Usage: commit_changes "commit message"
commit_changes() {
    local message="$1"
    
    git add .
    if git diff --staged --quiet; then
        log_warning "No changes to commit"
        return 0
    fi
    
    git commit -m "$message"
    log_success "Committed: $message"
}

# Get file contents
# Usage: get_file "path/to/file"
get_file() {
    local file_path="$1"
    
    if [ -f "$file_path" ]; then
        cat "$file_path"
    else
        log_error "File not found: $file_path"
        return 1
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate requirements
validate_requirements() {
    local missing=0
    
    if ! command_exists jq; then
        log_error "jq is required but not installed"
        missing=1
    fi
    
    if ! command_exists curl; then
        log_error "curl is required but not installed"
        missing=1
    fi
    
    if ! command_exists git; then
        log_error "git is required but not installed"
        missing=1
    fi
    
    if [ -z "$OPENROUTER_API_KEY" ]; then
        log_error "OPENROUTER_API_KEY environment variable not set"
        missing=1
    fi
    
    return $missing
}

