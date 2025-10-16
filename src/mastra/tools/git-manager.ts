import { createTool } from '@mastra/core';
import { z } from 'zod';
import { execSync } from 'child_process';

export const gitManagerTool = createTool({
  id: 'git-manager',
  description: `
    Manages Git operations for TDD workflow.
    
    Operations:
    - Switch branches (test, develop)
    - Commit changes with messages
    - Cherry-pick commits between branches
    - Check branch status
    - Merge branches
    
    All operations are safe (won't force push or destroy history).
  `,
  inputSchema: z.object({
    operation: z.enum(['switch-branch', 'commit', 'cherry-pick', 'status', 'merge']),
    branch: z.string().optional().describe('Branch name (for switch, merge)'),
    message: z.string().optional().describe('Commit message'),
    files: z.array(z.string()).optional().describe('Files to add (for commit)'),
    commitSha: z.string().optional().describe('Commit to cherry-pick'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    currentBranch: z.string().optional(),
    lastCommit: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { operation, branch, message, files, commitSha } = context;

    try {
      switch (operation) {
        case 'switch-branch':
          if (!branch) {
            throw new Error('Branch name required for switch-branch operation');
          }
          execSync(`git checkout ${branch}`, { stdio: 'pipe' });
          return {
            success: true,
            message: `Switched to branch '${branch}'`,
            currentBranch: branch,
          };

        case 'commit':
          if (!message) {
            throw new Error('Commit message required for commit operation');
          }

          // Add files
          if (files && files.length > 0) {
            execSync(`git add ${files.join(' ')}`, { stdio: 'pipe' });
          } else {
            // Add all changes if no specific files
            execSync('git add -A', { stdio: 'pipe' });
          }

          // Commit
          execSync(`git commit -m "${message}"`, { stdio: 'pipe' });

          const commitHash = execSync('git rev-parse HEAD', {
            encoding: 'utf-8',
          }).trim();

          return {
            success: true,
            message: `Committed: ${message}`,
            lastCommit: commitHash,
          };

        case 'cherry-pick':
          if (!commitSha) {
            throw new Error('Commit SHA required for cherry-pick operation');
          }
          execSync(`git cherry-pick ${commitSha}`, { stdio: 'pipe' });
          return {
            success: true,
            message: `Cherry-picked commit ${commitSha}`,
          };

        case 'status':
          const status = execSync('git status --short', {
            encoding: 'utf-8',
          });
          const currentBranch = execSync('git branch --show-current', {
            encoding: 'utf-8',
          }).trim();

          return {
            success: true,
            message: status || 'No changes',
            currentBranch,
          };

        case 'merge':
          if (!branch) {
            throw new Error('Branch name required for merge operation');
          }
          execSync(`git merge ${branch} --no-ff -m "merge: Merge ${branch} into current branch"`, {
            stdio: 'pipe',
          });
          return {
            success: true,
            message: `Merged branch '${branch}'`,
          };

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Git operation failed: ${error.message}`,
      };
    }
  },
});

