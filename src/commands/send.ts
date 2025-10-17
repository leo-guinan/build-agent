import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { sendMessage } from '../messaging/router.js';
import type { MessageType, MessagePriority } from '../messaging/types.js';

export const sendCommand = new Command('send')
  .description('Send message to another agent')
  .option('--to <agent>', 'Recipient agent(s), comma-separated or group (ALL, FINANCIAL, PRODUCT, INTELLIGENCE)')
  .option('--type <type>', 'Message type: question, answer, task, update, insight, alert, validation, context')
  .option('--subject <text>', 'Message subject')
  .option('--body <text>', 'Message body')
  .option('--priority <level>', 'Priority: low, medium, high, urgent', 'medium')
  .option('--reply-to <id>', 'Message ID this replies to')
  .option('--interactive', 'Interactive mode (prompts for all fields)', false)
  .action(async (options) => {
    try {
      const workspacePath = process.cwd();
      const agentName = getAgentName(workspacePath);
      
      if (!agentName) {
        console.error(chalk.red('❌ Not in an agent workspace'));
        console.log(chalk.gray('Run this command from within an agent directory (e.g., entrepreneur-agent/)'));
        process.exit(1);
      }
      
      // Interactive mode or use options
      const messageData = options.interactive 
        ? await promptForMessage()
        : validateAndGetMessage(options);
      
      // Send message
      const message = sendMessage(workspacePath, {
        ...messageData,
        from: agentName,
      });
      
      console.log(chalk.green('✅ Message sent to outbox\n'));
      console.log(chalk.cyan('📤 Message Details:'));
      console.log(chalk.white('  ID:'), chalk.gray(message.id));
      console.log(chalk.white('  From:'), chalk.gray(message.from));
      console.log(chalk.white('  To:'), chalk.gray(Array.isArray(message.to) ? message.to.join(', ') : message.to));
      console.log(chalk.white('  Type:'), chalk.gray(message.type));
      console.log(chalk.white('  Subject:'), chalk.gray(message.subject));
      console.log();
      console.log(chalk.yellow('📝 Next Steps:\n'));
      console.log(chalk.gray('1. Message is in outbox/'));
      console.log(chalk.gray('2. Run: build-agent route-messages'));
      console.log(chalk.gray('3. Message will be delivered to recipient inbox'));
      console.log();
      
    } catch (error: any) {
      console.error(chalk.red(`❌ Error sending message: ${error.message}`));
      process.exit(1);
    }
  });

async function promptForMessage() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'to',
      message: 'Send to (agent name or group):',
      validate: (input: string) => input.trim() ? true : 'Recipient required',
    },
    {
      type: 'list',
      name: 'type',
      message: 'Message type:',
      choices: ['question', 'answer', 'task', 'update', 'insight', 'alert', 'validation', 'context'],
      default: 'question',
    },
    {
      type: 'input',
      name: 'subject',
      message: 'Subject:',
      validate: (input: string) => input.trim() ? true : 'Subject required',
    },
    {
      type: 'input',
      name: 'body',
      message: 'Message:',
      validate: (input: string) => input.trim() ? true : 'Message required',
    },
    {
      type: 'list',
      name: 'priority',
      message: 'Priority:',
      choices: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
  ]);
}

function validateAndGetMessage(options: any) {
  if (!options.to) throw new Error('--to required (or use --interactive)');
  if (!options.subject) throw new Error('--subject required (or use --interactive)');
  if (!options.body) throw new Error('--body required (or use --interactive)');
  
  const recipients = options.to.includes(',') 
    ? options.to.split(',').map((s: string) => s.trim())
    : options.to;
  
  return {
    to: recipients,
    type: (options.type || 'question') as MessageType,
    subject: options.subject,
    body: options.body,
    priority: (options.priority || 'medium') as MessagePriority,
    status: 'pending' as const,
    replyTo: options.replyTo,
  };
}

function getAgentName(workspacePath: string): string | null {
  const dirName = path.basename(workspacePath);
  if (dirName.endsWith('-agent')) {
    return dirName.replace('-agent', '');
  }
  return null;
}

import path from 'path';

