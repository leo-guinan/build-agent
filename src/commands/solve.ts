import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const solveCommand = new Command('solve')
  .description('Clone a repo, create TDD workspaces, and solve a problem')
  .argument('<repo-url>', 'GitHub repository URL to clone')
  .argument('<problem>', 'Problem statement to solve')
  .option('--workspace-dir <dir>', 'Workspace directory', './workspaces')
  .option('--timeout <seconds>', 'Timeout in seconds', '600')
  .option('--skip-install', 'Skip dependency installation (faster)', false)
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
        
        // Install dependencies (unless skipped)
        if (!options.skipInstall && fs.existsSync(path.join(mainPath, 'package.json'))) {
          const packageManager = detectPackageManager(mainPath);
          spinner.text = `Installing dependencies with ${packageManager}...`;
          
          try {
            if (packageManager === 'pnpm') {
              execSync('pnpm install --frozen-lockfile', { cwd: mainPath, stdio: 'pipe' });
            } else if (packageManager === 'yarn') {
              execSync('yarn install --frozen-lockfile', { cwd: mainPath, stdio: 'pipe' });
            } else {
              execSync('npm ci', { cwd: mainPath, stdio: 'pipe' });
            }
          } catch (error: any) {
            // If install fails, continue anyway (might work without deps)
            console.log(chalk.yellow(`\n   ⚠️  Dependency installation failed`));
            console.log(chalk.gray('   Continuing anyway...\n'));
          }
        } else if (options.skipInstall) {
          console.log(chalk.gray('   Skipping dependency installation...\n'));
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
        // Create test branch in main repo (local only, no push)
        execSync('git checkout -b test', { cwd: mainPath, stdio: 'pipe' });
        
        // Clone test workspace from local main repo
        execSync(`git clone -b test ${mainPath} ${testPath}`, { stdio: 'pipe' });
        
        // Skip dependency install (workspaces share with main)
      }

      // Create develop branch and workspace
      spinner.text = 'Creating develop workspace...';
      const developPath = path.join(workspaceRoot, 'develop');
      if (!fs.existsSync(developPath)) {
        // Create develop branch from main (local only, no push)
        execSync(`git checkout ${defaultBranch}`, { cwd: mainPath, stdio: 'pipe' });
        execSync('git checkout -b develop', { cwd: mainPath, stdio: 'pipe' });
        
        // Clone develop workspace from local main repo
        execSync(`git clone -b develop ${mainPath} ${developPath}`, { stdio: 'pipe' });
        
        // Skip dependency install (workspaces share with main)
      }

      // Helper function to detect package manager
      function detectPackageManager(projectPath: string): 'pnpm' | 'yarn' | 'npm' {
        if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) {
          return 'pnpm';
        }
        if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) {
          return 'yarn';
        }
        return 'npm';
      }

      spinner.succeed(chalk.green('✅ Workspaces ready!\n'));

      // Show workspace structure
      console.log(chalk.cyan('📁 Workspace Structure:'));
      console.log(chalk.gray(`   ${workspaceRoot}/`));
      console.log(chalk.gray(`   ├── main/     (${defaultBranch} branch - original)`));
      console.log(chalk.gray(`   ├── test/     (test branch - for tests)`));
      console.log(chalk.gray(`   └── develop/  (develop branch - for fixes)`));
      console.log();

      // Workspaces ready - now use shell agents to solve
      console.log(chalk.cyan('✨ Workspaces ready for problem solving!\n'));
      
      console.log(chalk.yellow('🎯 Recommended Approaches:\n'));
      
      // Approach 1: Planning Agent + Cursor
      console.log(chalk.white('1️⃣  Generate Plan + Use Cursor (RECOMMENDED)'));
      console.log(chalk.gray(`   ./agents/planning-agent.sh ${mainPath} \\`));
      console.log(chalk.gray(`     "${problem}" \\`));
      console.log(chalk.gray(`     SOLUTION_PLAN.md\n`));
      console.log(chalk.gray(`   cursor ${mainPath}`));
      console.log(chalk.gray(`   # Use plan with Cursor Composer\n`));
      
      // Approach 2: Shell TDD Orchestrator
      console.log(chalk.white('2️⃣  Automated TDD with Shell Agents'));
      console.log(chalk.gray(`   cd ${mainPath}`));
      console.log(chalk.gray(`   ../../../agents/tdd-orchestrator.sh "${problem}" 5\n`));
      
      // Approach 3: Manual with workspace architecture
      console.log(chalk.white('3️⃣  Manual TDD (Full Control)'));
      console.log(chalk.gray(`   cd ${testPath}`));
      console.log(chalk.gray(`   # Write tests manually (or with Cursor)`));
      console.log(chalk.gray(`   git commit -m "test: ${problem.substring(0, 40)}"\n`));
      console.log(chalk.gray(`   cd ${developPath}`));
      console.log(chalk.gray(`   # Implement fix (or with Cursor)`));
      console.log(chalk.gray(`   npm test && git commit\n`));
      
      console.log(chalk.yellow('📝 Review Setup:'));
      console.log(chalk.gray(`   Main repo:    ${mainPath}`));
      console.log(chalk.gray(`   Test workspace:    ${testPath}`));
      console.log(chalk.gray(`   Develop workspace: ${developPath}`));
      console.log();
      
      console.log(chalk.yellow('💡 Tips:'));
      console.log(chalk.white('   - Use planning agent for structured guidance'));
      console.log(chalk.white('   - Use Cursor for code implementation'));
      console.log(chalk.white('   - Workspaces keep test/develop branches separate'));
      console.log(chalk.white('   - Create PR from main workspace when ready'));
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('❌ Problem solving failed'));
      console.error(chalk.red(`Error: ${error.message}`));
      console.error(chalk.gray(error.stack));
      process.exit(1);
    }
  });

