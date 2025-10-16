import { Tool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

export const systemStateTool = new Tool({
  id: 'system-state-collector',
  description: `
    Collects current codebase state for TDD agents.
    
    Returns:
    - File structure (directory tree)
    - Existing files and their content
    - Package dependencies
    - Test coverage report
    - Git branch and commit info
    
    Use this before writing tests or implementation to understand
    what already exists and what needs to be built.
  `,
  inputSchema: z.object({
    workspace: z.enum(['test', 'develop']).optional().describe('Which workspace to analyze (default: current)'),
    targetPath: z.string().optional().describe('Path to analyze within workspace (default: src/)'),
    includeTests: z.boolean().optional().describe('Include test files (default: false)'),
  }),
  outputSchema: z.object({
    structure: z.record(z.array(z.string())).describe('Directory structure'),
    files: z.array(
      z.object({
        path: z.string(),
        content: z.string(),
        lines: z.number(),
      })
    ),
    dependencies: z.object({
      production: z.array(z.string()),
      development: z.array(z.string()),
    }),
    testCoverage: z
      .object({
        statements: z.number(),
        branches: z.number(),
        functions: z.number(),
        lines: z.number(),
      })
      .optional(),
    git: z.object({
      branch: z.string(),
      lastCommit: z.string(),
      uncommittedChanges: z.boolean(),
    }),
  }),
  execute: async ({ context }: any) => {
    const workspace = context?.workspace;
    const projectRoot = process.cwd();
    
    // Determine base path
    let basePath = projectRoot;
    if (workspace) {
      basePath = path.join(projectRoot, '.build-agent', workspace);
    }
    
    const targetPath = context?.targetPath || 'src';
    const fullPath = path.join(basePath, targetPath);
    const includeTests = context?.includeTests || false;

    // Collect file structure
    const structure = await collectFileStructure(fullPath);

    // Read file contents
    const files = await readFiles(fullPath, includeTests);

    // Parse package.json
    const packageJsonPath = path.join(basePath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    // Get test coverage (if exists)
    let testCoverage;
    try {
      const coveragePath = path.join(basePath, 'coverage/coverage-summary.json');
      const coverageData = JSON.parse(
        await fs.readFile(coveragePath, 'utf-8')
      );
      const total = coverageData.total;
      testCoverage = {
        statements: total.statements.pct,
        branches: total.branches.pct,
        functions: total.functions.pct,
        lines: total.lines.pct,
      };
    } catch {
      // Coverage doesn't exist yet
      testCoverage = undefined;
    }

    // Get git info
    const git = await getGitInfo(basePath);

    return {
      structure,
      files,
      dependencies: {
        production: Object.keys(packageJson.dependencies || {}),
        development: Object.keys(packageJson.devDependencies || {}),
      },
      testCoverage,
      git,
    };
  },
});

async function collectFileStructure(basePath: string): Promise<Record<string, string[]>> {
  const structure: Record<string, string[]> = {};

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          structure[fullPath] = [];
          await walk(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        const dirPath = path.dirname(fullPath);
        if (!structure[dirPath]) {
          structure[dirPath] = [];
        }
        structure[dirPath].push(entry.name);
      }
    }
  }

  await walk(basePath);
  return structure;
}

async function readFiles(
  basePath: string,
  includeTests: boolean
): Promise<Array<{ path: string; content: string; lines: number }>> {
  const files: Array<{ path: string; content: string; lines: number }> = [];

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        // Skip test files unless includeTests is true
        if (!includeTests && entry.name.includes('.test.')) {
          continue;
        }

        const content = await fs.readFile(fullPath, 'utf-8');
        const lines = content.split('\n').length;

        files.push({
          path: fullPath,
          content,
          lines,
        });
      }
    }
  }

  await walk(basePath);
  return files;
}

async function getGitInfo(basePath: string): Promise<{
  branch: string;
  lastCommit: string;
  uncommittedChanges: boolean;
}> {
  try {
    const branch = execSync('git branch --show-current', {
      cwd: basePath,
      encoding: 'utf-8',
    }).trim();

    const lastCommit = execSync('git log -1 --oneline', {
      cwd: basePath,
      encoding: 'utf-8',
    }).trim();

    const status = execSync('git status --short', {
      cwd: basePath,
      encoding: 'utf-8',
    }).trim();

    return {
      branch,
      lastCommit,
      uncommittedChanges: status.length > 0,
    };
  } catch (error) {
    return {
      branch: 'unknown',
      lastCommit: 'unknown',
      uncommittedChanges: false,
    };
  }
}

