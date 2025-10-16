import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { tddRoutingAgent } from '../mastra';

export const solveCommand = new Command('solve')
  .description('Clone a repo, create TDD workspaces, and solve a problem')
  .argument('<repo-url>', 'GitHub repository URL to clone')
  .argument('<problem>', 'Problem statement to solve')
  .option('--workspace-dir <dir>', 'Workspace directory', './workspaces')
  .option('--timeout <seconds>', 'Timeout in seconds', '600')
  .action(async (repoUrl: string, problem: string, options) => {
    console.log(chalk.cyan('🔧 Problem Solver Starting...\n'));
    console.log(chalk.white('Repository:'), chalk.gray(repoUrl));
    console.log(chalk.white('Problem:'), chalk.gray(problem));
    console.log(chalk.white('Workspace:'), chalk.gray(options.workspaceDir));
    console.log();

    const spinner = ora('Setting up workspaces...').start();

    try {
      // Extract repo name from URL
      const repoMatch = repoUrl.match(/github\.com[:/]([^/]+\/[^/]+?)(\.git)?$/);
      if (!repoMatch) {
        throw new Error('Invalid GitHub URL');
      }
      const repoName = repoMatch[1].replace('/', '-');
      const workspaceRoot = path.join(options.workspaceDir, repoName);

      // Create workspace root
      if (!fs.existsSync(workspaceRoot)) {
        fs.mkdirSync(workspaceRoot, { recursive: true });
      }

      // Clone into main workspace
      const mainPath = path.join(workspaceRoot, 'main');
      if (!fs.existsSync(mainPath)) {
        spinner.text = 'Cloning repository...';
        execSync(`git clone ${repoUrl} ${mainPath}`, { stdio: 'pipe' });
        
        // Install dependencies
        spinner.text = 'Installing dependencies...';
        if (fs.existsSync(path.join(mainPath, 'package.json'))) {
          execSync('npm install', { cwd: mainPath, stdio: 'pipe' });
        }
      }

      // Get default branch name
      const defaultBranch = execSync('git branch --show-current', {
        cwd: mainPath,
        encoding: 'utf-8',
      }).trim();

      // Create test branch and workspace
      spinner.text = 'Creating test workspace...';
      const testPath = path.join(workspaceRoot, 'test');
      if (!fs.existsSync(testPath)) {
        // Create test branch from main
        execSync('git checkout -b test', { cwd: mainPath, stdio: 'pipe' });
        execSync('git push -u origin test', { cwd: mainPath, stdio: 'pipe' });
        
        // Clone test workspace
        execSync(`git clone -b test ${mainPath} ${testPath}`, { stdio: 'pipe' });
        
        if (fs.existsSync(path.join(testPath, 'package.json'))) {
          execSync('npm install', { cwd: testPath, stdio: 'pipe' });
        }
      }

      // Create develop branch and workspace
      spinner.text = 'Creating develop workspace...';
      const developPath = path.join(workspaceRoot, 'develop');
      if (!fs.existsSync(developPath)) {
        // Create develop branch from main
        execSync(`git checkout ${defaultBranch}`, { cwd: mainPath, stdio: 'pipe' });
        execSync('git checkout -b develop', { cwd: mainPath, stdio: 'pipe' });
        execSync('git push -u origin develop', { cwd: mainPath, stdio: 'pipe' });
        
        // Clone develop workspace
        execSync(`git clone -b develop ${mainPath} ${developPath}`, { stdio: 'pipe' });
        
        if (fs.existsSync(path.join(developPath, 'package.json'))) {
          execSync('npm install', { cwd: developPath, stdio: 'pipe' });
        }
      }

      spinner.succeed(chalk.green('✅ Workspaces ready!\n'));

      // Show workspace structure
      console.log(chalk.cyan('📁 Workspace Structure:'));
      console.log(chalk.gray(`   ${workspaceRoot}/`));
      console.log(chalk.gray(`   ├── main/     (${defaultBranch} branch - original)`));
      console.log(chalk.gray(`   ├── test/     (test branch - for tests)`));
      console.log(chalk.gray(`   └── develop/  (develop branch - for fixes)`));
      console.log();

      // Now run TDD network to solve the problem
      console.log(chalk.cyan('🤖 Starting TDD Problem Solver...\n'));
      console.log(chalk.yellow('Problem to solve:'));
      console.log(chalk.white(`   ${problem}\n`));

      const solvingSpinner = ora('TDD agents analyzing problem...').start();

      // Update process.cwd() to point to workspace for this operation
      const originalCwd = process.cwd();
      process.chdir(workspaceRoot);

      try {
        const result = await tddRoutingAgent.network(
          `PROBLEM TO SOLVE:
${problem}

CONTEXT:
- You are working on the repository: ${repoUrl}
- Test workspace: ${testPath}
- Develop workspace: ${developPath}
- Use workspace-aware tools (workspace: 'test' or 'develop')

YOUR TASK:
1. Analyze the problem
2. Write tests that expose the problem in test workspace
3. Implement a fix in develop workspace
4. Ensure all tests pass
5. Return summary of fix

Use the TDD process:
- Write failing test that demonstrates the problem
- Implement minimal fix to make test pass
- Verify fix doesn't break existing tests
- Commit everything to appropriate branches

IMPORTANT:
- Use file-writer tool to write test and fix files
- Use git-manager with workspace parameter
- All file paths relative to workspace root
`
        );

        let filesChanged: string[] = [];
        let testsWritten = 0;
        let testsPassing = 0;

        // Stream results
        for await (const chunk of result) {
          if (chunk.type === 'tool-execution-start') {
            const toolId = (chunk.payload as any).toolId;
            solvingSpinner.text = `Tool: ${toolId}...`;
          }

          if (chunk.type === 'agent-execution-start') {
            const agentName = (chunk.payload as any).agentName;
            solvingSpinner.text = `Agent: ${agentName}...`;
          }

          if (chunk.type === 'network-execution-event-step-finish') {
            const stepResult = (chunk.payload as any).result;
            if (stepResult) {
              if (stepResult.filesChanged) filesChanged.push(...stepResult.filesChanged);
              if (stepResult.testsWritten) testsWritten = stepResult.testsWritten;
              if (stepResult.testsPassing) testsPassing = stepResult.testsPassing;
            }
          }
        }

        solvingSpinner.succeed(chalk.green('✅ Problem solving complete!\n'));

        // Summary
        console.log(chalk.cyan('📊 Solution Summary:'));
        console.log(chalk.white(`   Tests Written: ${testsWritten}`));
        console.log(chalk.white(`   Tests Passing: ${testsPassing}`));
        console.log(chalk.white(`   Files Changed: ${filesChanged.length}`));
        console.log();

        if (filesChanged.length > 0) {
          console.log(chalk.gray('   Files modified:'));
          filesChanged.forEach(file => console.log(chalk.gray(`     - ${file}`)));
          console.log();
        }

        // Show git diff
        console.log(chalk.yellow('📝 Review changes:'));
        console.log(chalk.gray(`   cd ${testPath}`));
        console.log(chalk.gray(`   git log --oneline -5`));
        console.log(chalk.gray(`   git diff origin/${defaultBranch}..test\n`));

        console.log(chalk.gray(`   cd ${developPath}`));
        console.log(chalk.gray(`   git log --oneline -5`));
        console.log(chalk.gray(`   git diff origin/${defaultBranch}..develop\n`));

        // Next steps
        console.log(chalk.yellow('🚀 Next Steps:'));
        console.log(chalk.white('   1. Review test files in'), chalk.cyan(testPath));
        console.log(chalk.white('   2. Review fix in'), chalk.cyan(developPath));
        console.log(chalk.white('   3. Run tests:'), chalk.gray(`cd ${developPath} && npm test`));
        console.log(chalk.white('   4. Create PR:'), chalk.gray(`cd ${developPath} && gh pr create`));
        console.log();

      } finally {
        // Restore original cwd
        process.chdir(originalCwd);
      }

    } catch (error: any) {
      spinner.fail(chalk.red('❌ Problem solving failed'));
      console.error(chalk.red(`Error: ${error.message}`));
      console.error(chalk.gray(error.stack));
      process.exit(1);
    }
  });

