import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const developCommand = new Command('develop')
  .description('Create develop branch from requirements for an idea')
  .argument('[idea-path]', 'Path to idea workspace (defaults to current directory)')
  .option('--force', 'Force create develop branch even if it exists', false)
  .action(async (ideaPath: string = '.', options) => {
    console.log(chalk.cyan('🚀 Creating Development Workspace...\n'));

    const spinner = ora('Checking workspace...').start();

    try {
      const workspacePath = path.resolve(ideaPath);

      // Verify it's a git repo
      if (!fs.existsSync(path.join(workspacePath, '.git'))) {
        spinner.fail(chalk.red('❌ Not a git repository'));
        console.log(chalk.yellow('\nThis command must be run in an idea workspace created with:'));
        console.log(chalk.gray('  build-agent create'));
        process.exit(1);
      }

      // Check if REQUIREMENTS.md exists
      const requirementsFile = path.join(workspacePath, 'REQUIREMENTS.md');
      if (!fs.existsSync(requirementsFile)) {
        spinner.fail(chalk.red('❌ No REQUIREMENTS.md found'));
        console.log(chalk.yellow('\nThis doesn\'t appear to be an idea workspace.'));
        console.log(chalk.gray('Expected to find: REQUIREMENTS.md'));
        process.exit(1);
      }

      // Get current branch
      const currentBranch = execSync('git branch --show-current', {
        cwd: workspacePath,
        encoding: 'utf-8',
      }).trim();

      // Check if already on develop branch
      if (currentBranch === 'develop') {
        spinner.succeed(chalk.green('✅ Already on develop branch\n'));
        console.log(chalk.cyan('📁 Workspace:'), chalk.gray(workspacePath));
        console.log(chalk.white('   Branch:'), chalk.gray('develop'));
        console.log();
        console.log(chalk.yellow('💡 Ready to build! Use:'));
        console.log(chalk.gray(`   build-agent plan . "Implement [feature]"`));
        console.log(chalk.gray(`   build-agent solve . "Build MVP" --use-shell-agents`));
        console.log();
        return;
      }

      // Check if develop branch exists
      let developExists = false;
      try {
        execSync('git rev-parse --verify develop', {
          cwd: workspacePath,
          stdio: 'pipe',
        });
        developExists = true;
      } catch {
        // Branch doesn't exist, which is fine
      }

      if (developExists && !options.force) {
        spinner.info(chalk.yellow('Develop branch already exists\n'));
        
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
              { name: 'Switch to existing develop branch', value: 'switch' },
              { name: 'Delete and recreate develop branch', value: 'recreate' },
              { name: 'Cancel', value: 'cancel' },
            ],
          },
        ]);

        if (action === 'cancel') {
          console.log(chalk.gray('Cancelled.'));
          return;
        }

        if (action === 'recreate') {
          spinner.start('Recreating develop branch...');
          execSync('git branch -D develop', { cwd: workspacePath, stdio: 'pipe' });
          developExists = false;
        } else {
          spinner.start('Switching to develop branch...');
          execSync('git checkout develop', { cwd: workspacePath, stdio: 'pipe' });
          spinner.succeed(chalk.green('✅ Switched to develop branch\n'));
          showNextSteps(workspacePath);
          return;
        }
      }

      // Create develop branch
      if (!developExists) {
        spinner.text = 'Creating develop branch...';
        
        // Confirm there are no uncommitted changes
        try {
          const status = execSync('git status --porcelain', {
            cwd: workspacePath,
            encoding: 'utf-8',
          });
          
          if (status.trim()) {
            spinner.warn(chalk.yellow('Uncommitted changes detected\n'));
            
            const { shouldCommit } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'shouldCommit',
                message: 'Commit changes to requirements branch before creating develop?',
                default: true,
              },
            ]);

            if (shouldCommit) {
              const { commitMessage } = await inquirer.prompt([
                {
                  type: 'input',
                  name: 'commitMessage',
                  message: 'Commit message:',
                  default: 'Update requirements',
                },
              ]);

              execSync('git add .', { cwd: workspacePath, stdio: 'pipe' });
              execSync(`git commit -m "${commitMessage}"`, { cwd: workspacePath, stdio: 'pipe' });
              console.log(chalk.green('   ✓ Changes committed\n'));
            } else {
              spinner.info('Proceeding with uncommitted changes\n');
            }
          }
        } catch (error) {
          // Status check failed, but continue
        }

        // Create and checkout develop branch
        execSync('git checkout -b develop', { cwd: workspacePath, stdio: 'pipe' });

        // Update README for develop branch
        const readme = `# ${path.basename(workspacePath)}

## Status: Development Phase

This is the development branch. See \`requirements\` branch for original requirements and specifications.

## Development

This workspace is ready for AI-assisted development using build-agent:

\`\`\`bash
# Generate a plan for implementing a feature
build-agent plan . "Implement user authentication"

# Or let agents build it automatically
build-agent solve . "Build MVP features" --use-shell-agents
\`\`\`

## Branches

- \`requirements\` - Requirements and specifications (locked)
- \`develop\` - Development workspace (you are here)

## Workflow

1. Review requirements in \`requirements\` branch
2. Use \`build-agent\` commands to implement features
3. Test thoroughly
4. Merge to production when ready
`;

        fs.writeFileSync(path.join(workspacePath, 'README.md'), readme);
        
        execSync('git add README.md', { cwd: workspacePath, stdio: 'pipe' });
        execSync('git commit -m "Initialize develop branch"', { cwd: workspacePath, stdio: 'pipe' });

        spinner.succeed(chalk.green('✅ Develop branch created!\n'));
      }

      showNextSteps(workspacePath);

    } catch (error: any) {
      spinner.fail(chalk.red('❌ Failed to create develop branch'));
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

function showNextSteps(workspacePath: string) {
  console.log(chalk.cyan('📁 Workspace:'), chalk.gray(workspacePath));
  console.log(chalk.white('   Branch:'), chalk.gray('develop'));
  console.log();

  console.log(chalk.yellow('🎯 Next Steps:\n'));

  console.log(chalk.white('1. Review requirements:'));
  console.log(chalk.gray(`   git checkout requirements`));
  console.log(chalk.gray(`   cat REQUIREMENTS.md`));
  console.log(chalk.gray(`   git checkout develop\n`));

  console.log(chalk.white('2. Generate implementation plan:'));
  console.log(chalk.gray(`   build-agent plan . "Implement [specific feature]"\n`));

  console.log(chalk.white('3. Build with agents:'));
  console.log(chalk.gray(`   build-agent solve . "Build MVP" --use-shell-agents\n`));

  console.log(chalk.white('4. Or use Cursor manually:'));
  console.log(chalk.gray(`   cursor ${workspacePath}\n`));

  console.log(chalk.cyan('💡 Tips:'));
  console.log(chalk.white('   - Keep requirements branch as source of truth'));
  console.log(chalk.white('   - Work in develop branch for all code changes'));
  console.log(chalk.white('   - Use build-agent commands for AI assistance'));
  console.log();
}

