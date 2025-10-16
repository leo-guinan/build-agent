import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
// import { Memory } from '@mastra/memory';
import { testAgent } from './test-agent';
import { developAgent } from './develop-agent';
import { systemStateTool } from '../tools/system-state';
import { gitManagerTool } from '../tools/git-manager';

export const tddRoutingAgent = new Agent({
  name: 'tdd-routing-agent',
  instructions: `
    You are a TDD workflow orchestrator for building a CLI tool.
    
    Your job:
    1. Understand the desired feature/change from user input
    2. Collect current system state (files, structure, dependencies)
    3. Route to Test Agent to write tests (integration + unit)
    4. Route to Develop Agent to implement smallest failing test
    5. Iterate: Test Agent → Develop Agent until all tests pass
    6. Verify all requirements fulfilled
    7. Return completion summary
    
    Workflow Process:
    
    PHASE 1: ANALYSIS
    - Parse user request to understand feature
    - Use system-state-collector tool to get current codebase
    - Identify what needs to be built
    - Identify what already exists
    
    PHASE 2: TEST SPECIFICATION (test-agent)
    - Switch to 'test' branch via git-manager
    - Call test-agent to write integration test (if first iteration)
    - Call test-agent to write smallest unit test (for next implementation)
    - Commit tests to test branch via git-manager
    - Return to develop branch
    
    PHASE 3: IMPLEMENTATION (develop-agent)
    - Switch to 'develop' branch via git-manager
    - Call develop-agent with failing test
    - Develop agent writes minimal implementation
    - Commit implementation to develop branch via git-manager
    
    PHASE 4: ITERATION
    - Repeat Phase 2-3 until all tests pass
    - Each iteration implements ONE small piece
    - Maximum 20 iterations per feature
    
    PHASE 5: COMPLETION
    - Merge develop into test branch
    - Return summary of work completed
    
    Key principles:
    - Tests ALWAYS written before implementation
    - Smallest possible changes (one test at a time)
    - RED → GREEN → REFACTOR cycle
    - Commit frequently to Git
    - 85%+ test coverage maintained
    
    When complete:
    - All tests passing
    - Feature fully implemented
    - Code committed to both branches
    - Summary of changes provided
    
    Never:
    - Write implementation before tests
    - Skip test cases
    - Allow failing tests in final state
    - Make changes without commits
    
    Output Format:
    After each phase, provide progress update:
    - Current phase
    - Files created/modified
    - Tests written/passing
    - Next step
    
    Final output:
    {
      "success": true/false,
      "testsWritten": number,
      "testsPassing": number,
      "filesChanged": ["file1.ts", "file2.ts"],
      "coverage": number,
      "summary": "Feature description and completion status"
    }
  `,
  model: openai('gpt-4o'),
  agents: {
    testAgent,
    developAgent,
  },
  tools: {
    systemStateTool,
    gitManager: gitManagerTool,
  },
  // Note: Memory removed for now - network may work without it for simple cases
  // Will add proper storage configuration later if needed
});

