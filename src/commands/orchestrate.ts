import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import {
  extractQuestionsFromRequirements,
  sendQuestionsToResearcher,
  routeMessages,
  createNote,
} from '../messaging/router.js';

export const orchestrateCommand = new Command('orchestrate')
  .description('Orchestrate async agent workflow (extract questions, route to agents)')
  .argument('<idea-name>', 'Idea name to orchestrate')
  .option('--workspace-root <dir>', 'Root directory containing agents', '.')
  .option('--auto-route', 'Automatically route messages after extraction', true)
  .action(async (ideaName: string, options) => {
    console.log(chalk.cyan(`🎭 Orchestrating Workflow for: ${ideaName}\n`));
    
    const spinner = ora('Finding idea workspace...').start();
    
    try {
      const workspaceRoot = path.resolve(options.workspaceRoot);
      
      // Find entrepreneur agent
      const entrepreneurPath = path.join(workspaceRoot, 'entrepreneur-agent');
      if (!fs.existsSync(entrepreneurPath)) {
        throw new Error('entrepreneur-agent not found. Run: build-agent spawn');
      }
      
      // Find idea in entrepreneur's workspaces
      const ideaPath = path.join(entrepreneurPath, 'workspaces', ideaName);
      const requirementsPath = path.join(ideaPath, 'REQUIREMENTS.md');
      
      if (!fs.existsSync(requirementsPath)) {
        throw new Error(`Requirements not found at: ${requirementsPath}`);
      }
      
      spinner.succeed(chalk.green('✅ Found idea workspace\n'));
      
      console.log(chalk.cyan('📋 Workflow Steps:\n'));
      
      // Step 1: Extract questions from requirements
      console.log(chalk.white('1. Extracting questions from requirements...'));
      const questions = extractQuestionsFromRequirements(requirementsPath);
      console.log(chalk.green(`   ✅ Found ${questions.length} questions\n`));
      
      if (questions.length === 0) {
        console.log(chalk.gray('No open questions found in requirements.'));
        console.log(chalk.yellow('💡 Requirements appear complete. Ready to build!'));
        console.log();
        return;
      }
      
      // Display questions
      console.log(chalk.cyan('❓ Questions Found:\n'));
      questions.forEach((q, i) => {
        console.log(chalk.white(`${i + 1}. ${q.question}`));
        console.log(chalk.gray(`   Context: ${q.context || 'General'}`));
        console.log();
      });
      
      // Step 2: Send questions to researcher
      console.log(chalk.white('2. Sending questions to Researcher agent...'));
      const messages = sendQuestionsToResearcher(entrepreneurPath, questions, ideaName);
      console.log(chalk.green(`   ✅ ${messages.length} questions sent to outbox\n`));
      
      // Step 3: Route messages
      if (options.autoRoute) {
        console.log(chalk.white('3. Routing messages...'));
        const routeResult = routeMessages(workspaceRoot);
        console.log(chalk.green(`   ✅ Delivered ${routeResult.delivered} messages\n`));
        
        if (routeResult.failed > 0) {
          console.log(chalk.red(`   ❌ Failed to deliver ${routeResult.failed} messages\n`));
        }
      } else {
        console.log(chalk.yellow('3. Messages in outbox (run: build-agent route-messages)\n'));
      }
      
      // Step 4: Create workflow note for entrepreneur
      console.log(chalk.white('4. Creating workflow note for Entrepreneur...'));
      createNote(
        entrepreneurPath,
        `Workflow: ${ideaName}`,
        `Started async workflow for ${ideaName}:\n\n` +
        `- Sent ${questions.length} questions to Researcher\n` +
        `- Builder can start on framework while waiting\n` +
        `- Check inbox for Researcher's answers\n\n` +
        `Questions:\n${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}`,
        ['workflow', 'async', ideaName]
      );
      console.log(chalk.green('   ✅ Workflow note created\n'));
      
      // Display next steps
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.green('🎉 ASYNC WORKFLOW INITIATED'));
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log();
      
      console.log(chalk.cyan('📬 What Happens Now:\n'));
      
      console.log(chalk.white('Researcher:'));
      console.log(chalk.gray(`  cd ${workspaceRoot}/researcher-agent`));
      console.log(chalk.gray(`  build-agent inbox`));
      console.log(chalk.gray(`  # ${questions.length} questions waiting`));
      console.log(chalk.gray(`  # Answer and reply to Entrepreneur\n`));
      
      console.log(chalk.white('Builder (Can Start Immediately):'));
      console.log(chalk.gray(`  cd ${workspaceRoot}/builder-agent`));
      console.log(chalk.gray(`  builder-agent create  # Same idea: "${ideaName}"`));
      console.log(chalk.gray(`  # Start on framework while waiting for answers\n`));
      
      console.log(chalk.white('Entrepreneur (Waits for Answers):'));
      console.log(chalk.gray(`  cd ${entrepreneurPath}`));
      console.log(chalk.gray(`  build-agent inbox`));
      console.log(chalk.gray(`  # Check for Researcher's answers\n`));
      
      console.log(chalk.yellow('🔄 Routing Messages:\n'));
      console.log(chalk.gray('Run periodically to deliver messages:'));
      console.log(chalk.gray(`  build-agent route-messages ${workspaceRoot}\n`));
      
      console.log(chalk.gray('Or watch mode (auto-route every 5s):'));
      console.log(chalk.gray(`  build-agent route-messages ${workspaceRoot} --watch\n`));
      
      console.log(chalk.cyan('💡 Async Workflow:'));
      console.log(chalk.white('  ✅ Entrepreneur has questions → Researcher (async)'));
      console.log(chalk.white('  ✅ Builder starts framework (parallel)'));
      console.log(chalk.white('  ✅ Researcher answers → Entrepreneur inbox'));
      console.log(chalk.white('  ✅ No blocking. Maximum efficiency.'));
      console.log();
      
    } catch (error: any) {
      spinner.fail(chalk.red('❌ Orchestration failed'));
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

