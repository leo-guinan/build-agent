import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

export interface IdeaInputs {
  ideaName: string;
  description: string;
  problem: string;
  targetUsers: string;
  constraints: string;
  successCriteria: string;
  timeframe: string;
}

export const createCommand = new Command('create')
  .description('Create a new idea/possible future with requirements branch')
  .option('--workspace-dir <dir>', 'Workspace directory', './workspaces')
  .option('--skip-ai', 'Skip AI-enhanced requirements generation', false)
  .action(async (options) => {
    console.log(chalk.cyan('🎯 Creating New Possible Future...\n'));
    console.log(chalk.gray('This will create a new idea with structured requirements.\n'));

    try {
      // Interactive prompt for idea details
      const answers = await inquirer.prompt<IdeaInputs>([
        {
          type: 'input',
          name: 'ideaName',
          message: 'What\'s your idea called?',
          validate: (input: string) => {
            if (!input.trim()) return 'Idea name is required';
            if (!/^[a-zA-Z0-9-_\s]+$/.test(input)) {
              return 'Use only letters, numbers, spaces, hyphens, and underscores';
            }
            return true;
          },
        },
        {
          type: 'input',
          name: 'description',
          message: 'Describe your idea in one sentence:',
          validate: (input: string) => input.trim() ? true : 'Description is required',
        },
        {
          type: 'input',
          name: 'problem',
          message: 'What problem does this solve?',
          validate: (input: string) => input.trim() ? true : 'Problem statement is required',
        },
        {
          type: 'input',
          name: 'targetUsers',
          message: 'Who are your target users?',
          default: 'General users',
        },
        {
          type: 'input',
          name: 'constraints',
          message: 'Any technical constraints or requirements? (e.g., platform, tech stack)',
          default: 'None specified',
        },
        {
          type: 'input',
          name: 'successCriteria',
          message: 'How will you measure success?',
          default: 'MVP completion and user feedback',
        },
        {
          type: 'list',
          name: 'timeframe',
          message: 'Target timeframe:',
          choices: ['1 week', '2 weeks', '1 month', '3 months', '6 months', 'No specific timeline'],
          default: '1 month',
        },
      ]);

      console.log();
      const spinner = ora('Creating idea workspace...').start();

      // Create sanitized repo name
      const repoName = answers.ideaName
        .toLowerCase()
        .replace(/[^a-z0-9-_\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      const workspaceRoot = path.join(options.workspaceDir, repoName);

      // Check if workspace already exists
      if (fs.existsSync(workspaceRoot)) {
        spinner.fail(chalk.red('❌ Workspace already exists'));
        console.log(chalk.yellow(`\nWorkspace exists at: ${workspaceRoot}`));
        console.log(chalk.gray('Choose a different name or delete the existing workspace.'));
        process.exit(1);
      }

      // Create workspace directories
      fs.mkdirSync(workspaceRoot, { recursive: true });

      // Initialize git repo
      spinner.text = 'Initializing git repository...';
      execSync('git init', { cwd: workspaceRoot, stdio: 'pipe' });
      
      // Configure git
      try {
        execSync('git config user.name', { cwd: workspaceRoot, stdio: 'pipe' });
      } catch {
        // Set default git config if not configured
        execSync('git config user.name "Build Agent"', { cwd: workspaceRoot, stdio: 'pipe' });
        execSync('git config user.email "agent@build-agent.local"', { cwd: workspaceRoot, stdio: 'pipe' });
      }

      // Create requirements branch first
      spinner.text = 'Creating requirements branch...';
      
      // Generate requirements document
      const requirementsDoc = options.skipAi 
        ? generateBasicRequirements(answers)
        : await generateEnhancedRequirements(answers, spinner);

      // Write requirements to file
      const requirementsFile = path.join(workspaceRoot, 'REQUIREMENTS.md');
      fs.writeFileSync(requirementsFile, requirementsDoc);

      // Create .gitignore
      const gitignore = `node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
coverage/
.vscode/
.idea/
`;
      fs.writeFileSync(path.join(workspaceRoot, '.gitignore'), gitignore);

      // Create initial README
      const readme = `# ${answers.ideaName}

${answers.description}

## Status: Requirements Phase

This project is currently in the requirements gathering phase.

See [REQUIREMENTS.md](./REQUIREMENTS.md) for detailed requirements and specifications.

## Branches

- \`requirements\` - Requirements and specifications (you are here)
- \`develop\` - Development workspace (will be created when ready to build)

## Next Steps

1. Review and refine requirements
2. Create develop branch when ready to build
3. Use \`build-agent plan\` or \`build-agent solve\` for development
`;
      fs.writeFileSync(path.join(workspaceRoot, 'README.md'), readme);

      // Commit to requirements branch
      execSync('git add .', { cwd: workspaceRoot, stdio: 'pipe' });
      execSync('git commit -m "Initial requirements documentation"', { cwd: workspaceRoot, stdio: 'pipe' });
      execSync('git branch -M requirements', { cwd: workspaceRoot, stdio: 'pipe' });

      spinner.succeed(chalk.green('✅ Idea workspace created!\n'));

      // Display summary
      console.log(chalk.cyan('📋 Idea Summary'));
      console.log(chalk.white('Name:'), chalk.gray(answers.ideaName));
      console.log(chalk.white('Description:'), chalk.gray(answers.description));
      console.log(chalk.white('Problem:'), chalk.gray(answers.problem));
      console.log(chalk.white('Target Users:'), chalk.gray(answers.targetUsers));
      console.log(chalk.white('Timeframe:'), chalk.gray(answers.timeframe));
      console.log();

      console.log(chalk.cyan('📁 Workspace Structure'));
      console.log(chalk.gray(`   ${workspaceRoot}/`));
      console.log(chalk.gray(`   ├── REQUIREMENTS.md (generated)`));
      console.log(chalk.gray(`   ├── README.md`));
      console.log(chalk.gray(`   └── .gitignore`));
      console.log(chalk.white('   Branch:'), chalk.gray('requirements (current)'));
      console.log();

      console.log(chalk.yellow('🎯 Next Steps:\n'));
      console.log(chalk.white('1. Review requirements:'));
      console.log(chalk.gray(`   cd ${workspaceRoot}`));
      console.log(chalk.gray(`   cat REQUIREMENTS.md\n`));

      console.log(chalk.white('2. Refine requirements (optional):'));
      console.log(chalk.gray(`   # Edit REQUIREMENTS.md as needed`));
      console.log(chalk.gray(`   git add REQUIREMENTS.md`));
      console.log(chalk.gray(`   git commit -m "Refine requirements"\n`));

      console.log(chalk.white('3. When ready to develop, create develop branch:'));
      console.log(chalk.gray(`   git checkout -b develop`));
      console.log(chalk.gray(`   # Or use the develop branch creation helper (coming soon)\n`));

      console.log(chalk.white('4. Start building:'));
      console.log(chalk.gray(`   build-agent plan ${workspaceRoot} "Implement [feature]"`));
      console.log(chalk.gray(`   # or`));
      console.log(chalk.gray(`   build-agent solve ${workspaceRoot} "Build MVP" --use-shell-agents\n`));

      console.log(chalk.cyan('💡 Tips:'));
      console.log(chalk.white('   - Keep requirements branch as source of truth'));
      console.log(chalk.white('   - Create develop branch when ready to code'));
      console.log(chalk.white('   - Use agents to implement from requirements'));
      console.log();

    } catch (error: any) {
      if (error.isTtyError) {
        console.error(chalk.red('❌ Interactive prompts not supported in this environment'));
      } else {
        console.error(chalk.red(`❌ Failed to create idea: ${error.message}`));
      }
      process.exit(1);
    }
  });

/**
 * Generate basic requirements without AI enhancement
 */
function generateBasicRequirements(inputs: IdeaInputs): string {
  const timestamp = new Date().toISOString();
  
  return `# Requirements: ${inputs.ideaName}

**Generated:** ${timestamp}  
**Status:** Draft

---

## 1. Overview

### Idea Description
${inputs.description}

### Problem Statement
${inputs.problem}

### Target Users
${inputs.targetUsers}

---

## 2. Objectives

### Primary Goal
Solve the identified problem for target users through [solution approach].

### Success Criteria
${inputs.successCriteria}

### Timeline
${inputs.timeframe}

---

## 3. Functional Requirements

### Core Features
*To be defined*

1. Feature 1: [Description]
2. Feature 2: [Description]
3. Feature 3: [Description]

### User Stories
*To be defined*

- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

---

## 4. Technical Requirements

### Constraints
${inputs.constraints}

### Technology Stack
*To be determined*

- Frontend: [TBD]
- Backend: [TBD]
- Database: [TBD]
- Infrastructure: [TBD]

### Architecture
*To be designed*

---

## 5. Non-Functional Requirements

### Performance
- Response time: [TBD]
- Concurrent users: [TBD]

### Security
- Authentication: [TBD]
- Data protection: [TBD]

### Scalability
- Initial scale: [TBD]
- Growth plan: [TBD]

---

## 6. Development Plan

### Phase 1: MVP
*Define minimum viable product*

### Phase 2: Enhancement
*Plan for post-MVP features*

### Phase 3: Scale
*Plan for scaling and optimization*

---

## 7. Risks & Mitigation

### Technical Risks
- Risk 1: [Description] → Mitigation: [Strategy]
- Risk 2: [Description] → Mitigation: [Strategy]

### Business Risks
- Risk 1: [Description] → Mitigation: [Strategy]
- Risk 2: [Description] → Mitigation: [Strategy]

---

## 8. Open Questions

- Question 1: [What needs to be answered]
- Question 2: [What needs to be answered]

---

**Next Steps:**
1. Refine requirements based on research
2. Create technical design document
3. Break down into development tasks
4. Create develop branch and start building

---

*This is a living document. Update as requirements evolve.*
`;
}

/**
 * Generate AI-enhanced requirements
 */
async function generateEnhancedRequirements(
  inputs: IdeaInputs, 
  spinner: ReturnType<typeof ora>
): Promise<string> {
  spinner.text = 'AI analyzing your idea...';

  const prompt = `You are a product requirements analyst. Generate comprehensive, structured requirements for this idea.

IDEA DETAILS:
- Name: ${inputs.ideaName}
- Description: ${inputs.description}
- Problem: ${inputs.problem}
- Target Users: ${inputs.targetUsers}
- Constraints: ${inputs.constraints}
- Success Criteria: ${inputs.successCriteria}
- Timeframe: ${inputs.timeframe}

TASK:
Create a detailed requirements document covering:
1. Problem analysis and market context
2. User personas and use cases
3. Functional requirements (features)
4. User stories (at least 5-7 core stories)
5. Technical requirements and architecture suggestions
6. Non-functional requirements (performance, security, scalability)
7. MVP scope vs future enhancements
8. Risk analysis
9. Open questions that need answers

OUTPUT FORMAT:
Use markdown with clear sections. Be specific and actionable. Include:
- Clear acceptance criteria for features
- Realistic technical recommendations
- Prioritized feature list (must-have vs nice-to-have)
- Development phases (MVP → Enhancement → Scale)

Keep it practical and implementable within the stated timeframe.`;

  try {
    const response = await generateText({
      model: openrouter('google/gemini-2.0-flash-exp:free'),
      prompt,
    });

    spinner.text = 'Requirements generated!';
    
    const timestamp = new Date().toISOString();
    return `# Requirements: ${inputs.ideaName}

**Generated:** ${timestamp}  
**Status:** Draft (AI-Enhanced)

---

${response.text}

---

## Original Input

- **Idea Name:** ${inputs.ideaName}
- **Description:** ${inputs.description}
- **Problem:** ${inputs.problem}
- **Target Users:** ${inputs.targetUsers}
- **Constraints:** ${inputs.constraints}
- **Success Criteria:** ${inputs.successCriteria}
- **Timeframe:** ${inputs.timeframe}

---

*This requirements document was AI-generated and should be reviewed and refined by humans before development.*
`;

  } catch (error: any) {
    spinner.warn('AI generation failed, using basic template');
    console.log(chalk.gray(`   (${error.message})`));
    return generateBasicRequirements(inputs);
  }
}

