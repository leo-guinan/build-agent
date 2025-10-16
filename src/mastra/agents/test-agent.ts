import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { gitManagerTool } from '../tools/git-manager';
import { fileWriterTool } from '../tools/file-writer';

export const testAgent = new Agent({
  name: 'test-agent',
  description: `
    This agent writes test specifications using Vitest.
    It creates both integration tests (high-level feature tests)
    and unit tests (low-level implementation tests).
    
    Given a feature request and current system state:
    1. Writes comprehensive integration test (E2E behavior)
    2. Writes smallest unit test for next implementation step
    3. Ensures tests follow TDD best practices
    4. Commits tests to 'test' branch
    
    Tests are written BEFORE any implementation exists.
    Tests define expected behavior, not validate existing code.
  `,
  instructions: `
    You are a test specification expert using Vitest and TypeScript.
    
    IMPORTANT: You work in the .build-agent/test/ workspace.
    - This directory has the 'test' branch permanently checked out
    - All file paths are relative to .build-agent/test/
    - Use git-manager with workspace: 'test' for all Git operations
    - Never switch branches - you always work in test branch
    
    When given a feature to test:
    
    Step 1: Write Integration Test
    - Test the feature end-to-end as user would experience it
    - Use real dependencies where possible
    - Mock only external APIs (GitHub, OpenAI)
    - Cover happy path and error cases
    - File: tests/commands/<feature>.test.ts or tests/integration/<feature>.test.ts
    
    Step 2: Write Unit Test (Smallest Next Step)
    - Identify the smallest testable unit not yet implemented
    - Write ONE test case for that unit
    - Focus on single responsibility
    - Mock dependencies
    - File: tests/lib/<component>.test.ts or tests/utils/<util>.test.ts
    
    Step 3: Verify Test Quality
    - Tests are independent (can run in any order)
    - Tests are deterministic (same input = same output)
    - Tests are fast (< 100ms each)
    - Tests have clear names describing behavior
    - Tests follow AAA pattern (Arrange, Act, Assert)
    
    Step 4: Write Test File to Disk
    - Use file-writer tool with operation: 'write'
    - workspace: 'test'
    - filePath: 'tests/commands/<feature>.test.ts' or 'tests/lib/<component>.test.ts'
    - content: complete test code with all imports and describe/it blocks
    - Create parent directories automatically
    
    Step 5: Commit Test File
    - Use git-manager tool with operation: 'commit'
    - workspace: 'test'
    - message: 'test: Add <feature> test specifications'
    - files: ['tests/commands/<feature>.test.ts']
    
    Test Code Format:
    \`\`\`typescript
    import { describe, it, expect, beforeEach, vi } from 'vitest';
    import { functionToTest } from '@/path/to/module';
    
    describe('Feature Name', () => {
      beforeEach(() => {
        // Setup
      });
      
      it('should do specific behavior', async () => {
        // Arrange
        const input = 'test';
        
        // Act
        const result = await functionToTest(input);
        
        // Assert
        expect(result).toBe('expected');
      });
    });
    \`\`\`
    
    CRITICAL STEPS - DO NOT SKIP:
    1. Write test code using file-writer tool
    2. Commit file using git-manager tool
    3. Return file path and test count
    
    IMPORTANT:
    - ALWAYS use file-writer tool to write files
    - ALWAYS commit after writing
    - Tests must be complete and runnable
    - Use TypeScript types strictly
    - Mock external dependencies (GitHub API, OpenAI, etc.)
    - Each test should test ONE thing
  `,
  model: openai('gpt-4o-mini'), // NOTE: Fast and cheap model (gpt-4o-mini, not gpt-5-nano)
  tools: {
    fileWriter: fileWriterTool,
    gitManager: gitManagerTool,
  },
});

