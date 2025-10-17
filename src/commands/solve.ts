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
  .option('--use-shell-agents', 'Use shell agents to implement solution', false)
  .option('--plan <file>', 'Use existing plan file (from plan command)', '')
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

      // Get default branch name
      const defaultBranch = execSync('git branch --show-current', {
        cwd: mainPath,
        encoding: 'utf-8',
      }).trim();

      // Create feature branch for work
      const featureBranchName = `fix/${problem.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40)}`;
      
      try {
        execSync(`git checkout -b ${featureBranchName}`, { cwd: mainPath, stdio: 'pipe' });
        console.log(chalk.green(`   Created feature branch: ${featureBranchName}`));
      } catch {
        // Branch might already exist
        execSync(`git checkout ${featureBranchName}`, { cwd: mainPath, stdio: 'pipe' });
        console.log(chalk.gray(`   Using existing branch: ${featureBranchName}`));
      }

      spinner.succeed(chalk.green('✅ Workspace ready!\n'));

      // Show workspace structure
      console.log(chalk.cyan('📁 Workspace:'));
      console.log(chalk.gray(`   ${mainPath}`));
      console.log(chalk.gray(`   Branch: ${featureBranchName}`));
      console.log(chalk.gray(`   Both test and develop agents work here`));
      console.log();

      // Workspaces ready - now orchestrate solution if requested
      console.log(chalk.cyan('✨ Workspaces ready for problem solving!\n'));
      
      // Check if we should use shell agents to implement
      if (options.useShellAgents) {
        console.log(chalk.cyan('🤖 Using shell agents to implement solution...\n'));
        
        // Generate or load plan
        let planFile = options.plan;
        if (!planFile) {
          console.log(chalk.yellow('📋 No plan provided, generating one...'));
          planFile = path.join(mainPath, 'SOLUTION_PLAN.md');
          
          const planSpinner = ora('Planning agent analyzing...').start();
          
          try {
            execSync(
              `${path.join(process.cwd(), 'agents/planning-agent.sh')} "${mainPath}" "${problem}" "${planFile}"`,
              { stdio: 'pipe' }
            );
            planSpinner.succeed(chalk.green('✅ Plan generated'));
          } catch (error: any) {
            planSpinner.fail(chalk.red('❌ Plan generation failed'));
            throw error;
          }
        }
        
        console.log(chalk.white('   Plan:'), chalk.gray(planFile));
        console.log();
        
        // Run TDD orchestrator (single workspace)
        console.log(chalk.yellow('🔄 Running TDD orchestrator...'));
        const tddSpinner = ora('Shell agents implementing...').start();
        
        try {
          const output = execSync(
            `${path.join(process.cwd(), 'agents/tdd-orchestrator.sh')} "${problem}" 10 "${mainPath}" "${mainPath}"`,
            { encoding: 'utf-8' }
          );
          
          tddSpinner.succeed(chalk.green('✅ TDD cycle complete!'));
          console.log(output);
        } catch (error: any) {
          tddSpinner.fail(chalk.red('❌ TDD cycle failed'));
          console.log(chalk.gray(error.stdout || error.message));
        }
        
        console.log();
        console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.green('🎉 SOLUTION COMPLETE!'));
        console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log();
        console.log(chalk.yellow('📝 Review changes:'));
        console.log(chalk.gray(`   cd ${mainPath} && git log -10`));
        console.log(chalk.gray(`   cd ${mainPath} && git diff ${defaultBranch}..${featureBranchName}`));
        console.log();
        console.log(chalk.yellow('🧪 Run tests:'));
        console.log(chalk.gray(`   cd ${mainPath} && npm test`));
        console.log();
        console.log(chalk.yellow('🚀 Create PR:'));
        console.log(chalk.gray(`   cd ${mainPath}`));
        console.log(chalk.gray(`   gh pr create`));
        console.log();
        
      } else {
        // Manual approaches
        console.log(chalk.yellow('🎯 Recommended Approaches:\n'));
        
        // Approach 1: Planning Agent + Cursor
        console.log(chalk.white('1️⃣  Generate Plan + Use Cursor (RECOMMENDED)'));
        console.log(chalk.gray(`   ./agents/planning-agent.sh ${mainPath} \\`));
        console.log(chalk.gray(`     "${problem}" \\`));
        console.log(chalk.gray(`     SOLUTION_PLAN.md\n`));
        console.log(chalk.gray(`   cursor ${mainPath}`));
        console.log(chalk.gray(`   # Use plan with Cursor Composer to implement\n`));
        
        // Approach 2: Shell TDD Orchestrator
        console.log(chalk.white('2️⃣  Automated TDD with Shell Agents'));
        console.log(chalk.gray(`   build-agent solve "${repoUrl}" "${problem}" --use-shell-agents\n`));
        
        // Approach 3: Manual TDD
        console.log(chalk.white('3️⃣  Manual TDD in Feature Branch'));
        console.log(chalk.gray(`   cd ${mainPath}`));
        console.log(chalk.gray(`   # Write tests`));
        console.log(chalk.gray(`   git commit -m "test: ${problem.substring(0, 40)}"`));
        console.log(chalk.gray(`   # Implement fix`));
        console.log(chalk.gray(`   npm test && git commit\n`));
        
        console.log(chalk.yellow('📝 Workspace Info:'));
        console.log(chalk.gray(`   Path: ${mainPath}`));
        console.log(chalk.gray(`   Branch: ${featureBranchName}`));
        console.log(chalk.gray(`   Ready for development`));
        console.log();
        
        console.log(chalk.yellow('💡 Tips:'));
        console.log(chalk.white('   - Feature branch created automatically'));
        console.log(chalk.white('   - Use planning agent for guidance'));
        console.log(chalk.white('   - Use Cursor for implementation'));
        console.log(chalk.white('   - Use --use-shell-agents for full automation'));
        console.log();
      }

    } catch (error: any) {
      spinner.fail(chalk.red('❌ Problem solving failed'));
      console.error(chalk.red(`Error: ${error.message}`));
      console.error(chalk.gray(error.stack));
      process.exit(1);
    }
  });

