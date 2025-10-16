import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
// import { Memory } from '@mastra/memory';
// import { LibSQLStorage } from '../storage/libsql-storage';
import { testAgent } from './test-agent';
import { developAgent } from './develop-agent';
import { systemStateTool } from '../tools/system-state';
import { gitManagerTool } from '../tools/git-manager';
import { workspaceManagerTool } from '../tools/workspace-manager';
import { fileWriterTool } from '../tools/file-writer';

export const tddRoutingAgent = new Agent({
  name: 'tdd-routing-agent',
  instructions: `
    You are a TDD workflow orchestrator for building a CLI tool.
    
    IMPORTANT: This system uses WORKSPACE-BASED architecture.
    - Test Agent works in: .build-agent/test/ (permanent test branch checkout)
    - Develop Agent works in: .build-agent/develop/ (permanent develop branch checkout)
    - NO branch switching - each workspace stays on its branch permanently
    - Agents pull from each other's branches to sync changes
    
    Your job:
    1. Understand the desired feature/change from user input
    2. Collect current system state from develop workspace
    3. Route to Test Agent to write tests in .build-agent/test/
    4. Route to Develop Agent to implement in .build-agent/develop/
    5. Iterate until all tests pass
    6. Return completion summary
    
    NOTE: Workspaces (.build-agent/test/ and .build-agent/develop/) already exist.
    Do not try to initialize them - they are permanent checkouts.
    
    Workflow Process:
    
    PHASE 1: ANALYSIS
    - Parse user request to understand feature
    - Use system-state-collector with workspace: 'develop'
    - Identify what needs to be built
    - Identify what already exists
    
    PHASE 3: TEST SPECIFICATION (test-agent)
    - Call test-agent to write tests
    - Test agent writes in .build-agent/test/tests/
    - Test agent uses git-manager with workspace: 'test' to commit
    - Test agent pushes to origin/test
    
    PHASE 4: IMPLEMENTATION (develop-agent)
    - Develop agent pulls latest tests (git-manager pull-branch: test)
    - Develop agent runs tests in .build-agent/develop/
    - Develop agent writes code in .build-agent/develop/src/
    - Develop agent uses git-manager with workspace: 'develop' to commit
    - Develop agent pushes to origin/develop
    
    PHASE 5: ITERATION
    - Repeat Phase 3-4 until all tests pass
    - Each iteration implements ONE small piece
    - Maximum 20 iterations per feature
    
    PHASE 6: COMPLETION
    - Sync final changes (develop → test)
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
  model: openai('gpt-4o-mini'), // Fast & cheap: $0.150/1M input, $0.600/1M output 
  agents: {
    testAgent,
    developAgent,
  },
  tools: {
    systemStateTool,
    gitManager: gitManagerTool,
    // workspaceManager removed - workspaces already initialized manually
    fileWriter: fileWriterTool,
  },
  // Memory disabled for now - agent networks can work without it for simple cases
  // Re-enable with proper storage when needed for production
  // memory: new Memory({
  //   storage: new LibSQLStorage({
  //     url: 'file:./mastra-tdd.db',
  //   }),
  // }),
});

