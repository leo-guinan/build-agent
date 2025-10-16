import { Tool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';

export const debugInspectorTool = new Tool({
  id: 'debug-inspector',
  description: `
    Self-debugging tool for the TDD orchestrator.
    
    Allows the routing agent to:
    - Read error logs and debug output
    - Inspect what files were actually created
    - Check git history in workspaces
    - Read agent source code to understand instructions
    - Analyze tool usage patterns
    
    Use this when:
    - Something isn't working as expected
    - Files aren't being created
    - Tools aren't being called
    - Need to understand what went wrong
    
    The orchestrator can use this to debug itself and fix issues.
  `,
  inputSchema: z.object({
    operation: z.enum([
      'read-logs',
      'check-files',
      'git-history',
      'read-agent-code',
      'analyze-tool-calls',
    ]),
    workspace: z.enum(['test', 'develop']).optional(),
    filePath: z.string().optional(),
    agentName: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.any(),
    insights: z.string().optional(),
  }),
  execute: async ({ context }: any) => {
    const { operation, workspace, filePath, agentName } = context || {};
    const projectRoot = process.cwd();

    console.log(`[debug-inspector] ${operation}`);

    try {
      switch (operation) {
        case 'read-logs': {
          // Read recent error logs or debug output
          const logFile = '.build-agent-server.log';
          if (await fileExists(logFile)) {
            const logs = await fs.readFile(logFile, 'utf-8');
            const lastLines = logs.split('\n').slice(-100).join('\n');
            
            return {
              success: true,
              data: { logs: lastLines },
              insights: 'Last 100 lines of server logs. Look for errors, warnings, or unexpected behavior.',
            };
          }
          
          return {
            success: false,
            data: {},
            insights: 'No log file found',
          };
        }

        case 'check-files': {
          // Check what files exist in workspace
          if (!workspace) {
            return { success: false, data: {}, insights: 'Workspace required' };
          }

          const workspacePath = path.join(projectRoot, '.build-agent', workspace);
          const targetPath = filePath || 'tests';
          const fullPath = path.join(workspacePath, targetPath);

          if (!(await fileExists(fullPath))) {
            return {
              success: true,
              data: { exists: false, path: fullPath },
              insights: `Path ${targetPath} does not exist in ${workspace} workspace. This might be why operations are failing.`,
            };
          }

          // List files recursively
          const files = await listFilesRecursive(fullPath);

          return {
            success: true,
            data: {
              exists: true,
              path: fullPath,
              files: files.map(f => f.replace(fullPath, '')),
              count: files.length,
            },
            insights: `Found ${files.length} files in ${targetPath}. ${files.length === 0 ? 'Directory is empty - files may not be getting written.' : 'Files exist.'}`,
          };
        }

        case 'git-history': {
          // Check git commits in workspace
          if (!workspace) {
            return { success: false, data: {}, insights: 'Workspace required' };
          }

          const workspacePath = path.join(projectRoot, '.build-agent', workspace);

          const commits = execSync('git log --oneline -10', {
            cwd: workspacePath,
            encoding: 'utf-8',
          });

          const status = execSync('git status --short', {
            cwd: workspacePath,
            encoding: 'utf-8',
          });

          return {
            success: true,
            data: {
              commits: commits.trim().split('\n'),
              uncommitted: status.trim().split('\n').filter(l => l),
            },
            insights: `Git history shows recent activity. ${status ? 'Uncommitted changes exist.' : 'No uncommitted changes.'}`,
          };
        }

        case 'read-agent-code': {
          // Read agent source to understand instructions
          if (!agentName) {
            return { success: false, data: {}, insights: 'Agent name required' };
          }

          const agentPath = path.join(
            projectRoot,
            'src/mastra/agents',
            `${agentName}.ts`
          );

          if (!(await fileExists(agentPath))) {
            return {
              success: false,
              data: {},
              insights: `Agent file not found: ${agentPath}`,
            };
          }

          const code = await fs.readFile(agentPath, 'utf-8');

          // Extract instructions
          const instructionsMatch = code.match(/instructions:\s*`([\s\S]*?)`/);
          const toolsMatch = code.match(/tools:\s*{([\s\S]*?)}/);

          return {
            success: true,
            data: {
              agentFile: agentPath,
              instructions: instructionsMatch ? instructionsMatch[1] : 'Not found',
              tools: toolsMatch ? toolsMatch[1] : 'Not found',
              fullCode: code.substring(0, 2000), // First 2000 chars
            },
            insights: 'Agent code and instructions. Check if tools are registered and instructions are clear.',
          };
        }

        case 'analyze-tool-calls': {
          // Analyze which tools were actually called
          // This would parse logs to see tool execution patterns
          
          return {
            success: true,
            data: {
              suggestion: 'Check debug logs for tool-execution-start events. If file-writer is missing, agent is not calling it.',
            },
            insights: 'Tool call analysis requires reading execution logs. Look for [tool-execution-start] events.',
          };
        }

        default:
          return {
            success: false,
            data: {},
            insights: 'Unknown operation',
          };
      }
    } catch (error: any) {
      return {
        success: false,
        data: { error: error.message },
        insights: `Debug operation failed: ${error.message}`,
      };
    }
  },
});

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(fullPath);
        }
      } else {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

