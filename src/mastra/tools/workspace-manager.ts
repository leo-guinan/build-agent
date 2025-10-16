import { Tool } from '@mastra/core/tools';
import { z } from 'zod';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const workspaceManagerTool = new Tool({
  id: 'workspace-manager',
  description: `
    Initialize and manage TDD workspaces with isolated git checkouts.
    
    Operations:
    - init: Create .build-agent/test/ and .build-agent/develop/ workspaces
    - clean: Remove all workspaces
    - status: Show workspace information
    
    Each workspace is a full git clone with its own branch permanently checked out:
    - .build-agent/test/ → test branch
    - .build-agent/develop/ → develop branch
    
    This prevents branch switching conflicts and allows parallel agent work.
  `,
  inputSchema: z.object({
    operation: z.enum(['init', 'clean', 'status']),
    projectRoot: z.string().optional().describe('Project root directory (default: cwd)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    workspaces: z
      .array(
        z.object({
          name: z.string(),
          path: z.string(),
          branch: z.string(),
          exists: z.boolean(),
        })
      )
      .optional(),
  }),
  execute: async ({ context }: any) => {
    console.log('[workspace-manager] Executing:', context?.operation);
    
    const projectRoot = context?.projectRoot || process.cwd();
    const workspaceRoot = path.join(projectRoot, '.build-agent');

    try {
      switch (context?.operation) {
        case 'init': {
          console.log('[workspace-manager] Initializing workspaces in:', workspaceRoot);
          // Create .build-agent directory
          if (!fs.existsSync(workspaceRoot)) {
            fs.mkdirSync(workspaceRoot, { recursive: true });
          }

          const workspaces = [];

          // Initialize test workspace
          const testPath = path.join(workspaceRoot, 'test');
          if (!fs.existsSync(testPath)) {
            console.log('Creating test workspace...');
            
            // Clone current repo into test workspace
            execSync(`git clone -b test ${projectRoot} ${testPath}`, {
              stdio: 'pipe',
            });
            
            // Install dependencies in test workspace
            if (fs.existsSync(path.join(testPath, 'package.json'))) {
              console.log('Installing test workspace dependencies...');
              execSync('npm install', { cwd: testPath, stdio: 'pipe' });
            }
          }

          workspaces.push({
            name: 'test',
            path: testPath,
            branch: 'test',
            exists: true,
          });

          // Initialize develop workspace
          const developPath = path.join(workspaceRoot, 'develop');
          if (!fs.existsSync(developPath)) {
            console.log('Creating develop workspace...');
            
            // Clone current repo into develop workspace
            execSync(`git clone -b develop ${projectRoot} ${developPath}`, {
              stdio: 'pipe',
            });
            
            // Install dependencies in develop workspace
            if (fs.existsSync(path.join(developPath, 'package.json'))) {
              console.log('Installing develop workspace dependencies...');
              execSync('npm install', { cwd: developPath, stdio: 'pipe' });
            }
          }

          workspaces.push({
            name: 'develop',
            path: developPath,
            branch: 'develop',
            exists: true,
          });

          return {
            success: true,
            message: 'TDD workspaces initialized successfully',
            workspaces,
          };
        }

        case 'clean': {
          if (fs.existsSync(workspaceRoot)) {
            fs.rmSync(workspaceRoot, { recursive: true, force: true });
            return {
              success: true,
              message: 'All workspaces removed',
            };
          }
          return {
            success: true,
            message: 'No workspaces to clean',
          };
        }

        case 'status': {
          const workspaces = [];

          for (const workspace of ['test', 'develop']) {
            const workspacePath = path.join(workspaceRoot, workspace);
            const exists = fs.existsSync(workspacePath);

            if (exists) {
              const branch = execSync('git branch --show-current', {
                cwd: workspacePath,
                encoding: 'utf-8',
              }).trim();

              workspaces.push({
                name: workspace,
                path: workspacePath,
                branch,
                exists: true,
              });
            } else {
              workspaces.push({
                name: workspace,
                path: workspacePath,
                branch: workspace,
                exists: false,
              });
            }
          }

          return {
            success: true,
            message: 'Workspace status retrieved',
            workspaces,
          };
        }

        default:
          throw new Error(`Unknown operation: ${context?.operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Workspace operation failed: ${error.message}`,
      };
    }
  },
});

