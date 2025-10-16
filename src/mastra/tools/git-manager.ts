import { Tool } from '@mastra/core/tools';
import { z } from 'zod';
import { execSync } from 'child_process';
import path from 'path';

export const gitManagerTool = new Tool({
  id: 'git-manager',
  description: `
    Manages Git operations for TDD workflow with isolated workspaces.
    
    Operations:
    - pull-branch: Pull changes from another branch into workspace
    - commit: Commit changes in workspace
    - push: Push commits to remote
    - status: Check workspace git status
    - sync: Merge changes from other branch
    
    Workspaces:
    - test: .build-agent/test/ (always on test branch)
    - develop: .build-agent/develop/ (always on develop branch)
    
    No branch switching - each workspace stays on its branch.
  `,
  inputSchema: z.object({
    operation: z.enum(['pull-branch', 'commit', 'push', 'status', 'sync']),
    workspace: z.enum(['test', 'develop']).describe('Which workspace to operate in'),
    sourceBranch: z.string().optional().describe('Branch to pull from (for pull-branch)'),
    message: z.string().optional().describe('Commit message'),
    files: z.array(z.string()).optional().describe('Files to add (for commit)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    currentBranch: z.string().optional(),
    lastCommit: z.string().optional(),
  }),
  execute: async ({ context }: any) => {
    const { operation, workspace, sourceBranch, message, files } = context || {};
    const projectRoot = process.cwd();
    const workspacePath = path.join(projectRoot, '.build-agent', workspace || '');

    console.log(`[git-manager] Operation: ${operation}, Workspace: ${workspace}`);

    try {
      switch (operation) {
        case 'pull-branch': {
          if (!sourceBranch) {
            throw new Error('Source branch required for pull-branch operation');
          }
          
          execSync(`git fetch origin ${sourceBranch}`, {
            cwd: workspacePath,
            stdio: 'pipe',
          });
          
          execSync(`git pull origin ${sourceBranch}`, {
            cwd: workspacePath,
            stdio: 'pipe',
          });

          return {
            success: true,
            message: `Pulled ${sourceBranch} into ${workspace} workspace`,
          };
        }

        case 'commit': {
          if (!message) {
            throw new Error('Commit message required for commit operation');
          }

          // Add files
          if (files && files.length > 0) {
            execSync(`git add ${files.join(' ')}`, {
              cwd: workspacePath,
              stdio: 'pipe',
            });
          } else {
            execSync('git add -A', {
              cwd: workspacePath,
              stdio: 'pipe',
            });
          }

          // Commit
          execSync(`git commit -m "${message}"`, {
            cwd: workspacePath,
            stdio: 'pipe',
          });

          const commitHash = execSync('git rev-parse HEAD', {
            cwd: workspacePath,
            encoding: 'utf-8',
          }).trim();

          return {
            success: true,
            message: `Committed in ${workspace}: ${message}`,
            lastCommit: commitHash,
          };
        }

        case 'push': {
          const currentBranch = execSync('git branch --show-current', {
            cwd: workspacePath,
            encoding: 'utf-8',
          }).trim();

          execSync(`git push origin ${currentBranch}`, {
            cwd: workspacePath,
            stdio: 'pipe',
          });

          return {
            success: true,
            message: `Pushed ${workspace} workspace to origin/${currentBranch}`,
            currentBranch,
          };
        }

        case 'status': {
          const status = execSync('git status --short', {
            cwd: workspacePath,
            encoding: 'utf-8',
          });
          
          const currentBranch = execSync('git branch --show-current', {
            cwd: workspacePath,
            encoding: 'utf-8',
          }).trim();

          return {
            success: true,
            message: status || 'No changes',
            currentBranch,
          };
        }

        case 'sync': {
          // Sync: merge changes from other branch
          const otherBranch = workspace === 'test' ? 'develop' : 'test';

          execSync(`git fetch origin ${otherBranch}`, {
            cwd: workspacePath,
            stdio: 'pipe',
          });
          
          execSync(`git merge origin/${otherBranch} --no-ff -m "merge: Sync ${otherBranch} into ${workspace}"`, {
            cwd: workspacePath,
            stdio: 'pipe',
          });

          return {
            success: true,
            message: `Synced ${otherBranch} into ${workspace} workspace`,
          };
        }

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

