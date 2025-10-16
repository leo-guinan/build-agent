import { Command } from 'commander';
import chalk from 'chalk';
import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const PID_FILE = '.build-agent-server.pid';
const LOG_FILE = '.build-agent-server.log';

export const devCommand = new Command('dev')
  .description('Start Mastra dev server in background for playground testing')
  .action(async () => {
    console.log(chalk.cyan('🚀 Starting Mastra Dev Server...\n'));

    // Check if server already running
    if (fs.existsSync(PID_FILE)) {
      const pid = fs.readFileSync(PID_FILE, 'utf-8').trim();
      
      try {
        // Check if process still alive
        process.kill(parseInt(pid), 0);
        console.log(chalk.yellow('⚠️  Server already running!'));
        console.log(chalk.gray(`   PID: ${pid}`));
        console.log(chalk.gray(`   Playground: http://localhost:4111/playground`));
        console.log(chalk.gray(`   Logs: tail -f ${LOG_FILE}\n`));
        console.log(chalk.white('Run'), chalk.cyan('build-agent dev:stop'), chalk.white('to stop the server'));
        return;
      } catch {
        // Process not running, remove stale PID file
        fs.unlinkSync(PID_FILE);
      }
    }

    // Start Mastra dev server in background with log redirection
    const command = `npx mastra dev --port 4111 >> ${LOG_FILE} 2>&1 & echo $!`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red('❌ Failed to start server:'), error.message);
        return;
      }
      
      const pid = stdout.trim();
      
      // Save PID
      fs.writeFileSync(PID_FILE, pid);

      console.log(chalk.green('✅ Mastra Dev Server started!\n'));
      console.log(chalk.white('  PID:'), chalk.cyan(pid));
      console.log(chalk.white('  Port:'), chalk.cyan('4111'));
      console.log(chalk.white('  Playground:'), chalk.cyan('http://localhost:4111/playground'));
      console.log(chalk.white('  Logs:'), chalk.cyan(LOG_FILE));
      console.log();
      console.log(chalk.gray('  View logs:'), chalk.white(`tail -f ${LOG_FILE}`));
      console.log(chalk.gray('  Stop server:'), chalk.white('build-agent dev:stop'));
      console.log();
      console.log(chalk.yellow('💡 Tip:'), 'Open playground to test TDD agents visually');
      console.log(chalk.gray('   - Test tdd-routing-agent with feature descriptions'));
      console.log(chalk.gray('   - Test test-agent to see if it calls file-writer'));
      console.log(chalk.gray('   - Test develop-agent with test files'));
      console.log(chalk.gray('   - Debug tool usage and agent reasoning'));
      console.log();
    });

    // Wait a moment for command to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

// Add stop command
export const devStopCommand = new Command('dev:stop')
  .description('Stop the Mastra dev server')
  .action(() => {
    if (!fs.existsSync(PID_FILE)) {
      console.log(chalk.yellow('⚠️  No server running'));
      return;
    }

    const pid = fs.readFileSync(PID_FILE, 'utf-8').trim();
    
    try {
      // Kill process
      process.kill(parseInt(pid), 'SIGTERM');
      fs.unlinkSync(PID_FILE);
      
      console.log(chalk.green('✅ Server stopped'));
      console.log(chalk.gray(`   PID ${pid} terminated`));
    } catch (error) {
      console.log(chalk.red('❌ Failed to stop server'));
      console.log(chalk.gray(`   PID ${pid} may not be running`));
      // Remove stale PID file
      if (fs.existsSync(PID_FILE)) {
        fs.unlinkSync(PID_FILE);
      }
    }
  });

// Add status command
export const devStatusCommand = new Command('dev:status')
  .description('Check Mastra dev server status')
  .action(() => {
    if (!fs.existsSync(PID_FILE)) {
      console.log(chalk.gray('Server: ') + chalk.red('Not running'));
      console.log(chalk.gray('\nStart with: ') + chalk.cyan('build-agent dev'));
      return;
    }

    const pid = fs.readFileSync(PID_FILE, 'utf-8').trim();
    
    try {
      // Check if process alive
      process.kill(parseInt(pid), 0);
      
      console.log(chalk.gray('Server: ') + chalk.green('Running ✓'));
      console.log(chalk.gray('PID: ') + chalk.white(pid));
      console.log(chalk.gray('Port: ') + chalk.white('4111'));
      console.log(chalk.gray('Playground: ') + chalk.cyan('http://localhost:4111/playground'));
      console.log(chalk.gray('Logs: ') + chalk.white(LOG_FILE));
      console.log();
      console.log(chalk.gray('View logs: ') + chalk.white(`tail -f ${LOG_FILE}`));
      console.log(chalk.gray('Stop server: ') + chalk.white('build-agent dev:stop'));
    } catch {
      console.log(chalk.gray('Server: ') + chalk.red('Not running (stale PID)'));
      fs.unlinkSync(PID_FILE);
    }
  });

// Add logs command
export const devLogsCommand = new Command('dev:logs')
  .description('Tail Mastra dev server logs')
  .option('-n, --lines <number>', 'Number of lines to show', '50')
  .action((options) => {
    if (!fs.existsSync(LOG_FILE)) {
      console.log(chalk.yellow('⚠️  No log file found'));
      console.log(chalk.gray('Start server with: ') + chalk.cyan('build-agent dev'));
      return;
    }

    console.log(chalk.cyan(`📄 Last ${options.lines} lines of ${LOG_FILE}:\n`));
    
    exec(`tail -n ${options.lines} ${LOG_FILE}`, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red('Error reading logs:'), error.message);
        return;
      }
      console.log(stdout);
    });
  });

