import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const planCommand = new Command('plan')
  .description('Generate a detailed plan to solve a problem (for use with Cursor)')
  .argument('<repo-url>', 'GitHub repository URL')
  .argument('<problem>', 'Problem statement')
  .option('--workspace-dir <dir>', 'Workspace directory', './workspaces')
  .option('--output <file>', 'Output file for plan', 'SOLUTION_PLAN.md')
  .action(async (repoUrl: string, problem: string, options) => {
    console.log(chalk.cyan('📋 Generating Solution Plan...\n'));
    console.log(chalk.white('Repository:'), chalk.gray(repoUrl));
    console.log(chalk.white('Problem:'), chalk.gray(problem));
    console.log(chalk.white('Output:'), chalk.gray(options.output));
    console.log();

    const spinner = ora('Setting up workspace...').start();

    try {
      // Extract repo name
      const repoMatch = repoUrl.match(/github\.com[:/]([^/]+\/[^/]+?)(\.git)?$/);
      if (!repoMatch) {
        throw new Error('Invalid GitHub URL');
      }
      const repoName = repoMatch[1].replace('/', '-');
      const workspaceRoot = path.join(options.workspaceDir, repoName);
      const mainPath = path.join(workspaceRoot, 'main');

      // Clone if needed
      if (!fs.existsSync(mainPath)) {
        spinner.text = 'Cloning repository...';
        if (!fs.existsSync(workspaceRoot)) {
          fs.mkdirSync(workspaceRoot, { recursive: true });
        }
        execSync(`git clone ${repoUrl} ${mainPath}`, { stdio: 'pipe' });
      }

      spinner.succeed(chalk.green('✅ Workspace ready\n'));

      // Analyze codebase
      console.log(chalk.cyan('🔍 Analyzing codebase...\n'));
      
      // Get file structure
      const fileTree = execSync('find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | head -100', {
        cwd: mainPath,
        encoding: 'utf-8',
      });

      // Get README if exists
      let readme = '';
      const readmePath = path.join(mainPath, 'README.md');
      if (fs.existsSync(readmePath)) {
        readme = fs.readFileSync(readmePath, 'utf-8').substring(0, 2000);
      }

      // Get package.json if exists
      let packageInfo = '';
      const packagePath = path.join(mainPath, 'package.json');
      if (fs.existsSync(packagePath)) {
        packageInfo = fs.readFileSync(packagePath, 'utf-8');
      }

      // Generate test plan using test agent
      console.log(chalk.yellow('📝 Generating test plan...'));
      const testPlanSpinner = ora('Test agent analyzing...').start();

      const testPlanPrompt = `
TASK: Create a comprehensive test plan for this problem.

PROBLEM:
${problem}

REPOSITORY: ${repoUrl}

CONTEXT:
File structure (sample):
${fileTree.split('\n').slice(0, 30).join('\n')}

README (excerpt):
${readme}

YOUR TASK:
1. Identify what files need tests
2. Describe test scenarios (integration and unit)
3. List test cases to write
4. Specify mock requirements
5. Provide file paths for tests

OUTPUT FORMAT:
# Test Plan

## Problem Analysis
[Describe the problem and what behavior needs testing]

## Files to Test
- path/to/file1.ts (what it does)
- path/to/file2.ts (what it does)

## Integration Tests
### Test File: tests/integration/feature-name.test.ts
- Test Case 1: [description]
- Test Case 2: [description]

## Unit Tests
### Test File: tests/unit/component-name.test.ts
- Test Case 1: [description]
- Test Case 2: [description]

## Mocks Needed
- External API calls
- File system operations
- etc.

Keep it actionable and specific.
`;

      // Use OpenAI SDK directly (bypass Mastra agent issues)
      const testPlanResponse = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: testPlanPrompt,
      });
      
      const testPlanText = testPlanResponse.text;
      
      console.log(chalk.gray(`   Generated ${testPlanText.length} characters`));
      testPlanSpinner.succeed(chalk.green('✅ Test plan generated'));

      // Generate implementation plan using develop agent
      console.log(chalk.yellow('💻 Generating implementation plan...'));
      const implPlanSpinner = ora('Develop agent analyzing...').start();

      const implPlanPrompt = `
TASK: Create a detailed implementation plan to fix this problem.

PROBLEM:
${problem}

REPOSITORY: ${repoUrl}

CONTEXT:
File structure (sample):
${fileTree.split('\n').slice(0, 30).join('\n')}

Package.json:
${packageInfo.substring(0, 1000)}

YOUR TASK:
1. Identify which files need changes
2. Describe the fix approach
3. Provide step-by-step implementation guide
4. List edge cases to handle
5. Suggest validation steps

OUTPUT FORMAT:
# Implementation Plan

## Root Cause Analysis
[Explain why the problem occurs]

## Solution Approach
[High-level description of the fix]

## Files to Modify
1. path/to/file1.ts
   - Current behavior: [description]
   - Change needed: [description]
   - Code changes: [pseudo-code or description]

2. path/to/file2.ts
   - Current behavior: [description]
   - Change needed: [description]

## Step-by-Step Implementation
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Edge Cases
- [Edge case 1]
- [Edge case 2]

## Validation
- [ ] Tests pass
- [ ] No regressions
- [ ] Edge cases handled

Keep it specific and actionable for Cursor to implement.
`;

      // Use OpenAI SDK directly (bypass Mastra agent issues)
      const implPlanResponse = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: implPlanPrompt,
      });
      
      const implPlanText = implPlanResponse.text;
      
      console.log(chalk.gray(`   Generated ${implPlanText.length} characters`));
      implPlanSpinner.succeed(chalk.green('✅ Implementation plan generated'));

      // Generate complete solution plan
      const plan = `# Solution Plan: ${problem}

**Repository:** ${repoUrl}  
**Generated:** ${new Date().toISOString()}  
**Workspace:** ${workspaceRoot}

---

## 📋 Overview

This plan was generated by AI analysis of the repository. Use it with Cursor to implement the solution.

### How to Use This Plan

1. **Review the test plan** - Understand what needs testing
2. **Review the implementation plan** - Understand the fix approach
3. **Use Cursor Composer** - Give it sections of this plan
4. **Work in TDD order** - Tests first, then implementation
5. **Validate** - Run tests and check edge cases

---

${testPlanText}

---

${implPlanText}

---

## 🚀 Implementation Steps for Cursor

### Step 1: Set Up Workspace

\`\`\`bash
cd ${mainPath}
git checkout -b fix/${repoName.split('-').pop()}-issue
\`\`\`

### Step 2: Write Tests (Use Test Plan Above)

Ask Cursor:
> "Using the test plan above, create the integration test file at [path from test plan]. Include all test cases listed."

Then:
> "Using the test plan above, create the unit test file at [path from test plan]. Include all test cases and mocks listed."

### Step 3: Implement Fix (Use Implementation Plan Above)

Ask Cursor:
> "Using the implementation plan above, modify [file 1] as described in the plan."

Repeat for each file that needs changes.

### Step 4: Validate

\`\`\`bash
npm test
npm run build
npm run lint
\`\`\`

### Step 5: Create PR

\`\`\`bash
git add .
git commit -m "fix: ${problem.substring(0, 50)}"
git push origin fix/${repoName.split('-').pop()}-issue
gh pr create --title "Fix: ${problem.substring(0, 50)}" --body "Fixes the issue by [summary]"
\`\`\`

---

## 📊 Checklist

- [ ] Cloned repository
- [ ] Created feature branch
- [ ] Wrote integration tests
- [ ] Wrote unit tests
- [ ] Tests fail (red)
- [ ] Implemented fix
- [ ] Tests pass (green)
- [ ] No regressions
- [ ] Edge cases handled
- [ ] Code linted
- [ ] Committed changes
- [ ] Created PR

---

## 💡 Tips

- Work in small commits
- Test each change
- Use Cursor to generate boilerplate
- Validate assumptions with tests
- Check edge cases

---

**Generated by Build Agent CLI**
`;

      // Write plan to file
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, plan);

      console.log();
      console.log(chalk.green('✅ Solution plan generated!\n'));
      console.log(chalk.cyan('📄 Plan written to:'), chalk.white(outputPath));
      console.log();
      console.log(chalk.yellow('🎯 Next Steps:'));
      console.log(chalk.white('1. Review the plan:'), chalk.gray(`cat ${options.output}`));
      console.log(chalk.white('2. Open in Cursor:'), chalk.gray(`cursor ${mainPath}`));
      console.log(chalk.white('3. Use Cursor Composer with plan sections'));
      console.log(chalk.white('4. Implement tests first, then fix'));
      console.log(chalk.white('5. Create PR!'));
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('❌ Plan generation failed'));
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

