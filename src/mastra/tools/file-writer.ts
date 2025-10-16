import { Tool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export const fileWriterTool = new Tool({
  id: 'file-writer',
  description: `
    Writes or updates files in TDD workspaces.
    
    Operations:
    - write: Create or overwrite file with content
    - append: Add content to end of existing file
    - create-dir: Create directory structure
    
    Workspaces:
    - test: Write to .build-agent/test/
    - develop: Write to .build-agent/develop/
    
    Use this to:
    - Write test files (Test Agent)
    - Write implementation files (Develop Agent)
    - Create directory structure
    
    File paths are relative to workspace root.
    Example: "tests/commands/hello.test.ts"
  `,
  inputSchema: z.object({
    operation: z.enum(['write', 'append', 'create-dir']),
    workspace: z.enum(['test', 'develop']).describe('Which workspace to write in'),
    filePath: z.string().describe('Path relative to workspace root'),
    content: z.string().optional().describe('File content (for write/append)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    fullPath: z.string().optional(),
  }),
  execute: async ({ context }: any) => {
    const { operation, workspace, filePath, content } = context || {};
    const projectRoot = process.cwd();
    const workspacePath = path.join(projectRoot, '.build-agent', workspace);
    const fullPath = path.join(workspacePath, filePath);

    console.log(`[file-writer] ${operation} in ${workspace}: ${filePath}`);

    try {
      switch (operation) {
        case 'write': {
          if (!content) {
            throw new Error('Content required for write operation');
          }

          // Create directory if it doesn't exist
          const dir = path.dirname(fullPath);
          await fs.mkdir(dir, { recursive: true });

          // Write file
          await fs.writeFile(fullPath, content, 'utf-8');

          console.log(`[file-writer] ✓ Wrote ${content.split('\n').length} lines to ${filePath}`);

          return {
            success: true,
            message: `Wrote file: ${filePath}`,
            fullPath,
          };
        }

        case 'append': {
          if (!content) {
            throw new Error('Content required for append operation');
          }

          // Append to file
          await fs.appendFile(fullPath, content, 'utf-8');

          return {
            success: true,
            message: `Appended to file: ${filePath}`,
            fullPath,
          };
        }

        case 'create-dir': {
          // Create directory
          await fs.mkdir(fullPath, { recursive: true });

          return {
            success: true,
            message: `Created directory: ${filePath}`,
            fullPath,
          };
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        message: `File operation failed: ${error.message}`,
      };
    }
  },
});

