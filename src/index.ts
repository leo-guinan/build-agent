#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { tddCommand } from './commands/tdd';
import { devCommand, devStopCommand, devStatusCommand, devLogsCommand } from './commands/dev';
import { solveCommand } from './commands/solve';

const program = new Command();

program
  .name('build-agent')
  .description('CLI tool for launching validated ideas with AI-guided waterfall methodology')
  .version('0.1.0');

// Dev server commands - Mastra playground for debugging
program.addCommand(devCommand);
program.addCommand(devStopCommand);
program.addCommand(devStatusCommand);
program.addCommand(devLogsCommand);

// TDD command - use AI agents to implement features
program.addCommand(tddCommand);

// Solve command - fix problems in any GitHub repo
program.addCommand(solveCommand);

// TODO: Add commands (init, run, chat, status, server)
// Will be implemented via TDD agent network

program.parse();

