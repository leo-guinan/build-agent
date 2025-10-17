import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { routeMessages } from '../messaging/router.js';
import path from 'path';

export const routeCommand = new Command('route-messages')
  .description('Route messages from agent outboxes to recipient inboxes')
  .argument('[workspace-root]', 'Workspace root containing agent directories', '.')
  .option('--watch', 'Watch for new messages and route automatically', false)
  .option('--interval <seconds>', 'Watch interval in seconds', '5')
  .action(async (workspaceRoot: string, options) => {
    const spinner = ora('Routing messages...').start();
    
    try {
      const root = path.resolve(workspaceRoot);
      
      if (options.watch) {
        spinner.succeed(chalk.green('✅ Message router started (watching)\n'));
        console.log(chalk.cyan('👁️  Watching for messages...\n'));
        console.log(chalk.gray(`Workspace: ${root}`));
        console.log(chalk.gray(`Interval: ${options.interval}s`));
        console.log(chalk.gray('Press Ctrl+C to stop\n'));
        
        // Watch mode
        setInterval(() => {
          const result = routeMessages(root);
          if (result.delivered > 0) {
            console.log(chalk.green(`✅ Delivered ${result.delivered} messages`));
            result.details.forEach(d => {
              console.log(chalk.gray(`   ${d.from} → ${d.to}: ${d.messageId}`));
            });
          }
          if (result.failed > 0) {
            console.log(chalk.red(`❌ Failed to deliver ${result.failed} messages`));
          }
        }, parseInt(options.interval) * 1000);
        
        return; // Keep process alive
      }
      
      // One-time routing
      const result = routeMessages(root);
      
      spinner.succeed(chalk.green('✅ Routing complete\n'));
      
      console.log(chalk.cyan('📊 Routing Summary:\n'));
      console.log(chalk.white('Delivered:'), result.delivered > 0 ? chalk.green(result.delivered) : chalk.gray('0'));
      console.log(chalk.white('Failed:'), result.failed > 0 ? chalk.red(result.failed) : chalk.gray('0'));
      console.log();
      
      if (result.details.length > 0) {
        console.log(chalk.cyan('📬 Messages Routed:\n'));
        result.details.forEach(d => {
          const icon = d.status.startsWith('failed') ? '❌' : '✅';
          console.log(`${icon} ${chalk.white(d.from)} → ${chalk.gray(d.to)}: ${chalk.gray(d.messageId)}`);
        });
        console.log();
      }
      
      if (result.delivered === 0 && result.failed === 0) {
        console.log(chalk.gray('No pending messages to route.'));
        console.log();
        console.log(chalk.yellow('💡 Tip: Agents send messages to outbox/'));
        console.log(chalk.gray('   Router delivers outbox → recipient inbox'));
        console.log(chalk.gray('   Run this after agents create messages'));
        console.log();
      }
      
      if (result.delivered > 0) {
        console.log(chalk.yellow('📝 Next Steps:\n'));
        console.log(chalk.gray('Recipients can check their inbox:'));
        console.log(chalk.gray('  cd researcher-agent && build-agent inbox'));
        console.log();
      }
      
    } catch (error: any) {
      spinner.fail(chalk.red('❌ Routing failed'));
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

