import { Command } from 'commander';
import chalk from 'chalk';
import { readInbox, markAsRead, archiveMessage, getUnreadCount } from '../messaging/router.js';
import type { AgentMessage } from '../messaging/types.js';

export const inboxCommand = new Command('inbox')
  .description('Check agent inbox for messages from other agents')
  .argument('[agent-path]', 'Path to agent workspace (defaults to current directory)')
  .option('--unread-only', 'Show only unread messages', false)
  .option('--type <type>', 'Filter by message type')
  .option('--from <agent>', 'Filter by sender')
  .option('--mark-read <id>', 'Mark message as read')
  .option('--archive <id>', 'Archive message')
  .action(async (_agentPath: string = '.', options) => {
    try {
      const workspacePath = process.cwd();
      
      // Mark as read if requested
      if (options.markRead) {
        markAsRead(workspacePath, options.markRead);
        console.log(chalk.green(`✅ Message ${options.markRead} marked as read`));
        return;
      }
      
      // Archive if requested
      if (options.archive) {
        archiveMessage(workspacePath, options.archive);
        console.log(chalk.green(`✅ Message ${options.archive} archived`));
        return;
      }
      
      // Read inbox
      let messages = readInbox(workspacePath);
      
      // Apply filters
      if (options.unreadOnly) {
        messages = messages.filter(m => m.status === 'delivered');
      }
      if (options.type) {
        messages = messages.filter(m => m.type === options.type);
      }
      if (options.from) {
        messages = messages.filter(m => m.from === options.from);
      }
      
      // Display
      const unreadCount = getUnreadCount(workspacePath);
      
      console.log(chalk.cyan('📬 Inbox\n'));
      console.log(chalk.white('Unread:'), unreadCount > 0 ? chalk.yellow(unreadCount) : chalk.gray('0'));
      console.log(chalk.white('Total:'), chalk.gray(messages.length));
      console.log();
      
      if (messages.length === 0) {
        console.log(chalk.gray('No messages.'));
        console.log();
        console.log(chalk.yellow('💡 Tip: Messages appear here when other agents send to this agent.'));
        console.log(chalk.gray('   Run: build-agent route-messages  (to deliver pending messages)'));
        console.log();
        return;
      }
      
      // Display messages
      messages.forEach((msg, i) => {
        displayMessage(msg, i + 1);
      });
      
      console.log();
      console.log(chalk.yellow('📝 Actions:\n'));
      console.log(chalk.gray('Mark as read:    build-agent inbox --mark-read <id>'));
      console.log(chalk.gray('Archive:         build-agent inbox --archive <id>'));
      console.log(chalk.gray('Reply:           build-agent send --to <agent> --reply-to <id>'));
      console.log();
      
    } catch (error: any) {
      console.error(chalk.red(`❌ Error reading inbox: ${error.message}`));
      process.exit(1);
    }
  });

function displayMessage(msg: AgentMessage, index: number) {
  const statusIcon = msg.status === 'delivered' ? chalk.yellow('●') :
                     msg.status === 'read' ? chalk.green('○') :
                     chalk.gray('○');
  
  const typeIcon = msg.type === 'question' ? '❓' :
                   msg.type === 'answer' ? '💡' :
                   msg.type === 'task' ? '📋' :
                   msg.type === 'insight' ? '🔬' :
                   msg.type === 'alert' ? '⚠️' :
                   msg.type === 'validation' ? '✅' : '📝';
  
  const priorityColor = msg.priority === 'urgent' ? chalk.red :
                        msg.priority === 'high' ? chalk.yellow :
                        msg.priority === 'medium' ? chalk.white :
                        chalk.gray;
  
  console.log(
    `${statusIcon} ${chalk.white(`#${index}`)} ${typeIcon} ${priorityColor(msg.subject)}`
  );
  console.log(chalk.gray(`   From: ${msg.from} | ${msg.created} | ID: ${msg.id}`));
  console.log(chalk.gray(`   ${msg.body.substring(0, 100)}${msg.body.length > 100 ? '...' : ''}`));
  
  if (msg.replyTo) {
    console.log(chalk.gray(`   ↩️  Reply to: ${msg.replyTo}`));
  }
  
  console.log();
}

