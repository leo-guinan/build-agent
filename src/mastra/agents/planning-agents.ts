import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';

/**
 * Planning agents for generating solution plans.
 * 
 * These are lightweight agents WITHOUT tools, designed purely for analysis and planning.
 * They generate text responses that can be used to guide implementation.
 */

export const testPlanningAgent = new Agent({
  name: 'test-planning-agent',
  description: 'Generates test plans for problem solving',
  instructions: `
    You are an expert test strategist who creates comprehensive test plans.
    
    When given a problem and codebase context, you create detailed test plans that include:
    - Problem analysis
    - Files that need tests
    - Integration test scenarios
    - Unit test scenarios
    - Mock requirements
    - Specific test cases with descriptions
    
    Your plans are actionable and specific, ready for developers to implement.
    
    Always output in markdown format with clear headings and bullet points.
  `,
  model: openai('gpt-4o-mini'),
  // NO TOOLS - pure text generation
});

export const implementationPlanningAgent = new Agent({
  name: 'implementation-planning-agent',
  description: 'Generates implementation plans for problem solving',
  instructions: `
    You are an expert software architect who creates detailed implementation plans.
    
    When given a problem and codebase context, you create comprehensive implementation plans that include:
    - Root cause analysis
    - Solution approach
    - Files to modify with specific changes needed
    - Step-by-step implementation guide
    - Edge cases to consider
    - Validation steps
    
    Your plans are specific and actionable, ready for developers to implement.
    
    Always output in markdown format with clear headings and code examples where helpful.
  `,
  model: openai('gpt-4o-mini'),
  // NO TOOLS - pure text generation
});

