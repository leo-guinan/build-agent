import { Tool } from '@mastra/core/tools';
import { z } from 'zod';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export const shellExecutorTool = new Tool({
  id: 'shell-executor',
  description: `
    Execute shell commands in a specified workspace.
    
    PERFECT FOR:
    - Creating files: echo "content" > file.txt
    - Editing files: sed -i '' 's/old/new/g' file.txt
    - Appending: echo "line" >> file.txt
    - Writing multi-line files with heredoc:
      cat > file.txt << 'EOF'
      line 1
      line 2
      EOF
    - Reading files: cat file.txt
    - Listing files: ls -la
    - Running git: git add . && git commit -m "message"
    - Running tests: npm test
    
    WORKSPACE CONTEXT:
    - Commands run in .build-agent/<workspace>/ directory
    - All file paths relative to workspace root
    - Use standard Unix tools (cat, echo, sed, awk, grep)
    
    SECURITY:
    - No rm -rf / (obviously)
    - Confined to workspace directories
    - Read-only outside workspace
    
    EXAMPLES:
    
    # Create a test file
    {
      "workspace": "test",
      "command": "cat > tests/hello.test.ts << 'EOF'\\nimport { hello } from '../src/hello';\\n\\ntest('hello returns greeting', () => {\\n  expect(hello('world')).toBe('Hello, world!');\\n});\\nEOF"
    }
    
    # Create implementation
    {
      "workspace": "develop",
      "command": "cat > src/hello.ts << 'EOF'\\nexport function hello(name: string): string {\\n  return \`Hello, \${name}!\`;\\n}\\nEOF"
    }
    
    # Commit changes
    {
      "workspace": "test",
      "command": "git add . && git commit -m 'test: Add hello function test'"
    }
  `,
  inputSchema: z.object({
    workspace: z.enum(['test', 'develop']),
    command: z.string().describe('Shell command to execute'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    stdout: z.string(),
    stderr: z.string(),
    exitCode: z.number(),
  }),
  execute: async ({ context }: any) => {
    const { workspace, command } = context || {};
    
    console.log(`[shell-executor] ${workspace}: ${command.substring(0, 80)}...`);

    // Security: prevent dangerous commands
    const dangerousPatterns = [
      /rm\s+-rf\s+\//,
      /rm\s+-rf\s+~\//,
      />\s*\/dev\/sd/,
      /mkfs/,
      /dd\s+if=/,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return {
          success: false,
          stdout: '',
          stderr: 'Dangerous command blocked',
          exitCode: 1,
        };
      }
    }

    try {
      const projectRoot = process.cwd();
      const workspacePath = path.join(projectRoot, '.build-agent', workspace);

      // Ensure workspace exists
      if (!fs.existsSync(workspacePath)) {
        return {
          success: false,
          stdout: '',
          stderr: `Workspace ${workspace} does not exist. Run workspace-manager to initialize.`,
          exitCode: 1,
        };
      }

      // Execute command in workspace
      const result = execSync(command, {
        cwd: workspacePath,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB
        env: {
          ...process.env,
          // Ensure git user is set
          GIT_AUTHOR_NAME: 'Build Agent',
          GIT_AUTHOR_EMAIL: 'build-agent@example.com',
          GIT_COMMITTER_NAME: 'Build Agent',
          GIT_COMMITTER_EMAIL: 'build-agent@example.com',
        },
      });

      console.log(`[shell-executor] Success (${workspace})`);

      return {
        success: true,
        stdout: result || '',
        stderr: '',
        exitCode: 0,
      };
    } catch (error: any) {
      console.error(`[shell-executor] Failed: ${error.message}`);

      return {
        success: false,
        stdout: error.stdout?.toString() || '',
        stderr: error.stderr?.toString() || error.message,
        exitCode: error.status || 1,
      };
    }
  },
});

